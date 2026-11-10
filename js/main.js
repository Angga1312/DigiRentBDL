(() => {
  "use strict";
  const cfg = window.DIGIRENT_CONFIG;
  const rupiah = (n) => new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0
  }).format(n);

  document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".site-nav");
    if (menuBtn && nav) {
      const closeMenu = () => {
        menuBtn.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        menuBtn.textContent = 'Menu';
      };

      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = menuBtn.getAttribute("aria-expanded") === "true";
        menuBtn.setAttribute("aria-expanded", String(!open));
        nav.classList.toggle("is-open", !open);
        menuBtn.textContent = !open ? 'Tutup' : 'Menu';
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
      });

      document.addEventListener("click", (e) => {
        if (nav.classList.contains("is-open") && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
          closeMenu();
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && nav.classList.contains("is-open")) {
          closeMenu();
        }
      });
    }

    document.querySelectorAll("[data-booking-form]").forEach((form) => {
      const camera = form.querySelector('[name="camera"]');
      const duration = form.querySelector('[name="duration"]');
      const date = form.querySelector('[name="date"]');
      const purpose = form.querySelector('[name="purpose"]');
      const accessory = form.querySelector('[name="accessory"]');
      const totalEl = form.querySelector("[data-price-output]");
      const notesEl = form.querySelector("[data-price-note]");
      const getPrice = () => {
        const model = camera?.value;
        const hours = Number(duration?.value || 12);
        const base = cfg.cameras[model]?.prices[hours] || 0;
        const extra = accessory ? (cfg.accessories[accessory.value]?.price || 0) : 0;
        if (totalEl) totalEl.textContent = rupiah(base + extra);
        if (notesEl) {
          const note = cfg.cameras[model]?.priceNotes?.[hours];
          notesEl.textContent = note ? `Tarif ${hours} jam Fujifilm adalah ${note}; konfirmasi kembali ke admin.` : "Estimasi belum termasuk aksesori kecuali dipilih.";
        }
        return { base, extra, total: base + extra, model, hours };
      };
      [camera, duration, accessory].filter(Boolean).forEach((el) => {
        el.addEventListener("change", getPrice);
      });
      if (date) {
        const now = new Date();
        date.min = [now.getFullYear(), String(now.getMonth()+1).padStart(2,"0"), String(now.getDate()).padStart(2,"0")].join("-");
      }
      getPrice();
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const p = getPrice();
        window.DigiWhatsApp.openBooking({
          camera: p.model,
          date: date?.value || "",
          duration: String(p.hours),
          purpose: purpose?.value || ""
        });
      });
    });

    // Copy an order template; the event is logged only after a successful copy.
    document.querySelectorAll("[data-copy-order]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const text = document.querySelector(btn.dataset.copyOrder)?.textContent?.trim() || "";
        try {
          await navigator.clipboard.writeText(text);
          window.DigiAnalytics?.track("download_order_format", {
            action_type: "copy",
            format_name: "whatsapp_order_template"
          });
          const old = btn.textContent;
          btn.textContent = "Tersalin";
          setTimeout(() => btn.textContent = old, 1800);
        } catch {
          alert("Clipboard tidak tersedia di browser ini. Silakan blok dan salin teks secara manual.");
        }
      });
    });

    document.querySelectorAll("[data-calc-form]").forEach((form) => {
      const output = form.querySelector("[data-calc-output]");
      const note = form.querySelector("[data-calc-note]");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const model = form.elements.camera.value;
        const duration = Number(form.elements.duration.value);
        const accessory = form.elements.accessory.value;
        const base = cfg.cameras[model].prices[duration];
        const extra = cfg.accessories[accessory].price;
        const total = base + extra;
        output.textContent = rupiah(total);
        const priceNote = cfg.cameras[model].priceNotes?.[duration];
        note.textContent = priceNote ? `Catatan: tarif dasar ini ${priceNote} dan perlu dikonfirmasi kepada admin.` : "Estimasi untuk simulasi; ketersediaan dan biaya akhir dikonfirmasi admin.";
        window.DigiAnalytics?.track("use_calculator", {
          camera_model: model,
          rental_duration_hours: duration,
          accessory_type: accessory,
          estimated_price: total,
          currency: "IDR"
        });
      });
    });

    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        document.querySelectorAll("[data-gallery-item]").forEach((item) => {
          item.hidden = filter !== "all" && item.dataset.galleryItem !== filter;
        });
        document.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("active", b === button));
        window.DigiAnalytics?.track("gallery_filter", { gallery_filter: filter });
      });
    });

    document.querySelectorAll("details.faq-item").forEach((item) => {
      item.addEventListener("toggle", () => {
        if (item.open) window.DigiAnalytics?.track("faq_open", { faq_question: item.querySelector("summary")?.textContent.trim() });
      });
    });

    document.querySelectorAll("[data-view-camera]").forEach((link) => {
      link.addEventListener("click", () => window.DigiAnalytics?.track("view_camera_detail", {
        camera_model: link.dataset.viewCamera
      }));
    });

    // Showcase model links active state
    document.querySelectorAll(".showcase-models .model-item").forEach((link) => {
      link.addEventListener("click", () => {
        document.querySelectorAll(".showcase-models .model-item").forEach((l) => l.classList.toggle("active", l === link));
      });
    });
  });
})();
