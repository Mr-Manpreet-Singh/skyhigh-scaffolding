/** Must match CSS: desktop inline nav from this width up (see @media min-width). */
const NAV_DESKTOP_MIN_PX = 1024;

const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navList = document.querySelector(".nav-list");
const navLinks = document.querySelectorAll(".nav-link");
const hashNavLinks = [...navLinks].filter((link) => link.getAttribute("href")?.startsWith("#"));
const sections = document.querySelectorAll("main section");
const heroSlides = document.querySelectorAll(".hero-slide");
const serviceCards = document.querySelectorAll(".service-card");
const findRevealItems = document.querySelectorAll(".find-reveal");
const subtleRevealItems = document.querySelectorAll(
  ".gallery-content, #contact .section-content, #contact .contact-form, .site-footer .footer-column"
);
const contactForm = document.querySelector("#contact-form");
const contactSubmitBtn = document.querySelector("#contact-submit-btn");
const galleryItems = document.querySelectorAll(".gallery-item");
const galleryLightbox = document.querySelector("#gallery-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxPrev = document.querySelector(".lightbox-prev");
const lightboxNext = document.querySelector(".lightbox-next");
let activeGalleryIndex = 0;

function closeMobileNav() {
  if (!navList || !navToggle) return;
  navList.classList.remove("open");
  navToggle.classList.remove("active");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

if (navToggle && navList) {
  navToggle.addEventListener("click", () => {
    const isOpen = navList.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen && window.innerWidth < NAV_DESKTOP_MIN_PX);
  });
}

hashNavLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId) return;

    const targetSection = document.querySelector(targetId);
    if (!targetSection) return;

    event.preventDefault();
    if (!header) return;

    const offset = header.offsetHeight;
    const top = targetSection.offsetTop - offset + 1;
    window.scrollTo({ top, behavior: "smooth" });
    closeMobileNav();
  });
});

navLinks.forEach((link) => {
  const href = link.getAttribute("href") || "";
  if (href.startsWith("#")) return;

  link.addEventListener("click", () => {
    closeMobileNav();
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= NAV_DESKTOP_MIN_PX) {
    closeMobileNav();
  }
});

document.addEventListener("click", (event) => {
  if (!navList) return;
  if (window.innerWidth >= NAV_DESKTOP_MIN_PX) return;
  if (!navList.classList.contains("open")) return;
  if (event.target.closest(".navbar")) return;
  closeMobileNav();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileNav();
  }
});

function setActiveNavByScroll() {
  if (!header || !hashNavLinks.length || !sections.length) return;

  const headerOffset = header.offsetHeight + 6;
  const scrollPosition = window.scrollY + headerOffset;
  let currentSectionId = sections[0]?.id;

  sections.forEach((section) => {
    if (scrollPosition >= section.offsetTop) {
      currentSectionId = section.id;
    }
  });

  hashNavLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentSectionId}`;
    link.classList.toggle("active", isActive);
  });
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    setActiveNavByScroll();
    ticking = false;
  });
});

window.addEventListener("load", setActiveNavByScroll);

if (heroSlides.length > 1) {
  let activeSlide = 0;

  setInterval(() => {
    heroSlides[activeSlide].classList.remove("active");
    activeSlide = (activeSlide + 1) % heroSlides.length;
    heroSlides[activeSlide].classList.add("active");
  }, 5000);
}

if (serviceCards.length) {
  const servicesSection = document.querySelector("#services");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const staggerMs = reduceMotion ? 0 : 48;

  const revealAllServiceCards = () => {
    serviceCards.forEach((card, index) => {
      window.setTimeout(() => card.classList.add("in-view"), index * staggerMs);
    });
  };

  if (reduceMotion) {
    revealAllServiceCards();
  } else if (servicesSection) {
    const narrow = window.matchMedia("(max-width: 767px)");
    const serviceObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealAllServiceCards();
          observer.disconnect();
        });
      },
      {
        threshold: 0,
        rootMargin: narrow.matches
          ? "120px 0px 320px 0px"
          : "72px 0px 200px 0px",
      }
    );

    serviceObserver.observe(servicesSection);
  } else {
    revealAllServiceCards();
  }
}

if (findRevealItems.length) {
  const findUsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        findUsObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.25,
      rootMargin: "0px 0px -30px 0px",
    }
  );

  findRevealItems.forEach((item) => findUsObserver.observe(item));
}

if (subtleRevealItems.length) {
  subtleRevealItems.forEach((item) => item.classList.add("subtle-reveal"));

  const subtleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        subtleObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0,
      rootMargin: "80px 0px 220px 0px",
    }
  );

  subtleRevealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
    subtleObserver.observe(item);
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Read and normalize form values before building the WhatsApp message.
    const name = contactForm.elements.name?.value.trim() || "";
    const email = contactForm.elements.email?.value.trim() || "";
    const message = contactForm.elements.message?.value.trim() || "";

    if (!name || !email || !message) {
      window.alert("Please fill in Name, Email, and Message before continuing.");
      return;
    }

    const originalBtnText = contactSubmitBtn?.textContent || "Send Message";
    if (contactSubmitBtn) {
      contactSubmitBtn.disabled = true;
      contactSubmitBtn.textContent = "Opening WhatsApp...";
    }

    const whatsappMessage = `Hello Sky High Safe Scaffolding,\n\nMy name is ${name}.\nEmail: ${email}\n\nMessage:\n${message}`;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/61432772161?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    // Reset UI state smoothly without reloading the page.
    window.setTimeout(() => {
      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = false;
        contactSubmitBtn.textContent = originalBtnText;
      }
    }, 700);
  });
}

if (galleryItems.length && galleryLightbox && lightboxImage) {
  const gallerySources = [...galleryItems].map((item) => {
    const image = item.querySelector("img");
    return {
      src: image?.getAttribute("src") || "",
      alt: image?.getAttribute("alt") || "Gallery image",
    };
  });

  function updateLightbox(index) {
    const safeIndex = (index + gallerySources.length) % gallerySources.length;
    activeGalleryIndex = safeIndex;
    lightboxImage.src = gallerySources[safeIndex].src;
    lightboxImage.alt = gallerySources[safeIndex].alt;
  }

  function openLightbox(index) {
    updateLightbox(index);
    galleryLightbox.classList.add("open");
    galleryLightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    galleryLightbox.classList.remove("open");
    galleryLightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      openLightbox(index);
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxPrev?.addEventListener("click", () => updateLightbox(activeGalleryIndex - 1));
  lightboxNext?.addEventListener("click", () => updateLightbox(activeGalleryIndex + 1));

  galleryLightbox.addEventListener("click", (event) => {
    if (event.target === galleryLightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!galleryLightbox.classList.contains("open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") updateLightbox(activeGalleryIndex - 1);
    if (event.key === "ArrowRight") updateLightbox(activeGalleryIndex + 1);
  });
}
