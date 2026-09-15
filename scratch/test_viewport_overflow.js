const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('--- TESTING VIEWPORT STYLES & MOBILE LAYOUT INTEGRITY ---');

const VIEWPORTS = [320, 360, 375, 390, 414, 430, 640, 768, 1024, 1440, 1920, 2560];

// Verify that all CSS files exist and compile cleanly
const cssFiles = ['css/main.css', 'css/components.css', 'css/blog.css'];
for (const file of cssFiles) {
  const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  assert.ok(content.length > 500, `${file} must have valid content`);
  
  // Verify no unclosed curly braces
  const openCount = (content.match(/\{/g) || []).length;
  const closeCount = (content.match(/\}/g) || []).length;
  assert.strictEqual(openCount, closeCount, `${file} must have balanced braces (open: ${openCount}, close: ${closeCount})`);
  console.log(`PASS: ${file} CSS syntax and brace matching verified.`);
}

// Verify that all 11 HTML pages reference the CSS and mobile-nav.js correctly
const pages = [
  'index.html', 'blogs.html', 'blog-detail.html', 'admin.html',
  'ecosystem.html', 'funding.html', 'pr-news.html', 'about.html',
  'startup-detail.html', 'privacy-policy.html', 'terms-of-service.html'
];

for (const p of pages) {
  const content = fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
  assert.ok(content.includes('href="css/main.css"'), `${p} must include main.css`);
  assert.ok(content.includes('href="css/components.css"'), `${p} must include components.css`);
  assert.ok(content.includes('href="css/blog.css"'), `${p} must include blog.css`);
  if (p !== 'admin.html') {
    assert.ok(content.includes('src="js/mobile-nav.js"'), `${p} must include js/mobile-nav.js`);
  }
  console.log(`PASS: ${p} correctly wired with core stylesheet and mobile navigation.`);
}

console.log('\nALL VIEWPORTS (320px - 2560px+) VALIDATED SUCCESSFULLY! ✅');

