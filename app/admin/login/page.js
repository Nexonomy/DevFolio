import { Suspense } from 'react';
import LoginForm from '@/app/components/admin/LoginForm';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="admin-hint">Loading...</p>}>
      <LoginForm />
    </Suspense>
  );
}
