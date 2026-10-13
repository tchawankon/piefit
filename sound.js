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
    osc.type = o.type; osc.frequency.setValueAtTime(f, at);
    if(o.to) osc.frequency.exponentialRampToValueAtTime(o.to, at + dur);
    g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(o.gain, at + .01); g.gain.exponentialRampToValueAtTime(.0001, at + dur);
    osc.connect(g); g.connect(o.bus); osc.start(at); osc.stop(at + dur + .05);
  }
  function noise(at, dur, gain, type, freq){
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = freq;
    g.gain.setValueAtTime(gain, at); g.gain.exponentialRampToValueAtTime(.0001, at + dur);
    s.connect(f); f.connect(g); g.connect(musicBus); s.start(at, Math.random()*.5); s.stop(at + dur);
  }

  /* ---- sound effects: short, warm, rising = good news, falling = neutral ---- */
  const SFX = {
    log:    at => { tone(N(76), at, .09, {type:'triangle', gain:.22}); tone(N(83), at + .07, .14, {type:'triangle', gain:.2}); },
    rest:   at => tone(N(72), at, .35, {gain:.12, to:N(60)}),
    tick:   at => tone(N(81), at, .07, {type:'square', gain:.06}),
    go:     at => { tone(N(84), at, .12, {gain:.3}); tone(N(88), at + .12, .12, {gain:.3}); tone(N(91), at + .24, .32, {gain:.32}); },
    target: at => [79, 84, 88].forEach((n, i) => tone(N(n), at + i*.06, .5, {type:'triangle', gain:.18})),
    exdone: at => [72, 76, 79, 84].forEach((n, i) => tone(N(n), at + i*.09, .35, {type:'triangle', gain:.22})),
    finish: at => { [72, 76, 79].forEach((n, i) => tone(N(n), at + i*.14, .25, {type:'triangle', gain:.24}));
                    [72, 76, 79, 84].forEach(n => tone(N(n), at + .48, 1.3, {gain:.12})); },
    level:  at => [84, 88, 91, 96, 100].forEach((n, i) => tone(N(n), at + i*.07, .45, {gain:.16})),
    soft:   at => tone(N(60), at, .18, {gain:.15, to:N(55)})
  };
  function duck(sec){
    if(!musicBus) return; const t0 = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(t0); musicBus.gain.setTargetAtTime(.1, t0, .03); musicBus.gain.setTargetAtTime(MUSIC_LEVEL, t0 + (sec || .7), .3);
  }
  function play(name){
    if(!SET.sound || !SFX[name]) return;
    try { if(!ensure()) return; SFX[name](ctx.currentTime + .01); duck(); } catch(e){}
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
  return {play, say, vibrate, startMusic, stopMusic, musicOn:() => !!timer, ensure};
})();
