import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET
  || process.env.AUTH_SECRET
  || (process.env.PORTFOLIO_DEMO === 'true' ? 'devfolio-local-demo-preview' : undefined);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const protectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (!protectedRoute) return NextResponse.next();

  const token = await getToken({ req: request, secret });
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
