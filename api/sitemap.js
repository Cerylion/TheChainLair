import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import products from '../src/data/works.js';

const productLinks = products.map(p => ({
  url: `/product/${p.id}`,
  changefreq: 'monthly',
  priority: 0.7,
}));

export default async function handler(req, res) {
  const links = [
    { url: '/',  changefreq: 'weekly', priority: 1.0 },
    { url: '/gallery', changefreq: 'weekly', priority: 0.8 },
    { url: '/contact', changefreq: 'yearly', priority: 0.8 },
    { url: '/about', changefreq: 'yearly', priority: 0.8 },
    ...productLinks
  ];

  res.setHeader('Content-Type', 'application/xml');

  const stream = new SitemapStream({ hostname: 'https://thechainlair.com' });
  const xml = await streamToPromise(Readable.from(links).pipe(stream));
  res.status(200).end(xml.toString());

}