// ---- Data for cards ---- //
const pieces = [
  {
    id: "hoodie-outsider",
    title: "Outsider Hoodie",
    category: "streetwear",
    tags: ["hoodie", "unisex", "black"],
    excerpt: "A heavyweight hoodie for the ones who never fit in.",
    story:
      "Everyone tells you to be yourself, then gives you a script. The Outsider Hoodie is a quiet refusal of that script – oversized, heavy, and unapologetic.",
  },
  {
    id: "tee-ghosted",
    title: "Ghosted T-Shirt",
    category: "streetwear",
    tags: ["t-shirt", "graphic", "white"],
    excerpt: "For the messages that stayed in drafts.",
    story:
      "Text bubbles left on read. Calls that never ring back. The Ghosted Tee is a soft reminder that you’re still here, even when they vanish.",
  },
  {
    id: "print-fractured",
    title: "Fractured Print",
    category: "art",
    tags: ["print", "wall art", "abstract"],
    excerpt: "Broken pieces that don’t want to be whole.",
    story:
      "Not everything that shatters wants to be fixed. Fractured explores the quiet power of being okay with your own cracks.",
  },
  {
    id: "zine-misread",
    title: "Misread Zine",
    category: "story",
    tags: ["zine", "writing", "limited"],
    excerpt: "Short stories about being misunderstood on purpose.",
    story:
      "This zine is a collage of miscommunications, half-truths, and things you said only in your head. Every page feels like a conversation you almost had.",
  },
];

// ---- NEW: Gallery data (replace URLs with your real images) ----
const galleryImages = [
  {
    id: "gallery-1",
    src: "Images/Neonlihts.jpg",
    alt: "Model wearing the Misunderstood Hoodie under neon light",
    title: "Outsider Under Neon",
  },
  {
    id: "gallery-2",
    src: "images/StairModel.jpg",
    alt: "Misunderstood World hoodie on stairs",
    title: "Ghosted In Transit",
  },
  {
    id: "gallery-3",
    src: "images/gallery/fractured-print-wall.jpg",
    alt: "Fractured art print on a cracked concrete wall",
    title: "Fractured On Concrete",
  },
  {
    id: "gallery-4",
    src: "images/gallery/zine-misread-table.jpg",
    alt: "Misread Zine open on a table with coffee stains",
    title: "Misread In The Margins",
  },
  {
    id: "gallery-5",
    src: "images/gallery/campaign-group-shot.jpg",
    alt: "Group shot of misfit models wearing Misunderstood World",
    title: "The Misunderstood Crew",
  },
];

// ---- Utility: create element with attributes and children ----
function createEl(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "class") el.className = value;
    else if (key === "dataset") {
      Object.entries(value).forEach(([dKey, dVal]) => {
        el.dataset[dKey] = dVal;
      });
    } else if (key.startsWith("on") && typeof value === "function") {
      // allow inline event registration: onClick, onMouseenter, etc.
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  });

  children.flat().forEach((child) => {
    if (child == null) return;
    if (typeof child === "string") el.appendChild(document.createTextNode(child));
    else el.appendChild(child);
  });

  return el;
}

// ---- Dynamic card rendering ----
const cardContainer = document.getElementById("card-container");

function renderCards(data) {
  // Use DocumentFragment for performance
  const fragment = document.createDocumentFragment();
  data.forEach((item) => {
    const card = createEl(
      "article",
      {
        class: "mw-card",
        dataset: { id: item.id, category: item.category },
        tabIndex: 0,
      },
      createEl("div", { class: "mw-card-category" }, item.category),
      createEl("h3", { class: "mw-card-title" }, item.title),
      createEl("p", {}, item.excerpt),
      createEl(
        "div",
        { class: "mw-card-tags" },
        "Tags: ",
        item.tags.join(", ")
      )
    );
    fragment.appendChild(card);
  });

  cardContainer.innerHTML = ""; // clear previous
  cardContainer.appendChild(fragment);
}

// Initial render
renderCards(pieces);

// ---- Filtering and search (dynamic DOM updates) ----
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const filtered = pieces.filter((p) => {
    const matchCategory = category === "all" || p.category === category;
    const matchQuery =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.tags.join(" ").toLowerCase().includes(query) ||
      p.excerpt.toLowerCase().includes(query);
    return matchCategory && matchQuery;
  });

  renderCards(filtered);
  observeCardsForReveal(); // re-attach observer after re-render
}

searchInput.addEventListener("input", debounce(applyFilters, 200));
categoryFilter.addEventListener("change", applyFilters);

// ---- Debounce helper to avoid excessive DOM work ----
function debounce(fn, delay = 200) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// ---- Theme toggle with localStorage ----
const themeToggleBtn = document.getElementById("theme-toggle");
const body = document.body;

function setTheme(theme) {
  body.dataset.theme = theme;
  localStorage.setItem("mw-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const current = body.dataset.theme === "dark" ? "dark" : "light";
  setTheme(current === "dark" ? "light" : "dark");
}

themeToggleBtn.addEventListener("click", toggleTheme);

// Load saved theme on first paint
const savedTheme = localStorage.getItem("mw-theme");
if (savedTheme === "dark" || savedTheme === "light") {
  setTheme(savedTheme);
} else {
  // optional: match system preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
}

// ---- Modal system created fully via DOM manipulation ----
const modalRoot = document.getElementById("modal-root");

function openModal(piece) {
  closeModal(); // ensure clean state

  const modal = createEl(
    "div",
    { class: "mw-modal", role: "dialog", "aria-modal": "true" },
    createEl(
      "button",
      {
        class: "mw-modal-close",
        ariaLabel: "Close",
        onClick: closeModal,
      },
      "×"
    ),
    createEl("h3", {}, piece.title),
    createEl("p", {}, piece.story),
    createEl(
      "p",
      { style: "font-size:0.9rem;color:gray;margin-top:1.5rem;" },
      "Category: ",
      piece.category,
      " • Tags: ",
      piece.tags.join(", ")
    )
  );

  const backdrop = createEl(
    "div",
    {
      class: "mw-modal-backdrop",
      onClick: (e) => {
        if (e.target === e.currentTarget) closeModal(); // only backdrop
      },
    },
    modal
  );

  modalRoot.innerHTML = "";
  modalRoot.appendChild(backdrop);
  document.addEventListener("keydown", escToClose);
}

function closeModal() {
  modalRoot.innerHTML = "";
  document.removeEventListener("keydown", escToClose);
}

function escToClose(e) {
  if (e.key === "Escape") closeModal();
}

// ---- Event delegation for cards (click + keyboard) ----
cardContainer.addEventListener("click", (e) => {
  const card = e.target.closest(".mw-card");
  if (!card) return;
  const id = card.dataset.id;
  const piece = pieces.find((p) => p.id === id);
  if (piece) openModal(piece);
});

cardContainer.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".mw-card");
  if (!card) return;
  const id = card.dataset.id;
  const piece = pieces.find((p) => p.id === id);
  if (piece) {
    e.preventDefault();
    openModal(piece);
  }
});

// ---- Smooth scroll to collection button ----
const scrollBtn = document.getElementById("scroll-to-collection");
const gridSection = document.getElementById("brand-grid");

scrollBtn.addEventListener("click", () => {
  gridSection.scrollIntoView({ behavior: "smooth" });
});

// ---- IntersectionObserver: reveal cards on scroll ----
let cardObserver;

function observeCardsForReveal() {
  if (cardObserver) cardObserver.disconnect();

  cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          cardObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  document
    .querySelectorAll(".mw-card")
    .forEach((card) => cardObserver.observe(card));
}

// initial call
observeCardsForReveal();

// ---- IntersectionObserver: active nav link based on section in view ----
const navLinks = document.querySelectorAll(".mw-nav .nav-link");
const sections = Array.from(
  document.querySelectorAll("section[id]")
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      const link = document.querySelector(`.mw-nav .nav-link[href="#${id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      }
    });
  },
  {
    threshold: 0.4,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

// ---- Render gallery thumbnails ----
const galleryGrid = document.getElementById("gallery-grid");

function renderGallery(images) {
  if (!galleryGrid) return;
  const fragment = document.createDocumentFragment();

  images.forEach((img, index) => {
    const item = createEl(
      "div",
      {
        class: "gallery-item",
        dataset: { index },
        tabIndex: 0,
      },
      createEl("img", {
        src: img.src,
        alt: img.alt,
        loading: "lazy",
      }),
      createEl("div", { class: "gallery-caption" }, img.title)
    );
    fragment.appendChild(item);
  });

  galleryGrid.innerHTML = "";
  galleryGrid.appendChild(fragment);
}

// Initial gallery render
renderGallery(galleryImages);

// ---- Lightbox logic ----
const lightboxRoot = document.getElementById("lightbox-root");
let currentLightboxIndex = null;

function openLightbox(index) {
  index = Number(index);
  if (Number.isNaN(index) || index < 0 || index >= galleryImages.length) return;
  currentLightboxIndex = index;

  const image = galleryImages[index];

  // Clean previous
  closeLightbox();

  const imgEl = createEl("img", {
    src: image.src,
    alt: image.alt,
  });

  const wrapper = createEl(
    "div",
    { class: "mw-lightbox-image-wrapper" },
    imgEl,
    createEl(
      "button",
      {
        class: "mw-lightbox-arrow mw-lightbox-arrow--prev",
        ariaLabel: "Previous image",
        onClick: (e) => {
          e.stopPropagation();
          showPrevImage();
        },
      },
      "‹"
    ),
    createEl(
      "button",
      {
        class: "mw-lightbox-arrow mw-lightbox-arrow--next",
        ariaLabel: "Next image",
        onClick: (e) => {
          e.stopPropagation();
          showNextImage();
        },
      },
      "›"
    )
  );

  const meta = createEl(
    "div",
    { class: "mw-lightbox-meta" },
    createEl("div", { class: "mw-lightbox-title" }, image.title),
    createEl(
      "div",
      { class: "mw-lightbox-index" },
      `${index + 1} / ${galleryImages.length}`
    )
  );

  const inner = createEl(
    "div",
    { class: "mw-lightbox-inner" },
    wrapper,
    meta,
    createEl(
      "button",
      {
        class: "mw-lightbox-close",
        ariaLabel: "Close lightbox",
        onClick: (e) => {
          e.stopPropagation();
          closeLightbox();
        },
      },
      "×"
    )
  );

  const backdrop = createEl(
    "div",
    {
      class: "mw-lightbox-backdrop",
      onClick: (e) => {
        if (e.target === e.currentTarget) closeLightbox();
      },
    },
    inner
  );

  lightboxRoot.innerHTML = "";
  lightboxRoot.appendChild(backdrop);

  document.addEventListener("keydown", handleLightboxKeys);
}

function closeLightbox() {
  lightboxRoot.innerHTML = "";
  currentLightboxIndex = null;
  document.removeEventListener("keydown", handleLightboxKeys);
}

function showPrevImage() {
  if (currentLightboxIndex == null) return;
  const newIndex =
    (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
  openLightbox(newIndex);
}

function showNextImage() {
  if (currentLightboxIndex == null) return;
  const newIndex = (currentLightboxIndex + 1) % galleryImages.length;
  openLightbox(newIndex);
}

function handleLightboxKeys(e) {
  if (e.key === "Escape") {
    closeLightbox();
  } else if (e.key === "ArrowLeft") {
    showPrevImage();
  } else if (e.key === "ArrowRight") {
    showNextImage();
  }
}

// ---- Event delegation for gallery thumbnails ----
if (galleryGrid) {
  galleryGrid.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if (!item) return;
    const index = item.dataset.index;
    openLightbox(index);
  });

  galleryGrid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const item = e.target.closest(".gallery-item");
    if (!item) return;
    e.preventDefault();
    const index = item.dataset.index;
    openLightbox(index);
  });
}

// In main.js, in the openModal function:
`<a href="contact.html" class="inquiry-link">Inquire About This Product</a>`