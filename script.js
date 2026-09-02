// Mobile navigation
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");

    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navMenu.classList.contains("open")) {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      navToggle.focus();
    }
  });
}

// Lightbox
const items = Array.from(document.querySelectorAll(".portfolio-item"));
const lightbox = document.getElementById("lightbox");

if (items.length > 0 && lightbox) {
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let currentIndex = 0;
  let previousFocus = null;

  function openLightbox(index) {
    currentIndex = index;
    previousFocus = document.activeElement;

    const item = items[currentIndex];
    const image = item.querySelector("img");

    if (!image || !lightboxImg) {
      return;
    }

    lightboxImg.src = image.currentSrc || image.src;
    lightboxImg.alt = image.alt;

    if (lightboxCaption) {
      lightboxCaption.textContent = item.dataset.caption || "";
    }

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (lightboxClose) {
      lightboxClose.focus();
    }
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (lightboxImg) {
      lightboxImg.src = "";
    }

    if (previousFocus) {
      previousFocus.focus();
    }
  }

  function showRelative(direction) {
    currentIndex =
      (currentIndex + direction + items.length) % items.length;

    openLightbox(currentIndex);
  }

  items.forEach((item, index) => {
    item.addEventListener("click", () => {
      openLightbox(index);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", () => {
      showRelative(-1);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", () => {
      showRelative(1);
    });
  }

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      showRelative(-1);
    }

    if (event.key === "ArrowRight") {
      showRelative(1);
    }
  });
}

// Formspree booking form
const bookingForm = document.querySelector(".booking-form");

if (bookingForm) {
  const submitButton = bookingForm.querySelector(".submit-btn");

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      return;
    }

    const originalButtonText = submitButton
      ? submitButton.textContent
      : "Send Inquiry";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    const existingMessage = bookingForm.querySelector(".form-status");

    if (existingMessage) {
      existingMessage.remove();
    }

    try {
      const response = await fetch(bookingForm.action, {
        method: "POST",
        body: new FormData(bookingForm),
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("The form could not be submitted.");
      }

      bookingForm.reset();

      showFormStatus(
        "Thanks! Your inquiry was sent successfully.",
        "success"
      );

      if (submitButton) {
        submitButton.textContent = "Inquiry Sent!";
      }

      window.setTimeout(() => {
        if (submitButton) {
          submitButton.textContent = originalButtonText;
          submitButton.disabled = false;
        }
      }, 4000);
    } catch (error) {
      showFormStatus(
        "Your inquiry could not be sent. Please try again.",
        "error"
      );

      if (submitButton) {
        submitButton.textContent = "Try Again";
        submitButton.disabled = false;
      }
    }
  });

  function showFormStatus(message, type) {
    const status = document.createElement("p");

    status.className = `form-status ${type}`;
    status.setAttribute("role", type === "error" ? "alert" : "status");
    status.textContent = message;

    bookingForm.appendChild(status);
  }
}