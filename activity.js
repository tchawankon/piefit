'use strict';
/* PieFit other activities: things done outside the app (pilates, swimming, a match, a class).
   The user picks a type, minutes and one of three intensity levels; from that this module works out
   calories (MET x kg x hours), "equivalent sets" per muscle for the weekly targets, a training load,
   and whether the day counts as a full or a quick workout for Habits.
   Storage key: 'activity_log_v1' = [{id, t, type, name?, min, lvl:0|1|2, mus?:[muscle], note?, kg, kcal}]
   Loaded after yoga.js and before habits.js. app.js, habits.js, calendar.js and nutrition.js read it through this API. */
const Activity = (() => {
  const KEY = 'activity_log_v1';
  let LOGA = [];

  const isTh = () => typeof SET !== 'undefined' && SET.lang === 'th';
  const pad = n => String(n).padStart(2, '0');
  const isoOf = ts => { const d = new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  /* ---------- catalog ----------
     met: MET at light / moderate / hard, after the Compendium of Physical Activities (2024).
     k:   how much the activity loads muscles against resistance (1 = like a strength class, 0.3 = walking).
     mu:  which muscles it works and how much (0-1). Only keys of MUSCLES. */
  const TYPES = {
    pilates:  {ic:'🤸', th:'พิลาทิส',            en:'Pilates',            met:[2.8, 3.8, 5.0],  k:1,   mu:{core:1, glutes:.6, hamstrings:.4, quads:.3, shoulders:.3}},
    swim:     {ic:'🏊', th:'ว่ายน้ำ (เป็นรอบ)',    en:'Swimming laps',      met:[5.8, 8.0, 10.0], k:.8,  mu:{lats:1, shoulders:.8, upperback:.6, chest:.5, core:.5, triceps:.4, glutes:.3}},
    swimplay: {ic:'💦', th:'เล่นน้ำ / ว่ายเล่น',    en:'Swimming for fun',   met:[3.0, 4.5, 6.0],  k:.8,  mu:{lats:.6, shoulders:.6, core:.4, upperback:.3, quads:.3}},
    run:      {ic:'🏃', th:'วิ่ง',                 en:'Running',            met:[7.0, 9.8, 11.5], k:.6,  mu:{quads:1, glutes:.7, hamstrings:.7, core:.3}},
    walk:     {ic:'🚶', th:'เดินเร็ว',             en:'Brisk walking',      met:[2.8, 3.5, 5.0],  k:.3,  mu:{quads:.5, glutes:.5, hamstrings:.4}},
    hike:     {ic:'🥾', th:'เดินป่า / ขึ้นเขา',     en:'Hiking',             met:[5.0, 6.5, 8.0],  k:.6,  mu:{quads:.8, glutes:.8, hamstrings:.5, core:.3}},
    bike:     {ic:'🚴', th:'ปั่นจักรยาน',          en:'Cycling',            met:[4.0, 6.8, 10.0], k:.6,  mu:{quads:1, glutes:.6, hamstrings:.4}},
    badminton:{ic:'🏸', th:'แบดมินตัน',            en:'Badminton',          met:[4.5, 5.5, 7.0],  k:.5,  mu:{shoulders:.6, quads:.6, glutes:.4, core:.4, triceps:.3}},
    tennis:   {ic:'🎾', th:'เทนนิส',              en:'Tennis',             met:[5.0, 7.0, 8.0],  k:.5,  mu:{shoulders:.6, quads:.6, core:.5, glutes:.4, chest:.3}},
    football: {ic:'⚽', th:'ฟุตบอล / ฟุตซอล',      en:'Football / futsal',  met:[5.0, 7.0, 10.0], k:.6,  mu:{quads:.9, hamstrings:.7, glutes:.7, core:.4}},
    basket:   {ic:'🏀', th:'บาสเกตบอล',           en:'Basketball',         met:[4.5, 6.5, 8.0],  k:.5,  mu:{quads:.7, glutes:.6, hamstrings:.4, core:.4, shoulders:.3}},
    martial:  {ic:'🥊', th:'มวยไทย / ศิลปะป้องกันตัว', en:'Muay Thai / martial arts', met:[5.0, 7.5, 10.0], k:.7, mu:{core:.8, shoulders:.7, quads:.5, glutes:.5, chest:.3, triceps:.3, lats:.3}},
    climb:    {ic:'🧗', th:'ปีนผา',               en:'Climbing',           met:[5.0, 7.0, 8.0],  k:1,   mu:{lats:1, biceps:.8, upperback:.7, core:.5, shoulders:.4}},
    dance:    {ic:'💃', th:'เต้น / แอโรบิก',       en:'Dance / aerobics',   met:[4.0, 5.5, 7.5],  k:.5,  mu:{quads:.5, glutes:.5, core:.4}},
    hiit:     {ic:'🔥', th:'คลาส HIIT / เซอร์กิต',  en:'HIIT / circuit class', met:[5.0, 7.0, 9.0], k:.8, mu:{quads:.7, core:.6, glutes:.6, chest:.5, shoulders:.5, hamstrings:.4, triceps:.3, lats:.3}},
    weights:  {ic:'🏋️', th:'เวท / คลาสนอกแอพ',    en:'Weights (outside the app)', met:[3.5, 5.0, 6.0], k:1, mu:{chest:.5, shoulders:.5, triceps:.5, lats:.5, upperback:.5, biceps:.5, core:.5, glutes:.5, quads:.5, hamstrings:.5}},
    yogaclass:{ic:'🧘', th:'คลาสโยคะข้างนอก',     en:'Yoga class',         met:[2.5, 3.0, 4.0],  k:.5,  mu:{core:.5, shoulders:.3, glutes:.3, hamstrings:.3}},
    chores:   {ic:'🧹', th:'งานบ้าน / ทำสวนหนักๆ',  en:'Heavy chores / gardening', met:[3.0, 4.0, 5.5], k:.3, mu:{core:.4, quads:.4, glutes:.4, upperback:.3}},
    other:    {ic:'✨', th:'อื่นๆ (ตั้งชื่อเอง)',     en:'Other (name it)',    met:[3.0, 5.0, 7.0],  k:.6,  mu:{}}
  };
  const LVL = [ // credit factor for muscles, load factor (session-RPE style)
    {f:.3, load:3, ic:'😌', th:'เบา', en:'Light', dTh:'คุยได้สบาย ไม่ค่อยเหนื่อย', dEn:'Could chat easily, barely out of breath'},
    {f:.6, load:5, ic:'🙂', th:'ปานกลาง', en:'Moderate', dTh:'พูดได้เป็นประโยคสั้นๆ เหงื่อออก', dEn:'Short sentences only, sweating'},
    {f:1,  load:8, ic:'🥵', th:'หนัก', en:'Hard', dTh:'แทบพูดไม่ได้ ต้องหยุดพักเป็นช่วง', dEn:'Could hardly talk, needed breaks'}
  ];
  const CAP = 3; // at most 3 equivalent sets per muscle from one activity

  /* ---------- storage ---------- */
  function clean(e){
    if(!isObj(e) || typeof e.t !== 'number' || !TYPES[e.type] || !(e.min > 0)) return null;
    const o = {id: typeof e.id === 'string' ? e.id : newId(), t:e.t, type:e.type, min:Math.min(600, Math.round(e.min)), lvl:[0, 1, 2].includes(e.lvl) ? e.lvl : 1};
    if(typeof e.name === 'string' && e.name.trim()) o.name = e.name.trim().slice(0, 40);
    if(Array.isArray(e.mus)) o.mus = e.mus.filter(m => MUSCLES[m]);
    if(typeof e.note === 'string' && e.note.trim()) o.note = e.note.trim().slice(0, 200);
    o.kg = e.kg > 0 ? e.kg : bodyKg();
    o.kcal = typeof e.kcal === 'number' ? Math.round(e.kcal) : kcalOf(o);
    return o;
  }
  const load = () => { const a = store.get(KEY, []); LOGA = Array.isArray(a) ? a.map(clean).filter(Boolean) : []; };
  const save = () => store.set(KEY, LOGA);

  /* ---------- the calculations (one place for each rule) ---------- */
  function bodyKg(){
    const w = typeof Body !== 'undefined' && Body.latestWeight ? Body.latestWeight() : null;
    if(w && w.weight > 0) return w.weight;
    const c = typeof Habits !== 'undefined' && Habits.cfg ? Habits.cfg.weight : null;
    return c > 0 ? c : 70;
  }
  const kcalOf = e => Math.round(TYPES[e.type].met[e.lvl] * (e.kg || bodyKg()) * e.min / 60);
  const loadOf = e => e.min * LVL[e.lvl].load;
  // muscle weights for an entry: the user's own pick if they changed it, otherwise the catalog
  function weightsOf(e){
    const T = TYPES[e.type];
    if(!e.mus) return T.mu;
    return Object.fromEntries(e.mus.map(m => [m, T.mu[m] || (e.type === 'other' ? .8 : .5)]));
  }
  // equivalent sets per muscle: (minutes / 15) x intensity x muscle demand x weight, capped, rounded DOWN to 0.5
  // (rounding down keeps light play from adding half sets to every muscle it touched)
  function creditOf(e){
    const T = TYPES[e.type], base = e.min / 15 * LVL[e.lvl].f * T.k, out = {};
    Object.entries(weightsOf(e)).forEach(([m, w]) => {
      const s = Math.floor(Math.min(CAP, base * w) * 2 + 1e-9) / 2;
      if(s > 0) out[m] = s;
    });
    return out;
  }
  // full = at least 30 min at moderate or harder; anything shorter or lighter is a quick (consistency) day
  const modeOf = e => e.min >= 30 && e.lvl >= 1 ? 'full' : 'low';

  const since = ts => LOGA.filter(e => e.t >= ts);
  const onDay = iso => LOGA.filter(e => isoOf(e.t) === iso);
  function weekCredit(){
    const out = {};
    since(Date.now() - 7 * DAY).forEach(e => Object.entries(creditOf(e)).forEach(([m, s]) => out[m] = (out[m] || 0) + s));
    return out;
  }
  // muscles worked hard enough in the last 48 h to need recovery: only hard sessions count
  function recentHard(){
    const cnt = {};
    since(Date.now() - 48 * 3600e3).filter(e => e.lvl === 2).forEach(e => Object.entries(creditOf(e)).forEach(([m, s]) => cnt[m] = (cnt[m] || 0) + s));
    return Object.keys(cnt).filter(m => cnt[m] >= 1.5);
  }
  function dayMode(iso){
    const es = onDay(iso);
    if(!es.length) return null;
    return es.some(e => modeOf(e) === 'full') ? 'full' : 'low';
  }
  const dayKcal = iso => onDay(iso).reduce((s, e) => s + e.kcal, 0);

  /* ---------- labels ---------- */
  const typeName = e => e.type === 'other' && e.name ? e.name : (isTh() ? TYPES[e.type].th : TYPES[e.type].en);
  const label = e => `${TYPES[e.type].ic} ${esc(typeName(e))}`;
  const lvlName = l => isTh() ? LVL[l].th : LVL[l].en;
  const minTxt = n => n + (isTh() ? ' นาที' : ' min');
  const creditTxt = c => Object.entries(c).sort((a, b) => b[1] - a[1]).map(([m, s]) => `${M(m)} ${s}`).join(' · ');

  /* ---------- entry sheet (add and edit) ---------- */
  function openSheet(id){
    const th = isTh(), old = id ? LOGA.find(e => e.id === id) : null;
    const now = new Date();
    const d = old ? Object.assign({}, old) : {type:'pilates', min:45, lvl:1};
    let musEdited = !!(old && old.mus);
    let sel = new Set(old && old.mus ? old.mus : Object.keys(TYPES[d.type].mu));
    let dateIso = old ? isoOf(old.t) : isoOf(now.getTime());
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="sheet" style="max-width:440px">
      <div class="row" style="margin-bottom:6px"><b class="grow" style="font-size:16px">${old ? '✎ ' + (th ? 'แก้ไขกิจกรรม' : 'Edit activity') : '➕ ' + (th ? 'บันทึกกิจกรรมอื่น' : 'Log another activity')}</b><button class="chip" id="ac_close" style="min-width:40px;min-height:40px" aria-label="${th ? 'ปิด' : 'Close'}">✕</button></div>
      <div class="lbl-sm">${th ? 'ทำอะไรมา' : 'What did you do'}</div>
      <div id="ac_types" style="display:flex;flex-wrap:wrap;gap:6px">${Object.entries(TYPES).map(([k, T]) => `<button class="chip" data-ty="${k}" style="min-height:40px">${T.ic} ${th ? T.th : T.en}</button>`).join('')}</div>
      <input class="inp" id="ac_name" maxlength="40" placeholder="${th ? 'ชื่อกิจกรรม เช่น พายเรือ' : 'Activity name, e.g. kayaking'}" style="margin-top:8px">
      <div class="lbl-sm" style="margin-top:10px">${th ? 'นานแค่ไหน (นาที)' : 'How long (minutes)'}</div>
      <div class="row" style="gap:6px;flex-wrap:wrap">
        <input class="inp" id="ac_min" type="number" inputmode="numeric" min="1" max="600" style="width:64px;margin:0;text-align:center;font-size:18px;font-weight:700">
        ${[15, 30, 45, 60, 90].map(n => `<button class="chip" data-mn="${n}" style="min-height:40px;min-width:44px">${n}</button>`).join('')}
      </div>
      <div class="lbl-sm" style="margin-top:12px">${th ? 'หนักแค่ไหน' : 'How hard'}</div>
      <div class="seg" style="margin:0 0 4px">${LVL.map((L, i) => `<button data-lv="${i}">${L.ic} ${th ? L.th : L.en}</button>`).join('')}</div>
      <small id="ac_lvdesc" style="display:block;color:var(--mute)"></small>
      <div class="lbl-sm" style="margin-top:12px">${th ? 'กล้ามเนื้อที่ใช้ (แตะเพื่อปรับ)' : 'Muscles used (tap to adjust)'}</div>
      <div id="ac_mus" style="display:flex;flex-wrap:wrap;gap:6px">${Object.keys(MUSCLES).map(k => `<button class="chip" data-mu="${k}" style="min-height:40px">${M(k)}</button>`).join('')}</div>
      <div class="grid2" style="margin-top:12px">
        <div><small>${th ? 'วันที่' : 'Date'}</small><input class="inp" id="ac_date" type="date" max="${isoOf(now.getTime())}"></div>
        <div><small>${th ? 'โน้ต (ไม่บังคับ)' : 'Note (optional)'}</small><input class="inp" id="ac_note" maxlength="200"></div>
      </div>
      <div class="card" id="ac_prev" style="margin:4px 0 10px;background:var(--soft)"></div>
      <button class="btn" id="ac_save">${th ? 'บันทึก' : 'Save'}</button>
      ${old ? `<button class="btn ghost" id="ac_del" style="margin-top:8px;color:var(--warn)">🗑 ${th ? 'ลบรายการนี้' : 'Delete this entry'}</button>` : ''}
    </div>`;
    const q = s => m.querySelector(s);
    q('#ac_min').value = d.min; q('#ac_date').value = dateIso;
    q('#ac_name').value = d.name || ''; q('#ac_note').value = d.note || '';

    function draft(){
      const e = {type:d.type, min:Math.max(0, Math.min(600, parseInt(q('#ac_min').value, 10) || 0)), lvl:d.lvl, kg:bodyKg()};
      if(musEdited) e.mus = [...sel];
      return e;
    }
    function refresh(){
      m.querySelectorAll('[data-ty]').forEach(b => b.classList.toggle('on', b.dataset.ty === d.type));
      m.querySelectorAll('[data-lv]').forEach(b => b.classList.toggle('on', +b.dataset.lv === d.lvl));
      m.querySelectorAll('[data-mu]').forEach(b => b.classList.toggle('on', sel.has(b.dataset.mu)));
      const mn = parseInt(q('#ac_min').value, 10);
      m.querySelectorAll('[data-mn]').forEach(b => b.classList.toggle('on', +b.dataset.mn === mn));
      q('#ac_name').style.display = d.type === 'other' ? '' : 'none';
      q('#ac_lvdesc').textContent = th ? LVL[d.lvl].dTh : LVL[d.lvl].dEn;
      const e = draft();
      if(!(e.min > 0)){ q('#ac_prev').innerHTML = `<small>${th ? 'ใส่จำนวนนาที' : 'Enter the minutes'}</small>`; return; }
      const c = creditOf(e), kc = kcalOf(e), full = modeOf(e) === 'full';
      q('#ac_prev').innerHTML = `<div class="row" style="flex-wrap:wrap;gap:4px 12px"><b>🔥 ≈ ${kc} kcal</b><small>(${th ? 'น้ำหนัก' : 'at'} ${e.kg} kg)</small><span class="grow"></span><span class="chip ${full ? 'p' : ''}">${full ? (th ? '🔥 นับเป็นวันจัดเต็ม' : '🔥 Counts as a full day') : (th ? '⚡ นับเป็นวันเซฟแรง' : '⚡ Counts as a quick day')}</span></div>
        <small style="display:block;margin-top:6px">💪 ${Object.keys(c).length ? (th ? 'เทียบเท่า: ' : 'Equivalent: ') + creditTxt(c) + (th ? ' เซ็ต' : ' sets') : (th ? 'เบาเกินกว่าจะนับเป็นเซ็ตกล้ามเนื้อ (แต่ยังนับเป็นวันที่ได้ขยับ)' : 'Too light to count as muscle sets (still counts as an active day)')}</small>`;
    }
    m.querySelectorAll('[data-ty]').forEach(b => b.onclick = () => {
      d.type = b.dataset.ty;
      if(!musEdited) sel = new Set(Object.keys(TYPES[d.type].mu));
      refresh();
      if(d.type === 'other') q('#ac_name').focus();
    });
    m.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => { d.lvl = +b.dataset.lv; refresh(); });
    m.querySelectorAll('[data-mn]').forEach(b => b.onclick = () => { q('#ac_min').value = b.dataset.mn; refresh(); });
    m.querySelectorAll('[data-mu]').forEach(b => b.onclick = () => {
      const k = b.dataset.mu; sel.has(k) ? sel.delete(k) : sel.add(k); musEdited = true; refresh();
    });
    q('#ac_min').oninput = refresh;
    q('#ac_close').onclick = () => m.remove();
    m.onclick = ev => { if(ev.target === m) m.remove(); };
    q('#ac_save').onclick = () => {
      const e = draft();
      if(!(e.min > 0)) return toast(th ? 'ใส่จำนวนนาทีก่อน' : 'Enter the minutes first');
      if(d.type === 'other' && !q('#ac_name').value.trim()) return toast(th ? 'ตั้งชื่อกิจกรรมก่อน' : 'Name the activity first');
      const di = q('#ac_date').value || isoOf(Date.now()), today = isoOf(Date.now());
      let t;
      if(old && isoOf(old.t) === di) t = old.t;                   // same day: keep the original time
      else if(di === today) t = Date.now();
      else { const [y, mo, dd] = di.split('-').map(Number); t = new Date(y, mo - 1, dd, 12).getTime(); }
      if(t > Date.now()) t = Date.now();
      // a type change on an untouched pick means the catalog muscles of the new type
      const entry = clean(Object.assign({}, e, {id: old ? old.id : newId(), t, name: d.type === 'other' ? q('#ac_name').value : '', note: q('#ac_note').value}));
      entry.kcal = kcalOf(entry);
      if(old) LOGA = LOGA.map(x => x.id === old.id ? entry : x); else LOGA.push(entry);
      save();
      if(typeof Habits !== 'undefined' && Habits.autoWorkout) Habits.autoWorkout(isoOf(t));
      m.remove(); toast(th ? 'บันทึกกิจกรรมแล้ว' : 'Activity saved'); render();
    };
    if(old) q('#ac_del').onclick = () => askDelete(old.id, () => m.remove());
    document.body.appendChild(m); refresh();
  }
  function askDelete(id, done){
    const th = isTh(), e = LOGA.find(x => x.id === id); if(!e) return;
    const m = document.createElement('div'); m.className = 'modal restm';
    m.innerHTML = `<div class="sheet"><b>${th ? 'ลบรายการนี้?' : 'Delete this entry?'}</b><p class="sub" style="margin:6px 0 12px">${label(e)} · ${minTxt(e.min)}</p>
      <div class="row" style="gap:8px"><button class="btn ghost" id="ad_no">${th ? 'ยกเลิก' : 'Cancel'}</button><button class="btn" id="ad_yes" style="background:var(--warn)">${th ? 'ลบ' : 'Delete'}</button></div></div>`;
    m.querySelector('#ad_no').onclick = () => m.remove();
    m.querySelector('#ad_yes').onclick = () => { LOGA = LOGA.filter(x => x.id !== id); save(); m.remove(); if(done) done(); toast(th ? 'ลบแล้ว' : 'Deleted'); render(); };
    document.body.appendChild(m);
  }

  /* ---------- Home card ---------- */
  function homeCardHTML(){
    const th = isTh(), es = onDay(isoOf(Date.now()));
    return `<div class="card"><div class="row" style="flex-wrap:wrap;gap:8px"><div class="grow" style="min-width:150px"><b>🏊 ${th ? 'กิจกรรมอื่นวันนี้' : 'Other activity today'}</b><br>
      <small>${es.length ? es.map(e => `${label(e)} ${minTxt(e.min)}`).join(' · ') + ` · 🔥 ${dayKcal(isoOf(Date.now()))} kcal` : (th ? 'พิลาทิส ว่ายน้ำ กีฬา คลาสข้างนอก ฯลฯ' : 'Pilates, swimming, sports, outside classes…')}</small></div>
      <button class="chip p" id="ac_add" style="min-height:40px">➕ ${th ? 'บันทึก' : 'Log'}</button></div></div>`;
  }
  function bindHome(root){
    const b = root.querySelector('#ac_add'); if(b) b.onclick = () => openSheet();
  }

  /* ---------- history (Progress sub-tab) ---------- */
  function view(box){
    const th = isTh(), wk = since(Date.now() - 7 * DAY), cr = weekCredit();
    const tot = wk.reduce((a, e) => ({min:a.min + e.min, kcal:a.kcal + e.kcal, load:a.load + loadOf(e)}), {min:0, kcal:0, load:0});
    const byDay = new Map();
    [...LOGA].sort((a, b) => b.t - a.t).forEach(e => { const k = isoOf(e.t); if(!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(e); });
    const dateTxt = k => { const [y, mo, dd] = k.split('-').map(Number); return new Date(y, mo - 1, dd).toLocaleDateString(th ? 'th-TH' : undefined, {weekday:'short', day:'numeric', month:'short'}); };
    box.innerHTML = `<button class="btn" id="ac_add2" style="margin-bottom:10px">➕ ${th ? 'บันทึกกิจกรรมอื่น' : 'Log another activity'}</button>
      <div class="card"><b>${th ? '7 วันล่าสุด' : 'Last 7 days'}</b>
        <div class="row" style="flex-wrap:wrap;gap:6px;margin-top:8px">
          <span class="chip p">${wk.length} ${th ? 'ครั้ง' : 'sessions'}</span><span class="chip">⏱ ${minTxt(tot.min)}</span>
          <span class="chip">🔥 ${tot.kcal.toLocaleString()} kcal</span><span class="chip">📈 load ${tot.load}</span></div>
        <small style="display:block;margin-top:8px">💪 ${Object.keys(cr).length ? (th ? 'เซ็ตเทียบเท่าที่นับเข้าเป้าสัปดาห์: ' : 'Equivalent sets added to your weekly targets: ') + creditTxt(cr) : (th ? 'ยังไม่มีเซ็ตเทียบเท่าในสัปดาห์นี้' : 'No equivalent sets this week yet')}</small>
        <small class="note" style="display:block;margin-top:6px">${th ? 'แคลอรี่ = MET × น้ำหนักตัว × ชั่วโมง เป็นค่าประมาณ และไม่ได้บวกเข้าเป้าแคลอรี่อาหาร เพราะ TDEE นับระดับการออกกำลังกายไว้แล้ว · load = นาที × ความหนัก (เบา 3 / กลาง 5 / หนัก 8)' : 'Calories = MET × body weight × hours, an estimate. They are not added to your food target because your TDEE already includes your activity level. · Load = minutes × intensity (light 3 / moderate 5 / hard 8)'}</small></div>
      ${byDay.size ? [...byDay.entries()].slice(0, 60).map(([k, es]) => `<div class="card"><b>${dateTxt(k)}</b>
        ${es.map(e => { const c = creditOf(e); return `<div class="setrow" style="flex-wrap:wrap"><span class="grow" style="min-width:140px">${label(e)}<br><small>${minTxt(e.min)} · ${LVL[e.lvl].ic} ${lvlName(e.lvl)} · 🔥 ${e.kcal} kcal</small>
          ${Object.keys(c).length ? `<br><small>💪 ${creditTxt(c)}</small>` : ''}${e.note ? `<br><small>📝 ${esc(e.note)}</small>` : ''}</span>
          <button class="chip" data-aced="${e.id}" style="min-width:40px;min-height:40px" aria-label="${th ? 'แก้ไข' : 'Edit'}">✎</button><button class="chip" data-acdel="${e.id}" style="min-width:40px;min-height:40px" aria-label="${th ? 'ลบ' : 'Delete'}">✕</button></div>`; }).join('')}</div>`).join('')
        : `<div class="card"><small>${th ? 'ยังไม่มีกิจกรรมอื่นที่บันทึกไว้' : 'No other activities logged yet.'}</small></div>`}`;
    box.querySelector('#ac_add2').onclick = () => openSheet();
    box.querySelectorAll('[data-aced]').forEach(b => b.onclick = () => openSheet(b.dataset.aced));
    box.querySelectorAll('[data-acdel]').forEach(b => b.onclick = () => askDelete(b.dataset.acdel));
  }

  /* ---------- backup ---------- */
  const exportState = () => ({activities: LOGA});
  function importState(d){
    if(!Array.isArray(d.activities)) return;
    LOGA = d.activities.map(clean).filter(Boolean); save();
  }
  function clear(){ LOGA = []; save(); }

  return {load, save, TYPES, LVL, openSheet, homeCardHTML, bindHome, view, weekCredit, recentHard, dayMode, dayKcal, onDay,
    creditOf, kcalOf, loadOf, modeOf, label, exportState, importState, clear, get log(){ return LOGA; }};
})();
