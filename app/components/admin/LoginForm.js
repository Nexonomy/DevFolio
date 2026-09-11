'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm({ demo = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid password');
      return;
    }

    const callbackUrl = searchParams.get('callbackUrl') || '/admin';
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <form className="admin-form admin-login-form" onSubmit={handleSubmit}>
      <h1 className="admin-title">Admin Login</h1>
      <p className="admin-subtitle">Enter your password to manage game projects.</p>
      {demo && <p className="admin-demo-credential">Preview password <strong>preview</strong></p>}

      <label className="admin-label">
        Password
        <input
          className="admin-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoFocus
        />
      </label>

      {error && <p className="admin-error">{error}</p>}

      <button className="admin-button admin-button-primary" type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
