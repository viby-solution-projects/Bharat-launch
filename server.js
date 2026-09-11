const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;
const BLOGS_FILE = path.join(__dirname, 'data', 'blogs.json');
const ADMIN_PASSWORD = process.env.BHARATLAUNCH_ADMIN_PASSWORD;
const sessions = new Map();
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function readBlogs() {
  try {
    return JSON.parse(fs.readFileSync(BLOGS_FILE, 'utf8'));
  } catch (error) {
    return [];
  }
}

function writeBlogs(blogs) {
  fs.mkdirSync(path.dirname(BLOGS_FILE), { recursive: true });
  fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2) + '\n');
}

function sendJson(res, status, payload, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=UTF-8', ...headers });
  res.end(JSON.stringify(payload));
}

function getSession(req) {
  const cookie = req.headers.cookie || '';
  const token = cookie.split(';').map(item => item.trim()).find(item => item.startsWith('bharatlaunch_session='));
  return token ? sessions.get(token.split('=')[1]) : null;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (error) { reject(error); }
    });
    req.on('error', reject);
  });
}

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function publicBlog(blog, includeAdminFields = false) {
  const { id, title, slug, featuredImage, category, excerpt, content, publicationDate } = blog;
  return includeAdminFields
    ? { id, title, slug, featuredImage, category, excerpt, content, publicationDate, published: Boolean(blog.published), createdAt: blog.createdAt }
    : { id, title, slug, featuredImage, category, excerpt, content, publicationDate };
}

async function handleApi(req, res, reqUrl) {
  if (reqUrl === '/api/auth/login' && req.method === 'POST') {
    if (!ADMIN_PASSWORD) return sendJson(res, 503, { error: 'Owner authentication is not configured.' });
    const body = await parseBody(req);
    if (typeof body.password !== 'string' || body.password !== ADMIN_PASSWORD) {
      return sendJson(res, 401, { error: 'Invalid owner password.' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { role: 'owner', createdAt: Date.now() });
    return sendJson(res, 200, { authenticated: true }, { 'Set-Cookie': `bharatlaunch_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800` });
  }

  if (reqUrl === '/api/auth/logout' && req.method === 'POST') {
    const cookie = req.headers.cookie || '';
    const token = cookie.split(';').map(item => item.trim()).find(item => item.startsWith('bharatlaunch_session='));
    if (token) sessions.delete(token.split('=')[1]);
    return sendJson(res, 200, { authenticated: false }, { 'Set-Cookie': 'bharatlaunch_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' });
  }

  if (reqUrl === '/api/auth/session' && req.method === 'GET') {
    return sendJson(res, 200, { authenticated: Boolean(getSession(req)) });
  }

  const blogMatch = reqUrl.match(/^\/api\/blogs(?:\/([^/]+))?$/);
  if (!blogMatch) return false;
  const slug = blogMatch[1];
  const blogs = readBlogs();
  const owner = getSession(req);

  if (req.method === 'GET') {
    const visible = owner ? blogs : blogs.filter(blog => blog.published);
    if (!slug) return sendJson(res, 200, visible.map(blog => publicBlog(blog, Boolean(owner))));
    const blog = visible.find(item => item.slug === slug);
    return blog ? sendJson(res, 200, publicBlog(blog)) : sendJson(res, 404, { error: 'Blog not found.' });
  }

  if (!owner) return sendJson(res, 401, { error: 'Owner authentication required.' });
  if (req.method === 'POST' || req.method === 'PUT') {
    const body = await parseBody(req);
    const existing = slug ? blogs.find(item => item.slug === slug) : null;
    const nextSlug = slugify(body.slug || body.title);
    if (!nextSlug || !body.title || !body.excerpt || !body.content) return sendJson(res, 400, { error: 'Title, slug, excerpt, and content are required.' });
    if (blogs.some(item => item.slug === nextSlug && item !== existing)) return sendJson(res, 409, { error: 'That slug is already in use.' });
    const nextBlog = {
      id: existing ? existing.id : crypto.randomUUID(),
      title: String(body.title).trim(), slug: nextSlug, featuredImage: String(body.featuredImage || '').trim(),
      category: String(body.category || 'Founder Notes').trim(), excerpt: String(body.excerpt).trim(),
      content: String(body.content).trim(), publicationDate: body.publicationDate || new Date().toISOString().slice(0, 10),
      published: Boolean(body.published), createdAt: existing ? existing.createdAt : new Date().toISOString()
    };
    const updated = existing ? blogs.map(item => item === existing ? nextBlog : item) : [nextBlog, ...blogs];
    writeBlogs(updated);
    return sendJson(res, existing ? 200 : 201, publicBlog(nextBlog, true));
  }

  if (req.method === 'DELETE') {
    const remaining = blogs.filter(item => item.slug !== slug);
    if (remaining.length === blogs.length) return sendJson(res, 404, { error: 'Blog not found.' });
    writeBlogs(remaining);
    return sendJson(res, 200, { deleted: true });
  }
  return sendJson(res, 405, { error: 'Method not allowed.' });
}

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl.startsWith('/api/')) {
    handleApi(req, res, reqUrl).catch(() => sendJson(res, 400, { error: 'Invalid request.' }));
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
