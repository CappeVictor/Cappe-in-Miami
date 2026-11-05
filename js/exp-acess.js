/* Cappe in Miami | ACESSIBILIDADE E ABAS DE OPÇÕES
   1) Abas em Opções: VÍDEO · JOGABILIDADE · ÁUDIO & DADOS · ACESSIBILIDADE · IDIOMA
      (os blocos são os mesmos fieldsets de index.html; só são agrupados em painéis).
   2) Leitor de tela: anuncia o título de cada tela que abre (região aria-live). */
(function () {
  'use strict';

  // ---------- 1) abas de Opções ----------
  const grid = document.querySelector('#opcoes .opt-grid');
  if (grid) {
    const PT_LABELS = ['VÍDEO', 'JOGABILIDADE', 'ÁUDIO & DADOS', 'ACESSIBILIDADE', 'IDIOMA'];   // texto original (o DOM é traduzido depois)
    const fieldsets = [...grid.querySelectorAll(':scope > fieldset')];
    const bar = document.createElement('div');
    bar.className = 'tabs opt-tabs';
    bar.setAttribute('role', 'tablist');
    const panes = [];
    fieldsets.forEach((fs, i) => {
      const pane = document.createElement('div');
      pane.className = 'opt-pane';
      pane.id = 'opt-pane-' + i;
      pane.setAttribute('role', 'tabpanel');
      pane.setAttribute('aria-labelledby', 'opt-tab-' + i);
      pane.tabIndex = 0;
      fs.parentNode.insertBefore(pane, fs);
      pane.appendChild(fs);
      panes.push(pane);

      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.id = 'opt-tab-' + i;
      b.setAttribute('aria-controls', pane.id);
      b.textContent = PT_LABELS[i] || fs.querySelector('legend').textContent.trim();
      b.onclick = () => show(i, true);
      b.onkeydown = e => {
        let next = i;
        if (e.key === 'ArrowRight') next = (i + fieldsets.length + 1) % fieldsets.length;
        else if (e.key === 'ArrowLeft') next = (i + fieldsets.length - 1) % fieldsets.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = fieldsets.length - 1;
        else return;
        e.preventDefault(); show(next, true);
      };
      bar.appendChild(b);
    });
    grid.parentNode.insertBefore(bar, grid);

    function show(i, focus) {
      panes.forEach((p, k) => { p.hidden = k !== i; });
      [...bar.children].forEach((b, k) => {
        b.classList.toggle('on', k === i);
        b.setAttribute('aria-selected', String(k === i));
        b.tabIndex = k === i ? 0 : -1;
      });
      if (focus) bar.children[i].focus();
    }
    show(0);
  }

  // ---------- 2) imagens que não existem (máscaras bloqueadas) somem sem ícone quebrado ----------
  document.addEventListener('error', e => {
    if (e.target && e.target.tagName === 'IMG') e.target.style.visibility = 'hidden';
  }, true);

  // ---------- 3) leitor de tela: anuncia a tela aberta ----------
  const live = document.createElement('div');
  live.className = 'sr-only';
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  document.body.appendChild(live);

  let last = '';
  function announce() {
    const open = [...document.querySelectorAll('section.overlay')].find(s => !s.classList.contains('oculto'));
    const h = open && open.querySelector('h1, h2');
    const t = h ? h.textContent.trim() : '';
    if (t && t !== last) { last = t; live.textContent = t; }
  }
  const stage = document.querySelector('.stage');
  if (stage) new MutationObserver(announce).observe(stage, { attributes: true, subtree: true, attributeFilter: ['class'] });
})();
