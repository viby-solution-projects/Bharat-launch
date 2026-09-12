const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('--- STARTING COMPREHENSIVE MOBILE & RESPONSIVE AUDIT ---');

const HTML_FILES = [
  'index.html',
  'blogs.html',
  'blog-detail.html',
  'admin.html',
  'ecosystem.html',
  'funding.html',
  'pr-news.html',
  'about.html',
  'startup-detail.html',
  'privacy-policy.html',
  'terms-of-service.html'
];

// 1. Audit all HTML Pages
for (const file of HTML_FILES) {
  const filePath = path.join(__dirname, '..', file);
  assert.ok(fs.existsSync(filePath), `File ${file} must exist`);
  const html = fs.readFileSync(filePath, 'utf8');

  // Viewport Meta Tag
  assert.ok(
    html.includes('<meta name="viewport"') && html.includes('width=device-width, initial-scale=1.0'),
    `${file} must have correct responsive viewport meta tag`
  );

  // Mobile Nav for Public Pages
  if (file !== 'admin.html') {
    assert.ok(html.includes('id="mobile-menu-toggle"'), `${file} must contain #mobile-menu-toggle button`);
    assert.ok(html.includes('id="mobile-drawer"'), `${file} must contain #mobile-drawer`);
    assert.ok(html.includes('id="mobile-drawer-backdrop"'), `${file} must contain #mobile-drawer-backdrop`);
    assert.ok(html.includes('src="js/mobile-nav.js"'), `${file} must include js/mobile-nav.js script`);
  }

  // Check for broken fixed desktop widths in inline styles (> 320px without max-width)
  const wideFixedMatches = html.match(/style="[^"]*(?<!max-)width:\s*(?:[4-9]\d{2,}|[1-9]\d{3,})px[^"]*"/g);
  assert.strictEqual(wideFixedMatches, null, `${file} should not have hardcoded inline width > 320px without max-width constraint`);

  console.log(`PASS: ${file} responsive markup & navigation verified.`);
}

// 2. Audit css/main.css
const mainCss = fs.readFileSync(path.join(__dirname, '../css/main.css'), 'utf8');
assert.ok(mainCss.includes('overflow-x: hidden'), 'main.css must contain overflow-x: hidden on html/body');
assert.ok(mainCss.includes('max-width: 100%'), 'main.css must contain max-width: 100%');
assert.ok(mainCss.includes('overflow-wrap: anywhere'), 'main.css must contain overflow-wrap: anywhere for text wrapping');
assert.ok(mainCss.includes('min-height: 44px') || mainCss.includes('min-height: 40px'), 'main.css must specify touch-friendly button targets');
console.log('PASS: css/main.css responsive foundations verified.');

// 3. Audit css/components.css
const compCss = fs.readFileSync(path.join(__dirname, '../css/components.css'), 'utf8');
assert.ok(compCss.includes('.mobile-menu-btn'), 'components.css must define .mobile-menu-btn');
assert.ok(compCss.includes('.mobile-drawer'), 'components.css must define .mobile-drawer');
assert.ok(compCss.includes('overflow-x: auto'), 'components.css must contain overflow-x: auto for table containers');
assert.ok(compCss.includes('@media (max-width: 600px)'), 'components.css must define 600px mobile breakpoint');
console.log('PASS: css/components.css mobile components verified.');

// 4. Audit css/blog.css
const blogCss = fs.readFileSync(path.join(__dirname, '../css/blog.css'), 'utf8');
assert.ok(blogCss.includes('@media (max-width: 768px)'), 'blog.css must define 768px breakpoint');
assert.ok(blogCss.includes('@media (max-width: 640px)'), 'blog.css must define 640px breakpoint');
assert.ok(blogCss.includes('@media (max-width: 360px)'), 'blog.css must define 360px small mobile breakpoint');
assert.ok(blogCss.includes('.cms-form-grid'), 'blog.css must define .cms-form-grid');
console.log('PASS: css/blog.css editorial and CMS responsiveness verified.');

// 5. Audit universal mobile navigation script
const navJs = fs.readFileSync(path.join(__dirname, '../js/mobile-nav.js'), 'utf8');
assert.ok(navJs.includes('mobile-menu-toggle'), 'mobile-nav.js must handle toggle');
assert.ok(navJs.includes('mobile-drawer-backdrop'), 'mobile-nav.js must handle backdrop');
assert.ok(navJs.includes('Escape'), 'mobile-nav.js must handle Escape key');
console.log('PASS: js/mobile-nav.js navigation controller verified.');

console.log('\nALL 11 PAGES & CSS RESPONSIVE AUDIT CHECKS PASSED! ✅');
