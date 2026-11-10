(() => {
  "use strict";
  window.DIGIRENT_CONFIG = {
    brand: "DigiRent.bdl",
    whatsappNumber: "6285121969542",
    instagramUrl: "https://www.instagram.com/digirent.bdl/",
    projectReference: "20262-DIGMAREG-KLKx",
    // Replace with the real GA4 Measurement ID from Admin > Data streams.
    gaMeasurementId: "G-XXXXXXXXXX",
    cameras: {
      "Canon EOS M100": {
        prices: { 12: 115000, 24: 150000, 48: 280000 },
        priceNotes: {}
      },
      "Fujifilm X-A3": {
        prices: { 12: 100000, 24: 135000, 48: 250000 },
        priceNotes: { 24: "estimasi proporsional", 48: "estimasi proporsional" }
      }
    },
    accessories: {
      none: { label: "Tanpa tambahan", price: 0 },
      memory: { label: "Memory card tambahan", price: 15000 },
      lighting: { label: "Lighting sederhana", price: 25000 }
    }
  };
})();
