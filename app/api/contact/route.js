import { NextResponse } from 'next/server';
import { getProfile } from '@/lib/profile';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const MAX_LEN = { name: 120, email: 160, subject: 200, message: 5000 };

function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim().slice(0, max);
}

export async function POST(request) {
  const limit = rateLimit(request, { key: 'contact', windowMs: 60_000 * 10, max: 5 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many messages. Please try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const name = clean(payload.name, MAX_LEN.name);
  const email = clean(payload.email, MAX_LEN.email);
  const subject = clean(payload.subject, MAX_LEN.subject) || 'Portfolio enquiry';
  const message = clean(payload.message, MAX_LEN.message);
  const honeypot = clean(payload.company, 40);

  if (honeypot) return NextResponse.json({ ok: true });
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const profile = await getProfile();
  const to = profile?.email;
  if (!to) {
    return NextResponse.json({ error: 'Contact email is not configured.' }, { status: 503 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';
  const firstName = (profile.name || '').split(' ')[0] || 'there';
  const textBody = `Hi ${firstName},\n\n${message}\n\nFrom: ${name}\nEmail: ${email}`;

  if (!resendKey) {
    console.info('[contact] no RESEND_API_KEY set; message not sent', { name, email, subject });
    return NextResponse.json(
      { error: 'Email delivery is not configured on this server. Please email directly.', fallback: true },
      { status: 503 },
    );
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        text: textBody,
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('[contact] resend failed', response.status, detail);
      return NextResponse.json(
        { error: 'Could not send the message right now. Please email directly.', fallback: true },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[contact] send error', error);
    return NextResponse.json(
      { error: 'Could not send the message right now. Please email directly.', fallback: true },
      { status: 502 },
    );
  }
}
