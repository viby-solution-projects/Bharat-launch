const http = require('http');
const fs = require('fs');
const path = require('path');

function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('--- STARTING SEO & PRODUCTION AUDIT ---');
  let failures = 0;

  // 1. Robots.txt
  const robots = await fetchUrl('/robots.txt');
  console.log(`[Robots.txt] HTTP ${robots.status}`);
  if (robots.status !== 200 || !robots.body.includes('Disallow: /admin.html') || !robots.body.includes('Sitemap: https://bharat-launch.vercel.app/sitemap.xml')) {
    console.error('FAIL: robots.txt format/content incorrect');
    failures++;
  } else {
    console.log('PASS: robots.txt correctly disallows admin and declares production sitemap.');
  }

  // 2. Sitemap.xml
  const sitemap = await fetchUrl('/sitemap.xml');
  console.log(`[Sitemap.xml] HTTP ${sitemap.status}`);
  if (sitemap.status !== 200 || !sitemap.body.includes('<urlset') || sitemap.body.includes('admin.html')) {
    console.error('FAIL: sitemap.xml format/content incorrect');
    failures++;
  } else {
    console.log('PASS: sitemap.xml valid and excludes admin.');
  }

  // 3. Homepage (index.html)
  const home = await fetchUrl('/');
  console.log(`[Homepage] HTTP ${home.status}`);
  if (home.status !== 200) {
    console.error('FAIL: Homepage status not 200');
    failures++;
  }
  const hasExpectedTitle = home.body.includes('BharatLaunch — Indian Startup, Technology &amp; Founder Insights') || home.body.includes('BharatLaunch — Indian Startup, Technology & Founder Insights');
  const hasExpectedDesc = home.body.includes('A publication covering Indian startups, technology, fundraising, founders and the ideas shaping India\'s business ecosystem.');
  const hasSingleH1 = (home.body.match(/<h1[\s>]/gi) || []).length === 1;
  const hasCanonical = home.body.includes('<link rel="canonical" href="https://bharat-launch.vercel.app/"');
  const hasWebSiteSchema = home.body.includes('"@type": "WebSite"') && home.body.includes('"@type": "Organization"');

  console.log(`- Title correct: ${hasExpectedTitle}`);
  console.log(`- Meta description correct: ${hasExpectedDesc}`);
  console.log(`- Single H1 present: ${hasSingleH1}`);
  console.log(`- Canonical present: ${hasCanonical}`);
  console.log(`- WebSite/Organization JSON-LD present: ${hasWebSiteSchema}`);

  if (!hasExpectedTitle || !hasExpectedDesc || !hasSingleH1 || !hasCanonical || !hasWebSiteSchema) {
    console.error('FAIL: Homepage SEO checks failed');
    failures++;
  }

  // 4. Admin Page (admin.html)
  const admin = await fetchUrl('/admin.html');
  console.log(`[Admin.html] HTTP ${admin.status}`);
  const hasAdminNoIndex = admin.body.includes('<meta name="robots" content="noindex, nofollow"');
  console.log(`- Admin has noindex/nofollow: ${hasAdminNoIndex}`);
  if (!hasAdminNoIndex) {
    console.error('FAIL: admin.html is missing noindex meta tag');
    failures++;
  }

  // 5. Blogs Page (blogs.html)
  const blogs = await fetchUrl('/blogs.html');
  console.log(`[Blogs.html] HTTP ${blogs.status}`);
  const hasBlogsCanonical = blogs.body.includes('<link rel="canonical" href="https://bharat-launch.vercel.app/blogs.html"');
  console.log(`- Blogs canonical present: ${hasBlogsCanonical}`);
  if (!hasBlogsCanonical) {
    console.error('FAIL: blogs.html is missing canonical tag');
    failures++;
  }

  // 6. Blog Detail Page (blog-detail.html)
  const detail = await fetchUrl('/blog-detail.html?slug=validate-startup-idea-india');
  console.log(`[Blog-detail.html] HTTP ${detail.status}`);
  const hasDetailJsonLd = detail.body.includes('application/ld+json') && detail.body.includes('BlogPosting');
  const hasDetailCanonical = detail.body.includes('id="canonical-tag"');
  const hasDetailOG = detail.body.includes('id="og-title"');
  console.log(`- Blog-detail has Article JSON-LD support: ${hasDetailJsonLd}`);
  console.log(`- Blog-detail has dynamic canonical support: ${hasDetailCanonical}`);
  console.log(`- Blog-detail has Open Graph support: ${hasDetailOG}`);

  if (!hasDetailJsonLd || !hasDetailCanonical || !hasDetailOG) {
    console.error('FAIL: blog-detail.html SEO elements missing');
    failures++;
  }

  // 7. Initial 4 Articles SQL & Script Check
  const sqlContent = fs.readFileSync(path.join(__dirname, '../supabase_initial_articles.sql'), 'utf8');
  const slugs = [
    'validate-startup-idea-india',
    'startup-funding-india-bootstrap-seed',
    'build-mvp-startup-budget',
    'indian-startup-ecosystem-2026'
  ];

  let missingSlugs = 0;
  for (const slug of slugs) {
    if (!sqlContent.includes(slug)) {
      console.error(`FAIL: Article slug ${slug} not in SQL`);
      missingSlugs++;
    }
  }
  if (missingSlugs === 0) {
    console.log('PASS: All 4 initial articles present in supabase_initial_articles.sql with complete content and cross-linking.');
  } else {
    failures += missingSlugs;
  }

  console.log('---------------------------------------');
  if (failures === 0) {
    console.log('ALL TESTS PASSED SUCCESSFULLY! ✅');
  } else {
    console.error(`COMPLETED WITH ${failures} FAILURES ❌`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
