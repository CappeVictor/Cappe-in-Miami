## v284.0 — remover rotas legadas de móveis, portas e vidro
Móveis, portas comuns, portas Neon, vidros intactos e estilhaços agora são pintados somente pelos métodos Rust/WebSys diretos. Foram removidos os exports e buffers legados, o callback `draw_furniture_batch` e o opcode JS específico de sprite Neon; as rotas de produção devolvem `false` quando Rust direto não pode desenhar, para o jogo executar seu Canvas original. Build, regressão 104/104, ABI, browser bridge, paridade direta e teste de pixels no Chrome passaram; os grupos comparados tiveram zero diferenças RGBA nos casos exercitados. WASM legado: 21.157 bytes, 2 imports e 27 exports (v283: 61.001 bytes, 3 imports e 36 exports). Sem benchmark ou revisão visual manual ampla.

## v283.0 — remover rotas legadas de piso
Granulado, texturas FTILES, sombras e rejunte usam apenas os painters Rust/WebSys diretos. Removidos do WASM legado o rasterizador e os buffers do piso, draw_floor_batch, draw_floor_rgba_batch e exports associados; removido também o helper direto drawFloorCommands que ficou sem chamadores de produção. Se o painter direto falhar, index.html executa o painter Canvas original e mantém a sequência RNG. Build, regressão 104/104, ABI, bridge, paridade direta e auditoria Chrome passaram. No cenário de gameplay, RNG coincidiu; piso: diferença máxima 3 e média 0,188 por canal RGBA. WASM legado: 61.001 bytes, 3 imports e 36 exports (v282: 68.531 bytes, 5 imports e 45 exports). Sem benchmark, campanha completa ou revisão visual manual ampla.

## v282.0 — remover o batch legado das texturas dos mapas
Texturas repetidas das paredes/móveis e decals de portas usam o painter `drawMapTexturesRgba` Rust/WebSys. Removidos `paint_map_textures`, `paint_map_textures_rgba`, os buffers/cropper de sprites e os comandos host 31/32 do renderer legado. Se a chamada direta falhar, `index.html` mantém o painter Canvas original. Build, regressão 105/105, ABI, browser bridge e auditoria Chrome passaram; comparação à referência independente Canvas ficou dentro dos limites de pixels existentes. Módulo legado: 68.531 bytes, 5 imports e 45 exports (v281: 74.877 bytes, 5 imports e 50 exports). Sem benchmark, campanha completa ou revisão visual manual ampla.

## v281.0 — HUD de texto sem batch legado
Chamadas normais do HUD agora rasterizam texto em canvases cacheados com Rust/WebSys e enviam as posições/alphas ao batch Rust `drawCanvasImageBatch`. Removidos do módulo legado `draw_hud_text`, seus buffers/contadores e o callback host `draw_hud_text_batch`; a rota intermediária JavaScript do HUD foi removida. No frame de gameplay medido pela auditoria, o host não alterou `globalAlpha`; os textos HUD comparados no Chrome tiveram zero diferenças RGBA. Build, regressão 105/105, ABI, browser bridge, paridade direta e auditoria de pixels passaram. Módulo legado: 74.877 bytes, 5 imports, 50 exports (v280: 75.772 bytes, 6 imports, 53 exports). Sem benchmark, campanha completa ou revisão visual manual ampla.

## v280.0 — remover sombras e estrutura do mapa do renderer legado
Sombras de paredes/móveis e faces das paredes/postes agora usam somente `drawMapShadows` e `drawMapStructure` Rust/WebSys direto. Removidos `paint_map_shadows`, `paint_map_structure` e o import `draw_map_command` do WASM legado; o `index.html` conserva os painters Canvas como fallback. Build sem warnings, regressão 104/104, ABI, browser bridge, paridade direta e auditoria de pixels passaram. Chrome comparou as duas camadas com zero diferenças RGBA nos casos exercitados. WASM legado: 75.772 bytes, 6 imports e 53 exports (v279: 77.025 bytes, 7 imports e 55 exports). Sem benchmark, campanha completa ou revisão visual manual ampla.

## v279.0 — remover detalhes de mapa do renderer legado
Detalhes internos das salas e specks do piso agora usam somente `drawMapDetails` Rust/WebSys direto; removidos `paint_map_details` e a rota de comandos do renderer legado. Se Rust direto falhar, `index.html` mantém o painter Canvas original e sua sequência RNG. Build, regressão 104/104, ABI, browser bridge, paridade direta e auditoria de pixels passaram. No Chrome, a referência Canvas e Rust tiveram zero diferenças RGBA e o estado RNG coincidiu; entradas inválidas foram rejeitadas. WASM legado: 77.025 bytes, 7 imports e 55 exports (v278: 78.156 bytes e 56 exports). Sem benchmark, campanha completa ou revisão visual manual ampla.

## v278.0 — remover a decoração do mapa do renderer legado
A decoração estática (tapetes e itens de piso) usa somente `drawMapDecor` Rust/WebSys direto; removidos `paint_map_decor` e o batch de comandos host. `paintMap` conserva a pintura Canvas original se o módulo direto falhar. O teste Chrome compara tapete e itens à referência Canvas e exige zero diferenças RGBA; regressão 104/104, build, ABI, browser bridge, paridade direta e pixels passaram. WASM legado: 78.156 bytes, 7 imports e 56 exports (v277: 78.561 bytes e 57 exports). Sem benchmark, campanha completa ou revisão visual manual ampla.

## v277.0 — remover batches legados de armas e vidros quebráveis
Ícones das 24 armas usam somente `drawWeaponIcon` Rust/WebSys direto; removidos `draw_weapon`, o painter Rust por comandos e o batch host. Vidros intactos e estilhaços também usam `drawMapBreakables` direto; removido o export `draw_breakables`, preservando o Canvas original como fallback. `breakable_data_ptr` continua porque também alimenta as aberturas usadas pela textura de paredes. Testes Chrome compararam ícones e vidros ao Canvas original sem diferenças RGBA; a auditoria do frame player/arma usa agora uma referência independente. Build, regressão 104/104, ABI, browser bridge, paridade direta e teste amplo de pixels passaram. WASM legado: 78.561 bytes, 7 imports e 57 exports (v276: 103.429 bytes, 7 imports e 59 exports). Sem benchmark, campanha completa ou revisão visual manual ampla.

## v276.0 — remover o batch legado de fantasmas
Os fantasmas e sua arma usam somente o painter Rust/WebSys direto; removidos `draw_ghosts`, `ghost_input_ptr`, `MAX_GHOSTS` e o buffer de entrada do renderer legado. A chamada devolve controle ao painter Canvas original se o módulo direto falhar. A comparação Chrome contra esse painter Canvas, com arma Taco, teve zero diferenças RGBA. Build, regressão 104/104, ABI, browser bridge, paridade direta e auditoria de pixels passaram. Módulo legado: 103.429 bytes, 7 imports e 59 exports (v275: 120.272 bytes e 61 exports). Sem benchmark, campanha completa ou revisão visual manual ampla.

## v275.0 — remover composição de jogadores do renderer legado
O batch de composição de P1/P2 agora chama apenas drawPlayers do módulo Rust/WebSys direto. Se o módulo direto não puder desenhar, drawPlayers devolve controle ao fallback Canvas original do jogo. Removidos draw_players, player_draw_data_ptr, PlayerDrawData e o batch legado de jogadores. O módulo legado caiu de 125.432 para 120.272 bytes e de 63 para 61 exports (7 imports). Build, regressão 104/104, teste ABI, browser bridge e auditoria de pixels passaram; jogadores comparados ao painter Canvas original tiveram zero diferenças RGBA. Não houve benchmark nem revisão visual manual ampla.

## v274.0 — remover formas fixas do HUD do renderer legado
Barra de combo, borda de máscara, véu de pausa e recarga chamam `drawHudShape` Rust/WebSys diretamente. Removidos `draw_hud_shape`, `hud_shape_input_ptr`, `HUD_SHAPE_INPUT`, `HUD_SHAPE_COMMANDS`, `draw_hud_shape_batch` e o dispatcher host; os chamadores preservam seus painters Canvas originais como fallback. Os quatro estágios passaram comparação independente RGBA no Chrome. Dealer também é direto desde v273. Build, regressão 103/103, ABI, browser bridge, paridade direta e pixels passaram. Módulo legado: 125.432 bytes, 7 imports e 63 exports (v273: 126.802 bytes, 8 imports e 65 exports). Sem benchmark, revisão visual manual ampla ou campanha completa.

## v273.0 — remover dealer da loja do renderer legado
O dealer da loja usa somente `drawShopDealerStage` Rust/WebSys direto no bridge. Removidos `draw_shop_dealer`, `shop_dealer_input_ptr` e `SHOP_DEALER_INPUT` do WASM legado. `exp-shop.js` continua com o painter Canvas original como fallback para falha do módulo direto. O teste agora constrói a referência independente a partir desse painter, sem comparar apenas ao batch legado: estados normal e caindo tiveram zero diferenças RGBA no Chrome. Build, regressão 103/103, ABI, browser bridge, paridade direta e auditoria de pixels passaram. WASM legado: 126.802 bytes, 8 imports e 65 exports (v272: 128.777 bytes e 67 exports). Sem benchmark, revisão visual manual ampla ou campanha completa.

## v272.0 — retirar painéis da loja do renderer legado
Balão, card e rerolar passam pelos painters Rust/WebSys diretos; removidos `draw_shop_panel`, `shop_panel_input_ptr` e o buffer do WASM antigo. `exp-shop.js` mantém fallback Canvas. Dealer continua legado, pois a referência Canvas independente ainda diverge; o teste anterior Rust-versus-batch antigo permanece aprovado. Módulo legado: 128.777 bytes, 8 imports e 67 exports (v271: 129.725 bytes, 8 imports e 69 exports). Build, regressão 103/103, ABI, browser bridge e paridade Chrome passaram. Sem benchmark ou revisão visual manual ampla.

## v271.0 — retirar base e overlay do mapa do renderer legado
A base de mapas fixos e o overlay translúcido passam ao painter Rust/WebSys direto. Removidos `paint_map_base` e `paint_map_overlay` do WASM legado; `index.html` mantém `fillRect` Canvas original em caso de falha. Módulo legado: 129.725 bytes, 8 imports e 69 exports (v270: 129.918 bytes, 8 imports e 71 exports). Build, regressão 103/103, ABI, browser bridge e paridade Chrome passaram; os casos de mapa fixo/procedural e overlay tiveram zero diferenças RGBA. Sem benchmark ou revisão visual manual ampla.

## v270.0 — retirar menu de pausa do renderer legado
O painter Rust/WebSys direto desenha o véu, título, dois botões, rótulos localizados e hover. `exp-ui.js` conserva o painter Canvas original completo se a chamada direta falhar. Removidos `draw_pause_ui`, `pause_ui_input_ptr` e o buffer de entrada; o batch genérico de HUD permanece para outras camadas. Módulo legado: 129.918 bytes, 8 imports e 71 exports (v269: 131.018 bytes, 8 imports e 73 exports). Build, regressão 103/103, ABI, browser bridge e paridade Chrome passaram; comparação do menu teve zero diferenças RGBA. Sem benchmark ou revisão visual manual ampla.

## v269.0 — remover a barra do chefe do renderer legado
A barra e os marcadores de fase passam pelo painter direto Rust/WebSys. O WASM legado não mantém mais `draw_boss_health_bar`, `boss_health_input_ptr` nem o buffer de entrada; `exp-modes.js` mantém o painter Canvas original como fallback. Módulo legado: 131.018 bytes, 8 imports e 73 exports (v268: 132.196 bytes, 8 imports e 75 exports). Build, regressão 103/103, ABI, browser bridge, paridade Chrome e auditoria de pixels passaram; barra do chefe comparada ao Canvas em zero diferenças RGBA. Sem benchmark ou revisão visual manual ampla.

## v259.0 — migrar névoa e fumaça para o painter direto
v259 — névoa e fumaça agora passam somente pelo painter Rust/WebSys direto; removidos os buffers, exports e callback do WASM legado. O Canvas do jogo continua como fallback. WASM legado: 162.701 bytes, 17 imports e 106 exports (v258: 163.672 bytes, 18 imports e 109 exports). Regressão 102/102, ABI, browser bridge, paridade de névoa/fumaça e piso passaram; Chrome comparou ambos os efeitos ao Canvas original com zero diferenças RGBA. Sem benchmark ou revisão visual manual ampla.

## v258.0 — migrar escadas/elevadores para o painter direto
v258 — removido o batch legado de transporte; a geometria e os gradientes de escadas/elevadores agora passam somente pelo painter Rust/WebSys direto, com fallback Canvas original do jogo. WASM legado: 163.672 bytes, 18 imports e 109 exports (v257: 168.837 bytes, 20 imports e 112 exports). Build, regressão 102/102, ABI/browser bridge, paridade direta dos transportes e piso passaram; Chrome comparou escadas e elevadores em zero diferenças RGBA. Sem benchmark ou revisão visual manual ampla.

# Migração do renderer gráfico para Rust/WASM
## v257.0 — remover o marcador da zona de Invasão do batch legado
O marcador pulsante da zona usa somente `drawInvasionZoneInput` Rust/WebSys; `exp-modes.js` preserva a pintura Canvas original como fallback. Removidos um import, três exports e os arrays estáticos de entrada/comandos do WASM antigo. O binário caiu 799 bytes desde v256 (169.636 → 168.837 bytes), imports 21 → 20 e exports 115 → 112. Build, regressão 102/102, ABI, browser bridge, paridade direta e piso passaram. A saída Chrome foi comparada ao fallback original com zero diferenças RGBA e estado Canvas restaurado. Sem benchmark ou revisão visual manual ampla.

## v256.0 — remover a seta de Invasão do batch legado
A seta de Invasão agora usa diretamente `drawInvasionArrowInput` em Rust/WebSys; `exp-modes.js` mantém o desenho Canvas original quando o painter direto não aceita os dados. Removidos um import, dois exports e os arrays antigos de entrada/vértices. O `.wasm` caiu 547 bytes desde v255 (170.183 → 169.636 bytes), imports 22 → 21 e exports 117 → 115. Build, regressão 102/102, ABI, browser bridge, paridade direta, paridade focada da seta e piso passaram. Cinco posições/ângulos comparados no Chrome tiveram zero diferenças RGBA e preservaram estado Canvas. Sem benchmark ou revisão visual manual ampla.

## v255.0 — remover o batch legado de imagens do HUD
As imagens/vinhetas do HUD agora usam diretamente `drawHudImageStage` em Rust/WebSys; se a rota direta estiver inativa ou falhar, o chamador mantém seu desenho Canvas original. Removidos um import, dois exports e dois arrays do módulo legado. O `.wasm` caiu 844 bytes desde v254 (171.027 → 170.183 bytes), imports 23 → 22 e exports 119 → 117. Build, regressão 102/102, ABI, browser bridge, paridade direta e piso passaram. Cinco etapas de imagem do HUD tiveram zero diferenças RGBA contra o Canvas de referência. Sem benchmark ou revisão visual manual ampla.

## v254.0 — retirar os batches legados de texto do combo e do alarme
Combo e alarme agora chamam somente os painters Rust/WebSys diretos; em inatividade ou falha, os wrappers devolvem `false` e mantêm os painters Canvas da gameplay como fallback. Removidos dois imports, quatro exports e quatro buffers de comando/entrada do módulo legado. O binário caiu 959 bytes desde v253 (171.986 → 171.027 bytes), imports 25 → 23 e exports 123 → 119. Regressão 102/102, ABI, browser bridge e paridade direta passaram; comparação Chrome contra os painters Canvas de `index.html`/`js/exp-fx.js` teve zero canais diferentes para combo e alarme. Sem benchmark ou revisão visual manual ampla.

## v253.0 — remover batches legados de color grade e overlays finais
O color grade e os overlays finais (fade/flash) agora usam apenas os painters Rust/WebSys diretos. Removidos do WASM legado dois callbacks, quatro buffers fixos e quatro exports. O módulo caiu 1.209 bytes desde v252 (173.195 → 171.986 bytes), imports 27 → 25 e exports 127 → 123. Regressão 102/102, ABI, browser bridge e paridade direta ampla passaram; color grade e fade/flash tiveram zero diferenças RGBA nos casos exercitados. O bridge retorna `false` quando o renderer direto está inativo, preservando os painters Canvas de `index.html` como fallback. Sem benchmark ou revisão visual manual ampla.

## v252.0 — remover batches legados de FX, pickups e arremessos
Clarões/arcos, pickups e armas arremessadas agora usam apenas as entradas Rust/WebSys diretas. Removidos do WASM legado três imports de desenho, seis arrays de entrada/saída e sete exports, inclusive o gerador de sprite muzzle. Os buffers fixos somavam 1.966.080 bytes (~1,88 MiB); o `.wasm` caiu 2.430 bytes desde v251 (175.625 → 173.195 bytes), imports 31 → 27 e exports 134 → 127. O clarão foi ajustado para criar o gradiente radial original no Rust direto e teve paridade RGBA exata no Chrome. Pickups com glow ligado/desligado e 24 armas arremessadas também tiveram zero diferenças. Build, ABI, browser bridge e regressões 102/102 passaram. O fallback Canvas original dos chamadores permanece; o WASM antigo ainda inicializa o renderer e executa outras rotas. Sem benchmark ou revisão visual manual ampla.

## v251.0 — remover batches legados de contorno noturno e lanterna
Contornos de inimigos no escuro e máscara da lanterna agora usam as rotas de entrada direta Rust/WebSys; o chamador mantém o painter Canvas como fallback. Removi dois imports de desenho, quatro exports e os arrays do módulo antigo, que somavam 524.432 bytes. O `.wasm` caiu 1.456 bytes desde v250; imports do host caíram de 33 para 31. Build, ABI, paridade Chrome e regressões passaram. O WASM legado ainda é usado pelo bootstrap e por outros batches.

## v250.0 — remover o batch legado de composição de camadas
O recorte e a composição de camadas usam o painter `drawCanvasLayer` Rust/WebSys; o chamador continua com `ctx.drawImage` como fallback. Removi do crate antigo o export `draw_layer`, o import `draw_layer_command` e os oito valores de comando. O WASM caiu 448 bytes em relação à v249 e agora importa 33 funções do host (antes 34). Build, Chrome e regressões passaram. O módulo antigo ainda dá suporte ao bootstrap e a outras rotas.

## v249.0 — remover batches legados de partículas e cadáveres
Migrei poeira, faíscas, sangue vivo/estático e cadáveres para entradas diretas de Rust/WebSys. Os chamadores seguem com o fallback Canvas original quando o módulo direto não está disponível. Removi do crate legado cinco callbacks, exports e conjuntos de buffers estáticos (~2,69 MiB); o binário caiu 3.173 bytes em relação à v248. Build, ABI, paridade Chrome e regressões passaram. A paridade detectou e corrigiu uma diferença na opacidade da sombra dos cadáveres. O renderer legado continua necessário para outras camadas e para o bootstrap.

## v248.0 — remover os batches legados de projéteis e cartuchos
O bridge encaminha projéteis e cartuchos para entradas diretas de Rust/WebSys; se Rust não aceitar a chamada, os chamadores do jogo mantêm o fallback Canvas. Removi do crate antigo os imports `draw_bullet_batch`/`draw_shell_batch`, os buffers e exports associados. Paridade de projéteis e cartuchos, ABI e regressões 102/102 passaram. O renderer legado continua necessário no bootstrap e em outras rotas.

## v247.0 — retirar geradores duplicados do módulo antigo
Radial e névoa já usavam painters Rust/WebSys diretos com fallback Canvas nos chamadores. Agora removi também do crate antigo seus dois geradores, dois pointers de entrada e callback de upload de RGBA. Após `build.ps1`, `WebAssembly.Module.imports/exports` confirma ausência de `draw_radial_sprite_batch`, `generate_radial_sprite` e `generate_fog_sprite`; o renderer legado foi de 185.523 para 181.733 bytes (−3.790 bytes, −2,0%). Build, Chrome, regressões 102/102 e paridade passaram. Isso reduz o WASM, mas não mede velocidade; o bootstrap e outros painters continuam dependentes dele.

## v246.0 — sprite de névoa sem buffer legado
`createFogSprite` usa somente o módulo Rust/WebSys direto. Quando indisponível, `exp-fx.js` recria o sprite com gradientes Canvas; a rota deixou de copiar os 27 números dos anéis para a memória do WASM antigo e não invoca `generate_fog_sprite`. Chrome confirmou os mesmos pixels nos casos de paridade, e a regressão desativa o painter direto para verificar que o wrapper não reativa o legado. Sem inspeção visual manual nem benchmark. O bootstrap e outros painters ainda dependem do módulo antigo.

## v245.0 — sprites radiais sem gerador legado
`createRadialSprite` usa apenas o módulo Rust/WebSys direto. Se ele estiver ausente ou retornar falha, o wrapper retorna `false` para que `exp-fx.js` aplique seu próprio gradiente Canvas; a rota não lê o buffer radial compartilhado nem invoca o gerador do renderer antigo. Chrome comparou os pixels gerados e confirmou igualdade RGBA; a regressão também desativa o painter direto e verifica que não há retorno ao WASM legado. O resto do renderer ainda depende do módulo antigo; sem validação visual manual ou benchmark.

## v244.0 — piso, ícones de arma e pausa localizada
O painter de piso direto recorta o padrão de tijolos pela região e conserva o mesmo seed RNG. Os ícones de arma usam os índices correspondentes da paleta legada para que os 24 casos comparem pixel por pixel. O texto da pausa chega de `tx()` ao painter Rust, preservando os idiomas da interface. A suíte de paridade Chrome passou após corrigir fixtures que não reproduziam as imagens e os textos reais. Não houve inspeção visual manual nem benchmark; o renderer ainda é híbrido.

## v238.0 — ícones de armas em pickups e arremessos
Os painters diretos desses lotes não chamam mais `drawWeaponIcon` JavaScript. Rust recebe as linhas numéricas de transformação e usa o painter de armas existente para as 24 variantes; o fallback antigo mantém o callback JS. O Chrome comparou todos os IDs em pickups com/sem brilho e arremessados: zero diferenças RGBA. Regressões 97/97, ABI do renderer e teste de arma da expansão passaram. Sem benchmark ou campanha visual completa.

## v237.0 — sprite procedural de clarão
O sprite radial do disparo agora é produzido por Rust/WebSys no canvas, sem passar pelo gerador de pixel do WASM antigo. O bridge reutiliza o buffer das entradas de efeitos. O teste de sprites Chrome confirmou zero diferenças RGBA contra a fórmula antiga e o teste direto comparou o batch de FX; regressões 97/97 e build release passaram. Pickups, arremessos e contornos noturnos agora tentam o pintor direto antes de consultar a capacidade/export antigo. O renderer ainda permanece híbrido; sem benchmark ou campanha visual completa.

## v236.0 — efeitos de mundo diretos e buffers reutilizados
Luzes, anéis e overlays mantêm entradas em buffers reutilizáveis do bridge e tentam o painter Rust antes de consultar os exports antigos. Se a chamada direta falhar, o bridge copia os mesmos dados para a memória legada e mantém o fallback. Regressões (97/97), paridade direta e browser bridge passaram. Sem benchmark ou validação visual ampla.

## v235.0 — buffers diretos para chuva e motes de clima
O bridge preenche Float64Array reutilizáveis para os dados de chuva e clima, e Rust/WebSys desenha esses registros diretamente. A escrita na memória do WASM legado agora ocorre apenas no fallback. `tests/wasm-rain-mote-parity.cjs` comparou os dois caminhos no Chrome: chuva normal/alternada e partículas em tempos distintos tiveram zero diferenças RGBA; os buffers foram reutilizados. Nenhum dado de simulação foi movido, sem benchmark ou validação visual ampla.

## v234.0 — loja direta

- `drawShopDealerStage` e `drawShopPanelStage` calculam e pintam em Rust/WebSys, sem emitir o lote HUD do módulo antigo. Seis cenários (vendedor normal/caindo, balão, cartão normal/realçado e renovar) tiveram 0 diferenças RGBA no Chrome.

## v233.0 — contador de combo direto

- `drawComboTextStage` calcula pulso e rótulo e pinta em Rust/WebSys. Paridade no Chrome: 0 diferenças RGBA; alpha, composite, fonte, contorno e espessura preservados.

## v232.0 — texto de alarme direto

- `drawAlarmTextStage` calcula o rótulo a partir do timer e pinta com WebSys. Regressão de paridade no Chrome confirmou pixels e propriedades do contexto iguais ao callback anterior.

## v231.0 — seleção e pintura de imagens do HUD

- `drawHudImageStage` escolhe em Rust/WebSys a vinheta normal/CRT, vinheta de HUD, retrato de máscara ou imagem auxiliar, e pinta nas coordenadas originais. Teste Chrome: 0 diferenças RGBA em todos os estágios testados.

## v230.0 — fundo direto do frame

- `drawFrameBackground` pinta em Rust/WebSys o fundo e a margem de segurança de screen shake. Comparação Chrome: zero diferenças RGBA, com alpha/composite do contexto preservados.

## v229.0 — formas diretas do HUD

- `drawHudShape` em Rust/WebSys pinta diretamente os estágios de combo, moldura da máscara, pausa e barra auxiliar. A comparação de regressão no Chrome registrou 0 diferenças RGBA em todos os estágios; alpha e composite do contexto foram preservados.

## v228.0 — composição direta de inimigos visíveis

O bridge empacota posição, rotação, queda, classe e estados já mantidos pelo host. Rust/WebSys faz a seleção de visibilidade para a janela de 900×700, pinta sombras, sprite animado ou corpo procedural, efeitos de atordoamento e imagens cacheadas de texto. Os dados dos assets e a simulação continuam no host; o batch de inimigos do WASM anterior permanece como fallback. Chrome comparou os casos de spritesheet e geometria procedural, incluindo nocaute, atordoamento, alerta e investigação, com zero diferenças RGBA e chamadas diretas confirmadas. Sem campanha completa, revisão visual manual ou benchmark.

## v227.0 — composição direta dos rastros fantasma

Rust/WebSys recebe os registros de posição/ângulo/alpha já mantidos pelo host e compõe sombra, arma e corpo do rastro sem gerar o batch de comandos no WASM antigo no caminho normal. O fallback legado permanece disponível. A regressão Chrome compara a imagem direta com a referência produzida pelo caminho antigo e exige zero diferenças RGBA, além de confirmar a chamada direta. Isso não conclui a migração nem mede desempenho; a simulação continua em JavaScript.

## v226.0 — composição direta dos jogadores P1/P2

Rust/WebSys recebe dados compactos de posição, orientação, fase/estado, arma e opções visuais; desenha aura, arma, spritesheet ou frame procedural, faixas cosméticas e etiqueta P1/P2 diretamente no Canvas. A simulação e os relógios seguem no host; a geração de comandos do WASM antigo é fallback. Chrome comparou P1 e P2 com skin, armas, sombras e glow com zero diferenças RGBA. Sem benchmark ou publicação no GitHub.

## v225.0 — geração RGBA de sprites procedurais do jogador

Rust/WebSys desenha diretamente no `ImageData` de 24×24 pixels do sprite procedural. O host continua calculando o estado, fase e seno de animação para manter o relógio do jogo compatível; o rasterizador legado fica como fallback. Chrome comparou seis combinações de idle, caminhada, corrida e ataque com zero diferenças RGBA. Sem benchmark ou publicação no GitHub.

## v224.0 — geometria e painter de móveis estáticos por Rust direto

O host envia x/y/largura/altura/tipo/variante em `Float64Array`; Rust valida o lote e desenha diretamente os 17 tipos de móveis via WebSys, incluindo sombras, contornos, formas e cores anteriores. A geometria não passa pelo gerador de comandos do WASM legado no caminho normal, que continua disponível como fallback. Chrome comparou os 17 tipos com zero diferenças RGBA; entradas com dimensões inválidas são rejeitadas. Sem benchmark ou publicação no GitHub.

## v223.0 — composição de texturas FTILES do piso por Rust direto

O host lê uma única vez os pixels do tile e envia o ImageData do piso, os pixels FTILES e as geometrias das salas ao módulo Rust direto. Rust preserva exclusão do corredor, fase horizontal, repetição 72×24 e composição source-over com 45% do alpha; ao concluir, o host atualiza o Canvas. O caminho legado permanece disponível como fallback e para navegadores sem o módulo direto. Chrome comparou a rota direta e fallback: zero diferenças RGBA e estado RNG idêntico. Sem benchmark ou publicação no GitHub.

## v222.0 — gerador RGBA de granulado do piso em Rust direto

O módulo Rust direto gera a textura determinística do granulado no buffer ImageData e devolve a semente RNG avançada; o host aplica o resultado ao Canvas. A implementação preserva algoritmo, contagem e ordem aleatória do renderer legado, mantido como fallback. Chrome comparou a rota direta com o fallback: zero canais RGBA diferentes e a mesma semente final. Build, regressões 97/97, renderer, browser bridge e paridade ampla passaram. Ainda sem benchmark ou publicação no GitHub.

## v221.0 — sombras e rejunte RGBA do piso por Rust direto

O módulo direto lê o ImageData cacheado e uma lista compacta de sólidos, reproduz a composição premultiplicada, sombras e linhas de rejunte, depois atualiza ImageData e Canvas. A rota gerada pelo WASM legado permanece fallback. Chrome comparou saída e sequência RNG com zero diferenças, alpha/composição preservados; build, regressões 97/97 e browser bridge passaram. Sem benchmark ou publicação no GitHub.

## v220.0 — vidros intactos e fragmentos por Rust direto

O host envia em buffer compacto os painéis intactos e os fragmentos ativos; Rust gera os três traços dos painéis e os caminhos dos estilhaços, sem o lote de comandos do WASM legado no caminho normal. O fallback segue disponível. Chrome comparou ambas as rotas com zero diferenças RGBA, rejeitou alpha inválido e confirmou alpha/composição/estilos restaurados. Build, regressões e bridge passam. Sem benchmark ou publicação no GitHub.

## v219.0 — faces de paredes e detalhes de postes em Rust direto

O host envia x/y/largura/altura/tipo em `Float64Array`; Rust compõe faces, bordas e quatro formas de cada poste diretamente no Canvas, na ordem anterior. A rota gerada pelo WASM legado permanece fallback. Chrome comparou estrutura mista na rota direta, no fallback e numa referência Canvas com zero diferenças RGBA; estados de alpha, composição e estilo restaurados. Build, regressões e browser bridge passam. Sem benchmark ou publicação no GitHub.

## v218.0 — sombras de paredes e móveis em Rust direto

O host empacota as caixas de paredes e móveis em um `Float64Array`; Rust escolhe os deslocamentos preservados da camada e pinta cada retângulo no Canvas. A rota antiga continua fallback. Chrome comparou a rota direta e o fallback com a referência: zero diferenças RGBA; entradas inválidas são recusadas e o alpha, composição e preenchimento são restaurados. Build, regressões e browser bridge passam. Sem benchmark ou publicação no GitHub.

## v217.0 — detalhes de salas e piso com RNG compatível

Rust/WebSys recebe a geometria das salas, dimensão do mapa e estado atual do gerador. Ele pinta os contornos/seams e gera os specks usando o mesmo algoritmo de RNG; a nova semente volta à simulação para preservar chamadas subsequentes. O fallback de geração legada permanece. Chrome comparou saída RGBA e semente final contra o fallback, rejeitou dimensão inválida e confirmou estado do Canvas preservado. Build, regressões e browser bridge passam. Sem benchmark ou publicação no GitHub.

## v216.0 — decoração estática por geração e painter diretos

O host envia x/y/largura/altura/tipo/índice de cor em um `Float64Array` compacto. Rust valida o lote, gera o desenho do tapete (preenchimento e dois contornos) e pinta os itens decorativos diretamente na ordem original. A ponte usa essa rota antes do WASM legado e conserva fallback. Chrome comparou decoração mista na rota direta e fallback com a referência Canvas: zero diferenças RGBA, alpha, composição e estilos restaurados. Build, regressões e browser bridge passam. Sem benchmark ou publicação no GitHub.

## v215.0 — base e overlay do mapa por desenho direto

O módulo Rust/WebSys agora desenha a base escura de mapas fixos e a camada de luz translúcida diretamente no Canvas. A ponte tenta essa rota primeiro; se faltar o módulo direto ou houver falha, os geradores legados continuam disponíveis. Chrome comparou base fixa, mapa sem base fixa e overlay com zero diferenças RGBA e estilos/alpha/composição preservados. Build e regressões passam. Sem benchmark ou publicação no GitHub.

## v204.0 — seta da Invasão por pintura direta

O host passa o centro e seno/cosseno da direção. Rust compõe os três vértices e pinta o triângulo direto com `web-sys`, sem gerar o batch de vértices no WASM legado; o caminho antigo permanece fallback. Chrome comparou cinco posições/ângulos com zero diferenças RGBA e estado Canvas restaurado. Build, regressões, renderer e browser bridge passaram. Sem campanha completa, revisão visual ampla ou benchmark.

## v203.0 — pintura direta dos contornos e rota Coruja

A simulação JavaScript conserva LOS, alcance, seleção de objetos e navegação. Ela envia os marcadores visíveis e os pontos da rota em `Float64Array` reutilizável. Rust/WebSys pinta retângulos, círculos e o caminho tracejado diretamente no Canvas; o painter Canvas permanece fallback. Chrome comparou cinco marcadores e uma rota com zero diferenças RGBA, preservando alpha, composição e transformação. Regressões 86/86, renderer e browser bridge passaram. Sem validação visual ampla, campanha completa ou benchmark.

## v202.0 — sprites de projéteis em painter direto

O host envia x/y/dono em buffer reutilizável e preserva as imagens cacheadas dos projéteis. Rust seleciona o sprite, aplica o deslocamento centralizado e desenha via `web-sys`; a rota antiga continua fallback. Chrome comparou os dois donos e ignorou uma entrada inválida com zero diferenças RGBA. Build, regressões 85/85, renderer, browser bridge e teste focado passaram. Sem benchmark ou campanha completa.

## v201.0 — projeção e painter direto de cápsulas

O host envia x/y/raio de cada cápsula e a câmera em buffer reutilizável. Rust projeta posições, escala raios e rasteriza elipses diretamente, mantendo o batch legado como fallback. Chrome comparou cinco entradas (incluindo inválidas ignoradas): zero diferenças RGBA e alpha/composição preservados. Build, regressões 85/85, renderer, browser bridge e teste focado passaram. Sem benchmark ou campanha completa.

## v200.0 — pickups e arremessos em entrada direta

O host envia os valores de posição, rotação, arma e pulso em buffers reutilizáveis diretamente aos painters Rust/WebSys existentes. O WASM legado deixa de copiar esses dados para um batch no caminho normal; o fallback fica disponível. Chrome comparou glow ativado/desativado e armas arremessadas: zero diferenças RGBA e estado alpha/composição restaurado. Build, regressões 85/85, renderer, browser bridge e teste focado passaram. Sem benchmark ou campanha completa.

## v199.0 — entradas diretas para efeitos de disparo/impacto

O host envia os dados de cada efeito ao módulo Rust/WebSys direto, que valida os valores e desenha clarões e arcos no Canvas. A geração do lote e painter antigo continuam como fallback. Chrome comparou a rota direta à de fallback para três efeitos, incluindo ambos os tipos: zero diferenças RGBA e estado alpha/composição restaurado. Build, regressões 85/85, renderer, browser bridge e cópia extraída do ZIP (157 arquivos, 86 PNGs) passaram. O teste Chrome amplo foi interrompido após ultrapassar 3 GB de memória; o teste focado passou. Sem benchmark ou revisão visual ampla.

## v198.0 — projeção e raios da máscara escura

O host envia jogador, câmera, dimensões de viewport, zoom, ângulo e flags. Rust calcula a projeção para tela e escala os raios da máscara antes de chamar o painter direto; o gerador de comandos antigo permanece fallback. O teste Chrome focado comparou os pixels da máscara offscreen e do overlay visível nos dois caminhos: zero diferenças RGBA. Build, regressões 85/85, renderer e browser bridge passaram na fonte e na cópia extraída do ZIP (156 arquivos, 86 PNGs). Sem benchmark ou revisão visual ampla.

## v197.0 — cálculo e desenho direto de neblina/fumaça

JavaScript mantém o relógio, tipo do clima e faixa de desempenho, e envia o sprite ao módulo direto. Rust calcula a deriva das três cópias, alpha e composição e desenha as imagens sem gerar comandos no WASM legado no caminho normal; o batch anterior continua fallback. Chrome comparou fumaça e neblina sob alpha/composição alterados: zero canais RGBA diferentes e estado restaurado. Build, regressões 85/85, renderer, browser bridge e parity direta passaram na fonte; regressões, renderer e browser bridge passaram no ZIP extraído. O parity amplo do Chrome na extração foi interrompido por alto consumo de memória. Sem benchmark ou revisão visual ampla.

## v196.0 — pulso e desenho direto da zona da Invasão

O host envia posição e relógio. Rust/WebSys calcula o pulso com a mesma aproximação senoide e desenha contorno e preenchimento sem gerar comandos no WASM legado no caminho normal; a rota antiga segue fallback. Chrome comparou alpha e composição alterados: zero canais RGBA diferentes e estado restaurado. Build, regressões 85/85, renderer e browser bridge passaram. Sem benchmark ou revisão visual ampla.

## v195.0 — pulso e desenho direto das luzes de mundo

O host envia os emissores e sprites ativos, os valores de tempo/intensidade, o stride de qualidade e o estado do jogador. Rust/WebSys calcula o pulso e o flicker Neon; desenha as luzes e o clarão sob `lighter`, depois o reflexo de chuva sob a composição herdada. A rota geradora de comandos antiga continua como fallback. Chrome comparou luzes Neon sob stride 2, clarão e reflexo com alpha/composição alterados: zero canais RGBA diferentes e estado restaurado. Build, regressões 85/85, renderer, browser bridge, parity do renderer e piso/mapa passaram na fonte e na cópia extraída do ZIP (155 arquivos, 86 PNGs). Sem benchmark ou revisão visual ampla.

## v194.0 — pulso e desenho direto dos anéis de mundo

JavaScript filtra anéis expirados e envia centro, raio-base, tempo restante, duração e índice de cor. Rust/WebSys calcula raio, espessura e transparência do pulso e rasteriza os anéis diretamente. O batch do renderer anterior continua como fallback. Chrome comparou três anéis ativos em fases e cores distintas, com alpha reduzido e composição `multiply`: zero canais RGBA diferentes e estado restaurado. Build, regressões 85/85, renderer, browser bridge e piso/mapa passaram na fonte e na cópia extraída do ZIP (155 arquivos, 86 PNGs). Sem benchmark ou revisão visual ampla.

## v193.0 — desenho direto de vidro e estilhaços

JavaScript envia painéis e estilhaços ativos em Float64Array; Rust/WebSys desenha preenchimentos, contornos, shimmer animado e cacos. A física e ativação continuam no host, e o batch do renderer anterior segue como fallback. Chrome comparou dois casos de shimmer e quatro cores de estilhaço com alpha reduzido/composição `multiply`: zero canais RGBA diferentes e estado restaurado. Build, regressões 85/85, renderer, browser bridge e piso/mapa passaram na fonte e no ZIP v193 extraído (155 arquivos, 86 PNGs, sem target ou ZIP aninhado). Sem benchmark ou revisão visual ampla.

## v192.0 — realces de inimigos no painter direto

O host mantém filtragem/seleção de inimigos e passa registros compactos com classe, ângulo, saúde, telegraph, carga, transparência e cores. Rust/WebSys rasteriza anéis, barras, a silhueta do líder, mira de atirador e linha de carga do chefe. O caminho normal não gera comandos no WASM legado; se o painter direto falhar, a rota anterior permanece fallback. O seno aproximado e a ordem de desenho foram preservados. Chrome comparou quatro tipos de inimigo, incluindo estados especiais, sob `multiply` e alpha reduzido: zero canais RGBA diferentes e estado restaurado. Build, regressões 85/85, renderer, browser bridge e piso/mapa passaram na fonte e no ZIP v192 extraído (155 arquivos, 86 PNGs, sem target ou ZIP aninhado). Sem benchmark ou revisão visual ampla.

## v191.0 — desenho direto de barris e câmeras

O host envia os estados já calculados de barris e câmeras em Float64Array. Rust/WebSys rasteriza halos/corpos, cones, carcaças e lentes diretamente, sem gerar comandos no WASM legado no caminho normal. Se o módulo direto falhar, o bridge conserva o batch anterior como fallback. Chrome comparou timers negativos/positivos, ângulos de câmera e polígonos frios/quentes contra a rota antiga com composição `multiply`: zero canais RGBA diferentes, alpha/composição restaurados. Build, regressões 85/85, renderer, browser bridge e piso/mapa passaram na fonte e no ZIP v191 extraído (155 arquivos, 86 PNGs, sem target ou ZIP aninhado). Sem benchmark ou validação visual ampla.

## v190.0 — desenho direto das portas Neon

O bridge deduplica os handles de sprite e passa posições, ângulo composto, offsets e índices em Float64Array ao módulo direto. Rust valida handles e desenha cada sprite com translate/rotate/ drawImage, preservando a ordem; só em falha o bridge preenche a memória antiga e chama draw_neon_doors. Chrome comparou dois sprites, ângulos fechados/abertos e offsets: zero canais RGBA diferentes, alpha/composição restaurados. Regressões 85/85, testes do renderer legado, ponte browser e piso/mapa passaram na fonte e no ZIP v190 extraído (155 arquivos, 86 PNGs, sem target ou ZIP aninhado). Sem benchmark ou validação visual ampla.

## v189.0 — desenho direto das portas de sala

O bridge compacta x/y/largura/altura/ângulo/orientação em Float64Array e o painter Rust direto rasteriza as portas com o sprite de painel ou com a cor de fallback, mais os dois contornos. A rota normal deixa de chamar draw_doors do WASM legado e não usa seu buffer Door; se o painter direto falhar, o caminho anterior continua disponível. Chrome comparou portas horizontais e verticais, com e sem imagem: zero canais RGBA diferentes, alpha e composição restaurados. Build Rust/WASM e regressões 85/85 passaram na fonte e no ZIP v189 extraído (155 arquivos, 86 PNGs, sem target). Sem benchmark nem validação visual ampla.

## v188.0 — geração direta dos ícones de armas

Os 24 ícones agora são construídos e rasterizados no módulo Rust/WebSys direto. O bridge tenta esse painter antes do gerador de comandos legado; o fallback antigo permanece disponível se o módulo direto falhar ou não reconhecer a arma. Chrome comparou cada ícone nos dois caminhos: zero canais diferentes. Build Rust/WASM e regressões 85/85 passaram na fonte e no ZIP v188 extraído (155 arquivos, 86 PNGs, sem target). A quantidade de primitivas Canvas é equivalente; não houve benchmark nem validação visual ampla.

## v187.0 — geometria de mapa fora da memória legada

O bridge prepara arrays JS para sólidos e aberturas e passa esses arrays diretamente ao compositor Rust/WebSys. A rota direta não usa rooms_ptr nem breakable_data_ptr; somente se ela falhar, o fallback copia a mesma geometria e os pixels para as tabelas legadas. A capacidade máxima continua em 8192 registros. A lógica que escolhe e ordena mapas/assets permanece no host; não é migração integral nem mudança de gameplay. Build Rust/WASM, regressões 85/85 e verificações Chrome de paridade passaram na fonte e no ZIP extraído (155 arquivos, 86 PNGs e nenhum target). Sem benchmark ou validação visual ampla.


## v186.0 — upload de sprites sem a memória do WASM antigo

O bridge agora monta os oito sprites de 24×24 em buffer JavaScript próprio, copiando as linhas das folhas depois que Rust/WebSys lê os pixels. O painter direto recebe esse buffer e não usa `map_texture_pixels_ptr`, `map_texture_sheet_pixels_ptr` ou `copy_map_texture_sprite` no caminho normal. Somente se o painter direto falhar, os bytes são copiados à tabela legada antes de executar o fallback. Chrome 156 confirmou compositor direto idêntico ao fallback em mapa de 1440×900; duas chamadas diretas foram observadas. Build, regressões 85/85, testes Chrome e as mesmas validações no ZIP extraído passaram. Sem benchmark ou revisão visual ampla.

## v185.0 — compositor de texturas de mapa no módulo direto

A rasterização RGBA repetida das texturas de parede/móveis e dos decalques de portas foi portada do compositor WASM legado para Rust/WebSys direto. O host ainda escolhe/cacheia assets e prepara listas de retângulos e sprites; a rota direta rasteriza o buffer e faz `putImageData`. O antigo compositor permanece fallback. Chrome 156 comparou a saída dos dois compositores em um mapa de 1440×900: zero canais diferentes. A comparação com Canvas de referência conserva o desvio já conhecido dessa camada (máximo 76/255, média 0,001947/255); não se reivindica paridade com a referência Canvas nem ganho de FPS. A cena registrou chamadas diretas. Sem validação visual ampla ou campanha completa.

## v184.0 — leitura de texturas por Rust/WebSys

A leitura de pixels de fontes de textura Canvas e `HTMLImageElement` com dimensões de 24–144 × 24 agora é feita pelo módulo Rust direto, que chama `getImageData` e, para imagens, rasteriza no canvas temporário passado pelo host. Os bytes e a composição Rust existente permanecem iguais. O caminho JavaScript anterior continua fallback quando a fonte não é compatível ou a chamada direta falha. Chrome 156 confirmou bytes idênticos para canvas e imagem 48×24; a cena do jogo registrou cinco leituras diretas. Build e regressões 85/85 passaram; a paridade de piso/mapa passou dentro dos limites existentes. Esta alteração não é evidência de ganho de FPS. Sem revisão visual ampla ou campanha completa.

## v183.0 — contornos de atores noturnos em Rust direto

O lote `draw_dark_outline_batch` agora tenta o painter Rust direto para os mesmos arcos e estilos de alerta/KO; o WASM legado continua calculando a projeção e selecionando atores. Fallback Canvas preservado. Chrome comparou os dois caminhos com dois contornos e um ator morto ignorado: zero diferenças RGBA, alpha/composite e estilos do contexto restaurados. Regressões 85/85. A camada não foi revisada visualmente em fase escura e não houve benchmark.

## v182.0 — painter Rust para retângulos legados de piso

O lote `draw_floor_batch` agora tenta `drawFloorCommands` no módulo Rust direto para pintar os mesmos `fillRect` com a paleta que o WASM legado fornece. O fallback JavaScript continua para incompatibilidades. Smoke Chrome 156 contou 47 chamadas diretas durante `newGame`; lote sintético de três retângulos teve zero diferenças RGBA e preservou fillStyle, alpha e composite. Regressões 84/84. Sem benchmark, inspeção visual ampla ou campanha completa.

## v181.0 — desenho Rust de imagens de texto cacheadas

`tx()` agora encaminha pelo `drawCanvasImage` do módulo Rust a cópia das imagens de texto cacheadas para o canvas principal. Cache, rasterização do texto, tradução, cálculo da posição/alinhamento e fallback permanecem iguais. Chrome comparou imagem cacheada em canvas sintético: zero canais RGBA diferentes, alpha/composite restaurados; regressões 83/83. Sem benchmark, inspeção visual ampla ou campanha completa.

## v181.0 — desenho Rust de imagens de texto cacheadas

`tx()` agora encaminha pelo `drawCanvasImage` do módulo Rust a cópia das imagens de texto cacheadas para o canvas principal. Cache, rasterização do texto, tradução, cálculo da posição/alinhamento e fallback permanecem iguais. Chrome comparou imagem cacheada em canvas sintético: zero canais RGBA diferentes, alpha/composite restaurados; regressões 83/83. Sem benchmark, inspeção visual ampla ou campanha completa.

## v180.0 — formas HUD e seta da Invasão
O callback de formas HUD encaminha comandos de sete valores e paleta efetiva ao painter Rust direto. Isso inclui os desenhos da barra do chefe que usam esse lote. A seta da Invasão passa seus seis valores de vértice ao método direto. A regressão browser compara o caminho antigo e Rust em casos representativos; fallback permanece. Migração integral e benchmark continuam pendentes.

## v179.0 — pickups e arremessos
Rust valida/copia os comandos para proteger o buffer durante a chamada reentrante, então aplica translate/rotate e o brilho de pickup. O callback existente desenha o ícone da arma sob a transformação. O teste Chrome compara caminho antigo e novo nos dois tipos de brilho e em arremesso, exigindo zero diferenças RGBA e estado Canvas restaurado. Fallback completo permanece; migração e benchmark seguem pendentes.

## v178.0 — saída da fase
O WASM legado ainda calcula o lote e gera/cacheia o gradiente; o painter Rust direto desenha o lote, incluindo glow, clip, imagem, hachuras e bordas. O teste compara o caminho legado e o novo em estado concluído/não concluído, exige RGBA idêntico e verifica restauração de alpha/composite. O callback Canvas antigo segue como fallback; isso não completa a migração nem mede desempenho.

## v177.0 — escadas e elevadores
O WASM legado gera a sequência de comandos e mantém a preparação/cache de gradientes RGBA; o callback encaminha comandos e imagens ao painter direto Rust/WebSys. O teste Chrome compara o fallback antigo com o novo painter em escada e elevador, exige igualdade RGBA e restauração do estado Canvas. Callback antigo permanece fallback; não há medição de desempenho e a migração integral segue pendente.

## v176.0 — gradação e overlays de tela
Os preenchimentos de color grade e fade/flash foram conectados ao painter WebSys direto; o host JS ainda fornece os parâmetros do frame. O teste Chrome compara RGBA contra as operações Canvas originais, exige zero canais diferentes e verifica restauração de alpha/composite. Fallback legado segue ativo; essa etapa não mede desempenho nem completa a migração do renderer.

## Etapa atual — preview local v176, conversão parcial

Os passes de gradação e fade/flash enviam dimensões e valores do frame ao painter Rust direto. Ordem e estilo são preservados; o dispatcher antigo continua como fallback. Chrome 156 confirmou paridade RGBA exata nas cenas sintéticas. Build direta: 158.600 bytes WASM + 41.212 bytes glue; regressões 82/82. Sem campanha completa, revisão visual ampla ou benchmark.

## Etapa atual — preview local v174, conversão parcial

Imagens HUD selecionadas e dimensionadas pelo WASM legado agora passam ao painter Rust direto para drawImage via WebSys. Sprite, posição e fallback permanecem compatíveis. Chrome 156 confirmou callback integrado e paridade RGBA exata. Build direta: 156.255 bytes WASM + 39.762 bytes glue; regressões 82/82. Sem campanha completa, revisão visual ampla ou benchmark.

## Etapa atual — preview local v173, conversão parcial

O callback de alarme envia comandos e texto já formatado ao painter Rust direto para estilo, alinhamento e fillText. Temporizador e centralização permanecem no WASM legado; Canvas mantém fallback. Chrome 156 confirmou chamada integrada e paridade RGBA exata. Build direta: 155.645 bytes WASM + 39.337 bytes glue; regressões 82/82. Sem campanha completa, revisão visual ampla ou benchmark.

## Etapa atual — preview local v172, conversão parcial

O callback de combo agora envia pulso, valor e texto formatado ao painter Rust direto para transform, contorno e preenchimento Canvas. Lógica/temporização continuam no caminho existente e o fallback JS permanece. Chrome 156 confirmou uma chamada integrada e paridade RGBA exata, com estado restaurado. Build direta: 154.919 bytes WASM + 38.768 bytes glue; regressões 82/82. Sem campanha completa, revisão visual ampla ou benchmark.

## Etapa atual — preview local v171, conversão parcial

O callback de estojos agora tenta desenhar os comandos de elipse pelo painter Rust direto. Projeção de tela e geração do lote permanecem no WASM legado; simulação continua JS e Canvas conserva fallback. Chrome 156 confirmou uma chamada integrada e paridade RGBA exata, com alpha/composição restaurados. Build direta: 154.105 bytes WASM + 38.200 bytes glue; regressões 82/82. Sem campanha completa, revisão visual ampla ou benchmark.

## Etapa atual — preview local v170, conversão parcial

Muzzle flashes e arcos de impacto agora tentam rasterização pelo painter Rust/WebSys direto; a simulação, criação do sprite e fallback continuam no host. Chrome 156 confirmou uma chamada integrada e paridade RGBA exata nos casos cobertos. Build direta: 153.386 bytes WASM + 37.706 bytes glue; regressões 82/82. O renderer continua híbrido; sem campanha completa, revisão visual ampla ou benchmark.

## Etapa atual — preview local v169, conversão parcial

O callback de escuridão/lanterna agora rasteriza com Rust direto no canvas half-resolution e compõe o resultado no canvas principal. Corrigida a validação do WASM legado, que confundia o ângulo e os flags com dimensões positivas e rejeitava valores false/zero. O teste Chrome 156 confirmou uma chamada integrada e paridade RGBA exata. Build direta: 152.262 bytes WASM + 37.257 bytes glue; regressões 82/82. O renderer continua híbrido; sem campanha completa, revisão visual ampla ou benchmark.

## Etapa atual — preview local v168, conversão parcial

Os callbacks de névoa, luzes de mundo/reflexo, anéis e zona de invasão tentam agora desenhar seus comandos pelo módulo Rust/WebSys direto, mantendo o Canvas antigo como fallback. A geometria continua sendo calculada pelo módulo legado; lógica/RNG de jogo não foram alterados. Build direta 150.178 bytes WASM + 36.608 bytes glue; regressões 82/82. Chrome 156 confirmou diferença RGBA zero nos quatro tipos e estado Canvas restaurado. Sem benchmark, inspeção visual ampla ou campanha completa.

## Etapa atual — preview local v167, conversão parcial

Os overlays F4/F6 de colisão e IA agora chamam `drawDebugWorld` no módulo `web-sys` direto. JS mantém estado e prepara arrays tipados; painter Rust mantém a ordem/estilos e Canvas antigo é fallback. Chrome 156 confirmou uma chamada real em dev (16 paredes, 5 portas, 5 inimigos) e paridade RGBA exata num caso sintético, com estado Canvas preservado. Build 145.565 bytes WASM + 34.732 bytes glue; regressões 82/82. Sem benchmark, revisão visual ampla ou campanha completa.

## Etapa atual — preview local v166, conversão parcial

O modo `dev=1` continua formando métricas/erros em JavaScript, mas fundo e textos do painel são desenhados pelo módulo Rust direto, com fallback. Chrome 156 confirmou paridade RGBA zero e chamada no jogo em dev; regressões 82/82 e pixel parity ampla passaram. Build 143.436 bytes WASM + 33.762 bytes glue. Sem benchmark, inspeção visual ampla ou campanha completa.

## Etapa atual — preview local v165, conversão parcial

Se toasts foram desenhados pelo Rust, a HUD não redefine alpha em JS; a atribuição fica no fallback. Com uma explosão controlada no smoke Chrome 156, o monitor não observou chamadas ou setters Canvas no host; pixel parity e regressões 82/82 passaram. Sombras de inimigo, vidro e marcas de explosão também chamam o módulo direto. Renderer híbrido; sem benchmark, inspeção visual ampla ou campanha completa.

## Etapa atual — preview local v164, conversão parcial

`explode` mantém toda a lógica do efeito no JS, mas agora rasteriza os dois círculos persistentes do layer de chão via Rust direto. O fallback mantém o Canvas legado. Teste Chrome compara pixels; smoke registra a rota da explosão em gameplay. Build 140.854 bytes WASM + 33.137 bytes glue. Renderer híbrido; regressões 82/82, sem benchmark, inspeção visual ampla ou campanha completa.

## Etapa atual — preview local v163, conversão parcial

`breakGlass` ainda calcula o estado, RNG e geometria no JS, mas envia o rastro permanente do painel quebrado ao módulo Rust direto para rasterização. O painter Rust desenha a base e nove triângulos com paridade RGBA exata em Chrome 156; fallback preservado. Sombras de inimigo também seguem diretas. Regressões 82/82, ABI/browser e pixel parity passaram; build 140.256 bytes WASM + 32.738 bytes glue. Renderer híbrido, sem benchmark, revisão visual ampla ou campanha completa.

## Etapa atual — preview local v162, conversão parcial

O dispatcher de inimigos mantém a ordem de sombras/corpos, mas cada elipse de sombra agora chama `drawEnemyShadows` em Rust direto, preservando alpha e estado do contexto. Fallback Canvas segue ativo. Chrome 156: 205 chamadas no gameplay; três sombras com paridade RGBA exata e estado restaurado. Regressões 82/82, renderer ABI/browser e pixel parity passaram; build 138.983 bytes WASM + 32.201 bytes glue. O teste pausa redraw após coletar o smoke para concluir as comparações em cerca de 12 segundos. Renderer híbrido; sem benchmark, revisão visual ampla ou campanha completa.

## Etapa atual — preview local v161, conversão parcial

`paintMap` configura `imageSmoothingEnabled` pelo módulo Rust direto, com fallback. Build: 138.010 bytes WASM + 31.704 bytes glue. Chrome 156 confirmou duas chamadas diretas e nenhuma escrita de propriedade Canvas pelo host no smoke curto. Regressões 82/82 e checks ABI/browser/pixel parity passaram. O renderer segue híbrido: esse smoke não cobre todos os menus, fases, expansões ou eventos. Sem benchmark, revisão visual ampla ou campanha completa.

## Etapa atual — preview local v160, conversão parcial

O lote Rust de poeira agora salva/restaura alpha e estilo do contexto, removendo a correção host em cada quadro no smoke. Chrome 156 confirma pixels iguais e zero setters Canvas host de globalAlpha no cenário base de gameplay. Regressões 82/82, ABI/browser e pixel parity passam; build direto 138.078 bytes WASM + 31.452 bytes glue. Esta medição de chamadas cobre uma sessão curta; camadas, interações e estados fora dela ainda precisam auditoria. Sem benchmark ou campanha completa.

## Etapa atual — preview local v159, conversão parcial

O passe de camada recortada e o alpha de composição agora chamam o módulo direto Rust/WebSys. O JS mantém câmera e integração. Os vetores gerados por kill() são enviados como Float64Array para Rust desenhar poças, rastros e gotas; ordem de RNG permanece no host. Chrome 156 confirmou RGBA exata nos casos de camada/sangue, e um kill de gameplay chamou Rust sem quadraticCurveTo no host. Regressões 82/82, ABI/browser e pixel parity passam. Build direto 137.834 bytes WASM + 31.452 bytes glue. Ainda há hooks, estados e composição que precisam auditoria/cobertura; sem benchmark, inspeção ampla ou campanha completa.

## Etapa atual — preview local v158, conversão parcial

Rust/WebSys mede e rasteriza os bitmaps cacheados dos rótulos de clima e estado de inimigos; JS conserva cache, fluxo e fallback. Chrome 156 encontrou igualdade RGBA nos dois tipos e o smoke não registrou `measureText` nem `fillText` nas rotas observadas. Build direto: 135.090 bytes WASM + 29.537 bytes glue. Regressões 82/82; checks ABI/browser e pixel parity passaram. Continua faltando converter várias operações, textos, composição de camadas e draw hooks; sem benchmark, inspeção visual ampla ou campanha completa.

## Etapa atual — preview local v157, conversão parcial

`clearCanvasRect` chama `clearRect` pelo módulo direto nas limpezas de canvas do piso, mapa Neon e sangue cacheado. Fallback continua no JS. Smoke Chrome 156: quatro chamadas diretas e nenhuma operação residual; paridade das outras camadas manteve os mesmos resultados. Build direto 121.452 bytes WASM + 27.180 bytes glue. Sem benchmark, inspeção visual ampla ou campanha completa.

## Etapa atual — preview local v156, conversão parcial

Criação de `ImageData` e cópia dos bytes ao Canvas passam por funções `web-sys` do módulo Rust direto. Cobre pixel buffers de piso/texturas, sprites radiais e muzzle, gradiente de saída e frames do jogador; cache de imagens e fallback ficam disponíveis. Smoke Chrome 156: 18 criações e 24 aplicações diretas; o dispatcher não registrou `createImageData` nem `putImageData`. As paridades do piso/texturas mantêm as tolerâncias históricas (piso máx 3/média 0,1882; texturas máx 76/média 0,00195), não são pixel-exatas. Build direto: 120.713 bytes WASM + 26.635 bytes glue. Sem benchmark, inspeção visual ampla ou campanha completa.

## Escopo desta cópia

O projeto separa a simulação (movimento, IA, colisões, campanha e saves) da saída gráfica. A simulação permanece em JavaScript. O objetivo desta cópia é substituir o renderer Canvas do jogo por uma implementação Rust/WebAssembly, conservando a mesma saída Canvas enquanto cada camada é portada.

O renderer existente tem três grupos de trabalho: composição estática do mapa (`paintMap`, piso, móveis, paredes e portas); desenho dinâmico por quadro (`draw`, jogadores, inimigos, armas, partículas, sangue e HUD); e expansões visuais que desenham em `fl`/`tp` ou no contexto principal (`exp-world.js` e `exp-fx.js`). O menu HTML/CSS e o áudio ficam fora do renderer gráfico.

## Etapa de integração atual — preview local v155, conversão parcial

Em v155, a função `drawCanvasImage` executa por Rust o desenho de imagens cacheadas, incluindo rótulo do clima e snapshots/restaurações `fl`/`tp`. Chrome 156 confirmou paridade RGBA do rótulo e, no smoke, 104 chamadas diretas sem `drawImage` residual. Texto, bitmap, fluxo e fallback ainda são controlados pelo host JS. Build direto: 117.055 bytes WASM + 24.576 bytes glue. Sem benchmark, inspeção visual ampla ou campanha completa.

Em v154, os callbacks de sangue dinâmico/estático e cadáveres chamam `web-sys` diretamente, mantendo alpha, transforms, paletas e paths. Chrome 156 comparou cinco marcas de cada tipo e três cadáveres sintéticos com diferença RGBA zero; o smoke inicial não produziu estes objetos ativos. Fallback JS mantido. Build direto atual após v155: 117.055 bytes WASM + 24.576 bytes glue. Sem benchmark, avaliação visual ampla ou campanha completa.

## Preview local v153 — poeira e faíscas

Em v153, `draw_dust_batch` e `draw_spark_batch` chamam o módulo Rust direto para rasterizar partículas de poeira e faíscas. Chrome 156 comparou as amostras com zero diferenças RGBA; uma partida usou a rota direta em 24 lotes/1.152 círculos de poeira. Build direto 112.638 bytes WASM + 22.301 bytes glue. Sem benchmark.

## Preview local v152 — labels de inimigos

Em v152, opcodes de texto de estado de inimigos passam ao Rust imagens já preparadas pelo cache `TXC`; `drawImage` ocorre no Canvas via `web-sys`. JS continua dono do cache, texto e posição. Rust valida o lote completo e usa fallback se não houver imagem suportada. Chrome 156 confirmou zero diferença RGBA no inimigo coberto e a rota direta para pelo menos um label. Build direto 109.955 bytes WASM + 21.236 bytes glue. Não houve benchmark, validação visual ampla ou campanha completa.

## Preview local v151 — rasterização direta de mapas

Em v151, os callbacks que rasterizavam os comandos de mapa no host foram agrupados e enviados ao módulo direto Rust. Regressões passaram 82/82; build direto 109.783 bytes WASM + 21.616 bytes glue. Assets/texturas de mapa e piso ainda incluem rasterização e transferências RGBA híbridas. Sem benchmark.

## Preview local v150 — rasterização direta de entidades

Comandos de móveis e de batches de atores/jogadores/inimigos, armas, fantasmas e aura podem ser rasterizados pelo módulo `wasm-renderer-direct` usando chamadas `web-sys` diretas. O fluxo de HUD bruto também desenha texto direto, preservando alpha e estado Canvas. JS mantém estado, transforma dados e fornece spritesheets; rótulos de inimigos ainda usam o painter de texto cacheado em JS. A rota antiga continua como fallback e ainda trata outras categorias de comandos. Chrome 156 comparou os casos cobertos: os batches de nove móveis, jogador e inimigo com spritesheets, arma, fantasma, aura e HUD tiveram diferença RGBA zero. O módulo direto na v150 media 94.595 bytes WASM + 18.707 bytes glue. Não houve benchmark, inspeção visual ampla nem validação da campanha completa. O renderer permanece híbrido.

Em v149, o caminho direto inclui também os motes: JS continua atualizando as posições e as fases; Rust calcula alpha e executa `fillRect` no contexto. Chrome 156 comparou dois tempos com zero diferença RGBA e confirmou a rota direta. O novo WASM direto mede 75.086 bytes + 10.135 bytes glue. Ainda há um fillRect por mote e não há benchmark. A maior parte do renderer segue na ponte anterior.

Em v148, chuva também chama Canvas pelo módulo direto: recebe o array intercalado x/y/comprimento e o stride 1/2; atualização, respawn, RNG e seleção do modo de qualidade continuam em JavaScript. Chrome 156 validou ambos os strides com zero diferença RGBA. O módulo direto é 74.574 bytes mais glue de 9.432 bytes; pausa e overlays permanecem exatos. Sem benchmark. A maior parte do renderer ainda não está portada.

Em v147, o módulo direto `web-sys` também desenha overlays de flash/pisca, alarme e cinema. O bridge passa estado, dimensões e tempos calculados pelo JS; Rust chama Canvas sem passar de volta pelo dispatcher antigo. Chrome 156 validou seis cenários de overlays e três estados de pausa com zero diferença RGBA. Build direto: 71.036 bytes WASM + 8.223 bytes glue. Não há benchmark; atores, mundo, HUD e muitas texturas ainda usam a rota anterior. Migração geral continua parcial.

Em v146 há um módulo separado compilado com `wasm-bindgen`/`web-sys` 0.3.106. O menu de pausa recebe o contexto e as dimensões e faz suas chamadas `fillRect`, `strokeRect` e `fillText` diretamente pelo Rust; estado da pausa, foco do mouse e eventos permanecem no JS. O painter antigo é fallback. Chrome 156 comparou três estados de foco com zero diferença RGBA. `direct_renderer_bg.wasm`: 34.353 bytes; glue JS: 7.513 bytes. As outras camadas seguem no bridge antigo ou em painters JS; não há benchmark e o renderer completo não está migrado.

Em v145, `BuildFloor` passa `WALLT`, `FURNT` e `DOORT` como spritesheets (96×24, 144×24 e 48×24). O bridge lê pixels de cada fonte uma vez por objeto/cache e copia ao buffer de entrada; Rust recorta as oito regiões 24×24 com limites validados e as entrega ao compositor RGBA existente. Isso remove a criação dos oito canvases intermediários de crop da rota WASM; quando a folha não pode ser lida, o host usa o painter JS. Sprites 24×24 antigos continuam aceitos pelo bridge. Build: 185.475 bytes; ABI, browser bridge e regressões 81/81 passaram. Chrome 156 pixel-parity manteve as medições v144 do piso, mapa e neblina; instrumentação registrou 14 chamadas `drawImage` no cenário, sem comparação A/B de desempenho. A leitura continua usando Canvas `getImageData`, há cópia entre host e WASM, e a imagem final ainda é aplicada ao Canvas. Nenhum benchmark ou inspeção visual ampla foi feito; renderer segue híbrido.

Em v144, o sprite estático de neblina/fumaça de nove gradientes é agora gerado em RGBA pelo Rust. JS consome os mesmos 27 valores aleatórios no ponto original para preservar o RNG e cria a textura sob demanda quando o clima aparece; o Canvas fallback usa esses mesmos parâmetros. Rust visita apenas bounds de cada círculo, testa distância ao quadrado antes da raiz e reusa o buffer de sprite radial 660×660. O Canvas recebe `ImageData` uma vez e depois é reutilizado nos três desenhos por quadro. Build: 184.656 bytes; ABI e browser bridge passaram; regressões 81/81 passaram. Duas execuções Chrome 156 compararam 512×256: alfa máximo 1/255 e média 0,107414/255; RGB máximo 12/255 em pixels com alfa≥64. Um smoke forçado confirmou sprite Rust e batch de fog ativos. O comparador usa limiar explícito; a textura e a integração não foram revisadas visualmente em cena longa. Sem benchmark. O renderer geral segue híbrido.

Em v143, paredes, móveis e decalques de portas abertas do piso são rasterizados em Rust no mesmo buffer RGBA. O host copia os pixels de até oito crops 24×24 para WASM e envia a camada por `putImageData`; a rota de comandos Canvas e o fallback continuam. Build: 181.969 bytes. ABI, browser bridge e regressões 80/80 passaram. Duas execuções Chrome 156 em Apartamento (1440×900, 50 sólidos, cinco aberturas) tiveram 240/5.184.000 canais diferentes, máximo 76/255 e média 0,00194695/255. O teste aceita máximo 80 e média 0,0025 por diferenças de borda; essa comparação não prova paridade ampla. O passe de piso combinado manteve máximo 3/255, média 0,188155 e o mesmo RNG. Sem benchmark ou inspeção visual ampla; HUD, sprites, entidades e draw hooks permanecem híbridos.

Em v142, Rust também rasteriza as sombras dos sólidos e as linhas do rejunte no buffer que já contém granulado e FTILES. A cobertura de retângulos fracionários é calculada por pixel; geometrias inválidas retornam ao fallback. A composição toda gera um único `putImageData` final. Build: 178.000 bytes; ABI, browser bridge e regressões 80/80 passaram. Chrome 156 comparou Apartamento 1440×900 (cinco salas, 50 sólidos): 347.083/5.184.000 canais diferentes, máximo 3/255, média 0,1882/255, mesmo RNG e zero exceções JS. O teste impõe esses limites; a saída não é pixel-idêntica nem foi revisada visualmente em várias fases. Sem benchmark. Outras camadas e hooks permanecem híbridos.

Em v141, o Rust rasteriza FTILES sobre a camada RGBA existente de granulado, usando os pixels originais 72×24, o offset de fase horizontal e o recorte de salas; exclui o corredor. O host passa os pixels do asset ao buffer wasm e envia o resultado com `putImageData`. Fallback Canvas continua disponível para dimensões/geométricas não aceitas e falhas. Build: 175.939 bytes. ABI, bridge e regressões 80/80 passaram. Teste Chrome 156 em Apartamento (1440×900, cinco salas): estado RNG igual, 335.188/5.184.000 canais com diferença, máximo 3/255 e média 0,1937/255. O teste aplica tolerância (máximo 3, média 0,2); não é paridade exata nem inspeção visual ampla. Sem benchmark. Sombras e rejunte foram migrados em v142; sprites, muitos draw hooks e rasterização Canvas seguem pendentes.

Em v140, Rust rasteriza o granulado seeded do piso diretamente num buffer RGBA reutilizável (limite 1440×900; 5.184.000 bytes) e o host transfere a camada com um `putImageData`, em vez de enviar cada retângulo de speck. O fallback JavaScript permanece. Build: 174.197 bytes; ABI, browser bridge e regressões 80/80 passaram. Chrome 156 comparou um mapa completo 1440×900/8.100 specks: 0 diferenças em 5.184.000 canais e o mesmo estado RNG; Apartamento em `play`, sem exceções. Sem benchmark ou inspeção visual ampla. As outras camadas e a rasterização do Canvas seguem pendentes.

Em v139, os dois painéis do elevador são rasterizados por Rust usando seus offsets dentro do gradiente original de largura total. As texturas esquerda/direita são cacheadas separadamente. Chrome 156 mediu diferença máxima de 1/255 por canal para quatro gradientes sintéticos (escada, corpo, porta esquerda/direita); Apartamento iniciou em `play`, WASM ativo e zero exceções. ABI e bridge passaram; regressões em rerun. Sem benchmark ou validação visual ampla. O host ainda rasteriza os comandos com Canvas e mantém fallback.

Em v137, o gradiente diagonal da saída é rasterizado em RGBA por Rust e guardado por tamanho/estado. Como ambos os alphas das paradas variam pelo mesmo fator com o pulso, o host gera a textura no pulso máximo e aplica o fator `(1+pulse)/2` via alpha ao reutilizá-la; assim evita regenerar pixels por quadro. O Canvas original segue fallback. Build: 171.352 bytes; ABI/browser bridge e regressões 79/79 passaram. Chrome 156 em Apartamento/`play`, sem exceções; a saída real de 188×70 é atendida. Comparação sintética 100×40: max alpha 1/255, média 0,101/255, RGB máximo 8 e centro idêntico. Sem benchmark ou validação visual ampla.

Em v136, o clarão radial de cada disparo é substituído no caminho WASM por um sprite RGBA gerado uma vez em Rust e desenhado pelo host com `drawImage`, composição `lighter` e alpha original por efeito. O fallback JS com gradiente permanece. Build: 170.517 bytes; ABI, browser bridge e regressões 78/78 passaram. Smoke Chrome 156 iniciou Apartamento em `play`, executou um muzzle flash sintético pelo batch e não registrou exceções. Comparação do sprite 128×128 com Canvas: alpha idêntico; diferença RGB máxima 8 em pixels visíveis. Sem teste visual de combate ou benchmark.

Em v135, o gerador radial em Rust usa uma estimativa de raiz quadrada por bits seguida por três passos de Newton, reduzindo de até doze iterações por pixel. Build: 169.533 bytes. ABI, browser bridge e regressões 77/77 passaram. Chrome 156 iniciou Apartamento em `play`, WASM ativo e zero exceções; comparação sintética de raio 65,5 teve alpha máximo 1/255 e centro idêntico. Uma varredura numérica de 3.300 raios amostrou 500 pixels por raio sem divergência no alpha arredondado. O smoke separou as chamadas de inicialização (22 `drawImage`, 2 `createPattern`) e o rótulo climático cacheado (`measureText`/`fillText`). Sem benchmark nem paridade visual ampla.

Em v134, Rust gera os pixels RGBA dos sprites de luz radial num buffer de até 660×660; o host os copia para `ImageData` e mantém Canvas como fallback. Quatro sprites compartilhados são inicializados no primeiro quadro, permitindo usar WASM se já estiver ativo; luzes dinâmicas seguem a mesma rota. Build 169.701 bytes, regressões 77/77, ABI/browser bridge e smoke Chrome 156 em Apartamento passaram, sem exceções. No smoke, as chamadas de gradiente (`createRadialGradient`, `addColorStop`) e os `fillRect` usados para esses sprites desapareceram do bridge; restaram 22 `drawImage` de tiles na montagem, 2 `createPattern`, 1 `measureText` e 1 `fillText`. Comparação de alpha de um sprite: erro máximo 1/255 e média 0,126/255; há diferenças de cor nas bordas translúcidas, sem inspeção visual da cena inteira ou benchmark.

Em v133, Rust gera a geometria da vendedora, do temporizador, do balão, dos cards e do reroll em comandos ordenados. O host mantém a rasterização Canvas; textos usam batch HUD e glifos são rasterizados no host. Um contexto auxiliar mede o balão sem repetir save/restore ou configuração de fonte por quadro. Regressões 76/76, ABI, browser bridge e smoke sintético em Chrome 156 passaram sem exceções. No cenário sintético, chamadas do bridge da loja caíram de 333 `save`, 333 `fillRect`, 272 `strokeRect`, 61 `restore` e 7 `measureText` para 7 `measureText`; isso não mede frame time nem comprova paridade visual. Painter JS mantido como fallback.

Em v132, o texto do dealer, cards, reroll e balão da loja é enviado pelo batch HUD Rust. O host ainda rasteriza os glifos no Canvas, e o cache de wrap evita medir novamente texto/fonte idênticos. O painter JavaScript permanece como fallback. Regressões 75/75, ABI Rust/WASM e browser bridge passaram. Sem smoke runtime válido, comparação de pixels ou benchmark nesta versão. As geometrias da loja, rasterização Canvas e outras camadas ainda não foram migradas.

Em v131, o texto direto de créditos no overlay da loja usa o batch HUD já validado pelo Rust. O callback Canvas host aplica texto, fonte, cor, alinhamento e alpha efetivo sob bypass do dispatcher genérico, preservando o painter JavaScript como fallback. Regressões 74/74, ABI e browser bridge passaram; binário existente: 165.499 bytes. Smoke Chromium em Apartamento confirmou WASM pronto/ativo, jogo em `play` e zero exceções; os resíduos de créditos desapareceram do bridge (1 `fillText` de cache do clima, zero `save`/`restore`, 22 `drawImage` de montagem em 2,5 s). Sem comparação de pixels ou benchmark. A rasterização continua Canvas e a migração está incompleta.

Em v130, drawTransp envia a string do rótulo ao batch HUD Rust quando o transporte foi desenhado por WASM; coordenada, cor, fonte, alinhamento, ordem e fallback tx() permanecem. ABI, browser bridge e regressões 73/73 passaram. Smoke Chromium confirmou Apartamento no estado `play`, WASM pronto/ativo e zero exceções; 86 `fillText`, 85 `save`/`restore` e 22 `drawImage` residuais em 2,5 s. Sem inspeção de paridade visual ou benchmark. WASM: 165.499 bytes.

Em v129, o host restaura globalAlpha para 1 após o batch de fantasmas apenas quando o estado atual difere; o fallback JS mantém o reset quando desenha fantasmas manualmente. ABI/bridge e regressões 72/72 passaram; WASM inalterado (165.499 bytes). O smoke desta versão permaneceu em loading e não serve como validação visual/runtime. Renderer continua híbrido.

Em v128, os dois escopos save/restore externos do draw() passam a ser comandos dos próprios batches Rust de transformação: stage 0 abre o frame antes do screen shake, stage 1 abre o mundo antes do kick/camera shake, e stages 3/4 fecham a pilha nos mesmos pontos anteriores. A sequência de transforms permanece, o fallback JS abre/fecha quando o batch está inativo ou rejeita entradas, e o host rasteriza. Build: 165.499 bytes; ABI, browser bridge e regressões 71/71 passaram. Smoke Chromium em Apartamento permaneceu em play durante a amostra, módulo pronto, 774 comandos de transformação e zero exceções; sem comparação visual ou benchmark.

Em v127, o passe aditivo de luz retorna antes de abrir `save/restore` ou alterar `globalCompositeOperation` quando não há luz ativa, clarão de disparo nem reflexo de chuva. A procura por luzes continua ocorrendo também sem WASM, e o painter Canvas original permanece ativo quando há efeitos; a preparação de sprites é restrita ao caminho Rust. ABI, browser bridge e regressões 70/70 passaram. Smoke Chromium na tela inicial confirmou o módulo pronto por 89 quadros; um smoke separado iniciou Apartamento, entrou em `play` e chegou a `dead` sem entrada do jogador, acumulando 706 chamadas Canvas e zero exceções. Não houve comparação visual ou benchmark. WASM: 165.209 bytes.

Com `?renderer=wasm`, a ponte genérica encaminha ainda métodos/setters Canvas 2D, CanvasGradient, CanvasPattern e Path2D não portados, preservando receptor, argumentos, retorno e erros. As camadas concretas portadas emitem comandos em lote. Rust calcula padrões determinísticos de piso, detalhes de sala, sombras/faces de paredes/postes, sombra/aura do jogador, sombras inimigas, comandos para os 17 móveis, armas e portas sem sprite; também cria frames RGBA procedurais e seleciona células de spritesheets. Desde v67 gera corpos geométricos e recortes de inimigos em buffer ordenado, com alpha de nocaute. Em v68 gera em um lote a composição de até três jogadores: transform, sombra/halo, arma, sprite ou frame fallback, acentos de skin e tag P1/P2. Em v69 inclui no range do inimigo os seis círculos animados do stun. Em v70 decide e posiciona rótulos de stun, nocaute, suspeita e alerta; o host mapeia IDs e chama `tx()` cacheado. Em v71 Rust gera fundo fixo, overlay e decor/tapetes; `paintMap` ainda monta os dados e controla a sequência. Em v72 Rust gera comandos para painéis de vidro intactos e estilhaços; a atualização de vida/remoção de fragmentos fica em JavaScript. Em v73 a geração do granulado, das sombras dos sólidos e do rejunte do piso passou a lotes determinísticos Rust. Em v74 Rust seleciona e ordena geometria de texturas repetidas de paredes/móveis e decalques de aberturas; o host mantém assets e rasteriza. Em v75 Rust também escolhe, ordena e posiciona o overlay `FTILES`, incluindo a exclusão do corredor e o offset horizontal; o host mantém a imagem e aplica `createPattern`, clipping e fills no Canvas. Em v76 Rust emite em lote as transformações e handles de imagem das portas Neon com sprite; o host mantém os assets e rasteriza, enquanto animação e interação seguem no JS. Em v77 Rust filtra partículas de poeira inválidas, limita a opacidade e emite a geometria dos círculos em lote. Em v78 Rust agrupa as faíscas por cor e faixa de opacidade e descarta partículas expiradas antes de emitir retângulos; o host rasteriza os lotes com composição aditiva `lighter`. Em v79 Rust valida e ordena os pontos de sangue dinâmico, preservando o alfa e a ordem da simulação; o host mantém preenchimentos individuais para conservar a composição das manchas sobrepostas. Em v80 Rust gera os arcos do sangue estático em cache em um lote, mantendo a invalidação e a reutilização da camada com o host Canvas. Em v81 Rust prepara, na ordem original, as elipses de sombra e corpo dos cadáveres; o host Canvas restaura o contexto por ator. A rasterização final ainda é Canvas 2D, sem callbacks reentrantes durante a geração Rust. Em v82 Rust escolhe o sprite e resolve o ponto de desenho dos projéteis, mantendo os assets e a ordem do array no host. Em v83 Rust calcula o recorte fonte/destino das camadas cacheadas da câmera e só emite desenho quando há área visível. Em v84 a ponte de navegador exercita poeira, faíscas, sangue dinâmico/cacheado, cadáveres, projéteis e recorte de camadas, além dos lotes anteriores. Em v85 Rust projeta as cápsulas de munição do espaço do mundo para a tela e agrupa as elipses para o host Canvas. Em v86 Rust calcula a projeção das silhuetas circulares de inimigos vivos para o overlay de escuridão. Em v87 Rust mantém a sequência dos clarões radiais e arcos de impacto; o host mantém o gradiente Canvas e a composição aditiva. Em v88 Rust percorre pickups em ordem, gera pulso de brilho e transformação; o host desenha os brilhos e chama o renderer Rust de armas reentrantemente. Em v89 Rust coordena os itens arremessados por pose e arma; o host aplica transformações e chama o desenho Rust do ícone. Em v90 Rust gera comandos de geometria para escadas e elevadores (degraus, portas, painel, seta e bordas); o host conserva os gradientes e os traços Canvas. Em v91 Rust gera os comandos de geometria da saída (brilho, gradiente, hachuras e bordas); o host rasteriza no Canvas, enquanto o rótulo permanece no cache de texto existente. Em v92 Rust emite os dois preenchimentos de color grade, incluindo a ordem de composição soft-light/overlay e as dimensões do canvas; o host os aplica em um lote preservando save/restore. Em v93 Rust decide e ordena fade/flash finais, valida dimensões/alfa e emite as cores e geometrias para o host Canvas; o host preserva save/restore. Em v94 Rust emite a geometria da barra de combo, da moldura da máscara e do véu de pausa; o host aplica cores/primitivas e preserva estado do Canvas. Em v95 Rust compõe em lote os rastros do jogador — sombra, arma, alfa, corpo e ordem — usando os mesmos parâmetros visuais do painter fallback. Rust também filtra/ordena inimigos.

Em v96 o HUD principal, textos da máscara/atributos, sala limpa/pausa, saída, transporte, coleta, popups e banners enviam listas de texto, posição, alinhamento e alfa validadas pelo Rust; o host conserva cores/fontes, cache `tx()` e rasterização Canvas. Em v97 Rust filtra e prepara em lote segmentos de chuva, mantendo avanço/respawn e RNG no JS; host desenha todos os segmentos num caminho Canvas com fallback antigo. Smoke Chromium forçado em `play` confirmou renderer ativo, 6.240 segmentos e zero exceções; a captura foi inspecionada. Em v98 Rust valida a lista de partículas de poeira ambiental e calcula seu alpha sinusoidal; o host desenha os quadrados, enquanto movimento/wrap/respawn ficam no JS. Smoke Chromium em `play` emitiu 2.592 comandos sem exceções e teve captura inspecionada. O texto artístico do combo e draw hooks de expansão continuam em JS.

Em v99 Rust calcula em lote o corte de qualidade, o estilo/composição, o alfa e as três posições animadas de névoa/fumaça; o host continua usando os handles de imagem e `drawImage`, com fallback JS. Smoke Chromium em Apartamento durante `play` emitiu 111 placements em 37 quadros sem exceções e a captura foi inspecionada. Sem comparação lado a lado ou FPS.

Em v100 Rust gera em lote a geometria de clarões da chuva/neon, do pulso vermelho do alarme e das barras cinematográficas. O host mantém as cores e a rasterização Canvas via `fillRect`, com save/restore; timer, clima e texto do alarme seguem JS. Smoke Chromium em Apartamento durante `play` gerou 79 comandos para chuva, flashes, alarme e cinema sem exceções; captura inspecionada. Sem comparação lado a lado ou FPS.

Em v101 Rust calcula em lote pulsos, cintilação Neon, stride por qualidade e geometria das luzes aditivas, do clarão de disparo e do reflexo de chuva; o host mantém os sprites e rasteriza Canvas. Smoke Chromium reportou 115 comandos, jogo em `play` e zero exceções; captura inspecionada.

Em v102 Rust projeta o jogador e gera os raios da luz central, cone da lanterna e clarão de disparo para a máscara de apagão. O host mantém sprites, clipping e rasteriza a layer Canvas de 480×300, composta na tela de 960×600. ABI, browser bridge e regressões 61/61 passaram. Smoke Chromium em `play` forçou apagão/disparo em Apartamento, emitiu 17 comandos e não registrou exceções; captura inspecionada. Sem comparação lado a lado ou FPS.

Em v103 Rust valida o valor do combo e calcula o pulso do multiplicador; o host aplica o mesmo texto Impact, o contorno, o preenchimento e a ordem Canvas. ABI, browser bridge e regressões 61/61 passaram. Smoke Chromium em `play` forçou combo 5X em Apartamento, emitiu 13 comandos e não registrou exceções; captura inspecionada. Não houve comparação lado a lado nem medição de FPS.

Em v104 Rust escolhe estágio, imagem e retângulo para a vinheta de gameplay, vinheta da HUD e retrato da máscara, preservando os três pontos de composição originais; o host mantém os assets e faz `drawImage`. ABI, bridge e regressões 61/61 passaram. Smoke Chromium em `play` em Apartamento emitiu 48 comandos de imagem, sem exceções; captura inspecionada. Sem comparação lado a lado ou FPS.

Em v105 Rust valida o timer do alarme e determina o centro/linha de base do rótulo. O host conserva texto formatado, fonte, cor, alinhamento e rasterização `fillText`, sem alterar a ordem após o overlay do alarme. Em v106 Rust recebe as dimensões do canvas cacheado e determina o retângulo da etiqueta climática; o cache, asset e rasterização ficam no host. Em v107 `EXP.worldDraw` envia a lista de anéis ativos em lote: Rust valida cada registro e calcula raio expansivo, alfa e espessura; o host mapeia cores e rasteriza cada arco. Timers e mutação continuam no JS. Em v108 o hook da Invasão passa x/y/relógio ao Rust para calcular a opacidade pulsante da zona; o host preserva o traço e o preenchimento Canvas. Em v109 os barris enviam posição, raio e timer por uma entrada reutilizada de 16 slots; Rust gera a sequência original de desenho, inclusive o pisca de armamento, e o host rasteriza em Canvas. Simulação e fallback seguem no JS. Build de v109: 140.778 bytes; ABI, bridge e regressões 64/64 passaram. O smoke v110 também mostrou barril ativo. Não houve smoke do modo Invasão, comparação lado a lado ou FPS.

Em v110, as câmeras também enviam posição, ângulo, alarme e 13 vértices do cone em batch reutilizado; Rust gera o caminho fechado e o corpo/lente, e o host rasteriza no Canvas. Build 146.848 bytes; ABI, bridge e regressões 65/65 passaram. Smoke Chromium em Apartamento chamou `EXP.worldDraw` durante `play` com uma câmera sintética, registrou uma chamada WASM e zero exceções; captura inspecionada. Sem comparação lado a lado ou FPS.

Em v111, realces de classe inimiga enviam ao Rust até 256 inimigos e paleta dinâmica, filtrados por classe, nocaute e alcance; Rust gera contornos, barras de armadura, coroa, laser do atirador e pulso/linha de carga do chefe. A simulação, a visibilidade, o corpo base e os estados continuam no JS; o host rasteriza comandos Canvas e mantém fallback. Build de 152.256 bytes; ABI, bridge e regressões 66/66 passaram. Smoke Chromium em Apartamento chamou `EXP.worldDraw` com quatro classes sintéticas, contou quatro candidatos e não registrou exceções; captura inspecionada. Sem comparação geral ou FPS.

Em v112, screen shake passa pelo Rust antes do save interno e kick/camera shake depois dele, em duas chamadas que preservam o escopo Canvas original. Em v113, um terceiro estágio emite a sequência de enquadramento: centro, escala, centro inverso e posição da câmera. O JavaScript conserva amostras aleatórias, decaimento dos timers e calcView; Rust valida entradas e emite os transforms, com fallback. Build: 154.462 bytes; ABI, browser bridge e regressões 67/67 passaram. Smoke Chromium em Apartamento confirmou o renderer ativo e zero exceções; captura inspecionada. Sem comparação ampla ou medição de desempenho.

Em v126, Rust também valida dimensões e emite o retângulo de fundo que cobre a viewport mais a margem de screen shake; Canvas mantém cor/rasterização e JS fallback. Build: 165.209 bytes; ABI, browser bridge e regressões 69/69 passaram. Sem smoke visual comparativo ou benchmark.

Em v125, Rust valida/aplica escala e estado de suavização do contexto Canvas como um comando e cacheia a configuração para evitar repetir `setTransform` e dois setters em cada frame; resize força nova aplicação. A auditoria opcional `?wasmDiagnostics=1` agrega contagem e primeira stack de métodos/propriedades que seguem no bridge genérico. Build: 164.789 bytes; ABI, browser bridge e regressões 68/68 passaram. Após essa integração, numa amostra de 402 frames da tela inicial, `setTransform` e os setters de suavização não apareceram no histograma residual. Sem benchmark de frame time ou CPU.

Em v123, o batch de formas Rust gera o véu e os dois botões do menu de pausa, incluindo dimensões, cores, contornos e hover; a integração JavaScript conserva hit test, cliques, rótulos e fallback. Build: 164.199 bytes. ABI, browser bridge e regressões 68/68 passaram. Smoke Chromium curto abriu uma fase e a captura foi inspecionada, com zero exceções JS observadas; o selo registrou 23.856 chamadas Canvas residuais. Sem comparação lado a lado, validação manual do menu de pausa ou medição de desempenho.

Em v122, os três textos no painel de pausa de modos são agrupados em uma chamada ordenada ao batch Rust; os dados e fallback continuam JS e o host mantém `tx()` cacheado. Binário inalterado; ABI, browser bridge e regressões 68/68 passaram. Smoke Chromium em pausa sintética enviou quatro textos (incluindo o título do modo) ao batch sem exceções. Sem comparação visual ampla ou FPS.

Em v121, textos dinâmicos de pente/munição, recarga e aviso de tecla C usam o batch Rust de textos HUD. JavaScript mantém estado/condições, o host mantém `tx()` e painter fallback. O binário não mudou (163.095 bytes); ABI, browser bridge e regressões 68/68 passaram. Smoke Chromium chamou o `EXP.drawHUD` com pente e recarga sintéticos, enviou dois textos e não gerou exceções. Sem comparação visual ampla ou FPS.

Em v120, o flash vermelho do modo Contrarrelógio usa o batch Rust existente: JS mantém a oscilação temporal e envia alfa/dimensões; Rust emite cor/vermelho e geometria de tela cheia, o host rasteriza e JS conserva fallback. Build: 163.095 bytes; ABI, browser bridge e regressões 68/68 passaram. Sem comparação visual ampla ou FPS.

Em v119, o rótulo superior do modo/campanha ativo envia texto, cor, posição, alinhamento e fonte para o batch Rust de textos HUD. A escolha/formatação do nome e painter fallback continuam JS; host usa `tx()` cacheado. O binário WASM não mudou; ABI, browser bridge e regressões 68/68 passaram. Smoke Chromium enviou três textos ao batch no `EXP.drawHUD`, sem exceções; captura inspecionada. Sem comparação visual ampla ou FPS.

Em v118, até três avisos HUD visíveis (título/subtítulo) são agrupados na ordem atual e enviados ao batch Rust de texto; timers e fallback permanecem no JS, e o host continua chamando o `tx()` cacheado. Build WASM permanece 162.939 bytes; ABI, browser bridge e regressões 68/68 passaram. Smoke em Chrome chamou `EXP.drawHUD`, confirmou dois comandos de texto, exibição de título/subtítulo e zero exceções; captura inspecionada. Sem comparação ampla ou FPS.

Em v117, a barra de recarga usa o batch de formas HUD: Rust emite fundo e preenchimento proporcional; o host rasteriza cores e formas, e JS mantém o timer, texto e fallback. Build: 162.939 bytes; ABI, browser bridge e regressões 68/68 passaram. Sem medição de desempenho.

Em v116, a seta que aponta para a zona da Invasão envia centro e orientação ao Rust, que gira os três vértices e os entrega ao host para rasterização. O JavaScript ainda calcula a projeção da zona e mantém o desenho fallback. Build: 162.668 bytes; ABI, browser bridge e regressões 68/68 passaram. Sem comparação visual ampla ou medição de desempenho.

Em v115, a barra de vida do chefe envia dimensões, vida e limites das fases para um batch Rust que calcula fundo, preenchimento, marcadores e contorno na ordem original; a posição do título usa o batch Rust existente de textos HUD. O host conserva cor dinâmica, texto e rasterização, enquanto estado e fallback seguem em JS. Entradas inválidas ou acima de oito marcadores preservam o painter original. Build: 162.121 bytes; ABI e browser bridge passaram, regressões 68/68. Smoke sintético no Chromium confirmou a chamada com renderer ativo e zero exceções; sem comparação ampla ou medição de desempenho.

Em v114, EXP.glassDraw envia painéis intactos e estilhaços ativos em buffers fixos para Rust emitir transparência, contornos, reflexo móvel e fragmentos triangulares rotacionados. Quebra, movimento, vida e aleatoriedade continuam em JS; entradas inválidas ou acima de 96 painéis/160 estilhaços usam o painter anterior. Build: 160.939 bytes; ABI e browser bridge passaram, regressões 68/68. Smoke sintético no Chrome sem exceções; captura inspecionada. Sem comparação geral ou medição de desempenho.

**A migração ainda não é completa:** `paintMap` ainda coordena as camadas, sangue/partículas, expansões visuais, imagens especiais do HUD e várias chamadas Canvas continuam em JavaScript; o navegador ainda rasteriza Canvas 2D. Os frames procedurais WASM entram no fallback sem spritesheet. A ponte genérica residual pode acrescentar custo por chamada; não houve medição de desempenho nem comparação lado a lado de imagem. O modo padrão permanece JavaScript e não depende do módulo.

## Teste local

1. Extraia o ZIP e instale Node.js 18 ou superior.
2. Dê duplo clique em `INICIAR_EXPERIMENTO_WASM.bat`.
3. Confirme o selo WASM e inicie uma fase. O texto resumido mostra chamadas Canvas residuais acumuladas; o tooltip lista métricas de rasterização e comandos gerados pelo módulo. A captura headless de Apartamento confirma execução curta; não substitui validação manual de todos os mapas/modos nem comparação visual com JavaScript.
4. Para o modo original, abra `http://127.0.0.1:8787/`.

O ZIP inclui o binário compilado `wasm-renderer/pkg/renderer.wasm`; Rust só é necessário para recompilar. O crate usa ABI WASM sem dependências externas. Instale Rust e o target `wasm32-unknown-unknown`, então execute `./wasm-renderer/build.ps1` no PowerShell.

## Verificações

`node tests/wasm-renderer.cjs` valida ABI, lotes de jogador/inimigo, ordem/alpha, fundo/decor, vidros, estilhaços, geometrias e rótulos de stun, spritesheets, granulado/RNG, sombras/rejunte, texturas `FTILES` e do mapa, portas Neon com sprite e portas comuns, móveis, armas e paridade pixel a pixel dos frames procedurais; `node tests/wasm-renderer-browser.cjs` valida execução Canvas simulada, lotes de piso e vidro, padrões e recortes de textura, cores de decoração, painter cacheado/raw, alpha e fallback; `node tests/wasm-hud-image-batch-parity.cjs` compara o lote Rust de imagens do HUD no Chrome; `node tests/wasm-procedural-sprite-parity.cjs` compara pixels dos sprites radiais/neblina; e `node tests/regression.cjs` valida o jogo existente, integração das portas Neon, cache e health endpoint. A validação headless de um mapa Neon com portas ainda está pendente; smoke curto em Apartamento não prova paridade geral nem benchmark. Não declare ganho de FPS sem medir os dois modos no mesmo hardware.
## v182.0 — painter Rust para retângulos legados de piso

O lote `draw_floor_batch` agora tenta `drawFloorCommands` no módulo Rust direto para pintar os mesmos `fillRect` com a paleta que o WASM legado fornece. O fallback JavaScript continua para incompatibilidades. Smoke Chrome 156 contou 47 chamadas diretas durante `newGame`; lote sintético de três retângulos teve zero diferenças RGBA e preservou fillStyle, alpha e composite. Regressões 84/84. Sem benchmark, inspeção visual ampla ou campanha completa.
## v205.0 — arte procedural das máscaras em pintura direta
Rust/WebSys rasteriza as 16 máscaras adicionadas pela expansão a partir de parâmetros e paleta fornecidos pelo JS. Quando o módulo termina de carregar, as imagens são reconstruídas e a grade é atualizada. Canvas original continua como fallback; comportamento e dados da coleção não mudam. Ver `tests/wasm-mask-art-parity.cjs` para comparação pixel a pixel.

## v206.0 — paridade dos ícones das armas novas
Os 12 IDs de armas de expansão já chegam ao painter Rust direto. Um teste Chrome comparou esse caminho ao callback Canvas de fallback e expôs diferenças em pump, dupla, carabina, sniper, LMG e machado; cores e contorno foram corrigidos até obter zero canais RGBA diferentes. Estado e lógica da arma preservados. Ver `tests/wasm-exp-weapon-icon-parity.cjs`.

## v214.0 — projeção direta dos contornos noturnos
A lista de inimigos, câmera, tamanho da tela e zoom são enviados em um buffer compacto. Rust filtra inimigos mortos, projeta as posições e calcula raio/cor dos círculos antes de chamar o painter. A simulação e o fallback antigo continuam no host/WASM legado. Chrome comparou vivos, derrubados e mortos com zero canais RGBA diferentes, restaurando alpha, composição e estilos. Sem benchmark nem revisão visual ampla.

## v213.0 — sangue e corpos a partir de estado direto
O bridge envia posição, raio, alpha, ângulo e tipo dos efeitos já atualizados pela simulação. Rust valida os registros, deriva os comandos de marcas/corpos e pinta por WebSys sem solicitar esses lotes ao WASM legado. Fallback antigo preservado. Chrome comparou sangue ao vivo, sangue estático e corpos com fallback: zero canais RGBA diferentes e composição/alpha iguais. Sem benchmark nem revisão visual ampla.

## v212.0 — geometria direta de poeira e faíscas
O bridge envia posições, raios, vida e paleta dos efeitos de poeira/faísca. Rust valida partículas, calcula os níveis de alpha e monta as formas para o Canvas sem pedir o lote ao WASM legado. A rota antiga segue como fallback. Chrome comparou o painter anterior e o caminho direto: zero canais RGBA diferentes, com alpha e composição restaurados. Sem benchmark ou revisão visual ampla.

## v211.0 — geometria de escadas, elevadores e saídas em Rust direto
O host mantém a seleção e os valores de cada transporte/saída. Rust agora monta a geometria e pinta diretamente, sem receber o lote produzido pelo WASM legado; os painters de lote e a rota antiga continuam disponíveis para fallback. Chrome comparou escada, elevador e saídas concluídas/não concluídas contra o caminho anterior com zero diferenças RGBA; a suíte ampla direta também passou sem diferenças nos casos cobertos. Build, regressões 90/90, renderer e browser bridge passaram. Sem benchmark ou revisão visual ampla.

## v210.0 — gradientes de saída e transporte em Rust direto
Rust/WebSys agora gera e escreve os gradientes cacheados de escadas, elevadores, portas e saídas diretamente em seus canvases. As imagens foram comparadas com as fórmulas do WASM legado: quatro variantes de transporte e os estados concluído/não concluído tiveram zero diferenças RGBA. O WASM legado ainda gera a geometria de comandos de escada/elevador/saída e continua como fallback de geração dos gradientes. O teste focado também abriu a rota ativa de escada, elevador e saída; sem benchmark ou revisão visual ampla.

## v209.0 — geração Rust direta de sprites radiais e de névoa
Os sprites radiais usados por luzes/clarões e a textura procedural de neblina/fumaça agora são calculados e escritos em Canvas pelo módulo Rust/WebSys direto. O host continua escolhendo cores, raios e os nove anéis do sprite; o WASM legado permanece como fallback. Chrome comparou as imagens RGBA de um sprite radial e um sprite de névoa com zero diferenças. Sem benchmark ou revisão visual ampla.

## v208.0 — lote direto de imagens cacheadas do HUD
O lote principal de textos cacheados do HUD agora prepara os canvases de texto já usados pelo jogo e envia imagens, posições e alpha ao painter Rust/WebSys numa chamada direta. Isso remove o callback de pintura JS por texto nessa rota e preserva o fallback anterior. `tests/wasm-floor-pixel-parity.cjs` compara três imagens/alphas no Chrome com zero diferenças RGBA e verifica que o alpha externo é restaurado. Sem benchmark, campanha completa ou revisão visual ampla.

## v207.0 — barra do chefe com pintura Rust direta
Rust/WebSys pinta barra, fração de vida, marcadores de fase e borda no contexto. O host valida e envia dimensões, cor e fração; o batch legado continua como fallback. `tests/wasm-boss-hud-parity.cjs` compara pixels, alpha, composição e transformação.
## v260.0 — migrar chuva e poeira para painters diretos
Chuva e partículas de poeira usam somente Rust/WebSys direto; removidos buffers, exports e callbacks duplicados do WASM legado. Simulação e aleatoriedade permanecem no JavaScript, e o jogo mantém fallback Canvas. WASM legado: 161.040 bytes, 15 imports e 100 exports (v259: 162.701 bytes, 17 imports e 106 exports). Build, regressão 102/102, ABI, browser bridge, paridade direta ampla e piso passaram. Chrome comparou chuva e poeira com zero diferenças RGBA. Sem benchmark ou revisão visual manual ampla.

## v261.0 — migrar barris, câmeras e acentos de inimigos para painters diretos
Barris, câmeras e realces/telegráficos de inimigos agora usam Rust/WebSys direto; os chamadores mantêm os painters Canvas como fallback. Removidos do WASM legado os três batches, seus buffers e seis exports. O módulo legado caiu de 161.040 para 146.123 bytes, mantendo 15 imports e reduzindo exports de 100 para 94. Build, regressão 102/102, ABI, browser bridge e paridade Chrome passaram. Os três grupos de efeitos tiveram zero diferenças RGBA; nenhuma medição de desempenho ou revisão visual manual ampla foi feita.

## v266.0 — setup e fundo de quadro sem rota legada
O setup do Canvas raiz (transformação e smoothing) e o preenchimento do fundo de cada quadro usam painters Rust/WebSys diretos. Removidos `set_canvas_setup`, `fill_frame_background` e seus exports do WASM legado; em falha, o jogo continua com os caminhos Canvas originais. O módulo caiu de 135.898 para 134.896 bytes, de 10 para 8 imports e de 80 para 78 exports. Build, regressão 102/102, browser bridge e paridade Chrome passaram; os casos de setup compararam transformação/smoothing e o fundo teve zero diferenças RGBA. Sem benchmark ou revisão visual manual ampla.

## v267.0 — transforms de quadro sem batch legado
Screen shake, recoil/kick, tremor de câmera, zoom e deslocamento da câmera são aplicados pelo Rust/WebSys direto. Removidos `FRAME_TRANSFORM_INPUT`, `frame_transform_input_ptr` e `draw_frame_transforms` do renderer legado; em falha, o jogo usa as operações Canvas originais. O módulo caiu de 134.896 para 132.404 bytes e de 78 para 76 exports (8 imports). Build, regressão 102/102, ABI, browser bridge e paridade Chrome passaram; os transforms e os dois escopos save/restore coincidiram com o fallback, e valores inválidos não alteraram o contexto. Sem benchmark ou revisão visual manual ampla.

## v268.0 — sombra/aura de jogador sem export legado
A sombra elíptica e o brilho ciano/rosa do jogador agora usam painter Rust/WebSys direto, com save/restore próprio. Removido `draw_player_aura` do WASM legado; o painter Canvas original do jogo continua. O módulo caiu de 132.404 para 132.196 bytes e de 76 para 75 exports (8 imports). Build, regressão 102/102, ABI, browser bridge, Chrome e auditoria de pixels passaram; aura teve zero diferenças RGBA e P1/P2 mantiveram cores/geometria. Sem benchmark ou revisão visual manual ampla.

## v264.0 — saída de fase sem batches legados
A saída de fase e seu gradiente agora passam apenas pelos painters Rust/WebSys diretos quando a prévia está ativa; se o caminho direto não puder desenhar, o bridge cede ao painter Canvas original do jogo. Removidos dois callbacks de host, buffers RGBA/command e três exports do renderer legado. O módulo caiu de 140.548 para 138.556 bytes, imports de 12 para 10 e exports de 84 para 81; também foram liberados 1.742.400 bytes do buffer RGBA estático do gradiente. Build, regressão 102/102, ABI, browser bridge e paridade Chrome passaram; saída com zero diferenças RGBA nos casos exercitados. Sem benchmark ou revisão visual manual ampla.

## v263.0 — overlays de efeitos de tela sem batch legado
Os overlays de tempestade/neon, alarme, barras cinematográficas e flash de contagem usam os painters Rust/WebSys diretos. Removidos um callback de host, buffers relacionados e três exports do renderer antigo. O WASM legado caiu de 142.552 para 140.548 bytes, imports de 13 para 12 e exports de 87 para 84. Build, regressão 102/102, browser bridge e paridade Chrome passaram; zero diferenças RGBA nos casos comparados. O fallback Canvas original continua ativo. Sem benchmark ou revisão visual manual ampla.

## v262.0 — remover luzes e anéis do batch legado
Luzes aditivas do mundo e anéis animados agora são validados, calculados e pintados pelo Rust/WebSys direto, com o fallback Canvas original preservado nos chamadores. Removidos dois callbacks de host, buffers de entrada/comando e sete exports do renderer antigo. O WASM legado caiu de 146.123 para 142.552 bytes, imports de 15 para 13 e exports de 94 para 87. Build, regressão 102/102, ABI, browser bridge e paridade Chrome passaram; luzes e anéis tiveram zero diferenças RGBA nos casos comparados. Sem benchmark ou revisão visual manual ampla.
## v285.0 — painter direto de inimigos
Inimigos passam por `drawEnemies` em Rust/WebSys direto: o módulo valida os registros, desenha sombras, sprite de spritesheet ou corpo procedural, sinais de atordoamento e labels cacheados. `index.html` preserva o painter Canvas original como fallback. Foram retirados do módulo legado os buffers/exports e callbacks de corpo/sombra/estado de inimigos. Build e regressão 104/104 passaram; ABI e browser bridge passaram; comparação Chrome do frame combinado teve zero diferenças RGBA para atores e o cenário de estados de inimigo ficou dentro da tolerância documentada de antialias. O WASM legado tem 8.887 bytes, 2 imports e 11 exports. Renderizador ainda híbrido: telas/hooks não portados, campanha abrangente, revisão visual ampla e benchmark seguem pendentes.

## v286.0 — remover rasterizador e seletores de sprite legados
`draw_player_frame`, seus buffers de paleta/pixels e os seletores antigos de sprites foram removidos do WASM legado. O bridge chama Rust/WebSys direto e retorna ao `buildPlayerFrame`/Canvas original quando não pode desenhar; o seletor da página já tem a fórmula JavaScript original como fallback. O módulo antigo agora só intercepta/conta as operações Canvas ainda presentes. Build, regressão 104/104, ABI, browser bridge, paridade direta e Chrome passaram; seis frames procedurais tiveram diferença RGBA zero entre Rust direto e fallback JS. WASM legado: 754 bytes, 2 imports e 6 exports (v285: 8.887 bytes, 2 imports e 11 exports). Ainda há rotas Canvas por migrar e não houve benchmark ou revisão visual manual ampla.

## v287.0 — aposentar o trampoline Canvas
O módulo Rust/WebSys direto tornou-se a única implementação WASM produzida pelo build, carregada pelo bridge e incluída no cache offline. Removidas do build a compilação/cópia do crate trampoline, do servidor a rota pública do binário antigo, e do service worker sua entrada de cache. Os wrappers de diagnóstico Canvas agora só são instalados com `wasmDiagnostics=1`, evitando custo por chamada no uso normal. Regressões 104/104, validação do WASM direto (113 exports e 107 imports Web APIs), bridge e paridade direta Chrome passaram. O jogo ainda preserva fallback Canvas em camadas não portadas; sem benchmark ou inspeção visual ampla.

## v288.0 — resumo da pausa em Rust direto
O painel escuro de resumo da partida na pausa foi adicionado como stage 4 de `drawHudShape`, preservando o fallback Canvas se a chamada direta não aceitar a entrada. Chrome 156 comparou o estágio ao Canvas: zero diferenças RGBA, com restauração do estado. Regressão 105/105. A auditoria opt-in percorreu menu, gameplay, pausa e nove outros estados; nenhum registrou operações Canvas do host. Isso é evidência das cenas amostradas, não de todos os efeitos/modos. Sem FPS medido ou inspeção visual ampla.

