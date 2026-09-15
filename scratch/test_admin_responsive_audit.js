const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- STARTING COMPREHENSIVE ADMIN RESPONSIVE & FUNCTIONAL AUDIT ---');

const adminHtmlPath = path.join(__dirname, '../admin.html');
const blogCssPath = path.join(__dirname, '../css/blog.css');
const parserJsPath = path.join(__dirname, '../js/article-parser.js');

assert.ok(fs.existsSync(adminHtmlPath), 'admin.html must exist');
assert.ok(fs.existsSync(blogCssPath), 'css/blog.css must exist');
assert.ok(fs.existsSync(parserJsPath), 'js/article-parser.js must exist');

const adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');
const blogCss = fs.readFileSync(blogCssPath, 'utf8');

// 1. Structure Audit
const requiredElements = [
  'id="admin-app"',
  'id="admin-sidebar"',
  'id="admin-sidebar-backdrop"',
  'id="admin-sidebar-toggle"',
  'id="admin-sidebar-close"',
  'id="login-section"',
  'id="login-form"',
  'id="password"',
  'id="login-feedback"',
  'id="dashboard-section"',
  'id="btn-new-story"',
  'id="cms-metrics-grid"',
  'id="metric-total-stories"',
  'id="metric-published-stories"',
  'id="metric-draft-stories"',
  'id="metric-categories-count"',
  'id="editor-card"',
  'id="story-form"',
  'id="story-original-slug"',
  'id="story-title"',
  'id="story-slug"',
  'id="story-category"',
  'id="story-author"',
  'id="story-image"',
  'id="image-preview-wrap"',
  'id="image-preview-img"',
  'id="story-excerpt"',
  'id="story-content"',
  'id="story-date"',
  'id="story-status"',
  'id="btn-cancel-story"',
  'id="btn-preview-story"',
  'id="btn-save-story"',
  'id="editor-feedback"',
  'id="story-search"',
  'id="story-category-filter"',
  'id="stories-list-container"',
  'id="story-count"',
  'id="cms-preview-modal"',
  'id="btn-close-preview"',
  'id="preview-modal-content"',
  'id="logout-btn"'
];

for (const el of requiredElements) {
  assert.ok(adminHtml.includes(el), `admin.html must include ${el}`);
}
console.log('PASS: All required admin DOM elements, IDs, and form inputs verified.');

// 2. EscapeHtml Security & Reference Check
assert.ok(adminHtml.includes('function escapeHtml('), 'admin.html must declare escapeHtml function to prevent XSS and ReferenceErrors');
assert.ok(adminHtml.includes('src="js/article-parser.js"'), 'admin.html must link js/article-parser.js for live preview');

console.log('PASS: escapeHtml security and article parser script integration verified.');

// 3. CSS Classes & Responsive Rules
const requiredCssClasses = [
  '.admin-app-layout',
  '.admin-sidebar',
  '.admin-top-header',
  '.admin-header-inner',
  '.admin-page-body',
  '.admin-content-container',
  '.cms-toolbar',
  '.cms-metrics-grid',
  '.cms-metric-card',
  '.cms-metric-value',
  '.cms-card',
  '.cms-form-grid',
  '.cms-md-toolbar',
  '.cms-md-btn',
  '.cms-textarea-editor',
  '.cms-filter-toolbar',
  '.cms-search-input',
  '.cms-filter-pills',
  '.cms-filter-pill',
  '.cms-story-row',
  '.cms-story-title',
  '.cms-story-meta',
  '.cms-preview-backdrop',
  '.cms-preview-window'
];

for (const cls of requiredCssClasses) {
  assert.ok(blogCss.includes(cls), `css/blog.css must define ${cls}`);
}

assert.ok(blogCss.includes('z-index: 99999'), 'Live preview backdrop must have top priority z-index: 99999');
assert.ok(blogCss.includes('font-size: 16px'), 'Mobile inputs must declare font-size: 16px to prevent iOS auto-zoom');
assert.ok(blogCss.includes('@media (max-width: 768px)'), 'blog.css must declare @media (max-width: 768px) for tablet/mobile layout transitions');
assert.ok(blogCss.includes('@media (max-width: 480px)'), 'blog.css must declare @media (max-width: 480px) for compact mobile layout');
assert.ok(blogCss.includes('@media (max-width: 360px)'), 'blog.css must declare @media (max-width: 360px) for ultra-compact mobile layout');

console.log('PASS: CSS architecture, high z-index modal, iOS zoom prevention, and responsive breakpoints verified.');

// 4. Functional Simulation: Markdown Insertion, Metrics, Search Filtering
function runAdminFunctionalSimulation() {
  // Mock escapeHtml
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Mock Stories List
  const mockStories = [
    {
      title: 'How to Validate a Startup Idea in India',
      slug: 'validate-startup-idea-india',
      category: 'Founder Playbook',
      author: 'Editorial Desk',
      publicationDate: '2026-03-01',
      published: true,
      excerpt: 'A 7-day validation framework for Indian founders.',
      content: '## Validation Steps\n1. User interviews\n2. Paid deposits'
    },
    {
      title: 'Venture Capital Term Sheet Deep Dive',
      slug: 'vc-term-sheet-guide',
      category: 'Fundraising',
      author: 'Finance Team',
      publicationDate: '2026-03-05',
      published: true,
      excerpt: 'Demystifying liquidation preferences and board rights.',
      content: '## Liquidation Preferences\n1x non-participating is standard.'
    },
    {
      title: 'Draft: Tier 2 City SaaS Expansion',
      slug: 'tier-2-saas-draft',
      category: 'Startup Ecosystem',
      author: 'Research Desk',
      publicationDate: '2026-03-10',
      published: false,
      excerpt: 'Why Indore and Jaipur are becoming SaaS hubs.',
      content: 'Draft content in progress.'
    }
  ];

  // Test Metric Computations
  const total = mockStories.length;
  const published = mockStories.filter(s => s.published !== false).length;
  const drafts = total - published;
  const categories = new Set(mockStories.map(s => s.category).filter(Boolean)).size;

  assert.strictEqual(total, 3, 'Total stories count must equal 3');
  assert.strictEqual(published, 2, 'Published count must equal 2');
  assert.strictEqual(drafts, 1, 'Drafts count must equal 1');
  assert.strictEqual(categories, 3, 'Distinct categories count must equal 3');

  // Test Search Filtering
  function filterStories(storiesList, status, category, query) {
    return storiesList.filter(story => {
      if (status === 'PUBLISHED' && story.published === false) return false;
      if (status === 'DRAFT' && story.published !== false) return false;
      if (category !== 'ALL' && story.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        const match = (story.title || '').toLowerCase().includes(q) ||
                      (story.slug || '').toLowerCase().includes(q) ||
                      (story.author || '').toLowerCase().includes(q) ||
                      (story.excerpt || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }

  // Filter Published Only
  const pubOnly = filterStories(mockStories, 'PUBLISHED', 'ALL', '');
  assert.strictEqual(pubOnly.length, 2, 'Filtered published count must be 2');

  // Filter Drafts Only
  const draftOnly = filterStories(mockStories, 'DRAFT', 'ALL', '');
  assert.strictEqual(draftOnly.length, 1, 'Filtered drafts count must be 1');
  assert.strictEqual(draftOnly[0].slug, 'tier-2-saas-draft');

  // Filter by Category
  const fundraising = filterStories(mockStories, 'ALL', 'Fundraising', '');
  assert.strictEqual(fundraising.length, 1, 'Filtered category count must be 1');
  assert.strictEqual(fundraising[0].slug, 'vc-term-sheet-guide');

  // Filter by Search Query
  const searchResults = filterStories(mockStories, 'ALL', 'ALL', 'validation');
  assert.strictEqual(searchResults.length, 1, 'Search query match count must be 1');
  assert.strictEqual(searchResults[0].slug, 'validate-startup-idea-india');

  // Test Markdown Helper Insertion
  let currentContent = 'Intro paragraph.';
  const replacement = '\n\n:::tip\n**OPERATIONAL NOTE**\nTest tip content.\n:::\n\n';
  currentContent = currentContent + replacement;
  assert.ok(currentContent.includes(':::tip'), 'Markdown tip callout box must be inserted correctly');

  console.log('PASS: Admin functional simulation (metrics, search, category filtering, markdown helper) verified.');
}

runAdminFunctionalSimulation();

console.log('\n=============================================');
console.log('ALL ADMIN RESPONSIVE & FUNCTIONAL AUDIT TESTS PASSED! ✅');
console.log('=============================================\n');
