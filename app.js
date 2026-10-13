'use strict';
/* PieFit app logic. Exercise data lives in data.js, translations in i18n.js. */

/* ================= storage ================= */
const KEY = 'ringfit.'; // storage prefix kept from the RingFit days so existing data survives the rename
const store = {
  get(k, d){
    try { const v = localStorage.getItem(KEY + k); if(v == null) return d; try { return JSON.parse(v); } catch(e){ return v; } }
    catch(e){ return d; }
  },
  set(k, v){ try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch(e){} }
};
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const SET_DEFAULT = {lang:'th', mode:'beginner', venue:'rings', exp:'new', sound:true, vol:0.7, voice:true, voiceLang:'en', vib:true, music:'off', wake:true, onboarded:false,
  sfx:{go:'chime', log:'pop', exdone:'arcade', finish:'arcade', level:'arcade'}};
let LOG, MASTERED, NEWS, TG, CAL, SET, ACTIVE;
function loadState(){
  LOG = store.get('log', []); if(!Array.isArray(LOG)) LOG = [];
  LOG.forEach((l, i) => { if(!l.id) l.id = l.t + '-' + i; });
  MASTERED = isObj(store.get('mastered')) ? store.get('mastered') : {};
  NEWS = Array.isArray(store.get('news')) ? store.get('news') : [];
  const tg = store.get('targets', {});
  TG = {type: isObj(tg) && BASE_TARGET[tg.type] ? tg.type : 'general', custom: isObj(tg) && isObj(tg.custom) ? tg.custom : {}};
  CAL = isObj(store.get('cal')) ? store.get('cal') : {};
  ACTIVE = isObj(store.get('active')) ? store.get('active') : null;
  const saved = store.get('settings', null);
  SET = Object.assign({}, SET_DEFAULT, isObj(saved) ? saved : {});
  if(!isObj(saved)){ // migrate settings stored by the first version
    const m = store.get('mode'), v = store.get('venue');
    if(m === 'beginner' || m === 'standard') SET.mode = m;
    if(v === 'rings' || v === 'gym') SET.venue = v;
    SET.onboarded = LOG.length > 0;
  }
  if(!VENUE_EQ[SET.venue]) SET.venue = 'rings';
  SET.sfx = Object.assign({}, SET_DEFAULT.sfx, isObj(SET.sfx) ? SET.sfx : {});
}
function persist(){
  store.set('log', LOG); store.set('mastered', MASTERED); store.set('news', NEWS);
  store.set('targets', TG); store.set('cal', CAL); store.set('settings', SET);
}
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ================= i18n ================= */
function tl(lang, k, ...a){
  let s = (STR[lang] && STR[lang][k]) || STR.en[k] || k;
  a.forEach((v, i) => { s = s.split('{' + i + '}').join(v); });
  return s;
}
const t = (k, ...a) => tl(SET.lang, k, ...a);
// spoken cues use their own language (English by default, the Thai phone voices sound unnatural)
const tv = (k, ...a) => tl(SET.voiceLang, k, ...a);
const M = m => t('m_' + m);
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function exText(id, field){
  const th = SET.lang === 'th' && EXTH[id] && EXTH[id][field];
  return th || EX[id][field];
}
const exName = id => EX[id] ? EX[id].name : esc(id);
const sessionName = id => t('s_' + id), sessionNote = id => t('sn_' + id);
const ladTitle = title => (SET.lang === 'th' && LADTH[title]) || title;

/* ================= exercise helpers ================= */
const SETS = 3;
const DAY = 864e5;
const EQ_KEYS = ['rings','trx','abwheel','barbell','dumbbell','machine','cable','bar','floor'];
// equipment usable at each training place
const VENUE_EQ = {rings:['rings','floor','abwheel'], trx:['trx','floor','abwheel'], cali:['floor','bar','abwheel'], gym:['barbell','dumbbell','machine','cable','bar','floor','abwheel']};
const atVenue = (x, v) => VENUE_EQ[v].includes(eqOf(x));
const eqOf = x => x.eq || 'rings';
const kindOf = x => x.hold ? 'hold' : (x.kind || 'strength');
function range(x){ const m = x.rx.match(/(\d+)(?:-(\d+))?/); return [+m[1], +(m[2] || m[1])]; }
const unitOf = x => x.hold ? t('u_sec') : t('u_reps');
const gated = id => LADDERS.some(l => l[1].includes(id));
const dayKey = ts => new Date(ts).toDateString();
const roundTo = (v, s) => Math.max(0, Math.round(v / s) * s);
function incOf(x){
  if(eqOf(x) === 'dumbbell') return 2;
  if(x.p.some(m => ['quads','glutes','hamstrings','calves'].includes(m)) && eqOf(x) !== 'cable') return 5;
  return 2.5;
}
function fmtW(x, w){ return w + ' kg' + (eqOf(x) === 'dumbbell' ? ' ' + t('per_db') : ''); }
function fmtSet(x, reps, w){ return reps + (x.hold ? 's' : '') + (w != null && x.load ? ' @ ' + fmtW(x, w) : ''); }
const e1rm = (w, r) => w * (1 + r / 30);

/* ================= weekly targets ================= */
const BASE_TARGET = {
  general:  {chest:8, shoulders:8, triceps:6, lats:8, upperback:6, biceps:6, core:8, glutes:8, quads:8, hamstrings:6, calves:4},
  muscle:   {chest:12, shoulders:12, triceps:10, lats:12, upperback:8, biceps:10, core:8, glutes:10, quads:12, hamstrings:10, calves:6},
  strength: {chest:10, shoulders:8, triceps:6, lats:10, upperback:6, biceps:4, core:6, glutes:8, quads:10, hamstrings:8, calves:4}
};
const EXP_FACTOR = {new:0.75, regular:1, exp:1.2};
function recommended(m){ return Math.max(3, Math.round(BASE_TARGET[TG.type][m] * (EXP_FACTOR[SET.exp] || 1))); }
function target(m){ return TG.custom[m] != null ? TG.custom[m] : recommended(m); }
function weekSets(){
  const out = Object.fromEntries(Object.keys(MUSCLES).map(m => [m, 0])), since = Date.now() - 7*DAY;
  LOG.filter(l => l.t >= since).forEach(l => {
    const x = EX[l.ex]; if(!x) return;
    x.p.forEach(m => out[m] += 1); x.s.forEach(m => out[m] += .5);
  });
  return out;
}
const byNeed = wk => Object.keys(MUSCLES).sort((a, b) => wk[a]/target(a) - wk[b]/target(b));
// muscles hit with 2+ primary sets in the last 48h (typical recovery window for the same muscle)
function recentMuscles(){
  const cnt = {}, since = Date.now() - 48*3600e3;
  LOG.filter(l => l.t >= since && EX[l.ex]).forEach(l => EX[l.ex].p.forEach(m => cnt[m] = (cnt[m] || 0) + 1));
  return new Set(Object.keys(cnt).filter(m => cnt[m] >= 2));
}

/* ================= progression (ring paths) ================= */
function prereqs(id){
  const out = [], L = LADDERS.find(l => l[1].includes(id));
  if(L){ const i = L[1].indexOf(id); if(i > 0) out.push(L[1][i-1]); }
  (EXTRA_PRE[id] || []).forEach(p => { if(!out.includes(p)) out.push(p); });
  return out;
}
function goal(id){
  const x = EX[id], [, hi] = range(x);
  return Object.assign({sets:SETS, reps:hi, sessions:2}, GOAL_OVR[id] || {});
}
function goalText(id){
  const g = goal(id), x = EX[id], wk = Math.max(1, Math.ceil(g.sessions / 3));
  return t('goal_text', g.sets, g.reps + (x.hold ? 's' : ''), g.sessions, wk);
}
// one entry per training day (calibration tests excluded), each with its sets
function sessionsOf(id, withCal){
  const m = new Map();
  LOG.filter(l => l.ex === id && (withCal || !l.cal)).forEach(l => {
    const k = dayKey(l.t); if(!m.has(k)) m.set(k, {key:k, t:l.t, sets:[]});
    m.get(k).sets.push(l);
  });
  return [...m.values()];
}
function progressOf(id){
  const g = goal(id), h = sessionsOf(id); let streak = 0;
  for(let i = h.length - 1; i >= 0; i--){ if(h[i].sets.filter(s => s.reps >= g.reps).length >= g.sets) streak++; else break; }
  return {g, streak: Math.min(streak, g.sessions)};
}
const mastered = id => !!MASTERED[id];
const unlockedBy = id => Object.keys(EX).filter(e => prereqs(e).includes(id) && prereqs(e).every(mastered));
function markMastered(id, how){
  if(mastered(id)) return [];
  MASTERED[id] = {t:Date.now(), [how]:true};
  const un = unlockedBy(id);
  NEWS.push({k:'mastered', ex:id, un});
  return un;
}
function checkMastery(id){
  if(!gated(id) || mastered(id)) return;
  const pr = progressOf(id);
  if(pr.streak >= pr.g.sessions) markMastered(id, 'auto');
}
function stepState(id){ return mastered(id) ? 'done' : prereqs(id).every(mastered) ? 'current' : 'locked'; }
// guided mode: replace an exercise by the first step whose prerequisites are not yet mastered
function resolve(id){ for(const p of prereqs(id)) if(!mastered(p)) return resolve(p); return id; }
function newsText(n){
  if(typeof n === 'string') return esc(n);
  return t('news_mastered', exName(n.ex)) + (n.un && n.un.length ? ' — ' + t('news_unlocked', n.un.map(exName).join(', ')) : '');
}

/* ================= sessions & lists ================= */
const SESSIONS = [
  {id:'push', icon:'💪', ex:['pushup','pike','dip','tricep','fallout'], gymExtra:['lateral']},
  {id:'pull', icon:'🧗', ex:['row','pullup','facepull','curl','hollow'], caliExtra:['hangleg']},
  {id:'legs', icon:'🦵', ex:['split','slrdl','hamcurl','calfraise','fallout'], gymExtra:['legpress'], caliExtra:['bwsquat','glutebridge']},
  {id:'skills', icon:'🤸', ex:['support','rtosupport','planchelean','hollow','tucklever','skincat']},
  {id:'full', icon:'⚡', ex:['pushup','row','split','fallout','support'], gymExtra:['legpress','dbshoulder'], caliExtra:['bwsquat','pikefloor']},
  {id:'auto', icon:'🎯', auto:true, ex:[]},
  {id:'cal', icon:'🧪', cal:true, ex:[]}
];
const CAL_LIST = {rings:['row','inclinepush','ringsquat','support','deadhang','hollow'], trx:['trxrow','trxpush','trxsquat','trxhamcurl','plank'], cali:['australian','floorpush','bwsquat','glutebridge','plank','hollow'], gym:['dbbench','latpull','cablerow','legpress','dbshoulder','plank']};
const TRX_DEFAULT = {hpush:'trxpush', hpull:'trxrow', vpull:'trxrow', reardelt:'trxface', biceps:'trxcurl', triceps:'trxtricep', squat:'trxsquat',
  lunge:'trxlunge', legcurl:'trxhamcurl', core:'trxfallout', vpush:'pikefloor', hinge:'slrdl', calf:'calfraise'};
const CALI_DEFAULT = {hpush:'floorpush', vpush:'pikefloor', triceps:'diamond', vpull:'pullupbar', hpull:'australian', reardelt:'australian',
  biceps:'chinup', core:'hollow', squat:'bwsquat', lunge:'revlunge', legcurl:'slrdl', hinge:'slrdl', hipext:'glutebridge', calf:'calfraise'};
function caliFor(id){ const x = EX[id]; if(['floor','bar','abwheel'].includes(eqOf(x))) return id; return x.pat && CALI_DEFAULT[x.pat] ? CALI_DEFAULT[x.pat] : null; }
function trxFor(id){ const x = EX[id]; if(['trx','floor','abwheel'].includes(eqOf(x))) return id; return x.pat && TRX_DEFAULT[x.pat] ? TRX_DEFAULT[x.pat] : null; }
const GYM_DEFAULT = {hpush:'dbbench', vpush:'dbshoulder', triceps:'pushdown', vpull:'latpull', hpull:'cablerow', reardelt:'cablefacepull',
  biceps:'dbcurl', core:'plank', squat:'legpress', lunge:'dbsplit', legcurl:'legcurl', hinge:'rdl', hipext:'hipthrust', legext:'legext',
  lateral:'lateral', calf:'machcalf'};
EX.slrdl.pat = 'hinge'; EX.calfraise.pat = 'calf';
function gymFor(id){
  const x = EX[id], eq = eqOf(x);
  if(eq !== 'rings' && eq !== 'floor') return id;
  return x.pat && GYM_DEFAULT[x.pat] ? GYM_DEFAULT[x.pat] : (eq === 'floor' ? id : null);
}
const pushUnique = (out, id) => { if(id && EX[id] && !out.includes(id)) out.push(id); };
// order: skill/static work first (fresh), then big compound lifts, then isolation, core last
const PAT_ORDER = ['squat','hinge','hpush','vpull','hpull','vpush','lunge','hipext','legcurl','legext','calf','lateral','reardelt','triceps','biceps'];
function rank(id){
  const x = EX[id];
  if(x.pat === 'core') return 90;
  if(x.hold || x.kind === 'skill') return 0;
  const i = PAT_ORDER.indexOf(x.pat); return i < 0 ? 50 : i + 1;
}
const sortList = l => l.map((id, i) => [id, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(e => e[0]);
function autoList(venue){
  const wk = weekSets(), rec = recentMuscles(), out = [];
  byNeed(wk).filter(m => !rec.has(m)).slice(0, 3).forEach(m => {
    Object.keys(EX).filter(id => EX[id].p.includes(m) && !EX[id].hold
        && atVenue(EX[id], venue)
        && (!['rings','cali'].includes(venue) || SET.mode !== 'beginner' || (stepState(id) !== 'locked' && EX[id].lvl <= 2)))
      .sort((a, b) => (EX[a].p[0] === m ? 0 : 1) - (EX[b].p[0] === m ? 0 : 1) || EX[a].lvl - EX[b].lvl)
      .slice(0, 2).forEach(id => pushUnique(out, id));
  });
  return sortList(out.slice(0, 6));
}
function buildList(s, venue){
  if(s.cal) return CAL_LIST[venue].slice();
  if(s.auto) return autoList(venue);
  const out = [];
  if(venue === 'gym'){ s.ex.forEach(id => pushUnique(out, gymFor(id))); (s.gymExtra || []).forEach(id => pushUnique(out, id)); }
  else if(venue === 'trx') s.ex.forEach(id => pushUnique(out, trxFor(id)));
  else if(venue === 'cali') s.ex.concat(s.caliExtra || []).forEach(id => { const c = caliFor(id); pushUnique(out, c && SET.mode === 'beginner' ? resolve(c) : c); });
  else s.ex.forEach(id => pushUnique(out, SET.mode === 'beginner' ? resolve(id) : id));
  return sortList(out);
}
function alternatives(id){
  const x = EX[id], out = [];
  Object.keys(EX).forEach(o => {
    if(o === id) return; const y = EX[o];
    if(!!y.hold !== !!x.hold) return;
    const same = x.pat && y.pat === x.pat, shared = y.p.filter(m => x.p.includes(m)).length;
    if(same || shared >= Math.min(2, x.p.length))
      out.push([o, (same ? 100 : 0) + shared*10 + (atVenue(y, SET.venue) ? 5 : 0) - y.lvl]);
  });
  return out.sort((a, b) => b[1] - a[1]).map(e => e[0]).slice(0, 16);
}
function sessionScore(s, wk, rec){
  const list = buildList(s, SET.venue); if(!list.length) return -1;
  const ms = new Set(); list.forEach(id => EX[id].p.forEach(m => ms.add(m)));
  let sc = 0; ms.forEach(m => { sc += Math.max(0, 1 - wk[m]/target(m)); if(rec.has(m)) sc -= .8; });
  return sc / ms.size;
}

/* ================= suggestion engine ================= */
const lastWeight = id => { const l = [...LOG].reverse().find(l => l.ex === id && l.w != null); return l ? l.w : null; };
function suggest(id){
  const x = EX[id], [lo, hi] = range(x), today = dayKey(Date.now());
  const days = sessionsOf(id).filter(d => d.key !== today), last = days[days.length - 1], cal = CAL[id];
  const out = {reps:lo, w:null, note:'', easier:false, first:false};
  if(x.load){
    const inc = incOf(x);
    if(last){
      const lw = Math.max(...last.sets.map(s => s.w || 0));
      const atTop = last.sets.filter(s => (s.w || 0) >= lw && s.reps >= hi).length;
      const missed = last.sets.filter(s => s.reps < lo).length;
      if(atTop >= SETS){ out.w = lw + inc; out.note = t('sg_add', inc); }
      else if(missed >= 2){ out.w = roundTo(lw * .9, inc); out.note = t('sg_reduce'); }
      else { out.w = lw; out.reps = Math.min(hi, Math.max(lo, Math.min(...last.sets.map(s => s.reps)) + 1)); out.note = t('sg_same'); }
    } else if(cal && cal.w != null){
      out.w = Math.max(inc, Math.floor(e1rm(cal.w, cal.reps) / (1 + (lo + 2)/30) / inc) * inc); out.note = t('sg_fromtest');
    } else { out.w = lastWeight(id) != null ? lastWeight(id) : (x.w0 || 20); out.note = t('sg_first'); out.first = true; }
  } else {
    const step = x.hold ? 5 : 1;
    if(last){
      const reps = last.sets.map(s => s.reps), best = Math.max(...reps), worst = Math.min(...reps);
      if(reps.filter(r => r >= hi).length >= SETS){ out.reps = hi; out.note = gated(id) ? t('sg_bw_top_path') : t('sg_bw_top'); }
      else if(best < lo){ out.reps = Math.max(1, best); out.note = EASIER[id] ? t('sg_bw_low') : t('sg_low_adj'); out.easier = true; }
      else { out.reps = Math.min(hi, Math.max(lo, worst + step)); out.note = t('sg_bw_more'); }
    } else if(cal){
      if(cal.reps < lo){ out.reps = Math.max(1, cal.reps); out.note = EASIER[id] ? t('sg_cal_low') : t('sg_low_adj'); out.easier = true; }
      else { const r = Math.round(cal.reps * .75); out.reps = Math.min(hi, Math.max(lo, x.hold ? roundTo(r, 5) : r)); out.note = t('sg_fromtest'); }
    } else { out.note = t('sg_first_bw'); out.first = true; }
  }
  return out;
}
function restFor(x, test){
  if(test) return 120;
  if(x.hold || x.kind === 'skill') return 90;
  if(['triceps','biceps','lateral','reardelt','legext','legcurl','calf','core'].includes(x.pat)) return 60;
  if(x.load && (eqOf(x) === 'barbell' || x.lvl >= 2)) return 150;
  return x.load ? 120 : 90;
}

/* ================= animation ================= */
let raf = 0;
function figSVG(id){
  return `<svg class="fig" id="${id}" viewBox="0 0 180 150" role="img" aria-label="Exercise animation">
    <line class="bar" data-k="topbar" x1="10" y1="4" x2="170" y2="4" stroke-width="4" stroke-linecap="round"/>
    <line class="ground" x1="6" y1="136" x2="174" y2="136"/>
    <g data-k="deco"></g>
    <line class="strap" data-k="strap" stroke-width="1.5"/>
    <circle class="ring" data-k="ring" r="6"/>
    <polyline class="limb" data-k="leg2" opacity=".55"/>
    <polyline class="limb" data-k="leg"/>
    <line class="torso" data-k="torso"/>
    <polyline class="limb" data-k="arm"/>
    <circle class="head" data-k="head" r="7"/>
    <rect class="pr-r" data-k="pdb" width="14" height="8" rx="3" display="none"/>
    <circle class="pr-b" data-k="pbb" r="8" display="none"/>
    <circle class="pr-r" data-k="ph" r="4" display="none"/>
  </svg>`;
}
function startAnim(svg, a){
  cancelAnimationFrame(raf);
  if(!svg || !a) return;
  const q = k => svg.querySelector(`[data-k="${k}"]`);
  const K = a.C ? [a.A, a.B, a.C] : [a.A, a.B];
  const n = K.length, move = 1500, hold = 600, fwd = (n-1)*move, cycle = 2*(fwd+hold);
  const pts = (...p) => p.map(v => v.join(',')).join(' ');
  const ringMode = a.grip && !a.cab;
  q('deco').innerHTML = (a.deco || []).map(d => d[0] === 'r'
    ? `<rect class="decr" x="${d[1]}" y="${d[2]}" width="${d[3]}" height="${d[4]}" rx="2"/>`
    : `<line class="decl" x1="${d[1]}" y1="${d[2]}" x2="${d[3]}" y2="${d[4]}"/>`).join('');
  q('topbar').setAttribute('display', (a.grip || a.cab) && !a.nobar ? 'inline' : 'none');
  q('ring').setAttribute('display', ringMode ? 'inline' : 'none');
  q('strap').setAttribute('display', a.grip || a.cab ? 'inline' : 'none');
  const propEl = a.prop ? q({db:'pdb', bb:'pbb', h:'ph'}[a.prop]) : null;
  if(propEl) propEl.setAttribute('display', 'inline');
  const t0 = performance.now();
  function frame(now){
    const tt = Math.max(0, now - t0) % cycle;
    const pos = tt < fwd ? tt/move : tt < fwd+hold ? n-1 : tt < 2*fwd+hold ? (n-1) - (tt-fwd-hold)/move : 0;
    const i = Math.min(n-2, Math.floor(pos)), f = pos - i, e = f*f*(3-2*f);
    const P = K[i], Q = K[i+1];
    const j = m => Q[m] && P[m] ? [P[m][0] + (Q[m][0]-P[m][0])*e, P[m][1] + (Q[m][1]-P[m][1])*e] : null;
    const [h, s, el, w, p, k, fo] = ['h','s','e','w','p','k','f'].map(j);
    q('head').setAttribute('cx', h[0]); q('head').setAttribute('cy', h[1]);
    q('torso').setAttribute('x1', s[0]); q('torso').setAttribute('y1', s[1]);
    q('torso').setAttribute('x2', p[0]); q('torso').setAttribute('y2', p[1]);
    q('arm').setAttribute('points', pts(s, el, w));
    q('leg').setAttribute('points', pts(p, k, fo));
    const k2 = j('k2'), f2 = j('f2');
    q('leg2').setAttribute('points', k2 ? pts(p, k2, f2) : '');
    if(a.grip){
      const g = j(a.grip);
      q('ring').setAttribute('cx', g[0]); q('ring').setAttribute('cy', g[1]);
      const ax = a.cab ? a.cab[0] : a.ax, ay = a.cab ? a.cab[1] : 4;
      q('strap').setAttribute('x1', ax); q('strap').setAttribute('y1', ay);
      q('strap').setAttribute('x2', g[0]); q('strap').setAttribute('y2', ringMode ? g[1]-6 : g[1]);
    }
    if(propEl){
      const g = j(a.pj || 'w');
      if(a.prop === 'db'){ propEl.setAttribute('x', g[0]-7); propEl.setAttribute('y', g[1]-4); }
      else { propEl.setAttribute('cx', g[0]); propEl.setAttribute('cy', g[1]); }
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
}

/* ================= small UI helpers ================= */
const app = document.getElementById('app'), nav = document.getElementById('nav');
const $ = sel => app.querySelector(sel);
function on(sel, fn, root){ (root || app).querySelectorAll(sel).forEach(el => el.onclick = e => fn(el, e)); }
function musclesChips(x){
  return '<div class="chips">' + x.p.map(m => `<span class="chip p">${M(m)}</span>`).join('') +
    x.s.map(m => `<span class="chip">${M(m)}</span>`).join('') + '</div>';
}
function segHTML(name, opts, cur){
  return `<div class="seg">${opts.map(([k, l]) => `<button data-${name}="${k}" class="${cur === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
}
const venueSeg = () => segHTML('venue', [['rings', '🔘 ' + t('v_rings')], ['trx', '🎗 TRX'], ['cali', '🤸 ' + t('v_cali')], ['gym', '🏋️ ' + t('v_gym')]], SET.venue);
function warnBlock(id){ const w = exText(id, 'warn'); return w ? `<div class="card warn"><b>⚠ ${t('caution')}</b><br>${w}</div>` : ''; }
function goalBlock(id){
  if(!gated(id)) return '';
  const st = stepState(id), pr = progressOf(id);
  if(st === 'done') return `<div class="card warn"><b>✅ ${t('mastered')}</b><br><small>${goalText(id)}</small></div>`;
  if(st === 'locked') return `<div class="card warn"><b>🔒 ${t('locked')}</b><br><small>${t('master_first', prereqs(id).filter(p => !mastered(p)).map(exName).join(', '))}</small></div>`;
  return `<div class="card warn"><b>🎯 ${t('goal_to_master')}</b><br><small>${goalText(id)}</small><br><small>${t('streak', pr.streak, pr.g.sessions)}</small></div>`;
}
function guideBlock(id, key){
  return figSVG(key) + `<p class="sub fignote">${t('fig_note')}</p>`;
}
function howTo(id, open){
  const p = exText(id, 'prog');
  return `<details class="card how" ${open ? 'open' : ''}><summary>${t('how_to')}</summary>
    <ul class="cues">${exText(id, 'cues').map(c => `<li>${c}</li>`).join('')}</ul>${p ? `<p class="sub">${p}</p>` : ''}</details>`;
}
function searchLink(x){
  return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(x.name + (eqOf(x) === 'rings' ? ' tutorial gymnastic rings' : ' form tutorial'));
}
function toast(msg){
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; document.body.appendChild(d);
  setTimeout(() => d.remove(), 2600);
}
function askNum(label, cur){
  const v = prompt(label, cur); if(v == null) return null;
  const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) && n >= 0 ? n : null;
}
const fmtTime = s => Math.floor(s/60) + ':' + String(s % 60).padStart(2, '0');
function pickExercise(title, hint, ids, onPick){
  const o = document.createElement('div'); o.className = 'modal'; let q = '', mf = '';
  o.innerHTML = `<div class="sheet"><div class="row"><h3 class="grow">${title}</h3><button class="chip" data-x>✕</button></div>
    <p class="sub">${hint}</p>
    <input class="inp" type="search" placeholder="${t('search')}" data-q>
    <select class="inp" data-mf><option value="">${t('all_muscles')}</option>${Object.keys(MUSCLES).map(m => `<option value="${m}">${M(m)}</option>`).join('')}</select>
    <div data-list></div></div>`;
  const draw = () => {
    const list = ids.filter(id => (!mf || EX[id].p.includes(mf)) && (!q || EX[id].name.toLowerCase().includes(q)));
    o.querySelector('[data-list]').innerHTML = list.length ? list.map(id => { const x = EX[id];
      return `<div class="card sess" data-pick="${id}"><div class="row"><b class="grow">${x.name}</b><span class="tag">${t('eq_' + eqOf(x))}</span></div>${musclesChips(x)}</div>`; }).join('')
      : `<p class="sub">${t('no_match')}</p>`;
    on('[data-pick]', el => { o.remove(); onPick(el.dataset.pick); }, o);
  };
  o.querySelector('[data-q]').oninput = e => { q = e.target.value.trim().toLowerCase(); draw(); };
  o.querySelector('[data-mf]').onchange = e => { mf = e.target.value; draw(); };
  o.querySelector('[data-x]').onclick = () => o.remove();
  o.onclick = e => { if(e.target === o) o.remove(); };
  draw(); document.body.appendChild(o);
}

/* ================= routing ================= */
let tab = 'home', view = {name:'home'};
const TABS = [['home','🏠','tab_home'], ['lib','📚','tab_lib'], ['prog','📈','tab_prog'], ['more','☰','tab_more']];
function go(tb, v){ tab = tb; view = v || {name:'home'}; render(); window.scrollTo(0, 0); }
let wakeLock = null;
async function keepAwake(on){
  try {
    if(on && SET.wake && 'wakeLock' in navigator && !wakeLock && document.visibilityState === 'visible'){
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if((!on || !SET.wake) && wakeLock){ const w = wakeLock; wakeLock = null; await w.release(); }
  } catch(e){ wakeLock = null; }
}
// the lock is dropped whenever the app is hidden, so take it again on return
document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') keepAwake(view.name === 'run'); });
function render(){
  cancelAnimationFrame(raf);
  keepAwake(view.name === 'run');
  if(view.timer){ clearInterval(view.timer.iv); view.timer = null; }
  document.documentElement.lang = SET.lang;
  if(!SET.onboarded && view.name !== 'onboard') view = {name:'onboard'};
  const full = ['run','onboard','summary'].includes(view.name);
  nav.style.display = full ? 'none' : 'flex';
  document.body.classList.toggle('nonav', full);
  nav.innerHTML = TABS.map(([k, i, l]) => `<button class="${tab === k ? 'on' : ''}" data-tab="${k}"><span class="ic">${i}</span>${t(l)}</button>`).join('');
  nav.querySelectorAll('button').forEach(b => b.onclick = () => go(b.dataset.tab));
  const V = {session:sessionView, run:runView, summary:summaryView, onboard:onboardView, detail:detailView,
    paths:pathsView, guide:guideView, settings:settingsView};
  if(view.name === 'home') ({home:homeView, lib:libView, prog:progView, more:moreView})[tab]();
  else V[view.name]();
}

/* ================= onboarding ================= */
function onboardView(){
  app.innerHTML = `<div class="hero-top"><div class="logo">◎</div><h1>PieFit</h1><p class="sub">${t('ob_sub')}</p></div>
    <div class="card"><b>${t('language')}</b>${segHTML('lang', [['th','ไทย'], ['en','English']], SET.lang)}</div>
    <div class="card"><b>${t('ob_where')}</b>${venueSeg()}<small>${t('ob_where_note')}</small></div>
    <div class="card"><b>${t('ob_exp')}</b>${segHTML('exp', [['new', t('x_new')], ['regular', t('x_regular')], ['exp', t('x_exp')]], SET.exp)}</div>
    <div class="card"><b>${t('ob_goal')}</b>${segHTML('gt', Object.keys(BASE_TARGET).map(k => [k, t('g_' + k)]), TG.type)}</div>
    <div class="card hl"><b>🧪 ${t('cal_card_title')}</b><p class="sub" style="margin:4px 0 0">${t('cal_card_body')}</p></div>
    <button class="btn" id="obcal">${t('cal_start')}</button>
    <button class="btn ghost" id="obskip" style="margin-top:8px">${t('ob_skip')}</button>`;
  on('[data-lang]', el => { SET.lang = el.dataset.lang; persist(); render(); });
  on('[data-venue]', el => { SET.venue = el.dataset.venue; persist(); render(); });
  on('[data-exp]', el => { SET.exp = el.dataset.exp; SET.mode = SET.exp === 'exp' ? 'standard' : 'beginner'; persist(); render(); });
  on('[data-gt]', el => { TG.type = el.dataset.gt; persist(); render(); });
  $('#obcal').onclick = () => { SET.onboarded = true; persist(); go('home', {name:'session', s:'cal'}); };
  $('#obskip').onclick = () => { SET.onboarded = true; persist(); go('home'); };
}

/* ================= home ================= */
function homeView(){
  const wk = weekSets(), rec = recentMuscles();
  const ranked = SESSIONS.filter(s => !s.cal).map(s => [s, sessionScore(s, wk, rec)]).filter(e => e[1] > -1).sort((a, b) => b[1] - a[1]);
  const best = ranked.length ? ranked[0][0] : null;
  const keys = Object.keys(MUSCLES);
  const pct = Math.round(keys.reduce((a, m) => a + Math.min(wk[m], target(m)), 0) / keys.reduce((a, m) => a + target(m), 0) * 100);
  const need = byNeed(wk).filter(m => wk[m] < target(m)).slice(0, 4);
  let reason = '';
  if(best){
    const ms = new Set(); buildList(best, SET.venue).forEach(id => EX[id].p.forEach(m => ms.add(m)));
    const focus = [...ms].filter(m => wk[m] < target(m)).slice(0, 3).map(M);
    reason = focus.length ? t('focus', focus.join(', ')) : '';
  }
  app.innerHTML = `<div class="top"><div class="grow"><h1>PieFit</h1><p class="sub">${t('home_sub')}</p></div></div>
    ${ACTIVE ? `<div class="card hl"><b>⏸ ${t('resume_title')}</b><br><small>${sessionName(ACTIVE.s)} · ${t('ex_of', Math.min(ACTIVE.i + 1, ACTIVE.list.length), ACTIVE.list.length)}</small>
      <div class="row" style="margin-top:10px"><button class="btn" id="resume">${t('resume')}</button><button class="btn ghost w-auto" id="discard">${t('discard')}</button></div></div>` : ''}
    ${NEWS.map((n, i) => `<div class="card warn row"><div class="grow">${newsText(n)}</div><button class="chip" data-news="${i}">OK</button></div>`).join('')}
    ${!Object.keys(CAL).length ? `<div class="card hl"><b>🧪 ${t('cal_card_title')}</b><p class="sub" style="margin:4px 0 10px">${t('cal_card_body')}</p><button class="btn" id="calgo">${t('cal_start')}</button></div>` : ''}
    <div class="lbl-sm">${t('ob_where')}</div>${venueSeg()}
    ${best ? `<div class="card hero sess" data-s="${best.id}"><small>${t('suggest_today')}</small>
      <div class="row"><div class="emoji">${best.icon}</div><div class="grow"><h2 style="margin:0">${sessionName(best.id)}</h2><small>${reason}</small></div><span class="go">›</span></div></div>` : ''}
    <div class="card"><div class="row"><b class="grow">${t('week_progress')}</b><b>${pct}%</b></div>
      <div class="track big"><div class="fill" style="width:${pct}%"></div></div>
      ${need.length ? `<small>${t('still_needed')}</small><div class="chips">${need.map(m => `<span class="chip p">${M(m)} ${Math.ceil(target(m) - wk[m])}</span>`).join('')}</div>` : `<small>🎉 ${t('all_done')}</small>`}
      ${rec.size ? `<small style="display:block;margin-top:8px">⏳ ${t('recovering', [...rec].map(M).join(', '))}</small>` : ''}</div>
    <h2>${t('all_sessions')}</h2>
    <div class="grid2">${SESSIONS.filter(s => !s.cal).map(s => { const n = buildList(s, SET.venue).length;
      return `<div class="card sess tile" data-s="${s.id}"><div class="emoji">${s.icon}</div><b>${sessionName(s.id)}</b>
        <small>${t('n_ex', n)} · ${t('last', lastDone(s.id))}</small></div>`; }).join('')}
      <div class="card sess tile" data-s="cal"><div class="emoji">🧪</div><b>${sessionName('cal')}</b><small>${Object.keys(CAL).length ? t('retest') : t('not_done')}</small></div>
    </div>`;
  on('[data-news]', el => { NEWS.splice(+el.dataset.news, 1); persist(); render(); });
  on('[data-venue]', el => { SET.venue = el.dataset.venue; persist(); render(); });
  on('[data-s]', el => go('home', {name:'session', s:el.dataset.s}));
  if($('#calgo')) $('#calgo').onclick = () => go('home', {name:'session', s:'cal'});
  if($('#resume')) $('#resume').onclick = () => { if(SET.music !== 'off') Sound.startMusic(SET.music); view = Object.assign({name:'run'}, ACTIVE); render(); window.scrollTo(0, 0); };
  if($('#discard')) $('#discard').onclick = () => { if(confirm(t('discard_confirm'))){ ACTIVE = null; store.set('active', null); render(); } };
}
function lastDone(sid){
  const l = [...LOG].reverse().find(l => l.sess === sid);
  if(!l) return t('not_done');
  const d = Math.floor((Date.now() - l.t) / DAY);
  return d === 0 ? t('today_l') : t('days_ago', d);
}

/* ================= session preview ================= */
function sessionView(){
  const s = SESSIONS.find(x => x.id === view.s);
  if(!view.list) view.list = buildList(s, SET.venue);
  const list = view.list, rec = recentMuscles(), prim = new Set();
  list.forEach(id => EX[id].p.forEach(m => prim.add(m)));
  const hit = [...prim].filter(m => rec.has(m));
  app.innerHTML = `<button class="chip" id="back">← ${t('back')}</button>
    <h1>${s.icon} ${sessionName(s.id)}</h1><p class="sub">${sessionNote(s.id)}</p>
    ${venueSeg()}
    ${s.cal ? `<div class="card hl"><small>${t('cal_intro')}</small></div>` : ''}
    ${hit.length && !s.cal ? `<div class="card warn"><small>⏳ ${t('recent_warn', hit.map(M).join(', '))}</small></div>` : ''}
    ${!['rings','cali'].includes(SET.venue) && s.id === 'skills' ? `<div class="card warn"><small>${t('skills_gym')}</small></div>` : ''}
    <div class="chips" style="margin:0 0 10px">${[...prim].map(m => `<span class="chip p">${M(m)}</span>`).join('')}</div>` +
    list.map((id, i) => { const x = EX[id], sg = suggest(id);
      return `<div class="card item"><div class="row"><span class="num">${i + 1}</span>
        <div class="grow"><b>${x.name}</b><br><small>${s.cal ? t('test_once') : SETS + ' × ' + fmtSet(x, sg.reps, sg.w)} · ${t('eq_' + eqOf(x))}</small></div>
        <button class="chip mini" data-swap="${i}" aria-label="${t('swap')}">⇄</button><button class="chip mini" data-del="${i}" aria-label="${t('remove')}">✕</button></div></div>`; }).join('') +
    `<button class="btn ghost" id="add">+ ${t('add_ex')}</button>
     <button class="btn sticky" id="go" ${list.length ? '' : 'disabled'}>${s.cal ? t('cal_start') : t('start')}</button>`;
  $('#back').onclick = () => go('home');
  on('[data-venue]', el => { SET.venue = el.dataset.venue; persist(); view.list = null; render(); });
  on('[data-swap]', el => { const i = +el.dataset.swap, id = list[i];
    pickExercise(t('swap') + ': ' + EX[id].name, t('swap_hint'), alternatives(id), nid => { view.list[i] = nid; render(); }); });
  on('[data-del]', el => { view.list.splice(+el.dataset.del, 1); render(); });
  $('#add').onclick = () => pickExercise(t('add_ex'), t('add_hint'), Object.keys(EX).filter(id => !list.includes(id)), nid => { view.list.push(nid); render(); });
  $('#go').onclick = () => startWorkout(s.id, list, !!s.cal);
}

/* ================= workout ================= */
function startWorkout(sid, list, cal){
  view = {name:'run', s:sid, list:list.slice(), i:0, logged:{}, cal, t0:Date.now(), news0:NEWS.length, results:[]};
  tab = 'home'; saveActive(); if(SET.music !== 'off') Sound.startMusic(SET.music); render(); window.scrollTo(0, 0);
}
function saveActive(){
  if(view.name === 'run'){ ACTIVE = {s:view.s, list:view.list, i:view.i, logged:view.logged, cal:view.cal, t0:view.t0, news0:view.news0, results:view.results, testNext:view.testNext, rest:view.rest || null}; }
  store.set('active', ACTIVE);
}
function loggedSets(i){ return (view.logged[i] || []).map(lid => LOG.find(l => l.id === lid)).filter(Boolean); }
function runView(){
  const id = view.list[view.i];
  if(!id || !EX[id]) return finishWorkout();
  const x = EX[id], [lo, hi] = range(x), sets = loggedSets(view.i);
  const isTest = view.cal || view.testNext === view.i;
  const work = view.cal ? sets : sets.filter(l => !l.cal), N = view.cal ? 1 : SETS, done = work.length;
  const sg = suggest(id);
  if(view.reps == null) view.reps = isTest ? lo : sg.reps;
  if(x.load && view.w == null) view.w = sg.w;
  const first = !sessionsOf(id, true).length;
  const pct = (view.i + Math.min(done, N) / N) / view.list.length * 100;
  app.innerHTML = `<div class="runbar"><button class="chip" id="quit">✕</button>
      <div class="track grow"><div class="fill" style="width:${pct}%"></div></div><small>${view.i + 1}/${view.list.length}</small>
      <button class="chip mini" id="music" aria-label="${t('snd_music')}">${Sound.musicOn() ? '🎵' : '🔇'}</button></div>
    <h1>${x.name}</h1><div class="row wrap"><span class="tag">${t('eq_' + eqOf(x))}</span><span class="tag">${t('lvl_' + x.lvl)}</span></div>${musclesChips(x)}
    <div style="height:10px"></div>${guideBlock(id, 'figure')}
    ${isTest
      ? `<div class="card hl"><b>🧪 ${t('test_title')}</b><br><small>${x.load ? t('test_load') : x.hold ? t('test_hold') : t('test_bw')}</small></div>`
      : `<div class="card sug ${sg.easier ? 'warn' : ''}"><small>${t('today_plan')}</small><br><b class="plan">${N} × ${fmtSet(x, sg.reps, sg.w)}</b><br><small>${sg.note}</small>
          ${sg.first ? `<button class="btn ghost" id="testone" style="margin-top:8px">🧪 ${t('test_first')}</button>` : ''}</div>`}
    <div class="card">
      ${isTest ? '' : `<div class="dots">${Array.from({length:N}, (_, i) => `<div class="dot ${i < done ? 'done' : ''}">${i + 1}</div>`).join('')}<div class="grow"></div><small>${t('range')} ${x.rx}</small></div>`}
      <div class="lbl-sm center">${isTest ? (x.hold ? t('result_sec') : t('result_reps')) : unitOf(x)}</div>
      <div class="stepper"><button id="m">−</button><b id="r" class="tap">${view.reps}${x.hold ? 's' : ''}</b><button id="p">+</button></div>
      ${x.load ? `<div class="lbl-sm center">${t('weight')}</div><div class="stepper"><button id="wm">−</button><b id="wv" class="tap wv">${fmtW(x, view.w)}</b><button id="wp">+</button></div>` : ''}
      ${x.hold ? `<button class="btn ghost" id="hold" style="margin-bottom:8px">▶ ${t('hold_start')}</button>` : ''}
      <button class="btn" id="log" ${!isTest && done >= N ? 'disabled' : ''}>${isTest ? t('save_test') : done >= N ? '✓ ' + t('all_sets_done') : t('log_set', done + 1)}</button>
      ${sets.length ? `<div class="sets">${sets.map((l, n) => `<div class="setrow"><span class="num">${l.cal ? '🧪' : n + 1}</span><b class="grow">${fmtSet(x, l.reps, l.w)}</b>
        <button class="chip mini" data-edit="${l.id}" aria-label="${t('edit')}">✎</button><button class="chip mini" data-delset="${l.id}" aria-label="${t('remove')}">✕</button></div>`).join('')}</div>` : ''}
    </div>
    <div class="row gap">${EASIER[id] && !view.cal ? `<button class="btn ${sg.easier ? '' : 'ghost'} small" id="easy">⬇ ${t('easier')}</button>` : ''}
      <button class="btn ghost small" id="swap">⇄ ${t('swap')}</button></div>
    <div class="row gap" style="margin-top:8px"><button class="btn ghost" id="prev" ${view.i === 0 ? 'disabled' : ''}>← ${t('prev')}</button>
      <button class="btn ${done >= N ? '' : 'ghost'}" id="next">${view.i === view.list.length - 1 ? t('finish') : t('next') + ' →'}</button></div>
    <div style="height:14px"></div>${warnBlock(id)}${howTo(id, first)}${view.cal ? '' : goalBlock(id)}`;
  startAnim(document.getElementById('figure'), x.anim);
  if(view.rest && !document.querySelector('.restm')){ const r = view.rest; startRest(0, r.cue, r.cueVoice, r.next, r.end); }

  const step = x.hold ? 5 : 1, rEl = $('#r');
  const showR = () => { rEl.textContent = view.reps + (x.hold ? 's' : ''); };
  $('#m').onclick = () => { view.reps = Math.max(1, view.reps - step); showR(); };
  $('#p').onclick = () => { view.reps += step; showR(); };
  rEl.onclick = () => { const v = askNum(unitOf(x), view.reps); if(v != null){ view.reps = Math.max(1, Math.round(v)); showR(); } };
  if(x.load){
    const wEl = $('#wv'), inc = incOf(x), showW = () => { wEl.textContent = fmtW(x, view.w); };
    $('#wm').onclick = () => { view.w = Math.max(0, +(view.w - inc).toFixed(2)); showW(); };
    $('#wp').onclick = () => { view.w = +(view.w + inc).toFixed(2); showW(); };
    wEl.onclick = () => { const v = askNum(t('weight') + ' (kg)', view.w); if(v != null){ view.w = v; showW(); } };
  }
  const hb = $('#hold');
  if(hb) hb.onclick = () => {
    if(view.timer){ clearInterval(view.timer.iv); view.reps = Math.max(1, view.timer.n); view.timer = null; hb.textContent = '▶ ' + t('hold_start'); showR(); }
    else { hb.textContent = '■ ' + t('hold_stop'); const tm = {n:0, goal:view.reps, t0:Date.now()}; Sound.play('log');
      tm.iv = setInterval(() => { const n = Math.floor((Date.now() - tm.t0) / 1000); if(n === tm.n) return; tm.n = n; rEl.textContent = n + 's';
        if(n === tm.goal){ Sound.play('target'); Sound.vibrate(200); Sound.say(tv('v_hold')); } else if(n % 10 === 0) Sound.play('tick'); }, 200);
      view.timer = tm; }
  };
  $('#log').onclick = () => logSet(id, isTest, done, N);
  $('#music').onclick = () => {
    if(Sound.musicOn()) Sound.stopMusic();
    else { if(SET.music === 'off'){ SET.music = 'focus'; persist(); } Sound.startMusic(SET.music); }
    $('#music').textContent = Sound.musicOn() ? '🎵' : '🔇';
  };
  if($('#testone')) $('#testone').onclick = () => { view.testNext = view.i; view.reps = null; view.w = null; saveActive(); render(); };
  on('[data-edit]', el => editSet(el.dataset.edit));
  on('[data-delset]', el => deleteSet(el.dataset.delset));
  if($('#easy')) $('#easy').onclick = () => { view.list[view.i] = EASIER[id]; resetEx(); };
  $('#swap').onclick = () => pickExercise(t('swap') + ': ' + x.name, t('swap_hint'), alternatives(id), nid => { view.list[view.i] = nid; resetEx(); });
  $('#prev').onclick = () => { view.i--; resetEx(); };
  $('#next').onclick = () => { if(view.i === view.list.length - 1) finishWorkout(); else { view.i++; resetEx(); } };
  $('#quit').onclick = () => {
    if(Object.values(view.logged).flat().length){ if(confirm(t('quit_confirm'))) finishWorkout(); }
    else { ACTIVE = null; store.set('active', null); Sound.stopMusic(); go('home'); }
  };
}
function resetEx(){ view.reps = null; view.w = null; view.testNext = null; saveActive(); render(); window.scrollTo(0, 0); }
function logSet(id, isTest, done, N){
  const x = EX[id], news0 = NEWS.length;
  // stop a running hold timer first so the timed value is what gets logged
  if(view.timer){ clearInterval(view.timer.iv); view.reps = Math.max(1, view.timer.n); view.timer = null; }
  const entry = {id:newId(), t:Date.now(), sess:view.s, ex:id, reps:view.reps};
  if(x.load) entry.w = view.w;
  if(isTest) entry.cal = true;
  LOG.push(entry);
  (view.logged[view.i] = view.logged[view.i] || []).push(entry.id);
  if(isTest){
    CAL[id] = {t:entry.t, reps:entry.reps, w:entry.w};
    const res = {id, reps:entry.reps, w:entry.w, un:[], passed:false};
    if(gated(id) && !mastered(id) && entry.reps >= goal(id).reps){
      res.passed = true; res.un = markMastered(id, 'test');
      // calibration: keep testing up the path, but never auto-add the shoulder-risky skills
      if(view.cal) res.un.filter(n => !EX[n].warn && atVenue(EX[n], SET.venue) && !view.list.includes(n))
        .reverse().forEach(n => view.list.splice(view.i + 1, 0, n));
    }
    if(view.cal) view.results.push(res);
    view.testNext = null;
  } else checkMastery(id);
  view.reps = null; if(!x.load) view.w = null;
  persist(); saveActive();
  Sound.play(isTest ? 'target' : (!view.cal && done + 1 >= N) ? 'exdone' : 'log');
  if(NEWS.length > news0){ setTimeout(() => Sound.play('level'), 450); Sound.say(tv('v_level')); }
  const nextId = view.list[view.i + 1];
  if(view.cal){ const nn = nextId ? EX[nextId].name : ''; startRest(restFor(x, true), nn, nn, true); }
  else if(isTest){ view.w = null; render(); toast(t('test_saved')); }
  else if(done + 1 < N) startRest(restFor(x), t('set_n', done + 2), tv('set_n', done + 2), false);
  else render();
}
function editSet(lid){
  const l = LOG.find(e => e.id === lid); if(!l) return; const x = EX[l.ex];
  const r = askNum(unitOf(x), l.reps); if(r == null) return; l.reps = Math.max(1, Math.round(r));
  if(x && x.load){ const w = askNum(t('weight') + ' (kg)', l.w); if(w != null) l.w = w; }
  if(l.cal && CAL[l.ex] && CAL[l.ex].t === l.t) CAL[l.ex] = {t:l.t, reps:l.reps, w:l.w};
  persist(); render();
}
function deleteSet(lid){
  if(!confirm(t('del_confirm'))) return;
  const l = LOG.find(e => e.id === lid);
  LOG = LOG.filter(e => e.id !== lid);
  if(l && l.cal && CAL[l.ex] && CAL[l.ex].t === l.t) delete CAL[l.ex];
  if(view.logged) Object.keys(view.logged).forEach(k => { view.logged[k] = view.logged[k].filter(i => i !== lid); });
  Sound.play('soft');
  persist(); if(view.name === 'run') saveActive(); render();
}
function restAfter(next){
  if(next){ view.i++; view.w = null; }
  view.rest = null; saveActive(); render();
  if(next) window.scrollTo(0, 0);
}
function startRest(sec, cue, cueVoice, next, endAt){
  const r = view.rest = {end: endAt || Date.now() + sec*1000, cue: cue || '', cueVoice: cueVoice || '', next: !!next};
  saveActive();
  let last = -1;
  const o = document.createElement('div'); o.className = 'modal restm';
  o.innerHTML = `<div class="sheet center"><small>${t('rest')}</small><b class="bigtime">${fmtTime(Math.max(0, Math.ceil((r.end - Date.now()) / 1000)))}</b>
    ${r.cue ? `<small>${t('up_next')}: ${r.cue}</small>` : ''}
    <div class="row gap" style="margin-top:10px"><button class="btn ghost" data-d="-15">−15s</button><button class="btn ghost" data-d="15">+15s</button></div>
    <button class="btn" data-skip style="margin-top:10px">${t('skip')}</button></div>`;
  document.body.appendChild(o);
  if(!endAt) Sound.play('rest');
  const b = o.querySelector('.bigtime');
  const close = done => {
    clearInterval(iv); o.remove();
    if(done){
      const late = Math.round((Date.now() - r.end) / 1000);
      Sound.play('go'); Sound.vibrate([250, 120, 250]);
      Sound.say(r.cue ? tv('v_go', r.cueVoice || r.cue) : tv('v_rest_over'));
      if(late >= 3) toast(t('rest_late', late));
    }
    restAfter(r.next);
  };
  // count from the wall clock: after the phone sleeps or throttles timers the time is still right,
  // and the alarm fires as soon as the app is visible again
  const iv = setInterval(() => {
    const n = Math.ceil((r.end - Date.now()) / 1000);
    if(n !== last){ last = n; b.textContent = fmtTime(Math.max(0, n)); if(n > 0 && n <= 3 && !document.hidden) Sound.play('tick'); }
    if(n <= 0) close(true);
  }, 200);
  o.querySelectorAll('[data-d]').forEach(el => el.onclick = () => { r.end = Math.max(Date.now() + 1000, r.end + +el.dataset.d * 1000); last = -1; saveActive(); });
  o.querySelector('[data-skip]').onclick = () => close(false);
}
function finishWorkout(){
  const ids = Object.values(view.logged || {}).flat();
  const sum = {name:'summary', s:view.s, ids, t0:view.t0, t1:Date.now(), news:NEWS.slice(view.news0 || 0), cal:view.cal, results:view.results || []};
  ACTIVE = null; store.set('active', null);
  Sound.stopMusic(); Sound.play('finish'); Sound.vibrate([120, 80, 120, 80, 300]);
  if(ids.length) Sound.say(tv('v_done'));
  sum.fresh = true; tab = 'home'; view = sum; render(); window.scrollTo(0, 0);
}
function summaryView(){
  const logs = view.ids.map(lid => LOG.find(l => l.id === lid)).filter(Boolean);
  const byEx = {}; logs.forEach(l => (byEx[l.ex] = byEx[l.ex] || []).push(l));
  const vol = logs.reduce((a, l) => a + (l.w || 0) * l.reps, 0), mins = Math.max(1, Math.round((view.t1 - view.t0) / 60000));
  const score = l => EX[l.ex] && EX[l.ex].load ? e1rm(l.w || 0, l.reps) : l.reps;
  const prs = Object.keys(byEx).filter(id => {
    const prev = LOG.filter(l => l.ex === id && l.t < view.t0 && !view.ids.includes(l.id));
    return prev.length && Math.max(...byEx[id].map(score)) > Math.max(...prev.map(score));
  });
  app.innerHTML = `<div class="hero-top"><div class="logo">🎉</div><h1>${view.cal ? t('cal_done') : t('workout_done')}</h1><p class="sub">${sessionName(view.s)}</p></div>
    <div class="grid3"><div class="card stat"><b>${logs.length}</b><small>${t('sets')}</small></div>
      <div class="card stat"><b>${mins}</b><small>${t('minutes')}</small></div>
      <div class="card stat"><b>${Math.round(vol)}</b><small>${t('volume_kg')}</small></div></div>
    ${view.news.map(n => `<div class="card hl">${newsText(n)}</div>`).join('')}
    ${view.cal ? `<h2>${t('cal_results')}</h2>` + view.results.map(r => { const x = EX[r.id], [lo] = range(x);
        const msg = r.passed ? t('cal_passed') : x.load ? t('cal_load_res', fmtW(x, suggest(r.id).w)) : r.reps < lo ? (EASIER[r.id] ? t('cal_low') : t('cal_low_adj')) : t('cal_ok');
        return `<div class="card"><b>${x.name}</b>: ${fmtSet(x, r.reps, r.w)}<br><small>${msg}</small></div>`; }).join('') : ''}
    ${!view.cal ? Object.keys(byEx).map(id => { const x = EX[id]; return `<div class="card row"><div class="grow"><b>${x.name}</b>${prs.includes(id) ? ' <span class="chip p">🏆 PR</span>' : ''}<br>
        <small>${byEx[id].map(l => fmtSet(x, l.reps, l.w)).join(' · ')}</small></div></div>`; }).join('') : ''}
    <button class="btn" id="done" style="margin-top:12px">${t('done')}</button>`;
  $('#done').onclick = () => go('home');
  if(view.fresh){ view.fresh = false; if(prs.length || view.news.length) setTimeout(() => Sound.play('level'), 1600); }
}

/* ================= library ================= */
let LIBF = {q:'', m:'', eq:'', k:''};
function libView(){
  app.innerHTML = `<h1>${t('lib_title')}</h1>
    <input class="inp" type="search" id="lq" placeholder="${t('search')}" value="${esc(LIBF.q)}">
    <div class="row gap">
      <select class="inp" id="lm"><option value="">${t('all_muscles')}</option>${Object.keys(MUSCLES).map(m => `<option value="${m}" ${LIBF.m === m ? 'selected' : ''}>${M(m)}</option>`).join('')}</select>
      <select class="inp" id="le"><option value="">${t('all_eq')}</option>${EQ_KEYS.map(k => `<option value="${k}" ${LIBF.eq === k ? 'selected' : ''}>${t('eq_' + k)}</option>`).join('')}</select>
      <select class="inp" id="lk"><option value="">${t('all_types')}</option>${['strength','hold','skill'].map(k => `<option value="${k}" ${LIBF.k === k ? 'selected' : ''}>${t('k_' + k)}</option>`).join('')}</select>
    </div><div id="liblist"></div>`;
  const draw = () => {
    const ids = Object.keys(EX).filter(id => { const x = EX[id];
      return (!LIBF.q || x.name.toLowerCase().includes(LIBF.q.toLowerCase())) && (!LIBF.m || x.p.includes(LIBF.m) || x.s.includes(LIBF.m))
        && (!LIBF.eq || eqOf(x) === LIBF.eq) && (!LIBF.k || kindOf(x) === LIBF.k); });
    $('#liblist').innerHTML = `<small>${t('n_ex', ids.length)}</small>` + ids.map(id => { const x = EX[id];
      return `<div class="card sess item" data-e="${id}"><div class="row"><div class="grow"><b>${x.name}</b><br>
        <small>${t('eq_' + eqOf(x))} · ${t('k_' + kindOf(x))} · ${x.rx}${gated(id) ? ' · ' + {done:'✅', current:'▶️', locked:'🔒'}[stepState(id)] : ''}</small></div><span class="tag">${t('lvl_' + x.lvl)}</span></div>${musclesChips(x)}</div>`; }).join('');
    on('[data-e]', el => go('lib', {name:'detail', id:el.dataset.e, from:'lib'}));
  };
  $('#lq').oninput = e => { LIBF.q = e.target.value; draw(); };
  $('#lm').onchange = e => { LIBF.m = e.target.value; draw(); };
  $('#le').onchange = e => { LIBF.eq = e.target.value; draw(); };
  $('#lk').onchange = e => { LIBF.k = e.target.value; draw(); };
  draw();
}
function ladderFor(id){
  const L = LADDERS.find(l => l[1].includes(id)); if(!L) return '';
  return `<div class="card"><b>${ladTitle(L[0])}</b><div class="chips">` + L[1].map((i, n) => `<span class="chip ${i === id ? 'p' : ''}">${n + 1}. ${EX[i].name}</span>`).join('') + '</div></div>';
}
function detailView(){
  const id = view.id, x = EX[id], days = sessionsOf(id, true).slice(-5).reverse(), cal = CAL[id];
  app.innerHTML = `<button class="chip" id="back">← ${t('back')}</button><h1>${x.name}</h1>
    <div class="row wrap"><span class="tag">${t('eq_' + eqOf(x))}</span><span class="tag">${t('lvl_' + x.lvl)}</span><span class="tag">${x.rx}</span></div>
    ${musclesChips(x)}<div style="height:10px"></div>${guideBlock(id, 'figure')}
    ${howTo(id, true)}${warnBlock(id)}${goalBlock(id)}${ladderFor(id)}
    <div class="card"><b>${t('your_history')}</b>
      ${cal ? `<br><small>🧪 ${t('baseline')}: ${fmtSet(x, cal.reps, cal.w)} (${new Date(cal.t).toLocaleDateString()})</small>` : ''}
      ${days.length ? days.map(d => `<div class="setrow"><small class="grow">${new Date(d.t).toLocaleDateString()}</small><small>${d.sets.map(l => fmtSet(x, l.reps, l.w)).join(' · ')}</small></div>`).join('') : `<br><small>${t('no_history')}</small>`}
      <br><small>${t('today_plan')}: ${SETS} × ${fmtSet(x, suggest(id).reps, suggest(id).w)}</small></div>
    <button class="btn" id="testex">🧪 ${t('test_this')}</button>
    <a class="vid" href="${searchLink(x)}" target="_blank" rel="noopener">${t('video')} ↗</a>`;
  startAnim(document.getElementById('figure'), x.anim);
  $('#back').onclick = () => go(view.from === 'paths' ? 'more' : 'lib', view.from === 'paths' ? {name:'paths'} : undefined);
  $('#testex').onclick = () => startWorkout('cal', [id], true);
}

/* ================= progress ================= */
let progSub = 'week';
function progView(){
  app.innerHTML = `<h1>${t('tab_prog')}</h1>${segHTML('sub', [['week', t('p_week')], ['hist', t('p_hist')], ['base', t('p_base')]], progSub)}<div id="pbody"></div>`;
  on('[data-sub]', el => { progSub = el.dataset.sub; render(); });
  ({week:progWeek, hist:progHist, base:progBase})[progSub]($('#pbody'));
}
function progWeek(box){
  const wk = weekSets(), since = Date.now() - 7*DAY, rec = recentMuscles();
  const days = new Set(LOG.filter(l => l.t > since).map(l => dayKey(l.t)));
  box.innerHTML = `<p class="sub">${t('last7', LOG.filter(l => l.t > since).length, days.size)}</p>
    <div class="card"><b>${t('ob_goal')}</b>${segHTML('gt', Object.keys(BASE_TARGET).map(k => [k, t('g_' + k)]), TG.type)}
      <small>${t('target_note', t('x_' + SET.exp))}</small></div>
    <div class="card"><b>${t('muscles_week')}</b>` +
    Object.keys(MUSCLES).map(k => `<div class="bar-row"><span class="lbl">${M(k)}${rec.has(k) ? ' ⏳' : ''}</span>
      <div class="track"><div class="fill ${wk[k] >= target(k) ? 'ok' : ''}" style="width:${Math.min(100, wk[k]/target(k)*100)}%"></div></div>
      <span class="n">${wk[k]}/${target(k)}</span>
      <button class="chip mini" data-tm="${k}" data-d="-1">−</button><button class="chip mini" data-tm="${k}" data-d="1">+</button></div>
      ${TG.custom[k] != null ? `<small class="cust">${t('custom_rec', recommended(k))}</small>` : ''}`).join('') +
    `<small>${t('count_note')}</small>
     <button class="btn ghost" id="resett" style="margin-top:10px">${t('reset_targets')}</button></div>
    <small class="note">${t('target_disclaimer')}</small>`;
  on('[data-gt]', el => { TG.type = el.dataset.gt; persist(); render(); });
  on('[data-tm]', el => { const m = el.dataset.tm; TG.custom[m] = Math.max(0, Math.min(40, target(m) + +el.dataset.d)); persist(); render(); });
  box.querySelector('#resett').onclick = () => { TG.custom = {}; persist(); render(); };
}
function progHist(box){
  const byDay = new Map();
  [...LOG].sort((a, b) => b.t - a.t).forEach(l => { const k = dayKey(l.t); if(!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(l); });
  box.innerHTML = byDay.size ? [...byDay.entries()].slice(0, 30).map(([k, ls]) => `<div class="card"><b>${new Date(ls[0].t).toLocaleDateString(SET.lang === 'th' ? 'th-TH' : undefined, {weekday:'short', day:'numeric', month:'short'})}</b>
      <small> · ${t('n_sets', ls.length)}</small>
      ${ls.map(l => { const x = EX[l.ex]; return `<div class="setrow"><span class="grow">${l.cal ? '🧪 ' : ''}${x ? x.name : esc(l.ex)}</span><b>${x ? fmtSet(x, l.reps, l.w) : l.reps}</b>
        <button class="chip mini" data-edit="${l.id}">✎</button><button class="chip mini" data-delset="${l.id}">✕</button></div>`; }).join('')}</div>`).join('')
    : `<div class="card"><small>${t('no_sets')}</small></div>`;
  on('[data-edit]', el => editSet(el.dataset.edit), box);
  on('[data-delset]', el => deleteSet(el.dataset.delset), box);
}
function progBase(box){
  const ids = Object.keys(CAL).filter(id => EX[id]);
  box.innerHTML = `<p class="sub">${t('base_intro')}</p>` + (ids.length ? ids.map(id => {
    const x = EX[id], c = CAL[id], after = LOG.filter(l => l.ex === id && l.t > c.t);
    const sc = l => x.load ? e1rm(l.w || 0, l.reps) : l.reps, base = x.load ? e1rm(c.w || 0, c.reps) : c.reps;
    const best = after.length ? Math.max(...after.map(sc)) : null, diff = best != null && base ? Math.round((best - base) / base * 100) : null;
    return `<div class="card"><div class="row"><b class="grow">${x.name}</b>${diff != null ? `<span class="chip ${diff > 0 ? 'p' : ''}">${diff > 0 ? '+' : ''}${diff}%</span>` : ''}</div>
      <small>🧪 ${fmtSet(x, c.reps, c.w)} · ${new Date(c.t).toLocaleDateString()}${x.load ? ' · ' + t('e1rm', Math.round(base)) : ''}</small><br>
      <small>${best != null ? t('best_since', x.load ? t('e1rm', Math.round(best)) : best + (x.hold ? 's' : '')) : t('no_since')}</small></div>`; }).join('')
    : `<div class="card"><small>${t('no_base')}</small></div>`) +
    `<button class="btn" id="retest">🧪 ${t('retest')}</button>`;
  box.querySelector('#retest').onclick = () => go('home', {name:'session', s:'cal'});
}

/* ================= more: paths, guide, settings, backup ================= */
function moreView(){
  app.innerHTML = `<h1>${t('tab_more')}</h1>
    <div class="card sess row" data-v="paths"><span class="emoji">🪜</span><div class="grow"><b>${t('paths')}</b><br><small>${t('paths_sub')}</small></div><span class="go">›</span></div>
    <div class="card sess row" data-v="guide"><span class="emoji">🌱</span><div class="grow"><b>${t('guide')}</b><br><small>${t('guide_sub')}</small></div><span class="go">›</span></div>
    <div class="card sess row" data-v="settings"><span class="emoji">⚙️</span><div class="grow"><b>${t('settings')}</b><br><small>${t('settings_sub')}</small></div><span class="go">›</span></div>
    <h2>${t('backup')}</h2>
    <div class="card"><small>${t('backup_note')}</small>
      <button class="btn" id="exp" style="margin-top:10px">⬇ ${t('export')}</button>
      <button class="btn ghost" id="imp" style="margin-top:8px">⬆ ${t('import')}</button>
      <input type="file" id="impf" accept="application/json,.json" hidden></div>
    <h2>${t('install')}</h2><div class="card"><small>${t('install_note')}</small></div>`;
  on('[data-v]', el => go('more', {name:el.dataset.v}));
  $('#exp').onclick = exportData;
  $('#imp').onclick = () => $('#impf').click();
  $('#impf').onchange = e => { if(e.target.files[0]) importData(e.target.files[0]); };
}
function pathsView(){
  const icon = {done:'✅', current:'▶️', locked:'🔒'};
  app.innerHTML = `<button class="chip" id="back">← ${t('back')}</button><h1>${t('paths')}</h1><p class="sub">${t('paths_intro')}</p>` +
    LADDERS.map(([title, ids]) => `<div class="card"><b>${ladTitle(title)}</b>` + ids.map(id => {
      const st = stepState(id), pr = progressOf(id);
      return `<div class="row step ${st}"><span>${icon[st]}</span>
        <div class="grow"><a href="#" data-open="${id}">${EX[id].name}</a><br>
        <small>${st === 'locked' ? t('needs', prereqs(id).filter(p => !mastered(p)).map(exName).join(', '))
          : st === 'done' ? t('mastered') + (MASTERED[id].manual ? ' (' + t('manual') + ')' : MASTERED[id].test ? ' (' + t('by_test') + ')' : '')
          : goalText(id) + ' · ' + t('streak', pr.streak, pr.g.sessions)}</small></div>
        <button class="chip" data-mark="${id}" data-on="${st === 'done' ? 0 : 1}">${st === 'done' ? t('undo') : t('can_do')}</button></div>`;
    }).join('') + '</div>').join('') +
    `<small class="note">${t('paths_note')}</small>`;
  $('#back').onclick = () => go('more');
  on('[data-open]', (el, e) => { e.preventDefault(); go('lib', {name:'detail', id:el.dataset.open, from:'paths'}); });
  on('[data-mark]', el => {
    const id = el.dataset.mark;
    if(el.dataset.on === '1'){ MASTERED[id] = {t:Date.now(), manual:true}; } else delete MASTERED[id];
    persist(); render();
  });
}
function guideView(){
  app.innerHTML = `<button class="chip" id="back">← ${t('back')}</button><h1>${t('guide')}</h1>${t('guide_html')}`;
  $('#back').onclick = () => go('more');
}
function settingsView(){
  app.innerHTML = `<button class="chip" id="back">← ${t('back')}</button><h1>${t('settings')}</h1>
    <div class="card"><b>${t('language')}</b>${segHTML('lang', [['th','ไทย'], ['en','English']], SET.lang)}</div>
    <div class="card"><b>${t('ob_exp')}</b>${segHTML('exp', [['new', t('x_new')], ['regular', t('x_regular')], ['exp', t('x_exp')]], SET.exp)}<small>${t('exp_note')}</small></div>
    <div class="card"><b>${t('ring_mode')}</b>${segHTML('mode', [['beginner', '🌱 ' + t('guided')], ['standard', '🔥 ' + t('free')]], SET.mode)}<small>${SET.mode === 'beginner' ? t('guided_note') : t('free_note')}</small></div>
    <div class="card"><b>${t('ob_goal')}</b>${segHTML('gt', Object.keys(BASE_TARGET).map(k => [k, t('g_' + k)]), TG.type)}</div>
    <div class="card"><b>📱 ${t('wake_title')}</b>${segHTML('wake', [['1', t('on')], ['0', t('off')]], SET.wake ? '1' : '0')}<small>${t('wake_note')}</small></div>
    <h2>🔊 ${t('snd_title')}</h2>
    <div class="card"><b>${t('snd_sfx')}</b>${segHTML('sound', [['1', '🔔 ' + t('on')], ['0', '🔕 ' + t('off')]], SET.sound ? '1' : '0')}<small>${t('snd_sfx_note')}</small>
      <b style="display:block;margin-top:12px">${t('snd_vol')}</b>${segHTML('vol', [['0.4', t('vol_low')], ['0.7', t('vol_mid')], ['1', t('vol_high')]], String(SET.vol))}
      <b style="display:block;margin-top:4px">${t('snd_voice')}</b>${segHTML('voice', [['1', '🗣 ' + t('on')], ['0', t('off')]], SET.voice ? '1' : '0')}${SET.voice ? `<b style="display:block;margin-top:4px">${t('snd_voice_lang')}</b>${segHTML('vlang', [['en', 'English'], ['th', 'ไทย']], SET.voiceLang)}` : ''}<small>${t('snd_voice_note')}</small>
      <b style="display:block;margin-top:12px">${t('snd_vib')}</b>${segHTML('vib', [['1', '📳 ' + t('on')], ['0', t('off')]], SET.vib ? '1' : '0')}</div>
    <div class="card"><b>🎨 ${t('snd_theme')}</b>${segHTML('theme', Object.keys(Sound.THEMES).map(k => [k, t('th_' + k)]), Object.keys(Sound.THEMES).find(k => Object.keys(Sound.THEMES[k]).every(e => Sound.THEMES[k][e] === SET.sfx[e])) || '')}
      <small>${t('snd_events')}</small>
      ${Object.entries(Sound.events()).map(([ev, vars]) => `<div class="row" style="margin-top:10px"><span class="grow">${t('ev_' + ev)}</span>
        <select class="inp" data-sfx="${ev}" style="width:auto;margin:0">${vars.map(v => `<option value="${v}" ${SET.sfx[ev] === v ? 'selected' : ''}>${t('var_' + v)}</option>`).join('')}</select>
        <button class="chip mini" data-hear="${ev}" aria-label="${t('snd_try')}">▶</button></div>`).join('')}</div>
    <div class="card"><b>🎵 ${t('snd_music')}</b>${segHTML('music', [['off', t('off')], ['chill', t('mus_chill')], ['focus', t('mus_focus')], ['power', t('mus_power')]], SET.music)}
      <small>${t('snd_music_note')}</small></div>
    <div class="card"><b>${t('snd_try')}</b><div class="grid2" style="margin-top:8px">
      <button class="btn ghost small" data-try="go">⏱ ${t('try_rest')}</button><button class="btn ghost small" data-try="finish">🏁 ${t('try_done')}</button>
      <button class="btn ghost small" data-try="voice">🗣 ${t('try_voice')}</button><button class="btn ghost small" data-try="music">🎵 ${t('try_music')}</button></div></div>
    <div class="card"><b>${t('danger')}</b><button class="btn ghost" id="wipe" style="margin-top:8px">${t('clear_all')}</button></div>
    <small class="note">PieFit · ${t('offline_note')}</small>`;
  $('#back').onclick = () => go('more');
  on('[data-lang]', el => { SET.lang = el.dataset.lang; persist(); render(); });
  on('[data-exp]', el => { SET.exp = el.dataset.exp; persist(); render(); });
  on('[data-mode]', el => { SET.mode = el.dataset.mode; persist(); render(); });
  on('[data-gt]', el => { TG.type = el.dataset.gt; persist(); render(); });
  on('[data-sound]', el => { SET.sound = el.dataset.sound === '1'; persist(); render(); });
  on('[data-vol]', el => { SET.vol = +el.dataset.vol; persist(); Sound.play('log'); render(); });
  on('[data-voice]', el => { SET.voice = el.dataset.voice === '1'; persist(); render(); });
  on('[data-theme]', el => { Object.assign(SET.sfx, Sound.THEMES[el.dataset.theme]); persist(); Sound.play('finish'); render(); });
  app.querySelectorAll('[data-sfx]').forEach(sel => sel.onchange = () => { SET.sfx[sel.dataset.sfx] = sel.value; persist(); Sound.play(sel.dataset.sfx); render(); });
  on('[data-hear]', el => Sound.play(el.dataset.hear));
  on('[data-wake]', el => { SET.wake = el.dataset.wake === '1'; persist(); render(); });
  on('[data-vlang]', el => { SET.voiceLang = el.dataset.vlang; persist(); Sound.say(tv('v_go', tv('set_n', 2))); render(); });
  on('[data-vib]', el => { SET.vib = el.dataset.vib === '1'; persist(); Sound.vibrate(150); render(); });
  on('[data-music]', el => { SET.music = el.dataset.music; persist(); if(Sound.musicOn()) Sound.stopMusic(); render(); });
  on('[data-try]', el => {
    const k = el.dataset.try;
    if(k === 'go'){ Sound.play('go'); Sound.vibrate([250, 120, 250]); }
    else if(k === 'finish') Sound.play('finish');
    else if(k === 'voice') Sound.say(tv('v_go', tv('set_n', 2)));
    else if(Sound.musicOn()) Sound.stopMusic();
    else { Sound.startMusic(SET.music === 'off' ? 'focus' : SET.music); setTimeout(() => Sound.stopMusic(), 12000); }
  });
  $('#wipe').onclick = () => {
    if(!confirm(t('clear_confirm'))) return;
    LOG = []; MASTERED = {}; NEWS = []; CAL = {}; ACTIVE = null; store.set('active', null); persist(); toast(t('cleared')); render();
  };
}
function exportData(){
  const data = {app:'piefit', version:2, exported:new Date().toISOString(), log:LOG, mastered:MASTERED, news:NEWS, targets:TG, cal:CAL, settings:SET};
  const blob = new Blob([JSON.stringify(data)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'piefit-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  toast(t('exported'));
}
function importData(file){
  const r = new FileReader();
  r.onload = () => {
    let d; try { d = JSON.parse(r.result); } catch(e){ d = null; }
    if(!d || !['piefit','ringfit'].includes(d.app) || !Array.isArray(d.log)) return alert(t('import_bad'));
    if(!confirm(t('import_confirm', d.log.length))) return;
    LOG = d.log.filter(l => l && typeof l.ex === 'string' && typeof l.t === 'number' && typeof l.reps === 'number')
      .map((l, i) => { const o = {id: typeof l.id === 'string' ? l.id : l.t + '-' + i, t:l.t, sess:String(l.sess || ''), ex:l.ex, reps:l.reps};
        if(typeof l.w === 'number') o.w = l.w; if(l.cal) o.cal = true; return o; });
    MASTERED = isObj(d.mastered) ? d.mastered : {};
    NEWS = Array.isArray(d.news) ? d.news.filter(n => typeof n === 'string' || isObj(n)) : [];
    if(isObj(d.targets)){ TG = {type: BASE_TARGET[d.targets.type] ? d.targets.type : 'general', custom: isObj(d.targets.custom) ? d.targets.custom : {}}; }
    CAL = isObj(d.cal) ? d.cal : {};
    if(isObj(d.settings)) Object.keys(SET_DEFAULT).forEach(k => { if(typeof d.settings[k] === typeof SET_DEFAULT[k]) SET[k] = d.settings[k]; });
    const ev = Sound.events(); SET.sfx = Object.assign({}, SET_DEFAULT.sfx);
    if(isObj(d.settings) && isObj(d.settings.sfx)) Object.keys(ev).forEach(k => { if(ev[k].includes(d.settings.sfx[k])) SET.sfx[k] = d.settings.sfx[k]; });
    SET.onboarded = true;
    persist(); toast(t('import_ok')); go('home');
  };
  r.readAsText(file);
}

/* ================= boot ================= */
loadState();
render();
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
