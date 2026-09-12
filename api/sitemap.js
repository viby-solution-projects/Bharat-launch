const { readBlogs } = require('./_lib/blogs');

const DOMAIN = 'https://bharat-launch.vercel.app';

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = async (req, res) => {
  try {
    const blogs = await readBlogs(false);
    const publishedBlogs = Array.isArray(blogs) ? blogs.filter(b => b.published !== false) : [];

    const now = new Date().toISOString().slice(0, 10);

    const staticPages = [
      { loc: `${DOMAIN}/`, lastmod: now, changefreq: 'daily', priority: '1.0' },
      { loc: `${DOMAIN}/blogs.html`, lastmod: now, changefreq: 'daily', priority: '0.9' },
      { loc: `${DOMAIN}/ecosystem.html`, lastmod: now, changefreq: 'weekly', priority: '0.8' },
      { loc: `${DOMAIN}/funding.html`, lastmod: now, changefreq: 'weekly', priority: '0.8' },
      { loc: `${DOMAIN}/pr-news.html`, lastmod: now, changefreq: 'weekly', priority: '0.7' },
      { loc: `${DOMAIN}/about.html`, lastmod: now, changefreq: 'monthly', priority: '0.6' }
    ];

    const blogEntries = publishedBlogs.map(blog => {
      const lastmod = blog.updatedAt ? blog.updatedAt.slice(0, 10) : (blog.publicationDate || now);
      return `  <url>
    <loc>${escapeXml(`${DOMAIN}/blog-detail.html?slug=${encodeURIComponent(blog.slug)}`)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    const staticEntries = staticPages.map(page => `  <url>
    <loc>${escapeXml(page.loc)}</loc>
    <lastmod>${escapeXml(page.lastmod)}</lastmod>
    <changefreq>${escapeXml(page.changefreq)}</changefreq>
    <priority>${escapeXml(page.priority)}</priority>
  </url>`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries.join('\n')}
${blogEntries.join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.setHeader('Content-Type', 'text/plain');
    return res.status(500).send('Error generating sitemap.');
  }
};
