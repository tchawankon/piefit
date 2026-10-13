'use strict';
/* PieFit coach: readiness check-in, weekly plan, time budget + supersets, warm-up / cool-down,
   plateau + deload detection, weekly review, goals, limitations, local insights and the optional AI coach.
   Loaded before app.js; everything here runs at call time and uses app.js globals (EX, LOG, t, ...). */
const Coach = (() => {
  let PROF, CHECKS, GOALS, CHAT;
  const WEEK_DEFAULT = () => Array.from({length:7}, () => ({on:false, venue:'rings', min:45}));
  function load(){
    const p = store.get('profile', {});
    PROF = Object.assign({limits:[], week:WEEK_DEFAULT(), warm:true, cool:true, deloadUntil:0, lastDeload:0, aiOn:false}, isObj(p) ? p : {});
    if(!Array.isArray(PROF.week) || PROF.week.length !== 7) PROF.week = WEEK_DEFAULT();
    if(!Array.isArray(PROF.limits)) PROF.limits = [];
    CHECKS = Array.isArray(store.get('checks')) ? store.get('checks') : [];
    GOALS = Array.isArray(store.get('goals')) ? store.get('goals') : [];
    CHAT = Array.isArray(store.get('chat')) ? store.get('chat') : [];
  }
  function save(){ store.set('profile', PROF); store.set('checks', CHECKS.slice(-120)); store.set('goals', GOALS); store.set('chat', CHAT.slice(-40)); }
  const H = 3600e3;

  /* ---------- limitations / pain: which exercises stress which joint ---------- */
  const AREAS = ['shoulder','elbow','wrist','lowerback','knee','hip'];
  const STRESS = {
    shoulder: {ids:['dip','bardip','rtosupport','germanhang','skincat','tuckback','muscleup','flye','handstand','pike','bbohp','planchelean','frontlever','tucklever','support','lsit','tucksit'], pats:['vpush','lateral']},
    elbow:    {ids:['tricep','dbtriext','trxtricep','bardip','dip','muscleup','pushdown','diamond','curl','trxcurl'], pats:['biceps','triceps']},
    wrist:    {ids:['handstand','planchelean','pikefloor','diamond','falsegrip','wheelstand','floorpush','bbbench','support','rtosupport','lsit','tucksit'], pats:[]},
    lowerback:{ids:['wheelstand','bbrow','rdl','bbsquat','frontlever','wheelknee','fallout','trxfallout','hipthrust'], pats:['hinge']},
    knee:     {ids:['dbsplit','split','trxlunge','revlunge','legext','bbsquat'], pats:['squat','lunge','legext']},
    hip:      {ids:[], pats:['hinge','lunge']}
  };
  // strict = today's pain (avoid everything that loads the area); otherwise a long-term limitation (avoid the risky ones)
  function stresses(id, areas, strict){
    const x = EX[id];
    return areas.some(a => STRESS[a] && (STRESS[a].ids.includes(id) || (strict && STRESS[a].pats.includes(x.pat))));
  }
  function applyLimits(list, venue, areas, strict){
    areas = areas || PROF.limits; const out = [], changes = [];
    if(!areas.length) return {list:list.slice(), changes};
    list.forEach(id => {
      if(!stresses(id, areas, strict)){ if(!out.includes(id)) out.push(id); return; }
      const unlocked = a => SET.mode !== 'beginner' || !gated(a) || stepState(a) !== 'locked';
      const alt = alternatives(id).find(a => atVenue(EX[a], venue) && !stresses(a, areas, strict) && unlocked(a) && !out.includes(a) && !list.includes(a));
      changes.push([id, alt || null]);
      if(alt) out.push(alt);
    });
    return {list:out, changes};
  }
  const areaNames = areas => areas.map(a => t('ar_' + a)).join(', ');

  /* ---------- readiness check-in ---------- */
  function levelOf(c){ const s = c.sleep + c.energy + c.sore; return s <= 2 ? 'low' : s >= 5 ? 'high' : 'normal'; }
  function checkIn(done){
    const c = {sleep:1, energy:1, sore:1, pain:[]};
    const o = document.createElement('div'); o.className = 'modal';
    const q = (k, opts) => `<div class="lbl-sm" style="margin-top:12px">${t('ck_' + k)}</div>
      <div class="seg">${opts.map((l, v) => `<button data-q="${k}" data-v="${v}" class="${c[k] === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    const draw = () => {
      o.innerHTML = `<div class="sheet"><h3>${t('ck_title')}</h3><p class="sub">${t('ck_sub')}</p>
        ${q('sleep', [t('ck_sleep0'), t('ck_sleep1'), t('ck_sleep2')])}
        ${q('energy', [t('ck_en0'), t('ck_en1'), t('ck_en2')])}
        ${q('sore', [t('ck_so0'), t('ck_so1'), t('ck_so2')])}
        <div class="lbl-sm" style="margin-top:12px">${t('ck_pain')}</div>
        <div class="chips">${AREAS.map(a => `<button class="chip ${c.pain.includes(a) ? 'on' : ''}" data-pain="${a}">${t('ar_' + a)}</button>`).join('')}</div>
        <button class="btn" data-ok style="margin-top:16px">${t('ck_go')}</button>
        <button class="btn ghost" data-skip style="margin-top:8px">${t('ck_skip')}</button></div>`;
      o.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { c[b.dataset.q] = +b.dataset.v; draw(); });
      o.querySelectorAll('[data-pain]').forEach(b => b.onclick = () => { const a = b.dataset.pain; c.pain = c.pain.includes(a) ? c.pain.filter(x => x !== a) : c.pain.concat(a); draw(); });
      o.querySelector('[data-ok]').onclick = () => { o.remove(); const r = Object.assign({t:Date.now()}, c); r.level = levelOf(r); CHECKS.push(r); save(); done(r); };
      o.querySelector('[data-skip]').onclick = () => { o.remove(); done(null); };
    };
    draw(); document.body.appendChild(o);
  }
  const deloadOn = () => PROF.deloadUntil > Date.now();
  // how today's workout is scaled: fewer sets and lighter weights on a low day or a deload week
  function dayMod(ready){
    if(deloadOn()) return {sets:2, wMul:.85, tag:'deload'};
    if(ready && ready.level === 'low') return {sets:2, wMul:.9, tag:'low'};
    return {sets:SETS, wMul:1, tag:ready && ready.level === 'high' ? 'high' : ''};
  }

  /* ---------- time budget and supersets ---------- */
  const PUSH = ['hpush','vpush','triceps','lateral'], PULL = ['hpull','vpull','biceps','reardelt'];
  const LOWA = ['squat','lunge','legext'], LOWB = ['hinge','legcurl','hipext','calf'];
  function partnerOK(a, b){
    const pa = EX[a].pat, pb = EX[b].pat;
    if(EX[a].hold || EX[b].hold || !pa || !pb) return false;
    return (PUSH.includes(pa) && PULL.includes(pb)) || (PULL.includes(pa) && PUSH.includes(pb))
      || (LOWA.includes(pa) && LOWB.includes(pb)) || (LOWB.includes(pa) && LOWA.includes(pb));
  }
  function workSec(x){ const [lo, hi] = range(x); return x.hold ? hi : lo * 3.5; }
  function estimate(list, sets, pairs){
    let s = 0;
    list.forEach((id, i) => {
      const x = EX[id], m = pairs[i];
      if(m != null && m < i) return; // counted with its partner
      if(m != null){ const y = EX[list[m]]; s += sets * (workSec(x) + 20 + workSec(y)) + (sets - 1) * Math.max(restFor(x), restFor(y)) + 90; }
      else s += sets * workSec(x) + (sets - 1) * restFor(x) + 60;
    });
    return Math.round(s / 60);
  }
  function makePairs(list){
    const out = [], used = new Set(), pairs = {};
    list.forEach(id => {
      if(used.has(id)) return; used.add(id);
      const mate = list.find(o => !used.has(o) && partnerOK(id, o));
      if(mate){ used.add(mate); pairs[out.length] = out.length + 1; pairs[out.length + 1] = out.length; out.push(id, mate); }
      else out.push(id);
    });
    return {list:out, pairs};
  }
  function extraMin(){ return (PROF.warm ? 5 : 0) + (PROF.cool ? 4 : 0); }
  // fit a session into a time budget: supersets first, then 2 sets, then drop the lowest-priority exercises
  function fit(list, minutes, sets0){
    sets0 = sets0 || SETS;
    const base = {list:list.slice(), sets:sets0, pairs:{}, est:estimate(list, sets0, {}) + extraMin(), changed:[]};
    if(!minutes || base.est <= minutes) return base;
    const budget = Math.max(5, minutes - extraMin());
    let p = makePairs(list), sets = sets0, cur = p.list.slice(), pairs = p.pairs, changed = ['superset'];
    if(estimate(cur, sets, pairs) > budget && sets > 2){ sets = 2; changed.push('sets'); }
    while(estimate(cur, sets, pairs) > budget && cur.length > 2){
      // drop the lowest-priority exercise, preferring ones that are not part of a superset
      const idx = cur.map((id, i) => i), loose = idx.filter(i => pairs[i] == null), pool = loose.length ? loose : idx;
      const worst = pool.reduce((w, i) => rank(cur[i]) >= rank(cur[w]) ? i : w, pool[0]);
      cur.splice(worst, 1); p = makePairs(cur); cur = p.list; pairs = p.pairs;
      if(!changed.includes('drop')) changed.push('drop');
    }
    if(!Object.keys(pairs).length) changed = changed.filter(c => c !== 'superset');
    return {list:cur, sets, pairs, est:estimate(cur, sets, pairs) + extraMin(), changed};
  }

  /* ---------- weekly plan ---------- */
  function weekStart(ts){ const d = new Date(ts || Date.now()); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); }
  const dowIdx = ts => (new Date(ts).getDay() + 6) % 7; // Monday = 0
  function rotation(n){
    if(n <= 0) return [];
    if(n === 1) return ['full'];
    if(n === 2) return ['full','full'];
    if(n === 3) return SET.exp === 'new' ? ['full','full','full'] : ['push','pull','legs'];
    if(n === 4) return ['push','pull','legs','full'];
    if(n === 5) return ['push','pull','legs','push','pull'];
    return ['push','pull','legs','push','pull','legs'].concat(n > 6 ? ['auto'] : []);
  }
  // workouts = distinct (day, session) pairs, calibration excluded
  function workoutsSince(ts){
    const seen = new Map();
    LOG.filter(l => l.t >= ts && !l.cal && l.sess && l.sess !== 'cal').forEach(l => {
      const k = dayKey(l.t) + '|' + l.sess; if(!seen.has(k)) seen.set(k, {t:l.t, sess:l.sess, day:dowIdx(l.t)});
    });
    return [...seen.values()];
  }
  const planOn = () => PROF.week.some(d => d.on);
  function planToday(){
    if(!planOn()) return null;
    const ws = weekStart(), now = Date.now(), today = dowIdx(now), days = PROF.week.map((d, i) => ({...d, i})).filter(d => d.on);
    const rot = rotation(days.length), done = workoutsSince(ws);
    const left = {}; done.forEach(w => { left[w.sess] = (left[w.sess] || 0) + 1; });
    const status = rot.map(s => { if(left[s] > 0){ left[s]--; return true; } return false; });
    const nextIdx = status.indexOf(false), next = nextIdx >= 0 ? rot[nextIdx] : null;
    const plannedBefore = days.filter(d => d.i < today).length, doneCount = done.length;
    const todayCfg = PROF.week[today], trainedToday = done.some(w => w.day === today);
    const strip = PROF.week.map((d, i) => ({on:d.on, venue:d.venue, done:done.some(w => w.day === i), today:i === today}));
    return {next, venue: todayCfg.on ? todayCfg.venue : SET.venue, min: todayCfg.on ? todayCfg.min : 45,
      trainDay: todayCfg.on, trainedToday, missed: Math.max(0, plannedBefore - doneCount), strip, rot, status};
  }

  /* ---------- warm-up and cool-down ---------- */
  const ST = {h:[88,22],s:[90,38],p:[90,78],k:[90,108],f:[92,134]};
  const U2 = (o) => Object.assign({}, ST, {e:[91,58], w:[93,76]}, o);
  const QUAD = {h:[132,96],s:[120,102],e:[120,118],w:[120,134],p:[70,102],k:[70,134],f:[40,134]};
  const MOVES = {
    march:     {sec:45, n:['March in place','ย่ำเท้าอยู่กับที่'], d:['Lift the knees, swing the arms, breathe','ยกเข่าสูง แกว่งแขน หายใจสม่ำเสมอ'],
      anim:{A:U2({e:[96,56],w:[102,70],k:[106,94],f:[104,118],k2:[90,108],f2:[92,134]}), B:U2({e:[84,56],w:[82,72],k2:[106,94],f2:[104,118]})}},
    armcircle: {sec:30, n:['Arm circles','หมุนแขน'], d:['Big slow circles forward, then backward','หมุนแขนวงกว้างช้าๆ ไปข้างหน้า แล้วกลับหลัง'],
      anim:{A:U2({e:[91,20],w:[92,4]}), B:U2({e:[108,44],w:[124,52]}), C:U2({e:[91,58],w:[93,76]})}},
    scap:      {reps:10, n:['Scapular push-ups','Scap push-up'], d:['Plank on straight arms, let the chest sink between the shoulder blades, then push the floor away','แพลงก์แขนเหยียด ปล่อยอกยุบลงระหว่างสะบัก แล้วดันพื้นออก'],
      anim:{A:{h:[142,94],s:[128,100],e:[129,116],w:[130,132],p:[74,116],k:[47,124],f:[20,132]}, B:{h:[142,99],s:[128,105],e:[129,118],w:[130,132],p:[74,118],k:[47,125],f:[20,132]}}},
    wrist:     {sec:30, n:['Wrist rocks','วอร์มข้อมือ'], d:['On hands and knees, rock forward over the hands and back','คุกเข่าวางมือ โยกตัวไปข้างหน้าเหนือมือแล้วกลับ'],
      anim:{A:QUAD, B:Object.assign({}, QUAD, {s:[130,104],e:[126,119],h:[142,98],p:[80,104]})}},
    scappull:  {reps:8, n:['Scapular pulls','Scap pull'], d:['Hang with straight arms, pull the shoulders down and back without bending the elbows','ห้อยแขนเหยียด ดึงไหล่ลงและไปข้างหลังโดยไม่งอศอก'], animOf:'deadhang'},
    legswing:  {sec:30, n:['Leg swings','เหวี่ยงขา'], d:['Hold something for balance, swing each leg forward and back','จับอะไรไว้ทรงตัว เหวี่ยงขาไปหน้าและหลังทีละข้าง'],
      anim:{A:U2({k2:[104,104],f2:[118,126]}), B:U2({k2:[80,104],f2:[66,126]})}},
    hipcircle: {sec:30, n:['Hip circles','หมุนสะโพก'], d:['Hands on hips, draw big circles with the hips','มือเท้าเอว หมุนสะโพกเป็นวงกว้าง'],
      anim:{A:U2({p:[96,78],s:[88,38]}), B:U2({p:[84,78],s:[92,38]})}},
    bwsq:      {reps:10, n:['Easy squats','Squat เบาๆ'], d:['Slow bodyweight squats, as deep as is comfortable','squat น้ำหนักตัวช้าๆ ลึกเท่าที่สบาย'], animOf:'bwsquat'},
    catcow:    {sec:30, n:['Cat-cow','Cat-cow'], d:['On hands and knees, round the back then arch it, slowly','คุกเข่าวางมือ โก่งหลังแล้วแอ่นหลังช้าๆ'],
      anim:{A:Object.assign({}, QUAD, {h:[134,88]}), B:Object.assign({}, QUAD, {h:[128,112],s:[120,96]})}},
    ramp:      {reps:8, n:['Ramp-up set','เซ็ตวอร์มน้ำหนัก'], d:['One light set of your first lift at about half the weight','ทำท่าแรกของวันด้วยน้ำหนักประมาณครึ่งหนึ่ง 1 เซ็ต']},
    chest:     {sec:30, n:['Chest stretch','ยืดอก'], d:['Arm on a wall or door frame, turn the body away gently. Both sides','วางแขนกับกำแพงหรือวงกบประตู หมุนตัวออกเบาๆ ทำทั้งสองข้าง'],
      anim:{A:U2({e:[108,40],w:[124,40]}), B:U2({e:[74,40],w:[58,40]})}},
    lats:      {sec:30, n:["Child's pose reach",'ท่าเด็ก ยืดปีก'], d:['Kneel, sit back on the heels, reach the arms far forward','คุกเข่า นั่งบนส้นเท้า ยื่นแขนไปข้างหน้าให้ไกล'],
      anim:{A:{h:[118,116],s:[106,116],e:[126,124],w:[146,128],p:[62,116],k:[80,132],f:[46,134]}, B:{h:[124,120],s:[110,120],e:[132,126],w:[154,130],p:[60,118],k:[80,132],f:[46,134]}}},
    hams:      {sec:30, n:['Hamstring stretch','ยืดต้นขาหลัง'], d:['Soft knees, hinge forward and let the arms hang','งอเข่าเล็กน้อย พับตัวไปข้างหน้า ปล่อยแขนห้อย'],
      anim:{A:U2({}), B:{h:[124,74],s:[110,70],e:[110,92],w:[112,114],p:[80,76],k:[84,106],f:[90,134]}}},
    quads:     {sec:30, n:['Quad stretch','ยืดต้นขาหน้า'], d:['Stand tall, pull one heel toward the glutes. Both sides','ยืนตรง ดึงส้นเท้าหาก้นทีละข้าง'],
      anim:{A:U2({}), B:U2({e:[82,64],w:[76,84],k2:[88,108],f2:[74,86]})}},
    hipflex:   {sec:30, n:['Hip flexor stretch','ยืดสะโพกหน้า'], d:['Half-kneeling lunge, squeeze the glute of the back leg, push the hips forward','ท่าลันจ์คุกเข่าข้างเดียว บีบก้นขาหลัง ดันสะโพกไปข้างหน้า'], animOf:'revlunge'},
    breathe:   {sec:60, n:['Slow breathing','หายใจช้าๆ'], d:['In through the nose for 4, out for 6. Let the heart rate come down','หายใจเข้าทางจมูก 4 วินาที ออก 6 วินาที ให้ชีพจรลดลง'],
      anim:{A:U2({}), B:U2({h:[88,20],s:[90,36]})}}
  };
  const moveAnim = m => m.anim || (m.animOf && EX[m.animOf] && EX[m.animOf].anim) || null;
  const has = (list, pats) => list.some(id => pats.includes(EX[id].pat) || (pats.includes('hold') && EX[id].hold));
  function warmup(list){
    const s = ['march', 'armcircle'];
    if(has(list, ['hpush','vpush','triceps','hold'])) s.push('scap', 'wrist');
    if(has(list, ['vpull','hpull','biceps','reardelt']) && list.some(id => ['rings','bar','trx'].includes(eqOf(EX[id])))) s.push('scappull');
    if(has(list, ['squat','lunge','hinge','legcurl','hipext','calf','legext'])) s.push('legswing', 'hipcircle', 'bwsq');
    if(has(list, ['core'])) s.push('catcow');
    if(list.some(id => EX[id].load)) s.push('ramp');
    return s;
  }
  function cooldown(list){
    const s = [];
    if(has(list, ['hpush','vpush','triceps'])) s.push('chest');
    if(has(list, ['vpull','hpull','biceps','reardelt'])) s.push('lats');
    if(has(list, ['hinge','legcurl','squat','lunge'])) s.push('hams', 'quads', 'hipflex');
    s.push('breathe');
    return s;
  }
  const L = pair => SET.lang === 'th' ? pair[1] : pair[0];
  function routineView(){
    const v = view, id = v.steps[v.i], m = MOVES[id];
    if(!m){ return v.after(); }
    const anim = moveAnim(m);
    app.innerHTML = `<div class="runbar"><button class="chip" id="rskip">${t('rt_skip')}</button>
        <div class="track grow"><div class="fill" style="width:${v.i / v.steps.length * 100}%"></div></div><small>${v.i + 1}/${v.steps.length}</small></div>
      <div class="lbl-sm">${v.kind === 'warm' ? '🔥 ' + t('rt_warm') : '🧘 ' + t('rt_cool')}</div>
      <h1>${L(m.n)}</h1>${anim ? figSVG('figure') : ''}
      <p>${L(m.d)}</p>
      <div class="card center">${m.sec ? `<b class="bigtime" id="rt">${fmtTime(m.sec)}</b>` : `<b class="bigtime">× ${m.reps}</b>`}
        <button class="btn" id="rgo">${m.sec ? '▶ ' + t('rt_start') : '✓ ' + t('rt_done')}</button></div>
      <div class="row gap"><button class="btn ghost" id="rprev" ${v.i === 0 ? 'disabled' : ''}>← ${t('prev')}</button><button class="btn ghost" id="rnext">${t('next')} →</button></div>`;
    if(anim) startAnim(document.getElementById('figure'), anim);
    const next = () => { if(v.iv) clearInterval(v.iv); v.iv = null; v.i++; if(v.i >= v.steps.length) v.after(); else { render(); window.scrollTo(0, 0); } };
    $('#rnext').onclick = next;
    $('#rprev').onclick = () => { if(v.iv) clearInterval(v.iv); v.iv = null; v.i--; render(); };
    $('#rskip').onclick = () => { if(v.iv) clearInterval(v.iv); v.iv = null; v.after(); };
    $('#rgo').onclick = () => {
      if(!m.sec) return next();
      if(v.iv) return;
      const end = Date.now() + m.sec * 1000; let last = m.sec; Sound.play('log');
      $('#rgo').textContent = '⏭ ' + t('next');
      $('#rgo').onclick = next;
      v.iv = setInterval(() => {
        const n = Math.ceil((end - Date.now()) / 1000);
        if(n !== last){ last = n; const el = document.getElementById('rt'); if(el) el.textContent = fmtTime(Math.max(0, n)); if(n > 0 && n <= 3) Sound.play('tick'); }
        if(n <= 0){ Sound.play('go'); Sound.vibrate(150); next(); }
      }, 200);
    };
  }
  function startRoutine(kind, steps, after){
    view = {name:'routine', kind, steps, i:0, after};
    render(); window.scrollTo(0, 0);
  }

  /* ---------- plateau, deload, review, insights ---------- */
  const score = l => EX[l.ex] && EX[l.ex].load ? e1rm(l.w || 0, l.reps) : l.reps;
  function plateau(id){
    const ss = sessionsOf(id).map(d => Math.max(...d.sets.map(score)));
    if(ss.length < 4) return false;
    const before = Math.max(...ss.slice(0, -3)), last3 = Math.max(...ss.slice(-3));
    return last3 <= before;
  }
  function weeksInARow(){
    let n = 0, ws = weekStart();
    for(let k = 1; k < 30; k++){ // count back from last complete week
      const a = ws - k*7*DAY, b = a + 7*DAY, days = new Set(LOG.filter(l => l.t >= a && l.t < b && !l.cal).map(l => dayKey(l.t)));
      if(days.size >= 2) n++; else break;
    }
    return n;
  }
  function deloadAdvice(){
    if(deloadOn()) return null;
    const recentDeload = PROF.lastDeload && Date.now() - PROF.lastDeload < 35*DAY;
    if(recentDeload) return null;
    const lowDays = CHECKS.filter(c => c.t > Date.now() - 7*DAY && c.level === 'low').length;
    const stalled = [...new Set(LOG.filter(l => l.t > Date.now() - 21*DAY && !l.cal).map(l => l.ex))].filter(plateau).length;
    const weeks = weeksInARow();
    if(weeks >= 5) return t('dl_weeks', weeks);
    if(lowDays >= 2) return t('dl_tired');
    if(stalled >= 3) return t('dl_stall', stalled);
    return null;
  }
  function startDeload(){ PROF.deloadUntil = Date.now() + 7*DAY; PROF.lastDeload = Date.now(); save(); }
  function stopDeload(){ PROF.deloadUntil = 0; save(); }
  function setsByGroup(since, until){
    const g = {push:0, pull:0};
    LOG.filter(l => l.t >= since && l.t < until && EX[l.ex]).forEach(l => {
      EX[l.ex].p.forEach(m => { if(['chest','shoulders','triceps'].includes(m)) g.push++; if(['lats','upperback','biceps'].includes(m)) g.pull++; });
    });
    return g;
  }
  function review(){
    const now = Date.now(), a = now - 7*DAY, b = now - 14*DAY;
    const cur = LOG.filter(l => l.t >= a), prev = LOG.filter(l => l.t >= b && l.t < a);
    const stat = ls => ({workouts: new Set(ls.filter(l => !l.cal).map(l => dayKey(l.t) + l.sess)).size, sets: ls.length,
      vol: Math.round(ls.reduce((s, l) => s + (l.w || 0) * l.reps, 0))});
    const prs = [...new Set(cur.map(l => l.ex))].filter(id => {
      const before = LOG.filter(l => l.ex === id && l.t < a); if(!before.length) return false;
      return Math.max(...cur.filter(l => l.ex === id).map(score)) > Math.max(...before.map(score));
    });
    const g = setsByGroup(a, now + 1), ch = CHECKS.filter(c => c.t >= a);
    const ready = ch.length ? (ch.reduce((s, c) => s + c.sleep + c.energy + c.sore, 0) / ch.length).toFixed(1) : null;
    const plan = planToday();
    return {cur:stat(cur), prev:stat(prev), prs, push:g.push, pull:g.pull, ready, checks:ch.length,
      planDone: plan ? plan.status.filter(Boolean).length : null, planTotal: plan ? plan.rot.length : null};
  }
  function insights(){
    const out = [], now = Date.now(), wk = weekSets(), r = review();
    if(deloadOn()) out.push(['🛌', t('in_deload_on', new Date(PROF.deloadUntil).toLocaleDateString())]);
    const dl = deloadAdvice(); if(dl) out.push(['🛌', dl]);
    const last = LOG.length ? Math.max(...LOG.map(l => l.t)) : 0;
    if(LOG.length && now - last > 4*DAY) out.push(['⏰', t('in_gap', Math.floor((now - last) / DAY))]);
    r.prs.slice(0, 3).forEach(id => out.push(['🏆', t('in_pr', exName(id))]));
    if(r.push + r.pull >= 12){
      if(r.push > r.pull * 1.4) out.push(['⚖️', t('in_morepull', r.push, r.pull)]);
      else if(r.pull > r.push * 1.6) out.push(['⚖️', t('in_morepush', r.push, r.pull)]);
    }
    const stalled = [...new Set(LOG.filter(l => l.t > now - 21*DAY && !l.cal).map(l => l.ex))].filter(plateau);
    stalled.slice(0, 2).forEach(id => out.push(['📉', t('in_plateau', exName(id))]));
    const wkSets = LOG.filter(l => l.t > now - 7*DAY && !l.cal && l.rpe);
    if(wkSets.length >= 9 && wkSets.filter(l => l.rpe === 4).length / wkSets.length >= .3) out.push(['🧯', t('in_failure')]);
    if(wkSets.length >= 9 && wkSets.filter(l => l.rpe === 1).length / wkSets.length >= .5) out.push(['💪', t('in_easy')]);
    const lag = byNeed(wk).filter(m => wk[m] < target(m) * .4).slice(0, 2);
    if(lag.length && dowIdx(now) >= 3) out.push(['🎯', t('in_lag', lag.map(M).join(', '))]);
    GOALS.forEach(gl => { const p = goalProgress(gl); if(p.status === 'behind') out.push(['🚩', t('in_goal_behind', exName(gl.ex))]); });
    if(r.ready != null && r.ready < 2.5 && r.checks >= 2) out.push(['😴', t('in_tired')]);
    if(!out.length) out.push(['✅', LOG.length ? t('in_good') : t('in_start')]);
    return out;
  }

  /* ---------- goals ---------- */
  function goalKind(id){ const x = EX[id]; return x.load ? 'weight' : x.hold ? 'hold' : 'reps'; }
  function goalValue(gl, since){
    const ls = LOG.filter(l => l.ex === gl.ex && (since == null || l.t >= since));
    if(!ls.length) return null;
    if(gl.kind === 'weight'){ const ok = ls.filter(l => l.reps >= (gl.reps || 1)); return ok.length ? Math.max(...ok.map(l => l.w || 0)) : 0; }
    return Math.max(...ls.map(l => l.reps));
  }
  function goalProgress(gl){
    const cur = goalValue(gl, Date.now() - 28*DAY);
    const val = cur != null ? cur : (gl.start || 0), span = gl.target - (gl.start || 0);
    const pct = span > 0 ? Math.max(0, Math.min(100, Math.round((val - (gl.start || 0)) / span * 100))) : (val >= gl.target ? 100 : 0);
    let status = 'early', eta = null;
    const days = (Date.now() - gl.t0) / DAY;
    if(val >= gl.target) status = 'done';
    else if(days >= 7 && val > (gl.start || 0)){
      const rate = (val - (gl.start || 0)) / days; eta = Date.now() + (gl.target - val) / rate * DAY;
      status = eta <= gl.deadline ? 'ontrack' : 'behind';
    } else if(days >= 14) status = 'behind';
    if(status !== 'done' && Date.now() > gl.deadline) status = 'late';
    return {val, pct, status, eta};
  }
  function goalUnit(gl){ return gl.kind === 'weight' ? ' kg × ' + (gl.reps || 1) : gl.kind === 'hold' ? 's' : ' ' + t('u_reps'); }
  function goalCard(gl, withDelete){
    const p = goalProgress(gl), x = EX[gl.ex];
    const st = {done:'✅ ' + t('gl_done'), ontrack:'🟢 ' + t('gl_ontrack'), behind:'🟠 ' + t('gl_behind'), late:'🔴 ' + t('gl_late'), early:'⏳ ' + t('gl_early')}[p.status];
    return `<div class="card"><div class="row"><b class="grow">${x ? x.name : esc(gl.ex)}</b><small>${st}</small>${withDelete ? `<button class="chip mini" data-gdel="${gl.id}">✕</button>` : ''}</div>
      <small>${t('gl_target')}: ${gl.target}${goalUnit(gl)} · ${t('gl_by')} ${new Date(gl.deadline).toLocaleDateString()}</small>
      <div class="track big"><div class="fill ${p.status === 'done' ? 'ok' : ''}" style="width:${p.pct}%"></div></div>
      <small>${t('gl_now')}: ${p.val}${goalUnit(gl)}${p.eta && p.status !== 'done' ? ' · ' + t('gl_eta', new Date(p.eta).toLocaleDateString()) : ''}</small></div>`;
  }
  function goalEditor(){
    pickExercise(t('gl_pick'), t('gl_pick_hint'), Object.keys(EX), id => {
      const kind = goalKind(id), x = EX[id];
      const o = document.createElement('div'); o.className = 'modal';
      const start = goalValue({ex:id, kind, reps:range(x)[0]}) || 0;
      const d = new Date(Date.now() + 56*DAY).toISOString().slice(0, 10);
      o.innerHTML = `<div class="sheet"><h3>${x.name}</h3><p class="sub">${t('gl_now')}: ${start}${kind === 'weight' ? ' kg' : kind === 'hold' ? 's' : ''}</p>
        <div class="lbl-sm">${kind === 'weight' ? t('gl_t_weight') : kind === 'hold' ? t('gl_t_hold') : t('gl_t_reps')}</div>
        <input class="inp" type="number" inputmode="decimal" id="gt" value="${kind === 'weight' ? Math.round((start || x.w0 || 20) * 1.15) : Math.max(start + 3, range(x)[1])}">
        ${kind === 'weight' ? `<div class="lbl-sm">${t('gl_t_wreps')}</div><input class="inp" type="number" inputmode="numeric" id="gr" value="${range(x)[0]}">` : ''}
        <div class="lbl-sm">${t('gl_deadline')}</div><input class="inp" type="date" id="gd" value="${d}">
        <button class="btn" id="gsave">${t('gl_save')}</button><button class="btn ghost" id="gx" style="margin-top:8px">${t('cancel')}</button></div>`;
      document.body.appendChild(o);
      o.querySelector('#gx').onclick = () => o.remove();
      o.querySelector('#gsave').onclick = () => {
        const tgt = parseFloat(o.querySelector('#gt').value), dl = new Date(o.querySelector('#gd').value).getTime();
        if(!(tgt > 0) || !(dl > Date.now())) return toast(t('gl_bad'));
        const gr = o.querySelector('#gr');
        GOALS.push({id:newId(), ex:id, kind, target:tgt, reps: gr ? Math.max(1, parseInt(gr.value) || 1) : null, deadline:dl, t0:Date.now(), start});
        save(); o.remove(); render();
      };
    });
  }
  function goalsView(box){
    box.innerHTML = `<p class="sub">${t('gl_intro')}</p>` + (GOALS.length ? GOALS.map(g => goalCard(g, true)).join('') : `<div class="card"><small>${t('gl_none')}</small></div>`) +
      `<button class="btn" id="gadd">+ ${t('gl_add')}</button>`;
    box.querySelector('#gadd').onclick = goalEditor;
    box.querySelectorAll('[data-gdel]').forEach(b => b.onclick = () => { if(confirm(t('gl_del'))){ GOALS = GOALS.filter(g => g.id !== b.dataset.gdel); save(); render(); } });
  }
  function reviewView(box){
    const r = review(), d = (a, b) => b ? (a >= b ? '▲' : '▼') : '';
    box.innerHTML = `<div class="grid3">
        <div class="card stat"><b>${r.cur.workouts}</b><small>${t('rv_workouts')} ${d(r.cur.workouts, r.prev.workouts)}</small></div>
        <div class="card stat"><b>${r.cur.sets}</b><small>${t('sets')} ${d(r.cur.sets, r.prev.sets)}</small></div>
        <div class="card stat"><b>${r.cur.vol}</b><small>${t('volume_kg')} ${d(r.cur.vol, r.prev.vol)}</small></div></div>
      <small class="note">${t('rv_vs', r.prev.workouts, r.prev.sets, r.prev.vol)}</small>
      ${r.planTotal != null ? `<div class="card"><b>📅 ${t('rv_plan')}</b><br><small>${t('rv_plan_n', r.planDone, r.planTotal)}</small></div>` : ''}
      <div class="card"><b>⚖️ ${t('rv_balance')}</b><br><small>${t('rv_balance_n', r.push, r.pull)}</small></div>
      ${r.ready != null ? `<div class="card"><b>😴 ${t('rv_ready')}</b><br><small>${t('rv_ready_n', r.ready, r.checks)}</small></div>` : ''}
      ${r.prs.length ? `<div class="card"><b>🏆 ${t('rv_prs')}</b><div class="chips">${r.prs.map(id => `<span class="chip p">${exName(id)}</span>`).join('')}</div></div>` : ''}
      <h2>${t('rv_coach')}</h2>${insights().map(([i, s]) => `<div class="card row"><span class="emoji">${i}</span><small class="grow">${s}</small></div>`).join('')}
      ${AI.ready() ? `<button class="btn" id="askai">🤖 ${t('ai_review')}</button>` : ''}`;
    const b = box.querySelector('#askai'); if(b) b.onclick = () => go('more', {name:'coach', ask:t('ai_q_week')});
  }

  /* ---------- weekly plan & profile views ---------- */
  const DOW = () => SET.lang === 'th' ? ['จ','อ','พ','พฤ','ศ','ส','อา'] : ['Mo','Tu','We','Th','Fr','Sa','Su'];
  const VENUE_ICON = {rings:'🔘', trx:'🎗', cali:'🤸', gym:'🏋️'};
  function stripHTML(p){
    return `<div class="weekstrip">${p.strip.map((d, i) => `<div class="wd ${d.today ? 'today' : ''} ${d.done ? 'done' : ''} ${d.on ? 'on' : ''}">
      <small>${DOW()[i]}</small><span>${d.done ? '✓' : d.on ? VENUE_ICON[d.venue] : '·'}</span></div>`).join('')}</div>`;
  }
  function planView(){
    const days = PROF.week, n = days.filter(d => d.on).length, rot = rotation(n);
    app.innerHTML = `<button class="chip" id="back">← ${t('back')}</button><h1>📅 ${t('pl_title')}</h1><p class="sub">${t('pl_intro')}</p>` +
      days.map((d, i) => `<div class="card"><div class="row"><b class="grow">${DOW()[i]}</b>
        ${segHTML('don' + i, [['1', t('pl_train')], ['0', t('pl_rest')]], d.on ? '1' : '0').replace('class="seg"', 'class="seg" style="margin:0;flex:1"')}</div>
        ${d.on ? `${segHTML('dv' + i, [['rings','🔘'], ['trx','🎗'], ['cali','🤸'], ['gym','🏋️']], d.venue)}
          <div class="chips">${[20,30,45,60,90].map(m => `<button class="chip ${d.min === m ? 'on' : ''}" data-dm="${i}" data-m="${m}">${m} ${t('minutes')}</button>`).join('')}</div>` : ''}</div>`).join('') +
      `<div class="card"><b>${t('pl_rotation')}</b><div class="chips">${rot.length ? rot.map(s => `<span class="chip p">${sessionName(s)}</span>`).join('') : `<small>${t('pl_none')}</small>`}</div>
        <small>${n > 6 ? t('pl_toomany') : t('pl_rot_note')}</small></div>`;
    $('#back').onclick = () => go('more');
    days.forEach((d, i) => {
      on(`[data-don${i}]`, el => { d.on = el.getAttribute('data-don' + i) === '1'; save(); render(); });
      on(`[data-dv${i}]`, el => { d.venue = el.getAttribute('data-dv' + i); save(); render(); });
    });
    on('[data-dm]', el => { days[+el.dataset.dm].min = +el.dataset.m; save(); render(); });
  }
  function profileView(){
    app.innerHTML = `<button class="chip" id="back">← ${t('back')}</button><h1>🩹 ${t('pf_title')}</h1><p class="sub">${t('pf_intro')}</p>
      <div class="card"><b>${t('pf_limits')}</b><div class="chips">${AREAS.map(a => `<button class="chip ${PROF.limits.includes(a) ? 'on' : ''}" data-lim="${a}">${t('ar_' + a)}</button>`).join('')}</div>
        <small>${t('pf_limits_note')}</small></div>
      ${PROF.limits.length ? `<div class="card"><b>${t('pf_avoided')}</b><div class="chips">${Object.keys(EX).filter(id => stresses(id, PROF.limits, false)).map(id => `<span class="chip">${exName(id)}</span>`).join('')}</div></div>` : ''}
      <div class="card"><b>${t('pf_routine')}</b>
        <div class="row" style="margin-top:8px"><span class="grow">🔥 ${t('rt_warm')}</span>${segHTML('pw', [['1', t('on')], ['0', t('off')]], PROF.warm ? '1' : '0').replace('class="seg"', 'class="seg" style="margin:0;width:150px"')}</div>
        <div class="row" style="margin-top:8px"><span class="grow">🧘 ${t('rt_cool')}</span>${segHTML('pc', [['1', t('on')], ['0', t('off')]], PROF.cool ? '1' : '0').replace('class="seg"', 'class="seg" style="margin:0;width:150px"')}</div></div>
      <small class="note">${t('pf_disclaimer')}</small>`;
    $('#back').onclick = () => go('more');
    on('[data-lim]', el => { const a = el.dataset.lim; PROF.limits = PROF.limits.includes(a) ? PROF.limits.filter(x => x !== a) : PROF.limits.concat(a); save(); render(); });
    on('[data-pw]', el => { PROF.warm = el.dataset.pw === '1'; save(); render(); });
    on('[data-pc]', el => { PROF.cool = el.dataset.pc === '1'; save(); render(); });
  }

  /* ---------- AI coach (optional, Claude Haiku with the owner's own API key) ---------- */
  const AI = (() => {
    const MODEL = 'claude-haiku-5-5', SDK = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.133.0/+esm';
    let mod = null;
    const key = () => store.get('aikey', '') || '';
    const ready = () => !!(PROF.aiOn && key());
    async function sdk(){ if(!mod) mod = await import(SDK); return mod; }
    // compact training summary sent with each question (no photos, videos or the API key)
    function context(){
      const now = Date.now(), since = now - 28*DAY, wk = weekSets();
      const byEx = {};
      LOG.filter(l => l.t >= since && EX[l.ex]).forEach(l => { const d = new Date(l.t).toISOString().slice(5, 10);
        ((byEx[l.ex] = byEx[l.ex] || {})[d] = byEx[l.ex][d] || []).push(l.reps + (EX[l.ex].hold ? 's' : '') + (l.w != null ? '@' + l.w + 'kg' : '') + (l.rpe ? '/rpe' + l.rpe : '') + (l.cal ? '(test)' : '')); });
      const lines = Object.entries(byEx).map(([id, days]) => `- ${EX[id].name} [${EX[id].rx}]: ` + Object.entries(days).map(([d, s]) => d + ' ' + s.join(',')).join(' | '));
      const plan = planToday();
      return [
        `Today: ${new Date().toISOString().slice(0, 10)} (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()]})`,
        `Profile: experience=${SET.exp}, goal=${TG.type}, usual place=${SET.venue}, ring progression=${SET.mode === 'beginner' ? 'guided' : 'free'}, limitations=${PROF.limits.join(',') || 'none'}, deload=${deloadOn() ? 'active' : 'no'}`,
        plan ? `Weekly plan: ${PROF.week.map((d, i) => d.on ? DOW()[i] + ':' + d.venue + '/' + d.min + 'min' : null).filter(Boolean).join(' ')}; rotation ${plan.rot.join(',')}; done this week ${plan.status.filter(Boolean).length}/${plan.rot.length}` : 'Weekly plan: not set',
        `Weekly sets per muscle (done/target): ` + Object.keys(MUSCLES).map(m => `${m} ${wk[m]}/${target(m)}`).join(', '),
        `Mastered ring steps: ${Object.keys(MASTERED).filter(id => EX[id]).map(id => EX[id].name).join(', ') || 'none'}`,
        `Calibration tests: ` + (Object.entries(CAL).filter(([id]) => EX[id]).map(([id, c]) => `${EX[id].name} ${c.reps}${c.w != null ? '@' + c.w + 'kg' : ''}`).join(', ') || 'none'),
        `Goals: ` + (GOALS.map(g => { const p = goalProgress(g); return `${exName(g.ex)} ${g.target}${goalUnit(g)} by ${new Date(g.deadline).toISOString().slice(0, 10)} (now ${p.val}, ${p.status})`; }).join('; ') || 'none'),
        `Readiness check-ins last 7 days: ` + (CHECKS.filter(c => c.t > now - 7*DAY).map(c => `${new Date(c.t).toISOString().slice(5, 10)} ${c.level}${c.pain && c.pain.length ? ' pain:' + c.pain.join('/') : ''}`).join(', ') || 'none'),
        `Body: ` + (typeof Body !== 'undefined' ? Body.summary() : 'n/a'),
        `App insights: ` + insights().map(i => i[1]).join(' | '),
        `Sets in the last 28 days (date reps@weight/rpe, rpe 1=easy 2=ok 3=hard 4=failure):`,
        ...(lines.length ? lines : ['- none yet'])
      ].join('\n');
    }
    const SYSTEM = `You are the personal trainer inside PieFit, a workout tracker for gymnastic rings, TRX, bodyweight and gym training.
The athlete's training data is given in a context message. Base advice on that data and on mainstream, evidence-based strength training principles
(progressive overload, enough weekly volume per muscle, recovery, technique before load). Be specific: name exercises, sets, reps, weights or dates.
Keep answers short enough to read on a phone between sets: a few sentences or a short list. Reply in the language the athlete writes in (often Thai).
You are not a doctor: for sharp pain, injury or medical questions, say to stop the painful movement and see a professional, and suggest a pain-free alternative.
Do not invent numbers that are not in the data; say what is missing instead.`;
    async function ask(question, onText){
      const {default: Anthropic} = await sdk();
      const client = new Anthropic({apiKey:key(), dangerouslyAllowBrowser:true});
      const history = CHAT.slice(-10).map(m => ({role:m.role, content:m.content}));
      const messages = [{role:'user', content:'Training context:\n' + context()}, {role:'assistant', content:'Got it. I have your training data.'}, ...history, {role:'user', content:question}];
      const stream = client.messages.stream({
        model:MODEL, max_tokens:8000, system:SYSTEM, messages,
        output_config:{effort:'low'},
        cache_control:{type:'ephemeral'}
      });
      let text = '';
      stream.on('text', d => { text += d; onText(text); });
      const msg = await stream.finalMessage();
      if(msg.stop_reason === 'refusal') throw Object.assign(new Error('refusal'), {kind:'refusal'});
      if(!text) text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
      CHAT.push({role:'user', content:question, t:Date.now()}, {role:'assistant', content:text, t:Date.now()}); save();
      return text;
    }
    function errText(e){
      const A = mod && mod.default;
      if(e && e.kind === 'refusal') return t('ai_err_refusal');
      if(A && e instanceof A.AuthenticationError) return t('ai_err_key');
      if(A && e instanceof A.PermissionDeniedError) return t('ai_err_key');
      if(A && e instanceof A.RateLimitError) return t('ai_err_rate');
      if(A && e instanceof A.APIConnectionError) return t('ai_err_net');
      if(A && e instanceof A.APIError) return t('ai_err_api', e.status || '');
      return navigator.onLine === false ? t('ai_err_net') : t('ai_err_load');
    }
    const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    function view_(){
      const v = view;
      app.innerHTML = `<button class="chip" id="back">← ${t('back')}</button><h1>🤖 ${t('ai_title')}</h1>
        ${!ready() ? `<div class="card"><p class="sub" style="margin:0">${t('ai_setup')}</p>
            <input class="inp" type="password" id="akey" placeholder="sk-ant-..." autocomplete="off" style="margin-top:10px">
            <label class="row" style="margin:6px 0 10px"><input type="checkbox" id="aconsent"> <small>${t('ai_consent')}</small></label>
            <button class="btn" id="asave">${t('ai_enable')}</button></div>`
          : `<div id="chat">${CHAT.slice(-20).map(m => `<div class="msg ${m.role}">${fmt(m.content)}</div>`).join('') || `<p class="sub">${t('ai_hello')}</p>`}</div>
            <div class="chips" style="margin:8px 0">${['ai_q_week','ai_q_next','ai_q_stuck','ai_q_form'].map(k => `<button class="chip" data-aq="${k}">${t(k)}</button>`).join('')}</div>
            <div class="row gap"><textarea class="inp" id="aq" rows="2" placeholder="${t('ai_placeholder')}" style="margin:0"></textarea><button class="btn w-auto" id="asend">➤</button></div>
            <small class="note">${t('ai_privacy')}</small>
            <div class="row gap"><button class="btn ghost small" id="aclear">${t('ai_clear')}</button><button class="btn ghost small" id="aoff">${t('ai_off')}</button></div>`}`;
      $('#back').onclick = () => go('more');
      if(!ready()){
        $('#asave').onclick = () => {
          const k = $('#akey').value.trim();
          if(!k.startsWith('sk-ant-')) return toast(t('ai_badkey'));
          if(!$('#aconsent').checked) return toast(t('ai_need_consent'));
          store.set('aikey', k); PROF.aiOn = true; save(); render();
        };
        return;
      }
      const chat = $('#chat'); chat.scrollTop = chat.scrollHeight;
      const send = async q => {
        q = (q || '').trim(); if(!q || v.busy) return; v.busy = true;
        chat.insertAdjacentHTML('beforeend', `<div class="msg user">${fmt(q)}</div><div class="msg assistant" id="live">…</div>`);
        const live = $('#live'); window.scrollTo(0, document.body.scrollHeight);
        try { await ask(q, s => { live.innerHTML = fmt(s); }); live.removeAttribute('id'); }
        catch(e){ live.innerHTML = '⚠ ' + errText(e); live.removeAttribute('id'); }
        v.busy = false;
      };
      $('#asend').onclick = () => { const q = $('#aq').value; $('#aq').value = ''; send(q); };
      on('[data-aq]', el => send(t(el.dataset.aq)));
      $('#aclear').onclick = () => { CHAT = []; save(); render(); };
      $('#aoff').onclick = () => { if(confirm(t('ai_off_confirm'))){ store.set('aikey', ''); PROF.aiOn = false; save(); render(); } };
      if(v.ask){ const q = v.ask; v.ask = null; send(q); }
    }
    return {ready, view:view_, context};
  })();

  /* ---------- export / import ---------- */
  function exportState(){ return {profile:Object.assign({}, PROF, {aiOn:false}), checks:CHECKS, goals:GOALS}; }
  function importState(d){
    if(isObj(d.profile)){ const p = d.profile; PROF = Object.assign({}, PROF, p, {aiOn:PROF.aiOn}); if(!Array.isArray(PROF.week) || PROF.week.length !== 7) PROF.week = WEEK_DEFAULT(); if(!Array.isArray(PROF.limits)) PROF.limits = []; PROF.limits = PROF.limits.filter(a => AREAS.includes(a)); }
    if(Array.isArray(d.checks)) CHECKS = d.checks.filter(isObj);
    if(Array.isArray(d.goals)) GOALS = d.goals.filter(g => isObj(g) && typeof g.ex === 'string' && typeof g.target === 'number');
    save();
  }

  return {load, save, get prof(){ return PROF; }, get goals(){ return GOALS; },
    AREAS, stresses, applyLimits, areaNames, checkIn, dayMod, deloadOn, fit, estimate, planToday, stripHTML, rotation,
    warmup, cooldown, routineView, startRoutine, plateau, deloadAdvice, startDeload, stopDeload, review, insights,
    goalCard, goalProgress, goalsView, reviewView, planView, profileView, AI, exportState, importState, planOn};
})();
