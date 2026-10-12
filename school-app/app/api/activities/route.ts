import { NextRequest, NextResponse } from 'next/server';
import { dbAdapter } from '@/lib/db-adapter';
import { verifyAdminToken, TOKEN_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const publishedOnly = searchParams.get('all') !== 'true';

    const activities = await dbAdapter.getActivities({
      status,
      category,
      search,
      publishedOnly,
    });

    return NextResponse.json(activities);
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
    if (!body.title || !body.date) {
      return NextResponse.json({ error: 'Activity title and date are required.' }, { status: 400 });
    }

    const activity = await dbAdapter.createActivity(body);
    return NextResponse.json(activity, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
