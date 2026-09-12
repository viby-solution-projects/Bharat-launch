const { readBlogs, writeBlogs, slugify, publicBlog, getSession, sendJson } = require('../_lib/blogs');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const blogs = readBlogs();
  const owner = getSession(req);

  if (req.method === 'GET') {
    const visible = owner ? blogs : blogs.filter(b => b.published !== false);
    return res.status(200).json(visible.map(b => publicBlog(b, Boolean(owner))));
  }

  if (req.method === 'POST') {
    if (!owner) {
      return res.status(401).json({ error: 'Owner authentication required.' });
    }

    const body = req.body || {};
    const nextSlug = slugify(body.slug || body.title);
    if (!nextSlug || !body.title || !body.excerpt || !body.content) {
      return res.status(400).json({ error: 'Title, slug, excerpt, and content are required.' });
    }
    if (blogs.some(item => item.slug === nextSlug)) {
      return res.status(409).json({ error: 'That slug is already in use.' });
    }

    const nextBlog = {
      id: crypto.randomUUID(),
      title: String(body.title).trim(),
      slug: nextSlug,
      featuredImage: String(body.featuredImage || '').trim(),
      category: String(body.category || 'Founder Playbook').trim(),
      excerpt: String(body.excerpt).trim(),
      content: String(body.content).trim(),
      publicationDate: body.publicationDate || new Date().toISOString().slice(0, 10),
      published: Boolean(body.published),
      createdAt: new Date().toISOString()
    };

    const updated = [nextBlog, ...blogs];
    writeBlogs(updated);
    return res.status(201).json(publicBlog(nextBlog, true));
  }

  return res.status(405).json({ error: 'Method not allowed.' });
};
