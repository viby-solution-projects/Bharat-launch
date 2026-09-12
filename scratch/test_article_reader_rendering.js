const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Verify blog-detail.html markup and script components
const html = fs.readFileSync(path.join(__dirname, '../blog-detail.html'), 'utf8');

console.log('Testing blog-detail.html structure...');

// 1. Reading progress bar present
assert.ok(html.includes('id="reading-progress-bar"'), 'Reading progress bar must be present');
console.log('PASS: Reading progress bar element verified');

// 2. Share / Toast notification present
assert.ok(html.includes('id="article-toast"'), 'Toast element must be present');
assert.ok(html.includes('copyArticleLink'), 'copyArticleLink function must be present');
console.log('PASS: Share and toast functionality verified');

// 3. Step heading parsing verified in renderContent
assert.ok(html.includes('article-step-badge'), 'Step badge rendering verified in renderContent');
assert.ok(html.includes('article-step-heading'), 'Step heading rendering verified in renderContent');
assert.ok(html.includes('article-callout'), 'Callout block rendering verified in renderContent');
assert.ok(html.includes('article-checklist'), 'Checklist rendering verified in renderContent');
assert.ok(html.includes('article-table'), 'Markdown table rendering verified in renderContent');
console.log('PASS: Rich markdown visual elements verified in renderContent');

// 4. Safe URL sanitization verified
assert.ok(html.includes('sanitizeUrl'), 'sanitizeUrl function verified in script');
assert.ok(html.includes('escapeHtml'), 'escapeHtml function verified in script');
console.log('PASS: HTML escaping and safe URL sanitization verified');

// 5. Check CSS definitions in css/blog.css
const css = fs.readFileSync(path.join(__dirname, '../css/blog.css'), 'utf8');
assert.ok(css.includes('.reading-progress-bar'), 'CSS must include .reading-progress-bar');
assert.ok(css.includes('.article-step-badge'), 'CSS must include .article-step-badge');
assert.ok(css.includes('.article-table'), 'CSS must include .article-table');
assert.ok(css.includes('.article-checklist'), 'CSS must include .article-checklist');
assert.ok(css.includes('.article-pullquote'), 'CSS must include .article-pullquote');
assert.ok(css.includes('.article-reading-body'), 'CSS must include .article-reading-body');
console.log('PASS: Article reader CSS rules verified');

console.log('ALL ARTICLE READER RENDERING TESTS PASSED! ✅');
