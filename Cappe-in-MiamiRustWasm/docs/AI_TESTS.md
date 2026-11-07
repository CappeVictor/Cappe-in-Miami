# Testes — até 07/11/2026
## Preview Rust/WASM local v176.0 — 07/11/2026
- wasm-renderer/build.ps1: passou; módulo direto 158.600 bytes WASM e glue 41.212 bytes.
- node tests/regression.cjs: 82/82 passou, incluindo health/cache e vínculo dos dois novos painters.
- node tests/wasm-direct-draw-parity.cjs: passou em Chrome 156; gradação e fade/flash tiveram zero canais RGBA diferentes, com alpha/composite restaurados.
- Sem benchmark, revisão visual ampla, campanha completa ou validação de todos os callbacks.
## Preview Rust/WASM local v175.0 — 07/11/2026
- wasm-renderer/build.ps1: passou; módulo direto 156.945 bytes WASM e glue 40.209 bytes.
- node tests/regression.cjs: 82/82 passou, incluindo versão/cache e ponte do painter de projéteis.
- node tests/wasm-direct-draw-parity.cjs: passou em Chrome 156; callback chamou Rust e dois sprites tiveram zero canais RGBA diferentes; alpha/composite preservados.
- Sem benchmark, revisão visual ampla, campanha completa ou validação de todos os callbacks.

## Preview Rust/WASM local v174.0 — 07/11/2026
- wasm-renderer/build.ps1: passou; módulo direto 156.255 bytes WASM e glue 39.762 bytes.
- node tests/regression.cjs: 82/82 passou, incluindo cache/health e vínculo estático do painter de imagens HUD.
- node tests/wasm-direct-draw-parity.cjs: passou em Chrome 156; callback de imagem chamou Rust e teve zero canais RGBA diferentes; alpha/composite preservados.
- Sem benchmark, revisão visual ampla, campanha completa ou validação de todos os callbacks.

## Preview Rust/WASM local v173.0 — 07/11/2026
- wasm-renderer/build.ps1: passou; módulo direto 155.645 bytes WASM e glue 39.337 bytes.
- node tests/regression.cjs: 82/82 passou, incluindo versão/health/cache e assert do painter do alarme.
- node tests/wasm-direct-draw-parity.cjs: passou em Chrome 156; callback chamou Rust e o rótulo teve zero canais RGBA diferentes.
- Sem benchmark, revisão visual ampla, campanha completa ou validação de todos os callbacks.

## Preview Rust/WASM local v172.0 — 07/11/2026
- wasm-renderer/build.ps1: passou; módulo direto 154.919 bytes WASM e glue 38.768 bytes.
- node tests/regression.cjs: 82/82 passou, incluindo cache/health v172 e ligação estática do painter de combo.
- node tests/wasm-direct-draw-parity.cjs: passou em Chrome 156; callback chamou Rust e o texto teve zero canais RGBA diferentes; alpha/composite foram restaurados.
- Sem benchmark, revisão visual ampla, campanha completa ou validação de todos os callbacks.

## Preview Rust/WASM local v171.0 — 07/11/2026
- `wasm-renderer/build.ps1`: passou; módulo direto 154.105 bytes WASM e glue 38.200 bytes.
- `node tests/regression.cjs`: 82/82 passou, com asserts de versão/health e integração drawShells.
- `node tests/wasm-direct-draw-parity.cjs`: passou em Chrome 156; callback dos estojos chamou Rust e a comparação RGBA teve zero canais diferentes; alpha e composite foram restaurados.
- Sem benchmark, revisão visual ampla, campanha completa ou validação dos demais callbacks em todas as telas.

## Preview Rust/WASM local v170.0 — 07/11/2026
- `wasm-renderer/build.ps1`: passou; módulo direto 153.386 bytes WASM e glue 37.706 bytes.
- `node tests/regression.cjs`: 82/82 passou, incluindo versão/health e ligação estática de drawFx.
- `node tests/wasm-direct-draw-parity.cjs`: passou no Chrome 156; callback real de efeito chamou Rust; muzzle flash e arco de impacto tiveram zero canais RGBA diferentes e o estado de composição foi restaurado.
- Sem benchmark, revisão visual ampla, percurso integral da campanha ou validação dos demais callbacks em todas as telas.

## Preview Rust/WASM local v169.0 — 07/11/2026
- `wasm-renderer/build.ps1`: passou; módulo direto 152.262 bytes WASM, glue 37.257 bytes.
- `node tests/wasm-direct-draw-parity.cjs`: Chrome 156 passou; integração de dark overlay chamou Rust uma vez; comparação de composição teve 0 canais diferentes e estado de composição restaurado. Paridade dos quatro batches v168 também manteve zero diferenças.
- `node tests/regression.cjs`: 82/82 passou.
- Sem benchmark, revisão visual ampla ou campanha completa.

## Preview Rust/WASM local v168.0 — 07/11/2026
- `wasm-renderer/build.ps1`: passou; módulo direto 150.178 bytes WASM e 36.608 bytes glue.
- `node tests/regression.cjs`: 82/82 passou; contém asserts estáticos para os quatro callbacks diretos.
- `node tests/wasm-direct-draw-parity.cjs`: passou no Chrome 156. Névoa (3 imagens), luzes/reflexos (3 comandos), anéis (1) e zona (1) tiveram 0 canais diferentes; alpha e operação de composição restaurados. O mesmo teste cobriu HUD de depuração, overlays F4/F6, sombras, vidro e marcas de explosão.
- Não houve benchmark, revisão visual ampla nem percurso integral da campanha.

## Preview Rust/WASM local v167.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou; artefatos diretos 145.565 bytes WASM e 34.732 bytes glue.
- `node tests/wasm-direct-draw-parity.cjs`: Chrome 156 passou; jogo confirmou draw Rust em dev com 16 paredes, 5 portas e 5 inimigos; caso sintético de colisão/IA teve 0 canais diferentes e estado Canvas restaurado.
- `node tests/regression.cjs`: 82/82 passaram, incluindo versão/health e ligação estática F4/F6 ao Rust.
- Depois de restringir a chamada de debug ao caso em que F4/F6 estão ligados, uma repetição do teste focado deixou Chrome sem resposta e precisou ser encerrada; a regressão e a compilação continuaram passando. Repetir o teste focado em uma nova sessão limpa.
- Sem benchmark, revisão visual ampla ou percurso integral da campanha.

## Preview Rust/WASM local v166.0 — 07/11/2026
- Build direto: 143.436 bytes WASM, glue 33.762 bytes.
- `node tests/regression.cjs`: 82/82; inclui rota direta e sintaxe do teste focado.
- `node tests/wasm-direct-draw-parity.cjs`: Chrome com `dev=1`; HUD de depuração chamada durante gameplay, painel + erros com RGBA exato e estado restaurado. Sombra, vidro e queimadura de explosão também passaram.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156; paridades e tolerâncias passaram; depois de explosão controlada: `top=[]`, `properties=[]`.
- `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs` passaram.
- F4/F6 em `exp-debug.js` ainda não estão cobertos por este painter. Sem benchmark ou validação visual ampla.

## Preview Rust/WASM local v165.0 — 07/11/2026
- `node tests/regression.cjs`: 82/82 após atualizar a versão e os checks de HUD.
- `node tests/wasm-direct-draw-parity.cjs`: passou com sombra, vidro e marcas de explosão; pixels iguais nos casos comparados, estado conforme as rotas de referência.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156; piso máx 3/média 0,1882; texturas máx 76/média 0,001947; restantes casos e limites passaram. Após iniciar jogo e forçar uma explosão válida: `barrelScorchRuntime=1`, `directExplosionScorchCalls=1`, `top=[]`, `properties=[]`.
- `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs` passaram na v164; mudança v165 é no fallback da HUD, coberta pela regressão e pixel parity.
- Sem benchmark, inspeção visual ampla ou campanha completa.

## Preview Rust/WASM local v164.0 — 07/11/2026
- Build direto: 140.854 bytes WASM, glue 33.137 bytes.
- `node tests/regression.cjs`: 82/82, incluindo estática do caminho da explosão.
- `node tests/wasm-direct-draw-parity.cjs`: Chrome; sombras (3) e rastro de vidro (9 fragmentos) em igualdade RGBA; marcas de explosão também são comparadas pelo módulo direto.
- `node tests/wasm-renderer.cjs`, `node tests/wasm-renderer-browser.cjs` e `node tests/wasm-floor-pixel-parity.cjs`: passaram após adicionar o painter da explosão.
- Sem benchmark, inspeção visual ampla ou campanha completa.

## Preview Rust/WASM local v163.0 — 07/11/2026
- Build direto: 140.256 bytes WASM, glue 32.738 bytes.
- `node tests/regression.cjs`: 82/82; inclui sintaxe do teste focado, allowlist de mapas e integração dos painters.
- `node tests/wasm-direct-draw-parity.cjs`: Chrome; gameplay `play`, 288 chamadas diretas de sombra. Sombras e nove fragmentos de vidro deram diferença RGBA zero e preservaram alpha/fillStyle.
- `node tests/wasm-renderer.cjs`, `node tests/wasm-renderer-browser.cjs` e `node tests/wasm-floor-pixel-parity.cjs`: passaram.
- Sem benchmark, revisão visual ampla ou campanha completa.

## Preview Rust/WASM local v162.0 — 07/11/2026
- Build direto: 138.983 bytes WASM, glue 32.201 bytes.
- `node tests/regression.cjs`: 82/82; inclui verificação estática do despacho Rust e sintaxe do teste dedicado.
- `node tests/wasm-enemy-shadow-parity.cjs`: Chrome; gameplay `play`, 194 chamadas de sombra Rust; três elipses com RGBA exato, alpha `.65` e fillStyle preservados.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156 concluiu; sombra direta RGBA exata em 3 casos e 205 chamadas em gameplay. Piso: máx 3/média 0,1882; texturas: máx 76/média 0,001947; demais limites e paridades registrados no JSON passaram.
- `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs`: passaram. Sem benchmark ou validação visual ampla.

## Preview Rust/WASM local v161.0 — 07/11/2026
- Build direto: 138.010 bytes WASM, glue 31.704 bytes.
- `node tests/regression.cjs`: 82/82; renderer ABI e browser bridge passaram.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156. Suavização teve 2 chamadas diretas e zero escritas de propriedade Canvas no host; camadas, sangue, texto, poeira e atores mantiveram os pixels/tolerâncias registrados.
- Sem benchmark, validação visual ampla ou campanha completa.

## Preview Rust/WASM local v160.0 — 07/11/2026
- Build direto: 138.078 bytes WASM, glue 31.452 bytes.
- Chrome 156: poeira RGBA exata, contexto volta a alpha 1; smoke de gameplay sem setter host globalAlpha.
- tests/regression.cjs: 82/82; tests/wasm-renderer.cjs, tests/wasm-renderer-browser.cjs e tests/wasm-floor-pixel-parity.cjs passaram.
- Sem benchmark, revisão visual ampla ou campanha completa.

## Preview Rust/WASM local v159.0 — 07/11/2026
- Build direto: 137.834 bytes WASM, glue 31.452 bytes.
- tests/wasm-floor-pixel-parity.cjs: Chrome 156; camada recortada e respingo sintético com diferença RGBA zero. Um kill real chamou Rust e registrou zero chamadas quadráticas no host.
- tests/regression.cjs: 82/82; tests/wasm-renderer.cjs, tests/wasm-renderer-browser.cjs e checks de sintaxe passaram.
- Sem benchmark, revisão visual ampla ou campanha completa.

## Preview Rust/WASM local v158.0 — 07/11/2026
- Build direto: **135.090 bytes WASM**, glue **29.537 bytes**.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156; bitmaps cacheados de texto do clima (136×24) e estado de inimigo comparados com diferença RGBA zero; chamadas diretas confirmadas e smoke sem operações residuais de texto entre as monitoradas. Casos anteriores mantiveram os resultados/tolerâncias.
- `node tests/regression.cjs`: **82/82**; `node tests/wasm-renderer.cjs`, `node tests/wasm-renderer-browser.cjs` e checks de sintaxe passaram.
- Sem benchmark, inspeção visual ampla ou campanha completa.

## Preview Rust/WASM local v157.0 — 07/11/2026
- `wasm-renderer/build.ps1`: WASM direto **121.452 bytes**, glue **27.180 bytes**.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156; quatro `clearRect` foram para Rust, sem operação residual no smoke. Os casos anteriores de piso, textura, HUD, entidades e efeitos passaram com os mesmos resultados/tolerâncias.
- `node tests/regression.cjs`: **82/82**; `node tests/wasm-renderer.cjs`, `node tests/wasm-renderer-browser.cjs` e `node --check` passaram.

## Preview Rust/WASM local v156.0 — 07/11/2026
- `wasm-renderer/build.ps1`: compilou os dois módulos; WASM direto **120.713 bytes**, glue **26.635 bytes**.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156; 18 criações e 24 aplicações de ImageData por Rust no smoke; zero chamadas Canvas residuais `createImageData`/`putImageData`. Piso, texturas, imagens, sprites e demais casos pixel-exatos permaneceram em zero; piso/texturas/neblina dentro das tolerâncias existentes.
- `node tests/regression.cjs`: **82/82**; `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs` passaram; sintaxe JS passou.
- Sem benchmark nem inspeção visual ampla.

## Preview Rust/WASM local v155.0 — 07/11/2026
- `wasm-renderer/build.ps1`: compilou módulos legado e direto; WASM direto **117.055 bytes**, glue **24.576 bytes**.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156; rótulo cacheado do clima teve zero diferenças RGBA usando `drawImage` Rust direto. Smoke confirmou 104 chamadas diretas para imagens, nenhuma operação `drawImage` residual. Cadáveres (3), sangue, partículas, mapa, móveis, atores, HUD e efeitos cobertos também foram pixel-exatos nos cenários sintéticos; piso/texturas/neblina ficaram dentro das tolerâncias existentes.
- `node tests/regression.cjs`: **82/82**; `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs` passaram; `node --check` dos arquivos JS tocados passou.
- Sem benchmark ou revisão visual ampla.

## Preview Rust/WASM local v154.0 — 07/11/2026
- `wasm-renderer/build.ps1`: compilou os módulos legado e direto; depois da v155, WASM direto **117.055 bytes**, glue **24.576 bytes**.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156; cinco marcas de sangue dinâmico com alpha individual, cinco estáticas e três cadáveres tiveram zero diferenças RGBA; `globalAlpha` terminou em 1. Poeira/faíscas, labels, mapa e demais camadas cobertas mantiveram paridade anterior.
- `node tests/wasm-renderer.cjs`, `node tests/wasm-renderer-browser.cjs` e `node tests/regression.cjs`: passaram; regressões **82/82**. Sintaxe JS passou.
- Sem benchmark ou revisão visual ampla.

## Preview Rust/WASM local v153.0 — 07/11/2026
- `wasm-renderer/build.ps1`: compilou os módulos legado e direto; WASM direto **112.638 bytes**, glue **22.301 bytes**.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156; poeira com 9 partículas e faíscas em três grupos de cor/alfa tiveram zero diferenças RGBA. No cenário de jogo, 24 lotes/1.152 comandos de poeira usaram Rust direto. Mapas, labels e demais camadas cobertas mantiveram resultados anteriores.
- `node tests/wasm-renderer.cjs`, `node tests/wasm-renderer-browser.cjs` e `node tests/regression.cjs`: passaram; regressões **82/82**. Sintaxe JS passou.
- Sem benchmark ou revisão visual ampla.

## Preview Rust/WASM local v152.0 — 07/11/2026
- `wasm-renderer/build.ps1`: compilou os módulos legado e direto; WASM direto **109.955 bytes**, glue **21.236 bytes**.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156; inimigo, incluindo sprite de label submetido ao Rust direto, teve zero diferenças RGBA; `directTextCommands: 1`. Casos v151 e camadas previamente cobertas permaneceram dentro dos limiares.
- `node tests/wasm-renderer.cjs`, `node tests/wasm-renderer-browser.cjs` e `node tests/regression.cjs`: passaram; regressões **82/82**. Sintaxe JS passou.
- Sem benchmark ou avaliação visual ampla.

## Preview Rust/WASM local v151.0 — 07/11/2026
- `wasm-renderer/build.ps1`: compilou os módulos legado e direto; WASM direto **109.783 bytes**, glue **21.616 bytes**.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156; 22 opcodes de mapa comparados com diferença RGBA zero e 35 lotes diretos confirmados em jogo. Todos os cenários diretos de v150 também passaram; tolerâncias anteriores de piso/texturas e fumaça mantiveram-se dentro dos limiares.
- `node tests/wasm-renderer.cjs`, `node tests/wasm-renderer-browser.cjs` e `node tests/regression.cjs`: passaram; regressões **82/82**.
- Não houve benchmark, avaliação visual ampla ou campanha completa.

## Preview Rust/WASM local v150.0 — 07/11/2026
- `wasm-renderer/build.ps1`: compilou os módulos legado e direto; WASM direto **94.595 bytes**, glue **18.707 bytes**.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156. Diferença zero em pausa (3), overlays (6), chuva (2), motes (2), texto HUD, móveis (9 tipos), jogador com spritesheet, inimigo com spritesheet, arma, fantasma e aura. Também verificou a rota direta em jogo iniciado.
- `node tests/wasm-renderer.cjs` e `node tests/regression.cjs`: passaram; regressões **82/82**.
- Sem benchmark, revisão visual ampla ou campanha completa.

## Preview Rust/WASM local v149.0 — 07/11/2026
- `wasm-renderer/build.ps1`: compilou os módulos Rust/WASM legado e direto.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156 comparou motes em dois tempos, confirmação de duas chamadas pelo caminho direto e **zero diferença RGBA**. Os mesmos runs mantiveram 2 strides de chuva, 6 cenários de overlays e 3 estados da pausa pixel-exatos.
- `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs`: passaram; `node tests/regression.cjs`: **82/82 passou**.
- Sem benchmark ou revisão visual ampla.

## Preview Rust/WASM local v148.0 — 07/11/2026
- `wasm-renderer/build.ps1`: compilou o módulo legado e o módulo `web-sys` direto.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156 comparou chuva nos strides 1 e 2; ambos usaram o contador da rota direta e tiveram **zero diferença RGBA**. Pausa (3 casos) e overlays (6 casos) também mantêm diferença zero.
- `node tests/wasm-renderer.cjs`, `node tests/wasm-renderer-browser.cjs` e `node tests/regression.cjs`: estavam verdes antes da inclusão da chuva; repetir na validação final.
- Nenhum benchmark ou revisão visual ampla.

## Preview Rust/WASM local v147.0 — 07/11/2026
- `wasm-renderer/build.ps1`: compilou ambos os módulos, glue `wasm-bindgen` 0.2.129.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156. Pausa: três estados, zero diferenças. Overlays: seis cenários, todos passaram pelo contador direto, zero diferenças RGBA. Piso/mapa/fog mantiveram os limites das versões anteriores; sem exceções.
- `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs`: passaram; regressões **82/82**.
- Sem validação manual ampla nem benchmark. O restante do jogo ainda não usa a rota direta integralmente.

## Preview Rust/WASM local v146.0 — 07/11/2026
- `wasm-renderer/build.ps1`: compilou o módulo legado e o módulo direto com `wasm-bindgen` 0.2.129 / `web-sys` 0.3.106.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156 carregou `directReady: true`; menu de pausa direto em Rust comparado com o painter Canvas em três estados (`hover -1, 0, 1`): **zero canais diferentes**. Comparações existentes do piso, mapa e fog mantiveram os limites registrados.
- `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs`: passaram; `node tests/regression.cjs`: **82/82 passou**.
- Sem revisão visual manual ampla ou benchmark de desempenho. `wasm-renderer-direct` é uma rota nova; o restante ainda usa partes do bridge antigo.

## Preview Rust/WASM local v145.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou; `renderer.wasm`: **185.475 bytes**. `node tests/wasm-renderer.cjs`: passou com cobertura de recorte, pixels de borda e rejeição de dimensões/slot inválidos.
- `node tests/wasm-renderer-browser.cjs`: passou. `node tests/regression.cjs`: **81/81 passou**.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156, WASM ativo em `play`; preservou as leituras v144 de piso (máx. 3/255, média 0,188155, RNG igual), mapa (máx. 76/255, média 0,00194695) e sprite fog (alfa máx. 1/255, média 0,107414; RGB máx. 12/255 com alfa≥64). Instrumentação observou 14 `drawImage` no cenário; sem A/B de desempenho.
- Sem revisão visual ampla, testes em todos os mapas, ou benchmark.

## Preview Rust/WASM local v144.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou; `renderer.wasm`: **184.656 bytes**. `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs`: passaram.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156. Sprite ambiental 512×256 comparado com nove gradientes Canvas: alfa máximo 1/255, média 0,107414/255, RGB máximo 12/255 para alfa≥64. Teste ainda verifica limite de alfa e RGB, geração em runtime e batch fog ativo.
- Mesmo run mantém mapa: texturas máximo 76/255/média 0,00194695; piso máximo 3/255/média 0,188155 com RNG igual. WASM ativo em `play`, zero exceções.
- `node tests/regression.cjs`: **81/81 passou**, incluindo novo caso para o sprite e fallback Canvas.
- Sem revisão visual ampla ou benchmark.

## Preview Rust/WASM local v143.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou; `renderer.wasm`: **181.969 bytes**.
- `node tests/wasm-renderer.cjs`: passou; `node tests/wasm-renderer-browser.cjs`: passou; `node tests/regression.cjs`: **80/80**.
- `node tests/wasm-floor-pixel-parity.cjs`: duas execuções Chrome 156, Apartamento 1440×900, 50 sólidos e cinco aberturas. Texturas de mapa: 240/5.184.000 canais diferentes, máximo 76, média 0,00194695; teste limita max 80 e média 0,0025. Piso: máximo 3, média 0,188155, RNG igual. WASM ativo em `play`, zero exceções.
- No smoke de 2,5 s, antes das comparações sintéticas: 22 chamadas `drawImage` durante crops/asset setup, 7 `createImageData`, 4 `clearRect`, uma `measureText`/`fillText`; não houve `fillRect` nem `createPattern` residuais. Contagem de chamadas não é benchmark.
- Comparação de pixels automatizada em um mapa; sem inspeção visual ampla, teste Neon, FPS ou benchmark.

## Preview Rust/WASM local v142.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou; `renderer.wasm`: **178.000 bytes**.
- `node tests/wasm-renderer.cjs`: passou; `node tests/wasm-renderer-browser.cjs`: passou; `node tests/regression.cjs`: **80/80**.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156, Apartamento 1440×900, cinco salas e 50 sólidos; granulado+FTILES+sombra+rejunte. RNG igual, 347.083/5.184.000 canais diferentes, máximo 3 e média 0,1882. Limiar automatizado: max 3, média 0,2; zero exceções JS.
- Smoke Chrome 156 em `play` por 2,5 s: WASM ativo e zero exceções; 22 `drawImage` durante construção/crops de textura, 7 `createImageData`, 4 `clearRect`, uma medição e um desenho de texto de clima cacheado. Não apareceram `fillRect` nem `createPattern` residuais nesse smoke após a composição do piso.
- Sem benchmark de frame time/FPS ou revisão visual ampla.

## Preview Rust/WASM local v141.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou; `renderer.wasm`: **175.939 bytes**.
- `node tests/wasm-renderer.cjs`: passou; `node tests/wasm-renderer-browser.cjs`: passou; `node tests/regression.cjs`: **80/80**.
- `node tests/wasm-floor-pixel-parity.cjs`: Chrome 156, Apartamento 1440×900 e cinco salas. RNG coincidente; 335.188/5.184.000 canais diferiram, diferença máxima 3 e média 0,1937; teste aplica máximo 3 e média ≤0,2. Renderer ativo; sem exceções JavaScript.
- Sem benchmark de frame time/FPS e sem revisão visual ampla.

## Preview Rust/WASM local v140.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou; `renderer.wasm` com **174.197 bytes**. ABI, browser bridge e regressões: **80/80**.
- Chrome 156: Apartamento em `play`, WASM ativo e sem exceções. Granulado RGBA Rust comparado em 1440×900 com 8.100 specks: **0/5.184.000 canais diferentes**, estado RNG igual.
- Sem benchmark ou inspeção visual ampla; rasterização de outras camadas ainda usa Canvas/host.

## Preview Rust/WASM local v139.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou; `renderer.wasm` com **172.601 bytes**. ABI e browser bridge passaram; regressões: **80/80**.
- Chrome 156: Apartamento em `play`, renderer ativo e sem exceções. Comparação sintética dos gradientes Rust/Canvas: escada, elevador, porta esquerda e porta direita tiveram diferença máxima de **1/255 por canal**.
- Sem validação visual ampla nem benchmark.

## Preview Rust/WASM local v138.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou; `renderer.wasm` com **172.601 bytes**.
- `node tests/wasm-renderer.cjs` passou; `node tests/wasm-renderer-browser.cjs` passou; `node tests/regression.cjs`: **80/80**.
- Fallback Canvas preservado. Sem smoke de navegador real, validação visual ampla ou benchmark nesta etapa.

## Preview Rust/WASM local v137.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou; `renderer.wasm` com **171.352 bytes**.
- ABI e browser bridge passaram; regressões completas: **79/79**. A saída gera RGBA em Rust, reutiliza imagem e preserva fallback.
- Chrome 156: Apartamento em `play`, WASM ativo, zero exceções; saída real de 188×70 dentro do limite do backend. Sprite 100×40 comparado ao gradiente Canvas: diferença máxima de alpha 1/255 e RGB 8 níveis.
- Sem validação visual ampla nem benchmark.

## Preview Rust/WASM local v136.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou; binário `renderer.wasm` com **170.517 bytes**.
- ABI e browser bridge passaram, incluindo sprite radial, clarão reutilizável e fallback. Regressões completas: **78/78**.
- Chrome 156: WASM ativo, Apartamento em `play`, desenho sintético de muzzle flash passou e zero exceções. O sprite de 128×128 teve alpha idêntico à referência Canvas e diferença máxima de cor de 8 níveis em pixels visíveis.
- Sem comparação de combate renderizado ou benchmark de desempenho.

## Preview Rust/WASM local v135.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou; binário `renderer.wasm` com **169.533 bytes**.
- ABI Rust, browser bridge e regressões completas passaram (**77/77**).
- Chrome 156: WASM ativo, Apartamento em `play`, zero exceções. Comparação sintética do sprite radial (raio 65,5): mesmo pixel central e diferença máxima de alpha de 1/255. Varredura numérica amostrou 3.300 raios e 500 pixels por raio sem alteração no alpha arredondado.
- Não houve validação visual ampla nem benchmark de desempenho.

## Preview Rust/WASM local v134.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou; script agora interrompe e reporta falhas nativas do Cargo antes de copiar o binário.
- Regressões completas: **77/77 passaram**; testes ABI Rust e browser bridge passaram, incluindo pixels radiais, validação de entradas e fallback.
- Smoke Chrome 156: Apartamento iniciou em `play`, WASM ativo, zero exceções. Gradiente Canvas de referência comparado a sprite Rust: alpha diferiu no máximo 1 nível de 255, média 0,126; há pequenas diferenças de cor nos pixels translúcidos. Não houve comparação de gameplay visual completa.

## Preview Rust/WASM local v133.0 — 07/11/2026
- Build `wasm-renderer/build.ps1`: passou e atualizou `wasm-renderer/pkg/renderer.wasm`.
- Regressões completas: **76/76 passaram**; testes ABI Rust e browser bridge passaram, incluindo geometria do dealer/painéis e fallback Canvas.
- Smoke sintético no Chrome 156: fase iniciada, módulo WASM ativo, dealer mais três cards, sem exceções. A comparação de contadores do bridge não é validação visual nem medição de FPS.

## Preview Rust/WASM local v132.0 — 07/11/2026
- Regressões completas: **75/75 passaram**, incluindo os textos da loja e a preservação de alpha absoluto.
- `node tests/wasm-renderer.cjs`: passou. `node tests/wasm-renderer-browser.cjs`: passou, incluindo batch HUD e fallback. Sem smoke runtime, comparação visual ou medição de desempenho nesta versão.

## Preview Rust/WASM local v131.0 — 07/11/2026
- Regressões completas: **74/74 passaram**, incluindo o caminho Rust de texto direto, alpha herdado e fallback do rótulo de créditos.
- `node tests/wasm-renderer.cjs`: passou. `node tests/wasm-renderer-browser.cjs`: passou, com Canvas host verificando texto, ordem, estilo e alfa multiplicado.
- Smoke Chromium headless (Chrome 156) iniciou Apartamento, entrou em `play`, manteve WASM pronto/ativo e não registrou exceções. Em 2,5 s: 1 `fillText` residual de cache inicial de clima, nenhum `save`/`restore` residual e 22 `drawImage` da montagem inicial. Sem comparação visual lado a lado ou medição de desempenho.

## Preview Rust/WASM local v130.0 — 07/11/2026
- Regressões: **73/73 passaram**, incluindo a verificação de que o rótulo usa o batch HUD e mantém o tx() de fallback.
- `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs` passaram; WASM permaneceu em 165.499 bytes. Smoke Chromium em Apartamento: WASM pronto/ativo, fase 1 em `play`, zero exceções. Sem inspeção visual comparativa ou desempenho medido.

## Preview Rust/WASM local v129.0 — 07/11/2026
- ABI Rust/WASM e browser bridge passaram; regressões completas: **72/72 passaram**. O WASM não mudou de tamanho (165.499 bytes).
- Regressão verifica a guarda que preserva alpha quando o valor já é 1.
- Smoke Chromium desta versão permaneceu com status WASM loading; não conta como validação de runtime ou gameplay. Sem comparação visual ou medição de desempenho.

## Preview Rust/WASM local v128.0 — 07/11/2026
- Build release do alvo wasm32-unknown-unknown passou; WASM: **165.499 bytes**. ABI, browser bridge e regressões completas: **71/71 passaram**.
- Regressões verificam os comandos de save/restore nos stages 0, 1, 3 e 4, sequência de transforms e fallback.
- Smoke Chromium iniciou newGame em Apartamento e permaneceu em play durante a amostra; módulo pronto, 774 comandos de transformação e zero exceções. Sem inspeção visual comparativa ou medição de desempenho.

## Preview Rust/WASM local v127.0 — 06/11/2026
- Build binário inalterado (165.209 bytes); ABI Rust/WASM e browser bridge passaram; regressões completas: **70/70 passaram**.
- Regressão nova verifica o retorno sem efeitos e a existência do fallback aditivo para efeitos ativos.
- Smoke Chromium na tela inicial confirmou módulo WASM pronto por 89 quadros e zero exceções; globalCompositeOperation não recebeu escrita. Smoke separado chamou newGame em Apartamento, observou play e depois dead sem entrada do jogador, com WASM pronto, 706 chamadas Canvas residuais acumuladas e zero exceções. Não houve comparação visual nem medição de desempenho.

## Preview Rust/WASM local v126.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; ABI, browser bridge e regressões: **69/69 passaram**.
- Testes cobrem geometria e cor do preenchimento base, rejeição de dimensões inválidas e fallback Canvas integrado.
- Sem smoke visual após esta alteração ou medição de desempenho.

## Preview Rust/WASM local v125.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; ABI, browser bridge e regressões completas: **68/68 passaram**.
- Testes validam a rejeição de escala/suavização inválida, aplicação do estado do canvas e cache para evitar repetições; opção `wasmDiagnostics=1` valida contagem e amostra de operação residual.
- A auditoria Chromium anterior encontrou `setTransform` e setters de suavização por frame. Após a integração, a amostragem da tela inicial deixou essas operações ausentes do histograma residual durante 402 frames; ainda não há benchmark de tempo de quadro.

## Preview Rust/WASM local v123.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm`: **164.199 bytes**. ABI, browser bridge e regressões completas: **68/68 passaram**.
- Os testes cobrem geometria dos dois botões de pausa, cores, hover e rejeição de índice inválido; bridge verifica chamadas Canvas emitidas pelo batch.
- Smoke Chromium curto abriu uma fase; selo WASM ativo, 23.856 chamadas Canvas residuais e nenhuma exceção JavaScript observada; captura inspecionada em `C:\Users\victo\AppData\Local\Temp\cappe-v123-play-frame.png`.
- Sem comparação visual lado a lado, validação manual da pausa ou medição de desempenho.

## Preview Rust/WASM local v122.0 — 06/11/2026
- Binário WASM inalterado; ABI, browser bridge e regressões completas **68/68 passaram**.
- Smoke Chromium chamou `EXP.drawHUD` em pausa sintética; quatro textos chegaram ao batch Rust e não houve exceções JavaScript.
- Sem comparação visual ampla ou medição de desempenho.

## Preview Rust/WASM local v121.0 — 06/11/2026
- ABI, browser bridge e regressões completas: **68/68 passaram**; WASM permaneceu em **163.095 bytes**.
- Smoke Chromium chamou `EXP.drawHUD` com estado sintético de pente/recarga; dois textos passaram pelo batch, renderer ativo e zero exceções. Captura inspecionada.
- Sem comparação visual ampla ou medição de desempenho.

## Preview Rust/WASM local v120.0 — 06/11/2026
- Build release wasm32-unknown-unknown passou; `renderer.wasm` tem **163.095 bytes**.
- ABI e browser bridge verificam o overlay vermelho do Contrarrelógio, suas dimensões/alfa e supressão quando desativado.
- Regressões completas: **68/68 passaram**. Sem comparação visual ampla ou medição de desempenho.

## Preview Rust/WASM local v119.0 — 06/11/2026
- ABI, browser bridge e regressões completas: **68/68 passaram**; o binário WASM ficou em **162.939 bytes**.
- Smoke Chromium com `EXP.drawHUD` e estado sintético de Horda enviou o rótulo do modo mais título/subtítulo de um aviso (três itens) ao batch; renderer ativo e zero exceções. Captura inspecionada.
- Sem comparação visual ampla ou medição de desempenho.

## Preview Rust/WASM local v118.0 — 06/11/2026
- O binário WASM permaneceu com **162.939 bytes**; ABI, browser bridge e regressões **68/68 passaram**.
- Smoke Chromium em jogo iniciado chamou `EXP.drawHUD` com um aviso sintético: dois textos chegaram ao batch HUD, ambos foram exibidos e não houve exceções JavaScript. Captura inspecionada.
- Sem comparação visual completa ou medição de desempenho.

## Preview Rust/WASM local v117.0 — 06/11/2026
- Build release wasm32-unknown-unknown passou; `renderer.wasm` tem **162.939 bytes**.
- ABI verifica dois retângulos da barra de recarga com proporção de progresso e dimensões preservadas.
- Browser bridge verifica cores, tamanho, ordem e restauração do estado Canvas.
- Regressões completas: **68/68 passaram**. Sem comparação visual ampla ou medição de desempenho.

## Preview Rust/WASM local v116.0 — 06/11/2026
- Build release wasm32-unknown-unknown passou; `renderer.wasm` tem **162.668 bytes**.
- ABI cobre coordenadas rotacionadas dos três vértices e rejeita transformações não finitas sem emitir callback parcial.
- Browser bridge verifica a sequência Canvas do triângulo rosa e preserva fallback para entradas inválidas.
- Regressões completas: **68/68 passaram**. Não foi feita comparação visual ampla nem medição de desempenho nesta iteração.

## Preview Rust/WASM local v115.0 — 06/11/2026
- Build release wasm32-unknown-unknown passou; `renderer.wasm` tem **162.121 bytes**.
- ABI verifica a ordem e geometria do fundo, preenchimento, marcadores de fase e contorno, além de rejeição de fase inválida ou excesso de capacidade.
- Browser bridge verifica dimensões, proporção de vida, marcadores, cor dinâmica do chefe, ordem Canvas e fallback para dados inválidos.
- Regressões completas: **68/68 passaram**. Smoke Chromium sintético confirmou `drawBossHealthBar` com renderer pronto e zero exceções; sem comparação visual ampla ou desempenho medido.

## Preview Rust/WASM local v114.0 — 06/11/2026
- Build release wasm32-unknown-unknown passou; renderer.wasm tem **160.939 bytes**.
- ABI valida painéis de vidro, reflexos temporizados e estilhaços, incluindo rejeição de entradas inválidas sem comandos parciais.
- Browser bridge verifica Canvas fill/stroke, transformações dos estilhaços, cores/alfa e fallback; regressões **68/68 passaram**.
- Smoke Chromium integrado em Apartamento chamou o batch de vidro 172 vezes, mostrou painel/estilhaço sintéticos e não registrou exceções; captura inspecionada. Sem comparação ampla ou desempenho medido.

## Preview Rust/WASM local v113.0 — 06/11/2026
- Build release wasm32-unknown-unknown passou; renderer.wasm tem **154.462 bytes**.
- ABI valida transformações de screen shake, coice, shake de câmera e o enquadramento/zoom do mundo; entradas inválidas não emitem comandos parciais.
- Browser bridge verifica ordem de translate/scale e fallback; regressões **67/67 passaram**.
- Smoke Chromium headless em Apartamento: renderer WASM ativo, 316 transformações acumuladas, câmera/inimigos/barris em execução e zero exceções; captura inspecionada. Sem comparação ampla ou desempenho medido.

## Preview Rust/WASM local v112.0 — 06/11/2026
- Build release wasm32-unknown-unknown passou; renderer.wasm tem **153.741 bytes**.
- node tests/wasm-renderer.cjs passou, cobrindo ABI Canvas e batches do renderer.
- node tests/wasm-renderer-browser.cjs passou, cobrindo a ponte Rust/browser e os fallbacks.
- node tests/regression.cjs: **67/67 passaram**, incluindo os dois estágios de transformação.
- Smoke Chromium headless em Apartamento: 24 transformações acumuladas, renderer WASM ativo, zero exceções; captura inspecionada. Sem comparação lado a lado ou medição de desempenho.

## Preview Rust/WASM local v111.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem **152.256 bytes**.
- ABI cobre contornos e variações de blindado, líder, sniper e chefe, cores dinâmicas, vetores, linha tracejada, limites e equilíbrio de `save/restore`.
- Browser bridge verifica primitivas Canvas, cores da classe, paleta, traço tracejado, filtros e fallback para geometria inválida.
- `node tests/regression.cjs`: **66/66 passaram**. Smoke Chromium em Apartamento chamou `EXP.worldDraw` com quatro classes sintéticas, registrou quatro candidatos, zero exceções; captura inspecionada. Sem medição de desempenho.

## Preview Rust/WASM local v110.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem **146.848 bytes**.
- ABI valida quantidade de câmeras, coordenadas dos 13 vértices, estados de alarme, caminho fechado do setor e saves/restores do Canvas.
- Browser bridge verifica setor, corpo, lente, transformação, contador e fallback para dados incompletos.
- `node tests/regression.cjs`: **65/65 passaram**. Smoke Chromium em Apartamento com câmera sintética chamou `EXP.worldDraw` durante `play`, registrou um batch de câmera, 92 chamadas acumuladas de barril e zero exceções; captura inspecionada. Sem medição de desempenho.

## Preview Rust/WASM local v109.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem **140.778 bytes**.
- `node tests/wasm-renderer.cjs` passou: ABI verifica capacidade, cores, geometria, pisca por timer e sequência balanceada de Canvas.
- `node tests/wasm-renderer-browser.cjs` passou: bridge verifica arcos, faixas, transformações, contador e fallback para barril inválido.
- `node tests/regression.cjs`: **64/64 passaram**. Não houve smoke visual específico de barris nem medição de desempenho.

## Preview Rust/WASM local v108.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem **137.331 bytes**.
- ABI verifica posição, raio fixo, largura, opacidade pulsante, preenchimento e rejeição de relógio inválido.
- Browser bridge verifica o arco, stroke/fill Canvas, contador e fallback para entrada inválida.
- `node tests/regression.cjs`: **63/63 passaram**, incluindo integração `EXP.drawWorld` e versões de cache/health endpoint.
- Não foi realizado smoke visual do modo Invasão; não há comparação JS/WASM nem FPS medido.

## Preview Rust/WASM local v107.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem **136.532 bytes**.
- `node tests/wasm-renderer.cjs` passou; ABI cobre raios, espessuras, alfa, cores, slots inativos, valores inválidos e limite de 14 anéis.
- `node tests/wasm-renderer-browser.cjs` passou; a ponte simulada confirma comandos Canvas e preservação do estado/fallback.
- `node tests/regression.cjs`: **62/62 passaram**, incluindo ligação do `EXP.worldDraw` ao batch e versões do cache/health endpoint.
- Smoke headless Chromium em Apartamento confirmou estado `play`, renderer `ready`, anel visível em P1, 24 comandos acumulados e zero exceções; captura inspecionada. Não houve comparação lado a lado nem medição de FPS.

## Preview Rust/WASM local v106.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem **135.441 bytes**.
- ABI, browser bridge e regressões **61/61** passaram; teste cobre estágio da etiqueta, dimensões cacheadas, posição, rasterização por imagem e fallback.
- Smoke headless iniciou Chrome e conectou DevTools, mas a página não respondeu a `Runtime.evaluate`; não há captura nem confirmação visual da etiqueta v106.

## Preview Rust/WASM local v105.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem **135.292 bytes**.
- ABI verifica timer ativo/expirado e posição; browser bridge verifica texto, fonte, cor, alinhamento e métrica. Regressões: **61/61 passaram**; cache/health identificam v105.
- Smoke Chromium em Apartamento mostrou `ALARME ATIVO · 11 s` em `play`, gerou 40 comandos e não teve exceções; captura inspecionada. Sem comparação lado a lado ou FPS.

## Preview Rust/WASM local v104.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem **134.868 bytes**.
- ABI, browser bridge e regressões **61/61** passaram; cobertura inclui seleção CRT, estágio ausente sem jogador, posição do retrato, rasterização por handles e fallback.
- Smoke Chromium em Apartamento emitiu 48 comandos de imagem, permaneceu em `play` e não teve exceções; captura inspecionada. Sem validação lado a lado ou FPS.

## Preview Rust/WASM local v103.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem **134.171 bytes**.
- `node tests/wasm-renderer.cjs` verifica limiar e pulso de combo no ABI.
- `node tests/wasm-renderer-browser.cjs` verifica transform, texto, stroke/fill e ordem no Canvas.
- `node tests/regression.cjs`: **61/61 passaram**; cache offline e health endpoint identificam v103.
- Smoke Chromium em 1280×900 forçou combo 5X em Apartamento durante `play`: renderer `ready`, 13 comandos, zero exceções; captura inspecionada. Sem FPS.

## Preview Rust/WASM local v102.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem **133.635 bytes**.
- `node tests/wasm-renderer.cjs` passou, incluindo projeção/raios da lanterna e rejeição de entrada inválida.
- `node tests/wasm-renderer-browser.cjs` passou, incluindo composição e geometria no canvas de escuridão.
- `node tests/regression.cjs`: **61/61 passaram**; cache offline e health endpoint identificam v102.
- Smoke Chromium em 1280×900 forçou apagão e disparo em Apartamento durante `play`: renderer `ready`, 17 comandos, zero exceções; captura inspecionada. Sem paridade visual JS/WASM lado a lado nem FPS.

## Preview Rust/WASM local v101.0 — 06/11/2026
- Smoke Chromium em Apartamento: Renderer `ready`, 115 comandos de luz, estado `play`, zero exceções; captura inspecionada. ABI e bridge passaram; regressões 61/61.
- Sem comparação JS/WASM lado a lado ou FPS.

## Preview Rust/WASM local v100.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem 130.409 bytes.
- `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs` passaram, incluindo ordem/alfa de flashes, opção reduzir flashes, pulso do alarme, geometria de barras e fallback.
- `node tests/regression.cjs`: **61/61 passaram**; cache offline e health endpoint identificam v100.
- Smoke Chromium em 1280×900 forçou chuva, clarões, alarme e transição de cinema em Apartamento durante `play`: renderer `ready`, 79 comandos de overlay, zero exceções JavaScript; captura inspecionada. Sem comparação JS/WASM lado a lado nem FPS.

## Preview Rust/WASM local v99.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem 128.551 bytes.
- ABI, browser bridge e regressões 61/61 passaram; casos incluíram posições, estilo/alfa, corte por qualidade, validação de tempo, drawImage em batch e fallback da névoa/fumaça.
- Smoke Chromium em `play` emitiu 111 placements em 37 quadros, zero exceções e captura inspecionada. Sem comparação JS/WASM lado a lado ou FPS.

## Preview Rust/WASM local v98.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem 127.582 bytes.
- `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs` passaram; cobrem alpha sinusoidal com aproximação Rust, filtros, ordem, desenho de quadrados, save/restore e fallback.
- `node tests/regression.cjs`: **61/61 passaram**; cache offline e health endpoint identificam v98.
- Smoke Chromium em 1280×900 forçou poeira em Apartamento durante `play`: renderer `ready`, 2.592 comandos emitidos, zero exceções JavaScript; captura inspecionada. Sem comparação JS/WASM lado a lado nem FPS.

## Preview Rust/WASM local v97.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` tem 126.577 bytes.
- `node tests/wasm-renderer.cjs`: passou, incluindo seleção por stride, geometria inclinada, ordem, filtragem de entradas inválidas e limite de 256 gotas no ABI.
- `node tests/wasm-renderer-browser.cjs`: passou, incluindo um único caminho Canvas, save/restore e fallback para dados inválidos.
- `node tests/regression.cjs`: **61/61 passaram**; cache offline e health endpoint identificam v97.
- Smoke Chromium em 1280×900 forçou chuva em Apartamento durante `play`: renderer `ready`, 6.240 segmentos emitidos, zero exceções JavaScript; captura inspecionada. Isso valida a camada de chuva isoladamente, sem comparação JS/WASM lado a lado nem FPS.

## Preview Rust/WASM local v96.0 — 06/11/2026
- Build release `wasm32-unknown-unknown` passou; `renderer.wasm` foi recompilado (125.931 bytes).
- `node tests/wasm-renderer.cjs`: passou, cobrindo batch de texto HUD, filtro de entrada inválida e rejeição acima da capacidade.
- `node tests/wasm-renderer-browser.cjs`: passou, cobrindo passagem ordenada para o painter `tx()` cacheado.
- `node tests/regression.cjs`: **61/61 passaram**; cache offline e health endpoint identificam v96.
- Chrome headless com viewport 1280×720: renderer `ready/active`, campanha entrou em `play` no Apartamento (nível 1), nenhuma exceção em `window.__earlyErrors`; captura PNG inspecionada e selo compacto sem sobrepor o retrato. É um smoke curto, não valida paridade lado a lado, campanha completa, todos os mapas/modos ou desempenho.

## Preview Rust/WASM local v95.0 — 06/11/2026
- Build release para wasm32 passou; artefato `wasm-renderer/pkg/renderer.wasm` recompilado.
- Testes ABI Rust/WASM e browser bridge passaram; color grade valida modos soft-light/overlay, cores, dimensões, ordem e save/restore; fade/flash valida alfas, opção noflash e ordem final; formas HUD validam barra, moldura e véu de pausa, incluindo timer não finito; rastros validam sombra, transform, alfa, arma e ordem em lote.
- `node tests/regression.cjs`: 61/61 passaram. Sem validação visual, comparação de imagem ou medição de FPS.

## Preview Rust/WASM local v76.0 — 06/11/2026
- Build Rust/WASM offline passou; o artefato recompilado contém `draw_neon_doors` e `neon_doors_ptr` (102.586 bytes).
- `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs`: passaram, cobrindo rotação base + abertura, offsets e handles de sprite em lote.
- `node tests/regression.cjs`: **61/61 passaram**, incluindo integração das portas Neon, cache v76 e endpoint health v76.
- Smoke Chromium para mapa Neon não executou: o ambiente negou acesso ao socket loopback do DevTools. Não há screenshot nem validação visual desta iteração. Sem comparação lado a lado ou medição de FPS.

## Preview Rust/WASM local v75.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; `renderer.wasm` atualizado (101.508 bytes).
- `node tests/wasm-renderer.cjs`: passou; valida exportação FTILES, ordem de salas, exclusão do corredor e translação do padrão.
- `node tests/wasm-renderer-browser.cjs`: passou; valida criação do padrão no host, clipping, fills e contador de comandos; fallback continua disponível.
- `node tests/regression.cjs`: **60/60 passaram**, incluindo integração FTILES, cache v75 e health endpoint v75.
- Smoke Chrome headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 168.972 primitivas de piso, 16.516 comandos de acabamento, 13 comandos de textura do piso, 135 de texturas do mapa, assets WALLT/FURNT/DOORT carregados, 1.273 comandos de mapa, 70 de decor, quatro de vidro e zero exceções.
- Screenshot inspecionada. Sem comparação lado a lado, campanha completa ou medição de FPS.

## Preview Rust/WASM local v74.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; WASM incluído (101.139 bytes).
- `node tests/wasm-renderer.cjs`: passou; valida escolha/ordem/geometria de texturas e decalques das aberturas.
- `node tests/wasm-renderer-browser.cjs`: passou; verifica padrões, recortes de textura e desenho de decalques no Canvas host.
- `node tests/regression.cjs`: **59/59 passaram**, incluindo fallback de `buildFloor`, cache offline e endpoint v74.
- Smoke Chromium headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 168.972 primitivas de piso, 16.516 comandos de acabamento, 135 comandos de texturas do mapa, assets WALLT/FURNT/DOORT carregados, 1.339 comandos de mapa, 70 de decor, quatro de vidro, 1.054 de móveis, 4.560 de portas e zero exceções.
- Screenshot inspecionada. Sem comparação lado a lado, campanha completa ou medição de FPS.

## Preview Rust/WASM local v73.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; WASM incluído (99.571 bytes).
- `node tests/wasm-renderer.cjs`: passou; compara o RNG e as posições/tamanhos do granulado, além da ordem e geometria de sombras e rejunte.
- `node tests/wasm-renderer-browser.cjs`: passou; verifica execução em lote pelo host Canvas e a contagem de acabamento.
- `node tests/regression.cjs`: **58/58 passaram**, incluindo buildFloor, cache offline e endpoint v73.
- Smoke Chromium headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 168.972 primitivas de piso, 16.516 comandos de acabamento, 1.309 comandos de mapa, 70 de decor, quatro comandos de vidro no diagnóstico, 1.054 de móveis, 4.260 de portas, 3.692 de corpo de jogador, 1.739 de corpo inimigo, dois textos inimigos e zero exceções.
- Screenshot inspecionada. Sem comparação lado a lado, campanha completa ou medição de FPS.

## Preview Rust/WASM local v72.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; WASM incluído (97.845 bytes).
- `node tests/wasm-renderer.cjs`: passou; inclui painéis intactos e geometria/alpha dos estilhaços.
- `node tests/wasm-renderer-browser.cjs`: passou; confirma as primitivas Canvas do vidro e a contagem do lote.
- `node tests/regression.cjs`: **57/57 passaram**, incluindo cache offline e endpoint v72.
- Smoke Chromium headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 152.456 primitivas de piso, 1.345 comandos de mapa, 70 de decoração, quatro comandos de vidro no diagnóstico, 1.054 comandos de móveis, 4.620 de portas, 4.004 de corpo de jogador, 1.607 de corpo de inimigo, dois textos de inimigo e zero exceções.
- Screenshot inspecionada. Sem comparação lado a lado, campanha completa ou medição de FPS.

## Preview Rust/WASM local v71.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; WASM incluído (97.332 bytes).
- `node tests/wasm-renderer.cjs`: passou; valida fundo fixo, ausência de fundo para mapa procedural, overlay, geometria de tapete e decor.
- `node tests/wasm-renderer-browser.cjs`: passou; valida execução no host Canvas, cores e contagem de decoração.
- `node tests/regression.cjs`: **57/57 passaram**, incluindo cache offline e endpoint v71.
- Smoke Chromium headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 152.456 retângulos de piso, 879 comandos de mapa, 70 comandos de decoração, 1.054 de móveis, 4.560 portas, 3.952 comandos de jogador, 1.403 de corpo inimigo, dois textos inimigos e zero exceções.
- Screenshot inspecionada. Sem comparação lado a lado, campanha completa ou medição de FPS.

## Preview Rust/WASM local v70.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; binário WASM do pacote recompilado (96.728 bytes).
- `node tests/wasm-renderer.cjs`: passou; verifica comandos e posições dos rótulos de stun/suspeita, nocaute e alerta, além de geometria anterior.
- `node tests/wasm-renderer-browser.cjs`: passou; host executa quatro comandos de texto pelo painter cacheado e preserva a ordem no buffer.
- `node tests/regression.cjs`: **57/57 passaram**, incluindo cache offline e endpoint v70.
- Smoke Chromium headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 4.056 comandos de jogador, 1.540 de corpo inimigo, 240 sombras, dois comandos de texto no diagnóstico e zero exceções JavaScript.
- Screenshot inspecionada. Não houve comparação lado a lado com o caminho JS, sessão manual de campanha ou medição de FPS.

## Preview Rust/WASM local v69.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; binário WASM distribuído tem 95.937 bytes.
- `node tests/wasm-renderer.cjs`: passou; verifica seis arcos por inimigo atordoado, raios/posição orbital e ausência de arcos em inimigo sem stun.
- `node tests/wasm-renderer-browser.cjs`: passou; host executa os arcos Rust uma vez e mantém o texto de stun sem chamar a geometria JavaScript duplicada.
- `node tests/regression.cjs`: **57/57 passaram**, incluindo health endpoint e cache v69.
- Smoke Chromium headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 3.952 comandos de jogador, 1.401 de corpo inimigo, 229 sombras, stun exercitado e zero exceções JavaScript.
- Screenshot inspecionada. Não houve comparação lado a lado com o caminho JS, teste manual de campanha ou medição de FPS.

## Preview Rust/WASM local v68.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; binário WASM do pacote atualizado (92.749 bytes).
- `node tests/wasm-renderer.cjs`: passou, incluindo lotes Rust completos de jogador, ordem arma/aura/sprite/tag, caminhos fallback e spritesheet, além das regressões anteriores de geometria e pixels.
- `node tests/wasm-renderer-browser.cjs`: passou, cobrindo execução do lote Canvas, recortes P1/P2, cores de skin, marcadores e fluxo procedural.
- `node tests/regression.cjs`: **57/57 passaram**, incluindo a atualização do cache offline e versão do endpoint.
- Smoke Chromium headless, perfil limpo: renderer `ready`, estado `play`, nível 1 `Apartamento`, 4.056 comandos de jogador, 1.812 de corpo inimigo, 302 sombras inimigas, stun exercitado e zero exceções JavaScript.
- Captura PNG da sessão foi inspecionada. Não houve comparação lado a lado com o caminho JS, sessão longa, teste manual de P2/remoto nem medição de FPS.

## Preview Rust/WASM local v67.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; o WASM distribuído foi atualizado.
- `node tests/wasm-renderer.cjs`: passou, cobrindo buffer de comandos de corpo, fallback geométrico, transforms/alpha de nocaute e célula animada do spritesheet.
- `node tests/wasm-renderer-browser.cjs`: passou; o host executa o lote Rust de corpo antes dos eventos seguintes, mantém sombra antes do corpo, sem chamar o painter JS de corpo.
- `node tests/regression.cjs`: **57/57 passaram**.
- Chrome headless em Apartamento, nível 1: renderer `ready`, `play`, 1.855 comandos de corpo e 265 sombras de inimigos, stun exercitado e zero exceções JS. Captura gerada e inspecionada; não foi feita comparação lado a lado com o renderer JS.
- Não houve medição de FPS.

## Preview Rust/WASM local v66.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; o `renderer.wasm` incluído no pacote foi atualizado.
- `node tests/wasm-renderer.cjs`: passou; valida buffers Rust da sombra de cada inimigo visível, posições, dimensões, alpha 0.55 em nocaute, reset e ordem dos eventos.
- `node tests/wasm-renderer-browser.cjs`: passou; valida execução da sombra no host Canvas antes do corpo e sinaliza para o painter não duplicar a sombra.
- `node tests/regression.cjs`: **57/57 passaram**, incluindo fallback JS da sombra inimiga, health endpoint e versão do cache offline.
- Chrome headless, perfil v66: Renderer `ready`, estado `play`, nível 1 “Apartamento”, 293 comandos de sombra inimiga, um stun e zero exceções JS; os seletores de frame e o fallback procedural 24×24 também foram exercitados.
- Captura PNG foi gerada fora do pacote, sem revisão visual manual. Não houve medição de FPS.

## Preview Rust/WASM local v65.0 — 05/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou.
- `node tests/wasm-renderer.cjs`: passou, incluindo comandos da sombra/aura P1/P2 e da preferência alternativa de sombra.
- `node tests/wasm-renderer-browser.cjs`: passou; confirma elipses/cor da aura no host Canvas simulado.
- `node tests/regression.cjs`: 57/57 passaram, incluindo o uso do painter WASM dentro de `drawOnePlayer`.
- Chrome headless em perfil limpo: renderer `ready`, jogo em `play`, fase 1 `Apartamento`, 152.456 primitivas de piso, 807 comandos de mapa, 1.054 de móveis, 3.631 de armas, 4.380 de portas, 730 comandos de sombra/aura do jogador, um efeito de atordoamento, frames `[2,3]` do ataque do jogador e `[2,1]` do inimigo, frame procedural 24×24 e zero exceções JS.
- Captura PNG gerada fora do projeto; sem revisão visual manual e sem medição de FPS.

## Preview Rust/WASM local v64.0 — 05/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou.
- `node tests/wasm-renderer.cjs`: passou; cobre seleção da célula do spritesheet do jogador nos quatro estados/fases/limiares de ataque e a cadência de 110 ms dos frames de inimigos.
- `node tests/wasm-renderer-browser.cjs`: passou, incluindo a ponte de seleção de células dos dois spritesheets.
- `node tests/regression.cjs`: 57/57 passaram, incluindo integração de `drawOnePlayer` com a célula selecionada pelo bridge e regressões de campanha, mapas, save e multiplayer.
- Chrome headless em perfil limpo: renderer `ready`, jogo em `play`, fase 1 `Apartamento`, 152.456 primitivas de piso, 807 comandos de mapa, 1.054 de móveis, 1.609 de armas, 1.920 de portas, um efeito de atordoamento, frames `[2,3]` do ataque do jogador e `[2,1]` do inimigo, frame procedural 24×24 e zero exceções JS.
- Captura PNG gerada fora do projeto; sem revisão visual manual e sem medição de FPS.

## Preview Rust/WASM local v63.0 — 05/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou.
- `node tests/wasm-renderer.cjs`: passou; valida ABI, visibilidade e ordem dos inimigos pelo buffer de eventos, geração de piso e geometria das camadas portadas.
- `node tests/wasm-renderer-browser.cjs`: passou; valida consumo dos eventos e integração com o host Canvas simulado.
- `node tests/regression.cjs`: 57/57 passaram, incluindo campanha/mapas, saves, multiplayer e verificações gerais.
- Chrome headless em perfil limpo: renderer `ready`, estado `play`, fase 1 `Apartamento`, 152.456 primitivas de piso, 807 comandos de mapa, 1.054 de móveis, 1.994 de armas, 2.400 de portas, um efeito de atordoamento exercitado, frame procedural 24×24 e zero exceções JavaScript.
- PNG de captura gerado fora da cópia do projeto; sem revisão visual manual e sem medição de FPS.

## Preview Rust/WASM local v62.0 — 05/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou.
- `node tests/wasm-renderer.cjs`: passou, incluindo casos de porta vertical/horizontal com e sem painel texturizado.
- `node tests/wasm-renderer-browser.cjs`: passou, incluindo transformação e desenho de portas no Canvas simulado.
- `node tests/regression.cjs`: 57/57 aprovadas.
- Chrome headless: Apartamento em `play`, renderer `ready`, 152.456 primitivas de piso, 1.054 comandos de móveis, 1.382 de armas, 1.680 de portas, frame procedural 24×24 e zero exceções JS. Captura atualizada em `wasm-gameplay-preview.png` fora do pacote.
- Isso confirma abertura da primeira fase; não substitui uma sessão manual completa de todos os mapas/modos.
- Sem medição de FPS.

## Preview Rust/WASM local v61.0 — 05/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; o binário do pacote foi atualizado.
- `node tests/wasm-renderer.cjs`: passou com paridade pixel a pixel dos frames do jogador em quatro paletas, todos os estados/fases e ataques, além das regressões de piso, mapa, inimigos, móveis e comandos de 24 variantes de arma.
- `node tests/wasm-renderer-browser.cjs`: passou, incluindo geração/envio do buffer de pixels e comandos de ícone ao Canvas simulado.
- `node tests/regression.cjs`: 57/57 aprovadas.
- Chrome headless: fase 1 “Apartamento” em `play`, renderer `ready`, 152.456 primitivos de piso, 1.054 comandos de móveis, cerca de 2,1 mil comandos de armas, frame procedural de 24×24 e zero exceções JS. Captura salva fora do pacote em `wasm-gameplay-preview.png`.
- A captura confirma uma abertura da fase; não substitui teste manual completo. Não houve benchmark FPS.
- Sem medição de FPS.

## Preview Rust/WASM local v57.0 — 05/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou sem dependências externas.
- `node tests/wasm-renderer.cjs`: ABI de dispatch, setter, propagação de erro, culling/ordem de inimigos, equivalência aleatória de piso/sala, geometria do azulejo, sombras e geometria de paredes/postes passaram.
- `node tests/wasm-renderer-browser.cjs`: métodos Canvas, setter, gradiente, callbacks de piso/mapa/parede, recorte de tijolo e selo/status passaram em protótipos simulados no Node.
- `node tests/regression.cjs`: 57/57.
- Captura headless de Chrome: fase 1 “Apartamento” abriu em `play`, renderer `ready`, 152.456 primitivos de piso e 282 comandos de detalhes estáticos; zero exceções JavaScript. Não substitui sessões manuais completas.
- Sem medição de FPS.
## Execução v55.0 — 05/11/2026
node tests/regression.cjs: 57/57 PASS. A cobertura nova valida as allowlists fixas/grade/Neon, títulos sem dimensões (incluindo o caso Trailer 640 x 580), remoção de testes/protótipos da experiência ativa, referências e ordem da campanha, e construção de spawns/colisões/saídas em todos os mapas permitidos. Também confirma que tiles e objetos fonte dos mapas Neon permanecem iguais após a montagem.

Não houve validação visual em navegador nem medição de desempenho nesta iteração. As verificações de mapa usam runtime de colisão e canvas simulado.

## Execução v54.0 — 05/11/2026
`node tests/regression.cjs`: **55/55 PASS**. Inclui teste de fogo amigo que verifica origem P1/P2, opção ligada/desligada, alvo fora do alcance e jogador morto. Todos os testes anteriores permanecem aprovados.

Não houve validação manual em navegador nesta iteração. O teste de fogo amigo executa a lógica isolada e verifica a integração no fluxo de atualização por regressão estática. Campanha completa, online entre dispositivos, áudio, service worker offline real e FPS continuam pendentes.

## Execução v53.0 — 05/11/2026
`node tests/regression.cjs`: **54/54 PASS**. A verificação de mapas Neon agora monta cada um dos 72 mapas e confirma spawn de jogador, colisão livre para cada inimigo e pickup. Sintaxe, servidor, service worker, saves, controles e demais regressões permanecem na suíte.

Chromium via servidor local: auditoria dos 72 mapas encontrou inicialmente pelo menos uma entidade sobre parede em 51 mapas; após a correção, os 72 foram montados com 720 inimigos e 84 armas no chão, zero posições bloqueadas. Nenhuma exceção JavaScript. Os 17 mapas fixos iniciaram com spawn livre; após abrir portas, a busca de rota do spawn ao centro da saída alcançou todos os 17. Os modos visíveis abriram; campanha começou no capítulo/fase 1. Coop local: movimento dos dois jogadores e um disparo foram exercitados. Uma fase inicial foi aberta e controles básicos foram exercitados, mas não concluída até vitória.

Limites: não foram jogadas fases intermediária/final até o fim; multiplayer online em duas máquinas, áudio, instalação/offline real do service worker, sessões longas e FPS não foram validados. A requisição remota de Google Fonts registra falha de túnel neste ambiente; sem exceções de script observadas.

## Linha de base histórica (v44)
Resultado: **44/44 PASS** em runtime Node integrado ao Codex. Os testes exercitam o handler HTTP diretamente com requisições/respostas simuladas, além das regras internas e sintaxe. Não foi possível testar TCP/loopback real: o ambiente nega conexões locais com EACCES e não disponibiliza `node` no terminal PowerShell. Repita `node tests/regression.cjs` com Node.js 18+.
Cobertura cumulativa até v53 inclui spawns cooperativos referenciados no jogador vivo, início protegido da primeira fase, bloqueio de avanço duplicado, remoção do reinício por R, filtro de mapas equivalentes a 640×580, portas geradas nas aberturas de paredes, colisão das portas procedurais e reset das portas em mapas fixos, seleção de alvo vivo na IA cooperativa, captura de erros iniciais, janelas quebráveis, perímetro Neon, silhuetas de armas, aviso discreto de desempenho, save futuro protegido, interpolação/expiração de avatar, limite de revisão, latência HTTP aproximada, cópia de código com fallback, redução de flashes, lobby DOM, segurança/API, saves, controles, mapas, preferências visuais e manifesto offline. O servidor e o service worker são exercitados com requisições/eventos simulados. Os testes do servidor continuam usando handler simulado; Chromium exercitou o servidor local, mas não foi validado TCP entre máquinas nem leitor de tela.
Cobertura: sintaxe dos módulos JS, servidor Node, service worker e blocos inline; servir index, health, rotas criar/entrar/reentrar/estado/sair e listagem pública de salas abertas/lotadas/ativas; entrada tardia bloqueada e presença expirada após 60 s; credencial secreta separada do estado público; long poll duplicado, tipos de payload, rate limit, expiração, autorização e relay; renderização do lobby com salas cheias/abertas usando DOM simulado e nomes tratados como texto; validação de preferências do jogo e do multiplayer local com tipo, faixa, enumeração e chave desconhecida; seleção do zoom padrão; exclusão da API do cache offline; cache atualizado v53; colisão nas quatro bordas, bloqueio de posição inválida, spawn cooperativo e spawn livre ao montar os 72 mapas Neon jogáveis; portas geradas em aberturas de mapas e reconstrução de sua colisão; persistência, cooperativo, controles, manifesto e navegação.
Os testes do service worker simulam CacheStorage/fetch/eventos. Não comprovam instalação, ciclo de vida e offline reais no Chrome.

## Comparação com original
Os mesmos testes foram avaliados contra os arquivos anteriores: 7 PASS / 18 FAIL (BASELINE_TEST_RESULTS.json). Três falhas são a ausência da nova API restoreBackup; o defeito antigo do botão foi identificado pela colisão EXP.reload no código. Os demais incluem comportamentos incorretos reproduzidos. Não tratar 18 testes como 18 bugs independentes.

## Desempenho sintético
`node tests/benchmark.cjs` — resultados em PERFORMANCE_BASELINE.json e interpretação em AI_PERFORMANCE.md.

## Pendentes atuais — navegador
- Jogar a fase 1 até vitória/morte; repetir em fase intermediária e final e conferir transições.
- Cooperativo local com P1/P2 em ações reais; jogo online entre dois clientes.
- Modos, chefes, loja, gamepad, volume, áudio, portas e efeitos visuais em sessões completas.
- Testar instalação real do service worker e recarga offline com /, index.html e ?dev=1, inclusive em subdiretório.
- Medir partida repetível por 60 s: frame times p50/p95/p99, update/draw, entidades, pathfinding, memória e áudio.

## Limitação concreta
As rotas foram testadas sem socket por causa da política que bloqueia loopback (EACCES). Não foi validada a experiência em dois navegadores/dispositivos, reconexão visual, console real ou FPS nesta rodada.

