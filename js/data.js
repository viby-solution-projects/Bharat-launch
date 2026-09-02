/* ==========================================================================
   BHARATLAUNCH — UNIFIED DATA ACCESS LAYER
   Consolidates Verified Datasets & Provides High-Performance Query Helpers
   ========================================================================== */

(function() {
  // Ensure modules are safely registered on window
  const startups = (typeof window !== 'undefined' && window.STARTUPS) ? window.STARTUPS : [];
  const funding = (typeof window !== 'undefined' && window.FUNDING_DEALS) ? window.FUNDING_DEALS : [];
  const news = (typeof window !== 'undefined' && window.PR_NEWS) ? window.PR_NEWS : [];
  const hubs = (typeof window !== 'undefined' && window.ECOSYSTEM_HUBS) ? window.ECOSYSTEM_HUBS : [];
  const sectors = (typeof window !== 'undefined' && window.SECTOR_METRICS) ? window.SECTOR_METRICS : [];

  const DataService = {
    // Startups
    getAllStartups: function() {
      return (window.STARTUPS && window.STARTUPS.length) ? window.STARTUPS : startups;
    },

    getStartupById: function(id) {
      if (!id) return null;
      const list = this.getAllStartups();
      return list.find(s => s.id.toLowerCase() === id.toLowerCase()) || null;
    },

    getFeaturedStartups: function() {
      return this.getAllStartups().filter(s => s.featured);
    },

    getRecentLaunches: function() {
      const list = this.getAllStartups();
      const recent = list.filter(s => s.recentLaunch);
      return recent.length ? recent : list.slice(0, 3);
    },

    filterStartups: function(criteria) {
      let results = this.getAllStartups();
      if (!criteria) return results;

      if (criteria.sector && criteria.sector !== 'All') {
        results = results.filter(s => s.sector === criteria.sector || (s.sector && s.sector.includes(criteria.sector)));
      }

      if (criteria.stage && criteria.stage !== 'All') {
        results = results.filter(s => s.stage === criteria.stage || (s.stage && s.stage.includes(criteria.stage)));
      }

      if (criteria.city && criteria.city !== 'All') {
        results = results.filter(s => s.city.toLowerCase() === criteria.city.toLowerCase());
      }

      if (criteria.query) {
        const q = criteria.query.toLowerCase().trim();
        results = results.filter(s => {
          return s.name.toLowerCase().includes(q) ||
                 s.tagline.toLowerCase().includes(q) ||
                 s.description.toLowerCase().includes(q) ||
                 s.city.toLowerCase().includes(q) ||
                 s.sector.toLowerCase().includes(q);
        });
      }

      return results;
    },

    // Funding Deals
    getAllFundingDeals: function() {
      return (window.FUNDING_DEALS && window.FUNDING_DEALS.length) ? window.FUNDING_DEALS : funding;
    },

    // News
    getAllNews: function() {
      return (window.PR_NEWS && window.PR_NEWS.length) ? window.PR_NEWS : news;
    },

    // Ecosystem
    getEcosystemHubs: function() {
      return (window.ECOSYSTEM_HUBS && window.ECOSYSTEM_HUBS.length) ? window.ECOSYSTEM_HUBS : hubs;
    },

    getSectorMetrics: function() {
      return (window.SECTOR_METRICS && window.SECTOR_METRICS.length) ? window.SECTOR_METRICS : sectors;
    }
  };

  // Expose on global window object
  if (typeof window !== 'undefined') {
    window.BharatData = DataService;
    // Maintain alias for existing templates
    window.STARTUPS_DATA = DataService.getAllStartups();
    window.FUNDING_DEALS_DATA = DataService.getAllFundingDeals();
    window.PR_NEWS_DATA = DataService.getAllNews();
    window.ECOSYSTEM_CLUSTERS_DATA = DataService.getEcosystemHubs();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataService;
  }
})();
