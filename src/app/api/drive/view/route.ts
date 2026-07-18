import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

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
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ success: false, error: 'File ID diperlukan' }, { status: 400 });
    }

    // 1. Ambil metadata untuk mengetahui nama file dan tipe medianya (MimeType)
    const metadata = await drive.files.get({
      fileId: fileId,
      fields: 'name, mimeType',
    });

    const mimeType = metadata.data.mimeType || 'application/octet-stream';

    // 2. Ambil konten file berupa media stream
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    // 3. Kembalikan sebagai response Next.js dengan Header Content-Type yang sesuai
    return new NextResponse(response.data as any, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${metadata.data.name}"`,
      },
    });

  } catch (error: any) {
    console.error('Error streaming file from Google Drive:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}