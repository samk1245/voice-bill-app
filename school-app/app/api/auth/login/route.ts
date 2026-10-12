import { NextRequest, NextResponse } from 'next/server';
import { dbAdapter } from '@/lib/db-adapter';
import { comparePassword, signAdminToken, TOKEN_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const admin = await dbAdapter.findAdminByEmail(email);
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid administrator credentials.' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid administrator credentials.' },
        { status: 401 }
      );
    }

    const token = signAdminToken({
      email: admin.email,
      name: admin.name || 'School Administrator',
      role: admin.role || 'admin',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during authentication.' },
      { status: 500 }
    );
  }
}
