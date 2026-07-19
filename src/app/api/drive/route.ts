import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { db } from '@/lib/firebaseAdmin'; 
import { FieldPath } from 'firebase-admin/firestore'; //  Ganti dengan FieldPath

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId') || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    const search = searchParams.get('search') || '';

    if (!folderId) {
      return NextResponse.json({ success: false, error: 'Root Folder ID tidak ditemukan' }, { status: 400 });
    }

    // 🔍 SKENARIO 1: JIKA USER SEDANG MENGETIK DI KOLOM PENCARIAN
    if (search) {
      const response = await drive.files.list({
        q: `name contains '${search}' and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, parents)',
        pageSize: 30,
      });

      const foundFiles = response.data.files || [];
      const fileIds = foundFiles.map(f => f.id).filter(Boolean);

      // 🌟 OPTIMASI BATCH: Ambil semua data stats dari Firestore sekaligus dalam 1 query
      const statsMap: Record<string, any> = {};
      if (fileIds.length > 0) {
        try {
          // Maksimal operator 'in' di Firestore adalah 30 item (pas dengan pageSize kita)
        const statsSnap = await db.collection('plugin_stats')
          .where(FieldPath.documentId(), 'in', fileIds.slice(0, 30))
          .get();
          
          statsSnap.forEach(doc => {
            statsMap[doc.id] = doc.data();
          });
        } catch (err) {
          console.error('Gagal mengambil batch stats Firestore (Search):', err);
        }
      }

      const filesWithPath = await Promise.all(
        foundFiles.map(async (file) => {
          let parentName = 'Root Repository';
          if (file.parents && file.parents.length > 0) {
            try {
              const parentMeta = await drive.files.get({
                fileId: file.parents[0],
                fields: 'name',
              });
              parentName = parentMeta.data.name || 'Unknown Folder';
            } catch (err) {
              console.error('Gagal mengambil nama parent untuk file:', file.name, err);
            }
          }
          
          const directDownloadLink = file.webContentLink 
            ? `${file.webContentLink}&confirm=t` 
            : `https://docs.google.com/uc?export=download&id=${file.id}&confirm=t`;

          // Ambil dari map lokal, gak nembak koneksi Firestore lagi
          const fileData = statsMap[file.id];
          const dlCount = fileData?.download_count || 0;
          const fileRating = fileData?.rating?.toFixed(1) || "4.5";

          return {
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size,
            webViewLink: directDownloadLink,
            viewLink: `/api/drive/view?fileId=${file.id}`,
            folderPath: parentName,
            dl: dlCount,        
            rating: fileRating,  
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: { currentFolderId: folderId, subFolders: [], files: filesWithPath, isSearchMode: true }
      });
    }

    // 📁 SKENARIO 2: JIKA USER NAVIGASI BIASA
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size, webViewLink, webContentLink)',
      orderBy: 'folder, name', 
    });

    const items = response.data.files || [];
    const subFolders = items.filter(item => item.mimeType === 'application/vnd.google-apps.folder');
    
    const validFiles = items.filter(item => item.mimeType !== 'application/vnd.google-apps.folder');
    const fileIds = validFiles.map(f => f.id).filter(Boolean);

    // 🌟 OPTIMASI BATCH: Ambil semua data stats dari Firestore sekaligus dalam 1 query
    const statsMap: Record<string, any> = {};
    if (fileIds.length > 0) {
      try {
        // Antisipasi kalau isi folder lebih dari 30 file, kita pecah chunk-nya biar gak limit Firestore
        const chunks = [];
        for (let i = 0; i < fileIds.length; i += 30) {
          chunks.push(fileIds.slice(i, i + 30));
        }

        await Promise.all(
          chunks.map(async (chunk) => {
            const statsSnap = await db.collection('plugin_stats').where(FieldPath.documentId(), 'in', chunk).get();
            statsSnap.forEach(doc => {
              statsMap[doc.id] = doc.data();
            });
          })
        );
      } catch (err) {
        console.error('Gagal mengambil batch stats Firestore (Navigasi):', err);
      }
    }
    
    const files = validFiles.map((file) => {
      const directDownloadLink = file.webContentLink 
        ? `${file.webContentLink}&confirm=t` 
        : `https://docs.google.com/uc?export=download&id=${file.id}&confirm=t`;

      // Ambil dari map lokal, anti-blocking dan ngebut banget
      const fileData = statsMap[file.id];
      const dlCount = fileData?.download_count || 0;
      const fileRating = fileData?.rating?.toFixed(1) || "4.5";

      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        webViewLink: directDownloadLink,
        viewLink: `/api/drive/view?fileId=${file.id}`,
        dl: dlCount,        
        rating: fileRating,  
      };
    });

    return NextResponse.json({
      success: true,
      data: { currentFolderId: folderId, subFolders, files, isSearchMode: false }
    });

  } catch (error: any) {
    console.error('Error fetching from Google Drive:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}