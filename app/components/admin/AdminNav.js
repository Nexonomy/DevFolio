'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="admin-nav">
      <div className="admin-nav-inner">
        <Link href="/admin" className="admin-nav-logo">
          QUEST LOG CMS
        </Link>
        <nav className="admin-nav-links">
          <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>
            Dashboard
          </Link>
          <Link href="/admin/games/new" className={pathname === '/admin/games/new' ? 'active' : ''}>
            New Game
          </Link>
          <Link href="/" target="_blank">
            View Site
          </Link>
          <button type="button" className="admin-link-button" onClick={() => signOut({ callbackUrl: '/admin/login' })}>
            Sign Out
          </button>
        </nav>
      </div>
    </header>
  );
}
