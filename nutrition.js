'use strict';
/* PieFit Nutrition & Food Tracking Module:
   - Daily Calories & Macronutrient Tracking (Protein, Carbs, Fat)
   - TDEE & InBody Auto-Macro Split (with manual override support)
   - Quick Macro Increment Buttons (+Protein, +Carb, +Fat, +Calories)
   - 4 Meals Tracking (Breakfast, Lunch, Dinner, Snacks)
   - Built-in Thai & Fitness Food Library with live search
   - My Custom Foods (save favorite meals)
   - Hybrid AI Food Assistant (Uses existing aikey/Gemini key or Copy-Prompt helper)
   - Automatic sync with Daily Habit Checklist (marks protein done when target reached). */
const Nutrition = (() => {
  const KEY_DAYS = 'nutrition_days_v1';
  const KEY_MY_FOODS = 'nutrition_my_foods_v1';
  const KEY_CUSTOM_TARGETS = 'nutrition_custom_targets_v1';

const escH = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const { cleanKey, detectKeyType, getStoredKey, queryAIForNutrition } = NutritionAI; // nutrition-ai.js

  let DAYS = {};
  let MY_FOODS = [];
  let CUSTOM_TARGETS = null; // { cal, p, c, f }
  let selectedDate = null;   // null = today

  const BUILTIN_FOODS = NUTRITION_FOODS; // nutrition-data.js

  const todayIso = () => {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const getActiveDate = () => selectedDate || todayIso();

  function load() {
    if (typeof store === 'undefined') return;
    const d = store.get(KEY_DAYS, null);
    if (d && typeof d === 'object') DAYS = d;
    const mf = store.get(KEY_MY_FOODS, null);
    if (Array.isArray(mf)) MY_FOODS = mf;
    const ct = store.get(KEY_CUSTOM_TARGETS, null);
    if (ct && typeof ct === 'object') CUSTOM_TARGETS = ct;
  }

  function save() {
    if (typeof store === 'undefined') return;
    store.set(KEY_DAYS, DAYS);
    store.set(KEY_MY_FOODS, MY_FOODS);
    if (CUSTOM_TARGETS) store.set(KEY_CUSTOM_TARGETS, CUSTOM_TARGETS);

    // Auto-sync with Habits checklist for today
    syncHabitsChecklist();
  }

  function syncHabitsChecklist() {
    const day = DAYS[todayIso()];
    if (!day || typeof Habits === 'undefined' || !Habits.syncProtein) return;
    Habits.syncProtein(dayTotals(day).p, getMacroTargets().p);
  }

  // Calculate or retrieve macro targets
  function getMacroTargets() {
    if (CUSTOM_TARGETS && CUSTOM_TARGETS.cal > 0) return CUSTOM_TARGETS;

    let cal = 2200;
    let p = 140;

    if (typeof Habits !== 'undefined' && Habits.cfg) {
      if (Habits.cfg.calorieTarget) cal = Habits.cfg.calorieTarget;
      if (Habits.cfg.proteinTarget) p = Habits.cfg.proteinTarget;
    }

    // Fat: 22% of total calories (essential for hormone balance)
    const fatKcal = cal * 0.22;
    const f = Math.round(fatKcal / 9);

    // Carbs: Remaining calories
    const proteinKcal = p * 4;
    const remainingKcal = Math.max(200, cal - proteinKcal - fatKcal);
    const c = Math.round(remainingKcal / 4);

    return { cal, p, c, f };
  }

  function getDayData(dateStr, create = true) {
    const k = dateStr || getActiveDate();
    if (!DAYS[k]) {
      if (!create) return { meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }, quickAdds: [] };
      DAYS[k] = {
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: []
        },
        quickAdds: []
      };
    }
    return DAYS[k];
  }

  // Sum up totals for a day
  function dayTotals(dayData) {
    const d = dayData || getDayData();
    let cal = 0, p = 0, c = 0, f = 0;

    if (d.meals) {
      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mKey => {
        const arr = d.meals[mKey] || [];
        arr.forEach(it => {
          const qty = it.qty || 1;
          cal += (it.cal || 0) * qty;
          p += (it.p || 0) * qty;
          c += (it.c || 0) * qty;
          f += (it.f || 0) * qty;
        });
      });
    }

    if (d.quickAdds) {
      d.quickAdds.forEach(it => {
        cal += (it.cal || 0);
        p += (it.p || 0);
        c += (it.c || 0);
        f += (it.f || 0);
      });
    }

    return {
      cal: Math.max(0, Math.round(cal)),
      p: Math.max(0, Math.round(p * 10) / 10),
      c: Math.max(0, Math.round(c * 10) / 10),
      f: Math.max(0, Math.round(f * 10) / 10)
    };
  }

  /* ---------- View / UI Render ---------- */
  function view(box) {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const curDate = getActiveDate();
    const isToday = curDate === todayIso();
    const day = getDayData(curDate, false);
    const totals = dayTotals(day);
    const targets = getMacroTargets();

    const calPct = Math.min(100, Math.round((totals.cal / targets.cal) * 100));
    const pPct = Math.min(100, Math.round((totals.p / targets.p) * 100));
    const cPct = Math.min(100, Math.round((totals.c / targets.c) * 100));
    const fPct = Math.min(100, Math.round((totals.f / targets.f) * 100));

    const MEALS = [
      { key: 'breakfast', nameTh: '🌅 มื้อเช้า', nameEn: '🌅 Breakfast' },
      { key: 'lunch', nameTh: '☀️ มื้อกลางวัน', nameEn: '☀️ Lunch' },
      { key: 'dinner', nameTh: '🌙 มื้อเย็น', nameEn: '🌙 Dinner' },
      { key: 'snacks', nameTh: '🥪 ของว่าง & เครื่องดื่ม', nameEn: '🥪 Snacks & Drinks' }
    ];

    const root = box || document.getElementById('app');

    root.innerHTML = `
      <!-- Header with Date Selector -->
      <div class="top" style="flex-wrap:wrap;gap:8px">
        <div class="grow" style="min-width:200px">
          <h1>🥗 ${isTh ? 'โภชนาการ & อาหาร' : 'Nutrition & Meals'}</h1>
          <p class="sub">${isTh ? 'คุมแคลอรี่ & 3 สารอาหารหลักตามเป้าหมาย' : 'Calories & Macronutrient targets'}</p>
        </div>
        <div class="row" style="gap:6px">
          <button class="chip" id="nut_prev_day">‹</button>
          <span style="font-weight:700;font-size:14px;padding:4px 6px">${isToday ? (isTh ? 'วันนี้' : 'Today') : curDate}</span>
          <button class="chip" id="nut_next_day" ${isToday ? 'disabled style="opacity:0.4"' : ''}>›</button>
        </div>
      </div>

      <!-- 1. Macro Summary Dashboard -->
      <div class="card" style="border-left:4px solid var(--accent);padding:14px">
        <div class="row" style="margin-bottom:8px">
          <b class="grow" style="font-size:16px">📊 ${isTh ? 'สรุปสารอาหารประจำวัน' : 'Daily Macro Summary'}</b>
          ${(day.quickAdds && day.quickAdds.length > 0) ? `
            <button class="chip" id="nut_undo_btn" style="font-size:12px;padding:3px 10px;height:auto;color:var(--accent);border-color:var(--accent);white-space:nowrap" title="${isTh ? 'ย้อนกลับรายการล่าสุด' : 'Undo last'}">↩️ ${isTh ? 'ย้อนกลับ' : 'Undo'}</button>
          ` : ''}
          <button class="chip mini" id="nut_target_btn" title="${isTh ? 'แก้ไขเป้าหมาย' : 'Edit Targets'}">⚙️</button>
        </div>

        <!-- Calories Ring / Big Bar -->
        <div style="margin-bottom:12px;background:var(--bg);padding:10px 12px;border-radius:10px;border:1px solid var(--line)">
          <div class="row" style="font-size:14px;margin-bottom:6px;cursor:pointer;flex-wrap:wrap" data-adjust-macro="cal" title="${isTh ? 'แตะเพื่อปรับแก้หรือรีเซ็ต' : 'Tap to adjust or reset'}">
            <span>🔥 <b>${isTh ? 'แคลอรี่รวม (Calories)' : 'Calories'}</b> ✏️</span>
            <span class="grow" style="text-align:right"><b>${totals.cal.toLocaleString()}</b> / ${targets.cal.toLocaleString()} kcal (${calPct}%)</span>
          </div>
          <div class="track" style="height:10px"><div class="fill ${calPct >= 100 ? 'warn' : ''}" style="width:${calPct}%;background:${totals.cal > targets.cal + 200 ? 'var(--warn)' : 'var(--accent)'}"></div></div>
          ${(typeof Activity !== 'undefined' && Activity.dayKcal(curDate) > 0) ? `<small style="display:block;margin-top:6px;color:var(--mute)">🏊 ${isTh ? 'เผาผลาญจากกิจกรรมอื่น' : 'Burned in other activities'} ≈ ${Activity.dayKcal(curDate)} kcal · ${isTh ? 'ไม่ได้บวกเข้าเป้า (TDEE รวมระดับการออกกำลังกายไว้แล้ว)' : 'not added to the target (your TDEE already includes activity)'}</small>` : ''}
          <div class="row" style="gap:8px;margin-top:10px">
            <button class="chip" data-adj="cal" data-sign="-" style="width:48px;min-height:40px;font-size:20px;color:var(--warn);flex:none" aria-label="${isTh ? 'ลดแคลอรี่' : 'Subtract calories'}">−</button>
            <button class="chip" data-adj="all" data-sign="+" style="flex:1;min-height:40px;font-size:13px;color:var(--accent);border-color:var(--accent)">⚡ ${isTh ? 'เพิ่มด่วน / ปรับละเอียด' : 'Quick add / fine adjust'}</button>
            <button class="chip" data-adj="cal" data-sign="+" style="width:48px;min-height:40px;font-size:20px;color:var(--accent);border-color:var(--accent);flex:none" aria-label="${isTh ? 'เพิ่มแคลอรี่' : 'Add calories'}">+</button>
          </div>
        </div>

        <!-- 3 Macros (Protein, Carb, Fat) Grid -->
        <div class="grid3" style="gap:8px">
          <!-- Protein -->
          <div style="background:var(--bg);padding:10px;border-radius:10px;border:1px solid var(--line)">
            <div class="row" style="font-size:13px;margin-bottom:4px;cursor:pointer" data-adjust-macro="p" title="${isTh ? 'แตะเพื่อปรับแก้หรือรีเซ็ต' : 'Tap to adjust or reset'}">
              <b>🍗 ${isTh ? 'โปรตีน' : 'Protein'}</b> ✏️
            </div>
            <div style="font-size:16px;font-weight:700;color:var(--ink);margin-bottom:4px;cursor:pointer" data-adjust-macro="p">${totals.p} <small style="font-weight:400;color:var(--mute)">/ ${targets.p}g</small></div>
            <div class="track" style="height:6px;margin-bottom:8px"><div class="fill ${pPct >= 100 ? 'ok' : ''}" style="width:${pPct}%"></div></div>
            <div class="row" style="gap:6px">
              <button class="chip" data-adj="p" data-sign="-" style="flex:1;min-height:40px;font-size:20px;padding:0;color:var(--warn)" aria-label="-">−</button>
              <button class="chip" data-adj="p" data-sign="+" style="flex:1;min-height:40px;font-size:20px;padding:0;color:var(--accent);border-color:var(--accent)" aria-label="+">+</button>
            </div>
          </div>

          <!-- Carbs -->
          <div style="background:var(--bg);padding:10px;border-radius:10px;border:1px solid var(--line)">
            <div class="row" style="font-size:13px;margin-bottom:4px;cursor:pointer" data-adjust-macro="c" title="${isTh ? 'แตะเพื่อปรับแก้หรือรีเซ็ต' : 'Tap to adjust or reset'}">
              <b>🍚 ${isTh ? 'คาร์บ' : 'Carbs'}</b> ✏️
            </div>
            <div style="font-size:16px;font-weight:700;color:var(--ink);margin-bottom:4px;cursor:pointer" data-adjust-macro="c">${totals.c} <small style="font-weight:400;color:var(--mute)">/ ${targets.c}g</small></div>
            <div class="track" style="height:6px;margin-bottom:8px"><div class="fill" style="width:${cPct}%;background:#38bdf8"></div></div>
            <div class="row" style="gap:6px">
              <button class="chip" data-adj="c" data-sign="-" style="flex:1;min-height:40px;font-size:20px;padding:0;color:var(--warn)" aria-label="-">−</button>
              <button class="chip" data-adj="c" data-sign="+" style="flex:1;min-height:40px;font-size:20px;padding:0;color:var(--accent);border-color:var(--accent)" aria-label="+">+</button>
            </div>
          </div>

          <!-- Fat -->
          <div style="background:var(--bg);padding:10px;border-radius:10px;border:1px solid var(--line)">
            <div class="row" style="font-size:13px;margin-bottom:4px;cursor:pointer" data-adjust-macro="f" title="${isTh ? 'แตะเพื่อปรับแก้หรือรีเซ็ต' : 'Tap to adjust or reset'}">
              <b>🥑 ${isTh ? 'ไขมัน' : 'Fat'}</b> ✏️
            </div>
            <div style="font-size:16px;font-weight:700;color:var(--ink);margin-bottom:4px;cursor:pointer" data-adjust-macro="f">${totals.f} <small style="font-weight:400;color:var(--mute)">/ ${targets.f}g</small></div>
            <div class="track" style="height:6px;margin-bottom:8px"><div class="fill" style="width:${fPct}%;background:#fbbf24"></div></div>
            <div class="row" style="gap:6px">
              <button class="chip" data-adj="f" data-sign="-" style="flex:1;min-height:40px;font-size:20px;padding:0;color:var(--warn)" aria-label="-">−</button>
              <button class="chip" data-adj="f" data-sign="+" style="flex:1;min-height:40px;font-size:20px;padding:0;color:var(--accent);border-color:var(--accent)" aria-label="+">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. AI Nutrition Assistant & External Prompt Card -->
      <div class="card hl" style="padding:14px;margin-bottom:12px;border:1px solid var(--accent)">
        <div class="row" style="margin-bottom:6px;flex-wrap:wrap;gap:6px">
          <span class="emoji" style="font-size:22px">🤖</span>
          <b class="grow" style="font-size:15px">${isTh ? 'AI ช่วยคำนวณสารอาหาร' : 'AI Nutrition Assistant'}</b>
          <button class="chip mini" id="ai_cfg_key_btn" style="padding:3px 9px;font-size:11px;font-weight:600" title="${isTh ? 'ตั้งค่า AI API Key' : 'Configure API Key'}">
            ${getStoredKey() ? '🟢 API Key' : (isTh ? '🔑 ใส่ API Key' : '🔑 Set API Key')}
          </button>
        </div>
        <p style="font-size:12px;color:var(--mute);margin:0 0 10px">
          ${isTh ? 'พิมพ์ชื่อเมนูอาหารที่รับประทาน เพื่อให้ AI ประเมินแคลอรี่และสารอาหาร หรือคัดลอก Prompt ไปถาม AI ภายนอกได้ฟรี' : 'Type meal description to analyze or copy prompt for Gemini / ChatGPT'}
        </p>

        <div class="row gap" style="margin-bottom:8px">
          <input type="text" id="ai_food_input" class="inp" placeholder="${isTh ? 'เช่น กะเพราอกไก่ไข่ดาว ข้าว 1 ทัพพี' : 'e.g. Chicken holy basil with fried egg and rice'}" style="margin:0;font-size:14px">
          <button class="btn w-auto" id="ai_food_analyze" style="padding:8px 14px;white-space:nowrap">${isTh ? '🤖 วิเคราะห์' : 'Analyze'}</button>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
          <button class="chip" id="ai_food_prompt_btn" style="flex:1;min-width:160px;height:auto;padding:8px 12px;font-size:13px;border-radius:10px;text-align:center">
            📋 ${isTh ? 'คัดลอก Prompt ไปถาม AI' : 'Copy Prompt for AI'}
          </button>
          <button class="chip" id="ai_quick_entry_btn" style="flex:1;min-width:130px;height:auto;padding:8px 12px;font-size:13px;border-radius:10px;text-align:center">
            ✍️ ${isTh ? 'กรอกสารอาหารเอง' : 'Manual Macro Entry'}
          </button>
        </div>

        <div id="ai_food_result" style="display:none;margin-top:12px;padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--line)"></div>
      </div>

      <!-- 3. Action Bar: Open Food Library Button -->
      <div class="row" style="margin-bottom:14px;gap:8px">
        <button class="btn" id="nut_open_catalog" style="flex:1;background:var(--soft);color:var(--accent);font-weight:700">
          📖 ${isTh ? 'เปิดคลังเมนูอาหาร & เมนูของฉัน' : 'Food Library & My Favorites'}
        </button>
      </div>

      <!-- 4. 4 Meals Cards -->
      <div style="margin-bottom:20px">
        ${MEALS.map(m => {
          const mList = (day.meals && day.meals[m.key]) || [];
          let mCal = 0, mP = 0, mC = 0, mF = 0;
          mList.forEach(item => {
            const q = item.qty || 1;
            mCal += (item.cal || 0) * q;
            mP += (item.p || 0) * q;
            mC += (item.c || 0) * q;
            mF += (item.f || 0) * q;
          });
          return `
            <div class="card" style="margin-bottom:10px;padding:12px 14px">
              <div class="row" style="margin-bottom:6px;flex-wrap:wrap;gap:6px">
                <b class="grow" style="font-size:15px">${isTh ? m.nameTh : m.nameEn}</b>
                <span style="font-size:12px;color:var(--mute)">🔥 <b>${Math.round(mCal)}</b> kcal · 🍗 <b>${Math.round(mP)}g</b> P</span>
                <button class="chip" data-add-to-meal="${m.key}" style="margin-left:auto;font-size:12px;padding:3px 10px;height:auto;flex:none">+ ${isTh ? 'เพิ่ม' : 'Add'}</button>
              </div>

              ${mList.length === 0 ? `<div style="font-size:12px;color:var(--mute);padding:6px 0">${isTh ? 'ยังไม่มีรายการอาหารในมื้อนี้' : 'No food logged for this meal yet'}</div>` : ''}

              ${mList.map((item, idx) => `
                <div class="setrow" style="padding:6px 0;border-bottom:1px solid var(--line);font-size:13px">
                  <div class="grow">
                    <b>${escH(item.name)}</b> ${item.qty && item.qty !== 1 ? `<small class="tag">${item.qty}x</small>` : ''}
                    <div style="font-size:11px;color:var(--mute)">🔥 ${Math.round(item.cal * (item.qty || 1))} kcal · 🍗 P: ${Math.round(item.p * (item.qty || 1))}g · 🍚 C: ${Math.round(item.c * (item.qty || 1))}g · 🥑 F: ${Math.round(item.f * (item.qty || 1))}g</div>
                  </div>
                  <button class="chip mini" data-del-item="${m.key}:${idx}" style="color:var(--warn)">✕</button>
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}

        <!-- Quick Adds Log (if any) -->
        ${(day.quickAdds && day.quickAdds.length > 0) ? `
          <div class="card" style="padding:10px 14px;background:var(--bg)">
            <div class="row" style="font-size:13px;margin-bottom:6px">
              <b class="grow">${isTh ? '⚡ รายการปรับด่วนวันนี้ (Quick Log)' : '⚡ Quick Logs'}</b>
              <button class="chip" id="nut_clear_quick" style="color:var(--warn);font-size:11px;padding:2px 8px;height:auto;flex:none">${isTh ? 'ล้างทั้งหมด' : 'Clear All'}</button>
            </div>
            ${day.quickAdds.map((qa, i) => `
              <div class="row" style="font-size:12px;padding:5px 0;border-bottom:1px solid var(--line)">
                <span class="grow" style="color:var(--ink)"><b>${escH(qa.label || (isTh ? 'บวกสารอาหารด่วน' : 'Quick entry'))}</b> <small style="color:var(--mute)">(${new Date(qa.t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})})</small></span>
                <span style="font-weight:600;margin-right:8px">${qa.cal ? `${qa.cal > 0 ? '+' : ''}${qa.cal} kcal ` : ''}${qa.p ? `${qa.p > 0 ? '+' : ''}${qa.p}g P ` : ''}${qa.c ? `${qa.c > 0 ? '+' : ''}${qa.c}g C ` : ''}${qa.f ? `${qa.f > 0 ? '+' : ''}${qa.f}g F ` : ''}</span>
                <button class="chip" data-del-qa="${i}" style="color:var(--warn);font-size:11px;padding:2px 7px;height:auto;flex:none" title="${isTh ? 'ลบรายการนี้' : 'Delete'}">✕</button>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    bindViewEvents(root);
  }

  /* ---------- Event Bindings for Main Food Tab ---------- */
  function bindViewEvents(root) {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    // browsing an empty date creates no record; the day is created on first write
    const day = DAYS[getActiveDate()] || getDayData();

    // Date Switchers
    const bPrev = root.querySelector('#nut_prev_day');
    if (bPrev) bPrev.onclick = () => {
      const cur = new Date(getActiveDate());
      cur.setDate(cur.getDate() - 1);
      const pad = n => String(n).padStart(2, '0');
      selectedDate = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;
      view();
    };

    const bNext = root.querySelector('#nut_next_day');
    if (bNext) bNext.onclick = () => {
      const cur = new Date(getActiveDate());
      cur.setDate(cur.getDate() + 1);
      const pad = n => String(n).padStart(2, '0');
      const nextStr = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;
      if (nextStr <= todayIso()) {
        selectedDate = nextStr === todayIso() ? null : nextStr;
        view();
      }
    };

    // Undo last quick add
    const bUndo = root.querySelector('#nut_undo_btn');
    if (bUndo) bUndo.onclick = () => {
      if (day.quickAdds && day.quickAdds.length > 0) {
        const removed = day.quickAdds.pop();
        save();
        if (typeof toast === 'function') {
          toast(isTh ? `↩️ ยกเลิกรายการล่าสุดแล้ว (${removed.label || ''})` : `Undone (${removed.label || ''})`);
        }
        view();
      }
    };

    // +/- buttons open the adjust sheet (precise stepper + quick presets)
    root.querySelectorAll('[data-adj]').forEach(b => {
      b.onclick = () => openAdjustSheet(b.dataset.adj, b.dataset.sign === '-' ? -1 : 1);
    });

    // Delete single quick add item
    root.querySelectorAll('[data-del-qa]').forEach(b => {
      b.onclick = () => {
        const idx = parseInt(b.dataset.delQa, 10);
        if (day.quickAdds && day.quickAdds[idx] !== undefined) {
          const removed = day.quickAdds.splice(idx, 1)[0];
          save();
          if (typeof toast === 'function') {
            toast(isTh ? `ลบรายการแล้ว (${removed.label || ''})` : `Deleted (${removed.label || ''})`);
          }
          view();
        }
      };
    });

    // Adjust / Reset macro on tapping number or card
    root.querySelectorAll('[data-adjust-macro]').forEach(el => {
      el.onclick = () => {
        const mKey = el.dataset.adjustMacro;
        openAdjustSheet(mKey, 1);
      };
    });

    // Delete meal item
    root.querySelectorAll('[data-del-item]').forEach(b => {
      b.onclick = () => {
        const [mealKey, idxStr] = b.dataset.delItem.split(':');
        const idx = parseInt(idxStr, 10);
        if (day.meals && day.meals[mealKey]) {
          day.meals[mealKey].splice(idx, 1);
          save();
          view();
        }
      };
    });

    // Clear quick adds
    const bClearQuick = root.querySelector('#nut_clear_quick');
    if (bClearQuick) bClearQuick.onclick = () => {
      day.quickAdds = [];
      save();
      view();
    };

    // Open Targets Customization Modal
    const bTgt = root.querySelector('#nut_target_btn');
    if (bTgt) bTgt.onclick = () => openTargetModal();

    // Add food button for specific meal
    root.querySelectorAll('[data-add-to-meal]').forEach(b => {
      b.onclick = () => {
        const mealKey = b.dataset.addToMeal;
        openFoodCatalogModal(mealKey);
      };
    });

    // Open General Food Catalog
    const bOpenCat = root.querySelector('#nut_open_catalog');
    if (bOpenCat) bOpenCat.onclick = () => openFoodCatalogModal('lunch');

    // Copy Prompt for External Gemini/ChatGPT
    const bPrompt = root.querySelector('#ai_food_prompt_btn');
    if (bPrompt) bPrompt.onclick = () => {
      const txt = (root.querySelector('#ai_food_input').value || '').trim();
      const mealDesc = txt || (isTh ? '[ใส่ชื่ออาหารที่กิน]' : '[Your food description]');
      const promptText = isTh
        ? `ช่วยประเมินสารอาหารและพลังงานของเมนูนี้ให้หน่อย: "${mealDesc}"\nขอสรุปผลลัพธ์เป็น 4 ค่าสั้นๆ ชัดเจน:\n1. แคลอรี่รวม (kcal)\n2. โปรตีน (g)\n3. คาร์โบไฮเดรต (g)\n4. ไขมัน (g)`
        : `Please estimate the energy and macros of this meal: "${mealDesc}"\nReply with 4 short, clear values:\n1. Total calories (kcal)\n2. Protein (g)\n3. Carbohydrate (g)\n4. Fat (g)`;

      const fallback = () => openCopyTextModal(promptText);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(promptText).then(() => {
          if (typeof toast === 'function') toast(isTh ? '📋 คัดลอก Prompt แล้ว นำไปวางใน Gemini ได้เลย!' : 'Prompt copied to clipboard!');
        }).catch(fallback);
      } else {
        fallback();
      }
    };

    // Manual Quick Number Entry Modal
    const bManual = root.querySelector('#ai_quick_entry_btn');
    if (bManual) bManual.onclick = () => openManualFoodModal('lunch');

    // In-app AI Analysis
    const bAnalyze = root.querySelector('#ai_food_analyze');
    if (bAnalyze) bAnalyze.onclick = () => analyzeWithAI(root);

    // API Key Setup Modal Button
    const bCfgKey = root.querySelector('#ai_cfg_key_btn');
    if (bCfgKey) bCfgKey.onclick = () => openKeySetupModal();
  }

  // Tap-to-copy sheet used when the Clipboard API is unavailable (replaces window.prompt)
  function openCopyTextModal(text) {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = `
      <div class="sheet" style="max-width:380px">
        <div class="row" style="margin-bottom:10px">
          <b class="grow">📋 ${isTh ? 'คัดลอกข้อความนี้' : 'Copy this text'}</b>
          <button class="chip mini" id="ct_close">✕</button>
        </div>
        <textarea class="inp" id="ct_text" rows="6" readonly style="width:100%;box-sizing:border-box">${escH(text)}</textarea>
      </div>`;
    m.querySelector('#ct_close').onclick = () => m.remove();
    document.body.appendChild(m);
    const ta = m.querySelector('#ct_text');
    ta.focus(); ta.select();
  }

  /* ---------- AI Food Analysis Execution ---------- */
  async function analyzeWithAI(root) {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const inp = root.querySelector('#ai_food_input');
    const resBox = root.querySelector('#ai_food_result');
    const text = (inp.value || '').trim();

    if (!text) {
      if (typeof toast === 'function') toast(isTh ? 'กรุณาพิมพ์ชื่ออาหารก่อน' : 'Please enter a food description');
      return;
    }

    resBox.style.display = 'block';
    resBox.innerHTML = `
      <div class="row">
        <span class="emoji spinner">⏳</span>
        <span class="grow">${isTh ? 'กำลังวิเคราะห์ด้วย AI...' : 'Analyzing with AI...'}</span>
      </div>
    `;

    // Retrieve API key from store
    const aikey = getStoredKey();

    if (!aikey) {
      resBox.innerHTML = `
        <div style="font-size:13px;color:var(--warn);margin-bottom:8px">
          ⚠️ ${isTh ? 'ยังไม่ได้ระบุ AI API Key (ใช้ Gemini ฟรีได้เลย)' : 'No AI API Key found'}
        </div>
        <p style="font-size:12px;color:var(--mute);margin:0 0 8px">
          ${isTh ? 'คุณสามารถใส่ Gemini API Key ฟรีเพื่อวิเคราะห์ในแอป หรือกดปุ่ม "คัดลอก Prompt" ด้านบนไปถาม Gemini นอกรอบได้ฟรี' : 'Set your free Gemini API key or copy prompt to ask Gemini outside.'}
        </p>
        <button class="btn small" id="ai_set_key_btn">${isTh ? '🔑 ใส่ API Key (ฟรี)' : 'Set API Key'}</button>
      `;
      const bSetKey = resBox.querySelector('#ai_set_key_btn');
      if (bSetKey) bSetKey.onclick = () => openKeySetupModal();
      return;
    }

    try {
      const data = await queryAIForNutrition(text, aikey);
      renderAIResult(resBox, text, data);
    } catch (err) {
      resBox.innerHTML = `
        <div style="font-size:13px;color:var(--warn);margin-bottom:8px;line-height:1.4">
          ⚠️ <b>${isTh ? 'วิเคราะห์ไม่สำเร็จ' : 'Analysis failed'}:</b> ${escH(err.message || 'Error')}
        </div>
        <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px">
          <button class="btn small w-auto" id="ai_err_change_key_btn" style="padding:6px 12px;font-size:12px">🔑 ${isTh ? 'ตรวจสอบ / เปลี่ยน API Key' : 'Check / Change API Key'}</button>
        </div>
        <small style="color:var(--mute)">${isTh ? 'สามารถกดปุ่ม "คัดลอก Prompt" ด้านบนเพื่อถามในแอป Gemini ข้างนอกแทนได้ครับ' : 'You can copy the prompt above to ask Gemini directly.'}</small>
      `;
      const bFix = resBox.querySelector('#ai_err_change_key_btn');
      if (bFix) bFix.onclick = () => openKeySetupModal();
    }
  }

  function renderAIResult(box, originalText, data) {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    box.innerHTML = `
      <div style="font-size:14px;font-weight:700;margin-bottom:6px">
        🍱 ${escH(data.name || originalText)}
      </div>
      <div class="row" style="gap:10px;font-size:13px;margin-bottom:10px">
        <span>🔥 <b>${escH(Number(data.cal) || 0)}</b> kcal</span>
        <span>🍗 P: <b>${escH(Number(data.p) || 0)}g</b></span>
        <span>🍚 C: <b>${escH(Number(data.c) || 0)}g</b></span>
        <span>🥑 F: <b>${escH(Number(data.f) || 0)}g</b></span>
      </div>

      <div class="row" style="gap:8px">
        <select id="ai_target_meal" class="inp" style="margin:0;font-size:13px;padding:6px 8px">
          <option value="breakfast">${isTh ? '🌅 มื้อเช้า' : 'Breakfast'}</option>
          <option value="lunch" selected>${isTh ? '☀️ มื้อกลางวัน' : 'Lunch'}</option>
          <option value="dinner">${isTh ? '🌙 มื้อเย็น' : 'Dinner'}</option>
          <option value="snacks">${isTh ? '🥪 ของว่าง' : 'Snacks'}</option>
        </select>
        <button class="btn w-auto" id="ai_save_meal_btn" style="padding:6px 14px">${isTh ? '+ บันทึกลงมื้อ' : '+ Add to Meal'}</button>
      </div>
    `;

    box.querySelector('#ai_save_meal_btn').onclick = () => {
      const mealKey = box.querySelector('#ai_target_meal').value;
      const day = getDayData();
      if (!day.meals) day.meals = {};
      if (!day.meals[mealKey]) day.meals[mealKey] = [];

      day.meals[mealKey].push({
        id: 'ai_' + Date.now(),
        name: data.name || originalText,
        cal: Number(data.cal) || 0,
        p: Number(data.p) || 0,
        c: Number(data.c) || 0,
        f: Number(data.f) || 0,
        qty: 1
      });

      save();
      box.style.display = 'none';
      if (typeof toast === 'function') toast(isTh ? 'บันทึกอาหารเรียบร้อยแล้ว!' : 'Meal logged successfully!');
      view();
    };
  }

  /* ---------- Food Catalog Modal (Built-in + My Foods + Search) ---------- */
  function openFoodCatalogModal(targetMealKey) {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const m = document.createElement('div');
    m.className = 'modal';

    let activeCat = 'all';
    let searchQuery = '';
    const mealKey = targetMealKey || 'lunch';

    function renderModal() {
      // Filter list
      let list = [...BUILTIN_FOODS, ...MY_FOODS.map(f => Object.assign({ isCustom: true }, f))];
      if (activeCat !== 'all') {
        if (activeCat === 'custom') list = list.filter(x => x.isCustom);
        else list = list.filter(x => x.cat === activeCat);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        list = list.filter(x =>
          (x.nameTh && x.nameTh.toLowerCase().includes(q)) ||
          (x.nameEn && x.nameEn.toLowerCase().includes(q))
        );
      }

      m.innerHTML = `
        <div class="sheet" style="max-width:480px;max-height:85vh;display:flex;flex-direction:column">
          <div class="row" style="margin-bottom:10px">
            <h2 style="margin:0;font-size:18px" class="grow">📖 ${isTh ? 'คลังเมนูอาหาร' : 'Food Library'}</h2>
            <button class="chip mini" id="fc_close">✕</button>
          </div>

          <!-- Search Bar -->
          <div style="margin-bottom:8px">
            <input type="text" id="fc_search" class="inp" placeholder="${isTh ? '🔍 พิมพ์ค้นหาเมนู (เช่น ไก่, ข้าว, ไข่)...' : 'Search foods...'}" value="${escH(searchQuery)}" style="margin:0;font-size:14px">
          </div>

          <!-- Category Chips -->
          <div class="chips" style="margin-bottom:10px;gap:4px">
            <button class="chip ${activeCat === 'all' ? 'on' : ''}" data-cat="all">${isTh ? 'ทั้งหมด' : 'All'}</button>
            <button class="chip ${activeCat === 'protein' ? 'on' : ''}" data-cat="protein">🍗 ${isTh ? 'โปรตีน' : 'Protein'}</button>
            <button class="chip ${activeCat === 'carb' ? 'on' : ''}" data-cat="carb">🍚 ${isTh ? 'คาร์บ' : 'Carbs'}</button>
            <button class="chip ${activeCat === 'dish' ? 'on' : ''}" data-cat="dish">🍲 ${isTh ? 'จานเดียว' : 'Dishes'}</button>
            <button class="chip ${activeCat === 'fat' ? 'on' : ''}" data-cat="fat">🥑 ${isTh ? 'ไขมัน/ของว่าง' : 'Fats/Snacks'}</button>
            <button class="chip ${activeCat === 'custom' ? 'on' : ''}" data-cat="custom">⭐ ${isTh ? 'เมนูของฉัน' : 'My Foods'}</button>
          </div>

          <!-- Food List Container -->
          <div style="flex:1;overflow-y:auto;padding-right:4px;margin-bottom:12px">
            ${list.length === 0 ? `<div style="text-align:center;padding:20px;color:var(--mute)">${isTh ? 'ไม่พบเมนูอาหาร' : 'No foods found'}</div>` : ''}

            ${list.map(item => `
              <div class="card" style="margin-bottom:8px;padding:10px 12px;cursor:pointer" data-select-food="${item.id}">
                <div class="row">
                  <div class="grow">
                    <b style="font-size:14px">${escH(isTh ? item.nameTh : item.nameEn)}</b> ${item.isCustom ? '<span class="tag">My</span>' : ''}
                    <div style="font-size:12px;color:var(--mute)">${escH(isTh ? item.portionTh : item.portionEn)}</div>
                  </div>
                  <div style="text-align:right">
                    <b style="color:var(--accent);font-size:14px">${item.cal} <small>kcal</small></b>
                    <div style="font-size:11px;color:var(--mute)">P:${item.p} C:${item.c} F:${item.f}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Bottom Action: Create Custom Food -->
          <div class="row" style="gap:8px;border-top:1px solid var(--line);padding-top:10px">
            <button class="btn ghost small" id="fc_create_custom" style="flex:1">+ ${isTh ? 'สร้างเมนูของฉัน' : 'Create Custom Food'}</button>
            <button class="btn ghost small" id="fc_manual_entry" style="flex:1">✍️ ${isTh ? 'กรอกตัวเลขด่วน' : 'Manual Entry'}</button>
          </div>
        </div>
      `;

      m.querySelector('#fc_close').onclick = () => m.remove();

      // Search input binding
      const inp = m.querySelector('#fc_search');
      inp.oninput = () => {
        searchQuery = inp.value;
        renderModal();
        const nextInp = m.querySelector('#fc_search');
        if (nextInp) {
          nextInp.focus();
          nextInp.setSelectionRange(searchQuery.length, searchQuery.length);
        }
      };

      // Category chip binding
      m.querySelectorAll('[data-cat]').forEach(b => {
        b.onclick = () => {
          activeCat = b.dataset.cat;
          renderModal();
        };
      });

      // Item selection (Choose Portion)
      m.querySelectorAll('[data-select-food]').forEach(el => {
        el.onclick = () => {
          const fId = el.dataset.selectFood;
          const found = list.find(x => x.id === fId);
          if (found) {
            m.remove();
            openPortionModal(found, mealKey);
          }
        };
      });

      // Create Custom Food
      m.querySelector('#fc_create_custom').onclick = () => {
        m.remove();
        openCreateCustomFoodModal(mealKey);
      };

      // Manual Quick Entry
      m.querySelector('#fc_manual_entry').onclick = () => {
        m.remove();
        openManualFoodModal(mealKey);
      };
    }

    renderModal();
    document.body.appendChild(m);
  }

  /* ---------- Portion / Quantity Selection Modal ---------- */
  function openPortionModal(foodItem, mealKey) {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const m = document.createElement('div');
    m.className = 'modal';

    let qty = 1;

    function renderContent() {
      const totalCal = Math.round(foodItem.cal * qty);
      const totalP = Math.round(foodItem.p * qty * 10) / 10;
      const totalC = Math.round(foodItem.c * qty * 10) / 10;
      const totalF = Math.round(foodItem.f * qty * 10) / 10;

      m.innerHTML = `
        <div class="sheet" style="max-width:380px">
          <div class="row" style="margin-bottom:8px">
            <h2 style="margin:0;font-size:18px" class="grow">🍱 ${escH(isTh ? foodItem.nameTh : foodItem.nameEn)}</h2>
            <button class="chip mini" id="pm_close">✕</button>
          </div>
          <p style="font-size:12px;color:var(--mute);margin:0 0 12px">
            ${isTh ? 'หน่วยมาตรฐาน:' : 'Standard portion:'} <b>${escH(isTh ? foodItem.portionTh : foodItem.portionEn)}</b>
          </p>

          <!-- Quantity Selector -->
          <div class="row" style="gap:10px;margin-bottom:14px;justify-content:center">
            <button class="btn w-auto" id="pm_sub" style="width:40px;height:40px;min-height:40px;padding:0;font-size:20px;display:inline-grid;place-items:center">-</button>
            <span style="font-size:22px;font-weight:700;min-width:60px;text-align:center">${qty}</span>
            <button class="btn w-auto" id="pm_add" style="width:40px;height:40px;min-height:40px;padding:0;font-size:20px;display:inline-grid;place-items:center">+</button>
          </div>

          <!-- Quick Quantity Presets -->
          <div class="row" style="gap:6px;justify-content:center;margin-bottom:14px">
            <button class="chip" data-set-qty="0.5">0.5x</button>
            <button class="chip ${qty === 1 ? 'on' : ''}" data-set-qty="1">1x</button>
            <button class="chip" data-set-qty="1.5">1.5x</button>
            <button class="chip" data-set-qty="2">2x</button>
          </div>

          <!-- Live Nutrition Preview -->
          <div class="card" style="background:var(--bg);padding:10px;margin-bottom:14px">
            <div class="row" style="font-size:14px;margin-bottom:4px">
              <span>🔥 <b>${totalCal}</b> kcal</span>
              <span class="grow" style="text-align:right">🍗 <b>${totalP}g</b> P</span>
            </div>
            <div class="row" style="font-size:13px;color:var(--mute)">
              <span>🍚 C: <b>${totalC}g</b></span>
              <span class="grow" style="text-align:right">🥑 F: <b>${totalF}g</b></span>
            </div>
          </div>

          <!-- Submit Button -->
          <button class="btn" id="pm_confirm">+ ${isTh ? 'บันทึกลงมื้ออาหาร' : 'Add to Meal'}</button>
        </div>
      `;

      m.querySelector('#pm_close').onclick = () => m.remove();

      m.querySelector('#pm_sub').onclick = () => {
        qty = Math.max(0.5, Math.round((qty - 0.5) * 10) / 10);
        renderContent();
      };
      m.querySelector('#pm_add').onclick = () => {
        qty = Math.round((qty + 0.5) * 10) / 10;
        renderContent();
      };

      m.querySelectorAll('[data-set-qty]').forEach(b => {
        b.onclick = () => {
          qty = parseFloat(b.dataset.setQty);
          renderContent();
        };
      });

      m.querySelector('#pm_confirm').onclick = () => {
        const day = getDayData();
        if (!day.meals) day.meals = {};
        if (!day.meals[mealKey]) day.meals[mealKey] = [];

        day.meals[mealKey].push({
          id: foodItem.id + '_' + Date.now(),
          name: isTh ? foodItem.nameTh : foodItem.nameEn,
          cal: foodItem.cal,
          p: foodItem.p,
          c: foodItem.c,
          f: foodItem.f,
          qty: qty
        });

        save();
        m.remove();
        if (typeof toast === 'function') toast(isTh ? 'เพิ่มอาหารเรียบร้อยแล้ว' : 'Food added');
        view();
      };
    }

    renderContent();
    document.body.appendChild(m);
  }

  /* ---------- Create Custom Food Modal ---------- */
  function openCreateCustomFoodModal(mealKey) {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const m = document.createElement('div');
    m.className = 'modal';

    m.innerHTML = `
      <div class="sheet" style="max-width:400px">
        <div class="row" style="margin-bottom:12px">
          <b class="grow" style="font-size:16px">⭐ ${isTh ? 'สร้างเมนูของฉัน (My Food)' : 'Create Custom Food'}</b>
          <button class="chip mini" id="cm_close">✕</button>
        </div>

        <div style="margin-bottom:10px">
          <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">${isTh ? 'ชื่ออาหาร' : 'Food Name'}</label>
          <input type="text" id="cm_name" class="inp" placeholder="${isTh ? 'เช่น ข้าวผัดอกไก่คลีน' : 'e.g. Clean Chicken Fried Rice'}" style="margin:0">
        </div>

        <div style="margin-bottom:10px">
          <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">${isTh ? 'ปริมาณต่อหน่วย' : 'Serving Size'}</label>
          <input type="text" id="cm_portion" class="inp" placeholder="${isTh ? 'เช่น 1 จาน หรือ 100 กรัม' : 'e.g. 1 plate or 100g'}" value="${isTh ? '1 จาน' : '1 serving'}" style="margin:0">
        </div>

        <div class="grid2" style="gap:8px;margin-bottom:14px">
          <div>
            <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">🔥 ${isTh ? 'แคลอรี่ (kcal)' : 'Calories'}</label>
            <input type="number" id="cm_cal" class="inp" placeholder="0" style="margin:0">
          </div>
          <div>
            <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">🍗 ${isTh ? 'โปรตีน (g)' : 'Protein'}</label>
            <input type="number" id="cm_p" class="inp" placeholder="0" style="margin:0">
          </div>
          <div>
            <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">🍚 ${isTh ? 'คาร์บ (g)' : 'Carbs'}</label>
            <input type="number" id="cm_c" class="inp" placeholder="0" style="margin:0">
          </div>
          <div>
            <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">🥑 ${isTh ? 'ไขมัน (g)' : 'Fat'}</label>
            <input type="number" id="cm_f" class="inp" placeholder="0" style="margin:0">
          </div>
        </div>

        <button class="btn" id="cm_save">${isTh ? 'บันทึกเข้าเมนูของฉัน' : 'Save Custom Food'}</button>
      </div>
    `;

    m.querySelector('#cm_close').onclick = () => m.remove();
    m.querySelector('#cm_save').onclick = () => {
      const name = m.querySelector('#cm_name').value.trim();
      if (!name) {
        if (typeof toast === 'function') toast(isTh ? 'กรุณากรอกชื่ออาหาร' : 'Please enter food name');
        return;
      }

      const portion = m.querySelector('#cm_portion').value.trim() || '1 serving';
      const cal = parseFloat(m.querySelector('#cm_cal').value) || 0;
      const p = parseFloat(m.querySelector('#cm_p').value) || 0;
      const c = parseFloat(m.querySelector('#cm_c').value) || 0;
      const f = parseFloat(m.querySelector('#cm_f').value) || 0;

      const newFood = {
        id: 'custom_' + Date.now(),
        cat: 'custom',
        nameTh: name,
        nameEn: name,
        portionTh: portion,
        portionEn: portion,
        cal, p, c, f
      };

      MY_FOODS.push(newFood);
      save();
      m.remove();
      if (typeof toast === 'function') toast(isTh ? 'บันทึกเมนูใหม่เรียบร้อยแล้ว' : 'Saved to My Foods');
      openPortionModal(newFood, mealKey);
    };

    document.body.appendChild(m);
  }

  /* ---------- Manual Quick Macro Entry Modal ---------- */
  function openManualFoodModal(mealKey) {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const m = document.createElement('div');
    m.className = 'modal';

    m.innerHTML = `
      <div class="sheet" style="max-width:380px">
        <div class="row" style="margin-bottom:12px">
          <b class="grow" style="font-size:16px">✍️ ${isTh ? 'กรอกตัวเลขสารอาหารด่วน' : 'Manual Macro Entry'}</b>
          <button class="chip mini" id="mm_close">✕</button>
        </div>

        <div style="margin-bottom:8px">
          <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">${isTh ? 'ชื่ออาหาร (ไม่ระบุก็ได้)' : 'Name (optional)'}</label>
          <input type="text" id="mm_name" class="inp" placeholder="${isTh ? 'อาหารมื้อนี้' : 'Meal'}" style="margin:0">
        </div>

        <div class="grid2" style="gap:8px;margin-bottom:14px">
          <div>
            <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">🔥 ${isTh ? 'แคลอรี่ (kcal)' : 'Calories'}</label>
            <input type="number" id="mm_cal" class="inp" placeholder="0" style="margin:0">
          </div>
          <div>
            <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">🍗 ${isTh ? 'โปรตีน (g)' : 'Protein'}</label>
            <input type="number" id="mm_p" class="inp" placeholder="0" style="margin:0">
          </div>
          <div>
            <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">🍚 ${isTh ? 'คาร์บ (g)' : 'Carbs'}</label>
            <input type="number" id="mm_c" class="inp" placeholder="0" style="margin:0">
          </div>
          <div>
            <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">🥑 ${isTh ? 'ไขมัน (g)' : 'Fat'}</label>
            <input type="number" id="mm_f" class="inp" placeholder="0" style="margin:0">
          </div>
        </div>

        <button class="btn" id="mm_save">+ ${isTh ? 'เพิ่มเข้ามื้อนี้' : 'Add to Meal'}</button>
      </div>
    `;

    m.querySelector('#mm_close').onclick = () => m.remove();
    m.querySelector('#mm_save').onclick = () => {
      const name = m.querySelector('#mm_name').value.trim() || (isTh ? 'อาหารที่บันทึก' : 'Quick entry');
      let cal = parseFloat(m.querySelector('#mm_cal').value) || 0;
      const p = parseFloat(m.querySelector('#mm_p').value) || 0;
      const c = parseFloat(m.querySelector('#mm_c').value) || 0;
      const f = parseFloat(m.querySelector('#mm_f').value) || 0;

      // Auto-calculate calories if left 0
      if (!cal && (p || c || f)) {
        cal = Math.round((p * 4) + (c * 4) + (f * 9));
      }

      const day = getDayData();
      if (!day.meals) day.meals = {};
      if (!day.meals[mealKey]) day.meals[mealKey] = [];

      day.meals[mealKey].push({
        id: 'manual_' + Date.now(),
        name,
        cal, p, c, f,
        qty: 1
      });

      save();
      m.remove();
      if (typeof toast === 'function') toast(isTh ? 'บันทึกสำเร็จ' : 'Logged');
      view();
    };

    document.body.appendChild(m);
  }

  /* ---------- Adjust sheet: precise steppers + presets, calories follow the macros ---------- */
  function openAdjustSheet(focus, sign) {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const FIELDS = [
      { k: 'cal', ic: '🔥', th: 'แคลอรี่', en: 'Calories', unit: 'kcal', steps: [10, 50, 100] },
      { k: 'p', ic: '🍗', th: 'โปรตีน', en: 'Protein', unit: 'g', steps: [1, 5, 10] },
      { k: 'c', ic: '🍚', th: 'คาร์บ', en: 'Carbs', unit: 'g', steps: [1, 5, 10] },
      { k: 'f', ic: '🥑', th: 'ไขมัน', en: 'Fat', unit: 'g', steps: [1, 5, 10] }
    ];
    const PRESETS = { cal: [100, 250, 500], p: [10, 20, 25, 30], c: [15, 30, 50], f: [5, 10, 15] };
    const KCAL_PER_G = { p: 4, c: 4, f: 9 };
    const day = getDayData();
    const cur = dayTotals(day);
    const focusKey = FIELDS.some(f => f.k === focus) ? focus : 'p';
    const vals = { cal: 0, p: 0, c: 0, f: 0 };
    let mode = sign < 0 ? -1 : 1;
    let stepIdx = 1;
    let calManual = false; // once calories are typed/stepped by hand they stop following the macros

    const m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = `
      <div class="sheet" style="max-width:420px">
        <div class="row" style="margin-bottom:8px">
          <b class="grow" style="font-size:16px">✏️ ${isTh ? 'ปรับยอดวันนี้' : 'Adjust today'}</b>
          <button class="chip mini" id="aj_close">✕</button>
        </div>
        <div class="seg" style="margin:0 0 8px">
          <button id="aj_add">＋ ${isTh ? 'เพิ่ม' : 'Add'}</button>
          <button id="aj_sub">− ${isTh ? 'ลด' : 'Subtract'}</button>
        </div>
        <div class="row" style="gap:6px;margin-bottom:10px;align-items:center">
          <small style="color:var(--mute)">${isTh ? 'ขนาดก้าว:' : 'Step:'}</small>
          <div class="seg" style="margin:0;flex:1" id="aj_steps">
            <button data-si="0" style="min-height:36px;font-size:12px">${isTh ? 'ละเอียด' : 'Fine'}</button>
            <button data-si="1" style="min-height:36px;font-size:12px">${isTh ? 'ปกติ' : 'Normal'}</button>
            <button data-si="2" style="min-height:36px;font-size:12px">${isTh ? 'เร็ว' : 'Fast'}</button>
          </div>
        </div>
        <div id="aj_presets" class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px"></div>
        ${FIELDS.map(f => `
          <div class="row" style="gap:6px;margin-bottom:8px;padding:4px 6px;border-radius:12px;border:1px solid ${f.k === focusKey ? 'var(--accent)' : 'transparent'}">
            <span style="width:84px;font-size:13px;flex:none">${f.ic} ${isTh ? f.th : f.en}</span>
            <button class="chip" data-step="${f.k}" data-dir="-1" style="width:40px;min-height:40px;padding:0;font-size:20px;flex:none;touch-action:manipulation">−</button>
            <input class="inp" type="number" inputmode="decimal" min="0" step="any" data-val="${f.k}" placeholder="0" style="margin:0;text-align:center;font-weight:700;min-width:0;flex:1">
            <button class="chip" data-step="${f.k}" data-dir="1" style="width:40px;min-height:40px;padding:0;font-size:20px;flex:none;touch-action:manipulation">+</button>
          </div>`).join('')}
        <small id="aj_hint" style="display:block;color:var(--mute);margin:2px 0 8px"></small>
        <div id="aj_preview" style="background:var(--bg);border-radius:10px;padding:8px 10px;font-size:13px;margin-bottom:12px;line-height:1.5"></div>
        <button class="btn" id="aj_save"></button>
      </div>`;

    const q = sel => m.querySelector(sel);
    const round1 = n => Math.round(n * 10) / 10;
    const inputOf = k => q(`[data-val="${k}"]`);
    const stepOf = k => FIELDS.find(f => f.k === k).steps[stepIdx];

    function autoCal() {
      if (calManual) return;
      vals.cal = Math.round(vals.p * KCAL_PER_G.p + vals.c * KCAL_PER_G.c + vals.f * KCAL_PER_G.f);
    }

    function refresh(skipKey) {
      FIELDS.forEach(f => {
        const inp = inputOf(f.k);
        if (f.k !== skipKey) inp.value = vals[f.k] ? vals[f.k] : '';
      });
      q('#aj_add').classList.toggle('on', mode > 0);
      q('#aj_sub').classList.toggle('on', mode < 0);
      m.querySelectorAll('[data-si]').forEach(b => b.classList.toggle('on', +b.dataset.si === stepIdx));
      q('#aj_presets').innerHTML = `<small style="color:var(--mute)">${isTh ? 'ค่าที่ใช้บ่อย:' : 'Common:'}</small>` +
        PRESETS[focusKey].map(v => `<button class="chip" data-preset="${v}">+${v}${FIELDS[0].k === focusKey ? '' : 'g'}</button>`).join('');
      m.querySelectorAll('[data-preset]').forEach(b => {
        b.onclick = () => { bump(focusKey, +b.dataset.preset); };
      });
      q('#aj_hint').textContent = calManual
        ? (isTh ? 'แคลอรี่ตั้งเอง (ไม่คำนวณจากสารอาหาร)' : 'Calories set manually')
        : (isTh ? 'แคลอรี่คำนวณอัตโนมัติ: โปรตีน/คาร์บ ×4, ไขมัน ×9 (แก้เองได้)' : 'Calories auto: protein/carbs ×4, fat ×9 (editable)');

      const rows = FIELDS.filter(f => vals[f.k] > 0).map(f => {
        const delta = mode > 0 ? vals[f.k] : -Math.min(vals[f.k], cur[f.k]);
        const next = Math.max(0, round1(cur[f.k] + delta));
        return `${f.ic} <b>${cur[f.k]}</b> → <b style="color:${mode > 0 ? 'var(--accent)' : 'var(--warn)'}">${next}</b> ${f.unit}`;
      });
      q('#aj_preview').innerHTML = rows.length ? rows.join('<br>') : `<span style="color:var(--mute)">${isTh ? 'ใส่ตัวเลขหรือกด + / − เพื่อดูยอดใหม่' : 'Enter a value or tap + / − to preview the new total'}</span>`;
      const sv = q('#aj_save');
      sv.textContent = (mode > 0 ? '＋ ' : '− ') + (isTh ? (mode > 0 ? 'บันทึกเพิ่ม' : 'บันทึกลด') : (mode > 0 ? 'Add to today' : 'Subtract from today'));
      sv.style.background = mode > 0 ? '' : 'var(--warn)';
    }

    function bump(k, delta) {
      vals[k] = Math.max(0, round1(vals[k] + delta));
      if (k === 'cal') calManual = true; else autoCal();
      refresh();
    }

    // tap = one step, hold = repeat
    m.querySelectorAll('[data-step]').forEach(b => {
      let to = null, iv = null;
      const stop = () => { clearTimeout(to); clearInterval(iv); to = iv = null; };
      b.onpointerdown = e => {
        e.preventDefault();
        const k = b.dataset.step, dir = +b.dataset.dir;
        bump(k, dir * stepOf(k));
        to = setTimeout(() => { iv = setInterval(() => bump(k, dir * stepOf(k)), 110); }, 400);
      };
      ['onpointerup', 'onpointerleave', 'onpointercancel'].forEach(ev => { b[ev] = stop; });
      b.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bump(b.dataset.step, +b.dataset.dir * stepOf(b.dataset.step)); } };
    });

    m.querySelectorAll('[data-val]').forEach(inp => {
      inp.oninput = () => {
        const k = inp.dataset.val;
        vals[k] = Math.max(0, round1(parseFloat(inp.value) || 0));
        if (k === 'cal') calManual = true; else autoCal();
        refresh(k);
      };
    });
    m.querySelectorAll('[data-si]').forEach(b => { b.onclick = () => { stepIdx = +b.dataset.si; refresh(); }; });
    q('#aj_add').onclick = () => { mode = 1; refresh(); };
    q('#aj_sub').onclick = () => { mode = -1; refresh(); };
    q('#aj_close').onclick = () => m.remove();

    q('#aj_save').onclick = () => {
      const entry = { t: Date.now() };
      const parts = [];
      FIELDS.forEach(f => {
        if (!(vals[f.k] > 0)) return;
        // never subtract more than is logged, so a later add isn't hidden by a negative balance
        const amt = round1(mode > 0 ? vals[f.k] : Math.min(vals[f.k], cur[f.k]));
        if (!amt) return;
        entry[f.k] = mode * amt;
        parts.push(`${mode > 0 ? '+' : '−'}${amt}${f.k === 'cal' ? ' kcal' : 'g ' + f.k.toUpperCase()}`);
      });
      if (!parts.length) {
        if (typeof toast === 'function') toast(isTh ? 'ยังไม่ได้ใส่ตัวเลข' : 'Enter a value first');
        return;
      }
      entry.label = parts.join(' · ');
      if (!day.quickAdds) day.quickAdds = [];
      day.quickAdds.push(entry);
      save();
      m.remove();
      if (typeof toast === 'function') toast(isTh ? `บันทึกแล้ว: ${entry.label}` : `Saved: ${entry.label}`);
      view();
    };

    document.body.appendChild(m);
    refresh();
  }

  /* ---------- Macro Targets Customization Modal ---------- */
  function openTargetModal() {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const m = document.createElement('div');
    m.className = 'modal';

    const cur = getMacroTargets();

    m.innerHTML = `
      <div class="sheet" style="max-width:400px">
        <div class="row" style="margin-bottom:12px">
          <b class="grow" style="font-size:16px">⚙️ ${isTh ? 'กำหนดเป้าหมายสารอาหาร' : 'Set Macro Targets'}</b>
          <button class="chip mini" id="tm_close">✕</button>
        </div>
        <p style="font-size:12px;color:var(--mute);margin:0 0 12px">
          ${isTh ? 'ระบบคำนวณจาก TDEE & InBody ของคุณเป็นค่าเริ่มต้น สามารถปรับเปลี่ยนได้ตามต้องการ' : 'Defaults calculated from your TDEE & InBody. Adjust as needed.'}
        </p>

        <div class="grid2" style="gap:8px;margin-bottom:14px">
          <div>
            <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">🔥 ${isTh ? 'แคลอรี่รวม (kcal)' : 'Calories'}</label>
            <input type="number" id="tm_cal" class="inp" value="${cur.cal}" style="margin:0">
          </div>
          <div>
            <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">🍗 ${isTh ? 'โปรตีน (g)' : 'Protein'}</label>
            <input type="number" id="tm_p" class="inp" value="${cur.p}" style="margin:0">
          </div>
          <div>
            <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">🍚 ${isTh ? 'คาร์บ (g)' : 'Carbs'}</label>
            <input type="number" id="tm_c" class="inp" value="${cur.c}" style="margin:0">
          </div>
          <div>
            <label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">🥑 ${isTh ? 'ไขมัน (g)' : 'Fat'}</label>
            <input type="number" id="tm_f" class="inp" value="${cur.f}" style="margin:0">
          </div>
        </div>

        <div class="row" style="gap:8px">
          <button class="btn" id="tm_save" style="flex:1">${isTh ? 'บันทึกเป้าหมาย' : 'Save Targets'}</button>
          <button class="btn ghost w-auto" id="tm_reset">${isTh ? 'รีเซ็ต' : 'Reset'}</button>
        </div>
      </div>
    `;

    m.querySelector('#tm_close').onclick = () => m.remove();

    m.querySelector('#tm_reset').onclick = () => {
      CUSTOM_TARGETS = null;
      if (typeof store !== 'undefined') store.set(KEY_CUSTOM_TARGETS, null);
      m.remove();
      if (typeof toast === 'function') toast(isTh ? 'รีเซ็ตเป้าหมายตาม TDEE & InBody แล้ว' : 'Reset to TDEE defaults');
      view();
    };

    m.querySelector('#tm_save').onclick = () => {
      const cal = parseInt(m.querySelector('#tm_cal').value, 10) || 2000;
      const p = parseInt(m.querySelector('#tm_p').value, 10) || 120;
      const c = parseInt(m.querySelector('#tm_c').value, 10) || 200;
      const f = parseInt(m.querySelector('#tm_f').value, 10) || 50;

      CUSTOM_TARGETS = { cal, p, c, f };
      save();
      m.remove();
      if (typeof toast === 'function') toast(isTh ? 'บันทึกเป้าหมายเรียบร้อยแล้ว' : 'Targets updated');
      view();
    };

    document.body.appendChild(m);
  }

  /* ---------- Key Setup Modal (Claude / Gemini / OpenAI) ---------- */
  function openKeySetupModal() {
    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const m = document.createElement('div');
    m.className = 'modal';

    const curKey = getStoredKey();

    m.innerHTML = `
      <div class="sheet" style="max-width:440px">
        <div class="row" style="margin-bottom:10px">
          <b class="grow" style="font-size:16px">🔑 ${isTh ? 'ตั้งค่า AI API Key' : 'AI API Key Setup'}</b>
          <button class="chip mini" id="km_close">✕</button>
        </div>

        <p style="font-size:12px;color:var(--mute);margin:0 0 10px;line-height:1.4">
          ${isTh
            ? 'แนะนำให้ใช้ <b>Google Gemini API Key ฟรี 100%</b> หรือใช้ Claude / OpenAI คีย์จะถูกเก็บในเครื่องคุณ 100% อย่างปลอดภัย'
            : 'Supports free Google Gemini API key (recommended), Claude or OpenAI. Stored 100% locally.'}
        </p>

        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" class="card" style="display:block;padding:10px 12px;margin-bottom:12px;text-decoration:none;border:1px solid var(--accent);background:var(--soft);border-radius:8px">
          <div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:3px">
            👉 ${isTh ? 'คลิกที่นี่เพื่อรับ Gemini API Key ฟรี (Google AI Studio)' : 'Get Free Gemini API Key here'} ↗
          </div>
          <div style="font-size:11px;color:var(--mute);line-height:1.4">
            ${isTh ? '1. ล็อกอินบัญชี Google แล้วกดปุ่ม <b>"Create API key"</b><br>2. คัดลอกคีย์ที่ขึ้นต้นด้วย <code>AQ...</code> หรือ <code>AIza...</code> มาวางด้านล่างนี้' : '1. Log in and click "Create API key"<br>2. Copy key starting with AQ... or AIza... and paste below'}
          </div>
        </a>

        <div style="margin-bottom:6px">
          <div class="row" style="gap:6px">
            <input type="password" id="km_key" class="inp" placeholder="AQ... หรือ AIza... หรือ sk-..." value="${curKey}" style="margin:0;font-size:13px;flex:1;font-family:monospace">
            <button class="chip" id="km_toggle_vis" style="flex:none;height:auto;padding:6px 10px;font-size:12px" title="${isTh ? 'แสดง/ซ่อนคีย์' : 'Toggle visibility'}">👁️</button>
          </div>
          <div id="km_key_status" style="font-size:12px;margin-top:6px;min-height:16px"></div>
        </div>

        <div class="row" style="gap:8px;margin-top:12px">
          <button class="btn" id="km_save" style="flex:1">${isTh ? 'บันทึกคีย์' : 'Save Key'}</button>
          ${curKey ? `<button class="btn ghost w-auto" id="km_clear" style="color:var(--warn)">${isTh ? 'ลบคีย์ออก' : 'Clear'}</button>` : ''}
        </div>
      </div>
    `;

    const inp = m.querySelector('#km_key');
    const statusEl = m.querySelector('#km_key_status');
    const toggleBtn = m.querySelector('#km_toggle_vis');

    function updateStatus() {
      const val = cleanKey(inp.value);
      if (!val) {
        statusEl.innerHTML = `<span style="color:var(--mute)">${isTh ? 'ยังไม่ได้ระบุคีย์' : 'No key entered'}</span>`;
        return;
      }
      const type = detectKeyType(val);
      if (type === 'gemini') {
        statusEl.innerHTML = `<span style="color:#22c55e;font-weight:600">🟢 ${isTh ? 'ตรวจพบ Google Gemini API Key (ถูกต้อง)' : 'Google Gemini Key detected'}</span>`;
      } else if (type === 'claude') {
        statusEl.innerHTML = `<span style="color:#a855f7;font-weight:600">🟣 ${isTh ? 'ตรวจพบ Anthropic Claude API Key (ถูกต้อง)' : 'Anthropic Claude Key detected'}</span>`;
      } else if (type === 'openai') {
        statusEl.innerHTML = `<span style="color:#10b981;font-weight:600">🟢 ${isTh ? 'ตรวจพบ OpenAI API Key (ถูกต้อง)' : 'OpenAI Key detected'}</span>`;
      } else {
        statusEl.innerHTML = `<span style="color:var(--warn);font-weight:600">⚠️ ${isTh ? 'รูปแบบไม่ตรง (Gemini Key ต้องขึ้นต้นด้วย AQ... หรือ AIza...)' : 'Invalid format (Gemini key must start with AQ... or AIza...)'}</span>`;
      }
    }

    inp.addEventListener('input', updateStatus);
    updateStatus();

    toggleBtn.onclick = () => {
      inp.type = inp.type === 'password' ? 'text' : 'password';
    };

    m.querySelector('#km_close').onclick = () => m.remove();

    if (m.querySelector('#km_clear')) {
      m.querySelector('#km_clear').onclick = () => {
        // only drop the key this module owns; the coach's own Claude key stays untouched
        if (typeof store !== 'undefined') {
          store.set('nutri_key', '');
          store.set('gemini_key', '');
        }
        m.remove();
        if (typeof toast === 'function') toast(isTh ? 'ลบคีย์เรียบร้อยแล้ว' : 'Key removed');
        view();
      };
    }

    m.querySelector('#km_save').onclick = () => {
      const val = cleanKey(inp.value);
      if (!val) {
        if (typeof toast === 'function') toast(isTh ? 'กรุณากรอกคีย์' : 'Key cannot be empty');
        return;
      }
      const type = detectKeyType(val);
      if (typeof store !== 'undefined') {
        store.set('nutri_key', val);
        // a Claude key is shared with the AI coach; a Gemini/OpenAI key must not overwrite the coach's key
        if (type === 'claude') store.set('aikey', val);
      }
      m.remove();
      if (type === 'unknown') {
        if (typeof toast === 'function') toast(isTh ? '⚠️ บันทึกแล้ว แต่รูปแบบอาจไม่ถูกต้อง (Gemini ควรขึ้นต้นด้วย AQ... หรือ AIza...)' : 'Saved (unrecognized format)');
      } else {
        if (typeof toast === 'function') toast(isTh ? 'บันทึก API Key สำเร็จ!' : 'Key saved successfully!');
      }
      view();
    };

    document.body.appendChild(m);
  }

  return {
    load,
    save,
    view,
    getMacroTargets,
    dayTotals,
    get days() { return DAYS; },
    get myFoods() { return MY_FOODS; },
    exportState: () => ({ days: DAYS, myFoods: MY_FOODS, customTargets: CUSTOM_TARGETS }),
    importState: (d) => {
      if (!d || typeof d !== 'object') return;
      if (d.days && typeof d.days === 'object') DAYS = d.days;
      if (Array.isArray(d.myFoods)) MY_FOODS = d.myFoods;
      CUSTOM_TARGETS = (d.customTargets && d.customTargets.cal > 0) ? d.customTargets : null;
      store.set(KEY_DAYS, DAYS); store.set(KEY_MY_FOODS, MY_FOODS); store.set(KEY_CUSTOM_TARGETS, CUSTOM_TARGETS);
    }
  };
})();
