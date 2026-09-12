const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  ADMIN_PASSWORD,
  readBlogs,
  readBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  slugify,
  publicBlog,
  getSession,
  createSession,
  destroySession,
  sendJson
} = require('./api/_lib/blogs');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function handleApi(req, res, reqUrl) {
  // Authentication Routes
  if (reqUrl === '/api/auth/login' && req.method === 'POST') {
    if (!ADMIN_PASSWORD) return sendJson(res, 503, { error: 'Owner authentication is not configured.' });
    const body = await parseBody(req);
    if (typeof body.password !== 'string' || body.password !== ADMIN_PASSWORD) {
      return sendJson(res, 401, { error: 'Invalid owner password.' });
    }
    const token = createSession();
    return sendJson(res, 200, { authenticated: true }, {
      'Set-Cookie': `bharatlaunch_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`
    });
  }

  if (reqUrl === '/api/auth/logout' && req.method === 'POST') {
    destroySession(req);
    return sendJson(res, 200, { authenticated: false }, {
      'Set-Cookie': 'bharatlaunch_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
    });
  }

  if (reqUrl === '/api/auth/session' && req.method === 'GET') {
    return sendJson(res, 200, { authenticated: Boolean(getSession(req)) });
  }

  // Blog Routes
  const blogMatch = reqUrl.match(/^\/api\/blogs(?:\/([^/]+))?$/);
  if (!blogMatch) return false;

  const slug = blogMatch[1];
  const owner = getSession(req);

  if (req.method === 'GET') {
    if (!slug) {
      const blogs = await readBlogs(Boolean(owner));
      return sendJson(res, 200, blogs.map(b => publicBlog(b, Boolean(owner))));
    }
    const blog = await readBlogBySlug(slug, Boolean(owner));
    return blog ? sendJson(res, 200, publicBlog(blog, Boolean(owner))) : sendJson(res, 404, { error: 'Blog not found.' });
  }

  // Owner mutations
  if (!owner) {
    return sendJson(res, 401, { error: 'Owner authentication required.' });
  }

  if (req.method === 'POST' && !slug) {
    const body = await parseBody(req);
    const nextSlug = slugify(body.slug || body.title);
    if (!nextSlug || !body.title || !body.excerpt || !body.content) {
      return sendJson(res, 400, { error: 'Title, slug, excerpt, and content are required.' });
    }
    try {
      const existing = await readBlogs(true);
      if (existing.some(item => item.slug === nextSlug)) {
        return sendJson(res, 409, { error: 'That slug is already in use.' });
      }
      const created = await createBlog({
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
      return sendJson(res, 201, publicBlog(created, true));
    } catch (err) {
      return sendJson(res, 500, { error: err.message || 'Failed to create blog.' });
    }
  }

  if (req.method === 'PUT' && slug) {
    const body = await parseBody(req);
    const nextSlug = slugify(body.slug || body.title || slug);
    if (!nextSlug || !body.title || !body.excerpt || !body.content) {
      return sendJson(res, 400, { error: 'Title, slug, excerpt, and content are required.' });
    }
    try {
      const updated = await updateBlog(slug, {
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
      return sendJson(res, 200, publicBlog(updated, true));
    } catch (err) {
      return sendJson(res, err.message === 'Blog not found' ? 404 : 500, { error: err.message });
    }
  }

  if (req.method === 'DELETE' && slug) {
    try {
      await deleteBlog(slug);
      return sendJson(res, 200, { deleted: true });
    } catch (err) {
      return sendJson(res, err.message === 'Blog not found' ? 404 : 500, { error: err.message });
    }
  }

  return sendJson(res, 405, { error: 'Method not allowed.' });
}

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];

  if (reqUrl.startsWith('/api/')) {
    handleApi(req, res, reqUrl).catch(err => {
      console.error('API Error:', err);
      sendJson(res, 500, { error: 'Internal Server Error' });
    });
    return;
  }

  if (reqUrl === '/') reqUrl = '/index.html';

  const filePath = path.join(__dirname, reqUrl);
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`BharatLaunch server running at http://localhost:${PORT}`);
});
