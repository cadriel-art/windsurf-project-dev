(function () {
  const STORAGE_KEY_LIVE = 'siteConfig.v2';
  const STORAGE_KEY_DRAFT = 'siteConfig.v2.draft';
  const STORAGE_KEY_BACKUPS = 'siteConfig.v2.backups';
  const LEGACY_KEYS = ['siteConfig.v1'];
  const CHANNEL_NAME = 'site-config';

  const CURRENT_SCHEMA_VERSION = 2;

  const DEFAULT_THEME_PRESETS = {
    default: {
      name: 'Default',
      theme: {
        electric: '#dd8448',
        electricLight: '#ff9d66',
        fire: '#ff4500',
        fireLight: '#ffd700',
        water: '#00bfff',
        waterLight: '#40e0d0',
        alien: '#b14aed',
        alienLight: '#00ff88',
        alienAccent: '#ff00ff',
        cyan: '#00f0ff',
        darkBg: '#0a0a0f',
      },
    },
    noir: {
      name: 'Noir',
      theme: {
        electric: '#b8b8b8',
        electricLight: '#ffffff',
        fire: '#ff2d55',
        fireLight: '#ff5a7a',
        water: '#4da3ff',
        waterLight: '#88c2ff',
        alien: '#a855f7',
        alienLight: '#c084fc',
        alienAccent: '#22d3ee',
        cyan: '#22d3ee',
        darkBg: '#06060a',
      },
    },
    aurora: {
      name: 'Aurora',
      theme: {
        electric: '#22c55e',
        electricLight: '#86efac',
        fire: '#f97316',
        fireLight: '#fdba74',
        water: '#06b6d4',
        waterLight: '#67e8f9',
        alien: '#8b5cf6',
        alienLight: '#c4b5fd',
        alienAccent: '#f472b6',
        cyan: '#67e8f9',
        darkBg: '#050b12',
      },
    },
  };

  const DEFAULT_CONFIG = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    brand: {
      logoText: 'CM',
      siteTitle: 'AI Dev Portfolio | Elemental Edition',
    },
    pages: [
      {
        id: 'home',
        slug: 'home',
        title: 'Home',
        template: 'home',
        blocks: [],
      },
      {
        id: 'about',
        slug: 'about',
        title: 'About',
        template: 'blocks',
        blocks: [],
      },
    ],
    menu: {
      primary: [
        { type: 'page', slug: 'home', label: 'Home' },
        { type: 'anchor', href: '#projects', label: 'Projects' },
        { type: 'page', slug: 'about', label: 'About' },
        { type: 'anchor', href: '#contact', label: 'Contact' },
      ],
    },
    hero: {
      headline: '',
      typingText: 'Building the future with code & intelligence',
      description:
        'Specializing in React, TypeScript, and full-stack development with expertise in AI integration, microservices architecture, and cutting-edge web technologies.',
      ctaText: 'View Projects',
      ctaHref: '#projects',
    },
    contact: {
      title: 'Ready to Build Something Extraordinary?',
      subtitle: "Let's collaborate on your next AI-powered application",
      email: 'hello@example.com',
      ctaText: 'Get in Touch',
    },
    aboutCard: {
      base: 'electric',
      title: 'Product Systems Engineer',
      meta: 'Product-minded developer • Sci-fi UI systems',
      body: 'I build AI-first interfaces that feel intentional, fast, and trustworthy. Every component is an opportunity to balance aesthetics, accessibility, and maintainability.',
      description:
        'Elegant UI, clean architecture, and small details that make products feel alive.',
      tags: ['Design Systems', 'TypeScript', 'UX', 'Performance'],
      highlights: [
        {
          label: 'Tooling',
          value: 'Custom CLI, schema guardrails, DX-focused workflows.',
        },
        {
          label: 'Systems',
          value: 'Atomic design libraries, token pipelines, CMS integration.',
        },
        {
          label: 'Delivery',
          value:
            'Ship-ready prototypes, observability baked in, smooth handoffs.',
        },
      ],
    },
    capabilities: {
      title: 'Core Competencies',
      subtitle:
        'Focused on the stacks and patterns that launch AI products faster.',
      items: [
        { label: 'React', icon: '⚛️', title: 'React' },
        { label: 'TypeScript', icon: 'TS', title: 'TypeScript' },
        { label: 'Full-Stack', icon: '🛠️', title: 'Full-Stack' },
        { label: 'AI / ML', icon: '🤖', title: 'AI/ML' },
        { label: 'Microservices', icon: '⛓️', title: 'Microservices' },
        { label: 'Real-Time', icon: '⚡', title: 'Real-time' },
        { label: 'Data Viz', icon: '📊', title: 'Data Viz' },
        { label: 'Design Systems', icon: '🎨', title: 'Design' },
        { label: 'DevTools', icon: '🧰', title: 'DevTools' },
        { label: 'Security', icon: '🔐', title: 'Security' },
      ],
    },
    footer: {
      text: '© 2025 AI Development Portfolio. Built with ♥ and elemental power.',
    },
    social: {
      github: '',
      linkedin: '',
      twitter: '',
    },
    themePresets: DEFAULT_THEME_PRESETS,
    activeThemeId: 'default',
    media: {
      logoDataUrl: '',
      avatarDataUrl: '',
    },
    mediaLibrary: [],
    seo: {
      metaTitle: '',
      metaDescription: '',
      ogImageAssetId: '',
      faviconAssetId: '',
    },
    homeLayout: {
      sections: [
        { id: 'hero', enabled: true },
        { id: 'capabilities', enabled: true },
        { id: 'projects', enabled: true },
        { id: 'contact', enabled: true },
        { id: 'footer', enabled: true },
      ],
    },
    elements: ['electric', 'fire', 'water', 'alien', 'solar', 'bio'],
    projects: [
      {
        category: 'Enterprise',
        appType: 'Legal Software',
        title: 'AI-Powered Legal Apps',
        description:
          'Enterprise legal practice management with microservices and AI-powered analysis.',
        tags: ['React', 'TypeScript', 'AI'],
        base: 'electric',
      },
      {
        category: 'Scheduling',
        appType: 'Scheduling Software',
        title: 'Pattern Engine',
        description:
          'AI-powered pattern recognition with enterprise permissions and real-time sync.',
        tags: ['Full-Stack', 'AI/ML', 'Real-time'],
        base: 'fire',
      },
      {
        category: 'Design',
        appType: 'Design Tool',
        title: 'Customizer',
        description:
          '25+ shapes with glassmorphic aesthetics, real-time preview, and code export.',
        tags: ['React', 'Canvas', 'Design'],
        base: 'water',
      },
      {
        category: 'DevTools',
        appType: 'Audit Framework',
        title: 'Validator',
        description:
          'Pre-production validation framework for security, functionality, and performance.',
        tags: ['Node.js', 'Security', 'Testing'],
        base: 'alien',
      },
      {
        category: 'Legal Tech',
        appType: 'Research Platform',
        title: 'Research Hub',
        description:
          'Real-time legal research with cross-jurisdictional analysis and AI recommendations.',
        tags: ['Full-Stack', 'React', 'AI'],
        base: 'electric',
      },
      {
        category: 'Analytics',
        appType: 'Dashboard',
        title: 'Analytics Hub',
        description:
          'Real-time data visualization with predictive analytics and sentiment analysis.',
        tags: ['React', 'D3.js', 'Analytics'],
        base: 'fire',
      },
      {
        category: 'Energy',
        appType: 'Sustainability Platform',
        title: 'Helios Grid',
        description:
          'Neon-bright solar operations console that balances energy markets with predictive insights.',
        tags: ['Solar', 'IoT', 'Optimization'],
        base: 'solar',
      },
      {
        category: 'Biome',
        appType: 'Bioinformatics Suite',
        title: 'Verdant Lab',
        description:
          'Living systems monitor that visualizes growth, genomes, and regenerative experiments.',
        tags: ['BioTech', 'ML', 'Data Viz'],
        base: 'bio',
      },
    ],
  };

  function safeJsonParse(raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function clone(obj) {
    if (typeof structuredClone === 'function') return structuredClone(obj);
    return JSON.parse(JSON.stringify(obj));
  }

  function loadBackups() {
    const raw = window.localStorage.getItem(STORAGE_KEY_BACKUPS);
    const parsed = raw ? safeJsonParse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  }

  function saveBackups(backups) {
    window.localStorage.setItem(STORAGE_KEY_BACKUPS, JSON.stringify(backups));
  }

  function listBackups() {
    return loadBackups();
  }

  function createBackup(opts) {
    const mode = opts?.mode === 'live' ? 'live' : 'draft';
    const label = typeof opts?.label === 'string' ? opts.label : '';
    const snapshot = loadConfig({ mode });
    const backups = loadBackups();
    const entry = {
      id: `backup-${Date.now()}`,
      createdAt: new Date().toISOString(),
      mode,
      label,
      snapshot: migrateConfig(snapshot),
    };

    const next = [entry, ...backups].slice(0, 30);
    saveBackups(next);
    return entry;
  }

  function deleteBackup(id) {
    const backups = loadBackups();
    const next = backups.filter((b) => b?.id !== id);
    saveBackups(next);
  }

  function restoreBackup(id, opts) {
    const targetMode = opts?.mode === 'live' ? 'live' : 'draft';
    const backups = loadBackups();
    const entry = backups.find((b) => b?.id === id);
    if (!entry) throw new Error('backup-not-found');
    saveConfig(entry.snapshot, { mode: targetMode });
  }

  function getActiveTheme(config) {
    const fromPreset = config?.themePresets?.[config?.activeThemeId]?.theme;
    if (fromPreset && typeof fromPreset === 'object') return fromPreset;
    if (config?.theme && typeof config.theme === 'object') return config.theme;
    return DEFAULT_THEME_PRESETS.default.theme;
  }

  function normalizeConfig(config) {
    const next = clone(DEFAULT_CONFIG);
    if (!config || typeof config !== 'object') return next;

    next.schemaVersion = CURRENT_SCHEMA_VERSION;

    next.brand = { ...next.brand, ...(config.brand || {}) };
    next.pages = Array.isArray(config.pages) ? config.pages : next.pages;
    next.menu = { ...next.menu, ...(config.menu || {}) };
    next.hero = { ...next.hero, ...(config.hero || {}) };
    next.contact = { ...next.contact, ...(config.contact || {}) };
    next.footer = { ...next.footer, ...(config.footer || {}) };
    next.social = { ...next.social, ...(config.social || {}) };

    const presets =
      config.themePresets && typeof config.themePresets === 'object'
        ? config.themePresets
        : null;
    next.themePresets = presets ? presets : clone(DEFAULT_THEME_PRESETS);
    next.activeThemeId =
      typeof config.activeThemeId === 'string' && config.activeThemeId
        ? config.activeThemeId
        : 'default';
    if (!next.themePresets[next.activeThemeId]) next.activeThemeId = 'default';

    next.media = { ...next.media, ...(config.media || {}) };
    next.mediaLibrary = Array.isArray(config.mediaLibrary)
      ? config.mediaLibrary
      : next.mediaLibrary;
    next.seo = { ...next.seo, ...(config.seo || {}) };
    next.homeLayout = { ...next.homeLayout, ...(config.homeLayout || {}) };
    next.homeLayout.sections = Array.isArray(config?.homeLayout?.sections)
      ? config.homeLayout.sections
      : next.homeLayout.sections;
    next.elements = Array.isArray(config.elements)
      ? config.elements
      : next.elements;
    next.projects = Array.isArray(config.projects)
      ? config.projects
      : next.projects;

    return next;
  }

  function migrateConfig(parsed) {
    if (!parsed || typeof parsed !== 'object') return clone(DEFAULT_CONFIG);

    const version =
      typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 1;
    if (version >= CURRENT_SCHEMA_VERSION) return normalizeConfig(parsed);

    if (version === 1) {
      const v2 = clone(parsed);
      v2.schemaVersion = 2;

      if (!v2.themePresets || typeof v2.themePresets !== 'object') {
        const theme =
          v2.theme && typeof v2.theme === 'object'
            ? v2.theme
            : clone(DEFAULT_THEME_PRESETS.default.theme);
        v2.themePresets = {
          ...clone(DEFAULT_THEME_PRESETS),
          migrated: { name: 'Migrated', theme },
        };
        v2.activeThemeId = 'migrated';
      }

      if (!v2.activeThemeId || typeof v2.activeThemeId !== 'string')
        v2.activeThemeId = 'default';
      if (!v2.media || typeof v2.media !== 'object')
        v2.media = { logoDataUrl: '', avatarDataUrl: '' };

      return normalizeConfig(v2);
    }

    return normalizeConfig(parsed);
  }

  function getStorageKey(mode) {
    return mode === 'draft' ? STORAGE_KEY_DRAFT : STORAGE_KEY_LIVE;
  }

  function loadConfig(opts) {
    const mode = opts?.mode === 'draft' ? 'draft' : 'live';
    const storageKey = getStorageKey(mode);
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? safeJsonParse(raw) : null;
    if (parsed) return migrateConfig(parsed);

    if (mode === 'draft') {
      const live = loadConfig({ mode: 'live' });
      window.localStorage.setItem(storageKey, JSON.stringify(live));
      return live;
    }

    for (const key of LEGACY_KEYS) {
      const legacyRaw = window.localStorage.getItem(key);
      const legacyParsed = legacyRaw ? safeJsonParse(legacyRaw) : null;
      if (!legacyParsed) continue;

      const migrated = migrateConfig(legacyParsed);
      window.localStorage.setItem(STORAGE_KEY_LIVE, JSON.stringify(migrated));
      return migrated;
    }

    return clone(DEFAULT_CONFIG);
  }

  function saveConfig(config, opts) {
    const mode = opts?.mode === 'draft' ? 'draft' : 'live';
    const storageKey = getStorageKey(mode);
    const normalized = migrateConfig(config);
    window.localStorage.setItem(storageKey, JSON.stringify(normalized));
    broadcast({ type: 'config-updated', key: storageKey });
  }

  function resetConfig(opts) {
    const mode = opts?.mode === 'draft' ? 'draft' : 'live';
    const storageKey = getStorageKey(mode);
    window.localStorage.removeItem(storageKey);
    if (mode === 'live')
      LEGACY_KEYS.forEach((k) => window.localStorage.removeItem(k));
    broadcast({ type: 'config-reset', key: storageKey });
  }

  function publishDraft() {
    const draft = loadConfig({ mode: 'draft' });
    saveConfig(draft, { mode: 'live' });
    broadcast({ type: 'config-published', key: STORAGE_KEY_LIVE });
  }

  function applyTheme(config) {
    const root = document.documentElement;

    const theme = getActiveTheme(config);
    const map = {
      '--electric': theme.electric,
      '--electric-light': theme.electricLight,
      '--fire': theme.fire,
      '--fire-light': theme.fireLight,
      '--water': theme.water,
      '--water-light': theme.waterLight,
      '--water-deep': theme.waterDeep || '#0077be',
      '--alien': theme.alien,
      '--alien-light': theme.alienLight,
      '--alien-accent': theme.alienAccent,
      '--cyan': theme.cyan,
      '--dark-bg': theme.darkBg,
    };

    Object.entries(map).forEach(([k, v]) => {
      if (typeof v === 'string' && v.trim()) root.style.setProperty(k, v);
    });
  }

  function broadcast(payload) {
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage(payload);
      bc.close();
    } catch {
      // Ignore
    }
  }

  function subscribe(onChange, opts) {
    if (typeof onChange !== 'function') return () => {};

    const mode = opts?.mode === 'draft' ? 'draft' : 'live';
    const storageKey = getStorageKey(mode);

    function handler() {
      onChange(loadConfig({ mode }));
    }

    let bc;
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.addEventListener('message', (e) => {
        const data = e?.data;
        if (data?.key && data.key !== storageKey) return;
        handler();
      });
    } catch {
      bc = null;
    }

    window.addEventListener('storage', (e) => {
      if (e.key === storageKey) handler();
    });

    return function unsubscribe() {
      if (bc) bc.close();
    };
  }

  window.SiteTemplate = {
    STORAGE_KEY_LIVE,
    STORAGE_KEY_DRAFT,
    STORAGE_KEY_BACKUPS,
    LEGACY_KEYS,
    CURRENT_SCHEMA_VERSION,
    DEFAULT_CONFIG,
    loadConfig,
    saveConfig,
    resetConfig,
    publishDraft,
    listBackups,
    createBackup,
    deleteBackup,
    restoreBackup,
    applyTheme,
    subscribe,
  };
})();
