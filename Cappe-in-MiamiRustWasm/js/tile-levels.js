/* =====================================================================================
   MAPAS EM MATRIZ DE TILES (Grid-Tiles) - Campanha de 3 fases
   Código de tile (apenas para TILE_LEVELS; as GRIDS antigas do index.html mantêm o seu):
     0 = chão          1 = parede         2 = VIDRO / JANELA (quebrável)
     3 = porta         4 = início do jogador
     5 = inimigo corpo a corpo           6 = inimigo armado
   Tile 2 (vidro): bloqueia movimento do jogador e da IA, NÃO bloqueia a linha de visão da IA.
   Um projétil que atravessa o tile muda o seu estado para 0 (chão) e gera 10 estilhaços.
   Cada fase traz: zones (pisos), patrols (waypoints em coordenadas de tile [coluna, linha]),
   theme (cores das paredes) e weather (clima). 'at' é o tile do inimigo que segue a rota.
   ===================================================================================== */
const TILE_GLASS = 2;
const TILE_CODE = { '#': 1, '.': 0, 'G': 2, 'D': 3, 'P': 4, 'm': 5, 'g': 6 };
const tileRows = rows => rows.map(r => Array.from(r, ch => TILE_CODE[ch]));

const TILE_LEVELS = [
  { id: 'hospital', nome: 'O Hospital', weather: 'poeira',
    briefing: 'Quartos pequenos: corpo a corpo.',
    theme: { wall: '#f4f7fa', trim: '#7fd3d6', floor: 'white' },
    zones: [ { c: 0, r: 0, w: 26, h: 15, floor: 'white' }, { c: 1, r: 6, w: 24, h: 3, floor: 'teal2' } ],
    patrols: [
      { at: [10, 7], route: [[10, 7], [4, 7], [10, 7], [22, 7]] },
      { at: [20, 7], route: [[20, 7], [12, 8], [20, 6], [23, 7]] },
    ],
    map: tileRows([
      "##########################",
      "#....#....#....#....#....#",
      "#.m..#....#.m..#....#.g..#",
      "#....#.m..#....#.m..#....#",
      "#....#....#....#....#....#",
      "###D####D####D####D####D##",
      "#........................#",
      "#P........m.........m....#",
      "#........................#",
      "###D####D####D####D####D##",
      "#....#....#....#....#....#",
      "#....#..m.#....#..m.#....#",
      "#..m.#....#..g.#....#..m.#",
      "#....#....#....#....#....#",
      "##########################"
    ]) },
  { id: 'club', nome: 'O Clube Synthwave', weather: 'neon',
    briefing: 'Vidros por toda parte. Quebre-os.',
    theme: { wall: '#2a1050', trim: '#19f0e6', floor: 'black' },
    zones: [ { c: 0, r: 0, w: 30, h: 19, floor: 'black' }, { c: 9, r: 5, w: 12, h: 9, floor: 'checker' },
             { c: 1, r: 5, w: 6, h: 9, floor: 'purple' }, { c: 23, r: 5, w: 6, h: 9, floor: 'purple' },
             { c: 1, r: 1, w: 28, h: 3, floor: 'darkT' }, { c: 1, r: 15, w: 28, h: 3, floor: 'darkT' } ],
    patrols: [
      { at: [14, 2], route: [[14, 2], [27, 2], [3, 2], [14, 2]] },
      { at: [8, 16], route: [[8, 16], [26, 16], [8, 16]] },
      { at: [26, 16], route: [[26, 16], [12, 16], [26, 16]] },
      { at: [11, 7], route: [[11, 7], [19, 7], [19, 12], [11, 12]] },
    ],
    map: tileRows([
      "##############################",
      "#............................#",
      "#....m........g.........m....#",
      "#............................#",
      "#########GGGDGGGGDGGG#########",
      "#......G..............G......#",
      "#......G..............G......#",
      "#..g...D...g..........D......#",
      "#......G..............G...g..#",
      "#......G..g....m......G......#",
      "#......G..............G......#",
      "#...m..D..........g...D......#",
      "#......G.....m........G..m...#",
      "#......G..............G......#",
      "#########GGGDGGGGDGGG#########",
      "#............................#",
      "#.P.....g............m....g..#",
      "#............................#",
      "##############################"
    ]) },
  { id: 'mafia', nome: 'A Sede da Máfia', weather: 'fumaca',
    briefing: 'Fase final. Patrulhas cruzadas.',
    theme: { wall: '#3a2418', trim: '#ffd23f', floor: 'brownT' },
    zones: [ { c: 0, r: 0, w: 34, h: 22, floor: 'brownT' }, { c: 1, r: 9, w: 32, h: 4, floor: 'darkT' }, { c: 15, r: 1, w: 4, h: 20, floor: 'darkT' },
             { c: 1, r: 1, w: 6, h: 6, floor: 'maroon' }, { c: 8, r: 1, w: 6, h: 6, floor: 'redD' }, { c: 20, r: 1, w: 6, h: 6, floor: 'redD' }, { c: 27, r: 1, w: 6, h: 6, floor: 'maroon' },
             { c: 1, r: 15, w: 6, h: 6, floor: 'redD' }, { c: 8, r: 15, w: 6, h: 6, floor: 'maroon' }, { c: 20, r: 15, w: 6, h: 6, floor: 'maroon' }, { c: 27, r: 15, w: 6, h: 6, floor: 'redD' } ],
    patrols: [
      { at: [8, 10], route: [[8, 10], [28, 10], [8, 10]] },
      { at: [21, 10], route: [[21, 10], [4, 11], [21, 10]] },
      { at: [13, 11], route: [[13, 11], [30, 11], [13, 11]] },
      { at: [25, 10], route: [[25, 10], [6, 12], [25, 10]] },
      { at: [16, 4], route: [[16, 4], [17, 19], [16, 4]] },
      { at: [17, 6], route: [[17, 6], [16, 18], [17, 6]] },
      { at: [17, 16], route: [[17, 16], [16, 2], [17, 16]] },
      { at: [16, 19], route: [[16, 19], [17, 3], [16, 19]] },
      { at: [31, 10], route: [[31, 10], [2, 11], [31, 10]] },
      { at: [27, 12], route: [[27, 12], [16, 9], [27, 12]] },
    ],
    map: tileRows([
      "##################################",
      "#......#......#....#......#......#",
      "#.g....#..g...#....#......#..g...#",
      "#...m..#......#....#..g...#...m..#",
      "#......#......#.g..#......#......#",
      "#....g.#....g.#....#....g.#....g.#",
      "#......#......#..g.#......#......#",
      "###D######D####....###D######D####",
      "###.######.####....###.######.####",
      "#................................#",
      "#.P.....g............g...g.....g.#",
      "#............g...................#",
      "#..........................g.....#",
      "###.######.####....###.######.####",
      "###D######D####....###D######D####",
      "#......#......#....#......#......#",
      "#......#......#..g.#......#......#",
      "#.g....#..g...#....#..g...#......#",
      "#...m..#......#....#......#..g...#",
      "#....g.#....g.#.g..#....g.#....g.#",
      "#......#......#....#......#......#",
      "##################################"
    ]) },
];

// Árvore de progressão: cada fase aponta para a próxima (null = fase final).
const LEVEL_TREE = {
  hospital: { next: 'club' },
  club:     { next: 'mafia' },
  mafia:    { next: null },
};
