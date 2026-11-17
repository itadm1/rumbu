import Image from 'next/image';
import Link from 'next/link';

// Shared page head. Variants give each page its own composition:
//   split    dark band, headline left, `aside` (or the lead) on the right
//   center   dark band, centred
//   ivory    light editorial head
//   cinema   full-bleed photograph behind the headline (use a high-resolution image only)
export default function PageHeader({ label, title, description, variant = 'split', image, imageAlt = '', aside, children, crumbs }) {
  const dark = variant !== 'ivory';
  const trail = crumbs || [{ label }];
  const cls = ['page-head', `page-head--${variant}`, dark ? 'on-dark weave' : ''].join(' ').trim();

  const breadcrumb = (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {trail.map((c, i) => (
        <span key={c.label} style={{ display: 'contents' }}>
          <span aria-hidden="true">/</span>
          {c.href && i < trail.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </span>
      ))}
    </nav>
  );

  const heading = (
    <>
      <div className="eyebrow">{label}</div>
      <h1 className="title-xl">{title}</h1>
    </>
  );

  return (
    <section className={cls}>
      {variant === 'cinema' && image && (
        <div className="page-head__bg"><Image src={image} alt={imageAlt} fill priority sizes="100vw" quality={80} /></div>
      )}
      <div className="container">
        {breadcrumb}
        {variant === 'split' || variant === 'ivory' ? (
          <div className="page-head__grid">
            <div>{heading}</div>
            <div className="page-head__aside">
              {aside || (description && <p className="lead">{description}</p>)}
              {children}
            </div>
          </div>
        ) : (
          <div className="page-head__grid page-head__grid--solo">
            <div>
              {heading}
              {description && <p className="lead">{description}</p>}
              {children}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
