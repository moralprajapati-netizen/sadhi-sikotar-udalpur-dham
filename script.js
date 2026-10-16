```javascript
document.addEventListener("DOMContentLoaded", function () {
  // ફૂટરમાં ચાલુ વર્ષ
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // મોબાઇલ મેનૂ
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      const isOpen = mainNav.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "મેનૂ બંધ કરો" : "મેનૂ ખોલો"
      );

      menuToggle.textContent = isOpen ? "×" : "☰";
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "મેનૂ ખોલો");
        menuToggle.textContent = "☰";
      });
    });
  }

  // ફોટો ગેલેરીનું મોટું વિન્ડો
  const photoLightbox = document.getElementById("photoLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const closeLightbox = document.getElementById("closeLightbox");
  const galleryCards = document.querySelectorAll(".gallery-card");

  if (photoLightbox && lightboxImage && lightboxCaption) {
    galleryCards.forEach(function (card) {
      card.addEventListener("click", function () {
        const photo = card.dataset.photo;
        const caption = card.dataset.caption;
        const thumbnail = card.querySelector("img");

        if (!photo) return;

        lightboxImage.src = photo;
        lightboxImage.alt = thumbnail ? thumbnail.alt : caption;
        lightboxCaption.textContent = caption || "";

        if (!photoLightbox.open) {
          photoLightbox.showModal();
        }
      });
    });

    if (closeLightbox) {
      closeLightbox.addEventListener("click", function () {
        photoLightbox.close();
      });
    }

    // ફોટાની બહાર ક્લિક કરતાં વિન્ડો બંધ થાય
    photoLightbox.addEventListener("click", function (event) {
      if (event.target === photoLightbox) {
        photoLightbox.close();
      }
    });

    // Esc દબાવવાથી dialog આપમેળે બંધ થાય છે
  }
});
```
