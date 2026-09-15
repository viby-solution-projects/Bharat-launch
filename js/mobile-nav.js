/**
 * BharatLaunch Universal Mobile Navigation Controller
 * Handles mobile hamburger drawer opening, closing, backdrop blur dismiss,
 * outside click dismiss, Escape key navigation, body scroll locking,
 * and automatic focus management without conflicting event listeners.
 */

(function() {
  'use strict';

  // Prevent multiple initializations if script is loaded more than once
  if (window.__BHARAT_MOBILE_NAV_INITIALIZED__) {
    return;
  }
  window.__BHARAT_MOBILE_NAV_INITIALIZED__ = true;

  function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-menu-toggle') || document.querySelector('.mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer') || document.querySelector('.mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop') || document.querySelector('.mobile-drawer-backdrop');
    const closeBtn = document.getElementById('mobile-drawer-close') || document.querySelector('.mobile-drawer-close');

    if (!toggleBtn || !drawer) {
      return;
    }

    let isOpen = false;

    function openDrawer(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      isOpen = true;
      drawer.classList.add('active');
      drawer.setAttribute('aria-hidden', 'false');
      
      if (backdrop) {
        backdrop.classList.add('active');
        backdrop.setAttribute('aria-hidden', 'false');
      }
      
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('mobile-drawer-open');

      // Shift focus to close button or first actionable element for accessibility
      setTimeout(function() {
        if (closeBtn) {
          closeBtn.focus();
        } else {
          const firstLink = drawer.querySelector('a');
          if (firstLink) firstLink.focus();
        }
      }, 50);
    }

    function closeDrawer(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!isOpen && !drawer.classList.contains('active')) return;

      isOpen = false;
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');

      if (backdrop) {
        backdrop.classList.remove('active');
        backdrop.setAttribute('aria-hidden', 'true');
      }

      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('mobile-drawer-open');

      // Return focus to toggle button
      if (document.activeElement && drawer.contains(document.activeElement)) {
        toggleBtn.focus();
      }
    }

    function toggleDrawer(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (drawer.classList.contains('active')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    }

    // Attach click and touch events to toggle button
    toggleBtn.addEventListener('click', toggleDrawer);

    // Attach close button listener
    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }

    // Attach backdrop dismiss listener
    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }

    // Close on any navigation link selection inside drawer
    const drawerLinks = drawer.querySelectorAll('a');
    drawerLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        closeDrawer();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && (isOpen || drawer.classList.contains('active'))) {
        closeDrawer();
      }
    });

    // Close if viewport resized to desktop width
    window.addEventListener('resize', function() {
      if (window.innerWidth > 800 && (isOpen || drawer.classList.contains('active'))) {
        closeDrawer();
      }
    });

    // Expose global controller API for verification and debugging
    window.BharatMobileNav = {
      open: openDrawer,
      close: closeDrawer,
      toggle: toggleDrawer,
      isOpen: function() {
        return drawer.classList.contains('active');
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
