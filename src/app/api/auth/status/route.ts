import { NextResponse } from 'next/server';
import { loadTokens } from '@/lib/auth/token-store';

export async function GET() {
  const tokens = await loadTokens();
  return NextResponse.json({
    authenticated: !!tokens,
    hasRefreshToken: !!tokens?.refresh_token,
  });
}
