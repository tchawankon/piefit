'use strict';
/* PieFit sound: synthesized effects, spoken cues and a generated workout beat.
   Everything is made with Web Audio at runtime, so it works offline and needs no audio files. */
const Sound = (() => {
  let ctx = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  const MUSIC_LEVEL = .35;
  function ensure(){
    if(!ctx){
      const C = window.AudioContext || window.webkitAudioContext; if(!C) return null;
      ctx = new C();
      master = ctx.createGain(); master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = MUSIC_LEVEL; musicBus.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for(let i = 0; i < d.length; i++) d[i] = Math.random()*2 - 1;
    }
    if(ctx.state === 'suspended') ctx.resume();
    master.gain.value = SET.vol;
    return ctx;
  }
  // browsers only allow audio after a user gesture, so unlock on touches
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { try { ensure(); } catch(e){} }, {passive:true}));

  const N = m => 440 * Math.pow(2, (m - 69) / 12); // midi note -> Hz
  function tone(f, at, dur, o){
    o = Object.assign({type:'sine', gain:.3, to:null, bus:sfxBus}, o);
    const osc = ctx.createOscillator(), g = ctx.createGain();
    let out = g; if(o.lp){ const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(o.lp, at); fl.frequency.linearRampToValueAtTime(o.lp * 3, at + dur * .6); g.connect(fl); out = fl; }
    osc.type = o.type; osc.frequency.setValueAtTime(f, at);
    if(o.to) osc.frequency.exponentialRampToValueAtTime(o.to, at + dur);
    g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(o.gain, at + .01); g.gain.exponentialRampToValueAtTime(.0001, at + dur);
    if(o.vib){ const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 6; lg.gain.value = f * .012;
      l.connect(lg); lg.connect(osc.frequency); l.start(at + .15); l.stop(at + dur); }
    osc.connect(g); out.connect(o.bus); osc.start(at); osc.stop(at + dur + .05);
  }
  function noise(at, dur, gain, type, freq, bus){
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = freq;
    g.gain.setValueAtTime(gain, at); g.gain.exponentialRampToValueAtTime(.0001, at + dur);
    s.connect(f); f.connect(g); g.connect(bus || musicBus); s.start(at, Math.random()*.5); s.stop(at + dur);
  }

  /* ---- sound effects: short, warm, rising = good news, falling = neutral ---- */
  function bell(at, f, gain){ // boxing-ring style bell: inharmonic partials, long ring
    [[1, 1], [2.76, .5], [5.4, .25], [8.9, .12]].forEach(([m, g]) => tone(f * m, at, 1.6 / Math.sqrt(m), {gain:gain * g}));
  }
  function whistle(at, dur){ // coach whistle: high tone with a fast pea-trill
    const o = ctx.createOscillator(), l = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain();
    o.frequency.value = 2900; l.frequency.value = 26; lg.gain.value = 140; l.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(.16, at + .02); g.gain.setValueAtTime(.16, at + dur - .05); g.gain.exponentialRampToValueAtTime(.0001, at + dur);
    o.connect(g); g.connect(sfxBus); o.start(at); l.start(at); o.stop(at + dur + .05); l.stop(at + dur + .05);
    noise(at, dur, .04, 'bandpass', 2900, sfxBus);
  }
  const sq = (n, at, d, g) => tone(N(n), at, d, {type:'square', gain:g || .08});
  // fixed cues (always the same) and selectable cues (the user picks a variant per event in Settings)
  const FIXED = {
    rest:   at => tone(N(72), at, .35, {gain:.12, to:N(60)}),
    tick:   at => tone(N(81), at, .07, {type:'square', gain:.06}),
    target: at => [79, 84, 88].forEach((n, i) => tone(N(n), at + i*.06, .5, {type:'triangle', gain:.18})),
    soft:   at => tone(N(60), at, .18, {gain:.15, to:N(55)})
  };
  const VARIANTS = {
    go: {
      chime:   at => { tone(N(84), at, .12, {gain:.3}); tone(N(88), at + .12, .12, {gain:.3}); tone(N(91), at + .24, .32, {gain:.32}); },
      arcade:  at => { [72, 79, 84].forEach((n, i) => sq(n, at + i*.07, .08)); sq(88, at + .22, .28, .1); },
      whistle: at => { whistle(at, .18); whistle(at + .26, .5); },
      bell:    at => { bell(at, 720, .22); bell(at + .32, 720, .2); }
    },
    log: {
      pop:   at => { tone(N(76), at, .09, {type:'triangle', gain:.22}); tone(N(83), at + .07, .14, {type:'triangle', gain:.2}); },
      blip:  at => tone(N(81), at, .08, {type:'square', gain:.07, to:N(88)}),
      click: at => { noise(at, .03, .25, 'highpass', 3000, sfxBus); tone(1600, at, .04, {gain:.08}); }
    },
    exdone: {
      arcade:  at => { [72, 76, 79, 84, 88].forEach((n, i) => sq(n, at + i*.055, .09, .09)); sq(91, at + .3, .3, .1); tone(N(48), at + .3, .3, {type:'triangle', gain:.25}); },
      chime:   at => [72, 76, 79, 84].forEach((n, i) => tone(N(n), at + i*.09, .35, {type:'triangle', gain:.22})),
      sparkle: at => [88, 91, 96, 100, 103].forEach((n, i) => tone(N(n), at + i*.045, .3, {gain:.13}))
    },
    finish: {
      // original 8-bit victory fanfare: fast run up, "da-da-da DAAA", bright held chord, sparkle
      arcade: at => {
        [67, 72, 76, 79, 84, 88].forEach((n, i) => sq(n, at + i*.05, .08));
        [[.36, [77, 81, 84], 53], [.5, [77, 81, 84], 53], [.64, [79, 83, 86], 55]].forEach(([dt, ch, bn]) => {
          ch.forEach(n => sq(n, at + dt, .11, .07)); tone(N(bn - 12), at + dt, .12, {type:'triangle', gain:.3}); noise(at + dt, .06, .12, 'highpass', 5000, sfxBus); });
        [84, 88, 91].forEach(n => tone(N(n), at + .8, 1.1, {type:'square', gain:.07, vib:true}));
        tone(N(36), at + .8, 1.1, {type:'triangle', gain:.32}); noise(at + .8, .25, .15, 'highpass', 4000, sfxBus);
        [96, 100, 103, 108].forEach((n, i) => sq(n, at + 1.35 + i*.05, .12, .05));
      },
      // brass-style fanfare: I - IV - V - I with a swelling final chord
      brass: at => {
        [[0, [60, 64, 67], .22], [.25, [65, 69, 72], .22], [.5, [67, 71, 74], .22], [.78, [72, 76, 79, 84], 1.3]].forEach(([dt, ch, d]) =>
          ch.forEach(n => tone(N(n), at + dt, d, {type:'sawtooth', gain:.05, lp:900, vib:d > 1})));
        tone(N(36), at + .78, 1.3, {type:'triangle', gain:.3});
      },
      bell:  at => { bell(at, 720, .22); bell(at + .3, 720, .2); bell(at + .6, 720, .24); [84, 88, 91].forEach((n, i) => tone(N(n), at + .9 + i*.1, .8, {gain:.1})); },
      chime: at => { [72, 76, 79].forEach((n, i) => tone(N(n), at + i*.14, .25, {type:'triangle', gain:.24})); [72, 76, 79, 84].forEach(n => tone(N(n), at + .48, 1.3, {gain:.12})); }
    },
    level: {
      sparkle: at => [84, 88, 91, 96, 100].forEach((n, i) => tone(N(n), at + i*.07, .45, {gain:.16})),
      arcade:  at => { [72, 76, 79, 84, 88, 91].forEach((n, i) => sq(n, at + i*.045, .07, .07)); sq(96, at + .3, .35, .08); }
    }
  };
  const THEMES = {
    classic: {go:'chime', log:'pop', exdone:'chime', finish:'chime', level:'sparkle'},
    arcade:  {go:'arcade', log:'blip', exdone:'arcade', finish:'arcade', level:'arcade'},
    coach:   {go:'whistle', log:'click', exdone:'chime', finish:'bell', level:'sparkle'}
  };
  function fnFor(name, variant){
    if(FIXED[name]) return FIXED[name];
    const v = VARIANTS[name]; if(!v) return null;
    const pick = variant || (SET.sfx && SET.sfx[name]);
    return v[pick] || v[Object.keys(v)[0]];
  }
  function duck(sec){
    if(!musicBus) return; const t0 = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(t0); musicBus.gain.setTargetAtTime(.1, t0, .03); musicBus.gain.setTargetAtTime(MUSIC_LEVEL, t0 + (sec || .7), .3);
  }
  function play(name, variant){
    const fn = fnFor(name, variant);
    if(!SET.sound || !fn) return;
    try { if(!ensure()) return; fn(ctx.currentTime + .01); duck(name === 'finish' ? 2 : .7); } catch(e){}
  }
  function vibrate(p){ if(SET.vib && navigator.vibrate){ try { navigator.vibrate(p); } catch(e){} } }
  function say(text){
    if(!SET.voice || !window.speechSynthesis || !text) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text), lang = SET.voiceLang === 'th' ? 'th-TH' : 'en-US';
      u.lang = lang; u.rate = 1.05; u.volume = Math.min(1, SET.vol + .2);
      const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(lang.slice(0, 2)));
      if(v) u.voice = v;
      if(ctx) duck(3);
      speechSynthesis.speak(u);
    } catch(e){}
  }

  /* ---- generated workout beat: Am-F-C-G loop, three energy levels ---- */
  const STYLES = {
    chill: {bpm:88,  kick:[0,10],         hat:[4,12],        hatGain:.04, clap:[],     bass:[0,7,10],               pad:true,  wave:'sine'},
    focus: {bpm:108, kick:[0,8],          hat:[2,6,10,14],   hatGain:.05, clap:[4,12], bass:[0,3,8,11],             pad:true,  wave:'triangle'},
    power: {bpm:128, kick:[0,4,8,12],     hat:[2,6,10,14],   hatGain:.07, clap:[4,12], bass:[0,2,4,6,8,10,12,14],   pad:false, wave:'sawtooth'}
  };
  const PROG = [[57,60,64], [53,57,60], [48,52,55], [55,59,62]];
  let timer = null, style = null, step = 0, nextT = 0, wanted = null;
  function kick(at){
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, at); o.frequency.exponentialRampToValueAtTime(45, at + .12);
    g.gain.setValueAtTime(.5, at); g.gain.exponentialRampToValueAtTime(.0001, at + .25);
    o.connect(g); g.connect(musicBus); o.start(at); o.stop(at + .3);
  }
  function bass(f, at, dur, wave){
    const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = wave; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = 420;
    g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(.18, at + .02); g.gain.exponentialRampToValueAtTime(.0001, at + dur);
    o.connect(fl); fl.connect(g); g.connect(musicBus); o.start(at); o.stop(at + dur + .05);
  }
  function schedule(){
    const S = STYLES[style], six = 60 / S.bpm / 4;
    while(nextT < ctx.currentTime + .2){
      const st = step % 16, chord = PROG[Math.floor(step / 16) % 4];
      if(S.kick.includes(st)) kick(nextT);
      if(S.hat.includes(st)) noise(nextT, .04, S.hatGain, 'highpass', 7000);
      if(S.clap.includes(st)) noise(nextT, .12, .07, 'bandpass', 1500);
      if(S.bass.includes(st)) bass(N(chord[0] - 24), nextT, six * 1.8, S.wave);
      if(S.pad && st === 0) chord.forEach(n => tone(N(n), nextT, six * 16, {gain:.03, bus:musicBus}));
      nextT += six; step++;
    }
  }
  function startMusic(s){
    if(!STYLES[s]) return; try { if(!ensure()) return; } catch(e){ return; }
    stopMusic(); style = wanted = s; step = 0; nextT = ctx.currentTime + .05;
    schedule(); timer = setInterval(schedule, 40);
  }
  function stopMusic(keepWanted){ if(timer) clearInterval(timer); timer = null; style = null; if(!keepWanted) wanted = null; }
  // timers are throttled in the background, so pause the beat instead of letting it stutter
  document.addEventListener('visibilitychange', () => {
    if(document.hidden){ if(timer){ const w = wanted; stopMusic(true); wanted = w; } }
    else if(wanted && !timer) startMusic(wanted);
  });
  return {play, say, vibrate, startMusic, stopMusic, musicOn:() => !!timer, ensure,
    events: () => Object.fromEntries(Object.entries(VARIANTS).map(([k, v]) => [k, Object.keys(v)])), THEMES};
})();
