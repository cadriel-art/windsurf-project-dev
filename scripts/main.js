function getConfig() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("preview") === "draft" ? "draft" : "live";
  if (window.SiteTemplate?.loadConfig) return window.SiteTemplate.loadConfig({ mode });
  return {
    elements: ["electric", "fire", "water", "alien"],
    projects: [],
    brand: { logoText: "CM", siteTitle: document.title },
    hero: {
      headline: "AI Developer",
      typingText: "Building the future with code & intelligence",
      description: "",
      ctaText: "View Projects",
      ctaHref: "#projects",
    },
    contact: { title: "", subtitle: "", email: "hello@example.com", ctaText: "Get in Touch" },
  };
}

function scrollToHashIfPresent() {
  const hash = window.location.hash;
  if (!hash || hash === "#") return;
  const target = document.querySelector(hash);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function getMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("preview") === "draft" ? "draft" : "live";
}

function getActivePageSlug(config) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("page");
  if (typeof slug === "string" && slug.trim()) return slug.trim().toLowerCase();
  const first = Array.isArray(config?.pages) ? config.pages[0] : null;
  return (first?.slug || "home").toLowerCase();
}

function buildHrefWithMode(href, mode) {
  if (typeof href !== "string") return "#";
  if (href.startsWith("#")) return href;
  if (href.startsWith("mailto:")) return href;
  if (href.startsWith("tel:")) return href;
  if (mode !== "draft") return href;
  const url = new URL(href, window.location.href);
  url.searchParams.set("preview", "draft");
  return url.pathname + url.search + url.hash;
}

function renderMenuFromConfig(config, mode) {
  const navLinks = document.getElementById("nav-links");
  if (!navLinks) return;

  let items = Array.isArray(config?.menu?.primary) ? [...config.menu.primary] : [];
  if (!items.length) {
    items = [
      { type: "page", slug: "home", label: "Home" },
      { type: "anchor", href: "#projects", label: "Projects" },
      { type: "page", slug: "about", label: "About" },
      { type: "anchor", href: "#contact", label: "Contact" },
    ];
  }

  const desiredOrder = ["home", "projects", "about", "contact"];
  function getRank(item, idx) {
    const slug = typeof item?.slug === "string" ? item.slug.toLowerCase() : "";
    const href = typeof item?.href === "string" ? item.href.toLowerCase() : "";
    if (slug === "home" || href === "./?page=home" || href === "#home") return 0;
    if (slug === "projects" || href === "#projects") return 1;
    if (slug === "about" || href === "#about") return 2;
    if (slug === "contact" || href === "#contact") return 3;
    return desiredOrder.length + idx;
  }

  items = items
    .map((item, idx) => ({ item, idx, rank: getRank(item, idx) }))
    .sort((a, b) => {
      if (a.rank === b.rank) return a.idx - b.idx;
      return a.rank - b.rank;
    })
    .map((entry) => entry.item);
  const activeSlug = getActivePageSlug(config);

  navLinks.innerHTML = "";

  items.forEach((item) => {
    const a = document.createElement("a");
    a.className = "nav-link";

    const label = typeof item?.label === "string" ? item.label : "Link";
    a.textContent = label;

    if (item?.type === "page") {
      const slug = (item.slug || "home").toLowerCase();
      if (slug === "about" && activeSlug === "home") {
        a.href = "#about";
      } else {
        a.href = buildHrefWithMode(`./?page=${encodeURIComponent(slug)}`, mode);
      }
      if (slug === activeSlug) a.classList.add("active");
    } else {
      const href = item?.href || "#";
      if (typeof href === "string" && href.startsWith("#")) {
        if (activeSlug === "home") {
          a.href = href;
        } else {
          a.href = buildHrefWithMode(`./?page=home${href}`, mode);
        }
      } else {
        a.href = buildHrefWithMode(href, mode);
      }
    }

    navLinks.appendChild(a);
  });

  const admin = document.createElement("a");
  admin.className = "nav-link";
  admin.href = "./admin.html";
  admin.textContent = "Admin";
  navLinks.appendChild(admin);
}

function setHomeVisibility(isHome) {
  const hero = document.querySelector(".hero");
  const about = document.getElementById("about");
  const projects = document.getElementById("projects");
  const contact = document.getElementById("contact");
  const footer = document.querySelector(".footer");
  [hero, projects, about, contact, footer].forEach((node) => {
    if (!node) return;
    node.style.display = isHome ? "" : "none";
  });
}

const FALLBACK_CAPABILITIES_ITEMS = [
  { icon: "⚛️", title: "React" },
  { icon: "TS", title: "TypeScript" },
  { icon: "🛠️", title: "Full-Stack" },
  { icon: "🤖", title: "AI/ML" },
  { icon: "⛓️", title: "Microservices" },
  { icon: "⚡", title: "Real-time" },
  { icon: "📊", title: "Data Viz" },
  { icon: "🎨", title: "Design" },
  { icon: "🧰", title: "DevTools" },
  { icon: "🔐", title: "Security" },
];

function resolveCapabilities(config) {
  const source = Array.isArray(config?.capabilities?.items) && config.capabilities.items.length
    ? config.capabilities.items
    : FALLBACK_CAPABILITIES_ITEMS;
  return source.map((item, idx) => {
    const fallback = FALLBACK_CAPABILITIES_ITEMS[idx % FALLBACK_CAPABILITIES_ITEMS.length];
    return {
      icon: item.icon || fallback.icon,
      title: item.title || item.label || fallback.title,
    };
  });
}

const PLACEHOLDER_BLOCK_REGEX = /this is an editable page/i;
function sanitizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks.filter((block) => {
    if (block?.type !== "richText") return true;
    if (typeof block?.html !== "string") return false;
    return !PLACEHOLDER_BLOCK_REGEX.test(block.html);
  });
}

function renderCapabilitiesSection(config) {
  const capabilitiesGrid = document.getElementById("capabilities-grid");
  if (!capabilitiesGrid) return;

  const capabilities = resolveCapabilities(config);

  capabilitiesGrid.innerHTML = "";
  capabilities.forEach((cap, i) => {
    const card = document.createElement("div");
    card.className = "capability-card";
    card.style.animationDelay = `${i * 0.1}s`;
    card.innerHTML = `
      <div class="capability-icon">${cap.icon || "🚀"}</div>
      <h4 class="capability-title">${cap.title || "Skill"}</h4>
    `;
    capabilitiesGrid.appendChild(card);
  });
}

function initHeroHeadlineDustSwap() {
  if (window.__heroHeadlineDustBound) return;
  window.__heroHeadlineDustBound = true;

  const hero = document.querySelector(".hero");
  const h1 = document.querySelector(".hero .glitch");
  if (!hero || !h1) return;

  const canvas = document.createElement("canvas");
  canvas.className = "hero-dust-canvas";
  hero.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const state = {
    particles: [],
    phase: "idle",
    phaseStart: 0,
    swirlCenter: { x: 0, y: 0 },
    targetRect: null,
    running: false,
    baseText: h1.textContent || "",
    nextText: "Lorem Ipsum this!",
  };

  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(hero.clientWidth * dpr);
    canvas.height = Math.floor(hero.clientHeight * dpr);
    canvas.style.width = hero.clientWidth + "px";
    canvas.style.height = hero.clientHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rectInHero(el) {
    const hr = hero.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left - hr.left,
      y: r.top - hr.top,
      w: r.width,
      h: r.height,
      cx: r.left - hr.left + r.width / 2,
      cy: r.top - hr.top + r.height / 2,
    };
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function spawnFromRect(rect, count) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const x = rand(rect.x, rect.x + rect.w);
      const y = rand(rect.y, rect.y + rect.h);
      const a = rand(0, Math.PI * 2);
      const speed = rand(0.15, 0.9);
      out.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        size: rand(0.4, 1.2),
        alpha: rand(0.18, 0.55),
        seed: Math.random() * 1000,
        tx: x,
        ty: y,
        dx: rand(0, hero.clientWidth),
        dy: rand(0, hero.clientHeight),
      });
    }
    return out;
  }

  function scatterDestinations() {
    state.particles.forEach((p) => {
      p.dx = rand(0, hero.clientWidth);
      p.dy = rand(0, hero.clientHeight);
    });
  }

  function setTargets(rect) {
    state.targetRect = rect;
    state.particles.forEach((p) => {
      p.tx = rand(rect.x, rect.x + rect.w);
      p.ty = rand(rect.y, rect.y + rect.h);
    });
  }

  function setPhase(name) {
    state.phase = name;
    state.phaseStart = performance.now();
  }

  function update(now) {
    const t = (now - state.phaseStart) / 1000;
    const glowPulse = 0.6 + 0.4 * Math.sin(now / 300);

    const windX = 0.08;
    const windY = -0.02;

    ctx.clearRect(0, 0, hero.clientWidth, hero.clientHeight);
    ctx.save();

    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "#c6ff00";
    ctx.shadowColor = "#c6ff00";
    ctx.shadowBlur = 18;

    state.particles.forEach((p) => {
      if (state.phase === "dissolve") {
        const sdx = p.dx - p.x;
        const sdy = p.dy - p.y;
        p.vx += sdx * 0.0009;
        p.vy += sdy * 0.0009;

        const dx = p.x - state.swirlCenter.x;
        const dy = p.y - state.swirlCenter.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const tangX = -dy / dist;
        const tangY = dx / dist;
        const swirl = 0.7;
        p.vx += tangX * swirl * 0.012 + windX + Math.sin((now + p.seed) / 420) * 0.01;
        p.vy += tangY * swirl * 0.012 + windY + Math.cos((now + p.seed) / 420) * 0.01;
        p.vx *= 0.992;
        p.vy *= 0.992;
      }

      if (state.phase === "regroup" && state.targetRect) {
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        p.vx += dx * 0.0016;
        p.vy += dy * 0.0016;
        p.vx *= 0.94;
        p.vy *= 0.94;
      }

      p.x += p.vx;
      p.y += p.vy;

      const a = Math.max(0, Math.min(1, p.alpha * glowPulse));
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    if (state.phase === "dissolve" && t > 2.2) {
      setPhase("linger");
    }

    if (state.phase === "linger" && t > 1.2) {
      h1.textContent = state.nextText;
      h1.setAttribute("data-text", state.nextText);
      const nextRect = rectInHero(h1);
      setTargets({ x: nextRect.x, y: nextRect.y, w: nextRect.w, h: nextRect.h });
      setPhase("regroup");
      window.setTimeout(() => h1.classList.remove("is-hidden"), 400);
    }

    if (state.phase === "regroup" && t > 2.4) {
      setPhase("fade");
    }

    if (state.phase === "fade") {
      const k = Math.max(0, 1 - t / 1.2);
      state.particles.forEach((p) => {
        p.alpha *= 0.985;
        p.size *= 0.995;
      });
      if (k <= 0.02) {
        state.running = false;
        state.particles = [];
        state.phase = "done";

        const showForMs = 4200;
        window.setTimeout(() => {
          if (state.running) return;
          state.nextText = state.nextText === state.baseText ? "Lorem Ipsum this!" : state.baseText;
          startSequence();
        }, showForMs);
      }
    }

    if (state.running) window.requestAnimationFrame(update);
  }

  function startSequence() {
    resize();
    const r = rectInHero(h1);
    state.swirlCenter = { x: r.cx, y: r.cy };
    const count = Math.floor(Math.max(120, Math.min(260, (r.w * r.h) / 420)));
    state.particles = spawnFromRect(r, count);
    scatterDestinations();
    h1.classList.add("is-hidden");
    setPhase("dissolve");
    state.running = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("resize", resize);
  resize();

  window.setTimeout(() => {
    if (state.phase !== "idle") return;
    startSequence();
  }, 3200);
}

function applyHomeLayout(config) {
  const wrap = document.getElementById("home-sections");
  if (!wrap) return;

  const hero = document.querySelector(".hero");
  const about = ensureHomeAboutSection(config);
  const projects = document.getElementById("projects");
  const contact = document.getElementById("contact");
  const footer = document.querySelector(".footer");
  const map = {
    hero,
    about,
    projects,
    contact,
    footer,
  };

  const defaultOrder = ["hero", "about", "projects", "contact", "footer"];
  let sections = Array.isArray(config?.homeLayout?.sections)
    ? [...config.homeLayout.sections]
    : defaultOrder.map((id) => ({ id, enabled: true }));

  defaultOrder.forEach((id) => {
    if (!sections.some((s) => (s?.id || "").toLowerCase() === id)) {
      sections.push({ id, enabled: true });
    }
  });

  const desiredOrder = defaultOrder;
  sections = sections
    .map((section, idx) => ({ section, idx }))
    .sort((a, b) => {
      const orderA = desiredOrder.indexOf((a.section?.id || "").toLowerCase());
      const orderB = desiredOrder.indexOf((b.section?.id || "").toLowerCase());
      const scoreA = orderA === -1 ? desiredOrder.length + a.idx : orderA;
      const scoreB = orderB === -1 ? desiredOrder.length + b.idx : orderB;
      return scoreA - scoreB;
    })
    .map((entry) => entry.section);

  sections.forEach((s) => {
    const node = map[s.id];
    if (!node) return;
    wrap.appendChild(node);
    node.style.display = s.enabled ? "" : "none";
  });
}

function ensureHomeAboutSection(config) {
  const id = "about";
  let section = document.getElementById(id);
  if (!section) {
    section = document.createElement("section");
    section.id = id;
    section.className = "section about-section";
  }

  const pages = Array.isArray(config?.pages) ? config.pages : [];
  const aboutPage = pages.find((p) => (p?.slug || "").toLowerCase() === "about");
  const blocks = sanitizeBlocks(Array.isArray(aboutPage?.blocks) ? aboutPage.blocks : []);

  section.innerHTML = "";
  const header = document.createElement("div");
  header.className = "section-header";
  header.innerHTML = "<span class=\"section-tag\">about</span><h2 class=\"section-title\">About</h2>";
  section.appendChild(header);

  // Create a grid layout similar to contact-grid
  const shell = document.createElement("div");
  shell.className = "about-shell";
  const aboutGrid = document.createElement("div");
  aboutGrid.className = "about-grid";

  const aboutCardConfig = (aboutPage && typeof aboutPage.aboutCard === "object" && aboutPage.aboutCard)
    ? aboutPage.aboutCard
    : (config && typeof config.aboutCard === "object" && config.aboutCard)
      ? config.aboutCard
      : {};

  const aboutPanel = document.createElement("div");
  aboutPanel.className = "about-panel";
  
  const aboutContent = document.createElement("div");
  aboutContent.className = "content-container";
  
  const aboutTop = document.createElement("div");
  aboutTop.className = "content-top";
  const aboutCat = document.createElement("div");
  aboutCat.className = "card-category";
  aboutCat.textContent = "About";
  const aboutType = document.createElement("div");
  aboutType.className = "card-app-type";
  aboutType.textContent = typeof aboutCardConfig?.meta === "string" ? aboutCardConfig.meta : "Product-minded developer • Sci-fi UI systems";
  const aboutTitle = document.createElement("h3");
  aboutTitle.className = "card-title";
  aboutTitle.textContent = typeof aboutCardConfig?.title === "string" && aboutCardConfig.title.trim()
    ? aboutCardConfig.title
    : "About Me";
  aboutTop.append(aboutCat, aboutType, aboutTitle);
  
  const aboutDivider = document.createElement("div");
  aboutDivider.className = "divider";
  
  const aboutBottom = document.createElement("div");
  aboutBottom.className = "content-bottom";
  const card = buildAboutCard(aboutCardConfig);
  aboutBottom.appendChild(card);
  
  aboutContent.append(aboutTop, aboutDivider, aboutBottom);
  aboutPanel.appendChild(aboutContent);
  aboutGrid.appendChild(aboutPanel);

  // Core Skills panel
  const skillsPanel = document.createElement("div");
  skillsPanel.className = "skills-panel";
  const skillsContent = document.createElement("div");
  skillsContent.className = "content-container";
  
  const skillsTop = document.createElement("div");
  skillsTop.className = "content-top";
  const skillsCat = document.createElement("div");
  skillsCat.className = "card-category";
  skillsCat.textContent = "Skills";
  const skillsType = document.createElement("div");
  skillsType.className = "card-app-type";
  skillsType.textContent = "Core Capabilities";
  const skillsTitle = document.createElement("h3");
  skillsTitle.className = "card-title";
  skillsTitle.textContent = "Core Skills";
  skillsTop.append(skillsCat, skillsType, skillsTitle);
  
  const skillsDivider = document.createElement("div");
  skillsDivider.className = "divider";
  
  const skillsBottom = document.createElement("div");
  skillsBottom.className = "content-bottom";
  const skillsGrid = document.createElement("div");
  skillsGrid.className = "capabilities-grid";
  skillsGrid.id = "about-capabilities-grid";
  
  // Add capability cards
  const capabilities = resolveCapabilities(config);
  
  capabilities.forEach((cap, i) => {
    const skillCard = document.createElement("div");
    skillCard.className = "capability-card";
    skillCard.style.animationDelay = `${i * 0.1}s`;
    skillCard.innerHTML = `
      <div class="capability-icon">${cap.icon || "🚀"}</div>
      <h4 class="capability-title">${cap.title || "Skill"}</h4>
    `;
    skillsGrid.appendChild(skillCard);
  });
  
  skillsBottom.appendChild(skillsGrid);
  skillsContent.append(skillsTop, skillsDivider, skillsBottom);
  skillsPanel.appendChild(skillsContent);
  aboutGrid.appendChild(skillsPanel);
  
  shell.appendChild(aboutGrid);
  section.appendChild(shell);
  
  // Remove any highlights section
  const highlights = section.querySelector(".about-highlights");
  if (highlights) highlights.remove();

  const rich = blocks.find((b) => b?.type === "richText" && typeof b?.html === "string" && b.html.trim());
  if (rich) {
    const content = document.createElement("div");
    content.className = "about-rich";
    content.innerHTML = String(rich.html);
    section.appendChild(content);
  }

  return section;
}

function renderPageFromConfig(config) {
  const pageContent = document.getElementById("page-content");
  if (!pageContent) return;

  const slug = getActivePageSlug(config);
  const pages = Array.isArray(config?.pages) ? config.pages : [];
  const page = pages.find((p) => (p?.slug || "").toLowerCase() === slug) || pages[0];

  const isHome = !page || page.template === "home" || slug === "home";
  setHomeVisibility(isHome);

  if (isHome) {
    pageContent.innerHTML = "";
    applyHomeLayout(config);
    return;
  }

  pageContent.innerHTML = "";
  const blocks = sanitizeBlocks(Array.isArray(page?.blocks) ? page.blocks : []);

  blocks.forEach((block) => {
    if (block?.type === "richText") {
      const section = document.createElement("section");
      section.className = "section";
      const inner = document.createElement("div");
      inner.className = "section-header";
      inner.innerHTML = String(block?.html || "");
      section.appendChild(inner);
      pageContent.appendChild(section);
    }
  });

  if (slug === "about") {
    const aboutSection = document.createElement("section");
    aboutSection.className = "section about-section";

    // Create a grid layout similar to contact-grid
    const shell = document.createElement("div");
    shell.className = "about-shell";
    const aboutGrid = document.createElement("div");
    aboutGrid.className = "about-grid";

    // About card panel
    const aboutCardConfig = (page && typeof page.aboutCard === "object" && page.aboutCard)
      ? page.aboutCard
      : (config && typeof config.aboutCard === "object" && config.aboutCard)
        ? config.aboutCard
        : {};

    const aboutPanel = document.createElement("div");
    aboutPanel.className = "about-panel";
    
    const aboutContent = document.createElement("div");
    aboutContent.className = "content-container";
    
    const aboutTop = document.createElement("div");
    aboutTop.className = "content-top";
    const aboutCat = document.createElement("div");
    aboutCat.className = "card-category";
    aboutCat.textContent = "About";
    const aboutType = document.createElement("div");
    aboutType.className = "card-app-type";
    aboutType.textContent = typeof aboutCardConfig?.meta === "string" ? aboutCardConfig.meta : "Product-minded developer • Sci-fi UI systems";
    const aboutTitle = document.createElement("h3");
    aboutTitle.className = "card-title";
    aboutTitle.textContent = typeof aboutCardConfig?.title === "string" && aboutCardConfig.title.trim()
      ? aboutCardConfig.title
      : "About Me";
    aboutTop.append(aboutCat, aboutType, aboutTitle);
    
    const aboutDivider = document.createElement("div");
    aboutDivider.className = "divider";
    
    const aboutBottom = document.createElement("div");
    aboutBottom.className = "content-bottom";
    const card = buildAboutCard(aboutCardConfig);
    aboutBottom.appendChild(card);
    
    aboutContent.append(aboutTop, aboutDivider, aboutBottom);
    aboutPanel.appendChild(aboutContent);
    aboutGrid.appendChild(aboutPanel);

    // Core Skills panel
    const skillsPanel = document.createElement("div");
    skillsPanel.className = "skills-panel";
    const skillsContent = document.createElement("div");
    skillsContent.className = "content-container";
    
    const skillsTop = document.createElement("div");
    skillsTop.className = "content-top";
    const skillsCat = document.createElement("div");
    skillsCat.className = "card-category";
    skillsCat.textContent = "Skills";
    const skillsType = document.createElement("div");
    skillsType.className = "card-app-type";
    skillsType.textContent = "Core Capabilities";
    const skillsTitle = document.createElement("h3");
    skillsTitle.className = "card-title";
    skillsTitle.textContent = "Core Skills";
    skillsTop.append(skillsCat, skillsType, skillsTitle);
    
    const skillsDivider = document.createElement("div");
    skillsDivider.className = "divider";
    
    const skillsBottom = document.createElement("div");
    skillsBottom.className = "content-bottom";
    const skillsGrid = document.createElement("div");
    skillsGrid.className = "capabilities-grid";
    skillsGrid.id = "about-capabilities-grid";
    
    // Add capability cards
    const capabilities = [
        { icon: "⚛️", title: "React" },
        { icon: "TS", title: "TypeScript" },
        { icon: "🛠️", title: "Full-Stack" },
        { icon: "🤖", title: "AI/ML" },
        { icon: "⛓️", title: "Microservices" },
        { icon: "⚡", title: "Real-time" },
        { icon: "📊", title: "Data Viz" },
        { icon: "🎨", title: "Design" },
        { icon: "🧰", title: "DevTools" },
        { icon: "🔐", title: "Security" },
      ];
    
    capabilities.forEach((cap, i) => {
      const skillCard = document.createElement("div");
      skillCard.className = "capability-card";
      skillCard.style.animationDelay = `${i * 0.1}s`;
      skillCard.innerHTML = `
        <div class="capability-icon">${cap.icon || "🚀"}</div>
        <h4 class="capability-title">${cap.title || "Skill"}</h4>
      `;
      skillsGrid.appendChild(skillCard);
    });
    
    skillsBottom.appendChild(skillsGrid);
    skillsContent.append(skillsTop, skillsDivider, skillsBottom);
    skillsPanel.appendChild(skillsContent);
    aboutGrid.appendChild(skillsPanel);
    shell.appendChild(aboutGrid);
    aboutSection.appendChild(shell);
    pageContent.appendChild(aboutSection);
  }
}

function buildAboutCard(aboutCardConfig) {
  const base = typeof aboutCardConfig?.base === "string" ? aboutCardConfig.base : "electric";
  const meta = typeof aboutCardConfig?.meta === "string" ? aboutCardConfig.meta : "Product-minded developer • Sci-fi UI systems";
  const body = typeof aboutCardConfig?.body === "string" && aboutCardConfig.body.trim()
    ? aboutCardConfig.body
    : "I design and build immersive web experiences that feel precise, fast, and intentional. I enjoy turning complex ideas into clean interfaces—and turning clean interfaces into systems that scale.";
  const tags = Array.isArray(aboutCardConfig?.tags)
    ? aboutCardConfig.tags
    : ["Design Systems", "TypeScript", "UX", "Performance"];

  // Create a simple content structure without the full card wrapper
  const content = document.createElement("div");
  content.className = "about-content";
  
  const description = document.createElement("p");
  description.className = "about-description";
  description.textContent = typeof aboutCardConfig?.description === "string" && aboutCardConfig.description.trim()
    ? aboutCardConfig.description
    : "Elegant UI, clean architecture, and small details that make products feel alive.";
  
  const tagsContainer = document.createElement("div");
  tagsContainer.className = "about-tags";
  
  if (Array.isArray(tags)) {
    tags.forEach(tag => {
      const tagEl = document.createElement("span");
      tagEl.className = "tag";
      tagEl.textContent = tag;
      tagsContainer.appendChild(tagEl);
    });
  }
  
  content.appendChild(description);
  content.appendChild(tagsContainer);

  return content;
}

function appendAboutHighlights(section, aboutCardConfig) {
  const highlights = Array.isArray(aboutCardConfig?.highlights) ? aboutCardConfig.highlights : [];
  if (!highlights.length) return;

  const grid = document.createElement("div");
  grid.className = "about-highlights";

  highlights.forEach((item) => {
    if (!item?.label || !item?.value) return;
    const entry = document.createElement("div");
    entry.className = "about-highlight";

    const label = document.createElement("span");
    label.className = "about-highlight-label";
    label.textContent = item.label;

    const value = document.createElement("p");
    value.className = "about-highlight-value";
    value.textContent = item.value;

    entry.append(label, value);
    grid.appendChild(entry);
  });

  section.appendChild(grid);
}

function updateDomFromConfig(config) {
  renderCapabilitiesSection(config);

  function upsertMetaByName(name, content) {
    if (!content || !String(content).trim()) return;
    let node = document.head.querySelector(`meta[name="${name}"]`);
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute("name", name);
      document.head.appendChild(node);
    }
    node.setAttribute("content", String(content));
  }

  function upsertMetaByProperty(property, content) {
    if (!content || !String(content).trim()) return;
    let node = document.head.querySelector(`meta[property="${property}"]`);
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute("property", property);
      document.head.appendChild(node);
    }
    node.setAttribute("content", String(content));
  }

  function upsertLink(rel, href) {
    if (!href || !String(href).trim()) return;
    let node = document.head.querySelector(`link[rel="${rel}"]`);
    if (!node) {
      node = document.createElement("link");
      node.setAttribute("rel", rel);
      document.head.appendChild(node);
    }
    node.setAttribute("href", String(href));
  }

  const assets = Array.isArray(config?.mediaLibrary) ? config.mediaLibrary : [];
  const seo = config?.seo || {};
  const metaTitle = seo?.metaTitle || config?.brand?.siteTitle || document.title;
  if (metaTitle) document.title = metaTitle;

  if (seo?.metaDescription) upsertMetaByName("description", seo.metaDescription);
  upsertMetaByProperty("og:title", metaTitle);
  if (seo?.metaDescription) upsertMetaByProperty("og:description", seo.metaDescription);

  const ogAsset = assets.find((a) => a?.id && a.id === seo?.ogImageAssetId);
  if (ogAsset?.dataUrl) upsertMetaByProperty("og:image", ogAsset.dataUrl);

  const favAsset = assets.find((a) => a?.id && a.id === seo?.faviconAssetId);
  if (favAsset?.dataUrl) upsertLink("icon", favAsset.dataUrl);

  const logo = document.querySelector(".logo");
  if (logo) {
    const logoUrl = config?.media?.logoDataUrl;
    if (typeof logoUrl === "string" && logoUrl.startsWith("data:image")) {
      logo.innerHTML = "";
      const img = document.createElement("img");
      img.src = logoUrl;
      img.alt = config?.brand?.logoText || "Logo";
      img.style.height = "28px";
      img.style.width = "auto";
      img.style.display = "block";
      logo.appendChild(img);
    } else if (config?.brand?.logoText) {
      logo.textContent = config.brand.logoText;
    }
  }

  const heroHeadline = document.querySelector(".glitch");
  if (heroHeadline && config?.hero?.headline) {
    heroHeadline.textContent = config.hero.headline;
    heroHeadline.setAttribute("data-text", config.hero.headline);
  }

  const typing = document.querySelector(".typing-text");
  if (typing && config?.hero?.typingText) typing.textContent = config.hero.typingText;

  const heroDesc = document.querySelector(".hero-description");
  if (heroDesc && typeof config?.hero?.description === "string") heroDesc.textContent = config.hero.description;

  const heroCta = document.querySelector(".hero .cta-btn");
  if (heroCta) {
    if (config?.hero?.ctaText) heroCta.textContent = config.hero.ctaText;
    if (config?.hero?.ctaHref) heroCta.setAttribute("href", config.hero.ctaHref);
  }

  const contactTitle = document.querySelector("#contact .cta-title");
  if (contactTitle && config?.contact?.title) contactTitle.textContent = config.contact.title;

  const contactSubtitle = document.querySelector("#contact .cta-subtitle");
  if (contactSubtitle && config?.contact?.subtitle) contactSubtitle.textContent = config.contact.subtitle;

  const contactGrid = document.getElementById("contact-grid");
  if (contactGrid) {
    contactGrid.innerHTML = "";

    const email = config?.contact?.email || "hello@example.com";
    const formCard = el("div", "contact-panel");
    const form = document.createElement("form");
    form.className = "contact-form";
    form.noValidate = true;

    function mkField(labelText, inputEl) {
      const wrap = document.createElement("div");
      wrap.className = "field";
      const label = document.createElement("label");
      label.textContent = labelText;
      wrap.appendChild(label);
      wrap.appendChild(inputEl);
      return wrap;
    }

    const rowTop = document.createElement("div");
    rowTop.className = "contact-form-row";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.autocomplete = "name";
    nameInput.placeholder = "Your name";
    nameInput.required = true;

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.autocomplete = "email";
    emailInput.placeholder = "you@example.com";
    emailInput.required = true;

    rowTop.append(mkField("Name", nameInput), mkField("Email", emailInput));

    const subjectInput = document.createElement("input");
    subjectInput.type = "text";
    subjectInput.placeholder = "Subject";
    subjectInput.required = true;

    const msg = document.createElement("textarea");
    msg.placeholder = "Your message";
    msg.required = true;

    const actions = document.createElement("div");
    actions.className = "contact-form-actions";

    const sendBtn = document.createElement("button");
    sendBtn.type = "submit";
    sendBtn.className = "contact-submit";
    sendBtn.textContent = "Send";

    const note = document.createElement("div");
    note.className = "contact-note";
    note.textContent = "Opens your email client (no backend).";

    actions.append(sendBtn, note);

    form.append(rowTop, mkField("Subject", subjectInput), mkField("Message", msg), actions);

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!form.reportValidity()) return;

      const fromName = nameInput.value.trim();
      const fromEmail = emailInput.value.trim();
      const subjectRaw = subjectInput.value.trim();
      const bodyLines = [];
      if (fromName) bodyLines.push(`Name: ${fromName}`);
      if (fromEmail) bodyLines.push(`Email: ${fromEmail}`);
      bodyLines.push("");
      bodyLines.push(msg.value.trim());

      const subject = encodeURIComponent(subjectRaw || "Website contact");
      const body = encodeURIComponent(bodyLines.join("\n"));
      window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
    });

    const formContent = el("div", "content-container");
    const formTop = el("div", "content-top");
    const formBottom = el("div", "content-bottom");
    const formCat = el("div", "card-category");
    formCat.textContent = "Contact";
    const formType = el("div", "card-app-type");
    formType.textContent = "Message";
    const formTitle = el("h3", "card-title");
    formTitle.textContent = "Send a Signal";
    const formDivider = el("div", "divider");
    formTop.append(formCat, formType, formTitle);
    formBottom.appendChild(form);
    formContent.append(formTop, formDivider, formBottom);
    formCard.appendChild(formContent);

    const infoCard = el("div", "contact-panel");
    const infoContent = el("div", "content-container");
    const infoTop = el("div", "content-top");
    const infoBottom = el("div", "content-bottom");

    const infoCat = el("div", "card-category");
    infoCat.textContent = "Identity";
    const infoType = el("div", "card-app-type");
    infoType.textContent = "E-Visitcard";
    const infoTitle = el("h3", "card-title");
    infoTitle.textContent = config?.brand?.siteTitle || "Portfolio";

    const infoDesc = el("p", "card-description");
    infoDesc.textContent = config?.hero?.headline || "";

    const infoTags = el("div", "card-tags");
    const emailTag = el("span", "tag");
    const emailA = document.createElement("a");
    emailA.href = `mailto:${email}`;
    emailA.textContent = email;
    emailTag.appendChild(emailA);
    infoTags.appendChild(emailTag);

    const social = config?.social || {};
    const socialItems = [
      { label: "GitHub", href: social.github },
      { label: "LinkedIn", href: social.linkedin },
      { label: "X", href: social.twitter },
    ].filter((x) => typeof x.href === "string" && x.href.trim());

    socialItems.forEach((item) => {
      const tag = el("span", "tag");
      const a = document.createElement("a");
      a.href = item.href;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = item.label;
      tag.appendChild(a);
      infoTags.appendChild(tag);
    });

    const infoDivider = el("div", "divider");
    infoTop.append(infoCat, infoType, infoTitle);
    infoBottom.append(infoDesc, infoTags);
    infoContent.append(infoTop, infoDivider, infoBottom);
    infoCard.appendChild(infoContent);

    contactGrid.append(formCard, infoCard);
  }

  const footerP = document.querySelector(".footer p");
  if (footerP) {
    const text = config?.footer?.text;
    if (typeof text === "string" && text.trim()) footerP.textContent = text;
  }

  if (window.SiteTemplate?.applyTheme) window.SiteTemplate.applyTheme(config);
}

function renderCardsFromConfig(config) {
  const grid = document.getElementById("projects-grid");
  if (!grid) return { cards: [], elements: [], dots: [] };

  grid.innerHTML = "";
  stopCycle();

  const elements = Array.isArray(config?.elements) && config.elements.length
    ? config.elements
    : ["electric", "fire", "water", "alien", "solar", "bio"];
  const projects = Array.isArray(config?.projects) ? config.projects : [];

  const cards = projects.map((p) => buildCard(p));
  cards.forEach((c) => grid.appendChild(c));

  const dots = Array.from(document.querySelectorAll(".element-dot"));
  window.__currentElementIndex = 0;
  applyInitialCardState(cards, elements);
  startCycle(cards, dots, elements);
  initTilt(cards);

  dots.forEach((dot, idx) => {
    dot.onclick = () => {
      stopCycle();
      window.__currentElementIndex = idx;
      const base = window.__currentElementIndex;
      cards.forEach((card, cardIdx) => {
        setCardElement(card, elements[(base + cardIdx) % elements.length]);
      });
      dots.forEach((d) => d.classList.remove("active"));
      dot.classList.add("active");
      window.setTimeout(() => startCycle(cards, dots, elements), 10000);
    };
  });

  return { cards, elements, dots };
}

function buildCard(project) {
  const card = el("div", "elemental-card reveal");
  card.dataset.element = project.base;

  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-pressed", "false");

  const decor = el("div", "card-decor");
  card.appendChild(decor);

  const flip = el("div", "card-flip");
  const front = el("div", "card-face front");
  const back = el("div", "card-face back");
  flip.append(front, back);
  card.appendChild(flip);

  const frameElectric = el("div", "card-frame electric-frame");
  frameElectric.appendChild(el("div", "card-inner"));
  const frameFire = el("div", "card-frame fire-frame");
  frameFire.appendChild(el("div", "card-inner"));
  const frameWater = el("div", "card-frame water-frame");
  frameWater.appendChild(el("div", "card-inner"));
  const frameAlien = el("div", "card-frame alien-frame");
  frameAlien.appendChild(el("div", "card-inner"));
  const frameSolar = el("div", "card-frame solar-frame");
  frameSolar.appendChild(el("div", "card-inner"));
  const frameBio = el("div", "card-frame bio-frame");
  frameBio.appendChild(el("div", "card-inner"));

  decor.append(frameElectric, frameFire, frameWater, frameAlien, frameSolar, frameBio);

  const border = el("div", "border-animation");
  decor.appendChild(border);

  const glowElectric = el("div", "glow-container electric-glow");
  glowElectric.append(el("div", "glow-orb glow-orb-1"), el("div", "glow-orb glow-orb-2"), el("div", "glow-orb glow-orb-3"));
  const glowFire = el("div", "glow-container fire-glow");
  glowFire.append(el("div", "glow-orb glow-orb-1"), el("div", "glow-orb glow-orb-2"), el("div", "glow-orb glow-orb-3"), el("div", "fire-wave"));
  const glowWater = el("div", "glow-container water-glow");
  const ripples = el("div", "water-ripples");
  glowWater.append(el("div", "glow-orb glow-orb-1"), el("div", "glow-orb glow-orb-2"), el("div", "glow-orb glow-orb-3"), ripples);
  const glowAlien = el("div", "glow-container alien-glow");
  glowAlien.append(el("div", "glow-orb glow-orb-1"), el("div", "glow-orb glow-orb-2"), el("div", "glow-orb glow-orb-3"), el("div", "alien-portal"));
  const glowSolar = el("div", "glow-container solar-glow");
  const sunCore = el("div", "sun-core");
  const sunHalo = el("div", "sun-halo");
  const sunHalo2 = el("div", "sun-halo-2");
  glowSolar.append(el("div", "glow-orb glow-orb-1"), el("div", "glow-orb glow-orb-2"), sunCore, sunHalo, sunHalo2);
  const glowBio = el("div", "glow-container bio-glow");
  const bioRing = el("div", "bio-ring");
  const bioNode1 = el("div", "bio-node");
  const bioNode2 = el("div", "bio-node");
  const bioNode3 = el("div", "bio-node");
  glowBio.append(el("div", "glow-orb glow-orb-1"), el("div", "glow-orb glow-orb-2"), bioRing, bioNode1, bioNode2, bioNode3);
  decor.append(glowElectric, glowFire, glowWater, glowAlien, glowSolar, glowBio);

  const filterElectric = el("div", "filter-layer electric-filter");
  const filterFire = el("div", "filter-layer fire-filter");
  const filterWater = el("div", "filter-layer water-filter");
  const filterAlien = el("div", "filter-layer alien-filter");
  const filterSolar = el("div", "filter-layer solar-filter");
  const filterBio = el("div", "filter-layer bio-filter");
  decor.append(filterElectric, filterFire, filterWater, filterAlien, filterSolar, filterBio);

  const chromatic = el("div", "chromatic-layer");
  decor.appendChild(chromatic);

  const particlesElectric = el("div", "element-particles electric-particles");
  const particlesFire = el("div", "element-particles fire-particles");
  const particlesWater = el("div", "element-particles water-particles");
  const particlesAlien = el("div", "element-particles alien-particles");
  const particlesSolar = el("div", "element-particles solar-particles");
  const particlesBio = el("div", "element-particles bio-particles");
  decor.append(particlesElectric, particlesFire, particlesWater, particlesAlien, particlesSolar, particlesBio);

  const content = el("div", "content-container");
  const top = el("div", "content-top");
  const bottom = el("div", "content-bottom");

  const category = el("div", "card-category");
  category.textContent = project.category;

  const appType = el("div", "card-app-type");
  appType.textContent = project.appType;

  const title = el("h3", "card-title");
  title.textContent = project.title;

  const divider = el("div", "divider");

  const desc = el("p", "card-description");
  desc.textContent = project.description;

  const tags = el("div", "card-tags");
  project.tags.forEach((t) => {
    const tag = el("span", "tag");
    tag.textContent = t;
    tags.appendChild(tag);
  });

  top.append(category, appType, title);
  bottom.append(desc, tags);
  content.append(top, divider, bottom);
  front.appendChild(content);

  for (let i = 0; i < 15; i++) {
    const p = el("div", "particle");
    p.style.left = Math.random() * 100 + "%";
    p.style.top = Math.random() * 100 + "%";
    p.style.animationDelay = Math.random() * 0.5 + "s";
    particlesElectric.appendChild(p);
  }

  for (let i = 0; i < 20; i++) {
    const ember = el("div", "ember");
    ember.style.left = Math.random() * 100 + "%";
    ember.style.animationDelay = Math.random() * 3 + "s";
    ember.style.animationDuration = 2 + Math.random() * 2 + "s";
    particlesFire.appendChild(ember);
  }

  for (let i = 0; i < 15; i++) {
    const bubble = el("div", "bubble");
    bubble.style.left = Math.random() * 100 + "%";
    const size = 5 + Math.random() * 15;
    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.animationDelay = Math.random() * 4 + "s";
    bubble.style.animationDuration = 3 + Math.random() * 2 + "s";
    particlesWater.appendChild(bubble);
  }

  for (let i = 0; i < 3; i++) {
    const r = el("div", "ripple");
    r.style.left = 20 + Math.random() * 60 + "%";
    r.style.top = 20 + Math.random() * 60 + "%";
    r.style.animationDelay = i + "s";
    ripples.appendChild(r);
  }

  for (let i = 0; i < 12; i++) {
    const spore = el("div", "spore");
    spore.style.left = Math.random() * 100 + "%";
    spore.style.bottom = Math.random() * 50 + "%";
    spore.style.animationDelay = Math.random() * 5 + "s";
    spore.style.animationDuration = 4 + Math.random() * 3 + "s";
    particlesAlien.appendChild(spore);
  }

  for (let i = 0; i < 18; i++) {
    const spark = el("div", "spark");
    spark.style.left = Math.random() * 100 + "%";
    spark.style.bottom = Math.random() * 50 + "%";
    spark.style.animationDelay = Math.random() * 3 + "s";
    spark.style.animationDuration = 2.5 + Math.random() * 1.5 + "s";
    particlesSolar.appendChild(spark);
  }

  for (let i = 0; i < 16; i++) {
    const sporeBio = el("div", "spore-bio");
    sporeBio.style.left = Math.random() * 100 + "%";
    sporeBio.style.bottom = Math.random() * 60 + "%";
    sporeBio.style.animationDelay = Math.random() * 3 + "s";
    sporeBio.style.animationDuration = 3 + Math.random() * 2 + "s";
    particlesBio.appendChild(sporeBio);
  }

  const backTitle = document.createElement("h3");
  backTitle.className = "card-back-title";
  backTitle.textContent = project.title || "Project";

  const backMeta = document.createElement("div");
  backMeta.className = "card-back-meta";
  backMeta.textContent = `${project.category || ""}${project.appType ? " • " + project.appType : ""}`.trim();

  const backBody = document.createElement("div");
  backBody.className = "card-back-body";
  backBody.textContent =
    "Card back content is intentionally a placeholder. Tell me what you want here (links, screenshots, metrics, story, stack, etc.).";

  const backTags = document.createElement("div");
  backTags.className = "card-back-tags";
  (Array.isArray(project.tags) ? project.tags : []).forEach((t) => {
    const tag = el("span", "tag");
    tag.textContent = t;
    backTags.appendChild(tag);
  });

  const hint = document.createElement("div");
  hint.className = "card-back-hint";
  hint.textContent = "Click to flip back";

  const backTop = document.createElement("div");
  backTop.append(backTitle, backMeta, backBody, backTags);
  back.append(backTop, hint);

  function toggleFlip() {
    const next = !card.classList.contains("is-flipped");
    card.classList.toggle("is-flipped", next);
    card.setAttribute("aria-pressed", String(next));
  }

  if (!project?.disableFlip) {
    card.addEventListener("click", toggleFlip);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFlip();
      }
    });
  }

  return card;
}

function setCardElement(card, element) {
  card.dataset.element = element;

  card.querySelectorAll(".card-frame").forEach((frame) => frame.classList.remove("active"));
  const frame = card.querySelector(`.${element}-frame`);
  if (frame) frame.classList.add("active");

  card.querySelectorAll(".glow-container").forEach((g) => g.classList.remove("active"));
  const glow = card.querySelector(`.${element}-glow`);
  if (glow) glow.classList.add("active");

  card.querySelectorAll(".filter-layer").forEach((f) => f.classList.remove("active"));
  const filter = card.querySelector(`.${element}-filter`);
  if (filter) filter.classList.add("active");

  card.querySelectorAll(".element-particles").forEach((p) => p.classList.remove("active"));
  const particles = card.querySelector(`.${element}-particles`);
  if (particles) particles.classList.add("active");

  const chromatic = card.querySelector(".chromatic-layer");
  if (chromatic) chromatic.classList.toggle("active", element === "alien");
}

function applyInitialCardState(cards, elements) {
  cards.forEach((card, idx) => {
    const element = elements[(idx + 0) % elements.length];
    setCardElement(card, element);
  });
}

function cycleElements(cards, dots, elements) {
  window.__currentElementIndex = (window.__currentElementIndex + 1) % elements.length;
  const base = window.__currentElementIndex;

  cards.forEach((card, idx) => {
    const element = elements[(base + idx) % elements.length];
    setCardElement(card, element);
  });

  dots.forEach((d) => d.classList.remove("active"));
  dots[base]?.classList.add("active");
}

function startCycle(cards, dots, elements) {
  window.__cycleInterval = window.setInterval(() => cycleElements(cards, dots, elements), 5000);
}

function stopCycle() {
  if (window.__cycleInterval) window.clearInterval(window.__cycleInterval);
}

function initCursor() {
  const cursor = document.querySelector(".cursor");
  const cursorDot = document.querySelector(".cursor-dot");
  if (!cursor || !cursorDot) return;

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
    cursorDot.style.left = e.clientX + "px";
    cursorDot.style.top = e.clientY + "px";
  });

  const interactive = document.querySelectorAll("a, button, .elemental-card, .nav-link, .element-dot");
  interactive.forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
  });
}

function initBackgroundParticles() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let particles = [];

  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > window.innerWidth) this.speedX *= -1;
      if (this.y < 0 || this.y > window.innerHeight) this.speedY *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(221, 132, 72, ${this.opacity})`;
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < 80; i++) particles.push(new Particle());
  }

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(221, 132, 72, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    connect();
    window.requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => {
    resize();
    init();
  });

  resize();
  init();
  animate();
}

function initReveal() {
  if (window.__revealBound) {
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((node) => {
      const windowHeight = window.innerHeight;
      const top = node.getBoundingClientRect().top;
      const visible = 150;
      if (top < windowHeight - visible) node.classList.add("active");
    });
    return;
  }
  window.__revealBound = true;

  let raf = 0;
  function reveal() {
    raf = 0;
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((node) => {
      const windowHeight = window.innerHeight;
      const top = node.getBoundingClientRect().top;
      const visible = 150;
      if (top < windowHeight - visible) node.classList.add("active");
    });
  }

  function scheduleReveal() {
    if (raf) return;
    raf = window.requestAnimationFrame(reveal);
  }

  window.addEventListener("scroll", scheduleReveal, { passive: true });
  scheduleReveal();
}

function initTilt(cards) {
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      if (card.classList.contains("is-flipped")) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 25;
      const rotateY = (centerX - x) / 25;
      card.style.transform = `translateY(-15px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) rotateX(0) rotateY(0)";
    });
  });
}

function initNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  let raf = 0;
  let elevated = null;
  function apply() {
    raf = 0;
    const next = window.scrollY > 100;
    if (next === elevated) return;
    elevated = next;
    if (next) {
      navbar.style.background = "rgba(10, 10, 15, 0.95)";
      navbar.style.boxShadow = "0 0 40px rgba(221, 132, 72, 0.2)";
      return;
    }
    navbar.style.background = "rgba(10, 10, 15, 0.8)";
    navbar.style.boxShadow = "0 0 30px rgba(221, 132, 72, 0.1)";
  }

  function schedule() {
    if (raf) return;
    raf = window.requestAnimationFrame(apply);
  }

  window.addEventListener("scroll", schedule, { passive: true });
  schedule();
}

function initSmoothScroll() {
  document.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href) return;

    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    if (href.includes("#")) {
      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      const samePage = url.pathname === window.location.pathname;
      if (!samePage) return;
      if (!url.hash) return;

      const target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function init() {
  initCursor();
  initBackgroundParticles();
  initReveal();
  initNavbarScroll();
  initSmoothScroll();
  initHeroHeadlineDustSwap();

  const mode = getMode();

  function render(config) {
    try {
      updateDomFromConfig(config);
    } catch (e) {
      console.error("updateDomFromConfig failed", e);
    }

    try {
      renderMenuFromConfig(config, mode);
    } catch (e) {
      console.error("renderMenuFromConfig failed", e);
    }

    try {
      renderPageFromConfig(config);
    } catch (e) {
      console.error("renderPageFromConfig failed", e);
    }

    try {
      renderCardsFromConfig(config);
    } catch (e) {
      console.error("renderCardsFromConfig failed", e);
    }

    try {
      initReveal();
    } catch (e) {
      console.error("initReveal failed", e);
    }

    window.setTimeout(scrollToHashIfPresent, 0);
  }

  const config = getConfig();
  render(config);

  if (window.SiteTemplate?.subscribe) {
    window.SiteTemplate.subscribe((next) => render(next), { mode });
  }
}

document.addEventListener("DOMContentLoaded", init);
