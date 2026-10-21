(() => {
  "use strict";

  const cfg = window.DIGIRENT_CONFIG || {};

  const rupiah = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(n);

  const formatDateId = (val) => {
    if (!val) return "belum ditentukan";
    try {
      const d = new Date(val + "T12:00:00");
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(d);
    } catch {
      return val;
    }
  };

  // Toast notification helper
  const showToast = (message) => {
    let toast = document.querySelector(".toast-notice");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast-notice";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
    toast.classList.add("is-active");
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove("is-active");
    }, 2400);
  };

  document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. Mobile Menu & Backdrop
    // ----------------------------------------------------
    const menuBtn = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".site-nav");
    let backdrop = document.querySelector(".nav-backdrop");

    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "nav-backdrop";
      document.body.appendChild(backdrop);
    }

    const closeNav = () => {
      if (!nav || !menuBtn) return;
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.innerHTML = "Menu ☰";
      nav.classList.remove("is-open");
      backdrop.classList.remove("is-visible");
    };

    if (menuBtn && nav) {
      menuBtn.addEventListener("click", () => {
        const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
        menuBtn.setAttribute("aria-expanded", String(!isOpen));
        menuBtn.innerHTML = isOpen ? "Menu ☰" : "Tutup ✕";
        nav.classList.toggle("is-open", !isOpen);
        backdrop.classList.toggle("is-visible", !isOpen);
      });

      backdrop.addEventListener("click", closeNav);

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 720) closeNav();
        });
      });
    }

    // Active Navigation Link Highlight
    const currentPath = window.location.pathname;
    document.querySelectorAll(".site-nav a").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      if (
        (currentPath.endsWith("/") || currentPath.endsWith("/index.html")) &&
        (href === "index.html" || href === "../index.html")
      ) {
        link.classList.add("active");
      } else if (href.includes("/") && currentPath.endsWith(href.split("/").pop())) {
        link.classList.add("active");
      }
    });

    // ----------------------------------------------------
    // 2. Sticky Header Scroll Effect & Back-to-Top
    // ----------------------------------------------------
    const header = document.querySelector(".site-header");
    let backToTop = document.querySelector(".back-to-top");

    if (!backToTop) {
      backToTop = document.createElement("button");
      backToTop.className = "back-to-top";
      backToTop.setAttribute("aria-label", "Kembali ke atas");
      backToTop.innerHTML = "↑";
      document.body.appendChild(backToTop);
    }

    window.addEventListener("scroll", () => {
      const scrolled = window.scrollY > 20;
      if (header) header.classList.toggle("is-scrolled", scrolled);
      if (backToTop) backToTop.classList.toggle("is-visible", window.scrollY > 320);
    }, { passive: true });

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ----------------------------------------------------
    // 3. Quick Booking Form with Live WhatsApp Preview & Chips
    // ----------------------------------------------------
    document.querySelectorAll("[data-booking-form]").forEach((form) => {
      const cameraSelect = form.querySelector('[name="camera"]');
      const durationSelect = form.querySelector('[name="duration"]');
      const dateInput = form.querySelector('[name="date"]');
      const purposeSelect = form.querySelector('[name="purpose"]');
      const accessorySelect = form.querySelector('[name="accessory"]');
      const totalEl = form.querySelector("[data-price-output]");
      const notesEl = form.querySelector("[data-price-note]");
      const chatPreviewText = form.querySelector("[data-chat-preview-text]");
      const copyBtn = form.querySelector("[data-copy-preview]");

      // Setup default minimum date to today
      if (dateInput) {
        const now = new Date();
        const minStr = [
          now.getFullYear(),
          String(now.getMonth() + 1).padStart(2, "0"),
          String(now.getDate()).padStart(2, "0")
        ].join("-");
        dateInput.min = minStr;
        if (!dateInput.value) {
          dateInput.value = minStr;
        }
      }

      // Sync Interactive Camera Chips
      const cameraChips = form.querySelectorAll("[data-chip-camera]");
      if (cameraChips.length && cameraSelect) {
        cameraChips.forEach((chip) => {
          chip.addEventListener("click", () => {
            cameraChips.forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            cameraSelect.value = chip.dataset.chipCamera;
            updateCalculation();
          });
        });
      }

      // Sync Interactive Duration Chips
      const durationChips = form.querySelectorAll("[data-chip-duration]");
      if (durationChips.length && durationSelect) {
        durationChips.forEach((chip) => {
          chip.addEventListener("click", () => {
            durationChips.forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            durationSelect.value = chip.dataset.chipDuration;
            updateCalculation();
          });
        });
      }

      const updateCalculation = () => {
        const model = cameraSelect?.value || "Canon EOS M100";
        const hours = Number(durationSelect?.value || 12);
        const camData = cfg.cameras?.[model] || { prices: { 12: 115000, 24: 150000, 48: 280000 } };
        const base = camData.prices[hours] || 0;
        const extra = accessorySelect ? (cfg.accessories?.[accessorySelect.value]?.price || 0) : 0;
        const total = base + extra;

        if (totalEl) totalEl.textContent = rupiah(total);

        if (notesEl) {
          const note = camData.priceNotes?.[hours];
          notesEl.textContent = note
            ? `Catatan: Tarif ${hours} jam Fujifilm adalah ${note}; konfirmasi kembali ke admin.`
            : "Estimasi tarif sewa; ketersediaan unit dan jadwal final dikonfirmasi oleh admin.";
        }

        // Update chips active state if select changed directly
        if (cameraChips.length && cameraSelect) {
          cameraChips.forEach((c) => c.classList.toggle("active", c.dataset.chipCamera === cameraSelect.value));
        }
        if (durationChips.length && durationSelect) {
          durationChips.forEach((c) => c.classList.toggle("active", c.dataset.chipDuration === durationSelect.value));
        }

        // Live WhatsApp Message Preview
        if (chatPreviewText) {
          const formattedDate = formatDateId(dateInput?.value);
          const purposeVal = purposeSelect?.value || "Dokumentasi";
          let message = `Halo DigiRent.bdl Kedaton, saya mau cek ketersediaan unit ${model} untuk ${formattedDate} selama ${hours} Jam.`;
          if (purposeVal) message += ` Keperluan: ${purposeVal}.`;
          message += ` Terima kasih!`;
          chatPreviewText.textContent = message;
        }

        return { base, extra, total, model, hours };
      };

      [cameraSelect, durationSelect, dateInput, purposeSelect, accessorySelect]
        .filter(Boolean)
        .forEach((el) => {
          el.addEventListener("input", updateCalculation);
          el.addEventListener("change", updateCalculation);
        });

      // Quick Copy Preview
      if (copyBtn && chatPreviewText) {
        copyBtn.addEventListener("click", async () => {
          const textToCopy = chatPreviewText.textContent.trim();
          try {
            await navigator.clipboard.writeText(textToCopy);
            showToast("Pesan WhatsApp berhasil disalin!");
            window.DigiAnalytics?.track("download_order_format", {
              action_type: "copy",
              format_name: "whatsapp_live_preview"
            });
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = "Tersalin ✓";
            setTimeout(() => { copyBtn.innerHTML = originalText; }, 1800);
          } catch {
            alert("Silakan salin teks pesan secara manual.");
          }
        });
      }

      // Initial calculation
      updateCalculation();

      // Form Submit
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const p = updateCalculation();
        window.DigiWhatsApp?.openBooking({
          camera: p.model,
          date: dateInput?.value || "",
          duration: String(p.hours),
          purpose: purposeSelect?.value || ""
        });
      });
    });

    // ----------------------------------------------------
    // 4. Interactive "Pilih Kamera" Fast Selector Jump
    // ----------------------------------------------------
    document.querySelectorAll("[data-select-camera]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cameraName = btn.dataset.selectCamera;
        const bookingSection = document.getElementById("cek-unit");
        const formCard = document.querySelector("[data-booking-form]");
        const cameraSelect = document.querySelector('[data-booking-form] [name="camera"]');
        const cameraChip = document.querySelector(`[data-chip-camera="${cameraName}"]`);

        if (cameraSelect) {
          cameraSelect.value = cameraName;
          if (cameraChip) cameraChip.click();
          else cameraSelect.dispatchEvent(new Event("change"));
        }

        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: "smooth" });
          if (formCard) {
            formCard.classList.add("highlight-focus");
            setTimeout(() => formCard.classList.remove("highlight-focus"), 1500);
          }
        }

        showToast(`Kamera ${cameraName} dipilih!`);
        window.DigiAnalytics?.track("view_camera_detail", { camera_model: cameraName });
      });
    });

    // ----------------------------------------------------
    // 5. Interactive Camera Matcher / Recommendation Quiz
    // ----------------------------------------------------
    const matcherContainer = document.querySelector("[data-camera-matcher]");
    if (matcherContainer) {
      const tabs = matcherContainer.querySelectorAll("[data-matcher-filter]");
      const resultBox = matcherContainer.querySelector("[data-matcher-result]");
      const chooseBtn = matcherContainer.querySelector("[data-matcher-choose]");

      const recommendations = {
        all: {
          title: "Dua Pilihan Mirrorless Siap Pakai di Kedaton",
          desc: "Canon EOS M100 untuk kesederhanaan & autofokus kilat, Fujifilm X-A3 untuk eksplorasi tone warna film estetik.",
          camera: "Canon EOS M100"
        },
        wisuda: {
          title: "Rekomendasi Wisuda & Selfie: Fujifilm X-A3 🎓",
          desc: "Dilengkapi layar tilting 180° yang bisa diputar ke depan untuk selfie/grup, dan tone warna khas Film Simulation yang cantik untuk kebaya dan toga.",
          camera: "Fujifilm X-A3"
        },
        travel: {
          title: "Rekomendasi Liburan & Traveling: Canon EOS M100 ✈️",
          desc: "Body sangat compact dan ringan, pengoperasian layar sentuh mudah, serta autofokus Dual Pixel kilat untuk menangkap momen jalan-jalan spontan.",
          camera: "Canon EOS M100"
        },
        konten: {
          title: "Rekomendasi Foto & Video Kreatif: Fujifilm X-A3 ✨",
          desc: "Karakter warna estetik langsung dari kamera tanpa perlu banyak grading tambahan, cocok untuk feed Instagram dan konten kreatif.",
          camera: "Fujifilm X-A3"
        },
        harian: {
          title: "Rekomendasi Foto Kasual Sehari-hari: Canon EOS M100 📸",
          desc: "Menu simpel, hasil foto bersih natural, cocok untuk kamu yang baru pertama kali menyewa mirrorless.",
          camera: "Canon EOS M100"
        }
      };

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          tabs.forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          const key = tab.dataset.matcherFilter;
          const rec = recommendations[key] || recommendations.all;

          if (resultBox) {
            resultBox.innerHTML = `
              <div class="matcher-result-text">
                <strong>${rec.title}</strong>
                <p>${rec.desc}</p>
              </div>
            `;
          }

          if (chooseBtn) {
            chooseBtn.textContent = `Pilih ${rec.camera} ↗`;
            chooseBtn.dataset.selectCamera = rec.camera;
          }
        });
      });
    }

    // ----------------------------------------------------
    // 6. Interactive Calculator in calculator.html
    // ----------------------------------------------------
    document.querySelectorAll("[data-calc-form]").forEach((form) => {
      const camera = form.elements.camera;
      const duration = form.elements.duration;
      const accessory = form.elements.accessory;
      const output = form.querySelector("[data-calc-output]");
      const note = form.querySelector("[data-calc-note]");
      const waButton = form.querySelector("[data-calc-wa]");

      const runCalc = () => {
        const model = camera.value;
        const hours = Number(duration.value);
        const accKey = accessory.value;
        const base = cfg.cameras?.[model]?.prices?.[hours] || 0;
        const extra = cfg.accessories?.[accKey]?.price || 0;
        const total = base + extra;

        if (output) output.textContent = rupiah(total);

        if (note) {
          const priceNote = cfg.cameras?.[model]?.priceNotes?.[hours];
          note.textContent = priceNote
            ? `Catatan: Tarif dasar ini ${priceNote} dan perlu dikonfirmasi kepada admin.`
            : "Simulasi instan; tarif aksesori & ketersediaan tanggal dikonfirmasi oleh admin.";
        }

        if (waButton) {
          const accLabel = cfg.accessories?.[accKey]?.label || "";
          let text = `Halo DigiRent.bdl Kedaton, saya ingin sewa ${model} untuk durasi ${hours} jam.`;
          if (accKey !== "none") text += ` Tambahan: ${accLabel}.`;
          text += ` Estimasi kalkulator: ${rupiah(total)}. Apakah unit tersedia?`;
          waButton.href = `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(text)}`;
        }

        return { model, hours, total, accessory: accKey };
      };

      [camera, duration, accessory].forEach((el) => {
        el.addEventListener("change", runCalc);
      });

      runCalc();

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const res = runCalc();
        showToast("Perhitungan selesai! Kamu bisa langsung chat admin.");
        window.DigiAnalytics?.track("use_calculator", {
          camera_model: res.model,
          rental_duration_hours: res.hours,
          accessory_type: res.accessory,
          estimated_price: res.total,
          currency: "IDR"
        });
      });
    });

    // ----------------------------------------------------
    // 7. Copy Order Format Template
    // ----------------------------------------------------
    document.querySelectorAll("[data-copy-order]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const targetSelector = btn.dataset.copyOrder;
        const targetEl = document.querySelector(targetSelector);
        const text = targetEl?.textContent?.trim() || "";
        try {
          await navigator.clipboard.writeText(text);
          showToast("Format pesan berhasil disalin!");
          window.DigiAnalytics?.track("download_order_format", {
            action_type: "copy",
            format_name: "whatsapp_order_template"
          });
          const old = btn.textContent;
          btn.textContent = "Tersalin ✓";
          setTimeout(() => { btn.textContent = old; }, 1800);
        } catch {
          alert("Gagal menyalin otomatis. Silakan blok dan salin secara manual.");
        }
      });
    });

    // ----------------------------------------------------
    // 8. Gallery Filter & Interactive Lightbox
    // ----------------------------------------------------
    const galleryItems = document.querySelectorAll("[data-gallery-item]");
    let lightbox = document.querySelector(".lightbox-modal");

    if (galleryItems.length && !lightbox) {
      lightbox = document.createElement("div");
      lightbox.className = "lightbox-modal";
      lightbox.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Tutup preview">✕</button>
          <img src="" alt="Pratinjau foto inspirasi">
          <div class="lightbox-caption"></div>
        </div>
      `;
      document.body.appendChild(lightbox);

      const closeLb = () => lightbox.classList.remove("is-active");
      lightbox.querySelector(".lightbox-close").addEventListener("click", closeLb);
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLb();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.classList.contains("is-active")) closeLb();
      });

      galleryItems.forEach((item) => {
        item.addEventListener("click", () => {
          const img = item.querySelector("img");
          const caption = item.querySelector("figcaption");
          if (!img) return;
          const lbImg = lightbox.querySelector("img");
          const lbCap = lightbox.querySelector(".lightbox-caption");
          lbImg.src = img.src;
          lbCap.textContent = caption ? caption.textContent : "Inspirasi fotografi";
          lightbox.classList.add("is-active");
        });
      });
    }

    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        galleryItems.forEach((item) => {
          const match = filter === "all" || item.dataset.galleryItem === filter;
          item.hidden = !match;
          if (match) {
            item.style.animation = "fadeIn 0.3s ease";
          }
        });
        document.querySelectorAll("[data-filter]").forEach((b) =>
          b.classList.toggle("active", b === button)
        );
        window.DigiAnalytics?.track("gallery_filter", { gallery_filter: filter });
      });
    });

    // ----------------------------------------------------
    // 9. Floating WhatsApp Prompt Bubble Dismissal
    // ----------------------------------------------------
    const waPromptClose = document.querySelector(".close-prompt");
    if (waPromptClose) {
      waPromptClose.addEventListener("click", (e) => {
        e.stopPropagation();
        const bubble = document.querySelector(".wa-prompt-bubble");
        if (bubble) bubble.style.display = "none";
      });
    }

    // ----------------------------------------------------
    // 10. FAQ Accordions Analytics & Details
    // ----------------------------------------------------
    document.querySelectorAll("details.faq-item").forEach((item) => {
      item.addEventListener("toggle", () => {
        if (item.open) {
          window.DigiAnalytics?.track("faq_open", {
            faq_question: item.querySelector("summary")?.textContent.trim()
          });
        }
      });
    });

    // Camera detail tracking links
    document.querySelectorAll("[data-view-camera]").forEach((link) => {
      link.addEventListener("click", () => {
        window.DigiAnalytics?.track("view_camera_detail", {
          camera_model: link.dataset.viewCamera
        });
      });
    });

    // ----------------------------------------------------
    // 11. Smooth Intra-Page Anchors & Zero-Lag Navigation
    // ----------------------------------------------------
    // Smooth scrolling only for intra-page anchors (#) to avoid cross-page unload lag
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const hash = anchor.getAttribute("href");
        if (!hash || hash === "#") return;
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
          if (window.history && window.history.pushState) {
            window.history.pushState(null, "", hash);
          }
        }
      });
    });

    // Instant tactile feedback when clicking internal links
    document.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:") || link.target === "_blank") return;
      link.addEventListener("click", () => {
        link.classList.add("is-navigating");
      });
    });

    // Safe, non-blocking prefetch (only runs on http/https, never on file://)
    if (window.location.protocol.startsWith("http")) {
      const prefetchedUrls = new Set();
      const prefetch = (rawUrl) => {
        if (!rawUrl) return;
        const url = rawUrl.split("#")[0].split("?")[0];
        if (!url || prefetchedUrls.has(url)) return;
        if (
          url.startsWith("javascript:") ||
          url.startsWith("mailto:") ||
          url.startsWith("tel:") ||
          url.startsWith("http://") ||
          url.startsWith("https://")
        ) {
          return;
        }
        prefetchedUrls.add(url);
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = url;
        link.as = "document";
        document.head.appendChild(link);
      };

      // Debounce hover by 75ms to avoid queueing during cursor sweeps
      document.querySelectorAll("a[href]").forEach((link) => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#") || link.target === "_blank") return;
        let timer = null;
        link.addEventListener("pointerenter", () => {
          timer = setTimeout(() => prefetch(href), 75);
        }, { passive: true });
        link.addEventListener("pointerleave", () => {
          if (timer) clearTimeout(timer);
        }, { passive: true });
      });
    }
  });
})();
