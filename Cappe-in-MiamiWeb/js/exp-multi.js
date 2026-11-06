/* Cappe in Miami v30.1 — Multiplayer Local aprimorado
   - Controles P2 mais confiáveis (e.code + gamepad)
   - Estado próprio do P2 (cooldown, inv, dash)
   - Modos: Co-op Clássico, Co-op Horda, Co-op Sobrevivência
   - HUD dual, tags, indicador no menu
*/
(function () {
  'use strict';
  const EXP = window.EXP || (window.EXP = {});

  const MULTI = {
    enabled: false,
    mode: 'coop',
    lives: 'shared',
    friendlyFire: false,
    camMode: 'mid',
    p2Scheme: 'arrows',
    P2: null,
    players: [],
    deadFlags: [false, false],
    p2Cd: 0,
    p2Mcd: 0,
    p2InteractCd: 0,
    scoreShare: true,
    gpIndex: 0
  };
  EXP.MULTI = MULTI;

  const CFG = {
    multi: false,
    mode: 'coop',
    lives: 'shared',
    ff: false,
    camMulti: 'mid',
    p2scheme: 'arrows',
    showFps: false,
    masterVol: 1,
    mouseSens: 1,
    invertY: false,
    autoReload: false,
    crosshair: true,
    crossOp: 80,
    showTags: true
  };
  EXP.multiCfg = CFG;

  const CFG_ENUMS = { mode:['coop','horda','survive'], lives:['shared','independent'], camMulti:['mid','p1','p2'], p2scheme:['arrows','numpad','gamepad'] };
  const CFG_RANGES = { masterVol:[0,1], mouseSens:[.3,3], crossOp:[20,100] };
  function loadSavedMultiCfg(saved) {
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return;
    for (const key of Object.keys(CFG)) {
      if (!Object.prototype.hasOwnProperty.call(saved,key)) continue;
      const value=saved[key],fallback=CFG[key];
      if (typeof fallback==='boolean') { if(typeof value==='boolean')CFG[key]=value; continue; }
      if (typeof fallback==='number') { const range=CFG_RANGES[key]; if(typeof value==='number'&&Number.isFinite(value)&&range&&value>=range[0]&&value<=range[1])CFG[key]=value; continue; }
      if (typeof value==='string'&&CFG_ENUMS[key]?.includes(value))CFG[key]=value;
    }
  }

  function load() {
    try {
      const r = localStorage.getItem('hm_multi_cfg');
      if (r) loadSavedMultiCfg(JSON.parse(r));
    } catch (e) {}
    MULTI.enabled = !!CFG.multi;
    MULTI.mode = CFG.mode || 'coop';
    MULTI.lives = CFG.lives || 'shared';
    MULTI.friendlyFire = !!CFG.ff;
    MULTI.camMode = CFG.camMulti || 'mid';
    MULTI.p2Scheme = CFG.p2scheme || 'arrows';
  }
  function save() {
    try { localStorage.setItem('hm_multi_cfg', JSON.stringify(CFG)); } catch (e) {}
  }
  load();

  function $(id) { return document.getElementById(id); }
  function syncOpts() {
    if (!$('o-multi')) return;
    $('o-multi').checked = MULTI.enabled;
    if ($('o-multiMode')) $('o-multiMode').value = MULTI.mode;
    $('o-lives').value = MULTI.lives;
    $('o-ff').checked = MULTI.friendlyFire;
    $('o-camMulti').value = MULTI.camMode;
    $('o-p2scheme').value = MULTI.p2Scheme;
    if ($('o-showFps')) $('o-showFps').checked = !!CFG.showFps;
    if ($('o-masterVol')) {
      $('o-masterVol').value = CFG.masterVol;
      const v = $('o-masterVolV'); if (v) v.textContent = Math.round(CFG.masterVol * 100) + '%';
    }
    if ($('o-mouseSens')) {
      $('o-mouseSens').value = CFG.mouseSens;
      const v = $('o-mouseSensV'); if (v) v.textContent = (+CFG.mouseSens).toFixed(1);
    }
    if ($('o-invertY')) $('o-invertY').checked = !!CFG.invertY;
    if ($('o-autoReload')) $('o-autoReload').checked = !!CFG.autoReload;
    if ($('o-crosshair')) $('o-crosshair').checked = CFG.crosshair !== false;
    if ($('o-crossOp')) {
      $('o-crossOp').value = CFG.crossOp;
      const v = $('o-crossOpV'); if (v) v.textContent = CFG.crossOp + '%';
    }
    updateMenuBadge();
  }

  function bindOpts() {
    const on = (id, fn) => { const el = $(id); if (el) el.addEventListener('change', fn); };
    on('o-multi', e => { MULTI.enabled = e.target.checked; CFG.multi = MULTI.enabled; save(); updateMenuBadge(); });
    on('o-multiMode', e => { MULTI.mode = e.target.value; CFG.mode = MULTI.mode; save(); updateMenuBadge(); });
    on('o-lives', e => { MULTI.lives = e.target.value; CFG.lives = MULTI.lives; save(); });
    on('o-ff', e => { MULTI.friendlyFire = e.target.checked; CFG.ff = MULTI.friendlyFire; save(); });
    on('o-camMulti', e => { MULTI.camMode = e.target.value; CFG.camMulti = MULTI.camMode; save(); });
    on('o-p2scheme', e => { MULTI.p2Scheme = e.target.value; CFG.p2scheme = MULTI.p2Scheme; save(); });
    on('o-showFps', e => { CFG.showFps = e.target.checked; save(); toggleFps(); });
    on('o-masterVol', e => {
      CFG.masterVol = +e.target.value;
      const v = $('o-masterVolV'); if (v) v.textContent = Math.round(CFG.masterVol * 100) + '%';
      if (EXP.applyVol) EXP.applyVol();
      save();
    });
    on('o-mouseSens', e => {
      CFG.mouseSens = +e.target.value;
      const v = $('o-mouseSensV'); if (v) v.textContent = CFG.mouseSens.toFixed(1);
      save();
    });
    on('o-invertY', e => { CFG.invertY = e.target.checked; save(); });
    on('o-autoReload', e => { CFG.autoReload = e.target.checked; save(); });
    on('o-crosshair', e => { CFG.crosshair = e.target.checked; save(); updateCrosshair(); });
    on('o-crossOp', e => {
      CFG.crossOp = +e.target.value;
      const v = $('o-crossOpV'); if (v) v.textContent = CFG.crossOp + '%';
      save(); updateCrosshair();
    });
  }

  function updateMenuBadge() {
    let badge = $('multiBadge');
    if (!badge) {
      const menu = $('menu');
      if (!menu) return;
      badge = document.createElement('div');
      badge.id = 'multiBadge';
      badge.className = 'multi-badge';
      const anchor = menu.querySelector('.menu-controls-box') || menu.querySelector('h1');
      if (anchor) menu.insertBefore(badge, anchor.nextSibling);
      else menu.appendChild(badge);
    }
    if (MULTI.enabled) {
      const names = { coop: 'Co-op Clássico', horda: 'Co-op Horda', survive: 'Co-op Sobrevivência' };
      badge.textContent = 'MULTIPLAYER ATIVO · ' + (names[MULTI.mode] || MULTI.mode);
      badge.classList.add('on');
    } else {
      badge.textContent = 'Solo';
      badge.classList.remove('on');
    }
  }

  let fpsEl = null, fpsFrames = 0, fpsLast = 0;
  function toggleFps() {
    if (CFG.showFps) {
      if (!fpsEl) {
        fpsEl = document.createElement('div');
        fpsEl.className = 'fps-counter';
        document.querySelector('.stage')?.appendChild(fpsEl);
      }
      fpsEl.style.display = '';
    } else if (fpsEl) fpsEl.style.display = 'none';
  }
  function tickFps(t) {
    if (!CFG.showFps || !fpsEl) return;
    fpsFrames++;
    if (t - fpsLast >= 400) {
      fpsEl.textContent = Math.round(fpsFrames * 1000 / (t - fpsLast)) + ' FPS';
      fpsFrames = 0; fpsLast = t;
    }
  }

  let crossEl = null;
  function updateCrosshair() {
    if (CFG.crosshair !== false) {
      if (!crossEl) {
        crossEl = document.createElement('div');
        crossEl.className = 'crosshair-custom';
        document.querySelector('.stage')?.appendChild(crossEl);
      }
      crossEl.style.setProperty('--ch-op', (CFG.crossOp / 100).toFixed(2));
      crossEl.style.display = (typeof st !== 'undefined' && st === 'play') ? '' : 'none';
    } else if (crossEl) crossEl.style.display = 'none';
  }
  function moveCrosshair(mx, my) {
    if (!crossEl || CFG.crosshair === false) return;
    const stage = document.querySelector('.stage');
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    crossEl.style.left = (mx - r.left) + 'px';
    crossEl.style.top = (my - r.top) + 'px';
  }

  function spawnP2(baseP) {
    if (!MULTI.enabled || !baseP) {
      MULTI.P2 = null;
      MULTI.players = baseP ? [baseP] : [];
      MULTI.deadFlags = [false, false];
      return null;
    }
    const radius = baseP.r || 13;
    let spawn = null;
    const reachable = typeof reachMap === 'function' ? reachMap(baseP.x, baseP.y) : null;
    for (const distance of [32, 48, 64, 80]) {
      for (let i = 0; i < 16; i++) {
        const angle = i * Math.PI / 8;
        const x = baseP.x + Math.cos(angle) * distance;
        const y = baseP.y + Math.sin(angle) * distance;
        if ((typeof hitWall !== 'function' || !hitWall(x, y, radius + 1)) && (!reachable || reachable(x, y))) {
          spawn = { x, y }; break;
        }
      }
      if (spawn) break;
    }
    if (!spawn) {
      MULTI.P2 = null; MULTI.players = [baseP]; MULTI.deadFlags = [false, false];
      MULTI.spawnError = true;
      if (typeof EXP.toast === 'function') EXP.toast('P2 NÃO PÔDE ENTRAR', 'Não há espaço livre perto do jogador.', '#ff9ac8');
      return null;
    }
    MULTI.spawnError = false;
    const p2 = {
      x: spawn.x, y: spawn.y, r: radius, a: baseP.a || 0,
      shield: baseP.shield || 0, inv: 0, dash: 0, dx: 0, dy: 0,
      isP2: true, dead: false, atk: 0, anim: 0, lx: spawn.x, ly: spawn.y
    };
    MULTI.P2 = p2;
    MULTI.players = [baseP, p2];
    MULTI.deadFlags = [false, false];
    MULTI.p2Cd = 0; MULTI.p2Mcd = 0; MULTI.p2InteractCd = 0;
    return p2;
  }

  function gpAxes() {
    try {
      const gps = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gps[MULTI.gpIndex] || gps[0];
      if (!gp || !gp.connected) return null;
      const dead = 0.28;
      let dx = gp.axes[0] || 0, dy = gp.axes[1] || 0;
      if (Math.abs(dx) < dead) dx = 0;
      if (Math.abs(dy) < dead) dy = 0;
      if (gp.buttons[12]?.pressed) dy = -1;
      if (gp.buttons[13]?.pressed) dy = 1;
      if (gp.buttons[14]?.pressed) dx = -1;
      if (gp.buttons[15]?.pressed) dx = 1;
      const len = Math.hypot(dx, dy) || 1;
      return {
        dx: dx / len, dy: dy / len,
        shoot: !!(gp.buttons[7]?.pressed || gp.buttons[5]?.pressed || gp.buttons[0]?.pressed),
        punch: !!(gp.buttons[2]?.pressed || gp.buttons[1]?.pressed),
        pick: !!(gp.buttons[3]?.pressed),
        drop: !!(gp.buttons[6]?.pressed)
      };
    } catch (e) { return null; }
  }

  function p2MoveVector(keys) {
    if (MULTI.p2Scheme === 'gamepad' || MULTI.p2Scheme === 'arrows') {
      const g = gpAxes();
      if (g && (g.dx || g.dy)) return { dx: g.dx, dy: g.dy };
    }
    let dx = 0, dy = 0;
    if (MULTI.p2Scheme === 'numpad') {
      if (keys['numpad8'] || keys['8']) dy -= 1;
      if (keys['numpad2'] || keys['2']) dy += 1;
      if (keys['numpad4'] || keys['4']) dx -= 1;
      if (keys['numpad6'] || keys['6']) dx += 1;
    } else {
      if (keys['arrowup']) dy -= 1;
      if (keys['arrowdown']) dy += 1;
      if (keys['arrowleft']) dx -= 1;
      if (keys['arrowright']) dx += 1;
    }
    const len = Math.hypot(dx, dy) || 1;
    return { dx: dx / len, dy: dy / len };
  }

  function p2WantsShoot(keys) {
    const g = gpAxes();
    if (g && g.shoot) return true;
    if (MULTI.p2Scheme === 'numpad') return !!(keys['numpad0'] || keys['0'] || keys['insert']);
    return !!keys['controlright'];
  }
  function p2WantsPunch(keys) {
    const g = gpAxes();
    if (g && g.punch) return true;
    return !!(keys['.'] || keys['period'] || keys['numpad1'] || keys['1']);
  }
  function p2WantsPick(keys) {
    const g = gpAxes();
    if (g && g.pick) return true;
    return !!(keys['/'] || keys['slash'] || keys['numpad3'] || keys['3']);
  }
  function p2WantsDrop(keys) {
    const g = gpAxes();
    if (g && g.drop) return true;
    return !!(keys[';'] || keys['semicolon'] || keys['numpad9'] || keys['9']);
  }

  function multiCamFocus(P, P2) {
    if (!MULTI.enabled || !P2) return { x: P.x, y: P.y };
    if (MULTI.deadFlags[0] && !MULTI.deadFlags[1]) return { x: P2.x, y: P2.y };
    if (!MULTI.deadFlags[0] && MULTI.deadFlags[1]) return { x: P.x, y: P.y };
    if (P2.dead) return { x: P.x, y: P.y };
    if (MULTI.camMode === 'p1') return { x: P.x, y: P.y };
    if (MULTI.camMode === 'p2') return { x: P2.x, y: P2.y };
    return { x: (P.x + P2.x) * 0.5, y: (P.y + P2.y) * 0.5 };
  }

  function markDead(isP2) {
    MULTI.deadFlags[isP2 ? 1 : 0] = true;
    const player = isP2 ? MULTI.P2 : (typeof P !== 'undefined' ? P : null);
    if (player) { player.dead = true; player.inv = 999; player.dash = 0; }
  }
  function shouldGameOver() {
    if (!MULTI.enabled) return true;
    if (MULTI.lives === 'shared') return MULTI.deadFlags[0] || MULTI.deadFlags[1];
    return MULTI.deadFlags[0] && MULTI.deadFlags[1];
  }
  function anyAlive() {
    if (!MULTI.enabled) return true;
    return !MULTI.deadFlags[0] || !MULTI.deadFlags[1];
  }

  function updateP2(dt, keys, moveFn, S, WP, ammoObj) {
    if (!MULTI.enabled || !MULTI.P2 || MULTI.P2.dead || !anyAlive()) return;
    const p2 = MULTI.P2;
    MULTI.p2Cd = Math.max(0, MULTI.p2Cd - dt);
    MULTI.p2Mcd = Math.max(0, MULTI.p2Mcd - dt);
    MULTI.p2InteractCd = Math.max(0, MULTI.p2InteractCd - dt);
    p2.inv = Math.max(0, (p2.inv || 0) - dt);

    const mv = p2MoveVector(keys);
    const speed = 200 * (S && S.speed ? S.speed : 1);
    if (mv.dx || mv.dy) {
      moveFn(p2, mv.dx * speed * dt, mv.dy * speed * dt);
      p2.a = Math.atan2(mv.dy, mv.dx);
    }

    if (p2WantsShoot(keys) && MULTI.p2Cd <= 0) {
      const wd = WP[cw];
      if (wd && wd.gun && ammoObj && ammoObj.v > 0 &&
          (!S || !S.noGuns) && (!window.EXP || !EXP.fireOk || EXP.fireOk(wd))) {
        const pel = wd.pel || 1;
        for (let i = 0; i < pel; i++) {
          if (typeof shoot === 'function') {
            shoot(p2, p2.a + (Math.random() - 0.5) * (wd.spread || 0.05), wd.spd || 700, true, wd.life);
          }
        }
        ammoObj.v = Math.max(0, ammoObj.v - 1);
        if (typeof levelStats !== 'undefined') levelStats.shots += pel;
        MULTI.p2Cd = (wd.cd || 0.25) / (S && S.fire ? S.fire : 1);
        if (typeof emitNoise === 'function') emitNoise(p2.x, p2.y, wd.noise || 300, 'gunshot');
        if (typeof triggerScreenShake === 'function') triggerScreenShake(wd.shake || 3, 0.08);
        if (typeof EXP.onFire === 'function') EXP.onFire(wd);
      }
    }

    if (p2WantsPunch(keys) && MULTI.p2Mcd <= 0) {
      MULTI.p2Mcd = 0.35;
      p2.atk = 0.2;
      if (typeof enemies !== 'undefined' && typeof stun === 'function') {
        for (const e of enemies) {
          if (e.dead || (e.stun || 0) > 0) continue;
          const d = Math.hypot(e.x - p2.x, e.y - p2.y);
          if (d < 30 * (S && S.meleeR ? S.meleeR : 1)) stun(e, 1.1, 'SOCO!');
        }
      }
    }

    if (MULTI.p2InteractCd <= 0 && p2WantsPick(keys) && typeof pickups !== 'undefined') {
      let pick = null, distance = 38;
      for (const item of pickups) {
        const d = Math.hypot(item.x - p2.x, item.y - p2.y);
        if (d < distance && !(S && S.noGuns && WP[item.w] && WP[item.w].gun)) { pick = item; distance = d; }
      }
      if (pick) {
        pickups.splice(pickups.indexOf(pick), 1);
        if (cw !== 'punho') pickups.push({ x: pick.x, y: pick.y, w: cw, n: ammo, a: 0 });
        cw = pick.w; ammo = pick.n || 0; MULTI.p2InteractCd = 0.3;
        if (typeof popup === 'function') popup(p2.x, p2.y - 26, WP[cw].nome.toUpperCase(), '#ffd23f');
      }
    }
    if (MULTI.p2InteractCd <= 0 && p2WantsDrop(keys) && cw !== 'punho' && typeof pickups !== 'undefined') {
      const x = p2.x + Math.cos(p2.a) * 22, y = p2.y + Math.sin(p2.a) * 22;
      const spot = typeof hitWall !== 'function' || !hitWall(x, y, 8) ? { x, y } : { x: p2.x, y: p2.y };
      pickups.push({ x: spot.x, y: spot.y, w: cw, n: ammo, a: 0 });
      cw = 'punho'; ammo = 0; MULTI.p2InteractCd = 0.3;
      if (typeof popup === 'function') popup(p2.x, p2.y - 26, 'LARGOU', '#ff9ac8');
    }
  }

  function setupMenu() {
    const btn = $('multiBtn');
    if (btn) {
      btn.onclick = () => {
        MULTI.enabled = true; CFG.multi = true; save(); syncOpts(); updateMenuBadge();
        if (typeof showMasks === 'function') showMasks();
      };
    }
  }

  function setupKeys() {
    addEventListener('keydown', e => {
      if (e.key.toLowerCase() === 'm' && typeof st !== 'undefined' && st === 'menu') {
        $('multiBtn')?.click();
        e.preventDefault();
      }
    });
  }

  function init() {
    if ($('o-multi') && !$('o-multiMode')) {
      const livesLabel = $('o-lives') && $('o-lives').closest('label');
      if (livesLabel) {
        const lab = document.createElement('label');
        lab.innerHTML = 'Modo multiplayer <select id="o-multiMode"><option value="coop">Co-op Clássico</option><option value="horda">Co-op Horda</option><option value="survive">Co-op Sobrevivência</option></select>';
        livesLabel.parentNode.insertBefore(lab, livesLabel);
      }
    }
    const p2sel = $('o-p2scheme');
    if (p2sel && !p2sel.querySelector('option[value="gamepad"]')) {
      const o = document.createElement('option');
      o.value = 'gamepad'; o.textContent = 'Controle (Gamepad)';
      p2sel.appendChild(o);
    }

    syncOpts();
    bindOpts();
    setupMenu();
    setupKeys();
    toggleFps();
    updateCrosshair();
    updateMenuBadge();

    addEventListener('pointermove', e => {
      if (CFG.crosshair !== false) moveCrosshair(e.clientX, e.clientY);
    });
  }

  EXP.multi = {
    MULTI, cfg: CFG, load, save, syncOpts,
    spawnP2, p2MoveVector, p2WantsShoot, p2WantsPunch, p2WantsPick, p2WantsDrop,
    multiCamFocus, shouldGameOver, markDead, anyAlive,
    updateP2, tickFps, init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 80));
  } else {
    setTimeout(init, 80);
  }
})();
