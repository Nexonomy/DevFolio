import { withAuth } from 'next-auth/middleware';

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || (process.env.PORTFOLIO_DEMO === 'true' ? 'devfolio-local-demo-preview' : undefined),
  pages: {
    signIn: '/admin/login',
  },
});

export const config = {
  matcher: ['/admin', '/admin/((?!login).*)'],
};
