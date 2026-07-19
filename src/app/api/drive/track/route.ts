import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const { fileId, fileName } = await request.json();

    if (!fileId) {
      return NextResponse.json({ success: false, error: 'File ID diperlukan' }, { status: 400 });
    }

    const fileRef = db.collection('plugin_stats').doc(fileId);
    const doc = await fileRef.get();

    if (!doc.exists) {
      // 🆕 Jika file pertama kali didownload:
      // Inisialisasi download = 1, dan beri default rating awal 5.0 (dari 1 voter gaib)
      await fileRef.set({
        name: fileName || 'Unknown Plugin',
        download_count: 1,
        total_stars: 5,
        total_voters: 1,
        rating: 5.0,
        updatedAt: FieldValue.serverTimestamp()
      });
    } else {
      // 📈 Jika sudah ada data, cukup naikkan angka download_count saja (+1)
      // Jangan timpa atau ubah rating-nya di sini!
      await fileRef.update({
        download_count: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Gagal update counter di Firebase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}