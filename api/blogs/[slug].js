const { readBlogBySlug, updateBlog, deleteBlog, slugify, publicBlog, getSession } = require('../_lib/blogs');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug } = req.query;
  if (!slug) {
    return res.status(400).json({ error: 'Slug parameter is required.' });
  }

  const owner = getSession(req);

  if (req.method === 'GET') {
    try {
      const blog = await readBlogBySlug(slug, Boolean(owner));
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found.' });
      }
      return res.status(200).json(publicBlog(blog, Boolean(owner)));
    } catch (err) {
      console.error('Error fetching blog:', err);
      return res.status(500).json({ error: 'Failed to fetch blog.' });
    }
  }

  if (!owner) {
    return res.status(401).json({ error: 'Owner authentication required.' });
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    const nextSlug = slugify(body.slug || body.title || slug);
    if (!nextSlug || !body.title || !body.excerpt || !body.content) {
      return res.status(400).json({ error: 'Title, slug, excerpt, and content are required.' });
    }

    try {
      const updatedBlog = await updateBlog(slug, {
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
      return res.status(200).json(publicBlog(updatedBlog, true));
    } catch (err) {
      console.error('Error updating blog:', err);
      return res.status(err.message === 'Blog not found' ? 404 : 500).json({ error: err.message || 'Failed to update blog.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await deleteBlog(slug);
      return res.status(200).json({ deleted: true });
    } catch (err) {
      console.error('Error deleting blog:', err);
      return res.status(err.message === 'Blog not found' ? 404 : 500).json({ error: err.message || 'Failed to delete blog.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
};
