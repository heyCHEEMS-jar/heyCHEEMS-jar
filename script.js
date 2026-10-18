(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var topbar = document.getElementById("topbar");
  var menuToggle = document.querySelector(".menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav-link[data-section]")
  );
  var sections = ["home", "about", "projects", "now"]
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
  var projectConfig = siteConfig.projects || {};
  var GITHUB_USER = siteConfig.githubUser || "heyCHEEMS-jar";
  var REPOSITORIES_URL =
    configLinks.repositories ||
    "https://github.com/" + GITHUB_USER + "?tab=repositories";
  var INCLUDE_FORKS = projectConfig.includeForks !== false;
  var INCLUDE_ARCHIVED = projectConfig.includeArchived === true;
  var CACHE_KEY = "heycheems-repos-v3";
  var CACHE_TTL = (projectConfig.cacheTtlMinutes || 15) * 60 * 1000;
  var projectList = document.getElementById("project-list");
  var iconTones = ["mint", "blue", "lilac", "amber", "green", "slate"];

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
    var allowedIcons = ["home", "sliders", "gamepad", "code"];

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

  function readRepoCache() {
    try {
      var raw = window.localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var cache = JSON.parse(raw);
      if (!cache || !Array.isArray(cache.repos) || !cache.time) return null;
      return cache;
    } catch (error) {
      return null;
    }
  }

  function writeRepoCache(repos) {
    try {
      window.localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ time: Date.now(), repos: repos })
      );
    } catch (error) {}
  }

  function normalizeRepo(repo) {
    var fullName = repo.repo || repo.full_name || "";
    if (!fullName && repo.name) fullName = GITHUB_USER + "/" + repo.name;

    return {
      name: repo.name || "",
      full_name: fullName,
      default_branch: repo.defaultBranch || repo.default_branch || "",
      description: repo.description || "",
      language: repo.language || "",
      topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 5) : [],
      html_url:
        repo.html_url ||
        (fullName ? "https://github.com/" + fullName : ""),
      stargazers_count: repo.stars || repo.stargazers_count || 0,
      fork: Boolean(repo.fork),
      archived: Boolean(repo.archived),
      pushed_at: repo.pushedAt || repo.pushed_at || "",
      updated_at: repo.updatedAt || repo.updated_at || ""
    };
  }

  function extractRepoList(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.repos)) return data.repos;
    return null;
  }

  var TECH_CACHE_KEY = "heycheems-tech-v1";
  var TECH_PACKAGES = [
    ["astro", "Astro"],
    ["next", "Next.js"],
    ["nuxt", "Nuxt"],
    ["@sveltejs/kit", "SvelteKit"],
    ["svelte", "Svelte"],
    ["vue", "Vue"],
    ["react", "React"],
    ["solid-js", "Solid"],
    ["preact", "Preact"],
    ["@angular/core", "Angular"],
    ["vite", "Vite"],
    ["typescript", "TypeScript"],
    ["tailwindcss", "Tailwind CSS"],
    ["@tailwindcss/vite", "Tailwind CSS"],
    ["@astrojs/tailwind", "Tailwind CSS"],
    ["unocss", "UnoCSS"],
    ["sass", "Sass"],
    ["three", "Three.js"],
    ["phaser", "Phaser"],
    ["pixi.js", "PixiJS"],
    ["matter-js", "Matter.js"],
    ["p5", "p5.js"],
    ["d3", "D3.js"],
    ["echarts", "ECharts"],
    ["express", "Express"],
    ["electron", "Electron"],
    ["@tauri-apps/api", "Tauri"],
    ["@capacitor/core", "Capacitor"],
    ["jquery", "jQuery"],
    ["pinia", "Pinia"],
    ["vue-router", "Vue Router"]
  ];

  function readTechCache() {
    try {
      var raw = window.localStorage.getItem(TECH_CACHE_KEY);
      if (!raw) return {};
      var cache = JSON.parse(raw);
      return cache && typeof cache === "object" ? cache : {};
    } catch (error) {
      return {};
    }
  }

  function writeTechCache(key, tags) {
    try {
      var cache = readTechCache();
      cache[key] = tags;
      window.localStorage.setItem(TECH_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {}
  }

  function detectTechTags(pkg) {
    if (!pkg || typeof pkg !== "object") return [];

    var deps = {};
    ["dependencies", "devDependencies", "peerDependencies"].forEach(
      function (key) {
        var value = pkg[key];
        if (!value || typeof value !== "object") return;
        Object.keys(value).forEach(function (name) {
          deps[name] = true;
        });
      }
    );

    var tags = [];
    TECH_PACKAGES.forEach(function (entry) {
      if (!deps[entry[0]]) return;
      if (tags.indexOf(entry[1]) === -1) tags.push(entry[1]);
    });

    if (!tags.length && Object.keys(deps).length) tags.push("JavaScript");

    return tags.slice(0, 3);
  }

  function applyTechTags(stack, tags) {
    if (!stack || !tags || !tags.length) return;

    var fragment = document.createDocumentFragment();
    tags.forEach(function (text) {
      var exists = Array.prototype.some.call(
        stack.querySelectorAll(".stack-tag"),
        function (tag) {
          return tag.textContent.toLowerCase() === text.toLowerCase();
        }
      );
      if (exists) return;

      var tag = document.createElement("span");
      tag.className = "stack-tag stack-tag--tech";
      tag.textContent = text;
      fragment.appendChild(tag);
    });
    stack.insertBefore(fragment, stack.firstChild);
  }

  function enrichRepoStack(repo, item) {
    if (!repo || !repo.full_name || !item) return;
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo.full_name)) return;

    var stack = item.querySelector(".stack-list");
    if (!stack) return;

    var cacheKey =
      repo.full_name + "@" + (repo.pushed_at || repo.updated_at || "");
    var cache = readTechCache();
    if (cache[cacheKey] && cache[cacheKey].length) {
      applyTechTags(stack, cache[cacheKey]);
      return;
    }

    var branches = repo.default_branch
      ? [repo.default_branch]
      : ["main", "master"];

    function fetchLanguages() {
      fetch(
        "https://api.github.com/repos/" + repo.full_name + "/languages",
        {
          headers: { Accept: "application/vnd.github+json" }
        }
      )
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.json();
        })
        .then(function (languages) {
          if (!languages || typeof languages !== "object") return;
          var tags = Object.keys(languages)
            .sort(function (a, b) {
              return languages[b] - languages[a];
            })
            .slice(0, 3);
          if (!tags.length) return;
          writeTechCache(cacheKey, tags);
          applyTechTags(stack, tags);
        })
        .catch(function () {});
    }

    function tryBranch(index) {
      if (index >= branches.length) {
        fetchLanguages();
        return;
      }
      var branch = branches[index]
        .split("/")
        .map(encodeURIComponent)
        .join("/");
      var url =
        "https://raw.githubusercontent.com/" +
        repo.full_name +
        "/" +
        branch +
        "/package.json";

      fetch(url)
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.json();
        })
        .then(function (pkg) {
          var tags = detectTechTags(pkg);
          if (!tags.length) {
            fetchLanguages();
            return;
          }
          writeTechCache(cacheKey, tags);
          applyTechTags(stack, tags);
        })
        .catch(function () {
          tryBranch(index + 1);
        });
    }

    tryBranch(0);
  }

  function showProjectState(message, linkText, linkHref) {
    if (!projectList) return;
    projectList.innerHTML = "";
    projectList.setAttribute("aria-busy", "false");

    var state = document.createElement("div");
    state.className = "project-state";

    var text = document.createElement("span");
    text.textContent = message;
    state.appendChild(text);

    if (linkText && linkHref) {
      var link = document.createElement("a");
      link.href = linkHref;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = linkText;
      state.appendChild(link);
    }

    projectList.appendChild(state);
  }

  function showProjectLoading() {
    if (!projectList) return;
    projectList.innerHTML = "";
    projectList.setAttribute("aria-busy", "true");

    var state = document.createElement("div");
    state.className = "project-state";

    var loader = document.createElement("span");
    loader.className = "project-loader";
    loader.setAttribute("aria-hidden", "true");

    var text = document.createElement("span");
    text.textContent = "正在从 GitHub 加载项目…";

    state.appendChild(loader);
    state.appendChild(text);
    projectList.appendChild(state);
  }

  function addStackTag(parent, text, modifier) {
    if (!text) return;
    var tag = document.createElement("span");
    tag.className = "stack-tag" + (modifier ? " " + modifier : "");
    tag.textContent = text;
    parent.appendChild(tag);
  }

  function formatUpdated(value) {
    if (!value) return "";
    var date = new Date(value);
    if (isNaN(date.getTime())) return "";
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return "更新于 " + year + "." + month + "." + day;
  }

  function pickProjectIcon(repo) {
    var text = [
      repo.name,
      repo.description,
      (repo.topics || []).join(" ")
    ]
      .join(" ")
      .toLowerCase();

    if (/game|pvz|zombie|游戏/.test(text)) return "icon-gamepad";
    if (/blog|mizuki|home|博客|小窝/.test(text)) return "icon-home";
    if (/manager|admin|dashboard|tool|管理|工具/.test(text)) return "icon-sliders";
    return "icon-code";
  }

  function createProjectItem(repo, index) {
    var item = document.createElement("a");
    item.className = "project-item";
    item.href =
      repo.html_url ||
      "https://github.com/" +
        GITHUB_USER +
        "/" +
        encodeURIComponent(repo.name);
    item.target = "_blank";
    item.rel = "noopener noreferrer";
    item.setAttribute("data-reveal", "");
    item.style.setProperty("--delay", (index * 0.05).toFixed(2) + "s");

    var number = document.createElement("span");
    number.className = "project-index";
    number.textContent = String(index + 1).padStart(2, "0");
    item.appendChild(number);

    var iconWrap = document.createElement("span");
    iconWrap.className =
      "project-icon project-icon--" + iconTones[index % iconTones.length];

    var icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("class", "icon");
    icon.setAttribute("aria-hidden", "true");

    var iconUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
    iconUse.setAttribute("href", "#" + pickProjectIcon(repo));
    icon.appendChild(iconUse);
    iconWrap.appendChild(icon);
    item.appendChild(iconWrap);

    var info = document.createElement("span");
    info.className = "project-info";

    var name = document.createElement("span");
    name.className = "project-name";
    name.textContent = repo.name;
    info.appendChild(name);

    if (repo.description) {
      var desc = document.createElement("span");
      desc.className = "project-desc";
      desc.textContent = repo.description;
      info.appendChild(desc);
    }

    var updated = formatUpdated(repo.pushed_at || repo.updated_at);
    if (updated) {
      var meta = document.createElement("span");
      meta.className = "project-meta";
      meta.textContent = updated;
      info.appendChild(meta);
    }

    var stack = document.createElement("span");
    stack.className = "stack-list";

    addStackTag(stack, repo.language, "");
    (repo.topics || []).slice(0, 2).forEach(function (topic) {
      addStackTag(stack, topic, "");
    });
    if (repo.fork) addStackTag(stack, "Fork", "stack-tag--warn");
    if (repo.archived) addStackTag(stack, "Archived", "stack-tag--warn");
    if (repo.stargazers_count > 0) {
      addStackTag(stack, "★ " + repo.stargazers_count, "stack-tag--star");
    }

    info.appendChild(stack);
    item.appendChild(info);

    var arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    arrow.setAttribute("class", "icon project-arrow");
    arrow.setAttribute("aria-hidden", "true");

    var arrowUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
    arrowUse.setAttribute("href", "#icon-arrow-right");
    arrow.appendChild(arrowUse);
    item.appendChild(arrow);

    return item;
  }

  function renderProjects(repos) {
    if (!projectList) return;
    projectList.innerHTML = "";
    projectList.setAttribute("aria-busy", "false");

    var sorted = repos.slice().sort(function (a, b) {
      var starDiff =
        (b.stargazers_count || 0) - (a.stargazers_count || 0);
      if (starDiff !== 0) return starDiff;
      return (
        new Date(b.pushed_at || b.updated_at || 0) -
        new Date(a.pushed_at || a.updated_at || 0)
      );
    });

    var visible = sorted.filter(function (repo) {
      if (!INCLUDE_FORKS && repo.fork) return false;
      if (!INCLUDE_ARCHIVED && repo.archived) return false;
      return true;
    });

    if (!visible.length) {
      showProjectState(
        "这个账号下还没有可展示的公开仓库。",
        "去 GitHub 看看",
        REPOSITORIES_URL
      );
      return;
    }

    var fragment = document.createDocumentFragment();
    visible.forEach(function (repo, index) {
      fragment.appendChild(createProjectItem(repo, index));
    });
    projectList.appendChild(fragment);

    Array.prototype.forEach.call(
      projectList.querySelectorAll(".project-item"),
      function (item, index) {
        if (revealObserver) {
          revealObserver.observe(item);
        } else {
          item.classList.add("is-visible");
        }
        enrichRepoStack(visible[index], item);
      }
    );
  }

  function fetchProjects() {
    if (!projectList) return;

    var cache = readRepoCache();
    if (cache) {
      renderProjects(cache.repos);
      if (Date.now() - cache.time < CACHE_TTL) return;
    } else {
      showProjectLoading();
    }

    var sources = [
      "https://ungh.cc/users/" + encodeURIComponent(GITHUB_USER) + "/repos",
      "https://api.github.com/users/" +
        encodeURIComponent(GITHUB_USER) +
        "/repos?type=owner&sort=pushed&direction=desc&per_page=100"
    ];

    function trySource(index) {
      if (index >= sources.length) {
        if (cache) return;
        showProjectState(
          "项目列表加载失败，可能是网络或 GitHub API 限流。",
          "去 GitHub 查看",
          REPOSITORIES_URL
        );
        return;
      }

      fetch(sources[index], {
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.json();
        })
        .then(function (data) {
          var list = extractRepoList(data);
          if (!list) throw new Error("Unexpected response");
          var normalized = list.map(normalizeRepo);
          writeRepoCache(normalized);
          renderProjects(normalized);
        })
        .catch(function () {
          trySource(index + 1);
        });
    }

    trySource(0);
  }

  fetchProjects();

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
        length: 90 + Math.random() * 190,
        width: 0.7 + Math.random() * 1.3,
        alpha: 0.28 + Math.random() * 0.55,
        delay: Math.random() * 3200
      };
    }

    function respawnMeteor(meteor) {
      var angle = (20 + Math.random() * 18) * (Math.PI / 180);
      var speed = 0.24 + Math.random() * 0.5;

      meteor.x = width * 0.05 + Math.random() * width * 1.15;
      meteor.y = -20 - Math.random() * 160;
      meteor.vx = -Math.cos(angle) * speed;
      meteor.vy = Math.sin(angle) * speed;
      meteor.length = 90 + Math.random() * 190;
      meteor.width = 0.7 + Math.random() * 1.3;
      meteor.alpha = 0.28 + Math.random() * 0.55;
      meteor.delay = Math.random() * 3200;
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

      var count = Math.min(
        34,
        Math.max(12, Math.round((width * height) / 55000))
      );

      meteors = [];
      for (var i = 0; i < count; i += 1) {
        meteors.push(makeMeteor());
      }
    }

    function drawMeteors(now) {
      var delta = lastTime ? Math.min(now - lastTime, 48) : 16;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

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
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.width * 1.4, 0, Math.PI * 2);
        ctx.fillStyle =
          "rgba(255,255,255," + Math.min(meteor.alpha + 0.2, 1) + ")";
        ctx.fill();

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
