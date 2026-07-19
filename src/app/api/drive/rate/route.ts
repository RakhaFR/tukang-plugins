import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue, Transaction } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const { fileId, stars } = await request.json();

    if (!fileId || !stars || stars < 1 || stars > 5) {
      return NextResponse.json({ success: false, error: 'Data tidak valid' }, { status: 400 });
    }

    const fileRef = db.collection('plugin_stats').doc(fileId);
    
    // Gunakan Firestore Transaction supaya kalkulasi matematisnya aman dari bentrokan user lain
    await db.runTransaction(async (transaction: Transaction) => {
      const sfDoc = await transaction.get(fileRef);
      
      let newTotalStars = stars;
      let newTotalVoters = 1;

      if (sfDoc.exists) {
        const data = sfDoc.data() || {};
        const currentStars = data.total_stars || 0;
        const currentVoters = data.total_voters || 0;

        newTotalStars = currentStars + stars;
        newTotalVoters = currentVoters + 1;
      }

      const newRating = parseFloat((newTotalStars / newTotalVoters).toFixed(1));

      transaction.set(fileRef, {
        total_stars: newTotalStars,
        total_voters: newTotalVoters,
        rating: newRating,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Gagal memproses rating:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}