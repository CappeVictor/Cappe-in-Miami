// Cache offline limitado a esta instalação do jogo.
const CACHE = 'cappe-v319.0-original-story-save-confirm-backup-dica-municao-pausa-recarga-r-tecla-ajuda-retry-controle-edicao-movimento';
const ASSETS = ["js/tile-levels.js",
  "assets/background/images/tlCorners1.png",
  "assets/background/images/tlFloorTiles.png",
  "assets/doors.png",
  "assets/enemies_spritesheet.png",
  "assets/floor_tileset.png",
  "assets/furniture_tileset.png",
  "assets/player_spritesheet.png",
  "assets/sprites/images/sprAndersBed_0.png",
  "assets/sprites/images/sprAndersCouch_0.png",
  "assets/sprites/images/sprArcadeCabinet1_0.png",
  "assets/sprites/images/sprArcadeLight1_0.png",
  "assets/sprites/images/sprBarPoolTable_0.png",
  "assets/sprites/images/sprBarRegister_0.png",
  "assets/sprites/images/sprBarShelf_0.png",
  "assets/sprites/images/sprBarTable_0.png",
  "assets/sprites/images/sprBench_0.png",
  "assets/sprites/images/sprBigBed_0.png",
  "assets/sprites/images/sprBoss4Seat_0.png",
  "assets/sprites/images/sprBoss4Sofa_0.png",
  "assets/sprites/images/sprBowlingLane_0.png",
  "assets/sprites/images/sprCellDoor_0.png",
  "assets/sprites/images/sprCellKeys_0.png",
  "assets/sprites/images/sprCellSink_0.png",
  "assets/sprites/images/sprClosedLockerH_0.png",
  "assets/sprites/images/sprClubRegister_0.png",
  "assets/sprites/images/sprCorner_0.png",
  "assets/sprites/images/sprDJ_0.png",
  "assets/sprites/images/sprDoorV_0.png",
  "assets/sprites/images/sprDrugSafe_0.png",
  "assets/sprites/images/sprElevator_0.png",
  "assets/sprites/images/sprEnvelopes_0.png",
  "assets/sprites/images/sprEuroPillar_0.png",
  "assets/sprites/images/sprFatmanEating_0.png",
  "assets/sprites/images/sprFloorMail_0.png",
  "assets/sprites/images/sprGirlfriendDrugged_0.png",
  "assets/sprites/images/sprHighballBooth_0.png",
  "assets/sprites/images/sprHospitalBed2_0.png",
  "assets/sprites/images/sprHospitalCupboard_0.png",
  "assets/sprites/images/sprHospitalLocker_0.png",
  "assets/sprites/images/sprHospitalSofaH_0.png",
  "assets/sprites/images/sprInvestigationFiles_0.png",
  "assets/sprites/images/sprKaraokeCouchBlack_0.png",
  "assets/sprites/images/sprMicrowaveDown_0.png",
  "assets/sprites/images/sprMonitors_0.png",
  "assets/sprites/images/sprMoon_0.png",
  "assets/sprites/images/sprOwnerDesk_0.png",
  "assets/sprites/images/sprPetersCloset_0.png",
  "assets/sprites/images/sprPlayerBed2_0.png",
  "assets/sprites/images/sprPoliceFrontDesk_0.png",
  "assets/sprites/images/sprPolicePhone1_0.png",
  "assets/sprites/images/sprPoliceWalkNightStick_0.png",
  "assets/sprites/images/sprPoolTray_0.png",
  "assets/sprites/images/sprPornBed_0.png",
  "assets/sprites/images/sprRezzedLogo_0.png",
  "assets/sprites/images/sprRichTable_0.png",
  "assets/sprites/images/sprSecretSewerManhole_0.png",
  "assets/sprites/images/sprSofaH64_0.png",
  "assets/sprites/images/sprSpeaker_0.png",
  "assets/sprites/images/sprSpotLight_0.png",
  "assets/sprites/images/sprSquareTable_0.png",
  "assets/sprites/images/sprStoreShelf_0.png",
  "assets/sprites/images/sprSwatFade_0.png",
  "assets/sprites/images/sprSwatWalkM16_0.png",
  "assets/sprites/images/sprTableStriped_0.png",
  "assets/sprites/images/sprTowels_0.png",
  "assets/sprites/images/sprToyLego_0.png",
  "assets/sprites/images/sprTrashcan_0.png",
  "assets/sprites/images/sprVenusCandle_0.png",
  "assets/sprites/images/sprWokKitchen_0.png",
  "assets/sprites/images/sprXray_0.png",
  "assets/sprites/images/sprite927_0.png",
  "assets/wall_tileset.png",
  "css/acessibilidade.css",
  "css/expansion.css",
  "index.html",
  "js/collision_sizes.js",
  "js/exp-acess.js",
  "js/exp-brain.js",
  "js/exp-content.js",
  "js/exp-core.js",
  "js/exp-debug.js",
  "js/exp-fx.js",
  "js/exp-i18n-extra.js",
  "js/exp-i18n-extra2.js",
  "js/exp-i18n.js",
  "js/exp-modes.js",
  "js/exp-multi.js",
  "js/exp-music.js",
  "js/exp-online.js",
  "js/exp-shop.js",
  "js/exp-ui.js",
  "js/exp-world.js",
  "js/wasm-renderer.js",
  "wasm-renderer/pkg/direct/direct_renderer.js",
  "wasm-renderer/pkg/direct/direct_renderer_bg.wasm"
];
const SCOPE = new URL(self.registration.scope);
const CACHE_KEY = CACHE + ':' + SCOPE.pathname;
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE_KEY).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k =>
    k !== CACHE_KEY && ((k.startsWith('cappe-') && k.endsWith(':' + SCOPE.pathname)) ||
    (SCOPE.pathname === '/' && /^cappe-v[0-9.]+$/.test(k)))
  ).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  const apiPath = new URL('api/', SCOPE).pathname;
  if (e.request.method !== 'GET' || u.origin !== SCOPE.origin || !u.pathname.startsWith(SCOPE.pathname) || u.pathname.startsWith(apiPath)) return;
  e.respondWith(caches.open(CACHE_KEY).then(async c => {
    const hit = await c.match(e.request);
    if (hit) return hit;
    try {
      const res = await fetch(e.request);
      if (res.ok) {
        const copy = res.clone();
        e.waitUntil(c.put(e.request, copy).catch(() => {}));
      }
      return res;
    } catch (error) {
      if (e.request.mode === 'navigate') {
        const page = await c.match(new URL('index.html', SCOPE).href);
        if (page) return page;
      }
      throw error;
    }
  }));
});
