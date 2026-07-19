import { NextResponse } from 'next/server';
import { drive } from '@/lib/googleDrive';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (!rootFolderId) {
      return NextResponse.json({ success: false, error: 'Root Folder ID belum diset' }, { status: 400 });
    }

    // 1. Ambil data folder & file dari Google Drive
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

    // 2. AMBIL DATA MURNI DARI FIRESTORE (Ganti ke plugin_stats agar sinkron!)
    const pluginsSnapshot = await db.collection('plugin_stats').get();
    const firestoreDataMap = new Map();
    
    pluginsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Karena dashboard menggunakan doc.id sebagai Google Drive ID, 
      // kita maps langsung menggunakan doc.id
      firestoreDataMap.set(doc.id, data);
    });

    // Log untuk mastiin data dari plugin_stats sekarang masuk
    console.log("=== ISI DATA MAPPED FIRESTORE VIA PLUGIN_STATS ===");
    console.log(Array.from(firestoreDataMap.keys()));

    // 3. Mapping data Drive & Gabungkan dengan isi Firestore secara akurat
    let popularPlugins = displayFiles.map((file: any, index: number) => {
      const dbData = firestoreDataMap.get(file.id) || {};

      // 🛠️ FIX MURNI: Jika tidak ada di DB, download_count = 0, rating default = 5.0 atau sesuai DB
      const realDownloads = dbData.download_count !== undefined ? dbData.download_count : 0;
      const realRating = dbData.rating !== undefined ? dbData.rating.toFixed(1) : '5.0';

      if (!file.name) {
        return {
          id: file.id || `dummy-${index}`,
          name: 'Untitled Asset',
          cat: 'ASSET',
          rating: realRating,
          dl: `${realDownloads}`,
          rawSize: '0 KB',
          mimeType: file.mimeType || '',
          webViewLink: file.id ? `https://docs.google.com/uc?export=download&id=${file.id}&confirm=t` : '#',
          viewLink: file.id ? `/api/drive/view?fileId=${file.id}` : '#',
        };
      }

      // Format Ukuran File
      const fileSizeKB = file.size ? Math.floor(parseInt(file.size) / 1024) : 0;
      let formattedSize = '0 KB';
      if (fileSizeKB > 1024) {
        formattedSize = `${(fileSizeKB / 1024).toFixed(1)} MB`;
      } else if (fileSizeKB > 0) {
        formattedSize = `${fileSizeKB} KB`;
      } else {
        formattedSize = 'Under 1 KB';
      }

      const nameParts = file.name.split('.');
      const ext = nameParts.length > 1 ? nameParts.pop()?.toUpperCase() : 'ASSET';

      return {
        id: file.id,
        name: file.name.replace(/\.[^/.]+$/, ""),
        cat: ext || 'PLUGIN',
        rating: realRating,
        dl: `${realDownloads}`, 
        rawSize: formattedSize,
        mimeType: file.mimeType || '',
        webViewLink: `https://docs.google.com/uc?export=download&id=${file.id}&confirm=t`,
        viewLink: `/api/drive/view?fileId=${file.id}`,
      };
    });

    // 4. Urutkan berdasarkan download terbanyak & potong 6 teratas
    popularPlugins.sort((a, b) => parseInt(b.dl) - parseInt(a.dl));
    const topPopular = popularPlugins.slice(0, 6);

    return NextResponse.json({
      success: true,
      stats: {
        totalPlugins: actualTotalFiles,
        totalCategories: totalCategories || 3,
      },
      popularPlugins: topPopular
    });

  } catch (error: any) {
    console.error('Error fetching landing stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}