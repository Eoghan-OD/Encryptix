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
