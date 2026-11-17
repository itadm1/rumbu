// PATH: lib/email.js
//
// Sends via Resend's HTTP API — plain fetch(), no npm package, so this
// never needs a package.json/package-lock.json change to work.
//
// Defaults to Resend's built-in sandbox sender (onboarding@resend.dev),
// which needs no domain verification but can only deliver to the email
// address your Resend account itself was signed up with. Once your own
// domain is verified in Resend, set HR_EMAIL_FROM to send to anyone.
//
// HR_REPLY_TO matters even on the sandbox sender: without it, any reply an
// applicant sends goes to onboarding@resend.dev (Resend's own address, not
// yours) and is lost. Set HR_REPLY_TO to a real inbox you check — e.g. your
// Google Workspace address — so replies land somewhere your team can see.
//
// (A Gmail/Google Workspace SMTP option was explored too — it needs the
// `nodemailer` package added to package.json + package-lock.json together
// for the build not to break. Ask me to re-add it whenever you're ready to
// actually switch to Gmail sending; for now this stays dependency-free.)
export async function sendEmail({ to, subject, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.HR_EMAIL_FROM || 'Rumbu Industries HR <onboarding@resend.dev>';
  const replyTo = process.env.HR_REPLY_TO || undefined;

  if (!apiKey) return { sent: false, response: 'RESEND_API_KEY not set — logged only, not delivered.' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    const data = await res.json();
    if (!res.ok) return { sent: false, response: JSON.stringify(data) };
    return { sent: true, response: JSON.stringify(data) };
  } catch (e) {
    return { sent: false, response: String(e) };
  }
}
