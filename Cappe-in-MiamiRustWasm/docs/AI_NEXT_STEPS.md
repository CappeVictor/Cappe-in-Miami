# Próximas ações — preview local v172.0
## Migração integral do renderer — pendente
1. Auditar e portar callbacks Canvas restantes, incluindo pickups; validar shells, muzzle/impacto, fog/lights/dark em gameplay real.
2. Continuar o módulo direto nas rotas de sprites, mundo, HUD restante e expansões; ImageData, clearRect, imagens cacheadas, mapas geométricos, sangue/cadáveres, poeira/faíscas, labels de inimigos, móveis, atores, jogadores/inimigos, armas, fantasmas e aura agora usam WebSys em casos cobertos, sem benchmark. Manter o caminho antigo até cada camada ter paridade e smoke de jogo.
3. Continuar portando operações gráficas residuais por impacto. Texturas de mapa/piso ainda extraem ImageData e copiam pixels para WASM; persistem outros textos e draw hooks de exp-world.js/exp-fx.js. Auditar runtime em morte/combate, vidro, loja e overlays; remover o bridge antigo só depois de cobrir todas as operações.
4. Portar ou integrar os draw hooks de `js/exp-world.js` e `js/exp-fx.js` sem deixar chamadas gráficas fora do backend alvo.
5. Comparar screenshots/jogabilidade do modo JS e WASM em navegador real; testar fallback e service worker offline.
6. Remover a interceptação Canvas de passagem quando todas as camadas concretas estiverem portadas; medir frame time/CPU/GPU antes de anunciar ganhos.

7. Cobrir os estados e eventos que o smoke curto não alcançou; o caminho de suavização de mapa já foi movido ao Rust direto na v161.

8. Continuar removendo rotas Canvas host dos efeitos e overlays que a auditoria revelar; manter o smoke do jogo separado das comparações sintéticas para controlar o custo.

1. Jogar a campanha até vitória em uma fase inicial, uma intermediária e uma final; conferir morte e transições.
2. Validar fogo amigo ligado/desligado, armas, portas, janelas, áudio e efeitos durante combate real.
3. Validar criação/entrada/saída e reconexão online em dois navegadores/dispositivos.
4. Medir FPS, CPU, memória e frame pacing em hardware modesto e mapas densos.
5. Validar instalação real do service worker e recarga offline.
6. Conferir skins e armas com spritesheets carregados, assets ausentes e acessibilidade.
7. Manter a regressão Neon de 72 mapas e atualizar auditoria se os dados fonte forem alterados.
