
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initializeWebsite();
});

function initializeWebsite() {
  updateFooterYear();
  initializeMobileMenu();
  initializePhotoLightbox();
  initializeGallerySlider();
  initializeFirebaseContent();
}

/* --------------------------------------------------
   1. Footer year
-------------------------------------------------- */

function updateFooterYear() {
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/* --------------------------------------------------
   2. Mobile navigation
-------------------------------------------------- */

function initializeMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (!menuToggle || !mainNav) return;

  function closeMenu() {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "મેનૂ ખોલો");
  }

  function toggleMenu() {
    const isOpen = mainNav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "મેનૂ બંધ કરો" : "મેનૂ ખોલો"
    );
  }

  menuToggle.addEventListener("click", toggleMenu);

  mainNav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (
      mainNav.classList.contains("open") &&
      !mainNav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeMenu();
    }
  });
}

/* --------------------------------------------------
   3. Photo lightbox
-------------------------------------------------- */

function initializePhotoLightbox() {
  const lightbox = document.getElementById("photoLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const closeButton = document.getElementById("closeLightbox");

  if (!lightbox || !lightboxImage || !closeButton) return;

  function openPhoto(source, caption, altText) {
    if (!source) return;

    lightboxImage.src = source;
    lightboxImage.alt = altText || caption || "માતાજીનાં દર્શન";

    if (lightboxCaption) {
      lightboxCaption.textContent = caption || "";
    }

    if (typeof lightbox.showModal === "function") {
      if (!lightbox.open) {
        lightbox.showModal();
      }
    } else {
      lightbox.setAttribute("open", "");
    }
  }

  function closePhoto() {
    if (typeof lightbox.close === "function" && lightbox.open) {
      lightbox.close();
    } else {
      lightbox.removeAttribute("open");
    }
  }

  document.addEventListener("click", (event) => {
    const galleryButton = event.target.closest(".gallery-card, .gallery-dynamic-card button");

    if (!galleryButton) return;

    const image = galleryButton.querySelector("img");
    const source =
      galleryButton.dataset.photo ||
      (image ? image.currentSrc || image.src : "");

    const caption =
      galleryButton.dataset.caption ||
      (image ? image.alt : "");

    openPhoto(source, caption, image ? image.alt : caption);
  });

  closeButton.addEventListener("click", closePhoto);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closePhoto();
    }
  });

  lightbox.addEventListener("close", () => {
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";

    if (lightboxCaption) {
      lightboxCaption.textContent = "";
    }
  });
}


/* Accessible photo slider: buttons, keyboard arrows and touch swipe */
function initializeGallerySlider() {
  const gallery = document.querySelector(".gallery-grid");
  const previous = document.getElementById("galleryPrev");
  const next = document.getElementById("galleryNext");
  const status = document.getElementById("gallerySlideStatus");
  if (!gallery || !previous || !next) return;

  const slides = Array.from(gallery.querySelectorAll(".gallery-card"));
  if (!slides.length) return;
  let activeIndex = 0;
  let touchStartX = null;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === activeIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.tabIndex = active ? 0 : -1;
    });
    if (status) status.textContent = `ફોટો ${activeIndex + 1} / ${slides.length} — ${slides[activeIndex].dataset.caption || ""}`;
  }

  previous.addEventListener("click", () => showSlide(activeIndex - 1));
  next.addEventListener("click", () => showSlide(activeIndex + 1));
  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); showSlide(activeIndex - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); showSlide(activeIndex + 1); }
  });
  gallery.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  gallery.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) showSlide(activeIndex + (distance < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });
  showSlide(0);
}

/* --------------------------------------------------
   4. Firebase configuration
-------------------------------------------------- */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAdo3BhBLiBtLp_by35Z_w00lNcALxk72k",
  authDomain: "sadhi-sikotar-udalpur-dham.firebaseapp.com",
  projectId: "sadhi-sikotar-udalpur-dham",
  storageBucket: "sadhi-sikotar-udalpur-dham.firebasestorage.app",
  messagingSenderId: "579984682526",
  appId: "1:579984682526:web:6348d8e57d3381e557080f",
  measurementId: "G-775X1KW7VX"
};

const PUBLIC_COLLECTIONS = [
  "bhajans",
  "stories",
  "gallery",
  "festivals",
  "videos",
  "history"
];

/* --------------------------------------------------
   5. Firebase initialization
-------------------------------------------------- */

function initializeFirebaseContent() {
  if (
    typeof firebase === "undefined" ||
    !firebase.initializeApp ||
    !firebase.firestore
  ) {
    showFirebaseUnavailable();
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }

    const database = firebase.firestore();

    loadBhajans(database);
    loadStories(database);
    loadGallery(database);
    loadFestivals(database);
    loadVideos(database);
    loadHistory(database);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    showFirebaseUnavailable();
  }
}

function showFirebaseUnavailable() {
  setText(
    "bhajanStatus",
    "હાલ ભજનની માહિતી મેળવી શકાતી નથી. કૃપા કરીને થોડા સમય પછી ફરી પ્રયાસ કરો."
  );

  const collectionIds = [
    "storiesList",
    "galleryDynamic",
    "festivalsList",
    "videosList"
  ];

  collectionIds.forEach((id) => {
    const container = document.getElementById(id);

    if (container) {
      container.replaceChildren(
        createMessage(
          "હાલ માહિતી લોડ થઈ શકતી નથી. કૃપા કરીને થોડા સમય પછી ફરી પ્રયાસ કરો."
        )
      );
    }
  });
}

/* --------------------------------------------------
   6. Safe DOM helpers
-------------------------------------------------- */

function setText(id, message) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = message;
  }
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text !== undefined && text !== null) {
    element.textContent = String(text);
  }

  return element;
}

function createMessage(message) {
  return createElement("p", "empty-content", message);
}

function isSafeWebUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  try {
    const url = new URL(value.trim());

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function createSafeLink(url, label) {
  if (!isSafeWebUrl(url)) return null;

  const link = createElement("a", "", label);
  link.href = url.trim();
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  return link;
}

function getDateValue(value) {
  if (!value) return "";

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return "";
}

function formatDate(value) {
  const date = getDateValue(value);

  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("gu-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  } catch {
    return "";
  }
}

function getTimestamp(value) {
  if (!value) return 0;

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return 0;
}

function sortNewestFirst(documents) {
  return [...documents].sort((a, b) => {
    const dateA =
      getTimestamp(a.data.updatedAt) ||
      getTimestamp(a.data.createdAt);

    const dateB =
      getTimestamp(b.data.updatedAt) ||
      getTimestamp(b.data.createdAt);

    return dateB - dateA;
  });
}

/* --------------------------------------------------
   7. Public Firestore reads
   Only published documents are requested.
-------------------------------------------------- */

function getPublishedDocuments(database, collectionName) {
  if (!PUBLIC_COLLECTIONS.includes(collectionName)) {
    return Promise.reject(new Error("Unknown public collection."));
  }

  return database
    .collection(collectionName)
    .where("published", "==", true)
    .get()
    .then((snapshot) => {
      const documents = snapshot.docs.map((document) => ({
        id: document.id,
        data: document.data()
      }));

      return sortNewestFirst(documents);
    });
}

function loadCollection(
  database,
  collectionName,
  containerId,
  renderer,
  emptyMessage
) {
  const container = document.getElementById(containerId);

  if (!container) return;

  getPublishedDocuments(database, collectionName)
    .then((documents) => {
      container.replaceChildren();

      if (documents.length === 0) {
        container.appendChild(createMessage(emptyMessage));
        return;
      }

      documents.forEach((document) => {
        const card = renderer(document.data);

        if (card) {
          container.appendChild(card);
        }
      });

      if (!container.children.length) {
        container.appendChild(createMessage(emptyMessage));
      }
    })
    .catch((error) => {
      console.error(
        `Could not load ${collectionName}:`,
        error
      );

      container.replaceChildren(
        createMessage(
          "માહિતી લોડ થઈ શકી નથી. કૃપા કરીને પછી ફરી પ્રયાસ કરો."
        )
      );
    });
}

/* --------------------------------------------------
   8. Reusable content card
-------------------------------------------------- */

function createContentCard(data, options = {}) {
  const card = createElement(
    "article",
    options.className || "dynamic-content-card"
  );

  const title = typeof data.title === "string" ? data.title.trim() : "";
  const content =
    typeof data.content === "string" ? data.content.trim() : "";
  const imageUrl =
    typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";
  const linkUrl =
    typeof data.linkUrl === "string" ? data.linkUrl.trim() : "";
  const date = formatDate(data.date);
  const location =
    typeof data.location === "string" ? data.location.trim() : "";

  if (imageUrl && isSafeWebUrl(imageUrl)) {
    const image = document.createElement("img");

    image.src = imageUrl;
    image.alt = title || "સધી સિકોતર માતાજી";
    image.loading = "lazy";
    image.decoding = "async";

    image.addEventListener("error", () => {
      image.remove();
    }, { once: true });

    card.appendChild(image);
  }

  if (title) {
    card.appendChild(createElement("h3", "", title));
  }

  if (date) {
    card.appendChild(
      createElement("p", "content-date", `તારીખ: ${date}`)
    );
  }

  if (location) {
    card.appendChild(
      createElement("p", "content-location", `સ્થળ: ${location}`)
    );
  }

  if (content) {
    card.appendChild(createElement("p", "", content));
  }

  if (linkUrl && isSafeWebUrl(linkUrl)) {
    const link = createSafeLink(
      linkUrl,
      options.linkLabel || "વધુ જુઓ"
    );

    if (link) {
      card.appendChild(link);
    }
  }

  if (!card.children.length) {
    return null;
  }

  return card;
}

/* --------------------------------------------------
   9. Bhajans
-------------------------------------------------- */

function loadBhajans(database) {
  const status = document.getElementById("bhajanStatus");
  const container = document.getElementById("bhajanList");

  if (!status || !container) return;

  status.textContent = "ભજનની માહિતી લોડ થઈ રહી છે...";

  getPublishedDocuments(database, "bhajans")
    .then((documents) => {
      container.replaceChildren();

      if (documents.length === 0) {
        status.textContent =
          "હાલ કોઈ ભજન પ્રકાશિત નથી. નવા ભજન ટૂંક સમયમાં અહીં જોવા મળશે.";
        return;
      }

      status.textContent = `${documents.length} ભજન ઉપલબ્ધ છે.`;

      documents.forEach(({ data }) => {
        const card = createContentCard(data, {
          className: "live-bhajan-card",
          linkLabel: "ભજન સાંભળો / ખોલો"
        });

        if (card) {
          container.appendChild(card);
        }
      });

      if (!container.children.length) {
        status.textContent =
          "હાલ દર્શાવવા માટે કોઈ ભજન ઉપલબ્ધ નથી.";
      }
    })
    .catch((error) => {
      console.error("Could not load bhajans:", error);

      status.textContent =
        "હાલ ભજનની માહિતી લોડ થઈ શકતી નથી. કૃપા કરીને પછી ફરી પ્રયાસ કરો.";

      container.replaceChildren();
    });
}

/* --------------------------------------------------
   10. Stories
-------------------------------------------------- */

function loadStories(database) {
  loadCollection(
    database,
    "stories",
    "storiesList",
    (data) => createContentCard(data, {
      linkLabel: "વધુ વાંચો"
    }),
    "હાલ કોઈ ધાર્મિક પ્રસંગ પ્રકાશિત નથી."
  );
}

/* --------------------------------------------------
   11. Dynamic gallery
-------------------------------------------------- */

function loadGallery(database) {
  const container = document.getElementById("galleryDynamic");

  if (!container) return;

  getPublishedDocuments(database, "gallery")
    .then((documents) => {
      container.replaceChildren();

      documents.forEach(({ data }) => {
        const imageUrl =
          typeof data.imageUrl === "string"
            ? data.imageUrl.trim()
            : "";

        if (!isSafeWebUrl(imageUrl)) return;

        const card = createElement("article", "gallery-dynamic-card");
        const button = document.createElement("button");
        const image = document.createElement("img");
        const caption = createElement(
          "p",
          "",
          typeof data.title === "string" ? data.title : "માતાજીનાં દર્શન"
        );

        button.type = "button";
        button.dataset.photo = imageUrl;
        button.dataset.caption = caption.textContent;
        button.setAttribute(
          "aria-label",
          `${caption.textContent} - ફોટો મોટો જુઓ`
        );

        image.src = imageUrl;
        image.alt = caption.textContent;
        image.loading = "lazy";
        image.decoding = "async";

        image.addEventListener("error", () => {
          card.remove();
        }, { once: true });

        button.appendChild(image);
        card.appendChild(button);
        card.appendChild(caption);

        container.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Could not load gallery:", error);

      container.replaceChildren(
        createMessage(
          "નવા ફોટા લોડ થઈ શક્યા નથી. ઉપરના ફોટા જોઈ શકો છો."
        )
      );
    });
}

/* --------------------------------------------------
   12. Festivals and events
-------------------------------------------------- */

function loadFestivals(database) {
  loadCollection(
    database,
    "festivals",
    "festivalsList",
    (data) => createContentCard(data, {
      linkLabel: "કાર્યક્રમની માહિતી"
    }),
    "હાલ કોઈ નવો ઉત્સવ અથવા કાર્યક્રમ પ્રકાશિત નથી."
  );
}

/* --------------------------------------------------
   13. Videos
-------------------------------------------------- */

function loadVideos(database) {
  loadCollection(
    database,
    "videos",
    "videosList",
    (data) => createContentCard(data, {
      linkLabel: "વિડિયો જુઓ"
    }),
    "હાલ કોઈ વિડિયો પ્રકાશિત નથી."
  );
}

/* --------------------------------------------------
   14. Temple history
-------------------------------------------------- */

function loadHistory(database) {
  const container = document.getElementById("historyContent");

  if (!container) return;

  getPublishedDocuments(database, "history")
    .then((documents) => {
      if (documents.length === 0) {
        // Keep the existing static history text.
        return;
      }

      documents.forEach(({ data }) => {
        const card = createContentCard(data);

        if (card) {
          container.appendChild(card);
        }
      });
    })
    .catch((error) => {
      // The existing static text remains available.
      console.error("Could not load history:", error);
    });
}
