/* Cappe in Miami - Expansão | CONTEÚDO
   Máscaras (total 30), armas (total 23), chefes e regras de desbloqueio.
   Toda a arte é gerada por código (original), então não há arquivos novos para carregar. */
(function () {
  'use strict';
  const EXP = window.EXP;

  // ================= RARIDADES =================
  const RAR = {
    comum:    { nome: 'Comum',    c: '#9aa0b0' },
    incomum:  { nome: 'Incomum',  c: '#3cd66c' },
    raro:     { nome: 'Raro',     c: '#19a0ff' },
    epico:    { nome: 'Épico',    c: '#b06bff' },
    lendario: { nome: 'Lendário', c: '#ffd23f' },
  };
  EXP.RAR = RAR;

  // ================= REGRAS DE DESBLOQUEIO =================
  // { lv: n } nível do jogador | { ach: id } conquista | { hard: true } história no Hardcore (regra antiga)
  function unlockInfo(u) {
    const sv = EXP.save();
    if (!u) return { ok: true, txt: 'Disponível desde o início' };
    if (u.lv) return { ok: sv.level >= u.lv, txt: 'Alcance o nível ' + u.lv };
    if (u.ach) { const a = EXP.ACH.find(x => x.id === u.ach); return { ok: !!sv.ach[u.ach], txt: 'Conquista: ' + (a ? a.nome + ' — ' + a.desc : u.ach) }; }
    if (u.hard) return { ok: !!sv.flags.hardcoreWon || (typeof unlocked === 'function' && unlocked()), txt: 'Complete a História no Hardcore' };
    return { ok: true, txt: '' };
  }
  EXP.unlockInfo = unlockInfo;

  // ================= MÁSCARAS =================
  function makeMaskArt(sp) {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, 128); bg.addColorStop(0, '#1a0840'); bg.addColorStop(1, '#07020f');
    g.fillStyle = bg; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = sp.b + '55'; g.lineWidth = 1;   // grade neon ao fundo
    for (let i = 0; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); }
    const ear = (x, flip, kind) => {
      g.save(); g.translate(x, 34); g.scale(flip, 1); g.fillStyle = sp.a; g.strokeStyle = sp.b; g.lineWidth = 3;
      g.beginPath();
      if (kind === 'pointed') { g.moveTo(-6, 12); g.lineTo(-20, -22); g.lineTo(14, 2); }
      else if (kind === 'round') { g.arc(-6, 0, 15, 0, 6.3); }
      else if (kind === 'horn') { g.moveTo(-4, 14); g.quadraticCurveTo(-28, -8, -14, -30); g.quadraticCurveTo(-12, -6, 8, 6); }
      else if (kind === 'wing') { g.moveTo(-2, 14); g.lineTo(-30, -6); g.lineTo(-20, 4); g.lineTo(-26, 12); g.lineTo(-10, 8); g.lineTo(-14, 16); }
      else if (kind === 'flame') { g.moveTo(-4, 14); g.quadraticCurveTo(-26, -4, -10, -30); g.quadraticCurveTo(-8, -12, 6, -10); g.quadraticCurveTo(0, 0, 8, 8); }
      else { g.closePath(); }
      g.fill(); g.stroke(); g.restore();
    };
    if (sp.ears && sp.ears !== 'none') { ear(36, 1, sp.ears); ear(92, -1, sp.ears); }
    const fg = g.createRadialGradient(54, 56, 6, 64, 70, 54); fg.addColorStop(0, sp.a); fg.addColorStop(1, sp.d || '#101018');
    g.fillStyle = fg; g.strokeStyle = sp.b; g.lineWidth = 4; g.shadowColor = sp.b; g.shadowBlur = 14;
    g.beginPath(); g.ellipse(64, 70, sp.w || 38, sp.h || 42, 0, 0, 6.3); g.fill(); g.stroke(); g.shadowBlur = 0;
    g.strokeStyle = sp.b; g.fillStyle = sp.b;
    if (sp.marks === 'stripes') { g.lineWidth = 4; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(64 + i * 11, 30); g.lineTo(64 + i * 8, 52); g.stroke(); } }
    if (sp.marks === 'dots') for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(40 + (i * 37) % 48, 48 + (i * 23) % 46, 2.6, 0, 6.3); g.fill(); }
    if (sp.marks === 'scales') { g.lineWidth = 1.6; for (let y = 38; y < 108; y += 10) for (let x = 34 + (y % 20 ? 5 : 0); x < 96; x += 10) { g.beginPath(); g.arc(x, y, 5, 0, 3.14); g.stroke(); } }
    if (sp.marks === 'cracks') { g.lineWidth = 2.4; g.beginPath(); g.moveTo(64, 30); g.lineTo(58, 48); g.lineTo(68, 60); g.lineTo(60, 80); g.moveTo(88, 52); g.lineTo(78, 62); g.stroke(); }
    if (sp.marks === 'web') { g.lineWidth = 1.4; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; g.beginPath(); g.moveTo(64, 70); g.lineTo(64 + Math.cos(a) * 40, 70 + Math.sin(a) * 42); g.stroke(); } for (let r = 12; r < 40; r += 11) { g.beginPath(); g.arc(64, 70, r, 0, 6.3); g.stroke(); } }
    if (sp.marks === 'bands') { g.lineWidth = 7; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(30, 54 + i * 17); g.lineTo(98, 54 + i * 17); g.stroke(); } }
    // olhos
    g.shadowColor = sp.e; g.shadowBlur = 16; g.fillStyle = sp.e;
    const ey = sp.ey || 62;
    if (sp.eyes === 'slit') { for (const s of [-1, 1]) { g.beginPath(); g.ellipse(64 + s * 17, ey, 9, 4.5, s * .35, 0, 6.3); g.fill(); } }
    else if (sp.eyes === 'visor') { g.fillRect(36, ey - 7, 56, 11); }
    else if (sp.eyes === 'angry') { for (const s of [-1, 1]) { g.beginPath(); g.moveTo(64 + s * 6, ey - 8); g.lineTo(64 + s * 26, ey - 2); g.lineTo(64 + s * 20, ey + 8); g.lineTo(64 + s * 6, ey + 4); g.fill(); } }
    else if (sp.eyes === 'hollow') { for (const s of [-1, 1]) { g.fillStyle = '#000'; g.beginPath(); g.ellipse(64 + s * 17, ey, 8, 11, 0, 0, 6.3); g.fill(); g.fillStyle = sp.e; g.beginPath(); g.arc(64 + s * 17, ey, 3, 0, 6.3); g.fill(); } }
    else { for (const s of [-1, 1]) { g.beginPath(); g.arc(64 + s * 17, ey, 7, 0, 6.3); g.fill(); } }
    g.shadowBlur = 0;
    // focinho / boca
    g.lineWidth = 3; g.strokeStyle = sp.b; g.fillStyle = sp.n || sp.b;
    if (sp.mouth === 'beak') { g.fillStyle = '#ffb02e'; g.beginPath(); g.moveTo(54, 78); g.lineTo(74, 78); g.lineTo(64, 100); g.fill(); g.stroke(); }
    else if (sp.mouth === 'fangs') { g.beginPath(); g.moveTo(40, 92); g.lineTo(88, 92); g.stroke(); g.fillStyle = '#fff'; for (const x of [48, 60, 68, 80]) { g.beginPath(); g.moveTo(x, 92); g.lineTo(x + 4, 92); g.lineTo(x + 2, 102); g.fill(); } }
    else if (sp.mouth === 'snout') { g.fillStyle = sp.n || '#111'; g.beginPath(); g.ellipse(64, 86, 16, 11, 0, 0, 6.3); g.fill(); g.stroke(); g.fillStyle = sp.b; g.beginPath(); g.arc(64, 82, 4, 0, 6.3); g.fill(); }
    else if (sp.mouth === 'grin') { g.beginPath(); g.arc(64, 84, 22, .15, 3.0); g.stroke(); }
    else { g.beginPath(); g.moveTo(52, 94); g.lineTo(76, 94); g.stroke(); }
    c.complete = true; c.naturalWidth = 128;   // o canvas faz o papel de imagem pronta (sem PNG na abertura)
    return c;
  }

  // fx novos reconhecidos pela expansão: quiet (ruído), spreadMul (dispersão), reach (alcance do tiro), reload (tempo de recarga), xp
  const NEW_MASKS = [
    { id: 'raposa',   nome: 'Raposa',    rar: 'comum',    unl: { lv: 2 },  desc: 'Astúcia: seus tiros fazem 40% menos barulho e os inimigos te notam de mais perto.', fx: { quiet: .6, sight: 430 }, art: { a: '#c4571a', b: '#ffb36b', e: '#fff3a0', ears: 'pointed', eyes: 'slit', marks: 'none', mouth: 'snout' } },
    { id: 'urso',     nome: 'Urso',      rar: 'comum',    unl: { lv: 4 },  desc: 'Muralha: +1 colete por sala, golpes mais rápidos, mas anda 7% mais devagar.', fx: { shield: 1, meleeCd: .8, speed: .93 }, art: { a: '#6b4a2f', b: '#d9a066', e: '#ffd23f', ears: 'round', eyes: 'round', marks: 'none', mouth: 'snout', w: 42 } },
    { id: 'cobra',    nome: 'Cobra',     rar: 'incomum',  unl: { lv: 6 },  desc: 'Precisão: tiros 50% mais certeiros e 10% mais rápidos.', fx: { spreadMul: .5, fire: 1.1 }, art: { a: '#1f7a3d', b: '#7dff9b', e: '#ffe14a', ears: 'none', eyes: 'slit', marks: 'scales', mouth: 'fangs', w: 34 } },
    { id: 'aguia',    nome: 'Águia',     rar: 'incomum',  unl: { lv: 8 },  desc: 'Visão: tiros 20% mais rápidos, espingardas alcançam 50% mais longe e a mira é 40% mais precisa.', fx: { reach: 1.5, spreadMul: .6 }, art: { a: '#f2efe6', b: '#3a2a14', e: '#ffcc2e', ears: 'none', eyes: 'angry', marks: 'none', mouth: 'beak' } },
    { id: 'morcego',  nome: 'Morcego',   rar: 'incomum',  unl: { ach: 'k100' }, desc: 'Noturno: quase invisível de longe, ruído menor e 5% mais veloz.', fx: { sight: 300, quiet: .7, speed: 1.05 }, art: { a: '#2a1f3d', b: '#b06bff', e: '#ff4d6d', ears: 'wing', eyes: 'slit', marks: 'none', mouth: 'fangs' } },
    { id: 'tubarao',  nome: 'Tubarão',   rar: 'raro',     unl: { ach: 'k500' }, desc: 'Predador: cada abate devolve 2 de munição e vale 20% mais pontos.', fx: { refund: 2, score: 1.2 }, art: { a: '#4b7a96', b: '#bfefff', e: '#0a0a0a', ears: 'none', eyes: 'hollow', marks: 'none', mouth: 'fangs', w: 36 } },
    { id: 'panda',    nome: 'Panda',     rar: 'raro',     unl: { lv: 12 }, desc: 'Tanque: +2 coletes por sala, porém 10% mais lento.', fx: { shield: 2, speed: .9 }, art: { a: '#f4f4f4', b: '#222', e: '#111', ears: 'round', eyes: 'hollow', marks: 'none', mouth: 'snout', w: 41 } },
    { id: 'corvo',    nome: 'Corvo',     rar: 'raro',     unl: { ach: 'combo10' }, desc: 'Sombra: pulo veloz com Shift e 20% menos ruído.', fx: { dash: true, quiet: .8 }, art: { a: '#15151f', b: '#6c7bff', e: '#9ad1ff', ears: 'none', eyes: 'angry', marks: 'none', mouth: 'beak' } },
    { id: 'jacare',   nome: 'Jacaré',    rar: 'raro',     unl: { ach: 'chefe1' }, desc: 'Mandíbula: soco mata direto, com 40% mais alcance.', fx: { punchKill: true, meleeR: 1.4, speed: .96 }, art: { a: '#3d6b2a', b: '#b6ff6b', e: '#ffe14a', ears: 'none', eyes: 'slit', marks: 'scales', mouth: 'fangs', w: 40, h: 36 } },
    { id: 'camaleao', nome: 'Camaleão',  rar: 'epico',    unl: { ach: 'fantasma' }, desc: 'Camuflagem: os inimigos só te veem a poucos passos.', fx: { sight: 240, speed: .96 }, art: { a: '#2fae8c', b: '#f4ff6b', e: '#ff6bd5', ears: 'none', eyes: 'round', marks: 'dots', mouth: 'grin' } },
    { id: 'escorpiao',nome: 'Escorpião', rar: 'epico',    unl: { ach: 'rank_s' }, desc: 'Ferrão: balas atravessam 1 inimigo e a cadência sobe 20%.', fx: { pierce: 1, fire: 1.2 }, art: { a: '#8a2a12', b: '#ff9a3c', e: '#ffe14a', ears: 'horn', eyes: 'angry', marks: 'bands', mouth: 'fangs' } },
    { id: 'touro',    nome: 'Touro',     rar: 'epico',    unl: { ach: 'horda10' }, desc: 'Investida: soco mata direto, +1 colete e 5% mais veloz.', fx: { punchKill: true, shield: 1, speed: 1.05 }, art: { a: '#7a1f2b', b: '#ff6b6b', e: '#fff', ears: 'horn', eyes: 'angry', marks: 'none', mouth: 'snout', w: 41 } },
    { id: 'aranha',   nome: 'Aranha',    rar: 'epico',    unl: { ach: 'surv' }, desc: 'Teia: pulo veloz, combo dura 1 s a mais e mira 20% melhor.', fx: { dash: true, comboT: 1, spreadMul: .8 }, art: { a: '#1d1d2e', b: '#e04bff', e: '#ff3355', ears: 'none', eyes: 'hollow', marks: 'web', mouth: 'fangs' } },
    { id: 'fenix',    nome: 'Fênix',     rar: 'lendario', unl: { ach: 'horda20' }, desc: 'Renascimento: ressuscita 1 vez, +20% de pontos e 5% mais veloz.', fx: { revive: true, score: 1.2, speed: 1.05 }, art: { a: '#ff6a1a', b: '#ffe14a', e: '#fff', ears: 'flame', eyes: 'angry', marks: 'stripes', mouth: 'beak' } },
    { id: 'dragao',   nome: 'Dragão',    rar: 'lendario', unl: { ach: 'rank_ss' }, desc: 'Fogo: atira 40% mais rápido, balas atravessam 1 inimigo e +40% de pontos.', fx: { fire: 1.4, pierce: 1, score: 1.4 }, art: { a: '#7a0f3a', b: '#ff2e93', e: '#ffd23f', ears: 'horn', eyes: 'slit', marks: 'scales', mouth: 'fangs', w: 40 } },
    { id: 'fantasma', nome: 'Fantasma',  rar: 'lendario', unl: { lv: 30 }, desc: 'Espectro: quase indetectável, silencioso e inimigos 15% mais lentos.', fx: { sight: 200, quiet: .5, foe: .85, xp: 1.25 }, art: { a: '#dfe9ff', b: '#19f0e6', e: '#0b0b18', ears: 'none', eyes: 'hollow', marks: 'cracks', mouth: 'grin', h: 44 } },
  ];

  // raridade das máscaras originais (nenhuma foi alterada)
  const OLD_RAR = { galo: 'comum', coruja: 'comum', tigre: 'incomum', porco: 'comum', cavalo: 'comum', coelho: 'incomum', lobo: 'incomum', leao: 'raro', elefante: 'raro', macaco: 'incomum', unicornio: 'epico', sapo: 'comum', capacete: 'lendario', barbudo: 'lendario' };
  const OLD_COMBO = { capacete: { hard: true }, barbudo: { hard: true } };
  MASKS.forEach(m => { m.rar = OLD_RAR[m.id] || 'comum'; m.unl = OLD_COMBO[m.id] || null; });
  const OLD_N = MASKS.length;
  for (const d of NEW_MASKS) {
    const m = { id: d.id, nome: d.nome, desc: d.desc, fx: d.fx, rar: d.rar, unl: d.unl, exp: true };
    m.img = makeMaskArt(d.art); MASKS.push(m);
  }
  EXP.OLD_MASKS = OLD_N;
  EXP.maskLocked = i => { const m = MASKS[i]; if (!m) return true; if (i < OLD_N) return !!(m.lock && !unlockInfo(m.unl).ok); return !unlockInfo(m.unl).ok; };
  // Combinações de habilidades: pares de máscaras que se destacam em estilos complementares (exibido na coleção)
  EXP.maskTags = m => { const f = m.fx, t = []; if (f.speed > 1.04) t.push('veloz'); if (f.shield) t.push('resistente'); if (f.sight && f.sight < 400 || f.quiet) t.push('furtivo'); if (f.meleeR || f.punchKill) t.push('corpo a corpo'); if (f.fire > 1.05 || f.spreadMul || f.reach) t.push('atirador'); if (f.revive) t.push('renasce'); return t; };

  // ================= ARMAS =================
  const W = (o) => Object.assign({ gun: true, cd: .3, spd: 720, spread: .03, pel: 1, noise: 340, shake: 3, throwSpeed: 520, throwLife: .44, throwStun: 1.3, rar: 'comum' }, o);
  const NEW_WP = {
    // pistolas / revólveres
    lanca: W({ nome: 'Lança-chamas', cat: 'Pesada', cd: .035, spd: 420, spread: .5, pel: 2, life: .2, noise: 230, shake: 1.2, start: () => 90, lv: 8, rar: 'raro', sfx: 'smg' }),
    pistola_aut: W({ nome: 'Pistola Automática', cat: 'Pistola', cd: .13, spread: .09, noise: 330, shake: 2.4, start: () => 30, mag: 15, reload: 1.1, lv: 5, rar: 'incomum', sfx: 'pistol' }),
    magnum:      W({ nome: 'Magnum .44', cat: 'Revólver', cd: .62, spd: 860, spread: .01, noise: 470, shake: 9, start: () => 6, mag: 6, reload: 1.7, pierce: 1, rk: 1.8, lv: 3, rar: 'raro', sfx: 'magnum', throwStun: 1.5 }),
    // espingardas
    pump:        W({ nome: 'Pump-Action', cat: 'Espingarda', cd: .6, spd: 640, spread: .36, pel: 6, life: .36, noise: 430, shake: 8, start: () => 10, mag: 6, reload: 2.1, lv: 9, rar: 'raro', sfx: 'shotgun', throwStun: 1.7 }),
    dupla:       W({ nome: 'Escopeta Dupla', cat: 'Espingarda', cd: 1.05, spd: 620, spread: .62, pel: 9, life: .27, noise: 470, shake: 12, start: () => 8, mag: 2, reload: 1.5, rk: 2, lv: 7, rar: 'incomum', sfx: 'shotgun', throwStun: 1.8 }),
    // rifles
    carabina:    W({ nome: 'Carabina', cat: 'Rifle', cd: .2, spd: 880, spread: .035, noise: 400, shake: 4, start: () => 24, mag: 20, reload: 1.6, lv: 11, rar: 'raro', sfx: 'rifle' }),
    sniper:      W({ nome: 'Sniper', cat: 'Rifle', cd: 1.1, spd: 1500, spread: 0, noise: 560, shake: 10, start: () => 8, mag: 4, reload: 2.2, pierce: 2, rk: 2.2, lv: 14, rar: 'epico', sfx: 'sniper', throwStun: 1.7 }),
    // arma pesada
    lmg:         W({ nome: 'Metralhadora Leve', cat: 'Pesada', cd: .075, spd: 760, spread: .17, noise: 450, shake: 3.4, start: () => 60, mag: 60, reload: 3.2, rk: 1.3, lv: 17, rar: 'epico', sfx: 'lmg', throwSpeed: 380, throwStun: 1.9 }),
    // armas brancas
    katana:      { nome: 'Katana', cat: 'Branca', melee: true, range: 82, arc: 1.05, cd: .2, lethal: true, stun: .5, force: 30, throwSpeed: 700, throwLife: .55, throwStun: .8, lv: 6, rar: 'raro' },
    machado:     { nome: 'Machado', cat: 'Branca', melee: true, range: 64, arc: 1.9, cd: .62, lethal: true, stun: 1.2, force: 150, throwSpeed: 480, throwLife: .5, throwStun: 1.9, lv: 10, rar: 'incomum' },
    // improvisadas
    garrafa:     { nome: 'Garrafa', cat: 'Improvisada', melee: true, range: 42, arc: 1.0, cd: .25, lethal: true, stun: .6, force: 40, throwSpeed: 640, throwLife: .5, throwStun: 1.4, dur: 3, lv: 1, rar: 'comum' },
    extintor:    { nome: 'Extintor', cat: 'Improvisada', melee: true, range: 52, arc: 1.3, cd: .55, lethal: false, stun: 2.2, force: 140, throwSpeed: 420, throwLife: .42, throwStun: 2.8, lv: 4, rar: 'incomum' },
  };
  // categorias/raridade das armas originais (comportamento intacto)
  const OLD_CAT = { punho: 'Branca', taco: 'Branca', faca: 'Branca', cano: 'Improvisada', martelo: 'Improvisada', pe_de_cabra: 'Improvisada', pistola: 'Pistola', escopeta: 'Espingarda', smg: 'Submetralhadora', revolver: 'Revólver', rifle: 'Rifle', uzi: 'Submetralhadora' };
  for (const k of Object.keys(WP)) { WP[k].cat = OLD_CAT[k] || 'Outra'; WP[k].rar = WP[k].rar || 'comum'; WP[k].lv = 0; WP[k].old = true; WP[k].sfx = WP[k].sfx || (k === 'escopeta' ? 'shotgun' : k === 'smg' || k === 'uzi' ? 'smg' : k === 'rifle' ? 'rifle' : k === 'revolver' ? 'magnum' : 'pistol'); }
  Object.assign(WP, NEW_WP);
  EXP.newWeapons = Object.keys(NEW_WP);
  EXP.weaponUnlocked = id => !WP[id].lv || EXP.save().level >= WP[id].lv;
  EXP.reloadAll = false;                                  // modificador "recarga para todas as armas"
  const OLD_MAG = { pistola: [12, 1.1], smg: [30, 1.5], uzi: [28, 1.4], revolver: [6, 1.6], rifle: [10, 1.8], escopeta: [6, 2.0] };
  EXP.magOf = (id) => { const w = WP[id]; if (w.mag) return [w.mag, w.reload]; if (EXP.reloadAll && OLD_MAG[id]) return OLD_MAG[id]; return null; };
  EXP.AMMO_NEW = { lanca: 60, pistola_aut: 30, magnum: 12, pump: 12, dupla: 8, carabina: 20, sniper: 8, lmg: 60 };

  // ícones das armas novas (mesmo sistema de desenho do jogo: origem na empunhadura, eixo +x)
  const _wicon = wicon;
  wicon = function (g, w) {
    const draw = () => { switch (w) {
      case 'pistola_aut': g.fillStyle = '#2b2b33'; g.fillRect(4, -3, 22, 6); g.fillStyle = '#19f0e6'; g.fillRect(20, -1, 6, 2); g.fillStyle = '#555'; g.fillRect(8, 2, 5, 8); return;
      case 'magnum': g.fillStyle = '#d7dbe6'; g.fillRect(4, -3, 26, 6); g.fillStyle = '#7a4d28'; g.fillRect(2, 2, 7, 9); g.fillStyle = '#999'; g.fillRect(12, -5, 8, 4); return;
      case 'pump': g.fillStyle = '#4a2c14'; g.fillRect(2, -3, 14, 6); g.fillStyle = '#6a6a74'; g.fillRect(14, -2, 30, 4); g.fillStyle = '#3a2410'; g.fillRect(24, -4, 10, 8); return;
      case 'dupla': g.fillStyle = '#4a2c14'; g.fillRect(2, -4, 14, 8); g.fillStyle = '#777'; g.fillRect(14, -4, 26, 3); g.fillRect(14, 1, 26, 3); return;
      case 'carabina': g.fillStyle = '#3a3a44'; g.fillRect(2, -3, 38, 6); g.fillStyle = '#19f0e6'; g.fillRect(30, -5, 4, 2); g.fillStyle = '#222'; g.fillRect(14, 2, 6, 9); return;
      case 'sniper': g.fillStyle = '#2a2f2a'; g.fillRect(2, -3, 56, 5); g.fillStyle = '#111'; g.fillRect(14, -8, 16, 4); g.fillStyle = '#ff2e93'; g.fillRect(28, -7, 2, 2); return;
      case 'lmg': g.fillStyle = '#2a2a30'; g.fillRect(2, -4, 40, 8); g.fillStyle = '#444'; g.fillRect(12, 3, 14, 8); g.fillStyle = '#888'; g.fillRect(38, -2, 12, 4); return;
      case 'katana': g.fillStyle = '#e8f6ff'; g.beginPath(); g.moveTo(10, -2); g.lineTo(52, -1); g.lineTo(54, 1); g.lineTo(10, 2); g.fill(); g.fillStyle = '#ff2e93'; g.fillRect(2, -2, 9, 4); g.fillStyle = '#ffd23f'; g.fillRect(9, -4, 2, 8); return;
      case 'machado': g.fillStyle = '#7a4d28'; g.fillRect(4, -2, 34, 4); g.fillStyle = '#b8c4d0'; g.beginPath(); g.moveTo(30, -3); g.lineTo(44, -12); g.lineTo(44, 12); g.lineTo(30, 3); g.fill(); return;
      case 'garrafa': g.fillStyle = '#2f9e5a'; g.fillRect(6, -3, 16, 6); g.fillRect(22, -1.5, 12, 3); g.fillStyle = '#bff5d2'; g.fillRect(8, -2, 5, 2); return;
      case 'extintor': g.fillStyle = '#d02020'; g.fillRect(4, -5, 26, 10); g.fillStyle = '#222'; g.fillRect(30, -2, 8, 4); g.fillStyle = '#eee'; g.fillRect(12, -5, 3, 10); return;
    }
    _wicon(g, w); };
    g.save(); g.shadowColor = 'rgba(0,0,0,.62)'; g.shadowBlur = 2; g.shadowOffsetX = 1; g.shadowOffsetY = 2;
    draw(); if (EXP.newWeapons.includes(w)) weaponFinish(g, w); g.restore();
  };

  // ================= CHEFES (dados) =================
  // padrões: spread{n,arc,spd,cd} ring{n,spd,cd} aimed{n,gap,spd,cd} charge{cd,tele,spd,dur} summon{n,cd} spiral{n,spd,cd}
  EXP.bosses = [
    { id: 'gerente', nome: 'O Gerente', wave: 5, hp: 7, r: 19, col: '#ffd23f', track: 2,
      bio: 'Dono da lavanderia que lava mais do que roupa. Nunca foi visto sem a prancheta e sempre manda os funcionários primeiro.',
      intro: 'Você está atrasado para a auditoria.', outro: 'Demitido.',
      phases: [{ at: 1, pats: [{ t: 'spread', n: 3, arc: .5, spd: 300, cd: 1.7 }] }, { at: .5, pats: [{ t: 'spread', n: 5, arc: .9, spd: 320, cd: 1.5 }, { t: 'summon', n: 2, cd: 7 }] }] },
    { id: 'tigresa', nome: 'Madame Tigresa', wave: 10, hp: 9, r: 17, col: '#ff8a1f', track: 2,
      bio: 'Dançarina do Club Néon. Quem ouve o salto estalar no chão já está no bote.',
      intro: 'A pista é minha, querido.', outro: 'A cortina fechou.',
      phases: [{ at: 1, pats: [{ t: 'charge', cd: 3.2, tele: .7, spd: 520, dur: .5 }] }, { at: .5, pats: [{ t: 'charge', cd: 2.2, tele: .5, spd: 620, dur: .55 }, { t: 'aimed', n: 3, gap: .12, spd: 360, cd: 2.4 }] }] },
    { id: 'ferro', nome: 'Capitão Ferro', wave: 15, hp: 13, r: 24, col: '#9aa0b0', track: 3,
      bio: 'Ex-sargento blindado dos pés à cabeça. Cada tiro que ele sofre parece só ensinar o próximo.',
      intro: 'Formação, soldados!', outro: 'Dispensado.',
      phases: [{ at: 1, pats: [{ t: 'ring', n: 10, spd: 230, cd: 3 }] }, { at: .55, pats: [{ t: 'ring', n: 14, spd: 250, cd: 2.6 }, { t: 'spread', n: 5, arc: .8, spd: 340, cd: 1.8 }] }] },
    { id: 'neon', nome: 'Doutor Neon', wave: 20, hp: 11, r: 18, col: '#19f0e6', track: 3,
      bio: 'Químico das luzes do bairro. Jura que as cores curam; as vítimas discordam.',
      intro: 'Observe a reação.', outro: 'Experimento encerrado.',
      phases: [{ at: 1, pats: [{ t: 'spiral', n: 2, spd: 240, cd: .22 }, { t: 'summon', n: 2, cd: 9 }] }, { at: .5, pats: [{ t: 'spiral', n: 3, spd: 280, cd: .17 }, { t: 'aimed', n: 2, gap: .15, spd: 380, cd: 2.2 }] }] },
    { id: 'cobrador', nome: 'O Cobrador', wave: 25, hp: 15, r: 20, col: '#ff2e5b', track: 4,
      bio: 'Recebe o que lhe devem — em juros, dentes ou silêncio. Nunca perdeu uma cobrança.',
      intro: 'Sua conta venceu.', outro: 'Quitado.',
      phases: [{ at: 1, pats: [{ t: 'charge', cd: 3, tele: .6, spd: 560, dur: .5 }, { t: 'ring', n: 8, spd: 240, cd: 3.6 }] }, { at: .66, pats: [{ t: 'charge', cd: 2.4, tele: .5, spd: 620, dur: .5 }, { t: 'ring', n: 12, spd: 260, cd: 3 }] }, { at: .33, pats: [{ t: 'spiral', n: 3, spd: 280, cd: .18 }, { t: 'charge', cd: 2, tele: .45, spd: 680, dur: .45 }] }] },
    { id: 'rei', nome: 'Rei da Pista', wave: 30, hp: 22, r: 23, col: '#b06bff', track: 4,
      bio: 'Dono de todas as luzes, de todos os discos e de todas as dívidas. A pista inteira é o trono.',
      intro: 'A noite é minha.', outro: 'Acabou a música.',
      phases: [{ at: 1, pats: [{ t: 'spread', n: 5, arc: .9, spd: 330, cd: 1.6 }, { t: 'summon', n: 3, cd: 8 }] }, { at: .6, pats: [{ t: 'ring', n: 12, spd: 260, cd: 2.4 }, { t: 'charge', cd: 3, tele: .5, spd: 620, dur: .5 }] }, { at: .3, pats: [{ t: 'spiral', n: 4, spd: 300, cd: .15 }, { t: 'aimed', n: 4, gap: .1, spd: 400, cd: 2 }] }] },
  ];
  EXP.bossById = id => EXP.bosses.find(b => b.id === id);

  // ================= PERKS (aplicados em S ao iniciar partida) =================
  EXP.applyPerks = function () {
    const p = EXP.perk;
    S.speed *= 1 + .03 * p('agil');
    S.sight = Math.max(160, S.sight - 20 * p('furtivo')); S.quiet = (S.quiet || 1) * (1 - .04 * p('furtivo'));
    S.ammo += 3 * p('municao');
    S.comboT += .2 * p('folego');
    S.shield += p('pele') >= 3 ? 2 : p('pele') >= 1 ? 1 : 0;
    S.spreadMul = (S.spreadMul || 1) * (1 - .06 * p('pontaria'));
  };

  // aplicar à grade de máscaras: reconstrói os botões incluindo as 30 máscaras
  EXP.rebuildMaskGrid = function () {
    grade.innerHTML = '';
    MASKS.forEach((m, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'm r-' + m.rar;
      b.innerHTML = '<span>' + m.nome + '</span>';
      const pic = m.img && m.img.tagName === 'CANVAS' ? m.img : Object.assign(document.createElement('img'), { src: (m.img && m.img.src) || ('assets/' + m.id + '.png'), alt: '', width: 128, height: 128 });
      b.prepend(pic);
      b.onclick = () => { if (!b.disabled) { sel = i; mark(); } }; b.onmouseenter = b.onfocus = () => preview(i);
      grade.appendChild(b);
    });
  };
  // aviso de máscara: preview mostra raridade, condição e etiquetas
  preview = function (i) {
    const m = MASKS[i], lk = EXP.maskLocked(i), r = RAR[m.rar];
    info.innerHTML = '<b>' + m.nome + ' <small style="color:' + r.c + ';font:600 .7em Orbitron">' + r.nome.toUpperCase() + '</small></b><span>' +
      (lk ? 'BLOQUEADA — ' + unlockInfo(m.unl).txt : m.desc) + '</span><span style="opacity:.7;font-size:.8em">' + EXP.maskTags(m).join(' · ') + '</span>';
  };
  const _refreshLocks = refreshLocks;
  refreshLocks = function () {
    _refreshLocks();
    [...grade.children].forEach((b, i) => { const lk = EXP.maskLocked(i); b.disabled = lk; b.classList.toggle('lock', lk); });
  };
})();
