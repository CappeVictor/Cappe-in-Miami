/* Cappe in Miami - Trilha sonora v29 | escolha de música de fundo
   Gêneros novos, sintetizados com o mesmo motor de áudio (Web Audio API):
   Dub Techno, Industrial Techno, Dark Disco e Cyberpunk Midtempo.
   "Automática" mantém o comportamento original. Chefes sempre tocam a trilha própria.
   A escolha fica salva no navegador (localStorage 'hm_track'). */
(function () {
  'use strict';
  const EXP = window.EXP;
  const KEY = 'hm_track';

  const GENRES = [
    { nome: 'Dub Techno', bpm: 122, bass: [0, 0, -2, 0, 0, -2, -4, -2], lead: [12, 12, 15, 12, 10, 12, 7, 10], pad: [0, -2, -4, -2], drum: 'dub' },
    { nome: 'Industrial Techno', bpm: 138, bass: [0, 0, 0, -1, 0, 0, 3, 0], lead: [12, 12, 13, 12, 12, 11, 12, 10], drum: 'ind' },
    { nome: 'Dark Disco', bpm: 124, bass: [0, 0, 0, 3, 5, 5, 3, 0], lead: [19, 17, 15, 17, 19, 22, 19, 15], arp: [0, 7, 12, 7], drum: 'disco' },
    { nome: 'Cyberpunk Midtempo', bpm: 100, bass: [0, 0, -4, -4, -2, -2, -5, -7], lead: [7, 10, 12, 15, 14, 12, 10, 7], pad: [0, -4, -2, -5], drum: 'mid' },
    { nome: 'Neon Boulevard', bpm: 116, bass: [0, 3, 5, 3, 0, -2, 3, 5], lead: [12, 15, 19, 17, 15, 12, 10, 7], pad: [0, 3, 5, 7], arp: [0, 7, 12, 19] },
    { nome: 'Blood Moon Drive', bpm: 132, bass: [0, 0, -3, 0, 5, 3, 0, -2], lead: [7, 10, 14, 17, 14, 10, 12, 7], pad: [0, -3, 5, 3], arp: [0, 3, 7, 10] },
    { nome: 'Outrun Memories', bpm: 108, bass: [0, 0, 7, 5, 3, 3, 5, 7], lead: [19, 15, 12, 15, 17, 19, 22, 19], pad: [0, 7, 3, 5], arp: [0, 7, 10, 14] },
    { nome: 'Concrete Dreams', bpm: 136, bass: [0, -2, 0, 3, 0, -2, 5, 3], lead: [12, 12, 15, 17, 15, 12, 10, 8], pad: [0, -2, 3, 5], arp: [0, 5, 7, 12] },
    { nome: 'After Hours', bpm: 114, bass: [0, 5, 3, 7, 0, 5, 3, -2], lead: [15, 19, 22, 19, 17, 15, 12, 10], pad: [0, 5, 3, -2], arp: [0, 4, 7, 11] },
    { nome: 'Toxic Skyline', bpm: 144, bass: [0, 0, 3, 0, -2, 0, 5, 3], lead: [24, 19, 22, 17, 19, 15, 17, 12], pad: [0, 3, -2, 5], arp: [0, 7, 12, 15] },
    { nome: 'VHS Sunset', bpm: 102, bass: [0, -2, -4, -2, 0, 3, 5, 3], lead: [10, 12, 15, 19, 17, 15, 12, 10], pad: [0, -2, -4, 3], arp: [0, 3, 7, 12] },
    { nome: 'Noir Pursuit', bpm: 150, bass: [0, 0, 0, 5, 0, 3, -2, 5], lead: [19, 22, 19, 17, 15, 17, 22, 24], pad: [0, 5, 3, -2], arp: [0, 7, 10, 15] },
  ];
  const genreBase = PLAYLIST.length;
  GENRES.forEach(g => PLAYLIST.push(g));
  const GENRE_IDX = GENRES.map((_, i) => genreBase + i);
  const ROOM_IDX = [0, 1, 2, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15];   // mesmas faixas que o jogo sorteia nas salas

  // ---- bateria simples por gênero (somada ao tick original) ----
  function drums(kind, step, t, sp) {
    const kick = (v, dur) => musNote(56, t, dur || 0.14, 'sine', v);
    if (kind === 'dub') {
      if (step % 4 === 0) kick(0.32);
      if (step % 4 === 2) musNote(7600, t, 0.05, 'square', 0.010);
      if (step === 6 || step === 14) for (const iv of [0, 3, 7]) musNote(330 * 2 ** (iv / 12), t, sp * 2, 'triangle', 0.018);
    } else if (kind === 'ind') {
      if (step % 4 === 0) kick(0.34, 0.10);
      if (step === 4 || step === 12) musNote(900, t, 0.08, 'square', 0.05);
      if (step % 8 === 2) musNote(150, t, 0.06, 'sawtooth', 0.035);
    } else if (kind === 'disco') {
      if (step % 4 === 0) kick(0.26);
      if (step % 4 === 2) musNote(8200, t, 0.07, 'square', 0.012);
    } else if (kind === 'mid') {
      if (step === 0 || step === 10) kick(0.30, 0.18);
      if (step === 8) musNote(1500, t, 0.08, 'triangle', 0.06);
    }
  }

  // ---- escolha do jogador: -1 = automática ----
  let pick = -1;
  try { const v = parseInt(localStorage.getItem(KEY), 10); if (!isNaN(v)) pick = v; } catch (e) {}

  const _tick = musTick;   // musTick já foi redefinido em exp-fx.js
  musTick = function () {
    if (pick >= 0 && !EXP.bossTrack) mus.track = pick;
    const tr = PLAYLIST[mus.track] || PLAYLIST[0];
    const t = mus.next, sp = 60 / tr.bpm / 4, step = mus.step % 16;
    _tick();
    if (tr.drum) drums(tr.drum, step, t, sp);
  };

  // ---- seletor na tela de Opções ----
  const grid = document.querySelector('#opcoes .opt-grid');
  if (!grid) return;
  const fs = document.createElement('fieldset');
  fs.innerHTML = '<legend>TRILHA SONORA</legend>' +
    '<label>Música de fundo <select id="o-track"></select></label>' +
    '<small>Escolha uma faixa fixa ou deixe em automática. Chefes sempre tocam a trilha própria.</small>';
  grid.appendChild(fs);
  const sel = fs.querySelector('select');
  const opt = (parent, value, text) => { const o = document.createElement('option'); o.value = String(value); o.textContent = text; parent.appendChild(o); };
  opt(sel, -1, 'Automática (padrão)');
  const gG = document.createElement('optgroup'); gG.label = 'Gêneros eletrônicos';
  GENRE_IDX.forEach(i => opt(gG, i, PLAYLIST[i].nome));
  const gR = document.createElement('optgroup'); gR.label = 'Trilhas do jogo';
  ROOM_IDX.forEach(i => opt(gR, i, PLAYLIST[i].nome));
  sel.appendChild(gG); sel.appendChild(gR);
  if (!Array.from(sel.options).some(o => +o.value === pick)) pick = -1;
  sel.value = String(pick);

  sel.onchange = () => {
    pick = parseInt(sel.value, 10);
    try { localStorage.setItem(KEY, String(pick)); } catch (e) {}
    if (!EXP.bossTrack) { if (pick >= 0) mus.track = pick; else if (EXP.roomTrack) EXP.roomTrack(); }
    if (typeof playSfx === 'function') playSfx('click');
  };
})();
