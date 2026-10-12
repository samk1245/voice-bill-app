import { NextRequest, NextResponse } from 'next/server';
import { dbAdapter } from '@/lib/db-adapter';
import { verifyAdminToken, TOKEN_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  try {
    const principal = await dbAdapter.getPrincipal();
    return NextResponse.json(principal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();
    const updated = await dbAdapter.updatePrincipal(updates);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
