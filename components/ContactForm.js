'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

// company_website is a hidden trap for automated spam. People never see it.
const EMPTY = { name: '', email: '', subject: '', message: '', company_website: '' };
const FALLBACK_ERROR = 'Your message could not be sent. Please try again, or contact us by phone or email.';

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: 'idle', msg: '' });
  const statusRef = useRef(null);

  // Product pages link here with ?product=<name> to prefill the subject.
  useEffect(() => {
    const product = new URLSearchParams(window.location.search).get('product');
    if (product) setForm((f) => ({ ...f, subject: `Product enquiry: ${product.slice(0, 150)}` }));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status.state === 'sending') return;
    setStatus({ state: 'sending', msg: 'Sending your message…' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Only the "not connected" notice is specific enough to show as is.
        throw new Error(data.code === 'not_configured' ? data.error : FALLBACK_ERROR);
      }
      setStatus({ state: 'success', msg: 'Thank you. Your message has been received by our team.' });
      setForm(EMPTY);
    } catch (err) {
      setStatus({ state: 'error', msg: err?.message && err.message !== 'Failed to fetch' ? err.message : FALLBACK_ERROR });
    }
    statusRef.current?.focus();
  };

  const sending = status.state === 'sending';

  return (
    <form className="contact__form" onSubmit={handleSubmit} aria-labelledby="contact-form-title">
      <h2 id="contact-form-title" className="title-md">Send us a message</h2>
      <p className="form-note">Fields marked <span aria-hidden="true">*</span><span className="sr-only">with an asterisk</span> are required.</p>
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="company_website">Leave this field empty</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" value={form.company_website} onChange={handleChange} />
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="name">Full name <span aria-hidden="true">*</span></label>
          <input id="name" name="name" autoComplete="name" placeholder="Your full name" required maxLength={150} value={form.name} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email address <span aria-hidden="true">*</span></label>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@company.com" required maxLength={254} value={form.email} onChange={handleChange} />
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="subject">Subject</label>
        <input id="subject" name="subject" placeholder="How can we help?" maxLength={200} value={form.subject} onChange={handleChange} />
      </div>
      <div className="form-field">
        <label htmlFor="message">Your message <span aria-hidden="true">*</span></label>
        <textarea id="message" name="message" placeholder="Tell us a little about what you need…" rows={6} required maxLength={5000} value={form.message} onChange={handleChange} />
      </div>
      <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="contact__status">
        {status.msg && <div className={`form-msg ${status.state === 'sending' ? '' : status.state}`}>{status.msg}</div>}
      </div>
      <div className="contact__submit">
        <button className="btn" type="submit" disabled={sending}>
          {sending ? 'Sending message…' : 'Send message'} <Icon name="diagonal" size={18} />
        </button>
        <p className="form-note">Your details are used only to respond to your enquiry.</p>
      </div>
    </form>
  );
}
