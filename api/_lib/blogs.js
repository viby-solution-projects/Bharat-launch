const crypto = require('crypto');

// Server-side Environment Configuration
const ADMIN_PASSWORD = process.env.BHARATLAUNCH_ADMIN_PASSWORD || 'bharatlaunch2026';
const AUTH_SECRET = process.env.BHARATLAUNCH_AUTH_SECRET || ADMIN_PASSWORD || 'bharatlaunch_secret_key_2026';

// Supabase Server-side Environment Variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

// Convert Supabase snake_case columns to application camelCase
function fromDbRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    featuredImage: row.featured_image || 'assets/blog-ecosystem.jpg',
    category: row.category || 'Founder Playbook',
    excerpt: row.excerpt || '',
    content: row.content || '',
    author: row.author || 'BharatLaunch Editorial',
    publicationDate: row.publication_date || (row.created_at ? row.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)),
    published: Boolean(row.published),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

// Convert application camelCase to Supabase snake_case columns
function toDbRecord(blog) {
  return {
    slug: blog.slug,
    title: blog.title,
    featured_image: blog.featuredImage || 'assets/blog-ecosystem.jpg',
    category: blog.category || 'Founder Playbook',
    excerpt: blog.excerpt || '',
    content: blog.content || '',
    author: blog.author || 'BharatLaunch Editorial',
    publication_date: blog.publicationDate || new Date().toISOString().slice(0, 10),
    published: blog.published !== false
  };
}

// Supabase REST API Client (Server-side native fetch)
async function supabaseRequest(endpoint, options = {}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SECRET_KEY in your environment.');
  }

  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer || 'return=representation',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${errorText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await response.json();
  }
  return null;
}

// --------------------------------------------------------------------------
// Public & Protected Database Operations (Supabase Permanent Source of Truth)
// --------------------------------------------------------------------------

async function readBlogs(isOwner = false) {
  if (!isSupabaseConfigured()) {
    console.warn('[Database Warning]: Supabase environment variables not configured. Returning empty stories list.');
    return [];
  }

  const query = isOwner
    ? 'blogs?select=*&order=publication_date.desc,created_at.desc'
    : 'blogs?select=*&published=eq.true&order=publication_date.desc,created_at.desc';

  const rows = await supabaseRequest(query);
  if (Array.isArray(rows)) {
    return rows.map(fromDbRecord);
  }
  return [];
}

async function readBlogBySlug(slug, isOwner = false) {
  if (!isSupabaseConfigured() || !slug) {
    return null;
  }

  const query = isOwner
    ? `blogs?slug=eq.${encodeURIComponent(slug)}&select=*`
    : `blogs?slug=eq.${encodeURIComponent(slug)}&published=eq.true&select=*`;

  const rows = await supabaseRequest(query);
  if (Array.isArray(rows) && rows.length > 0) {
    return fromDbRecord(rows[0]);
  }
  return null;
}

async function createBlog(blogData) {
  if (!isSupabaseConfigured()) {
    throw new Error('Cannot create blog: Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SECRET_KEY.');
  }

  const record = toDbRecord(blogData);
  const rows = await supabaseRequest('blogs', {
    method: 'POST',
    body: record,
    prefer: 'return=representation'
  });

  if (Array.isArray(rows) && rows.length > 0) {
    return fromDbRecord(rows[0]);
  }
  throw new Error('Failed to insert blog record into Supabase.');
}

async function updateBlog(slug, blogData) {
  if (!isSupabaseConfigured()) {
    throw new Error('Cannot update blog: Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SECRET_KEY.');
  }

  const record = toDbRecord(blogData);
  const rows = await supabaseRequest(`blogs?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    body: record,
    prefer: 'return=representation'
  });

  if (Array.isArray(rows) && rows.length > 0) {
    return fromDbRecord(rows[0]);
  }
  throw new Error('Blog not found or update failed.');
}

async function deleteBlog(slug) {
  if (!isSupabaseConfigured()) {
    throw new Error('Cannot delete blog: Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SECRET_KEY.');
  }

  await supabaseRequest(`blogs?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'DELETE'
  });
  return { deleted: true };
}

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function publicBlog(blog, includeAdminFields = false) {
  if (!blog) return null;
  const { id, title, slug, featuredImage, category, excerpt, content, author, publicationDate } = blog;
  return includeAdminFields
    ? { id, title, slug, featuredImage, category, excerpt, content, author, publicationDate, published: Boolean(blog.published), createdAt: blog.createdAt, updatedAt: blog.updatedAt }
    : { id, title, slug, featuredImage, category, excerpt, content, author, publicationDate };
}

// --------------------------------------------------------------------------
// Stateless HMAC Signed Session Tokens (Server-Side Only)
// --------------------------------------------------------------------------

function signToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function createSession() {
  return signToken({ role: 'owner', exp: Date.now() + 8 * 3600 * 1000 });
}

function destroySession() {
  // Cleared via cookie header Max-Age=0
}

function getSession(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('bharatlaunch_session='));
  if (!match) return null;
  const token = match.split('=')[1];
  return verifyToken(token);
}

function sendJson(res, status, payload, headers = {}) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
    return res.status(status).json(payload);
  }
  res.writeHead(status, { 'Content-Type': 'application/json; charset=UTF-8', ...headers });
  res.end(JSON.stringify(payload));
}

module.exports = {
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
  sendJson,
  isSupabaseConfigured
};
