'use strict';
/* PieFit body log: weight / waist measurements (localStorage) and progress photos (IndexedDB, stay on the device). */
const Body = (() => {
  let ENTRIES = [];
  const load = () => { ENTRIES = Array.isArray(store.get('body')) ? store.get('body').filter(e => isObj(e) && typeof e.t === 'number') : []; };
  const save = () => store.set('body', ENTRIES);

  /* ---------- photos in IndexedDB ---------- */
  let dbp = null;
  function db(){
    if(!dbp) dbp = new Promise((res, rej) => {
      const r = indexedDB.open('piefit', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('photos', {keyPath:'id'});
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function tx(mode, fn){
    const d = await db();
    return new Promise((res, rej) => { const s = d.transaction('photos', mode).objectStore('photos'); const r = fn(s); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  }
  const allPhotos = () => tx('readonly', s => s.getAll()).then(a => a.sort((x, y) => y.t - x.t)).catch(() => []);
  // shrink to ~1080 px JPEG so a photo is a few hundred KB, not several MB
  function shrink(file){
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 1080 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob(b => b ? res(b) : rej(new Error('encode')), 'image/jpeg', .82);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('image')); };
      img.src = url;
    });
  }
  const addPhoto = async file => { const blob = await shrink(file); await tx('readwrite', s => s.put({id:newId(), t:Date.now(), blob})); };
  const delPhoto = id => tx('readwrite', s => s.delete(id));

  /* ---------- chart ---------- */
  function chart(key, unit){
    const pts = ENTRIES.filter(e => typeof e[key] === 'number').sort((a, b) => a.t - b.t).slice(-30);
    if(pts.length < 2) return `<small>${pts.length ? pts[0][key] + ' ' + unit : t('bd_nodata')}</small>`;
    const W = 320, Hh = 110, pad = 18, vs = pts.map(p => p[key]), lo = Math.min(...vs), hi = Math.max(...vs), span = hi - lo || 1;
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t, ts = t1 - t0 || 1;
    const xy = p => [pad + (p.t - t0) / ts * (W - 2*pad), Hh - pad - (p[key] - lo) / span * (Hh - 2*pad)];
    const d = pts.map((p, i) => (i ? 'L' : 'M') + xy(p).map(v => v.toFixed(1)).join(' ')).join(' ');
    const diff = vs[vs.length - 1] - vs[0];
    return `<svg viewBox="0 0 ${W} ${Hh}" class="chart" role="img" aria-label="${key} trend">
        <line x1="${pad}" y1="${Hh - pad}" x2="${W - pad}" y2="${Hh - pad}" class="axis"/>
        <path d="${d}" class="line"/>${pts.map(p => { const [x, y] = xy(p); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" class="pt"/>`; }).join('')}
        <text x="${pad}" y="12" class="lab">${hi} ${unit}</text><text x="${pad}" y="${Hh - 4}" class="lab">${lo} ${unit}</text></svg>
      <small>${t('bd_change', (diff > 0 ? '+' : '') + diff.toFixed(1) + ' ' + unit, Math.max(1, Math.round((t1 - t0) / DAY)))}</small>`;
  }
  function summary(){
    const last = k => { const e = [...ENTRIES].reverse().find(x => typeof x[k] === 'number'); return e ? `${e[k]} (${new Date(e.t).toISOString().slice(0, 10)})` : 'n/a'; };
    return `weight ${last('weight')} kg, waist ${last('waist')} cm`;
  }

  /* ---------- view (Progress → Body) ---------- */
  async function view(box){
    box.innerHTML = `<div class="card"><b>${t('bd_add')}</b>
        <div class="row gap" style="margin-top:8px"><input class="inp" type="number" inputmode="decimal" step="0.1" id="bw" placeholder="${t('bd_weight')} (kg)">
        <input class="inp" type="number" inputmode="decimal" step="0.5" id="bwa" placeholder="${t('bd_waist')} (cm)"></div>
        <button class="btn" id="bsave">${t('bd_save')}</button></div>
      <div class="card"><b>${t('bd_weight')}</b>${chart('weight', 'kg')}</div>
      <div class="card"><b>${t('bd_waist')}</b>${chart('waist', 'cm')}</div>
      ${ENTRIES.length ? `<div class="card"><b>${t('bd_history')}</b>${[...ENTRIES].sort((a, b) => b.t - a.t).slice(0, 10).map(e => `<div class="setrow"><small class="grow">${new Date(e.t).toLocaleDateString()}</small>
        <small>${e.weight != null ? e.weight + ' kg' : ''}${e.weight != null && e.waist != null ? ' · ' : ''}${e.waist != null ? e.waist + ' cm' : ''}</small>
        <button class="chip mini" data-bdel="${e.t}">✕</button></div>`).join('')}</div>` : ''}
      <h2>📸 ${t('bd_photos')}</h2>
      <div class="card"><small>${t('bd_photo_note')}</small>
        <label class="btn ghost" style="margin-top:10px;text-align:center">+ ${t('bd_photo_add')}<input type="file" id="bph" accept="image/*" capture="environment" hidden></label>
        <div class="row gap" style="margin-top:8px"><button class="btn ghost small" id="bcmp">⇆ ${t('bd_compare')}</button></div></div>
      <div class="photos" id="bgrid"><small>…</small></div>`;
    box.querySelector('#bsave').onclick = () => {
      const w = parseFloat(box.querySelector('#bw').value), wa = parseFloat(box.querySelector('#bwa').value);
      if(!(w > 0) && !(wa > 0)) return toast(t('bd_empty'));
      const e = {t:Date.now()}; if(w > 0) e.weight = Math.round(w * 10) / 10; if(wa > 0) e.waist = Math.round(wa * 10) / 10;
      ENTRIES.push(e); save(); toast(t('bd_saved')); render();
    };
    box.querySelectorAll('[data-bdel]').forEach(b => b.onclick = () => { if(confirm(t('del_confirm'))){ ENTRIES = ENTRIES.filter(e => e.t !== +b.dataset.bdel); save(); render(); } });
    box.querySelector('#bph').onchange = async e => {
      const f = e.target.files[0]; if(!f) return;
      try { await addPhoto(f); toast(t('bd_photo_saved')); } catch(err){ toast(t('bd_photo_fail')); }
      render();
    };
    const photos = await allPhotos(), grid = box.querySelector('#bgrid'); if(!grid) return;
    const urls = photos.map(p => URL.createObjectURL(p.blob));
    grid.innerHTML = photos.length ? photos.map((p, i) => `<figure data-ph="${i}"><img src="${urls[i]}" alt="${t('bd_photos')} ${new Date(p.t).toLocaleDateString()}"><figcaption>${new Date(p.t).toLocaleDateString()}</figcaption></figure>`).join('') : `<small>${t('bd_nophoto')}</small>`;
    const open = (a, b) => {
      const o = document.createElement('div'); o.className = 'modal';
      const one = i => `<figure><img src="${urls[i]}" alt=""><figcaption>${new Date(photos[i].t).toLocaleDateString()}</figcaption></figure>`;
      o.innerHTML = `<div class="sheet"><div class="${b != null ? 'cmp' : ''}">${one(a)}${b != null ? one(b) : ''}</div>
        ${b == null ? `<button class="btn ghost" data-del style="margin-top:10px">🗑 ${t('remove')}</button>` : ''}<button class="btn" data-x style="margin-top:8px">${t('done')}</button></div>`;
      document.body.appendChild(o);
      o.querySelector('[data-x]').onclick = () => o.remove();
      const d = o.querySelector('[data-del]'); if(d) d.onclick = async () => { if(confirm(t('del_confirm'))){ await delPhoto(photos[a].id); o.remove(); render(); } };
    };
    let picking = null;
    grid.querySelectorAll('[data-ph]').forEach(f => f.onclick = () => {
      const i = +f.dataset.ph;
      if(picking === null) return open(i);
      if(picking === -1){ picking = i; f.classList.add('sel'); toast(t('bd_pick2')); return; }
      const a = picking; picking = null; grid.querySelectorAll('.sel').forEach(x => x.classList.remove('sel'));
      open(photos[a].t < photos[i].t ? a : i, photos[a].t < photos[i].t ? i : a);
    });
    box.querySelector('#bcmp').onclick = () => { if(photos.length < 2) return toast(t('bd_need2')); picking = -1; toast(t('bd_pick1')); };
  }
  return {load, save, view, summary, get entries(){ return ENTRIES; }, set entries(v){ ENTRIES = v; save(); }};
})();
