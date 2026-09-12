-- ==============================================================================
-- BharatLaunch Blog System — Supabase / PostgreSQL Schema & RLS Migration
-- Production Clean Schema (Zero Initial Seed Posts)
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
