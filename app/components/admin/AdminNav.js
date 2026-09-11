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
          <span aria-hidden="true">AT</span>
          <div><strong>Portfolio Studio</strong><small>Project control room</small></div>
        </Link>
        <nav className="admin-nav-links" aria-label="Administration">
          <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>Library</Link>
          <Link href="/admin/games/new" className={pathname === '/admin/games/new' ? 'active' : ''}>New Project</Link>
          <Link href="/admin/profile" className={pathname === '/admin/profile' ? 'active' : ''}>Personal Data</Link>
          <Link href="/" target="_blank">View Portfolio <span aria-hidden="true">↗</span></Link>
          <button type="button" className="admin-link-button" onClick={() => signOut({ callbackUrl: '/admin/login' })}>Sign Out</button>
        </nav>
      </div>
    </header>
  );
}