'use strict';
/* PieFit Calendar: a month view of everything logged per day (strength sets, yoga, habits, food).
   Read-only: it reads LOG, Yoga, Activity, Habits and Nutrition and stores nothing of its own.
   Loaded after nutrition.js and before app.js; rendered as a Progress sub-tab via Calendar.view(box). */
const Calendar = (() => {
  let monthOffset = 0;   // 0 = this month, -1 = last month
  let selected = null;   // 'YYYY-MM-DD' of the tapped day

  const pad = n => String(n).padStart(2, '0');
  const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const COLORS = { lift: 'var(--accent)', yoga: '#1098ad', habit: 'var(--ok)', food: '#fbbf24', weight: '#a855f7', act: '#f97316' };

  function sessLabel(id, isTh) {
    const s = (typeof SESSIONS !== 'undefined') ? SESSIONS.find(x => x.id === id) : null;
    if (s && typeof sessionName === 'function') return `${s.icon} ${sessionName(id)}`;
    if (id === 'cal') return isTh ? '🧪 ทดสอบ' : '🧪 Test';
    return isTh ? '🏋️ ซ้อมอิสระ' : '🏋️ Free session';
  }

  // Everything logged inside one month, indexed by date key
  function collect(first, last) {
    const days = {};
    const day = k => days[k] || (days[k] = { sets: [], yoga: [], act: [], habits: 0, food: null, weight: null, waist: null });
    const from = first.getTime(), to = last.getTime() + 86400000;

    (typeof LOG !== 'undefined' ? LOG : []).forEach(l => {
      if (l.t >= from && l.t < to) day(keyOf(new Date(l.t))).sets.push(l);
    });
    const ylog = (typeof Yoga !== 'undefined' && Yoga.log) ? Yoga.log : [];
    ylog.forEach(y => {
      if (y.t >= from && y.t < to) day(keyOf(new Date(y.t))).yoga.push(y);
    });
    ((typeof Activity !== 'undefined') ? Activity.log : []).forEach(a => {
      if (a.t >= from && a.t < to) day(keyOf(new Date(a.t))).act.push(a);
    });
    ((typeof Body !== 'undefined' && Body.entries) ? Body.entries : []).slice().sort((a, b) => a.t - b.t).forEach(e => {
      if (e.t < from || e.t >= to) return;
      const dd = day(keyOf(new Date(e.t)));   // the last weigh-in of the day wins
      if (typeof e.weight === 'number') dd.weight = e.weight;
      if (typeof e.waist === 'number') dd.waist = e.waist;
    });
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      const k = keyOf(d);
      if (typeof Habits !== 'undefined') {
        const n = Habits.doneCount(k);
        if (n > 0) day(k).habits = n;
      }
      if (typeof Nutrition !== 'undefined' && Nutrition.days[k]) {
        const tot = Nutrition.dayTotals(Nutrition.days[k]);
        if (tot.cal > 0) day(k).food = tot;
      }
    }
    return days;
  }

  function view(box) {
    const isTh = SET.lang === 'th';
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
    const todayKey = keyOf(now);
    const data = collect(first, last);

    const monthName = first.toLocaleDateString(isTh ? 'th-TH' : undefined, { month: 'long', year: 'numeric' });
    const heads = isTh ? ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const lead = (first.getDay() + 6) % 7; // Monday first

    const liftDays = Object.values(data).filter(d => d.sets.length).length;
    const yogaDays = Object.values(data).filter(d => d.yoga.length).length;
    const actDays = Object.values(data).filter(d => d.act.length).length;
    const habitDays = Object.values(data).filter(d => d.habits >= 3).length;
    const foodDays = Object.values(data).filter(d => d.food).length;
    const wList = Object.keys(data).sort().map(k => data[k].weight).filter(v => v != null);
    const wDiff = wList.length > 1 ? Math.round((wList[wList.length - 1] - wList[0]) * 10) / 10 : null;
    const setCount = Object.values(data).reduce((s, d) => s + d.sets.length, 0);

    let cells = '';
    for (let i = 0; i < lead; i++) cells += '<span></span>';
    for (let n = 1; n <= last.getDate(); n++) {
      const k = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(n)}`;
      const d = data[k];
      const future = k > todayKey;
      const dots = d ? [
        d.sets.length ? COLORS.lift : '', d.yoga.length ? COLORS.yoga : '', d.act.length ? COLORS.act : '',
        d.habits >= 3 ? COLORS.habit : '', d.food ? COLORS.food : '', d.weight != null ? COLORS.weight : ''
      ].filter(Boolean).map(c => `<i style="background:${c}"></i>`).join('') : '';
      cells += `<button class="cal-day${k === todayKey ? ' today' : ''}${k === selected ? ' sel' : ''}${d && d.sets.length ? ' lift' : ''}" data-day="${k}" ${future ? 'disabled' : ''} aria-label="${k}">
        <b>${n}</b><span class="cal-dots">${dots}</span></button>`;
    }

    box.innerHTML = `
      <style>
        .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
        .cal-head{text-align:center;font-size:11px;color:var(--mute);padding:2px 0}
        .cal-day{aspect-ratio:1;min-width:0;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink);font-family:inherit;cursor:pointer;padding:2px 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}
        .cal-day b{font-size:13px;font-weight:600}
        .cal-day.lift{background:var(--soft)}
        .cal-day.today{border:2px solid var(--accent)}
        .cal-day.sel{outline:2px solid var(--ink);outline-offset:1px}
        .cal-day:disabled{opacity:.35;cursor:default}
        #cal_next:disabled{opacity:.35;cursor:default}
        .cal-dots{display:flex;gap:2px;height:5px}
        .cal-dots i{width:5px;height:5px;border-radius:50%;display:block}
        .cal-leg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11px;color:var(--mute);margin:10px 0 2px}
        .cal-leg i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px}
      </style>
      <div class="row" style="margin-bottom:10px">
        <button class="chip" id="cal_prev" style="min-width:40px;min-height:40px" aria-label="${isTh ? 'เดือนก่อน' : 'Previous month'}">‹</button>
        <b class="grow" style="text-align:center;font-size:16px">${monthName}</b>
        <button class="chip" id="cal_next" style="min-width:40px;min-height:40px" ${monthOffset >= 0 ? 'disabled' : ''} aria-label="${isTh ? 'เดือนถัดไป' : 'Next month'}">›</button>
      </div>
      <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <span class="chip p">🏋️ ${liftDays} ${isTh ? 'วันซ้อม' : 'training days'}</span>
        <span class="chip">🧘 ${yogaDays} ${isTh ? 'วันโยคะ' : 'yoga days'}</span>
        ${actDays ? `<span class="chip">🏊 ${actDays} ${isTh ? 'วันกิจกรรมอื่น' : 'activity days'}</span>` : ''}
        <span class="chip">✓ ${habitDays} ${isTh ? 'วัน habit ครบ' : 'habit days'}</span>
        <span class="chip">${setCount} ${isTh ? 'เซ็ต' : 'sets'}</span>
        ${wDiff != null ? `<span class="chip">⚖️ ${wDiff > 0 ? '+' : ''}${wDiff} kg</span>` : ''}
      </div>
      <div class="card" style="padding:10px">
        <div class="cal-grid" style="margin-bottom:4px">${heads.map(h => `<div class="cal-head">${h}</div>`).join('')}</div>
        <div class="cal-grid">${cells}</div>
        <div class="cal-leg">
          <span><i style="background:${COLORS.lift}"></i>${isTh ? 'ซ้อมเวท/ห่วง' : 'Strength'}</span>
          <span><i style="background:${COLORS.yoga}"></i>${isTh ? 'โยคะ' : 'Yoga'}</span>
          <span><i style="background:${COLORS.act}"></i>${isTh ? 'กิจกรรมอื่น' : 'Other activity'}</span>
          <span><i style="background:${COLORS.habit}"></i>${isTh ? 'habit ≥ 3' : 'Habits ≥ 3'}</span>
          <span><i style="background:${COLORS.food}"></i>${isTh ? 'บันทึกอาหาร' : 'Food logged'}</span>
          <span><i style="background:${COLORS.weight}"></i>${isTh ? 'ชั่งน้ำหนัก' : 'Weight'}</span>
        </div>
      </div>
      <div id="cal_detail"></div>`;

    box.querySelector('#cal_prev').onclick = () => { monthOffset--; selected = null; view(box); };
    const next = box.querySelector('#cal_next');
    if (monthOffset < 0) next.onclick = () => { monthOffset++; selected = null; view(box); };
    box.querySelectorAll('[data-day]').forEach(b => {
      b.onclick = () => { selected = selected === b.dataset.day ? null : b.dataset.day; view(box); };
    });

    box.querySelector('#cal_detail').innerHTML = detailHTML(selected, data[selected], isTh);
  }

  function detailHTML(key, d, isTh) {
    if (!key) return `<small class="note" style="display:block;margin-top:10px">${isTh ? 'แตะวันที่เพื่อดูรายละเอียดของวันนั้น' : 'Tap a day to see what you did.'}</small>`;
    const [y, m, dd] = key.split('-').map(Number);
    const title = new Date(y, m - 1, dd).toLocaleDateString(isTh ? 'th-TH' : undefined, { weekday: 'long', day: 'numeric', month: 'long' });
    const parts = [];

    if (d && d.sets.length) {
      const bySess = new Map();
      d.sets.forEach(l => { const s = l.sess || ''; if (!bySess.has(s)) bySess.set(s, []); bySess.get(s).push(l); });
      bySess.forEach((ls, sid) => {
        parts.push(`<div style="margin-top:8px"><b>${sessLabel(sid, isTh)}</b> <small>· ${ls.length} ${isTh ? 'เซ็ต' : 'sets'}</small>
          ${ls.map(l => { const x = (typeof EX !== 'undefined') ? EX[l.ex] : null;
            return `<div class="setrow" style="font-size:13px"><span class="grow">${x ? esc(x.name) : esc(l.ex)}</span><b>${x ? fmtSet(x, l.reps, l.w) : l.reps}</b></div>`; }).join('')}</div>`);
      });
    }
    if (d && d.yoga.length) {
      const min = Math.round(d.yoga.reduce((s, y2) => s + (y2.min || 0), 0));
      parts.push(`<div style="margin-top:8px"><b>🧘 ${isTh ? 'โยคะ / ยืดเหยียด' : 'Yoga / stretching'}</b> <small>· ${d.yoga.length} ${isTh ? 'ครั้ง' : 'sessions'} · ${min} ${isTh ? 'นาที' : 'min'}</small></div>`);
    }
    if (d && d.act.length) {
      const kc = d.act.reduce((s, a) => s + a.kcal, 0);
      parts.push(`<div style="margin-top:8px"><b>🏊 ${isTh ? 'กิจกรรมอื่น' : 'Other activities'}</b> <small>· ${kc} kcal</small>
        ${d.act.map(a => `<div class="setrow" style="font-size:13px"><span class="grow">${Activity.label(a)}</span><b>${a.min} ${isTh ? 'นาที' : 'min'}</b></div>`).join('')}</div>`);
    }
    if (d && d.habits > 0) {
      parts.push(`<div style="margin-top:8px"><b>📋 Habits</b> <small>· ${d.habits}/5 ${isTh ? 'ข้อ' : 'done'}</small></div>`);
    }
    if (d && d.food) {
      parts.push(`<div style="margin-top:8px"><b>🥗 ${isTh ? 'อาหาร' : 'Food'}</b> <small>· ${d.food.cal.toLocaleString()} kcal · P ${d.food.p}g · C ${d.food.c}g · F ${d.food.f}g</small></div>`);
    }
    if (d && d.weight != null) {
      parts.push(`<div style="margin-top:8px"><b>⚖️ ${isTh ? 'น้ำหนัก' : 'Weight'}</b> <small>· ${d.weight} kg${d.waist != null ? ` · ${isTh ? 'เอว' : 'waist'} ${d.waist} cm` : ''}</small></div>`);
    }
    if (!parts.length) parts.push(`<small style="display:block;margin-top:6px;color:var(--mute)">${isTh ? 'ไม่มีบันทึกในวันนี้' : 'Nothing logged this day.'}</small>`);

    return `<div class="card" style="margin-top:10px"><b>${title}</b>${parts.join('')}</div>`;
  }

  function resetToToday() { monthOffset = 0; selected = null; }

  return { view, resetToToday };
})();
