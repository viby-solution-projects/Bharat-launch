-- ==============================================================================
-- BharatLaunch Blog System — Supabase / PostgreSQL Schema & RLS Migration
-- ==============================================================================

-- 1. Create Blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  featured_image TEXT DEFAULT 'assets/blog-ecosystem.jpg',
  category TEXT NOT NULL DEFAULT 'Founder Playbook',
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'BharatLaunch Editorial',
  publication_date DATE NOT NULL DEFAULT CURRENT_DATE,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance Indices
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published_date ON public.blogs(published, publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);

-- 3. Trigger for Automatic Updated At
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_blogs_updated_at ON public.blogs;
CREATE TRIGGER trigger_set_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 5. Security Policies
-- Policy: Public visitors can only SELECT published blogs
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs"
  ON public.blogs
  FOR SELECT
  USING (published = true);

-- Policy: Service role has full CRUD access (backend operations)
DROP POLICY IF EXISTS "Service role has full CRUD access" ON public.blogs;
CREATE POLICY "Service role has full CRUD access"
  ON public.blogs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. Initial Seed Data (Curated Startup Publication Posts)
INSERT INTO public.blogs (id, slug, title, featured_image, category, excerpt, content, author, publication_date, published, created_at)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'indias-startup-ecosystem-what-founders-should-know-in-2026',
    'India''s Startup Ecosystem: What Founders Should Know in 2026',
    'assets/blog-ecosystem.jpg',
    'Startup Ecosystem',
    'A deep dive into structural shifts, Tier-2/3 expansion, sustainable unit economics, and new market opportunities across Bharat.',
    '## A New Chapter in India''s Innovation Economy

India''s startup landscape has evolved beyond raw user acquisition and hyper-growth cycles. In 2026, the ecosystem is driven by resilient business models, deep technological capabilities, and founders building solutions tailored for India''s unique socio-economic fabric.

From Tier-2 and Tier-3 manufacturing corridors to metropolitan deeptech labs, capital is rewarding execution discipline, clear unit economics, and long-term customer value.

## Key Structural Shifts Shaping 2026

### 1. Sovereign AI and Indic Language Technologies
Indian enterprises and consumers require models built for linguistic diversity and cultural context. Startups building localized LLMs, voice interfaces, and domain-specific AI workflows are unlocking unprecedented enterprise adoption.

### 2. Distributed Innovation Beyond Tier-1 Metros
Cities like Jaipur, Indore, Coimbatore, and Surat are emerging as powerhouse clusters. Founders from these regions benefit from lower burn rates, high operational focus, and intimate knowledge of vernacular consumer needs.

### 3. SpaceTech and DeepTech Commercialization
With active policy support from IN-SPACe and ISRO, private aerospace, geospatial intelligence, and satellite communications companies are securing global commercial contracts.

## Actionable Takeaways for Founders

- **Focus on gross margin durability:** Build pricing power through workflow integration rather than discount-driven volume.
- **Design for regional accessibility:** Multi-lingual support and low-bandwidth resilience are core product features, not afterthoughts.
- **Leverage digital public infrastructure:** UPI, ONDC, and India Stack provide unmatched leverage for scalable distribution.',
    'BharatLaunch Editorial',
    '2026-09-08',
    true,
    '2026-09-08T09:00:00.000Z'
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'how-early-stage-startups-can-prepare-for-funding',
    'How Early-Stage Startups Can Prepare for Funding',
    'assets/blog-funding.jpg',
    'Fundraising',
    'A practical guide to metrics, investor diligence, pitch narratives, and term-sheet negotiation for seed and Series A founders.',
    '## Preparing Before You Pitch

Fundraising is an amplification mechanism, not a validation milestone. Before opening a funding round, founders must build clarity around their fundamental unit economics, market size, and customer retention dynamics.

Institutional investors in today''s environment look for strong evidence of product-market fit and capital efficiency rather than vague top-line vanity metrics.

## Core Pillars of Investor Readiness

### 1. Clean Financial & Operational Data Rooms
Ensure your cap table, corporate registrations, customer contracts, and IP assignments are documented and accessible. Early-stage diligence friction often kills deal momentum.

### 2. High-Signal Metrics That Matter
- **Cohort Retention:** Prove that your customers stick around and increase their usage or spend over time.
- **Customer Acquisition Cost (CAC) vs. Lifetime Value (LTV):** Demonstrate a repeatable distribution channel with healthy payback periods (ideally < 12 months for B2B).
- **Burn Multiple:** Measure how much net burn is required to generate each net new dollar of ARR.

### 3. Crafting a Compelling Narrative
Explain why this problem matters now, why your team has unfair insight to solve it, and how $1M-$5M in fresh capital fundamentally unlocks the next 18 months of distribution inflection.',
    'Venture Insights Desk',
    '2026-09-02',
    true,
    '2026-09-02T09:00:00.000Z'
  ),
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'building-a-startup-in-india-from-idea-to-market',
    'Building a Startup in India: From Idea to Market',
    'assets/blog-ideatomarket.jpg',
    'Founder Playbook',
    'Step-by-step framework on identifying painful problems, building the first MVP, finding initial customer evangelists, and scaling distribution.',
    '## Starting with High-Consequence Problems

A great startup begins with a problem people are already paying time, stress, or money to solve with makeshift workarounds. Before writing a single line of production code, founders should run structured customer discovery interviews.

## The Discovery to Launch Framework

### Step 1: Customer Discovery Without Solution Bias
Ask open-ended questions about how users currently complete the workflow, what breaks, and who signs off on the budget. If users are not actively looking for a better way, education costs will consume your runway.

### Step 2: The Minimal Viable Workflow
Build the smallest functional prototype that delivers the primary value proposition. Often, a combination of simple forms, no-code integrations, or manual concierge execution is sufficient to validate willingness to pay.

### Step 3: Finding Your First 10 Evangelists
Avoid broad ad spending. Get your first cohort through direct outreach, founder-led sales, community engagement, and hyper-targeted pilots. Measure referral rates and unsolicited organic recommendations.

### Step 4: Iterative Feedback Loops
Set up weekly sprint cycles focused on customer onboarding friction points. Fast iteration on user feedback builds customer loyalty faster than any marketing campaign.',
    'Founder Operations Desk',
    '2026-08-25',
    true,
    '2026-08-25T09:00:00.000Z'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  featured_image = EXCLUDED.featured_image,
  category = EXCLUDED.category,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  publication_date = EXCLUDED.publication_date,
  published = EXCLUDED.published,
  updated_at = NOW();
