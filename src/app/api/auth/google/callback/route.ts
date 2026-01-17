import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode, setCredentials } from '@/lib/auth/google';
import { saveTokens } from '@/lib/auth/token-store';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', req.url));
  }

  try {
    const tokens = await getTokensFromCode(code);
    await saveTokens(tokens);
    setCredentials(tokens);

    return NextResponse.redirect(new URL('/?auth=success', req.url));
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_failed', req.url));
  }
}
