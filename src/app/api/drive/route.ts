import { NextResponse } from 'next/server';
import { drive } from '@/lib/googleDrive'; // Menggunakan absolute path bawaan Next.js (@/)

interface DriveFile {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
  size?: string | null;
  webViewLink?: string | null;
}

// Named export untuk method GET
export async function GET() {
      console.log('EMAIL:', process.env.GOOGLE_CLIENT_EMAIL);
  console.log('KEY raw (30 char):', process.env.GOOGLE_PRIVATE_KEY?.slice(0, 30));
  console.log('Has literal \\n:', process.env.GOOGLE_PRIVATE_KEY?.includes('\\n'));
  console.log('Has real newline:', process.env.GOOGLE_PRIVATE_KEY?.includes('\n'));
  try {
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

    if (!rootFolderId) {
      return NextResponse.json(
        { success: false, error: 'Root Folder ID belum dikonfigurasi di server (.env.local)' },
        { status: 500 }
      );
    }

    // Mengambil list file & folder dari Google Drive
    const response = await drive.files.list({
      q: `'${rootFolderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size, webViewLink)',
      spaces: 'drive',
    });

    const items = (response.data.files as DriveFile[]) || [];

    // Memisahkan antara Folder (Kategori) dan File (Plugin)
    const folders = items.filter(item => item.mimeType === 'application/vnd.google-apps.folder');
    const files = items.filter(item => item.mimeType !== 'application/vnd.google-apps.folder');

    return NextResponse.json({ 
      success: true, 
      data: {
        categories: folders,
        plugins: files
      }
    }, { status: 200 });

  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error('Error fetching from Google Drive:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengambil data dari Google Drive' },
      { status: 500 }
    );
  }
}