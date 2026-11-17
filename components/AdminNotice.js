import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';

// Full-screen, self-contained notice for states where the workspace cannot
// load at all (not configured, or the service cannot be reached).
export default function AdminNotice({ icon = 'alert', eyebrow, title, children, actions }) {
  return (
    <div className="a-notice">
      <div className="a-notice__card">
        <Link href="/" className="a-notice__logo" aria-label="Rumbu Industries, back to website"><Image src="/logo-dark.png" alt="" width={30} height={36} /></Link>
        <span className="a-notice__icon"><Icon name={icon} size={24} /></span>
        {eyebrow && <p className="a-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <div className="a-notice__body">{children}</div>
        {actions && <div className="a-notice__actions">{actions}</div>}
      </div>
    </div>
  );
}
