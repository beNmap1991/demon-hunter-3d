let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;

function ctx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function master(): GainNode {
  const c = ctx();
  if (!_master) {
    _master = c.createGain();
    _master.gain.value = 0.65;
    _master.connect(c.destination);
  }
  return _master;
}

function makeNoise(c: AudioContext, duration: number): AudioBufferSourceNode {
  const size = Math.ceil(c.sampleRate * duration);
  const buf = c.createBuffer(1, size, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

function distortCurve(amount: number): Float32Array {
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

// ─── GUNSHOT ────────────────────────────────────────────────────────────────
export function playGunshot() {
  try {
    const c = ctx();
    const m = master();
    const t = c.currentTime;

    // Low body thump
    const thump = c.createOscillator();
    const thumpGain = c.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(130, t);
    thump.frequency.exponentialRampToValueAtTime(28, t + 0.13);
    thumpGain.gain.setValueAtTime(1.8, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    thump.connect(thumpGain);
    thumpGain.connect(m);
    thump.start(t);
    thump.stop(t + 0.13);

    // High crack
    const crack = makeNoise(c, 0.06);
    const crackHp = c.createBiquadFilter();
    crackHp.type = 'highpass';
    crackHp.frequency.value = 3000;
    const crackGain = c.createGain();
    crackGain.gain.setValueAtTime(0.9, t);
    crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    crack.connect(crackHp);
    crackHp.connect(crackGain);
    crackGain.connect(m);
    crack.start(t);

    // Mid body noise
    const body = makeNoise(c, 0.18);
    const bodyBp = c.createBiquadFilter();
    bodyBp.type = 'bandpass';
    bodyBp.frequency.value = 700;
    bodyBp.Q.value = 0.8;
    const bodyGain = c.createGain();
    bodyGain.gain.setValueAtTime(0.5, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    body.connect(bodyBp);
    bodyBp.connect(bodyGain);
    bodyGain.connect(m);
    body.start(t);
  } catch (_) {}
}

// ─── BULLET IMPACT ──────────────────────────────────────────────────────────
export function playBulletImpact() {
  try {
    const c = ctx();
    const m = master();
    const t = c.currentTime;

    const n = makeNoise(c, 0.07);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1100;
    bp.Q.value = 1.2;
    const g = c.createGain();
    g.gain.setValueAtTime(0.45, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    n.connect(bp);
    bp.connect(g);
    g.connect(m);
    n.start(t);

    // Short tick
    const tick = c.createOscillator();
    const tg = c.createGain();
    tick.frequency.setValueAtTime(900, t);
    tick.frequency.exponentialRampToValueAtTime(200, t + 0.04);
    tg.gain.setValueAtTime(0.25, t);
    tg.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    tick.connect(tg);
    tg.connect(m);
    tick.start(t);
    tick.stop(t + 0.04);
  } catch (_) {}
}

// ─── ENEMY DEATH ────────────────────────────────────────────────────────────
export function playEnemyDeath() {
  try {
    const c = ctx();
    const m = master();
    const t = c.currentTime;

    // Distorted descending growl
    const growl = c.createOscillator();
    const growlGain = c.createGain();
    const dist = c.createWaveShaper();
    dist.curve = distortCurve(280);
    growl.type = 'sawtooth';
    growl.frequency.setValueAtTime(220, t);
    growl.frequency.exponentialRampToValueAtTime(35, t + 0.45);
    growlGain.gain.setValueAtTime(0.55, t);
    growlGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    growl.connect(dist);
    dist.connect(growlGain);
    growlGain.connect(m);
    growl.start(t);
    growl.stop(t + 0.45);

    // Explosion noise tail
    const burst = makeNoise(c, 0.22);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1800;
    const bg = c.createGain();
    bg.gain.setValueAtTime(0.35, t);
    bg.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    burst.connect(lp);
    lp.connect(bg);
    bg.connect(m);
    burst.start(t);
  } catch (_) {}
}

// ─── POWERUP PICKUP ─────────────────────────────────────────────────────────
export function playPowerupPickup() {
  try {
    const c = ctx();
    const m = master();

    // Rising C major arpeggio
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const t = c.currentTime + i * 0.075;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.28, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(g);
      g.connect(m);
      osc.start(t);
      osc.stop(t + 0.18);

      // Shimmer overtone
      const osc2 = c.createOscillator();
      const g2 = c.createGain();
      osc2.type = 'triangle';
      osc2.frequency.value = freq * 2;
      g2.gain.setValueAtTime(0, t);
      g2.gain.linearRampToValueAtTime(0.1, t + 0.015);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc2.connect(g2);
      g2.connect(m);
      osc2.start(t);
      osc2.stop(t + 0.12);
    });
  } catch (_) {}
}

// ─── PLAYER DAMAGE ──────────────────────────────────────────────────────────
export function playPlayerDamage() {
  try {
    const c = ctx();
    const m = master();
    const t = c.currentTime;

    // Heavy impact thud
    const thud = c.createOscillator();
    const tg = c.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(95, t);
    thud.frequency.exponentialRampToValueAtTime(35, t + 0.22);
    tg.gain.setValueAtTime(1.2, t);
    tg.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    thud.connect(tg);
    tg.connect(m);
    thud.start(t);
    thud.stop(t + 0.22);

    // Dissonant sting
    const sting = c.createOscillator();
    const sg = c.createGain();
    sting.type = 'sawtooth';
    sting.frequency.setValueAtTime(185, t);
    sting.frequency.exponentialRampToValueAtTime(90, t + 0.15);
    sg.gain.setValueAtTime(0.3, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    const sdist = c.createWaveShaper();
    sdist.curve = distortCurve(180);
    sting.connect(sdist);
    sdist.connect(sg);
    sg.connect(m);
    sting.start(t);
    sting.stop(t + 0.15);

    // Low noise scrape
    const scrape = makeNoise(c, 0.18);
    const slp = c.createBiquadFilter();
    slp.type = 'lowpass';
    slp.frequency.value = 500;
    const scrapeGain = c.createGain();
    scrapeGain.gain.setValueAtTime(0.4, t);
    scrapeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    scrape.connect(slp);
    slp.connect(scrapeGain);
    scrapeGain.connect(m);
    scrape.start(t);
  } catch (_) {}
}

// ─── RELOAD ─────────────────────────────────────────────────────────────────
export function playReload() {
  try {
    const c = ctx();
    const m = master();

    // Magazine eject clunk at t=0
    const t0 = c.currentTime;
    const clunk1 = makeNoise(c, 0.08);
    const cf1 = c.createBiquadFilter();
    cf1.type = 'bandpass';
    cf1.frequency.value = 400;
    cf1.Q.value = 2;
    const cg1 = c.createGain();
    cg1.gain.setValueAtTime(0.5, t0);
    cg1.gain.exponentialRampToValueAtTime(0.001, t0 + 0.08);
    clunk1.connect(cf1); cf1.connect(cg1); cg1.connect(m);
    clunk1.start(t0);

    // Magazine insert clunk at t=0.7s
    const t1 = t0 + 0.7;
    const clunk2 = makeNoise(c, 0.09);
    const cf2 = c.createBiquadFilter();
    cf2.type = 'bandpass';
    cf2.frequency.value = 350;
    cf2.Q.value = 2.5;
    const cg2 = c.createGain();
    cg2.gain.setValueAtTime(0.6, t1);
    cg2.gain.exponentialRampToValueAtTime(0.001, t1 + 0.09);
    clunk2.connect(cf2); cf2.connect(cg2); cg2.connect(m);
    clunk2.start(t1);

    // Charging handle snap at t=1.2s
    const t2 = t0 + 1.2;
    const snap = makeNoise(c, 0.05);
    const sf = c.createBiquadFilter();
    sf.type = 'highpass';
    sf.frequency.value = 2500;
    const sg = c.createGain();
    sg.gain.setValueAtTime(0.45, t2);
    sg.gain.exponentialRampToValueAtTime(0.001, t2 + 0.05);
    snap.connect(sf); sf.connect(sg); sg.connect(m);
    snap.start(t2);
  } catch (_) {}
}

// ─── AMBIENT HUM ────────────────────────────────────────────────────────────
interface AmbientNodes {
  oscs: OscillatorNode[];
  gain: GainNode;
}
let _ambient: AmbientNodes | null = null;

export function startAmbient() {
  try {
    if (_ambient) return;
    const c = ctx();
    const m = master();

    const gain = c.createGain();
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, c.currentTime + 2.5);
    gain.connect(m);

    const freqs = [55, 55.5, 110.3]; // Deep A + slight detune + octave → beating effect
    const oscs: OscillatorNode[] = freqs.map((f, i) => {
      const osc = c.createOscillator();
      osc.type = i === 2 ? 'triangle' : 'sine';
      osc.frequency.value = f;

      // Slow LFO on each
      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      lfo.frequency.value = 0.12 + i * 0.07;
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(gain);
      osc.start();
      return osc;
    });

    _ambient = { oscs, gain };
  } catch (_) {}
}

export function stopAmbient() {
  try {
    if (!_ambient) return;
    const c = ctx();
    _ambient.gain.gain.cancelScheduledValues(c.currentTime);
    _ambient.gain.gain.setValueAtTime(_ambient.gain.gain.value, c.currentTime);
    _ambient.gain.gain.linearRampToValueAtTime(0, c.currentTime + 1.2);
    const nodes = _ambient;
    _ambient = null;
    setTimeout(() => {
      nodes.oscs.forEach(o => { try { o.stop(); } catch (_) {} });
    }, 1300);
  } catch (_) {}
}
