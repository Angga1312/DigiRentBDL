(() => {
  "use strict";
  const cfg = window.DIGIRENT_CONFIG;
  const fmtDate = (value) => {
    if (!value) return "belum ditentukan";
    const d = new Date(value + "T12:00:00");
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    }).format(d);
  };

  window.DigiWhatsApp = {
    message({ camera, date, duration, purpose }) {
      let text = `Halo DigiRent.bdl Kedaton, saya mau cek ketersediaan unit ${camera} untuk tanggal ${fmtDate(date)} selama ${duration} Jam. Terima kasih!`;
      if (purpose) text += ` Keperluan: ${purpose}.`;
      return text;
    },
    url(message) {
      return `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(message)}`;
    },
    openBooking(data) {
      const message = this.message(data);
      window.DigiAnalytics?.track("click_wa_booking", {
        camera_model: data.camera,
        rental_duration_hours: Number(data.duration),
        rental_date: data.date || "not_selected",
        booking_purpose: data.purpose || "not_specified"
      });
      window.open(this.url(message), "_blank", "noopener,noreferrer");
    }
  };
})();
