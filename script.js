document.addEventListener("DOMContentLoaded", function () {
  // Footer માં વર્તમાન વર્ષ
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Mobile menu
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      const isOpen = mainNav.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ફોટો મોટો બતાવવા માટે Lightbox
  const galleryImages = document.querySelectorAll(".gallery-item img");
  if (!galleryImages.length) return;

  const lightbox = document.createElement("div");
  lightbox.id = "photoLightbox";

  Object.assign(lightbox.style, {
    position: "fixed",
    inset: "0",
    zIndex: "99999",
    background: "rgba(0, 0, 0, 0.92)",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    padding: "55px 15px 20px",
    boxSizing: "border-box",
    cursor: "zoom-out"
  });

  const enlargedImage = document.createElement("img");
  enlargedImage.alt = "માતાજીનાં મોટાં દર્શન";

  Object.assign(enlargedImage.style, {
    display: "block",
    maxWidth: "95vw",
    maxHeight: "85vh",
    width: "auto",
    height: "auto",
    objectFit: "contain",
    borderRadius: "10px",
    boxShadow: "0 0 30px rgba(255, 215, 0, 0.25)",
    cursor: "default"
  });

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "✕";
  closeButton.setAttribute("aria-label", "ફોટો બંધ કરો");

  Object.assign(closeButton.style, {
    position: "absolute",
    top: "12px",
    right: "18px",
    width: "44px",
    height: "44px",
    border: "1px solid #d4af37",
    borderRadius: "50%",
    background: "#7b1725",
    color: "#fff",
    fontSize: "25px",
    cursor: "pointer"
  });

  lightbox.appendChild(enlargedImage);
  lightbox.appendChild(closeButton);
  document.body.appendChild(lightbox);

  function openLightbox(image) {
    enlargedImage.src = image.currentSrc || image.src;
    enlargedImage.alt = image.alt || "માતાજીનાં દર્શન";
    lightbox.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.style.display = "none";
    enlargedImage.removeAttribute("src");
    document.body.style.overflow = "";
  }

  galleryImages.forEach(function (image) {
    image.style.cursor = "zoom-in";
    image.setAttribute("title", "મોટો ફોટો જોવા ક્લિક કરો");

    image.addEventListener("click", function () {
      openLightbox(image);
    });
  });

  closeButton.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && lightbox.style.display === "flex") {
      closeLightbox();
    }
  });
});
