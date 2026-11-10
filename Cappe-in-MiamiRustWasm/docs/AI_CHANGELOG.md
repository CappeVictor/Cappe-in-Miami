## Preview local v284.0 — 08/11/2026
- Móveis, portas comuns, portas Neon e vidros intactos/estilhaços agora usam exclusivamente Rust/WebSys direto; removidos painters, buffers e callback de comando dessas camadas no WASM legado, e removidos os helpers JS sem chamada de produção. Canvas original permanece como fallback no jogo.
- Build passou; regressão 104/104, ABI, browser bridge, paridade direta e teste Chrome de pixels passaram. Móveis, portas comuns, portas Neon e vidro tiveram zero diferenças RGBA nos casos exercitados.
- WASM legado: 21.157 bytes, 2 imports e 27 exports (v283: 61.001 bytes, 3 imports e 36 exports). Sem benchmark, revisão visual manual ampla ou conclusão da migração. Nada publicado no GitHub.

## Preview local v283.0 — 08/11/2026
- Granulado, FTILES, sombras e rejunte usam apenas Rust/WebSys direto. Removidos os painters/buffers do piso no WASM legado, seus imports e o helper Rust de retângulos de piso; Canvas original permanece como fallback em index.html.
- Build, regressão 104/104, ABI, browser bridge, paridade direta e auditoria Chrome passaram. O caso de gameplay preservou a semente RNG; diferença do piso contra Canvas: máximo 3 e média 0,188 por canal RGBA.
- WASM legado: 61.001 bytes, 3 imports e 36 exports (v282: 68.531 bytes, 5 imports e 45 exports). Sem benchmark, campanha completa ou revisão visual manual ampla; migração integral pendente. Nada publicado no GitHub.

## Preview local v282.0 — 08/11/2026
- Texturas de mapa agora usam só o painter Rust/WebSys direto; removidos o rasterizador de textura, buffers e comandos 31/32 do WASM legado. A pintura Canvas do jogo permanece como fallback.
- Build, regressão 105/105, ABI, browser bridge e auditoria Chrome passaram; o teste compara mapa texturizado ao painter Canvas original dentro dos limites existentes.
- WASM legado: 68.531 bytes, 5 imports e 45 exports (v281: 74.877 bytes, 5 imports e 50 exports). Sem benchmark, campanha completa ou revisão visual manual ampla; migração integral pendente.

## Preview local v281.0 — 08/11/2026
- Textos comuns do HUD usam imagens cacheadas e batch de desenho Rust/WebSys; removidos o callback host de texto e exports/buffers correspondentes do WASM legado.
- Build passou; regressão 105/105, ABI, browser bridge, paridade direta no Chrome e auditoria de pixels passaram. Nos frames exercitados, `globalAlpha` não foi alterado pelo host; comparação dos textos HUD teve zero diferenças RGBA.
- WASM legado: 74.877 bytes, 5 imports e 50 exports (v280: 75.772 bytes, 6 imports e 53 exports). Sem benchmark, campanha completa ou revisão visual manual ampla; migração integral pendente.

## Preview local v280.0 — 08/11/2026
- Sombras de paredes/móveis e faces de paredes/postes migraram para Rust/WebSys direto. Removidos `paint_map_shadows`, `paint_map_structure` e o import legado `draw_map_command`; os painters Canvas originais permanecem como fallback.
- Build passou sem warnings; regressão 104/104, ABI, browser bridge e paridade Chrome passaram. Sombras e estrutura tiveram zero diferenças RGBA nos casos exercitados.
- WASM legado: 75.772 bytes, 6 imports e 53 exports. Sem benchmark, campanha completa ou revisão visual manual ampla; migração integral pendente.

## Preview local v279.0 — 08/11/2026
- Detalhes internos das salas e specks do piso migraram para Rust/WebSys direto. Removidos `paint_map_details` e o batch correspondente do WASM legado; o jogo mantém fallback Canvas original.
- Build passou; regressão 104/104, ABI, browser bridge e paridade Chrome passaram. Detalhes de mapa tiveram zero diferenças RGBA e RNG idêntico ao Canvas.
- WASM legado: 77.025 bytes, 7 imports e 55 exports. Sem benchmark, campanha completa ou revisão visual manual ampla; migração integral pendente.

## Preview local v278.0 — 08/11/2026
- Decoração estática dos mapas usa exclusivamente Rust/WebSys direto; removidos `paint_map_decor` e seu batch legado. `paintMap` mantém o Canvas original como fallback.
- Build, regressão 104/104, ABI, browser bridge, paridade direta e auditoria de pixels passaram; a decoração comparada ao Canvas teve zero diferenças RGBA. Módulo legado: 78.156 bytes, 7 imports e 56 exports (v277: 78.561 bytes e 57 exports).
- Sem benchmark ou revisão visual manual ampla; a migração integral continua pendente.

## Preview local v277.0 — 08/11/2026
- Ícones de todas as 24 armas e vidros quebráveis passaram exclusivamente aos painters Rust/WebSys diretos. Removidos `draw_weapon`, `draw_breakables` e seus caminhos de batch; fallback é o Canvas original do jogo.
- Paridade RGBA das armas e vidros passou no Chrome. Build, regressão 104/104, ABI, browser bridge, paridade direta e auditoria de pixels passaram. Módulo legado: 78.561 bytes, 7 imports e 57 exports (v276: 103.429 bytes e 59 exports).
- Sem benchmark ou revisão visual manual ampla; a migração integral continua pendente.

## Preview local v276.0 — 08/11/2026
- Fantasmas e arma passaram ao painter Rust/WebSys direto. Removidos `draw_ghosts`, `ghost_input_ptr` e buffer do módulo legado; fallback Canvas original permanece.
- Comparação Chrome com painter Canvas e arma Taco: zero diferenças RGBA. Build, regressão 104/104, ABI, browser bridge, paridade direta e auditoria de pixels passaram.
- Módulo legado: 103.429 bytes, 7 imports e 59 exports (v275: 120.272 bytes e 61 exports). Sem benchmark ou revisão visual manual ampla.

## Preview local v275.0 — 08/11/2026
- Jogadores P1/P2 passaram do batch gráfico WASM legado para drawPlayers Rust/WebSys direto. Removidos draw_players e player_draw_data_ptr; fallback Canvas original permanece no chamador.
- Módulo legado: 120.272 bytes, 7 imports e 61 exports. Build, ABI, browser bridge e paridade Chrome passaram; sem benchmark ou revisão visual manual ampla.

## Preview local v274.0 — 08/11/2026
- Barra de combo, borda da máscara, véu de pausa e barra de recarga migraram para `drawHudShape` Rust/WebSys direto. Removidos `draw_hud_shape`, `hud_shape_input_ptr`, seu buffer, o import `draw_hud_shape_batch` e a ponte de comandos.
- Os quatro estados tiveram zero diferenças RGBA contra Canvas no Chrome. Dealer continua direto desde v273. Regressão 103/103, ABI, browser bridge, paridade direta e pixels passaram.
- WASM legado: 125.432 bytes, 7 imports e 63 exports (v273: 126.802 bytes e 65 exports). Sem benchmark ou revisão visual manual ampla.

## Preview local v273.0 — 08/11/2026
- Dealer da loja migrado exclusivamente ao painter Rust/WebSys direto; removidos `draw_shop_dealer`, `shop_dealer_input_ptr` e o buffer de entrada do WASM legado. Canvas original de `exp-shop.js` segue como fallback se a chamada direta falhar.
- Comparação independente no Chrome reproduziu o Canvas original para os estados normal e caindo: zero diferenças RGBA. Regressão 103/103, ABI, browser bridge, paridade direta e pixels passaram.
- WASM legado: 126.802 bytes, 8 imports e 65 exports (v272: 128.777 bytes e 67 exports). Sem benchmark ou validação visual manual ampla.

## Preview local v272.0 — 08/11/2026
- Painéis de balão, card e rerolar migraram para painters Rust/WebSys diretos; removidos `draw_shop_panel`, `shop_panel_input_ptr` e o buffer do módulo legado. O dealer permanece no batch antigo enquanto a paridade independente Canvas é investigada.
- WASM legado: 128.777 bytes, 8 imports e 67 exports (v271: 129.725 bytes, 8 imports e 69 exports). Build, regressão 103/103, ABI, browser bridge e paridade Chrome dos painéis passaram. Sem benchmark ou revisão visual manual ampla.

## Preview local v271.0 — 08/11/2026
- Base dos mapas fixos e overlay translúcido migraram para painters Rust/WebSys diretos. Removidos `paint_map_base` e `paint_map_overlay` do WASM legado; os retângulos Canvas originais permanecem como fallback.
- WASM legado: 129.725 bytes, 8 imports e 69 exports (v270: 129.918 bytes, 8 imports e 71 exports). Build, regressão 103/103, ABI, browser bridge e paridade Chrome passaram; os três casos comparados tiveram zero diferenças RGBA. Sem benchmark ou revisão visual manual ampla.

## Preview local v270.0 — 08/11/2026
- O menu de pausa migrou ao painter direto Rust/WebSys; `draw_pause_ui`, `pause_ui_input_ptr` e o buffer saíram do WASM legado. O painter Canvas original continua como fallback.
- WASM legado: 129.918 bytes, 8 imports e 71 exports (v269: 131.018 bytes, 8 imports e 73 exports). Build, regressão 103/103, ABI, browser bridge e paridade Chrome do menu em todos os hovers e rótulos localizados passaram sem diferenças RGBA. Sem benchmark ou revisão visual manual ampla.

## Preview local v269.0 — 08/11/2026
- A barra do chefe migrou para o painter direto Rust/WebSys; os dois exports e o buffer correspondentes saíram do WASM legado. O painter Canvas original segue como fallback.
- WASM legado: 131.018 bytes, 8 imports e 73 exports (v268: 132.196 bytes, 8 imports e 75 exports). Build, regressão 103/103, ABI, browser bridge, paridade Chrome da barra (zero diferenças RGBA) e auditoria de pixels passaram. Sem benchmark nem revisão visual manual ampla.

## Preview local v251.0 — 08/11/2026
- Removidas as rotas legadas de contorno noturno e máscara da lanterna; o bridge usa Rust direto e o jogo mantém fallback Canvas. Menos 2 imports de host, 4 exports, ~0,50 MiB de buffers estáticos e 1.456 bytes no binário. ABI, paridade Chrome e regressões 102/102 passaram. Sem benchmark; não publicado no GitHub.

## Preview local v250.0 — 08/11/2026
- Removido o batch legado `draw_layer`; o recorte/composição usa o painter Rust direto e o `drawImage` original é fallback. Binário legado 448 bytes menor e um import de host a menos. Build, Chrome e regressões 102/102 passaram; sem benchmark. Não publicado no GitHub.

## Preview local v249.0 — 08/11/2026
- Retirados do WASM legado cinco batches de poeira, faíscas, sangue e cadáveres. Foram eliminados ~2,69 MiB de buffers estáticos e 3.173 bytes do binário. Paridade Chrome de partículas/cadáveres e suíte 102/102 passaram; sem benchmark. Não publicado no GitHub.

## Preview local v248.0 — 08/11/2026
- Removidos do WASM antigo os callbacks, buffers e exports de desenho de projéteis e cartuchos. O bridge usa Rust direto e mantém fallback Canvas nos chamadores. Build e ABI passaram; paridade de ambos passou com zero diferença; regressões 102/102. Sem validação visual manual ou benchmark. Não publicado no GitHub.

## Preview local v247.0 — 08/11/2026
- Removidos do módulo legado os geradores radial/névoa, entradas/buffers duplicados e callback Canvas de upload. As versões Rust/WebSys diretas permanecem validadas; se falham, radial e névoa usam o fallback Canvas dos chamadores.
- O WASM legado foi recompilado: 185.523 → 181.733 bytes (−3.790 bytes; −2,0%). Regressões 102/102, ABI, bridge, paridade procedural e paridade direta passaram. Sem medição de frame time. O módulo legado ainda inicia o renderer e serve outras camadas; não publicado no GitHub.

## Preview local v246.0 — 08/11/2026
- Sprites de névoa passaram a usar exclusivamente o módulo Rust/WebSys direto no wrapper. Em falha, `exp-fx.js` usa os próprios gradientes Canvas; o wrapper não lê mais a memória linear do renderer legado. Chrome confirmou paridade RGBA e regressão verifica que desativar o painter direto não ativa o antigo.
- Mantém a alteração v245 dos sprites radiais. Regressões 102/102; sem build Rust novo, inspeção visual manual ou benchmark. Não publicado no GitHub.

## Preview local v245.0 — 08/11/2026
- Sprites radiais passaram a usar exclusivamente o módulo Rust/WebSys direto no wrapper. Se o painter direto estiver ausente ou falhar, o chamador de efeitos usa seu gradiente Canvas já existente; não há retorno ao gerador/buffer do WASM legado. Chrome confirmou pixels RGBA idênticos e regressão que desativa o painter direto confirma a rota sem legado.
- Renderer segue híbrido; nenhum benchmark nem inspeção visual manual foi realizado. Não publicado no GitHub.

## Preview local v244.0 — 08/11/2026
- O painter Rust direto de carpetes, tiles e tijolos agora preserva o recorte da região; parity Chrome confirma pixels e avanço do RNG iguais ao caminho legado nesses padrões.
- Corrigidos três valores de cor dos acabamentos dos ícones Rust de armas para usar as mesmas entradas da paleta legada. A comparação dos 24 nomes agora passa.
- O painter da pausa recebe os rótulos já traduzidos por `tx()` e continua preservando a transformação/composição do Canvas. A referência de teste inclui os textos que a interface antiga acrescentava fora do lote geométrico.
- O loader mantém uma cópia mutável das exportações do módulo ES para permitir que os testes desativem funções e realmente exercitem fallbacks. Fixtures de Neon doors usam imagens HTML carregadas, como no jogo. Comparação Chrome direta passou; sem benchmark ou inspeção visual manual.

## Preview local v243.0 — 08/11/2026
- Exportações de capacidade do renderer antigo deixaram de bloquear as rotas diretas de granulado/tile/acabamento do piso, detalhes/estrutura/sombras de mapa, móveis e portas comuns/Neon. Guardas de tamanho ficam no bridge e os exports/pointers antigos são consultados só no fallback.

## Preview local v242.0 — 08/11/2026
- Removida a verificação antecipada de `capacity()` legado nas rotas diretas de decoração de mapa, vidros quebráveis, poeira, faíscas, sangue vivo/estático e cadáveres. Os limites de entrada ficam no bridge; validações da memória antiga acontecem somente após falha do Rust direto.

## Preview local v241.0 — 08/11/2026
- A seleção da célula do spritesheet de jogadores e inimigos agora é calculada em Rust direto, antes de consultar a exportação antiga. Chrome compara 40 combinações de animação/tempo com o WASM legado.

## Preview local v240.0 — 08/11/2026
- A pausa chama o painter Rust direto antes de consultar exports legados. A regressão Chrome compara os pixels do painel, alpha e composição nas rotas direta e antiga.

## Preview local v239.0 — 08/11/2026
- Transformação, suavização e qualidade de imagem do Canvas raiz agora são aplicadas pelo módulo Rust direto, com fallback legado preservado. O fundo do quadro e formas fixas do HUD tentam o painter direto antes de exigir exports antigos. Chrome compara o estado do Canvas entre as duas rotas e a regressão cobre a prioridade dos caminhos.

## Preview local v238.0 — 08/11/2026
- Ícones de arma em pickups e arremessos agora são pintados pelo Rust direto, sem callback gráfico JS. Teste Chrome comparou as 24 armas nos dois contextos, pickups com e sem brilho: zero canais RGBA diferentes.

## Preview local v237.0 — 08/11/2026
- Sprite RGBA do clarão de disparo gerado em Rust/WebSys direto com paridade exata no Chrome. O batch de efeitos usa buffer reutilizável; pickups, arremessos e contornos noturnos só exigem exports antigos se o caminho direto falhar.

## Preview local v236.0 — 08/11/2026
- Luzes de mundo, anéis e overlays agora enviam dados por buffers diretos reutilizáveis ao painter Rust. As rotas tentam Rust antes de exigir exports do WASM legado; fallback e saída visual permanecem. Paridade Chrome e regressões foram repetidas após as alterações.

## Preview local v235.0 — 08/11/2026
- Chuva e partículas de clima agora preenchem buffers reutilizáveis do bridge para o painter Rust direto; os buffers do WASM legado só são escritos quando o fallback é necessário. Chrome comparou chuva nos modos normal/alternado e partículas em dois tempos: zero diferenças RGBA; confirmou reuso dos buffers.

## Preview local v234.0 — 08/11/2026
- Composição do vendedor, balão, cartões de item e botão de renovar movida para painters diretos Rust/WebSys. Seis paridades Chrome cobriram queda, timer, painel e estados de contorno; zero diferenças RGBA.

## Preview local v233.0 — 08/11/2026
- Rust/WebSys agora calcula o pulso do combo, formata o multiplicador e pinta contorno/preenchimento. Chrome comparou a rota antiga e a direta com zero diferenças RGBA e estado do contexto restaurado.

## Preview local v232.0 — 08/11/2026
- Formatação do tempo restante, posição e desenho do texto de alarme movidos para Rust/WebSys direto, preservando cor, fonte, alinhamento e as propriedades do contexto alteradas pelo renderer anterior. Teste Chrome: zero diferenças RGBA.

## Preview local v231.0 — 08/11/2026
- Seleção e desenho das imagens de vinheta, scanlines e máscara movidos para Rust/WebSys direto. Os estágios 0, 1, 2 e 3 foram comparados com o caminho legado no Chrome e tiveram zero diferenças RGBA.

## Preview local v230.0 — 08/11/2026
- O preenchimento de fundo do frame, com margem que cobre o viewport durante screen shake, agora é executado pelo painter Rust/WebSys direto. Paridade RGBA idêntica à implementação anterior no Chrome.

## Preview local v229.0 — 08/11/2026
- Migrados ao Rust/WebSys direto os quatro estágios geométricos do HUD: barra de combo, moldura da máscara, véu de pausa e barra auxiliar. Teste no Chrome comparou os pixels RGBA com o painter anterior e obteve zero diferenças em todos os estágios.
- Migrada ao Rust/WebSys direto a composição de inimigos visíveis: sombra, corpo por spritesheet ou geometria procedural, alpha de nocaute, atordoamento e labels com imagens cacheadas. O host mantém a simulação e os assets; o batch do WASM antigo fica como fallback.
- Paridade Chrome para inimigos com spritesheet e geometria procedural, incluindo estados de nocaute, atordoamento, alerta e investigação: zero diferenças RGBA nos casos comparados. Campanha completa, benchmark e revisão visual manual seguem pendentes.

## Preview local v227.0 — 08/11/2026
- Movida a composição dos rastros fantasma para Rust/WebSys direto, recebendo posições e alpha preparados pelo host. O WASM antigo continua fallback; a simulação e os dados de movimento continuam no JavaScript.
- Build WASM, regressões 97/97, testes renderer/browser bridge e paridade Chrome passaram. A composição de jogadores, inimigos, armas, fantasmas e aura teve zero diferenças RGBA nos casos comparados; o painter direto de fantasmas foi chamado no teste.
- Smoke `newGame()` iniciou em `play`; sem validação visual manual, campanha completa ou benchmark.

## Preview local v226.0 — 08/11/2026
- A composição dos jogadores em cena agora é desenhada pelo Rust direto: posição/rotação, sombra e aura, ícone da arma, recorte do spritesheet, faixas de skin e etiquetas P1/P2. JavaScript continua dono dos dados de simulação e animação; o batch antigo permanece fallback. Chrome comparou dois jogadores, incluindo P2 com skin, com zero diferenças RGBA. Sem benchmark ou publicação no GitHub.

## Preview local v225.0 — 08/11/2026
- Os pixels dos sprites procedurais de jogador agora são gerados pelo Rust direto em buffer RGBA, mantendo a simulação de animação no host e o painter antigo como fallback. Chrome comparou seis estados/fases com zero diferenças RGBA. Build e testes de paridade ampla passaram. Sem benchmark ou publicação no GitHub.

## Preview local v224.0 — 08/11/2026
- A geometria e o desenho dos 17 tipos de móveis estáticos agora usam Rust/WebSys direto, sem gerar o batch pelo WASM legado no caminho normal; fallback preservado. Chrome comparou a rota direta ao fallback com zero canais RGBA diferentes e confirmou rejeição de geometria inválida. Build, regressões 97/97, renderer, browser bridge e paridade ampla passaram. Sem benchmark ou publicação no GitHub.

## Preview local v223.0 — 08/11/2026
- As texturas repetidas das salas agora são compostas pelo Rust direto no ImageData do piso; a rota legado permanece fallback. Build, regressões 97/97, renderer, browser bridge e paridades Chrome do piso/mapas passaram. Sem benchmark ou publicação no GitHub.

## Preview local v222.0 — 08/11/2026
- O granulado RGBA do piso agora é gerado em Rust/WASM direto a partir do buffer ImageData, mantendo a sequência RNG e a rota legada como fallback. Chrome comparou contra o fallback com zero canais RGBA diferentes e semente idêntica. Build, regressões 97/97, renderer, browser bridge e paridade ampla passaram. Sem benchmark ou publicação no GitHub.

## Preview local v221.0 — 08/11/2026
- Sombras de sólidos e rejunte de 24 px agora são compostos em Rust/WebSys diretamente no ImageData do piso e aplicados com putImageData; o rasterizador legado permanece fallback. Chrome comparou pixels e seed do granulado com zero diferenças e estilos/alpha/composição preservados. Build, regressões 97/97, renderer, browser bridge e paridade ampla passaram. Sem benchmark ou publicação no GitHub.

## Preview local v220.0 — 08/11/2026
- Vidros intactos e rastros dos fragmentos agora são gerados e pintados por Rust/WebSys em entrada compacta, com fallback legado preservado. Chrome comparou vidros e estilhaços na rota direta e fallback com zero diferenças RGBA; validações rejeitaram alpha inválido e o estado do Canvas permaneceu intacto. Build, regressões e bridge passaram. Sem benchmark ou publicação no GitHub.

## Preview local v219.0 — 08/11/2026
- Faces de paredes e detalhes de postes agora são gerados e pintados diretamente em Rust/WebSys, preservando ordem, dimensões e cores; o gerador legado continua como fallback. Chrome comparou rota direta, fallback e referência Canvas com zero diferenças RGBA, incluindo alpha e estilos restaurados. Build, regressões e bridge passaram. Sem benchmark ou publicação no GitHub.

## Preview local v218.0 — 08/11/2026
- Sombras de paredes e móveis agora são enviadas em buffer compacto e desenhadas diretamente no módulo Rust/WebSys. O caminho gerado pelo WASM legado continua como fallback. Chrome comparou os bytes RGBA com a referência e o fallback, com zero diferenças; entradas inválidas são rejeitadas e o estado do Canvas é preservado. Build, regressões e bridge passaram. Sem benchmark ou publicação no GitHub.

## Preview local v217.0 — 08/11/2026
- Os contornos internos das salas e os detalhes aleatórios do piso agora são gerados e pintados diretamente no módulo Rust/WebSys. A ponte transfere o estado RNG e recebe a semente avançada para manter a sequência do mapa; fallback legado preservado. Chrome comparou pixels e estado RNG com zero diferenças. Build, regressões e bridge passaram. Sem benchmark ou publicação no GitHub.

## Preview local v216.0 — 08/11/2026
- A decoração estática dos mapas agora é empacotada em buffer compacto e gerada/pintada no módulo Rust/WebSys direto. Tapetes mantêm preenchimento e dois contornos; outros itens conservam cores e ordem. O gerador legado segue como fallback. Chrome comparou rota direta, fallback e desenho de referência com zero diferenças RGBA; estilos do Canvas preservados. Build, regressões e bridge passaram. Sem benchmark ou publicação no GitHub.

## Preview local v215.0 — 08/11/2026
- A base opcional escura e o overlay de luz dos mapas agora são pintados diretamente pelo módulo Rust/WebSys; o caminho gerado pelo WASM legado continua como fallback. Chrome comparou ambos com zero diferenças RGBA, incluindo mapa sem base fixa, e confirmou estado do Canvas preservado. Build, regressões e bridge passaram. Sem benchmark ou publicação no GitHub.

## Preview local v214.0 — 08/11/2026
- O cálculo de projeção e seleção dos contornos de inimigos em cenas escuras agora passa diretamente do estado JS para Rust/WebSys, sem pedir o lote ao WASM legado no caminho normal. Fallback mantido. Chrome comparou inimigos vivos, derrubados e mortos com zero diferenças RGBA; alpha, composição e estilos do Canvas preservados. Build, regressões 90/90, renderer, browser bridge e paridade Chrome ampla passaram. Sem benchmark ou publicação no GitHub.

## Preview local v213.0 — 08/11/2026
- Marcas de sangue ativo/estático e corpos agora recebem os estados diretamente no módulo Rust/WebSys, que valida os valores, calcula as formas e pinta sem passar pelo gerador de comandos do WASM legado no caminho normal. Fallback mantido. Chrome comparou os três casos com o fallback com zero diferenças RGBA, preservando alpha/composição. Build, regressões, renderer, browser bridge e teste focado de partículas passaram. Sem benchmark ou publicação no GitHub.

## Preview local v212.0 — 08/11/2026
- Poeira e faíscas agora recebem os estados das partículas e montam sua geometria no módulo Rust/WebSys direto, sem passar pelo gerador de comandos do WASM legado no caminho normal. A rota antiga continua como fallback. O teste Chrome comparou Canvas legado/fallback com entradas diretas e teve zero diferenças RGBA, preservando alpha e composição. Build, regressões, renderer e browser bridge passaram. Sem benchmark, revisão visual ampla ou publicação no GitHub.

## Preview local v211.0 — 08/11/2026
- Geometria e pintura de escadas, elevadores e saídas agora são geradas e executadas pelo módulo Rust/WebSys direto, sem pedir os comandos ao WASM legado no caminho ativo. O host continua enviando estado/mapa e gradientes cacheados; rotas antigas permanecem fallback. Chrome comparou escada, elevador e estados de saída contra o fallback com zero diferenças RGBA. Build, regressões 90/90, renderer, browser bridge, paridade procedural e paridade direta ampla passaram. Sem benchmark, revisão visual ampla ou publicação no GitHub.

## Preview local v210.0 — 08/11/2026
- Gradientes cacheados de escada, elevador, portas e saída agora são gerados em Rust/WebSys; o WASM legado ainda emite a geometria das formas e permanece fallback.
- Chrome comparou quatro variantes de transporte e dois estados de saída com zero diferenças RGBA; escada, elevador e saída passaram pela rota ativa. A paridade ampla direta também concluiu com zero diferenças RGBA nos caminhos cobertos. Build Rust/WASM, regressões 90/90, checks do renderer e browser bridge passaram. Sem benchmark ou publicação no GitHub.

## Preview local v209.0 — 08/11/2026
- Geração em Rust/WebSys dos sprites de luz radial e névoa/fumaça; o host ainda fornece parâmetros e mantém os fallbacks.
- Teste Chrome comparou radial 47×47 e névoa 512×256 sem diferenças RGBA. Build, regressões 90/90, checks do renderer e browser bridge passaram. Sem benchmark ou publicação no GitHub.

## Preview local v208.0 — 08/11/2026
- O lote de textos cacheados do HUD envia as imagens e seus dados de posição/opacidade ao painter Rust/WebSys direto. Fallback preservado; a lógica e a criação/cache dos textos ficam no host.
- `node tests/wasm-hud-image-batch-parity.cjs`: três imagens, zero diferenças RGBA, estado restaurado e entradas inválidas rejeitadas. Regressões 90/90, checks do renderer e browser bridge passaram. A suíte Chrome ampla foi interrompida após passar de 4 GB; sem benchmark ou publicação no GitHub.

## Preview local v204.0 — 07/11/2026
- O Rust calcula os três vértices e pinta diretamente a seta de direção da Invasão; a rotação enviada pelo host mantém os mesmos valores do caminho antigo.
- Chrome comparou cinco posições/ângulos com zero diferenças RGBA e estado Canvas restaurado. Build, regressões, renderer e browser bridge passaram. Sem benchmark, campanha completa ou revisão visual ampla.

## Preview local v203.0 — 07/11/2026
- Contornos dos pickups, barris, câmeras e inimigos escondidos da máscara Coruja, além da rota tracejada, agora são pintados diretamente pelo Rust/WebSys. Regras de visão e navegação permanecem na lógica JavaScript; buffers são reutilizados e o fallback Canvas continua disponível.
- Chrome comparou cinco marcadores e a rota: zero diferenças RGBA; alpha, composição e transformação preservados. Build e regressões 86/86 passaram. Sem benchmark, campanha completa ou revisão visual ampla.

## Preview local v202.0 — 07/11/2026
- Projéteis agora enviam posição e dono diretamente aos sprites originais; Rust/WebSys aplica o deslocamento centralizado e desenha sem criar o lote WASM legado. Fallback legado mantido.
- Chrome comparou cinco tiros dos dois donos e ignorou uma entrada inválida: zero diferenças RGBA, estado Canvas preservado. Build, regressões 85/85, renderer, browser bridge e teste focado passaram. Sem benchmark.

## Preview local v201.0 — 07/11/2026
- Cápsulas de munição agora são projetadas da posição de mundo e rasterizadas pelo módulo Rust/WebSys direto; a geração/cópia do lote antigo permanece como fallback. O buffer JS cresce sob demanda e é reutilizado.
- Chrome comparou cinco cápsulas, incluindo linhas inválidas, com zero diferenças RGBA e estado Canvas restaurado. Build, regressões 85/85, renderer, browser bridge e testes focados passaram na fonte e no ZIP extraído (159 arquivos, 86 PNGs). Sem benchmark.

## Preview local v200.0 — 07/11/2026
- Pickups com/sem brilho e armas arremessadas agora enviam entradas diretamente aos painters Rust/WebSys; o batch legado continua como fallback.
- Chrome comparou os dois caminhos em três cenários: zero diferenças RGBA e estado Canvas restaurado. Build, regressões 85/85, renderer, browser bridge e teste focado passaram na fonte e no ZIP extraído (158 arquivos, 86 PNGs). Sem benchmark.

## Preview local v199.0 — 07/11/2026
- Efeitos de disparo e impacto agora passam seus valores diretamente ao painter Rust/WebSys; o WASM legado e o batch no buffer antigo seguem como fallback.
- Chrome comparou três efeitos, com e sem muzzle flash, em fundos iguais: zero canais RGBA divergentes; alpha e composição preservados. Build, regressões 85/85, renderer, browser bridge e teste focado passaram na fonte e no ZIP extraído (157 arquivos, 86 PNGs). O teste Chrome amplo excedeu 3 GB e foi interrompido. Sem benchmark.

## Preview local v198.0 — 08/11/2026
- Projeção do jogador e escala dos raios da máscara de blackout/lanterna agora são calculadas no módulo Rust direto; o painter e o fallback existente foram preservados.
- Chrome comparou a máscara e o overlay de tela nos caminhos antigo e direto: zero diferenças RGBA em ambos. Build, regressões 85/85, renderer, browser bridge e teste focado passaram na fonte e na cópia extraída do ZIP (156 arquivos, 86 PNGs). Sem benchmark.

## Preview local v197.0 — 07/11/2026
- Neblina/fumaça agora calculam as posições dos três sprites e os desenham em Rust direto; o passo de desempenho, tipo de efeito e relógio permanecem do host.
- Chrome comparou os caminhos antigo/direto para neblina e fumaça: zero diferenças RGBA, alpha/composição restaurados. Build, regressões 85/85, renderer, browser bridge e paridade de anéis/luzes/zona/neblina passaram na fonte; regressões, renderer e browser bridge passaram no ZIP extraído (155 arquivos, 86 PNGs). O parity amplo do Chrome na extração foi interrompido após alto consumo de memória. Sem benchmark.

## Preview local v196.0 — 07/11/2026
- A zona pulsante da Invasão agora calcula a senoide e desenha o contorno/preenchimento pelo painter direto Rust; o callback legado permanece como fallback.
- Chrome comparou o caminho legado com o direto sob alpha/composição alterados: zero diferenças RGBA e estado restaurado. Build, regressões 85/85, renderer e browser bridge passaram. Sem benchmark.

## Preview local v195.0 — 07/11/2026
- O cálculo de pulso/flicker e a rasterização de luz ambiente, clarão de tiro e reflexo de chuva agora usam Rust/WebSys direto; estado, sprites e seleção de passo continuam no host. O gerador legado segue como fallback.
- Chrome comparou luzes Neon, stride 2, clarão e reflexo sob alpha/composição alterados: zero diferenças RGBA e estado restaurado. Build, regressões 85/85, renderer, browser bridge, paridade do renderer e piso/mapa passaram na fonte e no ZIP extraído (155 arquivos, 86 PNGs). Sem benchmark.

## Preview local v194.0 — 07/11/2026
- O cálculo do raio, da espessura e do alpha dos anéis de mundo ativos, além da rasterização, agora ocorre diretamente no painter Rust/WebSys; o caminho anterior permanece como fallback.
- Chrome comparou três fases de pulso e cores, incluindo alpha/composição alterados: zero diferenças RGBA e estado restaurado. Build, regressões 85/85, renderer, browser bridge e piso/mapa passaram na fonte e na cópia extraída do ZIP (155 arquivos, 86 PNGs). Sem benchmark.

## Preview local v193.0 — 07/11/2026
- Vidros intactos, brilho animado e estilhaços ativos agora são rasterizados pelo painter Rust direto a partir dos dados de simulação.
- Chrome comparou brilho em dois estados e quatro cores de estilhaço: zero diferenças RGBA; build e regressões 85/85 passaram. Sem benchmark.

## Preview local v192.0 — 07/11/2026
- Os realces de inimigos da expansão — anéis de classe, barras, mira de atirador e carga do chefe — agora são rasterizados pelo painter Rust direto.
- Chrome comparou blindado, líder, atirador e chefe carregado: zero diferenças RGBA; build e regressões 85/85 passaram. Sem benchmark.

## Preview local v191.0 — 07/11/2026
- Barris explosivos e câmeras agora são rasterizados no painter Rust direto a partir de registros compactos; a geração antiga fica apenas como fallback.
- Chrome comparou os dois caminhos com alfa e composição alterados: zero diferenças RGBA; build e regressões 85/85 passaram. Sem benchmark.

## Preview local v190.0 — 07/11/2026
- Portas Neon passam por lote direto Rust/WebSys; deduplicação de imagens, ordem e fallback preservados.
- Chrome comparou sprites, transforms e offsets com zero diferenças RGBA; regressões 85/85 e testes de renderer passaram. Sem benchmark.

## Preview local v189.0 — 07/11/2026
- O painter direto desenha portas de sala texturizadas e de geometria simples; geração de comandos antiga permanece fallback.
- Comparações Chrome de portas horizontais/verticais com e sem imagem: zero diferenças RGBA. Build e regressões 85/85 passaram; sem benchmark.

## Preview local v180.0 — 07/11/2026
## Preview local v188.0 — 07/11/2026
- O módulo Rust/WebSys direto agora gera e rasteriza os 24 ícones de armas; caminho antigo mantido como fallback.
- Paridade Chrome para as 24 armas: zero canais diferentes. Build Rust/WASM e regressões 85/85 passaram; sem benchmark ou inspeção visual ampla.

## Preview local v187.0 — 07/11/2026
- Sólidos e aberturas são enviados ao compositor direto em arrays JavaScript; a rota normal deixa de depender das tabelas de geometria na memória do WASM legado.
- Mantido fallback legado; seletores, assets, lógica de jogo e outras camadas não foram migrados nesta alteração.
- Build Rust/WASM, regressões 85/85 e comparações Chrome passaram. Sem benchmark ou validação visual ampla.

- Formas de HUD, barra do chefe e seta da Invasão passaram para rasterização direta via Rust/WebSys, preservando comandos, paleta, ordem e fallback.
- Chrome 156 comparou HUD de combo, barra de chefe e seta com o caminho antigo: zero canais RGBA diferentes, alpha/composite restaurados. Regressões 82/82; sem benchmark.

## Preview local v179.0 — 07/11/2026
- Transformações e brilhos de pickups e armas arremessadas passaram ao painter Rust; o callback de ícone existente continua sob o transform para preservar o desenho da arma.
- Chrome 156 comparou brilho ligado/desligado e arremesso com o fallback: zero canais RGBA diferentes, alpha/composite restaurados. Regressões 82/82; sem benchmark.

## Preview local v178.0 — 07/11/2026
- Brilho, clipping, gradiente, hachuras e bordas da saída de fase passaram ao painter Rust direto; WASM legado continua calculando o lote e gerando a imagem do gradiente.
- Chrome 156 comparou o fallback com Rust em estado concluído e não concluído: zero canais RGBA diferentes, alpha/composite restaurados. Regressões 82/82; sem benchmark.

## Preview local v177.0 — 07/11/2026
- Escadas e elevadores agora enviam o lote de desenho do WASM legado ao painter direto Rust; gradientes de escada/corpo/portas permanecem imagens RGBA preparadas e cacheadas.
- Chrome 156 comparou fallback e painter para os dois tipos com zero canais RGBA diferentes e alpha/composite restaurados. Regressões 82/82; sem benchmark.

## Preview local v176.0 — 07/11/2026
- Gradação de cor e overlays finais de fade/flash passaram a chamar o painter Rust direto, preservando ordem, cores, dimensões e estado do Canvas.
- Chrome 156 confirmou callback integrado e paridade RGBA exata nos cenários cobertos; regressões 82/82. Sem benchmark ou validação visual ampla.

## Preview local v169.0 — 07/11/2026
- Dark overlay de lanterna/apagão agora limpa, recorta e compõe por chamadas Canvas diretas do Rust.
- Corrigida a validação do WASM legado: tamanho de tela/zoom são as dimensões positivas; ângulo aceita zero e blackout/fire flash aceitam flags 0/1.
- Chrome 156 confirmou callback Rust e paridade RGBA exata, com estado da tela preservado. Build direta 152.262 bytes + glue 37.257 bytes; regressões 82/82. Sem benchmark ou revisão visual ampla.

## Preview local v168.0 — 07/11/2026
- Lotes de névoa, luzes de mundo/reflexo, anéis de impacto e zona de invasão agora tentam rasterização via `web-sys` em Rust direto antes do callback Canvas JS legado.
- Build Rust/WASM concluída; artefatos diretos 150.178 bytes WASM + 36.608 bytes glue. Chrome 156: zero diferenças RGBA nos quatro batches e alpha/composite restaurados. Regressões 82/82; sem benchmark ou revisão visual ampla.

## Preview local v167.0 — 07/11/2026
- Overlays de depuração F4/F6 agora são desenhados pelo painter Rust direto; JS continua dono dos dados e conserva fallback.
- Chrome 156: chamada de jogo confirmada com 16 paredes, 5 portas e 5 inimigos; paridade sintética RGBA exata e Canvas restaurado. Build 145.565 bytes WASM + 34.732 bytes glue. Regressões 82/82; sem benchmark ou revisão visual ampla.

## Preview local v166.0 — 07/11/2026
- HUD opcional `dev=1` (painel de FPS/mapa e lista de erros) agora é rasterizada pelo módulo Rust direto; JavaScript continua montando as linhas.
- Chrome 156: HUD de depuração teve diferença RGBA zero, estado Canvas preservado; jogo em modo dev confirmou chamada direta. Pixel parity ampla e regressões 82/82 passaram. Build direto 143.436 bytes WASM + 33.762 bytes glue. Sem benchmark ou revisão visual ampla.

## Preview local v165.0 — 07/11/2026
- Toasts desenhados pelo módulo direto Rust já preservam o alpha; a escrita host redundante de `globalAlpha = 1` agora ocorre apenas no fallback JS.
- Chrome 156: smoke de jogo iniciado e explosão controlada, zero chamadas Canvas host e zero setters de propriedades observados. Pixel parity completa e regressões 82/82 passaram. Sem benchmark ou inspeção visual ampla.

## Preview local v164.0 — 07/11/2026
- As marcas de queimadura de barril (dois círculos no layer de chão) agora chamam o módulo Rust direto; a explosão e dano continuam na lógica JS.
- Chrome 156 compara a rasterização com diferença RGBA zero e smoke captura a rota durante gameplay. Build direto 140.854 bytes WASM + 33.137 bytes glue. Regressões 82/82; sem benchmark ou inspeção visual ampla.

## Preview local v163.0 — 07/11/2026
- O rastro permanente de vidro quebrado (base retangular e nove fragmentos) agora é pintado pelo módulo Rust direto. O JS mantém estado, sorteios e geometria, com fallback Canvas.
- Chrome 156: paridade RGBA zero em nove fragmentos e estado Canvas restaurado; sombras de inimigo continuam diretas (288 chamadas no smoke combinado). Regressões 82/82, ABI/browser e pixel parity passaram. Build direto 140.256 bytes WASM + 32.738 bytes glue. Sem benchmark ou revisão visual ampla.

## Preview local v162.0 — 07/11/2026
- Sombras de inimigos agora são desenhadas pelo módulo Rust direto no caminho normal de gameplay, preservando alpha e ordem por inimigo; fallback JS continua disponível.
- Chrome 156: 205 chamadas diretas observadas; três sombras comparadas com diferença RGBA zero e estado Canvas restaurado. Regressões 82/82; build direto 138.983 bytes WASM + 32.201 bytes glue. Pixel parity integral concluiu depois que o teste pausou o redraw; sem benchmark nem revisão visual ampla.

## Preview local v161.0 — 07/11/2026
- A configuração `imageSmoothingEnabled` de montagem do mapa agora chama o módulo direto Rust/WASM; fallback Canvas mantido.
- Chrome 156: 2 chamadas diretas no smoke e zero escritas de propriedades Canvas via host no cenário base. Build direto 138.010 bytes WASM + 31.704 bytes glue. Regressões 82/82; checks ABI/browser e paridade Chrome passaram. Sem benchmark ou revisão visual ampla.

## Preview local v159.0 — 07/11/2026
- Camadas recortadas (piso, mapa e sangue) passam pelo Rust direto; alpha opcional é salvo/restaurado dentro da função.
- kill() mantém aleatoriedade e geometria no host, mas envia poças, rastros e gotas ao painter Rust. Fallback Canvas preservado.
- Chrome 156: camada e respingo tiveram paridade RGBA zero; teste de kill real usou Rust sem quadraticCurveTo residual. Regressões 82/82, checks WASM/browser/sintaxe passaram. Build 137.834 bytes WASM + 31.452 bytes glue. Sem benchmark ou inspeção visual ampla.

## Preview local v158.0 — 07/11/2026
- Geração Rust direta dos bitmaps cacheados de texto para rótulos de clima e estados de inimigo; fallback e cache JS preservados.
- Chrome 156: comparação RGBA exata nos dois tipos, smoke sem `measureText`/`fillText` residual nas operações monitoradas. Regressões 82/82; checks ABI/browser e pixel parity passaram. Build direto 135.090 bytes WASM + 29.537 bytes glue. Sem benchmark ou validação visual ampla.

## Preview local v157.0 — 07/11/2026
- `clearRect` de pisos, canvas do mapa e camada de sangue cacheada agora chama Rust direto, preservando fallback.
- Chrome 156: 4 chamadas diretas, zero operações residuais no smoke. Regressões 82/82, checks WASM/browser e paridade passaram. Build 121.452 bytes WASM + 27.180 bytes glue; sem benchmark.

## Preview local v156.0 — 07/11/2026
- Criação e aplicação de `ImageData` para camadas RGBA agora são chamadas pelo módulo Rust direto em piso, texturas, sprites, gradiente de saída e frames de jogador; fallback preservado.
- Chrome 156: 18 criações e 24 aplicações diretas; chamadas residuais `createImageData`/`putImageData` zeradas no smoke. Regressões 82/82, checks WASM/browser e paridade passaram. Build 120.713 bytes WASM + 26.635 bytes glue; sem benchmark.

## Preview local v155.0 — 07/11/2026
- Imagens cacheadas de Canvas, incluindo rótulo do clima e snapshots/restaurações `fl`/`tp`, agora são desenhadas por Rust direto. Smoke Chrome: 104 chamadas diretas e nenhuma operação `drawImage` residual; comparação de pixels do rótulo sem diferenças RGBA.
- Build: 117.055 bytes WASM direto + 24.576 bytes glue. Regressões 82/82 e checks WASM/browser passaram. Sem benchmark ou revisão visual ampla.

## Preview local v154.0 — 07/11/2026
- Sangue dinâmico/estático e cadáveres agora são rasterizados por Rust/WASM diretamente no Canvas, mantendo alpha, paletas, transformações e fallback JS.
- Chrome 156 comparou cinco marcas de cada tipo de sangue e três cadáveres sintéticos com zero diferenças RGBA. Sem benchmark; a cena de inicialização não continha esses objetos ativos.

## Preview local v153.0 — 07/11/2026
- Partículas de poeira e faíscas agora são desenhadas por Rust/WASM via `web-sys`: poeira como um único path agrupado e faíscas em grupos de cor/alfa com composição `lighter`. O host continua fornecendo dados e o painter JS permanece como fallback.
- Chrome 156: ambas as comparações sintéticas tiveram zero diferenças RGBA; no jogo, 24 lotes/1.152 comandos de poeira passaram pela rota direta. Build direto **112.638 bytes WASM** + **22.301 bytes glue**. Sem benchmark.

## Preview local v152.0 — 07/11/2026
- Sprites de textos de estado dos inimigos (nocaute, suspeita, alerta e atordoamento) são preparados pelo cache existente e desenhados diretamente pelo Rust/WASM no Canvas, removendo o callback de desenho do host para essas etiquetas. Se o asset não estiver disponível, o lote legado continua como fallback.
- Chrome 156: paridade RGBA zero nos casos de jogador, inimigo e demais camadas previamente cobertas; uma etiqueta de texto foi confirmada na rota direta. Build: **109.955 bytes WASM** + **21.236 bytes glue**. Sem benchmark ou validação visual ampla.

## Preview local v151.0 — 07/11/2026
- Comandos de fundo, overlay, decoração, detalhes de salas, sombras, paredes, postes e vidros quebráveis agora são acumulados e rasterizados por Canvas direto de Rust/WASM. JS mantém a preparação da geometria e fallback legado.
- Chrome 156: 22 comandos diferentes comparados com zero diferença RGBA; a partida usou 35 lotes diretos de mapa. Regressões 82/82, checks WASM e bridge passaram. Módulo direto **109.783 bytes WASM** + **21.616 bytes glue**. Sem benchmark ou validação visual ampla.

## Preview local v150.0 — 07/11/2026
- Batches geométricos de móveis, atores, jogadores, inimigos, armas, fantasmas e aura agora são rasterizados por chamadas `web-sys` diretas em Rust; texto HUD bruto também chama Canvas diretamente. Estado de gameplay e recursos continuam sendo fornecidos por JS, com fallback antigo.
- Chrome 156: comparações exatas sem diferença RGBA para móveis (9 tipos), jogador/inimigo com spritesheets, arma, fantasma, aura e texto HUD; cenários anteriores de pausa, overlays, chuva e motes continuam sem diferença. Build direto **94.595 bytes WASM** + **18.707 bytes glue**. Sem benchmark ou validação visual ampla.

## Preview local v149.0 — 07/11/2026
- Motes ambientais agora têm alpha e desenho de quadrados executados diretamente pelo Rust/WASM com Canvas `web-sys`. Movimento, limites e RNG continuam na simulação JS; fallback legado preservado.
- Chrome 156: dois horários com zero diferença RGBA e rota direta confirmada. As medições exatas anteriores de pausa/overlays/chuva permanecem. Build direto **75.086 bytes WASM** + **10.135 bytes glue**. Sem benchmark de FPS.

## Preview local v148.0 — 07/11/2026
- A chuva agora recebe seus pontos já atualizados pelo JS e o Rust direto cria e pinta o caminho com `web-sys`; stride 1/2, ordem, respawn e aleatoriedade seguem no JS. Fallback antigo permanece.
- Chrome 156: paridade exata em stride 1 e 2, dois cenários; pausa/overlays mantêm os nove casos exatos. Build direto **74.574 bytes WASM** + **9.432 bytes glue**; regressões anteriores 82/82. Sem benchmark, portanto sem alegação de FPS.

## Preview local v147.0 — 07/11/2026
- O módulo direto `web-sys` agora também desenha clarões/pisca, lavagem do alarme e barras cinematográficas direto no contexto Canvas. A chamada passa por `withCanvasBypass`, sem reentrar no dispatcher Canvas antigo. JS continua fornecendo estado e números.
- Chrome 156 comparou seis combinações de overlays com zero canais diferentes; pausa mantém três estados pixel-exatos. Build: `direct_renderer_bg.wasm` **71.036 bytes**, glue **8.223 bytes**; regressões **82/82**. Sem benchmark; renderer geral segue híbrido.

## Preview local v146.0 — 07/11/2026
- O menu de pausa agora chama `CanvasRenderingContext2D` diretamente de Rust via `wasm-bindgen`/`web-sys`. JS mantém estado, hover e fallback; o módulo Rust executa formas e textos no contexto recebido.
- Chrome 156: comparação RGBA sem diferença em três estados de hover. Build inclui módulo legado e módulo direto; o novo `.wasm` direto tem **34.353 bytes**, glue JS **7.513 bytes**; regressões **82/82**. Renderer ainda híbrido e sem benchmark/FPS.

## Preview local v145.0 — 07/11/2026
- `BuildFloor` agora envia os spritesheets pequenos (paredes, móveis e portas) ao Rust; Rust recorta os oito sprites 24×24 para a tabela de texturas. Isso remove a criação dos oito crops Canvas na rota WASM. Host ainda lê pixels do spritesheet e envia a camada composta ao Canvas; fallback JS permanece.
- Teste de recorte cobre pixels de borda e rejeita slot/limites inválidos. Build WASM **185.475 bytes**; ABI, bridge, Chrome 156 e regressões **81/81** passaram. Pixel-parity das camadas já existentes manteve os resultados medidos na v144. Sem benchmark ou inspeção visual ampla.

## Preview local v144.0 — 07/11/2026
- O sprite de neblina/fumaça (nove gradientes radiais 512×256) agora é composto em RGBA pelo Rust e enviado uma vez ao canvas cacheado. Os parâmetros aleatórios continuam sendo sorteados na mesma ordem JS para preservar o RNG; criação tardia usa fallback Canvas se WASM não estiver pronto.
- Chrome 156 comparou o sprite com Canvas: desvio alfa máximo 1/255 e média 0,1074/255; RGB máximo 12/255 em pixels com alfa≥64. Teste de runtime forçou neblina e confirmou sprite Rust e batch de fog ativo. Loops Rust limitados aos bounds de cada círculo; sem benchmark.
- Build WASM **184.656 bytes**; ABI e browser bridge passaram; regressões completas **81/81**. A migração ampla permanece incompleta.

## Preview local v143.0 — 07/11/2026
- Paredes, móveis e sprites de portas abertas do piso agora são rasterizados como camada RGBA pelo Rust; o host copia oito sprites 24×24 para o WASM e aplica um `ImageData` reutilizável. Caminho de comandos Canvas segue como fallback para entradas/ambientes não suportados.
- Chrome 156, Apartamento 1440×900, 50 sólidos e cinco aberturas: comparação do passe de texturas com o Canvas teve máximo 76/255, média 0,00194695/255 (240 canais diferentes); teste repetido duas vezes com o mesmo resultado. Tolerância automatizada max 80 e média 0,0025 devido a bordas fracionárias/subpixelizadas.
- Ajustada a amostragem do sprite de porta após o comparador identificar desalinhamento em pixels rotacionados. Build WASM **181.969 bytes**; ABI, browser bridge e regressões **80/80** passaram. Sem benchmark de desempenho ou revisão visual ampla.

## Preview local v142.0 — 07/11/2026
- Sombras dos sólidos e rejunte são rasterizados em Rust por cobertura de pixel sobre a camada RGBA de granulado+FTILES. Os retângulos fracionários mantêm cobertura parcial; geometria negativa/malformada usa fallback Canvas. Um upload de `ImageData` conclui a camada do piso.
- Chrome 156 comparou o compositor combinado em Apartamento (1440×900, 50 sólidos): 347.083/5.184.000 canais diferiram, máximo 3/255 e média 0,1882/255; RNG igual; zero exceções JS.
- Build WASM **178.000 bytes**. ABI, browser bridge e regressões **80/80** passaram. Sem benchmark de desempenho ou validação visual ampla.

## Preview local v141.0 — 07/11/2026
- Rust rasteriza o tileset FTILES na camada RGBA reutilizada do granulado, com fase horizontal, recorte por sala e exclusão do corredor. O host copia os 72×24 pixels do asset para a memória WASM e envia a imagem resultante ao Canvas uma vez.
- Chrome 156 comparou Apartamento (1440×900, 5 salas): estado RNG igual; diferença de 3/255 no máximo, em 335.188 de 5.184.000 canais (média absoluta 0,194/255). É uma diferença pequena medida, não paridade exata nem revisão visual ampla.
- Build WASM: 175.939 bytes. ABI, browser bridge e regressões 80/80 passaram; teste Chrome de paridade FTILES passou com limiar máximo 3/255 e média 0,2/255. Sem benchmark de desempenho.

## Preview local v140.0 — 07/11/2026
- Granulado do piso rasterizado como RGBA pelo Rust, com a mesma sequência de RNG; o host envia a camada por um único `putImageData`, mantendo o painter JavaScript como fallback. Buffer Rust limitado a 1440×900 (5.184.000 bytes).
- Em Chrome 156, comparação pixel a pixel de 1440×900 com 8.100 specks teve **0 diferenças em 5.184.000 canais** e o estado RNG final coincidiu. Apartamento em `play`, WASM ativo e zero exceções.
- Build WASM **174.197 bytes**; ABI, browser bridge e regressões **80/80** passaram. Sem benchmark; o efeito no tempo de frame não foi medido.

## Preview local v139.0 — 07/11/2026
- Ajustada a textura das portas do elevador: cada painel agora amostra a faixa correspondente ao gradiente de largura total do elevador, como no Canvas original. Texturas esquerda e direita são cacheadas separadamente.
- Chrome 156 comparou os pixels dos gradientes de escada, corpo do elevador e ambos os painéis: diferença máxima de **1/255** por canal em cada caso. Apartamento iniciou em `play`, WASM ativo, sem exceções.
- Build WASM: **172.601 bytes**. ABI, browser bridge e regressões **80/80** passaram; smoke Chrome 156 em `play`, sem exceções. Sem benchmark ou inspeção visual ampla.

## Preview local v138.0 — 07/11/2026
- Rust gera gradientes RGBA de escadas, elevadores e portas metálicas; texturas são cacheadas por transporte e desenhadas pelo host com `drawImage`. O painter Canvas original continua como fallback.
- Build WASM: **172.601 bytes**. ABI, browser bridge e regressões **80/80** passaram. Não foi feita validação visual ampla nem benchmark.

## Preview local v137.0 — 07/11/2026
- Rust gera o gradiente diagonal da saída como RGBA; a imagem fica em cache por tamanho/estado e o host aplica o pulso com alpha ao desenhar. A geração por pixel não se repete nos quadros seguintes; o painter original continua como fallback.
- Regressão confirma que o lote de saída desenha a imagem gerada e não cria gradiente Canvas no caminho WASM. Build WASM: **171.352 bytes**; ABI, browser bridge e regressões **79/79** passaram.
- Chrome 156: Apartamento em `play`, WASM ativo e zero exceções; saída real mede 188×70 e usa as dimensões compatíveis com a imagem Rust cacheada. Comparação sintética de 100×40 com o gradiente Canvas teve diferença máxima de alpha 1/255, média 0,101/255, diferença RGB máxima 8 e pixel central idêntico. Sem inspeção visual ampla ou benchmark.

## Preview local v136.0 — 07/11/2026
- Rust rasteriza em RGBA um sprite reutilizável do clarão de disparo; os efeitos de muzzle flash no modo WASM desenham a imagem com os mesmos limites, composição `lighter` e alpha dependente do tempo. O Canvas gradiente original continua no fallback.
- ABI e browser bridge cobrem a geração e o uso em batch. Chrome 156: sprite sintético comparado ao gradiente Canvas teve alpha idêntico em todos os pixels do sprite e centro RGBA idêntico; máximo de diferença RGB de 8 níveis em pixels visíveis. O smoke de `play` teve zero exceções.
- Binário WASM: **170.517 bytes**. Build, ABI/browser bridge e regressões completas passaram (**78/78**). Sem validação visual de combate/jogo completo e sem benchmark.

## Preview local v135.0 — 07/11/2026
- Otimizada a raiz quadrada na geração radial Rust: estimativa inicial por bits e três passos de Newton, em vez de até doze iterações por pixel.
- Varredura numérica de 3.300 raios entre 0,1 e 330, com 500 amostras por raio, não encontrou diferença no alpha arredondado em relação a `sqrt` exata. No Chrome 156, sprite de raio 65,5 manteve o mesmo pixel central e alpha máximo 1/255 de diferença para a referência Canvas.
- Build WASM: **169.533 bytes**. Regressões **77/77**, ABI e browser bridge passaram; Chrome iniciou Apartamento em `play`, WASM ativo e sem exceções.
- Contadores do smoke após início: 22 `drawImage`, 2 `createPattern` da montagem do mapa, 4 `clearRect` e uma chamada cada para `measureText`/`fillText` do rótulo climático cacheado. Não houve benchmark de frame time/CPU ou validação visual ampla.

## Preview local v134.0 — 07/11/2026
- A geração de sprites radiais de luz/fumaça foi transferida para Rust: calcula RGBA num buffer fixo, e o host os transfere para `ImageData`. O sprite Canvas original continua como fallback.
- A criação dos quatro sprites compartilhados agora é adiada até o primeiro quadro e usa Rust quando o módulo já está ativo. Efeitos de luz dinâmicos também usam essa rota.
- Build WASM: **169.701 bytes**. Regressões **77/77**, testes ABI e browser bridge passaram.
- Smoke Chrome 156 em Apartamento: WASM ativo, `play`, zero exceções; não houve chamadas bridge de gradiente (`createRadialGradient`, `addColorStop`) nem `fillRect` para esses sprites. Restaram 22 `drawImage` de tiles na montagem, 2 `createPattern`, 1 `measureText` e 1 `fillText`.
- Comparação RGBA de um gradiente radial (raio 65,5) contra Canvas: erro máximo de alpha 1/255 e média 0,126/255. Diferenças de cor chegam a 8 níveis em pixels com alpha acima de 32; sem comparação visual de cena ou benchmark.

## Preview local v133.0 — 07/11/2026
- Rust agora gera a geometria da Madame Piranha, sombra, rosto, chapéu, temporizador, balão, cards e reroll. O host Canvas rasteriza comandos; o painter JavaScript permanece fallback.
- O balão mede texto num contexto auxiliar cacheado, sem save/restore e escrita de fonte a cada quadro.
- Build Rust/WASM atualizado. Regressões **76/76**, ABI Rust e browser bridge passaram.
- Smoke sintético de loja no Chrome 156: WASM ativo e zero exceções. No mesmo cenário, o bridge caiu de 333 `save`, 333 `fillRect`, 272 `strokeRect`, 61 `restore` e 7 `measureText` para apenas 7 `measureText`; a fonte foi definida uma vez. Essa contagem não é benchmark de FPS nem teste visual de paridade.

## Preview local v131.0 — 07/11/2026
- O texto “CRÉDITOS” do overlay da loja agora usa o batch de texto HUD Rust e rasterização direta do host com bypass do bridge genérico; parâmetros visuais e fallback original foram mantidos.
- Regressões 74/74, ABI Rust/WASM e browser bridge passaram. Build WASM não foi necessário (ABI existente). Smoke Chromium v131 em Apartamento: WASM pronto/ativo, fase 1 em `play`, zero exceções; em 2,5 s, o bridge registrou 1 `fillText` (cache inicial de clima), 0 `save`/`restore` e 22 `drawImage` do carregamento/montagem inicial. Sem inspeção visual comparativa ou benchmark.

## Preview local v130.0 — 07/11/2026
- Rótulos de escadas/elevadores passam pelo batch Rust de textos HUD após o batch geométrico de transporte; a composição e o fallback Canvas permanecem.
- ABI e browser bridge passaram; regressões **73/73 passaram**. Smoke Chromium em Apartamento permaneceu em `play`, WASM pronto/ativo e zero exceções. Em 2,5 s, diagnósticos registraram 86 fillText, 85 save/restore e 22 drawImage residuais; não houve comparação visual ou benchmark. WASM: 165.499 bytes.

## Preview local v129.0 — 07/11/2026
- O alpha do Canvas só é reescrito para 1 após o batch de fantasmas se o valor não estiver no padrão; o painter JS continua restaurando o alpha após desenhar fantasmas manualmente.
- ABI e browser bridge passaram; regressões **72/72 passaram**. WASM permanece em 165.499 bytes. O smoke desta versão não confirmou módulo pronto; sem validação visual ou de desempenho.

## Preview local v128.0 — 07/11/2026
- Os dois escopos de transformação que cercam screen shake, câmera e cena agora são abertos e fechados como comandos do batch Rust; fallback JavaScript preserva save/restore quando a ponte WASM não atende ou rejeita dados.
- Build WASM: **165.499 bytes**. ABI, browser bridge e regressões **71/71 passaram**. Smoke Chromium em Apartamento ficou em play durante a amostra, WASM pronto, 774 comandos de transformação e zero exceções; sem comparação visual ampla ou benchmark.

## Preview local v127.0 — 06/11/2026
- O passe de luzes aditivas pula `save/restore` e troca de composição quando não existem luz, clarão ou reflexo; o fallback continua para efeitos ativos.
- ABI e browser bridge passaram; regressões **70/70 passaram**. Smoke Chromium na tela inicial: WASM pronto por 89 quadros, sem exceções ou escrita em `globalCompositeOperation`. Um segundo smoke iniciou Apartamento em `play` e chegou a `dead` sem entrada do jogador; WASM pronto, 706 chamadas Canvas residuais acumuladas e zero exceções. Sem comparação visual ou benchmark.

## Preview local v126.0 — 06/11/2026
- O preenchimento base de cada quadro agora é emitido pelo renderer Rust/WASM e rasterizado pelo host Canvas, mantendo as mesmas dimensões com margem para screen shake e o painter fallback JS.
- Build WASM: **165.209 bytes**. ABI, browser bridge e regressões **69/69 passaram**. Sem benchmark de frame time/FPS.

## Preview local v125.0 — 06/11/2026
- A escala base do Canvas e as opções de suavização são validadas/aplicadas por um comando Rust/WASM em cache; a UI mantém os valores e força reaplicação quando redimensiona o canvas. A configuração não é reaplicada a cada frame.
- Auditoria de operações residuais ficou disponível somente com `?wasmDiagnostics=1`, incluindo contagens e amostras de stack; fora desse modo, não coleta histogramas.
- Build WASM: **164.789 bytes**. ABI, browser bridge e regressões **68/68 passaram**. Sem benchmark de desempenho.

## Preview local v123.0 — 06/11/2026
- Rust agora gera o véu e a geometria dos dois botões do menu de pausa, incluindo cores de hover e contornos; JavaScript mantém interação, hit test, textos e fallback Canvas.
- Build Rust/WASM: **164.199 bytes**. ABI, browser bridge e regressões **68/68 passaram**. Smoke Chromium curto abriu uma fase, mostrou o selo WASM ativo, acumulou 23.856 chamadas Canvas residuais e não registrou exceções JavaScript; captura inspecionada. Sem comparação visual lado a lado, teste manual da pausa ou medição de desempenho.

## Preview local v111.0 — 06/11/2026
- O batch de inimigos portou os contornos de classe, barras do Blindado, coroa do Líder, laser de aviso do Atirador e pulsos/linha tracejada de carga do chefe; filtros de visibilidade, estado e fallback mantêm a lógica existente.
- Build Rust/WASM: **152.256 bytes**. ABI, browser bridge e regressões **66/66 passaram**. Smoke Chromium em Apartamento, com os quatro tipos de teste, registrou `worldEnemyAccentCommands=4`, zero exceções e captura inspecionada. Sem comparação visual ampla ou medição de desempenho.

## Preview local v110.0 — 06/11/2026
- Câmeras de segurança de `EXP.worldDraw` agora enviam posição, ângulo, estado de alarme e setor de visão em lote ao Rust, que gera os comandos da área de visão, corpo e lente; a simulação e o fallback continuam no JS.
- Build Rust/WASM: **146.848 bytes**. ABI, browser bridge e regressões **65/65 passaram**. Smoke Chromium em Apartamento, com câmera sintética e chamada de `EXP.worldDraw` durante `play`, mostrou `worldCameraCommands=1`, `worldBarrelCommands=92` e zero exceções; captura inspecionada. Sem comparação ampla ou medição de desempenho.

## Preview local v109.0 — 06/11/2026
- Barris explosivos de `EXP.worldDraw` agora enviam posição, raio e timer em batch ao Rust, que gera o desenho e preserva o pisca das barricas armadas; simulação, estado e fallback ficam em JavaScript.
- Build Rust/WASM: **140.778 bytes**. ABI, browser bridge e regressões **64/64 passaram**. Não houve smoke visual específico dos barris nem medição de desempenho.

## Preview local v108.0 — 06/11/2026
- O círculo pulsante da zona do modo Invasão agora envia posição e relógio ao Rust, que calcula o alpha de pulso; o host preserva estilos e sequência de stroke/fill Canvas.
- Simulação/modo, coordenadas e fallback original permanecem no JavaScript. A entrada WASM é reutilizada.
- Build Rust/WASM: 137.331 bytes. ABI, bridge e regressões **63/63 passaram**. Não houve smoke visual do modo Invasão nem medição de desempenho.

## Preview local v107.0 — 06/11/2026
- Anéis de impacto/explosão de `EXP.worldDraw` agora enviam estado e cores para um batch: Rust calcula raio animado, alfa e espessura; o host preserva a cor e rasteriza os arcos no Canvas.
- Mantidos os dados e timers dos anéis no gameplay JS, fallback do painter original e limite explícito de 14 slots; adicionadas regressões ABI, bridge e integração.
- Build Rust/WASM: 136.532 bytes. ABI, ponte Canvas e regressões **62/62 passaram** após corrigir a expectativa do teste para a fórmula original (raio inicial = 25% de R e traço = 7 px).
- Smoke Chromium em Apartamento confirmou `play`, renderer `ready`, anel laranja visível em P1, 24 comandos acumulados e zero exceções; captura inspecionada. Sem comparação geral ou medição de FPS/CPU.

## Preview local v106.0 — 06/11/2026
- Rust escolhe a posição e as dimensões do rótulo climático, preservando o canvas de texto cacheado no JS e o `drawImage` do host.
- Build release, ABI, browser bridge e regressões 61/61 passaram. Smoke Chromium iniciou o alvo, mas o renderer não respondeu a `Runtime.evaluate`; não há confirmação visual desta camada. Nenhuma afirmação de desempenho.

## Preview local v105.0 — 06/11/2026
- O timer/estado do alarme continua na simulação JS; Rust valida o rótulo ativo e calcula o centro/linha de base. O host mantém `fillText`, fonte, alinhamento e cor originais, com fallback JS.
- Build release, ABI, browser bridge e regressões 61/61 passaram. Smoke Chromium em Apartamento mostrou o rótulo durante `play`, com 40 comandos e zero exceções; captura inspecionada. Sem comparação lado a lado ou desempenho medido.

## Preview local v104.0 — 06/11/2026
- Rust escolhe e posiciona a vinheta do gameplay, a vinheta do HUD e o retrato da máscara; o host mantém os assets e rasteriza um batch de imagens Canvas.
- Fallback JS permanece. Build release, ABI, bridge e regressões 61/61 passaram. Smoke Chromium em Apartamento emitiu 48 comandos de imagem, permaneceu em `play` e não teve exceções; captura inspecionada. Sem comparação lado a lado ou desempenho medido.

## Preview local v103.0 — 06/11/2026
- O multiplicador artístico de combo envia valor/relógio ao Rust, que valida o estado e calcula o pulso; o host preserva fonte, contorno, preenchimento e ordem de rasterização Canvas, com fallback original.
- Build release, ABI, browser bridge e regressões 61/61 passaram. Smoke Chromium em Apartamento forçou combo 5X em `play`: 13 comandos, zero exceções; captura inspecionada. Sem comparação lado a lado ou medição de desempenho.

## Preview local v102.0 — 06/11/2026
- Rust calcula a projeção do jogador, os raios da luz central/lanterna e a presença do clarão de disparo; o host aplica as imagens em Canvas na máscara de apagão e compõe a camada reduzida de 480×300 no quadro.
- A simulação, ângulo/posição do jogador e assets continuam em JS/host; fallback original permanece. Build release, ABI, bridge e regressões 61/61 passaram. Smoke Chromium em Apartamento ativou apagão e disparo, gerou 17 comandos, ficou em `play` e não registrou exceções; captura inspecionada. Sem comparação lado a lado ou medição de desempenho.

## Preview local v101.0 — 06/11/2026
- Rust calcula pulso, cintilação, qualidade e geometria das luzes aditivas, do clarão de disparo e do reflexo de chuva; o host rasteriza os sprites/elipse no Canvas.
- Build release, ABI e browser bridge passaram. Smoke Chromium em Apartamento reportou 115 comandos de luz e zero exceções; captura inspecionada. Sem FPS.

## Preview local v100.0 — 06/11/2026
- Rust gera em um lote geometria e alfa para clarão de chuva, cintilação neon, pulso vermelho do alarme e barras cinematográficas; o host rasteriza via Canvas.
- A preferência para reduzir flashes continua suprimindo clarões; timer/clima e texto do alarme continuam no JS. Painter JS permanece como fallback. Cache e health endpoint identificam v100.
- ABI, browser bridge e regressões 61/61 passaram. Chromium em `play` forçou chuva, flash, alarme e barras em Apartamento: 79 comandos, zero exceções; captura inspecionada. Sem comparação JS/WASM ou FPS.

## Preview local v99.0 — 06/11/2026
- Rust calcula em lote o corte de qualidade, tipo/composição, opacidade e três posições animadas de névoa/fumaça; host mantém assets e rasterização Canvas com save/restore.
- Painter JS permanece fallback. Build release, ABI, bridge e regressões 61/61 passaram; Chromium em `play` emitiu 111 placements, zero exceções e captura inspecionada. Sem comparação lado a lado ou FPS.

## Preview local v98.0 — 06/11/2026
- Rust valida partículas ambientais e calcula sua opacidade animada; o host rasteriza os quadrados em Canvas num batch, mantendo movimento, wrap e respawn no JS.
- O modo JS segue como fallback; cache offline e health endpoint identificam v98.
- Build, ABI, browser bridge e regressões 61/61 passaram. Chromium forçou poeira em Apartamento durante `play`, emitiu 2.592 comandos sem exceções; captura inspecionada. Sem comparação JS/WASM ou FPS.

## Preview local v97.0 — 06/11/2026
- Rust valida e ordena a geometria dos segmentos de chuva em lote, respeitando stride de qualidade e limite fixo de 256 gotas; avanço e respawn permanecem no JS para preservar RNG.
- Host desenha os segmentos em um único caminho com save/restore; fallback antigo continua para WASM ausente ou dados inválidos.
- Atualizado cache offline para `cappe-v97.0-wasm-rain-batch`.
- Build, ABI, browser bridge e regressões 61/61 passaram. Chromium em `play` forçou chuva em Apartamento e emitiu 6.240 segmentos sem exceções; captura inspecionada. Sem comparação JS/WASM ou medição de FPS.

## Preview local v96.0 — 06/11/2026
- HUD principal, máscara/atributos, sala limpa, pausa, saída, transporte, prompts de coleta, popups e banners seguem listas ordenadas de texto/alfa validadas pelo Rust; o host reutiliza o painter/cache `tx()` e preserva a rasterização Canvas.
- Selo de diagnóstico reduzido para uma linha, sai da área do retrato e informa explicitamente a quantidade acumulada de chamadas Canvas residuais; detalhes ficam no tooltip.
- O ABI filtra posições/alinhamentos inválidos e rejeita lotes acima de 64. O cache offline e o health endpoint passam a identificar v96.
- Build release e testes ABI/bridge passaram; regressões 61/61 passaram. Chrome headless entrou na fase 1 em `play`, renderer `ready`, sem erros iniciais e com captura inspecionada; sem paridade lado a lado ou medição de FPS.

## Preview local v95.0 — 06/11/2026
- Rastros do jogador migrados para comandos Rust: sombra, weapon icon, alpha gradual, corpo geométrico e ordem ficam no lote; o host aplica o Canvas. Mantido o painter JS como fallback.
- Testes ABI Rust/WASM e browser bridge passaram; regressões 61/61 passaram com cache e health endpoint v95. Sem validação visual/FPS.

## Preview local v94.0 — 06/11/2026
- Rust agora gera a barra de combo, moldura de retrato da máscara e véu de pausa; o host executa fills/contorno Canvas em lotes com cores e geometria verificadas.
- Testes ABI e browser bridge passaram; regressões 61/61 passaram com cache do service worker e endpoint health v94. Sem validação visual/FPS.

## Preview local v93.0 — 06/11/2026
- Rust agora gera comandos ordenados para os overlays finais de fade/flash; respeita alfa, canvas e a opção que desativa flashes. O host rasteriza no Canvas com save/restore.
- Testes ABI e browser bridge passaram; regressões 61/61 passaram. Sem validação visual ou medição de desempenho.

## Preview local v92.0 — 06/11/2026
- Rust agora define os dois comandos de color grade e sua ordem soft-light/overlay; o host preserva cores, composição e estado do Canvas em um lote.
- Testes ABI e browser bridge passaram; regressões 61/61. Conversão integral em andamento; sem validação visual ou medição de desempenho.

# Changelog técnico
## Preview local v76.0 — 06/11/2026
- Rust agora seleciona, ordena e calcula transformações das portas Neon com sprite em lote; JavaScript fornece as imagens e rasteriza os comandos Canvas após o retorno WASM.
- O fallback `neonDrawDoor` permanece ativo quando o módulo novo não está disponível ou falha. A animação/estado de abertura das portas continua no gameplay JavaScript.
- Binário WASM recompilado (102.586 bytes); testes ABI/bridge cobrem offsets, ângulos combinados, handles de sprite e fallback; regressões 61/61 passaram. Smoke Chromium de mapa Neon não executou porque o ambiente negou o socket local do DevTools; sem validação visual/FPS.

## Preview local v75.0 — 06/11/2026
- Rust agora seleciona as salas do overlay `FTILES`, ignora o corredor e gera a translação horizontal usada pelo tileset; o host continua dono do padrão de imagem, recorte e rasterização Canvas.
- `paintFloor` mantém o fallback JavaScript quando o asset não carrega ou o módulo não fornece a exportação. Binário recompilado (101.508 bytes).
- Regressões 60/60 e testes WASM/bridge passaram; Chrome abriu Apartamento com 13 comandos de textura de piso e zero exceções. Captura inspecionada; sem comparação de paridade ou medição de FPS.

## Preview local v74.0 — 06/11/2026
- Rust agora escolhe as texturas de sólidos e decalques das aberturas em uma lista de comandos, mantendo a ordem de paredes/móveis antes das portas.
- O host continua carregando recortes, criando CanvasPattern, aplicando clipping e desenhando os sprites; o painter JavaScript original fica como fallback.
- Regressões 59/59, testes Rust/WASM/bridge e smoke Chromium passaram. Apartamento em `play` teve três texturas carregadas, 135 comandos de textura e zero exceções. Captura inspecionada; sem comparação ou FPS medido.

## Preview local v73.0 — 06/11/2026
- `buildFloor` agora pede ao Rust a geração de specks determinísticos, sombras de sólidos e linhas de rejunte em dois lotes separados para preservar a ordem em torno das texturas de piso.
- Rust devolve a semente avançada do RNG; o host mantém Canvas e overlays de imagem. As primitivas originais JavaScript ficam como fallback.
- Regressões 58/58, testes Rust/WASM e bridge passaram. Chrome abriu Apartamento em `play`, registrou 16.516 comandos de acabamento no mapa e zero exceções. Screenshot inspecionada; sem medição de FPS ou comparação lado a lado.

## Preview local v72.0 — 06/11/2026
- Rust agora gera a sequência de comandos Canvas para janelas intactas e fragmentos de vidro; o host aplica as primitivas após a chamada WASM.
- Os temporizadores e a remoção de fragmentos vencidos continuam no JavaScript. O painter JavaScript original permanece como fallback.
- Testes Rust/WASM e bridge passaram; regressão 57/57. Chromium abriu Apartamento em `play`, confirmou quatro comandos de vidro no diagnóstico e zero exceções. Screenshot inspecionada; sem benchmark nem comparação visual lado a lado.

## Preview local v71.0 — 06/11/2026
- Fundo escuro de mapas fixos, overlay de piso e decoração estática agora são comandos Rust/WASM: preenchimentos, retângulos de tapete e bordas, mantendo ordem e coordenadas.
- O host continua aplicando Canvas, recebe cores de decoração do mapa e preserva fallback JavaScript quando o backend está desativado ou excede capacidade.
- Adicionadas regressões WASM/bridge para fundo fixo, overlay, tapete e outros objetos. Build offline, testes específicos passaram; regressão 57/57.
- Chrome abriu Apartamento em `play`, executou 70 comandos de decoração, renderer `ready`, sem exceções. Screenshot inspecionada; sem comparação lado a lado nem medição de FPS.

## Preview local v70.0 — 06/11/2026
- Rust passou a emitir comandos semânticos, com posições, para os textos “ATORDOADO”, “NOCAUTE · ESPAÇO”, “?” e “!” dentro do buffer ordenado do inimigo.
- O host usa o painter `tx()` existente para manter fonte, contorno, alinhamento e cache. Em falha do buffer, os eventos continuam direcionando para o painter JavaScript original.
- Adicionada contagem dos comandos de texto executados e regressões de posição, ordem, nocaute, stun e estados suspeito/alerta.
- Build offline e testes Rust/WASM/bridge passaram; regressão 57/57. Smoke Chromium abriu Apartamento em `play`, exercitou dois comandos de texto inimigo e teve zero exceções. Captura inspecionada, sem comparação lado a lado; FPS não medido.

## Preview local v69.0 — 06/11/2026
- Rust passou a gerar os seis círculos animados do efeito de atordoamento dentro do mesmo buffer ordenado do corpo do inimigo; o host evita duplicar essa geometria e continua desenhando o rótulo “ATORDOADO”.
- Mantida a ordem de desenho e o painter JavaScript quando o lote WASM não está disponível. O tempo do efeito é fornecido pelo host; a aproximação trigonométrica Rust pode ter pequenas diferenças de ponto flutuante.
- Build offline, testes Rust/WASM/bridge e regressões 57/57 passaram. Chromium abriu Apartamento em `play`, exercitou stun e teve zero exceções; captura inspecionada sem comparação lado a lado. FPS não medido.

## Preview local v68.0 — 06/11/2026
- Rust passou a compor os atores jogadores em um lote por quadro: transformações, sombra/aura, arma, seleção do recorte de spritesheet ou frame procedural, acentos cosméticos e identificação P1/P2.
- O HTML mantém a atualização de animação já existente; o host JS entrega até três estados/handles e executa comandos Canvas depois que a chamada WASM retorna. Fallback visual JS permanece disponível.
- Regressões cobrem os comandos Rust, ordem e ativos, os dois caminhos de sprite e a integração do bridge. Build offline e regressões 57/57 passaram.
- Chromium headless abriu Apartamento em `play`, executou 4.056 comandos de jogador, 1.812 de corpo inimigo e teve zero exceções; captura inspecionada sem comparação lado a lado. FPS não medido.

## Preview local v67.0 — 06/11/2026
- Rust passou a gerar a sequência de comandos do corpo de cada inimigo visível: transforms, alpha de nocaute, geometria fallback e recorte animado do spritesheet; o host Canvas executa o buffer na ordem da cena.
- A geração de sombra (v66), o painter antigo como fallback, stun/rótulos e o modo JavaScript foram preservados.
- Regressões cobrem geometria, ordem, knockout alpha, spritesheet animado, fallback, teste do browser bridge e abertura em Chromium. Cache offline e endpoint de saúde avançaram para v67.0.
- Sem benchmark de FPS; a captura headless foi inspecionada, sem comparação side-by-side com o renderer JavaScript.

## Preview local v66.0 — 06/11/2026
- Rust gera, em um buffer por frame, a geometria das sombras dos inimigos visíveis e aplica o alpha de nocaute correspondente; o host Canvas desenha cada sombra antes do corpo sem reentrar no WASM.
- Corpos, stun, textos e rasterização continuam no host; o fallback JS ainda desenha a sombra quando o modo WASM está desligado.
- Adicionadas regressões Rust/bridge e integração que verificam coordenadas, alpha, ordem e ausência da sombra duplicada.
- Cache offline e endpoint de saúde avançaram para v66.0; build e regressões registrados em AI_TESTS.md. Sem medição de FPS e sem revisão visual manual.

## Preview local v65.0 — 05/11/2026
- A sombra do jogador e o halo P1/P2 agora são gerados por Rust em um único lote de comandos por ator; preferências de sombra e cores de jogador foram preservadas.
- Adicionadas regressões para as geometrias/sombras alternativas, cores P1/P2 e caminho `drawOnePlayer`.
- Build, testes e Chrome headless registrados em `docs/AI_TESTS.md`; desempenho não medido.

## Preview local v64.0 — 05/11/2026
- A seleção da célula de animação do spritesheet de jogador e inimigo agora é calculada pelo Rust; o HTML mantém o tempo de movimento e submete os recortes ao Canvas.
- Adicionadas regressões de paridade para fases/ataques do jogador e cadência de 110 ms do inimigo, além de integração de `drawOnePlayer` com o bridge WASM.
- Build e testes completos registrados em `docs/AI_TESTS.md`; desempenho não medido.

## Preview local v63.0 — 05/11/2026
- O protótipo que desenhava em Rust os círculos de atordoamento travou no Chrome headless ao enviar operações de arco ao Canvas real; removido antes de empacotar.
- Rust agora devolve um buffer ordenado de eventos de desenho para inimigos, que JavaScript consome depois do retorno WASM. Isso evita reentrância durante o desenho no Canvas.
- A decisão de estado e seleção de inimigos continuam em Rust/WASM; o callback JavaScript desenha o efeito de atordoamento completo, como no modo original.
- Build, regressão e Chrome headless registrados em `docs/AI_TESTS.md`; desempenho não medido.

## Preview local v62.0 — 05/11/2026
- Desenho de portas sem sprite portado: Rust calcula origem, orientação, painel (textura ou fallback), contorno luminoso e alpha; a ponte executa o lote Canvas.
- Portas com arte Neon preservam a ordem e continuam usando as texturas pelo host JavaScript.
- Adicionadas regressões para portas verticais/horizontais, painel texturizado/fallback e integração do callback Canvas.
- Build offline, testes de WASM e regressão geral 57/57 passaram. Chrome headless abriu Apartamento com renderer `ready`, 1.680 comandos de portas e zero exceções JavaScript.
- Captura confirmou execução da fase, não uma sessão manual completa. FPS/desempenho não medidos.

## Preview local v61.0 — 05/11/2026
- A geração Rust/WASM agora produz os pixels RGBA dos frames procedurais 24×24 do jogador e aceita as paletas cosméticas existentes; cache e spritesheet permanecem no fluxo original.
- Adicionada comparação pixel a pixel com a função JavaScript original: quatro paletas, estados idle/caminhar/correr/ataque, fases de animação e os quatro frames de ataque.
- Ícones de armas antigas, armas novas e fallback genérico também são emitidos por Rust em todos os usos do jogador, inimigos e itens no chão.
- Contadores de móveis e armas foram separados para distinguir comandos dos dois grupos; atualizado status local e documentação. O Canvas continua sendo rasterizado pelo navegador.
- Build Rust/WASM, testes focados e regressão geral passaram. Captura headless abriu Apartamento, renderer `ready`, 152.456 primitivos de piso, 1.054 comandos de móveis, cerca de 2,1 mil comandos de armas e zero exceções JavaScript. Desempenho não foi medido.

## Preview local v57.0 — 05/11/2026
- Criada cópia experimental Rust/WASM sem dependências externas, com ABI para encaminhar métodos/setters Canvas e filtrar/iterar inimigos visíveis no modo `?renderer=wasm`.
- Algoritmos de carpete, azulejo e tijolo foram movidos para Rust; preservada a sequência aleatória determinística e adicionados testes para coordenadas e integração de recorte.
- Detalhes estáticos das salas e partículas/manchas decorativas do piso também são gerados em Rust; a sequência aleatória permanece equivalente à implementação JavaScript.
- Sombras de paredes/móveis, faces/contornos de paredes e detalhes de postes agora são emitidos por Rust; comandos do piso são enviados ao host em lotes de até 4.096.
- Renderer original permanece como padrão/fallback; o compositor `paintMap`, jogadores, geometria de personagens, portas, armas, efeitos e HUD continuam parcialmente em JavaScript, portanto migração integral ainda pendente.
- Regressões do jogo (57/57), ABI WASM, paridade de piso/mapa e integração Canvas simulada aprovadas. Captura headless abriu fase 1 “Apartamento”, com renderer ativo e zero exceções JS; benchmark de FPS pendente.
- Nenhum commit ou push foi feito.

## v55.0 — 05/11/2026
- Allowlists explícitas para 18 mapas fixos, 2 grades e 61 mapas Neon; Apartamentos voltou porque sua resolução é somente dado interno.
- Títulos do seletor Neon não exibem dimensões. Trailer, salas de teste e protótipos ficam fora da seleção; as mesmas regras protegem a progressão.
- Campanha base reorganizada pela numeração já existente, sem criar fases para capítulos ausentes; dúvida das datas contraditórias documentada em MAP_AUDIT.md.
- Zona lógica de saída Neon busca ponto livre próximo quando o objeto de carro está fora do piso; dados fonte e geometria dos mapas não são alterados.
- Regressões de allowlist, história, spawns, colisões e saídas; node tests/regression.cjs: 57/57. Sem validação visual nem medição de FPS nesta iteração.
- Cache offline e endpoint /api/health avançaram para v55.0.

## v54.0 — 05/11/2026
- Corrigido fogo amigo local: cada projétil de jogador registra P1/P2 como origem; com a opção ligada, pode ferir somente o parceiro e consome o projétil no impacto.
- Com fogo amigo desligado, projéteis não atingem o parceiro. Projéteis de inimigos e alvos de inimigos permanecem inalterados.
- Adicionada regressão cobrindo origem dos projéteis, toggle, jogador morto e distância; suíte 55/55.
- Cache offline e endpoint `/api/health` avançaram para v54.0.
- Não houve medição de FPS nem validação visual do fogo amigo nesta iteração.
## v53.0 — 05/11/2026
- Corrigido bug reproduzido em Chromium: a geração Neon podia deixar inimigos e armas sobre colisores sólidos. Agora `neonSafePoint` procura piso livre próximo e, em layouts densos, o ponto livre mais próximo no mapa, respeitando limites e distâncias de segurança.
- A colisão do piso é preparada antes de validar atores. Entidades sem local livre não são criadas em posição inválida.
- Revarredura em navegador: 72 mapas, 720 inimigos, 84 armas no chão, zero spawns sobre paredes; sem exceções JavaScript.
- Regressão agora valida jogador, cada inimigo e cada arma em todos os mapas Neon. Suíte: 54/54.
- Cache offline e endpoint de saúde atualizados para v53.0. Sessões completas, online real e FPS continuam sem validação.

## v52.0 — 05/11/2026
- Quatro skins cosméticas selecionáveis são persistidas em `settings.skin` no save v2; seleção independente de personagem/máscara, sem atributos ou desbloqueios alterados.
- A paleta cosmética colore o sprite procedural e fornece acentos visuais no spritesheet existente, sem assets externos.
- Ícones de armas receberam contorno, reflexo, juntas e detalhes próprios para armas curtas, longas e revólveres; arma compartilhada agora também é desenhada para P2.
- Fallback procedural de personagem reutiliza até 128 sprites em cache por estado/fase/skin, reduzindo novas alocações Canvas quando o spritesheet não carrega.
- Corrigido bug reproduzido no navegador: portas fechadas isolavam as salas dos pontos de spawn da fase 1; com zero inimigos, a sala terminava sozinha. Corredor central participa dos spawns e `allClear` exige contagem inicial positiva.
- Corrigido spawn dentro de parede no mapa fixo boate-b. Todos os 17 mapas fixos foram montados em Chromium e os spawns resultantes passaram em `hitWall`.
- 54/54 regressões automatizadas passaram. Chromium confirmou estado `play`, nível 1 e 8 inimigos; campanha completa e multiplayer real seguem sem teste manual.

## v51.0 — 05/11/2026
- Spawns de inimigos e pickups em modos cooperativos agora usam o jogador vivo como referência de distância e navegação; P2 não fica sem reforços por causa da posição de P1 morto.
- Regressão adicionada para impedir regressão desse comportamento.
- 50/50 regressões automatizadas aprovadas.

## v50.0 — 05/11/2026
- Campanha em tiles agora força `tileIdx=0` ao iniciar e bloqueia callbacks de avanço de uma fase antiga; a primeira fase não é pulada.
- Removido o reinício por R do input, pausa, HUD, traduções e painel de debug.
- Filtro de mapas exclui protótipos equivalentes a 640×580 nos mapas fixos e Neon; capítulo que apontava para o mapa removido foi redirecionado para um mapa válido.
- Auditoria de dimensões, portas, salas, spawns e saídas adicionada em `docs/MAP_AUDIT.md`.
- 49/49 regressões automatizadas aprovadas.

## v49.0 — 05/11/2026
- Corrigida a colisão das portas em mapas procedurais: a solução agora é reconstruída com portas abertas/fechadas incluídas.
- Corrigido vazamento de portas entre mapas fixos: a lista é resetada antes de montar cada mapa.
- Regressão adicionada para garantir portas próprias e sem estado antigo em todos os construtores.

## v48.0 — 05/11/2026
- Corrigido o bug de paredes no lugar de portas: cada abertura dos mapas procedurais e fixos agora cria uma porta com caixa de colisão e desenho dimensionado pelo vão.
- 47/47 regressões automatizadas aprovadas.

## v47.0 — 05/11/2026
- IA e mira cooperativas agora selecionam o jogador vivo mais próximo; P1 morto deixa de ser alvo obrigatório enquanto P2 continua na partida.
- Erros de script e promises são capturados desde o primeiro bloco inline e entregues ao painel de depuração.
- Removido passe duplicado de audição no loop principal.
- 45/45 regressões automatizadas aprovadas.

## v46.0 — 05/11/2026
- Adicionadas janelas quebráveis aos mapas gerados; tiros e golpes próximos removem a colisão, emitem ruído e deixam estilhaços temporários.
- Mapas Neon agora recebem perímetro visual e físico completo, corrigindo mapas distribuídos sem parede externa, incluindo o cenário do trailer.
- Silhuetas das armas antigas ganharam componentes distintos (coronha, carregador, mira, tambor e canos), reduzindo a aparência repetida no chão e na mão.
- O ajuste automático de desempenho informa a redução de efeitos por toast discreto, sem banner central durante a ação.
- 44/44 regressões automatizadas aprovadas; servidor real bloqueado pela política de loopback deste ambiente.

## v45.0 — 04/11/2026
- Save de formato futuro continua protegido contra escrita e agora mostra aviso persistente de modo protegido na abertura.
- Estado somente leitura exposto por `EXP.saveReadOnly()`; regressão cobre o contrato e o texto apresentado.
- 44/44 regressões automatizadas aprovadas.

## v44.0 — 04/11/2026
- Governador adaptativo usa tempo de quadro real e reduz efeitos decorativos quando a média fica lenta, sem substituir o preset salvo.
- Poeira, chuva, névoa, luzes e partículas respeitam o nível de desempenho atual; cápsulas já são desenhadas em lote.
- 43/43 regressões automatizadas aprovadas; sem benchmark visual de navegador.

## v43.0 — 04/11/2026
- “Jogar Solo” desativa e limpa o multiplayer persistido antes de abrir a seleção de máscara; P2 não é criado em partida normal.
- Escala automática de resolução limitada e partículas simples agrupadas para reduzir custo do Canvas.
- 42/42 regressões automatizadas aprovadas.

## v42.0 — 04/11/2026
- Multiplayer: estado de rede/latência aproximada e idade do último avatar visíveis no lobby; código pode ser copiado.
- Snapshots antigos são ignorados e avatar remoto desaparece após 5 s sem atualização; não fica preso numa posição desatualizada.
- Acessibilidade: “reduzir flashes” suprime relâmpagos e cintilações no módulo de efeitos.
- 40/40 regressões automatizadas aprovadas; sem teste multiplayer em rede real.

## v41.0 — 04/11/2026
- Avatar online deixou de ser recriado em cada atualização; movimento e rotação agora são interpolados suavemente entre estados recebidos.
- Lobby mostra quantos jogadores estão em partida e explica a necessidade de escolher o mesmo modo/mapa, além dos limites de sincronização atuais.
- 40/40 regressões automatizadas aprovadas, incluindo movimento interpolado, expiração stale, limite de revisão, latência, cópia do código e flashes reduzidos.
- Sem teste de rede entre dois navegadores nesta sessão.

## v40.0 — 04/11/2026
- Renderização final agora respeita o antialiasing e nível de qualidade selecionados, sem forçar suavização alta a cada quadro.
- Adicionada intensidade ajustável e persistente de tremor da câmera (0–100%).
- Abas e controles refinados para foco de teclado e telas estreitas.
- 39/39 regressões automatizadas aprovadas; sem validação gráfica em navegador nesta sessão.

## v39.0 — 04/11/2026
- Recarga automática obedece à preferência desligada por padrão; recarregar manualmente com C continua disponível.
- Volume mestre integrado aos ganhos de música e efeitos.
- Abas de opções agora seguem navegação por teclado e vínculos ARIA de tablist/tabpanel.
- 38/38 regressões automatizadas aprovadas; validação de navegador real pendente.

## v38.0 — 04/11/2026
- Lobby passa a listar salas desta instância em `/api/rooms`, com nomes, ocupação, estado e botão de entrada; atualização automática a cada 5 s e atualização manual.
- Listagem pública não inclui credenciais; salas sem jogadores/inativas são removidas ao consultar a lista.
- Sala com jogador vivo em partida ativa fica indisponível para entrada tardia, tanto por lista quanto por código, porque o estado de mapa/combate não é sincronizado. Cartões distinguem lotação de partida ativa.
- Heartbeat inativo por 60 s limpa o indicador de partida e libera a vaga sem invalidar a sessão de retorno; expiração total continua em cinco minutos.
- Preferências locais e multiplayer agora aceitam apenas chaves conhecidas e valores válidos para o tipo/faixa/opção; saves de configuração danificados voltam aos padrões somente nos campos inválidos.
- Controle de zoom inclui o padrão 0,9x e mantém a seleção correspondente ao jogo.
- Adicionada colisão de perímetro compartilhada por hitWall/hitWallNG/aabbHitsWall para impedir que atores saiam dos limites do mundo ou usem coordenadas inválidas.
- Ajustados os pontos iniciais das salas Neon ao raio do jogador; unstick procura posição livre se a correção encostar em obstáculo.
- Service worker/cache e identificação visual atualizados para v39.0.
- CSS da lista adaptado a telas pequenas; testes de entrada/status, presença expirada, configurações inválidas, colisão das quatro bordas e spawns reais livres nos 72 mapas Neon jogáveis. 36/36 regressões aprovadas.
- Limite: lista apenas salas no servidor que o navegador já acessou; multiplayer segue como relay de posição, sem co-op autoritativo.

## v37.0 — 04/11/2026
- Segurança: IDs públicos separados de tokens de sessão; token só passa no cabeçalho Authorization e não aparece no estado da sala ou na URL.
- Robustez do lobby: recuperação após reload, botão sair, retry progressivo, limpeza de participantes ociosos e um long poll pendente por jogador.
- Validação HTTP: tamanho, content-type, JSON/objetos, tipos e valores; rate limit de posição; proteção realpath e captura de erros ao servir arquivos.
- Estado do jogador é publicado como inativo fora de partida; reduz atualizações repetidas do DOM.
- 30/30 regressões aprovadas, incluindo rotas HTTP e entrega de index via harness sem socket. TCP e navegação real seguem pendentes.

## v36.0 — 04/11/2026
- Menu: corrigida versão visível que ainda dizia v30; ação online e lobby responsivo por código adicionados.
- Servidor Node.js sem dependências: servir jogo por HTTP, criar/entrar salas limitadas a dois, autenticação por token, validação de payload e estado com long polling.
- Clientes retransmitem presença e posição; avatar remoto é desenhado e a câmera usa foco médio.
- Service worker atualizado para cappe-v36.0 e inclui `js/exp-online.js`.
- Cache offline ignora `/api/`, evitando que respostas antigas do lobby sejam servidas como estado atual.
- Cobertura automatizada das regras internas do servidor: criação/entrada, lotação, relay e autorização. Smoke test HTTP e experiência em rede real seguem pendentes por bloqueio de loopback no ambiente.
- Limite: simulação, combate, inimigos, mapa e progresso não são sincronizados; ambas as pessoas iniciam o mesmo mapa manualmente.

## v34.0 — 04/11/2026
Base: distribuição denominada v30, cujo README já continha v31/v32/v33. Não alterado o formato de save v2.

| Alteração | Arquivos | Validação |
| --- | --- | --- |
| Encaminhar alvo de dano através do wrapper visual | js/exp-fx.js | Teste com hit real, colete P1/P2 e mortes independentes |
| WASD P1 em coop; ponto P2 exclusivo para soco | index.html, js/exp-multi.js | Teclado, separação, perfil solo/setas e vetor numpad |
| Validar saves, proteger backups e reportar falhas de importação | js/exp-core.js | Dados parciais/legados/futuros, corrupção, quota, protótipos, reset |
| Separar recarga de arma e restauração de backup | js/exp-core.js, js/exp-ui.js | Memória, disco e backup trocados corretamente |
| Manifesto de 106 arquivos existentes, cache isolado por escopo e fallback de navegação | sw.js | Manifesto, scripts/CSS, simulação de instalação/ativação/fetch |
| Documentação persistente, testes e microbenchmark | AGENTS.md, docs/*, tests/*, README.md | 29 testes PASS; resultados e inventário registrados |

Riscos/limites: partidas e instalação real do SW ainda não validadas; leitura mais estrita rejeita saves estruturalmente inválidos; APIs de save renomeadas têm todos os consumidores encontrados atualizados. Multiplayer ainda tem pendências anteriores, especialmente morte P1, alvo IA e inventário P2. Nenhum asset foi removido; nenhum ajuste de balanceamento aplicado.

## v35.0 — 04/11/2026

- Ciclo de vida do cooperativo: morte marca ambos os jogadores, bloqueia input de P1 morto e usa P2 vivo para alcançar a saída. Reinício de sala restaura os estados.
- Spawn de P2 testa até 64 posições em 4 distâncias, livres de colisões e conectadas; sem espaço notifica e evita spawn inválido.
- Ações P2 passam por fireOk/onFire, respeitam personagem sem armas, atualizam precisão e oferecem troca/descarte com arma compartilhada.
- Service worker atualizado para cappe-v35.0.
- 29/29 testes automatizados passaram. Não foi possível validar partidas reais nesta rodada.

## Preview local v112.0 — 06/11/2026
- Tremores de quadro agora passam por dois lotes Rust separados segundo os escopos originais do Canvas: screen shake externo ao save interno; kick e camera shake dentro dele. Amostragem aleatória e decaimento dos timers continuam no JS.
- Build Rust/WASM: **153.741 bytes**. ABI, browser bridge e regressões **67/67 passaram**. Smoke Chromium em Apartamento: 24 transformações acumuladas e zero exceções; câmera, inimigos e barris também ativos. Captura inspecionada; sem comparação ampla ou medição de desempenho.

## Preview local v113.0 — 06/11/2026
- O enquadramento da câmera e o zoom do mundo agora são calculados no terceiro estágio do batch Rust: centro da tela, escala, centro inverso e deslocamento de câmera. O host executa a sequência Canvas; o fallback JS e os escopos de save/restore permanecem.
- Build Rust/WASM: **154.462 bytes**. ABI, browser bridge e regressões **67/67 passaram**. Smoke Chromium em Apartamento mostrou o renderer ativo e zero exceções; captura inspecionada. Sem comparação visual ampla ou medição de desempenho.

## Preview local v114.0 — 06/11/2026
- O desenho de vidros intactos, reflexos móveis e estilhaços agora gera lotes Rust a partir do estado já mantido no JS, usando buffers fixos e paleta existente; fallback original permanece.
- Build Rust/WASM: **160.939 bytes**. ABI e browser bridge passaram; regressões **68/68 passaram**. Smoke Chromium integrado em Apartamento chamou o batch de vidro 172 vezes, mostrou painel/estilhaço e registrou zero exceções; captura inspecionada. Sem comparação ampla ou FPS.

## Preview local v115.0 — 06/11/2026
- Rust agora emite em lote a geometria da barra de vida de chefes: fundo, preenchimento proporcional, marcadores de fase, contorno e ordem de pintura. A posição do título também passa pelo batch Rust existente de textos HUD; o host mantém cor, conteúdo e rasterização, e o JavaScript preserva estado do chefe e fallback.
- Build Rust/WASM: **162.121 bytes**. ABI e browser bridge passaram; regressões **68/68 passaram**. Smoke sintético no Chromium chamou a barra com o renderer `ready`, sem exceções JavaScript; sem comparação visual ampla ou medição de desempenho.

## Preview local v116.0 — 06/11/2026
- O indicador de direção da zona de Invasão agora envia ao Rust seu centro e rotação; Rust transforma os três vértices e o host rasteriza o triângulo rosa com o painter original disponível como fallback.
- Build Rust/WASM: **162.668 bytes**. ABI, browser bridge e regressões **68/68 passaram**. Sem comparação visual ampla ou medição de desempenho.

## Preview local v117.0 — 06/11/2026
- A barra de recarga da arma agora usa o batch de formas HUD do Rust, que emite fundo e preenchimento proporcional; as cores e o texto continuam no host, com o painter JS como fallback.
- Build Rust/WASM: **162.939 bytes**. ABI, browser bridge e regressões **68/68 passaram**. Sem medição de desempenho.

## Preview local v118.0 — 06/11/2026
- Títulos e subtítulos de até três avisos temporários são coletados em ordem e validados pelo Rust, que determina suas posições/alfa; o host conserva cache `tx()` e rasterização, e JS mantém timers/fallback.
- Build WASM permanece com **162.939 bytes**. ABI, browser bridge e regressões **68/68 passaram**. Smoke em Chrome exercitou `EXP.drawHUD`, enviou dois textos ao batch, mostrou título/subtítulo e registrou zero exceções; captura inspecionada. Sem comparação ampla ou medição de desempenho.

## Preview local v119.0 — 06/11/2026
- O rótulo do modo/objetivo ativo envia texto, cor, posição, alinhamento e fonte ao batch Rust existente. A lógica de seleção do rótulo e o painter de fallback continuam no JS; rasterização de texto pelo `tx()` cacheado permanece no host.
- O binário não mudou. ABI, browser bridge e regressões **68/68 passaram**. Smoke Chromium chamou `EXP.drawHUD` com estado sintético de Horda e um aviso; três textos chegaram ao batch sem exceções. Captura inspecionada; sem comparação ampla ou medição de desempenho.

## Preview local v120.0 — 06/11/2026
- O flash vermelho de tela nos últimos 15 segundos do Contrarrelógio envia sua alfa ao batch de efeitos HUD do Rust; JavaScript continua calculando a oscilação temporal e mantém o fallback.
- Build Rust/WASM: **163.095 bytes**. ABI, browser bridge e regressões **68/68 passaram**. Sem comparação visual ampla ou medição de desempenho.

## Preview local v121.0 — 06/11/2026
- Os textos do pente, progresso e rótulo de recarga, incluindo o aviso para pressionar C, usam o batch Rust de textos HUD. Estado da arma e condições de exibição continuam JS; o host mantém `tx()` e painter fallback.
- Build WASM inalterado (163.095 bytes); ABI, browser bridge e regressões **68/68 passaram**. Smoke Chromium chamou `EXP.drawHUD` com pente/recarga sintéticos; dois textos chegaram ao batch com zero exceções. Captura inspecionada; sem comparação ampla ou FPS.

## Preview local v122.0 — 06/11/2026
- Título, resultado e atalho de retorno do resumo de pausa em modos enviam posição/alfa pelo batch Rust de texto HUD; conteúdo e fallback continuam JS.
- Binário WASM inalterado. ABI, browser bridge e regressões **68/68 passaram**. Smoke Chromium chamou `EXP.drawHUD` em pausa sintética: quatro textos chegaram ao batch, sem exceções JavaScript. Sem comparação visual ampla ou medição de desempenho.


## Preview local v132.0 — 07/11/2026
- Textos do dealer, cards, reroll e balão do vendedor agora são enviados em lote pelo batch HUD Rust; o painter JavaScript segue como fallback.
- `wrapText` reutiliza o resultado para texto/fonte iguais; o alpha absoluto do rótulo de carta vendida é preservado.
- Regressões completas **75/75 passaram**; `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs` passaram. WASM não precisou ser recompilado. Sem smoke runtime válido, comparação visual ou benchmark nesta versão.


## Preview local v160.0 — 07/11/2026
- O batch Rust de poeira passou a salvar/restaurar o contexto; a atribuição host de globalAlpha no fim de cada quadro deixa de ser necessária em runtime normal.
- Chrome 156: paridade RGBA de poeira exata, alpha restaurado a 1 e nenhum setter residual globalAlpha no smoke. Regressões 82/82, checks ABI/browser e pixel parity passaram. Build direto 138.078 bytes WASM + 31.452 bytes glue. Sem benchmark ou inspeção ampla.

## Preview local v170.0 — 07/11/2026
- Flashes de disparo e arcos de impacto agora tentam rasterização no módulo Rust direto; imagem de muzzle e dados de efeito continuam preparados no host.
- Chrome 156 confirmou callback integrado e paridade RGBA exata para muzzle/impacto; estado de composição restaurado. Build direta 153.386 bytes WASM + glue 37.706 bytes; regressões 82/82.
- Renderer permanece híbrido. Sem benchmark, revisão visual ampla ou campanha completa.

## Preview local v171.0 — 07/11/2026
- O callback dos estojos usa o painter Rust direto para rasterizar as elipses projetadas; projeção e fallback continuam compatíveis.
- Chrome 156 confirmou chamada integrada e paridade RGBA exata, incluindo restauração de alpha/composição. Build direta 154.105 bytes WASM + glue 38.200 bytes; regressões 82/82.
- Renderer segue híbrido. Sem benchmark, revisão visual ampla ou campanha completa.

## Preview local v172.0 — 07/11/2026
- O texto animado do combo agora tenta desenho no painter Rust direto; o número, pulso e formatação seguem calculados no WASM legado/JS.
- Chrome 156 confirmou callback integrado e paridade RGBA exata, incluindo restauração do estado Canvas. Build direta 154.919 bytes WASM + glue 38.768 bytes; regressões 82/82.
- Renderer segue híbrido. Sem benchmark, revisão visual ampla ou campanha completa.

## Preview local v173.0 — 07/11/2026
- O callback do rótulo de alarme agora tenta desenho pelo painter Rust direto; tempo, posição, conteúdo e fallback seguem compatíveis.
- Chrome 156 confirmou callback integrado e paridade RGBA exata. Build direta 155.645 bytes WASM + glue 39.337 bytes; regressões 82/82.
- Renderer segue híbrido. Sem benchmark, revisão visual ampla ou campanha completa.

## Preview local v174.0 — 07/11/2026
- Imagens selecionadas do HUD agora tentam desenho pelo painter Rust direto; seleção, coordenadas, tamanho e fallback permanecem compatíveis.
- Chrome 156 confirmou callback integrado e paridade RGBA exata. Build direta 156.255 bytes WASM + glue 39.762 bytes; regressões 82/82.
- Renderer segue híbrido. Sem benchmark, revisão visual ampla ou campanha completa.

## Preview local v175.0 — 07/11/2026
- O callback de projéteis agora tenta rasterização direta no painter Rust, preservando ordem, sprites do proprietário, posições e fallback.
- Chrome 156 confirmou callback integrado e paridade RGBA exata. Build direta 156.945 bytes WASM + glue 40.209 bytes; regressões 82/82.
- Renderer segue híbrido. Sem benchmark, revisão visual ampla ou campanha completa.

## Preview local v181.0 — 07/11/2026
- Cópia ao canvas de texto já cacheado encaminhada ao módulo Rust direto; mantém o cache e fallback. Chrome confirmou paridade RGBA exata e estado do canvas; regressões 83/83. Sem benchmark ou revisão visual ampla.

## Preview local v182.0 — 07/11/2026
- Lote de retângulos do piso legado agora usa `drawFloorCommands` Rust direto; fallback mantido. Chrome 156 registrou 47 chamadas durante `newGame` e igualdade RGBA no caso sintético. Regressões 84/84. Sem benchmark.

## Preview local v182.0 — 07/11/2026
- Lote de retângulos do piso legado agora usa `drawFloorCommands` Rust direto; fallback mantido. Chrome 156 registrou 47 chamadas durante `newGame` e igualdade RGBA no caso sintético. Regressões 84/84. Sem benchmark.

## Preview local v181.0 — 07/11/2026
- Cópia ao canvas de texto já cacheado encaminhada ao módulo Rust direto; cache e fallback mantidos. Chrome confirmou paridade RGBA e estado do canvas; regressões 83/83. Sem benchmark ou revisão visual ampla.

## Preview local v183.0 — 07/11/2026
- Contornos de atores em cenas escuras agora tentam o painter Rust direto; o WASM legado conserva projeção/seleção e fallback. Chrome comparou os dois caminhos: dois contornos, zero diferença RGBA, estado do contexto restaurado. Regressões 85/85. Sem revisão visual ampla ou benchmark.

## Preview local v184.0 — 07/11/2026
- Leitura de texturas pequenas do piso/mapa via `HTMLCanvasElement` e `HTMLImageElement` agora chama WebSys/Rust, mantendo os bytes, o compositor legado e o fallback Canvas. Chrome 156 confirmou 0 diferenças nos dois tipos, rejeição de dimensão inválida e 5 chamadas diretas na cena de teste. Build Rust/WASM passou; regressões 85/85; o teste de paridade de mapa/piso também passou dentro das tolerâncias documentadas. Sem benchmark ou revisão visual ampla.

## Preview local v185.0 — 07/11/2026
- Compositor RGBA de paredes, móveis e portas passou do WASM legado para Rust/WebSys direto, com a rota antiga como fallback. Em mapa de 1440×900 houve zero diferença de canal frente ao compositor anterior e duas chamadas diretas observadas; a comparação Canvas existente segue com max 76/255 e média 0,001947/255. Build passou; regressões 85/85, parity direta, teste de piso/mapa e as mesmas validações no ZIP extraído passaram. Sem benchmark ou revisão visual ampla.

## Preview local v186.0 — 07/11/2026
- O caminho direto passou a montar os oito sprites em buffer JavaScript sem consultar/copiar os buffers de textura do WASM legado; o fallback ainda copia à tabela antiga. Chrome comparou compositor direto e fallback com 0 diferenças de canal; regressões 85/85 e testes no ZIP extraído passaram. Sem benchmark ou validação visual ampla.

## Preview local v205.0 — 07/11/2026
- Rasterização das 16 artes procedurais novas de máscaras portada para Rust/WebSys, com regeneração após o carregamento do WASM e fallback Canvas. Chrome comparou as 16 imagens com zero canais RGBA diferentes; regressões 88/88, renderer, browser bridge e teste focado passaram. Sem benchmark; a migração ainda é híbrida.

## Preview local v206.0 — 07/11/2026
- Corrigidas cores e detalhes dos ícones Rust das armas novas para coincidir com o renderer JS. Chrome comparou 12 armas: zero canais RGBA divergentes e estado do Canvas preservado. Regressões 89/89, renderer, browser bridge e testes focados passaram também no ZIP extraído. Sem benchmark; renderer segue híbrido.

## Preview local v207.0 — 07/11/2026
- A barra de vida/fases do chefe passou do batch legado e callback Canvas para o painter Rust/WebSys direto. Chrome comparou a barra completa com zero diferenças RGBA; alpha, composição e transformação preservados. No ZIP extraído, regressões 90/90, renderer, browser bridge e comparação Chrome passaram. Sem benchmark; renderer segue híbrido.
## Preview local v252.0 — 08/11/2026
- Removidas do WASM legado as rotas de FX, pickups, arremessos e sprite de muzzle. O módulo caiu 2.430 bytes (175.625 → 173.195), imports 31 → 27 e exports 134 → 127; seis buffers fixos de 8192 itens (~1,88 MiB) foram eliminados. Rust direto pinta clarões com gradiente radial idêntico ao Canvas; no Chrome, FX teve zero diferenças RGBA, e pickup glow ligado/desligado e 24 armas arremessadas também tiveram zero diferenças. Build, ABI, browser bridge, regressões 102/102 e paridade ampla passaram. Sem benchmark nem revisão visual manual; não publicado no GitHub.

## Preview local v253.0 — 08/11/2026
- Color grade e overlays finais usam somente os painters Rust/WebSys diretos; callbacks, buffers e exports correspondentes foram removidos do WASM legado. Canvas em `index.html` continua como fallback se o painter direto não estiver disponível.
- Tamanho do módulo legado: 171.986 bytes; 25 imports e 123 exports (v252: 173.195 bytes, 27 imports, 127 exports). Regressão 102/102, ABI, browser bridge, paridade direta e parity de piso passaram. Sem benchmark ou validação visual manual ampla.
## Preview local v254.0 — 08/11/2026
- Combo e alarme passaram a usar somente os painters Rust/WebSys diretos. Foram removidos do WASM legado os respectivos callbacks, buffers, imports e exports; os painters originais de gameplay seguem como fallback.
- WASM legado: 171.027 bytes, 23 imports, 119 exports (v253: 171.986 bytes, 25 imports, 123 exports). Build, regressão 102/102, ABI, browser bridge, paridade direta e piso passaram; os dois textos tiveram zero diferenças RGBA contra os painters Canvas originais nos casos testados. Sem benchmark ou revisão visual manual ampla.
## Preview local v255.0 — 08/11/2026
- Vinhetas e imagens de HUD passaram a ser selecionadas e desenhadas pelo painter Rust/WebSys direto. O batch, callback e armazenamento de entrada/saída equivalentes foram removidos do WASM legado; as rotinas Canvas do jogo continuam como fallback.
- WASM legado: 170.183 bytes, 22 imports e 117 exports (v254: 171.027 bytes, 23 imports e 119 exports). Build, regressão 102/102, ABI, bridge, paridade direta e piso passaram. Cinco etapas de imagem do HUD: zero diferenças RGBA. Sem benchmark ou revisão visual manual ampla.
## Preview local v256.0 — 08/11/2026
- A seta da Invasão usa somente o painter Rust/WebSys direto; o batch legado de vértices foi removido e o chamador mantém o fallback Canvas.
- WASM legado: 169.636 bytes, 21 imports, 115 exports (v255: 170.183 bytes, 22 imports, 117 exports). Build, regressões 102/102, ABI, bridge, comparações Chrome da seta, paridade direta e piso passaram. Sem benchmark ou revisão visual manual ampla.
## Preview local v257.0 — 08/11/2026
- O marcador pulsante da zona de Invasão agora usa somente o painter Rust/WebSys direto; removidos callback, buffers e exports legados, mantendo o painter Canvas do gameplay como fallback.
- WASM legado: 168.837 bytes, 20 imports e 112 exports (v256: 169.636 bytes, 21 imports e 115 exports). Build, regressões 102/102, ABI, bridge, paridade direta e piso passaram. O teste Chrome comparou a zona ao Canvas original com zero diferenças RGBA. Sem benchmark ou revisão visual manual ampla.

## Preview local v258.0 — 08/11/2026
- Escadas e elevadores passaram ao painter Rust/WebSys direto; foram removidos do WASM legado o gerador de comandos, a entrada, os buffers e os dois callbacks/imports. O jogo preserva o painter Canvas como fallback.
- WASM legado: 163.672 bytes, 18 imports e 109 exports (v257: 168.837 bytes, 20 imports e 112 exports). Regressão 102/102; ABI, browser bridge, paridade direta de escadas/elevadores e piso passaram. Os casos comparados no Chrome tiveram zero diferenças RGBA. Sem benchmark ou revisão visual manual ampla.

## Preview local v259.0 — 08/11/2026
- Névoa/fumaça agora usa o painter Rust/WebSys direto. Removidos os buffers, exports e callback do batch de fog do WASM legado, mantendo o fallback Canvas do jogo.
- WASM legado: 162.701 bytes, 17 imports e 106 exports (v258: 163.672 bytes, 18 imports e 109 exports). Build, regressão 102/102, ABI, browser bridge, paridade dos efeitos e piso passaram; zero diferenças RGBA nos casos comparados. Sem benchmark ou revisão visual manual ampla.
## Preview local v260.0 — 08/11/2026
- Chuva e poeira agora passam pelos painters Rust/WebSys diretos; callbacks, buffers e exports redundantes foram removidos do WASM legado. A simulação e o painter Canvas de fallback continuam no JavaScript.
- WASM legado: 161.040 bytes, 15 imports, 100 exports (v259: 162.701 bytes, 17 imports, 106 exports). Regressão 102/102, ABI, browser bridge e paridade Chrome passaram; chuva e poeira tiveram zero diferenças RGBA. Sem benchmark nem revisão visual manual ampla.

## Preview local v261.0 — 08/11/2026
- Barris, câmeras e realces/telegráficos de inimigos agora usam painters Rust/WebSys diretos. Removidos do WASM legado três batches e seis exports; fallback Canvas mantido.
- WASM legado: 146.123 bytes, 15 imports e 94 exports (v260: 161.040 bytes, 15 imports e 100 exports). Build, regressão 102/102, ABI, browser bridge e paridade Chrome passaram; zero diferenças RGBA nos efeitos comparados. Sem benchmark nem revisão visual manual ampla.

## Preview local v262.0 — 08/11/2026
- Luzes de mundo e anéis animados agora usam apenas painters Rust/WebSys diretos; removidos do WASM legado dois callbacks e sete exports. Fallback Canvas do jogo mantido.
- WASM legado: 142.552 bytes, 13 imports e 87 exports (v261: 146.123 bytes, 15 imports e 94 exports). Build, regressão 102/102, ABI, browser bridge e paridade Chrome passaram; zero diferenças RGBA nos casos comparados. Sem benchmark nem revisão visual manual ampla.

## Preview local v263.0 — 08/11/2026
- Overlays FX de tela usam painters Rust/WebSys diretos; removidos um callback e três exports do WASM legado. Fallback Canvas e lógica JS preservados.
- WASM legado: 140.548 bytes, 12 imports e 84 exports (v262: 142.552 bytes, 13 imports e 87 exports). Build, regressão 102/102, browser bridge e paridade Chrome passaram; zero diferenças RGBA nos casos comparados. Sem benchmark nem revisão visual manual ampla.

## Preview local v264.0 — 08/11/2026
- Saída de fase e gradiente usam painters Rust/WebSys diretos; removidos dois callbacks, buffers e três exports do WASM legado. Painter Canvas do jogo mantido como fallback.
- WASM legado: 138.556 bytes, 10 imports e 81 exports (v263: 140.548 bytes, 12 imports e 84 exports). Foram liberados 1.742.400 bytes de memória linear estática. Build, regressão 102/102, browser bridge e paridade Chrome passaram; zero diferenças RGBA nos casos comparados. Sem benchmark nem revisão visual manual ampla.

## Preview local v266.0 — 08/11/2026
- Setup do Canvas raiz e fundo do quadro usam painters Rust/WebSys diretos; removidos dois callbacks de host e dois exports do WASM legado. O jogo mantém os mesmos caminhos Canvas como fallback.
- WASM legado: 134.896 bytes, 8 imports e 78 exports (v265: 135.898 bytes, 10 imports e 80 exports). Build, regressão 102/102, browser bridge e paridade Chrome passaram; paridade de pixels e estado do Canvas nos casos comparados. Sem benchmark nem revisão visual manual ampla.

## Preview local v267.0 — 08/11/2026
- Screen shake, recoil e câmera aplicam transformações por Rust/WebSys direto; removidos o buffer e dois exports do WASM legado. O Canvas original do jogo continua como fallback.
- WASM legado: 132.404 bytes, 8 imports e 76 exports (v266: 134.896 bytes, 8 imports e 78 exports). Build, regressão 102/102, ABI, browser bridge e paridade Chrome passaram; transforms, sequência de save/restore e entradas inválidas foram conferidos. Sem benchmark nem revisão visual manual ampla.

## Preview local v268.0 — 08/11/2026
- Sombra e aura de jogador usam painter Rust/WebSys direto; removido o export `draw_player_aura` do WASM legado. O fallback Canvas original segue disponível se o painter direto falhar.
- WASM legado: 132.196 bytes, 8 imports e 75 exports (v267: 132.404 bytes, 8 imports e 76 exports). Regressão 103/103, ABI, browser bridge, Chrome e paridade de pixels passaram; aura teve zero diferenças RGBA. Sem benchmark ou revisão visual manual ampla.
## Preview local v285.0 — 08/11/2026
- Inimigos agora usam Rust/WebSys direto para sombra, corpo/spritesheet, efeitos de atordoamento e composição dos labels; removidos buffers, exports e callbacks gráficos do renderer WASM legado para essa rota. Fallback Canvas do jogo continua disponível.
- Build passou; regressão 104/104, ABI, browser bridge, paridade direta e auditoria Chrome passaram. No frame combinado, inimigo, jogador, armas, fantasmas e aura coincidiram em RGBA; spritesheet e transições de estado foram conferidos separadamente, com tolerância máxima de 3 níveis em até 8 canais para antialias de stun.
- WASM legado caiu de 21.157 para 8.887 bytes e de 27 para 11 exports (2 imports). Migração integral continua pendente; sem benchmark ou revisão visual manual ampla. Nada publicado no GitHub.

## Preview local v286.0 — 08/11/2026
- Frames procedurais e seleção de sprites já não dependem do WASM legado. Rust/WebSys direto é tentado primeiro; se não puder desenhar, `buildPlayerFrame` e os seletores originais do jogo fazem fallback em JavaScript/Canvas.
- Removidos do módulo legado o rasterizador procedural de jogadores, buffers de pixels/paleta e seletores de frames. Restam o trampoline/contadores das operações Canvas ainda não portadas. Build passou; regressão 104/104, ABI, browser bridge, paridade direta e Chrome passaram. Seis frames procedurais deram paridade RGBA exata contra o fallback original.
- WASM legado caiu de 8.887 para 754 bytes e de 11 para 6 exports (2 imports). Migração integral pendente; sem benchmark ou revisão visual manual ampla. Nada publicado no GitHub.

## Preview local v287.0 — 08/11/2026
- Build passa a compilar e empacotar apenas `wasm-renderer-direct`; o antigo trampoline Canvas deixou de ser compilado, servido e pré-cacheado.
- O bridge aplica wrappers de diagnóstico às APIs Canvas só com `wasmDiagnostics=1`, reduzindo overhead de instrumentação no modo comum.
- Regressões 104/104; ABI/WASM direto: 113 exports e 107 imports de Web APIs; browser bridge passou. Paridade direta e teste de pixels no Chrome passaram nos casos cobertos. Piso: 347.083 canais diferentes, máximo 3 e média 0,188; textura de mapa: 240 canais, máximo 76, média 0,00195. Essas medições mostram tolerância não-zero, não equivalência visual perfeita.
- Fallback Canvas ainda permanece em camadas não portadas. Sem benchmark FPS, sessão longa ou inspeção visual ampla; não publicado no GitHub.

## Preview local v288.0 — 08/11/2026
- Resumo da pausa (retângulo escuro de estatísticas da partida) migrou ao stage 4 do painter `drawHudShape` Rust/WebSys; fallback Canvas preservado.
- Regressões 105/105 e paridade Chrome do stage 4 passaram sem diferenças RGBA. Auditoria diagnóstica não registrou chamadas Canvas do host em 12 cenas/estados amostrados.
- Build direto, ABI (113 exports/107 imports) e bridge passaram. Eventos e modos não exercitados ainda precisam de auditoria; sem FPS, sessão longa ou revisão visual ampla. Não publicado no GitHub.

## Preview local v289.0 — 08/11/2026
- A preparação das paredes dos mapas de tiles da Campanha agora usa o painter Rust/WebSys direto. Ordem, cores, alpha, faixas de acabamento e geometria são preservados; o fallback Canvas permanece.
- Auditoria ampliada encontrou limites e geometria subpixel em arenas: Horda usa canvases até 1050×920; Invasão chegou a 1456×1148 e suas salas têm pequenas frações de pixel. Os buffers e validadores relevantes agora aceitam até 1600×1200. Tiles e acabamento são desenhados via Canvas WebSys direto em Rust, preservando recorte fracionário, sem mudar dados de mapa.
- Build passou; regressões 105/105, ABI (114 exports/107 imports), browser bridge, paridade direta e auditoria Chrome passaram. 23 cenas/estados amostrados não registraram chamadas Canvas do host. Paredes da Campanha e pisos/tile em canvases de 1440×900 e 1456×1148 tiveram paridade pixel a pixel exata.
- Não houve benchmark FPS nem revisão visual ampla; o fallback continua para falhas e situações não exercitadas. Não publicado no GitHub.

## v317 / Web v101 — 10/11/2026 — desempenho adaptativo
- O modo automático limita a escala interna do Canvas a 1,25×; antes podia chegar a 1,5× em telas de alta densidade.
- A escala adaptativa usa 0,82× no primeiro nível e 0,64× no segundo. O governador mede 90 quadros e pode fazer uma segunda avaliação quando o nível 1 não resolve a queda.
- A escolha manual de resolução e o preset `max` continuam sendo respeitados.
- Chromium local: Web chegou a p90 de 16,7 ms após adaptação; Rust/WASM chegou a p90 de 16,7 ms e 768×480 no nível 2. Cena pesada com 80 inimigos e 400 partículas ficou em p95 de trabalho de 2,2 ms após adaptação.
- Suíte Rust/WASM: 118/118; compressão e partículas Web passaram. A medição depende do navegador e do hardware e não garante FPS fixo no notebook.

## v318 / Web v102 — 10/11/2026 — composição adaptativa
- Quando o governador entra nos tiers 1 ou 2, remove o filtro CSS de contraste/saturação e desliga a suavização do Canvas; essas opções continuam ativas no tier 0.
- Em Chromium com 120 inimigos, IA visível e 500 partículas, o p95 de trabalho caiu para 2,0 ms após adaptação e a cadência ficou em 16,7 ms.
- Suíte Rust/WASM: 118/118; compressão e partículas Web passaram.

## v319 / Web v103 — 10/11/2026 — narrativa original
- A campanha foi reescrita como **Sinal de Maré**: Cappe investiga apagões coordenados, transmissores clandestinos e sabotagem de infraestrutura.
- Personagens, conflito, objetivos, capítulos e final foram substituídos; os IDs e a ordem dos mapas foram preservados para manter a campanha e os saves compatíveis.
- A interface e a documentação agora usam 1996 e a nova premissa. A alteração reduz semelhanças narrativas com referências externas, mas não constitui parecer jurídico.
- Regressão Rust/WASM: 118/118; os testes Web de compressão e partículas permanecem aprovados.

