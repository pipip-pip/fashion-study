/* Fashion Study, phase 1: garment library and technique cards.
 * Local-first: everything (including photos) is stored in this browser's IndexedDB.
 */
(function () {
  'use strict';

  const CATEGORIES = ['Top', 'Skirt', 'Trousers', 'Dress', 'Outerwear'];
  const STATUSES = ['Saved', 'Studied', 'In progress', 'Made'];
  const PHOTO_LABELS = ['Front', 'Back', 'Detail', 'Inside', 'Other'];
  const LOCATIONS = ['Front', 'Back', 'Sleeve', 'Other'];
  const TECH = Object.fromEntries(TECHNIQUES.map((t) => [t.id, t]));

  const app = document.getElementById('app');
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');
  const options = (list, selected) => list.map((v) =>
    `<option${v === selected ? ' selected' : ''}>${esc(v)}</option>`).join('');
  const statusChip = (s) => `<span class="chip status ${slug(s)}">${esc(s)}</span>`;

  /* ---------- Storage ---------- */

  const dbReady = new Promise((resolve, reject) => {
    const req = indexedDB.open('fashion-study', 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      d.createObjectStore('garments', { keyPath: 'id' });
      d.createObjectStore('photos', { keyPath: 'id' });
      d.createObjectStore('cardUser', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  // Run fn against one or more stores in a single transaction.
  async function tx(names, mode, fn) {
    const d = await dbReady;
    return new Promise((resolve, reject) => {
      const t = d.transaction(names, mode);
      const stores = [].concat(names).map((n) => t.objectStore(n));
      const req = fn(...stores);
      t.oncomplete = () => resolve(req ? req.result : undefined);
      t.onerror = t.onabort = () => reject(t.error);
    });
  }
  const db = {
    all: (name) => tx(name, 'readonly', (s) => s.getAll()),
    get: (name, id) => tx(name, 'readonly', (s) => s.get(id)),
    put: (name, value) => tx(name, 'readwrite', (s) => s.put(value)),
  };

  /* ---------- Images ---------- */

  let objectUrls = [];
  function urlFor(blob) {
    const u = URL.createObjectURL(blob);
    objectUrls.push(u);
    return u;
  }

  // Draw an image file onto a canvas no bigger than `max` on its longest side.
  async function toCanvas(blob, max) {
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  // Phone photos are large; keep a 1600px JPEG so the library stays small.
  async function shrink(file) {
    const canvas = await toCanvas(file, 1600);
    return new Promise((resolve, reject) => canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not save image'))), 'image/jpeg', 0.85));
  }
  const thumbOf = async (blob) => (await toCanvas(blob, 480)).toDataURL('image/jpeg', 0.8);

  /* ---------- Router ---------- */

  let cleanups = [];
  const routes = [
    [/^\/library$/, viewLibrary, 'library'],
    [/^\/garment\/new$/, () => viewGarmentForm(null), 'library'],
    [/^\/garment\/([^/]+)\/edit$/, (id) => viewGarmentForm(id), 'library'],
    [/^\/garment\/([^/]+)$/, viewGarment, 'library'],
    [/^\/skills$/, viewSkills, 'skills'],
    [/^\/technique\/([^/]+)$/, viewTechnique, 'skills'],
  ];

  async function render() {
    cleanups.forEach((fn) => fn());
    cleanups = [];
    objectUrls.forEach((u) => URL.revokeObjectURL(u));
    objectUrls = [];

    const path = decodeURIComponent(location.hash.slice(1)) || '/library';
    for (const [pattern, view, tab] of routes) {
      const m = path.match(pattern);
      if (!m) continue;
      $$('.top nav a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
      try {
        await view(...m.slice(1));
      } catch (err) {
        console.error(err);
        app.innerHTML = `<p>Something went wrong: ${esc(err.message || err)}</p>`;
      }
      window.scrollTo(0, 0);
      return;
    }
    location.hash = '#/library';
  }
  window.addEventListener('hashchange', render);

  function notFound(what) {
    app.innerHTML = `<p>${esc(what)} not found. <a href="#/library">Back to the library</a></p>`;
  }

  /* ---------- Library ---------- */

  const filters = { category: '', status: '', technique: '' };

  async function viewLibrary() {
    const garments = (await db.all('garments')).sort((a, b) => b.updated - a.updated);
    const usedTechniques = TECHNIQUES.filter((t) =>
      garments.some((g) => g.features.some((f) => f.techniqueId === t.id)));
    if (!usedTechniques.some((t) => t.id === filters.technique)) filters.technique = '';

    app.innerHTML = `
      <div class="row spread">
        <h1>Library</h1>
        <a class="btn primary" href="#/garment/new">Add garment</a>
      </div>
      ${garments.length ? `
      <div class="filters">
        <select id="f-category" aria-label="Filter by category">
          <option value="">All categories</option>${options(CATEGORIES, filters.category)}
        </select>
        <select id="f-status" aria-label="Filter by status">
          <option value="">Any status</option>${options(STATUSES, filters.status)}
        </select>
        <select id="f-technique" aria-label="Filter by technique" ${usedTechniques.length ? '' : 'disabled'}>
          <option value="">${usedTechniques.length ? 'Any technique' : 'No techniques tagged yet'}</option>
          ${usedTechniques.map((t) => `<option value="${t.id}"${t.id === filters.technique ? ' selected' : ''}>${esc(t.name)}</option>`).join('')}
        </select>
      </div>` : ''}
      <div id="grid"></div>
      <h2>Backup</h2>
      <p class="muted small">Everything is stored only in this browser on this device. Export a backup file now and then, and use it to move your library to another device.</p>
      <div class="row">
        <button id="export">Export backup</button>
        <button id="import">Import backup</button>
        <input id="import-file" type="file" accept="application/json,.json" hidden>
      </div>`;

    const paint = () => {
      const shown = garments.filter((g) =>
        (!filters.category || g.category === filters.category) &&
        (!filters.status || g.status === filters.status) &&
        (!filters.technique || g.features.some((f) => f.techniqueId === filters.technique)));
      const grid = $('#grid');
      if (!garments.length) {
        grid.innerHTML = `<div class="empty"><p>No garments yet.</p>
          <p>Add your first one. A photo from your camera roll or a screenshot is enough to start.</p></div>`;
      } else if (!shown.length) {
        grid.innerHTML = '<div class="empty">No garments match these filters.</div>';
      } else {
        grid.innerHTML = `<div class="grid">${shown.map((g) => `
          <a class="tile" href="#/garment/${g.id}">
            <div class="pic">${g.thumb ? `<img src="${g.thumb}" alt="">` : 'No photo'}</div>
            <div class="info">
              <span class="name">${esc(g.name)}</span>
              ${statusChip(g.status)} <span class="chip">${esc(g.category)}</span>
            </div>
          </a>`).join('')}</div>`;
      }
    };
    paint();

    for (const key of ['category', 'status', 'technique']) {
      const el = $('#f-' + key);
      if (el) el.onchange = () => { filters[key] = el.value; paint(); };
    }
    $('#export').onclick = exportBackup;
    $('#import').onclick = () => $('#import-file').click();
    $('#import-file').onchange = (e) => importBackup(e.target.files[0]);
  }

  /* ---------- Garment detail ---------- */

  async function viewGarment(id) {
    const g = await db.get('garments', id);
    if (!g) return notFound('Garment');
    const photos = (await Promise.all(g.photos.map(async (p) => {
      const rec = await db.get('photos', p.id);
      return rec && { ...p, url: urlFor(rec.blob) };
    }))).filter(Boolean);

    const isLink = /^https?:\/\//i.test(g.source);
    app.innerHTML = `
      <p class="small"><a href="#/library">← Library</a></p>
      <div class="row spread">
        <h1>${esc(g.name)}</h1>
        <div class="row">
          <a class="btn" href="#/garment/${g.id}/edit">Edit</a>
          <button class="danger" id="delete">Delete</button>
        </div>
      </div>
      <div class="row">
        <span class="chip">${esc(g.category)}</span>
        <select id="status" aria-label="Status" style="width:auto">${options(STATUSES, g.status)}</select>
      </div>
      ${g.tags.length ? `<div class="chips" style="margin-top:10px">${g.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>` : ''}
      ${g.source ? `<p class="small muted" style="margin-top:10px">Source: ${isLink
        ? `<a href="${esc(g.source)}" target="_blank" rel="noopener noreferrer">${esc(g.source)}</a>` : esc(g.source)}</p>` : ''}

      ${photos.length ? `<div class="gallery" style="margin-top:16px">${photos.map((p) => `
        <figure><img src="${p.url}" alt="${esc(p.label)} view of ${esc(g.name)}"><figcaption>${esc(p.label)}</figcaption></figure>`).join('')}</div>`
        : '<p class="muted" style="margin-top:16px">No photos yet. Add some with Edit.</p>'}

      <h2>Construction features</h2>
      <p class="muted small">Tagged by hand for now, using the technique vocabulary. Each one links to its technique card.</p>
      <ul class="list" id="features"></ul>
      <form class="addrow" id="add-feature">
        <select id="feat-technique" aria-label="Technique" required>
          <option value="">Add a feature…</option>
          ${Object.entries(TIERS).map(([n, label]) => `
            <optgroup label="Tier ${n}: ${esc(label)}">
              ${TECHNIQUES.filter((t) => t.track === 'construction' && t.tier === +n)
                .map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}
            </optgroup>`).join('')}
        </select>
        <select id="feat-location" aria-label="Location">${options(LOCATIONS)}</select>
        <button class="primary">Add</button>
      </form>

      ${g.notes ? `<h2>Notes</h2><p class="notes">${esc(g.notes)}</p>` : ''}`;

    const save = () => { g.updated = Date.now(); return db.put('garments', g); };

    const paintFeatures = () => {
      $('#features').innerHTML = g.features.length ? g.features.map((f) => `
        <li>
          <span class="grow"><a href="#/technique/${f.techniqueId}">${esc(TECH[f.techniqueId]?.name || f.techniqueId)}</a></span>
          <span class="chip">${esc(f.location)}</span>
          <button class="link small" data-remove="${f.id}">Remove</button>
        </li>`).join('') : '<li class="muted">No features tagged yet.</li>';
    };
    paintFeatures();

    $('#features').onclick = async (e) => {
      const fid = e.target.dataset.remove;
      if (!fid) return;
      g.features = g.features.filter((f) => f.id !== fid);
      await save();
      paintFeatures();
    };
    $('#add-feature').onsubmit = async (e) => {
      e.preventDefault();
      const techniqueId = $('#feat-technique').value;
      if (!techniqueId) return;
      // confidence/confirmed match the spec's data model, ready for the AI breakdown in phase 2
      g.features.push({ id: uid(), techniqueId, location: $('#feat-location').value, confidence: null, confirmed: true });
      await save();
      $('#feat-technique').value = '';
      paintFeatures();
    };
    $('#status').onchange = (e) => { g.status = e.target.value; save(); };
    $('#delete').onclick = async () => {
      if (!confirm(`Delete "${g.name}" and its photos? This can't be undone.`)) return;
      await tx(['garments', 'photos'], 'readwrite', (gs, ps) => {
        g.photos.forEach((p) => ps.delete(p.id));
        gs.delete(g.id);
      });
      location.hash = '#/library';
    };
    $$('.gallery img').forEach((img) => { img.onclick = () => openLightbox(img.src, img.alt); });
  }

  const lightbox = $('#lightbox');
  function openLightbox(src, alt) {
    const img = $('img', lightbox);
    img.src = src;
    img.alt = alt;
    lightbox.showModal();
  }
  lightbox.onclick = () => lightbox.close();

  /* ---------- Garment form (add / edit) ---------- */

  async function viewGarmentForm(id) {
    const existing = id ? await db.get('garments', id) : null;
    if (id && !existing) return notFound('Garment');
    const g = existing || { name: '', category: CATEGORIES[0], source: '', status: 'Saved', notes: '', tags: [], photos: [], features: [] };

    // Working copy of the photos; nothing touches storage until Save.
    const draft = [];
    for (const p of g.photos) {
      const rec = await db.get('photos', p.id);
      if (rec) draft.push({ id: p.id, label: p.label, blob: rec.blob, url: urlFor(rec.blob), isNew: false });
    }
    const originalFirst = draft[0]?.id;

    app.innerHTML = `
      <p class="small"><a href="${existing ? `#/garment/${g.id}` : '#/library'}">← Cancel</a></p>
      <h1>${existing ? 'Edit garment' : 'Add garment'}</h1>
      <form id="garment-form">
        <label for="photo-input">Photos (front, back, details, inside seams)</label>
        <input id="photo-input" type="file" accept="image/*" multiple>
        <p class="muted small" style="margin-top:4px">On a computer you can also paste a screenshot here.</p>
        <div class="photos" id="photos"></div>

        <label for="name">Name</label>
        <input id="name" type="text" required value="${esc(g.name)}" placeholder="e.g. Wool wrap coat">
        <div class="two">
          <div><label for="category">Category</label><select id="category">${options(CATEGORIES, g.category)}</select></div>
          <div><label for="g-status">Status</label><select id="g-status">${options(STATUSES, g.status)}</select></div>
        </div>
        <label for="source">Source (link, shop, designer, "my wardrobe")</label>
        <input id="source" type="text" value="${esc(g.source)}">
        <label for="tags">Tags, separated by commas</label>
        <input id="tags" type="text" value="${esc(g.tags.join(', '))}" placeholder="e.g. tailoring, AW26, wool">
        <label for="notes">Notes</label>
        <textarea id="notes">${esc(g.notes)}</textarea>
        <div class="row" style="margin-top:18px">
          <button class="primary" id="save">Save</button>
          <a class="btn" href="${existing ? `#/garment/${g.id}` : '#/library'}">Cancel</a>
        </div>
      </form>`;

    const paintPhotos = () => {
      $('#photos').innerHTML = draft.map((p, i) => `
        <div class="photo">
          <img src="${p.url}" alt="Photo ${i + 1}">
          <select data-label="${i}" aria-label="Photo ${i + 1} view">${options(PHOTO_LABELS, p.label)}</select>
          <button type="button" class="link small" data-remove="${i}">Remove</button>
        </div>`).join('');
    };
    paintPhotos();

    const addFiles = async (files) => {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        try {
          const blob = await shrink(file);
          // First photo defaults to Front, second to Back, the rest to Detail
          const label = PHOTO_LABELS[Math.min(draft.length, 2)];
          draft.push({ id: uid(), label, blob, url: urlFor(blob), isNew: true });
        } catch (err) {
          alert(`Couldn't read "${file.name || 'that image'}". Try a JPEG or PNG.`);
        }
      }
      paintPhotos();
    };
    $('#photo-input').onchange = async (e) => { await addFiles([...e.target.files]); e.target.value = ''; };
    const onPaste = (e) => {
      const files = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith('image/'));
      if (files.length) { e.preventDefault(); addFiles(files); }
    };
    document.addEventListener('paste', onPaste);
    cleanups.push(() => document.removeEventListener('paste', onPaste));

    $('#photos').onchange = (e) => {
      const i = e.target.dataset.label;
      if (i !== undefined) draft[i].label = e.target.value;
    };
    $('#photos').onclick = (e) => {
      const i = e.target.dataset.remove;
      if (i === undefined) return;
      draft.splice(+i, 1);
      paintPhotos();
    };

    $('#garment-form').onsubmit = async (e) => {
      e.preventDefault();
      $('#save').disabled = true;
      const now = Date.now();
      const record = {
        ...g,
        id: g.id || uid(),
        name: $('#name').value.trim(),
        category: $('#category').value,
        status: $('#g-status').value,
        source: $('#source').value.trim(),
        tags: [...new Set($('#tags').value.split(',').map((t) => t.trim()).filter(Boolean))],
        notes: $('#notes').value.trim(),
        photos: draft.map(({ id: pid, label }) => ({ id: pid, label })),
        created: g.created || now,
        updated: now,
      };
      if (!draft.length) record.thumb = null;
      else if (draft[0].id !== originalFirst || !g.thumb) record.thumb = await thumbOf(draft[0].blob);

      const kept = new Set(draft.map((p) => p.id));
      await tx(['garments', 'photos'], 'readwrite', (gs, ps) => {
        g.photos.filter((p) => !kept.has(p.id)).forEach((p) => ps.delete(p.id));
        draft.filter((p) => p.isNew).forEach((p) => ps.put({ id: p.id, garmentId: record.id, blob: p.blob }));
        gs.put(record);
      });
      // Ask the browser not to clear this site's storage when space runs low
      navigator.storage?.persist?.().catch(() => {});
      location.hash = `#/garment/${record.id}`;
    };
  }

  /* ---------- Skills list ---------- */

  async function viewSkills() {
    const garments = await db.all('garments');
    const uses = {};
    garments.forEach((g) => new Set(g.features.map((f) => f.techniqueId)).forEach((tid) => { uses[tid] = (uses[tid] || 0) + 1; }));

    const row = (t) => `
      <li>
        <span class="grow"><a class="${CARDS[t.id] ? 'has-card' : 'muted'}" href="#/technique/${t.id}">${esc(t.name)}</a></span>
        ${uses[t.id] ? `<span class="chip">${uses[t.id]} garment${uses[t.id] > 1 ? 's' : ''}</span>` : ''}
        ${CARDS[t.id] ? '' : '<span class="chip">card not written yet</span>'}
      </li>`;
    const section = (track, tier) => {
      const list = TECHNIQUES.filter((t) => t.track === track && t.tier === tier);
      return list.length ? `<ul class="list tier-list">${list.map(row).join('')}</ul>` : '';
    };

    app.innerHTML = `
      <h1>Skills</h1>
      <p class="muted">Technique cards for tiers 1 and 2 are written. The rest of the vocabulary is listed so garments can be tagged with it; the skill tree and progress tracking come in a later phase.</p>
      ${Object.entries(TIERS).map(([n, label]) => `<h2>Tier ${n}: ${esc(label)}</h2>${section('construction', +n)}`).join('')}
      <h2>Pattern-making track</h2>
      <ul class="list tier-list">${TECHNIQUES.filter((t) => t.track === 'pattern').map(row).join('')}</ul>`;
  }

  /* ---------- Technique card ---------- */

  async function viewTechnique(id) {
    const t = TECH[id];
    if (!t) return notFound('Technique');
    const card = CARDS[id];
    const user = (await db.get('cardUser', id)) || { id, chapter: '', videoUrl: '', notes: '' };
    const garments = (await db.all('garments')).filter((g) => g.features.some((f) => f.techniqueId === id));
    const book = card && BOOKS[card.sources.book];
    const list = (items, tag) => `<${tag}>${items.map((s) => `<li>${esc(s)}</li>`).join('')}</${tag}>`;
    const ext = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;

    app.innerHTML = `
      <p class="small"><a href="#/skills">← Skills</a></p>
      <h1>${esc(t.name)}</h1>
      <div class="chips">
        <span class="chip">${t.track === 'pattern' ? 'Pattern track · tier ' + t.tier : `Tier ${t.tier}: ${esc(TIERS[t.tier])}`}</span>
        ${t.seenIn ? `<span class="chip">Seen in: ${esc(t.seenIn)}</span>` : ''}
        ${t.unlocks ? `<span class="chip">Unlocks route: ${esc(t.unlocks)}</span>` : ''}
      </div>
      <p class="small" style="margin-top:10px">Prerequisites: ${t.prerequisites.length
        ? t.prerequisites.map((p) => `<a href="#/technique/${p}">${esc(TECH[p].name)}</a>`).join(', ') : 'none'}</p>

      ${card ? `
      <h2>Learn from</h2>
      <div class="box">
        <h3>Textbook</h3>
        <p>${ext(book.url, book.title)}, ${esc(book.author)}</p>
        <label for="chapter">Chapter and pages in my copy</label>
        <input id="chapter" type="text" value="${esc(user.chapter)}" placeholder="Look it up in the contents and note it here">
        <h3>Video</h3>
        <ul>${card.sources.videos.map((v) => `<li>${ext(v.url, v.label)}</li>`).join('')}</ul>
        <label for="video-url">The video I watched and would use again (paste link)</label>
        <input id="video-url" type="url" value="${esc(user.videoUrl)}" placeholder="https://…">
        ${/^https?:\/\//i.test(user.videoUrl) ? `<p class="small" style="margin-top:6px">${ext(user.videoUrl, 'Open my saved video')}</p>` : ''}
        <h3>Article</h3>
        <p>${ext(card.sources.article.url, card.sources.article.label)}</p>
      </div>

      <h2>The technique <span class="ai-label">AI summary</span></h2>
      <p class="muted small">Written by AI as a study aid. Check it against ${esc(book.title)} before relying on it.</p>
      <div class="card-body">
        <h3>What it is</h3><p>${esc(card.what)}</p>
        <h3>Why it's used</h3><p>${esc(card.why)}</p>
        <h3>How it's sewn</h3>${list(card.steps, 'ol')}
        <h3>Common mistakes</h3>${list(card.mistakes, 'ul')}
        <h3>Fabrics</h3><p>${esc(card.fabrics)}</p>
      </div>` : `
      <div class="box"><p>This card hasn't been written yet. You can still tag garments with this technique and keep class notes below.</p></div>`}

      <h2>My class notes</h2>
      <textarea id="user-notes" placeholder="What my instructor said, what the textbook adds, what I'd do differently…">${esc(user.notes)}</textarea>
      <div class="row" style="margin-top:10px">
        <button class="primary" id="save-card">Save</button>
        <span class="saved-note" id="saved-note" role="status"></span>
      </div>

      <h2>Garments that use it</h2>
      ${garments.length ? `<div class="grid">${garments.map((g) => `
        <a class="tile" href="#/garment/${g.id}">
          <div class="pic">${g.thumb ? `<img src="${g.thumb}" alt="">` : 'No photo'}</div>
          <div class="info"><span class="name">${esc(g.name)}</span>${statusChip(g.status)}</div>
        </a>`).join('')}</div>` : '<p class="muted">None yet. Tag this technique on a garment in the library.</p>'}`;

    $('#save-card').onclick = async () => {
      user.notes = $('#user-notes').value;
      if (card) {
        user.chapter = $('#chapter').value.trim();
        user.videoUrl = $('#video-url').value.trim();
      }
      await db.put('cardUser', user);
      $('#saved-note').textContent = 'Saved';
      setTimeout(() => { const n = $('#saved-note'); if (n) n.textContent = ''; }, 2000);
    };
  }

  /* ---------- Backup ---------- */

  const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
  function dataUrlToBlob(dataUrl) {
    const [head, body] = dataUrl.split(',');
    const bytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
    return new Blob([bytes], { type: head.match(/data:(.*?)(;|$)/)[1] || 'image/jpeg' });
  }

  async function exportBackup() {
    const photos = await Promise.all((await db.all('photos')).map(async (p) => (
      { id: p.id, garmentId: p.garmentId, data: await blobToDataUrl(p.blob) })));
    const backup = { app: 'fashion-study', version: 1, exported: new Date().toISOString(),
      garments: await db.all('garments'), photos, cardUser: await db.all('cardUser') };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(backup)], { type: 'application/json' }));
    a.download = `fashion-study-backup-${backup.exported.slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }

  async function importBackup(file) {
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      if (backup.app !== 'fashion-study' || !Array.isArray(backup.garments)) throw new Error('Not a Fashion Study backup file');
      if (!confirm(`Import ${backup.garments.length} garment(s)? Items already here with the same id will be replaced; nothing else is removed.`)) return;
      const photos = (backup.photos || []).map((p) => ({ id: p.id, garmentId: p.garmentId, blob: dataUrlToBlob(p.data) }));
      await tx(['garments', 'photos', 'cardUser'], 'readwrite', (gs, ps, cs) => {
        backup.garments.forEach((g) => gs.put(g));
        photos.forEach((p) => ps.put(p));
        (backup.cardUser || []).forEach((c) => cs.put(c));
      });
      render();
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
  }

  render();
})();
