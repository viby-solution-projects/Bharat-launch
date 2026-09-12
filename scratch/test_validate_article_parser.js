const assert = require('assert');
const fs = require('fs');
const path = require('path');

const parser = require('../js/article-parser');
const { INITIAL_ARTICLES } = require('../scripts/insert_initial_articles');

const validateArticle = INITIAL_ARTICLES.find(a => a.slug === 'validate-startup-idea-india');
assert.ok(validateArticle, 'Article validate-startup-idea-india must exist in INITIAL_ARTICLES');

console.log('Testing parseMarkdownArticle on "validate-startup-idea-india" content...');
const html = parser.parseMarkdownArticle(validateArticle.content);

console.log('\n--- PARSED OUTPUT PREVIEW (First 500 chars) ---');
console.log(html.slice(0, 500));
console.log('-----------------------------------------------\n');

// 1. Verify Step Badges & Headings
assert.ok(html.includes('<div class="article-step-badge">STEP 01</div>'), 'Must contain STEP 01 badge');
assert.ok(html.includes('<h2 class="article-step-title">Pinpoint the Specific Pain Point</h2>'), 'Must contain Step 1 title');
assert.ok(html.includes('<div class="article-step-badge">STEP 02</div>'), 'Must contain STEP 02 badge');
assert.ok(html.includes('<div class="article-step-badge">STEP 05</div>'), 'Must contain STEP 05 badge');
assert.ok(html.includes('<div class="article-step-badge">FINAL TAKEAWAY</div>'), 'Must contain FINAL TAKEAWAY badge');
console.log('PASS: Step badges & numbered headings parsed correctly.');

// 2. Verify Bold and Italic
assert.ok(html.includes('<strong>Who is the precise customer?</strong>'), 'Bold text must be converted to <strong>');
assert.ok(html.includes('<strong>status quo inertia</strong>'), 'Inline bold must be converted to <strong>');
assert.ok(html.includes('<em>&quot;Would you buy software that automates your inventory?&quot;</em>'), 'Italic text must be converted to <em>');
console.log('PASS: Bold and italic typography converted correctly.');

// 3. Verify Lists (Unordered and Ordered)
assert.ok(html.includes('<ul class="article-bullet-list">'), 'Bullet list must be rendered with .article-bullet-list');
assert.ok(html.includes('<ol class="article-ordered-list">'), 'Ordered numbered list must be rendered with .article-ordered-list');
console.log('PASS: Bullet and numbered lists converted correctly.');

// 4. Verify Callout / Tip Block
assert.ok(html.includes('<div class="article-callout article-callout-tip">'), 'Callout TIP box must be rendered');
assert.ok(html.includes('<span>TIP</span>'), 'Callout TIP label must be rendered');
console.log('PASS: Tip callout box converted correctly.');

// 5. Verify Table
assert.ok(html.includes('<div class="article-table-wrap">'), 'Table wrap must be rendered');
assert.ok(html.includes('<table class="article-table">'), 'Table must be rendered');
assert.ok(html.includes('<th>Day</th>'), 'Table header must be rendered');
assert.ok(html.includes('<td><strong>Day 1</strong></td>'), 'Table cell must be rendered with bold');
console.log('PASS: 7-Day validation table converted correctly.');

// 6. Verify Links
assert.ok(html.includes('<a href="blog-detail.html?slug=build-mvp-startup-budget" class="article-link">'), 'Markdown links must be converted to <a class="article-link">');
assert.ok(html.includes('<a href="blog-detail.html?slug=startup-funding-india-bootstrap-seed" class="article-link">'), 'Cross links must be converted');
console.log('PASS: Markdown links converted correctly.');

// 7. Verify Dividers
assert.ok(html.includes('<div class="article-divider-wrap"><span class="article-divider-ornament">✦ ✦ ✦</span></div>'), 'Dividers must be rendered as editorial ornaments');
console.log('PASS: Dividers converted correctly.');

// 8. Verify No Raw Markdown Left in Paragraphs
assert.ok(!html.includes('## Step 1'), 'No raw ## headings should remain in HTML');
assert.ok(!html.includes('**Who is'), 'No raw ** markdown should remain in HTML');
assert.ok(!html.includes('> [!TIP]'), 'No raw > blockquote syntax should remain in HTML');
console.log('PASS: Clean HTML output with zero leftover raw markdown tokens.');

console.log('\nALL VALIDATION ARTICLE PARSER TESTS PASSED! ✅');
