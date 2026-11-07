/* Cappe in Miami - Expansão | DEPURAÇÃO
   DESLIGADA por padrão. Ative abrindo o jogo com  index.html?dev=1  (ou localStorage hm_dev=1).
   F3 painel · F4 colisões · F6 rotas/IA · F7 próximo mapa · F9 log de erros · F10 chefe */
(function () {
  'use strict';
  const EXP = window.EXP;
  // registro de erros: sempre ativo (apenas guarda texto, sem custo visível)
  EXP.errors = Array.isArray(window.__earlyErrors) ? window.__earlyErrors.splice(0) : [];
  const logE = m => { EXP.errors.push(new Date().toLocaleTimeString() + ' ' + m); if (EXP.errors.length > 40) EXP.errors.shift(); };
  EXP.log = logE;
  addEventListener('error', e => logE((e.message || 'erro') + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno));
  addEventListener('unhandledrejection', e => logE('promise: ' + (e.reason && e.reason.message || e.reason)));

  let on = false; try { on = /[?&]dev=1/.test(location.search) || localStorage.getItem('hm_dev') === '1'; } catch (e) {}
  if (!on) return;
  const D = EXP.dbg = { panel: true, coll: false, ai: false, errs: false, fps: 60, f: 0, t: performance.now(), mapIdx: 0 };
  addEventListener('keydown', e => {
    if (e.key === 'F3') D.panel = !D.panel; else if (e.key === 'F4') D.coll = !D.coll; else if (e.key === 'F6') D.ai = !D.ai; else if (e.key === 'F9') D.errs = !D.errs;
    else if (e.key === 'F7') { const ids = MAPAS.map(m => m.id).filter(i => i !== 'boate-b'); D.mapIdx = (D.mapIdx + 1) % ids.length; mapSel = ids[D.mapIdx]; historia = false; newGame(); }
    else if (e.key === 'F10' && P) EXP.spawnBoss(EXP.bosses[Math.floor(Math.random() * EXP.bosses.length)], 1);
    else return; e.preventDefault();
  });
  const _w = EXP.drawWorld;
  EXP.drawWorld = function (g) {
    _w(g); if (!P) return;
    const renderer = window.HM_WASM_RENDERER;
    if (renderer && renderer.drawDebugWorld && (D.coll || D.ai)) {
      const wallData = D.coll ? new Float64Array(walls.length * 4) : new Float64Array(0);
      const doorData = D.coll ? new Float64Array(doors.length * 4) : new Float64Array(0);
      if (D.coll) {
        for (let i = 0; i < walls.length; i++) wallData.set(walls[i], i * 4);
        for (let i = 0; i < doors.length; i++) {
          const d = doors[i], offset = i * 4;
          doorData[offset] = d.x; doorData[offset + 1] = d.y; doorData[offset + 2] = d.w; doorData[offset + 3] = d.h;
        }
      }
      const enemyList = D.ai ? enemies : [];
      const enemyData = new Float64Array(enemyList.length * 6);
      const labels = [];
      for (let i = 0; i < enemyList.length; i++) {
        const e = enemyList[i], offset = i * 6, target = e.lkp;
        enemyData[offset] = e.x; enemyData[offset + 1] = e.y; enemyData[offset + 2] = e.r;
        enemyData[offset + 3] = target ? 1 : 0;
        enemyData[offset + 4] = target ? target.x : 0; enemyData[offset + 5] = target ? target.y : 0;
        labels.push('#' + (e.id || '?') + ' ' + e.state + (e.cls ? ' ' + e.cls : ''));
      }
      if (renderer.drawDebugWorld(g, wallData, doorData, P.x, P.y, P.r, D.coll, enemyData, labels, D.ai)) return;
    }
    if (D.coll) { g.save(); g.strokeStyle = 'rgba(0,255,120,.8)'; g.lineWidth = 1; for (const w of walls) g.strokeRect(w[0], w[1], w[2], w[3]); g.strokeStyle = 'rgba(255,210,63,.9)'; for (const d of doors) g.strokeRect(d.x, d.y, d.w, d.h); g.strokeStyle = '#19f0e6'; g.beginPath(); g.arc(P.x, P.y, P.r, 0, 6.3); g.stroke(); g.restore(); }
    if (D.ai) { g.save(); g.font = '11px monospace'; g.textAlign = 'center'; for (const e of enemies) { g.strokeStyle = 'rgba(255,46,147,.7)'; g.beginPath(); g.arc(e.x, e.y, e.r, 0, 6.3); g.stroke(); if (e.lkp) { g.strokeStyle = 'rgba(255,210,63,.6)'; g.beginPath(); g.moveTo(e.x, e.y); g.lineTo(e.lkp.x, e.lkp.y); g.stroke(); } g.fillStyle = '#fff'; g.fillText('#' + (e.id || '?') + ' ' + e.state + (e.cls ? ' ' + e.cls : ''), e.x, e.y - e.r - 6); } g.restore(); }
  };
  const _h = EXP.drawHUD;
  EXP.drawHUD = function (g) {
    _h(g); D.f++; const n = performance.now(); if (n - D.t > 500) { D.fps = Math.round(D.f * 1000 / (n - D.t)); D.f = 0; D.t = n; }
    const lines = ['DEV  FPS ' + D.fps, 'pos ' + (P ? Math.round(P.x) + ',' + Math.round(P.y) : '-'), 'mapa ' + mapName + ' ' + WW + 'x' + WH, 'inimigos ' + enemies.length + ' balas ' + bullets.length, 'paredes ' + walls.length + ' portas ' + doors.length, 'F3 painel F4 colisão F6 IA F7 mapa', 'F9 erros F10 chefe'];
    const errorLines = D.errs ? EXP.errors.slice(-12).map(s => s.slice(0, 90)) : [];
    const renderer = window.HM_WASM_RENDERER;
    if (renderer && renderer.drawDebugHud && renderer.drawDebugHud(g, W, H, D.panel, lines, D.errs, errorLines)) return;
    g.save(); g.font = '12px monospace'; g.textAlign = 'left'; g.fillStyle = 'rgba(0,0,0,.65)';
    if (D.panel) { g.fillRect(W - 250, H - 150, 244, 120); g.fillStyle = '#7dff9b'; lines.forEach((s, i) => g.fillText(s, W - 244, H - 134 + i * 15)); }
    if (D.errs) { g.fillStyle = 'rgba(0,0,0,.8)'; g.fillRect(10, 200, 560, 200); g.fillStyle = '#ff9ac8'; errorLines.forEach((s, i) => g.fillText(s, 16, 218 + i * 15)); if (!errorLines.length) g.fillText('sem erros registrados', 16, 218); }
    g.restore();
  };
})();
