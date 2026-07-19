import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { fileId, fileName } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'File ID dibutuhkan' }, { status: 400 });
    }

    // Arahkan ke document berdasarkan fileId Google Drive
    const pluginRef = db.collection('plugin_stats').doc(fileId);
    const doc = await pluginRef.get();

    if (!doc.exists) {
      // 🆕 Jika plugin belum pernah didownload sama sekali, buat data baru
      await pluginRef.set({
        name: fileName || 'Unknown Plugin',
        downloadCount: 1,
        rating: 0,
        viewCount: 1,
        updatedAt: FieldValue.serverTimestamp()
      });
    } else {
      // 📈 Jika sudah ada, tambah jumlah download-nya (+1) secara otomatis
      await pluginRef.update({
        downloadCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Gagal memperbarui data download:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}