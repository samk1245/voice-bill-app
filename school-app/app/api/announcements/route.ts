import { NextRequest, NextResponse } from 'next/server';
import { dbAdapter } from '@/lib/db-adapter';
import { verifyAdminToken, TOKEN_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('all') !== 'true';
    const announcements = await dbAdapter.getAnnouncements(publishedOnly);
    return NextResponse.json(announcements);
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
    if (!body.title || !body.description) {
      return NextResponse.json({ error: 'Announcement title and description are required.' }, { status: 400 });
    }

    const announcement = await dbAdapter.createAnnouncement(body);
    return NextResponse.json(announcement, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
