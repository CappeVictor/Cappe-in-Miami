/* Cappe-in-Miami | CÉREBRO DOS BOTS
   Mira com antecipação limitada e erro que diminui com a inteligência do bot,
   tempo de reação após ver o jogador, esquiva de balas e leque de tiro mais estreito.
   A inteligência vem da dificuldade (DIF.iq). Hardcore tem teto de 0.75: esperto, não sobre-humano. */
(function () {
  'use strict';
  const EXP = window.EXP;
  const SKILL_CAP = 0.75;

  EXP.skill = function () {
    const d = typeof D === 'function' ? D() : null;
    const s = d && typeof d.iq === 'number' ? d.iq : 0.4;
    return Math.min(SKILL_CAP, Math.max(0, s));
  };

  EXP.reaction = function (e) {
    const s = EXP.skill();
    return (0.7 - 0.4 * s) * (e.type === 'shot' ? 1.15 : 1);
  };

  EXP.errAng = function (e, d) {
    const s = EXP.skill();
    const px = (50 - 42 * s) * (0.5 + d / 520);
    return (Math.random() * 2 - 1) * px / Math.max(40, d);
  };

  EXP.fanOffsets = function () {
    const s = EXP.skill();
    const w = 0.22 * (1.15 - s);
    return [-w, 0, w];
  };

  EXP.aimAt = function (e, d, spd) {
    const s = EXP.skill();
    const target = EXP.targetActor ? EXP.targetActor(e.x, e.y) : P;
    if (!target) return e.a;
    let tx = target.x, ty = target.y;
    if (s > 0.3 && !(target.dash > 0)) {
      const tt = d / spd, k = 0.3 + 0.4 * s;
      let lx = (target.vx || 0) * tt * k, ly = (target.vy || 0) * tt * k;
      const L = hyp(lx, ly), cap = 30 + 70 * s;
      if (L > cap) { lx *= cap / L; ly *= cap / L; }
      tx += lx; ty += ly;
    }
    const a = Math.atan2(ty - e.y, tx - e.x) + EXP.errAng(e, d);
    e.a = a;
    return a;
  };

  EXP.brain = function (e, d, canSee, dt) {
    e.seenT = canSee ? (e.seenT || 0) + dt : 0;

    if (e.dgT > 0) {
      e.dgT -= dt;
      move(e, e.dgMv.x * 95 * dt, e.dgMv.y * 95 * dt);
    }
    if (e.dodgeCd > 0) { e.dodgeCd -= dt; return; }

    const s = EXP.skill();
    if (s < 0.25) return;
    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i];
      if (!b.mine) continue;
      const sp = hyp(b.vx, b.vy) || 1;
      const bx = e.x - b.x, by = e.y - b.y;
      const along = (bx * b.vx + by * b.vy) / sp;
      if (along <= 0 || along > 110) continue;
      const cross = bx * b.vy - by * b.vx;
      if (Math.abs(cross) / sp > 22) continue;
      e.dodgeCd = 0.7;
      if (Math.random() > 0.2 + 0.6 * s) break;
      const side = cross >= 0 ? -1 : 1;
      e.dgMv = { x: (-b.vy / sp) * side, y: (b.vx / sp) * side };
      e.dgT = 0.22;
      break;
    }
  };
})();
