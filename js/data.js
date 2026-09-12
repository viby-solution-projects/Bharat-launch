/* ==========================================================================
   BHARATLAUNCH — UNIFIED DATA ACCESS LAYER
   Consolidates Verified Datasets & Provides High-Performance Query Helpers
   ========================================================================== */

(function() {
  const fallbackStartups = [
    {
      id: 'astrasense', name: 'AstraSense', logo: 'assets/astrasense.svg', sector: 'Space & Aerospace',
      tagline: 'High-resolution hyperspectral satellite constellation for earth observation.', foundedYear: 2019,
      founders: [{ name: 'Awais Ahmed', role: 'Co-Founder & CEO', linkedIn: 'https://linkedin.com/in/awaisahmed' }], teamSize: '180+',
      stage: 'Series A', website: 'https://astrasense.in', linkedIn: 'https://linkedin.com/company/astrasense',
      city: 'Bengaluru', state: 'Karnataka', headquarters: 'Bengaluru, Karnataka',
      funding: '$71M', valuation: '$250M', businessModel: 'B2B / Earth Observation',
      description: 'AstraSense is building high-resolution hyperspectral satellite technology designed to provide advanced earth observation data and insights.',
      screenshots: ['assets/astrasense.svg'], verified: true, featured: true, recentLaunch: true
    },
    {
      id: 'greencart', name: 'GreenCart', logo: 'assets/greencart.svg', sector: 'CleanTech & EV',
      tagline: 'Smart waste management solutions for cleaner, greener cities.', foundedYear: 2022,
      founders: [{ name: 'Neha Sharma', role: 'Founder & CEO', linkedIn: 'https://linkedin.com/in/nehasharma' }], teamSize: '50+',
      stage: 'Seed', website: 'https://greencart.in', linkedIn: 'https://linkedin.com/company/greencart',
      city: 'Pune', state: 'Maharashtra', headquarters: 'Pune, Maharashtra',
      funding: '$3.5M', valuation: '$18M', businessModel: 'B2B / Waste Management',
      description: 'GreenCart is building technology-enabled waste management solutions that help cities and communities improve recycling, collection, and environmental outcomes.',
      screenshots: ['assets/greencart.svg'], verified: true, featured: true, recentLaunch: true
    }
  ];

  function getRawStartups() {
    if (typeof window !== 'undefined' && window.STARTUPS && window.STARTUPS.length) {
      return window.STARTUPS;
    }
    return fallbackStartups;
  }

  const DataService = {
    // Startups
    getAllStartups: function() {
      const list = getRawStartups();
      return list.map(s => ({
        ...s,
        founders: Array.isArray(s.founders) ? s.founders : [],
        screenshots: Array.isArray(s.screenshots) ? s.screenshots : [],
        investors: Array.isArray(s.investors) ? s.investors : [],
        tagline: s.tagline || 'Building innovative technology solutions for India and beyond.',
        description: s.description || s.tagline || 'Leading Indian startup.',
        sector: s.sector || 'Technology',
        stage: s.stage || 'Early Stage',
        city: s.city || 'India',
        state: s.state || '',
        headquarters: s.headquarters || (s.city ? (s.city + (s.state ? ', ' + s.state : '')) : 'India'),
        foundedYear: s.foundedYear || 2020,
        teamSize: s.teamSize || '10-50',
        funding: s.funding || 'Disclosed via press',
        website: s.website || '#',
        logo: s.logo || '',
        monogram: s.monogram || (s.name ? s.name.slice(0, 2).toUpperCase() : 'BL')
      }));
    },

    getListedStartups: function() {
      return this.getAllStartups().filter(s => s.foundedYear >= 2018);
    },

    getStartupById: function(id) {
      if (!id) return null;
      const list = this.getAllStartups();
      return list.find(s => s.id && s.id.toLowerCase() === id.toLowerCase()) || null;
    },

    getFeaturedStartups: function() {
      const list = this.getListedStartups();
      const featured = list.filter(s => s.featured);
      return featured.length ? featured : list.slice(0, 6);
    },

    getRecentLaunches: function() {
      const list = this.getListedStartups();
      const recent = list.filter(s => s.recentLaunch);
      return recent.length ? recent : list.slice(0, 3);
    },

    filterStartups: function(criteria) {
      let results = this.getListedStartups();
      if (!criteria) return results;

      if (criteria.sector && criteria.sector !== 'All') {
        results = results.filter(s => {
          const sSector = (s.sector || '').toLowerCase();
          const target = criteria.sector.toLowerCase();
          return sSector.includes(target) || target.includes(sSector);
        });
      }

      if (criteria.stage && criteria.stage !== 'All') {
        results = results.filter(s => {
          const sStage = (s.stage || '').toLowerCase();
          const target = criteria.stage.toLowerCase();
          return sStage.includes(target) || target.includes(sStage);
        });
      }

      if (criteria.year && criteria.year !== 'All') {
        results = results.filter(s => String(s.foundedYear) === String(criteria.year));
      }

      if (criteria.query) {
        const q = criteria.query.toLowerCase().trim();
        results = results.filter(s => {
          const nameMatch = (s.name || '').toLowerCase().includes(q);
          const tagMatch = (s.tagline || '').toLowerCase().includes(q);
          const descMatch = (s.description || '').toLowerCase().includes(q);
          const sectorMatch = (s.sector || '').toLowerCase().includes(q);
          const cityMatch = (s.city || '').toLowerCase().includes(q);
          const founderMatch = (s.founders || []).some(f => (f.name || '').toLowerCase().includes(q));
          return nameMatch || tagMatch || descMatch || sectorMatch || cityMatch || founderMatch;
        });
      }

      return results;
    },

    // Funding Deals
    getAllFundingDeals: function() {
      return (typeof window !== 'undefined' && window.FUNDING_DEALS && window.FUNDING_DEALS.length) ? window.FUNDING_DEALS : [];
    },

    // News
    getAllNews: function() {
      return (typeof window !== 'undefined' && window.PR_NEWS && window.PR_NEWS.length) ? window.PR_NEWS : [];
    },

    // Ecosystem
    getEcosystemHubs: function() {
      return (typeof window !== 'undefined' && window.ECOSYSTEM_HUBS && window.ECOSYSTEM_HUBS.length) ? window.ECOSYSTEM_HUBS : [];
    },

    getSectorMetrics: function() {
      return (typeof window !== 'undefined' && window.SECTOR_METRICS && window.SECTOR_METRICS.length) ? window.SECTOR_METRICS : [];
    }
  };

  // Expose on global window object
  if (typeof window !== 'undefined') {
    window.BharatData = DataService;
    window.STARTUPS_DATA = DataService.getAllStartups();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataService;
  }
})();
