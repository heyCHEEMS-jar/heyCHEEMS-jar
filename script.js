(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var topbar = document.getElementById("topbar");
  var menuToggle = document.querySelector(".menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav-link[data-section]")
  );
  var sections = ["home", "about"]
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  function setActiveSection(id) {
    navLinks.forEach(function (link) {
      var active = link.getAttribute("data-section") === id;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function updateActiveSection() {
    if (!sections.length) return;

    var marker = window.innerHeight * 0.35;
    var current = sections[0].id;

    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= marker) {
        current = section.id;
      }
    });

    var atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;

    if (atBottom) {
      current = sections[sections.length - 1].id;
    }

    setActiveSection(current);
  }

  function onScroll() {
    if (topbar) {
      topbar.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    updateActiveSection();
  }

  var scrollTicking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(function () {
        onScroll();
        scrollTicking = false;
      });
    },
    { passive: true }
  );
  onScroll();

  function setMenu(open) {
    if (!topbar || !menuToggle) return;
    topbar.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!topbar.classList.contains("menu-open"));
    });
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setMenu(false);
    }
  });

  document.addEventListener("click", function (event) {
    if (
      topbar &&
      topbar.classList.contains("menu-open") &&
      !topbar.contains(event.target)
    ) {
      setMenu(false);
    }
  });

  var desktopQuery = window.matchMedia("(min-width: 901px)");
  var handleDesktopChange = function (event) {
    if (event.matches) setMenu(false);
  };

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", handleDesktopChange);
  } else if (typeof desktopQuery.addListener === "function") {
    desktopQuery.addListener(handleDesktopChange);
  }

  var revealElements = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -6% 0px"
      }
    );

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  }

  var siteConfig = window.SITE_CONFIG || {};
  var configLinks = siteConfig.links || {};

  function applySiteConfig() {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-config-link]"),
      function (link) {
        var key = link.getAttribute("data-config-link");
        if (configLinks[key]) link.href = configLinks[key];
      }
    );

    Array.prototype.forEach.call(
      document.querySelectorAll("[data-config-email]"),
      function (link) {
        if (!configLinks.email) return;
        link.href = "mailto:" + configLinks.email;
        if (link.hasAttribute("data-config-email-text")) {
          link.textContent = configLinks.email;
        }
      }
    );
  }

  function renderSites() {
    var grid = document.getElementById("site-grid");
    if (!grid) return;

    var sites = Array.isArray(siteConfig.sites) ? siteConfig.sites : [];
    var allowedIcons = ["home", "sliders", "gamepad", "image", "code"];

    grid.innerHTML = "";

    sites.forEach(function (site, index) {
      if (!site || !site.name || !site.url) return;
      if (!/^https:\/\//.test(site.url)) return;

      var link = document.createElement("a");
      link.className = "now-item";
      link.href = site.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("data-reveal", "");
      link.style.setProperty("--delay", (index * 0.06).toFixed(2) + "s");

      var icon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      icon.setAttribute("class", "icon");
      icon.setAttribute("aria-hidden", "true");

      var use = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "use"
      );
      var iconName =
        allowedIcons.indexOf(site.icon) !== -1 ? site.icon : "code";
      use.setAttribute("href", "#icon-" + iconName);
      icon.appendChild(use);
      link.appendChild(icon);

      var label = document.createElement("p");
      label.className = "now-label";
      label.textContent = "SITE " + String(index + 1).padStart(2, "0");
      link.appendChild(label);

      var name = document.createElement("p");
      name.className = "now-text";
      name.textContent = site.name;
      link.appendChild(name);

      if (site.description) {
        var desc = document.createElement("p");
        desc.className = "now-desc";
        desc.textContent = site.description;
        link.appendChild(desc);
      }

      grid.appendChild(link);
    });

    Array.prototype.forEach.call(
      grid.querySelectorAll(".now-item"),
      function (item) {
        if (revealObserver) {
          revealObserver.observe(item);
        } else {
          item.classList.add("is-visible");
        }
      }
    );
  }

  applySiteConfig();
  renderSites();


  var slogans = [
    "把点子做成能打开的小站。",
    "在折腾里找点乐子。",
    "保持好奇，慢慢更新。"
  ];
  var sloganElement = document.getElementById("slogan");
  var sloganIndex = 0;

  if (sloganElement && !reduceMotion.matches) {
    window.setInterval(function () {
      if (document.hidden) return;

      sloganIndex = (sloganIndex + 1) % slogans.length;
      sloganElement.classList.add("is-changing");

      window.setTimeout(function () {
        sloganElement.textContent = slogans[sloganIndex];
        sloganElement.classList.remove("is-changing");
      }, 230);
    }, 4200);
  }

  var canvas = document.getElementById("bg-canvas");

  if (canvas && canvas.getContext && !reduceMotion.matches) {
    var ctx = canvas.getContext("2d");
    var width = 0;
    var height = 0;
    var dpr = 1;
    var meteors = [];
    var frameId = 0;
    var lastTime = 0;
    var glowX = 0;
    var glowY = 0;
    var targetGlowX = 0;
    var targetGlowY = 0;
    var glowReady = false;

    ctx.lineCap = "round";
    ctx.globalCompositeOperation = "lighter";

    function makeMeteor() {
      var angle = (20 + Math.random() * 18) * (Math.PI / 180);
      var speed = 0.24 + Math.random() * 0.5;

      return {
        x: width * 0.05 + Math.random() * width * 1.15,
        y: -20 - Math.random() * 160,
        vx: -Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 150 + Math.random() * 230,
        width: 1.4 + Math.random() * 2.2,
        alpha: 0.38 + Math.random() * 0.48,
        delay: Math.random() * 4200
      };
    }

    function respawnMeteor(meteor) {
      var angle = (20 + Math.random() * 18) * (Math.PI / 180);
      var speed = 0.24 + Math.random() * 0.5;

      meteor.x = width * 0.05 + Math.random() * width * 1.15;
      meteor.y = -20 - Math.random() * 160;
      meteor.vx = -Math.cos(angle) * speed;
      meteor.vy = Math.sin(angle) * speed;
      meteor.length = 150 + Math.random() * 230;
      meteor.width = 1.4 + Math.random() * 2.2;
      meteor.alpha = 0.38 + Math.random() * 0.48;
      meteor.delay = Math.random() * 4200;
    }

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!glowReady) {
        glowX = width * 0.78;
        glowY = height * 0.18;
        targetGlowX = glowX;
        targetGlowY = glowY;
        glowReady = true;
      }

      var count = Math.min(
        14,
        Math.max(5, Math.round((width * height) / 160000))
      );

      meteors = [];
      for (var i = 0; i < count; i += 1) {
        meteors.push(makeMeteor());
      }
    }

    function drawCanvasGlow(now) {
      var pulse = 0.85 + Math.sin(now / 2200) * 0.15;
      var radius = Math.max(width, height) * 0.46;

      glowX += (targetGlowX - glowX) * 0.08;
      glowY += (targetGlowY - glowY) * 0.08;

      var glow = ctx.createRadialGradient(
        glowX,
        glowY,
        0,
        glowX,
        glowY,
        radius
      );

      glow.addColorStop(0, "rgba(255,255,255," + 0.065 * pulse + ")");
      glow.addColorStop(0.36, "rgba(255,255,255," + 0.022 * pulse + ")");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    function drawMeteors(now) {
      var delta = lastTime ? Math.min(now - lastTime, 48) : 16;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);
      drawCanvasGlow(now);

      meteors.forEach(function (meteor) {
        if (meteor.delay > 0) {
          meteor.delay -= delta;
          return;
        }

        meteor.x += meteor.vx * delta;
        meteor.y += meteor.vy * delta;

        var speed = Math.sqrt(meteor.vx * meteor.vx + meteor.vy * meteor.vy);
        var tailX = meteor.x - (meteor.vx / speed) * meteor.length;
        var tailY = meteor.y - (meteor.vy / speed) * meteor.length;
        var gradient = ctx.createLinearGradient(
          meteor.x,
          meteor.y,
          tailX,
          tailY
        );

        gradient.addColorStop(
          0,
          "rgba(255,255,255," + meteor.alpha + ")"
        );
        gradient.addColorStop(
          0.4,
          "rgba(255,255,255," + meteor.alpha * 0.45 + ")"
        );
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = meteor.width;
        ctx.shadowColor =
          "rgba(255,255,255," + Math.min(meteor.alpha * 0.7, 0.6) + ")";
        ctx.shadowBlur = 10 + meteor.width * 7;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";

        if (meteor.x < -60 || meteor.y > height + 60) {
          respawnMeteor(meteor);
        }
      });

      frameId = window.requestAnimationFrame(drawMeteors);
    }

    function startMeteors() {
      if (!frameId) {
        lastTime = 0;
        frameId = window.requestAnimationFrame(drawMeteors);
      }
    }

    function stopMeteors() {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    }

    resizeCanvas();
    startMeteors();

    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener(
      "pointermove",
      function (event) {
        if (event.pointerType && event.pointerType !== "mouse") return;
        targetGlowX = event.clientX;
        targetGlowY = event.clientY;
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopMeteors();
      } else {
        startMeteors();
      }
    });

    var handleMotionChange = function (event) {
      if (event.matches) {
        stopMeteors();
      } else {
        resizeCanvas();
        startMeteors();
      }
    };

    if (typeof reduceMotion.addEventListener === "function") {
      reduceMotion.addEventListener("change", handleMotionChange);
    } else if (typeof reduceMotion.addListener === "function") {
      reduceMotion.addListener(handleMotionChange);
    }
  }

  var yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }
})();
