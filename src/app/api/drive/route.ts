import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// 🛠️ Inisialisasi Google Auth
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

    // 🔍 SKENARIO 1: JIKA USER SEDANG MENGETIK DI KOLOM PENCARIAN (GLOBAL PENCARIAN)
    if (search) {
      const response = await drive.files.list({
        q: `name contains '${search}' and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, parents)',
        pageSize: 30,
      });

      const foundFiles = response.data.files || [];

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
          
          // 🔥 PERBAIKAN: Paksa format tautan export download yang mem-bypass halaman preview drive
          const directDownloadLink = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://docs.google.com/uc?export=download&id=${file.id}&confirm=t`)}`;

          return {
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size,
            // Jika file.webContentLink ada, pakai itu. Jika tidak, pakai generator link anti-preview kita
            webViewLink: file.webContentLink ? `${file.webContentLink}&confirm=t` : `https://docs.google.com/uc?export=download&id=${file.id}&confirm=t`, 
            viewLink: `/api/drive/view?fileId=${file.id}`,
            folderPath: parentName,
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
    
    const files = items
      .filter(item => item.mimeType !== 'application/vnd.google-apps.folder')
      .map(file => {
        // 🔥 PERBAIKAN: Tambahkan parameter '&confirm=t' untuk memaksa google melewati halaman scanning/preview
        const directDownloadLink = file.webContentLink 
          ? `${file.webContentLink}&confirm=t` 
          : `https://docs.google.com/uc?export=download&id=${file.id}&confirm=t`;

        return {
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
          webViewLink: directDownloadLink,
          viewLink: `/api/drive/view?fileId=${file.id}`,
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