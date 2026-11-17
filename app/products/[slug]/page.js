import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '../../../components/PageHeader';
import ProductCard, { ProductMedia } from '../../../components/ProductCard';
import ContactCTA from '../../../components/ContactCTA';
import Icon from '../../../components/Icon';
import { getProducts, getProduct } from '../../../lib/products';
import { company } from '../../../lib/data';

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }) {
  const product = getProduct(params.slug);
  if (!product) return { title: 'Products' };
  return {
    title: product.name,
    description: product.desc,
    openGraph: product.hasImage ? { title: product.name, description: product.desc, images: [{ url: product.img }] } : undefined,
  };
}

export default function ProductPage({ params }) {
  const product = getProduct(params.slug);
  if (!product) return notFound();
  const all = getProducts();
  const related = all.filter((p) => p.category === product.category && p.slug !== product.slug);
  const enquire = `/contact?product=${encodeURIComponent(product.name)}`;
  const contain = product.img?.endsWith('.png');

  return (
    <>
      <PageHeader
        variant="ivory"
        label={product.category}
        crumbs={[{ label: 'Products', href: '/products' }, { label: product.short }]}
        title={product.name}
        aside={
          <figure className="frame product-detail__frame">
            <div className={`frame__media${contain ? ' frame__media--contain' : ''}`}><ProductMedia product={product} eager /></div>
            <figcaption className="frame__caption"><span>{product.short}</span><span>No. {String(product.index + 1).padStart(2, '0')}</span></figcaption>
          </figure>
        }
      />

      <section className="section section--white section--tight">
        <div className="container product-detail">
          <div>
            <div className="eyebrow">About this product</div>
            <p className="product-detail__desc">{product.desc}</p>
            <div className="btn-row">
              <Link href={enquire} className="btn btn--auto">Enquire about this product <Icon name="diagonal" size={18} /></Link>
              <a href="/rumbu-product-catalogue.pdf" download className="btn btn-outline btn--auto">Download catalogue <Icon name="download" size={18} /></a>
            </div>
          </div>
          <aside className="enquiry-card" aria-label="Enquiries">
            <h2>Talk to our team</h2>
            <p>For availability, sizes, quantities and custom orders, speak to us directly.</p>
            <ul>
              <li><Icon name="phone" size={18} /><a href={`tel:${company.phone1.replace(/ /g, '')}`}>{company.phone1}</a></li>
              <li><Icon name="mail" size={18} /><a href={`mailto:${company.email}?subject=${encodeURIComponent(`Product enquiry: ${product.name}`)}`}>{company.email}</a></li>
              <li><Icon name="pin" size={18} /><span>{company.address}</span></li>
            </ul>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head section-head--split">
              <div>
                <div className="eyebrow">More in {product.category.toLowerCase()}</div>
                <h2 className="title-lg">Related products</h2>
              </div>
              <Link href="/products" className="link-arrow">View all products <Icon name="diagonal" size={18} /></Link>
            </div>
            <div className="grid-3 product-grid">
              {related.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <ContactCTA title={<>Let’s find the <em>right product</em> for you.</>} />
    </>
  );
}
