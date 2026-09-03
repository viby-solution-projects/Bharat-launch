/* ==========================================================================
   BHARATLAUNCH — REAL ECOSYSTEM HUBS & SECTOR CLUSTERS DATASET
   Source-Backed Data from DPIIT, NASSCOM, & IVCA-EY Venture Reports
   ========================================================================== */

const ECOSYSTEM_HUBS = [
  {
    city: "Bengaluru",
    state: "Karnataka",
    title: "India's Silicon Capital & DeepTech Epicenter",
    summary: "Home to 45+ Unicorns, leading engineering talent from IISc, and dominant headquarters for AI, B2B SaaS, FinTech, and SpaceTech pioneers.",
    topSectors: ["B2B SaaS", "FinTech", "AI & GenAI", "SpaceTech"],
    keyCompanies: ["Sarvam AI", "Fi", "Sprinto"],
    activeVentures: "14,000+"
  },
  {
    city: "Delhi NCR",
    state: "Delhi / Gurugram / Noida",
    title: "Commerce, Consumer Tech & EdTech Capital",
    summary: "Powerhouse region driving quick commerce, omnichannel retail, D2C brands, and massive consumer internet platforms.",
    topSectors: ["Quick Commerce", "EdTech", "D2C & Retail", "CleanTech"],
    keyCompanies: ["Apna", "Minimalist", "Battery Smart"],
    activeVentures: "11,500+"
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    title: "Financial Capital & Enterprise Scale Hub",
    summary: "Heart of institutional capital, wealth infrastructure, logistics powerhouses, and high-frequency consumer commerce.",
    topSectors: ["FinTech", "Quick Commerce", "Enterprise SaaS", "Logistics"],
    keyCompanies: ["Zepto", "Neysa", "Kiko Live"],
    activeVentures: "8,200+"
  },
  {
    city: "Hyderabad",
    state: "Telangana",
    title: "SpaceTech, PharmaTech & Enterprise Cloud",
    summary: "Leading tech corridor featuring T-Hub, private aerospace testbeds, enterprise SaaS giants, and government space initiatives.",
    topSectors: ["DeepTech & SpaceTech", "Enterprise SaaS", "BioTech", "AI"],
    keyCompanies: ["Skyroot Aerospace", "TurboHire", "HexaHealth"],
    activeVentures: "5,100+"
  },
  {
    city: "Chennai",
    state: "Tamil Nadu",
    title: "SaaS Capital of India & Deep Manufacturing Hub",
    summary: "Global epicenter for subscription billing, product engineering, EV automotive corridors, and space propulsion research.",
    topSectors: ["B2B SaaS", "CleanTech & EV", "SpaceTech", "Automotive"],
    keyCompanies: ["CRED", "Rupifi", "GalaxEye"],
    activeVentures: "4,600+"
  }
];

const SECTOR_METRICS = [
  {
    sector: "FinTech",
    marketDriver: "UPI 2.0, Account Aggregator, WealthTech & MSME Credit",
    leadingStage: "Series B to Unicorn",
    notableExits: "Public-market exits and strategic fintech partnerships"
  },
  {
    sector: "B2B SaaS",
    marketDriver: "Global Enterprise Digitization, Developer APIs & AI Tooling",
    leadingStage: "Series A to Public (NASDAQ)",
    notableExits: "SaaS listings and enterprise software growth milestones"
  },
  {
    sector: "DeepTech & SpaceTech",
    marketDriver: "IN-SPACe Private Launch Policy, 3D Metal Additive Propulsion",
    leadingStage: "Seed to Series B",
    notableExits: "Private Satellite Missions & Commercial Launch Contracts"
  },
  {
    sector: "CleanTech & EV",
    marketDriver: "FAME/PM E-DRIVE, Domestic Battery Cell Manufacturing, Fast Charging Grids",
    leadingStage: "Series C to Pre-IPO",
    notableExits: "Commercial EV launches and disclosed regulatory filings"
  },
  {
    sector: "AI & GenAI",
    marketDriver: "India AI Mission, Sovereign Indic LLMs & Multimodal Enterprise Voice",
    leadingStage: "Seed to Series A",
    notableExits: "Strategic Enterprise AI Partnerships"
  }
];

if (typeof window !== 'undefined') {
  window.ECOSYSTEM_HUBS = ECOSYSTEM_HUBS;
  window.SECTOR_METRICS = SECTOR_METRICS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ECOSYSTEM_HUBS, SECTOR_METRICS };
}
