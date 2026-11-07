# Cappe-in-Miami — contexto persistente
Atualizado em 07/11/2026. Iteração de renderer local: preview Rust/WASM v176.0; a base de gameplay continua v55.0. Os passes de color grade e fade/flash agora chamam o painter Rust direto; migração ainda híbrida.

## Identidade e restrições
Ação top-down em HTML, CSS e JavaScript, Canvas 2D e Web Audio. Preservar identidade, conteúdo, mapas, saves e recursos existentes. Objetivo: evolução incremental mensurável; referência de 60 FPS / 16,67 ms, sem alegar resultados sem medição.
A diretriz integral do proprietário está em AI_MASTER_DIRECTIVE.md. AGENTS.md estabelece o protocolo de retomada.

## Origem e estado
Origem histórica: Downloads/Cappe-in-Miami-main/Cappe-in-Miami-main/Cappe-in-Miami.zip. O ZIP original permanece intocado. Esta cópia experimental de migração fica em `.codex/visualizations`.
Não confundir versão atual do jogo (v55.0), versão antiga da pasta (v30) e formato do save (v2, mantido).

## Sistemas
Base e estados globais em index.html; módulos JS, 2 folhas CSS, 86 imagens existentes e server/server.js sem dependências. Expansões carregadas em ordem fixa. Memória do jogador em localStorage. Multiplayer local continua disponível; v36 acrescentou lobby Node e relay de posição para até dois navegadores.
Mapas pesados em maps.js (~2,93 MB), já com decodificação sob demanda. Há sistemas de navegação, IA por classes, chefes, máscaras, armas, perks, modos, vendedor e áudio sintetizado. Consulte AI_ARCHITECTURE.md e AI_FEATURES.md.

## Iteração atual

## Preview local Rust/WASM v175.0 — 07/11/2026
Projéteis agora passam seus comandos e os dois sprites ao painter Rust direto; o WASM legado mantém o posicionamento e identifica o proprietário. Chrome 156 confirmou chamada integrada e paridade RGBA exata; regressões 82/82. Build direta: 156.945 bytes WASM + 40.209 bytes glue. Sem benchmark ou validação visual ampla.

## Preview local Rust/WASM v174.0 — 07/11/2026
As imagens selecionadas para camadas do HUD agora tentam rasterização no painter Rust direto; seleção/posicionamento continuam no WASM legado e o callback Canvas JS é fallback. Chrome 156 confirmou chamada integrada e paridade RGBA exata; regressões 82/82. Build direta: 156.255 bytes WASM + 39.762 bytes glue. Sem benchmark ou validação visual ampla.

## Preview local Rust/WASM v173.0 — 07/11/2026
O rótulo do alarme agora tenta ser rasterizado pelo painter Rust direto; cálculo dos segundos e posicionamento seguem no WASM legado. Chrome 156 confirmou chamada integrada e paridade RGBA exata; regressões 82/82. Build direta: 155.645 bytes WASM + 39.337 bytes glue. Sem benchmark ou validação visual ampla.

## Preview local Rust/WASM v172.0 — 07/11/2026
O callback de texto de combo agora tenta rasterizar pelo painter Rust direto, preservando texto calculado no WASM legado e fallback Canvas. Chrome 156 confirmou callback integrado e paridade RGBA exata; regressões 82/82. Build direta: 154.919 bytes WASM + 38.768 bytes glue. Sem benchmark ou validação visual ampla.

## Preview local Rust/WASM v171.0 — 07/11/2026
O callback dos estojos de munição agora tenta desenhar os elipses do lote pelo módulo Rust direto; o WASM legado continua projetando posições e o Canvas JS permanece como fallback. Chrome 156 confirmou paridade RGBA exata e callback integrado; regressões 82/82. Build direta: 154.105 bytes WASM + 38.200 bytes glue. Sem benchmark ou validação visual ampla.

## Preview local Rust/WASM v170.0 — 07/11/2026
Flashes de disparo e arcos de impacto agora tentam rasterização Rust direta, preservando o callback Canvas como fallback. Chrome 156 confirmou paridade RGBA exata nos casos cobertos; regressões 82/82. Build direta: 153.386 bytes WASM + 37.706 bytes glue. Sem benchmark ou validação visual ampla.

## Preview local Rust/WASM v169.0 — 07/11/2026
Composição de escuridão/lanterna e combinação com o canvas de tela agora chamam Rust direto. Corrigida também a validação do WASM legado, que rejeitava `blackout=false`, `fireFlash=false` ou ângulo zero. Chrome 156 confirmou um callback integrado e paridade RGBA exata; regressões 82/82. Build direta: 152.262 bytes WASM + 37.257 bytes glue. Sem benchmark ou validação visual ampla.

## Preview local Rust/WASM v168.0 — 07/11/2026
Callbacks de névoa, luzes, anéis e zona de invasão passam primeiro ao módulo Rust direto; Canvas legado é fallback. Build direto: 150.178 bytes WASM + 36.608 bytes glue; regressões 82/82. Chrome 156 confirmou paridade RGBA exata nos quatro painters e estado Canvas restaurado. Sem benchmark ou validação visual ampla.

## Preview local Rust/WASM v167.0 — 07/11/2026
O painter direto também rasteriza os overlays F4/F6 de colisão e IA; JS continua preparando geometria e rótulos. Chrome 156: chamada no jogo confirmada e paridade RGBA sintética exata, incluindo restauração do estado Canvas. Build 145.565 bytes WASM + 34.732 bytes glue. Regressões 82/82 e teste focado passaram. Renderer segue híbrido, sem benchmark ou revisão visual ampla.

## Preview local Rust/WASM v166.0 — 07/11/2026
HUD de depuração `dev=1` desenha painel e erros pelo Rust direto. Build 143.436 bytes WASM + 33.762 bytes glue. Regressões 82/82, testes WASM/browser e pixel parity passaram. Renderer híbrido, sem benchmark ou revisão visual ampla.

## Preview local Rust/WASM v165.0 — 07/11/2026
Toasts diretos não provocam setter de alpha host redundante. Regressões 82/82, teste de desenho direto e pixel parity passaram. Smoke Chrome incluiu explosão controlada e não viu chamadas Canvas host nem writes de propriedades. Renderer permanece híbrido, sem benchmark, revisão visual ampla ou campanha completa.

## Preview local Rust/WASM v164.0 — 07/11/2026
Marcas circulares persistentes das explosões de barril chamam Rust direto; lógica continua no JS. Build 140.854 bytes WASM + 33.137 bytes glue. Regressões 82/82; ainda precisa repetir ABI/browser e pixel parity após esse painter. Renderer híbrido, sem benchmark ou revisão visual ampla.

## Preview local Rust/WASM v163.0 — 07/11/2026
Painter Rust direto cobre rastros persistentes de vidro quebrado e sombras de inimigos; estado, RNG e geometria de jogo ficam no JS. Build 140.256 bytes WASM + 32.738 bytes glue. Regressões 82/82, ABI/browser e pixel parity passaram. Migração híbrida, sem benchmark, revisão visual ampla ou campanha completa.

## Preview local Rust/WASM v162.0 — 07/11/2026
Sombras de inimigos em gameplay chamam Rust direto. Build 138.983 bytes WASM + 32.201 bytes glue; regressões 82/82, checks WASM/bridge e pixel parity passaram. O smoke observou 205 chamadas reais e paridade RGBA exata em três sombras. Renderer híbrido, sem benchmark, revisão visual ampla ou campanha completa.

## Preview local Rust/WASM v161.0 — 07/11/2026
`paintMap` configura suavização por Rust direto. Build 138.010 bytes WASM + 31.704 bytes glue; regressões 82/82 e checks ABI/browser/pixel parity passaram. Smoke Chrome curto: zero escritas de propriedade Canvas pelo host. Ainda híbrido, sem benchmark, revisão visual ampla ou campanha completa.

## Preview local Rust/WASM v160.0 — 07/11/2026
O batch de poeira agora salva e restaura o estado do contexto dentro do Rust, igual ao fallback, eliminando a correção de alpha por frame no JS. Chrome 156: paridade RGBA exata e smoke sem setter residual globalAlpha. Regressões 82/82 e testes WASM/browser/parity passaram. Build direto 138.078 bytes WASM + 31.452 bytes glue. Renderer segue híbrido; sem benchmark ou revisão visual ampla.

## Preview local Rust/WASM v159.0 — 07/11/2026
Composição recortada das camadas do mapa (incluindo alpha do sangue parado) e rasterização dos borrões, rastros e gotas ao derrotar inimigos agora chamam web-sys pelo módulo Rust. JS mantém câmera, simulação, RNG, geometria e fallback. Chrome 156: camada/crop e payload sintético de sangue com diferença RGBA zero; smoke chamou drawCanvasLayer repetidamente e um kill real aumentou o contador direto, sem quadraticCurveTo no host. Regressões 82/82, ABI/browser e pixel parity passaram. Build direto 137.834 bytes WASM + 31.452 bytes glue. Híbrido, sem benchmark, inspeção visual ampla ou campanha completa.

## Preview local Rust/WASM v158.0 — 07/11/2026
Geração de bitmaps cacheados de texto do clima e rótulos de estado de inimigo transferida a Rust/WebSys, mantendo cache, chamada e fallback JS. Chrome 156: ambos os bitmaps comparados tiveram diferença RGBA zero; o smoke não registrou `measureText`/`fillText` residuais nas rotas observadas. Build direto: 135.090 bytes WASM + 29.537 bytes glue. Regressões 82/82 após atualizar a verificação e a versão do cache/health; testes ABI/browser e pixel parity passaram. Híbrido, sem benchmark, inspeção visual ampla ou campanha completa.

## Preview local Rust/WASM v157.0 — 07/11/2026
`clearRect` de piso, mapa e camada de sangue cacheado usa Rust/WebSys com fallback; Chrome 156 confirmou quatro chamadas diretas e nenhuma operação residual no smoke. Build e paridades anteriores mantidos. Módulo direto 121.452 bytes + glue 27.180 bytes. Híbrido, sem benchmark.

## Preview local Rust/WASM v156.0 — 07/11/2026
Criação e aplicação de `ImageData` passam pelo módulo Rust em pisos, texturas de mapa, gradientes/sprites RGBA e frames de jogador. Chrome 156: smoke confirmou 18 criações e 24 aplicações diretas; `createImageData`/`putImageData` não apareceram como operações residuais. Piso e texturas continuam dentro dos limiares de comparação já documentados. Regressões 82/82, checks WASM/browser e paridade passaram. WASM direto 120.713 bytes + glue 26.635 bytes. Híbrido, sem benchmark.

## Preview local Rust/WASM v155.0 — 07/11/2026
Imagens de canvas cacheadas agora são pintadas diretamente por `web-sys` em Rust, incluindo rótulo de clima e snapshots/restaurações `fl`/`tp`. Mantém cache e fallback JS. Chrome 156: zero diferenças RGBA; smoke confirmou 104 chamadas diretas e nenhuma operação `drawImage` residual. Regressões 82/82 e checks WASM/browser passaram. Build da época: 117.055 bytes + glue 24.576 bytes. Híbrido, sem benchmark.

## Preview local Rust/WASM v154.0 — 07/11/2026
Sangue dinâmico/estático e cadáveres chamam Canvas direto de Rust. Chrome 156: cinco marcas de cada tipo e três cadáveres com diferença zero nos cenários sintéticos; cena de início não gerou objetos reais. Regressões 82/82 e checks WASM/browser passaram. Build recompilado em v155: módulo direto 117.055 bytes + glue 24.576 bytes.

## Preview local Rust/WASM v153.0 — 07/11/2026
Poeira e faíscas agora chamam Canvas direto do Rust. Chrome 156: as duas camadas sintéticas ficaram idênticas ao JS; no jogo, 24 lotes/1.152 círculos de poeira foram rasterizados pela rota direta. Regressões 82/82 e checks WASM/browser passaram. Ainda híbrido, sem benchmark; módulo direto 112.638 bytes + glue 22.301 bytes.

## Preview local Rust/WASM v152.0 — 07/11/2026
O Rust desenha também os sprites de texto cacheados usados nos labels dos inimigos. Chrome 156: inimigo e label pixel-exatos; rota direta confirmada em um label. Regressões 82/82 e checks WASM/browser passaram. WASM direto 109.955 bytes + glue 21.236 bytes. Ainda híbrido e sem benchmark.

## Preview local Rust/WASM v151.0 — 07/11/2026
Além das entidades e HUD bruto da v150, os comandos de mapa agora chegam em lotes ao Canvas direto de Rust: 22 opcodes comparados pixel a pixel sem diferenças e 35 lotes confirmados numa partida em Chrome 156. Regressões 82/82; renderer parcial/híbrido, sem benchmark ou revisão visual ampla. Build direto 109.783 bytes + glue 21.616 bytes.

## Preview local Rust/WASM v150.0 — 07/11/2026
Canvas direto de Rust agora cobre batches de móveis, jogadores/inimigos/atores, armas, fantasmas, aura, HUD bruto, pausa, overlays, chuva e motes. Chrome 156: pixel exato nos cenários sintéticos cobertos; regressões 82/82. Build direto 94.595 bytes + glue 18.707 bytes. Ainda parcial/híbrido, sem benchmark ou validação visual ampla.

## Preview local Rust/WASM v149.0 — 07/11/2026
Além da chuva, os motes ambientais são desenhados por Rust/WASM direto no Canvas; JS conserva movimento/respawn/RNG. Dois tempos foram comparados pixel a pixel com resultado exato. Total de 13 cenários diretos de pausa, overlays, chuva e motes; sem benchmark. Renderer ainda híbrido.

## Preview local Rust/WASM v148.0 — 07/11/2026
Chuva desenhada diretamente por Rust/WASM via `web-sys`; JS ainda move/respawna as gotas e controla o stride. Chrome 156: stride 1 e 2 pixel-exatos. Pausa e overlays continuam com paridade documentada. Build direto 74.574 bytes + glue 9.432. Sem benchmark; o renderer permanece híbrido.

## Preview local Rust/WASM v147.0 — 07/11/2026
Além da pausa, clarões, pisca, alarme e barras cinematográficas chamam Canvas via `web-sys` em Rust/WASM, sem reentrar no dispatcher antigo. Chrome 156: zero diferenças nos seis cenários de overlays e nos três de pausa. Regressões 82/82. Sem benchmark; a maioria das camadas permanece híbrida.

## Preview local Rust/WASM v146.0 — 07/11/2026
Menu de pausa recebe o contexto Canvas e desenha diretamente por chamadas `web-sys` em Rust/WASM. Chrome 156: zero diferença de pixel nos três estados de hover; regressões 82/82. JS ainda possui o estado e fallback; camadas mais extensas seguem híbridas. Sem benchmark ou validação visual ampla.

## Preview local Rust/WASM v145.0 — 07/11/2026
Rust recebe os três spritesheets da fase e recorta no próprio WASM as oito texturas 24×24, removendo a preparação de crops em Canvas. Build 185.475 bytes. Chrome 156: regressões 81/81, bridge e pixel parity aprovados; sem benchmark nem revisão visual ampla. A rota ainda transfere pixels pelo Canvas e aplica camada final com `putImageData`; renderer continua parcial/híbrido.

## Preview local Rust/WASM v144.0 — 07/11/2026
Sprite de neblina/fumaça (512×256, nove gradientes) gerado em Rust; parâmetros aleatórios continuam obtidos no ponto original do JS e fallback Canvas preservado. Build 184.656 bytes. Chrome 156: alfa máx. 1/255, média 0,1074, RGB máx. 12 com alfa≥64; runtime forçado confirmou o batch fog. Sem benchmark ou inspeção visual ampla. O restante do renderer mantém os itens das v143 e continua parcial/híbrido.

## Preview local Rust/WASM v143.0 — 07/11/2026
Paredes, móveis e decalques de portas agora são rasterizados por Rust no buffer RGBA do mapa; textura de entrada e `putImageData` final ainda passam pelo host Canvas. Build WASM 181.969 bytes; ABI/bridge e regressões 80/80. Chrome 156 em Apartamento 1440×900: textura max 76/255, média 0,00194695/255; piso max 3, média 0,188155; zero exceções. Sem benchmark ou inspeção visual ampla. Migração global permanece parcial/híbrida.

## Preview local Rust/WASM v142.0 — 07/11/2026
Granulado, FTILES, sombras e rejunte do piso compõem em RGBA no Rust, um upload Canvas final por camada. Build 178.000 bytes; ABI/browser bridge e regressões 80/80 passaram. Chrome 156: diferença máxima 3/255 e média 0,1882/255 em Apartamento 1440×900; sem benchmark ou validação visual ampla. Renderer global segue parcial/híbrido.

## Preview local Rust/WASM v141.0 — 07/11/2026
FTILES entra na composição RGBA Rust por sala, depois do granulado e antes de sombras/rejunte. Build 175.939 bytes; ABI/browser bridge e regressões 80/80 passaram. Chrome 156: diferença máxima 3/255 e média 0,1937/255 contra Canvas em Apartamento 1440×900; sem benchmark ou validação visual ampla. A migração do renderizador permanece parcial.

## Preview local Rust/WASM v140.0 — 07/11/2026
Granulado do piso é rasterizado em buffer RGBA pelo Rust e transferido uma vez ao Canvas; paridade pixel a pixel exata no mapa 1440×900 com 8.100 specks, mesmo estado RNG, build 174.197 bytes e regressões 80/80. Buffer ocupa 5.184.000 bytes. Sem benchmark ou paridade visual geral.

## Preview local Rust/WASM v139.0 — 07/11/2026
Texturas das duas portas de elevador seguem o gradiente original da largura total; Chrome 156 encontrou diferença sintética máxima de 1/255 por canal. Renderer segue híbrido, sem benchmark ou validação visual ampla.

## Preview local Rust/WASM v138.0 — 07/11/2026
Gradientes de escadas, elevadores e portas metálicas são gerados como RGBA pelo Rust e cacheados; o host ainda rasteriza com Canvas. Build de 172.601 bytes, ABI/browser bridge e regressões 80/80 passaram. Sem smoke em navegador real, benchmark ou paridade visual ampla.

## Preview local Rust/WASM v137.0 — 07/11/2026
Gradiente diagonal da saída gerado em RGBA pelo Rust e cacheado por tamanho/estado; o host mantém a imagem e aplica o pulso. Build de 171.352 bytes, ABI/browser bridge e regressões 79/79 passaram. Chrome sem exceções e alpha a 1/255 da referência sintética; sem benchmark ou paridade visual ampla.

## Preview local Rust/WASM v136.0 — 07/11/2026
O muzzle flash usa sprite RGBA pré-gerado pelo Rust no modo WASM; o host mantém composição e rasteriza por `drawImage`. Build de 170.517 bytes, ABI/browser bridge e regressões 78/78 passaram. Sprite sintético com alpha idêntico e diferença RGB até 8; migração híbrida, sem benchmark ou paridade visual ampla.

## Preview local Rust/WASM v135.0 — 07/11/2026
O cálculo radial usa estimativa por bits e três iterações de Newton. Binário WASM de 169.533 bytes, ABI/browser bridge e regressões 77/77 passaram. Smoke Chrome 156 em `play` sem exceções; sprite sintético ficou dentro de 1/255 no alpha. Migração híbrida, sem benchmark ou paridade visual completa.

## Preview local Rust/WASM v134.0 — 07/11/2026
Sprites radiais RGBA são rasterizados em Rust; binário WASM com 169.701 bytes. Regressões 77/77, ABI/browser bridge e smoke Chrome 156 em `play` sem exceções. Comparação de alpha de um gradiente sintético: erro máx. 1/255; cor de borda difere. Migração híbrida, sem benchmark ou paridade visual completa.

## Preview local Rust/WASM v133.0 — 07/11/2026
Geometria de Madame Piranha, temporizador, balão, cards e reroll entra em Rust. WASM compilado com 168.430 bytes. Regressões 76/76 e testes ABI/browser bridge passam; smoke sintético Chrome 156 sem exceções. A rasterização continua Canvas, jogo híbrido, sem prova de paridade visual ou FPS.

## Preview local Rust/WASM v131.0 — 07/11/2026
O rótulo de créditos da loja usa o batch raw de HUD Rust e rasterização Canvas host com bypass do bridge genérico. Fonte, cor, alinhamento, posição, alpha herdado e fallback foram mantidos. ABI, bridge, regressões 74/74 e smoke Chromium em Apartamento passaram sem exceções; sem inspeção de paridade visual ou desempenho medido. Renderer híbrido.

## Preview local Rust/WASM v130.0 — 07/11/2026
Rótulo de transporte usa o batch Rust de texto HUD; geometria, ordem e fallback preservados. ABI/bridge e regressões 73/73 passaram. Smoke Chromium em Apartamento ficou em `play`, WASM pronto/ativo e sem exceções; sem inspeção visual comparativa ou benchmark.

## Preview local Rust/WASM v129.0 — 07/11/2026
A atribuição de alpha padrão após o batch de fantasmas agora é condicional; o renderer continua híbrido. ABI/bridge e regressões 72/72 passaram. Smoke v129 permaneceu em loading, sem visual ou desempenho validados.

## Preview local Rust/WASM v128.0 — 07/11/2026
Os escopos Canvas de transformação do quadro agora são emitidos dentro dos batches Rust; host ainda rasteriza e o renderer segue parcial. ABI/bridge e regressões 71/71 passaram; smoke de Apartamento sem exceções. Sem comparação visual ou benchmark.

## Preview local Rust/WASM v127.0 — 06/11/2026
O passe de luz aditivo não altera o Canvas quando não há efeitos ativos; renderer permanece híbrido. ABI, bridge e regressões 70/70 passaram. Sem smoke visual comparativo ou benchmark.

## Preview local Rust/WASM v126.0 — 06/11/2026
Rust emite o preenchimento base da tela a cada quadro; testes ABI/bridge e regressões 69/69 passaram. O host continua rasterizando Canvas; a migração integral e benchmark seguem pendentes.

## Preview local Rust/WASM v125.0 — 06/11/2026
Rust configura escala/suavização do canvas por comando cacheado; auditoria das operações Canvas genéricas é opt-in por `wasmDiagnostics=1`. ABI, browser bridge e regressões 68/68 passaram. Migração ainda incompleta, sem comparação visual global ou benchmark.

## Preview local Rust/WASM v123.0 — 06/11/2026
O batch Rust agora desenha o véu e a geometria dos dois botões de pausa, incluindo hover. Build 164.199 bytes; ABI, bridge e regressões 68/68 passaram. O renderer segue híbrido, sem comparação visual ampla ou medição de desempenho.

## Preview local Rust/WASM v122.0 — 06/11/2026
Resumo de pausa envia os três textos ao batch HUD Rust; JS mantém dados e fallback. ABI/bridge, regressões 68/68 e smoke sem exceções passaram.

## Histórico v121.0 — 06/11/2026
Textos de munição e recarga passam pelo batch de textos HUD; decisão, estado e fallback continuam JS. ABI/bridge e regressões 68/68 passaram; smoke com dois textos e zero exceções.

## Histórico v120.0 — 06/11/2026
Flash de tela do Contrarrelógio transmite alfa/dimensões ao batch de overlays Rust; oscilação temporal e fallback permanecem JS. Build 163.095 bytes; ABI, browser bridge e regressões 68/68 passaram.

## Histórico v119.0 — 06/11/2026
Rótulo superior de modo/campanha usa o batch Rust de textos HUD, mantendo seleção e fallback em JS. ABI, browser bridge e regressões 68/68 passaram; smoke com rótulo/aviso sem exceções.

## Histórico v118.0 — 06/11/2026
Avisos do jogo usam batch Rust para validar posição/alfa de seus textos visíveis; timers e fallback ficam JS, texto e cache `tx()` no host. ABI/bridge e regressões 68/68 passaram; smoke em Chrome mostrou título/subtítulo sem exceções.

## Histórico v117.0 — 06/11/2026
A barra de recarga envia a proporção ao batch de formas HUD Rust; JS mantém estado, texto e fallback. Build 162.939 bytes; ABI, bridge e regressões 68/68 passaram.

## Histórico v116.0 — 06/11/2026
A seta de direção da zona de Invasão envia centro e ângulo ao Rust, que gera seus três vértices; host rasteriza, e JS mantém projeção e fallback. Build 162.668 bytes; ABI, browser bridge e regressões 68/68 passaram.

## Histórico v115.0 — 06/11/2026
A geometria da barra de vida de chefes agora é emitida em lote pelo Rust. Host mantém cor dinâmica e rasterização; JavaScript conserva estado, texto e fallback. Build 162.121 bytes; ABI, browser bridge e regressões 68/68 passaram. Smoke sintético sem exceções; comparação ampla e desempenho seguem pendentes.

## Histórico v114.0 — 06/11/2026
Rust gera comandos para vidros intactos, reflexos e estilhaços de vidro em buffer reutilizado; JS conserva quebra, pools e temporizadores. Build: 160.939 bytes; ABI/bridge e regressões 68/68 passaram. Smoke sintético no Chrome sem exceções; comparação visual ampla e desempenho continuam pendentes.

## Preview local Rust/WASM v113.0 — 06/11/2026
Rust gera em batch o enquadramento de tela e mundo, incluindo escala e posição da câmera, em sequência equivalente ao JavaScript. Build 154.462 bytes. ABI, bridge e regressões 67/67 passaram. Smoke Chromium com zero exceções; sem medição de desempenho ou paridade geral.

## Preview local Rust/WASM v112.0 — 06/11/2026
Screen shake e kick/camera shake enviados em dois estágios de transformação Rust que preservam os escopos Canvas originais; RNG e timers permanecem no JS. Build: 153.741 bytes. ABI, bridge e regressões 67/67 passaram. Smoke Chromium em Apartamento: 24 transformações e zero exceções; captura inspecionada. Sem medição de desempenho ou paridade geral.

## Preview local Rust/WASM v111.0 — 06/11/2026
Rust gera os realces visuais de inimigos classificados visíveis (contorno, barras, coroa, laser e charge). Build: 152.256 bytes. ABI, browser bridge e regressões 66/66 passaram. Smoke Chromium chamou uma vez a ponte com quatro classes sintéticas e zero exceções; sem medição de desempenho.

## Preview local Rust/WASM v110.0 — 06/11/2026
Rust gera o cone/corpo/lente de câmeras de `EXP.worldDraw` a partir do estado e dos 13 vértices calculados no JS. Build: 146.848 bytes. ABI, browser bridge e regressões 65/65 passaram. Smoke Chromium em Apartamento, com câmera sintética, confirmou uma chamada WASM e zero exceções; sem comparação ampla ou medição de desempenho.

## Preview local Rust/WASM v109.0 — 06/11/2026
Rust gera a sequência de desenho dos barris da expansão a partir de posição/raio/timer; estado e simulação seguem em JS e o host rasteriza Canvas. Build: 140.778 bytes. ABI, browser bridge e regressões 64/64 passaram. Sem smoke visual específico ou medição de desempenho.

## Preview local Rust/WASM v108.0 — 06/11/2026
Rust calcula o pulso/alpha do círculo de zona do modo Invasão; o host preserva o arco e fill Canvas, e JS mantém modo, estado e fallback. Build: 137.331 bytes. ABI, bridge e regressões 63/63 passaram. Smoke visual do modo Invasão e desempenho pendentes.

## Preview local Rust/WASM v107.0 — 06/11/2026
Rust calcula geometria e alfa dos anéis temporários de impacto/explosão da expansão; JavaScript mantém timers/cores e o host rasteriza os arcos Canvas. Build release: 136.532 bytes. ABI, bridge e regressões 62/62 passaram; smoke Chromium em Apartamento mostrou o anel em P1, 24 comandos e zero exceções. Sem comparação geral nem desempenho medido.

## Preview local Rust/WASM v105.0 — 06/11/2026
Rust calcula validade/posição do rótulo do alarme; host preserva texto e rasterização `fillText`. Build release: 135.292 bytes. ABI/bridge/regressões 61/61 passaram; smoke Chromium mostrou rótulo em `play`, 40 comandos e zero exceções; captura inspecionada. Sem comparação JS/WASM lado a lado ou FPS.

## Preview local Rust/WASM v104.0 — 06/11/2026
Rust seleciona e posiciona as imagens de vinheta de gameplay/HUD e retrato da máscara, preservando três estágios de composição. Build release com `renderer.wasm` de 134.868 bytes; testes ABI, bridge e regressões 61/61 passaram. Smoke Chromium em Apartamento emitiu 48 comandos de imagem em `play`, sem exceções; captura inspecionada. Sem comparação visual lado a lado ou FPS.

## Preview local Rust/WASM v103.0 — 06/11/2026
Rust calcula o pulso do multiplicador de combo e encaminha contorno/preenchimento ao host Canvas. ABI, bridge e regressões 61/61 passaram. Smoke Chromium forçou combo 5X em Apartamento, emitiu 13 comandos e não teve exceções; captura inspecionada. v102 portou projeção/raios da máscara escura (smoke: 17 comandos) e v101 portou lote de luzes/reflexo (smoke: 115 comandos). Artefato `renderer.wasm`: 134.171 bytes. Sem comparação lado a lado ou FPS.

## Preview local Rust/WASM v100.0 — 06/11/2026
Rust prepara em lote flashes de chuva/neon, o pulso visual do alarme e as barras cinematográficas. Host conserva as chamadas Canvas e o texto do alarme; a lógica/clocks do clima seguem JS. Build de 130.409 bytes, ABI/bridge e regressões 61/61 passaram. Smoke Chromium em Apartamento com chuva, flashes, alarme e cinematics gerou 79 comandos sem exceções; captura inspecionada. Comparação lado a lado e FPS pendentes.

## Preview local Rust/WASM v99.0 — 06/11/2026
Rust escolhe o estilo, a opacidade e as posições das imagens de névoa/fumaça em lote; o host ainda rasteriza as imagens Canvas. O filtro de qualidade permanece ativo, e o painter JavaScript é fallback. Build de 128.551 bytes, ABI/bridge e regressões 61/61 passaram. Smoke Chromium em Apartamento durante `play` emitiu 111 placements sem exceções; captura inspecionada. Comparação visual lado a lado e FPS seguem pendentes.

## Preview local Rust/WASM v98.0 — 06/11/2026
Rust calcula a opacidade das partículas de poeira ambiental em lote e o host rasteriza seus quadrados; posição, movimento, wrap e respawn continuam no JS. Chuva também segue em lote. Build e testes ABI/bridge/regressões 61/61 passaram; smoke Chromium forçado em `play` emitiu 2.592 comandos sem exceções, com captura inspecionada. Conversão integral, comparação JS/WASM e medição FPS pendentes.

Esta pasta é uma cópia experimental local para migração do renderer a Rust/WebAssembly. Com `?renderer=wasm`, v98 calcula em Rust a opacidade das partículas de poeira ambiental, mantendo movimento/respawn em JS; chuva também segue em lote. HUD e textos do jogo passam por lotes ordenados; animação/simulação, outros efeitos de expansão, combo artístico, compositor incompleto e hooks ainda usam JavaScript. Comparação lado a lado e medição FPS seguem pendentes. Conversão integral pendente.

v46 adiciona janelas quebráveis nos mapas gerados: disparos e golpes removem o sólido, atualizam a navegação e deixam estilhaços temporários. Mapas Neon recebem perímetro visual e físico consistente, inclusive quando o mapa original não possui objetos de parede nas quatro bordas. A v47 corrige o alvo ativo da IA no cooperativo; a v48 corrige a criação e o dimensionamento das portas; a v49 corrige a colisão e o reset dessas portas em todos os mapas; a v50 protege a primeira fase, remove o reinício por R e filtra mapas estreitos; a v51 corrige referências de spawn no cooperativo.
v51 entregou lista pública da instância, entrada pela lista, estados de sala, expiração de presença, colisão de limites e spawns cooperativos. O servidor retransmite apenas presença/posição, sem simular combate.
v52 acrescenta quatro skins puramente cosméticas em `settings.skin` no save v2, sem mexer nas máscaras ou atributos existentes; melhora o acabamento Canvas das armas, corrige a arma invisível de P2 e reutiliza sprites procedurais animados por cache de fase para reduzir criação de Canvas no caminho de fallback. Corrige fase procedural inicial sem inimigos e spawn inválido em boate-b. Sem assets externos. 54 testes automatizados passaram; Chromium confirmou movimento, um disparo, pausa, início da fase 1 com 8 inimigos e spawn livre nos 17 mapas fixos. Fases completas, multiplayer online real, áudio, instalação real do service worker e FPS ainda precisam de validação.

v53 corrige sobreposição de inimigos/armas com paredes na geração Neon: a colisão é montada antes da colocação e cada entidade procura piso livre próximo. Auditoria Chromium: 72 mapas, 720 inimigos e 84 armas, zero posições bloqueadas; regressões 54/54. Foram abertos os modos disponíveis e exercitados fase inicial, movimento/tiro coop local. Ainda não houve campanha completa, sessões intermediária/final, online de duas máquinas nem medição real de FPS.

## v55
Mapas fixos, grades e Neon filtrados por allowlists explícitas; seletor não mostra dimensões; Trailer, protótipos e testes removidos da experiência ativa. A campanha base segue a numeração existente e mantém expansões autorizadas. Saídas Neon são validadas e ancoradas em piso livre quando necessário, sem alterações em js/maps.js. Regressão 57/57; sem validação visual nem medição de FPS.

## Preview local Rust/WASM v97.0 — 06/11/2026
Segmentos de chuva agora recebem geometria ordenada do Rust em lote; o avanço e o respawn continuam no JS para preservar o RNG e o comportamento do clima. ABI, browser bridge e regressões passaram. Não houve validação visual desta camada nem medição de desempenho.

## Preview local Rust/WASM v96.0 — 06/11/2026
Além de saída, color grade, overlays, formas do HUD e rastros do jogador portados nas versões anteriores, textos principais do HUD, máscara/atributos, sala limpa e pausa agora entram em lotes de comandos validados pelo Rust. Build release, ABI, bridge e regressões 61/61 passaram; sem comparação visual ou medição FPS. Conversão integral pendente.

## Preview local Rust/WASM v69.0 — 06/11/2026
Rust agora gera os orbes animados de stun no buffer do corpo inimigo; o host mantém o rótulo “ATORDOADO” e desenha o texto. Build/testes e smoke Chrome passaram, zero exceções; screenshot inspecionada. Conversão parcial, sem comparação JS/WASM e sem FPS medido.

## Preview local Rust/WASM v70.0 — 06/11/2026
Rust acrescenta comandos para os rótulos de stun, nocaute e estados suspeito/alerta no lote do corpo; o host usa `tx()` e mantém a aparência cacheada. Build offline, testes WASM/bridge e regressão 57/57 passaram. Chrome abriu Apartamento em `play`, executou 2 comandos de texto inimigo no diagnóstico e não teve exceções. Screenshot inspecionada sem comparação de paridade; FPS não medido.

## Preview local Rust/WASM v71.0 — 06/11/2026
Rust emite fundo sólido de mapas fixos, overlay e geometria/cor da decoração estática (incluindo tapetes). A ponte mantém fallback JS e dados dinâmicos. Build offline, regressões 57/57 e smoke Chromium passaram; Apartamento produziu 70 comandos de decoração e zero exceções. Captura inspecionada sem comparação lado a lado; FPS não medido.

## Preview local Rust/WASM v72.0 — 06/11/2026
Rust agora emite os comandos Canvas de janelas intactas e estilhaços de vidro, preservando os temporizadores e remoção dos fragmentos no JS. Build offline, testes WASM/bridge e regressões 57/57 passaram. Chromium abriu Apartamento em `play`, exercitou quatro comandos de vidro no diagnóstico e teve zero exceções. Captura inspecionada; sem comparação lado a lado ou medição de FPS. Conversão integral continua pendente.

## Preview local Rust/WASM v73.0 — 06/11/2026
Rust gera, em lotes, o granulado aleatório determinístico, as sombras dos sólidos e as linhas de rejunte de cada andar. Os overlays com imagens de piso e parede continuam no host. Build offline, testes WASM/bridge e regressões 58/58 passaram. Chromium abriu Apartamento em `play`, executou 16.516 comandos de acabamento e teve zero exceções. Screenshot inspecionada; sem comparação lado a lado ou FPS medido. Migração integral pendente.

## Preview local Rust/WASM v74.0 — 06/11/2026
Rust seleciona as texturas de sólidos e as aberturas de porta a partir da geometria do mapa e emite um lote ordenado; o host fornece as imagens recortadas e aplica padrões/clipping/transform Canvas. Build offline, testes WASM/bridge e regressões 59/59 passaram. Chromium abriu Apartamento com as três folhas de textura carregadas, confirmou 135 comandos de textura e zero exceções. Captura inspecionada; sem comparação lado a lado ou FPS medido. Migração integral pendente.

## Preview local Rust/WASM v75.0 — 06/11/2026
Rust agora gera comandos para as texturas de piso `FTILES`, preservando a ordem das salas e excluindo o corredor. Compilação offline passou; testes específicos e regressões 60/60 passaram. Chrome em Apartamento registrou 13 comandos FTILES, 16.516 de acabamento e zero exceções. Captura inspecionada; sem comparação de imagem lado a lado ou medição de FPS. Migração integral pendente.

## Preview local Rust/WASM v76.0 — 06/11/2026
Rust combina o ângulo base e o estado de abertura das portas Neon, mantém a ordem e emite handles/offsets dos sprites. A animação de gameplay continua em JS; host fornece assets e rasteriza Canvas. Build offline, testes ABI/bridge e regressões 61/61 passaram. O ambiente negou o socket DevTools local; sem smoke de mapa Neon, screenshot ou validação visual. Migração integral pendente, sem medição de FPS.

## v54
Fogo amigo cooperativo agora distingue o proprietário de cada projétil e respeita a opção persistida. Regressões automatizadas: 55/55. O navegador, as partidas completas e o FPS real não foram validados nesta iteração.

## Preview local Rust/WASM v66.0 — 06/11/2026
A migração local permanece opcional por `?renderer=wasm` e sem publicação no GitHub. Rust agora também calcula em buffer a sombra de cada inimigo visível, preservando posição, tamanho, ordem antes do corpo e alpha de nocaute; JS rasteriza o comando e evita desenhar uma sombra duplicada. Build offline, testes específicos WASM/bridge e regressão 57/57 passaram. Corpos e outros efeitos, compositor principal, HUD e demais camadas continuam parciais em JavaScript. Não houve medição de FPS nem revisão visual manual.

## Preview local Rust/WASM v67.0 — 06/11/2026
Rust agora também compõe corpos geométricos de inimigos em comandos ordenados: transform, fallback sem imagem, recorte animado quando o spritesheet carrega e alpha de nocaute. O host JS consome os comandos Canvas; se o lote não existir, o painter antigo é usado. Build offline, testes ABI/bridge e regressões 57/57 passaram; Chrome headless abriu Apartamento e reportou 1.855 comandos de corpo, 265 sombras e zero exceções. Captura inspecionada sem comparação side-by-side; FPS não medido. Compositor principal, corpos do jogador, efeitos, HUD, Canvas host e outras camadas ainda são JS.

## Preview local Rust/WASM v68.0 — 06/11/2026
Rust compõe jogadores locais/remotos num lote ordenado: transform, sombra/aura, arma, spritesheet animado ou frame procedural, acentos da skin e tag P1/P2. A atualização do tempo de animação continua no JS para preservar gameplay. Build offline; `wasm-renderer.cjs`, `wasm-renderer-browser.cjs` e regressão 57/57 passaram. Chromium headless abriu fase 1 Apartamento, `play`, reportou 4.056 comandos de jogador e zero exceções. Captura visual inspecionada sem comparação lado a lado; FPS não medido. Compositor de mapa, HUD/efeitos, estados de stun/rótulos de inimigos e hooks gráficos ainda são parcialmente JS.

## Prioridade seguinte
Validar visualmente o lobby e uma sessão online em dois navegadores/dispositivos; evoluir relay para sincronizar combate/objetivos com simulação autoritativa; recuperar assets ausentes; tratar seleção de alvo da IA e integrar opções de multiplayer. Os dados dos testes são fictícios e nunca usam o armazenamento real do jogador.
