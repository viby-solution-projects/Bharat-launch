const { readBlogs, writeBlogs, slugify, publicBlog, getSession } = require('../_lib/blogs');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug } = req.query;
  const blogs = readBlogs();
  const owner = getSession(req);

  if (req.method === 'GET') {
    const visible = owner ? blogs : blogs.filter(b => b.published !== false);
    const blog = visible.find(item => item.slug === slug);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' });
    }
    return res.status(200).json(publicBlog(blog, Boolean(owner)));
  }

  if (!owner) {
    return res.status(401).json({ error: 'Owner authentication required.' });
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    const existing = blogs.find(item => item.slug === slug);
    if (!existing) {
      return res.status(404).json({ error: 'Blog not found.' });
    }

    const nextSlug = slugify(body.slug || body.title || existing.slug);
    if (!nextSlug || !body.title || !body.excerpt || !body.content) {
      return res.status(400).json({ error: 'Title, slug, excerpt, and content are required.' });
    }
    if (blogs.some(item => item.slug === nextSlug && item !== existing)) {
      return res.status(409).json({ error: 'That slug is already in use.' });
    }

    const nextBlog = {
      id: existing.id,
      title: String(body.title).trim(),
      slug: nextSlug,
      featuredImage: String(body.featuredImage || '').trim(),
      category: String(body.category || existing.category || 'Founder Playbook').trim(),
      excerpt: String(body.excerpt).trim(),
      content: String(body.content).trim(),
      publicationDate: body.publicationDate || existing.publicationDate || new Date().toISOString().slice(0, 10),
      published: Boolean(body.published),
      createdAt: existing.createdAt || new Date().toISOString()
    };

    const updated = blogs.map(item => item === existing ? nextBlog : item);
    writeBlogs(updated);
    return res.status(200).json(publicBlog(nextBlog, true));
  }

  if (req.method === 'DELETE') {
    const remaining = blogs.filter(item => item.slug !== slug);
    if (remaining.length === blogs.length) {
      return res.status(404).json({ error: 'Blog not found.' });
    }
    writeBlogs(remaining);
    return res.status(200).json({ deleted: true });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
};
