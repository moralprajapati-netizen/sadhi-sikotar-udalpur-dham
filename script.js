
document.addEventListener("DOMContentLoaded", async function () {
  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile menu
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Gallery lightbox
  const galleryCards = document.querySelectorAll(".gallery-card");
  const lightbox = document.getElementById("photoLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const closeButton = document.getElementById("closeLightbox");

  if (lightbox && lightboxImage && closeButton) {
    galleryCards.forEach(function (card) {
      card.addEventListener("click", function () {
        const photo = card.getAttribute("data-photo");
        const caption = card.getAttribute("data-caption") || "";

        if (!photo) return;

        lightboxImage.src = photo;
        lightboxImage.alt = caption || "માતાજીનાં દિવ્ય દર્શન";

        if (lightboxCaption) {
          lightboxCaption.textContent = caption;
        }

        if (!lightbox.open) lightbox.showModal();
      });
    });

    closeButton.addEventListener("click", function () {
      lightbox.close();
    });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) lightbox.close();
    });

    lightbox.addEventListener("close", function () {
      lightboxImage.removeAttribute("src");
    });
  }

  // Published bhajans from Firestore
  const bhajanList = document.getElementById("bhajanList");
  const bhajanStatus = document.getElementById("bhajanStatus");

  if (!bhajanList || !bhajanStatus) return;

  function showBhajanStatus(message) {
    bhajanStatus.textContent = message;
  }

  function addTextElement(parent, tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function addSafeLink(parent, url, label) {
    if (!url) return;

    try {
      const parsed = new URL(url);
      if (!["https:", "http:"].includes(parsed.protocol)) return;

      const link = document.createElement("a");
      link.href = parsed.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = label;
      parent.appendChild(link);
    } catch {
      // Ignore malformed links.
    }
  }

  async function loadFirebaseSdk() {
    if (window.firebase && window.firebase.firestore) return;

    function loadScript(src) {
      return new Promise(function (resolve, reject) {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error("Firebase SDK લોડ થયું નહીં."));
        document.head.appendChild(script);
      });
    }

    if (!window.firebase) {
      await loadScript(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
      );
    }

    if (!window.firebase.firestore) {
      await loadScript(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"
      );
    }
  }

  try {
    showBhajanStatus("પ્રકાશિત ભજનો લોડ થઈ રહ્યાં છે...");

    await loadFirebaseSdk();

    const firebaseConfig = {
      apiKey: "AIzaSyAdo3BhBLiBtLp_by35Z_w00lNcALxk72k",
      authDomain: "sadhi-sikotar-udalpur-dham.firebaseapp.com",
      projectId: "sadhi-sikotar-udalpur-dham",
      storageBucket: "sadhi-sikotar-udalpur-dham.firebasestorage.app",
      messagingSenderId: "579984682526",
      appId: "1:579984682526:web:6348d8e57d3381e557080f",
      measurementId: "G-775X1KW7VX"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    const db = firebase.firestore();

    const snapshot = await db.collection("bhajans")
      .where("published", "==", true)
      .get();

    bhajanList.replaceChildren();

    if (snapshot.empty) {
      showBhajanStatus(
        "હાલ કોઈ ભજન પ્રકાશિત નથી. એડમિન પેનલમાંથી ભજન ઉમેરો."
      );
      return;
    }

    const documents = snapshot.docs.slice().sort(function (a, b) {
      const aTime = a.data().createdAt?.toMillis?.() || 0;
      const bTime = b.data().createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    documents.forEach(function (doc) {
      const item = doc.data();
      const card = document.createElement("article");
      card.className = "live-bhajan-card";

      addTextElement(card, "h3", item.title || "માતાજીનું ભજન");

      if (item.content) {
        addTextElement(card, "p", item.content);
      }

      addSafeLink(card, item.linkUrl, "▶ ભજન સાંભળો / વિડિયો જુઓ");

      bhajanList.appendChild(card);
    });

    showBhajanStatus("પ્રકાશિત ભજનો: " + documents.length);
  } catch (error) {
    console.error("Bhajan loading error:", error);
    showBhajanStatus(
      "ભજનો લોડ થઈ શક્યાં નથી. ઇન્ટરનેટ અને Firestore Rules તપાસો."
    );
  }
});
