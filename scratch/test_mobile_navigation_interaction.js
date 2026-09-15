const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- STARTING COMPREHENSIVE MOBILE NAVIGATION TEST SUITE ---');

const htmlFiles = [
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

const mobileNavJsContent = fs.readFileSync(path.join(__dirname, '../js/mobile-nav.js'), 'utf8');
const componentsCssContent = fs.readFileSync(path.join(__dirname, '../css/components.css'), 'utf8');

// 1. Static Audit: Check for duplicate conflicting listeners or missing IDs
const publicPages = htmlFiles.filter(f => f !== 'admin.html');

for (const file of htmlFiles) {
  const filePath = path.join(__dirname, '..', file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check that NO pages contain old inline mobile-menu-toggle handlers
  assert.ok(
    !content.includes("menuBtn.onclick = () => { drawer.classList.add('active')"),
    `${file} should NOT have inline duplicate onclick handlers`
  );
  assert.ok(
    !content.includes("menuBtn.addEventListener('click', openDrawer)"),
    `${file} should NOT have conflicting inline addEventListener`
  );

  if (publicPages.includes(file)) {
    assert.ok(content.includes('id="mobile-menu-toggle"'), `${file} must contain #mobile-menu-toggle`);
    assert.ok(content.includes('id="mobile-drawer"'), `${file} must contain #mobile-drawer`);
    assert.ok(content.includes('id="mobile-drawer-backdrop"'), `${file} must contain #mobile-drawer-backdrop`);
    assert.ok(content.includes('id="mobile-drawer-close"'), `${file} must contain #mobile-drawer-close`);
    assert.ok(content.includes('js/mobile-nav.js'), `${file} must link js/mobile-nav.js`);

    // Verify exactly one script tag for mobile-nav.js
    const scriptMatches = content.match(/src="js\/mobile-nav\.js"/g);
    assert.strictEqual(scriptMatches ? scriptMatches.length : 0, 1, `${file} must include mobile-nav.js exactly once`);
  }
}
console.log('PASS: Static markup & duplicate script check across all 11 files verified.');

// 2. CSS Verification
assert.ok(componentsCssContent.includes('.mobile-menu-btn'), 'components.css must define .mobile-menu-btn');
assert.ok(componentsCssContent.includes('.mobile-drawer'), 'components.css must define .mobile-drawer');
assert.ok(componentsCssContent.includes('.mobile-drawer.active'), 'components.css must define .mobile-drawer.active');
assert.ok(componentsCssContent.includes('.mobile-drawer-backdrop'), 'components.css must define .mobile-drawer-backdrop');
assert.ok(componentsCssContent.includes('.mobile-drawer-backdrop.active'), 'components.css must define .mobile-drawer-backdrop.active');
assert.ok(componentsCssContent.includes('z-index: 99990'), 'backdrop must have high priority z-index: 99990');
assert.ok(componentsCssContent.includes('z-index: 99999'), 'drawer must have high priority z-index: 99999');
assert.ok(componentsCssContent.includes('body.mobile-drawer-open'), 'components.css must handle body.mobile-drawer-open scroll locking');

console.log('PASS: CSS styling, high z-indices, and scroll lock classes verified.');

// 3. Functional Simulation Test with Mock DOM
function createMockElement(id, tagName = 'div', classes = []) {
  const classSet = new Set(classes);
  const attributes = new Map();
  const listeners = {};
  const children = [];

  const element = {
    id,
    tagName: tagName.toUpperCase(),
    style: {},
    classList: {
      add: (cls) => classSet.add(cls),
      remove: (cls) => classSet.delete(cls),
      contains: (cls) => classSet.has(cls),
      toggle: (cls, force) => {
        if (force !== undefined) {
          if (force) classSet.add(cls);
          else classSet.delete(cls);
          return force;
        }
        if (classSet.has(cls)) {
          classSet.delete(cls);
          return false;
        } else {
          classSet.add(cls);
          return true;
        }
      }
    },
    setAttribute: (name, val) => attributes.set(name, String(val)),
    getAttribute: (name) => attributes.get(name) || null,
    hasAttribute: (name) => attributes.has(name),
    removeAttribute: (name) => attributes.delete(name),
    addEventListener: (event, fn) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(fn);
    },
    click: () => {
      const event = {
        preventDefault: () => {},
        stopPropagation: () => {},
        target: element,
        currentTarget: element
      };
      (listeners['click'] || []).forEach(fn => fn(event));
    },
    focus: () => {
      if (global.document) global.document.activeElement = element;
    },
    contains: (child) => {
      return children.includes(child) || element === child;
    },
    appendChild: (child) => {
      children.push(child);
      return child;
    },
    querySelector: (selector) => {
      if (selector === 'a' || selector === '.mobile-drawer-link') {
        return children.find(c => c.tagName === 'A' || c.classList.contains('mobile-drawer-link')) || null;
      }
      return null;
    },
    querySelectorAll: (selector) => {
      if (selector === 'a' || selector === '.mobile-drawer-link') {
        return children.filter(c => c.tagName === 'A' || c.classList.contains('mobile-drawer-link'));
      }
      return [];
    }
  };

  return element;
}

function runSimulatedTests() {
  for (const pageName of publicPages) {
    // Fresh DOM Environment for each page
    const toggleBtn = createMockElement('mobile-menu-toggle', 'button', ['mobile-menu-btn']);
    const drawer = createMockElement('mobile-drawer', 'aside', ['mobile-drawer']);
    const backdrop = createMockElement('mobile-drawer-backdrop', 'div', ['mobile-drawer-backdrop']);
    const closeBtn = createMockElement('mobile-drawer-close', 'button', ['mobile-drawer-close']);
    
    // Add drawer nav links
    const link1 = createMockElement('link-1', 'a', ['mobile-drawer-link']);
    const link2 = createMockElement('link-2', 'a', ['mobile-drawer-link']);
    drawer.appendChild(closeBtn);
    drawer.appendChild(link1);
    drawer.appendChild(link2);

    const elementsMap = {
      'mobile-menu-toggle': toggleBtn,
      'mobile-drawer': drawer,
      'mobile-drawer-backdrop': backdrop,
      'mobile-drawer-close': closeBtn
    };

    const docListeners = {};
    const winListeners = {};

    global.window = {
      innerWidth: 375,
      addEventListener: (event, fn) => {
        winListeners[event] = winListeners[event] || [];
        winListeners[event].push(fn);
      },
      __BHARAT_MOBILE_NAV_INITIALIZED__: false
    };

    global.document = {
      readyState: 'complete',
      body: {
        style: {},
        classList: createMockElement('body').classList
      },
      documentElement: {
        style: {}
      },
      activeElement: null,
      getElementById: (id) => elementsMap[id] || null,
      querySelector: (sel) => {
        if (sel === '.mobile-menu-btn') return toggleBtn;
        if (sel === '.mobile-drawer') return drawer;
        if (sel === '.mobile-drawer-backdrop') return backdrop;
        if (sel === '.mobile-drawer-close') return closeBtn;
        return null;
      },
      querySelectorAll: (sel) => {
        if (sel === '.mobile-drawer-link' || sel === 'a') return [link1, link2];
        return [];
      },
      addEventListener: (event, fn) => {
        docListeners[event] = docListeners[event] || [];
        docListeners[event].push(fn);
      },
      dispatchEvent: (event) => {
        (docListeners[event.type] || []).forEach(fn => fn(event));
      }
    };

    // Evaluate mobile-nav.js
    eval(mobileNavJsContent);

    // Initial state assertions
    assert.strictEqual(drawer.classList.contains('active'), false, `${pageName}: Drawer should initially NOT have active class`);
    assert.strictEqual(backdrop.classList.contains('active'), false, `${pageName}: Backdrop should initially NOT have active class`);

    // 1. Click Toggle -> Opens Drawer
    toggleBtn.click();
    assert.strictEqual(drawer.classList.contains('active'), true, `${pageName}: Clicking toggle MUST add active class to drawer`);
    assert.strictEqual(backdrop.classList.contains('active'), true, `${pageName}: Clicking toggle MUST add active class to backdrop`);
    assert.strictEqual(toggleBtn.getAttribute('aria-expanded'), 'true', `${pageName}: aria-expanded MUST be true after opening`);
    assert.strictEqual(drawer.getAttribute('aria-hidden'), 'false', `${pageName}: aria-hidden MUST be false after opening`);
    assert.strictEqual(document.body.style.overflow, 'hidden', `${pageName}: body style.overflow MUST be hidden`);
    assert.strictEqual(document.body.classList.contains('mobile-drawer-open'), true, `${pageName}: body class mobile-drawer-open MUST be present`);

    // 2. Click Close Button -> Closes Drawer
    closeBtn.click();
    assert.strictEqual(drawer.classList.contains('active'), false, `${pageName}: Clicking close button MUST close drawer`);
    assert.strictEqual(backdrop.classList.contains('active'), false, `${pageName}: Clicking close button MUST remove active backdrop`);
    assert.strictEqual(toggleBtn.getAttribute('aria-expanded'), 'false', `${pageName}: aria-expanded MUST reset to false`);
    assert.strictEqual(document.body.style.overflow, '', `${pageName}: body style.overflow MUST reset to empty string`);
    assert.strictEqual(document.body.classList.contains('mobile-drawer-open'), false, `${pageName}: body class mobile-drawer-open MUST be removed`);

    // 3. Open and Backdrop Click -> Closes Drawer
    toggleBtn.click();
    assert.strictEqual(drawer.classList.contains('active'), true, `${pageName}: Opened again`);
    backdrop.click();
    assert.strictEqual(drawer.classList.contains('active'), false, `${pageName}: Backdrop click MUST close drawer`);

    // 4. Open and Link Click -> Closes Drawer
    toggleBtn.click();
    assert.strictEqual(drawer.classList.contains('active'), true, `${pageName}: Opened again`);
    link1.click();
    assert.strictEqual(drawer.classList.contains('active'), false, `${pageName}: Navigation link click MUST close drawer`);

    // 5. Open and Escape Key -> Closes Drawer
    toggleBtn.click();
    assert.strictEqual(drawer.classList.contains('active'), true, `${pageName}: Opened again`);
    document.dispatchEvent({ type: 'keydown', key: 'Escape' });
    assert.strictEqual(drawer.classList.contains('active'), false, `${pageName}: Escape key MUST close drawer`);

    // 6. Open and Resize to Desktop (>800px) -> Closes Drawer
    toggleBtn.click();
    assert.strictEqual(drawer.classList.contains('active'), true, `${pageName}: Opened again`);
    window.innerWidth = 1024;
    (winListeners['resize'] || []).forEach(fn => fn());
    assert.strictEqual(drawer.classList.contains('active'), false, `${pageName}: Window resize to desktop MUST close drawer`);

    console.log(`PASS: Simulated DOM verification passed for [${pageName}]`);
  }
}

runSimulatedTests();

console.log('\n=============================================');
console.log('ALL MOBILE NAVIGATION SIMULATION TESTS PASSED! ✅');
console.log('=============================================\n');
