
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initializeWebsite();
});

function initializeWebsite() {
  updateFooterYear();
  initializeMobileMenu();
  initializeSectionCards();
  initializeGujaratiCalendar();
  initializePanchangDateControls();
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
   Section cards: show only the section the visitor selects
-------------------------------------------------- */
function initializeSectionCards() {
  const main = document.querySelector("main");
  if (!main) return;

  const home = document.getElementById("home");
  const cardsSection = document.getElementById("sections");
  const cards = Array.from(document.querySelectorAll(".section-folder-card[href^='#']"));
  const contentSections = Array.from(main.querySelectorAll(":scope > section"))
    .filter((section) => section !== home && section !== cardsSection);

  let activeSectionId = "";

  contentSections.forEach((section) => {
    section.hidden = true;
  });

  function showOnlySection(id, shouldScroll = true) {
    const target = contentSections.find((section) => section.id === id);
    if (!target) return false;

    contentSections.forEach((section) => {
      section.hidden = section !== target;
    });
    cards.forEach((card) => {
      if (card.getAttribute("href") === "#" + id) {
        card.setAttribute("aria-current", "true");
      } else {
        card.removeAttribute("aria-current");
      }
    });
    activeSectionId = id;
    document.body.classList.add("section-view-active");

    if (shouldScroll) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return true;
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href").slice(1);
      if (id === "home") {
        event.preventDefault();
        contentSections.forEach((section) => { section.hidden = true; });
        cards.forEach((card) => card.removeAttribute("aria-current"));
        activeSectionId = "";
        document.body.classList.remove("section-view-active");
        history.replaceState(null, "", window.location.pathname + window.location.search);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!contentSections.some((section) => section.id === id)) return;

      event.preventDefault();
      showOnlySection(id);
      history.replaceState(null, "", "#" + id);
    });
  });

  // Restore a direct section link on refresh so visitors never land on an empty view.
  const initialId = window.location.hash.slice(1);
  if (initialId && contentSections.some((section) => section.id === initialId)) {
    showOnlySection(initialId, false);
  }
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
  "history",
  "contact"
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
    loadContact(database);
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

      appendFolderGroups(container, documents, renderer);

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

/* Group public content into expandable folders using the Admin Panel's subfolder field. */
function appendFolderGroups(container, documents, renderer) {
  const groups = new Map();
  documents.forEach((item) => {
    const raw = typeof item.data.subfolder === "string" ? item.data.subfolder.trim() : "";
    const name = raw || "અન્ય સામગ્રી";
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(item);
  });
  groups.forEach((items, name) => {
    const folder = createElement("section", "content-folder");
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "content-folder-toggle";
    toggle.setAttribute("aria-expanded", "false");
    const titleWrap = createElement("span", "content-folder-title-wrap");
    titleWrap.appendChild(createElement("span", "content-folder-icon", "▣"));
    titleWrap.appendChild(createElement("span", "content-folder-title", name));
    titleWrap.appendChild(createElement("span", "content-folder-count", String(items.length)));
    toggle.appendChild(titleWrap);
    toggle.appendChild(createElement("span", "content-folder-chevron", "＋"));
    const panel = createElement("div", "content-folder-panel");
    panel.hidden = true;
    items.forEach(({ data }) => {
      const card = renderer(data);
      if (card) panel.appendChild(card);
    });
    if (!panel.children.length) return;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
      toggle.querySelector(".content-folder-chevron").textContent = open ? "＋" : "−";
      folder.classList.toggle("is-open", !open);
    });
    folder.appendChild(toggle);
    folder.appendChild(panel);
    container.appendChild(folder);
  });
}

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

      appendFolderGroups(container, documents, (data) => createContentCard(data, {
        className: "live-bhajan-card",
        linkLabel: "ભજન સાંભળો / ખોલો"
      }));

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
      appendFolderGroups(container, documents, (data) => {
        const imageUrl = typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";
        if (!isSafeWebUrl(imageUrl)) return null;

        const card = createElement("article", "gallery-dynamic-card");
        const button = document.createElement("button");
        const image = document.createElement("img");
        const caption = createElement("p", "", typeof data.title === "string" ? data.title : "માતાજીનાં દર્શન");

        button.type = "button";
        button.dataset.photo = imageUrl;
        button.dataset.caption = caption.textContent;
        button.setAttribute("aria-label", caption.textContent + " - ફોટો મોટો જુઓ");
        image.src = imageUrl;
        image.alt = caption.textContent;
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => card.remove(), { once: true });

        button.appendChild(image);
        card.appendChild(button);
        card.appendChild(caption);
        return card;
      });

      if (!container.children.length) {
        container.appendChild(createMessage("હાલ કોઈ ફોટો પ્રકાશિત નથી."));
      }
    })
    .catch((error) => {
      console.error("Could not load gallery:", error);
      container.replaceChildren(createMessage("નવા ફોટા લોડ થઈ શક્યા નથી. ઉપરના ફોટા જોઈ શકો છો."));
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

  // Published festival/event dates are also marked on the monthly calendar.
  getPublishedDocuments(database, "festivals")
    .then((documents) => {
      const dates = {};
      documents.forEach(({ data }) => {
        const rawDate = data.date;
        if (!rawDate) return;
        let key = "";
        if (typeof rawDate === "string") {
          key = rawDate.slice(0, 10);
        } else if (rawDate instanceof Date) {
          key = rawDate.getFullYear()+"-"+String(rawDate.getMonth()+1).padStart(2,"0")+"-"+String(rawDate.getDate()).padStart(2,"0");
        } else if (typeof rawDate.toDate === "function") {
          const date = rawDate.toDate();
          key = date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return;
        const title = String(data.title || data.name || data.heading || "ઉત્સવ").trim();
        if (!dates[key]) dates[key] = [];
        if (title && !dates[key].includes(title)) dates[key].push(title);
      });
      document.dispatchEvent(new CustomEvent("panchang:festivals-updated", { detail: { dates } }));
    })
    .catch((error) => console.warn("Calendar festival dates could not be loaded:", error));
}

/* --------------------------------------------------
   13. Videos
-------------------------------------------------- */

function loadVideos(database) {
  loadCollection(
    database,
    "videos",
    "videosList",
    (data) => {
      // Show a YouTube preview automatically when the admin saved a YouTube link.
      const videoData = { ...data };
      const videoUrl = [data.linkUrl, data.videoUrl, data.url]
        .find((value) => typeof value === "string" && value.trim()) || "";

      if (!videoData.imageUrl && videoUrl) {
        try {
          const parsed = new URL(videoUrl.trim());
          let videoId = "";

          if (parsed.hostname === "youtu.be" || parsed.hostname.endsWith(".youtu.be")) {
            videoId = parsed.pathname.split("/").filter(Boolean)[0] || "";
          } else if (
            parsed.hostname === "youtube.com" ||
            parsed.hostname.endsWith(".youtube.com") ||
            parsed.hostname === "youtube-nocookie.com" ||
            parsed.hostname.endsWith(".youtube-nocookie.com")
          ) {
            videoId = parsed.searchParams.get("v") || "";
            if (!videoId) {
              const match = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/);
              if (match) videoId = match[1];
            }
          }

          if (/^[\w-]{11}$/.test(videoId)) {
            videoData.imageUrl = "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg";
          }
        } catch {
          // Invalid or non-YouTube URLs remain ordinary video links.
        }
      }

      return createContentCard(videoData, {
        linkLabel: "વિડિયો જુઓ"
      });
    },
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


/* --------------------------------------------------
   15. Temple contact and map
   Contact documents: title=phone, content=address, linkUrl=Google Maps URL
-------------------------------------------------- */
function loadContact(database) {
  const container = document.getElementById("contactContent");
  if (!container) return;

  getPublishedDocuments(database, "contact")
    .then((documents) => {
      container.replaceChildren();

      if (!documents.length) {
        container.appendChild(createMessage("સંપર્કની માહિતી ટૂંક સમયમાં અહીં ઉમેરવામાં આવશે."));
        return;
      }

      documents.forEach(({ data }) => {
        const contactCard = createElement("article", "dynamic-content-card contact-info-card");
        contactCard.appendChild(createElement("h3", "contact-card-title", "મંદિરનો સંપર્ક"));

        const phone = typeof data.title === "string" ? data.title.trim() : "";
        const address = [
          data.content,
          data.address,
          data.description,
          data.location
        ].find(value => typeof value === "string" && value.trim())?.trim() || "";
        const mapUrl = typeof data.linkUrl === "string" ? data.linkUrl.trim() : "";

        if (phone) {
          const p = createElement("p", "contact-detail", "ફોન નંબર: ");
          const link = document.createElement("a");
          link.href = "tel:" + phone.replace(/[^+0-9]/g, "");
          link.textContent = phone;
          p.appendChild(link);
          contactCard.appendChild(p);
        }

        if (address) {
          contactCard.appendChild(createElement("p", "contact-detail", "સરનામું: " + address));
        }

        if (contactCard.children.length > 1) {
          container.appendChild(contactCard);
        }

        if (address) {
          const mapCard = createElement("article", "dynamic-content-card contact-map-card");
          const mapHeading = createElement("h3", "contact-map-heading", "મંદિરનો નકશો");
          mapCard.appendChild(mapHeading);

          const mapFrame = document.createElement("iframe");
          mapFrame.className = "contact-map-frame";
          mapFrame.title = "સધી સિકોતર માતાજી મંદિર ઉદલપુરધામનો નકશો";
          mapFrame.src = "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d206.8527750303821!2d72.4825795!3d23.5585248!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395c47d8ca1fb72f%3A0xfc8513185e3411fa!2sSadhi%20sikotar%20dham%20udalpur!5e1!3m2!1sen!2sin!4v1792557346113!5m2!1sen!2sin";
          mapFrame.width = "600";
          mapFrame.height = "450";
          mapFrame.loading = "lazy";
          mapFrame.referrerPolicy = "strict-origin-when-cross-origin";
          mapFrame.allowFullscreen = true;
          mapFrame.setAttribute("aria-label", "મંદિરનું Google Maps સ્થાન");
          mapCard.appendChild(mapFrame);

          if (mapUrl && isSafeWebUrl(mapUrl)) {
            const mapLink = createSafeLink(mapUrl, "Google Mapsમાં રસ્તો જુઓ");
            if (mapLink) {
              mapLink.className = "button-link contact-map-link";
              mapCard.appendChild(mapLink);
            }
          }

          container.appendChild(mapCard);
        }
      });
    })
    .catch((error) => {
      console.error("Could not load contact information:", error);
      container.replaceChildren(createMessage("સંપર્કની માહિતી લોડ થઈ શકી નથી. પછી ફરી પ્રયાસ કરો."));
    });
}


/* --------------------------------------------------
   Gujarati monthly calendar (displayed inside the website)
-------------------------------------------------- */
function initializeGujaratiCalendar() {
  const grid = document.getElementById("calendarMonthDual");
  const title = document.getElementById("calendarMonthTitle");
  const previous = document.getElementById("calendarPrev");
  const next = document.getElementById("calendarNext");
  const todayButton = document.getElementById("calendarToday");
  const selectedLabel = document.getElementById("calendarSelectedDate");
  const choghadiyaList = document.getElementById("choghadiyaList");
  const choghadiyaDateLabel = document.getElementById("choghadiyaDateLabel");
  if (!grid || !title || !previous || !next) return;

  const now = new Date();
  const dateOnly = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  let shownMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let selectedDate = dateOnly(now);
  let choghadiyaMode = "day";
  const guMonth = new Intl.DateTimeFormat("gu-IN", { month: "long", year: "numeric" });
  const enMonth = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
  const guNumber = value => new Intl.NumberFormat("gu-IN").format(value);
  const isoDate = d => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const weekdays = ["રવિ","સોમ","મંગળ","બુધ","ગુરુ","શુક્ર","શનિ"];
  const englishWeekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const choghadiyaNames = ["ઉદ્વેગ","ચર","લાભ","અમૃત","કાળ","શુભ","રોગ"];
  const weekdaySequence = [
    [0,1,2,3,4,5,6,1],
    [6,0,1,2,3,4,5,0],
    [5,6,0,1,2,3,4,6],
    [4,5,6,0,1,2,3,5],
    [3,4,5,6,0,1,2,4],
    [2,3,4,5,6,0,1,3],
    [1,2,3,4,5,6,0,2]
  ];
  const nightSequence = [
    [4,5,6,0,1,2,3,5],
    [3,4,5,6,0,1,2,4],
    [2,3,4,5,6,0,1,3],
    [1,2,3,4,5,6,0,2],
    [0,1,2,3,4,5,6,1],
    [6,0,1,2,3,4,5,0],
    [5,6,0,1,2,3,4,6]
  ];

  function timeText(totalMinutes) {
    const mins = ((totalMinutes % 1440) + 1440) % 1440;
    const h = Math.floor(mins/60), m = mins%60;
    return String(h%12 || 12).padStart(2,"0")+":"+String(m).padStart(2,"0")+" "+(h<12?"AM":"PM");
  }

  let panchangRequestId = 0;
  function renderChoghadiya() {
    const dayList = document.getElementById("choghadiyaDayList");
    const nightList = document.getElementById("choghadiyaNightList");
    const dateLabel = document.getElementById("choghadiyaDateLabel");
    if (dateLabel) dateLabel.textContent = new Intl.DateTimeFormat("gu-IN", { dateStyle: "full" }).format(selectedDate);
    [dayList, nightList].forEach(list => {
      if (!list) return;
      list.replaceChildren();
      const message = document.createElement("p");
      message.className = "choghadiya-empty";
      message.textContent = "ઉદલપુર ધામનું પંચાંગ લોડ થઈ રહ્યું છે…";
      list.appendChild(message);
    });
    const selectedISO = isoDate(selectedDate);
    document.dispatchEvent(new CustomEvent("panchang:select-date", { detail: { date: selectedISO, source: "calendar" } }));
    loadUdalpurPanchang(selectedISO, ++panchangRequestId);
  }

  async function loadUdalpurPanchang(date, requestId) {
    const workerURL = "https://sadhi-sikotar-udalpur-dham.moral-prem24.workers.dev/panchang";
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value == null || value === "" ? "ઉપલબ્ધ નથી" : String(value); };
    const pick = (obj, keys) => {
      for (const key of keys) {
        const value = key.split(".").reduce((v, part) => v && v[part] != null ? v[part] : undefined, obj);
        if (value != null && value !== "") return value;
      }
      return undefined;
    };
    const gu = value => typeof value === "number" ? new Intl.NumberFormat("gu-IN").format(value) : value;
    const clock = value => {
      if (value == null || value === "") return "ઉપલબ્ધ નથી";
      if (typeof value === "string") return value;
      if (typeof value === "number" && value < 1440) {
        const h = Math.floor(value / 60), m = Math.round(value % 60);
        return String(h % 12 || 12).padStart(2,"0")+":"+String(m).padStart(2,"0")+" "+(h < 12 ? "AM" : "PM");
      }
      return String(value);
    };
    const drawList = (el, items) => {
      if (!el) return;
      el.replaceChildren();
      if (!Array.isArray(items) || !items.length) {
        const p = document.createElement("p");
        p.className = "choghadiya-empty";
        p.textContent = "આ માહિતી API માંથી ઉપલબ્ધ નથી.";
        el.appendChild(p);
        return;
      }
      items.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "choghadiya-row";
        const name = pick(item, ["name","choghadiya","label","type","title"]) ?? (typeof item === "string" ? item : "સમયખંડ "+(index+1));
        const start = pick(item, ["start","start_time","from","startTime","begin"]);
        const end = pick(item, ["end","end_time","to","endTime","finish"]);
        const span = document.createElement("span");
        span.textContent = String(name);
        const time = document.createElement("strong");
        time.textContent = start != null || end != null ? clock(start)+" – "+clock(end) : String(pick(item,["time","timing","duration"]) ?? "");
        row.append(span,time);
        el.appendChild(row);
      });
    };
    try {
      const response = await fetch(workerURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "પંચાંગ API જવાબ આપતું નથી");
      if (requestId !== panchangRequestId) return;
      const p = data.panchang || {};
      const nested = p.data || p.result || p;
      const c = data.choghadiya || {};
      const ch = c.data || c.result || c;
      const tithi = pick(nested, ["tithi.name","tithi_name","tithiName","tithi"]);
      const paksha = pick(nested, ["tithi.paksha","paksha.name","paksha","fortnight"]);
      const nakshatra = pick(nested, ["nakshatra.name","nakshatra_name","nakshatraName","nakshatra"]);
      const yoga = pick(nested, ["yoga.name","yoga_name","yogaName","yoga"]);
      const karana = pick(nested, ["karana.name","karana_name","karanaName","karana"]);
      const samvat = pick(nested, ["vikram_samvat","vikramSamvat","samvat.vikram","samvat.vikram_samvat","samvat"]);
      set("panchangTithi", [paksha,tithi].filter(Boolean).map(String).join(" — ") || "તિથિ API માંથી ઓળખી શકાઈ નથી");
      set("panchangNakshatra", nakshatra ?? "નક્ષત્ર ઉપલબ્ધ નથી");
      set("panchangYoga", yoga ?? "યોગ ઉપલબ્ધ નથી");
      set("panchangKarana", karana ?? "કરણ ઉપલબ્ધ નથી");
      set("panchangSamvat", samvat == null ? "સંવત ઉપલબ્ધ નથી" : gu(samvat));
      set("panchangLocation", "ઉદલપુર ધામ, ગુજરાત • "+date);
      const sunrise = pick(nested, ["sunrise.time","sunrise","sun_rise","sunrise_time","sun_times.sunrise","sunTimes.sunrise"]);
      const sunset = pick(nested, ["sunset.time","sunset","sun_set","sunset_time","sun_times.sunset","sunTimes.sunset"]);
      const moonrise = pick(nested, ["moonrise.time","moonrise","moon_rise","moonrise_time","moon_times.moonrise","moonTimes.moonrise"]);
      const moonset = pick(nested, ["moonset.time","moonset","moon_set","moonset_time","moon_times.moonset","moonTimes.moonset"]);
      const sunGrid = document.querySelector(".panchang-sun-grid");
      if (sunGrid) [sunrise,sunset,moonrise,moonset].forEach((value,i) => {
        const card = sunGrid.querySelectorAll("div")[i];
        const strong = card && card.querySelector("strong, b");
        if (strong) strong.textContent = clock(value);
      });
      const dayItems = pick(ch, ["day","day.choghadiya","day_choghadiya","dayChoghadiya","daytime","day_list","dayList","day_slots","daySlots","day_windows"]);
      const nightItems = pick(ch, ["night","night.choghadiya","night_choghadiya","nightChoghadiya","nighttime","night_list","nightList","night_slots","nightSlots","night_windows"]);
      drawList(document.getElementById("choghadiyaDayList"), dayItems);
      drawList(document.getElementById("choghadiyaNightList"), nightItems);
    } catch (error) {
      if (requestId !== panchangRequestId) return;
      console.error("Udalpur Panchang load failed:", error);
      set("panchangTithi", "લાઇવ પંચાંગ લોડ થઈ શક્યું નથી");
      set("panchangNakshatra", "Worker/API કનેક્શન તપાસવું પડશે");
      [document.getElementById("choghadiyaDayList"),document.getElementById("choghadiyaNightList")].forEach(el => {
        if (!el) return;
        el.replaceChildren();
        const msg=document.createElement("p"); msg.className="choghadiya-empty";
        msg.textContent="ચોક્કસ સમય ઉપલબ્ધ નથી. API જવાબ ચકાસવો પડશે."; el.appendChild(msg);
      });
    }
  }

  function render() {
    grid.replaceChildren();
    title.textContent = guMonth.format(shownMonth)+"  •  "+enMonth.format(shownMonth);
    const header = document.createElement("div");
    header.className = "calendar-weekdays";
    weekdays.forEach((day,i) => {
      const cell = document.createElement("div");
      cell.textContent = day+" / "+englishWeekdays[i];
      header.appendChild(cell);
    });
    grid.appendChild(header);
    const daysGrid = document.createElement("div");
    daysGrid.className = "calendar-days-grid";
    const first = new Date(shownMonth.getFullYear(),shownMonth.getMonth(),1).getDay();
    const total = new Date(shownMonth.getFullYear(),shownMonth.getMonth()+1,0).getDate();
    for(let i=0;i<first;i++){
      const blank=document.createElement("div"); blank.className="calendar-date empty"; daysGrid.appendChild(blank);
    }
    for(let day=1;day<=total;day++){
      const date=new Date(shownMonth.getFullYear(),shownMonth.getMonth(),day);
      const button=document.createElement("button");
      button.type="button"; button.className="calendar-date";
      button.appendChild(document.createTextNode(guNumber(day)));
      const small=document.createElement("small");
      small.textContent=String(day);
      button.appendChild(small);
      if(date.toDateString()===dateOnly(now).toDateString()) button.classList.add("today");
      if(date.toDateString()===selectedDate.toDateString()) button.classList.add("selected");
      button.setAttribute("aria-label",new Intl.DateTimeFormat("gu-IN",{dateStyle:"full"}).format(date));
      button.addEventListener("click",()=>{selectedDate=dateOnly(date);render();renderChoghadiya();});
      daysGrid.appendChild(button);
    }
    grid.appendChild(daysGrid);
    if(selectedLabel) selectedLabel.textContent = "પસંદ કરેલી તારીખ: "+new Intl.DateTimeFormat("gu-IN",{dateStyle:"full"}).format(selectedDate)+"  |  "+new Intl.DateTimeFormat("en-IN",{dateStyle:"full"}).format(selectedDate);
    renderChoghadiya();
  }
  previous.addEventListener("click",()=>{shownMonth=new Date(shownMonth.getFullYear(),shownMonth.getMonth()-1,1);render();});
  next.addEventListener("click",()=>{shownMonth=new Date(shownMonth.getFullYear(),shownMonth.getMonth()+1,1);render();});
  if(todayButton) todayButton.addEventListener("click",()=>{selectedDate=dateOnly(new Date());shownMonth=new Date(selectedDate.getFullYear(),selectedDate.getMonth(),1);render();});
  document.querySelectorAll("[data-choghadiya]").forEach(button=>button.addEventListener("click",()=>{
    choghadiyaMode=button.dataset.choghadiya;
    document.querySelectorAll("[data-choghadiya]").forEach(b=>b.classList.toggle("active",b===button));
    renderChoghadiya();
  }));
  render();
}

/* Live Panchang data for Ahmedabad. Source: ShastraPanchangam public API. */
function initializePanchangDateControls() {
  const label = document.getElementById("panchangDateLabel");
  const prev = document.getElementById("panchangPrev");
  const next = document.getElementById("panchangNext");
  const today = document.getElementById("panchangToday");
  if (!label || !prev || !next || !today) return;

  let selected = new Date();
  const formatter = new Intl.DateTimeFormat("gu-IN", { day: "2-digit", month: "long", year: "numeric" });
  const digits = value => new Intl.NumberFormat("gu-IN").format(value);
  const tithis = ["", "પ્રથમા", "બીજ", "ત્રીજ", "ચોથ", "પાંચમ", "છઠ્ઠ", "સાતમ", "આઠમ", "નોમ", "દસમ", "એકાદશી", "બારસ", "તેરસ", "ચૌદસ", "પૂર્ણિમા", "અમાસ"];
  const nakshatras = ["અશ્વિની","ભરણી","કૃતિકા","રોહિણી","મૃગશીર્ષ","આર્દ્રા","પુનર્વસુ","પુષ્ય","આશ્લેષા","મઘા","પૂર્વા ફાલ્ગુની","ઉત્તરા ફાલ્ગુની","હસ્ત","ચિત્રા","સ્વાતિ","વિશાખા","અનુરાધા","જ્યેષ્ઠા","મૂળ","પૂર્વાષાઢા","ઉત્તરાષાઢા","શ્રવણ","ધનિષ્ઠા","શતભિષા","પૂર્વાભાદ્રપદ","ઉત્તરાભાદ્રપદ","રેવતી"];
  const byId = id => document.getElementById(id);
  function setText(id, text) { const el = byId(id); if (el) el.textContent = text; }
  function clock(minutes) {
    if (typeof minutes !== "number" || !Number.isFinite(minutes)) return "ઉપલબ્ધ નથી";
    const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
    return new Intl.DateTimeFormat("gu-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(new Date(Date.UTC(2020,0,1,Math.floor(m/60),m%60)));
  }
  function isoDate(date) {
    return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
  }
  async function loadDay() {
    label.textContent = formatter.format(selected);
    today.setAttribute("aria-pressed", String(new Date().toDateString() === selected.toDateString()));
    const stamp = isoDate(selected);
    setText("panchangTithi", "પંચાંગ લોડ થઈ રહ્યું છે…");
    try {
      let d;
      try {
        const response = await fetch("https://shastrapanchangam.com/api/v1/day/ahmedabad/"+stamp+".json", { cache: "no-store" });
        if (!response.ok) throw new Error("Primary Panchang API response "+response.status);
        const payload = await response.json();
        d = payload.day || payload;
      } catch (primaryError) {
        console.warn("Primary Panchang source unavailable; trying fallback:", primaryError);
        const fallbackResponse = await fetch("https://api.apimitra.in/panchang?city=ahmedabad&date="+stamp, { cache: "no-store" });
        if (!fallbackResponse.ok) throw new Error("Fallback Panchang API response "+fallbackResponse.status);
        const fallback = await fallbackResponse.json();
        if (fallback.status && fallback.status !== "ok") throw new Error("Fallback Panchang data unavailable");
        const parseClock = value => {
          if (typeof value !== "string") return null;
          const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
          if (!match) return null;
          let hour = Number(match[1]) % 12;
          if ((match[3] || "").toUpperCase() === "PM") hour += 12;
          return hour * 60 + Number(match[2]);
        };
        d = {
          tithi_name: fallback.tithi || "તિથિ ઉપલબ્ધ નથી",
          paksha: fallback.paksha === "Shukla" ? "Shukla" : fallback.paksha === "Krishna" ? "Krishna" : "",
          nakshatra_name: fallback.nakshatra || "નક્ષત્ર ઉપલબ્ધ નથી",
          sunrise: parseClock(fallback.sunrise),
          sunset: parseClock(fallback.sunset),
          moonrise: parseClock(fallback.moonrise),
          moonset: parseClock(fallback.moonset),
          rahu_kalam: parseClock(fallback.rahu_kalam || fallback.rahukaal),
          vikram_samvat: fallback.vikram_samvat || fallback.samvat,
          tithi_ends: null
        };
        d._fallback = true;
      }
      const paksha = d.paksha === "Shukla" ? "શુક્લ પક્ષ" : d.paksha === "Krishna" ? "કૃષ્ણ પક્ષ" : "";
      const tithiName = d.tithi_name || tithis[d.tithi] || "તિથિ ઉપલબ્ધ નથી";
      setText("panchangTithi", paksha ? paksha+" — "+tithiName : tithiName);
      setText("panchangNakshatra", d.nakshatra_name || (d.nakshatra ? nakshatras[(d.nakshatra-1)%27] : "નક્ષત્ર ઉપલબ્ધ નથી"));
      setText("panchangLocation", "અમદાવાદ, ગુજરાત • "+formatter.format(selected));
      const samvat = d.vikram_samvat ?? d.vikramSamvat ?? d.samvat;
      setText("panchangSamvat", samvat !== undefined && samvat !== null && String(samvat).trim() !== "" ? digits(samvat) : "ચોક્કસ સંવત ઉપલબ્ધ નથી");
      const sunrise=d.sunrise, sunset=d.sunset, moonrise=d.moonrise, moonset=d.moonset;
      const sunGrid=document.querySelector(".panchang-sun-grid");
      if (sunGrid) {
        const vals=[sunrise,sunset,moonrise,moonset];
        const labels=["સૂર્યોદય","સૂર્યાસ્ત","ચંદ્રોદય","ચંદ્રાસ્ત"];
        sunGrid.querySelectorAll("div").forEach((card,i)=>{ const b=card.querySelector("b"); if(b) b.textContent=clock(vals[i]); });
      }
      const rahu=typeof d.rahu_kalam==="number" ? clock(d.rahu_kalam)+" (શરૂઆતનો સમય)" : "ઉપલબ્ધ નથી";
      const muhurta=document.querySelector(".panchang-muhurta-card");
      if(muhurta) { const strong=muhurta.querySelectorAll("strong"); if(strong[0]) strong[0].textContent=rahu; }
      setText("panchangFestival", "તહેવાર/વ્રત: આ તારીખ માટે અલગથી ચકાસો");
      setText("panchangFestival2", "તિથિ સમાપ્તિ: "+(typeof d.tithi_ends==="number" ? clock(d.tithi_ends) : "ઉપલબ્ધ નથી"));
    } catch (error) {
      console.error("Live Panchang load failed:", error);
      setText("panchangTithi", "લાઇવ તિથિ લોડ થઈ શકી નથી");
      setText("panchangNakshatra", "કૃપા કરીને ઇન્ટરનેટ કનેક્શન તપાસો");
    }
  }
  function syncCalendarToSelectedDate() {
    document.dispatchEvent(new CustomEvent("panchang:select-date", { detail: { date: isoDate(selected), source: "panchang-controls" } }));
  }
  prev.addEventListener("click", () => { selected.setDate(selected.getDate()-1); syncCalendarToSelectedDate(); });
  next.addEventListener("click", () => { selected.setDate(selected.getDate()+1); syncCalendarToSelectedDate(); });
  today.addEventListener("click", () => { selected = new Date(); syncCalendarToSelectedDate(); });
  document.querySelectorAll("[data-panchang-tab]").forEach(button => button.addEventListener("click", () => {
    const panel = document.getElementById(button.dataset.panchangTab === "calendar" ? "panchangCalendarPanel" : "panchang-live-panel");
    if (panel) panel.scrollIntoView({ behavior:"smooth", block:"start" });
  }));
  document.addEventListener("panchang:select-date", event => {
    const parts = String(event.detail?.date || "").split("-").map(Number);
    if (parts.length === 3 && parts.every(Number.isFinite)) {
      selected = new Date(parts[0], parts[1]-1, parts[2]);
      loadDay();
    }
  });
  loadDay();
}
