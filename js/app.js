/* ==========================================================================
   FINELINE TRADING — interaction engine (simplified)
   Calm, conventional: native scroll, gentle fade-ins, accessible.
   ========================================================================== */

(function () {
  "use strict";

  gsap.registerPlugin(ScrollTrigger, Flip);

  var page = document.body.getAttribute("data-page") || "";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // No preloader / no curtains — make sure nothing is left hidden.
  document.documentElement.classList.remove("is-first-visit", "is-nav");

  /* ---------------------------- Reveal engine ----------------------------- */
  // One gentle fade-up for every reveal hook. No clip-paths, no slides.

  var revealSel = "[data-reveal-fade], [data-reveal], [data-chars], [data-h-fade], [data-reveal-img]";

  if (reduceMotion) {
    gsap.utils.toArray(revealSel).forEach(function (el) {
      gsap.set(el, { opacity: 1, y: 0 });
    });
  } else {
    gsap.utils.toArray(revealSel).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 22 }, {
        opacity: 1, y: 0, duration: 0.9, ease: "power2.out",
        delay: parseFloat(el.getAttribute("data-delay") || 0),
        scrollTrigger: { trigger: el, start: "top 90%" }
      });
    });
  }

  /* ------------------------------- Menu ----------------------------------- */

  var menuW = document.querySelector(".menu_w");
  var menuOpen = false;

  function openMenu() {
    if (!menuW || menuOpen) return;
    menuOpen = true;
    gsap.set(menuW, { visibility: "visible" });
    gsap.timeline()
      .to(menuW, { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease: "power2.inOut" }, 0)
      .fromTo(".menu-link", { opacity: 0, y: "0.4em" }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.05 }, 0.25)
      .fromTo(".menu-wordmark", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.3);
  }

  function closeMenu() {
    if (!menuW || !menuOpen) return;
    menuOpen = false;
    gsap.to(menuW, {
      clipPath: "inset(0 0 100% 0)", duration: 0.5, ease: "power2.inOut",
      onComplete: function () { gsap.set(menuW, { visibility: "hidden" }); }
    });
  }

  document.querySelectorAll("[data-menu-open]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); menuOpen ? closeMenu() : openMenu(); });
  });
  document.querySelectorAll("[data-menu-close]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); closeMenu(); });
  });

  /* ------------------------- Odometer counters ---------------------------- */
  // Used by the Projects page stat figures ([data-count]).

  function buildOdometer(el) {
    var raw = el.getAttribute("data-count");
    el.innerHTML = "";
    var cols = [];
    raw.split("").forEach(function (ch) {
      if (/\d/.test(ch)) {
        var d = document.createElement("span");
        d.style.cssText = "display:inline-block;height:1em;overflow:hidden;vertical-align:top;";
        var col = document.createElement("span");
        col.style.cssText = "display:block;line-height:1;";
        for (var i = 0; i <= 9; i++) {
          var n = document.createElement("span");
          n.style.cssText = "display:block;height:1em;";
          n.textContent = String(i);
          col.appendChild(n);
        }
        d.appendChild(col);
        el.appendChild(d);
        cols.push({ col: col, target: parseInt(ch, 10) });
      } else {
        var s = document.createElement("span");
        s.style.cssText = "display:inline-block;vertical-align:top;line-height:1;";
        s.textContent = ch;
        el.appendChild(s);
      }
    });
    return cols;
  }

  function playOdometer(el, cols) {
    var stagger = parseFloat(el.getAttribute("data-stagger") || 0.065);
    cols.forEach(function (c, idx) {
      gsap.fromTo(c.col, { y: 0 }, {
        y: -c.target + "em", duration: 1.4, ease: "power3.inOut", delay: idx * stagger
      });
    });
  }

  document.querySelectorAll("[data-count]").forEach(function (el) {
    if (reduceMotion) return; // leave the static number in place
    var cols = buildOdometer(el);
    if (!cols.length) return;
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: function () { playOdometer(el, cols); }
    });
  });

  /* ------------------------- Newsletter (demo) ---------------------------- */

  document.querySelectorAll(".nl-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var done = form.parentElement.querySelector(".nl-done");
      form.style.display = "none";
      if (done) done.style.display = "block";
    });
  });

  /* ==========================================================================
     PAGE: COLLECTIONS INDEX — filter + hover thumb
     ========================================================================== */

  if (page === "collections") {
    var chips = document.querySelectorAll(".filtre");
    var items = gsap.utils.toArray(".cg-item");

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        var cat = chip.getAttribute("data-filter");
        var state = Flip.getState(items);
        items.forEach(function (it) {
          var show = cat === "all" || it.getAttribute("data-cat") === cat;
          it.classList.toggle("is-hidden", !show);
        });
        Flip.from(state, {
          duration: 0.6, ease: "power2.inOut", stagger: 0.02, absolute: true,
          onEnter: function (els) { return gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.5 }); },
          onLeave: function (els) { return gsap.to(els, { opacity: 0, duration: 0.3 }); }
        });
      });
    });

    var thumb = document.querySelector(".cl-thumb");
    var thumbImg = thumb ? thumb.querySelector("img") : null;
    if (thumb && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
      document.querySelectorAll(".cl-row").forEach(function (row) {
        row.addEventListener("mouseenter", function () {
          thumbImg.src = row.getAttribute("data-thumb");
          gsap.to(thumb, { opacity: 1, duration: 0.3 });
        });
        row.addEventListener("mouseleave", function () {
          gsap.to(thumb, { opacity: 0, duration: 0.25 });
        });
      });
      document.addEventListener("mousemove", function (e) {
        gsap.to(thumb, { left: e.clientX + 24, top: e.clientY - 90, duration: 0.5, ease: "power3.out" });
      });
    }
  }

  /* ==========================================================================
     PAGE: PROCESS — progress rail + dots
     ========================================================================== */

  if (page === "process") {
    var jfill = document.querySelector("[data-journey-fill]");
    var jlist = document.querySelector(".journey-list");
    if (jfill && jlist && !reduceMotion) {
      gsap.to(jfill, {
        height: "100%", ease: "none",
        scrollTrigger: { trigger: jlist, start: "top 30%", end: "bottom 70%", scrub: true }
      });
    } else if (jfill && reduceMotion) {
      gsap.set(jfill, { height: "100%" });
    }
    gsap.utils.toArray("[data-jdot]").forEach(function (dot) {
      var step = dot.closest(".jstep");
      if (!step) return;
      ScrollTrigger.create({
        trigger: step, start: "top 32%", end: "bottom 32%",
        onEnter: function () { dot.classList.add("is-on"); },
        onEnterBack: function () { dot.classList.add("is-on"); },
        onLeaveBack: function () { dot.classList.remove("is-on"); }
      });
    });
  }

  /* ==========================================================================
     PAGE: CONTACT — cursor reveal grid + enquiry form
     ========================================================================== */

  if (page === "contact") {
    var hero = document.querySelector("[data-reveal-hero]");
    var grid = document.querySelector("[data-reveal-grid]");
    if (hero && grid && !reduceMotion) {
      var TILE = 60, cols = 0, rows = 0, tiles = [];

      function buildGrid() {
        grid.innerHTML = ""; tiles = [];
        var w = hero.clientWidth, h = hero.clientHeight;
        cols = Math.max(1, Math.round(w / TILE));
        rows = Math.max(1, Math.round(h / TILE));
        grid.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
        grid.style.gridTemplateRows = "repeat(" + rows + ", 1fr)";
        for (var i = 0; i < cols * rows; i++) {
          var t = document.createElement("span");
          t.className = "reveal-tile";
          grid.appendChild(t);
          tiles.push(t);
        }
      }
      buildGrid();
      var rb;
      window.addEventListener("resize", function () { clearTimeout(rb); rb = setTimeout(buildGrid, 200); });

      function reveal(cx, cy) {
        var rect = hero.getBoundingClientRect();
        var col = Math.floor((cx - rect.left) / (rect.width / cols));
        var row = Math.floor((cy - rect.top) / (rect.height / rows));
        for (var dr = -1; dr <= 1; dr++) {
          for (var dc = -1; dc <= 1; dc++) {
            var r = row + dr, cc = col + dc;
            if (r < 0 || cc < 0 || r >= rows || cc >= cols) continue;
            var t = tiles[r * cols + cc];
            if (!t) continue;
            gsap.killTweensOf(t);
            gsap.set(t, { opacity: 0, scale: 0.35 });
            gsap.to(t, { opacity: 1, scale: 1, duration: 2.4, delay: 0.55, ease: "power2.out" });
          }
        }
      }
      hero.addEventListener("mousemove", function (e) { reveal(e.clientX, e.clientY); });
      hero.addEventListener("touchmove", function (e) {
        var t = e.touches[0]; if (t) reveal(t.clientX, t.clientY);
      }, { passive: true });
    } else if (grid && reduceMotion) {
      grid.style.display = "none"; // just show the photo, no overlay
    }

    // Enquiry form -> Web3Forms (AJAX, stay on page)
    var ef = document.querySelector("[data-enquiry]");
    if (ef) {
      var status = ef.querySelector("[data-ef-status]");
      var setStatus = function (msg, cls) { if (status) { status.textContent = msg; status.className = "ef-status " + cls; } };
      ef.addEventListener("submit", function (e) {
        e.preventDefault();
        var keyEl = ef.querySelector('[name="access_key"]');
        var key = keyEl ? keyEl.value : "";
        if (!key || key.indexOf("YOUR_") === 0) {
          setStatus("Form not configured yet — add your Web3Forms access key.", "is-error");
          return;
        }
        setStatus("Sending…", "is-sending");
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(ef)
        }).then(function (r) { return r.json(); }).then(function (json) {
          if (json.success) {
            setStatus("Thank you — your enquiry has been sent. We'll be in touch shortly.", "is-ok");
            ef.reset();
          } else {
            setStatus(json.message || "Something went wrong. Please try again.", "is-error");
          }
        }).catch(function () {
          setStatus("Network error. Please try again, or email us directly.", "is-error");
        });
      });
    }
  }

  /* ------------------------------ Year ------------------------------------ */

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear()).slice(2);
  });
})();
