'use strict';
/* PieFit body log: weight / waist measurements (localStorage) and progress photos (IndexedDB, stay on the device). */
const Body = (() => {
  let ENTRIES = [];
  let GOAL = null; // target weight in kg (store key 'body_goal')
  const load = () => {
    ENTRIES = Array.isArray(store.get('body')) ? store.get('body').filter(e => isObj(e) && typeof e.t === 'number') : [];
    const g = store.get('body_goal', null); GOAL = typeof g === 'number' && g > 0 ? g : null;
  };
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

  /* ---------- weight helpers, goal, 7-day average ---------- */
  const round1 = n => Math.round(n * 10) / 10;
  const isTh = () => typeof SET !== 'undefined' && SET.lang === 'th';
  const weights = () => ENTRIES.filter(e => typeof e.weight === 'number' && e.weight > 0).sort((a, b) => a.t - b.t);
  const latestWeight = () => { const w = weights(); return w.length ? w[w.length - 1] : null; };
  // mean of the weigh-ins in the 7 days up to `end`
  function avgAt(end){
    const win = weights().filter(e => e.t <= end && e.t > end - 7 * DAY);
    return win.length ? round1(win.reduce((s, e) => s + e.weight, 0) / win.length) : null;
  }
  function addEntry(x){
    const o = {t:Date.now()};
    if(x.weight > 0) o.weight = round1(x.weight);
    if(x.waist > 0) o.waist = round1(x.waist);
    if(o.weight == null && o.waist == null) return false;
    ENTRIES.push(o); save();
    if(typeof Habits !== 'undefined' && Habits.onWeight) Habits.onWeight(); // targets follow the latest weight
    return true;
  }
  function removeEntry(t0){
    ENTRIES = ENTRIES.filter(e => e.t !== t0); save();
    if(typeof Habits !== 'undefined' && Habits.onWeight) Habits.onWeight();
  }
  function setGoal(v){ GOAL = v > 0 ? round1(v) : null; store.set('body_goal', GOAL); }

  /* ---------- chart ---------- */
  function chart(key, unit){
    const all = ENTRIES.filter(e => typeof e[key] === 'number').sort((a, b) => a.t - b.t);
    const pts = all.slice(-30);
    if(pts.length < 2) return `<small>${pts.length ? pts[0][key] + ' ' + unit : t('bd_nodata')}</small>`;
    const isW = key === 'weight', goal = isW ? GOAL : null;
    const avg = isW ? pts.map(p => ({t:p.t, v:avgAt(p.t)})).filter(a => a.v != null) : [];
    const W = 320, Hh = 110, pad = 18, vs = pts.map(p => p[key]).concat(avg.map(a => a.v), goal ? [goal] : []);
    const lo = Math.min(...vs), hi = Math.max(...vs), span = hi - lo || 1;
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t, ts = t1 - t0 || 1;
    const xy = (tt, v) => [pad + (tt - t0) / ts * (W - 2*pad), Hh - pad - (v - lo) / span * (Hh - 2*pad)];
    const path = list => list.map((p, i) => (i ? 'L' : 'M') + xy(p.t, p.v).map(v => v.toFixed(1)).join(' ')).join(' ');
    const d = path(pts.map(p => ({t:p.t, v:p[key]})));
    const diff = pts[pts.length - 1][key] - pts[0][key];
    const dl = tt => new Date(tt).toLocaleDateString(isTh() ? 'th-TH' : undefined, {day:'numeric', month:'short'});
    const gy = goal ? xy(t0, goal)[1].toFixed(1) : null;
    return `<svg viewBox="0 0 ${W} ${Hh + 14}" class="chart" role="img" aria-label="${key} trend">
        <line x1="${pad}" y1="${Hh - pad}" x2="${W - pad}" y2="${Hh - pad}" class="axis"/>
        ${goal ? `<line x1="${pad}" y1="${gy}" x2="${W - pad}" y2="${gy}" stroke="var(--warn)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${W - pad}" y="${+gy - 4}" text-anchor="end" class="lab" style="fill:var(--warn)">🎯 ${goal}</text>` : ''}
        <path d="${d}" class="line"/>
        ${avg.length > 1 ? `<path d="${path(avg)}" fill="none" stroke="var(--ok)" stroke-width="2" stroke-dasharray="2 3"/>` : ''}
        ${pts.map(p => { const [x, y] = xy(p.t, p[key]); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" class="pt"/>`; }).join('')}
        <text x="${pad}" y="12" class="lab">${hi} ${unit}</text><text x="${pad}" y="${Hh - 4}" class="lab">${lo} ${unit}</text>
        <text x="${pad}" y="${Hh + 11}" class="lab">${dl(t0)}</text><text x="${W - pad}" y="${Hh + 11}" text-anchor="end" class="lab">${dl(t1)}</text></svg>
      ${avg.length > 1 ? `<small style="color:var(--ok)">┈ ${isTh() ? 'ค่าเฉลี่ย 7 วัน' : '7-day average'}</small> ` : ''}<small>${t('bd_change', (diff > 0 ? '+' : '') + diff.toFixed(1) + ' ' + unit, Math.max(1, Math.round((t1 - t0) / DAY)))}</small>`;
  }
  function summary(){
    const last = k => { const e = [...ENTRIES].reverse().find(x => typeof x[k] === 'number'); return e ? `${e[k]} (${new Date(e.t).toISOString().slice(0, 10)})` : 'n/a'; };
    return `weight ${last('weight')} kg, waist ${last('waist')} cm`;
  }

  /* ---------- view (Progress → Body) ---------- */
  async function view(box){
    const th = isTh(), lw = latestWeight(), a7 = avgAt(Date.now());
    const left = (lw && GOAL) ? round1(lw.weight - GOAL) : null;
    box.innerHTML = `<div class="card">
        <div class="grid3">
          <div class="stat card" style="padding:8px 4px;margin:0"><small>${th ? 'ล่าสุด' : 'Latest'}</small><b style="font-size:18px">${lw ? lw.weight : '–'}</b><small>kg</small></div>
          <div class="stat card" style="padding:8px 4px;margin:0"><small>${th ? 'เฉลี่ย 7 วัน' : '7-day avg'}</small><b style="font-size:18px;color:var(--ok)">${a7 != null ? a7 : '–'}</b><small>kg</small></div>
          <div class="stat card" style="padding:8px 4px;margin:0"><small>🎯 ${th ? 'เป้าหมาย' : 'Goal'}</small><b style="font-size:18px;color:var(--warn)">${GOAL || '–'}</b><small>${left != null ? (left > 0 ? (th ? 'อีก ' : '') + left + ' kg' : (left < 0 ? (th ? 'ผ่านเป้า ' : 'under ') + Math.abs(left) + ' kg' : '✓')) : 'kg'}</small></div>
        </div>
        <div class="row gap" style="margin-top:10px"><input class="inp" type="number" inputmode="decimal" step="0.1" id="bgoal" value="${GOAL || ''}" placeholder="${th ? 'น้ำหนักเป้าหมาย (kg)' : 'Goal weight (kg)'}" style="margin:0">
          <button class="btn small w-auto" id="bgoalsave" style="white-space:nowrap;flex:none">${th ? 'ตั้งเป้า' : 'Set goal'}</button></div></div>
      <div class="card"><b>${t('bd_add')}</b>
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
      addEntry({weight:w, waist:wa}); toast(t('bd_saved')); render();
    };
    box.querySelector('#bgoalsave').onclick = () => { setGoal(parseFloat(box.querySelector('#bgoal').value)); toast(t('bd_saved')); render(); };
    box.querySelectorAll('[data-bdel]').forEach(b => b.onclick = () => { confirmSheet(t('del_confirm'), () => { removeEntry(+b.dataset.bdel); render(); }, {yes:t('remove'), danger:true}); });
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
      const d = o.querySelector('[data-del]'); if(d) d.onclick = async () => { confirmSheet(t('del_confirm'), async () => { await delPhoto(photos[a].id); o.remove(); render(); }, {yes:t('remove'), danger:true}); };
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

  /* ---------- quick weigh-in sheet (Home card and Progress) ---------- */
  function openWeightSheet(){
    const th = isTh(), last = latestWeight();
    let val = last ? last.weight : 70, step = 0.1;
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="sheet" style="max-width:380px">
      <div class="row" style="margin-bottom:10px"><b class="grow" style="font-size:16px">⚖️ ${th ? 'ชั่งน้ำหนัก' : 'Weigh-in'}</b><button class="chip mini" id="wz_close">✕</button></div>
      <div class="row" style="gap:8px;justify-content:center;margin-bottom:8px">
        <button class="chip" id="wz_sub" style="width:56px;min-height:56px;padding:0;font-size:26px;flex:none;touch-action:manipulation" aria-label="-">−</button>
        <input class="inp" id="wz_val" type="number" inputmode="decimal" step="0.1" min="0" style="margin:0;width:120px;min-width:0;text-align:center;font-size:28px;font-weight:700">
        <button class="chip" id="wz_add" style="width:56px;min-height:56px;padding:0;font-size:26px;flex:none;touch-action:manipulation" aria-label="+">+</button>
      </div>
      <div class="seg" style="margin:0 0 6px" id="wz_steps">
        <button data-s="0.1" style="min-height:36px;font-size:12px">0.1</button><button data-s="0.5" style="min-height:36px;font-size:12px">0.5</button><button data-s="1" style="min-height:36px;font-size:12px">1</button>
      </div>
      <small id="wz_delta" style="display:block;text-align:center;color:var(--mute);margin-bottom:10px"></small>
      <div class="grid2">
        <div><small>${th ? 'รอบเอว cm (ไม่บังคับ)' : 'Waist cm (optional)'}</small><input class="inp" id="wz_waist" type="number" inputmode="decimal" step="0.5" min="0"></div>
        <div><small>🎯 ${th ? 'เป้าหมาย kg' : 'Goal kg'}</small><input class="inp" id="wz_goal" type="number" inputmode="decimal" step="0.1" min="0" value="${GOAL || ''}"></div>
      </div>
      <button class="btn" id="wz_save">${th ? 'บันทึก' : 'Save'}</button></div>`;
    const q = s => m.querySelector(s), inp = q('#wz_val');
    function refresh(skip){
      if(!skip) inp.value = val;
      m.querySelectorAll('[data-s]').forEach(b => b.classList.toggle('on', +b.dataset.s === step));
      const d = last ? round1(val - last.weight) : null;
      q('#wz_delta').textContent = last ? (th ? 'จากครั้งก่อน ' : 'vs last ') + (d > 0 ? '+' : '') + d + ' kg (' + last.weight + ')' : (th ? 'ยังไม่เคยบันทึกน้ำหนัก' : 'First weigh-in');
    }
    const bump = dir => { val = Math.max(0, round1((parseFloat(inp.value) || val) + dir * step)); refresh(); };
    [['#wz_sub', -1], ['#wz_add', 1]].forEach(([sel, dir]) => {
      const b = q(sel); let to = null, iv = null;
      const stop = () => { clearTimeout(to); clearInterval(iv); to = iv = null; };
      b.onpointerdown = e => { e.preventDefault(); bump(dir); to = setTimeout(() => { iv = setInterval(() => bump(dir), 110); }, 400); };
      ['onpointerup', 'onpointerleave', 'onpointercancel'].forEach(ev => { b[ev] = stop; });
      b.onkeydown = e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); bump(dir); } };
    });
    inp.oninput = () => { val = parseFloat(inp.value) || 0; refresh(true); };
    m.querySelectorAll('[data-s]').forEach(b => { b.onclick = () => { step = +b.dataset.s; refresh(true); }; });
    q('#wz_close').onclick = () => m.remove();
    q('#wz_save').onclick = () => {
      const w = parseFloat(inp.value);
      if(!(w > 0)) return toast(isTh() ? 'ใส่น้ำหนักก่อน' : 'Enter a weight');
      addEntry({weight:w, waist:parseFloat(q('#wz_waist').value)});
      const g = q('#wz_goal').value.trim(); if(g !== String(GOAL || '')) setGoal(parseFloat(g));
      m.remove(); toast(t('bd_saved')); render();
    };
    document.body.appendChild(m); refresh();
  }
  return {load, save, view, summary, addEntry, openWeightSheet, latestWeight, avgAt,
    get goal(){ return GOAL; }, set goal(v){ setGoal(v); },
    get entries(){ return ENTRIES; }, set entries(v){ ENTRIES = v; save(); }};
})();
