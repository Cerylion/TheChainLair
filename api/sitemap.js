import { SitemapStream } from 'sitemap';
import { Readable } from 'stream';

export default async function handler(req, res) {
  const links = [
    { url: '/',  changefreq: 'weekly', priority: 1.0 },
    { url: '/gallery', changefreq: 'weekly', priority: 0.8 },
    // ...
  ];

  const stream = new SitemapStream({ hostname: 'https://thechainlair.com' });
  res.setHeader('Content-Type', 'application/xml');
  Readable.from(links).pipe(stream).pipe(res);
}