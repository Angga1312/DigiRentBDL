(() => {
  "use strict";
  const config = window.DIGIRENT_CONFIG || {};
  const id = config.gaMeasurementId || "";

  // A placeholder must never be treated as a working GA4 destination.
  if (id && /^G-[A-Z0-9]+$/.test(id) && id !== "G-XXXXXXXXXX") {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id);
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(script);
  }

  window.DigiAnalytics = {
    track(name, params = {}) {
      const payload = { ...params, page_path: location.pathname };
      if (typeof window.gtag === "function") {
        window.gtag("event", name, payload);
      } else {
        // Useful for local QA; no data is sent to Google while ID is a placeholder.
        console.info("[DigiRent analytics preview]", name, payload);
      }
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-track-contact]").forEach((el) => {
      el.addEventListener("click", () => {
        window.DigiAnalytics.track("click_wa_contact", {
          contact_method: "whatsapp",
          contact_location: el.dataset.trackContact || "unspecified"
        });
      });
    });

    if (location.pathname.endsWith("/terms.html")) {
      window.DigiAnalytics.track("view_tnc_page", { page_type: "terms_and_conditions" });
    }
  });
})();
