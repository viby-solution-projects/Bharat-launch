const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ADMIN_PASSWORD = process.env.BHARATLAUNCH_ADMIN_PASSWORD || 'bharatlaunch2026';
const AUTH_SECRET = process.env.BHARATLAUNCH_AUTH_SECRET || ADMIN_PASSWORD || 'bharatlaunch_secret_key_2026';

const BLOGS_FILE = path.join(process.cwd(), 'data', 'blogs.json');
const TMP_BLOGS_FILE = path.join('/tmp', 'blogs.json');

// In-memory cache for container lifecycle
let inMemoryBlogs = null;

const DEFAULT_BLOGS = [
  {
    id: "blog-ecosystem-2026",
    title: "India's Startup Ecosystem: What Founders Should Know in 2026",
    slug: "indias-startup-ecosystem-what-founders-should-know-in-2026",
    featuredImage: "assets/blog-ecosystem.jpg",
    category: "Startup Ecosystem",
    excerpt: "A deep dive into structural shifts, Tier-2/3 expansion, sustainable unit economics, and new market opportunities across Bharat.",
    content: "## A New Chapter in India's Innovation Economy\n\nIndia's startup landscape has evolved beyond raw user acquisition and hyper-growth cycles. In 2026, the ecosystem is driven by resilient business models, deep technological capabilities, and founders building solutions tailored for India's unique socio-economic fabric.\n\nFrom Tier-2 and Tier-3 manufacturing corridors to metropolitan deeptech labs, capital is rewarding execution discipline, clear unit economics, and long-term customer value.\n\n## Key Structural Shifts Shaping 2026\n\n### 1. Sovereign AI and Indic Language Technologies\nIndian enterprises and consumers require models built for linguistic diversity and cultural context. Startups building localized LLMs, voice interfaces, and domain-specific AI workflows are unlocking unprecedented enterprise adoption.\n\n### 2. Distributed Innovation Beyond Tier-1 Metros\nCities like Jaipur, Indore, Coimbatore, and Surat are emerging as powerhouse clusters. Founders from these regions benefit from lower burn rates, high operational focus, and intimate knowledge of vernacular consumer needs.\n\n### 3. SpaceTech and DeepTech Commercialization\nWith active policy support from IN-SPACe and ISRO, private aerospace, geospatial intelligence, and satellite communications companies are securing global commercial contracts.\n\n## Actionable Takeaways for Founders\n\n- **Focus on gross margin durability:** Build pricing power through workflow integration rather than discount-driven volume.\n- **Design for regional accessibility:** Multi-lingual support and low-bandwidth resilience are core product features, not afterthoughts.\n- **Leverage digital public infrastructure:** UPI, ONDC, and India Stack provide unmatched leverage for scalable distribution.",
    publicationDate: "2026-09-08",
    published: true,
    createdAt: "2026-09-08T09:00:00.000Z"
  },
  {
    "id": "blog-prepare-funding",
    "title": "How Early-Stage Startups Can Prepare for Funding",
    "slug": "how-early-stage-startups-can-prepare-for-funding",
    "featuredImage": "assets/blog-funding.jpg",
    "category": "Fundraising",
    "excerpt": "A practical guide to metrics, investor diligence, pitch narratives, and term-sheet negotiation for seed and Series A founders.",
    "content": "## Preparing Before You Pitch\n\nFundraising is an amplification mechanism, not a validation milestone. Before opening a funding round, founders must build clarity around their fundamental unit economics, market size, and customer retention dynamics.\n\nInstitutional investors in today's environment look for strong evidence of product-market fit and capital efficiency rather than vague top-line vanity metrics.\n\n## Core Pillars of Investor Readiness\n\n### 1. Clean Financial & Operational Data Rooms\nEnsure your cap table, corporate registrations, customer contracts, and IP assignments are documented and accessible. Early-stage diligence friction often kills deal momentum.\n\n### 2. High-Signal Metrics That Matter\n- **Cohort Retention:** Prove that your customers stick around and increase their usage or spend over time.\n- **Customer Acquisition Cost (CAC) vs. Lifetime Value (LTV):** Demonstrate a repeatable distribution channel with healthy payback periods (ideally < 12 months for B2B).\n- **Burn Multiple:** Measure how much net burn is required to generate each net new dollar of ARR.\n\n### 3. Crafting a Compelling Narrative\nExplain why this problem matters now, why your team has unfair insight to solve it, and how $1M-$5M in fresh capital fundamentally unlocks the next 18 months of distribution inflection.",
    "publicationDate": "2026-09-02",
    "published": true,
    "createdAt": "2026-09-02T09:00:00.000Z"
  },
  {
    "id": "blog-idea-to-market",
    "title": "Building a Startup in India: From Idea to Market",
    "slug": "building-a-startup-in-india-from-idea-to-market",
    "featuredImage": "assets/blog-ideatomarket.jpg",
    "category": "Founder Playbook",
    "excerpt": "Step-by-step framework on identifying painful problems, building the first MVP, finding initial customer evangelists, and scaling distribution.",
    "content": "## Starting with High-Consequence Problems\n\nA great startup begins with a problem people are already paying time, stress, or money to solve with makeshift workarounds. Before writing a single line of production code, founders should run structured customer discovery interviews.\n\n## The Discovery to Launch Framework\n\n### Step 1: Customer Discovery Without Solution Bias\nAsk open-ended questions about how users currently complete the workflow, what breaks, and who signs off on the budget. If users are not actively looking for a better way, education costs will consume your runway.\n\n### Step 2: The Minimal Viable Workflow\nBuild the smallest functional prototype that delivers the primary value proposition. Often, a combination of simple forms, no-code integrations, or manual concierge execution is sufficient to validate willingness to pay.\n\n### Step 3: Finding Your First 10 Evangelists\nAvoid broad ad spending. Get your first cohort through direct outreach, founder-led sales, community engagement, and hyper-targeted pilots. Measure referral rates and unsolicited organic recommendations.\n\n### Step 4: Iterative Feedback Loops\nSet up weekly sprint cycles focused on customer onboarding friction points. Fast iteration on user feedback builds customer loyalty faster than any marketing campaign.",
    "publicationDate": "2026-08-25",
    "published": true,
    "createdAt": "2026-08-25T09:00:00.000Z"
  }
];

function readBlogs() {
  if (inMemoryBlogs) {
    return inMemoryBlogs;
  }

  // Check /tmp first (writes in current serverless execution container)
  if (fs.existsSync(TMP_BLOGS_FILE)) {
    try {
      inMemoryBlogs = JSON.parse(fs.readFileSync(TMP_BLOGS_FILE, 'utf8'));
      if (Array.isArray(inMemoryBlogs) && inMemoryBlogs.length > 0) {
        return inMemoryBlogs;
      }
    } catch (e) {}
  }

  // Fallback to bundled data/blogs.json
  try {
    const raw = fs.readFileSync(BLOGS_FILE, 'utf8');
    inMemoryBlogs = JSON.parse(raw);
    if (Array.isArray(inMemoryBlogs) && inMemoryBlogs.length > 0) {
      return inMemoryBlogs;
    }
  } catch (error) {}

  inMemoryBlogs = DEFAULT_BLOGS;
  return inMemoryBlogs;
}

function writeBlogs(blogs) {
  inMemoryBlogs = blogs;
  try {
    fs.mkdirSync(path.dirname(BLOGS_FILE), { recursive: true });
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2) + '\n');
  } catch (e) {
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

// Stateless signed tokens for serverless execution
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
  // Client handles clearing cookie with Max-Age=0
}

function getSession(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('bharatlaunch_session='));
  if (!match) return null;
  const token = match.split('=')[1];
  return verifyToken(token);
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
