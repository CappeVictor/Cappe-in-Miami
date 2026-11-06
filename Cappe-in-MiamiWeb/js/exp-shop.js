/* Cappe-in-Miami | VENDEDORA v31 (Madame Piranha)
   Quando metade dos inimigos cai, Madame Piranha aparece com 3 mercadorias (OFENSIVA, DEFENSIVA, UTILIDADE)
   e uma carta de REROLAR. Passe por cima de uma mercadoria para comprar; passe no REROLAR para trocar o estoque.
   - 1 reroll grátis por partida; depois o custo sobe com o tempo da partida.
   - Cada reroll na mesma visita aumenta a chance de itens raros e épicos.
   Ela aparece no máximo uma vez por fase e fica 4s. Preços sobem por fase. */
(function () {
  'use strict';
  const EXP = window.EXP;
  const KILL_CRED = 10, CLEAR_BASE = 40, CLEAR_PER_LVL = 5;
  const DEAL_TIME = 4, FALL_TIME = 0.6, CARD_R = 24, PRICE_STEP = 0.06;
  const REROLL_BASE = 40, REROLL_PER_30S = 10;
  const ROW_Y = -95, ROW_X = 125, REROLL_Y = 62;

  const ITEMS = [
    { id: 'municao', nome: 'Munição', preco: 25, desc: 'Recarrega a arma atual.' },
    { id: 'municao2', nome: 'Caixa de munição', preco: 55, desc: 'Recarga dobrada da arma atual.' },
    { id: 'colete', nome: 'Colete extra', preco: 60, desc: '+1 escudo: aguenta um golpe.' },
    { id: 'colete2', nome: 'Colete reforçado', preco: 110, desc: '+2 escudos: aguenta dois golpes.' },
    { id: 'faca', nome: 'Faca', preco: 30, desc: 'Arma branca, sem munição.' },
    { id: 'pistola', nome: 'Pistola', preco: 45, desc: 'Tiro simples, pouca munição.' },
    { id: 'revolver', nome: 'Revólver', preco: 80, desc: 'Dano forte, cadência lenta.' },
    { id: 'escopeta', nome: 'Escopeta', preco: 110, desc: 'Curto alcance, espalha os tiros.' },
    { id: 'smg', nome: 'SMG', preco: 120, desc: 'Rajadas rápidas, dano médio.' },
    { id: 'uzi', nome: 'Uzi', preco: 130, desc: 'Rajadas muito rápidas.' },
    { id: 'rifle', nome: 'Rifle', preco: 150, desc: 'Longo alcance, muito preciso.' },
  ];
  const GUNS = ['pistola', 'revolver', 'escopeta', 'smg', 'uzi', 'rifle'];

  // raridade por categoria: comum / rara / épica
  const TIERS = {
    OFENSIVA: { cor: '#ff2e93', common: ['faca', 'pistola'], rare: ['revolver', 'escopeta'], epic: ['smg', 'uzi', 'rifle'] },
    DEFENSIVA: { cor: '#19f0e6', common: ['colete'], rare: ['colete2'], epic: ['colete2'] },
    UTILIDADE: { cor: '#ffd23f', common: ['municao'], rare: ['municao2'], epic: ['municao2'] },
  };
  const CATS = ['OFENSIVA', 'DEFENSIVA', 'UTILIDADE'];

  const LINES = {
    chegada: ['Olha quem chegou. Tem dinheiro na mão?', 'Sem perguntas, querido. Só mercadoria boa.', 'Aquele porto deu trabalho, né? Escolhe logo.'],
    compra: ['Boa escolha.', 'Sai daqui com estilo.', 'Não atira no próprio pé.'],
    reroll: ['Nova mercadoria, quente saindo do caminhão.', 'Vou ver o que mais tenho no fundo.', 'Olha só esse estoque novo.'],
    semDinheiro: ['Sem crédito, sem conversa.', 'Volta quando estiver mais rica.'],
    semArma: ['Sem arma de fogo, sem munição, querido.'],
    saida: ['Não me faz ir embora sem vender nada!', 'Até a próxima, Cappe.'],
  };

  const SH = {
    cred: 0, dealer: null, cards: null, reroll: null, timer: 0, eligible: false, spawned: false,
    lastKills: 0, lastCleared: false, bubble: null, t: 0,
    matchT: 0, freeLeft: 1, visitRolls: 0, hitstop: 0,
  };
  EXP.shop = SH;
  SH.costNow = () => rerollCost();

  const itemOf = id => ITEMS.find(i => i.id === id);
  const hasGun = () => !!(WP[cw] && WP[cw].gun);
  const curLevel = () => (historia ? capIdx + 1 : lvl);
  const pick = arr => arr[(Math.random() * arr.length) | 0];
  function eligibleLevel() { return historia ? capIdx % 3 === 2 : lvl > 0 && lvl % 5 === 0; }

  function priceOf(it) { return Math.round(it.preco * (1 + PRICE_STEP * Math.max(0, curLevel() - 1)) / 5) * 5; }
  function rerollCost() { return Math.round((REROLL_BASE + Math.floor(SH.matchT / 30) * REROLL_PER_30S) / 5) * 5; }

  // chance de cada raridade: cada reroll da visita favorece itens melhores
  function weights() {
    const s = SH.visitRolls;
    return { common: Math.max(10, 60 - 12 * s), rare: 30 + 8 * s, epic: 10 + 4 * s };
  }
  function tierRoll() {
    const w = weights(), tot = w.common + w.rare + w.epic, r = Math.random() * tot;
    return r < w.common ? 'common' : r < w.common + w.rare ? 'rare' : 'epic';
  }

  // sorteia um item da categoria, respeitando o personagem e o que já está na mão
  function rollItem(cat) {
    const T = TIERS[cat];
    for (let tries = 0; tries < 8; tries++) {
      let id = pick(T[tierRoll()]);
      if (cat === 'UTILIDADE' && !hasGun()) id = 'faca';                 // sem arma de fogo, munição não serve
      if (id === cw) continue;                                           // não oferece a arma que já está na mão
      if (S.noGuns && GUNS.includes(id)) continue;                       // ex.: Tony não usa arma de fogo
      return id;
    }
    return 'faca';
  }

  // aplica o item; devolve mensagem de erro (sem cobrar) ou null
  function applyItem(it) {
    if (it.id === 'municao' || it.id === 'municao2') {
      if (!hasGun()) return 'SEM ARMA DE FOGO';
      const mult = it.id === 'municao2' ? 2 : 1;
      ammo = WP[cw].start(lvl) * mult + (S.ammo || 0);
      return null;
    }
    if (it.id === 'colete') { P.shield = (P.shield || 0) + 1; return null; }
    if (it.id === 'colete2') { P.shield = (P.shield || 0) + 2; return null; }
    if (S.noGuns && GUNS.includes(it.id)) return 'ESSE PERSONAGEM NÃO USA ARMA';
    const N = WP[it.id];
    cw = it.id;
    ammo = N.gun ? N.start(lvl) + (S.ammo || 0) : 0;
    return null;
  }

  function say(txt, t) { SH.bubble = { txt, t: t || 2.4 }; }

  function makeCards() {
    return CATS.map((cat, k) => ({ x: 0, y: 0, cat, slot: TIERS[cat], id: rollItem(cat), sold: false, cool: 0, stamp: 0, dx: (k - 1) * ROW_X, dy: ROW_Y }));
  }

  function enemiesNear(x, y, r) {
    if (typeof enemies === 'undefined' || !Array.isArray(enemies)) return false;
    return enemies.some(e => e && e.hp !== 0 && hyp(e.x - x, e.y - y) < r);
  }

  function place(x, y) {
    const items = SH.cards;
    const all = items.concat([SH.reroll]);
    for (const c of all) { c.x = x + c.dx; c.y = y + c.dy; }
    return all.every(c => !hitWall(c.x, c.y, 14) && !enemiesNear(c.x, c.y, 30));
  }

  function spawnDealer() {
    for (let i = 0; i < 300; i++) {
      const a = Math.random() * 6.2832, r = 150 + Math.random() * 110;
      const x = P.x + Math.cos(a) * r, y = P.y + Math.sin(a) * r;
      if (x < 80 || y < 100 || x > WW - 80 || y > WH - 80 || hitWall(x, y, 18)) continue;
      if (exitR && x > exitR[0] - 40 && x < exitR[0] + exitR[2] + 40 && y > exitR[1] - 40 && y < exitR[1] + exitR[3] + 40) continue;
      if (enemiesNear(x, y, 60)) continue;
      SH.cards = makeCards();
      SH.reroll = { cat: 'REROLAR', dx: 0, dy: REROLL_Y, cool: 0, stamp: 0, reroll: true };
      if (!place(x, y)) continue;
      SH.dealer = { x, y, fall: FALL_TIME, face: P.x < x ? -1 : 1 };
      SH.timer = DEAL_TIME;
      SH.spawned = true;
      SH.bubble = null;
      banner = { txt: 'MADAME PIRANHA', sub: 'compre uma mercadoria ou reroll', t: 2.2 };
      return;
    }
    SH.spawned = true;   // sem lugar nesta fase: desiste até a próxima
  }

  function land() {
    const d = SH.dealer;
    triggerScreenShake(8, 0.22);
    burstSparks(d.x, d.y, 26, ['#ffd23f', '#ffffff', '#19f0e6'], 260);
    playSfx('score');
    say(pick(LINES.chegada));
  }

  function leave() {
    const d = SH.dealer;
    if (d) burstSparks(d.x, d.y, 12, ['#777777', '#bbbbbb'], 90);
    SH.dealer = null; SH.cards = null; SH.reroll = null; SH.timer = 0; SH.bubble = null;
  }

  function tryBuy(c) {
    const it = itemOf(c.id), price = priceOf(it);
    if (SH.cred < price) {
      c.cool = 0.7; popup(c.x, c.y - 34, 'SEM CRÉDITOS', '#8a8a8a'); triggerScreenShake(2, 0.08);
      say(pick(LINES.semDinheiro));
      return;
    }
    const err = applyItem(it);
    if (err) { c.cool = 0.7; popup(c.x, c.y - 34, err, '#8a8a8a'); say(pick(LINES.semArma)); return; }
    SH.cred -= price;
    c.sold = true; c.stamp = 0.4;
    popup(c.x, c.y - 34, it.nome.toUpperCase() + ' -' + price, c.slot.cor);
    triggerScreenShake(4, 0.12);
    burstSparks(c.x, c.y, 18, [c.slot.cor, '#ffffff'], 220);
    playSfx('score');
    SH.hitstop = 0.07;
    say(pick(LINES.compra), 1.6);
  }

  function doReroll(r) {
    const free = SH.freeLeft > 0, cost = rerollCost();
    if (!free && SH.cred < cost) {
      r.cool = 0.7; popup(r.x, r.y - 34, 'SEM CRÉDITOS', '#8a8a8a'); triggerScreenShake(2, 0.08);
      say(pick(LINES.semDinheiro));
      return;
    }
    if (free) SH.freeLeft--; else SH.cred -= cost;
    SH.visitRolls++;
    SH.cards.forEach(c => { if (!c.sold) { c.id = rollItem(c.cat); c.stamp = 0; } });
    popup(r.x, r.y - 34, free ? 'REROLAR GRÁTIS' : 'REROLAR -' + cost, '#ffd23f');
    triggerScreenShake(3, 0.1);
    burstSparks(r.x, r.y, 14, ['#ffd23f', '#ffffff'], 200);
    SH.hitstop = 0.05;
    playSfx('click');
    say(pick(LINES.reroll), 1.8);
    r.cool = 0.5;
  }

  function updateDealer(dt) {
    const d = SH.dealer;
    SH.t += dt;
    if (SH.bubble) { SH.bubble.t -= dt; if (SH.bubble.t <= 0) SH.bubble = null; }
    if (d.fall > 0) { d.fall -= dt; if (d.fall <= 0) land(); return; }
    d.face = P.x < d.x ? -1 : 1;
    SH.timer -= dt;
    let open = 0;
    for (const c of SH.cards) {
      if (c.stamp > 0) c.stamp -= dt;
      if (c.cool > 0) c.cool -= dt;
      if (c.sold) continue;
      open++;
      if (c.cool <= 0 && hyp(c.x - P.x, c.y - P.y) < CARD_R) tryBuy(c);
    }
    const r = SH.reroll;
    if (r.cool > 0) r.cool -= dt;
    if (r.cool <= 0 && hyp(r.x - P.x, r.y - P.y) < CARD_R) doReroll(r);
    if (SH.timer <= 0) { say(pick(LINES.saida)); leave(); return; }
    if (open === 0 && SH.cards.every(c => c.stamp <= 0)) leave();
  }

  // ----- ganchos no jogo -----
  const _startLevel = startLevel;
  startLevel = function () {
    _startLevel();
    SH.dealer = null; SH.cards = null; SH.reroll = null; SH.bubble = null;
    SH.eligible = eligibleLevel(); SH.spawned = false; SH.lastKills = 0; SH.lastCleared = false;
  };

  const _newGame = newGame;
  newGame = function () {
    if (!historia || capIdx === 0) { SH.cred = 0; SH.freeLeft = 1; SH.matchT = 0; }
    return _newGame();
  };

  const _tick = EXP.tick;
  EXP.tick = function (dt) {
    if (SH.hitstop > 0 && st === 'play') { SH.hitstop -= dt; SH.t += dt; return; }
    _tick(dt);
    if (st !== 'play') return;
    SH.matchT += dt;
    if (levelStats.kills < SH.lastKills) SH.lastKills = levelStats.kills;
    if (levelStats.kills > SH.lastKills) { SH.cred += (levelStats.kills - SH.lastKills) * KILL_CRED; SH.lastKills = levelStats.kills; }
    if (cleared && !SH.lastCleared) SH.cred += CLEAR_BASE + CLEAR_PER_LVL * curLevel();
    SH.lastCleared = cleared;
    if (SH.eligible && !SH.spawned && !SH.dealer && !cleared && levelStats.total > 0 && levelStats.kills * 2 >= levelStats.total) spawnDealer();
    if (SH.dealer) updateDealer(dt);
  };

  EXP.shopInteract = function () { return false; };   // sem menu: E continua pegando arma normalmente

  // ----- desenho -----
  const toScr = (x, y) => { const z = CFG.zoom; return [(x - cam.x - W / 2) * z + W / 2, (y - cam.y - H / 2) * z + H / 2]; };

  function wrapText(g, txt, maxW) {
    const words = txt.split(' '), lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur);
    return lines;
  }

  function drawBubble(g, x, y, txt) {
    g.save(); g.font = 'bold 13px Impact, sans-serif';
    const lines = wrapText(g, txt, 190), lh = 16, w = 210, h = lines.length * lh + 14;
    const bx = x - w / 2, by = y - h - 12;
    g.fillStyle = 'rgba(255,255,255,.95)'; g.fillRect(bx, by, w, h);
    g.beginPath(); g.moveTo(x - 6, by + h); g.lineTo(x + 6, by + h); g.lineTo(x, by + h + 9); g.fill();
    g.fillStyle = '#2d0f5c'; g.textAlign = 'center';
    lines.forEach((ln, i) => g.fillText(ln, x, by + 19 + i * lh));
    g.restore();
  }

  function drawCard(g, c) {
    const [cx, cy0] = toScr(c.x, c.y);
    const near = !c.sold && hyp(c.x - P.x, c.y - P.y) < 110;
    const cy = cy0 + (c.sold ? 0 : Math.sin(SH.t * 4 + c.x) * 1.5);
    g.save(); g.textAlign = 'center';
    if (c.sold) {
      g.globalAlpha = Math.max(0, c.stamp / 0.4);
      g.font = 'bold 18px Impact, sans-serif'; g.fillStyle = c.slot.cor;
      g.fillText('VENDIDO', cx, cy + 6);
      g.restore(); return;
    }
    const flick = c.cool > 0 && Math.floor(performance.now() / 60) % 2 === 0;
    const w = 112, h = 54;
    g.fillStyle = 'rgba(12,4,28,.92)'; g.fillRect(cx - w / 2, cy - h / 2, w, h);
    g.strokeStyle = flick ? '#ffffff' : c.slot.cor; g.lineWidth = 3;
    g.strokeRect(cx - w / 2 + 1.5, cy - h / 2 + 1.5, w - 3, h - 3);
    g.font = 'bold 11px Impact, sans-serif'; g.fillStyle = c.slot.cor;
    g.fillText(c.cat, cx, cy - h / 2 + 15);
    const it = itemOf(c.id), price = priceOf(it), can = SH.cred >= price;
    g.font = 'bold 14px Impact, sans-serif'; g.fillStyle = '#ffffff';
    g.fillText(it.nome, cx, cy + 4);
    g.fillStyle = can ? '#ffd23f' : '#777777';
    g.fillText(price + ' cr', cx, cy + 21);
    if (near && it.desc) {
      g.font = 'bold 12px Impact, sans-serif'; g.fillStyle = '#e8d9ff';
      g.fillText(it.desc, cx, cy + h / 2 + 14);
    }
    g.restore();
  }

  function drawReroll(g, r) {
    const [cx, cy] = toScr(r.x, r.y), free = SH.freeLeft > 0, cost = rerollCost(), can = free || SH.cred >= cost;
    const w = 112, h = 40;
    g.save(); g.textAlign = 'center';
    g.fillStyle = 'rgba(12,4,28,.92)'; g.fillRect(cx - w / 2, cy - h / 2, w, h);
    g.strokeStyle = '#ffd23f'; g.lineWidth = 3; g.strokeRect(cx - w / 2 + 1.5, cy - h / 2 + 1.5, w - 3, h - 3);
    g.font = 'bold 14px Impact, sans-serif'; g.fillStyle = '#ffffff'; g.fillText('REROLAR', cx, cy - 2);
    g.font = 'bold 12px Impact, sans-serif'; g.fillStyle = free ? '#19f0e6' : (can ? '#ffd23f' : '#777777');
    g.fillText(free ? 'GRÁTIS' : cost + ' cr', cx, cy + 14);
    g.restore();
  }

  // Madame Piranha: vestido rosa, chapéu com penas amarelas e dentes de piranha
  function drawDealer(g) {
    const d = SH.dealer;
    const [gx, gy] = toScr(d.x, d.y);
    const k = d.fall > 0 ? d.fall / FALL_TIME : 0;
    const bob = d.fall > 0 ? 0 : Math.sin(SH.t * 3) * 1.5;
    const sy = gy - k * 140 + bob;
    g.save(); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(gx, gy + 10, 13 - k * 4, 6 - k * 2, 0, 0, 6.2832); g.fill(); g.restore();
    g.save(); g.translate(gx, sy); g.scale(d.face || 1, 1);
    g.fillStyle = '#ff5fa2'; g.beginPath(); g.moveTo(-11, -4); g.lineTo(11, -4); g.lineTo(15, 14); g.lineTo(-15, 14); g.closePath(); g.fill();
    g.fillStyle = '#f3c9a0'; g.beginPath(); g.arc(0, -12, 8, 0, 6.2832); g.fill();
    g.fillStyle = '#1b1b1b'; g.fillRect(-4, -13, 2, 2); g.fillRect(2, -13, 2, 2);
    g.fillStyle = '#ffffff'; g.fillRect(-4, -7, 8, 2);
    g.fillStyle = '#ffd23f'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-10 + i * 6, -20); g.lineTo(-7 + i * 6, -30); g.lineTo(-4 + i * 6, -20); g.fill(); }
    g.fillStyle = '#2d0f5c'; g.fillRect(-12, -21, 24, 4);
    g.restore();
    if (d.fall <= 0) {
      g.save(); g.strokeStyle = SH.timer < 1.2 ? '#ff2e93' : '#ffd23f'; g.lineWidth = 3;
      g.beginPath(); g.arc(gx, gy + 6, 30, -1.5708, -1.5708 + 6.2832 * Math.max(0, SH.timer / DEAL_TIME)); g.stroke(); g.restore();
      g.save(); g.textAlign = 'center'; g.font = 'bold 12px Impact, sans-serif'; g.fillStyle = '#ffffff';
      g.fillText('MADAME PIRANHA', gx, sy - 36); g.restore();
      if (SH.bubble) drawBubble(g, gx, sy - 40, SH.bubble.txt);
      SH.cards.forEach(c => drawCard(g, c));
      drawReroll(g, SH.reroll);
    }
  }

  EXP.overlay = function (g) {
    if (SH.dealer && (st === 'play' || st === 'paused')) drawDealer(g);
    if (st === 'play') {
      g.save(); g.textAlign = 'left'; g.font = 'bold 18px Impact, sans-serif'; g.fillStyle = '#ffd23f';
      g.fillText('CRÉDITOS ' + SH.cred, 34, 156); g.restore();
    }
  };
})();
