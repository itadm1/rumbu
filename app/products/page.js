import PageHeader from '../../components/PageHeader';
import ProductRange from '../../components/ProductRange';
import ContactCTA from '../../components/ContactCTA';
import Icon from '../../components/Icon';
import { getProducts } from '../../lib/products';
import { productCategories } from '../../lib/data';

export const metadata = { title: 'Our Products' };

export default function Products() {
  const products = getProducts();
  return (
    <>
      <PageHeader
        variant="split"
        label="Our products"
        title={<>Made with care.<br /><em>Built for everyday.</em></>}
        aside={
          <>
            <p className="lead">From woven mats and strong twine to household essentials and industrial materials. Explore what we make.</p>
            <dl className="head-stats">
              <div><dt>{products.length}</dt><dd>Products</dd></div>
              <div><dt>{productCategories.length}</dt><dd>Categories</dd></div>
            </dl>
          </>
        }
      />
      <section className="section section--white">
        <div className="container">
          <ProductRange products={products} categories={productCategories} />
          <aside className="catalogue">
            <span className="catalogue__icon"><Icon name="file" size={28} /></span>
            <div>
              <div className="eyebrow">The full picture</div>
              <h2 className="title-md">Our range. At your fingertips.</h2>
              <p className="muted">Explore our products in the Rumbu catalogue (PDF).</p>
            </div>
            <a href="/rumbu-product-catalogue.pdf" download className="btn">Download catalogue <Icon name="download" size={18} /></a>
          </aside>
        </div>
      </section>
      <ContactCTA title={<>Let’s find the <em>right product</em> for you.</>} />
    </>
  );
}
