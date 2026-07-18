import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// 🛠️ Inisialisasi Google Auth menggunakan variabel terpisah (.env aman dari error client_email)
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    // Menangani case karakter \n dibaca sebagai string mentah '\\n' oleh Windows/Next.js
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

    // 🔍 SKENARIO 1: JIKA USER SEDANG MENGETIK DI KOLOM PENCARIAN (GLOBAL PENCARIAN)
    if (search) {
      const response = await drive.files.list({
        // Cari file yang namanya mengandung kata kunci, abaikan folder, dan tidak di bin/trash
        q: `name contains '${search}' and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
        // ⚡ Menambahkan webContentLink untuk direct download bypass preview
        fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, parents)',
        pageSize: 30,
      });

      const foundFiles = response.data.files || [];

      // Dapatkan info nama folder induk secara paralel untuk mendeteksi lokasi path foldernya
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
          
          // Force direct download link menggunakan webContentLink atau shortener endpoint bawaan Drive
          const directDownloadLink = file.webContentLink || `https://docs.google.com/uc?export=download&id=${file.id}`;

          return {
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size,
            webViewLink: directDownloadLink, // Timpa webViewLink dengan link download langsung
            folderPath: parentName,
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: {
          currentFolderId: folderId,
          subFolders: [], // Kosongkan subfolder ketika mode cari aktif
          files: filesWithPath,
          isSearchMode: true
        }
      });
    }

    // 📁 SKENARIO 2: JIKA USER NAVIGASI BIASA
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      // ⚡ Menambahkan webContentLink untuk direct download bypass preview
      fields: 'files(id, name, mimeType, size, webViewLink, webContentLink)',
      orderBy: 'folder, name', 
    });

    const items = response.data.files || [];

    const subFolders = items.filter(item => item.mimeType === 'application/vnd.google-apps.folder');
    
    // Map data file biasa, ubah linknya menjadi download langsung
    const files = items
      .filter(item => item.mimeType !== 'application/vnd.google-apps.folder')
      .map(file => {
        const directDownloadLink = file.webContentLink || `https://docs.google.com/uc?export=download&id=${file.id}`;
        return {
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
          webViewLink: directDownloadLink, // Timpa webViewLink dengan link download langsung
        };
      });

    return NextResponse.json({
      success: true,
      data: {
        currentFolderId: folderId,
        subFolders,
        files,
        isSearchMode: false
      }
    });

  } catch (error: any) {
    console.error('Error fetching from Google Drive:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}