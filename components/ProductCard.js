import Link from 'next/link';
import Icon from './Icon';

// Shared product media: the real photograph, or a labelled placeholder while
// photography for that product has not been supplied.
export function ProductMedia({ product, eager = false }) {
  if (!product.hasImage) {
    return (
      <div className="placeholder-media">
        <Icon name={product.category === 'Materials & fibres' ? 'leaf' : 'factory'} size={34} />
        <strong>{product.short}</strong>
        <small>Product photography coming soon</small>
      </div>
    );
  }
  return <img src={product.img} alt={product.name} loading={eager ? 'eager' : 'lazy'} decoding="async" />;
}

export default function ProductCard({ product }) {
  const contain = product.img?.endsWith('.png');
  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-card__link" aria-label={`${product.name}: view product`}>
        <div className={`product-card__media${contain ? ' product-card__media--contain' : ''}`}>
          <ProductMedia product={product} />
          <span className="product-card__num">{String(product.index + 1).padStart(2, '0')}</span>
        </div>
        <div className="product-card__body">
          <span className="product-card__cat">{product.category}</span>
          <h3>{product.name}</h3>
          <p>{product.desc}</p>
          <span className="product-card__more">View product <Icon name="diagonal" size={16} /></span>
        </div>
      </Link>
    </article>
  );
}
