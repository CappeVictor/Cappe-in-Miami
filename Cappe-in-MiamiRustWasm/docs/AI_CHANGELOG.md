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

