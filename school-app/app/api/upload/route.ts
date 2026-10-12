import { NextRequest, NextResponse } from 'next/server';
import { uploadImageBuffer } from '@/lib/cloudinary';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'kareli-bagh-school';

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPG, JPEG, PNG, and WEBP images are supported.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the 10MB maximum limit.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadImageBuffer(buffer, folder, file.name);

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      isLocal: result.isLocal,
    });
  } catch (error: any) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process image upload.' },
      { status: 500 }
    );
  }
}
