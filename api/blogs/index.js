const { readBlogs, createBlog, slugify, publicBlog, getSession } = require('../_lib/blogs');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const owner = getSession(req);

  if (req.method === 'GET') {
    try {
      const blogs = await readBlogs(Boolean(owner));
      const visible = owner ? blogs : blogs.filter(b => b.published !== false);
      return res.status(200).json(visible.map(b => publicBlog(b, Boolean(owner))));
    } catch (err) {
      console.error('Error fetching blogs:', err);
      return res.status(500).json({ error: err.message || 'Failed to fetch blogs.' });
    }
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

    try {
      const existing = await readBlogs(true);
      if (existing.some(item => item.slug === nextSlug)) {
        return res.status(409).json({ error: 'That slug is already in use.' });
      }

      const nextBlog = await createBlog({
        title: String(body.title).trim(),
        slug: nextSlug,
        featuredImage: String(body.featuredImage || '').trim(),
        category: String(body.category || 'Founder Playbook').trim(),
        excerpt: String(body.excerpt).trim(),
        content: String(body.content).trim(),
        author: String(body.author || 'BharatLaunch Editorial').trim(),
        publicationDate: body.publicationDate || new Date().toISOString().slice(0, 10),
        published: Boolean(body.published)
      });

      return res.status(201).json(publicBlog(nextBlog, true));
    } catch (err) {
      console.error('Error creating blog:', err);
      return res.status(500).json({ error: err.message || 'Failed to create blog.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
};
