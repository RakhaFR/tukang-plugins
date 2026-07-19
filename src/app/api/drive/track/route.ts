import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore'; // 🌟 Import gaya baru

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ success: false, error: 'File ID diperlukan' }, { status: 400 });
    }

    const fileRef = db.collection('plugin_stats').doc(fileId);

    // 🔥 Gunakan FieldValue langsung tanpa kata "admin.firestore"
    await fileRef.set({
      download_count: FieldValue.increment(1),
      rating: 4.8
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Gagal update counter di Firebase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}