import { Suspense } from 'react';
import LoginForm from '@/app/components/admin/LoginForm';
import { isDemo } from '@/lib/portfolio';

function getAuthConfigurationIssue() {
  if (isDemo) return '';
  if (!process.env.ADMIN_PASSWORD) return 'Deployment setup is missing ADMIN_PASSWORD.';
  if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) return 'Deployment setup is missing NEXTAUTH_SECRET.';
  if (process.env.VERCEL && process.env.NEXTAUTH_URL?.includes('localhost')) {
    return 'NEXTAUTH_URL points to localhost. Remove it on Vercel or set it to the live HTTPS domain.';
  }
  return '';
}

export default function AdminLoginPage() {
  const configurationIssue = getAuthConfigurationIssue();

  return (
    <Suspense fallback={<p className="admin-hint">Loading...</p>}>
      <LoginForm demo={isDemo} configurationIssue={configurationIssue} />
    </Suspense>
  );
}
