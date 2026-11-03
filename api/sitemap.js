const PAGES = [
  ['/', '1.0', 'weekly'],
  ['/prestations/', '0.9', 'monthly'],
  ['/fruits-et-legumes/', '0.8', 'weekly'],
  ['/blog/', '0.7', 'weekly'],
  ['/contact/', '0.8', 'monthly'],
  ['/mentions-legales/', '0.2', 'yearly'],
];

export default function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const today = new Date().toISOString().slice(0, 10);
  const urls = PAGES.map(([p, prio, freq]) =>
    `  <url><loc>https://${host}${p}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`).join('\n');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
}
