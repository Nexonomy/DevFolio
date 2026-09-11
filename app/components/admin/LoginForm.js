'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

function safeCallbackUrl(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/admin';
}

export default function LoginForm({ demo = false, configurationIssue = '' }) {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (configurationIssue || loading) return;

    setLoading(true);
    setError('');
    const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));
    let timeoutId;
    let navigationStarted = false;

    try {
      const timeout = new Promise((resolve) => {
        timeoutId = window.setTimeout(() => resolve({ error: 'Timeout', ok: false }), 15000);
      });
      const result = await Promise.race([
        signIn('credentials', { password, redirect: false, callbackUrl }),
        timeout,
      ]);

      if (!result?.ok || result?.error) {
        if (result?.error === 'Timeout') {
          setError('Sign-in timed out. Check the deployed authentication settings and try again.');
        } else if (result?.error === 'CredentialsSignin') {
          setError('That password does not match. Try again.');
        } else {
          setError('The password was accepted, but the hosted session could not be created.');
        }
        return;
      }

      navigationStarted = true;
      window.location.assign(callbackUrl);
    } catch (signInError) {
      console.error('Admin sign-in failed:', signInError);
      setError('Sign-in could not finish. Please try again.');
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (!navigationStarted) setLoading(false);
    }
  };

  return (
    <section className="admin-login-stage">
      {loading && <div className="admin-auth-transition" role="status" aria-live="polite">
        <div className="admin-auth-portal" aria-hidden="true"><i /><i /><i /><span>AT</span></div>
        <p>Access granted</p>
        <h2>Preparing your studio…</h2>
        <div className="admin-auth-progress" aria-hidden="true"><span /></div>
        <small>Loading projects and creative tools</small>
      </div>}
      <div className="admin-login-art" aria-hidden="true">
        <div className="admin-login-orbit admin-login-orbit-one" />
        <div className="admin-login-orbit admin-login-orbit-two" />
        <span className="admin-login-star admin-login-star-one">✦</span>
        <span className="admin-login-star admin-login-star-two">✧</span>
        <div className="admin-login-art-copy">
          <span>Portfolio studio</span>
          <strong>Shape the worlds<br />behind the work.</strong>
          <p>Projects, stories, media and releases — all in one private space.</p>
        </div>
      </div>

      <form className="admin-login-form" onSubmit={handleSubmit} aria-busy={loading}>
        <div className="admin-login-mark" aria-hidden="true"><span>AT</span></div>
        <p className="admin-kicker">Private workspace</p>
        <h1 className="admin-title">Welcome<br />back.</h1>
        <p className="admin-subtitle">Enter your studio key to manage the portfolio.</p>

        {demo && <p className="admin-demo-credential">Preview password <strong>preview</strong></p>}
        {configurationIssue && <p className="admin-error" role="alert">{configurationIssue}</p>}

        <label className="admin-label admin-login-password">
          <span>Password</span>
          <span className="admin-password-field">
            <span className="admin-password-icon" aria-hidden="true">◆</span>
            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              autoFocus
              autoComplete="current-password"
              disabled={loading || Boolean(configurationIssue)}
            />
          </span>
        </label>

        {error && <p className="admin-error" role="alert">{error}</p>}

        <button className="admin-button admin-button-primary admin-login-submit" type="submit" disabled={loading || Boolean(configurationIssue)}>
          {loading ? (
            <><span className="admin-login-loader" aria-hidden="true"><i /><i /><i /></span><span>Opening studio…</span></>
          ) : (
            <><span>Enter the studio</span><span aria-hidden="true">↗</span></>
          )}
        </button>
        <Link className="admin-login-back" href="/">← Back to portfolio</Link>
      </form>
    </section>
  );
}