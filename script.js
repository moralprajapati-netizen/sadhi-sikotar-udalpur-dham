
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
  const grid = document.getElementById("gujaratiCalendar");
  const title = document.getElementById("calendarMonthTitle");
  const previous = document.getElementById("calendarPrev");
  const next = document.getElementById("calendarNext");
  if (!grid || !title || !previous || !next) return;

  const now = new Date();
  let shownMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthFormatter = new Intl.DateTimeFormat("gu-IN", { month: "long", year: "numeric" });
  const number = value => new Intl.NumberFormat("gu-IN").format(value);
  const weekdays = ["રવિ", "સોમ", "મંગળ", "બુધ", "ગુરુ", "શુક્ર", "શનિ"];
  const isoDate = date => date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");

  function render() {
    grid.replaceChildren();
    title.textContent = monthFormatter.format(shownMonth);
    weekdays.forEach(day => {
      const cell = document.createElement("div");
      cell.className = "calendar-day weekday";
      cell.textContent = day;
      grid.appendChild(cell);
    });

    const firstWeekday = new Date(shownMonth.getFullYear(), shownMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 0).getDate();

    for (let i = 0; i < firstWeekday; i++) {
      const blank = document.createElement("div");
      blank.className = "calendar-day empty";
      blank.setAttribute("aria-hidden", "true");
      grid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(shownMonth.getFullYear(), shownMonth.getMonth(), day);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "calendar-day";
      cell.dataset.calendarDate = isoDate(cellDate);
      cell.setAttribute("aria-label", new Intl.DateTimeFormat("gu-IN", { dateStyle: "full" }).format(cellDate));
      if (cellDate.toDateString() === now.toDateString()) cell.classList.add("today");
      if (cellDate.toDateString() === selectedDate.toDateString()) cell.classList.add("selected");
      cell.append(document.createTextNode(number(day)));
      const small = document.createElement("small");
      small.textContent = cellDate.toLocaleDateString("gu-IN", { weekday: "short" });
      cell.appendChild(small);
      cell.addEventListener("click", () => {
        selectedDate = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
        render();
        document.dispatchEvent(new CustomEvent("panchang:select-date", { detail: { date: isoDate(selectedDate) } }));
        const panel = document.getElementById("panchang-live-panel");
        if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      grid.appendChild(cell);
    }
  }

  previous.addEventListener("click", () => {
    shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1);
    render();
  });
  next.addEventListener("click", () => {
    shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1);
    render();
  });
  document.addEventListener("panchang:select-date", event => {
    const parts = String(event.detail?.date || "").split("-").map(Number);
    if (parts.length === 3 && parts.every(Number.isFinite)) {
      selectedDate = new Date(parts[0], parts[1]-1, parts[2]);
      shownMonth = new Date(parts[0], parts[1]-1, 1);
      render();
    }
  });
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
    return new Intl.DateTimeFormat("gu-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(new Date(Date.UTC(2020,0,1,0,m)));
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
      const response = await fetch("https://shastrapanchangam.com/api/v1/day/ahmedabad/"+stamp+".json", { cache: "no-store" });
      if (!response.ok) throw new Error("Panchang API response "+response.status);
      const payload = await response.json();
      const d = payload.day || payload;
      const paksha = d.paksha === "Shukla" ? "શુક્લ પક્ષ" : d.paksha === "Krishna" ? "કૃષ્ણ પક્ષ" : "";
      const tithiName = d.tithi_name || tithis[d.tithi] || "તિથિ ઉપલબ્ધ નથી";
      setText("panchangTithi", paksha ? paksha+" — "+tithiName : tithiName);
      setText("panchangNakshatra", d.nakshatra_name || (d.nakshatra ? nakshatras[(d.nakshatra-1)%27] : "નક્ષત્ર ઉપલબ્ધ નથી"));
      setText("panchangLocation", "અમદાવાદ, ગુજરાત • "+formatter.format(selected));
      setText("panchangSamvat", digits(selected.getFullYear()+57)+" (અંદાજિત વિક્રમ સંવત)");
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
  prev.addEventListener("click", () => { selected.setDate(selected.getDate()-1); loadDay(); syncCalendarToSelectedDate(); });
  next.addEventListener("click", () => { selected.setDate(selected.getDate()+1); loadDay(); syncCalendarToSelectedDate(); });
  today.addEventListener("click", () => { selected = new Date(); loadDay(); syncCalendarToSelectedDate(); });
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
