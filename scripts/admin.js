function $(id) {
  return document.getElementById(id);
}

function downloadJson(filename, obj) {
  const raw = JSON.stringify(obj, null, 2);
  const blob = new Blob([raw], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedSave = debounce(() => {
  if (window.SiteTemplate?.saveConfig) {
    window.SiteTemplate.saveConfig({ mode: 'draft' });
    setStatus('Auto-saved', 'good');
  }
}, 2000);

function renderBackups() {
  const container = $('backups');
  if (!container) return;
  if (!window.SiteTemplate?.listBackups) return;

  const backups = SiteTemplate.listBackups();
  container.innerHTML = '';

  backups.forEach((b) => {
    const row = document.createElement('div');
    row.className = 'list-item';

    const meta = document.createElement('div');
    meta.className = 'list-meta';

    const title = document.createElement('div');
    title.className = 'list-title';
    title.textContent = b.label ? `${b.label}` : b.id;

    const sub = document.createElement('div');
    sub.className = 'list-sub';
    const when = b.createdAt ? new Date(b.createdAt).toLocaleString() : '';
    sub.textContent = `${when} • ${b.mode || 'draft'}`;
    meta.append(title, sub);

    const actions = document.createElement('div');
    actions.className = 'media-actions';

    const restoreDraft = document.createElement('button');
    restoreDraft.className = 'btn mini';
    restoreDraft.type = 'button';
    restoreDraft.textContent = 'Restore → Draft';

    const restoreLive = document.createElement('button');
    restoreLive.className = 'btn mini';
    restoreLive.type = 'button';
    restoreLive.textContent = 'Restore → Live';

    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn mini';
    exportBtn.type = 'button';
    exportBtn.textContent = 'Export Backup';

    const del = document.createElement('button');
    del.className = 'btn danger mini';
    del.type = 'button';
    del.textContent = 'Delete';

    restoreDraft.addEventListener('click', () => {
      try {
        SiteTemplate.restoreBackup(b.id, { mode: 'draft' });
        setStatus('Restored into Draft.');
        renderBackups();
      } catch {
        setStatus('Restore failed.', 'error');
      }
    });

    restoreLive.addEventListener('click', () => {
      try {
        SiteTemplate.restoreBackup(b.id, { mode: 'live' });
        setStatus('Restored into Live.');
        renderBackups();
      } catch {
        setStatus('Restore failed.', 'error');
      }
    });

    exportBtn.addEventListener('click', () => {
      downloadJson(`backup-${b.id}.json`, b);
      setStatus('Backup exported.');
    });

    del.addEventListener('click', () => {
      SiteTemplate.deleteBackup(b.id);
      renderBackups();
      setStatus('Backup deleted.');
    });

    actions.append(restoreDraft, restoreLive, exportBtn, del);
    row.append(meta, actions);
    container.appendChild(row);
  });
}

function sectionLabel(id) {
  if (id === 'hero') return 'Hero';
  if (id === 'projects') return 'Projects';
  if (id === 'contact') return 'Contact';
  if (id === 'footer') return 'Footer';
  return id;
}

function renderHomeBuilder(config, onUpdate) {
  const container = $('homeBuilder');
  if (!container) return;

  const sections = Array.isArray(config?.homeLayout?.sections)
    ? config.homeLayout.sections
    : [
        { id: 'hero', enabled: true },
        { id: 'projects', enabled: true },
        { id: 'contact', enabled: true },
        { id: 'footer', enabled: true },
      ];

  container.innerHTML = '';

  function commit(nextSections) {
    const next = clone(config);
    next.homeLayout = next.homeLayout || {};
    next.homeLayout.sections = nextSections;
    onUpdate(next);
  }

  sections.forEach((s, idx) => {
    const row = document.createElement('div');
    row.className = 'list-item';

    const meta = document.createElement('div');
    meta.className = 'list-meta';
    const title = document.createElement('div');
    title.className = 'list-title';
    title.textContent = sectionLabel(s.id);
    const sub = document.createElement('div');
    sub.className = 'list-sub';
    sub.textContent = s.enabled ? 'enabled' : 'disabled';
    meta.append(title, sub);

    const actions = document.createElement('div');
    actions.className = 'media-actions';

    const toggle = document.createElement('button');
    toggle.className = 'btn mini';
    toggle.type = 'button';
    toggle.textContent = s.enabled ? 'Disable' : 'Enable';

    const up = document.createElement('button');
    up.className = 'btn mini';
    up.type = 'button';
    up.textContent = 'Up';
    up.disabled = idx === 0;

    const down = document.createElement('button');
    down.className = 'btn mini';
    down.type = 'button';
    down.textContent = 'Down';
    down.disabled = idx === sections.length - 1;

    toggle.addEventListener('click', () => {
      const next = sections.map((x, i) =>
        i === idx ? { ...x, enabled: !x.enabled } : x,
      );
      commit(next);
    });

    up.addEventListener('click', () => {
      const next = sections.slice();
      const tmp = next[idx - 1];
      next[idx - 1] = next[idx];
      next[idx] = tmp;
      commit(next);
    });

    down.addEventListener('click', () => {
      const next = sections.slice();
      const tmp = next[idx + 1];
      next[idx + 1] = next[idx];
      next[idx] = tmp;
      commit(next);
    });

    actions.append(toggle, up, down);
    row.append(meta, actions);
    container.appendChild(row);
  });
}

function renderSeoEditor(config, onUpdate) {
  const metaTitle = $('seoMetaTitle');
  const metaDescription = $('seoMetaDescription');
  const ogImage = $('seoOgImage');
  const favicon = $('seoFavicon');
  if (!metaTitle || !metaDescription || !ogImage || !favicon) return;

  const seo = config?.seo || {};
  metaTitle.value = typeof seo.metaTitle === 'string' ? seo.metaTitle : '';
  metaDescription.value =
    typeof seo.metaDescription === 'string' ? seo.metaDescription : '';

  const assets = Array.isArray(config?.mediaLibrary) ? config.mediaLibrary : [];
  function fillSelect(selectEl, selectedId) {
    selectEl.innerHTML = '';
    const none = document.createElement('option');
    none.value = '';
    none.textContent = '(none)';
    selectEl.appendChild(none);
    assets.forEach((a) => {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = a.name || a.id;
      selectEl.appendChild(opt);
    });
    selectEl.value =
      selectedId && assets.some((a) => a.id === selectedId) ? selectedId : '';
  }

  fillSelect(ogImage, seo.ogImageAssetId);
  fillSelect(favicon, seo.faviconAssetId);

  function commit(partial) {
    const next = clone(config);
    next.seo = next.seo || {};
    next.seo = { ...next.seo, ...partial };
    onUpdate(next);
  }

  if (!metaTitle.dataset.bound) {
    metaTitle.dataset.bound = '1';
    metaTitle.addEventListener('input', () =>
      commit({ metaTitle: metaTitle.value }),
    );
  }

  if (!metaDescription.dataset.bound) {
    metaDescription.dataset.bound = '1';
    metaDescription.addEventListener('input', () =>
      commit({ metaDescription: metaDescription.value }),
    );
  }

  if (!ogImage.dataset.bound) {
    ogImage.dataset.bound = '1';
    ogImage.addEventListener('change', () =>
      commit({ ogImageAssetId: ogImage.value }),
    );
  }

  if (!favicon.dataset.bound) {
    favicon.dataset.bound = '1';
    favicon.addEventListener('change', () =>
      commit({ faviconAssetId: favicon.value }),
    );
  }
}

function renderMenuPrimary(config, onUpdate) {
  const container = $('menuPrimary');
  if (!container) return;

  const items = Array.isArray(config?.menu?.primary) ? config.menu.primary : [];
  container.innerHTML = '';

  items.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'row';

    const type = document.createElement('select');
    [
      { v: 'page', t: 'Page' },
      { v: 'anchor', t: 'Anchor' },
      { v: 'url', t: 'External URL' },
    ].forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.v;
      o.textContent = opt.t;
      type.appendChild(o);
    });
    type.value = item?.type || 'page';

    const label = document.createElement('input');
    label.value = item?.label || '';

    const dest = document.createElement('input');
    if (type.value === 'page') {
      dest.placeholder = 'page slug (e.g. about)';
      dest.value = item?.slug || 'home';
    } else {
      dest.placeholder =
        type.value === 'anchor' ? '#section' : 'https://example.com';
      dest.value = item?.href || '';
    }

    function commit(nextItem) {
      const next = clone(config);
      next.menu = next.menu || {};
      const nextItems = Array.isArray(next.menu.primary)
        ? next.menu.primary.slice()
        : [];
      nextItems[idx] = nextItem;
      next.menu.primary = nextItems;
      onUpdate(next);
    }

    function currentItem() {
      const currentType = type.value;
      const currentLabel = label.value;
      if (currentType === 'page') {
        return {
          type: 'page',
          slug: slugify(dest.value || 'home') || 'home',
          label: currentLabel || 'Page',
        };
      }
      if (currentType === 'anchor') {
        return {
          type: 'anchor',
          href: dest.value || '#',
          label: currentLabel || 'Anchor',
        };
      }
      return {
        type: 'url',
        href: dest.value || 'https://',
        label: currentLabel || 'Link',
      };
    }

    type.addEventListener('change', () => {
      if (type.value === 'page') {
        dest.placeholder = 'page slug (e.g. about)';
        dest.value = 'home';
      } else {
        dest.placeholder =
          type.value === 'anchor' ? '#section' : 'https://example.com';
        dest.value = '';
      }
      commit(currentItem());
    });

    label.addEventListener('input', () => commit(currentItem()));
    dest.addEventListener('input', () => commit(currentItem()));

    function wrap(labelText, inputEl, colClass) {
      const wrap = document.createElement('label');
      if (colClass) wrap.className = colClass;
      const span = document.createElement('span');
      span.textContent = labelText;
      wrap.append(span, inputEl);
      return wrap;
    }

    row.append(
      wrap('Type', type),
      wrap('Label', label, 'col-2'),
      wrap(type.value === 'page' ? 'Slug' : 'Href', dest, 'col-3'),
    );

    const actions = document.createElement('div');
    actions.className = 'row-actions';

    const meta = document.createElement('div');
    meta.className = 'pill';
    meta.textContent = `#${idx + 1}`;

    const up = document.createElement('button');
    up.className = 'btn mini';
    up.type = 'button';
    up.textContent = 'Up';
    up.disabled = idx === 0;

    const down = document.createElement('button');
    down.className = 'btn mini';
    down.type = 'button';
    down.textContent = 'Down';
    down.disabled = idx === items.length - 1;

    const remove = document.createElement('button');
    remove.className = 'btn danger mini';
    remove.type = 'button';
    remove.textContent = 'Remove';

    up.addEventListener('click', () => {
      const next = clone(config);
      next.menu = next.menu || {};
      const nextItems = items.slice();
      const tmp = nextItems[idx - 1];
      nextItems[idx - 1] = nextItems[idx];
      nextItems[idx] = tmp;
      next.menu.primary = nextItems;
      onUpdate(next);
    });

    down.addEventListener('click', () => {
      const next = clone(config);
      next.menu = next.menu || {};
      const nextItems = items.slice();
      const tmp = nextItems[idx + 1];
      nextItems[idx + 1] = nextItems[idx];
      nextItems[idx] = tmp;
      next.menu.primary = nextItems;
      onUpdate(next);
    });

    remove.addEventListener('click', () => {
      const next = clone(config);
      next.menu = next.menu || {};
      next.menu.primary = items.filter((_, i) => i !== idx);
      onUpdate(next);
    });

    actions.append(meta, up, down, remove);
    row.appendChild(actions);
    container.appendChild(row);
  });
}

function setStatus(text, type) {
  const node = $('status');
  if (!node) return;
  node.textContent = text;
  node.dataset.type = type || 'info';
}

function renderDiagnostics(state) {
  const box = $('diagnostics');
  if (!box) return;

  const pills = [];

  function pill(label, value, cls) {
    const safeValue = value == null ? '' : String(value);
    pills.push(
      `<span class="diag-pill ${cls || ''}"><strong>${label}:</strong> ${safeValue}</span>`,
    );
  }

  pill('Mode', state.mode, '');
  pill('Storage', state.storageKey, '');
  pill('State', state.saveState, state.saveStateClass);
  if (state.lastSaved) pill('Last Saved', state.lastSaved, 'good');
  if (state.lastError) pill('Error', state.lastError, 'bad');

  box.innerHTML = `<div class="row">${pills.join(' ')}</div>`;
}

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function readFileAsText(file) {
  return file.text();
}

function clone(obj) {
  if (typeof structuredClone === 'function') return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

function debounce(fn, waitMs) {
  let t;
  return function (...args) {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn.apply(this, args), waitMs);
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('file-read-failed'));
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes) {
  const n = Number(bytes || 0);
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function renderMediaLibrary(config, onUpdate) {
  const container = $('mediaLibrary');
  if (!container) return;
  const items = Array.isArray(config?.mediaLibrary) ? config.mediaLibrary : [];
  container.innerHTML = '';

  items.forEach((asset) => {
    const row = document.createElement('div');
    row.className = 'media-item';

    const thumb = document.createElement('div');
    thumb.className = 'media-thumb';
    if (asset?.dataUrl) {
      const img = document.createElement('img');
      img.src = asset.dataUrl;
      img.alt = asset.name || 'Media';
      thumb.appendChild(img);
    }

    const body = document.createElement('div');

    const meta = document.createElement('div');
    meta.className = 'media-meta';
    const name = document.createElement('div');
    name.className = 'media-name';
    name.textContent = asset?.name || asset?.id || 'Untitled';
    const sub = document.createElement('div');
    sub.className = 'media-sub';
    sub.textContent = `${formatBytes(asset?.size)} • ${asset?.type || 'image'}`;
    meta.append(name, sub);

    const actions = document.createElement('div');
    actions.className = 'media-actions';

    const useLogo = document.createElement('button');
    useLogo.className = 'btn mini';
    useLogo.type = 'button';
    useLogo.textContent = 'Use as Logo';

    const useAvatar = document.createElement('button');
    useAvatar.className = 'btn mini';
    useAvatar.type = 'button';
    useAvatar.textContent = 'Use as Avatar';

    const copy = document.createElement('button');
    copy.className = 'btn mini';
    copy.type = 'button';
    copy.textContent = 'Copy Data URL';

    const remove = document.createElement('button');
    remove.className = 'btn danger mini';
    remove.type = 'button';
    remove.textContent = 'Delete';

    function commit(next) {
      onUpdate(next);
    }

    useLogo.addEventListener('click', () => {
      const next = clone(config);
      next.media = next.media || {};
      next.media.logoDataUrl = asset.dataUrl || '';
      commit(next);
      setStatus('Logo set from library.');
    });

    useAvatar.addEventListener('click', () => {
      const next = clone(config);
      next.media = next.media || {};
      next.media.avatarDataUrl = asset.dataUrl || '';
      commit(next);
      setStatus('Avatar set from library.');
    });

    copy.addEventListener('click', async () => {
      if (!asset?.dataUrl) return;
      const ok = await copyToClipboard(asset.dataUrl);
      setStatus(ok ? 'Copied.' : 'Copy failed.', ok ? 'info' : 'error');
    });

    remove.addEventListener('click', () => {
      const next = clone(config);
      next.mediaLibrary = (
        Array.isArray(next.mediaLibrary) ? next.mediaLibrary : []
      ).filter((x) => x?.id !== asset.id);
      commit(next);
      setStatus('Deleted media item.');
    });

    actions.append(useLogo, useAvatar, copy, remove);
    body.append(meta, actions);
    row.append(thumb, body);
    container.appendChild(row);
  });
}

function normalizeTags(raw) {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function slugify(raw) {
  return String(raw || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function ensureUniqueSlug(pages, desired, currentId) {
  const base = slugify(desired) || 'page';
  let slug = base;
  let i = 2;
  const taken = new Set(
    (Array.isArray(pages) ? pages : [])
      .filter((p) => p && p.id !== currentId)
      .map((p) => String(p.slug || '').toLowerCase()),
  );
  while (taken.has(slug)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

function getSelectedPageId() {
  return window.__selectedPageId || 'home';
}

function setSelectedPageId(id) {
  window.__selectedPageId = id;
}

function getSelectedPage(config) {
  const pages = Array.isArray(config?.pages) ? config.pages : [];
  const id = getSelectedPageId();
  return pages.find((p) => p?.id === id) || pages[0] || null;
}

function renderPages(config, onUpdate) {
  const container = $('pages');
  if (!container) return;
  const pages = Array.isArray(config?.pages) ? config.pages : [];

  if (!pages.length) {
    container.innerHTML = '';
    return;
  }

  if (!pages.some((p) => p?.id === getSelectedPageId())) {
    setSelectedPageId(pages[0].id);
  }

  container.innerHTML = '';
  pages.forEach((p) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    if (p.id === getSelectedPageId()) row.classList.add('active');

    const meta = document.createElement('div');
    meta.className = 'list-meta';

    const title = document.createElement('div');
    title.className = 'list-title';
    title.textContent = p.title || p.slug || p.id;

    const sub = document.createElement('div');
    sub.className = 'list-sub';
    sub.textContent = `/${p.slug} • ${p.template || 'blocks'}`;

    meta.append(title, sub);

    const selectBtn = document.createElement('button');
    selectBtn.className = 'btn mini';
    selectBtn.type = 'button';
    selectBtn.textContent = 'Edit';
    selectBtn.addEventListener('click', () => {
      setSelectedPageId(p.id);
      renderPages(config, onUpdate);
      renderPageEditor(config, onUpdate);
    });

    row.append(meta, selectBtn);
    container.appendChild(row);
  });
}

function renderBlocksEditor(page, config, onUpdate) {
  const blocksWrap = $('blocks');
  if (!blocksWrap) return;
  blocksWrap.innerHTML = '';

  const blocks = Array.isArray(page?.blocks) ? page.blocks : [];

  blocks.forEach((block, idx) => {
    const row = document.createElement('div');
    row.className = 'row';

    const html = document.createElement('textarea');
    html.rows = 6;
    html.value = String(block?.html || '');

    const actions = document.createElement('div');
    actions.className = 'row-actions';

    const meta = document.createElement('div');
    meta.className = 'pill';
    meta.textContent = `Block #${idx + 1} • richText`;

    const up = document.createElement('button');
    up.className = 'btn mini';
    up.type = 'button';
    up.textContent = 'Up';
    up.disabled = idx === 0;

    const down = document.createElement('button');
    down.className = 'btn mini';
    down.type = 'button';
    down.textContent = 'Down';
    down.disabled = idx === blocks.length - 1;

    const remove = document.createElement('button');
    remove.className = 'btn danger mini';
    remove.type = 'button';
    remove.textContent = 'Remove';

    function commit(nextBlocks) {
      const next = clone(config);
      const pages = Array.isArray(next.pages) ? next.pages : [];
      const pageIdx = pages.findIndex((p) => p?.id === page.id);
      if (pageIdx === -1) return;
      pages[pageIdx] = { ...pages[pageIdx], blocks: nextBlocks };
      next.pages = pages;
      onUpdate(next);
    }

    html.addEventListener('input', () => {
      const nextBlocks = blocks.map((b, i) =>
        i === idx ? { type: 'richText', html: html.value } : b,
      );
      commit(nextBlocks);
    });

    up.addEventListener('click', () => {
      const nextBlocks = blocks.slice();
      const tmp = nextBlocks[idx - 1];
      nextBlocks[idx - 1] = nextBlocks[idx];
      nextBlocks[idx] = tmp;
      commit(nextBlocks);
    });

    down.addEventListener('click', () => {
      const nextBlocks = blocks.slice();
      const tmp = nextBlocks[idx + 1];
      nextBlocks[idx + 1] = nextBlocks[idx];
      nextBlocks[idx] = tmp;
      commit(nextBlocks);
    });

    remove.addEventListener('click', () => {
      const nextBlocks = blocks.filter((_, i) => i !== idx);
      commit(nextBlocks);
    });

    actions.append(meta, up, down, remove);
    row.appendChild(html);
    row.appendChild(actions);
    blocksWrap.appendChild(row);
  });
}

function renderPageEditor(config, onUpdate) {
  const pageTitle = $('pageTitle');
  const pageSlug = $('pageSlug');
  const pageTemplate = $('pageTemplate');
  if (!pageTitle || !pageSlug || !pageTemplate) return;

  const page = getSelectedPage(config);
  if (!page) return;

  pageTitle.value = page.title || '';
  pageSlug.value = page.slug || '';
  pageTemplate.value = page.template || 'blocks';

  renderBlocksEditor(page, config, onUpdate);

  function commit(partial) {
    const next = clone(config);
    const pages = Array.isArray(next.pages) ? next.pages : [];
    const idx = pages.findIndex((p) => p?.id === page.id);
    if (idx === -1) return;
    pages[idx] = { ...pages[idx], ...partial };
    next.pages = pages;
    onUpdate(next);
  }

  if (!pageTitle.dataset.boundPages) {
    pageTitle.dataset.boundPages = '1';
    pageTitle.addEventListener('input', () => {
      commit({ title: pageTitle.value });
    });
  }

  if (!pageSlug.dataset.boundPages) {
    pageSlug.dataset.boundPages = '1';
    pageSlug.addEventListener('input', () => {
      const base = getSelectedPage(config);
      const pages = Array.isArray(config?.pages) ? config.pages : [];
      const nextSlug = ensureUniqueSlug(pages, pageSlug.value, base?.id);
      if (pageSlug.value !== nextSlug) pageSlug.value = nextSlug;
      commit({ slug: nextSlug });
    });
  }

  if (!pageTemplate.dataset.boundPages) {
    pageTemplate.dataset.boundPages = '1';
    pageTemplate.addEventListener('change', () => {
      commit({ template: pageTemplate.value });
    });
  }
}

function projectRow(project, index, mediaLibrary, onChange, onRemove, onReorder, totalProjects) {
  const row = document.createElement('div');
  row.className = 'row';

  const cat = document.createElement('input');
  cat.value = project.category || '';

  const app = document.createElement('input');
  app.value = project.appType || '';

  const title = document.createElement('input');
  title.value = project.title || '';

  const base = document.createElement('select');
  ['electric', 'fire', 'water', 'alien'].forEach(el => {
    const opt = document.createElement('option');
    opt.value = el;
    opt.textContent = el;
    base.appendChild(opt);
  });
  base.value = project.base || 'electric';

  const tags = document.createElement('input');
  tags.value = Array.isArray(project.tags) ? project.tags.join(', ') : '';

  const desc = document.createElement('textarea');
  desc.rows = 3;
  desc.value = project.description || '';

  const links = document.createElement('textarea');
  links.rows = 2;
  links.placeholder = 'https://example.com\nhttps://github.com/project';
  links.value = Array.isArray(project.links) ? project.links.join('\n') : '';

  const featuredImage = document.createElement('select');
  featuredImage.innerHTML = '<option value="">None</option>';
  if (Array.isArray(mediaLibrary)) {
    mediaLibrary.forEach(asset => {
      const opt = document.createElement('option');
      opt.value = asset.id;
      opt.textContent = asset.name || asset.id;
      featuredImage.appendChild(opt);
    });
  }
  featuredImage.value = project.featuredImage || '';

  const hidden = document.createElement('input');
  hidden.type = 'checkbox';
  hidden.checked = project.hidden || false;

  function wrap(labelText, inputEl, colClass) {
    const wrap = document.createElement('label');
    if (colClass) wrap.className = colClass;

    const span = document.createElement('span');
    span.textContent = labelText;

    wrap.append(span, inputEl);
    return wrap;
  }

  row.append(
    wrap('Category', cat),
    wrap('Type', app),
    wrap('Title', title, 'col-2'),
    wrap('Element', base),
    wrap('Tags (comma)', tags, 'col-2'),
    wrap('Description', desc, 'col-6'),
    wrap('Links (newline)', links, 'col-3'),
    wrap('Featured Image', featuredImage, 'col-2'),
    wrap('Hidden', hidden),
  );

  const actions = document.createElement('div');
  actions.className = 'row-actions';

  const meta = document.createElement('div');
  meta.className = 'pill';
  meta.textContent = `#${index + 1}`;

  const up = document.createElement('button');
  up.className = 'btn mini';
  up.type = 'button';
  up.textContent = 'Up';
  up.disabled = index === 0;

  const down = document.createElement('button');
  down.className = 'btn mini';
  down.type = 'button';
  down.textContent = 'Down';
  down.disabled = index === totalProjects - 1;

  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn danger';
  removeBtn.type = 'button';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', () => onRemove(index));

  actions.append(meta, up, down, removeBtn);
  row.appendChild(actions);

  function emit() {
    onChange(index, {
      category: cat.value,
      appType: app.value,
      title: title.value,
      description: desc.value,
      base: base.value,
      tags: normalizeTags(tags.value),
      links: links.value.split('\n').map(l => l.trim()).filter(Boolean),
      featuredImage: featuredImage.value,
      hidden: hidden.checked,
    });
  }

  [cat, app, title, desc, base, tags, links, featuredImage, hidden].forEach((node) =>
    node.addEventListener('input', emit),
  );
  featuredImage.addEventListener('change', emit);
  hidden.addEventListener('change', emit);

  up.addEventListener('click', () => onReorder(index, 'up'));
  down.addEventListener('click', () => onReorder(index, 'down'));

  return row;
}

function renderProjects(config, onUpdate) {
  const container = $('projects');
  if (!container) return;

  container.innerHTML = '';

  const projects = Array.isArray(config.projects) ? config.projects : [];
  const mediaLibrary = Array.isArray(config.mediaLibrary) ? config.mediaLibrary : [];

  function onReorder(index, direction) {
    const next = clone(config);
    const projs = next.projects.slice();
    if (direction === 'up' && index > 0) {
      [projs[index - 1], projs[index]] = [projs[index], projs[index - 1]];
    } else if (direction === 'down' && index < projs.length - 1) {
      [projs[index + 1], projs[index]] = [projs[index], projs[index + 1]];
    }
    next.projects = projs;
    onUpdate(next);
  }

  projects.forEach((p, idx) => {
    const row = projectRow(
      p,
      idx,
      mediaLibrary,
      (index, next) => {
        const nextConfig = clone(config);
        nextConfig.projects[index] = next;
        onUpdate(nextConfig);
      },
      (index) => {
        const nextConfig = clone(config);
        nextConfig.projects.splice(index, 1);
        onUpdate(nextConfig);
      },
      onReorder,
      projects.length,
    );

    container.appendChild(row);
  });
}

function getActiveTheme(config) {
  const id = config.activeThemeId || 'default';
  if (!config.themePresets) config.themePresets = {};
  if (!config.themePresets[id]) config.themePresets[id] = { name: id, theme: {} };
  return config.themePresets[id].theme;
}

function renderThemeColors(config, onUpdate) {
  const container = $('themeColors');
  if (!container) return;
  container.innerHTML = '';

  const elements = ['electric', 'fire', 'water', 'alien'];
  const activeTheme = getActiveTheme(config);

  elements.forEach(el => {
    const elColors = activeTheme.colors?.[el] || {};
    ['background', 'text', 'accent'].forEach(prop => {
      const label = document.createElement('label');
      label.innerHTML = `
        <span>${el} ${prop}</span>
        <input type="color" value="${elColors[prop] || '#000000'}" />
      `;
      const input = label.querySelector('input');
      input.addEventListener('change', () => {
        const next = clone(config);
        const theme = getActiveTheme(next);
        if (!theme.colors) theme.colors = {};
        if (!theme.colors[el]) theme.colors[el] = {};
        theme.colors[el][prop] = input.value;
        onUpdate(next);
      });
      container.appendChild(label);
    });
  });
}

function bindBasics(getConfig, onUpdate) {
  const logoText = $('logoText');
  const siteTitle = $('siteTitle');
  const themePreset = $('themePreset');
  const duplicateTheme = $('duplicateTheme');
  const logoUpload = $('logoUpload');
  const avatarUpload = $('avatarUpload');
  const heroHeadline = $('heroHeadline');
  const heroTyping = $('heroTyping');
  const heroDescription = $('heroDescription');
  const contactTitle = $('contactTitle');
  const contactSubtitle = $('contactSubtitle');
  const contactEmail = $('contactEmail');
  const footerText = $('footerText');
  const socialGithub = $('socialGithub');
  const socialLinkedIn = $('socialLinkedIn');
  const socialTwitter = $('socialTwitter');
  const themeFontFamily = $('themeFontFamily');
  const themeFontSize = $('themeFontSize');

  function renderThemePresets(nextConfig) {
    if (!themePreset) return;
    themePreset.innerHTML = '';

    const presets =
      nextConfig?.themePresets && typeof nextConfig.themePresets === 'object'
        ? nextConfig.themePresets
        : {};
    Object.entries(presets).forEach(([id, preset]) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = preset?.name ? String(preset.name) : id;
      themePreset.appendChild(opt);
    });

    const active = nextConfig?.activeThemeId || 'default';
    themePreset.value = presets[active] ? active : 'default';
  }

  function fill() {
    const config = getConfig();
    if (!config) return;
    if (logoText) logoText.value = config.brand?.logoText || '';
    if (siteTitle) siteTitle.value = config.brand?.siteTitle || '';
    if (heroHeadline) heroHeadline.value = config.hero?.headline || '';
    if (heroTyping) heroTyping.value = config.hero?.typingText || '';
    if (heroDescription) heroDescription.value = config.hero?.description || '';
    if (contactTitle) contactTitle.value = config.contact?.title || '';
    if (contactSubtitle) contactSubtitle.value = config.contact?.subtitle || '';
    if (contactEmail) contactTitle.value = config.contact?.email || '';
    if (footerText) footerText.value = config.footer?.text || '';
    if (socialGithub) socialGithub.value = config.social?.github || '';
    if (socialLinkedIn) socialLinkedIn.value = config.social?.linkedin || '';
    if (socialTwitter) socialTwitter.value = config.social?.twitter || '';

    const activeTheme = getActiveTheme(config);
    if (themeFontFamily) themeFontFamily.value = activeTheme.fontFamily || '';
    if (themeFontSize) themeFontSize.value = activeTheme.fontSize || 16;
    renderThemeColors(config, onUpdate);

    renderThemePresets(config);
  }

  function update() {
    const base = getConfig();
    if (!base) return;
    const next = clone(base);
    next.brand.logoText = logoText?.value || '';
    next.brand.siteTitle = siteTitle?.value || '';
    next.hero.headline = heroHeadline?.value || '';
    next.hero.typingText = heroTyping?.value || '';
    next.hero.description = heroDescription?.value || '';
    next.contact.title = contactTitle?.value || '';
    next.contact.subtitle = contactSubtitle?.value || '';
    next.contact.email = contactEmail?.value || '';
    next.footer = next.footer || {};
    next.footer.text = footerText?.value || '';
    next.social = next.social || {};
    next.social.github = socialGithub?.value || '';
    next.social.linkedin = socialLinkedIn?.value || '';
    next.social.twitter = socialTwitter?.value || '';
    onUpdate(next);
  }

  if (themePreset && !themePreset.dataset.bound) {
    themePreset.dataset.bound = '1';
    themePreset.addEventListener('change', () => {
      const base = getConfig();
      if (!base) return;
      const next = clone(base);
      next.activeThemeId = themePreset.value;
      onUpdate(next);
      fill();
    });
  }

  if (duplicateTheme && !duplicateTheme.dataset.bound) {
    duplicateTheme.dataset.bound = '1';
    duplicateTheme.addEventListener('click', () => {
      const base = getConfig();
      if (!base) return;
      const next = clone(base);
      const activeId = next.activeThemeId || 'default';
      const active = next?.themePresets?.[activeId]?.theme || {};
      const newId = `custom-${Date.now()}`;
      if (!next.themePresets || typeof next.themePresets !== 'object')
        next.themePresets = {};
      next.themePresets[newId] = { name: 'Custom Copy', theme: clone(active) };
      next.activeThemeId = newId;
      onUpdate(next);
      setStatus('Theme duplicated.');
      fill();
    });
  }

  if (logoUpload && !logoUpload.dataset.bound) {
    logoUpload.dataset.bound = '1';
    logoUpload.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const url = await readFileAsDataUrl(file);
        const base = getConfig();
        if (!base) return;
        const next = clone(base);
        next.media = next.media || {};
        next.media.logoDataUrl = url;
        onUpdate(next);
        setStatus('Logo updated.');
      } catch {
        setStatus('Could not read image.', 'error');
      } finally {
        e.target.value = '';
      }
    });
  }

  if (avatarUpload && !avatarUpload.dataset.bound) {
    avatarUpload.dataset.bound = '1';
    avatarUpload.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const url = await readFileAsDataUrl(file);
        const base = getConfig();
        if (!base) return;
        const next = clone(base);
        next.media = next.media || {};
        next.media.avatarDataUrl = url;
        onUpdate(next);
        setStatus('Avatar updated.');
      } catch {
        setStatus('Could not read image.', 'error');
      } finally {
        e.target.value = '';
      }
    });
  }

  [
    logoText,
    siteTitle,
    heroHeadline,
    heroTyping,
    heroDescription,
    contactTitle,
    contactSubtitle,
    contactEmail,
    footerText,
    socialGithub,
    socialLinkedIn,
    socialTwitter,
  ].forEach((node) => {
    if (!node) return;
    if (node.dataset.bound) return;
    node.dataset.bound = '1';
    node.addEventListener('input', update);
  });

  if (themeFontFamily && !themeFontFamily.dataset.bound) {
    themeFontFamily.dataset.bound = '1';
    themeFontFamily.addEventListener('input', () => {
      const next = clone(config);
      const theme = getActiveTheme(next);
      theme.fontFamily = themeFontFamily.value;
      onUpdate(next);
    });
  }

  if (themeFontSize && !themeFontSize.dataset.bound) {
    themeFontSize.dataset.bound = '1';
    themeFontSize.addEventListener('input', () => {
      const next = clone(config);
      const theme = getActiveTheme(next);
      theme.fontSize = parseInt(themeFontSize.value) || 16;
      onUpdate(next);
    });
  }

  fill();
}

function init() {
  const MODE = 'draft';

  const diagnostics = {
    mode: MODE,
    storageKey: '',
    saveState: 'Idle',
    saveStateClass: '',
    lastSaved: '',
    lastError: '',
  };

  function setError(err) {
    diagnostics.lastError = String(err && err.message ? err.message : err);
    diagnostics.saveState = 'Error';
    diagnostics.saveStateClass = 'bad';
    renderDiagnostics(diagnostics);
  }

  function setSaveState(state, cls) {
    diagnostics.saveState = state;
    diagnostics.saveStateClass = cls || '';
    renderDiagnostics(diagnostics);
  }

  window.addEventListener('error', (e) => {
    setError(e?.error || e?.message || 'Runtime error');
  });

  window.addEventListener('unhandledrejection', (e) => {
    setError(e?.reason || 'Unhandled promise rejection');
  });

  if (!window.SiteTemplate) {
    diagnostics.storageKey = '(SiteTemplate missing)';
    setError(new Error('SiteTemplate not loaded'));
    setStatus('Admin scripts failed to load.', 'error');
    return;
  }

  diagnostics.storageKey =
    MODE === 'draft'
      ? SiteTemplate.STORAGE_KEY_DRAFT
      : SiteTemplate.STORAGE_KEY_LIVE;
  renderDiagnostics(diagnostics);

  let config;
  try {
    config = SiteTemplate.loadConfig({ mode: MODE });
  } catch (e) {
    setError(e);
    setStatus('Could not load config.', 'error');
    return;
  }
  let applyingRemote = false;
  let past = [];
  let future = [];
  const HISTORY_LIMIT = 50;

  const undoBtn = $('undo');
  const redoBtn = $('redo');

  function refreshHistoryButtons() {
    if (undoBtn) undoBtn.disabled = past.length === 0;
    if (redoBtn) redoBtn.disabled = future.length === 0;
  }

  const autosave = debounce((nextConfig) => {
    try {
      setSaveState('Saving…', 'warn');
      SiteTemplate.saveConfig(nextConfig, { mode: MODE });
      diagnostics.lastSaved = new Date().toLocaleTimeString();
      diagnostics.lastError = '';
      setSaveState('Saved', 'good');
      setStatus('Saved.');
    } catch (e) {
      setError(e);
      setStatus('Save failed.', 'error');
    }
  }, 350);

  function setConfig(next) {
    const nextConfig = next;
    if (!applyingRemote) {
      past.push(clone(config));
      if (past.length > HISTORY_LIMIT)
        past = past.slice(past.length - HISTORY_LIMIT);
      future = [];
    }

    setSaveState('Unsaved', 'warn');
    config = nextConfig;
    bindBasics(() => config, setConfig);
    renderPages(config, setConfig);
    renderPageEditor(config, setConfig);
    renderMenuPrimary(config, setConfig);
    renderMediaLibrary(config, setConfig);
    renderSeoEditor(config, setConfig);
    renderHomeBuilder(config, setConfig);
    renderProjects(config, setConfig);
    $('rawJson').value = JSON.stringify(config, null, 2);
    refreshHistoryButtons();
    autosave(config);
  }

  bindBasics(() => config, setConfig);
  renderPages(config, setConfig);
  renderPageEditor(config, setConfig);
  renderMenuPrimary(config, setConfig);
  renderMediaLibrary(config, setConfig);
  renderSeoEditor(config, setConfig);
  renderHomeBuilder(config, setConfig);
  renderProjects(config, setConfig);
  $('rawJson').value = JSON.stringify(config, null, 2);

  const addPageBtn = $('addPage');
  if (addPageBtn && !addPageBtn.dataset.bound) {
    addPageBtn.dataset.bound = '1';
    addPageBtn.addEventListener('click', () => {
      const next = clone(config);
      const pages = Array.isArray(next.pages) ? next.pages : [];
      const id = `page-${Date.now()}`;
      const slug = ensureUniqueSlug(pages, 'page', id);
      pages.push({
        id,
        slug,
        title: 'New Page',
        template: 'blocks',
        blocks: [
          { type: 'richText', html: '<h2>New Page</h2><p>Edit me.</p>' },
        ],
      });
      next.pages = pages;
      setSelectedPageId(id);
      setConfig(next);
      setStatus('Page added.');
    });
  }

  const deletePageBtn = $('deletePage');
  if (deletePageBtn && !deletePageBtn.dataset.bound) {
    deletePageBtn.dataset.bound = '1';
    deletePageBtn.addEventListener('click', () => {
      const page = getSelectedPage(config);
      if (!page) return;
      if (page.id === 'home') {
        setStatus('Home page cannot be deleted.', 'error');
        return;
      }
      const next = clone(config);
      next.pages = (Array.isArray(next.pages) ? next.pages : []).filter(
        (p) => p?.id !== page.id,
      );
      setSelectedPageId('home');
      setConfig(next);
      setStatus('Page deleted.');
    });
  }

  const addBlockBtn = $('addBlock');
  if (addBlockBtn && !addBlockBtn.dataset.bound) {
    addBlockBtn.dataset.bound = '1';
    addBlockBtn.addEventListener('click', () => {
      const page = getSelectedPage(config);
      if (!page) return;
      if (page.template === 'home') {
        setStatus('Home template does not use blocks.', 'error');
        return;
      }

      const next = clone(config);
      const pages = Array.isArray(next.pages) ? next.pages : [];
      const idx = pages.findIndex((p) => p?.id === page.id);
      if (idx === -1) return;

      const blocks = Array.isArray(pages[idx].blocks)
        ? pages[idx].blocks.slice()
        : [];
      blocks.push({
        type: 'richText',
        html: '<h2>Section</h2><p>New content…</p>',
      });
      pages[idx] = { ...pages[idx], blocks };
      next.pages = pages;
      setConfig(next);
      setStatus('Block added.');
    });
  }

  const addMenuItemBtn = $('addMenuItem');
  if (addMenuItemBtn && !addMenuItemBtn.dataset.bound) {
    addMenuItemBtn.dataset.bound = '1';
    addMenuItemBtn.addEventListener('click', () => {
      const next = clone(config);
      next.menu = next.menu || {};
      const items = Array.isArray(next.menu.primary)
        ? next.menu.primary.slice()
        : [];
      items.push({ type: 'page', slug: 'home', label: 'Home' });
      next.menu.primary = items;
      setConfig(next);
      setStatus('Menu item added.');
    });
  }

  const mediaUpload = $('mediaUpload');
  if (mediaUpload && !mediaUpload.dataset.bound) {
    mediaUpload.dataset.bound = '1';
    mediaUpload.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        setStatus('File is larger than 5MB, may affect performance.', 'warn');
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const next = clone(config);
        const list = Array.isArray(next.mediaLibrary)
          ? next.mediaLibrary.slice()
          : [];
        list.unshift({
          id: `asset-${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
          createdAt: new Date().toISOString(),
        });
        next.mediaLibrary = list;
        setConfig(next);
        setStatus('Uploaded to media library.');
      } catch {
        setStatus('Upload failed.', 'error');
      } finally {
        e.target.value = '';
      }
    });
  }

  const backupDraftBtn = $('backupDraft');
  if (backupDraftBtn && !backupDraftBtn.dataset.bound) {
    backupDraftBtn.dataset.bound = '1';
    backupDraftBtn.addEventListener('click', () => {
      try {
        SiteTemplate.createBackup({ mode: 'draft', label: 'Draft' });
        renderBackups();
        setStatus('Draft backup created.');
      } catch {
        setStatus('Backup failed.', 'error');
      }
    });
  }

  const backupLiveBtn = $('backupLive');
  if (backupLiveBtn && !backupLiveBtn.dataset.bound) {
    backupLiveBtn.dataset.bound = '1';
    backupLiveBtn.addEventListener('click', () => {
      try {
        SiteTemplate.createBackup({ mode: 'live', label: 'Live' });
        renderBackups();
        setStatus('Live backup created.');
      } catch {
        setStatus('Backup failed.', 'error');
      }
    });
  }

  const exportDraftBtn = $('exportDraft');
  if (exportDraftBtn && !exportDraftBtn.dataset.bound) {
    exportDraftBtn.dataset.bound = '1';
    exportDraftBtn.addEventListener('click', () => {
      const cfg = SiteTemplate.loadConfig({ mode: 'draft' });
      downloadJson('site-config.draft.json', cfg);
      setStatus('Draft exported.');
    });
  }

  const exportLiveBtn = $('exportLive');
  if (exportLiveBtn && !exportLiveBtn.dataset.bound) {
    exportLiveBtn.dataset.bound = '1';
    exportLiveBtn.addEventListener('click', () => {
      const cfg = SiteTemplate.loadConfig({ mode: 'live' });
      downloadJson('site-config.live.json', cfg);
      setStatus('Live exported.');
    });
  }

  const importDraftInput = $('importDraft');
  if (importDraftInput && !importDraftInput.dataset.bound) {
    importDraftInput.dataset.bound = '1';
    importDraftInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await readFileAsText(file);
        const parsed = safeJsonParse(text);
        if (!parsed) {
          setStatus('Invalid JSON file.', 'error');
          return;
        }
        SiteTemplate.saveConfig(parsed, { mode: 'draft' });
        setStatus('Imported into Draft.');
        renderBackups();
      } catch {
        setStatus('Import failed.', 'error');
      } finally {
        e.target.value = '';
      }
    });
  }

  const importLiveInput = $('importLive');
  if (importLiveInput && !importLiveInput.dataset.bound) {
    importLiveInput.dataset.bound = '1';
    importLiveInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await readFileAsText(file);
        const parsed = safeJsonParse(text);
        if (!parsed) {
          setStatus('Invalid JSON file.', 'error');
          return;
        }
        SiteTemplate.saveConfig(parsed, { mode: 'live' });
        setStatus('Imported into Live.');
        renderBackups();
      } catch {
        setStatus('Import failed.', 'error');
      } finally {
        e.target.value = '';
      }
    });
  }

  $('addProject').addEventListener('click', () => {
    const next = clone(config);
    next.projects.push({
      category: 'New',
      appType: '',
      title: 'Untitled',
      description: '',
      tags: [],
      base: 'electric',
      links: [],
      featuredImage: '',
      hidden: false,
    });
    setConfig(next);
  });

  $('applyJson').addEventListener('click', () => {
    const parsed = safeJsonParse($('rawJson').value);
    if (!parsed) {
      setStatus('Invalid JSON.', 'error');
      return;
    }
    setConfig(parsed);
  });

  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      if (!past.length) return;
      future.push(clone(config));
      const prev = past.pop();
      config = prev;
      applyingRemote = true;
      SiteTemplate.saveConfig(config, { mode: MODE });
      applyingRemote = false;
      bindBasics(() => config, setConfig);
      renderProjects(config, setConfig);
      $('rawJson').value = JSON.stringify(config, null, 2);
      refreshHistoryButtons();
      setStatus('Undo.');
    });
  }

  if (redoBtn) {
    redoBtn.addEventListener('click', () => {
      if (!future.length) return;
      past.push(clone(config));
      const next = future.pop();
      config = next;
      applyingRemote = true;
      SiteTemplate.saveConfig(config, { mode: MODE });
      applyingRemote = false;
      bindBasics(() => config, setConfig);
      renderProjects(config, setConfig);
      $('rawJson').value = JSON.stringify(config, null, 2);
      refreshHistoryButtons();
      setStatus('Redo.');
    });
  }

  $('reset').addEventListener('click', () => {
    SiteTemplate.resetConfig({ mode: MODE });
    config = SiteTemplate.loadConfig({ mode: MODE });
    bindBasics(() => config, setConfig);
    renderProjects(config, setConfig);
    $('rawJson').value = JSON.stringify(config, null, 2);
    setSaveState('Unsaved', 'warn');
    setStatus('Reset to defaults.');
  });

  const resetLiveBtn = $('resetLive');
  if (resetLiveBtn && !resetLiveBtn.dataset.bound) {
    resetLiveBtn.dataset.bound = '1';
    resetLiveBtn.addEventListener('click', () => {
      SiteTemplate.resetConfig({ mode: 'live' });
      setStatus('Live reset to defaults.');
    });
  }

  const saveNowBtn = $('saveNow');
  if (saveNowBtn) {
    saveNowBtn.addEventListener('click', () => {
      try {
        setSaveState('Saving…', 'warn');
        SiteTemplate.saveConfig(config, { mode: MODE });
        diagnostics.lastSaved = new Date().toLocaleTimeString();
        diagnostics.lastError = '';
        setSaveState('Saved', 'good');
        setStatus('Saved.');
      } catch (e) {
        setError(e);
        setStatus('Save failed.', 'error');
      }
    });
  }

  const publishBtn = $('publish');
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      try {
        SiteTemplate.publishDraft();
        setStatus('Published to live.');
      } catch {
        setStatus('Publish failed.', 'error');
      }
    });
  }

  $('export').addEventListener('click', () => {
    const raw = JSON.stringify(config, null, 2);
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-config.json';
    a.click();

    URL.revokeObjectURL(url);
    setStatus('Exported.');
  });

  $('import').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = safeJsonParse(text);
    if (!parsed) {
      setStatus('Invalid JSON file.', 'error');
      e.target.value = '';
      return;
    }

    setConfig(parsed);
    e.target.value = '';
    setStatus('Imported.');
  });

  SiteTemplate.subscribe(
    (next) => {
      applyingRemote = true;
      config = next;
      bindBasics(() => config, setConfig);
      renderPages(config, setConfig);
      renderPageEditor(config, setConfig);
      renderMenuPrimary(config, setConfig);
      renderMediaLibrary(config, setConfig);
      renderSeoEditor(config, setConfig);
      renderHomeBuilder(config, setConfig);
      renderProjects(config, setConfig);
      $('rawJson').value = JSON.stringify(config, null, 2);
      applyingRemote = false;
      refreshHistoryButtons();
      diagnostics.lastError = '';
      setSaveState('Synced', 'good');
      setStatus('Updated from another tab.');
    },
    { mode: MODE },
  );

  renderBackups();

  refreshHistoryButtons();
  setSaveState('Saved', 'good');
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('input', (e) => {
  if (e.target.matches('input, textarea, select')) {
    debouncedSave();
  }
});
