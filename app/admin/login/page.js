'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '../../../lib/supabaseBrowser';
import { ThemeToggle } from '../../../components/AdminTheme';
import Icon from '../../../components/Icon';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState({ state: 'idle', msg: '' });

  // The middleware sends an account here with ?reason=no-access when it is
  // signed in but has no staff role. Say so plainly, and end that session so
  // the person can sign in with the right account.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('reason') !== 'no-access') return;
    setStatus({ state: 'err', msg: 'This account does not have access to the workspace. Ask a super admin to give it a role, or sign in with another account.' });
    try {
      createSupabaseBrowser().auth.signOut();
    } catch {
      // Not configured: there is no session to end.
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (status.state === 'loading') return;
    if (!email || !password) {
      setStatus({ state: 'err', msg: 'Enter your email and password.' });
      return;
    }
    setStatus({ state: 'loading', msg: '' });
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus({ state: 'err', msg: error.message || 'Sign in failed. Check your email and password.' });
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setStatus({
        state: 'err',
        msg: err?.name === 'SupabaseConfigError'
          ? 'Sign in is not available because the workspace is not connected. Ask your administrator to complete the setup.'
          : 'Sign in is temporarily unavailable. Check your connection and try again.',
      });
    }
  };

  const loading = status.state === 'loading';

  return (
    <div className="a-login">
      <aside className="a-login__brand" aria-hidden="true">
        <Image src="/logo.png" alt="" width={44} height={52} />
        <p>Rumbu Industries Group</p>
        <h2>One workspace for news, careers, hiring and enquiries.</h2>
        <span>Kano, Nigeria · Est. 2001</span>
      </aside>
      <main className="a-login__main">
        <div className="a-login__theme"><ThemeToggle /></div>
        <form className="a-login__card" onSubmit={handleLogin} noValidate>
          <Link href="/" className="a-login__logo" aria-label="Rumbu Industries, back to website"><Image src="/logo-dark.png" width={30} height={36} alt="" /></Link>
          <p className="a-eyebrow">Rumbu workspace</p>
          <h1>Welcome back</h1>
          <p className="a-login__sub">Sign in to manage your Rumbu workspace.</p>
          <div role="alert" aria-live="assertive">
            {status.state === 'err' && <div className="a-msg err"><Icon name="alert" size={18} /><span>{status.msg}</span></div>}
          </div>
          <div className="a-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="username" inputMode="email" placeholder="you@rumbuindustries.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="a-field">
            <label htmlFor="password">Password</label>
            <div className="a-password">
              <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow(!show)} aria-pressed={show}>{show ? 'Hide' : 'Show'}<span className="sr-only"> password</span></button>
            </div>
          </div>
          <button className="a-btn gold block" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <Link href="/" className="a-login__back"><Icon name="chevronLeft" size={16} /> Back to website</Link>
        </form>
      </main>
    </div>
  );
}
