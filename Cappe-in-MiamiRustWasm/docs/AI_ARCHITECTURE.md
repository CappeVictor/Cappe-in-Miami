# Arquitetura real — preview local v170.0

## Preview Rust/WASM local v170.0 — efeitos curtos
O callback de muzzle flash e arco de impacto entrega ao painter Rust um lote intercalado com posição, tempo, raio, ângulo e tipo de efeito. O sprite de muzzle permanece uma imagem criada/cacheada no host; a simulação e o fallback também seguem JS.

## Preview Rust/WASM local v169.0 — composição de escuridão
O callback de dark overlay entrega comandos, três sprites e os dois contextos ao módulo direto; Rust limpa/pinta o canvas half-res, recorta o cone e compõe a imagem na tela. A simulação de luz, câmera e fogo continua JS/WASM; fallback Canvas continua ativo.

## Preview Rust/WASM local v168.0 — batches de mundo
O módulo direto agora rasteriza lotes de névoa, sprites de luz, anéis e zona de invasão, consumindo os comandos calculados pelo WASM legado. O bridge tenta o painter Rust antes do callback Canvas JS. Fallback mantido; paridade visual ainda não verificada nesta iteração.

## Preview Rust/WASM local v167.0 — overlays dev no painter direto
`exp-debug.js` mantém estado, coleta geometrias/labels e chama `drawDebugWorld` do módulo `web-sys`; Rust desenha retângulos, círculos, linhas de alvo e texto. Fallback Canvas é mantido. Os overlays só existem no modo dev.

## Preview Rust/WASM local v166.0 — painel dev
O painel de depuração monta strings em JS e usa o módulo direto para desenhá-las. Toggle de erros continua compatível; Canvas JS segue como fallback.

## Preview Rust/WASM local v165.0 — estado de alpha em toasts
O painter de textos Rust já restaura o estado do contexto; o host não escreve `globalAlpha` outra vez após o sucesso. O fallback mantém o reset necessário. Smoke Chrome com explosão controlada não observou Canvas host; o restante das telas não foi exaustivamente auditado.

## Preview Rust/WASM local v164.0 — marcas de explosão
O efeito do barril continua no JS, mas as duas marcas circulares persistentes são desenhadas pelo painter Rust direto no layer do chão. O Canvas host permanece como fallback. Sem benchmark.

## Preview Rust/WASM local v163.0 — vidro quebrado
`breakGlass` mantém a simulação e a geração aleatória no JS, mas envia os nove polígonos persistentes e limites do vidro ao painter Rust direto. O fallback continua presente. Teste Chrome 156 teve igualdade RGBA; nenhuma alegação de ganho de desempenho.

## Preview Rust/WASM local v162.0 — sombras de inimigos
No renderer de gameplay, o dispatcher legado entrega uma sombra antes do corpo de cada inimigo; a elipse agora é desenhada pelo módulo Rust direto. A ordem de sobreposição é mantida e o painter JS continua como fallback. Chrome: 194 chamadas diretas em gameplay; três casos sintéticos com igualdade RGBA. Renderer híbrido, sem benchmark.

## Preview Rust/WASM local v161.0 — suavização no módulo direto
Ao montar o mapa, `paintMap` encaminha `imageSmoothingEnabled` para o Rust/WASM direto. Chrome 156 confirmou duas chamadas no smoke e nenhuma escrita de propriedade Canvas pelo host. Isso cobre o cenário curto testado, não todas as telas/estados. Renderer híbrido e sem benchmark.

## Preview Rust/WASM local v160.0 — estado da poeira
O painter Rust de poeira agora usa save/restore ao alterar alpha e estilo do Canvas, preservando o contexto do jogo como o fallback. A comparação Chrome 156 ficou RGBA-exata e o smoke parou de registrar o setter host globalAlpha. Movimento, dados das partículas e alpha continuam calculados pela simulação JS; não houve benchmark.

## Preview Rust/WASM local v159.0 — composição de camadas e sangue
Camadas de mapa agora são recortadas e desenhadas pelo módulo direto web-sys; o alpha do sangue estático é aplicado dentro do escopo Rust com restauração de estado. kill() mantém geração de aleatoriedade/posições no JS e envia vetores ao Rust para rasterizar manchas quadráticas, rastros e gotas. Chrome 156 confirmou igualdade RGBA nos casos sintéticos e um kill real usou a rota direta sem quadraticCurveTo no host. Simulação e fallback permanecem em JS; outras camadas/eventos ainda requerem auditoria. Sem benchmark ou paridade visual ampla.

## Preview Rust/WASM local v158.0 — bitmaps de texto
`createTextImage` usa `web-sys` no módulo Rust direto para medir e rasterizar os bitmaps cacheados dos rótulos de clima e estados de inimigos, incluindo contorno. O JS ainda mantém os caches, fluxo e painter de fallback. Chrome 156 comparou um caso de cada tipo com diferença RGBA zero; o smoke não registrou `measureText` nem `fillText` residual entre as operações observadas. Isso não converte todo texto/HUD nem outros draw hooks; não houve benchmark nem validação visual ampla.

## Preview Rust/WASM local v157.0 — limpeza de retângulos
`clearCanvasRect` encaminha `clearRect` ao Canvas pelo módulo Rust em `buildFloor`, `buildNeonFloor` e na invalidação da camada de sangue cacheada. Os chamadores mantêm fallback JS. Smoke Chrome: quatro limpezas diretas, nenhuma operação residual `clearRect`.

## Preview Rust/WASM local v156.0 — pixels RGBA
O módulo direto cria `ImageData` a partir do contexto Canvas e copia os pixels recebidos dos buffers do módulo legado; em seguida chama `putImageData` por `web-sys`. A integração cobre piso, texturas de mapa, sprites radiais/muzzle, gradiente de saída e frames de jogador, mantendo os buffers/caches JS como fallback. Chrome 156 confirmou 18 criações e 24 aplicações diretas no smoke, sem chamadas residuais `createImageData`/`putImageData`.

## Preview Rust/WASM local v155.0 — imagens de Canvas
`drawCanvasImage` executa em Rust o desenho de imagens cacheadas no Canvas, como o rótulo do clima e os snapshots/restaurações de `fl`/`tp`. `exp-fx.js` e `snapCanvas`/`restoreCanvas` ainda controlam cache e fluxo, com fallback JS. Chrome 156: zero diferenças RGBA; o smoke usou a rota direta 104 vezes e não registrou `drawImage` residual. Imagens e mapas mais amplos ainda têm caminhos híbridos.

## Preview Rust/WASM local v154.0 — manchas de sangue diretas
Os batches existentes de sangue dinâmico e estático agora chamam métodos `web-sys` do módulo direto. O dinâmico conserva um `beginPath`/`fill` por marca, alfa de cada registro e reset final de `globalAlpha` para 1; as marcas estáticas preservam `moveTo` antes de cada arco e o fill agrupado. JS permanece dono da simulação e do fallback. Chrome 156 comparou cinco marcas de cada tipo com zero diferenças RGBA. O caso de inicialização não gerou marcas reais; o teste foi sintético. Sem benchmark.

## Preview Rust/WASM local v153.0 — partículas de poeira/faísca
`draw_dust_batch` e `draw_spark_batch` continuam recebendo os dados preparados pelo módulo legado, mas agora chamam rotinas do módulo direto `web-sys` para a rasterização Canvas. Poeira mantém um único path e alpha da camada; faíscas mantêm a ordem dos grupos de cor/alfa e o blend aditivo `lighter`. JS mantém fallback e simulação. Chrome 156 comparou as duas categorias com zero diferenças RGBA; um jogo acionou 24 lotes/1.152 círculos de poeira diretos. Não houve benchmark.

## Preview Rust/WASM local v152.0 — labels de inimigos via imagem cacheada
O batch de inimigos agora prepara descritores das imagens de texto já mantidas no cache `TXC`; o módulo `wasm-renderer-direct` rasteriza essas imagens com `drawImage` pelo `web-sys`. A geração/cache do bitmap e posição de jogo continuam no host. A rota direta valida as imagens antes de desenhar e rejeita o batch completo se faltarem dados, permitindo ao interpretador legado executar o painter anterior. Chrome 156 confirmou paridade RGBA zero para o inimigo de teste e um comando de rótulo direto.

## Preview Rust/WASM local v151.0 — desenho direto de mapas
O bridge agora coleta os comandos de mapa emitidos pelo módulo legado e os entrega como lotes ao módulo `wasm-renderer-direct`. Rust chama Canvas via `web-sys` para fundo fixo, overlay, decoração, detalhes de salas, sombras, paredes, postes e painéis/estilhaços de vidro. A ordem dos comandos e as cores dinâmicas da decoração são preservadas; o caminho legado continua disponível quando o módulo direto não foi inicializado. Texturas de mapa e piso que usam buffers RGBA, composição de padrões, gameplay, assets e várias expansões ainda têm etapas híbridas. Chrome 156: os 22 opcodes de mapa tiveram diferença RGBA zero; 35 lotes diretos foram confirmados em jogo. Não houve benchmark ou validação visual ampla.

## Preview Rust/WASM local v150.0 — desenho direto de entidades
O módulo separado `wasm-renderer-direct` rasteriza batches de móveis e formas de atores usando comandos compactos produzidos pelo Rust legado e métodos Canvas `web-sys` chamados por Rust. Jogadores e inimigos usam a mesma rota, incluindo imagens de spritesheet; armas, fantasmas e aura usam os mesmos comandos vetoriais. O texto HUD bruto também tem painter direto com preservação de `save`/`restore`. JS ainda prepara estado, arrays e handles de assets, mantém textos cacheados e fallback, e controla toda a simulação. O módulo antigo continua no build e o desenho de mapas, camadas RGBA, expansões e várias operações Canvas não foram convertidos. Paridade Chrome cobre casos sintéticos e curtos; não prova a campanha inteira nem desempenho.

## Preview Rust/WASM local v146.0 — primeiro painter `web-sys` direto
`wasm-renderer-direct` é compilado separadamente com `wasm-bindgen`/`web-sys`. O JS inicializa seu glue módulo e passa o `CanvasRenderingContext2D` ao Rust para desenhar pausa e overlays de tela. `withCanvasBypass` evita que os métodos `web-sys` voltem pelo dispatcher antigo. JS continua controlando estado e eventos e conserva painters anteriores como fallback. O build produz `direct_renderer.js` e `direct_renderer_bg.wasm`, servidos pelo servidor local e cacheados pelo service worker. O restante mantém o módulo ABI/no_std antigo enquanto a migração continua.
O mesmo módulo recebe pontos de chuva fornecidos pela simulação JS e os desenha como paths Canvas de Rust; estado, posição e aleatoriedade continuam no JS. O restante mantém o módulo ABI/no_std antigo enquanto a migração continua.
Motes também são recebidos como dados x/y/tamanho/fase; Rust calcula a oscilação de alpha e desenha, enquanto JS continua responsável pelo update/respawn.

## Preview Rust/WASM local v145.0 — migração em andamento
`index.html` passa as imagens inteiras `WALLT`, `FURNT` e `DOORT` ao bridge. `js/wasm-renderer.js` extrai uma imagem RGBA cacheada por fonte; Rust recorta os oito sprites 24×24 para `MAP_TEXTURE_PIXELS` e rasteriza os sólidos/aberturas. Imagens legadas de 24×24 continuam aceitas; se uma folha for inválida, a chamada retorna ao painter JS. A extração ainda usa Canvas `getImageData` e a camada final usa `putImageData`. Atores, HUD, textos, várias partículas e hooks de expansão seguem híbridos.

## Preview Rust/WASM local v144.0 — migração em andamento
`js/exp-fx.js` sorteia e armazena os nove parâmetros da névoa na ordem original; ao usar neblina/fumaça, `ensureFogSprite` pede a textura 512×256 ao bridge WASM e cacheia o canvas resultante. `wasm-renderer.js` envia os 27 valores para `generate_fog_sprite`; Rust limpa o buffer, rasteriza cada círculo dentro de seus bounds e compõe alfa. Se WASM estiver ausente ou retornar erro, os mesmos parâmetros alimentam os gradientes Canvas originais. `draw_fog` Rust ainda calcula deriva/alfa, e o host desenha a imagem cacheada em três posições.

## Preview Rust/WASM local v143.0 — migração em andamento
`index.html` continua selecionando geometria e ativos de textura; `js/wasm-renderer.js` copia oito recortes 24×24 para `MAP_TEXTURE_PIXELS` e chama `paint_map_textures_rgba`. Rust rasteriza padrões de sólidos e sprites de aberturas em um buffer RGBA compartilhado com o passe do piso e emite um upload. Se dimensões, sprites ou geometrias não cabem no backend, o bridge mantém o caminho antigo de comandos Canvas/fallback JavaScript. O browser ainda faz recorte de assets e rasterização da imagem final; atores, HUD, textos, várias partículas e hooks de expansão continuam híbridos.

## Preview Rust/WASM local v142.0 — migração em andamento
Granulado, FTILES, sombras de sólidos e rejunte compõem uma camada de piso em RGBA pelo Rust; o host copia o tileset pelo Canvas, recebe e aplica a imagem com `putImageData`. A comparação Chrome 156 do Apartamento teve diferença máxima 3/255 e média 0,1882/255. Outras texturas, atores, HUD e efeitos continuam híbridos. O renderer ainda depende da rasterização Canvas do host e de draw hooks JS.

## Preview Rust/WASM local v141.0 — migração em andamento
O Rust mistura FTILES com o buffer RGBA de granulado por sala, ignorando o corredor; o host copia os 72×24 pixels do asset e faz um único `putImageData`. Em Chrome 156, a comparação 1440×900 teve diferença máxima 3/255 e média 0,1937/255, não identidade exata. Imagem e camada final ainda trafegam pelo Canvas host. Outras camadas e os draw hooks das expansões seguem híbridos; sem benchmark ou validação visual ampla.

## Preview Rust/WASM local v140.0 — migração em andamento
O granulado de piso é composto em RGBA por Rust (buffer de 5.184.000 bytes, teto 1440×900) e enviado ao Canvas com `putImageData`; comparação pixel a pixel 1440×900 igual à referência do Chrome 156. O restante do piso, mapas, sprites, atores e efeitos permanece híbrido e Canvas continua rasterizando a maioria dos comandos.
Rust gera gradientes RGBA cacheados para escadas, elevadores e portas metálicas. O Canvas host ainda compõe e rasteriza essas imagens; fallback JS mantido. A composição geral segue híbrida. Sem smoke em navegador real, benchmark ou paridade visual ampla.
As portas do elevador preservam os offsets de cada painel no gradiente que cobre a largura inteira do elevador. Em Chrome 156, a comparação sintética dos pixels ficou até 1/255 por canal. Isso não valida a cena completa.
Rust gera RGBA do gradiente da saída; o Canvas host conserva a imagem e a desenha por `drawImage`, aplicando o pulso com alpha. O fallback JS permanece. Alpha ficou dentro de 1/255 e RGB dentro de 8 níveis numa amostra 100×40. A composição geral e outras camadas ainda são híbridas; sem benchmark ou paridade visual de cena.

## Preview Rust/WASM local v136.0 — migração em andamento
Rust gera o sprite RGBA do muzzle flash; o host o rasteriza com `drawImage`, alpha por efeito e composição aditiva. A imagem original de fallback com gradiente Canvas permanece. O restante do renderizador continua híbrido; o sprite teve alpha idêntico e diferenças RGB de até 8 níveis contra Canvas. Sem paridade de cena ou benchmark.

## Preview Rust/WASM local v135.0 — migração em andamento
Rust rasteriza sprites radiais RGBA com aproximação de raiz quadrada em três passos. A varredura de alpha não encontrou alteração após arredondamento; o Canvas ainda recebe os pixels e permanece como fallback. Outras camadas, imagens, assets, rasterização e simulação continuam no host/JS; sem benchmark ou paridade visual completa.

## Preview Rust/WASM local v134.0 — migração em andamento
Rust gera pixels de sprites radiais; host envia RGBA via `ImageData` ao Canvas. Loja também gera geometria em Rust desde v133. Rasterização geral, imagens e diversas camadas continuam no host/JS, com painters de fallback. ABI/bridge e smoke passam; comparação de alpha mostrou diferença máxima 1/255, mas cor da borda não é idêntica. Sem benchmark ou paridade visual completa.

## Preview Rust/WASM local v133.0 — migração em andamento
Rust gera a geometria da vendedora e seus painéis em lote. Canvas continua sendo o rasterizador do host; texto usa batch HUD e o fallback de desenho JS permanece. A composição geral, imagens, simulação e várias operações Canvas ainda não foram migradas. Regressões 76/76, ABI/bridge e smoke sintético passaram; não houve teste visual de paridade ou benchmark.

## Preview Rust/WASM local v132.0 — migração em andamento
Textos do dealer, cards, reroll e balão da loja entram no batch HUD Rust; wrapping textual é cacheado e o host rasteriza no Canvas. Painter JS fica como fallback. As formas da loja, imagens e simulação ainda são host/JavaScript. ABI e testes passaram; sem smoke de runtime ou medição de desempenho nesta versão.

## Preview Rust/WASM local v131.0 — migração em andamento
O rótulo de créditos do overlay passa por `drawRawHudTexts`, reutiliza o batch de texto validado pelo Rust e o host rasteriza com Canvas sob bypass do dispatcher genérico. Estilo, alpha herdado, ordem e fallback JS são preservados. ABI/bridge, regressões 74/74 e smoke Chromium em Apartamento passaram; sem exceções. A migração continua parcial e sem paridade visual ampla.

## Preview Rust/WASM local v130.0 — migração em andamento
O ramo WASM de drawTransp envia o rótulo ao batch Rust HUD após a geometria. O host rasteriza via cache tx(); quando a ponte não atende, drawHudTextBatch mantém a mesma rota de fallback. A migração continua parcial.

## Preview Rust/WASM local v129.0 — migração em andamento
Após o batch de fantasmas, o host só escreve globalAlpha se o valor atual for diferente de 1. O batch Rust preserva Canvas via save/restore; fallback mantém o reset explícito. Migração parcial; smoke v129 não confirmou o módulo pronto.

## Preview Rust/WASM local v128.0 — migração em andamento
Os stages de transformação 0/1 abrem os dois escopos Canvas junto com shake, kick e movimento; stages 3/4 fecham a mesma pilha por batch Rust. Se o módulo estiver inativo ou os dados forem recusados, JavaScript conserva os save/restore e transforms de fallback. Rasterização permanece Canvas host.

## Preview Rust/WASM local v127.0 — migração em andamento
O passe aditivo de luzes retorna cedo sem mutar Canvas se nenhuma luz, flash ou reflexo estiver ativo. Busca de luzes e fallback continuam funcionando sem WASM; a rasterização segue Canvas. Regressões 70/70 passaram; sem benchmark.

## Preview local Rust/WASM v126.0 — migração em andamento
Rust gera o preenchimento de fundo por frame com 20 px além da viewport; host Canvas pinta `#0d0320` e JS preserva fallback. Build 165.209 bytes; ABI, browser bridge e regressões 69/69 passaram. Sem smoke visual comparativo ou FPS.

## Preview local Rust/WASM v125.0 — migração em andamento
Rust valida e aplica em um comando escala, suavização e qualidade do contexto Canvas; o estado é cacheado e reaplicado após resize. Diagnósticos opt-in gravam contagens e stacks do bridge Canvas genérico. Build 164.789 bytes; ABI, bridge e regressões 68/68 passaram; sem benchmark de desempenho.

## Preview local Rust/WASM v123.0 — migração em andamento
O véu e os botões do menu de pausa enviam geometria e hover ao batch de formas Rust; os textos passam pelo batch HUD. JavaScript mantém hit test, ações e fallback e o host rasteriza Canvas. Build 164.199 bytes; ABI, bridge e regressões 68/68 passaram. Smoke Chromium curto abriu uma fase sem exceções observadas; selo marcou 23.856 chamadas Canvas residuais. Sem paridade ampla ou FPS medido.

## Preview local Rust/WASM v122.0 — migração em andamento

O painel de pausa de modo envia título e pontuação ao batch de texto HUD; JS mantém estado e fallback e `tx()` rasteriza no host. Regressões 68/68 e smoke Chromium sem exceções passaram.

## Preview local Rust/WASM v121.0 — migração em andamento

Textos de munição/recarga usam a validação e posições do batch HUD Rust; JS mantém estado/condições/fallback e `tx()` cacheado rasteriza no host. Smoke HUD e regressões 68/68 passaram.

## Preview local Rust/WASM v120.0 — migração em andamento

O flash de tempo baixo usa um batch Rust de overlay; JS calcula o pulso e guarda fallback, o host rasteriza. Build 163.095 bytes; regressões 68/68 passaram.

## Preview local Rust/WASM v119.0 — migração em andamento

O rótulo de modo/campanha segue pelo batch Rust HUD, que valida texto e posicionamento; JS mantém a lógica de exibição e fallback, e `tx()` cacheado rasteriza no host. Smoke HUD e regressões 68/68 passaram.

## Preview local Rust/WASM v118.0 — migração em andamento

Textos visíveis de avisos temporários são posicionados/validados pelo batch HUD Rust; JS mantém temporizadores, conteúdo e fallback; `tx()` cacheado rasteriza no host. Smoke Chrome mostrou dois textos no jogo sem exceções; regressões 68/68 passaram.

## Preview local Rust/WASM v117.0 — migração em andamento

Rust emite o fundo e o preenchimento proporcional da barra de recarga via batch de formas HUD. JS mantém temporizadores/texto, o host rasteriza e o painter de fallback permanece. Build 162.939 bytes; regressões 68/68 passaram.

## Preview local Rust/WASM v116.0 — migração em andamento

Rust gera os três vértices rotacionados da seta de direção da Invasão. JS ainda calcula a projeção e visibilidade da zona; o host rasteriza o triângulo. O fallback permanece e a migração segue parcial. Build 162.668 bytes; regressões 68/68 passaram.

## Preview local Rust/WASM v115.0 — migração em andamento

Rust calcula em batch o fundo, preenchimento proporcional, marcadores e contorno da barra de vida de chefes. A cor dinâmica e a rasterização Canvas permanecem no host; estado e fallback continuam no JavaScript. A migração segue parcial e não há medição de desempenho.

## Preview local Rust/WASM v114.0 — migração em andamento

Vidros intactos e estilhaços passam por buffers fixos para geração dos comandos de brilho, reflexo, recorte triangular, rotação e alfa em Rust. JS mantém atualização de partículas e fallback; host rasteriza Canvas. Limites: 96 painéis e 160 partículas. Build 160.939 bytes; regressões 68/68 passaram. Sem medição de desempenho.

## Preview local Rust/WASM v113.0 — migração em andamento

O terceiro estágio Rust recebe dimensões, zoom e posição da câmera, emite centro da tela, escala, centro inverso e deslocamento da câmera. O host executa esses comandos Canvas e JS ainda chama calcView e mantém fallback. Build 154.462 bytes; ABI, bridge e regressões 67/67 passaram. Sem medição de desempenho.

## Preview local Rust/WASM v112.0 — migração em andamento

Screen shake é enviado ao Rust antes do save interno; kick e camera shake seguem em um segundo estágio dentro do save. JS mantém amostragem RNG e temporizadores. O host aplica a translação Canvas preservando a hierarquia. Build 153.741 bytes; regressões 67/67 e smoke Chromium sem exceções. Ainda é um renderer Canvas híbrido, sem medição de desempenho.

## Preview local Rust/WASM v111.0 — migração em andamento

Rust emite geometria e ordem dos passes de saída, color grade, overlays finais e de efeito, formas selecionadas do HUD, listas ordenadas de textos/alfa para HUD e mensagens de jogo, corpos dos rastros, segmentos de chuva e alpha de poeira ambiental, mantendo a simulação no JavaScript. O host executa lotes Canvas, resolve assets e reutiliza `tx()` para cachear textos; logo, o renderer ainda não é integralmente Rust e continua sujeito ao custo da ponte genérica.

Em v99 Rust valida a presença de névoa/fumaça, aplica o corte por qualidade e calcula estilo, alfa e as três posições animadas; o host mantém os handles das imagens e desenha os placements em um batch Canvas salvo/restaurado. A atualização temporal global não é movida e o painter JS segue como fallback.

Em v100 Rust emite em sequência os retângulos de clarão de chuva, cintilação neon, pulso vermelho do alarme e barras cinematográficas. Em v101 calcula pulsos, cintilação/qualidade das luzes aditivas, clarão e reflexo de chuva. Em v102 projeta o jogador e determina os raios da luz próxima, do cone da lanterna e do clarão de disparo. Em v103 valida o combo e calcula seu pulso; o host mantém a fonte Impact e a rasterização do contorno/preenchimento. Em v104 Rust decide imagem/posição das duas vinhetas e do retrato da máscara em três estágios; o host preserva os assets e `drawImage`. Em v105 valida o timer e determina a posição do texto do alarme; em v106 calcula o retângulo da etiqueta climática; em v107 calcula raio/alfa/espessura dos anéis temporários; em v108 calcula o pulso/alpha do marcador da zona de Invasão; em v109 gera os comandos dos barris a partir de posição, raio e timer; em v110 gera cone/corpo/lente das câmeras; em v111 gera contornos e efeitos de classe para inimigos visíveis. O host preserva `fillText`, imagens, cores e rasterização Canvas. Os painters JS continuam como fallback. Estado/temporizadores, ordem principal do frame e parte da simulação climática continuam no JS; o Canvas ainda é rasterizado pelo navegador.

`js/wasm-renderer.js` habilita-se apenas com `?renderer=wasm`, inicializa o módulo Rust e encaminha chamadas Canvas não portadas pelo ABI; a ponte genérica preserva receptor, argumentos, retorno e erros, mas continua adicionando uma passagem WASM por operação residual. As camadas portadas emitem lotes de comandos. Em v68, `advancePlayerVisualState` preserva os acumuladores/estado de animação e `drawPlayer` envia até três poses. Rust gera transforms, sombra/aura, ícone da arma, célula do spritesheet ou frame fallback, acentos cosméticos e tag P1/P2; o host resolve handles de imagens e rasteriza comandos após a chamada WASM retornar. Em v69 os seis círculos do stun entraram no range do corpo inimigo. Em v70 Rust seleciona/posiciona os textos de estado e o host usa `tx()` cacheado. Em v71 os métodos Rust geram o fundo sólido fixo, overlay sobre salas e geometria de decoração/tapetes; `paintMap` ainda controla a sequência e envia os dados. Em v72 Rust seleciona a geometria de vidros intactos e estilhaços; o JS segue atualizando timers. Em v73 Rust gera em lote o granulado, sombras de sólidos e rejunte em `buildFloor`, devolvendo o estado do RNG para manter o caminho determinístico. Em v74 Rust seleciona, ordena e dimensiona os padrões de parede/móvel e decals de abertura de porta. Em v75 também escolhe a lista/offset das salas de `FTILES`; o host mantém os handles de imagem, cria padrões e executa o Canvas. Em v76 Rust combina o ângulo base e o de abertura das portas Neon e ordena seus comandos de sprite; o host mantém as imagens e faz a rasterização. A animação e a interação continuam em JS. `paintMap`, outros efeitos, compositor do mapa, HUD, hooks de expansão e canvas residual continuam parcialmente no JS. A simulação continua JavaScript. O navegador rasteriza Canvas 2D. Conversão integral e desempenho continuam sem comprovação.

`js/exp-core.js` fornece o catálogo cosmético `EXP.SKINS`, `EXP.curSkin()` e `EXP.setSkin(id)`. A preferência ocupa somente `settings.skin` no save v2; saves antigos recebem `classic` pelo merge de defaults. A máscara/personagem e sua aplicação de atributos continuam independentes. `js/exp-ui.js` mostra seleção por botões acessíveis na tela de máscaras. O renderer utiliza a paleta no sprite procedural e acentos no spritesheet, sem carregar recursos adicionais.

O fallback procedural do jogador quantiza fases de animação, gera os pixels em Rust e armazena até 128 canvases por combinação de skin/estado/fase. O spritesheet existente continua sendo preferido. Isso evita reconstruir a grade de pixels em cada quadro quando uma imagem falha ao carregar.

Mapas fixos, grades e Neon têm allowlists em index.html. O seletor Neon mostra neonMapTitle sem dimensões; a campanha aponta somente para mapas permitidos. A construção Neon ancora a zona de saída em piso livre quando o objeto de carro de origem fica fora da área caminhável, sem editar js/maps.js.

`weaponFinish` em `index.html` aplica detalhes de contorno, reflexo e partes funcionais às silhuetas Canvas existentes. O wrapper para armas adicionais chama o mesmo acabamento. O inventário segue compartilhado no coop local e `drawOnePlayer` desenha essa arma para P1 e P2.

O loop mantém `rawDt` para medir atraso real e usa `dt` limitado apenas para a simulação. Depois de 120 amostras lentas, `EXP.perfTier` reduz efeitos decorativos; a configuração persistida continua intacta. Partículas e elementos ambientais consultam esse tier.

O botão principal de jogar normaliza `EXP.MULTI` antes de `showMasks`; a criação de P2 continua restrita à configuração multiplayer. A resolução automática do Canvas limita o multiplicador para reduzir pixels em telas de alto DPI; poeira e cápsulas usam caminhos agrupados.

No cliente online, `state.revision` é monotônico; `setRemotePlayers` preserva o avatar e carimba snapshots, `tickRemote` interpola e descarta o avatar após 5 s sem dados. `send` mede tempo de resposta HTTP aproximado; o lobby publica isso junto da idade da posição. Não equivale a ping ICMP nem a sincronização de partida.

No relay online, `setRemotePlayers` mantém o mesmo ator entre snapshots recebidos e atualiza alvos; `tickRemote` interpola posição/direção no ritmo do loop local. Isso suaviza apresentação sem sincronizar física, mapa ou combate.

Na resolução final do Canvas, `js/exp-ui.js` aplica o antialiasing e a qualidade de suavização atuais em cada quadro; `CFG.shakeAmt` escala coice e tremor visual, sendo validado como número entre 0 e 100 na leitura das preferências.

Em v39, `EXP.multiCfg.autoReload` condiciona o início da recarga nos fluxos de arma; `EXP.applyVol` multiplica volumes individuais pelo mestre do multiplayer local; `exp-acess.js` implementa tablist/tabpanel com IDs associados, foco móvel e setas/Home/End.
No cooperativo local, `shoot()` registra P1/P2 como origem do projétil; `friendlyBulletTarget()` aplica dano ao jogador parceiro somente com `MULTI.friendlyFire` ativado. Em `buildNeonFloor`, a geometria de colisão é consolidada antes de inserir atores. `neonSafePoint` conserva posições válidas; para spawns inválidos procura piso caminhável em anéis crescentes e usa varredura global apenas quando a vizinhança está ocupada. Inimigos respeitam distância do jogador e uns dos outros; armas respeitam o spawn e inimigos. A rotina é executada ao montar o mapa, fora do loop por quadro.

## Inventário e responsabilidades
| Arquivo | Responsabilidade e dependências |
| --- | --- |
| index.html | Menus HTML/CSS básico, dados MAPAS/STORY/MASKS/WP, estado global, input, loop, física, colisões, câmera, áudio base, renderização e progressão de salas. |
| js/maps.js | Dados SPRITES, mapas Neon, tiles e níveis de campanha; decodificação preguiçosa. Consumido pela base e expansões de campanha. |
| js/collision_sizes.js | Dimensões de colisão de sprites. |
| js/exp-core.js | Save v2, XP, perks, conquistas, ranking e avisos; segundo bloco: grade NAV, BFS, patrulha, investigação e steer. Depende de globais da base, apesar de o comentário inicial mencionar independência das expansões. |
| js/exp-content.js | Amplia máscaras/armas, define chefes e desbloqueios, gera arte de máscaras. |
| js/exp-world.js | Classes de IA, chefes, barris, câmeras, alarmes, eventos, pente/recarga; integra campanha em tiles. |
| js/exp-brain.js | Dificuldade, reação, erro de mira, antecipação limitada e esquiva. Usa P, enemies e bullets globais. |
| js/exp-modes.js | Registro MODES, runs, modificadores, ondas, campanha, personagens, XP, relatórios e resultados; compõe hooks da base/mundo. |
| js/exp-fx.js | Clima, luzes, sombras, sons, trilha dinâmica, vidro e wrappers de funções de combate/renderização. |
| js/exp-music.js | Seleção de trilha e gêneros sintetizados adicionais; preferência hm_track. |
| js/exp-ui.js | Modos/perfil/coleção/dados, resumo, resultado, opções, pausa, navegação de telas e ajustes de spawn. |
| js/exp-i18n-extra.js, exp-i18n-extra2.js | Dicionários adicionais consumidos pelo tradutor. |
| js/exp-i18n.js | Tradução DOM/Canvas, cache de textos, observador DOM e preferência de idioma. |
| js/exp-acess.js | Abas de opções e anúncios aria-live de telas. |
| js/exp-debug.js | Log de erros/rejeições; painel e atalhos habilitados por ?dev=1. O bloco inline inicial guarda erros anteriores e o módulo os importa quando carrega. |
| js/exp-shop.js | Créditos, Madame Piranha, cartas, raridade, reroll e efeitos de compra. |
| js/exp-multi.js | Configuração, criação de P2, teclado/gamepad, câmera, vidas, HUD auxiliar. Usa arma/munição globais compartilhadas. |
| js/exp-online.js | Lobby, criação/entrada/reentrada, token de sessão, saída, retry/backoff, long polling e envio de posição; depende da API same-origin e hooks em index.html. |
| server/server.js | HTTP estático por allowlist/realpath e API em memória para duas pessoas; token secreto separado do ID público, listagem desta instância, um long poll por jogador, validação e expiração. Sem dependências externas. |
| css/expansion.css | Telas, componentes e responsividade das expansões. |
| css/acessibilidade.css | Estilos auxiliares de acessibilidade. |
| sw.js | Cache HTTP(S) do jogo, agora incluindo o módulo online; chave por versão e escopo. Não opera em file://. |

As janelas geradas ficam em `breakables`, com caixas marcadas com `g` no mesmo sólido usado por colisão e LOS. `shatterBreakable` chama `refreshSol`, registra ruído e mantém o caminho navegável após o impacto. O perímetro Neon é acrescentado em `buildNeonFloor` como geometria visual e colisível para cobrir mapas sem parede externa.

`activeTarget` seleciona entre os jogadores vivos o ator mais próximo do inimigo. `focusActor` compartilha essa decisão com spawns de inimigos, armas, barris e suprimentos. A base, `exp-brain.js` e as classes de IA usam esses alvos para visão, perseguição e mira, evitando que o cooperativo continue mirando ou criando entidades em torno de um jogador morto.

`addDoor` é usado por `wallH`, `wallV` e `buildFixed`; portanto toda abertura criada por dados de mapa também recebe objeto de porta, caixa de colisão e dimensões próprias para renderização.

`spawnFloor` inclui o corredor central mesmo na primeira fase porque salas separadas por portas fechadas ainda não pertencem à região navegável do spawn. `allClear` exige `levelStats.total > 0`, impedindo que uma falha de spawn seja interpretada como vitória. `buildFixed` normaliza o spawn com `safeSpawnPos`, que tenta desobstrução próxima e, se preciso, pontos internos de salas.

## Inicialização
HTML cria window.EXP com hooks vazios → dados base → maps.js → collision_sizes.js → script principal (define funções, carrega imagens, eventos, agenda requestAnimationFrame) → core → content → world → brain → modes → fx → music → ui → dicionários extra → i18n → acess → debug → shop → multi → online → registro do service worker no load. O servidor usa somente APIs nativas do Node.
Preservar essa ordem. Vários módulos guardam a função anterior em _nome e a substituem; mudanças de assinatura precisam atravessar todos os wrappers.

## Atualização e desenho
loop(t) aplica limitador CFG.fps; dt é limitado a 1/30; acumulador chama update(FIXED) em passos de 1/60; hitstop consome passos. update só roda em play: EXP.tick → mundo/modos/efeitos → jogador/P2 → portas/câmera → projéteis/IA/colisões → saída de sala. draw compõe Canvas, chão pré-renderizado, objetos, atores, efeitos e HUD. Pausa redesenha aproximadamente 5 vezes/s.
Não há garantia de 60 FPS medida nesta auditoria. O ajuste automático usa `rawDt` para detectar atrasos, enquanto a simulação continua usando o `dt` limitado.

## Multiplayer online — limite atual
POST cria/entra sala; token secreto em Authorization identifica o participante, enquanto a lista pública usa outro ID. POST /state publica posição/ângulo/estado vivo e GET /state long-polls por revisão. A sessão pode recuperar após reload e participantes ociosos expiram. O cliente desenha o avatar remoto e centra a câmera entre eles. Não há autoridade do servidor sobre simulação nem sincronização de inimigos/projéteis/dano/mapa/modo/progresso. Ambos iniciam o mesmo mapa. Não exponha o serviço diretamente à internet sem HTTPS e hospedagem adequados.

## Física, entidades e IA
Entidades são arrays globais (enemies, bullets, pickups, throws, efeitos) e objetos P/P2. SG é grade espacial de células de 64 px para sólidos; move/hitWall realizam colisão circular. Projéteis são subamostrados em passos de ~6 px. NAV usa células de 20 px, raio de folga 14 e BFS em 8 direções sem cortar quinas. Busca e steer reaproveitam buffers/objetos, mas a separação entre inimigos ainda percorre pares O(n²).
IA combina estados (IDLE/PATROL/SUSPICIOUS/INVESTIGATE/SEARCH/ALERT/CHASE/STUNNED), LOS, audição, classes e mira. Vários cálculos ainda usam P diretamente, inclusive no cooperativo.

## Persistência e interfaces críticas
hm_save_v2 / hm_save_v2_bak: XP, stats, desbloqueios, ranking e settings. Mantidas as chaves e formato v2; saves legados recebem campos ausentes. hm_cfg, hm_multi_cfg, hm_audio, hm_track, hm_hiscore, hm_unlock e hm_best_* continuam separados.
EXP.reload pertence à recarga de arma. EXP.reloadSave lê o save; EXP.restoreBackup valida e restaura, retornando string de erro ou string vazia. Importação/restauração só trocam SAVE em memória após as escritas; localStorage não oferece transação de múltiplas chaves. Falha na segunda escrita mantém SAVE em memória e tenta restaurar o backup anterior. A recuperação também pode falhar se o armazenamento deixar de estar disponível; o erro fica registrado.
Importação rejeita tipos perigosos/inválidos. Formato futuro (>2) no principal bloqueia gravações nesta versão. Isso não converte nem apaga o arquivo futuro.
