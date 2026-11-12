/* Cappe in Miami - Expansão | MODOS DE JOGO, PONTUAÇÃO E HUD
   Cada modo tem regras, objetivo, recompensa e pontuação próprios. Os modos de "sala" reutilizam o
   fluxo original (startLevel/advance); os de "arena" (Horda, Sobrevivência, Invasão) controlam as ondas. */
(function () {
  'use strict';
  const EXP = window.EXP, rnd = Math.random, TAU = Math.PI * 2;
  const ARENAS = ['metro', 'hotel', 'boate', 'garagem', 'loja', 'hospital', 'estacao', 'delegacia', 'cassino', 'phonehom'];
  EXP.ARENAS = ARENAS;
  const arenaName = id => (MAPAS.find(m => m.id === id) || { nome: id }).nome;

  // ---------- modificadores de partida ----------
  EXP.MODS = {
    infammo: { nome: 'Munição infinita', desc: 'Atire à vontade (recarga continua).', score: .7 },
    reload:  { nome: 'Recarga realista', desc: 'Todas as armas usam pente e recarga (tecla configurada).', score: 1.1 },
    fastfoe: { nome: 'Inimigos furiosos', desc: 'Inimigos 30% mais rápidos.', score: 1.25 },
    noshield:{ nome: 'Sem colete', desc: 'Remove coletes da máscara e dos perks.', score: 1.2 },
    dark:    { nome: 'Escuridão', desc: 'Só enxerga ao redor do jogador e das armas.', score: 1.3 },
    rain:    { nome: 'Tempestade', desc: 'Chuva e relâmpagos pesados.', score: 1 },
    horde:   { nome: 'Mais inimigos', desc: '+50% de inimigos por sala/onda.', score: 1.3 },
  };

  // ---------- dificuldade para os modos (a História mantém a sua) ----------
  const DX = {
    facil: { en: .6, foe: .8, cd: 1.4, sight: .85 }, medio: { en: 1, foe: 1, cd: 1, sight: 1 },
    dificil: { en: 1.4, foe: 1.1, cd: .7, sight: 1.15 }, hardcore: { en: 1.9, foe: 1.25, cd: .35, sight: 1.4 },
  };
  const _D = D;
  D = function () { const r = EXP.run; return (r && r.dif) ? r.dif : _D(); };

  // ---------- notas (D, C, B, A, S, SS) ----------
  const RANKV = { D: 0, C: 1, B: 2, A: 3, S: 4, SS: 5 };
  EXP.RANKV = RANKV;
  rankForStats = function () {
    const acc = levelStats.shots ? levelStats.hits / levelStats.shots : 1, roomScore = Math.max(0, score - levelStats.scoreStart);
    const v = roomScore + levelStats.maxCombo * 140 + acc * 700 - levelStats.time * 5 - levelStats.detections * 90;
    if (v >= 3800 && acc >= .7 && levelStats.detections === 0) return 'SS';
    if (v >= 2600) return 'S'; if (v >= 1750) return 'A'; if (v >= 1200) return 'B'; if (v >= 700) return 'C'; return 'D';
  };
  saveBestRank = function () {
    try {
      const key = 'hm_best_' + (historia ? 'story_' + capIdx : 'lvl_' + lvl), now = rankForStats(), old = localStorage.getItem(key) || 'D';
      const o = { D: 0, C: 1, B: 2, A: 3, 'A+': 3.5, S: 4, SS: 5 };
      if ((o[now] || 0) > (o[old] || 0)) localStorage.setItem(key, now);
    } catch (e) {}
  };

  // ================= DEFINIÇÃO DOS MODOS =================
  const MODES = {};
  const def = o => { MODES[o.id] = o; return o; };
  def({ id: 'classico', nome: 'Clássico', desc: 'Salas infinitas e cada vez mais difíceis.', rules: ['Limpe a sala e volte à saída.', 'Um tiro mata você.'], reward: 'XP por sala e recorde de pontos.', hidden: true });
  def({ id: 'historia', nome: 'História', desc: 'A campanha original.', rules: [], reward: '', hidden: true });
  def({ id: 'campanha', nome: 'Campanha: 3 Fases', color: '#7dff9b', tiles: true, direct: false,
    desc: 'Hospital, Clube Synthwave e Sede da Máfia, em mapas de tiles com vidros quebráveis.',
    rules: ['Três fases em sequência; elimine o último inimigo para avançar.', 'Inimigos patrulham waypoints e investigam qualquer tiro a até 450 px.', 'Vidros bloqueiam o passo mas não a visão: atire para quebrá-los.', 'Uma vida.'],
    reward: 'XP por fase · conquista Três Andares.', rooms: 3,
    start(r) { r.tiles = true; EXP.tileIdx = 0; },
    tick(r, dt) { campaignTick(r, dt); } });
  def({ id: 'horda', nome: 'Horda', arena: true, map: true, color: '#ff2e5b',
    desc: 'Ondas infinitas numa arena. Um chefe aparece a cada 5 ondas.',
    rules: ['Sobreviva ao máximo de ondas.', 'Chefe a cada 5 ondas, cada vez mais forte.', 'Entre as ondas: +1 colete (máx. 3 vezes), munição e arma nova.', 'Uma vida só.'],
    reward: 'XP por onda e chefe · recorde de ondas e ranking.',
    start(r) { r.wave = 0; r.phase = 'interm'; r.phT = 2.6; r.heals = 0; r.alive = 0; },
    tick(r, dt) { waveTick(r, dt, 'horda'); } });
  def({ id: 'sobrevivencia', nome: 'Sobrevivência', arena: true, map: true, color: '#ff8a1f',
    desc: 'Aguente 3 minutos enquanto a pressão só aumenta.',
    rules: ['Aguente 180 segundos.', 'Inimigos chegam sem parar, mais rápido a cada minuto.', 'Caixas de suprimento a cada 35 s.', 'Chefe aos 90 s.'],
    reward: 'Pontos por segundo vivo · conquista Sobrevivente.',
    start(r) { r.spawnT = 2; r.supT = 30; r.bossDone = false; },
    tick(r, dt) { survTick(r, dt); } });
  def({ id: 'arcade', nome: 'Arcade', color: '#ffd23f',
    desc: '10 salas com 3 fichas. Zere sem gastar todas.',
    rules: ['10 salas seguidas.', 'Você tem 3 fichas: morrer reinicia a sala.', 'Fichas sobrando valem 1000 pontos cada.'],
    reward: 'Bônus por fichas · conquista Moedas Infinitas.', rooms: 10,
    start(r) { r.lives = 3; } });
  def({ id: 'contrarrelogio', nome: 'Contrarrelógio', color: '#19f0e6',
    desc: 'O relógio nunca para. Cada abate rende segundos.',
    rules: ['Comece com 90 s.', 'Cada abate: +3 s. Sala limpa: +12 s.', 'Zerou o tempo, acabou.'],
    reward: 'Pontos por sala · recorde de salas.',
    start(r) { r.timeLeft = 90; },
    tick(r, dt) { r.timeLeft -= dt; if (r.timeLeft <= 0 && !r.done) endRun(false, 'O tempo acabou'); },
    kill(r) { r.timeLeft += 3; }, clear(r) { r.timeLeft += 12; popup(P.x, P.y - 40, '+12 s', '#19f0e6'); } });
  def({ id: 'assassino', nome: 'Assassino', color: '#b06bff',
    desc: '6 salas na surdina. Três detecções e a missão falha.',
    rules: ['Seis salas.', 'Cada vez que um inimigo te nota conta uma detecção; na terceira, fim.', 'Sala sem detecção rende +400.'], reward: 'Bônus de furtividade · conquista Fantasma.', rooms: 6,
    start(r) { r.lastDet = 0; } });
  def({ id: 'limpeza', nome: 'Limpeza', color: '#7dff9b',
    desc: 'Sem armas de fogo. Só corpo a corpo e arremessos.',
    rules: ['Armas de fogo travadas (podem ser arremessadas).', 'Seis salas.', 'Cada finalização vale +150.'], reward: 'Bônus por finalização · bônus por sala silenciosa.', rooms: 6 });
  def({ id: 'invasao', nome: 'Invasão', arena: true, map: true, color: '#ff6bd5',
    desc: 'Defenda o ponto central de cinco ataques.',
    rules: ['Proteja a zona marcada (10 de integridade).', 'Inimigos que a alcançam somem e tiram 1 de integridade.', 'Cinco ataques, cada um maior.'], reward: 'Bônus por integridade restante.',
    start(r) { r.integ = 10; r.atk = 0; r.phase = 'interm'; r.phT = 3; r.zone = { x: startPos[0], y: startPos[1] }; },
    tick(r, dt) { invTick(r, dt); } });
  def({ id: 'diario', nome: 'Desafio Diário', color: '#ffd23f', direct: true,
    desc: 'Mesmo desafio para todos no dia. Uma tentativa vale recorde.',
    rules: ['Máscara, arma inicial, mapa e modificador definidos pela data.', 'Cinco salas.', 'Seu melhor placar do dia fica salvo.'], reward: '250 XP no primeiro dia completado.', rooms: 5 });
  def({ id: 'custom', nome: 'Personalizado', color: '#9aa0b0', direct: true,
    desc: 'Monte sua partida: mapa, máscara, arma, inimigos e modificadores.',
    rules: ['Escolha tudo.', 'Recompensa de XP reduzida (50%).'], reward: 'XP reduzido · sem recordes oficiais.', rooms: 5 });
  EXP.MODES = MODES;

  // ================= PARTIDA (RUN) =================
  function dailyInfo() {
    const d = new Date(), pad = n => (n < 10 ? '0' : '') + n, date = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    let h = 2166136261; for (let i = 0; i < date.length; i++) { h ^= date.charCodeAt(i); h = Math.imul(h, 16777619); }
    const R = rng(h >>> 0), mods = Object.keys(EXP.MODS);
    return { date, map: ARENAS[Math.floor(R() * ARENAS.length)], mask: Math.floor(R() * 12), weapon: ['taco', 'faca', 'cano', 'martelo', 'pe_de_cabra', 'revolver', 'smg', 'escopeta'][Math.floor(R() * 8)], mod: mods[Math.floor(R() * mods.length)] };
  }
  EXP.dailyInfo = dailyInfo;

  function makeRun(p) {
    const id = p ? p.id : (historia ? 'historia' : 'classico'), m = MODES[id], o = (p && p.opts) || {};
    const r = { id, opts: o, kills: 0, xp: 0, t: 0, rooms: 0, lives: 0, wave: 0, phase: '', phT: 0, detections: 0, lastDet: 0, done: false, mods: o.mods || [], arena: !!m.arena, bossKills: 0,
                bonusTotal: 0, roomDeaths: 0, shots: 0, hits: 0, maxCombo: 0, startScore: 0, rankBest: 'D', ranks: [], finishers: 0, dif: null, total: m.rooms || 0 };
    if (id === 'diario') { r.daily = dailyInfo(); r.mods = [r.daily.mod]; }
    if (id === 'custom') { const d = DX[o.dif || 'medio']; r.dif = { en: d.en * (o.enemies || 1), foe: d.foe, cd: d.cd, sight: d.sight }; r.total = o.rooms || 5; }
    if (r.mods.includes('horde')) r.dif = Object.assign({}, r.dif || DX.medio, { en: ((r.dif || DX.medio).en) * 1.5 });
    if (m.start) m.start(r);
    return r;
  }

  EXP.pending = null;
  EXP.startMode = function (id, opts) {
    opts = opts || {}; historia = false; EXP.pending = { id, opts };
    const m = MODES[id];
    if (id === 'diario') { const d = dailyInfo(); mapSel = d.map; sel = d.mask; }
    else if (id === 'custom') { mapSel = opts.map || 'seq'; sel = opts.mask || 0; }
    else if (m.tiles) { mapSel = 'tiles'; EXP.tileIdx = 0; lvl = 1; }
    else if (m.arena) mapSel = opts.map && opts.map !== 'rand' ? opts.map : ARENAS[Math.floor(rnd() * ARENAS.length)];
    else mapSel = opts.map || 'seq';
    if ([...msel.options].some(op => op.value === mapSel)) msel.value = mapSel;
    if (m.tiles) { const c = EXP.curChar(); const mi = MASKS.findIndex(x => x.id === c.mask); if (mi >= 0) sel = mi; }
    if (m.direct) { menu.classList.add('oculto'); EXP.ui.hideAll(); newGame(); } else { EXP.ui.hideAll(); showMasks(); }
  };

  // ---------- newGame: máscara bloqueada e aplicação de perks/modo (via gancho EXP.applyS no index.html) ----------
  const _newGame = newGame;
  newGame = function () { if (EXP.maskLocked(sel)) sel = 0; _newGame(); };
  EXP.applyS = function () {
    const p = EXP.pending, r = EXP.run = makeRun(p);
    EXP.applyPerks(); applyChar(r);
    EXP.noGuns = r.id === 'limpeza'; EXP.infAmmo = r.mods.includes('infammo'); EXP.reloadAll = r.mods.includes('reload');
    EXP.dark = r.mods.includes('dark'); EXP.storm = r.mods.includes('rain'); EXP.eventsOn = !historia && r.id !== 'historia' && EXP.save().settings.events !== false; EXP.arena = r.arena;
    EXP.foeSpeed = 1; if (r.mods.includes('fastfoe')) S.foe *= 1.3; if (r.opts.foe) S.foe *= r.opts.foe;
    if (r.mods.includes('noshield')) { S.shield = 0; S.revive = false; }
    if (r.opts.life) S.shield += r.opts.life;
    cw = 'pistola'; ammo = 0;                                  // todo modo começa com pistola
    if (r.id === 'custom' && r.opts.weapon) cw = r.opts.weapon;
    if (r.id === 'diario') cw = r.daily.weapon;
    if (S.noGuns && WP[cw].gun) cw = 'punho';
    if (r.tiles) { EXP.tileIdx = 0; lvl = 1; r.currentTile = 0; r.pending = false; }
    if (r.arena) lvl = 1;
    EXP.xpMul = r.id === 'custom' ? .5 : 1; EXP.waveLvl = 0; EXP.keepEnemies = false;
    r.startScore = 0; EXP.save().stats.runs++; EXP.touch();
    EXP.musBoss && EXP.musBoss(0, false);
  };
  const _toMenu = toMenu; toMenu = function () { EXP.pending = null; EXP.run = null; EXP.noGuns = false; _toMenu(); };
  const _startStory = startStory; startStory = function () { EXP.pending = null; _startStory(); };

  // ---------- início de sala ----------
  const _startLevel = startLevel;
  startLevel = function () {
    _startLevel();
    const r = EXP.run;
    if (r && r.tiles) { r.currentTile = EXP.tileIdx; r.pending = false; EXP.enemyCount0 = enemies.length; }
    if (r && r.arena) { enemies.length = 0; for (const f of predio) if (f && f.enemies) f.enemies.length = 0; levelStats.total = 0; EXP.keepEnemies = true; }
    else EXP.keepEnemies = false;
    EXP.onRoomStart();
    if (r && r.arena && r.t > 0 && r.id === 'horda' && r.wave > 0) r.wave--;
    if (r) { r.lastDet = 0; r.roomDeaths = r.roomDeaths || 0; r.roomT0 = r.t; if (r.arena) { r.phase = 'interm'; r.phT = r.id === 'horda' ? 2.2 : 1.5; r.queue = []; } }
    EXP.fxRoom && EXP.fxRoom();
  };
  const _allClear = allClear; allClear = function () { const r = EXP.run; if (r && (r.arena || r.tiles)) return false; return _allClear(); };

  // ================= ARENAS =================
  function arenaSpot() { return EXP.randSpot(reachMap(P.x, P.y), 330, 26) || EXP.randSpot(reachMap(P.x, P.y), 150, 24); }
  function spawnOne(r, type, alert) {
    const s = arenaSpot(); if (!s) return null;
    const e = EXP.spawnEnemy(s[0], s[1], type, null, alert !== false);
    levelStats.total++; return e;
  }
  function waveTick(r, dt) {
    if (r.phase === 'interm') {
      r.phT -= dt;
      if (r.phT <= 0) startWave(r);
      return;
    }
    // reposição gradual (nunca mais que o limite na tela)
    if (r.queue && r.queue.length) { r.spawnT = (r.spawnT || 0) - dt; if (r.spawnT <= 0 && enemies.length < r.cap) { spawnOne(r, r.queue.shift()); r.spawnT = .35; } }
    if (r.phase === 'wave' && !r.queue.length && enemies.length === 0) waveCleared(r);
    // inimigos de arena não ficam parados: quem perdeu o jogador volta a procurar
    r.pushT = (r.pushT || 0) - dt; if (r.pushT <= 0) { r.pushT = 1.2; for (const e of enemies) if (e.state === 'IDLE' && !(e.ko > 0)) { e.lkp = { x: P.x, y: P.y }; setEnemyState(e, 'SEARCH', 3); } }
  }
  function startWave(r) {
    r.wave++; r.phase = 'wave'; EXP.waveLvl = 1 + Math.floor(r.wave / 2); lvl = Math.min(15, EXP.waveLvl);
    const n = Math.min(4 + Math.floor(r.wave * 1.6), 26); r.cap = Math.min(8 + Math.floor(r.wave / 2), 16);
    r.queue = []; for (let i = 0; i < n; i++) { const q = rnd(); r.queue.push(r.wave >= 4 && q < .2 ? 'shot' : q < .6 ? 'gun' : 'bat'); }
    if (r.mods.includes('horde')) for (let i = 0; i < Math.ceil(n / 2); i++) r.queue.push('gun');
    const boss = r.wave % 5 === 0;
    banner = { txt: boss ? 'ONDA ' + r.wave + ' · CHEFE' : 'ONDA ' + r.wave, sub: boss ? '' : n + ' inimigos', t: 1.6 };
    EXP.sfx('wave');
    if (boss) { const bi = r.wave / 5 - 1, bd = EXP.bosses[bi % EXP.bosses.length]; EXP.spawnBoss(bd, 1 + Math.floor(bi / EXP.bosses.length) * .5); levelStats.total++; r.queue.length = Math.min(r.queue.length, 4 + Math.floor(bi / 2)); }
    const before = enemies.length;
    // primeira leva imediata
    for (let i = 0; i < Math.min(r.cap - before, r.queue.length, 6); i++) spawnOne(r, r.queue.shift());
    EXP.rollClasses(); EXP.enemyCount0 = enemies.length + r.queue.length;
    const rec = EXP.setRecord('horda', 'wave', r.wave - 1);
  }
  function waveCleared(r) {
    r.phase = 'interm'; r.phT = 4; const w = r.wave;
    addScore(200 + 60 * w); EXP.addXP(40 + w * 4, 'onda'); popup(P.x, P.y - 34, 'ONDA ' + w + ' COMPLETA', '#ffd23f'); EXP.sfx('waveEnd');
    EXP.setRecord('horda', 'wave', w);
    // recompensas: recuperação LIMITADA de vida
    let msg = '+MUNIÇÃO';
    if (r.heals < 3 && P.shield < S.shield + 2) { P.shield++; r.heals++; msg = '+1 COLETE (' + r.heals + '/3)'; }
    if (WP[cw].gun) ammo += Math.max(6, Math.round((WP[cw].start ? WP[cw].start(lvl) : 12) * .6));
    const pool = EXP.newWeapons.filter(EXP.weaponUnlocked), w2 = pool.length && rnd() < .6 ? pool[Math.floor(rnd() * pool.length)] : ['escopeta', 'smg', 'rifle', 'revolver'][Math.floor(rnd() * 4)];
    const s = EXP.randSpot(reachMap(P.x, P.y), 80, 16) || [P.x + 40, P.y]; pickups.push({ x: s[0], y: s[1], w: w2, n: EXP.AMMO_NEW[w2] || ({ escopeta: 6, smg: 24, rifle: 10, revolver: 6 })[w2] || 0, a: 0 });
    banner = { txt: 'ONDA ' + w + ' COMPLETA', sub: msg + ' · nova arma no mapa', t: 2.2 };
    EXP.checkAch();
  }
  function survTick(r, dt) {
    const T = r.t;
    r.spawnT -= dt; EXP.waveLvl = 1 + Math.floor(T / 25); lvl = Math.min(15, EXP.waveLvl); r.cap = Math.min(10 + Math.floor(T / 30), 18);
    if (r.spawnT <= 0 && enemies.length < r.cap) {
      const q = rnd(); spawnOne(r, T > 60 && q < .2 ? 'shot' : q < .55 ? 'gun' : 'bat'); EXP.rollClasses(); EXP.enemyCount0 = Math.max(enemies.length, 6);
      r.spawnT = Math.max(1, 3.6 - T / 55);
    }
    r.supT -= dt; if (r.supT <= 0) { r.supT = 35; const s = EXP.randSpot(reachMap(P.x, P.y), 80, 16); if (s) { const pool = EXP.newWeapons.filter(EXP.weaponUnlocked).concat(['escopeta', 'smg', 'rifle']), w = pool[Math.floor(rnd() * pool.length)]; pickups.push({ x: s[0], y: s[1], w, n: EXP.AMMO_NEW[w] || 12, a: 0 }); popup(s[0], s[1] - 20, 'SUPRIMENTOS', '#7dff9b'); EXP.sfx('pickup'); } if (P.shield < S.shield) P.shield++; }
    if (!r.bossDone && T >= 90) { r.bossDone = true; EXP.spawnBoss(EXP.bosses[1], 1); levelStats.total++; }
    r.pushT = (r.pushT || 0) - dt; if (r.pushT <= 0) { r.pushT = 1.2; for (const e of enemies) if (e.state === 'IDLE' && !(e.ko > 0)) { e.lkp = { x: P.x, y: P.y }; setEnemyState(e, 'SEARCH', 3); } }
    if (T >= 180 && !r.done) { EXP.save().flags.survWon = true; endRun(true, 'Você aguentou 3 minutos!'); }
  }
  function invTick(r, dt) {
    const z = r.zone;
    if (r.phase === 'interm') { r.phT -= dt; if (r.phT <= 0) { r.atk++; r.phase = 'wave'; r.atkT = 0; r.sq = 0; banner = { txt: 'ATAQUE ' + r.atk + ' / 5', sub: 'defenda a zona', t: 1.6 }; EXP.sfx('wave'); EXP.waveLvl = r.atk + 1; lvl = Math.min(15, EXP.waveLvl); } return; }
    r.atkT += dt; const per = 2.8;
    if (r.atkT > r.sq * per && r.sq < 3 + r.atk) { r.sq++; const n = 2 + Math.floor(r.atk / 2); for (let i = 0; i < n; i++) { const q = rnd(); const e = spawnOne(r, q < .55 ? 'gun' : 'bat'); if (e) { e.lkp = { x: z.x, y: z.y }; setEnemyState(e, 'SEARCH', 4); } } EXP.rollClasses(); EXP.enemyCount0 = 6; }
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (hyp(e.x - z.x, e.y - z.y) < 34) { enemies.splice(i, 1); r.integ--; levelStats.total--; popup(z.x, z.y - 30, 'ZONA ATINGIDA', '#ff2e5b'); triggerScreenShake(6, .15); flash = .5; EXP.sfx('hit'); if (r.integ <= 0) { endRun(false, 'A zona caiu'); return; } }
      else if (e.state !== 'CHASE' && !(e.ko > 0) && !(e.stun > 0)) { e.lkp = { x: z.x, y: z.y }; if (e.state === 'IDLE' || e.state === 'SUSPICIOUS') setEnemyState(e, 'SEARCH', 4); }
    }
    if (r.sq >= 3 + r.atk && enemies.length === 0) {
      addScore(300 * r.atk); EXP.addXP(50 + r.atk * 15, 'ataque'); popup(P.x, P.y - 34, 'ATAQUE ' + r.atk + ' REPELIDO', '#ffd23f');
      if (r.atk >= 5) { endRun(true, 'A zona resistiu!'); return; }
      r.phase = 'interm'; r.phT = 4; if (P.shield < S.shield + 1) P.shield++; if (WP[cw].gun) ammo += 10;
    }
  }

  // ================= CAMPANHA (fases em matriz) =================
  function campaignTick(r, dt) {
    if (r.pending || r.done || st !== 'play' || r.currentTile !== EXP.tileIdx) return;
    if (r.t - (r.roomT0 || 0) < 1.2 || !(EXP.enemyCount0 > 0) || enemies.length > 0) return;
    r.pending = true;                                            // último inimigo eliminado
    const rep = roomReport(r);
    banner = { txt: 'FASE COMPLETA', sub: TILE_LEVELS[EXP.tileIdx].nome, t: 1.4 };
    st = 'summary'; mouse.down = false; EXP.sfx('waveEnd');
    EXP.ui.summary(rep, () => {
      st = 'play'; r.pending = false;
      if (EXP.levelIsLast()) { EXP.save().flags.campWon = true; endRun(true, 'Sede da Máfia destruída!'); return; }
      nextLevel();
    });
  }
  EXP.ACH.push({ id: 'tres', nome: 'Três Andares', desc: 'Complete a Campanha de 3 Fases.', test: s => !!s.flags.campWon });

  // ================= PERSONAGENS =================
  // Cada personagem tem uma máscara-assinatura e modificadores reais de atributos.
  EXP.CHARS = [
    { id: 'richard', nome: 'Richard', mask: 'sapo', desc: 'Equilibrado. Atributos padrão, sem pontos fracos.', pros: 'Nenhum ponto fraco', cons: 'Nenhum destaque' },
    { id: 'tony', nome: 'Tony', mask: 'tigre', desc: '+20% de velocidade e todo golpe físico mata na hora. Não pega armas de fogo.', pros: 'Velocidade +20%, golpe letal', cons: 'Sem armas de fogo' },
    { id: 'dennis', nome: 'Dennis', mask: 'lobo', desc: 'Começa cada fase com uma faca. Alcance de coleta e de arremesso 50% maior.', pros: 'Faca inicial, alcance +50%', cons: 'Sem arma de fogo inicial' },
    { id: 'rasmus', nome: 'Rasmus', mask: 'coruja', desc: 'Contornos roxos em objetos escondidos e o caminho de fuga mais curto.', pros: 'Enxerga o que está escondido', cons: 'Atributos padrão' },
  ];
  EXP.curChar = () => EXP.CHARS.find(c => c.id === (EXP.save().settings.char || 'richard')) || EXP.CHARS[0];
  EXP.setChar = function (id) {
    const c = EXP.CHARS.find(x => x.id === id); if (!c) return; EXP.save().settings.char = id; EXP.touch();
    const mi = MASKS.findIndex(m => m.id === c.mask); if (mi >= 0) sel = mi;
  };
  function applyChar(r) {
    const c = EXP.curChar(); EXP.char = c.id; EXP.owl = false; S.pickR = 1; S.throwR = 1; S.noGuns = false;
    if (c.id === 'tony') { S.speed *= 1.2; S.punchKill = true; S.noGuns = true; cw = 'punho'; }
    else if (c.id === 'dennis') { cw = 'faca'; S.pickR = 1.5; S.throwR = 1.5; }
    else if (c.id === 'rasmus') EXP.owl = true;
  }
  EXP.applyChar = applyChar;
  // Tony: não coleta armas de fogo
  const _swap2 = swapW;
  swapW = function () {
    if (S.noGuns && st === 'play') { const p = nearPickup(); if (p && WP[p.w].gun) { popup(P.x, P.y - 26, 'TONY NÃO USA ARMA DE FOGO', '#ff9ac8'); return; } }
    _swap2();
  };
  // Dennis: alcance de coleta +50%
  nearPickup = function () { let b = null, bd = 38 * (S.pickR || 1); for (const p of pickups) { const d = hyp(p.x - P.x, p.y - P.y); if (d < bd) { bd = d; b = p; } } return b; };
  // Dennis: arremesso (clique direito / F) alcança 50% mais longe
  const _throw = throwW;
  throwW = function () {
    const n = throws.length; _throw();
    if (throws.length > n && S.throwR > 1) { const t = throws[throws.length - 1]; t.vx *= S.throwR; t.vy *= S.throwR; }
  };

  // Rasmus (Coruja): contornos roxos em objetos escondidos e no caminho de fuga (desenho no canvas)
  let escT = 0, escPath = null;
  let owlItemsInput = new Float64Array(128 * 5), owlPathInput = new Float64Array(256 * 2);
  const growOwlInput = (buffer, needed) => {
    if (buffer.length >= needed) return buffer;
    let capacity = Math.max(32, buffer.length);
    while (capacity < needed) capacity *= 2;
    return new Float64Array(capacity);
  };
  function owlDraw(g) {
    if (!EXP.owl || !P || st !== 'play') return;
    const now = performance.now(), pulse = .55 + .35 * Math.sin(now / 260);
    let itemCount = 0;
    const addItem = (kind, x, y, rx, ry) => {
      const offset = itemCount * 5;
      owlItemsInput = growOwlInput(owlItemsInput, offset + 5);
      owlItemsInput[offset] = kind; owlItemsInput[offset + 1] = x; owlItemsInput[offset + 2] = y;
      owlItemsInput[offset + 3] = rx; owlItemsInput[offset + 4] = ry; itemCount++;
    };
    const hidden = (x, y) => hyp(x - P.x, y - P.y) < 420 && !los(P, { x, y });
    for (const p of pickups) if (hidden(p.x, p.y)) addItem(0, p.x, p.y, 12, 12);
    for (const b of EXP.world.barrels) if (hidden(b.x, b.y)) addItem(1, b.x, b.y, b.r + 4, 0);
    for (const c of EXP.world.cams) if (hidden(c.x, c.y)) addItem(2, c.x, c.y, 10, 8);
    for (const e of enemies) if (e.ko <= 0 || e.ko === undefined) { if (hyp(e.x - P.x, e.y - P.y) < 300 && !los(P, e)) addItem(1, e.x, e.y, e.r + 5, 0); }
    // rota de fuga: até a saída (se aberta) ou até a porta mais próxima
    escT -= 1 / 60;
    if (escT <= 0) {
      escT = .5; let gx = null, gy = null;
      if (exitR[2] > 0 && (cleared || EXP.run && EXP.run.id !== 'classico')) { gx = exitR[0] + exitR[2] / 2; gy = exitR[1] + exitR[3] / 2; }
      else { let bd = 1e9; for (const d of doors) { const dd = hyp(d.x + d.w / 2 - P.x, d.y + d.h / 2 - P.y); if (dd < bd && dd > 60) { bd = dd; gx = d.x + d.w / 2; gy = d.y + d.h / 2; } } }
      escPath = gx === null ? null : EXP.navPath(P.x, P.y, gx, gy);
    }
    const pathCount = escPath && escPath.length > 1 ? Math.min(4096, escPath.length + 1) : 0;
    if (pathCount) {
      owlPathInput = growOwlInput(owlPathInput, pathCount * 2);
      owlPathInput[0] = P.x; owlPathInput[1] = P.y;
      for (let i = 1; i < pathCount; i++) { owlPathInput[i * 2] = escPath[i - 1].x; owlPathInput[i * 2 + 1] = escPath[i - 1].y; }
    }
    const renderer = window.HM_WASM_RENDERER;
    if (renderer && renderer.drawOwlOverlay && renderer.drawOwlOverlay(g, owlItemsInput, itemCount, owlPathInput, pathCount, now, pulse)) return;
    g.save(); g.strokeStyle = 'rgba(176,107,255,' + pulse + ')'; g.lineWidth = 2;
    for (let i = 0; i < itemCount; i++) {
      const offset = i * 5, kind = owlItemsInput[offset], x = owlItemsInput[offset + 1], y = owlItemsInput[offset + 2];
      const rx = owlItemsInput[offset + 3], ry = owlItemsInput[offset + 4];
      if (kind === 0 || kind === 2) g.strokeRect(x - rx, y - ry, rx * 2, ry * 2);
      else { g.beginPath(); g.arc(x, y, rx, 0, TAU); g.stroke(); }
    }
    if (pathCount) { g.setLineDash([10, 8]); g.lineDashOffset = -now / 40; g.beginPath(); g.moveTo(owlPathInput[0], owlPathInput[1]); for (let i = 1; i < pathCount; i++) g.lineTo(owlPathInput[i * 2], owlPathInput[i * 2 + 1]); g.stroke(); }
    g.restore();
  }
  const _wd2 = EXP.drawWorld; EXP.drawWorld = function (g) { _wd2(g); owlDraw(g); };

  // ================= TICK GERAL =================
  EXP.tick = function (dt) {
    EXP.worldTick(dt); EXP.fxTick && EXP.fxTick(dt);
    const r = EXP.run; if (!r || r.done) return;
    r.t += dt; r.pt = (r.pt || 0) + dt; const sv = EXP.save(); sv.stats.playSec += dt; if (r.pt > 6) { r.pt = 0; EXP.touch(); }
    const m = MODES[r.id];
    if (r.id === 'assassino') { const d = levelStats.detections; if (d > r.lastDet) { r.detections += d - r.lastDet; r.lastDet = d; popup(P.x, P.y - 40, 'DETECTADO ' + r.detections + '/3', '#b06bff'); if (r.detections >= 3) { endRun(false, 'Detectado três vezes'); return; } } }
    if (m.tick) m.tick(r, dt);
    if (combo > r.maxCombo) r.maxCombo = combo;
    if (score > sv.stats.bestScore) sv.stats.bestScore = score;
  };
  EXP.modeKill = function (e) { const r = EXP.run; if (r && MODES[r.id].kill) MODES[r.id].kill(r, e); };
  EXP.modeBossDown = function () { const r = EXP.run; if (r) r.bossKills++; };
  const _afterKill = EXP.afterKill; EXP.afterKill = function (e, b) { _afterKill(e, b); EXP.modeKill(e); };
  // finalização (Limpeza paga bônus)
  const _finish = finish; finish = function () { const ok = _finish(); if (ok) { const r = EXP.run; EXP.save().stats.finishers++; if (r) { r.finishers++; if (r.id === 'limpeza') { addScore(150); popup(P.x, P.y - 40, 'FINALIZAÇÃO +150', '#7dff9b'); } } } return ok; };

  // ================= RELATÓRIO POR SALA =================
  function flushStats(sv) {
    const L = levelStats; sv.stats.shots += L.shots; sv.stats.hits += L.hits; sv.stats.melee += L.melee; sv.stats.throwHits += L.throwHits;
    sv.stats.maxCombo = Math.max(sv.stats.maxCombo, L.maxCombo);
    if (EXP.run) { EXP.run.shots += L.shots; EXP.run.hits += L.hits; }
  }
  function roomReport(r) {
    const L = levelStats, sv = EXP.save(), lines = [];
    const acc = L.shots >= 3 ? L.hits / L.shots : null, par = 25 + L.total * 7, nW = Object.keys(L.wset || {}).length;
    const add = (label, v) => { if (v > 0) { lines.push([label, '+' + v]); r.bonusTotal += v; } };
    const mult = r.mods.reduce((a, k) => a * (EXP.MODS[k] ? EXP.MODS[k].score : 1), 1), roomScoreBase = score - L.scoreStart;
    add('Velocidade (par ' + par.toFixed(0) + ' s)', Math.min(800, Math.max(0, Math.round((par - L.time) * 12))));
    add('Precisão ' + (acc === null ? '' : Math.round(acc * 100) + '%'), acc !== null && acc >= .5 ? Math.round(acc * 500) : 0);
    add('Variedade de armas (' + nW + ')', Math.min(500, Math.max(0, (nW - 1) * 100)));
    add('Uso do cenário', Math.min(600, (L.env || 0) * 80 + L.throwHits * 40));
    add('Sem detecção', L.detections === 0 ? (r.id === 'assassino' ? 400 : 300) : 0);
    add('Sem morrer', r.roomDeaths === 0 ? 200 : 0);
    if (mult !== 1) add('Modificadores x' + mult.toFixed(2), Math.round(roomScoreBase * (mult - 1)));
    const bonus = lines.reduce((a, l) => a + parseInt(l[1].slice(1), 10), 0); if (bonus) addScore(bonus);
    saveBestRank(); const rank = rankForStats();
    if (nW >= 5) sv.flags.variety5 = true;
    r.rooms++; sv.stats.rooms++; if (L.detections === 0) sv.stats.flawless++;
    if (rank === 'S') sv.stats.sRanks++; if (rank === 'SS') { sv.stats.ssRanks++; } r.ranks.push(rank);
    if (RANKV[rank] > RANKV[r.rankBest]) r.rankBest = rank;
    const xp = EXP.addXP(60 + lvl * 5 + ({ D: 0, C: 20, B: 50, A: 100, S: 200, SS: 350 })[rank], 'sala');
    flushStats(sv); EXP.checkAch();
    const out = [['Abates', L.kills + ' / ' + L.total], ['Tempo', L.time.toFixed(1) + ' s'], ['Precisão', acc === null ? '—' : Math.round(acc * 100) + '%'], ['Maior combo', L.maxCombo + 'x'], ['Detecções', L.detections]];
    return { title: historia ? 'CAPÍTULO ' + (capIdx + 1) + ' CONCLUÍDO' : (r.total ? 'SALA ' + r.rooms + ' / ' + r.total : 'SALA ' + lvl) + ' CONCLUÍDA', rank, stats: out, bonus: lines, xp, score };
  }
  const _advance = advance;
  advance = function () {
    const r = EXP.run; if (!r || r.arena) return _advance();
    const rep = roomReport(r); const m = MODES[r.id];
    if (m.clear) m.clear(r);
    st = 'summary'; mouse.down = false; EXP.sfx('score');
    EXP.ui.summary(rep, () => {
      st = 'play';
      if (r.total && r.rooms >= r.total) { if (r.id === 'arcade') { const b = r.lives * 1000; if (b) addScore(b); EXP.save().flags.arcadeWon = true; } if (r.id === 'assassino' && r.detections === 0) EXP.save().flags.ghostWon = true; endRun(true, 'Missão cumprida!'); return; }
      r.roomDeaths = 0; _advance();
    });
  };

  // ================= MORTE =================
  const _die = die;
  die = function () {
    const r = EXP.run, sv = EXP.save();
    if (r && !r.done) {
      flushStats(sv); sv.stats.deaths++; r.roomDeaths++;
      if (r.id === 'arcade' && r.lives > 0) { r.lives--; banner = { txt: 'FICHA -1', sub: r.lives + ' restantes', t: 1.6 }; EXP.sfx('hit'); levelStats.detections = 0; const sc = score; startLevel(); score = sc; combo = 0; return; }
    }
    _die();
    if (r && !r.done) {
      if (r.id === 'classico' || r.id === 'historia') { const x = EXP.addXP(Math.max(0, r.kills) * 2, 'derrota'); finalizeRun(r, false); resumo.textContent += ' · XP +' + (r.xp || 0) + ' · Nível ' + sv.level; EXP.touch(); }
      else { fim.classList.add('oculto'); fim.classList.remove('glitch'); endRun(false, MODE_FAIL[r.id] || 'Você morreu'); }
    }
  };
  const MODE_FAIL = { horda: 'Você caiu', sobrevivencia: 'Você caiu', invasao: 'Você caiu', arcade: 'Sem fichas', assassino: 'Você morreu', limpeza: 'Você morreu', contrarrelogio: 'Você morreu', diario: 'Você morreu', custom: 'Você morreu' };

  // ================= FIM DE PARTIDA =================
  function finalizeRun(r, win) {
    r.done = true; const sv = EXP.save(); flushStats(sv);
    const id = r.id; sv.stats.bestScore = Math.max(sv.stats.bestScore, score);
    if (id === 'horda') EXP.setRecord('horda', 'wave', Math.max(0, r.wave - (win ? 0 : 1)));
    if (id === 'sobrevivencia') EXP.setRecord('sobrevivencia', 'time', Math.round(r.t));
    if (id === 'contrarrelogio') EXP.setRecord('contrarrelogio', 'rooms', r.rooms);
    if (id === 'classico') EXP.setRecord('classico', 'rooms', Math.max(0, lvl - 1));
    if (id !== 'custom') EXP.setRecord(id, 'best', score); else EXP.setRecord(id, 'best', score);
    let pos = -1;
    if (id !== 'historia' && id !== 'custom') pos = EXP.addRank(id, { score, mask: MASKS[sel].nome, info: r.wave ? 'onda ' + r.wave : r.rooms ? r.rooms + ' salas' : Math.round(r.t) + ' s', win });
    EXP.checkAch(); EXP.checkUnlocks(); EXP.flush(true);
    return pos;
  }
  function endRun(win, reason) {
    const r = EXP.run; if (!r || r.done) return; const sv = EXP.save();
    const wasBest = score > ((sv.records[r.id] && sv.records[r.id].best) || 0);
    let extra = [];
    if (win) {
      const mx = { horda: 0, sobrevivencia: 350, arcade: 400, contrarrelogio: 0, assassino: 300, limpeza: 300, invasao: 350, diario: 0, custom: 150 }[r.id] || 0; if (mx) EXP.addXP(mx, 'vitória');
      if (r.id === 'invasao') { const b = r.integ * 150; addScore(b); extra.push(['Integridade restante', '+' + b]); }
      if (r.id === 'sobrevivencia') { const b = Math.round(r.t * 20); addScore(b); extra.push(['Tempo vivo', '+' + b]); }
      if (r.id === 'diario') { const k = r.daily.date; if (!sv.daily[k]) { sv.daily[k] = { score, rank: r.rankBest }; EXP.addXP(250, 'diário'); } else if (score > sv.daily[k].score) sv.daily[k] = { score, rank: r.rankBest }; }
    } else {
      if (r.id === 'horda') EXP.addXP(r.wave * 8, 'ondas'); if (r.id === 'sobrevivencia') EXP.addXP(Math.round(r.t * .6), 'tempo');
      if (r.id === 'diario' && r.rooms >= 1) { const k = r.daily.date; if (!sv.daily[k] || score > sv.daily[k].score) sv.daily[k] = { score, rank: r.rankBest, partial: true }; }
    }
    const pos = finalizeRun(r, win);
    musStop(win ? 1.2 : .9); EXP.musBoss(0, false);
    const m = MODES[r.id], acc = r.shots ? Math.round(r.hits / r.shots * 100) + '%' : '—';
    const lines = [['Pontuação final', score], ['Abates', r.kills], ['Tempo', Math.round(r.t) + ' s'], ['Precisão', acc], ['Maior combo', r.maxCombo + 'x']];
    if (r.wave) lines.splice(1, 0, ['Ondas', r.wave - (win ? 0 : (r.phase === 'wave' ? 1 : 0))]);
    if (r.total) lines.splice(1, 0, ['Salas', r.rooms + ' / ' + r.total]);
    if (r.bossKills) lines.push(['Chefes derrotados', r.bossKills]);
    if (r.id === 'arcade') lines.push(['Fichas restantes', r.lives]);
    if (r.id === 'assassino') lines.push(['Detecções', r.detections + ' / 3']);
    if (r.id === 'invasao') lines.push(['Integridade', r.integ + ' / 10']);
    lines.push(...extra);
    if (r.id === 'custom') lines.push(['Obs.', 'Partida personalizada: XP reduzido']);
    st = 'result'; mouse.down = false;
    EXP.ui.result({ id: r.id, title: win ? 'VITÓRIA' : 'FIM DE JOGO', sub: m.nome + ' · ' + reason, win, lines, rank: r.rankBest, rankText: r.ranks.length ? r.ranks.join(' ') : '—', xp: r.xp, level: sv.level, record: wasBest && score > 0, pos, unl: EXP.takeNewUnlocks() });
  }
  EXP.endRun = endRun;
  const _endStory = endStory;
  endStory = function () { const r = EXP.run, sv = EXP.save(); sv.flags.storyWon = true; if (dif === 'hardcore') sv.flags.hardcoreWon = true; EXP.addXP(500, 'história'); if (r) finalizeRun(r, true); _endStory(); };

  // ================= DESBLOQUEIOS =================
  let newUnl = [];
  EXP.checkUnlocks = function () {
    const sv = EXP.save(), known = new Set(sv.unl);
    const seeding = sv.unl.length === 0;
    const test = (key, label, ok, kind) => { if (ok && !known.has(key)) { sv.unl.push(key); known.add(key); if (!seeding) { newUnl.push({ kind, label }); EXP.toast('DESBLOQUEADO', label, '#7dff9b'); } } };
    MASKS.forEach((m, i) => { if (i >= EXP.OLD_MASKS || m.lock) test('m:' + m.id, 'Máscara ' + m.nome, !EXP.maskLocked(i), 'mask'); });
    for (const w of EXP.newWeapons) test('w:' + w, 'Arma ' + WP[w].nome, EXP.weaponUnlocked(w), 'weapon');
    EXP.touch();
  };
  EXP.takeNewUnlocks = function () { const o = newUnl; newUnl = []; return o; };
  EXP.recheck = function () { EXP.checkAch(); EXP.checkUnlocks(); };

  // ================= HUD DOS MODOS =================
  const T = (s, x, y, c, f, al) => tx(s, x, y, c, f, al);
  const drawModeHudText = (g, entry) => {
    const drawn = typeof drawHudTextBatch === 'function' && drawHudTextBatch([entry]);
    if (!drawn) T(entry.text, entry.x, entry.y, entry.color, entry.font, entry.align || 'left');
  };
  EXP.drawHUD = function (g) {
    const r = EXP.run, m = r && MODES[r.id];
    if (P && st !== 'dead') {
      // pente / recarga
      const M = EXP.mag;
      if (M.max) {
        drawModeHudText(g, { text: 'PENTE ' + M.left + ' / ' + Math.max(0, ammo - M.left), x: 34, y: 138, color: M.rt > 0 ? '#ff9ac8' : '#ffd23f', font: 'bold 18px Impact, sans-serif' });
        if (M.rt > 0) {
          const hudShapeRenderer = window.HM_WASM_RENDERER, reloadDrawn = hudShapeRenderer && hudShapeRenderer.drawHudShape && hudShapeRenderer.drawHudShape(g, 3, W, H, 1 - M.rt / M.rtMax);
          if (!reloadDrawn) { g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(34, 146, 160, 8); g.fillStyle = '#ff9ac8'; g.fillRect(34, 146, 160 * (1 - M.rt / M.rtMax), 8); }
          drawModeHudText(g, { text: 'RECARREGANDO', x: 34 + 170, y: 154, color: '#ff9ac8', font: 'bold 14px Impact, sans-serif' });
        }
        else if (M.left <= Math.ceil(M.max * .25) && ammo > M.left) drawModeHudText(g, { text: CFG.reloadKey.toUpperCase() + ' · RECARREGAR', x: 34 + 150, y: 138, color: '#fff', font: '13px Impact, sans-serif' });
      }
      if (r && !r.done) {
        let top = m.nome.toUpperCase();
        if (r.id === 'horda') top += ' · ONDA ' + Math.max(1, r.wave) + (r.phase === 'interm' ? ' (PRÓXIMA EM ' + Math.max(0, r.phT).toFixed(0) + ')' : '');
        else if (r.id === 'sobrevivencia') top += ' · ' + Math.max(0, 180 - r.t).toFixed(0) + ' s';
        else if (r.id === 'contrarrelogio') top += ' · ' + Math.max(0, r.timeLeft).toFixed(1) + ' s';
        else if (r.id === 'arcade') top += ' · FICHAS ' + '●'.repeat(r.lives) + '○'.repeat(Math.max(0, 3 - r.lives)) + ' · SALA ' + (r.rooms + 1) + '/' + r.total;
        else if (r.id === 'assassino') top += ' · DETECÇÕES ' + r.detections + '/3 · SALA ' + (r.rooms + 1) + '/' + r.total;
        else if (r.id === 'invasao') top += ' · ATAQUE ' + Math.max(1, r.atk) + '/5 · ZONA ' + r.integ + '/10';
        else if (r.total) top += ' · SALA ' + (r.rooms + 1) + '/' + r.total;
        else if (r.id === 'classico' || r.id === 'historia') top = '';
        if (top) {
          const title = { text: top, x: W / 2, y: 56, color: m.color || '#19f0e6', font: 'bold 20px Impact, sans-serif', align: 'center' };
          const titleDrawn = typeof drawHudTextBatch === 'function' && drawHudTextBatch([title]);
          if (!titleDrawn) { g.save(); T(title.text, title.x, title.y, title.color, title.font, title.align); g.restore(); }
        }
        if (r.id === 'contrarrelogio' && r.timeLeft < 15) {
          const flashAlpha = .08 + .08 * Math.sin(performance.now() / 120), modeFxRenderer = window.HM_WASM_RENDERER;
          if (!(modeFxRenderer && modeFxRenderer.drawFxOverlays && modeFxRenderer.drawFxOverlays(g, 3, W, H, 0, flashAlpha, 0, true))) {
            g.fillStyle = 'rgba(255,46,91,' + flashAlpha + ')'; g.fillRect(0, 0, W, H);
          }
        }
        if (r.id === 'invasao' && r.zone) {   // marcador da zona fora da tela
          const z = r.zone, zoom = CFG.zoom, sx = (z.x - cam.x - W / 2) * zoom + W / 2, sy = (z.y - cam.y - H / 2) * zoom + H / 2;
          if (sx < 20 || sx > W - 20 || sy < 20 || sy > H - 20) {
            const a = Math.atan2(sy - H / 2, sx - W / 2), arrowX = W / 2 + Math.cos(a) * 270, arrowY = H / 2 + Math.sin(a) * 250;
            const arrowRenderer = window.HM_WASM_RENDERER;
            if (!(arrowRenderer && arrowRenderer.drawInvasionArrow && arrowRenderer.drawInvasionArrow(g, arrowX, arrowY, a))) {
              g.save(); g.translate(arrowX, arrowY); g.rotate(a); g.fillStyle = '#ff6bd5'; g.beginPath(); g.moveTo(14, 0); g.lineTo(-8, -9); g.lineTo(-8, 9); g.fill(); g.restore();
            }
          }
        }
      }
      // barra do chefe
      const b = EXP.world.boss;
      if (b && enemies.includes(b)) {
        const bossRenderer = window.HM_WASM_RENDERER;
        const barDrawn = bossRenderer && bossRenderer.drawBossHealthBar && bossRenderer.drawBossHealthBar(g, b, W, H);
        const w = 460, x = (W - w) / 2, y = H - 92;
        if (!barDrawn) {
          const f = Math.max(0, b.hp / b.hpMax);
          g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x - 3, y - 3, w + 6, 20); g.fillStyle = b.boss.col; g.fillRect(x, y, w * f, 14);
          g.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 1; i < b.boss.phases.length; i++) g.fillRect(x + w * b.boss.phases[i].at - 1, y, 2, 14);
          g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(x, y, w, 14);
        }
        const bossTitle = b.boss.nome.toUpperCase() + ' · FASE ' + (b.ph + 1), titleFont = 'bold 18px Impact, sans-serif';
        const titleDrawn = typeof drawHudTextBatch === 'function' && drawHudTextBatch([
          { text: bossTitle, x: W / 2, y: y - 8, color: '#fff', font: titleFont, align: 'center' }
        ]);
        if (!titleDrawn) T(bossTitle, W / 2, y - 8, '#fff', titleFont, 'center');
      }
    }
    // toasts
    const ts = EXP.toasts, toastEntries = []; let y = 84, shown = 0;
    for (let i = ts.length - 1; i >= 0; i--) {
      const t = ts[i]; t.life -= 1 / 60; if (t.life <= 0) { ts.splice(i, 1); continue; } if (shown++ >= 3) continue;
      const alpha = Math.min(1, t.life * 1.5);
      toastEntries.push({ text: t.t, x: W / 2, y, color: t.c, font: 'bold 17px Impact, sans-serif', align: 'center', alpha });
      if (t.sub) toastEntries.push({ text: t.sub, x: W / 2, y: y + 16, color: '#fff', font: '13px Impact, sans-serif', align: 'center', alpha });
      y += t.sub ? 38 : 24;
    }
    if (toastEntries.length) {
      const toastsDrawn = typeof drawHudTextBatch === 'function' && drawHudTextBatch(toastEntries);
      if (!toastsDrawn) {
        for (const entry of toastEntries) { g.globalAlpha = entry.alpha; T(entry.text, entry.x, entry.y, entry.color, entry.font, entry.align); }
        g.globalAlpha = 1;
      }
    }
    if (st === 'paused' && r) {
      const pauseSummaryRenderer = window.HM_WASM_RENDERER;
      if (!(pauseSummaryRenderer && pauseSummaryRenderer.drawHudShape && pauseSummaryRenderer.drawHudShape(g, 4, W, H))) {
        g.fillStyle = 'rgba(5,0,18,.55)'; g.fillRect(W / 2 - 230, H / 2 + 80, 460, 120);
      }
      const pauseEntries = [
        { text: MODES[r.id].nome.toUpperCase() + ' · NÍVEL ' + EXP.save().level, x: W / 2, y: H / 2 + 110, color: '#19f0e6', font: 'bold 20px Impact, sans-serif', align: 'center' },
        { text: 'Abates ' + r.kills + ' · Pontos ' + score + ' · XP +' + (r.xp || 0), x: W / 2, y: H / 2 + 140, color: '#fff', font: '18px Impact, sans-serif', align: 'center' },
        { text: 'B · voltar ao lobby', x: W / 2, y: H / 2 + 172, color: '#ffd23f', font: '16px Impact, sans-serif', align: 'center' }
      ];
      const pauseTextsDrawn = typeof drawHudTextBatch === 'function' && drawHudTextBatch(pauseEntries);
      if (!pauseTextsDrawn) for (const entry of pauseEntries) T(entry.text, entry.x, entry.y, entry.color, entry.font, entry.align);
    }
  };
  // desenho no mundo: zona da invasão
  const _worldDraw = EXP.worldDraw;
  EXP.drawWorld = function (g) {
    _worldDraw(g);
    const r = EXP.run;
    if (r && r.id === 'invasao' && r.zone) {
      const z = r.zone, now = performance.now(), zoneRenderer = window.HM_WASM_RENDERER;
      if (!(zoneRenderer && zoneRenderer.drawInvasionZone && zoneRenderer.drawInvasionZone(g, z.x, z.y, now))) {
        const p = .5 + .5 * Math.sin(now / 260); g.save(); g.strokeStyle = 'rgba(255,107,213,' + (.5 + .4 * p) + ')'; g.lineWidth = 4; g.beginPath(); g.arc(z.x, z.y, 34, 0, TAU); g.stroke(); g.fillStyle = 'rgba(255,107,213,.14)'; g.fill(); g.restore();
      }
    }
  };
  addEventListener('keydown', e => { if (e.key.toLowerCase() === 'b' && st === 'paused') { musStop(.3); toMenu(); EXP.ui.hideAll(); } });
})();
