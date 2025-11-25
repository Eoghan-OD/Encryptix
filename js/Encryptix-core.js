// Core site behaviour shared by all Encryptix pages
(function () {
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".menu-toggle");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("active");
    });
  }

  // Simple contact form handler for demo purposes only
  const contactForm = document.getElementById("contact-form");
  const statusEl = document.querySelector(".form-status");

  if (contactForm && statusEl) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      statusEl.textContent =
        "Thank you for your message. In the live project this form would send your details to the Encryptix team.";
    });
  }
})();

// Handles mobile menu toggle + small utility animations

(function () {
  const toggleBtn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  const wrapper = document.querySelector(".site-nav-wrapper");

  if (!toggleBtn || !nav) {
    console.warn("Menu toggle or nav not found.");
    return;
  }

  // Toggle navigation visibility (mobile)
  toggleBtn.addEventListener("click", () => {
    const isOpen = nav.style.display === "flex";

    if (isOpen) {
      nav.style.display = "none";
      wrapper.classList.remove("nav-open");
    } else {
      nav.style.display = "flex";
      wrapper.classList.add("nav-open");
    }
  });

  // Desktop reset
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      nav.style.display = "flex";
      wrapper.classList.remove("nav-open");
    } else {
      nav.style.display = "none";
    }
  });
})();


// 1) Mobile menu toggle
(function () {
  const toggleBtn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  const wrapper = document.querySelector(".site-nav-wrapper");

  if (!toggleBtn || !nav || !wrapper) return;

  const setForViewport = () => {
    if (window.innerWidth > 768) {
      nav.style.display = "flex";
      wrapper.classList.remove("nav-open");
    } else if (!wrapper.classList.contains("nav-open")) {
      nav.style.display = "none";
    }
  };

  toggleBtn.addEventListener("click", () => {
    const isOpen = wrapper.classList.contains("nav-open");
    if (isOpen) {
      wrapper.classList.remove("nav-open");
      nav.style.display = "none";
    } else {
      wrapper.classList.add("nav-open");
      nav.style.display = "flex";
    }
  });

  window.addEventListener("resize", setForViewport);
  setForViewport();
})();

// 2) Scroll reveal
(function () {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  // Fallback: if browser doesn’t support it, just show everything
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("reveal-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.75 }
  );

  items.forEach((el) => observer.observe(el));
})();

