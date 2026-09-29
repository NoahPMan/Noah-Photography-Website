(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Mobile navigation
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    const mobileNavigation = window.matchMedia("(max-width: 900px)");

    function setMenuOpen(isOpen) {
      navMenu.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation",
      );
      navMenu.inert = mobileNavigation.matches && !isOpen;
      document.body.classList.toggle("menu-open", isOpen);
    }

    function updateNavigationMode() {
      if (mobileNavigation.matches) {
        setMenuOpen(false);
      } else {
        navMenu.classList.remove("open");
        navMenu.inert = false;
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation");
        document.body.classList.remove("menu-open");
      }
    }

    navToggle.addEventListener("click", () => {
      setMenuOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileNavigation.matches) {
          setMenuOpen(false);
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navMenu.classList.contains("open")) {
        setMenuOpen(false);
        navToggle.focus();
      }
    });

    if (typeof mobileNavigation.addEventListener === "function") {
      mobileNavigation.addEventListener("change", updateNavigationMode);
    } else {
      mobileNavigation.addListener(updateNavigationMode);
    }

    updateNavigationMode();
  }

  // Featured photography carousel
  const showcaseHero = document.getElementById("featuredWork");

  if (showcaseHero) {
    const slides = Array.from(showcaseHero.querySelectorAll(".showcase-slide"));
    const dots = Array.from(showcaseHero.querySelectorAll(".showcase-dot"));
    const previousButton = document.getElementById("showcasePrevious");
    const nextButton = document.getElementById("showcaseNext");
    const pauseButton = document.getElementById("showcasePause");
    const status = document.getElementById("showcaseStatus");

    if (slides.length > 0) {
      const intervalDuration = 5500;
      let currentSlide = Math.max(
        0,
        slides.findIndex((slide) => slide.classList.contains("active")),
      );
      let autoplayTimer = null;
      let manuallyPaused = reducedMotion.matches;
      let explicitPlayback = false;
      let pointerInside = false;
      let focusInside = false;
      let touchInProgress = false;
      let touchStart = null;

      function autoplayIsPaused() {
        return (
          manuallyPaused ||
          (reducedMotion.matches && !explicitPlayback) ||
          document.hidden ||
          pointerInside ||
          focusInside ||
          touchInProgress
        );
      }

      function syncAutoplay() {
        if (autoplayIsPaused() || slides.length < 2) {
          window.clearInterval(autoplayTimer);
          autoplayTimer = null;
          return;
        }

        if (autoplayTimer === null) {
          autoplayTimer = window.setInterval(() => {
            showSlide(currentSlide + 1, false);
          }, intervalDuration);
        }
      }

      function restartAutoplay() {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
        syncAutoplay();
      }

      function updatePauseButton() {
        if (!pauseButton) {
          return;
        }

        const isPaused =
          manuallyPaused || (reducedMotion.matches && !explicitPlayback);
        pauseButton.setAttribute("aria-pressed", String(isPaused));
        pauseButton.setAttribute(
          "aria-label",
          isPaused ? "Play featured photographs" : "Pause featured photographs",
        );

        const label = pauseButton.querySelector("span");

        if (label) {
          label.textContent = isPaused ? "Play" : "Pause";
        }
      }

      function showSlide(index, announce = true) {
        if (!Number.isFinite(index)) {
          return;
        }

        currentSlide =
          ((index % slides.length) + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
          const isActive = slideIndex === currentSlide;
          const label = slide.dataset.label || `Photograph ${slideIndex + 1}`;

          slide.classList.toggle("active", isActive);
          slide.setAttribute("aria-hidden", String(!isActive));
          slide.setAttribute(
            "aria-label",
            `${slideIndex + 1} of ${slides.length}: ${label}`,
          );
          slide.inert = !isActive;
        });

        dots.forEach((dot, dotIndex) => {
          const isActive = dotIndex === currentSlide;

          dot.classList.toggle("active", isActive);

          if (isActive) {
            dot.setAttribute("aria-current", "true");
          } else {
            dot.removeAttribute("aria-current");
          }
        });

        if (announce && status) {
          status.textContent =
            slides[currentSlide].dataset.label ||
            `Featured photograph ${currentSlide + 1}`;
        }
      }

      previousButton?.addEventListener("click", () => {
        showSlide(currentSlide - 1);
        restartAutoplay();
      });

      nextButton?.addEventListener("click", () => {
        showSlide(currentSlide + 1);
        restartAutoplay();
      });

      dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          const index = Number(dot.dataset.slide);

          if (Number.isInteger(index) && index >= 0 && index < slides.length) {
            showSlide(index);
            restartAutoplay();
          }
        });
      });

      pauseButton?.addEventListener("click", () => {
        manuallyPaused = !manuallyPaused;
        explicitPlayback = !manuallyPaused;
        updatePauseButton();
        restartAutoplay();
      });

      showcaseHero.addEventListener("mouseenter", () => {
        pointerInside = true;
        syncAutoplay();
        updatePauseButton();
      });

      showcaseHero.addEventListener("mouseleave", () => {
        pointerInside = false;
        syncAutoplay();
        updatePauseButton();
      });

      showcaseHero.addEventListener("focusin", () => {
        focusInside = true;
        syncAutoplay();
        updatePauseButton();
      });

      showcaseHero.addEventListener("focusout", (event) => {
        focusInside =
          event.relatedTarget instanceof Node &&
          showcaseHero.contains(event.relatedTarget);
        syncAutoplay();
        updatePauseButton();
      });

      showcaseHero.addEventListener(
        "touchstart",
        (event) => {
          if (event.touches.length !== 1) {
            touchStart = null;
            return;
          }

          touchStart = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
          touchInProgress = true;
          syncAutoplay();
          updatePauseButton();
        },
        { passive: true },
      );

      showcaseHero.addEventListener(
        "touchend",
        (event) => {
          if (touchStart && event.changedTouches.length > 0) {
            const deltaX = event.changedTouches[0].clientX - touchStart.x;
            const deltaY = event.changedTouches[0].clientY - touchStart.y;

            if (Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
              showSlide(currentSlide + (deltaX < 0 ? 1 : -1));
            }
          }

          touchStart = null;
          touchInProgress = false;
          restartAutoplay();
          updatePauseButton();
        },
        { passive: true },
      );

      showcaseHero.addEventListener(
        "touchcancel",
        () => {
          touchStart = null;
          touchInProgress = false;
          restartAutoplay();
          updatePauseButton();
        },
        { passive: true },
      );

      showcaseHero.addEventListener("keydown", (event) => {
        const target = event.target;

        if (
          target instanceof HTMLElement &&
          (target.isContentEditable ||
            ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName))
        ) {
          return;
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          showSlide(currentSlide - 1);
          restartAutoplay();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          showSlide(currentSlide + 1);
          restartAutoplay();
        }
      });

      document.addEventListener("visibilitychange", () => {
        syncAutoplay();
        updatePauseButton();
      });

      const onMotionPreferenceChange = (event) => {
        if (event.matches) {
          manuallyPaused = true;
          explicitPlayback = false;
        }

        syncAutoplay();
        updatePauseButton();
      };

      if (typeof reducedMotion.addEventListener === "function") {
        reducedMotion.addEventListener("change", onMotionPreferenceChange);
      } else {
        reducedMotion.addListener(onMotionPreferenceChange);
      }

      showSlide(currentSlide, false);
      updatePauseButton();
      syncAutoplay();
    }
  }

  // Portfolio lightbox
  const portfolioItems = Array.from(
    document.querySelectorAll(".portfolio-item"),
  );
  const lightbox = document.getElementById("lightbox");

  if (portfolioItems.length > 0 && lightbox) {
    const lightboxImage = document.getElementById("lightboxImg");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const lightboxClose = document.getElementById("lightboxClose");
    const lightboxPrevious = document.getElementById("lightboxPrev");
    const lightboxNext = document.getElementById("lightboxNext");
    let currentIndex = 0;
    let previousFocus = null;
    let previousBodyOverflow = "";

    function renderLightboxImage(index) {
      const image = portfolioItems[index].querySelector("img");

      if (!image || !lightboxImage) {
        return false;
      }

      currentIndex = index;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;

      if (lightboxCaption) {
        lightboxCaption.textContent =
          portfolioItems[index].dataset.caption || "";
      }

      return true;
    }

    function openLightbox(index) {
      if (index < 0 || index >= portfolioItems.length) {
        return;
      }

      const wasClosed = !lightbox.classList.contains("open");

      if (!renderLightboxImage(index)) {
        return;
      }

      if (wasClosed) {
        previousFocus = document.activeElement;
        previousBodyOverflow = document.body.style.overflow;
      }

      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      if (wasClosed && lightboxClose) {
        lightboxClose.focus();
      }
    }

    function closeLightbox() {
      if (!lightbox.classList.contains("open")) {
        return;
      }

      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = previousBodyOverflow;

      if (lightboxImage) {
        lightboxImage.removeAttribute("src");
        lightboxImage.alt = "";
      }

      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    }

    function showRelative(direction) {
      const nextIndex =
        (currentIndex + direction + portfolioItems.length) %
        portfolioItems.length;

      openLightbox(nextIndex);
    }

    portfolioItems.forEach((item, index) => {
      item.addEventListener("click", () => openLightbox(index));
    });

    lightboxClose?.addEventListener("click", closeLightbox);
    lightboxPrevious?.addEventListener("click", () => showRelative(-1));
    lightboxNext?.addEventListener("click", () => showRelative(1));

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
      } else if (event.key === "ArrowLeft") {
        showRelative(-1);
      } else if (event.key === "ArrowRight") {
        showRelative(1);
      }
    });
  }

  // Signature Print Collection availability
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

    if (Object.values(fields).some((field) => !field)) {
      console.error("The booking form is missing one or more required fields.");
      return;
    }

    function removeError(field) {
      const errorId = `${field.id}-error`;
      const describedBy = (field.getAttribute("aria-describedby") || "")
        .split(/\s+/)
        .filter((id) => id && id !== errorId);

      field.classList.remove("input-error");
      field.removeAttribute("aria-invalid");

      if (describedBy.length > 0) {
        field.setAttribute("aria-describedby", describedBy.join(" "));
      } else {
        field.removeAttribute("aria-describedby");
      }

      document.getElementById(errorId)?.remove();
    }

    function showError(field, message) {
      removeError(field);

      const fieldContainer = field.closest(".field");

      if (!fieldContainer) {
        console.error(
          `The booking field "${field.id}" has no field container.`,
        );
        return;
      }

      const error = document.createElement("p");
      const errorId = `${field.id}-error`;
      const describedBy = (field.getAttribute("aria-describedby") || "")
        .split(/\s+/)
        .filter(Boolean);

      error.id = errorId;
      error.className = "field-error";
      error.textContent = message;

      field.classList.add("input-error");
      field.setAttribute("aria-invalid", "true");
      field.setAttribute(
        "aria-describedby",
        [...describedBy, errorId].join(" "),
      );

      fieldContainer.appendChild(error);
    }

    function validateName() {
      if (fields.name.value.trim().length < 2) {
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
        { field: fields.name, valid: validateName() },
        { field: fields.email, valid: validateEmail() },
        { field: fields.phone, valid: validatePhone() },
        { field: fields.service, valid: validateService() },
        { field: fields.message, valid: validateMessage() },
      ];
      const firstInvalid = results.find((result) => !result.valid);

      if (firstInvalid) {
        firstInvalid.field.focus();
        firstInvalid.field.scrollIntoView({
          behavior: reducedMotion.matches ? "auto" : "smooth",
          block: "center",
        });
        return false;
      }

      return true;
    }

    function showFormStatus(message, type) {
      bookingForm.querySelector(".form-status")?.remove();

      const formStatus = document.createElement("p");
      formStatus.className = `form-status ${type}`;
      formStatus.setAttribute("role", type === "error" ? "alert" : "status");
      formStatus.textContent = message;
      bookingForm.appendChild(formStatus);
      formStatus.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "nearest",
      });
    }

    fields.name.addEventListener("blur", validateName);
    fields.email.addEventListener("blur", validateEmail);
    fields.phone.addEventListener("blur", validatePhone);
    fields.service.addEventListener("change", validateService);
    fields.message.addEventListener("blur", validateMessage);

    bookingForm.addEventListener("input", (event) => {
      if (
        event.target instanceof Element &&
        event.target.classList.contains("input-error")
      ) {
        removeError(event.target);
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

      bookingForm.querySelector(".form-status")?.remove();

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      try {
        const response = await fetch(bookingForm.action, {
          method: "POST",
          body: new FormData(bookingForm),
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Formspree returned HTTP ${response.status}.`);
        }

        bookingForm.reset();
        Object.values(fields).forEach(removeError);
        updatePrintAvailability();
        showFormStatus(
          "Thanks! Your inquiry was sent successfully.",
          "success",
        );

        if (submitButton) {
          submitButton.textContent = "Inquiry Sent!";
          window.setTimeout(() => {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
          }, 4000);
        }
      } catch {
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
  }
})();
