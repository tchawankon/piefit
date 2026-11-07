'use strict';
/* PieFit Habits: Daily health & fitness checklist, InBody integration, BMR & TDEE calculator,
   and daily streaks. Loaded before app.js; operates using PieFit globals (store, t, Body, LOG). */
const Habits = (() => {
  const KEY_CFG = 'habits_cfg';
  const KEY_LOGS = 'habits_logs';
  const KEY_INBODY = 'habits_inbody';

  const DEFAULT_CFG = {
    gender: 'm',        // 'm' | 'f'
    age: 28,
    height: 175,        // cm
    weight: 70,         // kg (fallback if Body has no entries)
    activity: 1.55,     // 1.2: Sedentary, 1.375: Light, 1.55: Moderate, 1.725: Heavy
    goal: 'maintain',   // 'cut' (-400 kcal) | 'maintain' (0) | 'bulk' (+250 kcal)

    // InBody specific
    useInBody: false,
    inbodyBmr: null,      // BMR directly from InBody printout (kcal)
    inbodyFat: null,      // Body fat %
    inbodySmm: null,      // Skeletal Muscle Mass (kg)
    inbodyLbm: null,      // Lean Body Mass / Fat-Free Mass (kg)
    inbodyVisceral: null, // Visceral fat level (1-20)

    // Targets (auto-calculated or manually overridden)
    waterTarget: 2500,    // ml
    proteinTarget: 130,   // g
    sleepTarget: 7.5,     // hours
    stepsTarget: 8000,    // steps
    calorieTarget: 2200,  // kcal
    bmr: 1650,
    tdee: 2550
  };

  let CFG = Object.assign({}, DEFAULT_CFG);
  let LOGS = {};      // { 'YYYY-MM-DD': { workout, workoutMode, water, proteinDone, proteinGrams, sleepHours, sleepDone, steps, stepsDone } }
  let INBODY_HIST = []; // [ { t, bmr, bodyFat, smm, lbm, visceral, weight } ]

  const todayIso = () => {
    return dateKey(new Date());
  };

  const dateKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const rerender = () => { if (typeof render === 'function') render(); };
  const isThLang = () => typeof SET !== 'undefined' && SET.lang === 'th';

  // One source of truth for "which habits are done" (card, week strip and streak all use it)
  function doneFlags(log) {
    log = log || {};
    return {
      workout: !!log.workout,
      water: (log.water || 0) >= (CFG.waterTarget || 2500),
      protein: !!log.proteinDone,
      sleep: !!log.sleepDone,
      steps: !!log.stepsDone || (log.steps || 0) >= (CFG.stepsTarget || 8000)
    };
  }
  const doneCountOf = log => Object.values(doneFlags(log)).filter(Boolean).length;

  // The weight logged in the Body tab is the source of truth; CFG.weight is only a fallback
  function bodyWeight() {
    const e = (typeof Body !== 'undefined' && Body.latestWeight) ? Body.latestWeight() : null;
    return e ? e.weight : null;
  }
  const latestWeight = () => bodyWeight() || CFG.weight || 70;

  function calculate(cfg) {
    const w = cfg.weight > 0 ? cfg.weight : latestWeight();
    const h = cfg.height || 175;
    const a = cfg.age || 28;
    const g = cfg.gender || 'm';
    const act = Number(cfg.activity) || 1.55;

    let bmr = 0;
    let bmrSource = 'Mifflin-St Jeor';

    if (cfg.useInBody && Number(cfg.inbodyBmr) > 500) {
      bmr = Math.round(Number(cfg.inbodyBmr));
      bmrSource = 'InBody Device';
    } else if (cfg.useInBody && (Number(cfg.inbodyLbm) > 20 || (Number(cfg.inbodyFat) > 3 && w > 0))) {
      const lbm = Number(cfg.inbodyLbm) > 20 ? Number(cfg.inbodyLbm) : (w * (1 - Number(cfg.inbodyFat) / 100));
      bmr = Math.round(370 + 21.6 * lbm);
      bmrSource = `Katch-McArdle (LBM ${lbm.toFixed(1)} kg)`;
    } else {
      bmr = Math.round((10 * w) + (6.25 * h) - (5 * a) + (g === 'm' ? 5 : -161));
      bmrSource = 'Mifflin-St Jeor';
    }

    const tdee = Math.round(bmr * act);
    let calTarget = tdee;
    if (cfg.goal === 'cut') calTarget = Math.max(1200, Math.round(tdee - 400));
    else if (cfg.goal === 'bulk') calTarget = Math.round(tdee + 250);

    // Protein target:
    let protTarget = Math.round(w * 1.8);
    if (cfg.useInBody && (Number(cfg.inbodyLbm) > 20 || Number(cfg.inbodyFat) > 3)) {
      const lbm = Number(cfg.inbodyLbm) > 20 ? Number(cfg.inbodyLbm) : (w * (1 - Number(cfg.inbodyFat) / 100));
      protTarget = Math.round(lbm * (cfg.goal === 'cut' ? 2.4 : 2.2));
    } else if (cfg.goal === 'cut') {
      protTarget = Math.round(w * 2.0);
    }

    // Water target: 35 ml per kg, rounded to 50ml
    const waterTarget = Math.max(1500, Math.round((w * 35) / 50) * 50);

    return { bmr, bmrSource, tdee, calTarget, protTarget, waterTarget };
  }

  function load() {
    const c = store.get(KEY_CFG, null);
    if (c && typeof c === 'object') CFG = Object.assign({}, DEFAULT_CFG, c);
    const l = store.get(KEY_LOGS, null);
    if (l && typeof l === 'object') LOGS = l;
    const ib = store.get(KEY_INBODY, null);
    if (Array.isArray(ib)) INBODY_HIST = ib;

    const bw = bodyWeight();
    if (bw) CFG.weight = bw;
    applyTargets();
  }

  // Recalculate BMR / TDEE and (unless locked) the daily targets from CFG
  function applyTargets() {
    const m = calculate(CFG);
    CFG.bmr = m.bmr;
    CFG.tdee = m.tdee;
    if (!CFG.customTargets) {
      CFG.calorieTarget = m.calTarget;
      CFG.proteinTarget = m.protTarget;
      CFG.waterTarget = m.waterTarget;
    }
  }

  // Called by Body whenever a weigh-in is added, removed or imported
  function onWeight() {
    const bw = bodyWeight();
    if (bw) CFG.weight = bw;
    applyTargets();
    save();
  }

  function save() {
    store.set(KEY_CFG, CFG);
    store.set(KEY_LOGS, LOGS);
    store.set(KEY_INBODY, INBODY_HIST);
  }

  const blankLog = () => ({
    workout: false,
    workoutMode: 'full', // 'full' | 'low'
    water: 0,
    proteinDone: false,
    proteinGrams: 0,
    sleepHours: CFG.sleepTarget || 7.5,
    sleepDone: false,
    steps: 0,
    stepsDone: false
  });

  // The one rule for auto-ticking "workout" on a day: sets logged in PieFit, or an activity logged outside the app.
  // A manual un-tick (workoutOff) always wins. Returns true when it changed the log.
  function autoWorkout(k) {
    const strength = typeof LOG !== 'undefined' && Array.isArray(LOG) && LOG.some(l => dateKey(new Date(l.t)) === k);
    const actMode = typeof Activity !== 'undefined' ? Activity.dayMode(k) : null;
    if (!strength && !actMode) return false;
    const log = LOGS[k] || (k <= todayIso() ? (LOGS[k] = blankLog()) : null);
    if (!log || log.workoutOff) return false;
    const mode = strength ? 'full' : actMode; // strength in the app counts as full, as before
    if (log.workout) {
      // an auto tick may move up from quick to full when a bigger session is logged; a manual choice stays
      if (!log.workoutAuto || log.workoutMode === 'full' || mode !== 'full') return false;
      log.workoutMode = 'full';
    } else {
      log.workout = true; log.workoutMode = mode; log.workoutAuto = true;
    }
    save();
    return true;
  }

  function getToday() {
    const k = todayIso();
    if (!LOGS[k]) LOGS[k] = blankLog();
    autoWorkout(k);
    return LOGS[k];
  }

  function streakCount() {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 90; i++) {
      const log = LOGS[dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i))];
      // today not finished yet: don't break the streak
      if (!log) { if (i === 0) continue; break; }
      // at least 3 habits done counts as an active day
      if (doneCountOf(log) >= 3) streak++;
      else if (i > 0) break;
    }
    return streak;
  }

  function weekStripHTML() {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    const daysTh = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
    const daysEn = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const labels = isThLang() ? daysTh : daysEn;

    let html = '<div class="weekstrip" style="margin:6px 0 10px">';
    for (let i = 0; i < 7; i++) {
      const diff = i - dayOfWeek;
      const doneCount = doneCountOf(LOGS[dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff))]);
      const isDone = doneCount >= 4;
      const isPartial = doneCount >= 2;
      const cls = ['wd', diff === 0 ? 'today' : '', isDone ? 'done' : (isPartial ? 'on' : '')].filter(Boolean).join(' ');
      html += `<div class="${cls}"><span>${isDone ? '✓' : (isPartial ? '•' : '○')}</span><small>${labels[i]}</small></div>`;
    }
    html += '</div>';
    return html;
  }

  function weightLine(isTh) {
    const e = (typeof Body !== 'undefined' && Body.latestWeight) ? Body.latestWeight() : null;
    if (!e) return isTh ? 'ยังไม่ได้ชั่ง · แตะเพื่อบันทึก' : 'Not logged yet · tap to log';
    const days = Math.round((new Date(todayIso()) - new Date(dateKey(new Date(e.t)))) / 86400000);
    const when = days <= 0 ? (isTh ? 'วันนี้' : 'today') : (days === 1 ? (isTh ? 'เมื่อวาน' : 'yesterday') : (isTh ? `${days} วันก่อน` : `${days} d ago`));
    const g = Body.goal;
    return `<b>${e.weight}</b> kg · ${when}${g ? ` · 🎯 ${g} kg` : ''}`;
  }

  /* ---------- Main UI Card on Home Screen ---------- */
  function cardHTML() {
    const today = getToday();
    const streak = streakCount();
    const wTarget = CFG.waterTarget || 2500;
    const pTarget = CFG.proteinTarget || 130;
    const sTarget = CFG.sleepTarget || 7.5;
    const stpTarget = CFG.stepsTarget || 8000;

    const fl = doneFlags(today);
    const wDone = fl.water, sDone = fl.sleep, stpDone = fl.steps;
    const doneCount = doneCountOf(today);

    const pct = Math.round((doneCount / 5) * 100);
    const isTh = isThLang();

    const waterPct = Math.min(100, Math.round((today.water / wTarget) * 100));

    return `
      <div class="card" style="border-left:4px solid var(--accent);padding:14px 14px 10px">
        <div class="row">
          <b class="grow" style="font-size:16px">${isTh ? '📋 กิจวัตรประจำวัน' : '📋 Daily Habits'}</b>
          ${streak > 0 ? `<span class="tag" style="background:var(--soft);color:var(--accent);font-weight:700">🔥 ${streak} ${isTh ? 'วันติด' : 'days'}</span>` : ''}
          <button class="chip mini" id="hb_cfg_btn" title="${isTh ? 'ตั้งค่า TDEE & InBody' : 'TDEE & InBody Settings'}" style="font-size:14px">⚙️</button>
        </div>

        <div style="margin:8px 0 6px">
          <div class="row" style="font-size:13px;margin-bottom:4px">
            <span class="grow" style="color:var(--mute)">${isTh ? 'ความสำเร็จวันนี้' : 'Today\'s Progress'}</span>
            <b>${doneCount}/5 (${pct}%)</b>
          </div>
          <div class="track"><div class="fill ${pct === 100 ? 'ok' : ''}" style="width:${pct}%"></div></div>
        </div>

        ${weekStripHTML()}

        <!-- 1. WORKOUT -->
        <div class="setrow" style="padding:8px 0">
          <button class="num" id="hb_toggle_wo" style="cursor:pointer;background:${today.workout ? 'var(--ok)' : 'var(--bg)'};color:${today.workout ? '#fff' : 'inherit'};border:1px solid ${today.workout ? 'var(--ok)' : 'var(--line)'}">${today.workout ? '✓' : '🏋️'}</button>
          <div class="grow" style="cursor:pointer" id="hb_text_wo">
            <b>${isTh ? 'ออกกำลังกาย' : 'Workout'}</b>
            <small style="display:block">${today.workout ? (today.workoutMode === 'low' ? (isTh ? '⚡ ผ่านระดับเซฟแรง (เน้นสม่ำเสมอ)' : '⚡ Quick Habit (Consistency)') : (isTh ? '🔥 ซ้อมจัดเต็มสำเร็จ (ครบตามแผน)' : '🔥 Full Session Completed')) : (isTh ? 'ยังไม่ได้ฝึกวันนี้' : 'Not trained yet today')}</small>
          </div>
          <button class="chip ${today.workoutMode === 'low' ? 'on' : ''}" id="hb_mode_wo" style="font-size:11px;padding:2px 8px">${today.workoutMode === 'low' ? (isTh ? 'เซฟแรง' : 'Quick') : (isTh ? 'จัดเต็ม' : 'Full')}</button>
        </div>

        <!-- 2. WATER -->
        <div class="setrow" style="padding:8px 0;flex-wrap:wrap">
          <button class="num" id="hb_toggle_water" style="cursor:pointer;background:${wDone ? 'var(--ok)' : 'var(--bg)'};color:${wDone ? '#fff' : 'inherit'};border:1px solid ${wDone ? 'var(--ok)' : 'var(--line)'}">${wDone ? '✓' : '💧'}</button>
          <div class="grow" style="min-width:120px">
            <div class="row">
              <b class="grow">${isTh ? 'ดื่มน้ำ' : 'Water'}</b>
              <small><b>${today.water}</b> / ${wTarget} ml</small>
            </div>
            <div class="track" style="height:6px;margin-top:4px"><div class="fill ${wDone ? 'ok' : ''}" style="width:${waterPct}%"></div></div>
          </div>
          <div class="row" style="gap:4px;margin-left:auto">
            <button class="chip" id="hb_w_add250" style="padding:2px 8px;font-size:12px">+250</button>
            <button class="chip" id="hb_w_add500" style="padding:2px 8px;font-size:12px">+500</button>
            <button class="chip" id="hb_w_sub250" style="padding:2px 6px;font-size:11px" title="${isTh ? 'ลดน้ำ' : 'Remove 250 ml'}" aria-label="-250 ml">-250</button>
          </div>
        </div>

        <!-- 3. PROTEIN -->
        <div class="setrow" style="padding:8px 0">
          <button class="num" id="hb_toggle_protein" style="cursor:pointer;background:${today.proteinDone ? 'var(--ok)' : 'var(--bg)'};color:${today.proteinDone ? '#fff' : 'inherit'};border:1px solid ${today.proteinDone ? 'var(--ok)' : 'var(--line)'}">${today.proteinDone ? '✓' : '🥩'}</button>
          <div class="grow" style="cursor:pointer" id="hb_text_protein">
            <b>${isTh ? 'โปรตีนถึงเป้า' : 'Protein Goal'}</b>
            <small style="display:block">${today.proteinDone ? (isTh ? `แตะเป้า ${pTarget}g แล้ว ✓` : `Reached target ${pTarget}g ✓`) : (isTh ? `เป้าหมาย ${pTarget}g / วัน` : `Target ${pTarget}g / day`)}</small>
          </div>
          <button class="chip ${today.proteinDone ? 'on' : ''}" id="hb_btn_protein" style="font-size:12px">${today.proteinDone ? (isTh ? 'ถึงเป้าแล้ว' : 'Done') : (isTh ? 'แตะเป้า' : 'Hit target')}</button>
        </div>

        <!-- 4. SLEEP -->
        <div class="setrow" style="padding:8px 0">
          <button class="num" id="hb_toggle_sleep" style="cursor:pointer;background:${sDone ? 'var(--ok)' : 'var(--bg)'};color:${sDone ? '#fff' : 'inherit'};border:1px solid ${sDone ? 'var(--ok)' : 'var(--line)'}">${sDone ? '✓' : '😴'}</button>
          <div class="grow" style="cursor:pointer" id="hb_text_sleep">
            <b>${isTh ? 'การนอนหลับ' : 'Sleep'}</b>
            <small style="display:block">${(today.sleepLogged || today.sleepDone) ? `${today.sleepHours} ${isTh ? 'ชม.' : 'hrs'}${sDone ? ' ✓' : ''}` : (isTh ? `ยังไม่ได้บันทึก · เป้าหมาย ${sTarget} ชม.` : `Not logged · target ${sTarget}h`)}</small>
          </div>
          <div class="row" style="gap:4px">
            <button class="chip mini" id="hb_s_sub" style="width:28px;height:28px;font-size:14px">-</button>
            <b style="font-size:13px;min-width:32px;text-align:center">${(today.sleepLogged || today.sleepDone) ? today.sleepHours + 'h' : '–'}</b>
            <button class="chip mini" id="hb_s_add" style="width:28px;height:28px;font-size:14px">+</button>
          </div>
        </div>

        <!-- 5. STEPS -->
        <div class="setrow" style="padding:8px 0">
          <button class="num" id="hb_toggle_steps" style="cursor:pointer;background:${stpDone ? 'var(--ok)' : 'var(--bg)'};color:${stpDone ? '#fff' : 'inherit'};border:1px solid ${stpDone ? 'var(--ok)' : 'var(--line)'}">${stpDone ? '✓' : '🚶'}</button>
          <div class="grow" style="cursor:pointer" id="hb_text_steps">
            <b>${isTh ? 'ก้าวเดินระหว่างวัน (NEAT)' : 'Daily Steps (NEAT)'}</b>
            <small style="display:block">${today.steps > 0 ? `${today.steps.toLocaleString()} / ${stpTarget.toLocaleString()} ${isTh ? 'ก้าว' : 'steps'}` : (today.stepsDone ? (isTh ? `✓ ผ่านเป้าหมายแล้ว (≥ ${stpTarget.toLocaleString()} ก้าว)` : `✓ Target reached (≥ ${stpTarget.toLocaleString()} steps)`) : (isTh ? `เป้าหมาย ${stpTarget.toLocaleString()} ก้าว (แตะเพื่อติ๊กผ่าน)` : `Target ${stpTarget.toLocaleString()} steps (Tap to check)`))}</small>
          </div>
          <button class="chip ${stpDone ? 'on' : ''}" id="hb_btn_steps" style="font-size:12px">${today.steps > 0 ? (isTh ? `${today.steps.toLocaleString()} ก้าว` : `${today.steps.toLocaleString()} steps`) : (stpDone ? (isTh ? '✓ ครบแล้ว' : '✓ Done') : (isTh ? 'ใส่เลขก้าว' : 'Log'))}</button>
        </div>

        <!-- 6. WEIGHT (tracked in Body, not part of the 5-habit score) -->
        <div class="setrow" style="padding:8px 0">
          <button class="num" id="hb_weigh_btn" style="cursor:pointer;background:var(--bg);border:1px solid var(--line)">⚖️</button>
          <div class="grow" style="cursor:pointer" id="hb_weigh_txt">
            <b>${isTh ? 'น้ำหนักตัว' : 'Body weight'}</b>
            <small style="display:block">${weightLine(isTh)}</small>
          </div>
          <button class="chip" id="hb_weigh_add" style="font-size:12px">${isTh ? 'ชั่งน้ำหนัก' : 'Weigh in'}</button>
        </div>

        <!-- Macro Summary Footer -->
        <div class="row" style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--line);font-size:12px;color:var(--mute);flex-wrap:wrap;gap:6px">
          <span class="grow" style="min-width:180px">🔥 <b>TDEE:</b> ${CFG.tdee || 2200} kcal · <b>${isTh ? 'เป้าหมาย' : 'Target'}:</b> ${CFG.calorieTarget || 2000} kcal</span>
          <button class="chip" id="hb_go_food" style="font-size:12px;padding:3px 10px;height:auto;flex:none">🥗 ${isTh ? 'คุมอาหาร' : 'Food'}</button>
          <a href="#" id="hb_link_detail" style="font-size:12px;text-decoration:none;margin-left:4px;white-space:nowrap"><b>${isTh ? 'ตั้งค่า ›' : 'Settings ›'}</b></a>
        </div>
      </div>
    `;
  }

  /* ---------- Event Binding ---------- */
  function bindEvents(root) {
    const el = root || document.getElementById('app');
    if (!el) return;

    const tlog = getToday();

    // 1. Workout
    const toggleWo = () => {
      tlog.workout = !tlog.workout;
      tlog.workoutOff = !tlog.workout; // stops the auto-detect from re-ticking a manual un-tick
      tlog.workoutAuto = false;
      save();
      rerender();
    };
    const btnWo = el.querySelector('#hb_toggle_wo');
    if (btnWo) btnWo.onclick = toggleWo;
    const txtWo = el.querySelector('#hb_text_wo');
    if (txtWo) txtWo.onclick = toggleWo;

    const modeWo = el.querySelector('#hb_mode_wo');
    if (modeWo) modeWo.onclick = () => {
      tlog.workoutMode = (tlog.workoutMode === 'low') ? 'full' : 'low';
      tlog.workout = true; tlog.workoutOff = false; tlog.workoutAuto = false;
      save();
      rerender();
    };

    // 2. Water
    const addW = delta => {
      tlog.water = Math.max(0, (tlog.water || 0) + delta);
      save();
      rerender();
    };
    const bW250 = el.querySelector('#hb_w_add250');
    if (bW250) bW250.onclick = () => addW(250);
    const bW500 = el.querySelector('#hb_w_add500');
    if (bW500) bW500.onclick = () => addW(500);
    const bWSub = el.querySelector('#hb_w_sub250');
    if (bWSub) bWSub.onclick = () => addW(-250);
    const bWToggle = el.querySelector('#hb_toggle_water');
    if (bWToggle) bWToggle.onclick = () => {
      const tgt = CFG.waterTarget || 2500;
      tlog.water = (tlog.water >= tgt) ? 0 : tgt;
      save();
      rerender();
    };

    // 3. Protein
    const toggleProt = () => {
      tlog.proteinDone = !tlog.proteinDone;
      save();
      rerender();
    };
    const bPToggle = el.querySelector('#hb_toggle_protein');
    if (bPToggle) bPToggle.onclick = toggleProt;
    const bPBtn = el.querySelector('#hb_btn_protein');
    if (bPBtn) bPBtn.onclick = toggleProt;
    const bPTxt = el.querySelector('#hb_text_protein');
    if (bPTxt) bPTxt.onclick = toggleProt;

    // 4. Sleep
    const changeSleep = delta => {
      if (!tlog.sleepLogged && !tlog.sleepDone) { tlog.sleepLogged = true; tlog.sleepHours = CFG.sleepTarget || 7.5; }
      tlog.sleepHours = Math.max(0, Math.round(((tlog.sleepHours || 7.5) + delta) * 10) / 10);
      tlog.sleepDone = tlog.sleepHours > 0 && tlog.sleepHours >= (CFG.sleepTarget || 7.5) - 0.5;
      save();
      rerender();
    };
    const bSAdd = el.querySelector('#hb_s_add');
    if (bSAdd) bSAdd.onclick = () => changeSleep(0.5);
    const bSSub = el.querySelector('#hb_s_sub');
    if (bSSub) bSSub.onclick = () => changeSleep(-0.5);
    const bSToggle = el.querySelector('#hb_toggle_sleep');
    if (bSToggle) bSToggle.onclick = () => {
      tlog.sleepDone = !tlog.sleepDone;
      tlog.sleepLogged = true;
      if (tlog.sleepDone && tlog.sleepHours < (CFG.sleepTarget || 7.5)) {
        tlog.sleepHours = CFG.sleepTarget || 7.5;
      }
      save();
      rerender();
    };

    // 5. Steps: 1-Tap Toggle or Open Steps Modal
    const toggleSteps = () => {
      tlog.stepsDone = !tlog.stepsDone;
      save();
      rerender();
    };
    const bStpToggle = el.querySelector('#hb_toggle_steps');
    if (bStpToggle) bStpToggle.onclick = toggleSteps;
    const bStpTxt = el.querySelector('#hb_text_steps');
    if (bStpTxt) bStpTxt.onclick = toggleSteps;

    const bStpBtn = el.querySelector('#hb_btn_steps');
    if (bStpBtn) bStpBtn.onclick = () => openStepsModal(tlog);

    ['#hb_weigh_btn', '#hb_weigh_txt', '#hb_weigh_add'].forEach(sel => {
      const b = el.querySelector(sel);
      if (b && typeof Body !== 'undefined') b.onclick = () => Body.openWeightSheet();
    });

    // Modal Triggers
    const cfgBtn = el.querySelector('#hb_cfg_btn');
    if (cfgBtn) cfgBtn.onclick = () => openConfigModal();

    const goFood = el.querySelector('#hb_go_food');
    if (goFood) goFood.onclick = () => { if (typeof go === 'function') go('food'); };

    const linkDetail = el.querySelector('#hb_link_detail');
    if (linkDetail) linkDetail.onclick = e => {
      e.preventDefault();
      openConfigModal();
    };
  }

  /* ---------- Daily Steps Modal (Tactile, No browser prompt) ---------- */
  function openStepsModal(tlog) {
    const isTh = isThLang();
    const m = document.createElement('div');
    m.className = 'modal';
    const tgt = CFG.stepsTarget || 8000;

    m.innerHTML = `
      <div class="sheet" style="max-width:380px">
        <div class="row" style="margin-bottom:12px">
          <b class="grow" style="font-size:16px">🚶 ${isTh ? 'บันทึกก้าวเดินประจำวัน' : 'Log Daily Steps'}</b>
          <button class="chip mini" id="sm_close">✕</button>
        </div>
        <p style="font-size:13px;color:var(--mute);margin:0 0 12px">
          ${isTh ? `เป้าหมายวันนี้: <b>${tgt.toLocaleString()} ก้าว</b>` : `Daily Target: <b>${tgt.toLocaleString()} steps</b>`}
        </p>

        <div style="margin-bottom:12px">
          <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">${isTh ? 'ระบุจำนวนก้าว (ก้าว)' : 'Step Count'}</label>
          <input type="number" id="sm_input" value="${tlog.steps > 0 ? tlog.steps : ''}" placeholder="${tgt}" style="width:100%;font-size:18px;font-weight:700;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink);box-sizing:border-box">
        </div>

        <div style="margin-bottom:16px">
          <small style="color:var(--mute);display:block;margin-bottom:6px">${isTh ? 'หรือเลือกปุ่มลัด:' : 'Quick Presets:'}</small>
          <div class="row" style="gap:6px;flex-wrap:wrap">
            <button class="chip" data-step="${tgt}">🎯 ${tgt.toLocaleString()}</button>
            <button class="chip" data-step="10000">10,000</button>
            <button class="chip" data-step="12000">12,000</button>
            <button class="chip" data-step="15000">15,000</button>
          </div>
        </div>

        <div class="row" style="gap:8px">
          <button class="btn" id="sm_save" style="flex:1">${isTh ? 'บันทึก' : 'Save'}</button>
          ${(tlog.steps > 0 || tlog.stepsDone) ? `<button class="btn ghost w-auto" id="sm_clear" style="color:var(--warn)">${isTh ? 'ล้างค่า' : 'Clear'}</button>` : ''}
        </div>
      </div>
    `;

    m.querySelector('#sm_close').onclick = () => m.remove();
    m.querySelectorAll('[data-step]').forEach(b => {
      b.onclick = () => {
        m.querySelector('#sm_input').value = b.dataset.step;
      };
    });

    if (m.querySelector('#sm_clear')) {
      m.querySelector('#sm_clear').onclick = () => {
        tlog.steps = 0;
        tlog.stepsDone = false;
        save();
        m.remove();
        rerender();
      };
    }

    m.querySelector('#sm_save').onclick = () => {
      const raw = m.querySelector('#sm_input').value.trim();
      const val = parseInt(raw, 10);
      if (!isNaN(val) && val >= 0) {
        tlog.steps = val;
        tlog.stepsDone = val >= tgt;
      } else {
        tlog.stepsDone = true;
      }
      save();
      m.remove();
      rerender();
    };

    document.body.appendChild(m);
    setTimeout(() => {
      const inp = m.querySelector('#sm_input');
      if (inp) inp.focus();
    }, 50);
  }

  /* ---------- TDEE, InBody & Targets Modal ---------- */
  function openConfigModal() {
    const isTh = isThLang();
    const curW = latestWeight();

    const m = document.createElement('div');
    m.className = 'modal';

    let draft = Object.assign({}, CFG);
    if (!draft.weight) draft.weight = curW;

    function targetsHTML(res) {
      return `
        <b>🎯 ${isTh ? 'ผลการคำนวณเป้าหมายรายวัน' : 'Calculated Daily Targets'}</b>
        <div style="font-size:12px;color:var(--mute);margin:2px 0 8px">
          ${isTh ? 'สูตรที่ใช้:' : 'Formula:'} <b>${res.bmrSource}</b>
        </div>
        <div class="grid3" style="margin-bottom:8px">
          <div class="stat card" style="padding:8px 4px;margin:0"><small>BMR</small><b style="font-size:18px">${res.bmr}</b><small>kcal</small></div>
          <div class="stat card" style="padding:8px 4px;margin:0"><small>TDEE</small><b style="font-size:18px;color:var(--accent)">${res.tdee}</b><small>kcal</small></div>
          <div class="stat card" style="padding:8px 4px;margin:0"><small>${isTh ? 'แคลอรี่เป้า' : 'Target'}</small><b style="font-size:18px;color:var(--ok)">${res.calTarget}</b><small>kcal</small></div>
        </div>
        <div class="grid2">
          <div class="stat card" style="padding:8px;margin:0"><small>🥩 ${isTh ? 'โปรตีนเป้าหมาย' : 'Protein Target'}</small><b style="font-size:20px;color:var(--accent)">${res.protTarget} <span style="font-size:14px">g</span></b></div>
          <div class="stat card" style="padding:8px;margin:0"><small>💧 ${isTh ? 'น้ำดื่มเป้าหมาย' : 'Water Target'}</small><b style="font-size:20px;color:#1098ad">${res.waterTarget} <span style="font-size:14px">ml</span></b></div>
        </div>`;
    }

    function renderModalContent() {
      const metrics = calculate(draft);

      m.innerHTML = `
        <div class="sheet" style="max-width:480px">
          <div class="row" style="margin-bottom:12px">
            <h2 style="margin:0;font-size:20px" class="grow">⚙️ ${isTh ? 'ตั้งค่า TDEE & InBody' : 'TDEE & InBody Settings'}</h2>
            <button class="chip mini" id="hb_m_close">✕</button>
          </div>

          <!-- Section: Standard Info -->
          <div class="card" style="margin-bottom:10px">
            <b>👤 ${isTh ? 'ข้อมูลร่างกายพื้นฐาน' : 'Basic Body Profile'}</b>
            <div class="grid2" style="margin-top:8px">
              <div>
                <small>${isTh ? 'เพศ' : 'Gender'}</small>
                <select class="inp" id="m_gender">
                  <option value="m" ${draft.gender === 'm' ? 'selected' : ''}>${isTh ? 'ชาย (Male)' : 'Male'}</option>
                  <option value="f" ${draft.gender === 'f' ? 'selected' : ''}>${isTh ? 'หญิง (Female)' : 'Female'}</option>
                </select>
              </div>
              <div>
                <small>${isTh ? 'อายุ (ปี)' : 'Age (yrs)'}</small>
                <input class="inp" type="number" id="m_age" value="${draft.age || 28}" min="10" max="99">
              </div>
            </div>

            <div class="grid2">
              <div>
                <small>${isTh ? 'ส่วนสูง (cm)' : 'Height (cm)'}</small>
                <input class="inp" type="number" id="m_height" value="${draft.height || 175}" min="100" max="230">
              </div>
              <div>
                <small>${isTh ? 'น้ำหนัก (kg)' : 'Weight (kg)'}</small>
                <input class="inp" type="number" step="0.1" id="m_weight" value="${draft.weight || curW || 70}" min="30" max="250">
              </div>
            </div>

            <small>${isTh ? 'ระดับกิจกรรมต่อสัปดาห์' : 'Activity Level'}</small>
            <select class="inp" id="m_act" style="margin-top:4px">
              <option value="1.2" ${draft.activity == 1.2 ? 'selected' : ''}>${isTh ? 'นั่งทำงานเป็นหลัก ขยับน้อย (1.2)' : 'Sedentary, desk job (1.2)'}</option>
              <option value="1.375" ${draft.activity == 1.375 ? 'selected' : ''}>${isTh ? 'ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์ (1.375)' : 'Light exercise 1-3 days/wk (1.375)'}</option>
              <option value="1.55" ${draft.activity == 1.55 ? 'selected' : ''}>${isTh ? 'ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์ (1.55 ★ แนะนำ)' : 'Moderate 3-5 days/wk (1.55 ★ Standard)'}</option>
              <option value="1.725" ${draft.activity == 1.725 ? 'selected' : ''}>${isTh ? 'ออกกำลังกายหนัก 6-7 วัน/สัปดาห์ (1.725)' : 'Heavy exercise 6-7 days/wk (1.725)'}</option>
            </select>

            <small>${isTh ? 'เป้าหมายร่างกาย' : 'Fitness Goal'}</small>
            <select class="inp" id="m_goal" style="margin-top:4px">
              <option value="cut" ${draft.goal === 'cut' ? 'selected' : ''}>${isTh ? '🔥 ลดไขมัน / ลีนหุ่น (-400 kcal)' : '🔥 Fat Loss / Cut (-400 kcal)'}</option>
              <option value="maintain" ${draft.goal === 'maintain' ? 'selected' : ''}>${isTh ? '⚖️ รักษารูปร่าง / พัฒนาทักษะ (TDEE พอดี)' : '⚖️ Maintenance / Skill Focus (TDEE)'}</option>
              <option value="bulk" ${draft.goal === 'bulk' ? 'selected' : ''}>${isTh ? '💪 สร้างกล้ามเนื้อแบบลีน (+250 kcal)' : '💪 Lean Bulk / Muscle (+250 kcal)'}</option>
            </select>
          </div>

          <!-- Section: InBody Integration -->
          <div class="card" style="margin-bottom:10px;border-left:4px solid #1098ad">
            <div class="row">
              <b class="grow">📊 ${isTh ? 'ข้อมูลจากเครื่อง InBody' : 'InBody Body Composition'}</b>
              <label class="row" style="cursor:pointer;font-size:13px">
                <input type="checkbox" id="m_use_inbody" ${draft.useInBody ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--accent)">
                <span>${isTh ? 'เปิดใช้' : 'Enable'}</span>
              </label>
            </div>
            <p class="sub" style="margin:4px 0 8px;font-size:12px">
              ${isTh ? 'หากคุณมีใบตรวจจาก InBody สามารถกรอกค่า BMR หรือมวลกล้ามเนื้อเพื่อให้การคำนวณแม่นยำสูงสุด' : 'Enter measured metrics from your InBody sheet for exact metabolic & protein calibration.'}
            </p>

            <div id="inbody_inputs" style="display:${draft.useInBody ? 'block' : 'none'}">
              <div class="grid2">
                <div>
                  <small><b>${isTh ? 'BMR จากเครื่อง (kcal)' : 'InBody BMR (kcal)'}</b></small>
                  <input class="inp" type="number" id="m_ib_bmr" placeholder="เช่น 1680" value="${draft.inbodyBmr || ''}">
                </div>
                <div>
                  <small><b>${isTh ? 'ไขมันในร่างกาย (%)' : 'Body fat (%)'}</b></small>
                  <input class="inp" type="number" step="0.1" id="m_ib_fat" placeholder="เช่น 15.5" value="${draft.inbodyFat || ''}">
                </div>
              </div>

              <div class="grid2">
                <div>
                  <small><b>${isTh ? 'มวลกล้ามเนื้อ SMM (kg)' : 'Muscle mass SMM (kg)'}</b></small>
                  <input class="inp" type="number" step="0.1" id="m_ib_smm" placeholder="เช่น 32.4" value="${draft.inbodySmm || ''}">
                </div>
                <div>
                  <small><b>${isTh ? 'มวลไร้ไขมัน LBM (kg)' : 'Lean mass LBM (kg)'}</b></small>
                  <input class="inp" type="number" step="0.1" id="m_ib_lbm" placeholder="เช่น 58.2" value="${draft.inbodyLbm || ''}">
                </div>
              </div>

              <div>
                <small>${isTh ? 'ระดับไขมันช่องท้อง (Visceral Fat 1-20)' : 'Visceral fat level (1-20)'}</small>
                <input class="inp" type="number" id="m_ib_visc" placeholder="เช่น 4" value="${draft.inbodyVisceral || ''}" min="1" max="20">
              </div>
            </div>
          </div>

          <!-- Section: Live Calculated Targets Result -->
          <div class="card hl" id="hb_targets" style="margin-bottom:12px">${targetsHTML(metrics)}</div>

          <button class="btn" id="hb_m_save">${isTh ? 'บันทึก & ใช้งานเป้าหมายนี้' : 'Save & Apply Targets'}</button>
        </div>
      `;

      // Event handlers inside modal
      m.querySelector('#hb_m_close').onclick = () => m.remove();

      const attachSync = (id, key, isNum = true) => {
        const input = m.querySelector('#' + id);
        if (input) {
          input.oninput = () => {
            draft[key] = isNum ? parseFloat(input.value) || 0 : input.value;
            // update live numbers without closing
            updateLiveNumbers();
          };
          input.onchange = () => {
            draft[key] = isNum ? parseFloat(input.value) || 0 : input.value;
            updateLiveNumbers();
          };
        }
      };

      attachSync('m_gender', 'gender', false);
      attachSync('m_age', 'age');
      attachSync('m_height', 'height');
      attachSync('m_weight', 'weight');
      attachSync('m_act', 'activity');
      attachSync('m_goal', 'goal', false);

      const chkIb = m.querySelector('#m_use_inbody');
      if (chkIb) {
        chkIb.onchange = () => {
          draft.useInBody = chkIb.checked;
          const box = m.querySelector('#inbody_inputs');
          if (box) box.style.display = draft.useInBody ? 'block' : 'none';
          updateLiveNumbers();
        };
      }

      attachSync('m_ib_bmr', 'inbodyBmr');
      attachSync('m_ib_fat', 'inbodyFat');
      attachSync('m_ib_smm', 'inbodySmm');
      attachSync('m_ib_lbm', 'inbodyLbm');
      attachSync('m_ib_visc', 'inbodyVisceral');

      function updateLiveNumbers() {
        const box = m.querySelector('#hb_targets');
        if (box) box.innerHTML = targetsHTML(calculate(draft));
      }

      m.querySelector('#hb_m_save').onclick = () => {
        // a weight typed here is logged as a weigh-in so there is one history, not two
        if (draft.weight > 0 && draft.weight !== bodyWeight() && typeof Body !== 'undefined' && Body.addEntry) Body.addEntry({ weight: draft.weight });
        const finalMetrics = calculate(draft);
        draft.bmr = finalMetrics.bmr;
        draft.tdee = finalMetrics.tdee;
        draft.calorieTarget = finalMetrics.calTarget;
        draft.proteinTarget = finalMetrics.protTarget;
        draft.waterTarget = finalMetrics.waterTarget;

        CFG = Object.assign({}, draft);

        // Also record in InBody history if InBody values were entered
        if (CFG.useInBody && (CFG.inbodyBmr || CFG.inbodyFat || CFG.inbodySmm || CFG.inbodyLbm)) {
          const last = INBODY_HIST[INBODY_HIST.length - 1];
          const same = last && last.bmr === CFG.inbodyBmr && last.bodyFat === CFG.inbodyFat && last.smm === CFG.inbodySmm && last.lbm === CFG.inbodyLbm && last.weight === CFG.weight;
          if (!same) INBODY_HIST.push({
            t: Date.now(),
            weight: CFG.weight,
            bmr: CFG.inbodyBmr,
            bodyFat: CFG.inbodyFat,
            smm: CFG.inbodySmm,
            lbm: CFG.inbodyLbm,
            visceral: CFG.inbodyVisceral
          });
        }

        save();
        if (typeof toast === 'function') {
          toast(isTh ? 'บันทึกเป้าหมายเรียบร้อยแล้ว' : 'Targets updated successfully');
        }
        m.remove();
        rerender();
      };
    }

    renderModalContent();
    document.body.appendChild(m);
  }

  // Called by Nutrition when logged protein changes. Ticks the habit only when the target is first reached,
  // so a manual un-tick sticks until the total crosses the target again.
  function syncProtein(grams, target) {
    const log = getToday();
    const reached = grams >= target;
    if (reached && !log.proteinReached) log.proteinDone = true;
    log.proteinReached = reached;
    log.proteinGrams = Math.round(grams);
    save();
  }

  // Backup (field names are the backup format: habits, habitsLogs, inbody). Types are checked so a bad file
  // cannot break the Habits screen. Absent fields keep the current data.
  const isO = v => v && typeof v === 'object' && !Array.isArray(v);
  const prim = v => v === null || ['number', 'string', 'boolean'].includes(typeof v);
  function exportState() { return { habits: CFG, habitsLogs: LOGS, inbody: INBODY_HIST }; }
  function importState(d) {
    if (!isO(d)) return;
    if (isO(d.habits)) {
      const c = {};
      Object.entries(d.habits).forEach(([k, v]) => {
        if (!prim(v)) return;
        if (k in DEFAULT_CFG) {
          const def = DEFAULT_CFG[k];
          if (def === null ? (v === null || typeof v === 'number') : typeof v === typeof def) c[k] = v;
        } else if (k === 'customTargets' && typeof v === 'boolean') c[k] = v;
      });
      CFG = Object.assign({}, DEFAULT_CFG, c);
    }
    if (isO(d.habitsLogs)) LOGS = Object.fromEntries(Object.entries(d.habitsLogs)
      .filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && isO(v))
      .map(([k, v]) => [k, Object.fromEntries(Object.entries(v).filter(([, x]) => prim(x)))]));
    if (Array.isArray(d.inbody)) INBODY_HIST = d.inbody.filter(e => isO(e) && typeof e.t === 'number')
      .map(e => Object.fromEntries(Object.entries(e).filter(([, x]) => x === null || typeof x === 'number')));
    save(); load();
  }
  function clear() { CFG = Object.assign({}, DEFAULT_CFG); LOGS = {}; INBODY_HIST = []; save(); load(); }

  return {
    load,
    save,
    exportState,
    importState,
    clear,
    syncProtein,
    onWeight,
    autoWorkout,
    doneCount: key => doneCountOf(LOGS[key]),
    cardHTML,
    bindEvents,
    openConfigModal,
    calculate: (c) => calculate(c || CFG),
    get cfg() { return CFG; },
    get logs() { return LOGS; },
    get inbodyHistory() { return INBODY_HIST; }
  };
})();
