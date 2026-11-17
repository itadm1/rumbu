'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import Icon from './Icon';

const ALL = 'All products';

export default function ProductRange({ products, categories }) {
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = products.filter(
    (p) => (category === ALL || p.category === category) && `${p.name} ${p.desc} ${p.category}`.toLowerCase().includes(q)
  );
  const reset = () => { setQuery(''); setCategory(ALL); };

  return (
    <>
      <div className="range-toolbar">
        <div className="range-tabs" role="group" aria-label="Filter by product category">
          {[ALL, ...categories].map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c}>
              {c}
              <span>{c === ALL ? products.length : products.filter((p) => p.category === c).length}</span>
            </button>
          ))}
        </div>
        <label className="search-field range-search">
          <span className="sr-only">Find a product</span>
          <Icon name="search" size={18} />
          <input className="field-control" type="search" placeholder="Find a product" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      <p className="range-count" role="status">
        {filtered.length} product{filtered.length === 1 ? '' : 's'}{category !== ALL ? ` in ${category.toLowerCase()}` : ' in our range'}{q ? ` matching “${query.trim()}”` : ''}
      </p>
      {filtered.length > 0 ? (
        <div className="grid-3 product-grid">
          {filtered.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="search" size={30} />
          <h3>No products found</h3>
          <p>Try another name, or browse the full product range.</p>
          <button type="button" className="btn btn-sm" onClick={reset}>Show all products</button>
        </div>
      )}
    </>
  );
}
