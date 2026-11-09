## Preview Rust/WASM local v283.0 — piso direto
Granulado, FTILES, sombras e rejunte chamam Rust/WebSys diretamente com ImageData. JavaScript mantém estado e geometria do jogo e, diante de falha do painter, usa o Canvas original da fase. Não há mais comandos de piso no WASM legado. O renderer permanece híbrido e a simulação continua em JavaScript.

## Preview Rust/WASM local v282.0 — texturas de mapa diretas
Texturas de paredes/móveis e decals de portas são rasterizados e compostos pelo módulo Rust/WebSys direto. O dispatcher Canvas legado já não aceita comandos de textura de mapa. JavaScript fornece imagens-fonte, geometria e dimensões; se o módulo direto falhar, `index.html` usa seu painter Canvas original. A comparação do Chrome usa referência Canvas independente e tolerância documentada; simulação continua em JavaScript.

## Preview Rust/WASM local v281.0 — batch do texto HUD
O texto comum do HUD é rasterizado para canvas cacheado por Rust e composto por `drawCanvasImageBatch` em Rust/WebSys. JavaScript ainda prepara texto, coordenadas, cor, fonte e alpha; simulação e ordem de camadas também permanecem no host. A auditoria do frame não detectou setters `globalAlpha` do host nos casos exercitados. Algumas telas especiais e os fallbacks ainda mantêm Canvas; o renderer não é integralmente Rust.

## Preview Rust/WASM local v280.0 — sombras e estrutura do mapa
Sombras de paredes/móveis e geometria visual das faces/postes chamam `drawMapShadows` e `drawMapStructure` diretamente no módulo Rust/WebSys. Os exports `paint_map_shadows` e `paint_map_structure`, junto ao import de comandos do mapa, foram removidos do módulo legado. Em falha, o jogo usa os painters Canvas originais. O WASM legado tem 75.772 bytes, 6 imports e 53 exports. Simulação, colisões e ordem de camadas continuam no JavaScript; o renderer ainda é híbrido.

## Preview Rust/WASM local v279.0 — detalhes de mapa diretos
`paintMapDetails` envia as dimensões das salas e a semente ao painter Rust/WebSys `drawMapDetails`; o Rust pinta contornos, linhas e specks e devolve a semente avançada. A rota `paint_map_details` do módulo legado foi removida. Em falha, o jogo usa o painter Canvas original, sem consumir RNG no bridge. O WASM legado tem 77.025 bytes, 7 imports e 55 exports. A simulação e a ordem do jogo continuam no JavaScript; o renderer permanece híbrido.

## Preview Rust/WASM local v278.0 — decoração de mapa direta
`paintMapDecor` agora usa apenas `drawMapDecor` no módulo Rust/WebSys direto; o export `paint_map_decor` e o caminho antigo via dispatcher foram removidos. Em erro/inatividade, o `paintMap` original desenha tapetes e itens no Canvas. Estado do jogo e ordenação continuam em JavaScript; o WASM legado tem 78.156 bytes, 7 imports e 56 exports. O renderer ainda é híbrido.

## Preview Rust/WASM local v277.0 — armas sem batch legado
O bridge chama os painters `drawWeaponIcon` e `drawMapBreakables` do módulo Rust/WebSys direto; já não há `currentWeaponBatch`, `draw_weapon`, `draw_breakables` nem seus dispatchers legados. O estado de jogo e a ordem das camadas continuam no JavaScript; em erro/inatividade, o chamador executa o Canvas original. O WASM legado foi reduzido a 78.561 bytes, 7 imports e 57 exports. O renderer ainda é híbrido.

## Preview Rust/WASM local v276.0 — fantasmas sem batch legado
O host envia poses, arma e opacidades; Rust/WebSys compõe os fantasmas diretamente no Canvas. A lógica de jogo permanece JavaScript. Em falha, o chamador executa o painter Canvas original. Os exports e o buffer de fantasmas foram removidos do módulo legado; P1/P2 também usam a rota direta desde v275.

## Preview Rust/WASM local v274.0 — formas fixas do HUD
Barra de combo, contorno da máscara, véu de pausa e barra de recarga passam diretamente a `drawHudShape` Rust/WebSys. Removidos `draw_hud_shape`, `hud_shape_input_ptr`, o buffer, o import `draw_hud_shape_batch` e o dispatcher no bridge; os chamadores do jogo conservam o Canvas original quando a rota direta falha. O dealer também segue só no painter direto desde v273. Módulo legado: 125.432 bytes, 7 imports e 63 exports (v273: 126.802 bytes e 65 exports).

## Preview Rust/WASM local v273.0 — geometria do dealer da loja
O dealer é desenhado somente por `drawShopDealerStage` no painter direto Rust/WebSys. Removidos `draw_shop_dealer`, `shop_dealer_input_ptr` e o buffer do WASM legado; `exp-shop.js` conserva o desenho Canvas em caso de falha. A referência Canvas original e Rust tiveram zero diferenças RGBA em estados de entrada e queda. WASM legado: 126.802 bytes, 8 imports e 65 exports (v272: 128.777 bytes e 67 exports).

## Preview Rust/WASM local v272.0 — painéis da loja
Balão de fala, card e botão de rerolar usam painters Rust/WebSys diretos. Removidos `draw_shop_panel`, `shop_panel_input_ptr` e o buffer legado; `exp-shop.js` conserva os painters Canvas em caso de falha. O desenho do dealer continua com batch antigo enquanto a referência Canvas independente é conferida. WASM legado: 128.777 bytes, 8 imports e 67 exports (v271: 129.725 bytes e 69 exports).

## Preview Rust/WASM local v271.0 — base e overlay de mapa
A base dos mapas fixos e o overlay translúcido usam painters Rust/WebSys diretos. Removidos `paint_map_base` e `paint_map_overlay` do WASM legado; `index.html` preserva os retângulos Canvas originais se o painter direto falhar. Módulo legado: 129.725 bytes, 8 imports e 69 exports (v270: 129.918 bytes e 71 exports). Paridade Chrome: zero diferenças RGBA; sem benchmark.

## Preview Rust/WASM local v270.0 — menu de pausa
O menu de pausa completo é pintado por Rust/WebSys direto. Removidos `draw_pause_ui`, `pause_ui_input_ptr` e o buffer do WASM legado; `exp-ui.js` mantém o painter Canvas integral como fallback. Módulo legado: 129.918 bytes, 8 imports e 71 exports (v269: 131.018 bytes e 73 exports). Paridade de Chrome com os rótulos e o botão em hover teve zero diferenças RGBA; sem benchmark.

## Preview Rust/WASM local v269.0 — barra do chefe
A barra de vida do chefe usa o painter direto Rust/WebSys; removidos `draw_boss_health_bar`, `boss_health_input_ptr` e o buffer do WASM legado. `exp-modes.js` mantém o painter Canvas original como fallback. O módulo legado mede 131.018 bytes, 8 imports e 73 exports (v268: 132.196 bytes e 75 exports). Paridade Chrome da barra teve zero diferenças RGBA; sem benchmark ou validação visual manual ampla.

## Preview Rust/WASM local v259.0 — camada de névoa/fumaça
A aplicação de sprites e cálculo de posições passam pelo painter Rust/WebSys direto; o WASM legado perdeu buffers, exports e callback. Estado do tempo, fumaça e perf tier continuam no JS. O fallback Canvas do jogo permanece. Módulo legado: 162.701 bytes, 17 imports e 106 exports. Sem benchmark.

## Preview Rust/WASM local v258.0 — transportes diretos
Escadas e elevadores usam painter Rust/WebSys direto, com gradientes gerados por Rust e cacheados. O WASM legado já não implementa essa camada; o fallback Canvas original continua no jogo. Módulo legado: 163.672 bytes, 18 imports e 109 exports. Paridade Chrome, regressão e testes de ABI/bridge passaram; sem benchmark.

## Preview Rust/WASM local v251.0 — contornos e máscara de lanterna
O bridge envia os inimigos e a câmera ao crate Rust direto para gerar contornos, e envia jogador, câmera e lâmpadas para compor a máscara. Os chamadores preservam seus painters Canvas. O crate legado não reserva mais esses buffers nem chama os callbacks relacionados.

## Preview Rust/WASM local v250.0 — composição direta de Canvas layers
O bridge usa o crate direto para recortar e desenhar camadas de Canvas. O batch, buffer e callback foram removidos do WASM legado; o painter original do jogo ainda cobre o caso em que Rust/WebSys não pode desenhar.

## Preview Rust/WASM local v249.0 — remover batches de partículas do módulo legado
Poeira, faíscas, sangue vivo/estático e cadáveres recebem os dados de gameplay no bridge JavaScript e desenham pelo crate direto com WebSys. Os chamadores Canvas existentes seguem como fallback. O módulo legado eliminou cinco imports de desenho, exports e buffers estáticos (cerca de 2,69 MiB); continua ativo no bootstrap e em outras rotas.

## Preview Rust/WASM local v247.0 — remover código duplicado
O crate legado perdeu os geradores de radial/névoa e seus buffers de entrada; o bridge não importa mais o callback de upload radial. O módulo direto continua responsável pelos dois sprites e seus chamadores mantêm fallback Canvas. Após recompilar, o WASM legado tem 3.790 bytes a menos; a execução geral ainda usa o módulo antigo para outras rotas.

## Preview Rust/WASM local v246.0 — névoa direta
O wrapper chama o painter de névoa apenas no módulo Rust/WebSys direto. Se falhar, `exp-fx.js` faz a imagem com gradientes Canvas. Isso remove a necessidade do buffer antigo para esta geração; o renderer legado segue obrigatório em outras rotas e no bootstrap.

## Preview Rust/WASM local v245.0 — sprite radial direto
O wrapper radial agora chama somente `createRadialSprite` do módulo Rust/WebSys; em falha, `exp-fx.js` mantém seu gradiente Canvas. Essa camada já não precisa do buffer radial ou do callback Canvas do WASM legado. As outras camadas e o bootstrap ainda dependem do módulo antigo.

## Preview Rust/WASM local v244.0 — paridade de piso, armas e pausa
O painter direto recorta pisos de tijolo ao retângulo da região e conserva o estado RNG. O acabamento dos ícones de armas consulta os mesmos índices de paleta do caminho antigo. A pausa recebe os três rótulos traduzidos do host, mantendo internacionalização no lado JavaScript e desenho no Rust/WebSys. A cópia do namespace ES em objeto mutável permite forçar o fallback em testes. Comparação em Chrome passou; migração integral, inspeção visual e benchmark ainda pendentes.

## Preview Rust/WASM local v243.0 — piso e objetos sem gates antigos
Granulado, tiles/acabamento, detalhes/estrutura/sombras de mapa, móveis e portas agora validam limites locais antes de tentar Rust direto. Consultas a `capacity()` e pointers do WASM antigo foram movidas para o caminho de fallback. Os dados de mapas e a lógica de jogo permanecem no host.

## Preview Rust/WASM local v242.0 — rotas diretas sem capacity legado
Os painters diretos de decor/mapa, vidros, poeira, faíscas, sangue e cadáveres validam os arrays no bridge e rodam antes de consultar capacidade/pointers do módulo antigo. Limites de 8192 entradas evitam batches excessivos; o fallback legado continua validando seu próprio buffer quando usado.

## Preview Rust/WASM local v241.0 — seleção de frame de spritesheets
Rust direto reproduz a escolha de coluna/linha do spritesheet de jogadores e inimigos. O host continua dono do estado de animação e do relógio, e envia os valores ao painter. Quarenta combinações foram comparadas com as exports legadas no Chrome.

## Preview Rust/WASM local v240.0 — pausa sem export legado obrigatório
`drawPauseUi` usa o painter WebSys direto como primeira rota e só acessa o antigo lote Canvas se a rota direta falhar. A comparação no Chrome cobre o painel completo, composição e alpha.

## Preview Rust/WASM local v239.0 — setup e acabamento do quadro
O módulo direto aplica `setTransform`, `imageSmoothingEnabled` e `imageSmoothingQuality` usando Canvas/WebSys; a rota compara os mesmos valores com o callback legado no Chrome. Fundo do quadro e formas fixas do HUD também deixam de depender da presença prévia do export antigo para tentar o painter Rust. Fallback continua disponível caso o módulo direto falhe.

## Preview Rust/WASM local v238.0 — ícones de armas para pickups/arremessos
As rotas diretas recebem IDs numéricos e a paleta visual e chamam o painter Rust de armas dentro da transformação do pickup/arremesso. A chamada JS continua apenas no fallback legado. A lógica de posse, física, rotação e brilho continua fornecida pelo host. O teste Chrome confirmou pixels idênticos para as 24 armas em pickups com brilho, sem brilho e arremessadas.

## Preview Rust/WASM local v237.0 — sprite de clarão e batch de combate
Rust/WebSys gera o sprite radial amarelo/branco/laranja do clarão e escreve os pixels direto no canvas reutilizado. O bridge mantém entradas de efeitos em Float64Array reaproveitado e tenta o painter direto antes do gerador legado. Pickups, arremessos e contornos noturnos deixaram de consultar exports/capacidade antes de tentar seu caminho direto.

## Preview Rust/WASM local v236.0 — buffers de luz e mundo
Luzes e anéis usam buffers numéricos reutilizáveis, e a lista de sprites das luzes também é reaproveitada. A zona de overlays tenta seu painter direto antes de verificar a função legado; o fallback recebe os mesmos valores quando necessário. A lógica de simulação e a escolha dos efeitos continuam no host JavaScript.

## Preview Rust/WASM local v235.0 — buffers de efeitos diretos
O bridge monta chuva e partículas de clima em dois Float64Array reutilizáveis e envia esses registros ao painter Rust/WebSys. Se a chamada direta falhar, copia os mesmos valores para a memória do módulo legado e executa seu batch antigo. Assim o caso comum evita escrever os dados em memória WASM antiga, sem remover o fallback.

## Preview Rust/WASM local v234.0 — desenhos da loja
Rust/WebSys recebe apenas os valores visuais do vendedor e dos painéis, calcula a geometria da roupa/rosto/pena/timer e pinta vendedor, balão, cartão e botão de renovar diretamente. A rota preserva ordem, opacidades e cores da geometria anterior; os seis casos Chrome testados tiveram paridade RGBA exata. Combo, alarme e imagens/formas do HUD usam caminhos diretos também.

## Preview Rust/WASM local v191.0 — barris e câmeras
O host empacota o estado e os polígonos de cone em Float64Array; Rust/WebSys pinta barris e câmeras sem gerar lotes no WASM antigo. Os geradores e callbacks antigos continuam como fallback.

## Preview Rust/WASM local v192.0 — realces de inimigos
JavaScript filtra os inimigos visíveis e empacota a classe, saúde, telegraph, carga e paleta; Rust/WebSys calcula as mesmas formas e as pinta diretamente. O gerador e batch do renderer antigo ficam como fallback.

## Preview Rust/WASM local v204.0 — seta da Invasão
JavaScript envia centro e seno/cosseno já calculados; Rust compõe os três vértices e pinta o triângulo diretamente. O batch antigo fica como fallback.

## Preview Rust/WASM local v203.0 — visão Coruja
JavaScript conserva as regras de visibilidade, alcance e cálculo da rota. Ele envia formas visíveis e pontos da rota em `Float64Array` reutilizável; Rust/WebSys desenha contornos e caminho tracejado diretamente no Canvas, com fallback preservado.

## Preview Rust/WASM local v202.0 — projéteis
O host passa x/y/dono em buffer reutilizável e os sprites cacheados. Rust aplica o offset 22×14 px, seleciona o sprite pelo dono e chama Canvas `drawImage` pelo `web-sys`; o batch antigo segue como fallback.

## Preview Rust/WASM local v201.0 — cápsulas de munição
O host envia x/y/raio das cápsulas e a posição da câmera. Rust calcula offsets, escalas e rotação das elipses e as desenha sem o command batch legado; entradas inválidas são ignoradas como antes.

## Preview Rust/WASM local v200.0 — pickups e arremessos
O host empacota posição, rotação, arma e pulso dos pickups, além de posição/rotação das armas arremessadas, em buffers reutilizáveis. Os painters `drawPickups`/`drawThrows` existentes recebem esses dados diretamente; a geração e cópia pelo WASM antigo ficam no fallback.

## Preview Rust/WASM local v199.0 — efeitos de disparo
O host envia coordenadas, tempo, raio, ângulo e tipo do efeito numa `Float64Array`; o módulo Rust direto valida e pinta flash/arco pelo Canvas `web-sys`. A conversão para o lote do WASM antigo permanece apenas como fallback. O teste isolado do Chrome comparou a saída de três efeitos com zero diferenças RGBA.

## Preview Rust/WASM local v198.0 — blackout/lanterna
O host envia jogador, câmera, viewport, zoom e flags. Rust projeta as coordenadas e calcula os raios da máscara antes do painter; o gerador legado permanece fallback.

## Preview Rust/WASM local v197.0 — neblina/fumaça
O host passa sprite, relógio, tipo de efeito e faixa de desempenho. Rust calcula três deslocamentos, compõe e desenha as imagens; o batch legado segue como fallback.

## Preview Rust/WASM local v196.0 — zona da Invasão
O host passa posição e relógio. Rust calcula a pulsação e desenha o círculo e preenchimento; o batch de geometria legado continua como fallback.

## Preview Rust/WASM local v195.0 — luzes de mundo
O host envia emissores, sprites, tempo, intensidade, modo Neon, stride e estado do jogador. Rust calcula o pulso/flicker e rasteriza luzes, clarão e reflexo. O cálculo de comandos anterior ainda atende o fallback.

## Preview Rust/WASM local v194.0 — anéis de mundo
O host remove anéis expirados e envia centro, raio-base, tempo restante, duração e índice de cor. Rust/WebSys calcula o pulso e rasteriza os anéis. O batch anterior continua disponível como fallback.

## Preview Rust/WASM local v193.0 — vidro
O host filtra os painéis e estilhaços ativos e envia buffers compactos. Rust/WebSys desenha brilho, contorno, shimmer e cacos sem comandos do WASM legado na rota normal; o batch anterior segue como fallback.

# Arquitetura real — preview local v180.0
## Preview Rust/WASM local v190.0 — portas Neon
O host deduplica imagens e passa os transforms em seis doubles por porta. Rust valida índices, mantém a ordem e desenha cada sprite. A geração de comandos legada permanece fallback.

## Preview Rust/WASM local v189.0 — portas de sala
O bridge monta os seis campos geométricos e passa o asset de painel opcional; Rust aplica posição, rotação, desenho do painel/preenchimento e contornos. O gerador legado permanece fallback.

## Preview Rust/WASM local v188.0 — ícones de armas
O bridge fornece ao painter direto o ID e a paleta; Rust gera a geometria e chama Canvas/WebSys. A geração antiga permanece fallback. Pickups/arremessos podem chamar o mesmo painter direto dentro do transform Rust já existente.


## Preview Rust/WASM local v180.0 — formas de HUD
O WASM legado ainda emite comandos e IDs de paleta para barras, retângulos, arcos, elipses e triângulos. O painter Rust direto resolve esses comandos e rasteriza na ordem atual. A seta da Invasão envia seus três vértices ao painter direto; fallback Canvas permanece.

## Preview Rust/WASM local v179.0 — pickups e arremessos
O WASM legado continua selecionando/ordenando os itens e codificando posição, ângulo, arma e pulso. O painter direto aplica transformações e brilhos em Rust e chama o callback de ícone existente sob o transform; o lote Canvas antigo permanece fallback.

## Preview Rust/WASM local v178.0 — saída da fase
O WASM legado produz comandos ordenados de brilho, clipping, gradiente, hachuras e bordas. O callback tenta passá-los ao painter Rust/WebSys com o gradiente cacheado, preservando o Canvas antigo como fallback.

## Preview Rust/WASM local v177.0 — escadas e elevadores
O WASM legado ainda seleciona/ordena o lote e prepara os gradientes RGBA cacheados; os comandos de primitivas e drawImage agora são rasterizados pelo painter Rust/WebSys. Fallback Canvas permanece para lote recusado/erro.

## Preview Rust/WASM local v176.0 — composição final da tela
Os passes existentes de gradação `soft-light`/`overlay` e os retângulos de fade/flash agora chamam diretamente o painter Rust/WebSys. JS ainda fornece dimensões e valores do frame; Rust aplica o mesmo estilo, ordem, cores e `save/restore`. O dispatcher Canvas antigo segue como fallback.

## Preview Rust/WASM local v175.0 — projéteis
O WASM legado calcula posição de tela e seleção de sprite do proprietário. O callback envia comandos de três números e imagens existentes ao painter Rust, que rasteriza os projéteis com drawImage; fallback Canvas permanece.

## Preview Rust/WASM local v174.0 — imagens do HUD
O WASM legado continua escolhendo o sprite existente e gerando posição/dimensões. O callback envia imagem selecionada e comando de cinco valores ao painter Rust, que usa drawImage em WebSys; Canvas JS continua fallback.

## Preview Rust/WASM local v173.0 — texto do alarme
O WASM legado calcula segundos arredondados e posição central do status. O callback envia valores e string ao painter Rust, que configura estilo/alinhamento e chama fillText; o fallback JS permanece.

## Preview Rust/WASM local v172.0 — texto do combo
O WASM legado mantém o cálculo do pulso e do multiplicador. O callback entrega o pulso, o número e a string já formatada ao painter direto Rust, que aplica transform, stroke e fill de texto com o Canvas do navegador; fallback JS permanece.

## Preview Rust/WASM local v171.0 — estojos
O WASM legado projeta estojos do espaço do jogo à tela em comandos de cinco números. O callback passa esses comandos ao painter direto Rust, que forma um caminho de elipses e aplica alpha/cor; em erro, o painter Canvas JS é mantido.

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
## Preview Rust/WASM local v181.0 — cópia de texto cacheado
O cache existente fornece a imagem de texto; `drawCanvasImage` do módulo Rust faz o blit para o canvas principal. JavaScript conserva idioma, cache e posições. O fallback Canvas permanece.

## Preview Rust/WASM local v182.0 — retângulos de piso
O WASM legado continua gerando comandos e índices de paleta. O bridge repassa o lote ao painter Rust direto, que valida os comandos e emite `fillStyle`/`fillRect`; o painter JavaScript continua como fallback.

## Preview Rust/WASM local v183.0 — contornos noturnos
O WASM legado projeta os atores visíveis e codifica a condição de KO; o bridge passa cada arco ao painter Rust direto, que configura estilo e largura da linha e restaura o contexto. O caminho Canvas antigo permanece como fallback.

## Preview Rust/WASM local v184.0 — leitura de texturas
O bridge passa uma fonte Canvas ou imagem e um contexto temporário ao módulo Rust direto. Rust/WebSys lê os pixels do Canvas ou desenha a imagem no contexto temporário antes de ler. O JS preserva o caminho antigo como fallback e ainda transfere esses bytes ao compositor WASM legado; a etapa não moveu a lógica de seleção das texturas nem a composição de mapa para o novo painter.

## Preview Rust/WASM local v185.0 — compositor de texturas do mapa
O bridge continua escolhendo assets, preparando os 8 sprites e montando arrays de retângulos. Rust direto repete a rasterização RGBA e atualiza a camada `ImageData`; o compositor WASM antigo permanece como fallback. O teste Chrome exige igualdade exata entre as duas implementações; a fonte Canvas mantém as tolerâncias anteriores.

## Preview Rust/WASM local v186.0 — buffers de texturas
O host faz o crop dos oito sprites em buffer próprio JS a partir dos pixels lidos via Rust. O painter direto recebe o buffer, a geometria e o `ImageData`. A memória de texturas do WASM antigo é preenchida apenas quando o compositor direto falha e o fallback precisa ser executado.

## Preview Rust/WASM local v187.0 — geometria do mapa
O bridge cria arrays JS para sólidos/aberturas. O painter Rust direto os recebe e rasteriza a camada. Se falhar, os mesmos valores são copiados para as regiões de memória legada e o compositor antigo executa. A seleção/ordenação das geometrias continua no JavaScript; dados de mapa não mudam.
## Preview Rust/WASM local v205.0 — arte das máscaras
Rust/WebSys rasteriza diretamente as 16 máscaras procedurais novas. JS conserva as especificações, seleção e progressão da coleção; no carregamento tardio do módulo, as imagens são reconstruídas e a grade é atualizada. O desenho JavaScript original permanece como fallback. A migração geral do renderer segue híbrida.

## Preview Rust/WASM local v206.0 — ícones de armas
O painter direto Rust/WebSys rasteriza as 12 armas adicionadas pela expansão. As especificações JS continuam como fallback. A comparação pixel a pixel corrigiu cinco diferenças em cores de acabamento e geometria; nenhuma regra ou estado da arma mudou.

## Preview Rust/WASM local v207.0 — HUD do chefe
A barra de vida e as marcas de fase agora são pintadas por Rust/WebSys direto, sem gerar comandos para o host Canvas. O cálculo de fração e a seleção do chefe continuam no JS; há fallback legado se o módulo direto não estiver pronto.
## Preview Rust/WASM local v252.0 — efeitos e armas coletáveis
Clarões/arcos, pickups e armas arremessadas agora chamam exclusivamente os painters Rust/WebSys diretos. O WASM antigo perdeu três callbacks, seis buffers e sete exports; o bridge retorna `false` se o módulo direto não desenhar, deixando os painters Canvas de `index.html` como fallback. Clarões usam CanvasGradient criado pelo Rust no contexto de destino, sem sprite intermediário. Simulação, lista de entidades, posições e escolha de armas continuam no JavaScript.

## Preview Rust/WASM local v253.0 — color grade e overlays finais
O bridge delega color grade e overlays de fade/flash aos exports do módulo Rust/WebSys direto. As funções de callback, buffers estáticos e exports equivalentes foram removidos do módulo legado. Se o painter direto estiver inativo ou retornar falha, o wrapper retorna `false` e `index.html` usa seu painter Canvas original. O módulo legado segue no bootstrap e em outras camadas; gameplay e simulação continuam no host JS.
## Preview Rust/WASM local v254.0 — textos de combo e alarme
Os wrappers chamam `drawComboTextStage` e `drawAlarmTextStage` diretamente, sem os eventos Canvas do WASM legado. As funções originais de `index.html` e `js/exp-fx.js` mantêm o fallback. A simulação, temporizador e seleção dos textos não saem do JavaScript.
## Preview Rust/WASM local v255.0 — imagens do HUD
O bridge transmite a etapa e as imagens existentes ao painter direto `drawHudImageStage`. Rust seleciona vinheta/CRT, vinheta da interface, retrato de máscara ou rótulo de clima, e desenha em Canvas via WebSys. Se não desenhar, o chamador de gameplay usa o fallback Canvas. O módulo legado não gera mais comandos para essas imagens.
## Preview Rust/WASM local v256.0 — seta da Invasão
`drawInvasionArrowInput` recebe centro e seno/cosseno da orientação, calcula os três vértices e pinta o triângulo em Rust/WebSys. A posição e o ângulo vêm da simulação JavaScript. Se Rust falhar, `exp-modes.js` pinta a mesma forma no Canvas.
## Preview Rust/WASM local v257.0 — marcador da zona de Invasão
`drawInvasionZoneInput` recebe posição e tempo da fase e desenha o pulso em Rust/WebSys. O chamador mantém a fórmula e o Canvas original para fallback. A geração de comandos e o callback correspondentes foram removidos do módulo legado.
## Preview Rust/WASM local v260.0 — efeitos climáticos
Chuva e poeira desenham pelo Rust/WebSys direto, sem callbacks nem buffers duplicados no WASM legado. A simulação e a aleatoriedade continuam em JS; o chamador mantém o fallback Canvas. O módulo legado tem 161.040 bytes, 15 imports e 100 exports.

## Preview Rust/WASM local v261.0 — efeitos do mundo
Barris, câmeras e acentos visuais/telegráficos de inimigos recebem registros do host e são pintados pelo módulo Rust/WebSys direto. A seleção de entidades, a simulação, o tempo e a aleatoriedade permanecem no JavaScript; os chamadores preservam o desenho Canvas como fallback. Os batches redundantes foram retirados do WASM legado.

## Preview Rust/WASM local v262.0 — luzes e anéis
Os registros de luzes aditivas e anéis chegam do host e são validados, animados e desenhados pelo módulo Rust/WebSys direto. Estado de gameplay, temporizadores, assets e decisão de fallback permanecem no JavaScript. Os batches e callbacks duplicados foram removidos do WASM legado.

## Preview Rust/WASM local v263.0 — overlays FX de tela
Os parâmetros de flash de tempestade/neon, alarme, barras cinematográficas e contagem são passados ao painter Rust/WebSys direto. Estado, temporizadores e decisão de fallback continuam no JavaScript; o batch legado foi removido e o painter Canvas original continua disponível.

## Preview Rust/WASM local v264.0 — saída de fase
O bridge envia dimensões, estado e pulso ao painter Rust/WebSys, incluindo o gradiente RGBA. Buffers e callbacks do módulo WASM legado foram removidos. O chamador principal preserva seu painter Canvas como fallback.

## Preview Rust/WASM local v266.0 — setup e fundo do quadro

O painter Rust/WebSys direto aplica a transformação e o smoothing do Canvas raiz e pinta o fundo com margem contra screen shake. Foram removidos os callbacks `set_canvas_setup` e `fill_frame_background` e os exports antigos correspondentes. O jogo mantém seus caminhos Canvas como fallback. O módulo legado mede 134.896 bytes, 8 imports e 78 exports.

## Preview Rust/WASM local v267.0 — transforms do quadro

Screen shake, kick/recoil, tremor da câmera e zoom/câmera usam chamadas Rust/WebSys diretas. O WASM legado não mantém mais o buffer nem os exports de transformação; o fluxo Canvas original continua no chamador como fallback. O módulo legado mede 132.404 bytes, 8 imports e 76 exports.

## Preview Rust/WASM local v268.0 — aura e sombra de jogador

O painter de elipse para sombra e brilho colorido P1/P2 usa chamadas Canvas diretas pelo Rust/WebSys, isoladas em seu próprio save/restore. A rota `draw_player_aura` saiu do WASM legado; a função de composição completa de jogador ainda retém sua implementação de fallback. O módulo legado mede 132.196 bytes, 8 imports e 75 exports.
Carpete, ladrilho e tijolo usam a função `paintFloor` do módulo direto, que recebe paleta e seed e devolve o próximo estado aleatório. Se o módulo direto declinar, `index.html` ainda pinta a região pelo Canvas original; o renderer legado não possui mais a exportação de padrões.
## Preview Rust/WASM local v285.0 — inimigos diretos
O painter de inimigos usa Rust/WebSys direto para sombras, spritesheet/corpo procedural, atordoamento e labels cacheados. O jogo ainda produz estado e seleciona quando renderizar; se o painter direto não desenhar, `index.html` mantém o Canvas original. Os caminhos antigos de inimigos foram removidos do WASM legado. Simulação e estado continuam JavaScript e outras telas ainda têm desenho Canvas; migração gráfica integral pendente.

## Preview Rust/WASM local v286.0 — sem frames no WASM legado
O módulo direto Rust/WebSys pinta os frames procedurais quando disponível; o gerador original JS/Canvas continua como fallback. A seleção de sprites é calculada por Rust e cede à fórmula JS da tela quando o módulo direto falha. O WASM legado não armazena nem desenha pixels de personagens; ele ainda conta e encaminha operações Canvas host enquanto outras camadas são portadas. A simulação do jogo permanece JavaScript.

## Preview local v287.0 — fluxo único do renderer WASM
`wasm-renderer/build.ps1` compila apenas `wasm-renderer-direct` e gera glue/artefato em `wasm-renderer/pkg/direct`. `js/wasm-renderer.js` importa esse módulo; o crate trampoline antigo não é buildado, servido por `server/server.js` nem pré-cacheado por `sw.js`. Wrappers de interceptação Canvas são diagnóstico opt-in (`wasmDiagnostics=1`). A lógica de jogo e a preparação de geometrias/ordem continuam JS; painters sem rota Rust direta ainda usam Canvas fallback.

## v288.0 — painel de resumo da pausa
`js/exp-modes.js` chama `HM_WASM_RENDERER.drawHudShape(context, 4, width, height)` para o retângulo de resumo; `wasm-renderer-direct/src/lib.rs::draw_hud_shape` pinta o stage com WebSys. Se o painter retornar false, `exp-modes.js` conserva o `fillRect` Canvas. Regressão e paridade Chrome cobrem o stage 4.

