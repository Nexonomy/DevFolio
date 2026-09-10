'use client';

import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import AdminNav from '@/app/components/admin/AdminNav';

function AdminShell({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  return (
    <div className="admin-shell">
      {!isLogin && <AdminNav />}
      <main className={isLogin ? 'admin-login-page' : 'admin-main'}>{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
