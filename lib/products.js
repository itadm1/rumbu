import fs from 'fs';
import path from 'path';
import { products } from './data';

// Server only. Adds `hasImage` so a product whose photograph has not been
// supplied yet shows a labelled placeholder instead of a broken image. Drop
// the file into /public at the path named in lib/data.js and it appears.
export function getProducts() {
  return products.map((p, index) => ({
    ...p,
    index,
    hasImage: Boolean(p.img) && fs.existsSync(path.join(process.cwd(), 'public', p.img)),
  }));
}

export function getProduct(slug) {
  return getProducts().find((p) => p.slug === slug) || null;
}
