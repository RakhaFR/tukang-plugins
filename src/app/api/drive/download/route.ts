import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');
    const fileName = searchParams.get('name') || 'file';

    if (!fileId) {
      return NextResponse.json({ error: 'File ID dibutuhkan' }, { status: 400 });
    }

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const response = await fetch(downloadUrl, {
      headers: {
        // Biar Drive ga redirect ke halaman preview
        'User-Agent': 'Mozilla/5.0',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Gagal fetch file dari Drive' }, { status: response.status });
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        // Paksa browser download sebagai binary — tidak auto-extract, tidak buka teks editor
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('Proxy download error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}