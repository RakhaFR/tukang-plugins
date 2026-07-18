import { NextResponse } from 'next/server';
import { drive } from '@/lib/googleDrive';

export async function GET() {
  try {
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (!rootFolderId) {
      return NextResponse.json({ success: false, error: 'Root Folder ID belum diset' }, { status: 400 });
    }

    const response = await drive.files.list({
      q: `'${rootFolderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size, webViewLink)',
      orderBy: 'name desc',
    });

    const totalFilesResponse = await drive.files.list({
      q: `trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
      fields: 'files(id, name, mimeType, size, webViewLink)',
      pageSize: 1000,
    });

    const rootItems = response.data.files || [];
    const totalCategories = rootItems.filter(item => item.mimeType === 'application/vnd.google-apps.folder').length;
    const allFilesAtRoot = rootItems.filter(item => item.mimeType !== 'application/vnd.google-apps.folder');

    const displayFiles = allFilesAtRoot.length > 0 ? allFilesAtRoot : (totalFilesResponse.data.files || []);
    const actualTotalFiles = allFilesAtRoot.length > 0 ? allFilesAtRoot.length : displayFiles.length;

    const popularPlugins = displayFiles.slice(0, 6).map((file: any, index: number) => {
      if (!file.name) {
        return {
          id: file.id || `dummy-${index}`,
          name: 'Untitled Asset',
          cat: 'ASSET',
          rating: '4.5',
          dl: '12',
          rawSize: '0 KB',
          mimeType: file.mimeType || '',
          webViewLink: file.id ? `https://docs.google.com/uc?export=download&id=${file.id}&confirm=t` : '#',
          viewLink: file.id ? `/api/drive/view?fileId=${file.id}` : '#',
        };
      }

      const nameWeight = file.name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const fileSizeKB = file.size ? Math.floor(parseInt(file.size) / 1024) : 0;

      let formattedSize = '0 KB';
      if (fileSizeKB > 1024) {
        formattedSize = `${(fileSizeKB / 1024).toFixed(1)} MB`;
      } else if (fileSizeKB > 0) {
        formattedSize = `${fileSizeKB} KB`;
      } else {
        formattedSize = 'Under 1 KB';
      }

      const calculatedDownloads = Math.floor((nameWeight % 60) + (fileSizeKB % 15) + 5);
      const calculatedRating = (4.2 + ((nameWeight % 8) * 0.1)).toFixed(1);
      const nameParts = file.name.split('.');
      const ext = nameParts.length > 1 ? nameParts.pop()?.toUpperCase() : 'ASSET';

      return {
        id: file.id,
        name: file.name.replace(/\.[^/.]+$/, ""),
        cat: ext || 'PLUGIN',
        rating: calculatedRating,
        dl: `${calculatedDownloads}`,
        rawSize: formattedSize,
        mimeType: file.mimeType || '',
        webViewLink: `https://docs.google.com/uc?export=download&id=${file.id}&confirm=t`,
        viewLink: `/api/drive/view?fileId=${file.id}`,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalPlugins: actualTotalFiles,
        totalCategories: totalCategories || 3,
      },
      popularPlugins
    });
  } catch (error: any) {
    console.error('Error fetching landing stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}