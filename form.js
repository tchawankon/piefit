'use strict';
/* PieFit form check: records a set with the camera (or opens a video file), runs MediaPipe pose detection
   on the device, counts reps and checks depth / lockout / body line. Nothing is uploaded anywhere. */
const Form = (() => {
  const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0';
  const MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
  let landmarker = null, loading = null;
  async function getLandmarker(){
    if(landmarker) return landmarker;
    if(!loading) loading = (async () => {
      const {FilesetResolver, PoseLandmarker} = await import(MP + '/vision_bundle.mjs');
      const files = await FilesetResolver.forVisionTasks(MP + '/wasm');
      const opts = d => ({baseOptions:{modelAssetPath:MODEL, delegate:d}, runningMode:'VIDEO', numPoses:1});
      try { landmarker = await PoseLandmarker.createFromOptions(files, opts('GPU')); }
      catch(e){ landmarker = await PoseLandmarker.createFromOptions(files, opts('CPU')); }
      return landmarker;
    })().catch(e => { loading = null; throw e; });
    return loading;
  }

  /* ---------- exercise families: which angle to track and what counts as good ---------- */
  const FAM = {
    push:   {ids:['pushup','inclinepush','floorpush','diamond','trxpush'], m:'elbow', down:125, up:150, depth:95, lock:155, line:true},
    press:  {ids:['bbbench','dbbench','machpress'], m:'elbow', down:125, up:150, depth:95, lock:155},
    ohp:    {ids:['dbshoulder','bbohp','machshoulder','pikefloor','pike'], m:'elbow', down:125, up:150, depth:95, lock:160},
    squat:  {ids:['bwsquat','goblet','bbsquat','ringsquat','trxsquat'], m:'knee', down:140, up:160, depth:95, lock:160, lean:true},
    lunge:  {ids:['split','dbsplit','revlunge','trxlunge'], m:'kneeMin', down:135, up:155, depth:100, lock:150},
    pull:   {ids:['pullup','pullupbar','chinup','negpull','negbar'], m:'elbow', down:125, up:150, depth:80, lock:155, chin:true},
    row:    {ids:['row','australian','trxrow','bbrow','dbrow','cablerow'], m:'elbow', down:125, up:150, depth:90, lock:150},
    dip:    {ids:['dip','bardip'], m:'elbow', down:130, up:150, depth:95, lock:155},
    curl:   {ids:['dbcurl','curl','trxcurl'], m:'elbow', down:115, up:140, depth:60, lock:150},
    plank:  {ids:['plank'], hold:'line'},
    support:{ids:['support','rtosupport'], hold:'lock'},
    lsit:   {ids:['lsit','tucksit'], hold:'lsit'}
  };
  const famOf = id => Object.keys(FAM).find(k => FAM[k].ids.includes(id)) || null;

  /* ---------- geometry ---------- */
  const SIDE = {L:{s:11, e:13, w:15, h:23, k:25, a:27}, R:{s:12, e:14, w:16, h:24, k:26, a:28}};
  function angle(a, b, c, ar){
    const v1x = (a.x - b.x) * ar, v1y = a.y - b.y, v2x = (c.x - b.x) * ar, v2y = c.y - b.y;
    const d = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y); if(!d) return null;
    return Math.acos(Math.max(-1, Math.min(1, (v1x*v2x + v1y*v2y) / d))) * 180 / Math.PI;
  }
  const vis = (lm, i) => lm[i] && (lm[i].visibility == null || lm[i].visibility > .5);
  function pickSide(lm){
    const sc = S => Object.values(S).reduce((s, i) => s + (lm[i] ? (lm[i].visibility || 0) : 0), 0);
    return sc(SIDE.L) >= sc(SIDE.R) ? SIDE.L : SIDE.R;
  }
  // everything we measure on one frame
  function measure(lm, ar){
    const S = pickSide(lm), P = i => lm[i], ok = (...is) => is.every(i => vis(lm, i));
    const r = {};
    if(ok(S.s, S.e, S.w)) r.elbow = angle(P(S.s), P(S.e), P(S.w), ar);
    if(ok(S.h, S.k, S.a)) r.knee = angle(P(S.h), P(S.k), P(S.a), ar);
    const k1 = ok(23, 25, 27) ? angle(P(23), P(25), P(27), ar) : null, k2 = ok(24, 26, 28) ? angle(P(24), P(26), P(28), ar) : null;
    if(k1 != null || k2 != null) r.kneeMin = Math.min(k1 ?? 999, k2 ?? 999);
    if(ok(S.s, S.h, S.a)){
      r.line = angle(P(S.s), P(S.h), P(S.a), ar);
      // hip below the shoulder-ankle line (image y grows downward) = sagging, above = piking
      const sh = P(S.s), an = P(S.a), hp = P(S.h), f = (hp.x - sh.x) / ((an.x - sh.x) || 1e-6), ly = sh.y + f * (an.y - sh.y);
      r.sag = hp.y > ly;
    }
    if(ok(S.s, S.h, S.k)) r.hip = angle(P(S.s), P(S.h), P(S.k), ar);
    if(ok(S.s, S.h)){ const dx = (P(S.s).x - P(S.h).x) * ar, dy = P(S.h).y - P(S.s).y; r.lean = Math.abs(Math.atan2(dx, dy) * 180 / Math.PI); }
    if(ok(0, S.w)) r.chin = P(0).y < P(S.w).y + .01;
    if(ok(S.h, S.k)) r.hipBelowKnee = P(S.h).y >= P(S.k).y - .01;
    return r;
  }

  /* ---------- rep counter / hold timer ---------- */
  function analyzer(fam){
    const F = FAM[fam], st = {state:null, v:null, cur:null, topMax:0, lastTopMax:0, reps:[], holdGood:0, holdAll:0, lastT:null};
    function issuesOf(rep){
      const out = [];
      if(F.depth != null && rep.min > F.depth) out.push(fam === 'pull' ? 'top' : fam === 'row' || fam === 'curl' ? 'squeeze' : 'depth');
      if(F.lock != null && rep.lockMax < F.lock) out.push('lock');
      if(F.line && rep.lineMin < 160) out.push(rep.sagged ? 'sag' : 'pike');
      if(F.lean && rep.leanMax > 55) out.push('lean');
      if(F.chin && !rep.chin) out.push('chin');
      if(fam === 'squat' && rep.min > F.depth && rep.hipBelow) out.splice(out.indexOf('depth'), 1);
      return out;
    }
    function step(r, ts){
      if(F.hold){
        const dt = st.lastT == null ? 0 : Math.min(.5, (ts - st.lastT) / 1000); st.lastT = ts;
        let good = null;
        if(F.hold === 'line' && r.line != null) good = r.line >= 160;
        if(F.hold === 'lock' && r.elbow != null) good = r.elbow >= 160;
        if(F.hold === 'lsit' && r.hip != null) good = r.hip >= 55 && r.hip <= 120;
        if(good != null){ st.holdAll += dt; if(good) st.holdGood += dt; }
        return {good};
      }
      const raw = r[F.m]; if(raw == null) return null;
      st.v = st.v == null ? raw : st.v * .6 + raw * .4; const v = st.v;
      if(st.state == null) st.state = v > F.up ? 'top' : 'bottom';
      if(st.state === 'top'){
        st.topMax = Math.max(st.topMax, v);
        if(v < F.down){ st.state = 'bottom'; st.lastTopMax = st.topMax; st.cur = {min:v, lineMin:r.line ?? 180, sagged:!!r.sag, leanMax:r.lean || 0, chin:!!r.chin, hipBelow:!!r.hipBelowKnee}; }
      } else {
        if(!st.cur) st.cur = {min:v, lineMin:180, sagged:false, leanMax:0, chin:false, hipBelow:false};
        const c = st.cur; c.min = Math.min(c.min, v);
        if(r.line != null && r.line < c.lineMin){ c.lineMin = r.line; c.sagged = !!r.sag; }
        c.leanMax = Math.max(c.leanMax, r.lean || 0); c.chin = c.chin || !!r.chin; c.hipBelow = c.hipBelow || !!r.hipBelowKnee;
        if(v > F.up){
          const rep = Object.assign({}, c, {lockMax: st.lastTopMax || v}); rep.issues = issuesOf(rep);
          st.reps.push(rep); st.state = 'top'; st.topMax = v; st.cur = null;
          return {rep};
        }
      }
      return null;
    }
    return {step, st, F};
  }

  /* ---------- drawing ---------- */
  const BONES = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
  function draw(cv, lm){
    const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); if(!lm) return;
    g.lineWidth = Math.max(3, cv.width / 180); g.strokeStyle = '#ff8a4c'; g.fillStyle = '#ffffff';
    BONES.forEach(([a, b]) => { if(vis(lm, a) && vis(lm, b)){ g.beginPath(); g.moveTo(lm[a].x * cv.width, lm[a].y * cv.height); g.lineTo(lm[b].x * cv.width, lm[b].y * cv.height); g.stroke(); } });
    [0,11,12,13,14,15,16,23,24,25,26,27,28].forEach(i => { if(vis(lm, i)){ g.beginPath(); g.arc(lm[i].x * cv.width, lm[i].y * cv.height, g.lineWidth * 1.2, 0, 7); g.fill(); } });
  }

  /* ---------- UI ---------- */
  function open(exId, onUse){
    const x = EX[exId], fam = famOf(exId), o = document.createElement('div'); o.className = 'modal formm';
    const S = {stream:null, rec:null, chunks:[], blob:null, url:null, running:false, an:null, raf:0, front:false, lastSay:0};
    const close = () => { stopAll(); if(S.url) URL.revokeObjectURL(S.url); o.remove(); };
    o.innerHTML = `<div class="sheet">
      <div class="row"><h3 class="grow">🎥 ${x.name}</h3><button class="chip" data-x>✕</button></div>
      <p class="sub" style="margin:4px 0 8px">${fam ? t('fc_auto') : t('fc_manual_only')}</p>
      <details class="card how"><summary>${t('fc_setup')}</summary><ul class="cues"><li>${t('fc_tip1')}</li><li>${t('fc_tip2')}</li><li>${t('fc_tip3')}</li></ul></details>
      <div class="stage"><video playsinline muted id="fv"></video><canvas id="fcv"></canvas>
        <div class="hud"><b id="freps">${fam && FAM[fam].hold ? '0s' : '0'}</b><small id="fmsg"></small></div></div>
      <div class="row gap" id="fctl" style="margin-top:8px">
        <button class="btn" data-cam>📷 ${t('fc_camera')}</button>
        <label class="btn ghost" style="text-align:center">📁 ${t('fc_file')}<input type="file" accept="video/*" data-file hidden></label></div>
      <div id="fres"></div></div>`;
    document.body.appendChild(o);
    const $o = s => o.querySelector(s), video = $o('#fv'), cv = $o('#fcv'), msg = $o('#fmsg'), repsEl = $o('#freps');
    o.querySelector('[data-x]').onclick = close;
    const setMsg = m => { msg.textContent = m; };

    function stopAll(){
      S.running = false; cancelAnimationFrame(S.raf);
      if(S.rec && S.rec.state !== 'inactive') S.rec.stop();
      if(S.stream){ S.stream.getTracks().forEach(tr => tr.stop()); S.stream = null; }
    }
    async function prepare(){
      if(!fam) return null;
      setMsg(t('fc_loading'));
      try { const lmk = await getLandmarker(); setMsg(''); return lmk; }
      catch(e){ setMsg(navigator.onLine === false ? t('fc_offline') : t('fc_loadfail')); return null; }
    }
    function loop(lmk){
      const tick = () => {
        if(!S.running) return;
        if(video.readyState >= 2 && !video.paused && !video.ended){
          cv.width = video.videoWidth; cv.height = video.videoHeight;
          let res = null; try { res = lmk.detectForVideo(video, performance.now()); } catch(e){}
          const lm = res && res.landmarks && res.landmarks[0];
          draw(cv, lm);
          if(lm){
            const out = S.an.step(measure(lm, video.videoWidth / video.videoHeight), performance.now());
            if(S.an.F.hold){ repsEl.textContent = Math.round(S.an.st.holdGood) + 's'; if(out && out.good === false) setMsg(t('fi_hold_bad')); else if(out) setMsg(''); }
            else if(out && out.rep){
              const n = S.an.st.reps.length; repsEl.textContent = n;
              setMsg(out.rep.issues.length ? out.rep.issues.map(i => t('fi_' + i)).join(' · ') : '✓ ' + t('fc_goodrep'));
              Sound.play(out.rep.issues.length ? 'tick' : 'log');
              if(Date.now() - S.lastSay > 900){ S.lastSay = Date.now(); Sound.say(out.rep.issues.length ? tv('fv_' + out.rep.issues[0]) : String(n)); }
            }
          } else setMsg(t('fc_nobody'));
        }
        if(video.ended){ finish(); return; }
        S.raf = requestAnimationFrame(tick);
      };
      S.raf = requestAnimationFrame(tick);
    }
    async function startCamera(){
      try {
        S.stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:S.front ? 'user' : 'environment', width:{ideal:720}, height:{ideal:1280}}, audio:false});
      } catch(e){ setMsg(t('fc_nocam')); return; }
      video.srcObject = S.stream; video.muted = true; await video.play().catch(() => {});
      $o('#fctl').innerHTML = `<button class="btn" data-rec>⏺ ${t('fc_start')}</button><button class="btn ghost w-auto" data-flip>🔄</button>`;
      $o('[data-flip]').onclick = () => { stopAll(); S.front = !S.front; startCamera(); };
      $o('[data-rec]').onclick = async () => {
        const lmk = await prepare();
        S.an = fam ? analyzer(fam) : null; S.chunks = [];
        try { S.rec = new MediaRecorder(S.stream); S.rec.ondataavailable = e => { if(e.data.size) S.chunks.push(e.data); };
          S.rec.onstop = () => { S.blob = new Blob(S.chunks, {type:S.rec.mimeType || 'video/webm'}); showResult(); }; S.rec.start(500); }
        catch(e){ S.rec = null; }
        S.running = true; Sound.play('go');
        $o('#fctl').innerHTML = `<button class="btn" data-stop>⏹ ${t('fc_stop')}</button>`;
        $o('[data-stop]').onclick = finish;
        if(lmk) loop(lmk);
      };
    }
    async function startFile(file){
      stopAll(); S.blob = file; if(S.url) URL.revokeObjectURL(S.url); S.url = URL.createObjectURL(file);
      video.srcObject = null; video.src = S.url; video.muted = true;
      const lmk = await prepare();
      if(!lmk){ showResult(); return; }
      S.an = analyzer(fam); S.running = true;
      $o('#fctl').innerHTML = `<button class="btn ghost" data-stop>⏹ ${t('fc_stop')}</button>`;
      $o('[data-stop]').onclick = finish;
      await video.play().catch(() => {}); loop(lmk);
    }
    function finish(){
      const wasRec = S.rec && S.rec.state !== 'inactive';
      stopAll();
      if(!wasRec) showResult();
    }
    function showResult(){
      if(S.blob && !S.url) S.url = URL.createObjectURL(S.blob);
      const an = S.an, F = an && an.F, cues = exText(exId, 'cues');
      let summary = '', useVal = null;
      if(an && F.hold){
        const good = Math.round(an.st.holdGood), all = Math.round(an.st.holdAll); useVal = good;
        summary = `<b class="plan">${t('fc_hold_res', good, all)}</b>`;
      } else if(an){
        const reps = an.st.reps, good = reps.filter(r => !r.issues.length).length; useVal = reps.length;
        const counts = {}; reps.forEach(r => r.issues.forEach(i => counts[i] = (counts[i] || 0) + 1));
        summary = `<b class="plan">${t('fc_reps_res', reps.length, good)}</b>
          ${Object.keys(counts).length ? `<div class="chips">${Object.entries(counts).map(([i, n]) => `<span class="chip p">${t('fi_' + i)} × ${n}</span>`).join('')}</div>` : ''}
          ${reps.length ? `<div class="sets">${reps.map((r, i) => `<div class="setrow"><span class="num">${i + 1}</span><small class="grow">${r.issues.length ? r.issues.map(k => t('fi_' + k)).join(' · ') : '✓ ' + t('fc_goodrep')}</small><small>${Math.round(r.min)}°</small></div>`).join('')}</div>` : `<small>${t('fc_norep')}</small>`}`;
      }
      $o('#fres').innerHTML = `${summary ? `<div class="card">${summary}<br><small>${t('fc_accuracy')}</small></div>` : ''}
        ${useVal ? `<button class="btn" data-use>✓ ${t('fc_use', useVal + (F && F.hold ? 's' : ''))}</button>` : ''}
        ${S.url ? `<div class="card"><b>${t('fc_replay')}</b><div class="row gap" style="margin-top:8px">
            ${[1, .5, .25].map(r => `<button class="chip" data-rate="${r}">${r}×</button>`).join('')}
            <button class="chip" data-fr="-1">◀ ${t('fc_frame')}</button><button class="chip" data-fr="1">${t('fc_frame')} ▶</button></div>
            <a class="vid" data-save>💾 ${t('fc_save')}</a></div>` : ''}
        <div class="card"><b>${t('fc_check')}</b>${guideBlock(exId, 'fcfig')}${cues.map((c, i) => `<label class="row" style="margin:6px 0"><input type="checkbox"> <small>${c}</small></label>`).join('')}</div>
        <button class="btn ghost" data-again>↺ ${t('fc_again')}</button>`;
      startAnim(document.getElementById('fcfig'), x.anim, {areas:x.p});
      if(S.url){
        video.srcObject = null; video.src = S.url; video.controls = true; video.muted = true;
        cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
        o.querySelectorAll('[data-rate]').forEach(b => b.onclick = () => { video.playbackRate = +b.dataset.rate; video.play().catch(() => {}); });
        o.querySelectorAll('[data-fr]').forEach(b => b.onclick = () => { video.pause(); video.currentTime = Math.max(0, video.currentTime + +b.dataset.fr / 30); });
        const sv = o.querySelector('[data-save]');
        sv.href = S.url; sv.download = 'piefit-' + exId + '-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + (S.blob && S.blob.type.includes('mp4') ? '.mp4' : '.webm');
      }
      const use = o.querySelector('[data-use]'); if(use) use.onclick = () => { onUse && onUse(useVal); close(); };
      o.querySelector('[data-again]').onclick = () => { close(); open(exId, onUse); };
      $o('#fctl').innerHTML = '';
    }
    $o('[data-cam]').onclick = startCamera;
    $o('[data-file]').onchange = e => { if(e.target.files[0]) startFile(e.target.files[0]); };
  }
  return {open, famOf, FAM, measure, analyzer};
})();
