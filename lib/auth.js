import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const password = credentials?.password;
        const adminPassword = process.env.ADMIN_PASSWORD
          || (process.env.PORTFOLIO_DEMO === 'true' ? 'preview' : undefined);

        if (!adminPassword || !password || password !== adminPassword) {
          return null;
        }

        return { id: 'admin', name: 'Admin' };
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || (process.env.PORTFOLIO_DEMO === 'true' ? 'devfolio-local-demo-preview' : undefined),
};

