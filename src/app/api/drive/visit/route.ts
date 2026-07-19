import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST() {
  try {
    const ref = db.collection('site_stats').doc('visits');
    const doc = await ref.get();

    if (!doc.exists) {
      await ref.set({ count: 1, updatedAt: FieldValue.serverTimestamp() });
    } else {
      await ref.update({
        count: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ref = db.collection('site_stats').doc('visits');
    const doc = await ref.get();
    const count = doc.exists ? (doc.data()?.count || 0) : 0;
    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}