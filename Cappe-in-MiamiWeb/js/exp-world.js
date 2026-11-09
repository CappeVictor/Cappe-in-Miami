/* Cappe in Miami - Expansão | MUNDO
   IA por classe + comunicação, chefes com fases, barris explosivos, câmeras/alarme,
   eventos aleatórios controlados, recarga e munição por pente.
   Tudo opera sobre as estruturas existentes (enemies, bullets, pickups, soundEvents). */
(function () {
  'use strict';
  const EXP = window.EXP;
  const rnd = Math.random, TAU = Math.PI * 2;
  const focusActor = () => EXP.focusActor ? EXP.focusActor() : P;

  // ---------- estado do mundo (arrays reaproveitados) ----------
  const WLD = { barrels: [], cams: [], rings: [], alarmT: 0, evT: 0, evDone: false, blackout: 0, boss: null, bossDef: null, flicker: 0, enemyCount0: 0, retreaters: 0, doorSfx: 0 };
  EXP.world = WLD;
  const M = { cw: '', left: 0, max: 0, rt: 0, rtMax: 0 };           // pente / recarga
  EXP.mag = M;
  EXP.noGuns = false; EXP.infAmmo = false; EXP.foeSpeed = 1;
  const targetFor = (x, y) => EXP.targetActor ? EXP.targetActor(x, y) : P;

  // ---------- utilidades ----------
  function randSpot(reach, minFromP, margin) {
    const focus = focusActor();
    for (let t = 0; t < 260; t++) {
      const x = 40 + rnd() * (WW - 80), y = 40 + rnd() * (WH - 80);
      if (!hitWall(x, y, margin || 24) && reach(x, y) && hyp(x - focus.x, y - focus.y) >= (minFromP || 160)) return [x, y];
    }
    return null;
  }
  EXP.randSpot = randSpot;
  function ring(x, y, R, col) { for (const r of WLD.rings) if (r.t <= 0) { r.x = x; r.y = y; r.R = R; r.t = r.T = .45; r.c = col || '#ff8a1f'; return; } }
  for (let i = 0; i < 14; i++) WLD.rings.push({ x: 0, y: 0, R: 0, t: 0, T: .45, c: '#fff' });

  EXP.spawnEnemy = function (x, y, type, cls, alertP) {
    const e = { x, y, r: 13, a: rnd() * TAU, type: type || 'gun', cd: 1 + rnd(), alert: false, state: 'IDLE', stateT: 0, stun: 0, lkp: null, heard: null, searchT: 0, id: ++EXP.eid };
    const target = targetFor(x, y);
    if (alertP && target) { e.lkp = { x: target.x, y: target.y }; setEnemyState(e, 'SEARCH', 3); }
    enemies.push(e); if (cls) EXP.classify(e, cls); return e;
  };
  EXP.eid = 0;

  // ================= CLASSES DE INIMIGO =================
  const CLS = {
    guarda:   { nome: 'Guarda',   col: null },
    corredor: { nome: 'Corredor', col: '#ffd23f' },
    blindado: { nome: 'Blindado', col: '#9aa0b0' },
    atirador: { nome: 'Atirador', col: '#ff2e5b' },
    lider:    { nome: 'Líder',    col: '#b06bff' },
    boss:     { nome: 'Chefe',    col: '#ff2e93' },
  };
  EXP.CLS = CLS;
  EXP.classify = function (e, cls) {
    e.cls = cls;
    if (cls === 'corredor') { e.type = 'bat'; e.fast = 1; }
    else if (cls === 'blindado') { e.hp = e.hpMax = 3; e.r = 15; }
    else if (cls === 'atirador') { e.type = 'gun'; e.sniper = true; e.snCd = 1 + rnd(); e.tele = 0; }
    else if (cls === 'lider') { e.type = 'gun'; e.leader = true; e.callT = 2; }
  };
  EXP.rollClasses = function () {          // chance por sala; progressivo (não existe na História, que mantém o balanceamento original)
    if (historia) return;
    const L = Math.max(lvl, EXP.waveLvl || 0);
    for (const e of enemies) {
      if (e.cls || e.cls === 0) continue;
      e.id = e.id || ++EXP.eid;
      const q = rnd();
      if (L >= 3 && q < .12) EXP.classify(e, 'corredor');
      else if (L >= 4 && q < .22) EXP.classify(e, 'atirador');
      else if (L >= 5 && q < .31) EXP.classify(e, 'blindado');
      else if (L >= 6 && q < .36) EXP.classify(e, 'lider');
      if (!e.cls && e.type === 'gun' && rnd() < .3) e.retreater = true;       // alguns recuam quando ficam em desvantagem
    }
  };

  // ================= IA (um passe por quadro, antes do laço de inimigos do jogo) =================
  // A mesma comparação euclidiana de hyp(dx,dy) < r, sem calcular a raiz quadrada.
  function withinRadius(dx, dy, radius) { return dx * dx + dy * dy < radius * radius; }
  function aiTick(dt) {
    const n = enemies.length;
    for (let i = 0; i < n; i++) {
      const e = enemies[i];
      const target = targetFor(e.x, e.y);
      if (!target) continue;
      if (!e.id) e.id = ++EXP.eid;
      if (e.ko > 0 || e.stun > 0) continue;
      const chasing = e.state === 'CHASE' || e.state === 'ALERT';
      // comunicação: quem está em perseguição avisa os vizinhos (sem telepatia: eles só recebem a última posição conhecida)
      if (chasing) {
        e.talkT = (e.talkT || 0) - dt;
        if (e.talkT <= 0) {
          e.talkT = 1.3;
          const callRadius = e.leader ? 520 : 210;
          for (let j = 0; j < n; j++) {
            const o = enemies[j]; if (o === e || o.ko > 0 || o.stun > 0) continue;
            if ((o.state === 'IDLE' || o.state === 'SUSPICIOUS') && withinRadius(o.x - e.x, o.y - e.y, callRadius)) {
              o.heard = { x: target.x, y: target.y }; o.lkp = { x: target.x, y: target.y }; setEnemyState(o, 'INVESTIGATE', 2.4);
            }
          }
        }
      }
      if (e.fast && e.state === 'CHASE') { const m = EXP.steer(e, target.x, target.y, dt, true), a = Math.atan2(m.y - e.y, m.x - e.x); move(e, Math.cos(a) * 58 * dt, Math.sin(a) * 58 * dt); }    // corredor: bem mais rápido, mas contorna paredes
      if (e.sniper) {                                      // atirador: laser de aviso e tiro único e rápido (dá tempo de reagir)
        e.cd = Math.max(e.cd, .6); e.snCd -= dt;
        const d = hyp(target.x - e.x, target.y - e.y);
        if (e.state === 'CHASE' && d < 560 && los(e, target)) {
          if (e.tele <= 0 && e.snCd <= 0) { e.tele = .7; }
          if (e.tele > 0) { e.a = Math.atan2(target.y - e.y, target.x - e.x); e.tele -= dt; if (e.tele <= 0) { shoot(e, e.a + EXP.errAng(e, d), 540, false, 2.4); e.snCd = 2.1 + rnd() * .8; EXP.sfx('snipe'); } }
        } else e.tele = 0;
      }
      if (e.leader && chasing) {                           // líder: chama reforços (alarme local)
        e.callT -= dt;
        if (e.callT <= 0) { e.callT = 6; let c = 0; for (let j = 0; j < n; j++) { const o = enemies[j]; if (o !== e && o.state === 'IDLE' && withinRadius(o.x - e.x, o.y - e.y, 560)) { o.lkp = { x: target.x, y: target.y }; o.heard = o.lkp; setEnemyState(o, 'SEARCH', 3); c++; } } if (c) popup(e.x, e.y - 30, 'REFORÇOS!', '#b06bff'); }
      }
      if (e.retreater && chasing && n <= 2 && EXP.enemyCount0 >= 5) {        // recuo quando em desvantagem
        const d = hyp(target.x - e.x, target.y - e.y);
        if (d < 170) { const a = Math.atan2(e.y - target.y, e.x - target.x); move(e, Math.cos(a) * 62 * dt, Math.sin(a) * 62 * dt); }
      }
    }
  }
  // reação a companheiros caídos
  function comradeFell(e) {
    for (const o of enemies) {
      if (o.ko > 0 || o.stun > 0 || o.state === 'CHASE' || o.state === 'ALERT') continue;
      if (withinRadius(o.x - e.x, o.y - e.y, 230)) { o.heard = { x: e.x, y: e.y }; o.lkp = { x: e.x, y: e.y }; setEnemyState(o, 'INVESTIGATE', 2.6); }
    }
  }

  // ---- ganchos de dano: chefes e blindados absorvem golpes; chefe não é nocauteado ----
  const _kill = kill;
  kill = function (e, bx, by) {
    const dmg = EXP.dmg || 1;
    if (e.hp > 1) {
      if ((e.iframe || 0) > 0 && !EXP.dmg) return;
      e.hp -= dmg; e.iframe = e.cls === 'boss' ? .16 : .08;
      if (e.hp > 0) {
        burstSparks(e.x, e.y, 8, [CLS[e.cls].col || '#fff', '#fff'], 200, (bx || by) ? Math.atan2(by, bx) : undefined);
        if (e.cls !== 'boss') popup(e.x, e.y - e.r - 14, e.hp + '', '#fff'); EXP.sfx('clang'); freeze = Math.max(freeze, .02); triggerScreenShake(3, .06);
        if (e.cls === 'blindado') { const a = Math.atan2(by || 0, bx || 1); move(e, Math.cos(a) * 6, Math.sin(a) * 6); }
        return;
      }
    }
    const isBoss = e.cls === 'boss';
    _kill(e, bx, by);
    EXP.afterKill(e, isBoss);
  };
  const _knock = knockDown, _stun = stun;
  knockDown = function (e, nx, ny) { if (e.cls === 'boss') { popup(e.x, e.y - 30, 'IMUNE', '#fff'); return; } if (e.cls === 'blindado' && rnd() < .5) { popup(e.x, e.y - 30, 'RESISTE', '#9aa0b0'); return; } _knock(e, nx, ny); };
  stun = function (e, d, l) { if (e.cls === 'boss') { e.iframe = 0; return; } _stun(e, e.cls === 'blindado' ? d * .5 : d, l); };

  EXP.afterKill = function (e, isBoss) {
    const sv = EXP.save();
    sv.stats.kills++; if (EXP.run) EXP.run.kills++;
    const mult = { corredor: 1.3, blindado: 2, atirador: 1.6, lider: 3, boss: 0 }[e.cls] || 1;
    EXP.addXP(10 * mult, 'abate');
    comradeFell(e);
    if (e.cls === 'blindado' && rnd() < .4) dropSpecial(e, ['pump', 'carabina', 'dupla']);
    else if (e.cls === 'lider' && rnd() < .5) dropSpecial(e, ['magnum', 'pistola_aut', 'katana']);
    else if (e.cls === 'atirador' && rnd() < .3) dropSpecial(e, ['sniper', 'carabina']);
    if (isBoss) bossDown(e);
    EXP.checkAch();
  };
  function dropSpecial(e, list) {
    const ok = list.filter(EXP.weaponUnlocked); if (!ok.length) return;
    const w = ok[Math.floor(rnd() * ok.length)];
    pickups.push({ x: e.x + 8, y: e.y + 8, w, n: EXP.AMMO_NEW[w] || 0, a: rnd() * TAU });
  }

  // ================= CHEFES =================
  EXP.spawnBoss = function (def, scale) {
    const sp = randSpot(reachMap(P.x, P.y), 300, 40) || [P.x + 200, P.y];
    const e = EXP.spawnEnemy(sp[0], sp[1], 'shot', 'boss');
    const hp = Math.round(def.hp * 3 * (scale || 1));
    Object.assign(e, { hp, hpMax: hp, r: def.r, boss: def, ph: 0, pt: [0, 0, 0, 0], chS: 0, chT: 0, spiA: 0, burst: null, iframe: 0 });
    setEnemyState(e, 'CHASE', 0); e.lkp = { x: P.x, y: P.y };
    WLD.boss = e; WLD.bossDef = def;
    banner = { txt: def.nome.toUpperCase(), sub: def.intro, t: 2.6 }; EXP.sfx('bossIntro'); EXP.musBoss(def.track || 2, true);
    return e;
  };
  function bossDown(e) {
    const def = e.boss, sv = EXP.save();
    sv.stats.bossKills++; sv.bosses[def.id] = (sv.bosses[def.id] || 0) + 1; EXP.addXP(400, 'chefe'); addScore(1500);
    banner = { txt: 'CHEFE DERROTADO', sub: def.nome + ' — ' + def.outro, t: 3 }; flash = 1; triggerScreenShake(12, .4); EXP.sfx('bossDown'); EXP.musBoss(0, false);
    popup(e.x, e.y - 30, '+1500', '#ffd23f');
    // dropa uma arma rara do arsenal
    const r = EXP.newWeapons.filter(EXP.weaponUnlocked); if (r.length) { const w = r[Math.floor(rnd() * r.length)]; pickups.push({ x: e.x, y: e.y, w, n: EXP.AMMO_NEW[w] || 0, a: 0 }); }
    WLD.boss = null; EXP.checkAch(); if (EXP.modeBossDown) EXP.modeBossDown(def);
  }
  function bossTick(dt) {
    const e = WLD.boss; if (!e) return;
    if (!enemies.includes(e)) { WLD.boss = null; return; }
    e.iframe = Math.max(0, (e.iframe || 0) - dt); e.cd = Math.max(e.cd, .5);
    const frac = e.hp / e.hpMax, def = e.boss;
    let ph = 0; for (let i = 0; i < def.phases.length; i++) if (frac <= def.phases[i].at) ph = i;
    if (ph !== e.ph) { e.ph = ph; popup(e.x, e.y - 40, 'FASE ' + (ph + 1), '#ff2e93'); triggerScreenShake(8, .25); flash = .6; EXP.sfx('bossPhase'); }
    const pats = def.phases[e.ph].pats, a = Math.atan2(P.y - e.y, P.x - e.x), d = hyp(P.x - e.x, P.y - e.y);
    // investida em andamento
    if (e.chS === 1) { e.chT -= dt; e.a = e.chA; if (e.chT <= 0) { e.chS = 2; e.chT = e.chDur; } }
    else if (e.chS === 2) { e.chT -= dt; const ox = e.x, oy = e.y; move(e, Math.cos(e.chA) * e.chSpd * dt, Math.sin(e.chA) * e.chSpd * dt); if (hyp(e.x - ox, e.y - oy) < e.chSpd * dt * .25) e.chS = 0; if (e.chT <= 0) { e.chS = 0; } if (d < e.r + P.r + 4 && hit()) return; }
    for (let i = 0; i < pats.length; i++) {
      const p = pats[i]; e.pt[i] -= dt; if (e.pt[i] > 0) continue;
      if (p.t === 'spread') { for (let k = 0; k < p.n; k++) shoot(e, a + (p.n === 1 ? 0 : (k / (p.n - 1) - .5) * p.arc), p.spd, false, 3.4); e.pt[i] = p.cd; EXP.sfx('bossShot'); }
      else if (p.t === 'ring') { const o = rnd() * TAU; for (let k = 0; k < p.n; k++) shoot(e, o + k / p.n * TAU, p.spd, false, 3.4); e.pt[i] = p.cd; EXP.sfx('bossShot'); ring(e.x, e.y, 60, def.col); }
      else if (p.t === 'aimed') { e.burst = { n: p.n, gap: p.gap, t: 0, spd: p.spd }; e.pt[i] = p.cd; }
      else if (p.t === 'spiral') { for (let k = 0; k < p.n; k++) shoot(e, e.spiA + k / p.n * TAU, p.spd, false, 3.4); e.spiA += .38; e.pt[i] = p.cd; }
      else if (p.t === 'charge') { if (e.chS === 0 && d < 520) { e.chS = 1; e.chT = p.tele; e.chA = a; e.chSpd = p.spd; e.chDur = p.dur; e.pt[i] = p.cd; EXP.sfx('charge'); } else e.pt[i] = .3; }
      else if (p.t === 'summon') { for (let k = 0; k < p.n && enemies.length < 14; k++) { const s = randSpot(reachMap(e.x, e.y), 60, 24) || [e.x + 30, e.y]; EXP.spawnEnemy(s[0], s[1], rnd() < .4 ? 'bat' : 'gun', null, true); ring(s[0], s[1], 26, def.col); } e.pt[i] = p.cd; popup(e.x, e.y - 40, 'CAPANGAS!', def.col); }
    }
    if (e.burst) { e.burst.t -= dt; if (e.burst.t <= 0) { shoot(e, a + (rnd() - .5) * .05, e.burst.spd, false, 3.4); e.burst.n--; e.burst.t = e.burst.gap; EXP.sfx('bossShot'); if (e.burst.n <= 0) e.burst = null; } }
  }

  // ================= BARRIS EXPLOSIVOS =================
  function placeBarrels(n) {
    WLD.barrels.length = 0; const reach = reachMap(P.x, P.y);
    for (let i = 0; i < n; i++) { const s = randSpot(reach, 140, 20); if (s) WLD.barrels.push({ x: s[0], y: s[1], r: 12, t: -1 }); }
  }
  function explode(b) {
    if (b.dead) return; b.dead = true;
    const R = 82; ring(b.x, b.y, R, '#ff8a1f'); ring(b.x, b.y, R * .6, '#ffd23f');
    burstSparks(b.x, b.y, 40, ['#ff8a1f', '#ffd23f', '#fff', '#ff2e5b'], 380);
    triggerScreenShake(14, .35); flash = Math.max(flash, .7); freeze = Math.max(freeze, .06); emitNoise(b.x, b.y, 720, 'explosion'); EXP.sfx('boom');
    try { const g = fl.getContext('2d'); g.fillStyle = 'rgba(8,4,12,.55)'; g.beginPath(); g.arc(b.x, b.y, 38, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,138,31,.18)'; g.beginPath(); g.arc(b.x, b.y, 24, 0, TAU); g.fill(); } catch (er) {}
    EXP.save().stats.barrels++;
    let n = 0;
    for (const e of enemies.slice()) if (hyp(e.x - b.x, e.y - b.y) < R) { EXP.dmg = 3; kill(e, e.x - b.x, e.y - b.y); EXP.dmg = 0; n++; }
    if (n) { levelStats.env = (levelStats.env || 0) + n; popup(b.x, b.y - 30, n > 1 ? 'EXPLOSÃO x' + n : 'EXPLOSÃO!', '#ff8a1f'); }
    if (P && hyp(P.x - b.x, P.y - b.y) < R * .8 && st === 'play') hit();
    for (const o of WLD.barrels) if (!o.dead && hyp(o.x - b.x, o.y - b.y) < R + 12 && o.t < 0) o.t = .12;   // reação em cadeia
    EXP.checkAch();
  }
  function barrelsTick(dt) {
    const B = WLD.barrels;
    for (let i = B.length - 1; i >= 0; i--) {
      const b = B[i];
      if (b.t >= 0) { b.t -= dt; if (b.t < 0) { explode(b); } }
      if (b.dead) { B.splice(i, 1); continue; }
      for (let k = 0; k < bullets.length; k++) { const u = bullets[k]; if (Math.abs(u.x - b.x) < b.r + 4 && Math.abs(u.y - b.y) < b.r + 4) { b.t = .05; break; } }
      for (const t of throws) if (hyp(t.x - b.x, t.y - b.y) < b.r + 6) { b.t = .05; }
    }
  }

  // ================= CÂMERAS DE SEGURANÇA / ALARME =================
  function placeCams(n) {
    WLD.cams.length = 0; const reach = reachMap(P.x, P.y);
    for (let i = 0; i < n; i++) { const s = randSpot(reach, 220, 26); if (s) WLD.cams.push({ x: s[0], y: s[1], base: rnd() * TAU, a: 0, ph: rnd() * 6, rg: 250, fov: .62, cool: 0, hot: 0, poly: new Float32Array(26), pt: 0 }); }
  }
  function alarm(src) {
    WLD.alarmT = 8; levelStats.detections++; flash = Math.max(flash, .5); EXP.sfx('alarm');
    banner = { txt: 'ALARME!', sub: 'os guardas sabem onde você está', t: 1.6 };
    for (const e of enemies) if (!(e.ko > 0) && e.state !== 'CHASE') { e.lkp = { x: P.x, y: P.y }; e.heard = e.lkp; setEnemyState(e, 'SEARCH', 3.2); }
  }
  EXP.alarm = alarm;
  function camsTick(dt) {
    WLD.alarmT = Math.max(0, WLD.alarmT - dt);
    const C = WLD.cams;
    for (let i = C.length - 1; i >= 0; i--) {
      const c = C[i];
      for (let k = 0; k < bullets.length; k++) { const u = bullets[k]; if (u.mine && Math.abs(u.x - c.x) < 14 && Math.abs(u.y - c.y) < 14) { camDown(c, i); break; } }
      if (C[i] !== c) continue;
      c.ph += dt * .9; c.a = c.base + Math.sin(c.ph) * .9; c.cool -= dt; c.hot = Math.max(0, c.hot - dt);
      if (c.cool <= 0 && st === 'play') {
        const dx = P.x - c.x, dy = P.y - c.y, d = hyp(dx, dy);
        if (d < c.rg) { const da = Math.atan2(Math.sin(Math.atan2(dy, dx) - c.a), Math.cos(Math.atan2(dy, dx) - c.a)); if (Math.abs(da) < c.fov / 2 && los(c, P)) { c.cool = 10; c.hot = 1.2; alarm(c); } }
      }
      c.pt -= dt; if (c.pt <= 0) { c.pt = .08; const n = 12; for (let k = 0; k <= n; k++) { const ang = c.a - c.fov / 2 + c.fov * k / n; let r = 10; while (r < c.rg && !hitWall(c.x + Math.cos(ang) * r, c.y + Math.sin(ang) * r, 1)) r += 10; c.poly[k * 2] = c.x + Math.cos(ang) * r; c.poly[k * 2 + 1] = c.y + Math.sin(ang) * r; } }
    }
  }
  function camDown(c, i) { WLD.cams.splice(i, 1); EXP.save().stats.cameras++; burstSparks(c.x, c.y, 16, ['#19f0e6', '#fff', '#ffd23f'], 220); popup(c.x, c.y - 18, 'CÂMERA DESTRUÍDA', '#19f0e6'); addScore(75); EXP.sfx('glass'); EXP.checkAch(); }

  // ================= EVENTOS ALEATÓRIOS CONTROLADOS =================
  function eventsTick(dt) {
    WLD.blackout = Math.max(0, WLD.blackout - dt);
    if (WLD.evDone || !EXP.eventsOn || historia || cleared) return;
    WLD.evT -= dt; if (WLD.evT > 0 || enemies.length < 2) return;
    WLD.evDone = true;
    const q = rnd();
    if (q < .34) { WLD.blackout = 14; banner = { txt: 'APAGÃO', sub: 'a luz caiu por alguns segundos', t: 2 }; EXP.sfx('blackout'); }
    else if (q < .68) {
      let n = 2 + (lvl > 5 ? 1 : 0); banner = { txt: 'REFORÇOS', sub: 'mais guardas chegaram', t: 2 }; EXP.sfx('alarm');
      const reach = reachMap(P.x, P.y);
      for (let i = 0; i < n; i++) { const s = randSpot(reach, 320, 26); if (s) { const e = EXP.spawnEnemy(s[0], s[1], rnd() < .35 ? 'bat' : 'gun', null, true); ring(s[0], s[1], 30, '#ff2e5b'); } }
      EXP.enemyCount0 += n; levelStats.total += n;
    } else { banner = { txt: 'ALARME GERAL', sub: 'todos foram avisados', t: 2 }; alarm(null); }
  }

  // ================= RECARGA / PENTE =================
  function reloadStart() {
    const mg = EXP.magOf(cw); if (!mg || M.rt > 0 || M.left >= mg[0] || ammo <= M.left) return;
    M.rtMax = M.rt = mg[1] / (S.reloadMul || 1); EXP.sfx('reload');
  }
  EXP.reload = reloadStart;
  function reloadTick(dt) {
    if (M.cw !== cw) {
      M.cw = cw; const mg = EXP.magOf(cw); M.max = mg ? mg[0] : 0; M.left = mg ? Math.min(M.max, ammo) : 0; M.rt = 0;
      if (cw !== 'punho') { const sv = EXP.save(); sv.weaponsUsed[cw] = (sv.weaponsUsed[cw] || 0) + 1; }
      (levelStats.wset || (levelStats.wset = {}))[cw] = 1;
    }
    if (!M.max) return;
    if (M.rt > 0) { M.rt -= dt; if (M.rt <= 0) { M.left = Math.min(M.max, ammo); EXP.sfx('reloadEnd'); } }
    else if (M.left <= 0 && ammo > 0 && EXP.multiCfg && EXP.multiCfg.autoReload) reloadStart();
    else if (M.left > ammo) M.left = ammo;
  }
  EXP.fireOk = function (wd) {
    if (S.noGuns && WP[cw].gun) return false;
    if (EXP.noGuns) { if (!EXP.noGunMsg || EXP.noGunMsg < performance.now()) { EXP.noGunMsg = performance.now() + 1200; popup(P.x, P.y - 28, 'SEM ARMAS DE FOGO', '#ff9ac8'); } return false; }
    if (!M.max) return true;
    if (M.rt > 0) return false; if (M.left <= 0) { if (EXP.multiCfg && EXP.multiCfg.autoReload) reloadStart(); return false; } return true;
  };
  EXP.onFire = function (wd) {
    if (M.max) M.left--;
    if (EXP.infAmmo) ammo++;
    if (wd.pierce) for (let i = 1; i <= wd.pel; i++) { const b = bullets[bullets.length - i]; if (b && b.mine) b.p += wd.pierce; }
    if (wd.rk > 1) recoil(P.a, wd.shake * (wd.rk - 1));
    if (S.quiet && S.quiet !== 1) { /* ruído já tratado em emitNoise */ }
    EXP.sfx(wd.sfx || 'pistol'); P.fireFlash = .06;
    (levelStats.wset || (levelStats.wset = {}))[cw] = 1;
    if (M.max && M.left <= 0 && ammo > 0 && EXP.multiCfg && EXP.multiCfg.autoReload) reloadStart();
  };
  EXP.spread = wd => wd.spread * (S.spreadMul || 1);
  EXP.life = wd => wd.life ? wd.life * (S.reach || 1) : undefined;
  EXP.spd = wd => wd.spd * (S.reach > 1 ? 1 + (S.reach - 1) * .4 : 1);
  const _emit = emitNoise;
  emitNoise = function (x, y, radius, kind) { if (S && S.quiet && kind === 'gunshot') radius *= S.quiet; _emit(x, y, radius, kind); };
  addEventListener('keydown', e => { if (e.key.toLowerCase() === 'c' && st === 'play') reloadStart(); });

  // melee: durabilidade (garrafa), barris e câmeras ao alcance
  const _melee = melee;
  melee = function () {
    const before = levelStats.melee, mc = mcd, ms = WP[cw].melee ? WP[cw] : WP.punho;
    _melee();
    if (mc > 0 || st !== 'play') return;
    const R = ms.range * S.meleeR;
    for (const b of WLD.barrels) if (b.t < 0 && hyp(b.x - P.x, b.y - P.y) < R * .8) b.t = .05;
    for (let i = WLD.cams.length - 1; i >= 0; i--) { const c = WLD.cams[i]; if (hyp(c.x - P.x, c.y - P.y) < R * .8) camDown(c, i); }
    if (levelStats.melee > before && ms.dur) {
      EXP.dur = (EXP.dur === undefined || EXP.durW !== cw) ? ms.dur : EXP.dur; EXP.durW = cw; EXP.dur--;
      if (EXP.dur <= 0) { popup(P.x, P.y - 26, 'QUEBROU!', '#ff9ac8'); burstSparks(P.x, P.y, 12, ['#bff5d2', '#fff'], 200); cw = 'punho'; ammo = 0; EXP.dur = undefined; }
    }
  };
  const _swap = swapW; swapW = function () { const o = cw; _swap(); if (cw !== o) { EXP.dur = undefined; EXP.sfx('pickup'); } };
  const _open = openDoor;
  openDoor = function (d, fast) { _open(d, fast); try { const [cx, cy] = doorC(d); emitNoise(cx, cy, fast ? 210 : 120, 'door'); if (performance.now() > WLD.doorSfx) { WLD.doorSfx = performance.now() + 250; EXP.sfx(fast ? 'doorKick' : 'door'); } } catch (er) {} };

  // ================= INÍCIO DE SALA =================
  EXP.onRoomStart = function () {
    for (const r of WLD.rings) r.t = 0;
    WLD.boss = null; WLD.alarmT = 0; WLD.blackout = 0; WLD.evDone = false; WLD.evT = 18 + rnd() * 22;
    M.cw = ''; EXP.dur = undefined; levelStats.env = 0;
    if (!EXP.keepEnemies) { EXP.rollClasses(); EXP.enemyCount0 = enemies.length; }
    const reach = reachMap(P.x, P.y);
    placeBarrels(historia ? 0 : (EXP.arena ? 5 : 2 + (rnd() < .6 ? 1 : 0)));
    placeCams(historia || EXP.arena ? 0 : (lvl >= 3 ? 1 + (lvl >= 7 && rnd() < .6 ? 1 : 0) : 0));
    if (!historia) {                       // armas novas desbloqueadas aparecem espalhadas pelo mapa
      const pool = EXP.newWeapons.filter(w => EXP.weaponUnlocked(w) && (WP[w].rar !== 'epico' || rnd() < .5));
      const n = Math.min(pool.length, EXP.arena ? 2 : 1 + (lvl > 3 ? 1 : 0));
      for (let i = 0; i < n; i++) { const s = randSpot(reach, 90, 16), w = pool[Math.floor(rnd() * pool.length)]; if (s) pickups.push({ x: s[0], y: s[1], w, n: EXP.AMMO_NEW[w] || 0, a: rnd() * TAU }); }
    }
  };

  // ================= TICK / DESENHO =================
  EXP.worldTick = function (dt) {
    if (!P) return;
    reloadTick(dt); EXP.aiExtTick(dt); aiTick(dt); bossTick(dt); barrelsTick(dt); camsTick(dt); eventsTick(dt);
    for (const r of WLD.rings) if (r.t > 0) r.t -= dt;
    if (P.fireFlash > 0) P.fireFlash -= dt;
    for (const e of enemies) if (e.iframe > 0 && e.cls !== 'boss') e.iframe -= dt;
  };
  EXP.worldDraw = function (g) {
    const now = performance.now();
    for (const b of WLD.barrels) {
      const arm = b.t >= 0 && Math.floor(now / 70) % 2;
      g.save(); g.translate(b.x, b.y); g.fillStyle = 'rgba(255,138,31,.28)'; g.beginPath(); g.arc(0, 0, b.r + 5, 0, TAU); g.fill();   // brilho barato
      g.fillStyle = arm ? '#fff' : '#b8321c'; g.beginPath(); g.arc(0, 0, b.r, 0, TAU); g.fill();
      g.fillStyle = '#ffd23f'; for (let i = -1; i <= 1; i += 2) g.fillRect(-b.r + 2, i * 5 - 1.5, b.r * 2 - 4, 3);
      g.strokeStyle = '#2a0a06'; g.lineWidth = 2; g.stroke(); g.restore();
    }
    for (const c of WLD.cams) {
      const hot = c.hot > 0 || WLD.alarmT > 0;
      g.save(); g.fillStyle = hot ? 'rgba(255,46,91,.20)' : 'rgba(25,240,230,.11)'; g.beginPath(); g.moveTo(c.x, c.y);
      for (let k = 0; k <= 12; k++) g.lineTo(c.poly[k * 2], c.poly[k * 2 + 1]); g.closePath(); g.fill();
      g.translate(c.x, c.y); g.rotate(c.a); g.fillStyle = '#20202c'; g.strokeStyle = hot ? '#ff2e5b' : '#19f0e6'; g.lineWidth = 2; g.fillRect(-7, -5, 14, 10); g.strokeRect(-7, -5, 14, 10);
      g.fillStyle = hot ? '#ff2e5b' : '#19f0e6'; g.beginPath(); g.arc(7, 0, 3, 0, TAU); g.fill(); g.restore();
    }
    for (const e of enemies) {
      if (!e.cls || e.ko > 0 || !seen(e)) continue;
      const k = CLS[e.cls]; if (!k || !k.col) continue;
      g.save(); g.translate(e.x, e.y); const lw = e.cls === 'blindado' ? 4 : 2, a0 = g.globalAlpha; g.strokeStyle = k.col;
      // brilho barato: traço largo e translúcido por baixo (antes: shadowBlur, caro a cada quadro)
      g.lineWidth = lw + 6; g.globalAlpha = a0 * .28; g.beginPath(); g.arc(0, 0, e.r + 5, 0, TAU); g.stroke();
      g.globalAlpha = a0; g.lineWidth = lw; g.beginPath(); g.arc(0, 0, e.r + 5, 0, TAU); g.stroke();
      if (e.cls === 'blindado' && e.hp > 0) { g.fillStyle = k.col; for (let i = 0; i < e.hp; i++) g.fillRect(-9 + i * 7, -e.r - 12, 5, 3); }
      if (e.cls === 'lider') { g.fillStyle = k.col; g.beginPath(); g.moveTo(-7, -e.r - 6); g.lineTo(-7, -e.r - 14); g.lineTo(-3, -e.r - 9); g.lineTo(0, -e.r - 16); g.lineTo(3, -e.r - 9); g.lineTo(7, -e.r - 14); g.lineTo(7, -e.r - 6); g.fill(); }
      if (e.sniper && e.tele > 0) { g.restore(); g.save(); g.strokeStyle = 'rgba(255,46,91,' + (.35 + .5 * (1 - e.tele / .7)) + ')'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(e.x, e.y); g.lineTo(e.x + Math.cos(e.a) * 560, e.y + Math.sin(e.a) * 560); g.stroke(); }
      if (e.cls === 'boss') {
        g.restore(); g.save(); g.translate(e.x, e.y); const pul = 1 + Math.sin(now / 160) * .08; g.strokeStyle = e.boss.col; g.globalAlpha = .3; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, (e.r + 8) * pul, 0, TAU); g.stroke(); g.globalAlpha = 1; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, (e.r + 8) * pul, 0, TAU); g.stroke();
        if (e.chS === 1) { g.restore(); g.save(); g.strokeStyle = 'rgba(255,46,91,.7)'; g.lineWidth = 3; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(e.x, e.y); g.lineTo(e.x + Math.cos(e.chA) * 420, e.y + Math.sin(e.chA) * 420); g.stroke(); }
      }
      g.restore();
    }
    for (const r of WLD.rings) if (r.t > 0) { const k = 1 - r.t / r.T; g.save(); g.globalAlpha = r.t / r.T; g.strokeStyle = r.c; g.lineWidth = 6 * (1 - k) + 1; g.beginPath(); g.arc(r.x, r.y, r.R * (.25 + .75 * k), 0, TAU); g.stroke(); g.restore(); }
  };
})();

/* ==== BLOCO: FASES EM MATRIZ DE TILES + nextLevel() (exp-world.js) ==================
   Lê TILE_LEVELS / LEVEL_TREE de maps.js. Códigos: 0 chão, 1 parede, 2 vidro, 3 porta,
   4 início, 5 inimigo corpo a corpo, 6 inimigo armado. A matriz original nunca é alterada:
   EXP.tileMap é a cópia viva (o vidro quebrado vira 0 só nela), então reiniciar restaura tudo.
   =================================================================================== */
(function () {
  'use strict';
  const EXP = window.EXP;
  EXP.tileIdx = 0; EXP.tileMap = null;
  const isTile = G => !!G && TILE_LEVELS.indexOf(G) >= 0;
  EXP.curTile = () => (curGrid && isTile(curGrid)) ? curGrid : null;

  const _gridFor = gridFor;
  gridFor = function (n) { const r = EXP.run; if (r && r.tiles) return TILE_LEVELS[EXP.tileIdx]; return _gridFor(n); };

  function buildTileLevel(G) {
    const g = G.map, R = g.length, C = g[0].length;
    EXP.tileMap = g.map(row => row.slice());
    WW = C * TILE; WH = R * TILE; fixedMap = false; mapName = G.nome;
    walls = []; furn = []; decor = []; posts = []; keep = []; doors = [];
    EXP.glass.list.length = 0; EXP.glass.map.clear();
    EXP.glassPending = [];
    rooms = G.zones.map(z => ({ x: z.c * TILE, y: z.r * TILE, w: z.w * TILE, h: z.h * TILE, t: z.floor }));
    startPos = [WW / 2, WH / 2];
    for (let r = 0; r < R; r++) {
      let c = 0;
      while (c < C) {
        const v = EXP.tileMap[r][c];
        if (v === 1) {                                    // funde paredes contíguas da mesma linha
          let e = c; while (e + 1 < C && EXP.tileMap[r][e + 1] === 1) e++;
          walls.push([c * TILE, r * TILE, (e - c + 1) * TILE, TILE]); c = e + 1; continue;
        }
        const x = c * TILE, y = r * TILE;
        if (v === TILE_GLASS) EXP.glassPending.push({ x, y, w: TILE, h: TILE, c, r, key: r * C + c });   // entra nos sólidos só em tileSetup (evita a textura de parede/móvel por cima)
        else if (v === 3) {
          const wl = q => q === 1 || q === TILE_GLASS, vert = wl((EXP.tileMap[r - 1] || [])[c]) && wl((EXP.tileMap[r + 1] || [])[c]), cx = x + TILE / 2, cy = y + TILE / 2;
          doors.push({ x, y, w: TILE, h: TILE, vert, th: 0, target: 0, swing: false, open: false, fast: false, box: vert ? [cx - 4, y, 8, TILE] : [x, cy - 4, TILE, 8] });
        } else if (v === 4) startPos = [x + TILE / 2, y + TILE / 2];
        c++;
      }
    }
    EXP.glassCols = C;
    exitR = [0, 0, 0, 0];
    refreshSol(); rooms.hall = null; paintMap(lvl);
  }
  const _buildGrid = buildGrid;
  buildGrid = function (G) { if (isTile(G)) buildTileLevel(G); else _buildGrid(G); };

  const _spawnGrid = spawnGrid;
  spawnGrid = function (G) {
    if (!isTile(G)) { _spawnGrid(G); return; }
    G.map.forEach((row, r) => row.forEach((v, c) => {
      if (v !== 5 && v !== 6) return;
      const e = EXP.spawnEnemy(c * TILE + TILE / 2, r * TILE + TILE / 2, v === 5 ? 'bat' : 'gun');
      const pt = (G.patrols || []).find(p => p.at[0] === c && p.at[1] === r);
      if (pt) { e.route = pt.route.map(q => ({ x: q[0] * TILE + TILE / 2, y: q[1] * TILE + TILE / 2 })); e.wp = 1; e.state = 'PATROL'; }
    }));
  };

  // pós-montagem: vidro entra nos sólidos, tema das paredes, sem escadas, grade de navegação
  function tileSetup() {
    const G = EXP.curTile(); if (!G) return;
    EXP.glass.list.length = 0; EXP.glass.map.clear();
    for (const gl of EXP.glassPending) { EXP.glass.list.push(gl); EXP.glass.map.set(gl.key, gl); }
    refreshSol();
    transp.length = 0; for (const f of predio) if (f) f.transp = [];
    const tc = tp.getContext('2d'), th = G.theme;
    for (const w of walls) {
      tc.globalAlpha = .9; tc.fillStyle = th.wall; tc.fillRect(w[0], w[1], w[2], w[3]); tc.globalAlpha = 1;
      tc.fillStyle = th.trim; tc.fillRect(w[0], w[1], w[2], 3); tc.fillRect(w[0], w[1] + w[3] - 3, w[2], 3);
    }
  }
  const _ors = EXP.onRoomStart;
  EXP.onRoomStart = function () {
    tileSetup(); EXP.navBuild();
    const G = EXP.curTile(); if (G) EXP.waveLvl = Math.max(EXP.waveLvl || 0, 1 + EXP.tileIdx * 3);
    _ors();
  };

  // Limpa todas as entidades e carrega a próxima matriz da árvore de progressão.
  // Devolve false se a fase atual era a última.
  window.nextLevel = function () {
    const cur = TILE_LEVELS[EXP.tileIdx], nxt = cur && LEVEL_TREE[cur.id] && LEVEL_TREE[cur.id].next;
    if (!nxt) return false;
    enemies.length = 0; bullets.length = 0; pickups.length = 0; corpses.length = 0; blood.length = 0; liveBlood.length = 0;
    throws.length = 0; popups.length = 0; fx.length = 0; sparks.length = 0; soundEvents.length = 0;
    EXP.world.barrels.length = 0; EXP.world.cams.length = 0; EXP.world.boss = null;
    if (EXP.glassFxReset) EXP.glassFxReset();
    EXP.tileIdx = TILE_LEVELS.findIndex(l => l.id === nxt); lvl = EXP.tileIdx + 1;
    if (EXP.run && EXP.run.tiles) { EXP.run.currentTile = EXP.tileIdx; EXP.run.pending = false; }
    startLevel(); st = 'play';
    const G = TILE_LEVELS[EXP.tileIdx]; banner = { txt: G.nome.toUpperCase(), sub: G.briefing, t: 3 };
    return true;
  };
  EXP.levelIsLast = () => { const cur = TILE_LEVELS[EXP.tileIdx]; return !(cur && LEVEL_TREE[cur.id] && LEVEL_TREE[cur.id].next); };
})();
