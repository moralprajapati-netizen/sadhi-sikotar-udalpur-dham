document.addEventListener("DOMContentLoaded", () => {
  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile menu
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Photo lightbox
  const photos = document.querySelectorAll("#gallery .gallery-item img");
  if (!photos.length) return;

  const overlay = document.createElement("div");
  overlay.id = "photoLightbox";

  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "999999",
    background: "rgba(0,0,0,0.94)",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 15px 20px",
    boxSizing: "border-box",
    cursor: "zoom-out"
  });

  const bigPhoto = document.createElement("img");
  bigPhoto.alt = "માતાજીનાં દિવ્ય દર્શન";

  Object.assign(bigPhoto.style, {
    display: "block",
    maxWidth: "95vw",
    maxHeight: "85vh",
    width: "auto",
    height: "auto",
    objectFit: "contain",
    borderRadius: "10px",
    boxShadow: "0 0 25px rgba(255,215,0,0.35)",
    cursor: "default"
  });

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "✕";
  close.setAttribute("aria-label", "ફોટો બંધ કરો");

  Object.assign(close.style, {
    position: "absolute",
    top: "12px",
    right: "16px",
    width: "46px",
    height: "46px",
    border: "1px solid #d4af37",
    borderRadius: "50%",
    background: "#7b1725",
    color: "#fff",
    fontSize: "25px",
    cursor: "pointer"
  });

  overlay.appendChild(bigPhoto);
  overlay.appendChild(close);
  document.body.appendChild(overlay);

  function showPhoto(photo) {
    bigPhoto.src = photo.currentSrc || photo.src;
    bigPhoto.alt = photo.alt || "માતાજીનાં દર્શન";
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function hidePhoto() {
    overlay.style.display = "none";
    bigPhoto.removeAttribute("src");
    document.body.style.overflow = "";
  }

  photos.forEach(photo => {
    photo.style.cursor = "zoom-in";
    photo.title = "મોટો ફોટો જોવા ક્લિક કરો";

    photo.addEventListener("click", () => showPhoto(photo));
  });

  close.addEventListener("click", hidePhoto);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) hidePhoto();
  });

  bigPhoto.addEventListener("click", event => {
    event.stopPropagation();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") hidePhoto();
  });
});
