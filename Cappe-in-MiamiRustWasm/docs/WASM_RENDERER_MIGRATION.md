# Migração do renderer gráfico para Rust/WASM

## Escopo desta cópia

O projeto separa a simulação (movimento, IA, colisões, campanha e saves) da saída gráfica. A simulação permanece em JavaScript. O objetivo desta cópia é substituir o renderer Canvas do jogo por uma implementação Rust/WebAssembly, conservando a mesma saída Canvas enquanto cada camada é portada.

O renderer existente tem três grupos de trabalho: composição estática do mapa (`paintMap`, piso, móveis, paredes e portas); desenho dinâmico por quadro (`draw`, jogadores, inimigos, armas, partículas, sangue e HUD); e expansões visuais que desenham em `fl`/`tp` ou no contexto principal (`exp-world.js` e `exp-fx.js`). O menu HTML/CSS e o áudio ficam fora do renderer gráfico.

## Etapa de integração atual — preview local v76, conversão parcial

Com `?renderer=wasm`, a ponte genérica encaminha ainda métodos/setters Canvas 2D, CanvasGradient, CanvasPattern e Path2D não portados, preservando receptor, argumentos, retorno e erros. As camadas concretas portadas emitem comandos em lote. Rust calcula padrões determinísticos de piso, detalhes de sala, sombras/faces de paredes/postes, sombra/aura do jogador, sombras inimigas, comandos para os 17 móveis, armas e portas sem sprite; também cria frames RGBA procedurais e seleciona células de spritesheets. Desde v67 gera corpos geométricos e recortes de inimigos em buffer ordenado, com alpha de nocaute. Em v68 gera em um lote a composição de até três jogadores: transform, sombra/halo, arma, sprite ou frame fallback, acentos de skin e tag P1/P2. Em v69 inclui no range do inimigo os seis círculos animados do stun. Em v70 decide e posiciona rótulos de stun, nocaute, suspeita e alerta; o host mapeia IDs e chama `tx()` cacheado. Em v71 Rust gera fundo fixo, overlay e decor/tapetes; `paintMap` ainda monta os dados e controla a sequência. Em v72 Rust gera comandos para painéis de vidro intactos e estilhaços; a atualização de vida/remoção de fragmentos fica em JavaScript. Em v73 a geração do granulado, das sombras dos sólidos e do rejunte do piso passou a lotes determinísticos Rust. Em v74 Rust seleciona e ordena geometria de texturas repetidas de paredes/móveis e decalques de aberturas; o host mantém assets e rasteriza. Em v75 Rust também escolhe, ordena e posiciona o overlay `FTILES`, incluindo a exclusão do corredor e o offset horizontal; o host mantém a imagem e aplica `createPattern`, clipping e fills no Canvas. Em v76 Rust emite em lote as transformações e handles de imagem das portas Neon com sprite; o host mantém os assets e rasteriza, enquanto animação e interação seguem no JS. O host rasteriza Canvas após o retorno WASM, sem callbacks reentrantes durante a geração Rust. Rust também filtra/ordena inimigos.

**A migração ainda não é completa:** `paintMap` ainda coordena as camadas, portas com sprites, sangue/partículas, expansões visuais, HUD e várias chamadas Canvas continuam em JavaScript; o navegador ainda rasteriza Canvas 2D. Os frames procedurais WASM entram no fallback sem spritesheet. A ponte genérica residual pode acrescentar custo por chamada; não houve medição de desempenho nem comparação lado a lado de imagem. O modo padrão permanece JavaScript e não depende do módulo.

## Teste local

1. Extraia o ZIP e instale Node.js 18 ou superior.
2. Dê duplo clique em `INICIAR_EXPERIMENTO_WASM.bat`.
3. Confirme o selo WASM e inicie uma fase. O contador mostra chamadas Canvas e comandos gerados pelo módulo, incluindo jogadores e inimigos. A captura headless de Apartamento confirma execução curta; não substitui validação manual de todos os mapas/modos nem comparação visual com JavaScript.
4. Para o modo original, abra `http://127.0.0.1:8787/`.

O ZIP inclui o binário compilado `wasm-renderer/pkg/renderer.wasm`; Rust só é necessário para recompilar. O crate usa ABI WASM sem dependências externas. Instale Rust e o target `wasm32-unknown-unknown`, então execute `./wasm-renderer/build.ps1` no PowerShell.

## Verificações

`node tests/wasm-renderer.cjs` valida ABI, lotes de jogador/inimigo, ordem/alpha, fundo/decor, vidros, estilhaços, geometrias e rótulos de stun, spritesheets, granulado/RNG, sombras/rejunte, texturas `FTILES` e do mapa, portas Neon com sprite e portas comuns, móveis, armas e paridade pixel a pixel dos frames procedurais; `node tests/wasm-renderer-browser.cjs` valida execução Canvas simulada, lotes de piso e vidro, padrões e recortes de textura, cores de decoração, painter cacheado, fallback e handles de portas Neon; e `node tests/regression.cjs` valida o jogo existente, integração das portas Neon, cache e health endpoint. A validação headless de um mapa Neon com portas ainda está pendente; os smoke v75 em Apartamento e a captura não provam paridade geral nem benchmark. Não declare ganho de FPS sem medir os dois modos no mesmo hardware.
