## D103 — v169.0 — Rasterizar dark overlay no painter Rust direto
O módulo recebe os comandos e imagens já preparados, limpa o layer half-resolution, aplica `destination-out` ao brilho central e ao cone, desenha o flash e compõe na tela. O fallback antigo permanece. A auditoria revelou que o WASM legado rejeitava flags booleanas false e ângulo zero; a validação foi corrigida sem alterar a fórmula de câmera. Chrome 156 teve igualdade RGBA e callback integrado confirmado; regressões passaram.

## D102 — v168.0 — Enviar batches atmosféricos e de mundo ao Rust direto
Os comandos de névoa, luzes/reflexos, anéis e zona de invasão já são calculados pelo WASM legado. O callback agora tenta o módulo direto `web-sys` para rasterizar as imagens e paths; se o lote for inválido ou falhar, conserva o Canvas existente. Não altera RNG nem geometria de gameplay. Build passou, regressões 82/82 e Chrome 156 confirmou paridade RGBA exata para os quatro painters.

## D101 — v167.0 — Rasterizar overlays de depuração do mundo via Rust
F4/F6 continuam consumindo a geometria/estado já calculados em JS, empacotados em arrays tipados e desenhados pelo módulo direto Rust. Ordem, estilos, labels e fallback Canvas foram preservados. Chrome 156: pixels RGBA idênticos no caso sintético; uma chamada real no modo dev. Regressões 82/82. Sem benchmark.

## D100 — v166.0 — Rasterizar HUD de depuração pelo Rust
O painel de métricas e lista de erros em `exp-debug.js` montam strings em JS, mas enviam retângulos e textos ao módulo Rust direto. Canvas fallback preservado. Chrome 156: comparação RGBA zero, alpha/fillStyle restaurados e chamada de gameplay dev confirmada. Sem benchmark.

## D099 — v165.0 — Não redefinir alpha após toasts Rust
`drawHudTexts` em Rust guarda/restaura o alpha. `EXP.drawHUD` só precisa definir `globalAlpha = 1` depois do fallback JS, eliminando a escrita host redundante quando o caminho direto já restaurou o contexto. Chrome 156: zero operações/propriedades Canvas residuais no smoke com explosão controlada; parity completa e regressões 82/82. Sem benchmark.

## D098 — v164.0 — Rasterizar marcas persistentes de explosão em Rust
`explode` continua responsável por gameplay e efeitos, mas os dois círculos desenhados no layer de chão agora usam o módulo direto Rust. A chamada mantém a cor e ângulos originais e preserva o efeito legado no fallback. Teste Chrome confirmou igualdade RGBA. Renderer híbrido, sem benchmark.

## D097 — v163.0 — Rasterizar rastro de vidro em Rust
`breakGlass` mantém o estado do mapa e a sequência dos nove sorteios no JS, envia alfa/coordenadas ao módulo Rust para pintar o retângulo e os triângulos no layer de chão e conserva o fallback Canvas. Chrome confirmou igualdade RGBA exata, incluindo a restauração do estado do contexto; regressões 82/82 e demais checks passaram. Sem benchmark; o resto do renderer continua híbrido.

## D096 — v162.0 — Desenhar sombras dos inimigos em Rust direto
O dispatcher calcula e ordena os eventos de inimigo no WASM antigo, mas o painter de sombras agora chama `drawEnemyShadows` pelo módulo `web-sys` Rust direto, uma sombra por evento para preservar sobreposição intercalada com os corpos. Se a rota direta rejeitar dados, o painter host segue disponível. Teste focado Chrome 156: 194 chamadas; a suíte de pixel parity executou 205 chamadas em gameplay e três sombras com paridade RGBA exata, alpha e fillStyle restaurados. Congelar o redraw após coletar o smoke reduziu a comparação integral de mais de dez minutos para cerca de 12 segundos. Renderer ainda híbrido, sem benchmark.

## D095 — v161.0 — Encaminhar suavização do Canvas ao Rust
`paintMap` agora chama `setCanvasImageSmoothing` no módulo direto para configurar o mapa; mantém setter host como fallback. O smoke Chrome 156 confirmou duas chamadas diretas e nenhuma escrita de propriedade Canvas no host no cenário curto. Não significa migração completa: operações não exercitadas ou outros estados ainda podem usar o Canvas via JS. Sem benchmark.

## D093 — v159.0 — Rasterizar camadas e respingos de sangue pelo módulo direto
O passe de imagem recortada chama web-sys no módulo Rust direto; alpha opcional é escopado por save/restore. kill() continua sorteando no JS para manter RNG e regras de gameplay, mas passa as geometrias de manchas/rastros/gotas em buffers para Rust desenhar. Paridade Chrome 156 foi RGBA-exata nos casos sintéticos e um kill real confirmou o caminho direto. Fallback Canvas permanece para falha/incompatibilidade. Não se declara benchmark nem conversão total.

## D092 — v158.0 — Gerar bitmaps cacheados de texto em Rust
O módulo direto mede e rasteriza em Rust os bitmaps de texto para labels do clima e de estados de inimigo; JS conserva cache, chamadas e fallback. Os dois casos amostrados deram igualdade RGBA em Chrome 156. A mudança elimina `measureText`/`fillText` do host nesses caminhos apenas; os outros textos e draw hooks permanecem em migração. Sem benchmark.

## D091 — v157.0 — Encaminhar limpezas Canvas por Rust
`clearCanvasRect` chama `clearRect` com `web-sys` para reset dos layers de piso/mapa e invalidação do cache de sangue. Contexto e dimensões continuam escolhidos pelo JS; fallback preservado. Chrome 156: quatro chamadas diretas e zero residuais no smoke. Sem benchmark.

## D090 — v156.0 — Criar e aplicar ImageData por Rust direto
O módulo direto recebe as dimensões e a vista `Uint8ClampedArray` da instância WASM que calcula os pixels; cria `ImageData` pelo contexto e executa `putImageData` via `web-sys`. Aplicado a piso, texturas, sprites RGBA, saída e frames de jogador; cache/fallback permanecem. Chrome 156 confirmou pixels/tolerâncias anteriores e não registrou `createImageData`/`putImageData` no dispatcher durante o smoke. A cópia da memória continua existindo; sem benchmark.

## D089 — v155.0 — Desenhar imagens cacheadas em Canvas pelo Rust
Imagens cacheadas (rótulo do clima e snapshots/restaurações de `fl`/`tp`) agora chegam ao Canvas por `drawImage` direto do módulo Rust. JS preserva cache, fluxo e fallback. Uma tentativa de substituir o bitmap de clima por `fillText` direto teve diferenças de antialiasing e foi descartada. Chrome 156: paridade RGBA exata; smoke com 104 chamadas diretas e nenhum `drawImage` residual. Sem benchmark.

## D088 — v154.0 — Rasterizar sangue dinâmico e estático em Rust
Os batches de sangue dinâmico/estático e cadáveres já vinham do Rust legado, mas eram rasterizados no host. O módulo direto agora chama Canvas por `web-sys`, preservando alpha, paletas, transforms e paths. Fallback permanece. Chrome 156: cinco marcas de cada tipo e três cadáveres com paridade RGBA exata; regressões 82/82 e checks WASM/browser passaram. Sem benchmark.

## D087 — v153.0 — Rasterizar poeira e faíscas por Canvas direto em Rust
Os callbacks WASM já entregavam batches para poeira e faíscas, mas o host ainda repetia `moveTo`/`arc` ou `rect`/`fill`. A nova rota direta mantém esses dados e faz a rasterização por `web-sys`: poeira num path único, faíscas agrupadas por paleta/alfa, em `lighter`. O fallback JavaScript segue habilitado. Chrome 156 teve pixel parity exata nas duas amostras e confirmou 1.152 círculos em lote durante jogo. Regressões 82/82 e checks WASM/browser passaram. Sem benchmark.

## D086 — v152.0 — Desenhar labels cacheados de inimigo por Rust
O command ABI já seleciona a posição dos labels, mas a rasterização antiga chamava uma função JS por texto. O host agora resolve o canvas cacheado `TXC`, entrega imagem e posição no lote e Rust executa `drawImage` direto. Isso preserva o bitmap e tira o callback de desenho para esse comando. O lote valida todas as imagens antes de rasterizar, para que um caso não suportado permaneça no fallback JS. Chrome 156: zero diferenças RGBA no inimigo sintético com label, uma chamada direta confirmada; regressões 82/82. Sem benchmark.

## D085 — v151.0 — Rasterizar lotes geométricos de mapa direto em Rust
O bridge coleta os comandos já gerados pelo módulo antigo e os entrega ao `wasm-renderer-direct`; o Rust usa chamadas `web-sys` para executar 22 operações de Canvas, inclusive cores dinâmicas, alfa e path das rachaduras. Isso remove o callback JS por primitiva durante os passes cobertos do mapa, preservando a ordem original e mantendo fallback. Chrome 156 confirmou zero diferença RGBA nos 22 opcodes e 35 lotes diretos durante a partida. Regressões 82/82 passaram. Sem benchmark: não atribuir ganho de FPS.

## D084 — v150.0 — Rasterizar batches de entidades por Canvas direto em Rust
O módulo `web-sys` agora consome os comandos já produzidos pelo Rust legado para móveis, inimigos, jogadores, armas, fantasmas e aura, além de texto HUD bruto. O bridge mantém fallback até cada fluxo passar por chamadas diretas; a simulação e os dados de jogo permanecem no JS. Chrome 156 comparou os cenários cobertos com diferença zero. Sem benchmark e sem inspeção visual ampla; migração geral permanece incompleta.

## D083 — v149.0 — Renderizar motes ambientais em Canvas direto no Rust
Rust recebe posição/tamanho/fase atualizados pelo gameplay JS, calcula alpha com `Math.sin` do runtime Web e chama Canvas diretamente para cada mote. JS segue atualizando posição e respawn/RNG. Chrome 156 comparou dois tempos e obteve zero diferença; o contador confirma que a rota direta é usada. Fallback antigo permanece. Não foi medido desempenho real; quantidade máxima segue 128.

## D082 — v148.0 — Pintar a chuva como path Canvas direto de Rust
Rust recebe a lista de segmentos atualizada pelo JS, aplica o stride de qualidade e chama `beginPath`, `moveTo`, `lineTo` e `stroke` via `web-sys`, sem passar pelo batch antigo. Movimento, respawn e RNG permanecem no gameplay JS. Chrome 156 validou stride 1 e 2 com zero diferenças RGBA. O modo legado segue como fallback. Não medimos desempenho; a chuva varia com quantidade de gotas e as chamadas Web ainda são expostas pelo browser.

## D081 — v147.0 — Portar sobreposições transitórias para Canvas direto via WASM
O módulo `web-sys` agora desenha overlays de relâmpago/pisca, alarme e barras de cinema. Rust recebe os parâmetros já calculados pelo JS, desenha no contexto e não muda a lógica de efeito. `withCanvasBypass` impede que a API chamada pela glue WASM passe novamente pelo dispatcher genérico legado. Paridade Chrome 156 exata em seis combinações; pausa preserva a paridade v146. O fallback de comandos continua. Isso reduz uma família de operações no bridge antigo; o resto da cena continua híbrido e sem benchmark.

## D080 — v146.0 — Introduzir `web-sys` para chamar Canvas diretamente de Rust
Foi criado um segundo módulo Rust/WASM com `wasm-bindgen` 0.2.129 e `web-sys` 0.3.106 para que uma camada de UI receba o `CanvasRenderingContext2D` do host e invoque a API Web pelo próprio Rust. O menu de pausa é a primeira camada migrada por essa rota; estado e hover continuam JS e o painter batch antigo serve como fallback quando o módulo direto não está disponível. Chrome 156 mostrou zero canais diferentes em três estados. A decisão é incremental: o módulo legado permanece para não quebrar as demais rotas enquanto são portadas. O custo de FPS ainda não foi medido; há outro `.wasm` e glue JS para baixar.

## D079 — v145.0 — Recortar spritesheets de textura no Rust
`BuildFloor` passa os três spritesheets nativos pequenos (96×24, 144×24 e 48×24) sem materializar oito canvases de crop. O bridge lê cada folha uma vez para RGBA cacheado; Rust recorta as oito células 24×24 com validação de slot e limites e popula a tabela já usada pelo compositor. Entradas antigas com sprites de 24×24 continuam aceitas e entradas em folha que falham usam o fallback JS. ABI e pixel parity passaram. O host ainda acessa os pixels pelo Canvas, transfere a camada para o Canvas final e não há benchmark; portanto nenhuma melhora de FPS é afirmada.

## D078 — v144.0 — Gerar o sprite ambiental de névoa/fumaça no Rust
Os nove círculos e seus parâmetros continuam sorteados no JavaScript no ponto original de inicialização para não deslocar o RNG do gameplay. Pixels e composição source-over são gerados no Rust numa imagem cacheada 512×256; entrada inválida ou renderer indisponível usa o gradiente Canvas original. Bounds de cada círculo limitam os pixels visitados. Chrome 156: alfa máximo 1/255, média 0,1074/255; RGB máximo 12/255 em pixels com alfa≥64. Sem benchmark; a tolerância cobre arredondamento de gradiente/premultiplicação do Canvas.

## D077 — v143.0 — Rasterizar padrões de superfície e sprites de portas em RGBA Rust
As texturas estáticas de paredes/móveis e portas passam por um buffer RGBA em Rust para reduzir chamadas de padrão/clip/fill por sólido. O host continua responsável por extrair os recortes do asset e enviar a imagem final ao Canvas. O fallback de comandos Canvas permanece para entradas não suportadas. Chrome 156 encontrou máximo 76/255 e média 0,00194695/255 numa comparação Apartamento; diferenças observadas são raras e ligadas a bordas fracionárias, portanto o teste usa limite explícito e a saída não é chamada de idêntica. Sem benchmark. Rasterização geral e draw hooks ainda híbridos.

## D076 — v142.0 — Rasterizar sombras e rejunte junto ao piso RGBA
Sombras de sólidos e linhas de rejunte são estáticas durante a fase e seguem depois das texturas. Rust aplica cobertura geométrica por pixel e alfa preto sobre o mesmo buffer, emitindo uma única camada final. Coordenadas fracionárias são aceitas; dimensões e sólidos inválidos retornam ao fallback Canvas. Chrome 156 mediu diferença máxima 3/255 (média 0,1882/255) no compositor completo de Apartamento. Sem ganho medido; a rasterização ainda não substitui as demais camadas.

## D075 — v141.0 — Rasterizar FTILES Rust sobre a camada RGBA do piso
O mosaico é uma camada estática por mapa: passar os pixels de FTILES e os retângulos inteiros das salas ao Rust permite compor textura e granulado numa camada RGBA só, mantendo as dimensões internas e a ordem de fase. O corredor continua excluído e geometrias fracionárias/desconhecidas usam fallback Canvas. Chrome 156 encontrou diferença máxima 3/255 (média 0,194/255) contra Canvas; aceito apenas como aproximação limitada desta preview, documentada e coberta por limiar automatizado. Sem ganho de tempo medido; camadas posteriores ainda usam Canvas.

## D074 — v140.0 — Compor o granulado de piso em RGBA no Rust
O granulado é uma camada estática e determinística no buildFloor; o Rust conserva a sequência RNG e compõe sobre buffer RGBA premultiplicado para reproduzir as regras de arredondamento do Canvas. O host envia o buffer com um `putImageData`. Limite 1440×900 (5.184.000 bytes); dimensões maiores usam fallback JS. Chrome 156 confirmou paridade exata em 1440×900. Ganho de tempo não medido; memória adicional do buffer aceita para reduzir a quantidade de callbacks no build do mapa.

## D073 — v139.0 — Preservar o espaço global do gradiente de porta
O Canvas original define o gradiente sobre a largura total do elevador e preenche dois painéis separados. Rasterizar cada painel como gradiente independente muda o visual; o Rust recebe o offset de cada painel e a largura global, e mantém texturas cacheadas separadas. Diferença sintética Chrome máxima de 1/255 por canal. Canvas fallback mantido e cena completa não validada.

## D072 — v137.0 — Pré-rasterizar e reutilizar o gradiente da saída
Gerar a textura de saída em Rust quando dimensões ou estado mudarem; no quadro, o host reutiliza-a e escala alpha para o pulso. Validar alpha/RGB contra Canvas. O fallback permanece; medir frame time antes de alegar benefício.

## D071 — v136.0 — Pré-gerar muzzle flash em RGBA no Rust
Para o modo WASM, gerar uma vez o gradiente branco/amarelo/laranja no Rust e reutilizar o sprite em cada efeito. Preservar alpha, composição aditiva e limites; aceitar diferença RGB observada de até 8 níveis no sprite fonte, mantendo fallback de gradiente Canvas. Inspecionar o resultado em combate antes de declarar paridade visual; sem promessa de FPS sem benchmark.

## D070 — v135.0 — Aproximar raiz na geração radial Rust
Usar estimativa por bits e três iterações de Newton para calcular a distância de cada pixel radial. A varredura comparativa não alterou o alpha final arredondado nos casos amostrados; a validação Chrome sintética fica registrada. Não afirmar ganho de FPS sem benchmark; manter a implementação Canvas como fallback.

## D069 — v134.0 — Rasterizar sprites radiais em Rust
Gerar os RGBA dos sprites radiais em Rust e enviar ao host por `ImageData`. Adiar a inicialização dos sprites compartilhados até o primeiro quadro para usar o WASM se já estiver pronto; o gradiente Canvas segue como fallback. Comparar contra Canvas e registrar desvios de alpha/cor; não afirmar paridade ou ganho de FPS sem validação visual/benchmark.

## D048 — v111.0 — Acentos de classes inimigas em Rust
Rust recebe registros visíveis de classe e emite contorno, armadura, coroa, laser de aviso e pulso/linha de carga dos chefes. JS mantém IA, temporizadores, seleção/visibilidade de classes e painter de fallback; host rasteriza comandos Canvas com paleta dinâmica validada. Smoke Chromium confirmou uma cena sintética sem exceções; não alegar equivalência geral ou ganho de desempenho.

## D047 — v110.0 — Câmeras da expansão em batch Rust
O gameplay mantém posição, cone, ângulo e alarme em JavaScript; o bridge reutiliza a entrada WASM e Rust gera setor e corpo da câmera. Rasterização permanece Canvas, com painter JS como fallback. Não declarar equivalência visual nem ganho de desempenho sem inspeção visual e medição.

## D046 — v109.0 — Desenho de barris da expansão em Rust
Passar registros compactos de barris (posição, raio e timer) ao Rust em uma única chamada, com limite fixo de 16. Preservar o timer/pisca existente, cores e geometria Canvas através do host, manter o painter JS como fallback e não alegar ganho visual/de desempenho sem smoke e medição.

## D045 — v108.0 — Zona pulsante do modo Invasão em Rust
O modo permanece no estado JavaScript. Quando ativo, enviar x/y/relógio ao Rust para calcular pulso e fornecer geometria; o host rasteriza stroke/fill no Canvas mantendo estilo, ordem e fallback do modo antigo. Sem alegação de equivalência visual do modo completo ou ganho de FPS até realizar smoke específico e medições.

## D044 — v107.0 — Anéis da expansão como lote Rust
Manter lista, timers e cores de `WLD.rings` no gameplay JavaScript. Passar cada slot ativo ao Rust para validar e calcular posição, raio, alfa e espessura; o host mapeia a cor e rasteriza os arcos Canvas depois do retorno WASM. Preservar o painter original como fallback, sem alterar a ordem dos rings nem afirmar ganho sem medir.

## D043 — v106.0 — Posição da etiqueta climática em Rust
Manter o raster/cache de texto da etiqueta no JavaScript e enviar suas dimensões com o estágio de HUD; Rust escolhe coordenadas e destino, o host desenha o asset. O painter `drawImage` JS permanece como fallback. ABI/bridge cobrem o novo estágio. A validação visual em Chromium continua pendente após o alvo DevTools parar de responder; sem alegação de FPS.

## D042 — v105.0 — Posição do texto do alarme em Rust
Manter temporizador e evento do alarme na simulação JS. Rust valida o timer e envia a posição central; o host conserva `fillText` direto com fonte/cor/alinhamento atuais, sem passar pelo cache `tx()` que acrescentaria contorno. Painter JS permanece como fallback. Sem alegação de FPS.

## D041 — v104.0 — Seleção de imagens do HUD em Rust
Enviar estágio, dimensões/toggles e handles existentes para Rust decidir a vinheta do gameplay, a vinheta do HUD e a posição do retrato. O host mantém as imagens e chama `drawImage` após o retorno WASM; painter JS permanece como fallback. Preservar a separação dos estágios para não alterar a ordem em relação aos efeitos. Sem alegação de desempenho.

## D040 — v103.0 — Pulso do multiplicador de combo em Rust
Manter no JavaScript o estado/temporizador do combo e enviar valor e relógio monotônico ao Rust. Rust valida o limiar e calcula o pulso; o host rasteriza o texto com a mesma fonte, contorno, cor e ordem de Canvas. Manter painter JS como fallback. Sem alegação de FPS.

## D039 — v102.0 — Máscara de apagão e lanterna em comandos Rust
Rust calcula a projeção do jogador e os três raios (luz próxima, cone e clarão de disparo) e emite um único comando. O host conserva sprites, path/clip e composição Canvas na camada intermediária reduzida. Estado de apagão, ângulo/pose e fallback permanecem no JS. Não afirmar paridade visual ou desempenho sem smoke e medições específicas.

## D038 — v101.0 — Luzes aditivas e reflexo de chuva em lote Rust
Preservar no JavaScript a simulação das luzes e criar/cachear seus sprites; Rust determina pulso, cintilação Neon, stride de qualidade, posição de clarão e geometria do reflexo. O host aplica o batch Canvas em composição `lighter`. Sem alegação de FPS.

## D037 — v100.0 — Geometria de overlays de efeito em Rust
Manter a lógica temporal dos efeitos em JS e enviar dimensões/timers para o Rust emitir retângulos de clarão de chuva, cintilação, alarme e barras de cinema. O host conserva estilos CSS/Canvas e rasteriza em batch salvo/restaurado. A configuração de reduzir flashes bloqueia clarão na camada Rust e no fallback. Texto do alarme continua no caminho existente. Sem alegação de FPS.

## D036 — v99.0 — Posições de névoa/fumaça em lote Rust
Preservar as imagens e o backend Canvas do host, mas mover para Rust a seleção do estilo, alpha, corte por qualidade e cálculo das três posições animadas. O painter JS continua como fallback para ausência do módulo/dados inválidos. O batch salva/restaura o contexto e desenha assets não reentrantes depois de retornar do WASM. Sem alegação de FPS.

## D035 — v98.0 — Alpha das partículas de poeira ambiental
Manter a evolução de x/y, o wrap e o respawn aleatório no JavaScript. Enviar x/y/tamanho/fase e tempo atual ao Rust para validar a lista e calcular o alpha sinusoidal; o host desenha os quadrados com save/restore. Como o crate é `no_std`, usar redução de intervalo e polinômio seno de grau 17 em vez de adicionar dependência; o erro é coberto por tolerância automatizada. O painter original continua como fallback. Sem alegação de FPS.

## D034 — v97.0 — Geometria de chuva em lote Rust
Preservar no JavaScript o avanço fixo e o respawn com `Math.random`, pois são parte do estado temporal do clima. Enviar posição e comprimento ao Rust, que aplica o stride de qualidade, filtra dados inválidos e emite segmentos na ordem original; o host rasteriza um único caminho Canvas com save/restore. Isso evita mover aleatoriedade/simulação para o renderizador. O painter JS continua como fallback; sem alegação de desempenho.

## D033 — v96.0 — Textos do jogo em lote sem mudar o cache visual
Concentrar no Rust a validação e a sequência de posições/alinhamentos/alfa para HUD e mensagens de saída, transporte, coleta, popup e banner; deixar o host chamar `tx()` com texto/fonte/cor existentes. Isso preserva o cache rasterizado, saves e aparência enquanto remove chamadas individuais de pintura do loop. Combo Canvas e hooks de expansão continuam em JS; sem medição de ganho.

## D032 — v95.0 — Rastros do jogador em lote Rust
O array de rastros e seu alpha temporal continuam sendo mantidos pela lógica JS. Rust gera, na ordem original, sombra, arma e corpo usando o backend já empregado pelos atores; Canvas continua no host.

## D031 — v94.0 — Geometria do HUD em comandos Rust
Rust calcula as formas da barra de combo, borda do retrato e fundo de pausa. O host conserva Canvas, fontes/textos e rasterização; a lógica e estado de jogo continuam no JS.

## D030 — v93.0 — Fade e flash final em lote Rust
Rust escolhe quais overlays estão ativos e a ordem fade antes de flash; o host conserva Canvas e geometria visual. A opção oflash continua fornecida pela configuração JS.

## D029 — v92.0 — Color grade como comandos Rust
O módulo Rust gera geometria e ordem dos dois preenchimentos de gradação; o host executa Canvas em lote para preservar a rasterização do navegador. O fallback JS continua disponível. Simulação e configurações permanecem no JS.

# Decisões técnicas

## D028 — v76.0 — Transformações das portas Neon em lote Rust
Enviar ao Rust posição, ângulo de base, ângulo atual de abertura, offsets da arte e handles de sprite das portas Neon. Rust combina os ângulos e mantém a ordem; o host resolve imagens e rasteriza Canvas depois do retorno. A atualização temporal da porta fica no gameplay JS, e `neonDrawDoor` continua como fallback. Sem alegação de desempenho.

## D027 — v75.0 — Seleção da textura FTILES em lote Rust
Enviar para Rust as salas, a posição especial do corredor e o índice do tile; Rust devolve comandos ordenados de clip/fill com a mesma translação. O host mantém a imagem, cria um CanvasPattern e rasteriza depois do retorno WASM. O painter JS continua disponível como fallback; sem alegação de desempenho.

## D026 — v74.0 — Texturas estáticas como seleção geométrica Rust
Manter os assets PNG e seus recortes no host, mas transferir ao Rust a escolha por tipo de sólido, recorte de móvel, dimensões e orientação dos decals de porta, numa lista ordenada. O host cria CanvasPattern, clipping e drawImage após o retorno WASM; o painter original continua como fallback. Preserva os arquivos e permite avançar a fronteira do renderer sem mover carregamento de imagem para gameplay; sem alegação de desempenho.

## D025 — v73.0 — Detalhes estáticos do piso em lotes determinísticos
Dividir a camada `buildFloor` em granulado pré-textura e sombras/rejunte pós-textura, preservando sua ordem visual. Rust usa o mesmo RNG seeded e devolve a semente avançada; o host rasteriza lotes compactos, com os overlays de imagem e o painter JavaScript disponíveis. Isso reduz o loop de geometria JS sem mudar gameplay; não há medição de desempenho.

## D024 — v72.0 — Geometria de vidros quebráveis em lote Rust
Enviar a geometria visível de painéis intactos e estilhaços ao WASM como dados compactos, emitir comandos ordenados e deixar timers/remoção de gameplay no JavaScript. O host rasteriza Canvas e mantém painter JS como fallback. Isso migra uma camada visual pequena sem alterar colisão, quebra ou duração dos fragmentos.

## D023 — v71.0 — Fundo e decoração estática em comandos de mapa
Portar geometria e ordem de preenchimentos, contornos de tapete e decoração para Rust; receber cores dinâmicas do mapa no host para preservar dados existentes. Manter o painter JS como fallback e preservar `paintMap` como orquestrador até a ordem completa ser portada. Essa etapa ocorre na montagem do mapa; não afirmar ganho de FPS.

## D022 — v70.0 — Textos de estado de inimigos como comandos semânticos
Rust determina o tipo/posição do texto e o coloca após o corpo e os orbes no range ordenado; o host mapeia o ID para `tx()` para preservar fonte, contorno e cache existentes. O evento antigo continua como fallback quando o range não existe ou o host não fornece o painter de texto. Isso mantém a decisão e ordenação no backend sem reimplementar fonte rasterizada; nenhum ganho de FPS foi medido.

## D021 — v69.0 — Orbes de stun no lote do inimigo
Acrescentar a geometria dos três orbes (círculo externo translúcido e interno amarelo) ao range Rust do corpo visível, usando o mesmo relógio `performance.now()` e preservando a ordem corpo → orbes → rótulos. O host continua desenhando “ATORDOADO” e mantém o painter inteiro como fallback. Uma senoide polinomial evita dependência externa; pequenas variações de ponto flutuante são possíveis. Não alegar ganho de FPS sem medição.

## D020 — v68.0 — Composição de jogadores em um lote Rust
Manter no JavaScript apenas os acumuladores de animação já usados pelo jogo e enviar até três poses por frame. Rust compõe transform, sombra/aura, arma, frame do spritesheet ou fallback, detalhes cosméticos e tag em comandos ordenados; o host resolve imagem/texto e rasteriza somente após o retorno WASM, evitando reentrância. Preservar painter JS em falha e não afirmar ganho de desempenho sem comparação.

## D019 — v67.0 — Corpos de inimigo em buffer de comandos
Gerar no Rust um lote por quadro com ranges por inimigo e consumir cada range na ordem dos eventos, mantendo stun/rótulos intercalados corretamente. O host resolve as cores e o Canvas, e fornece o spritesheet como asset; quando um range não existe, o painter JavaScript permanece disponível. O buffer tem limite explícito e faz fallback seguro se excedido. A rasterização continua nativa e não se assume ganho de FPS.

## D018 — v66.0 — Geometria de sombra inimiga em buffer
Manter o fluxo de inimigos sem callbacks/reentrância durante o cálculo Rust: o módulo preenche um buffer contíguo com posição, raios e alpha e o host aplica cada sombra antes do corpo correspondente. O corpo recebe um sinal para pular somente a sombra que já foi aplicada; sem contexto do host, o painter antigo continua responsável por ela. A rasterização permanece Canvas e nenhum ganho de desempenho é assumido.

## D014 — Preview local de ABI para migração do renderer
Usar Rust `no_std` com ABI WASM manual e imports host, sem `wasm-bindgen`, para compilar no ambiente Windows disponível e evitar dependências de build. O modo experimental encaminha chamadas Canvas preservando comportamento e porta camadas de lógica de desenho por vez. Manter JavaScript como padrão/fallback até todas as camadas reais serem portadas e comparadas.
## D017 — v54.0 — Identificar origem dos projéteis locais
Os projéteis dos jogadores carregam `owner: 'p1' | 'p2'`; tiros de inimigos não têm proprietário de jogador. A opção salva `friendlyFire` só permite colisão com o parceiro, nunca com o próprio atirador. A regra é aplicada no loop atual de projéteis para preservar colisão, paredes e perfuração existentes.

## D016 — v53.0 — Corrigir spawns de mapas Neon na geração
Validar posições após consolidar a geometria e deslocar entidades para o ponto livre mais próximo, mantendo o conteúdo e o desenho fonte do mapa. É uma busca única por montagem; se não existir ponto válido, a entidade é omitida em vez de nascer dentro de sólido.

## D014 — v52.0 — Skin como preferência cosmética separada
Guardar o identificador cosmético em `settings.skin` do save v2 e fornecer default via merge, preservando todo progresso. Não reaproveitar `settings.char`, pois personagens atuais definem atributos e máscaras. Não criar desbloqueios ou economia para skins nesta entrega.

## D015 — v52.0 — Evitar conclusão vazia e spawn fixo em sólido
Portas fechadas podem isolar as salas internas do spawn inicial, então o corredor gerado é candidato a spawn desde a fase 1. A sala só pode ser marcada limpa se teve inimigos. Mapas fixos validam e ajustam coordenadas de jogador em geometria livre, sem alterar dados/assets originais.

## D013 — v42.0 — Telemetria simples e expiração do avatar remoto
Medir o tempo HTTP das atualizações enviadas e chamá-lo de resposta aproximada, sem apresentá-lo como ping puro. Se o avatar remoto não receber snapshot por 5 s, removê-lo da cena; não persistir estado de sala. Isso melhora feedback e evita exibir uma posição antiga indefinidamente sem sugerir sincronização autoritativa.

## D012 — v41.0 — Suavizar a apresentação do relay sem inventar sincronização
Manter uma instância estável do avatar remoto e interpolar seus alvos a cada quadro. O snapshot não é interpolado no servidor e as mecânicas de jogo permanecem locais; o lobby precisa declarar essa limitação.

## D011 — v40.0 — Preferências visuais devem sobreviver a wrappers
Configuração final de antialiasing é aplicada no wrapper de desenho a partir do CFG atual, para que nenhuma camada posterior force uma qualidade incompatível. Intensidade de tremor usa multiplicador separado do interruptor geral e é validada como faixa de 0 a 100.

## D001 — 04/11/2026 — Cópia isolada e versão v34.0
Trabalhar sobre a distribuição autorizada, sem sobrescrever o ZIP original. A pasta se chamava v30, mas o README terminava em v33; v34.0 identifica esta iteração sem reescrever o histórico. Sem Git na origem: preservados arquivos anteriores para comparação durante a sessão e hash do pacote de origem no relatório.

## D002 — Corrigir contratos antes de refatorar
Preservar os wrappers existentes. Encaminhar target de hit até a base corrige o dano de P2 com mudança mínima. Evitada a reestruturação de todo o combate, que exigiria testes visuais e de todos os modos.

## D003 — Persistência compatível e explícita
Manter save v2 e chaves antigas. Validar estruturas conhecidas e rejeitar chaves de protótipo; conservar campos adicionais seguros. Separar restoreBackup/reloadSave da recarga de arma. Só confirmar importação após persistência e manter o estado anterior recuperável. Não usar saves reais nos testes. Saves de formato futuro ficam protegidos contra escrita.

## D004 — Cache por instalação
O manifesto anterior listava 489 entradas, 385 inexistentes e omitia music/multi. Gerar lista a partir dos 106 arquivos de execução existentes. Evitar cache de documentação/testes. Abrir somente o cache deste escopo, limpar apenas versões próprias e permitir fallback de index para navegação offline. Não fabricar assets faltantes nem apagar referências de mapas.

## D007 — Sala online sem dependências
Para permitir experimentar multiplayer cliente-servidor sem pacote ou serviço externo, usar Node HTTP, sala em memória, identificadores aleatórios e long polling. O servidor não é autoridade de jogo nesta etapa: só retransmite posição/presença. O cliente mantém uma cópia local da simulação. Essa limitação fica explícita na UI/documentação e orienta a próxima etapa (sincronizar eventos e simulação).

## D008 — v37.0 — Credencial privada e recuperação de sala
Não reutilizar o ID visível no room view como credencial. O servidor emite token privado no cabeçalho Authorization e mantém ID público independente. Guardar token em sessionStorage para permitir reload na mesma aba, com saída explícita e expiração por inatividade. Long polling mantém uma resposta pendente por jogador; o cliente reconecta com atraso progressivo.

## D009 — v39.0 — Listagem no servidor atual e perímetro global
A lista de salas consulta a mesma instância Node que já atende os jogadores. Ela não tenta descobrir hosts na rede nem cria catálogo público, o que exigiria um serviço persistente e hospedagem. Mantemos a resposta sem tokens e o relay atual. O bloqueio de saída do mapa usa os limites dinâmicos WW/WH compartilhados pelas fases, inclusive mapas neon sem paredes externas; a colisão usa raio para a borda não atravessar o limite visual/jogável.

## D005 — Controles conforme menu
No cooperativo P1 mantém WASD, mesmo que o solo esteja configurado com setas. P2 usa Ctrl Direito para tiro e ponto para soco. Removida apenas a sobreposição não documentada do ponto como tiro; numpad/gamepad preservados.

## D006 — Medição honesta
Os testes VM executam funções reais com interfaces DOM/storage/cache simuladas. Eles não equivalem a navegador, GPU, áudio ou jogo completo. Microbenchmark de navegação e compilação não prova ganhos de FPS; algoritmos de navegação não foram otimizados nesta iteração.
## D010 — v39.0 — Preferências com efeito observável
Manter auto reload desligado por padrão e não recarregar automaticamente quando está desligado; o comando manual C permanece. Volume mestre atua como multiplicador nos ganhos de música e efeitos, preservando os níveis individuais.

## D049 — v112.0 — Tremores em duas etapas Rust
Preservar a hierarquia do Canvas: aplicar screen shake antes do save interno e kick/camera shake depois dele. JS continua amostrando RNG e atualizando timers; Rust calcula/emite as translações, com fallback JS. O smoke confirmou execução sem exceções; não há comparação de paridade ampla ou medição de desempenho.

## D050 — v113.0 — Transformação da câmera do mundo em Rust
Enviar dimensões, zoom e posição da câmera ao estágio 2 do batch de transformação. Rust preserva a sequência translate-centro, scale, translate-centro inverso e translate-câmera; host mantém a rasterização e JS conserva calcView e fallback. Sem alegação de paridade geral ou ganho de desempenho.

## D051 — v114.0 — Vidros e estilhaços em lote Rust
Manter quebra, movimento, aleatoriedade e pools de estilhaços no JS. Enviar painel/reflexo, pose, vida, tamanho e cor para Rust calcular os comandos de desenho; o host rasteriza e conserva fallback. Buffers limitados a 96 painéis e 160 estilhaços; acima disso o painter JS continua disponível. Sem alegação de paridade geral ou desempenho.

## D052 — v115.0 — Geometria da barra de chefe em Rust
Manter vida, fases, cor e texto do chefe como estado/dados do jogo; Rust calcula e ordena fundo, barra proporcional, marcadores e contorno em um batch fixo. O título usa a lista Rust de textos HUD para posição/ordem, com `tx()` cacheado no host. O painter JS continua como fallback para dados inválidos ou acima do limite de fases. Esta mudança não prova paridade visual global nem ganho de desempenho.

## D053 — v116.0 — Seta de direção da Invasão em Rust
Manter no JS a projeção da zona e a decisão de quando mostrar o indicador; enviar centro e orientação para o Rust gerar os três vértices da seta. O host rasteriza o preenchimento rosa e mantém fallback JS. Testes geométricos cobrem transformação válida e rejeição de entradas não finitas; sem alegação de paridade visual global ou desempenho.

## D054 — v117.0 — Barra de recarga no batch de formas HUD
Estender o batch de formas HUD com a geometria fixa/progressiva da barra de recarga. JS mantém o tempo e o fallback; host mantém cores, texto e rasterização. A suíte cobre proporção, dimensões e ordem; sem medição de desempenho.

## D055 — v118.0 — Avisos temporários pelo batch de textos HUD
Agrupar no máximo três títulos/subtítulos visíveis na ordem já usada pelo jogo. Rust valida posições e alfa; host reaproveita `tx()`; JS mantém a vida dos avisos e o painter fallback. Sem alteração no conteúdo, temporização ou sistema de anúncios.

## D056 — v119.0 — Rótulo de modo pelo batch de textos HUD
Enviar ao renderer Rust o rótulo ativo já formatado, com cor e tipografia atuais. JS conserva seleção do texto e fallback; o host desenha pelo cache `tx()`. Sem alteração de campanha ou regras do modo.

## D057 — v120.0 — Flash do Contrarrelógio pelo batch de efeitos
Manter a oscilação temporal no JS e enviar a alfa, dimensões e preferência visual ao batch Rust existente. Rust escolhe o retângulo e a cor; host rasteriza e o desenho JS continua como fallback.

## D058 — v121.0 — Textos de munição e recarga no batch HUD
Enviar as strings já calculadas de pente/munição e recarga ao batch Rust de textos HUD, preservando cor, fonte, coordenadas e ordem. Estado e escolha do aviso seguem JS; `tx()` cacheado e fallback permanecem.

## D059 — v122.0 — Resumo de pausa de modos no batch HUD
Agrupar três textos do resumo de pausa (modo/nível, abates/pontos/XP e atalho de saída) numa chamada ordenada ao batch Rust. JS mantém os valores e fallback; `tx()` cacheado permanece no host.

## D060 — v123.0 — Geometria dos botões de pausa em Rust
Enviar dimensões e índice de hover ao batch Rust para gerar o véu e os dois pares de preenchimento/contorno, preservando coordenadas e ordem do Canvas. JavaScript mantém hit test, ações e fallback; textos continuam no batch HUD. ABI, bridge e regressões 68/68 passaram; sem inspeção comparativa ou FPS.

## D061 — v125.0 — Configuração de canvas cacheada no batch Rust
Enviar escala base, suavização e qualidade para uma entrada Rust validada e aplicada por callback host; cachear o estado para que o caminho por frame não repita as três chamadas Canvas. Forçar nova aplicação após redimensionamento, quando a atribuição do canvas redefine seu contexto. A coleta de histogramas/stacks residuais fica opt-in por query de diagnóstico. Testes cobrem validação, cache e reaplicação; sem benchmark para afirmar ganho de FPS.

## D062 — v126.0 — Preenchimento base do quadro em Rust
Enviar dimensões lógicas ao Rust para emitir o preenchimento base incluindo os 20 px de margem que cobrem screen shake. Host conserva cor e `fillRect`; JS usa o painter anterior como fallback. A regressão confere dimensões, validação de entrada e integração. Sem medição de desempenho.

## D063 — v127.0 — Ignorar passe aditivo vazio
Checar fontes de luz e efeitos antes de abrir o escopo Canvas do passe aditivo. A verificação não depende do renderer WASM, portanto a implementação original continua desenhando corretamente quando ele está desligado. Manter o painter Canvas para luz, flash ou reflexo ativos. A regressão verifica a guarda, a descoberta das luzes e a existência do fallback. Sem benchmark de desempenho.

## D064 — v128.0 — Escopos de transformação no batch Rust
Agrupar os saves/restores externos do renderer com as etapas de transformação que já eram geradas pelo Rust. Os stages adicionais só emitem o escopo Canvas e usam o mesmo batch validado; o painter JavaScript abre/fecha o contexto quando WASM está inativo ou recusa entrada. Isso evita separar o estado do transform da etapa correspondente, preserva a pilha aninhada original e permite regressões de ordem/balanceamento. Sem benchmark ou comparação visual.

## D065 — v129.0 — Evitar escrita redundante de alpha
Depois do batch Rust de fantasmas, manter o estado Canvas se globalAlpha já for 1 e restaurá-lo apenas quando estiver diferente. No fallback JS, os fantasmas continuam definindo os próprios valores por ator e a guarda final mantém a semântica do estado. Sem benchmark; smoke v129 não confirmou WASM pronto.

## D066 — v130.0 — Rótulos de transporte no batch de texto
Enviar o texto do rótulo da escada/elevador ao batch Rust de textos HUD somente após o batch de geometria de transporte ter sido desenhado. Preservar string, coordenadas, cor, fonte e alinhamento; manter tx() via drawHudTextBatch como fallback se WASM não estiver disponível. Assim o desenho não contorna o caminho Rust apenas para esse rótulo.

## D067 — v131.0 — Texto direto do overlay em batch raw
Usar o batch HUD Rust para encaminhar o texto dos créditos da loja sem convertê-lo ao painter cacheado `tx()`, pois isso alteraria o estilo de contorno. O host preserva `fillText` original e seus parâmetros dentro de `withCanvasBypass`, multiplicando o alpha informado pelo alpha Canvas herdado. Entrada inválida ou renderer inativo mantém o painter direto original. Isso retira o rótulo do bridge genérico sem alegar redução de rasterização ou ganho medido.

## D068 — v133.0 — Geometria da loja via batch Rust
Manter os estados de gameplay e seleção dos textos no JS, mas enviar os valores geométricos do dealer e painéis ao Rust, que produz comandos ordenados de forma. O host Canvas aplica os comandos depois do retorno WASM e o painter original fica como fallback. Cachear o contexto de medição do balão para evitar save/restore por quadro. Não declarar paridade visual nem ganho de FPS sem comparação dedicada.


## D094 — v160.0 — Restaurar estado Canvas no painter Rust de poeira
A chamada Rust de poeira alterava globalAlpha e não restaurava o contexto, obrigando um setter host no final do quadro. O painter agora envolve alpha/estilo em save/restore; fallback JS já usava esse contrato. Chrome 156 confirmou a mesma saída RGBA e alpha de entrada restaurado. Sem benchmark.

## D104 — v170.0 — Rasterizar muzzle flash e arcos de impacto em Rust
Manter os dados e o sprite pré-gerado no host, enviar o lote tipado ao painter Rust direto e conservar o callback Canvas como fallback. Isso move a chamada de desenho para o módulo direto sem alterar simulação ou RNG. Chrome 156 mostrou pixels RGBA idênticos nos casos cobertos; regressões 82/82. Sem benchmark.

## D105 — v171.0 — Rasterizar estojos no painter direto
Reutilizar a projeção e o lote existente do WASM legado, enviando as elipses ao painter Rust/WebSys. Mantém a geometria, ordem, cor, alpha e fallback atuais, movendo o desenho para Rust sem alterar física ou simulação. Chrome 156 mostrou pixels idênticos nos casos cobertos; regressões 82/82. Sem benchmark.

## D106 — v172.0 — Rasterizar texto de combo por Rust direto
Manter cálculo de pulso e multiplicador no caminho atual, enviando o comando e a string formatada ao módulo web-sys. Isso desloca as chamadas de transform/stroke/fill de texto sem mudar timing ou conteúdo. Chrome 156 mostrou igualdade RGBA exata; regressões 82/82. Sem benchmark.

## D107 — v173.0 — Rasterizar texto do alarme via Rust
Preservar no WASM legado o cálculo do rótulo e a centralização; usar Rust direto para as propriedades Canvas e fillText, com fallback existente. Isso move a rasterização sem mudar o relógio ou texto. Chrome 156 teve igualdade RGBA exata e regressões 82/82. Sem benchmark.

## D108 — v174.0 — Rasterizar imagens do HUD via Rust
Reutilizar a seleção/layout calculados no WASM legado e passar a imagem já escolhida ao helper WebSys, preservando Canvas fallback. Os sprites podem ser Canvas ou HTMLImageElement, ambos suportados. Chrome 156 mostrou igualdade RGBA e estado do Canvas preservado; regressões 82/82. Sem benchmark.

