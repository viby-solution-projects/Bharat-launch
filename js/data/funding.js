/* ==========================================================================
   BHARATLAUNCH — REAL & VERIFIED FUNDING DEALS DATASET
   Source-Backed Investment Rounds & Dealflow across Indian Tech
   ========================================================================== */

const FUNDING_DEALS = [
  {
    id: "deal-zepto-2024",
    company: "Zepto",
    startupId: "zepto",
    date: "Aug 2024",
    round: "Series G",
    stage: "Series G",
    amount: "$665M",
    valuation: "$5.0B",
    sector: "Quick Commerce",
    city: "Mumbai",
    leadInvestors: "Avenir Growth, Lightspeed Venture Partners, StepStone Group",
    investors: "Avenir Growth, Lightspeed, StepStone, Avra, Glade Brook Capital",
    source: "https://economictimes.indiatimes.com/tech/technology/zepto-secures-665-million-in-funding-at-5-billion-valuation/articleshow/111162629.cms",
    sourceName: "The Economic Times"
  },
  {
    id: "deal-pw-2024",
    company: "PhysicsWallah",
    startupId: "physicswallah",
    date: "Sep 2024",
    round: "Series B",
    stage: "Series B",
    amount: "$210M",
    valuation: "$2.8B",
    sector: "EdTech",
    city: "Noida",
    leadInvestors: "Hornbill Capital, Lightspeed Venture Partners, GSV Ventures",
    investors: "Hornbill Capital, Lightspeed, GSV Ventures, WestBridge Capital",
    source: "https://techcrunch.com/2024/09/20/physicswallah-raises-210-million-edtech/",
    sourceName: "TechCrunch"
  },
  {
    id: "deal-meesho-2024",
    company: "Meesho",
    startupId: "meesho",
    date: "May 2024",
    round: "Series F",
    stage: "Series F",
    amount: "$275M",
    valuation: "$5.0B",
    sector: "Quick Commerce",
    city: "Bengaluru",
    leadInvestors: "Peak XV Partners, SoftBank Vision Fund 2, Prosus Ventures",
    investors: "Peak XV Partners, SoftBank, Prosus, Fidelity",
    source: "https://economictimes.indiatimes.com/tech/technology/meesho-closes-275-million-funding-round/articleshow/110534241.cms",
    sourceName: "The Economic Times"
  },
  {
    id: "deal-ather-2024",
    company: "Ather Energy",
    startupId: "ather-energy",
    date: "Aug 2024",
    round: "Pre-IPO Round",
    stage: "Pre-IPO Round",
    amount: "$71M",
    valuation: "$1.3B",
    sector: "CleanTech & EV",
    city: "Bengaluru",
    leadInvestors: "National Investment & Infrastructure Fund (NIIF), Hero MotoCorp",
    investors: "NIIF, Hero MotoCorp, GIC Singapore",
    source: "https://www.business-standard.com/companies/news/ather-energy-raises-rs-600-crore-from-niif-turns-unicorn-124081200923_1.html",
    sourceName: "Business Standard"
  },
  {
    id: "deal-sarvam-2024",
    company: "Sarvam AI",
    startupId: "sarvam-ai",
    date: "Dec 2023",
    round: "Series A",
    stage: "Series A",
    amount: "$41M",
    valuation: "$220M",
    sector: "AI & GenAI",
    city: "Bengaluru",
    leadInvestors: "Lightspeed Venture Partners, Peak XV Partners, Khosla Ventures",
    investors: "Lightspeed Venture Partners, Peak XV, Khosla Ventures",
    source: "https://techcrunch.com/2023/12/11/sarvam-ai-41-million-lightspeed-khosla-peak-xv/",
    sourceName: "TechCrunch"
  },
  {
    id: "deal-pixxel-2023",
    company: "Pixxel",
    startupId: "pixxel",
    date: "Jun 2023",
    round: "Series B",
    stage: "Series B",
    amount: "$36M",
    valuation: "$250M",
    sector: "DeepTech & SpaceTech",
    city: "Bengaluru",
    leadInvestors: "Google (India Digitization Fund), Radical Ventures",
    investors: "Google, Radical Ventures, Lightspeed, Blume Ventures",
    source: "https://techcrunch.com/2023/06/01/pixxel-raises-36m-series-b-google/",
    sourceName: "TechCrunch"
  },
  {
    id: "deal-skyroot-2023",
    company: "Skyroot Aerospace",
    startupId: "skyroot-aerospace",
    date: "Oct 2023",
    round: "Series B",
    stage: "Series B",
    amount: "$27.5M",
    valuation: "$350M",
    sector: "DeepTech & SpaceTech",
    city: "Hyderabad",
    leadInvestors: "Temasek, GIC Singapore, Sherpalo Ventures",
    investors: "Temasek, GIC Singapore, Sherpalo Ventures",
    source: "https://www.livemint.com/companies/news/skyroot-aerospace-raises-27-5-million-in-fresh-funding-led-by-temasek-11698651025547.html",
    sourceName: "Livemint"
  },
  {
    id: "deal-agnikul-2023",
    company: "Agnikul Cosmos",
    startupId: "agnikul-cosmos",
    date: "Oct 2023",
    round: "Series B",
    stage: "Series B",
    amount: "$20M",
    valuation: "$180M",
    sector: "DeepTech & SpaceTech",
    city: "Chennai",
    leadInvestors: "Celesta Capital, Mayfield India, Speciale Invest",
    investors: "Celesta Capital, Mayfield, Speciale Invest, Rocketship.vc",
    source: "https://entrackr.com/2023/10/exclusive-agnikul-cosmos-raises-20-mn-in-series-b-round/",
    sourceName: "Entrackr"
  },
  {
    id: "deal-dehaat-2023",
    company: "DeHaat",
    startupId: "dehaat",
    date: "Dec 2023",
    round: "Series E",
    stage: "Series E",
    amount: "$46M",
    valuation: "$750M",
    sector: "AgriTech",
    city: "Patna",
    leadInvestors: "Sofina, Prosus Ventures, Peak XV Partners",
    investors: "Sofina, Prosus Ventures, Peak XV, Omnivore",
    source: "https://inc42.com/buzz/agritech-startup-dehaat-raises-46-mn-in-series-e-round/",
    sourceName: "Inc42"
  },
  {
    id: "deal-phonepe-2023",
    company: "PhonePe",
    startupId: "phonepe",
    date: "May 2023",
    round: "Late Stage",
    stage: "Late Stage",
    amount: "$100M",
    valuation: "$12.0B",
    sector: "FinTech",
    city: "Bengaluru",
    leadInvestors: "General Atlantic, Ribbit Capital, TVS Capital",
    investors: "General Atlantic, Walmart, Tiger Global, Ribbit Capital",
    source: "https://www.reuters.com/markets/deals/phonepe-raises-100-mln-general-atlantic-12-bln-valuation-2023-05-18/",
    sourceName: "Reuters"
  }
];

if (typeof window !== 'undefined') {
  window.FUNDING_DEALS = FUNDING_DEALS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FUNDING_DEALS };
}
