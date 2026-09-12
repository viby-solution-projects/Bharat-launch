const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ADMIN_PASSWORD = process.env.BHARATLAUNCH_ADMIN_PASSWORD || 'bharatlaunch2026';
const BLOGS_FILE = path.join(process.cwd(), 'data', 'blogs.json');
const TMP_BLOGS_FILE = path.join('/tmp', 'blogs.json');

// In-memory cache for serverless lifecycle
let inMemoryBlogs = null;
const sessions = new Map();

function readBlogs() {
  if (inMemoryBlogs) {
    return inMemoryBlogs;
  }

  // Try reading from /tmp first if it exists (written in current serverless container)
  if (fs.existsSync(TMP_BLOGS_FILE)) {
    try {
      inMemoryBlogs = JSON.parse(fs.readFileSync(TMP_BLOGS_FILE, 'utf8'));
      return inMemoryBlogs;
    } catch (e) {}
  }

  // Fallback to bundled data/blogs.json
  try {
    const raw = fs.readFileSync(BLOGS_FILE, 'utf8');
    inMemoryBlogs = JSON.parse(raw);
    return inMemoryBlogs;
  } catch (error) {
    // Fallback default blogs if file read fails
    inMemoryBlogs = [
      {
        id: "blog-ecosystem-2026",
        title: "India's Startup Ecosystem: What Founders Should Know in 2026",
        slug: "indias-startup-ecosystem-what-founders-should-know-in-2026",
        featuredImage: "assets/blog-ecosystem.jpg",
        category: "Startup Ecosystem",
        excerpt: "A deep dive into structural shifts, Tier-2/3 expansion, sustainable unit economics, and new market opportunities across Bharat.",
        publicationDate: "2026-09-08",
        published: true
      },
      {
        id: "blog-prepare-funding",
        title: "How Early-Stage Startups Can Prepare for Funding",
        slug: "how-early-stage-startups-can-prepare-for-funding",
        featuredImage: "assets/blog-funding.jpg",
        category: "Fundraising",
        excerpt: "A practical guide to metrics, investor diligence, pitch narratives, and term-sheet negotiation for seed and Series A founders.",
        publicationDate: "2026-09-02",
        published: true
      },
      {
        id: "blog-idea-to-market",
        title: "Building a Startup in India: From Idea to Market",
        slug: "building-a-startup-in-india-from-idea-to-market",
        featuredImage: "assets/blog-ideatomarket.jpg",
        category: "Founder Playbook",
        excerpt: "Step-by-step framework on identifying painful problems, building the first MVP, finding initial customer evangelists, and scaling distribution.",
        publicationDate: "2026-08-25",
        published: true
      }
    ];
    return inMemoryBlogs;
  }
}

function writeBlogs(blogs) {
  inMemoryBlogs = blogs;
  try {
    fs.mkdirSync(path.dirname(BLOGS_FILE), { recursive: true });
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2) + '\n');
  } catch (e) {
    // In serverless read-only filesystem, write to /tmp
    try {
      fs.writeFileSync(TMP_BLOGS_FILE, JSON.stringify(blogs, null, 2) + '\n');
    } catch (err) {}
  }
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

function getSession(req) {
  const cookie = req.headers.cookie || '';
  const token = cookie.split(';').map(item => item.trim()).find(item => item.startsWith('bharatlaunch_session='));
  return token ? sessions.get(token.split('=')[1]) : null;
}

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { role: 'owner', createdAt: Date.now() });
  return token;
}

function destroySession(req) {
  const cookie = req.headers.cookie || '';
  const token = cookie.split(';').map(item => item.trim()).find(item => item.startsWith('bharatlaunch_session='));
  if (token) sessions.delete(token.split('=')[1]);
}

function sendJson(res, status, payload, headers = {}) {
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  res.status(status).json(payload);
}

module.exports = {
  ADMIN_PASSWORD,
  readBlogs,
  writeBlogs,
  slugify,
  publicBlog,
  getSession,
  createSession,
  destroySession,
  sendJson
};
