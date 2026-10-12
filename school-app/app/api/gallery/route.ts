import { NextRequest, NextResponse } from 'next/server';
import { dbAdapter } from '@/lib/db-adapter';
import { verifyAdminToken, TOKEN_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const gallery = await dbAdapter.getGallery(category);
    return NextResponse.json(gallery);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    // Support either single item or array of items (batch upload)
    if (Array.isArray(body)) {
      const created = await Promise.all(
        body.map((item) => dbAdapter.createGalleryItem(item))
      );
      return NextResponse.json(created, { status: 201 });
    }

    if (!body.image || !body.title) {
      return NextResponse.json({ error: 'Image URL and title are required.' }, { status: 400 });
    }

    const item = await dbAdapter.createGalleryItem(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required.' }, { status: 400 });
    }

    await dbAdapter.deleteGalleryItem(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
