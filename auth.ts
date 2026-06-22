import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },

  providers: [
    Credentials({
      name: 'Email & Mật khẩu',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        // Lazy import of Node-only modules (bcrypt + DB) so they're never
        // pulled into the Edge-runtime middleware bundle.
        const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const { default: bcrypt } = await import('bcryptjs');
        const { ensureSchema } = await import('./lib/db');
        const { findUserByEmail } = await import('./lib/users-repo');

        await ensureSchema();
        const user = await findUserByEmail(email);
        if (!user || !user.password_hash) return null;

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),

    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email && user.name) {
        const { ensureSchema } = await import('./lib/db');
        const { findUserByEmail, findOrCreateOAuthUser, seedWordsForUser } =
          await import('./lib/users-repo');

        await ensureSchema();
        const existing = await findUserByEmail(user.email);
        if (!existing) {
          const created = await findOrCreateOAuthUser(user.email, user.name, 'google');
          await seedWordsForUser(created.id);
          user.id = created.id;
        } else {
          user.id = existing.id;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },

    async session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string;
      return session;
    },
  },
});
