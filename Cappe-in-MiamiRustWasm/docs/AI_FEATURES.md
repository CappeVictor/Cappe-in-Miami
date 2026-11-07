# Catálogo observado no código
## Preview Rust/WASM local v169
Composição de escuridão/lanterna passa pelo módulo Rust direto; validação do comando legado corrigida para aceitar ângulo zero e flags booleanas. Chrome: paridade RGBA exata; sem benchmark.
## Preview Rust/WASM local v168
Callbacks de névoa, luzes, anéis e zona de invasão tentam rasterizar no Rust direto; o fallback Canvas persiste. Build, regressões e paridade RGBA Chrome passaram; sem benchmark.
## Preview Rust/WASM local v167
Painel dev e overlays F4/F6 de colisão/IA são rasterizados pelo módulo Rust direto; JS continua preparando estado/labels e tem fallback. Chrome: paridade RGBA sintética exata; sem benchmark. Migração parcial.
## Preview Rust/WASM local v166
O painel de depuração `dev=1` é rasterizado no módulo Rust direto; linhas continuam formatadas em JS. Sem benchmark; migração parcial.
## Preview Rust/WASM local v165
A HUD não redefine alpha depois de o Rust desenhar os toasts, evitando um setter host redundante. Smoke curto não registrou operações Canvas no host; migração não completa e sem benchmark.
## Preview Rust/WASM local v164
As duas marcas persistentes de uma explosão de barril chamam Rust direto, mantendo JS para estado e lógica. Paridade RGBA Chrome exata; sem benchmark.
## Preview Rust/WASM local v163
O rastro de vidro quebrado é rasterizado pelo Rust direto; JS mantém RNG/estado e fallback. Nove triângulos testados em Chrome com pixels exatos. Sem benchmark; renderer híbrido.
## Preview Rust/WASM local v162
Sombras de inimigos em gameplay chamam Rust direto, preservando alpha/ordem. Chrome 156 confirmou 205 chamadas e paridade RGBA exata em três sombras sintéticas. Sem benchmark; migração continua parcial.
## Preview Rust/WASM local v161
Configuração de suavização ao montar o mapa chama Rust diretamente. Smoke Chrome confirmou 2 chamadas; sem benchmark. Renderer permanece híbrido.

## Preview Rust/WASM local v160
Painter Rust de poeira salva e restaura o estado Canvas; o alpha do contexto permanece intacto sem correção JavaScript no final do frame. Comparação RGBA exata no Chrome 156; renderer híbrido, sem benchmark.

## Preview Rust/WASM local v159
O módulo direto recorta e desenha camadas de mapa e rasteriza manchas/rastros/gotas gerados em kill(). Estado de alpha é restaurado. Paridade pixel a pixel dos casos sintéticos e chamada de kill real verificadas em Chrome 156. RNG e fallback permanecem no host; renderer híbrido; sem benchmark.

## Preview Rust/WASM local v158
Bitmaps cacheados dos labels de clima e estado de inimigos são medidos/rasterizados pelo módulo `web-sys` Rust com paridade RGBA exata nos casos de Chrome 156. Cache, integração e fallback ficam no JS; o restante do texto e renderer continua híbrido. Sem benchmark.

## Preview Rust/WASM local v157
Reset dos canvases de piso e mapa, e invalidação da camada de sangue, usam `clearRect` direto via `web-sys` com fallback JS. Chrome 156: 4 chamadas diretas no smoke; sem benchmark.

## Preview Rust/WASM local v156
Módulo `web-sys` cria `ImageData` e aplica bytes RGBA recebidos das rotinas antigas em piso, texturas de mapa, sprites radiais/muzzle, gradiente de saída e frames do jogador. Fallback JS mantido. No smoke, 18 criações e 24 aplicações diretas; sem benchmark.

## Preview Rust/WASM local v155
Imagens de Canvas cacheadas são passadas ao módulo `web-sys` para `drawImage` direto, incluindo o rótulo de clima e snapshots/restaurações de `fl`/`tp`. Cache, fluxo e fallback continuam em JS. Chrome 156: paridade do rótulo exata; smoke com 104 chamadas diretas. Sem benchmark.

## Preview Rust/WASM local v154
Sangue dinâmico/estático e cadáveres chamam a rasterização Canvas diretamente pelo Rust/WASM, mantendo composição alfa, transforms, paletas e fallback. Simulação/criação seguem em JS; sem benchmark.

## Preview Rust/WASM local v153
Além das camadas da v152, poeira e faíscas recebem os dados do módulo legado, mas agora são rasterizadas diretamente pelo módulo `web-sys` Rust: path agrupado para poeira e agrupamento de cor/alfa com blend `lighter` para faíscas. A simulação e o fallback ficam em JS; sem benchmark.

## Preview Rust/WASM local v152
Além dos sistemas descritos na v151, os rótulos de estado de inimigos usam imagens de texto criadas pelo cache de JS, mas sua rasterização no mundo chama `drawImage` diretamente por Rust/WASM. Cache e strings continuam no host. A paridade foi confirmada no cenário coberto; não houve benchmark.

## Preview Rust/WASM local v151
Pausa, overlays, chuva, motes, HUD bruto, móveis, entidades/jogadores/inimigos, armas, fantasmas, aura e comandos geométricos de mapa usam chamadas Canvas diretas de `web-sys` em Rust. O mapa inclui fundo, overlay, detalhes, decoração, sombras, paredes, postes e vidros quebráveis; os lotes dinâmicos de decoração preservam as cores recebidas de JS. Piso e texturas do mapa também têm rotas Rust que transferem pixels RGBA, com paridade dentro das tolerâncias documentadas. Estado e gameplay continuam em JS. Fallback preservado; sem benchmark.

## Preview Rust/WASM local v150
Pausa, overlays, chuva, motes, HUD bruto e batches de móveis, entidades, jogadores, inimigos, armas, fantasmas e aura usam Canvas direto por `web-sys` em Rust. Estado e movimento vêm do JS; fallback permanece. Chrome 156 teve diferença RGBA zero nos cenários específicos cobertos. Mapa, várias texturas e efeitos de expansão ainda usam rotas híbridas. Sem benchmark.

## Preview Rust/WASM local v148
Pausa, overlays de tela e linhas de chuva são pintados por Rust chamando Canvas via `web-sys`; movimento e estado seguem no JS. Chuva foi comparada em dois strides e permaneceu pixel-exata. Sem benchmark; demais camadas híbridas.

## Preview Rust/WASM local v147
Pausa e overlays de flash/alarme/cinema são pintados no contexto recebido por `web-sys` em Rust. Sete variações entre as duas telas foram comparadas em Chrome com pixel exato; sem benchmark. JS continua fornecendo estado; demais camadas seguem híbridas.

## Preview Rust/WASM local v146
O menu de pausa é desenhado no `CanvasRenderingContext2D` por Rust via `web-sys`; o estado e o hit-testing continuam no JavaScript. Três estados foram comparados pixel a pixel no Chrome com resultado exato. O fallback do bridge legado permanece. Nenhum ganho de desempenho medido; outras camadas seguem híbridas.

## Preview Rust/WASM local v145
Paredes/móveis/portas são extraídos de spritesheets completos; os recortes 24×24 são feitos em Rust antes da rasterização RGBA. Canvas continua responsável por fornecer os pixels e receber a camada pronta. Regressões e Chrome pixel-parity passaram; não houve benchmark. Renderer geral continua híbrido.

## Preview Rust/WASM local v144
Névoa/fumaça usa sprite RGBA 512×256 gerado e cacheado por Rust a partir dos mesmos nove parâmetros sorteados pelo JS; o Rust também mantém o posicionamento e alfa dos três sprites por quadro. Canvas fallback preservado. Chrome 156: alfa máximo 1/255, média 0,1074/255, RGB máximo 12/255 com alfa≥64. Sem benchmark; renderer geral segue híbrido.

## Preview Rust/WASM local v143
Além do piso já migrado, Rust rasteriza em RGBA os padrões de texturas de paredes/móveis e decalques de portas abertas. Host ainda prepara crops e aplica a imagem. Chrome 156 mediu diferenças raras nas bordas (máx. 76/255, média 0,00194695/255) em Apartamento; sem benchmark. O restante do renderer permanece híbrido.

## Preview Rust/WASM local v142
Granulado, FTILES, sombras sólidas e rejunte entram no mesmo buffer RGBA Rust; geometrias inválidas usam fallback. O host fornece o tileset e aplica a camada final. Diferenças do compositor completo: até 3/255 por canal contra Canvas em Chrome 156. O restante do renderer segue híbrido.

## Preview Rust/WASM local v141
FTILES é misturado em Rust ao buffer RGBA do piso para salas de geometria inteira, excluindo o corredor. Chrome 156 encontrou diferenças até 3/255 em relação ao Canvas; o host ainda transfere pixels e várias outras camadas usam Canvas.

## Preview Rust/WASM local v140
O granulado do piso é composto em RGBA no Rust e aplicado uma vez pelo Canvas, com o mesmo RNG e paridade de pixel exata no tamanho de Apartamento 1440×900; buffer limitado a 1440×900. A rasterização geral continua híbrida.

## Preview Rust/WASM local v139
Gradientes de escada, elevador e portas metálicas são gerados por Rust e cacheados. As duas portas de elevador usam offsets para manter a transição sobre a largura total. Smoke Chrome 156 e comparação sintética de pixels dentro de 1/255 por canal; Canvas continua como rasterizador.

## Preview Rust/WASM local v137
Gradiente diagonal da saída rasterizado em RGBA Rust, armazenado em canvas de cache; o host aplica o alpha pulsante e mantém fallback Canvas. Não há benchmark.

## Preview Rust/WASM local v136
Clarão de disparo usa sprite RGBA reutilizado no backend WASM; o host desenha com composição aditiva e alpha por efeito. Gradiente Canvas continua no fallback; não foi medido ganho de FPS.

## Preview Rust/WASM local v135
Cálculo da raiz para pixels radiais acelerado de até 12 iterações de Newton para uma estimativa inicial por bits e três passos; fallback Canvas mantido. Sem ganho de FPS medido.

## Preview Rust/WASM local v134
Sprites radiais de luz são rasterizados como RGBA pelo Rust e enviados pelo host via `ImageData`; a geração original Canvas segue como fallback. Comparação do alpha de um caso sintético diferiu no máximo 1/255; a borda tem pequenas diferenças de cor.

## Preview Rust/WASM local v133
Geometria da Madame Piranha, arco do temporizador, balão, cards e reroll gerados em Rust; host rasteriza Canvas e o painter JS fica como fallback. Smoke sintético em Chrome 156 sem exceções; não comprova FPS ou paridade visual.

## Preview Rust/WASM local v131
O rótulo de créditos do overlay da loja passa pelo batch raw HUD Rust e é rasterizado no host Canvas com bypass do bridge genérico. Mantém fonte, cor, alinhamento, posição, alpha herdado e fallback; smoke curto sem exceções. Não comprova ganho de FPS.
## Preview Rust/WASM local v130
Rótulo de escada/elevador é enviado ao batch de texto HUD Rust após a geometria; fallback tx() preservado. ABI/bridge e regressões 73/73 passaram; smoke curto em jogo sem exceções.
## Preview Rust/WASM local v129
Reset de alpha após fantasmas evita escrita repetida quando o valor já é 1; painter de fallback permanece. ABI/bridge e regressões 72/72 passaram; sem benchmark.
## Preview Rust/WASM local v128
Os escopos Canvas que enquadram shake, câmera e cena entram nos batches Rust nos stages 0/1/3/4, com fallback JS. ABI/bridge e regressões 71/71 passaram; sem medição de desempenho.
## Preview Rust/WASM local v127
O passe aditivo omite operações Canvas quando não há luz, clarão ou reflexo; fallback de efeitos ativos preservado. ABI/bridge e regressões 70/70 passaram; sem medição de desempenho.

## Preview Rust/WASM local v126
Rust gera o retângulo do fundo base por quadro, incluindo margem anti-shake; Canvas host rasteriza e JavaScript mantém fallback. ABI/browser bridge e regressões 69/69 passaram.

## Preview Rust/WASM local v125
Escala, suavização e qualidade do contexto Canvas entram por comando Rust validado/cacheado; `wasmDiagnostics=1` contabiliza operações genéricas e primeiras stacks sem histogramas no uso normal.

## Preview Rust/WASM local v123
Geometria do véu e dos dois botões do menu de pausa passa pelo batch de formas Rust, incluindo hover; clique, estado, rótulos e fallback continuam JS. ABI/bridge e regressões 68/68 passaram.

## Preview Rust/WASM local v122
Resumo de pausa em modos envia três textos ao batch Rust HUD em ordem; valores e fallback continuam JS, host usa `tx()`. ABI/browser bridge, regressões 68/68 e smoke sem exceções passaram.

## Histórico v121
Textos de pente e recarga passam pelo batch de textos HUD; JS mantém contadores/decisão e fallback, host desenha via `tx()`. ABI/bridge e regressões 68/68 passaram; smoke sem exceções.

## Histórico v120
Flash do Contrarrelógio transmite alfa e dimensões ao batch Rust de overlay vermelho; JS conserva oscilação temporal e fallback. Build, ABI, browser bridge e regressões 68/68 passaram. Sem medição de desempenho.

## Histórico v119
O rótulo de modo/campanha usa batch Rust para validar posição/alfa e preservar ordem; conteúdo e escolha continuam JS e cache `tx()` no host. ABI, browser bridge e regressões 68/68 passaram; smoke do HUD no Chrome sem exceções. Sem medição de desempenho.

## Histórico v118
Avisos temporários de até três itens enviam título/subtítulo e posição/alfa ao batch Rust de texto; JS atualiza a duração e mantém o fallback, host rasteriza pelo cache `tx()`. ABI, browser bridge e regressões 68/68 passaram; smoke Chrome inspecionado sem exceções. Sem medição de desempenho.

## Histórico v117
A barra de recarga usa formas de fundo/progresso emitidas pelo Rust; simulação e texto permanecem JS/host. ABI, browser bridge e regressões 68/68 passaram. Sem medição de desempenho.

## Histórico v116
v116 passa ao Rust os vértices da seta de direção da zona de Invasão, mantendo projeção e decisão de exibição no JavaScript; host Canvas rasteriza e fallback permanece. Build, ABI, browser bridge e regressões 68/68 passaram; sem medição de desempenho.

## Histórico v115
v115 gera no Rust a geometria da barra de vida do chefe, incluindo a ordem do fundo, vida, marcadores de fase, contorno e posição do título. Cor, conteúdo do texto, estado e fallback continuam no host/JS. ABI, browser bridge e regressões 68/68 passaram; sem medição de desempenho.

## Histórico v114
v114 move para o Rust a geometria/ordem de desenho de vidros intactos, reflexos e estilhaços em lotes, preservando estado e simulação no JS. Limites do batch: 96 painéis/160 estilhaços; fallback permanece. ABI/bridge e 68/68 regressões passaram. Sem medição de desempenho.
v113 acrescenta o enquadramento e zoom do mundo ao batch Rust de transformações, além dos tremores já portados. O host aplica translate/scale; JS mantém calcView e o fallback. ABI, bridge e regressões 67/67 passaram; smoke Chromium sem exceções. Migração parcial; sem desempenho medido.
v112 separa em dois batches Rust os tremores screen shake e kick/camera shake, preservando os escopos originais de save/restore; amostragem aleatória e timers continuam em JS. ABI, bridge e regressões 67/67 passaram; smoke Chromium sem exceções. Ainda parcial e sem medição de desempenho.
O query `?renderer=wasm` ainda encaminha chamadas Canvas residuais pelo ABI, enquanto Rust gera comandos de fundo/overlay/decor, granulado, sombras e rejunte estáticos, overlay `FTILES` (salas, ordem e offset), vidros quebráveis, primitivas de piso/mapa, seleção de texturas repetidas de paredes/móveis e decalques de aberturas de portas, geometria de móveis, portas comuns, portas Neon com sprite e armas. Rust combina transformação/ângulo das portas, compõe corpos completos de P1/P2/avatar remoto e corpos/sombras de inimigos; decide/ordena orbes e textos de estado e seleciona frames/assets. O host carrega imagens e rasteriza Canvas e texto via `tx()` cacheado. Rust também comanda geometria da saída, color grade, fade/flash finais, formas do HUD, pulso/ordem do texto de combo, rastros translúcidos, segmentos de chuva, alfa da poeira, imagens/posições de névoa e fumaça, clarões de chuva/neon, pulso do alarme, barras cinematográficas, luzes aditivas/reflexo de chuva, projeção e raios da máscara de apagão/lanterna e listas ordenadas de textos do HUD, prompts, popups e banners. Simulação, avanço/respawn climático, estado do apagão, texto do alarme, abertura/interação/temporizadores de porta, timers de vidro e assets/overlays residuais permanecem JS. Compositor `paintMap`, partículas e expansões restantes continuam parcialmente em JavaScript; conversão parcial e sem medição de desempenho.
Este catálogo confirma existência de implementação, não validação integral em partida.

Em v104 Rust também escolhe imagem/posição das vinhetas do gameplay/HUD e do retrato da máscara em três lotes separados para preservar a ordem dos efeitos; v105 calcula a posição do texto do alarme, v106 posiciona a etiqueta climática cacheada, v107 calcula raio/alfa/espessura dos anéis, v108 calcula o pulso do círculo da Invasão, v109 gera comandos para os barris, v110 gera câmeras e v111 emite contornos e efeitos das classes inimigas. Imagens, cores e rasterização permanecem no host.

- Combate: armas de fogo e brancas, tiros, dispersão, recuo, arremesso, finalização, dash por máscara, colete, combos e pontuação.
- Conteúdo: máscaras ampliadas, armas e seis definições de chefe no módulo de conteúdo; personagens Richard, Tony, Dennis e Rasmus.
- Mapas: mapas fixos, apartamentos procedurais, grades, mapas Neon e campanha em tiles; andares e transporte.
- IA: percepção visual/auditiva, investigação, patrulha, busca BFS, classes corredor/blindado/atirador/líder, flanqueamento e esquiva.
- Modos: Clássico, História, Campanha de 3 Fases, Horda, Sobrevivência, Arcade, Contrarrelógio, Assassino, Limpeza, Invasão, Diário, Personalizado e Roleta adicionada pela UI.
- Progressão: XP, níveis, perks, conquistas, ranking local, recordes, desbloqueios e estatísticas.
- Loja: Madame Piranha, créditos por abate/sala, cartas ofensiva/defensiva/utilidade, reroll e raridade.
- Apresentação: Canvas 2D, partículas, sangue, luzes, clima, flashes, tremor, cache de textos e camadas de cenário.
- Skins cosméticas: quatro paletas selecionáveis, persistidas em `settings.skin` no save v2 e independentes de personagens/atributos; sem conteúdo pago.
- Áudio: Web Audio sintetizado, música por sala/chefe, escolha de faixa e volumes de música/SFX.
- Acessibilidade: configurações visuais, idiomas, abas e anúncios de telas. Navegação sem mouse ainda requer auditoria.
- Multiplayer: P2 local por teclado/numpad/gamepad e lobby por código com servidor relay para posição/presença. Lista salas da instância atual, nomes/vagas/partida, entrada direta, atualização periódica, tokens privados, reentrada da aba, saída explícita e retry automático. Não há descoberta global de servidores; co-op online ainda não sincroniza combate, mapa ou progresso.
- Offline: manifesto corrigido para os arquivos distribuídos. Não supre as artes que já faltavam no ZIP.
## Preview Rust/WASM local v132
- Textos de dealer, cards, reroll e balão usam batch HUD Rust com fallback JS; cache de wrap reutiliza medições de largura.

## Preview Rust/WASM local v170
Muzzle flashes e arcos de impacto tentam rasterização direta Rust por lote tipado; sprite, simulação e fallback permanecem no host. Paridade sintética exata em Chrome; migração parcial e sem benchmark.

## Preview Rust/WASM local v171
Estojos de munição projetados em lote pelo WASM legado agora chamam o painter direto para desenhar elipses. Fallback Canvas permanece; Chrome confirmou paridade RGBA exata; migração parcial e sem benchmark.

## Preview Rust/WASM local v172
Texto de combo usa painter Rust direto com o Canvas do navegador; a lógica de pulso/valor permanece no caminho existente. Fallback ativo, paridade RGBA exata em Chrome; sem benchmark.

## Preview Rust/WASM local v173
Rótulo de alarme passa pelo painter Rust direto quando disponível; o WASM legado continua calculando o texto e o posicionamento. Fallback ativo; paridade RGBA exata em Chrome; sem benchmark.

