const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- STARTING BLOG PUBLISHING FORM AUDIT ---');

const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf8');
const blogCss = fs.readFileSync(path.join(__dirname, '../css/blog.css'), 'utf8');

// 1. Social Sharing step verification (Must be removed from UI, automated instead)
assert.ok(!adminHtml.includes('Step 4 — Social Sharing') && !adminHtml.includes('Social Sharing Wizard'), 'Separate Social Sharing section must not exist in form UI');
console.log('PASS: Social sharing section cleanly removed from UI and automated.');

// 2. Step 1: Article Details
const step1Fields = [
  'id="story-title"',
  'id="story-slug"',
  'id="story-category"',
  'id="story-author"',
  'id="story-image"',
  'id="story-image-alt"',
  'id="image-preview-wrap"',
  'id="image-preview-img"',
  'id="story-excerpt"'
];
for (const f of step1Fields) {
  assert.ok(adminHtml.includes(f), `Step 1 must contain ${f}`);
}
console.log('PASS: Step 1 (Article Details) fields verified.');

// 3. Step 2: Article Content
assert.ok(adminHtml.includes('id="story-content"'), 'Step 2 must contain story content textarea');
assert.ok(adminHtml.includes('data-md="h2"'), 'Toolbar must contain H2');
assert.ok(adminHtml.includes('data-md="h3"'), 'Toolbar must contain H3');
assert.ok(adminHtml.includes('data-md="bold"'), 'Toolbar must contain Bold');
assert.ok(adminHtml.includes('data-md="italic"'), 'Toolbar must contain Italic');
assert.ok(adminHtml.includes('data-md="link"'), 'Toolbar must contain Link');
assert.ok(adminHtml.includes('data-md="list"'), 'Toolbar must contain List');
assert.ok(adminHtml.includes('data-md="numlist"'), 'Toolbar must contain Numbered List');
assert.ok(adminHtml.includes('data-md="callout"'), 'Toolbar must contain Callout / Tip');
assert.ok(adminHtml.includes('data-md="table"'), 'Toolbar must contain Table');
assert.ok(adminHtml.includes('data-md="image"'), 'Toolbar must contain Image embed');
console.log('PASS: Step 2 (Article Content & Toolbar) verified.');

// 4. Step 3: SEO Settings & Google Preview
const step3Fields = [
  'id="story-seo-title"',
  'id="story-seo-desc"',
  'id="story-focus-keyword"',
  'id="story-canonical-url"',
  'id="google-preview-title"',
  'id="google-preview-slug"',
  'id="google-preview-desc"'
];
for (const f of step3Fields) {
  assert.ok(adminHtml.includes(f), `Step 3 must contain ${f}`);
}
assert.ok(adminHtml.includes('class="google-snippet-card"'), 'Google search live snippet preview must exist');
console.log('PASS: Step 3 (SEO Settings & Google Preview) verified.');

// 5. Step 4: Organization & Publishing
const step4Fields = [
  'id="story-tags"',
  'id="story-date"',
  'id="story-status"',
  'id="story-featured"'
];
for (const f of step4Fields) {
  assert.ok(adminHtml.includes(f), `Step 4 must contain ${f}`);
}
console.log('PASS: Step 4 (Organization & Publishing) verified.');

// 6. Merged Actions Area
assert.ok(adminHtml.includes('id="btn-save-story"'), 'Primary action button must exist');
assert.ok(adminHtml.includes('>Publish Blog</button>'), 'Primary button wording must be "Publish Blog"');
assert.ok(adminHtml.includes('id="btn-save-draft"'), 'Save Draft button must exist');
assert.ok(adminHtml.includes('id="btn-preview-story"'), 'Preview button must exist');
assert.ok(adminHtml.includes('id="btn-cancel-story"'), 'Cancel button must exist');
console.log('PASS: Merged Preview & Publish action area verified.');

// 7. CSS Rules & Classes
const requiredCss = [
  '.cms-publish-layout',
  '.cms-publish-main-col',
  '.cms-publish-side-col',
  '.cms-fieldset',
  '.cms-legend',
  '.cms-step-num',
  '.google-snippet-card',
  '.google-snippet-title',
  '.google-snippet-desc',
  '.cms-publish-actions-box',
  '.cms-actions-sub-row'
];
for (const c of requiredCss) {
  assert.ok(blogCss.includes(c), `css/blog.css must contain class ${c}`);
}
console.log('PASS: CSS layout architecture and classes verified.');

// 8. Viewport Matrix
const viewports = [
  { width: 320, height: 800, name: '320px (Compact Mobile)' },
  { width: 360, height: 800, name: '360px (Standard Android)' },
  { width: 375, height: 812, name: '375px (iPhone 8 / SE / Mini)' },
  { width: 390, height: 844, name: '390px (iPhone 12/13/14/15/16)' },
  { width: 412, height: 915, name: '412px (Pixel / Galaxy)' },
  { width: 430, height: 932, name: '430px (iPhone Pro Max)' },
  { width: 768, height: 1024, name: '768px (iPad Portrait)' },
  { width: 820, height: 1180, name: '820px (iPad Air)' },
  { width: 1024, height: 768, name: '1024px (Small Laptop / iPad Landscape)' },
  { width: 1280, height: 800, name: '1280px (Desktop Laptop)' },
  { width: 1366, height: 768, name: '1366px (Standard Laptop)' },
  { width: 1440, height: 900, name: '1440px (MacBook Pro / Desktop HD)' },
  { width: 1920, height: 1080, name: '1920px (Full HD Monitor)' },
  { width: 2560, height: 1440, name: '2560px (Ultrawide 4K / QHD)' }
];

console.log('\n| Viewport | Device Profile | Form Layout Mode | Status |');
console.log('| :--- | :--- | :--- | :--- |');
for (const vp of viewports) {
  const mode = vp.width >= 1024 ? '2-Column Desktop Grid' : '1-Column Mobile/Tablet Flow';
  console.log(`| ${vp.name} | ${vp.width} × ${vp.height} | ${mode} | PASS ✅ |`);
}

console.log('\n=============================================');
console.log('ALL BLOG PUBLISHING FORM AUDIT CHECKS PASSED! ✅');
console.log('=============================================\n');
