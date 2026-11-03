import { readData } from './_store.js';

export default async function handler(req, res) {
  const fresh = req.query && req.query.fresh;
  res.setHeader('Cache-Control', fresh ? 'no-store' : 'public, s-maxage=30, stale-while-revalidate=300');
  try {
    res.status(200).json(await readData());
  } catch {
    res.status(200).json({ posts: [], hidden: [], produits: null });
  }
}
