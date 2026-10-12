import { NextRequest, NextResponse } from 'next/server';
import { dbAdapter } from '@/lib/db-adapter';
import { verifyAdminToken, TOKEN_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
    const body = await req.json().catch(() => ({}));
    
    // Allow if valid admin or if setupKey matches
    const isAuth = token && verifyAdminToken(token);
    const isSetup = body.setupKey === 'karelibagh_initial_seed_2026';

    if (!isAuth && !isSetup) {
      return NextResponse.json({ error: 'Unauthorized to reset/seed data.' }, { status: 401 });
    }

    const data = await dbAdapter.resetOrSeed();
    return NextResponse.json({ success: true, message: 'Database reset to initial verified seed state.', data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
