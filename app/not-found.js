import Link from 'next/link';
import Icon from '../components/Icon';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="not-found on-dark weave">
      <div className="container">
        <span className="not-found__code" aria-hidden="true">404</span>
        <div className="eyebrow">A little off the beaten path</div>
        <h1 className="title-xl">Let’s get you <em>back on track.</em></h1>
        <p className="lead">The page you’re looking for may have moved. There’s still plenty to discover at Rumbu.</p>
        <div className="btn-row">
          <Link href="/" className="btn btn-gold">Back to home <Icon name="arrow" size={18} /></Link>
          <Link href="/products" className="btn btn-outline">Browse products</Link>
        </div>
      </div>
    </section>
  );
}
