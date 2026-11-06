/* Cappe in Miami - Expansão | ATMOSFERA E ÁUDIO
   Clima por ambiente (chuva, neblina, fumaça, poeira, neon), luzes aditivas, escuridão com lanterna,
   transição cinematográfica, SFX sintetizados por arma/porta/passos e música dinâmica por intensidade.
   Tudo usa pools fixos: nenhum objeto novo é criado por quadro. */
(function () {
  'use strict';
  const EXP = window.EXP, rnd = Math.random, TAU = Math.PI * 2;

  // ================= CLIMA =================
  const KINDS = ['neon', 'chuva', 'neblina', 'poeira', 'fumaca'];
  const NAME = { neon: 'Neon', chuva: 'Chuva', neblina: 'Neblina', poeira: 'Poeira', fumaca: 'Fumaça' };
  const FX = EXP.fx = { kind: 'neon', cine: 0, flick: 0, flickT: 2, light: 0, bolt: 0, boltT: 8, hurt: 0, intens: 0, intT: 0, rain: [], motes: [], lights: [], stepD: 0, lx: 0, ly: 0 };
  for (let i = 0; i < 130; i++) FX.rain.push({ x: rnd() * 960, y: rnd() * 600, v: 700 + rnd() * 500, l: 10 + rnd() * 16 });
  for (let i = 0; i < 54; i++) FX.motes.push({ x: rnd() * 960, y: rnd() * 600, vx: (rnd() - .5) * 14, vy: -4 - rnd() * 10, r: .6 + rnd() * 1.6, p: rnd() * 6 });
  for (let i = 0; i < 6; i++) FX.lights.push({ x: 0, y: 0, r: 150, c: '255,46,147', p: 0, on: false });
  const LCOL = ['255,46,147', '25,240,230', '176,107,255', '255,210,63', '255,106,26'];

  // sprite de névoa pré-renderizado uma única vez
  const fogSpr = document.createElement('canvas'); fogSpr.width = 512; fogSpr.height = 256;
  (function () { const g = fogSpr.getContext('2d'); for (let i = 0; i < 9; i++) { const x = 60 + rnd() * 392, y = 50 + rnd() * 156, r = 60 + rnd() * 90, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256); } })();
  // [otimização] camada de escuridão em meia resolução (bordas suaves, 4x menos pixels para preencher); coordenadas seguem em 960x600
  const dk = document.createElement('canvas'); dk.width = 480; dk.height = 300; const dg = dk.getContext('2d'); dg.setTransform(.5, 0, 0, .5, 0, 0);
  // [otimização] gradientes pré-renderizados uma única vez (antes: 3 createRadialGradient por quadro + 1 por luz)
  function glowSprite(rgb, r, a0) {
    const c = document.createElement('canvas'); c.width = c.height = Math.ceil(r * 2);
    const g = c.getContext('2d'), gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, 'rgba(' + rgb + ',' + a0 + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); return c;
  }
  const LAMP = { core: glowSprite('0,0,0', 150, 1), far: glowSprite('0,0,0', 330, .95), flash: glowSprite('0,0,0', 260, 1) };
  const FLASH_SPR = glowSprite('255,220,120', 90, .5);

  // [otimização] texto simples guardado como imagem (antes: fillText + toUpperCase a cada quadro)
  const TT = new Map();
  function textImg(s, font, col) {
    const key = font + '|' + col + '|' + s; let t = TT.get(key); if (t) return t;
    const k = document.createElement('canvas'), g = k.getContext('2d'); g.font = font;
    k.width = Math.ceil(g.measureText(s).width) + 4; k.height = 24; g.font = font; g.fillStyle = col; g.textBaseline = 'alphabetic'; g.fillText(s, 2, 17);
    if (TT.size > 80) TT.clear(); TT.set(key, t = k); return t;
  }
  function hashStr(s) { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  EXP.fxRoom = function () {
    const r = EXP.run;
    FX.kind = EXP.storm ? 'chuva' : (EXP.curTile() && EXP.curTile().weather) || KINDS[(hashStr(mapName || '') + (historia ? capIdx : lvl)) % KINDS.length];
    FX.cine = 1.3; FX.bolt = 0; FX.boltT = 4 + rnd() * 8; EXP.weather = NAME[FX.kind];
    // luzes de ambiente: pontos neon espalhados que respiram/piscam
    for (let i = 0; i < FX.lights.length; i++) {
      const L = FX.lights[i], s = EXP.randSpot ? EXP.randSpot(reachMap(P.x, P.y), 0, 8) : null;
      L.on = !!s && i < (FX.kind === 'neon' ? 6 : 4); if (s) { L.x = s[0]; L.y = s[1]; } L.r = 110 + rnd() * 120; L.c = LCOL[(i + (historia ? capIdx : lvl)) % LCOL.length]; L.p = rnd() * 6;
    }
    AMB.set(FX.kind);
    EXP.roomTrack();
  };

  // ================= TICK =================
  EXP.fxTick = function (dt) {
    EXP.glassTick(dt);
    FX.cine = Math.max(0, FX.cine - dt); FX.hurt = Math.max(0, FX.hurt - dt);
    FX.flickT -= dt; if (FX.flickT <= 0) { FX.flickT = .2 + rnd() * 3.5; FX.flick = rnd() < .5 ? .1 : .05; }
    FX.flick = Math.max(0, FX.flick - dt * .5);
    if (FX.kind === 'chuva') { FX.boltT -= dt; if (FX.boltT <= 0) { FX.boltT = 5 + rnd() * 11; FX.bolt = 1; setTimeout(() => EXP.sfx('thunder'), 250 + rnd() * 500); } }
    FX.bolt = Math.max(0, FX.bolt - dt * 3.2);
    // passos: um som a cada ~34 px andados
    if (P) { const d = hyp(P.x - FX.lx, P.y - FX.ly); FX.lx = P.x; FX.ly = P.y; if (d < 40) { FX.stepD += d; if (FX.stepD > 36) { FX.stepD = 0; EXP.sfx('step'); } } }
    // intensidade da música: calma / alerta / combate
    FX.intT -= dt; if (FX.intT <= 0) {
      FX.intT = .4; let al = 0; for (const e of enemies) if (e.state === 'CHASE' || e.state === 'ALERT') al++;
      const target = EXP.world.boss || al >= 3 || combo >= 5 ? 2 : (al > 0 || combo >= 2 ? 1 : 0); FX.intens = target; EXP.intensity = target;
    }
  };

  // ================= DESENHO (espaço da tela) =================
  EXP.drawFx = function (g) {
    if (!P) return; const now = performance.now(), W_ = W, H_ = H;
    // neblina / fumaça: sprite grande em deriva lenta
    if ((FX.kind === 'neblina' || FX.kind === 'fumaca') && (!EXP.perfTier || EXP.perfTier < 2)) {
      const smoke = FX.kind === 'fumaca'; g.save(); g.globalAlpha = smoke ? .16 : .13; g.globalCompositeOperation = smoke ? 'source-over' : 'lighter';
      for (let i = 0; i < 3; i++) { const ox = ((now / (60 + i * 25) + i * 330) % 1400) - 440, oy = (smoke ? -(now / 90 % 120) : 0) + i * 170 - 40; g.drawImage(fogSpr, ox, oy, 920, 460); }
      g.restore();
    }
    if (FX.kind === 'poeira') {
      g.save(); g.fillStyle = 'rgba(255,230,190,.55)'; const dt = 1 / 60;
      for (const m of FX.motes) { m.x += m.vx * dt + Math.sin(now / 900 + m.p) * .15; m.y += m.vy * dt; if (m.y < -4) { m.y = H_ + 4; m.x = rnd() * W_; } if (m.x < -4) m.x = W_ + 4; if (m.x > W_ + 4) m.x = -4; g.globalAlpha = .25 + .35 * Math.abs(Math.sin(now / 700 + m.p)); g.fillRect(m.x, m.y, m.r, m.r); }
      g.restore();
    }
    if (FX.kind === 'chuva') {
      g.save(); g.strokeStyle = 'rgba(170,210,255,.38)'; g.lineWidth = 1; g.beginPath(); const dt = 1 / 60;
      const step = EXP.perfTier >= 1 ? 2 : 1;
      for (let ri = 0; ri < FX.rain.length; ri += step) { const d = FX.rain[ri]; d.y += d.v * dt; d.x -= d.v * .18 * dt; if (d.y > H_) { d.y = -20; d.x = rnd() * (W_ + 200); } g.moveTo(d.x, d.y); g.lineTo(d.x - d.l * .18, d.y + d.l); }
      g.stroke(); g.restore();
      if (FX.bolt > 0 && !CFG.noflash) { g.fillStyle = 'rgba(220,235,255,' + (FX.bolt * .35) + ')'; g.fillRect(0, 0, W_, H_); }
    }
    // pisca neon sutil
    if (FX.flick > 0 && !CFG.noflash) { g.fillStyle = 'rgba(255,46,147,' + FX.flick * .35 + ')'; g.fillRect(0, 0, W_, H_); }
    // apagão / modo escuro: lanterna ao redor do jogador
    const dark = EXP.dark || EXP.world.blackout > 0;
    if (dark) {
      const zoom = CFG.zoom, sx = (P.x - cam.x - W_ / 2) * zoom + W_ / 2, sy = (P.y - cam.y - H_ / 2) * zoom + H_ / 2;
      dg.globalCompositeOperation = 'source-over'; dg.clearRect(0, 0, 960, 600); dg.fillStyle = EXP.world.blackout > 0 ? 'rgba(2,0,10,.95)' : 'rgba(3,0,12,.88)'; dg.fillRect(0, 0, 960, 600);
      dg.globalCompositeOperation = 'destination-out';
      const rc = 150 * zoom, rf = 330 * zoom;
      dg.drawImage(LAMP.core, sx - rc, sy - rc, rc * 2, rc * 2);                                              // luz ao redor do jogador
      dg.save(); dg.beginPath(); dg.moveTo(sx, sy); dg.arc(sx, sy, rf, P.a - .38, P.a + .38); dg.closePath(); dg.clip();   // cone da lanterna
      dg.drawImage(LAMP.far, sx - rf, sy - rf, rf * 2, rf * 2); dg.restore();
      if (P.fireFlash > 0) { const rl = 260 * zoom; dg.drawImage(LAMP.flash, sx - rl, sy - rl, rl * 2, rl * 2); }
      g.drawImage(dk, 0, 0, 960, 600);
    }
    // alarme
    if (EXP.world.alarmT > 0) { g.fillStyle = 'rgba(255,30,60,' + (.06 + .07 * Math.sin(now / 110)) + ')'; g.fillRect(0, 0, W_, H_); g.fillStyle = 'rgba(255,60,90,.9)'; g.font = 'bold 14px Orbitron, sans-serif'; g.textAlign = 'center'; g.fillText('ALARME ATIVO · ' + EXP.world.alarmT.toFixed(0) + ' s', W_ / 2, 24); }
    // ambiente atual (canto)
    if (st === 'play' && EXP.weather) { g.drawImage(textImg(EXP.weather.toUpperCase() + (EXP.world.blackout > 0 ? ' · APAGÃO' : ''), '12px Orbitron, sans-serif', 'rgba(25,240,230,.55)'), 32, H_ - 25); }
    // transição cinematográfica: barras e fade
    if (FX.cine > 0) { const k = FX.cine / 1.3, bh = 78 * Math.min(1, k * 1.6); g.fillStyle = '#000'; g.fillRect(0, 0, W_, bh); g.fillRect(0, H_ - bh, W_, bh); }
  };

  // luzes aditivas e brilho de disparo, em espaço de mundo (chamado dentro da câmera)
  const _drawWorld = EXP.drawWorld;
  EXP.drawWorld = function (g) {
    _drawWorld(g);
    EXP.glassDraw(g);
    const now = performance.now(); g.save(); g.globalCompositeOperation = 'lighter';
    const dim = EXP.dark || EXP.world.blackout > 0 ? .4 : 1;
    const lightStep = EXP.perfTier >= 1 ? 2 : 1;
    for (let li = 0; li < FX.lights.length; li += lightStep) { const L = FX.lights[li];
      if (!L.on) continue;
      if (!L.spr || L.sprR !== L.r || L.sprC !== L.c) { L.spr = glowSprite(L.c, L.r, 1); L.sprR = L.r; L.sprC = L.c; }   // sprite guardado na própria luz
      const p = .55 + .45 * Math.sin(now / 520 + L.p), fl = FX.kind === 'neon' && Math.sin(now / 90 + L.p * 9) > .97 ? .4 : 1;
      g.globalAlpha = .22 * p * fl * dim; g.drawImage(L.spr, L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);   // intensidade vira alpha
    }
    if (P && P.fireFlash > 0) { g.globalAlpha = 1; g.drawImage(FLASH_SPR, P.x - 90, P.y - 90, 180, 180); }
    g.restore();
    // reflexo: brilho fraco sob jogador em dias de chuva
    if (FX.kind === 'chuva' && P) { g.save(); g.globalAlpha = .12; g.fillStyle = '#9ad1ff'; g.beginPath(); g.ellipse(P.x, P.y + 14, 14, 5, 0, 0, TAU); g.fill(); g.restore(); }
  };

  // ================= ÁUDIO =================
  // volumes independentes (música / efeitos), aplicados por nós de ganho ligados ao contexto do jogo
  const _audioCtx = audioCtx;
  audioCtx = function () {
    const fresh = !AUD.ctx, c = _audioCtx();
    if (c && fresh) {
      AUD.musVol = c.createGain(); AUD.sfxVol = c.createGain();
      try { AUD.musG.disconnect(); AUD.sfxG.disconnect(); } catch (e) {}
      AUD.musG.connect(AUD.musVol); AUD.sfxG.connect(AUD.sfxVol); AUD.musVol.connect(c.destination); AUD.sfxVol.connect(c.destination);
      AUD.amb = c.createGain(); AUD.amb.gain.value = 0; AUD.amb.connect(AUD.sfxVol);
      EXP.applyVol();
    }
    return c;
  };
  EXP.applyVol = function () { const s = EXP.save().settings, master = Math.max(0, Math.min(1, EXP.multiCfg ? EXP.multiCfg.masterVol : 1)); if (AUD.musVol) AUD.musVol.gain.value = s.musVol * master; if (AUD.sfxVol) AUD.sfxVol.gain.value = s.sfxVol * master; };
  EXP.setVol = function (k, v) { EXP.save().settings[k] = v; EXP.touch(); EXP.applyVol(); };

  let noiseBuf = null;
  function noise() { const c = AUD.ctx; if (noiseBuf || !c) return noiseBuf; noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return noiseBuf; }
  function burst(dur, vol, ftype, freq, slide, delay) {
    const c = AUD.ctx; if (!c || !AUD.sfxOn || c.state !== 'running') return; const b = noise(); if (!b) return;
    const t = c.currentTime + (delay || 0), s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = b; s.loop = true; f.type = ftype; f.frequency.setValueAtTime(freq, t); if (slide) f.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); s.connect(f); f.connect(g); g.connect(AUD.sfxG); s.start(t, Math.random() * .5); s.stop(t + dur + .03);
  }
  const lastT = {};
  const BANK = {
    pistol:  () => { burst(.09, .55, 'bandpass', 2400, .4); tone(180, .12, 'square', .18, .4); },
    smg:     () => { burst(.06, .45, 'bandpass', 3000, .5); tone(220, .07, 'square', .12, .5); },
    magnum:  () => { burst(.22, .9, 'lowpass', 1800, .15); tone(90, .3, 'sawtooth', .35, .35); },
    shotgun: () => { burst(.26, .95, 'lowpass', 2200, .12); tone(70, .28, 'square', .35, .4); burst(.05, .5, 'highpass', 4000, 1, .12); },
    rifle:   () => { burst(.14, .7, 'bandpass', 1900, .35); tone(130, .18, 'sawtooth', .22, .4); },
    sniper:  () => { burst(.4, 1, 'lowpass', 3500, .1); tone(60, .5, 'sawtooth', .45, .3); tone(1200, .08, 'square', .12, .3); },
    lmg:     () => { burst(.09, .65, 'lowpass', 1500, .3); tone(95, .1, 'square', .25, .6); },
    enemyShot: () => { burst(.07, .22, 'bandpass', 1500, .5); },
    snipe:   () => { burst(.3, .6, 'lowpass', 3000, .1); tone(500, .25, 'sawtooth', .12, .3); },
    reload:  () => { tone(900, .03, 'square', .09); tone(400, .05, 'square', .09, 1, .22); tone(600, .04, 'square', .09, 1, .5); },
    reloadEnd: () => { tone(300, .06, 'square', .14, 1.6); tone(1200, .03, 'square', .1, 1, .05); },
    pickup:  () => { tone(500, .05, 'triangle', .16, 1.5); tone(750, .06, 'triangle', .14, 1.3, .05); },
    door:    () => { burst(.25, .22, 'lowpass', 500, 1.8); tone(110, .22, 'sawtooth', .07, 1.3); },
    doorKick:() => { burst(.18, .6, 'lowpass', 800, .3); tone(70, .2, 'square', .3, .4); },
    step:    () => { burst(.045, .08, 'lowpass', 600 + Math.random() * 200, .6); },
    clang:   () => { tone(1500, .1, 'square', .14, .5); burst(.06, .3, 'highpass', 3000, 1); },
    glass:   () => { burst(.2, .5, 'highpass', 4500, .5); tone(2400, .1, 'triangle', .12, .5); },
    boom:    () => { burst(.8, 1, 'lowpass', 900, .08); tone(55, .7, 'sawtooth', .5, .3); tone(38, .9, 'sine', .5, .5); },
    alarm:   () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 620 : 880, .16, 'square', .16, 1, i * .17); },
    blackout:() => { tone(300, .5, 'sawtooth', .22, .2); burst(.35, .3, 'lowpass', 400, .2); },
    thunder: () => { burst(1.2, .6, 'lowpass', 500, .2); tone(40, 1.1, 'sine', .4, .6); },
    wave:    () => { [220, 277, 330].forEach((f, i) => tone(f, .18, 'square', .14, 1, i * .1)); },
    waveEnd: () => { [523, 659, 784].forEach((f, i) => tone(f, .16, 'triangle', .2, 1, i * .09)); },
    bossIntro: () => { tone(55, 1.2, 'sawtooth', .4, .5); tone(58, 1.2, 'sawtooth', .35, .5); burst(1, .3, 'lowpass', 300, 1.5); },
    bossShot:() => { tone(260, .1, 'square', .1, .6); },
    bossPhase: () => { tone(120, .5, 'sawtooth', .35, 2.2); burst(.4, .5, 'lowpass', 1500, .2); },
    bossDown:() => { [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, .25, 'square', .17, 1, i * .1)); burst(.9, .7, 'lowpass', 800, .1); },
    charge:  () => { tone(200, .5, 'sawtooth', .18, 2.5); },
  };
  EXP.sfx = function (name) {
    const c = AUD.ctx; if (!c || c.state !== 'running') return;
    const now = performance.now(), gap = name === 'step' ? 90 : name === 'smg' || name === 'lmg' || name === 'enemyShot' || name === 'bossShot' ? 55 : 0;
    if (gap && now - (lastT[name] || 0) < gap) return; lastT[name] = now;
    const f = BANK[name]; if (f) f(); else playSfx(name);
  };
  // tiros inimigos também soam (mais baixo)
  const _shoot = shoot; shoot = function (from, ang, spd, mine, life) { _shoot(from, ang, spd, mine, life); if (!mine && from !== P && EXP.world && !EXP.world.boss) EXP.sfx('enemyShot'); };

  // ---- ambiente sonoro em loop (chuva, neblina, zumbido de neon) ----
  const AMB = {
    src: null, flt: null, kind: '',
    set(kind) {
      const c = AUD.ctx; if (!c || !AUD.amb) { this.kind = kind; return; }
      if (!this.src) { const b = noise(); this.src = c.createBufferSource(); this.src.buffer = b; this.src.loop = true; this.flt = c.createBiquadFilter(); this.src.connect(this.flt); this.flt.connect(AUD.amb); this.src.start(); }
      this.kind = kind; const t = c.currentTime;
      const cfg = { chuva: ['highpass', 1800, .22], neblina: ['lowpass', 260, .16], fumaca: ['lowpass', 420, .12], neon: ['bandpass', 120, .1], poeira: ['lowpass', 180, .05] }[kind] || ['lowpass', 200, .05];
      this.flt.type = cfg[0]; this.flt.frequency.setTargetAtTime(cfg[1], t, .3); AUD.amb.gain.setTargetAtTime(cfg[2], t, .6);
    },
  };
  EXP.amb = AMB;
  const _unlock = unlockAudio; unlockAudio = function () { _unlock(); if (AUD.ctx && AMB.kind) AMB.set(AMB.kind); };

  // ---- música: faixas extras por ambiente + camadas por intensidade + faixas de chefe ----
  PLAYLIST.push(
    { nome: 'Miami Rain', bpm: 96, bass: [0, 0, -2, -2, -5, -5, -7, -9], lead: [10, 12, 15, 12, 10, 7, 10, 3] },
    { nome: 'Hotline Haze', bpm: 118, bass: [0, 3, 0, 5, 0, 3, -2, 0], lead: [12, 14, 15, 19, 17, 15, 14, 12] },
    { nome: 'Pulse Garden', bpm: 138, bass: [0, 0, 7, 0, 5, 0, 3, 5], lead: [15, 19, 17, 15, 12, 15, 17, 22] },
    { nome: 'Boss: Rush', bpm: 150, bass: [0, 0, 0, 3, 0, 0, -2, 0], lead: [12, 15, 12, 18, 12, 15, 17, 18] },
    { nome: 'Boss: Static', bpm: 142, bass: [0, -1, 0, -1, 3, 2, 0, -2], lead: [19, 18, 15, 18, 19, 22, 18, 15] },
    { nome: 'Boss: Final Pulse', bpm: 160, bass: [0, 0, 5, 5, 3, 3, 7, 7], lead: [24, 22, 19, 22, 24, 27, 24, 19] },
  );
  // v5.2: 8 faixas novas (índices 8+), com acordes (pad) e arpejo opcional
  PLAYLIST.push(
    { nome: 'Sunset Drive', bpm: 112, bass: [0, 0, 5, 5, 7, 7, 3, 3], lead: [12, 15, 19, 22, 19, 15, 17, 14], pad: [0, 5, 7, 3], arp: [0, 7, 12, 15] },
    { nome: 'Vice Night', bpm: 128, bass: [0, 0, -2, -2, -4, -4, -5, -5], lead: [19, 17, 15, 14, 15, 17, 19, 22], pad: [0, -2, -4, -5], arp: [0, 3, 7, 12] },
    { nome: 'Chrome Heart', bpm: 134, bass: [0, 12, 0, 10, 0, 8, 0, 7], lead: [24, 22, 19, 17, 19, 22, 24, 27], arp: [0, 12, 7, 12] },
    { nome: 'Palm Static', bpm: 104, bass: [0, 3, 5, 3, 0, -2, -4, -2], lead: [15, 14, 12, 10, 12, 14, 15, 19], pad: [0, 0, -4, -2] },
    { nome: 'Overdrive 86', bpm: 146, bass: [0, 0, 0, 0, 3, 3, 5, 5], lead: [12, 12, 15, 17, 19, 17, 15, 12], arp: [0, 7, 12, 19] },
    { nome: 'Miami Rain', bpm: 96, bass: [0, -5, -3, -7, 0, -5, -2, -7], lead: [19, 15, 17, 12, 19, 15, 14, 10], pad: [0, -5, -3, -7] },
    { nome: 'Neon Cartel', bpm: 124, bass: [0, 0, 1, 0, 0, 0, -2, -1], lead: [12, 13, 12, 16, 12, 13, 15, 13], arp: [0, 1, 7, 12] },
    { nome: 'Last Call', bpm: 140, bass: [0, 7, 3, 10, 5, 12, 7, 14], lead: [24, 19, 22, 17, 19, 15, 17, 12], pad: [0, 3, 5, 7], arp: [0, 4, 7, 11] },
  );
  const ROOM_TRACKS = [0, 1, 2, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15];     // faixas normais (originais + novas)
  EXP.bossTrack = false;
  EXP.roomTrack = function () {
    if (EXP.bossTrack) return;
    const arena = EXP.run && EXP.run.arena; const m = { chuva: 10, neblina: 3, fumaca: 1, poeira: 4, neon: (Math.random() * ROOM_TRACKS.length) | 0 }[FX.kind] ?? 0;
    mus.track = arena ? ROOM_TRACKS[(m + 1) % ROOM_TRACKS.length] : ROOM_TRACKS[m];
  };
  EXP.musBoss = function (idx, on) {
    EXP.bossTrack = !!on;
    if (on) mus.track = 5 + (((idx || 2) - 2) % 3 + 3) % 3; else EXP.roomTrack();
  };
  musTick = function () {
    const tr = PLAYLIST[mus.track] || PLAYLIST[0], sp = 60 / tr.bpm / 4, step = mus.step % 16, t = mus.next, I = EXP.intensity | 0;
    if (step % 2 === 0) musNote(55 * 2 ** (tr.bass[(mus.step >> 1) % tr.bass.length] / 12), t, sp * 1.8, 'sawtooth', .10);
    if (step % 4 === 0) musNote(220 * 2 ** ((tr.lead[(mus.step >> 2) % tr.lead.length] - 9) / 12), t, sp * 1.5, 'square', .035);
    if (step === 0 || step === 8) musNote(90, t, .12, 'sine', .25);
    if (step === 4 || step === 12) musNote(1800, t, .05, 'triangle', .08);
    if (I >= 1) { if (step % 2 === 1) musNote(7000, t, .03, 'square', .010); if (step % 4 === 0 && step !== 0 && step !== 8) musNote(70, t, .1, 'sine', .16); }
    if (I >= 2) { musNote(440 * 2 ** (tr.lead[(mus.step >> 1) % tr.lead.length] / 12), t, sp * .8, 'square', .018); if (step % 4 === 2) musNote(120, t, .06, 'triangle', .1); }
    if (tr.pad && step === 0) for (const iv of [0, 3, 7]) musNote(110 * 2 ** ((tr.pad[(mus.step >> 4) % tr.pad.length] + iv) / 12), t, sp * 15, 'triangle', .022);
    if (tr.arp && step % 2 === 1) musNote(440 * 2 ** ((tr.bass[(mus.step >> 1) % tr.bass.length] + tr.arp[(mus.step >> 1) % tr.arp.length]) / 12), t, sp * .9, 'sine', .02);
    mus.step++; mus.next += sp;
    if (!EXP.bossTrack && mus.step % 128 === 0) mus.track = ROOM_TRACKS[(ROOM_TRACKS.indexOf(mus.track) + 1) % ROOM_TRACKS.length];
  };
  // dano no jogador: pulso vermelho de câmera
  const _hit = hit; hit = function (target) { const r = _hit(target); FX.hurt = .4; return r; };
})();

/* ==== BLOCO: VIDROS QUEBRÁVEIS (exp-fx.js) ==========================================
   Tile 2 (TILE_GLASS, definido em maps.js) = vidro/janela.
   - Bloqueia movimento de jogador, inimigos e balas que ainda não o quebraram (entra em `sol`).
   - NÃO bloqueia a linha de visão da IA: los() é reescrita para ignorar o vidro (EXP.solNG).
   - Uma bala que cruza o tile muda o estado dele para 0 (chão), na matriz viva EXP.tileMap,
     e gera 10 estilhaços que voam na direção do vetor do tiro (pool fixo, sem alocação por quadro).
   =================================================================================== */
(function () {
  'use strict';
  const EXP = window.EXP, TAU = Math.PI * 2, rnd = Math.random;
  EXP.solNG = [];

  // sólidos = paredes + móveis + portas fechadas + vidro. solNG = tudo isso, sem o vidro.
  const _refreshSol = refreshSol;
  refreshSol = function () {
    _refreshSol();
    for (const gl of EXP.glass.list) { gl.rect = gl.rect || [gl.x, gl.y, gl.w, gl.h]; gl.rect.g = 1; sol.push(gl.rect); }
  };
  function hitList(list, x, y, r) {
    for (let i = 0; i < list.length; i++) {
      const w = list[i], cx = Math.max(w[0], Math.min(x, w[0] + w[2])), cy = Math.max(w[1], Math.min(y, w[1] + w[3]));
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) < r * r) return true;
    }
    return false;
  }
  // raycast da IA: marcha em passos de 12 px e só para em sólidos que não são vidro
  const _los = los;
  los = function (a, b) {
    if (!EXP.glass.list.length) return _los(a, b);
    const d = hyp(b.x - a.x, b.y - a.y), n = Math.ceil(d / 12);
    for (let i = 1; i < n; i++) if (hitWallNG(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n, 2)) return false;
    return true;
  };

  // ---- estilhaços ----
  const N = 160, SH = [];
  for (let i = 0; i < N; i++) SH.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, life: 0, max: 1, s: 3, c: 0 });
  const SCOL = ['rgba(190,250,255,', 'rgba(120,230,255,', 'rgba(255,255,255,', 'rgba(255,170,230,'];
  let head = 0;
  EXP.glassBurst = function (x, y, dx, dy) {
    const base = Math.atan2(dy, dx);
    for (let k = 0; k < 10; k++) {
      const p = SH[head]; head = (head + 1) % N;
      const a = base + (rnd() - .5) * .9, sp = 160 + rnd() * 300;
      p.on = true; p.x = x + (rnd() - .5) * 14; p.y = y + (rnd() - .5) * 14; p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
      p.rot = rnd() * TAU; p.vr = (rnd() - .5) * 20; p.max = p.life = .55 + rnd() * .55; p.s = 3 + rnd() * 5; p.c = (rnd() * 4) | 0;
    }
  };
  EXP.glassFxReset = function () { for (const p of SH) p.on = false; };

  function breakGlass(gl, dx, dy) {
    EXP.glass.list.splice(EXP.glass.list.indexOf(gl), 1); EXP.glass.map.delete(gl.key);
    if (EXP.tileMap) EXP.tileMap[gl.r][gl.c] = 0;                       // estado do bloco: 2 -> 0 (chão)
    refreshSol(); EXP.navBuild();
    const cx = gl.x + gl.w / 2, cy = gl.y + gl.h / 2;
    EXP.glassBurst(cx, cy, dx, dy); EXP.sfx('glass'); triggerScreenShake(4, .1);
    emitNoise(cx, cy, 200, 'glass');
    try {                                                              // vestígio no chão onde havia o vidro
      const f = fl.getContext('2d'); f.fillStyle = 'rgba(160,230,255,.10)'; f.fillRect(gl.x, gl.y, gl.w, gl.h);
      for (let i = 0; i < 9; i++) { f.fillStyle = 'rgba(220,250,255,' + (.25 + rnd() * .35) + ')'; const sx = gl.x + rnd() * gl.w, sy = gl.y + rnd() * gl.h; f.beginPath(); f.moveTo(sx, sy); f.lineTo(sx + 2 + rnd() * 4, sy + rnd() * 3); f.lineTo(sx + rnd() * 3, sy + 2 + rnd() * 4); f.fill(); }
    } catch (e) {}
    if (EXP.run) addScore(25);
  }
  // varre o trecho que cada bala percorre neste quadro (e mais um passo à frente)
  EXP.glassTick = function (dt) {
    for (const p of SH) if (p.on) {
      p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
      const k = Math.pow(.02, dt); p.vx *= k; p.vy *= k; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    }
    if (!EXP.glass.list.length || !bullets.length) return;
    const C = EXP.glassCols, T = TILE;
    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i], sx = b.vx * dt * 2, sy = b.vy * dt * 2, n = Math.max(1, Math.ceil(hyp(sx, sy) / 8));
      for (let s = 0; s <= n; s++) {
        const x = b.x + sx * s / n, y = b.y + sy * s / n, gl = EXP.glass.map.get(Math.floor(y / T) * C + Math.floor(x / T));
        if (gl) { breakGlass(gl, b.vx, b.vy); break; }
      }
    }
  };
  EXP.glassDraw = function (g) {
    const now = performance.now();
    for (const gl of EXP.glass.list) {
      g.fillStyle = 'rgba(110,225,255,.26)'; g.fillRect(gl.x, gl.y, gl.w, gl.h);
      g.strokeStyle = 'rgba(210,255,255,.8)'; g.lineWidth = 2; g.strokeRect(gl.x + 1, gl.y + 1, gl.w - 2, gl.h - 2);
      const sh = (now / 40 + gl.x) % 120; g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; g.beginPath();
      g.moveTo(gl.x + 6, gl.y + 30); g.lineTo(gl.x + 30, gl.y + 6); g.stroke();
      if (sh < 40) { g.strokeStyle = 'rgba(255,255,255,' + (.5 - sh / 80) + ')'; g.beginPath(); g.moveTo(gl.x + sh, gl.y); g.lineTo(gl.x + sh - 20, gl.y + gl.h); g.stroke(); }
    }
    for (const p of SH) if (p.on) {
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = SCOL[p.c] + Math.min(1, p.life / p.max * 1.5) + ')';
      g.beginPath(); g.moveTo(-p.s, p.s * .6); g.lineTo(p.s * 1.1, 0); g.lineTo(-p.s * .2, -p.s); g.closePath(); g.fill(); g.restore();
    }
  };
})();
