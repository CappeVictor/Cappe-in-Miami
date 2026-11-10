/* Cappe in Miami - Expansão | INTERFACE
   Seleção de modos, modo personalizado, perfil/coleção/conquistas/recordes, resumo por sala,
   tela de resultado, volume e gerenciamento de dados de salvamento. */
(function () {
  'use strict';
  const EXP = window.EXP, MODES = EXP.MODES, stage = document.querySelector('.stage');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mk = (id, html) => { const s = document.createElement('section'); s.id = id; s.className = 'overlay exp oculto'; s.innerHTML = html; stage.insertBefore(s, document.querySelector('.scan')); return s; };
  const screens = [];
  const open = el => { hideAll(); menu.classList.add('oculto'); el.classList.remove('oculto'); st = 'expui'; };
  const back = () => { hideAll(); toMenu(); };
  function hideAll() { screens.forEach(s => s.classList.add('oculto')); }

  // ---------- menu principal ----------
  const lvlTag = $('lvlTag');   // menu agora montado em index.html
  function refreshTag() { const s = EXP.save(); lvlTag.textContent = 'Nível ' + s.level + ' · ' + s.sp + ' ponto(s) de habilidade · ' + Object.keys(s.ach).length + '/' + EXP.ACH.length + ' conquistas'; }
  refreshTag();
  $('jogar').onclick = () => { EXP.pending = null; if (EXP.MULTI) { EXP.MULTI.enabled = false; EXP.MULTI.P2 = null; EXP.MULTI.players = []; EXP.MULTI.deadFlags = [false, false]; if (EXP.multiCfg) { EXP.multiCfg.multi = false; if (EXP.multi && EXP.multi.save) EXP.multi.save(); } } showMasks(); };
  const _toMenu = toMenu; toMenu = function () { _toMenu(); refreshTag(); };

  // ---------- MODOS ----------
  const sModos = mk('expModos', '<h2>Modos de Jogo</h2><div class="modos" id="modoCards"></div><div class="detalhe" id="modoDet"></div><div class="linha"><button id="modoGo" type="button">Jogar</button><button id="modoBack" type="button" class="sec">Voltar</button></div>');
  screens.push(sModos);
  let curMode = 'horda', curMap = 'rand';
  const list = Object.values(MODES).filter(m => !m.hidden);
  const cards = $('modoCards');
  list.forEach(m => { const b = document.createElement('button'); b.type = 'button'; b.className = 'card'; b.dataset.id = m.id; b.style.setProperty('--c', m.color); b.innerHTML = '<b>' + m.nome + '</b>' + esc(m.desc); b.onclick = () => selMode(m.id); cards.appendChild(b); });
  function selMode(id) {
    curMode = id; const m = MODES[id], rec = EXP.save().records[id] || {};
    [...cards.children].forEach(c => c.classList.toggle('on', c.dataset.id === id));
    let recTxt = rec.best ? 'Recorde: ' + rec.best + ' pts' + (rec.wave ? ' · onda ' + rec.wave : '') + (rec.time ? ' · ' + rec.time + ' s' : '') + (rec.rooms ? ' · ' + rec.rooms + ' salas' : '') : 'Sem recorde ainda';
    let extra = '';
    if (m.map) extra = '<label>Arena: <select id="arenaSel"><option value="rand">Aleatória</option>' + EXP.ARENAS.map(a => '<option value="' + a + '"' + (a === curMap ? ' selected' : '') + '>' + (MAPAS.find(x => x.id === a) || { nome: a }).nome + '</option>').join('') + '</select></label>';
    if (id === 'diario') { const d = EXP.dailyInfo(), done = EXP.save().daily[d.date]; extra = '<p>Hoje (' + d.date + '): máscara <b>' + MASKS[d.mask].nome + '</b>, arma inicial <b>' + WP[d.weapon].nome + '</b>, modificador <b>' + EXP.MODS[d.mod].nome + '</b>.' + (done ? ' <span class="rec">Melhor de hoje: ' + done.score + '</span>' : '') + '</p>'; }
    $('modoDet').innerHTML = '<b style="color:' + m.color + '">' + m.nome.toUpperCase() + '</b> — ' + esc(m.desc) + '<ul>' + m.rules.map(r => '<li>' + esc(r) + '</li>').join('') + '</ul><div>Recompensa: ' + esc(m.reward) + '</div><div class="rec">' + recTxt + '</div>' + extra;
    const a = $('arenaSel'); if (a) a.onchange = () => { curMap = a.value; };
  }
  $('modosBtn').onclick = () => { open(sModos); selMode(curMode); };
  $('modoBack').onclick = back;
  $('modoGo').onclick = () => { if (curMode === 'custom') { openCustom(); return; } EXP.startMode(curMode, { map: curMap }); };

  // ---------- PERSONALIZADO ----------
  const sCust = mk('expCust', '<h2>Partida Personalizada</h2><div class="form" id="custForm"></div><p class="aviso">Partidas personalizadas dão 50% do XP e não contam para os recordes oficiais.</p><div class="linha"><button id="custGo" type="button">Começar</button><button id="custBack" type="button" class="sec">Voltar</button></div>');
  screens.push(sCust);
  function openCustom() {
    const maps = [['seq', 'Sequência'], ['proc', 'Apartamento aleatório'], ...MAPAS.filter(m => m.id !== 'boate-b').map(m => [m.id, m.nome])];
    const unlockedMasks = MASKS.map((m, i) => [i, m.nome]).filter(([i]) => !EXP.maskLocked(i));
    const guns = [['pistola', 'Pistola'], ...Object.keys(WP).filter(k => k !== 'punho' && k !== 'pistola' && EXP.weaponUnlocked(k)).map(k => [k, WP[k].nome])];
    const sel = (id, opts, d) => '<select id="' + id + '">' + opts.map(([v, t]) => '<option value="' + v + '"' + (v == d ? ' selected' : '') + '>' + t + '</option>').join('') + '</select>';
    $('custForm').innerHTML = '<label>Mapa ' + sel('c-map', maps, 'seq') + '</label><label>Máscara ' + sel('c-mask', unlockedMasks, 0) + '</label><label>Arma inicial ' + sel('c-wp', guns, 'pistola') + '</label>' +
      '<label>Dificuldade ' + sel('c-dif', [['facil', 'Fácil'], ['medio', 'Médio'], ['dificil', 'Difícil'], ['hardcore', 'Hardcore']], 'medio') + '</label><label>Quantidade de inimigos ' + sel('c-en', [[.5, 'Metade'], [1, 'Normal'], [1.5, '+50%'], [2, 'Dobro']], 1) + '</label>' +
      '<label>Velocidade dos inimigos ' + sel('c-foe', [[.8, 'Lenta'], [1, 'Normal'], [1.25, 'Rápida'], [1.5, 'Muito rápida']], 1) + '</label><label>Vida (coletes extra) ' + sel('c-life', [[0, '0'], [1, '+1'], [2, '+2'], [3, '+3']], 0) + '</label><label>Número de salas ' + sel('c-rooms', [[3, '3'], [5, '5'], [8, '8'], [12, '12']], 5) + '</label>' +
      '<div class="mods">' + Object.entries(EXP.MODS).map(([k, m]) => '<label title="' + esc(m.desc) + '"><input type="checkbox" data-mod="' + k + '"> ' + m.nome + '</label>').join('') + '</div>';
    open(sCust);
  }
  $('custBack').onclick = () => open(sModos);
  $('custGo').onclick = () => {
    const v = id => $(id).value, mods = [...document.querySelectorAll('#custForm [data-mod]')].filter(c => c.checked).map(c => c.dataset.mod);
    EXP.startMode('custom', { map: v('c-map'), mask: +v('c-mask'), weapon: v('c-wp'), dif: v('c-dif'), enemies: +v('c-en'), foe: +v('c-foe'), life: +v('c-life'), rooms: +v('c-rooms'), mods });
  };

  // ---------- PERFIL & COLEÇÃO ----------
  const sPerfil = mk('expPerfil', '<h2>Perfil &amp; Coleção</h2><div class="tabs" id="tabs"></div><div class="painel" id="painel"></div><div class="linha"><button id="perfBack" type="button" class="sec">Voltar</button></div>');
  screens.push(sPerfil);
  const TABS = [['perfil', 'Progresso'], ['mascaras', 'Máscaras'], ['armas', 'Armas'], ['chefes', 'Chefes'], ['conq', 'Conquistas'], ['rank', 'Recordes'], ['dados', 'Dados']];
  let tab = 'perfil';
  const tabs = $('tabs'); TABS.forEach(([id, t]) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.id = id; b.textContent = t; b.onclick = () => showTab(id); tabs.appendChild(b); });
  const fmtT = s => Math.floor(s / 3600) + 'h ' + Math.floor(s % 3600 / 60) + 'min';
  function showTab(id) {
    tab = id; [...tabs.children].forEach(b => b.classList.toggle('on', b.dataset.id === id));
    const sv = EXP.save(), p = $('painel'); let h = '';
    if (id === 'perfil') {
      const need = EXP.xpNeed(sv.level), s = sv.stats, acc = s.shots ? Math.round(s.hits / s.shots * 100) + '%' : '—';
      h = '<b>Nível ' + sv.level + '</b> — XP ' + sv.xp + ' / ' + need + (sv.level >= EXP.MAXLV ? ' (máx.)' : '') + '<div class="xpbar"><i style="width:' + Math.min(100, sv.xp / need * 100) + '%"></i></div>' +
        '<p><b style="color:var(--amarelo)">Pontos de habilidade: ' + sv.sp + '</b></p>' + EXP.PERKS.map(p => { const l = EXP.perk(p.id); return '<div class="perk"><span style="min-width:8em"><b>' + p.nome + '</b></span><span class="pips">' + '■'.repeat(l) + '□'.repeat(p.max - l) + '</span><button type="button" data-perk="' + p.id + '"' + (sv.sp < 1 || l >= p.max ? ' disabled' : '') + '>+</button><span>' + p.desc + '</span></div>'; }).join('') +
        '<h4 style="color:var(--ciano);margin:.6rem 0 .2rem">ESTATÍSTICAS</h4><div class="stats">' + [['Abates', s.kills], ['Mortes', s.deaths], ['Salas', s.rooms], ['Partidas', s.runs], ['Precisão geral', acc], ['Maior combo', s.maxCombo + 'x'], ['Melhor pontuação', s.bestScore], ['Notas S / SS', s.sRanks + ' / ' + s.ssRanks], ['Chefes', s.bossKills], ['Finalizações', s.finishers], ['Barris explodidos', s.barrels], ['Câmeras destruídas', s.cameras], ['Salas sem detecção', s.flawless], ['Tempo de jogo', fmtT(s.playSec)], ['Corpo a corpo', s.melee]].map(([a, b]) => '<span>' + a + ': <b>' + b + '</b></span>').join('') + '</div>';
    } else if (id === 'mascaras') {
      const got = MASKS.filter((m, i) => !EXP.maskLocked(i)).length;
      h = '<p>' + got + ' / ' + MASKS.length + ' máscaras desbloqueadas</p><div class="col">' + MASKS.map((m, i) => { const lk = EXP.maskLocked(i), r = EXP.RAR[m.rar]; return '<div class="item' + (lk ? ' lk' : '') + '" style="border-color:' + r.c + '"><img src="' + (m.img.src || 'assets/' + m.id + '.png') + '" alt=""><b>' + (lk ? '???' : m.nome) + '</b><small style="color:' + r.c + '">' + r.nome + '</small><small>' + (lk ? esc(EXP.unlockInfo(m.unl).txt) : esc(m.desc)) + '</small><small style="opacity:.7">' + (lk ? '' : EXP.maskTags(m).join(' · ')) + '</small></div>'; }).join('') + '</div>';
    } else if (id === 'armas') {
      h = '<div class="col">' + Object.keys(WP).filter(k => k !== 'punho').map(k => { const w = WP[k], lk = !EXP.weaponUnlocked(k), r = EXP.RAR[w.rar], used = sv.weaponsUsed[k] || 0;
        return '<div class="item' + (lk ? ' lk' : '') + '" style="border-color:' + r.c + '"><b>' + (lk ? '???' : w.nome) + '</b><small>' + w.cat + ' · <span style="color:' + r.c + '">' + r.nome + '</span></small><small>' + (lk ? 'Nível ' + w.lv : (w.melee ? 'Corpo a corpo · alcance ' + w.range : 'Cadência ' + (1 / w.cd).toFixed(1) + '/s · ' + (EXP.magOf(k) ? 'pente ' + EXP.magOf(k)[0] : 'sem pente') + (w.pel > 1 ? ' · ' + w.pel + ' projéteis' : ''))) + '</small><small style="opacity:.7">Usada ' + used + 'x</small></div>'; }).join('') + '</div>';
    } else if (id === 'chefes') {
      h = EXP.bosses.map(b => { const n = sv.bosses[b.id] || 0; return '<div class="item" style="border-color:' + b.col + ';margin-bottom:.4rem"><b style="color:' + b.col + '">' + b.nome + (n ? ' ✔ ×' + n : '') + '</b><small>Aparece na onda ' + b.wave + ' do Modo Horda · ' + b.phases.length + ' fases</small><small>' + (n ? esc(b.bio) : 'Derrote para revelar a história.') + '</small></div>'; }).join('') + '<p class="aviso">Chefes extras chegam em futuras atualizações (veja o CHANGELOG).</p>';
    } else if (id === 'conq') {
      h = EXP.ACH.map(a => { const ok = sv.ach[a.id]; return '<div class="ach' + (ok ? ' ok' : '') + '"><span><b>' + a.nome + '</b> — ' + a.desc + '</span><span>' + (ok ? '✔' : '—') + '</span></div>'; }).join('');
    } else if (id === 'rank') {
      const ids = Object.keys(MODES).filter(k => k !== 'historia');
      h = ids.map(k => { const L = sv.ranking[k] || []; return '<h4 style="color:var(--ciano);margin:.3rem 0">' + MODES[k].nome.toUpperCase() + '</h4>' + (L.length ? '<table class="rank-t"><tr><th>#</th><th>Pontos</th><th>Máscara</th><th>Resultado</th><th>Data</th></tr>' + L.slice(0, 5).map((e, i) => '<tr><td>' + (i + 1) + '</td><td>' + e.score + '</td><td>' + esc(e.mask) + '</td><td>' + esc(e.info) + (e.win ? ' ✔' : '') + '</td><td>' + e.date + '</td></tr>').join('') + '</table>' : '<p style="opacity:.6;margin:.1rem 0">sem registros</p>'); }).join('');
    } else if (id === 'dados') {
      h = '<p>O progresso é salvo automaticamente neste navegador, com cópia de segurança. Exporte um arquivo para guardar ou mover o seu save.</p><div class="linha"><button type="button" id="dExp">Exportar save</button><label class="sec" style="cursor:pointer;padding:.45rem 1rem;background:var(--amarelo);color:var(--noite);font:700 .95rem Orbitron">Importar save<input type="file" id="dImp" accept=".json,application/json" hidden></label><button type="button" id="dRes" class="sec">Restaurar backup</button></div><p id="dMsg" class="aviso"></p><p style="opacity:.6;font-size:.8rem">Última gravação: ' + (sv.saved ? new Date(sv.saved).toLocaleString() : '—') + '</p>';
    }
    p.innerHTML = h;
    p.querySelectorAll('[data-perk]').forEach(b => b.onclick = () => { if (EXP.buyPerk(b.dataset.perk)) { showTab('perfil'); refreshTag(); } });
    if (id === 'dados') {
      $('dExp').onclick = () => EXP.exportSave();
      $('dImp').onchange = e => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { const m = EXP.importSave(String(rd.result)); $('dMsg').textContent = m || 'Save importado com sucesso!'; refreshTag(); }; rd.readAsText(f); };
      $('dRes').onclick = () => { const error = EXP.restoreBackup(); $('dMsg').textContent = error || 'Backup restaurado.'; if (!error) refreshTag(); };
    }
  }
  $('perfilBtn').onclick = () => { open(sPerfil); showTab(tab); };
  $('perfBack').onclick = back;

  // ---------- RESUMO POR SALA ----------
  const sSum = mk('expSum', '<p class="tag" id="sumT"></p><div class="nota" id="sumN"></div><div class="duas"><div><h4>DESEMPENHO</h4><div id="sumS"></div></div><div><h4>BÔNUS</h4><div id="sumB"></div></div></div><p id="sumX" class="novo"></p><button id="sumGo" type="button">Continuar</button><p class="dica">Enter continua</p>');
  screens.push(sSum); let sumCb = null;
  EXP.ui = {
    hideAll,
    summary(r, cb) {
      sumCb = cb; $('sumT').textContent = r.title; $('sumN').textContent = r.rank; $('sumN').className = 'nota ' + r.rank;
      $('sumS').innerHTML = r.stats.map(([a, b]) => '<p>' + a + '<b>' + b + '</b></p>').join('') + '<p>Pontos<b>' + r.score + '</b></p>';
      $('sumB').innerHTML = r.bonus.length ? r.bonus.map(([a, b]) => '<p>' + a + '<b>' + b + '</b></p>').join('') : '<p style="opacity:.6">sem bônus</p>';
      const un = EXP.takeNewUnlocks(); $('sumX').textContent = '+' + r.xp + ' XP · Nível ' + EXP.save().level + un.map(u => ' · NOVO: ' + u.label).join('');
      sSum.classList.remove('oculto'); $('sumGo').focus();
    },
    result(r) {
      EXP.takeNewUnlocks; const e = $('expRes'); $('resT').textContent = r.title; $('resT').style.color = r.win ? 'var(--ciano)' : 'var(--rosa)'; $('resSub').textContent = r.sub;
      $('resN').textContent = r.rank; $('resN').className = 'nota ' + r.rank; $('resR').textContent = r.rankText === '—' ? '' : 'Notas das salas: ' + r.rankText;
      $('resL').innerHTML = r.lines.map(([a, b]) => '<p>' + a + '<b>' + b + '</b></p>').join('');
      $('resX').innerHTML = '<p>XP ganho<b>+' + (r.xp || 0) + '</b></p><p>Nível<b>' + r.level + '</b></p>' + (r.record ? '<p class="novo">NOVO RECORDE!</p>' : '') + (r.pos >= 0 ? '<p class="novo">Ranking local: #' + (r.pos + 1) + '</p>' : '') + (r.unl || []).map(u => '<p class="novo">DESBLOQUEADO: ' + esc(u.label) + '</p>').join('');
      $('expRes').classList.remove('oculto'); $('resAgain').focus(); if (r.record) playSfx('record');
    },
  };
  $('sumGo').onclick = () => { sSum.classList.add('oculto'); const cb = sumCb; sumCb = null; if (cb) cb(); };
  const sRes = mk('expRes', '<h2 id="resT"></h2><p class="tag" id="resSub"></p><div class="nota" id="resN"></div><p id="resR" class="dica"></p><div class="duas"><div><h4>RESUMO</h4><div id="resL"></div></div><div><h4>PROGRESSO</h4><div id="resX"></div></div></div><div class="linha"><button id="resAgain" type="button">Jogar de novo</button><button id="resMask" type="button" class="sec">Trocar máscara</button><button id="resMenu" type="button" class="sec">Lobby</button></div>');
  screens.push(sRes);
  $('resAgain').onclick = () => { sRes.classList.add('oculto'); newGame(); };
  $('resMask').onclick = () => { sRes.classList.add('oculto'); showMasks(); };
  $('resMenu').onclick = () => { sRes.classList.add('oculto'); toMenu(); };
  addEventListener('keydown', e => { if (e.key === 'Enter' && st === 'summary') { $('sumGo').click(); e.preventDefault(); } if (e.key === 'Escape' && st === 'expui') { back(); } });

  // ---------- OPÇÕES: áudio e dados ----------
  // ÁUDIO & DADOS: campos já estão em index.html (#opcoes)
  const syncVol = () => { const s = EXP.save().settings; $('o-musVol').value = s.musVol; $('o-sfxVol').value = s.sfxVol; $('o-events').checked = s.events !== false; };
  $('o-musVol').oninput = e => EXP.setVol('musVol', +e.target.value); $('o-sfxVol').oninput = e => { EXP.setVol('sfxVol', +e.target.value); EXP.sfx('pistol'); };
  $('o-events').onchange = e => { EXP.save().settings.events = e.target.checked; EXP.touch(); };
  const _ob = $('optBtn').onclick; $('optBtn').onclick = () => { _ob(); syncVol(); };

  // ---------- PERSONAGENS (na tela de máscaras) ----------
  const charRow = document.createElement('div'); charRow.id = 'charRow'; charRow.className = 'menu-row';
  charRow.innerHTML = '<div class="tabs" id="charTabs"></div><p class="dica" id="charInfo" style="width:100%;margin:.1rem 0"></p>';
  grade.before(charRow);
  const ctabs = $('charTabs');
  EXP.CHARS.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.dataset.id = c.id; b.textContent = c.nome + ' (' + MASKS.find(m => m.id === c.mask).nome + ')'; b.onclick = () => { EXP.setChar(c.id); mark(); refreshChar(); }; ctabs.appendChild(b); });
  function refreshChar() { const cur = EXP.curChar(); [...ctabs.children].forEach(b => b.classList.toggle('on', b.dataset.id === cur.id)); $('charInfo').innerHTML = '<b style="color:var(--amarelo)">' + cur.nome + '</b> — ' + esc(cur.desc) + ' <span style="opacity:.7">[+ ' + esc(cur.pros) + ' · − ' + esc(cur.cons) + ']</span>'; }
  const _showMasks = showMasks; showMasks = function () { _showMasks(); refreshChar(); };
  refreshChar();

  // Skins visuais independentes das máscaras e dos atributos do personagem.
  const skinRow = document.createElement('div'); skinRow.id = 'skinRow'; skinRow.className = 'menu-row';
  skinRow.innerHTML = '<b style="width:100%">Skin do personagem</b><div class="tabs" id="skinTabs" role="group" aria-label="Escolha uma skin"></div><p class="dica" id="skinInfo" style="width:100%;margin:.1rem 0">Cosmético; não altera atributos nem desbloqueios.</p>';
  charRow.after(skinRow);
  const stabs = $('skinTabs');
  EXP.SKINS.forEach(s => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.id = s.id;
    b.setAttribute('aria-label', 'Skin ' + s.name);
    b.innerHTML = '<canvas width="32" height="32" aria-hidden="true"></canvas><span>' + esc(s.name) + '</span>';
    b.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.15rem;width:118px;height:72px;min-height:72px;padding:.25rem!important';
    const preview = b.querySelector('canvas'), previewCtx = preview.getContext('2d');
    preview.style.cssText = 'display:block;flex:0 0 32px;width:32px;height:32px;border:1px solid ' + s.detail + ';background:#171923;image-rendering:pixelated';
    previewCtx.imageSmoothingEnabled = false; previewCtx.drawImage(buildPlayerFrame('idle', 0, 0, s), 0, 0, 32, 32);
    b.onclick = () => { EXP.setSkin(s.id); refreshSkin(); };
    stabs.appendChild(b);
  });
  function refreshSkin() {
    const cur = EXP.curSkin(); [...stabs.children].forEach(b => {
      const on = b.dataset.id === cur.id; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
    });
    $('skinInfo').textContent = 'Visual: ' + cur.name + ' · cosmético; atributos, máscaras e progresso não mudam.';
  }
  const _showMasksSkin = showMasks; showMasks = function () { _showMasksSkin(); refreshSkin(); };
  refreshSkin();

  // ---------- grade de máscaras ----------
  EXP.cols = 10; EXP.rebuildMaskGrid(); EXP.recheck();
})();
/* ============ NITIDEZ, TAMANHO DA TELA E MENU DE PAUSA COM BOTÕES (anexar ao final de js/exp-ui.js) ============
   ARQUIVO: js/exp-ui.js (anexar ao final). Não altera index.html.
   1) Canvas com resolução real (proporcional à tela × DPI): texto e sprites ficam nítidos.
   2) Opção "Tamanho da tela" no bloco VÍDEO de Opções (salva em EXP.save().settings.stage).
   3) Pausa com botões clicáveis para História e Modos: Continuar, Recomeçar e Menu principal. */
(function () {
  'use strict';
  const EXP = window.EXP;
  const cv = document.getElementById('c');
  const stage = document.querySelector('.stage');
  const $ = id => document.getElementById(id);

  // ---------- 1) nitidez: resolução interna acompanha o tamanho exibido ----------
  let hiK = 1;
  let appliedPerfTier = -1;
  function applyResolution() {
    const r = cv.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const forced = (typeof CFG !== 'undefined' && CFG.res && CFG.res !== 'auto') ? +CFG.res : 0;
    // Escala automática limitada: 2x quadruplica pixels em telas de alta densidade e causa quedas de FPS.
    const tier = Math.max(0, Math.min(2, Number(EXP.perfTier) || 0));
    // O modo automático prioriza frame time: em telas HiDPI, 1.5x multiplica
    // o custo de todos os layers Canvas/WASM sem melhorar a leitura durante o combate.
    const baseK = forced || (CFG.gfx === 'max' ? 1 : Math.min(1.25, Math.max(1, (r.width * dpr) / W)));
    const k = forced ? baseK : baseK * (tier >= 2 ? .64 : tier >= 1 ? .82 : 1);
    const nw = Math.round(W * k), nh = Math.round(H * k);
    if (cv.width !== nw || cv.height !== nh) { cv.width = nw; cv.height = nh; }
    cv.style.imageRendering = 'auto';
    if (tier >= 1) cv.style.filter = '';
    hiK = k;
    appliedPerfTier = tier;
    const smooth = !!CFG.aa && tier === 0, quality = smooth ? (CFG.gfx === 'ultra' ? 2 : 1) : 0;
    const renderer = window.HM_WASM_RENDERER;
    if (!(renderer && renderer.setupCanvas && renderer.setupCanvas(ctx, hiK, smooth, quality, true))) {
      ctx.setTransform(hiK, 0, 0, hiK, 0, 0);
      ctx.imageSmoothingEnabled = smooth;
      ctx.imageSmoothingQuality = quality === 2 ? 'high' : quality === 1 ? 'medium' : 'low';
    }
  }
  const _draw = draw;
  draw = function () {
    const tier = Math.max(0, Math.min(2, Number(EXP.perfTier) || 0));
    if (tier !== appliedPerfTier) applyResolution();
    const smooth = !!CFG.aa && tier === 0, quality = smooth ? (CFG.gfx === 'ultra' ? 2 : 1) : 0;
    const renderer = window.HM_WASM_RENDERER;
    if (!(renderer && renderer.setupCanvas && renderer.setupCanvas(ctx, hiK, smooth, quality))) {
      ctx.setTransform(hiK, 0, 0, hiK, 0, 0);
      ctx.imageSmoothingEnabled = smooth;
      ctx.imageSmoothingQuality = quality === 2 ? 'high' : quality === 1 ? 'medium' : 'low';
    }
    _draw();
    if (EXP.overlay) EXP.overlay(ctx);
  };

  // ---------- 2) tamanho da tela ----------
  const SIZES = {
    p: { w: 640, nome: 'Pequena (640 px)' },
    m: { w: 800, nome: 'Média (800 px)' },
    g: { w: 1024, nome: 'Grande (1024 px)' },
    x: { w: 1280, nome: 'Máxima (1280 px)' },
    f: { w: null, nome: 'Tela cheia (ajusta à janela)' },
  };
  function applyStage() {
    const key = (EXP.save().settings.stage) || 'x';
    const sz = SIZES[key] || SIZES.x;
    const cap = sz.w ? sz.w + 'px' : null;
    stage.style.width = cap ? 'min(100vw, calc(100vh * 1.6), ' + cap + ')' : 'min(100vw, calc(100vh * 1.6))';
    applyResolution();
  }
  // Tamanho da tela: <select id="o-stage"> já existe em index.html (VÍDEO)
  (function bindSizeOption() {
    const sel = $('o-stage');
    sel.value = EXP.save().settings.stage || 'x';
    sel.onchange = e => { EXP.save().settings.stage = e.target.value; EXP.touch(); applyStage(); };
  })();
  window.addEventListener('resize', applyStage);
  applyStage();

  // ---------- 3) menu de pausa com botões ----------
  const BTN = [
    { id: 'cont', label: 'ESC · CONTINUAR', dy: 26, col: '#ffffff' },
    { id: 'menu', label: 'M · LOBBY', dy: 82, col: '#ffd23f' },
  ];
  const BOX = { w: 420, h: 46 };
  function boxOf(b) { return { x: W / 2 - BOX.w / 2, y: H / 2 + b.dy - BOX.h / 2 + 4, w: BOX.w, h: BOX.h }; }

  function goMenu() {
    musStop(.3); toMenu();
    if (EXP.ui && EXP.ui.hideAll) EXP.ui.hideAll();
  }
  function act(id) {
    if (id === 'cont') togglePause();
    else if (id === 'menu') goMenu();
  }

  cv.addEventListener('click', e => {
    if (st !== 'paused') return;
    const r = cv.getBoundingClientRect();
    const x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
    for (const b of BTN) {
      const bx = boxOf(b);
      if (x >= bx.x && x <= bx.x + bx.w && y >= bx.y && y <= bx.y + bx.h) { act(b.id); return; }
    }
  });
  addEventListener('keydown', e => {
    if (st === 'paused' && e.key.toLowerCase() === 'm') { goMenu(); e.preventDefault(); }
  });

  const _drawHUD = EXP.drawHUD;
  EXP.drawHUD = function (g) {
    _drawHUD(g);
    if (st !== 'paused') return;
    const hover = (typeof mouse !== 'undefined' && mouse.x !== undefined) ? mouse : null;
    const hoverIndex = hover ? BTN.findIndex(button => {
      const box = boxOf(button);
      return hover.x >= box.x && hover.x <= box.x + box.w && hover.y >= box.y && hover.y <= box.y + box.h;
    }) : -1;
    const pauseRenderer = window.HM_WASM_RENDERER;
    const pauseLabels = [tx('PAUSADO'), tx('ESC · CONTINUAR'), tx('M · LOBBY')];
    if (pauseRenderer && pauseRenderer.drawPauseUiDirect && pauseRenderer.drawPauseUiDirect(g, W, H, hoverIndex, pauseLabels)) return;
    // O painter Canvas original continua disponível se o batch Rust não aceitar os dados.
    g.save();
    g.fillStyle = 'rgba(5,0,18,.78)'; g.fillRect(0, 0, W, H);
    g.textAlign = 'center';
    g.fillStyle = '#ff2e93'; g.font = '64px Impact, sans-serif'; g.fillText('PAUSADO', W / 2, H / 2 - 40);
    for (const b of BTN) {
      const bx = boxOf(b);
      const over = hover && hover.x >= bx.x && hover.x <= bx.x + bx.w && hover.y >= bx.y && hover.y <= bx.y + bx.h;
      g.fillStyle = over ? 'rgba(255,46,147,.35)' : 'rgba(20,0,40,.85)';
      g.fillRect(bx.x, bx.y, bx.w, bx.h);
      g.strokeStyle = b.col; g.lineWidth = over ? 3 : 2; g.strokeRect(bx.x, bx.y, bx.w, bx.h);
      g.fillStyle = b.col; g.font = 'bold 22px Impact, sans-serif'; g.textBaseline = 'middle';
      g.fillText(b.label, W / 2, bx.y + bx.h / 2 + 1);
    }
    g.restore();
  };
})();
/* ============ VOLTAR AO MENU EM TODAS AS TELAS + MODO ROLETA DE MÁSCARAS (anexar ao final de js/exp-ui.js) ============
   ARQUIVO: js/exp-ui.js (anexar ao final). Não altera index.html.
   1) Botão "‹ Menu principal" em toda tela de menu que não tinha volta, e tecla Esc para voltar.
   2) Modo "Roleta de Máscaras": a máscara é sorteada a cada sala nova e a cada nova tentativa. */
(function () {
  'use strict';
  const EXP = window.EXP;
  const $ = id => document.getElementById(id);

  // ---------- 1) voltar ao menu ----------
  const MENU_SCREENS = ['opcoes', 'dif', 'historia', 'mascaras', 'expModos', 'expCust', 'expPerfil', 'fim'];

  function backToMenu() {
    document.querySelectorAll('section.overlay').forEach(s => { if (s.id !== 'menu') s.classList.add('oculto'); });
    toMenu();
    if (EXP.ui && EXP.ui.hideAll) EXP.ui.hideAll();
    const menu = $('menu');
    if (menu) menu.classList.remove('oculto');
    if (typeof musStop === 'function') musStop(.3);
  }
  EXP.backToMenu = backToMenu;

  function injectBackButtons() {
    document.querySelectorAll('section.overlay').forEach(s => {
      if (s.id === 'menu' || s.querySelector('.btn-volta-menu')) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn-volta-menu';
      b.textContent = '‹ Lobby';
      b.setAttribute('aria-label', 'Voltar ao lobby (Esc)');
      b.onclick = backToMenu;
      s.insertBefore(b, s.firstChild);
    });
  }
  injectBackButtons();

  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = MENU_SCREENS.find(id => $(id) && !$(id).classList.contains('oculto'));
    if (open) { backToMenu(); e.preventDefault(); }
  });

  // ---------- 2) modo Roleta de Máscaras ----------
  EXP.MODES.roleta = {
    id: 'roleta', nome: 'Roleta de Máscaras', color: '#ff6bd5',
    desc: 'Você não escolhe a máscara: o jogo sorteia uma nova a cada sala e a cada tentativa.',
    rules: ['A máscara muda a cada sala nova e a cada nova tentativa.', 'Adapte sua estratégia na hora: velocidade, força ou furtividade.', 'Sem limite de salas: quanto mais, melhor.'],
    reward: 'XP por sala · recorde de salas.',
  };

  function rerollMask() {
    sel = Math.floor(Math.random() * MASKS.length);
    S = Object.assign({}, BASE, MASKS[sel].fx);
    EXP.applyS();
    popup(P.x, P.y - 50, 'MÁSCARA: ' + MASKS[sel].nome.toUpperCase(), '#ff6bd5');
    EXP.sfx && EXP.sfx('wave');
  }

  const _startLevel = startLevel;
  startLevel = function () {
    _startLevel();
    if (EXP.run && EXP.run.id === 'roleta') rerollMask();
  };
})();
/* ============ EXPERIÊNCIA DO JOGADOR: CONFIRMAÇÃO AO SAIR (anexar ao final de js/exp-ui.js) ============
   ARQUIVO: js/exp-ui.js (anexar ao final). Não altera index.html.
   1) Ao sair da partida para o menu (no meio de uma fase), pede confirmação para não perder o progresso.
   2) Reinício por tecla foi removido para evitar reinícios acidentais. */
(function () {
  'use strict';
  const EXP = window.EXP;

  // ---------- 1) confirmação antes de abandonar uma partida em andamento ----------
  const _toMenu = toMenu;
  toMenu = function () {
    const emPartida = st === 'play' || st === 'paused';
    if (emPartida && !window.confirm('Sair da partida e voltar ao lobby?\nO progresso desta fase será perdido.')) return;
    _toMenu();
  };

})();
/* ============ FASES: NOMES, ORDEM DOS CAPÍTULOS E PROTEÇÃO CONTRA SPAWN NA PAREDE (anexar ao final de js/exp-ui.js) ============
   ARQUIVO: js/exp-ui.js (anexar ao final). Não altera index.html.
   1) Capítulos da história em ordem sequencial (antes estavam 6, 7, 8, 13, 16, 19, 9, 10, 11, 14...).
   2) Nomes de capítulos e de fases mais claros (no lugar de "HospitalEntrance", "Hospital abandonado" etc.).
   3) Nenhum inimigo, arma ou jogador nasce dentro de parede: se nascer, é empurrado para o ponto livre
      mais próximo; se não houver ponto livre, a entidade é removida. Vale para spawns iniciais e para
      ondas e reforços que surgem depois. */
(function () {
  'use strict';
  const EXP = window.EXP;

  // ---------- 1 e 2) capítulos e nomes ----------
  const STORY_TITLES = [
    'Prelúdio · Metrô de Brickell',
    'Capítulo 1 · Overdose',
    'Capítulo 2 · Decadência',
    'Capítulo 3 · Tensão',
    'Capítulo 4 · Golpe limpo',
    'Capítulo 5 · Vizinhos',
    'Capítulo 6 · Pressione',
    'Capítulo 7 · Delegacia',
    'Capítulo 8 · Fliperama',
    'Capítulo 9 · Resolução',
    'Capítulo 10 · Plantão',
    'Capítulo 11 · Ponto cego',
    'Capítulo 12 · Trem noturno',
    'Capítulo 13 · Vingança',
    'Expansão 1 · Hospital · entrada',
    'Expansão 2 · Hospital · andar superior',
    'Expansão 3 · Suíte do hotel',
    'Expansão 4 · Mansão · salão principal',
    'Expansão 5 · Delegacia · térreo',
    'Expansão 6 · Delegacia · 3º andar',
    'Expansão 7 · Clube · pista',
    'Expansão 8 · Clube · cobertura',
    'Expansão 9 · Unidade SWAT · térreo',
    'Expansão 10 · Estação de trem',
    'Expansão 11 · Fliperama',
    'Expansão 12 · Restaurante',
  ];
  STORY.forEach((c, i) => { if (STORY_TITLES[i] && c.t !== undefined) c.t = STORY_TITLES[i]; });

  const MAP_NAMES = {
    apto: 'Apartamento da Brickell', academia: 'Academia Splash', estudio: 'Estúdio Sunset', cassino: 'Cassino Bayside',
    fliperama: 'Fliperama Neon', central: 'Sede Central', mansao: 'Mansão Biscayne', metro: 'Estação Brickell',
    hotel: 'Hotel Blue', phonehom: 'Central Telefônica', boate: 'Boate Russa', delegacia: 'Delegacia Downtown',
    garagem: 'Garagem Subterrânea', loja: 'Loja 24h', hospital: 'Hospital Abandonado', 'boate-b': 'Boate Noturna',
    estacao: 'Estação de Trem', oficina: 'Oficina Mecânica',
  };
  MAPAS.forEach(m => { if (MAP_NAMES[m.id]) m.nome = MAP_NAMES[m.id]; });

  const NEON_NAMES = {
    rmHospitalEntrance: 'Hospital · Entrada', rmHospitalTopFloor: 'Hospital · Andar superior',
    rmHotelSuite: 'Hotel · Suíte', rmMansionMainHall: 'Mansão · Salão principal',
    rmPoliceHQFloor1: 'Delegacia · Térreo', rmPoliceHQFloor3: 'Delegacia · 3º andar',
    rmBossClubFloor1: 'Clube · Pista', rmBossClubFloor3: 'Clube · Cobertura',
    rmSwatDownstairs: 'Unidade SWAT · Térreo', rmTrainstationEntrance: 'Estação de trem · Entrada',
    rmEurogamer: 'Fliperama', rmNoodleShop: 'Restaurante',
  };
  const _bnf = buildNeonFloor;
  buildNeonFloor = function (m) { _bnf(m); if (NEON_NAMES[m.name]) mapName = NEON_NAMES[m.name]; };

  // ---------- 3) nada nasce dentro de parede ----------
  function freeNear(x, y, r) {
    if (!hitWall(x, y, r)) return [x, y];
    for (let d = 8; d <= 240; d += 8) for (let k = 0; k < 24; k++) {
      const a = k / 24 * Math.PI * 2, nx = x + Math.cos(a) * d, ny = y + Math.sin(a) * d;
      if (nx < 0 || ny < 0 || nx > WW || ny > WH) continue;
      if (!hitWall(nx, ny, r)) return [nx, ny];
    }
    return null;
  }
  const checkedE = new WeakSet(), checkedP = new WeakSet();
  function guardSpawns() {
    if (P) { const sp = freeNear(P.x, P.y, P.r); if (sp) { P.x = sp[0]; P.y = sp[1]; } }
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (checkedE.has(e)) continue;
      checkedE.add(e);
      const p = freeNear(e.x, e.y, e.r + 4);
      if (p) { e.x = p[0]; e.y = p[1]; } else enemies.splice(i, 1);
    }
    for (let i = pickups.length - 1; i >= 0; i--) {
      const q = pickups[i];
      if (checkedP.has(q)) continue;
      checkedP.add(q);
      const p = freeNear(q.x, q.y, 10);
      if (p) { q.x = p[0]; q.y = p[1]; } else pickups.splice(i, 1);
    }
  }
  const _worldTick = EXP.worldTick;
  EXP.worldTick = function (dt) { _worldTick(dt); if (st === 'play' && P) guardSpawns(); };
})();
/* ============ QUALIDADE DOS MAPAS: OBJETOS NÍTIDOS (anexar ao final de js/exp-ui.js) ============
   ARQUIVO: js/exp-ui.js (anexar ao final). Não altera index.html.
   Os sprites dos mapas são pixel art pequena (mediana de 32 px). Ao serem colados no chão do mapa,
   a suavização do canvas deixava as bordas borradas. Aqui os objetos são desenhados sem suavização,
   preservando a borda de cada pixel; o chão e os fundos continuam suavizados. */
(function () {
  'use strict';
  const _neonDrawProp = neonDrawProp;
  neonDrawProp = function (g, sp, x, y, rot) {
    const antes = g.imageSmoothingEnabled;
    g.imageSmoothingEnabled = true;
    _neonDrawProp(g, sp, x, y, rot);
    g.imageSmoothingEnabled = antes;
  };
})();
