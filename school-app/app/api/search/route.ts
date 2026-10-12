import { NextRequest, NextResponse } from 'next/server';
import { dbAdapter } from '@/lib/db-adapter';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const results = await dbAdapter.searchAll(q);
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
