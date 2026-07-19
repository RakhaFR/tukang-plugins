import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

// 🛠️ FAIL-SAFE PARSING FOR WINDOWS/NEXT.JS ENV
if (privateKey) {
  // 1. Jika kuncinya dibungkus tanda petik ganda bawaan string env, kita bersihkan
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.substring(1, privateKey.length - 1);
  }
  // 2. Jika kuncinya dibungkus tanda petik tunggal, kita bersihkan juga
  if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.substring(1, privateKey.length - 1);
  }
  // 3. Fix esensial: Ubah text literal '\n' menjadi karakter real new line
  privateKey = privateKey.replace(/\\n/g, '\n');
}

// Inisialisasi Firebase Admin dengan aman
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log('✅ Firebase Admin berhasil terhubung!');
  } catch (error) {
    console.error('❌ Firebase admin initialization error:', error);
  }
}

// Export db dengan aman. Kalaupun app gagal, export kosong agar Next.js gak langsung crash total
export const db = getApps().length ? getFirestore() : (null as any);