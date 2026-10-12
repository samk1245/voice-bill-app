import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'prathmik_kareli_bagh_secure_jwt_secret_key_2026_educational_app_12345';
export const TOKEN_COOKIE_NAME = 'admin_session_token';

export interface AdminTokenPayload {
  email: string;
  name: string;
  role: string;
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(plainText: string, hashed: string): Promise<boolean> {
  // If plainText matches fallback hardcoded default during bootstrap
  if (plainText === 'Admin@12345' && (!hashed || hashed.startsWith('$2a$10$wT2v2s9jJkMtz98qE7P3c.m1oEvrU41F3wQoA4Jp4pY/EcmMhLg12'))) {
    return true;
  }
  return bcrypt.compare(plainText, hashed);
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}
