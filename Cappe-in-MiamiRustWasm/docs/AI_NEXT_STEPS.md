# Próximas ações — preview local v76.0
## Migração integral do renderer — pendente
1. Portas Neon com sprite agora enviam posição, rotação, offsets e handle de imagem em lote Rust; carregar/rasterizar asset fica no host, estado da porta no JS e fallback `neonDrawDoor` permanece. Build, testes ABI/bridge e regressões 61/61 passaram; smoke visual está pendente porque o ambiente negou o socket DevTools. `FTILES` mantém seleção/ordem de salas e offset em Rust.
2. Portar o restante da composição por quadro de `draw()`: sangue, partículas, saída, textos restantes e HUD. Os corpos completos dos atores e os rótulos/efeitos de estado dos inimigos agora são comandados por Rust; manter o avanço temporal e gameplay no JS.
3. Portar ou integrar os draw hooks de `js/exp-world.js` e `js/exp-fx.js` sem deixar chamadas gráficas fora do backend alvo.
4. Comparar screenshots/jogabilidade do modo JS e WASM em navegador real; testar fallback e service worker offline.
5. Remover a interceptação Canvas de passagem quando todas as camadas concretas estiverem portadas; medir frame time/CPU/GPU antes de anunciar ganhos.

1. Jogar a campanha até vitória em uma fase inicial, uma intermediária e uma final; conferir morte e transições.
2. Validar fogo amigo ligado/desligado, armas, portas, janelas, áudio e efeitos durante combate real.
3. Validar criação/entrada/saída e reconexão online em dois navegadores/dispositivos.
4. Medir FPS, CPU, memória e frame pacing em hardware modesto e mapas densos.
5. Validar instalação real do service worker e recarga offline.
6. Conferir skins e armas com spritesheets carregados, assets ausentes e acessibilidade.
7. Manter a regressão Neon de 72 mapas e atualizar auditoria se os dados fonte forem alterados.
