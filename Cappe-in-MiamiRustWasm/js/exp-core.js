/* Cappe in Miami - Expansão | NÚCLEO
   Salvamento versionado (com backup e migração), XP/níveis, pontos de habilidade,
   conquistas, ranking local e avisos (toasts). Não depende de nenhum outro exp-*.js. */
(function () {
  'use strict';
  const EXP = window.EXP;
  const KEY = 'hm_save_v2', BAK = 'hm_save_v2_bak';
  const MAXLV = 40;

  const defSave = () => ({
    v: 2, created: Date.now(), saved: 0,
    xp: 0, level: 1, sp: 0, perks: {},
    stats: { kills: 0, deaths: 0, rooms: 0, shots: 0, hits: 0, melee: 0, throwHits: 0, finishers: 0, playSec: 0, maxCombo: 0,
             bestScore: 0, runs: 0, sRanks: 0, ssRanks: 0, bossKills: 0, barrels: 0, cameras: 0, flawless: 0 },
    records: {},          // por modo: { best, wave, time, rooms }
    ranking: {},          // por modo: top 10
    ach: {}, unl: [], bosses: {}, weaponsUsed: {}, masksUsed: {}, flags: {}, daily: {},
    settings: { musVol: .8, sfxVol: .8, skin: 'classic' }
  });

  // Skins são exclusivamente cosméticas; personagens/máscaras continuam controlando atributos.
  const SKINS = [
    { id: 'classic', name: 'Clássico', color: '#1f5d5a', detail: '#c0263a', palette: { suit: '#1f5d5a', suitD: '#123a38', suitL: '#3a8c85', tie: '#c0263a', tieD: '#7a1624' } },
    { id: 'sunset', name: 'Sunset', color: '#a64436', detail: '#ffd166', palette: { suit: '#a64436', suitD: '#672b29', suitL: '#dc7650', tie: '#ffd166', tieD: '#bd7437' } },
    { id: 'midnight', name: 'Meia-noite', color: '#343d70', detail: '#a78bfa', palette: { suit: '#343d70', suitD: '#202748', suitL: '#5866a6', tie: '#a78bfa', tieD: '#7256b4' } },
    { id: 'jade', name: 'Jade', color: '#287348', detail: '#f3d46b', palette: { suit: '#287348', suitD: '#17452f', suitL: '#49a86c', tie: '#f3d46b', tieD: '#b99a42' } }
  ];
  EXP.SKINS = SKINS;
  EXP.curSkin = () => SKINS.find(s => s.id === EXP.save().settings.skin) || SKINS[0];
  EXP.setSkin = id => {
    if (!SKINS.some(s => s.id === id)) return false;
    const settings = EXP.save().settings;
    if (settings.skin === id) return true;
    settings.skin = id; EXP.touch(); return true;
  };

  // mescla recursiva: campos novos de versões futuras nunca quebram um save antigo
  function merge(base, src) {
    if (!src || typeof src !== 'object') return base;
    for (const k of Object.keys(src)) {
      if (k === '__proto__' || k === 'prototype' || k === 'constructor') continue;
      if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) base[k] = merge(base[k], src[k]);
      else base[k] = src[k];
    }
    return base;
  }
  function readKey(k) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  const isObject = o => !!o && typeof o === 'object' && !Array.isArray(o);
  function safeTree(o) {
    if (!o || typeof o !== 'object') return true;
    return Object.keys(o).every(k => k !== '__proto__' && k !== 'prototype' && k !== 'constructor' && safeTree(o[k]));
  }
  function valid(o) {
    if (!isObject(o) || !safeTree(o) || (o.v !== 1 && o.v !== 2) ||
        !Number.isInteger(o.level) || o.level < 1 || o.level > MAXLV || !isObject(o.stats)) return false;
    const defaults = defSave();
    for (const k of Object.keys(defaults)) {
      if (!(k in o)) continue; // saves antigos podem não ter os campos novos
      if (isObject(defaults[k]) && !isObject(o[k])) return false;
      if (typeof defaults[k] === 'number' && (!Number.isFinite(o[k]) || o[k] < 0)) return false;
    }
    if (o.unl !== undefined && (!Array.isArray(o.unl) || o.unl.some(v => typeof v !== 'string'))) return false;
    for (const k of Object.keys(defaults.stats)) if (k in o.stats && (!Number.isFinite(o.stats[k]) || o.stats[k] < 0)) return false;
    if (o.perks && Object.values(o.perks).some(v => !Number.isInteger(v) || v < 0)) return false;
    if (o.records && Object.values(o.records).some(v => !isObject(v))) return false;
    if (o.ranking && Object.values(o.ranking).some(v => !Array.isArray(v) || v.some(e => !isObject(e) || !Number.isFinite(e.score)))) return false;
    if (o.settings) {
      for (const k of ['musVol', 'sfxVol']) if (k in o.settings && (!Number.isFinite(o.settings[k]) || o.settings[k] < 0 || o.settings[k] > 1)) return false;
    }
    return true;
  }

  function migrate(sv) {   // traz dados das versões anteriores (v4) sem apagá-los
    try {
      const hi = +localStorage.getItem('hm_hiscore') || 0;
      if (hi > (sv.records.classico && sv.records.classico.best || 0)) sv.records.classico = Object.assign({}, sv.records.classico, { best: hi });
      if (localStorage.getItem('hm_unlock') === '1') sv.flags.hardcoreWon = true;
      sv.stats.bestScore = Math.max(sv.stats.bestScore, hi);
    } catch (e) {}
    return sv;
  }

  let SAVE = null, dirty = false, saveT = 0, lastBak = 0, unsupportedSave = false;
  function load() {
    let d = readKey(KEY);
    unsupportedSave = isObject(d) && Number.isFinite(d.v) && d.v > 2;
    if (!valid(d)) { const b = readKey(BAK); if (valid(b)) { d = b; EXP.log && EXP.log('save principal inválido: restaurado do backup'); } else d = null; }
    SAVE = d ? merge(defSave(), d) : migrate(defSave());
    return SAVE;
  }
  function flush(force) {
    if (!SAVE || unsupportedSave || (!dirty && !force)) return;
    try {
      const prev = localStorage.getItem(KEY);
      if (prev && valid(readKey(KEY)) && Date.now() - lastBak > 20000) { localStorage.setItem(BAK, prev); lastBak = Date.now(); }   // nunca substituir um backup válido por dados corrompidos
      SAVE.saved = Date.now(); localStorage.setItem(KEY, JSON.stringify(SAVE)); dirty = false;
    } catch (e) { EXP.log && EXP.log('falha ao salvar: ' + e.message); }
  }
  function touch() { dirty = true; clearTimeout(saveT); saveT = setTimeout(() => flush(), 1500); }   // salvamento automático (agrupado)
  function exportSave() {
    flush(true);
    const blob = new Blob([JSON.stringify(SAVE, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cappe-in-miami-save.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function importSave(text) {
    let o; try { o = JSON.parse(text); } catch (e) { return 'Arquivo inválido (não é JSON).'; }
    if (!valid(o)) return 'Este arquivo não é um save do Cappe in Miami.';
    const error = replaceSave(o); if (error) return error;
    EXP.recheck(); return '';
  }
  function replaceSave(data) {
    if (unsupportedSave) return 'O save usa uma versão mais recente. Abra-o na versão correspondente do jogo para preservar o progresso.';
    const next = merge(defSave(), data); next.v = 2; next.saved = Date.now();
    let previousBackup = null, backupWritten = false;
    try {
      previousBackup = localStorage.getItem(BAK);
      localStorage.setItem(BAK, JSON.stringify(SAVE));
      backupWritten = true;
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch (e) {
      // Se a segunda escrita falhar, conservar também o backup que seria restaurado.
      if (backupWritten) try {
        if (previousBackup === null) localStorage.removeItem(BAK);
        else localStorage.setItem(BAK, previousBackup);
      } catch (backupError) { EXP.log && EXP.log('falha ao recuperar backup: ' + backupError.message); }
      EXP.log && EXP.log('falha ao salvar: ' + e.message); return 'Não foi possível gravar o save. O progresso atual foi mantido.';
    }
    SAVE = next; dirty = false; lastBak = Date.now(); clearTimeout(saveT); return '';
  }
  function restoreBackup() {
    const backup = readKey(BAK);
    if (!valid(backup)) return 'Nenhum backup válido disponível.';
    const error = replaceSave(backup); if (!error) EXP.recheck(); return error;
  }
  function resetSave() { return replaceSave(defSave()); }

  // ---------- XP / níveis / perks ----------
  const xpNeed = l => Math.round(90 * Math.pow(l, 1.45));
  const PERKS = [
    { id: 'agil',    nome: 'Pés Leves',   max: 5, desc: '+3% de velocidade por nível.' },
    { id: 'furtivo', nome: 'Sombra',      max: 5, desc: 'Inimigos te veem 20 px mais tarde e ouvem 4% menos por nível.' },
    { id: 'municao', nome: 'Bolsos Fundos', max: 5, desc: '+3 de munição inicial por nível.' },
    { id: 'folego',  nome: 'Embalo',      max: 5, desc: '+0,2 s na janela de combo por nível.' },
    { id: 'pele',    nome: 'Pele Grossa', max: 3, desc: 'Nível 1: +1 colete por sala. Nível 3: +2.' },
    { id: 'pontaria', nome: 'Mira Firme', max: 5, desc: 'Reduz a dispersão dos tiros em 6% por nível.' },
  ];
  function perk(id) { return (SAVE.perks[id] || 0); }
  function buyPerk(id) {
    const p = PERKS.find(x => x.id === id); if (!p) return false;
    if (SAVE.sp < 1 || perk(id) >= p.max) return false;
    SAVE.sp--; SAVE.perks[id] = perk(id) + 1; touch(); return true;
  }
  function addXP(n, why) {
    n = Math.round(n * ((typeof S !== 'undefined' && S.xp) || 1) * (EXP.xpMul || 1)); if (n <= 0) return 0;
    SAVE.xp += n;
    while (SAVE.level < MAXLV && SAVE.xp >= xpNeed(SAVE.level)) {
      SAVE.xp -= xpNeed(SAVE.level); SAVE.level++;
      SAVE.sp += 1 + (SAVE.level % 5 === 0 ? 1 : 0);
      toast('NÍVEL ' + SAVE.level, '+' + (1 + (SAVE.level % 5 === 0 ? 1 : 0)) + ' ponto(s) de habilidade', '#ffd23f');
      EXP.checkUnlocks();
    }
    if (SAVE.level >= MAXLV) SAVE.xp = Math.min(SAVE.xp, xpNeed(MAXLV));
    touch(); if (EXP.run) EXP.run.xp = (EXP.run.xp || 0) + n; return n;
  }

  // ---------- toasts (lista fixa, sem criar objetos por quadro) ----------
  const toasts = [];
  function toast(t, sub, c) { toasts.push({ t, sub: sub || '', c: c || '#19f0e6', life: 3.2 }); if (toasts.length > 5) toasts.shift(); }

  // ---------- conquistas ----------
  const ACH = [
    { id: 'primeiro',  nome: 'Primeiro Sangue',     desc: 'Derrote um inimigo.',                       test: s => s.stats.kills >= 1 },
    { id: 'k100',      nome: 'Faxineiro',           desc: 'Derrote 100 inimigos.',                     test: s => s.stats.kills >= 100 },
    { id: 'k500',      nome: 'Ceifador',            desc: 'Derrote 500 inimigos.',                     test: s => s.stats.kills >= 500 },
    { id: 'k2000',     nome: 'Lenda de Miami',      desc: 'Derrote 2000 inimigos.',                    test: s => s.stats.kills >= 2000 },
    { id: 'rank_s',    nome: 'Estilo',              desc: 'Consiga nota S em uma sala.',               test: s => s.stats.sRanks >= 1 },
    { id: 'rank_ss',   nome: 'Perfeição',           desc: 'Consiga nota SS em uma sala.',              test: s => s.stats.ssRanks >= 1 },
    { id: 'combo10',   nome: 'Frenesi',             desc: 'Chegue a um combo de 10x.',                 test: s => s.stats.maxCombo >= 10 },
    { id: 'combo20',   nome: 'Sem Freio',           desc: 'Chegue a um combo de 20x.',                 test: s => s.stats.maxCombo >= 20 },
    { id: 'horda10',   nome: 'Maré Alta',           desc: 'Chegue à onda 10 no Modo Horda.',           test: s => (s.records.horda && s.records.horda.wave || 0) >= 10 },
    { id: 'horda20',   nome: 'Inabalável',          desc: 'Chegue à onda 20 no Modo Horda.',           test: s => (s.records.horda && s.records.horda.wave || 0) >= 20 },
    { id: 'chefe1',    nome: 'Caça-Chefes',         desc: 'Derrote um chefe.',                         test: s => s.stats.bossKills >= 1 },
    { id: 'chefe6',    nome: 'Rei da Pista',        desc: 'Derrote todos os chefes disponíveis.',      test: s => Object.keys(s.bosses).length >= (EXP.bosses ? EXP.bosses.length : 99) },
    { id: 'surv',      nome: 'Sobrevivente',        desc: 'Complete o Modo Sobrevivência.',            test: s => !!s.flags.survWon },
    { id: 'arcade',    nome: 'Moedas Infinitas',    desc: 'Zere o Modo Arcade.',                       test: s => !!s.flags.arcadeWon },
    { id: 'fantasma',  nome: 'Fantasma',            desc: 'Vença o Modo Assassino sem ser detectado.', test: s => !!s.flags.ghostWon },
    { id: 'diario',    nome: 'Rotina',              desc: 'Complete um Desafio Diário.',               test: s => Object.keys(s.daily).length >= 1 },
    { id: 'barris',    nome: 'Pirotécnico',         desc: 'Exploda 10 barris.',                        test: s => s.stats.barrels >= 10 },
    { id: 'cameras',   nome: 'Ponto Cego',          desc: 'Destrua 5 câmeras de segurança.',           test: s => s.stats.cameras >= 5 },
    { id: 'variedade', nome: 'Arsenal',             desc: 'Use 5 armas diferentes na mesma sala.',     test: s => !!s.flags.variety5 },
    { id: 'impecavel', nome: 'Impecável',           desc: 'Complete 5 salas sem ser detectado.',       test: s => s.stats.flawless >= 5 },
    { id: 'hist',      nome: 'Fim da Linha',        desc: 'Termine o Modo História.',                  test: s => !!s.flags.storyWon },
    { id: 'pontos50k', nome: 'Placar Estourado',    desc: 'Faça 50.000 pontos em uma partida.',        test: s => s.stats.bestScore >= 50000 },
    { id: 'nivel10',   nome: 'Veterano',            desc: 'Chegue ao nível 10.',                       test: s => s.level >= 10 },
    { id: 'nivel25',   nome: 'Elite',               desc: 'Chegue ao nível 25.',                       test: s => s.level >= 25 },
  ];
  function checkAch() {
    for (const a of ACH) if (!SAVE.ach[a.id] && a.test(SAVE)) { SAVE.ach[a.id] = Date.now(); toast('CONQUISTA', a.nome, '#ff2e93'); touch(); EXP.checkUnlocks(); }
  }

  // ---------- ranking local ----------
  function addRank(mode, entry) {
    const L = SAVE.ranking[mode] || (SAVE.ranking[mode] = []);
    entry.date = new Date().toISOString().slice(0, 10); L.push(entry); L.sort((a, b) => b.score - a.score); if (L.length > 10) L.length = 10;
    const pos = L.indexOf(entry); touch(); return pos;   // -1 se ficou fora do top 10
  }
  function setRecord(mode, key, val, lowerBetter) {
    const R = SAVE.records[mode] || (SAVE.records[mode] = {}), old = R[key];
    if (old === undefined || (lowerBetter ? val < old : val > old)) { R[key] = val; touch(); return true; } return false;
  }

  load();
  Object.assign(EXP, {
    MAXLV, PERKS, ACH, xpNeed, perk, buyPerk, addXP, toast, toasts, checkAch, addRank, setRecord,
    save: () => SAVE, saveReadOnly: () => unsupportedSave, flush, touch, exportSave, importSave, resetSave, reloadSave: load, restoreBackup,
  });
  if (unsupportedSave && typeof document !== 'undefined' && document.createElement) {
    const notice = document.createElement('div');
    notice.id = 'saveReadonlyNotice'; notice.className = 'save-readonly-notice'; notice.setAttribute('role', 'alert');
    notice.textContent = 'Save de versão mais nova detectado. Este jogo está em modo protegido e não substituirá seu progresso.';
    const target = document.querySelector('#menu') || document.body; target.prepend(notice);
  }
  addEventListener('pagehide', () => flush(true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(true); });
  setInterval(() => flush(), 8000);
})();

/* ==== BLOCO: IA ESTENDIDA (exp-core.js) ===========================================
   Estados mentais explícitos, expostos em enemy.mind:
     'patrol'      segue os waypoints definidos em maps.js (enemy.route, em pixels)
     'chase'       linha de visão limpa (raycast, que atravessa vidro) rastreia o jogador
     'investigate' tiro do jogador em qualquer lugar: inimigos a até 450 px (através de paredes)
                   caminham até a origem do ruído usando busca de caminho (BFS em grade)
   Os estados internos do jogo (IDLE, SUSPICIOUS, INVESTIGATE, SEARCH, ALERT, CHASE, STUNNED)
   continuam existindo; 'PATROL' é o estado interno novo. EXP.mind() traduz tudo em 4 nomes.
   =================================================================================== */
(function () {
  'use strict';
  const EXP = window.EXP;
  EXP.glass = { list: [], map: new Map() };       // tiles de vidro vivos (preenchido por exp-world.js, quebrado em exp-fx.js)
  const NAV = { cs: 20, cols: 0, rows: 0, ok: null, par: null, seen: null, q: null, neighbors: null, neighborCounts: null, stamp: 0, built: false, solids: [], solidBuckets: null, bucketSize: 64, bucketCols: 0, bucketRows: 0 };
  const CLR = 14;   // folga da grade: raio do inimigo (13) + 1 px, para que nenhum caminho passe rente à quina
  EXP.NAV = NAV;
  const DI = [1, -1, 0, 0, 1, 1, -1, -1], DJ = [0, 0, 1, -1, 1, -1, 1, -1];

  function circleHits(list, x, y, r) {
    const test = w => { const cx = Math.max(w[0], Math.min(x, w[0] + w[2])), cy = Math.max(w[1], Math.min(y, w[1] + w[3])); return (x - cx) * (x - cx) + (y - cy) * (y - cy) < r * r; };
    if (list === NAV.solids && NAV.solidBuckets) {
      const size = NAV.bucketSize, cols = NAV.bucketCols, rows = NAV.bucketRows, buckets = NAV.solidBuckets;
      const x0 = Math.max(0, Math.min(cols - 1, Math.floor((x - r) / size))), x1 = Math.max(0, Math.min(cols - 1, Math.floor((x + r) / size)));
      const y0 = Math.max(0, Math.min(rows - 1, Math.floor((y - r) / size))), y1 = Math.max(0, Math.min(rows - 1, Math.floor((y + r) / size)));
      for (let by = y0; by <= y1; by++) for (let bx = x0; bx <= x1; bx++) {
        const bucket = buckets[by * cols + bx]; if (!bucket) continue;
        for (let i = 0; i < bucket.length; i++) if (test(bucket[i])) return true;
      }
      return false;
    }
    for (let i = 0; i < list.length; i++) if (test(list[i])) return true;
    return false;
  }
  NAV.circleHits = (x, y, r) => circleHits(NAV.solids, x, y, r);
  // grade de navegação: células de 20 px, caminháveis quando livres de parede/móvel/vidro (portas contam como passagem)
  EXP.navBuild = function () {
    const cs = NAV.cs, cols = Math.ceil(WW / cs), rows = Math.ceil(WH / cs), n = cols * rows;
    if (!NAV.ok || NAV.ok.length !== n) { NAV.ok = new Uint8Array(n); NAV.par = new Int32Array(n); NAV.seen = new Int32Array(n); NAV.q = new Int32Array(n); NAV.stamp = 0; }
    NAV.cols = cols; NAV.rows = rows;
    const boxes = new Set(doors.map(d => d.box)); NAV.solids = sol.filter(s => !boxes.has(s));
    NAV.bucketCols = Math.max(1, Math.ceil(WW / NAV.bucketSize)); NAV.bucketRows = Math.max(1, Math.ceil(WH / NAV.bucketSize));
    NAV.solidBuckets = new Array(NAV.bucketCols * NAV.bucketRows);
    for (const solid of NAV.solids) {
      const x0 = Math.max(0, Math.min(NAV.bucketCols - 1, Math.floor(solid[0] / NAV.bucketSize))), x1 = Math.max(0, Math.min(NAV.bucketCols - 1, Math.floor((solid[0] + solid[2]) / NAV.bucketSize)));
      const y0 = Math.max(0, Math.min(NAV.bucketRows - 1, Math.floor(solid[1] / NAV.bucketSize))), y1 = Math.max(0, Math.min(NAV.bucketRows - 1, Math.floor((solid[1] + solid[3]) / NAV.bucketSize)));
      for (let by = y0; by <= y1; by++) for (let bx = x0; bx <= x1; bx++) { const idx = by * NAV.bucketCols + bx; (NAV.solidBuckets[idx] || (NAV.solidBuckets[idx] = [])).push(solid); }
    }
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) NAV.ok[j * cols + i] = circleHits(NAV.solids, i * cs + cs / 2, j * cs + cs / 2, CLR) ? 0 : 1;
    if (!NAV.neighbors || NAV.neighbors.length !== n * 8) {
      NAV.neighbors = n <= 65536 ? new Uint16Array(n * 8) : new Uint32Array(n * 8);
      NAV.neighborCounts = new Uint8Array(n);
    }
    const neighbors = NAV.neighbors, neighborCounts = NAV.neighborCounts;
    for (let c = 0; c < n; c++) {
      const base = c * 8, ci = c % cols, cj = (c / cols) | 0;
      let count = 0;
      if (NAV.ok[c]) for (let k = 0; k < 8; k++) {
        const di = DI[k], dj = DJ[k], i = ci + di, j = cj + dj;
        if (i < 0 || j < 0 || i >= cols || j >= rows) continue;
        const next = j * cols + i;
        if (!NAV.ok[next]) continue;
        if (di && dj && (!NAV.ok[cj * cols + i] || !NAV.ok[j * cols + ci])) continue;
        neighbors[base + count++] = next;
      }
      neighborCounts[c] = count;
    }
    NAV.built = true;
  };
  function cellOf(x, y) { return Math.max(0, Math.min(NAV.rows - 1, (y / NAV.cs) | 0)) * NAV.cols + Math.max(0, Math.min(NAV.cols - 1, (x / NAV.cs) | 0)); }
  function nearestOk(idx) {
    if (NAV.ok[idx]) return idx;
    const cols = NAV.cols, ci = idx % cols, cj = (idx / cols) | 0;
    for (let d = 1; d <= 5; d++) for (let dj = -d; dj <= d; dj++) for (let di = -d; di <= d; di++) {
      if (Math.max(Math.abs(di), Math.abs(dj)) !== d) continue;
      const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= cols || j >= NAV.rows) continue;
      if (NAV.ok[j * cols + i]) return j * cols + i;
    }
    return -1;
  }
  EXP.navPath = function (sx, sy, gx, gy, reusePath, pointPool) {
    if (!NAV.built) return null;
    const s = nearestOk(cellOf(sx, sy)), g = nearestOk(cellOf(gx, gy)); if (s < 0 || g < 0) return null;
    const stamp = ++NAV.stamp, cols = NAV.cols, seen = NAV.seen, par = NAV.par, q = NAV.q;
    const neighbors = NAV.neighbors, neighborCounts = NAV.neighborCounts;
    let h = 0, t = 0, found = s === g; q[t++] = s; seen[s] = stamp; par[s] = -1;
    while (h < t && !found) {
      const c = q[h++], base = c * 8, count = neighborCounts[c];
      for (let k = 0; k < count; k++) {
        const n = neighbors[base + k]; if (seen[n] === stamp) continue;
        seen[n] = stamp; par[n] = c; q[t++] = n; if (n === g) { found = true; break; }
      }
    }
    if (!found) return null;
    const path = reusePath || [], pool = pointPool || path; let pathLen = 0;
    for (let c = g; c !== -1; c = par[c]) {
      const p = pool[pathLen] || (pool[pathLen] = { x: 0, y: 0 });
      p.x = (c % cols) * NAV.cs + NAV.cs / 2; p.y = ((c / cols) | 0) * NAV.cs + NAV.cs / 2; path[pathLen] = p; pathLen++;
    }
    path.length = pathLen; path.reverse(); return path;
  };
  // raio livre de sólidos com o tamanho do próprio inimigo (portas contam como livres: os inimigos as abrem)
  function clearRay(x1, y1, x2, y2, r) {
    const rr = r || 13, d = hyp(x2 - x1, y2 - y1), n = Math.max(1, Math.ceil(d / 8));
    for (let i = 1; i < n; i++) if (circleHits(NAV.solids, x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, rr)) return false;
    return true;
  }
  function okAt(x, y) { return NAV.built && !!NAV.ok[cellOf(x, y)]; }
  // devolve o ponto intermediário a perseguir (puxa o caminho até o nó mais distante visível)
  function navTarget(e, gx, gy, dt) {
    e.pathT = (e.pathT || 0) - dt; const gk = ((gx / 32) | 0) * 4096 + ((gy / 32) | 0);
    if (!e.path || e.pathT <= 0 || e.pathK !== gk) {
      e.pathPoints = e.pathPoints || (e.path ? e.path.slice() : []);
      e.path = EXP.navPath(e.x, e.y, gx, gy, e.path, e.pathPoints); e.pathT = .9 + Math.random() * .4; e.pathK = gk; e.pk = 0; e.smT = 0; e.pi = 0;
      // começa no nó do caminho mais próximo do inimigo (não no início, que pode estar atrás dele)
      if (e.path) { let bi = 0, bd = 1e9; for (let i = 0; i < e.path.length; i++) { const dd = hyp(e.path[i].x - e.x, e.path[i].y - e.y); if (dd < bd) { bd = dd; bi = i; } } e.pi = bi; }
    }
    const p = e.path; if (!p || !p.length) return null;
    while (e.pi < p.length - 1 && hyp(p[e.pi].x - e.x, p[e.pi].y - e.y) < 26) e.pi++;
    e.smT -= dt; if (e.smT <= 0 || e.pk < e.pi) {
      e.smT = .15; let k = e.pi; for (let j = Math.min(p.length - 1, e.pi + 7); j > e.pi; j--) if (clearRay(e.x, e.y, p[j].x, p[j].y)) { k = j; break; } e.pk = k;
    }
    const out = e.navTmp || (e.navTmp = { x: 0, y: 0 });
    if (e.pk >= p.length - 1) { out.x = gx; out.y = gy; } else { out.x = p[e.pk].x; out.y = p[e.pk].y; }
    return out;
  }
  EXP.navTarget = navTarget;

  // Direção de perseguição. Linha livre (com o tamanho real do inimigo) → vai reto; senão, segue o caminho.
  // chase=true: inimigo ainda longe pega um dos dois flancos do jogador (pinça), em vez de formar fila atrás.
  // Se fica preso sem avançar, replaneja e dá um passo lateral por um instante.
  EXP.steer = function (e, gx, gy, dt, chase) {
    const out = e.steerOut || (e.steerOut = { x: 0, y: 0 });
    let tx = gx, ty = gy;
    if (chase && hyp(e.x - gx, e.y - gy) > 140) {
      // o ponto de flanco é reavaliado só de tempos em tempos: se mudasse a cada quadro, o caminho seria refeito a cada quadro
      e.flT = (e.flT || 0) - dt;
      if (e.flT <= 0 || e.flOk === undefined) {
        e.flT = .6; e.flOk = false;
        const ap = Math.atan2(e.y - gy, e.x - gx) + ((e.id || 0) % 2 ? 1 : -1) * 1.0;
        const fx = gx + Math.cos(ap) * 110, fy = gy + Math.sin(ap) * 110;
        if (okAt(fx, fy)) { e.flOk = true; e.flX = fx; e.flY = fy; }
      }
      if (e.flOk) { tx = e.flX; ty = e.flY; }
    } else e.flOk = undefined;
    e.stT = (e.stT || 0) - dt;
    if (e.stT <= 0) { e.stT = .12; e.direct = clearRay(e.x, e.y, tx, ty, 13); }
    e.spT = (e.spT || 0) - dt;
    if (e.spT <= 0) {
      e.spT = .7;
      if (e.spX !== undefined && (!e.vis || hyp(e.x - gx, e.y - gy) > 230) && hyp(e.x - e.spX, e.y - e.spY) < 8 && hyp(tx - e.x, ty - e.y) > 40) {
        e.path = null; e.pathK = -1; e.dodgeT = .4; e.dodgeA = e.a + (Math.random() < .5 ? 1 : -1) * (1.2 + Math.random() * .6);
      }
      e.spX = e.x; e.spY = e.y;
    }
    if (e.dodgeT > 0) { e.dodgeT -= dt; out.x = e.x + Math.cos(e.dodgeA) * 40; out.y = e.y + Math.sin(e.dodgeA) * 40; return out; }
    if (e.direct) { out.x = tx; out.y = ty; return out; }
    const t = navTarget(e, tx, ty, dt);
    if (t) { out.x = t.x; out.y = t.y; } else { out.x = tx; out.y = ty; }
    return out;
  };

  EXP.mind = function (e) {
    if (e.ko > 0 || e.stun > 0) return 'down';
    const s = e.state;
    if (s === 'PATROL') return 'patrol';
    if (s === 'CHASE' || s === 'ALERT') return 'chase';
    if (s === 'INVESTIGATE' || s === 'SEARCH' || s === 'SUSPICIOUS') return 'investigate';
    return 'idle';
  };

  // abre a porta que está na frente do inimigo (o jogo só deixava o jogador abrir portas)
  function enemyOpenDoor(e) {
    for (let i = 0; i < doors.length; i++) {
      const d = doors[i]; if (d.open || d.swing) continue;
      const cx = d.x + d.w / 2, cy = d.y + d.h / 2; if (Math.abs(cx - e.x) > 32 || Math.abs(cy - e.y) > 32) continue;
      let ax = cx - e.x, ay = cy - e.y; const L = hyp(ax, ay) || 1; ax /= L; ay /= L;
      d.swing = true; d.fast = false; d.target = d.vert ? -(ax >= 0 ? 1 : -1) * Math.PI / 2 : (ay >= 0 ? 1 : -1) * Math.PI / 2; return;
    }
  }
  function patrol(e, dt) {
    const w = e.route[e.wp || 0];
    if (e.wait > 0) { e.wait -= dt; return; }
    const t = navTarget(e, w.x, w.y, dt) || w;
    e.a = Math.atan2(t.y - e.y, t.x - e.x); move(e, Math.cos(e.a) * 52 * dt, Math.sin(e.a) * 52 * dt);
    if (hyp(w.x - e.x, w.y - e.y) < 20) { e.wp = ((e.wp || 0) + 1) % e.route.length; e.wait = .6; e.path = null; }
  }
  // chamado uma vez por quadro (por EXP.worldTick), antes do laço de IA do jogo
  EXP.aiExtTick = function (dt) {
    if (!NAV.built) return;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.ko > 0 || e.stun > 0) { e.mind = 'down'; continue; }
      const s = e.state;
      if (doors.length && !historia && s !== 'IDLE' && s !== 'SUSPICIOUS') enemyOpenDoor(e);
      if (e.route && e.route.length && (s === 'IDLE' || s === 'PATROL')) { if (s === 'IDLE') e.state = 'PATROL'; e.goal = null; patrol(e, dt); }
      else if (s === 'PATROL') e.state = 'IDLE';
      if (s === 'INVESTIGATE' || s === 'SEARCH') {
        if (e.lkp && e.lkp !== e.navPt) e.goal = { x: e.lkp.x, y: e.lkp.y };          // alvo novo (ruído, última posição vista)
        e.invT = (e.invT || 0) + dt;
        if (e.invT > 14) { e.goal = null; e.lkp = null; e.heard = null; e.invT = 0; e.state = 'IDLE'; continue; }
        if (e.goal) {
          const n = navTarget(e, e.goal.x, e.goal.y, dt);
          if (n) { const np = e.navPt || (e.navPt = { x: 0, y: 0 }); np.x = n.x; np.y = n.y; e.lkp = np; }
        }
      } else if (s !== 'SUSPICIOUS') { e.goal = null; e.invT = 0; }
      e.mind = EXP.mind(e);
    }
  };
  // tiro do jogador: 450 px de raio, sem depender de paredes (máscaras silenciosas reduzem o raio)
  EXP.gunshotAlert = function (x, y) {
    const R = 450 * ((typeof S !== 'undefined' && S.quiet) || 1);
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.ko > 0 || e.stun > 0 || e.state === 'CHASE' || e.state === 'ALERT') continue;
      if (hyp(e.x - x, e.y - y) > R) continue;
      e.heard = { x, y }; e.lkp = { x, y }; e.goal = { x, y }; e.invT = 0; e.path = null;
      setEnemyState(e, 'INVESTIGATE', 4);
    }
  };
  const _emit = emitNoise;
  emitNoise = function (x, y, r, kind) { if (kind === 'gunshot') EXP.gunshotAlert(x, y); _emit(x, y, r, kind); };
})();
