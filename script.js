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
    currentIndex = (currentIndex + direction + items.length) % items.length;

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

// Print collection availability
const serviceSelect = document.getElementById("service");
const printCollection = document.getElementById("printCollection");
const printNote = document.getElementById("printNote");

function updatePrintAvailability() {
  if (!serviceSelect || !printCollection) {
    return;
  }

  const isPortraitMini = serviceSelect.value === "Portrait Mini";

  printCollection.disabled = isPortraitMini;

  if (isPortraitMini) {
    printCollection.checked = false;
  }

  if (printNote) {
    printNote.hidden = !isPortraitMini;
  }
}

if (serviceSelect && printCollection) {
  serviceSelect.addEventListener("change", updatePrintAvailability);

  updatePrintAvailability();
}

// Booking form validation and Formspree submission
const bookingForm = document.querySelector(".booking-form");

if (bookingForm) {
  const submitButton = bookingForm.querySelector(".submit-btn");

  const fields = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    service: document.getElementById("service"),
    message: document.getElementById("message"),
  };

  function removeError(field) {
    if (!field) {
      return;
    }

    field.classList.remove("input-error");
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");

    const existingError = document.getElementById(`${field.id}-error`);

    if (existingError) {
      existingError.remove();
    }
  }

  function showError(field, message) {
    if (!field) {
      return;
    }

    removeError(field);

    const fieldContainer = field.closest(".field");

    if (!fieldContainer) {
      return;
    }

    const error = document.createElement("p");
    const errorId = `${field.id}-error`;

    error.id = errorId;
    error.className = "field-error";
    error.textContent = message;

    field.classList.add("input-error");
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", errorId);

    fieldContainer.appendChild(error);
  }

  function validateName() {
    const value = fields.name.value.trim();

    if (value.length < 2) {
      showError(fields.name, "Please enter your name.");
      return false;
    }

    removeError(fields.name);
    return true;
  }

  function validateEmail() {
    const value = fields.email.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
      showError(fields.email, "Please enter your email address.");

      return false;
    }

    if (!emailPattern.test(value)) {
      showError(fields.email, "Please enter a valid email address.");

      return false;
    }

    removeError(fields.email);
    return true;
  }

  function validatePhone() {
    const value = fields.phone.value.trim();

    if (!value) {
      removeError(fields.phone);
      return true;
    }

    const digits = value.replace(/\D/g, "");

    if (digits.length < 10 || digits.length > 15) {
      showError(fields.phone, "Please enter a valid phone number.");

      return false;
    }

    removeError(fields.phone);
    return true;
  }

  function validateService() {
    if (!fields.service.value) {
      showError(fields.service, "Please select a service.");

      return false;
    }

    removeError(fields.service);
    return true;
  }

  function validateMessage() {
    const value = fields.message.value.trim();

    if (!value) {
      showError(fields.message, "Please tell me about your session.");

      return false;
    }

    if (value.length < 15) {
      showError(fields.message, "Please include a few more session details.");

      return false;
    }

    removeError(fields.message);
    return true;
  }

  function validateForm() {
    const results = [
      {
        field: fields.name,
        valid: validateName(),
      },
      {
        field: fields.email,
        valid: validateEmail(),
      },
      {
        field: fields.phone,
        valid: validatePhone(),
      },
      {
        field: fields.service,
        valid: validateService(),
      },
      {
        field: fields.message,
        valid: validateMessage(),
      },
    ];

    const firstInvalid = results.find((result) => !result.valid);

    if (firstInvalid) {
      firstInvalid.field.focus();

      firstInvalid.field.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return false;
    }

    return true;
  }

  fields.name.addEventListener("blur", validateName);
  fields.email.addEventListener("blur", validateEmail);
  fields.phone.addEventListener("blur", validatePhone);
  fields.service.addEventListener("change", validateService);
  fields.message.addEventListener("blur", validateMessage);

  bookingForm.addEventListener("input", (event) => {
    const field = event.target;

    if (field.classList.contains("input-error")) {
      removeError(field);
    }
  });

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const originalButtonText = submitButton
      ? submitButton.textContent
      : "Send Inquiry";

    const existingStatus = bookingForm.querySelector(".form-status");

    if (existingStatus) {
      existingStatus.remove();
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch(bookingForm.action, {
        method: "POST",
        body: new FormData(bookingForm),
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      bookingForm.reset();

      Object.values(fields).forEach((field) => {
        removeError(field);
      });

      updatePrintAvailability();

      showFormStatus("Thanks! Your inquiry was sent successfully.", "success");

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
        "Your inquiry could not be sent. Please check your connection and try again.",
        "error",
      );

      if (submitButton) {
        submitButton.textContent = "Try Again";
        submitButton.disabled = false;
      }
    }
  });

  function showFormStatus(message, type) {
    const existingStatus = bookingForm.querySelector(".form-status");

    if (existingStatus) {
      existingStatus.remove();
    }

    const status = document.createElement("p");

    status.className = `form-status ${type}`;
    status.setAttribute("role", type === "error" ? "alert" : "status");
    status.textContent = message;

    bookingForm.appendChild(status);

    status.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }
}
