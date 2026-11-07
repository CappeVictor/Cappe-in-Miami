## v169.0 — dark overlay direto; sem benchmark
O recorte de escuridão/lanterna usa Rust para rasterizar os dois contextos Canvas; paridade RGBA exata em Chrome. Não foram medidos frame time, CPU, memória ou FPS.

## v168.0 — batches de ambiente/mundo Rust; sem benchmark
Névoa, luzes, anéis e zona de invasão passam primeiro pelo módulo direto. Chrome 156 confirmou RGBA exata; não foram medidos frame time, CPU, memória ou FPS.

## v167.0 — overlays dev no Rust; sem benchmark
F4/F6 agora chamam painter Rust direto, com estado/array criado no host e paridade RGBA exata em Chrome. Não foram medidos frame time, CPU, memória ou FPS.

## v166.0 — HUD de depuração Rust; sem benchmark
O painel FPS/mapa/erros do `?dev=1` desenha fundo e texto pelo módulo direto. Chrome confirmou paridade RGBA exata; não foram medidos tempo de quadro, CPU, memória ou FPS.

## v165.0 — setter redundante da HUD; sem benchmark
Quando os toasts são rasterizados pelo Rust, a HUD não grava `globalAlpha` novamente pelo host. No smoke Chrome, zero chamadas Canvas host e zero writes de propriedades foram observados após disparar uma explosão controlada. Não há medição de FPS/CPU/tempo de quadro.

## v164.0 — marcas de explosão pelo Rust; sem benchmark
Os dois círculos persistentes da explosão de barril são rasterizados pelo módulo direto. Paridade RGBA exata em Chrome 156; nenhuma medição de tempo de quadro, CPU, memória ou FPS. WASM direto: 140.854 bytes + glue 33.137 bytes.

## v163.0 — rastro de vidro pelo Rust; sem benchmark
Rust desenha a marca estática e os nove triângulos gerados ao quebrar vidro; o host continua gerando a mesma geometria e sequência aleatória. A comparação Chrome teve igualdade RGBA exata. Nenhuma medição de FPS, CPU ou tempo de quadro. WASM direto: 140.256 bytes + glue 32.738 bytes.

## v162.0 — sombras de inimigos pelo Rust; sem benchmark
O módulo direto desenha as elipses de sombra mantendo o alpha individual. Chrome 156 confirmou 205 chamadas no gameplay e pixels exatos em três casos sintéticos. Nenhuma medição de frame time, CPU, memória ou FPS foi concluída. Módulo direto: 138.983 bytes WASM + 32.201 bytes glue.

## v161.0 — setter Canvas de suavização pelo Rust; sem benchmark
A montagem do mapa encaminha `imageSmoothingEnabled` ao módulo direto. Chrome 156 registrou duas chamadas Rust e nenhuma escrita de propriedade Canvas pelo host no smoke curto. Não foram medidos frame time, CPU, memória ou FPS. Módulo direto: 138.010 bytes WASM + 31.704 bytes glue.

## v159.0 — camadas e respingos pelo módulo Rust; sem benchmark
O módulo direto rasteriza layers recortados e vetores de sangue de kill. Foram confirmadas paridades RGBA, mas não se mediram frame time, CPU, memória ou FPS. Módulo direto: 137.834 bytes WASM + 31.452 bytes glue.

## v158.0 — bitmaps de texto em Rust; sem benchmark
Rust mede e gera os bitmaps cacheados de texto para labels do clima e status dos inimigos. Paridade RGBA exata nos dois casos comparados; não há medição de frame time, CPU, memória ou FPS. Módulo direto: 135.090 bytes WASM + 29.537 bytes glue.

## v157.0 — limpar retângulos pelo Rust; sem benchmark
Os três fluxos encontrados de `clearRect` (piso, mapa Neon e camada de sangue cacheada) chamam `web-sys` direto, com fallback. Smoke Chrome confirmou quatro chamadas e nenhuma operação residual. Sem medições de FPS, CPU ou frame time. WASM direto 121.452 bytes + glue 27.180 bytes.

## v156.0 — ImageData direto via Rust; sem benchmark
Rust cria `ImageData`, copia os pixels dos buffers da instância WASM antiga e chama `putImageData` em rotas de piso, texturas, sprites, gradiente e jogador. No smoke Chrome, 18 criações e 24 aplicações usaram o módulo direto, sem operações residuais desses métodos. Há cópia de pixels e nenhuma medição de CPU, memória ou tempo de quadro; não há evidência de ganho de FPS. WASM direto 120.713 bytes + glue 26.635 bytes.

## v155.0 — imagens cacheadas de Canvas pelo Rust; sem benchmark
`drawImage` de imagens cacheadas, incluindo rótulo do clima e snapshots/restaurações de `fl`/`tp`, agora é executado em Rust. Smoke Chrome confirmou 104 chamadas diretas e nenhuma operação residual `drawImage`; paridade do rótulo é exata. Não foram medidos frame time, CPU, memória ou FPS. WASM direto 117.055 bytes + glue 24.576 bytes.

## v154.0 — rasterização direta de sangue/cadáveres; sem benchmark
Rust rasteriza marcas dinâmicas/estáticas e cadáveres no Canvas com suas regras próprias; os cenários sintéticos foram pixel-exatos. O cenário de jogo de inicialização não produziu essas entidades ativas. O build atual recompilado em v155 mede 117.055 bytes WASM e 24.576 bytes glue; não há medição de frame time ou CPU.

## v153.0 — poeira e faíscas diretas; sem benchmark
Rust chama Canvas diretamente para compor partículas de poeira em um path e agrupar faíscas por cor/alfa com blend aditivo. O cenário de jogo testado executou 1.152 círculos de poeira em 24 lotes; as amostras sintéticas de poeira/faísca ficaram pixel-exatas. WASM direto: 112.638 bytes e glue: 22.301 bytes. Sem medição de frame time/CPU; não alegar FPS.

## v152.0 — labels de inimigos diretos; sem benchmark
Rust recebe imagens dos textos já produzidos e cacheados pelo JS, depois as pinta no contexto do jogo. Isso remove o callback Canvas JS por label, sem refazer a tipografia nem alterar o cache. WASM direto: 109.955 bytes e glue: 21.236 bytes. Não há medição de tempo de frame ou CPU; não declarar ganho de desempenho.

## v151.0 — mapa Canvas direto; sem benchmark
Rust rasteriza diretamente os comandos já emitidos para fundo fixo, overlay, decoração, detalhes, sombras, paredes, postes e vidros. Chrome teve paridade exata nos 22 opcodes de mapa e confirmou 35 lotes diretos no cenário de jogo. A mudança reduz o retorno de cada comando de mapa pelo callback JS; não há medição de FPS, CPU ou tempo de frame. WASM direto: 109.783 bytes e glue: 21.616 bytes.

## v150.0 — batches de entidades em Canvas direto; sem benchmark
Rust consome os comandos geométricos compactos já gerados pelo módulo legado e chama Canvas via `web-sys` para móveis, atores, jogadores, inimigos, armas, fantasmas e aura; texto HUD bruto também chama o Canvas diretamente. A comparação Chrome dos cenários cobertos teve diferença RGBA zero. O módulo direto mede 94.595 bytes WASM + 18.707 bytes glue. Não há medição de FPS, frame time, CPU, GPU ou memória; essa mudança de rota não comprova ganho de desempenho.

## v149.0 — motes de clima Canvas direto; sem benchmark
Rust calcula alpha e pinta o quadrado de cada mote no contexto `web-sys`, recebendo as posições já avançadas pela simulação JS. Não há buffer RGBA de tela nem cópia de imagem. Essa camada ainda faz uma mudança de `globalAlpha` e um `fillRect` por mote; não foi medido FPS/CPU. A biblioteca direta mede 75.086 bytes + 10.135 bytes glue.

## v148.0 — chuva Canvas direto; sem benchmark
Rust recebe os valores x/y/tamanho já alterados pela simulação JS, filtra o stride 1/2 e compõe o path de chuva pelo `web-sys`. Isso transfere a geração/ordenação dos segmentos para Rust; ainda há chamadas Canvas para cada segmento e nenhuma medição de FPS/CPU/tempo de frame. O módulo direto tem 74.574 bytes e glue 9.432 bytes, antes de compressão.

## v147.0 — overlays de tela Canvas direto; sem benchmark
O módulo `web-sys` desenha os retângulos do flash, alarme e barras cinematográficas diretamente no contexto; os seis cenários Chrome comparados tiveram diferença zero. A rota evita reentrada na interceptação genérica do Canvas com `withCanvasBypass`, mas as operações ainda são métodos Canvas da plataforma chamados pela glue WASM. Não foram medidos tempo de quadro, FPS, CPU ou memória. O WASM direto ficou com 71.036 bytes e glue JS com 8.223 bytes.

## v146.0 — chamada direta de Canvas via Rust; sem benchmark
O menu de pausa agora executa `fillRect`, `strokeRect` e `fillText` a partir de Rust/WASM por `web-sys`, removendo a ida pelo interpretador de comandos antigo nessa tela. Chrome 156 comparou a saída contra o painter JS em três estados e teve zero diferenças de canal. Isso verifica fidelidade, não velocidade. Não medimos FPS, CPU, memória nem tempo de quadro. O módulo direto acrescenta 34.353 bytes de WASM e 7.513 bytes de glue JS antes de compressão.

## v145.0 — reduzir crops Canvas de textura; sem benchmark
A rota WASM remove oito canvases intermediários de 24×24 por fase: JS lê cada spritesheet inteiro em cache RGBA e Rust recorta as células na tabela de entrada do rasterizador. Continua havendo leitura Canvas→ImageData, cópia para memória WASM, rasterização e upload `putImageData` da camada final. O teste Chrome registrou 14 chamadas `drawImage` no cenário instrumentado, mas esse número não é tempo de quadro e não foi comparado em execução A/B equivalente. FPS, CPU, memória e tempo de construção do mapa não foram medidos.

## v144.0 — sprite ambiental gerado no Rust; sem benchmark
O sprite estático de névoa/fumaça é calculado uma vez por estado do renderer em Rust, enviado como um `putImageData` e depois reutilizado nos três desenhos escalados do efeito. Cada gradiente itera só seu bounding box e testa distância ao quadrado antes da raiz, em vez de avaliar os nove círculos em todos os 131.072 pixels. Isso reduz operações aritméticas do gerador; tempo real de criação, frame time e FPS não foram medidos.

## v143.0 — texturas de paredes/móveis/portas em RGBA Rust; sem benchmark
O passe estático de mapa envia oito sprites 24×24 (até 18.432 bytes de origem) ao WASM e compõe em um buffer RGBA reutilizado, substituindo múltiplos padrões/recortes e drawImage de portas por um upload do passe. A composição visita o retângulo de cada sólido/porta e ainda percorre a camada de saída até 1440×900; o buffer compartilhado tem teto de 5.184.000 bytes. Não foram medidos tempo de build de mapa, frame time, FPS, CPU ou memória real, portanto nenhum ganho de desempenho é afirmado.

## v142.0 — sombras e rejunte no compositor RGBA Rust; sem benchmark
Sombras fracionárias e linhas de rejunte agora são aplicadas pelo Rust ao buffer final do piso, substituindo as chamadas Canvas `fillRect` dessa etapa por um único `putImageData`. O buffer temporário continua com teto de 5.184.000 bytes. A operação percorre os pixels da camada e rasteriza cobertura de sombras; não foram medidos tempo de build de mapa, frame time, FPS, CPU ou memória real. Nenhum ganho é quantificado.

## v141.0 — texturas FTILES compostas no Rust; sem benchmark
Em mapas suportados, Rust combina a textura repetida de cada sala com a camada de granulado já gerada e emite uma imagem RGBA por contexto. Isso elimina o caminho `createPattern`/recorte/fillRect para FTILES no compositor WASM, ao custo de copiar até 6.912 bytes do tileset por construção do mapa e compor pixels no buffer de até 5.184.000 bytes. Não foram medidos tempo de mapa, frame time, FPS, CPU ou memória real durante jogo; nenhum ganho de desempenho é afirmado.

## v140.0 — granulado de piso pré-rasterizado em Rust; sem benchmark
O loop de 8.100 specks de um mapa 1440×900 agora compõe pixels num buffer Rust e transfere a camada uma vez, em vez de executar 8.100 `fillRect` individuais pelo callback host. O buffer reutilizável ocupa 5.184.000 bytes. Isso muda o trabalho e o tráfego de chamadas; não medimos tempo de construção, frame time, CPU ou FPS.

## v139.0 — paridade do gradiente das portas; sem benchmark
Amostras Rust das portas agora usam os offsets originais dentro do gradiente que cobre o elevador inteiro. Chrome 156 encontrou diferença máxima de 1/255 por canal em escadas, corpo e portas sintéticas. Isso é validação de pixels, não medição de frame time, CPU ou GPU.

## v138.0 — gradientes de transporte em RGBA cacheado; sem benchmark
Rust gera os gradientes de escada, elevador e porta metálica uma vez por tamanho/objeto; o host os reutiliza com `drawImage`. Isso remove a construção de gradientes Canvas para esses transportes no caminho WASM, mas continua havendo rasterização Canvas. Não foram medidos frame time, CPU ou GPU.

## v137.0 — gradiente de saída RGBA cacheado; sem benchmark
Rust gera o pixel map do gradiente quando muda o tamanho ou o estado da saída. Nos quadros seguintes, o host reutiliza o canvas e ajusta alpha para animar o pulso. Isso evita criar um `CanvasGradient` e rasterizar o gradiente por quadro; não medimos frame time, CPU ou GPU.

## v136.0 — sprite reutilizado para clarão de tiro; sem benchmark
Cada muzzle flash deixa de construir seu próprio gradiente radial Canvas no caminho WASM: um sprite RGBA é gerado uma vez pelo Rust e reutilizado com o alpha/composição de cada efeito. Isso evita a criação de gradiente e caminho por disparo, mas ainda exige `drawImage` do host e não há medição de frame time ou CPU.

## v135.0 — otimização de cálculo radial; sem benchmark
Os pixels dos sprites radiais agora usam uma estimativa inicial por bits seguida por três iterações de Newton, em vez de doze. Isso reduz o número máximo de divisões nessa etapa; não foi medido frame time ou CPU, então não há ganho de desempenho quantificado.

## v131.0 — texto direto do overlay no batch; sem benchmark
O rótulo de créditos deixa de atravessar o bridge genérico para cada alteração de estilo e chamada `fillText`; agora usa um batch validado pelo Rust e executado pelo host Canvas com bypass. Em dois smokes curtos de 2,5 s, os contadores de bridge passaram de 86 `fillText` e 85 pares `save`/`restore` em v130 para 1 `fillText` e nenhum save/restore residual em v131; o único fillText observado foi a criação inicial do rótulo de clima. Isso confirma remoção dessas chamadas do dispatcher nesse cenário, mas não reduz a rasterização Canvas nem prova ganho de FPS/CPU. Não houve benchmark comparável.

## v129.0 — guarda de escrita de alpha; sem benchmark
Após o batch dos fantasmas, alpha recebe valor 1 apenas quando necessário. A alteração busca evitar uma escrita redundante por quadro quando o estado já está no padrão; não houve contagem comparativa confiável, FPS ou frame-time. O smoke desta versão não confirmou o módulo pronto.

## v128.0 — transforms em batch; sem benchmark
Os escopos de save/restore que cercam os transforms do quadro agora acompanham os batches Rust; outras operações de desenho continuam residuais e o host segue rasterizando Canvas. O smoke curto não foi comparativo. Não foram medidos FPS, frame time ou CPU.

## v126.0 — sem medição de FPS
O preenchimento de fundo ainda produz uma chamada `fillRect` no host Canvas; Rust agora escolhe e valida a geometria. Não houve comparação de frame time, CPU ou FPS.

## v125.0 — redução de chamadas de setup por frame, sem benchmark
O setup de escala/suavização é cacheado e não chama setTransform/setters novamente por frame após carregar o WASM. As chamadas restantes ainda foram milhares em um smoke curto; sem medição comparável de tempo de quadro, CPU ou FPS, não se afirma ganho quantificado.

## v123.0 — sem medição de FPS
O menu de pausa agrupa cinco formas Canvas num batch Rust, mas a rasterização permanece Canvas e não houve comparação de custo, CPU ou frame time. Não se conclui ganho de desempenho.

## v120.0 — sem medição de FPS
O flash vermelho do Contrarrelógio emite um retângulo por batch; JS ainda calcula a oscilação e Canvas rasteriza. Sem FPS, frame time ou custo da ponte medido.

## v118.0 — sem medição de FPS
O batch de avisos transporta até seis itens texto/posição/alfa por chamada; `tx()` continua desenhando no host. Não foram medidos o custo de marshalling, FPS ou frame time.

## v117.0 — sem medição de FPS
O progresso da barra de recarga é enviado ao Rust para gerar dois retângulos; o Canvas do navegador rasteriza ambos. Sem medição de marshaling ou frame time.

## v116.0 — sem medição de FPS
O triângulo direcional da Invasão usa um batch de três vértices calculados em Rust; a projeção/decisão e a rasterização Canvas seguem no JS/host. Não medimos custo do batch, frame time, CPU ou FPS.

## v115.0 — sem medição de FPS
Rust gera em um batch o fundo, preenchimento de vida, marcadores de fase e borda da barra do chefe; JavaScript envia até oito marcadores e a cor dinâmica. A rasterização continua no Canvas do navegador. Não medimos frame time, FPS, CPU, GPU ou custo de marshaling; não há alegação de ganho.

## v114.0 — sem medição de FPS
Vidros e estilhaços agora usam buffers reutilizados para gerar os comandos da geometria. O número de travessias para a camada é uma chamada por quadro; o host ainda executa primitivas Canvas. Não medimos FPS, frame time, CPU, GPU ou alocações; não há alegação de ganho.
O estágio Rust de câmera gera quatro comandos por quadro para preservar exatamente a sequência de centro, zoom e posição do mundo. O host ainda executa as chamadas Canvas; o custo de JS↔WASM e o frame time não foram medidos. Não há alegação de ganho.
Screen shake, kick e camera shake agora atravessam o batch Rust em dois estágios para preservar a hierarquia save/restore original. JS mantém amostras aleatórias e decaimento de timers; Rust calcula as translações e o host executa Canvas. O smoke acumulou 24 comandos de transformação, mas não medimos frame time, FPS, CPU, GPU ou custo do marshaling. Não há alegação de ganho.
Até 256 candidatos são filtrados em JavaScript por classe, nocaute e alcance; somente os visíveis são enviados em registros reutilizados ao Rust, que emite os comandos dos realces. A rasterização continua Canvas e usa cores de classe fornecidas pelo host. Não foram medidos FPS, frame time, CPU, memória ou custo da ponte.

## v110.0 — sem medição de FPS
Posição/ângulo/estado do cone e 13 vértices por câmera são enviados em um buffer reutilizado de até oito câmeras; Rust emite geometria de setor e corpo, e o navegador rasteriza os comandos Canvas. O cálculo da área de visão permanece no gameplay JS. Não medimos frame time, FPS, CPU ou marshaling e não há alegação de ganho.

## v109.0 — sem medição de FPS
O loop dos barris reutiliza uma `Float64Array` de até 16 registros e envia um batch ao Rust; Rust gera as primitivas e o host rasteriza no Canvas. A maior parte do custo de desenho continua no Canvas e não medimos frame time, FPS, CPU ou custo de marshaling. Nenhum ganho de desempenho é afirmado.

## v108.0 — sem medição de FPS
O modo Invasão envia três números por chamada e Rust calcula o alpha de pulso; o host desenha um arco e seu preenchimento no Canvas. Entrada e saída `Float64Array` são reutilizadas pelo bridge. O smoke específico do modo e os custos de CPU, GPU, memória e frame time não foram medidos.

## v107.0 — sem medição de FPS
O loop JavaScript deixa de compor diretamente a geometria dos rings ativos e envia até 14 registros em um batch para o Rust. A entrada `Float64Array` WASM, paleta e objeto de contexto são reutilizados; a busca linear evita `Map` e as checagens não montam arrays por ring. A etiqueta climática reutiliza também sua lista de handles. O host ainda faz um arco/stroke Canvas por ring; isto não prova redução de frame time. Não foram medidos FPS, CPU, memória nem custo de marshaling.

## v106.0 — sem medição de FPS
Rust escolhe o retângulo da etiqueta e o host desenha a imagem de texto já cacheada. Um `Float64Array` de entrada e uma lista de handles são preparados no frame; essa alocação precisa ser medida/evitada ao consolidar o batch. Sem medição de FPS, frame time ou CPU.

## v105.0 — sem medição de FPS
Rust calcula validade e posição do rótulo do alarme; o host ainda rasteriza `fillText` pelo Canvas. Essa mudança não comprova redução do tempo de quadro. FPS, CPU e memória não foram medidos.

## v104.0 — sem medição de FPS
Rust escolhe estágio, handle e retângulo de três imagens existentes do HUD; o host mantém um `drawImage` Canvas por imagem exibida. Essa passagem não comprova redução do tempo de frame; FPS, CPU e memória não foram medidos.

## v103.0 — sem medição de FPS
Rust decide validade e pulso do texto de combo em uma chamada; o host continua rasterizando strokeText/fillText pelo Canvas. Nenhuma medição de custo, frame time, FPS, CPU ou memória foi feita.

## v102.0 — sem medição de FPS
A projeção e raios da máscara de apagão são calculados em Rust; o host ainda rasteriza os sprites radiais, clipping e a composição Canvas. A camada é reduzida a 480×300, como antes. Não foram medidos FPS, frame time, CPU ou memória, nem comparada a imagem com o renderer JS.

## v101.0 — sem medição de FPS
Rust calcula luzes e reflexo em lote; o host ainda rasteriza sprites e elipse pelo Canvas. FPS, frame time, CPU e memória não foram medidos.

## v100.0 — sem medição de FPS
Rust calcula retângulos de flashes, alarme e barras de cinema; o host continua fazendo os fills Canvas. O lote pode reduzir trabalho de composição duplicado, mas não remove rasterização nem prova ganho. FPS, frame time, CPU e memória não foram medidos.

## v99.0 — sem medição de FPS
Rust calcula qualidade, estilo, opacidade e posições de três imagens de névoa/fumaça; o host chama `drawImage` para cada uma. A passagem para batch não elimina a rasterização Canvas nem comprova ganho. FPS, frame time, CPU e memória não foram medidos.

## v98.0 — sem medição de FPS
Rust calcula alpha das partículas de poeira em lote e o host conserva um fillRect Canvas por partícula, agora fora do interceptador genérico. Movimento e respawn permanecem em JS. A redução de travessias do bridge não prova ganho de frame time; FPS, CPU e memória não foram medidos.

## v97.0 — sem medição de FPS
Rust prepara os segmentos de chuva em lote e o host os desenha em um único caminho Canvas; avanço/respawn continuam em JS. O contador de operações individuais removidas desta passagem não foi isolado. Nenhuma comparação de frame time, FPS, CPU ou memória foi feita; não há conclusão de ganho.

## v96.0 — sem medição de FPS
O HUD envia textos principais em uma lista WASM por grupo e mantém o cache `tx()` no host; reduz chamadas de passagem Canvas individuais, mas o custo do lote e do rasterizador não foi comparado. Sem medição de FPS, frame time, CPU ou memória.

## v95.0 — sem medição de FPS
O painter de cada rastro foi substituído por uma composição de comandos Rust em uma chamada para até cinco poses. O host ainda rasteriza os mesmos elementos Canvas; FPS, frame time, CPU, memória e custo da chamada não foram medidos.

## v94.0 — sem medição de FPS
Rust agrupa até três comandos para a barra de combo e usa um comando para a moldura da máscara ou véu de pausa. Isso reduz chamadas Canvas interceptadas nestas formas, mas nenhuma medição de FPS/frame time/CPU/memória foi feita.

## v93.0 — sem medição de FPS
Rust prepara os overlays finais em um lote de até dois comandos; o host os rasteriza. A redução de chamadas intermediárias nesta camada não demonstra ganho de FPS. Frame time, CPU, memória e comparação JS/WASM seguem sem medição.

## v92.0 — sem medição de FPS
A camada de color grade agora envia dois comandos gerados por Rust e aplica os fills no host Canvas. A redução de chamadas de passagem não demonstra ganho; FPS, frame time, CPU, memória e comparação JS/WASM não foram medidos.

# Performance — linha de base parcial
## v76.0 — sem medição de FPS
Rust combina os ângulos de abertura e emite cinco comandos por porta Neon em lote. O host ainda resolve o sprite e executa Canvas. A transferência reduz chamadas de método Canvas interceptadas nessa camada, mas pode ter custo de marshaling e não implica ganho. FPS, frame time, CPU, memória e comparação entre modos não foram medidos.

## v75.0 — sem medição de FPS
Rust seleciona 13 comandos `FTILES` no smoke de Apartamento; o host cria um CanvasPattern e executa clipping/fill. A contagem confirma execução, não ganho. FPS, CPU, memória, inicialização e frame time não foram medidos.

## v74.0 — sem medição de FPS
Rust seleciona e ordena 135 comandos de texturas/decalques no smoke de Apartamento; JavaScript ainda fornece as imagens, aplica padrões/recortes e executa Canvas. A contagem confirma o caminho ativo, não velocidade. Inicialização, frame time, FPS, CPU e memória não foram medidos.

## v73.0 — sem medição de FPS
Rust gera lotes de granulado, sombras de sólidos e rejunte na montagem dos andares; o host aplica cada fill ao Canvas. O smoke confirmou 16.516 comandos de acabamento em Apartamento, mas contagem não demonstra ganho. O custo de inicialização, frame time e FPS não foram medidos.

## v72.0 — sem medição de FPS
Rust agora prepara os comandos de desenho de painéis de vidro e fragmentos em lote; timers permanecem em JS. O smoke contou quatro comandos no diagnóstico, o que confirma execução, não redução de CPU nem melhora de FPS. A rasterização continua no Canvas do navegador e o custo não foi medido.

## v71.0 — sem medição de FPS
Fundo, overlay e decoração são desenhados durante a construção do mapa; depois o Canvas estático é reutilizado. A geometria foi deslocada para Rust, mas o host ainda executa cada primitiva. Não foram medidos custo de carregamento, memória, frame time nem FPS; contagem de comandos não demonstra ganho.

## v70.0 — sem medição de FPS
Rust passou a selecionar e posicionar os rótulos de inimigo dentro do mesmo lote do corpo. O host mantém o cache de texto atual e rasteriza sua imagem, preservando contorno e fonte; isso evita despachar os eventos dos rótulos quando o lote está ativo, mas não mede o custo do painter nem da rasterização. Não houve comparação de frame time.

## v69.0 — sem medição de FPS
A geometria dos seis círculos do stun agora é calculada em Rust e consumida junto ao lote do corpo; isso reduz a necessidade de encaminhar cada arco pelo bridge, mas ainda há operações Canvas executadas pelo host e a rasterização continua no navegador. O efeito em frame time/CPU não foi medido. A captura e a contagem de comandos não demonstram ganho de desempenho.

## v68.0 — sem medição de FPS
O lote de jogadores transfere pose e opções uma vez para Rust e devolve os comandos da composição inteira; o host executa esses comandos sem chamar o bridge de passagem a cada primitiva. Isso reduz o número de travessias JS↔WASM nessa camada por desenho, mas o impacto em frame time/CPU não foi medido. O renderer residual ainda intercepta operações Canvas individualmente e pode acrescentar sobrecusto; não há comparação de desempenho.

## v67.0 — sem medição de FPS
Rust prepara a geometria do corpo de inimigos em comando contíguo, mas o host ainda executa cada operação Canvas e o browser rasteriza cada primitiva. O número de comandos e a abertura headless não medem CPU/FPS nem provam ganho; não houve benchmark nesta iteração.

## v66.0 — sem medição de FPS
Rust agora calcula a geometria de sombra a partir do buffer de posições visíveis e devolve um lote contíguo; o host desenha uma elipse por inimigo, mantendo o mesmo número de primitivas. Nenhuma redução de custo de CPU/FPS foi demonstrada; não houve benchmark nem medição no navegador.

## Preview Rust/WASM — sem medição
O bridge encaminha cada método/setter Canvas pelo limite JS↔WASM e pode acrescentar sobrecusto por chamada. A pintura de piso gera primitivas em Rust, mas chama o host JavaScript para cada retângulo; esse custo pode superar o loop original. O culling de inimigos copia suas posições para memória WASM por quadro. A igualdade dos comandos e as regressões funcionais não comprovam ganho de desempenho. O modo JS continua padrão; comparar tempos de quadro nos mesmos mapas, resolução e hardware depois de portar lógica em lotes.

## v55.0 — sem medição de FPS
O filtro por allowlist e o texto mais curto do seletor não tiveram medição de desempenho. A normalização da saída roda somente ao montar o mapa. Não houve medição de FPS nesta sessão.
## v54.0 — sem medição de FPS
A correção de fogo amigo adiciona apenas uma verificação quando um projétil de jogador está ativo e o multiplayer local com fogo amigo está habilitado. Não houve medição de impacto em FPS.
## v53.0 — sem medição de FPS
A validação de posição é executada uma vez ao montar cada mapa Neon, não a cada quadro. Busca em anéis ocorre somente para objetos cuja posição de origem colide; varredura do mapa é um fallback para vizinhanças bloqueadas. Isso não constitui medição de FPS.

## v52.0 — sem medição de FPS
O acabamento das armas acrescenta poucas operações Canvas por arma desenhada e não introduz imagens, dependências nem partículas. O sprite procedural do personagem agora mantém no máximo 128 entradas visuais quantizadas, evitando reconstruir centenas de pixels em cada quadro no fallback; não há medição de FPS nesta sessão. Conferir custo/leitura em hardware modesto.

Data: 04/11/2026. Meta: 60 FPS estáveis / 16,67 ms; 120 FPS é secundário. Hardware de referência informado pelo proprietário: Nitro V15, i9-13900H, RTX 4060, 16 GB. O ambiente de medição abaixo não representa automaticamente esse hardware nem um navegador.

## v40.0 — sem benchmark de desempenho nesta iteração
Corrigido o wrapper final de desenho que sobrescrevia a opção de antialiasing a cada quadro. O impacto em FPS não foi medido; qualidade configurada agora pode reduzir trabalho em dispositivos limitados.
Foram adicionados uma consulta HTTP leve a cada 5 segundos enquanto o lobby está aberto e checagens de borda nas funções existentes de colisão. Não foi medido FPS nem uso real de CPU; os testes funcionais não são evidência de desempenho. A consulta é restrita à tela Multiplayer.

## v42.0 — sem benchmark de rede/FPS
O cliente faz amostragem da duração das respostas HTTP dos estados enviados a cada 100 ms; o valor exibido é uma aproximação da resposta da aplicação, não ping puro. Não foi medido desempenho do jogo nem testada rede entre máquinas.

## Medido
Node v24.22.1, win32 x64. Resultado bruto: PERFORMANCE_BASELINE.json. Rodar node tests/benchmark.cjs.
- maps.js: 2.929.052 bytes. Compilação sintética em vm.Script, cinco amostras distintas após aquecimento: mediana 41,129 ms; p95 42,876 ms. O comentário de cada amostra varia para evitar reutilizar o cache de compilação da mesma string. Não inclui download, execução nem decodificação de tiles.
- NAV: mundo sintético 1200×800, 2400 células e dois obstáculos; construção 2,068 ms.
- 200 buscas após 20 aquecimentos: 200 caminhos encontrados; mediana 0,054 ms; p95 0,096 ms. Não representa mapas reais cheios de móveis nem dezenas de inimigos simultâneos.
Nenhum ganho de FPS é reivindicado; esta rodada não alterou o algoritmo NAV.

## Inspeção estática
Já existem grade espacial SG, cache de cenário/sangue/texto, compactação de arrays, buffers de snapshots, redução de redesenho em pausa e mapas decodificados sob demanda. Não duplicar essas otimizações.
Candidatos a medir: separação de inimigos O(n²); circleHits varrendo NAV.solids nas amostras de clearRay; frequência de replanejamento; quantidade de canvases/texturas; tamanho/compilação de maps.js; imagens ausentes e espera de 6 s em neonPrepare.
O governador já coleta `rawDt` antes de limitar `dt` a 1/30; usa a média de 120 quadros uma vez por instalação e não substitui preferências salvas. Isso não fornece p95, custo de update/draw, CPU/GPU nem memória. Meça esses valores no navegador antes de ajustar o governador.

## Ainda não medido
FPS, frame pacing, update/draw reais, CPU/GPU, memória/GC, carregamento no navegador e sessões longas. Coletar antes de adotar pooling adicional, quadtree, novas camadas ou renderização diferente.
# v39.0 — sem benchmark de desempenho nesta iteração
Foram adicionados uma consulta HTTP leve a cada 5 segundos enquanto o lobby está aberto e checagens constantes de borda nas funções existentes de colisão. Não foi medido FPS nem uso real de CPU; os testes funcionais não são evidência de desempenho. Limite de frequência é intencionalmente restrito à tela Multiplayer.

## v127.0 — redução de trabalho Canvas vazio, sem benchmark
Quando não há luzes habilitadas, flash de tiro ou reflexo de chuva, `EXP.drawWorld` não abre o passe aditivo nem altera o modo de composição. A regressão confirma a guarda e a permanência do fallback. Não houve medição de FPS, frame time, CPU ou custo da ponte.

## v130.0 — rótulo de transporte no batch HUD; sem benchmark
O rótulo de escada/elevador deixa de chamar tx() diretamente no ramo WASM e entra no batch de textos HUD já existente. O host ainda usa a rasterização de texto cacheada. O smoke foi curto e contou 86 `fillText`, 85 `save`/`restore` e 22 `drawImage` residuais em 2,5 s em Apartamento; os stacks mostram texto de clima e renderização inicial de mapa entre os primeiros resíduos. Contagem não equivale a frame time/FPS, e não houve benchmark ou comparação visual.

## v133.0 — redução de chamadas genéricas da loja; sem benchmark
No smoke sintético com dealer, balão e três cards, os contadores Canvas do bridge caíram de 333 `save`, 333 `fillRect`, 272 `strokeRect`, 61 `restore` e 7 `measureText` para 7 `measureText`, com uma escrita da fonte do contexto auxiliar. As formas passaram ao batch WASM e a medição cacheada evita chamadas posteriores para o mesmo balão. É contagem de operações interceptadas, não FPS, CPU, GPU ou frame time; o host ainda rasteriza Canvas.

## v134.0 — sprites radiais RGBA em Rust; sem benchmark
A geração de gradientes Canvas dos sprites radiais passou ao Rust; em Chrome 156 o jogo permaneceu em `play`, e os contadores deixaram de registrar `createRadialGradient`, `addColorStop` e os `fillRect` usados para construir esses sprites. Os sprites são enviados ao Canvas por `ImageData`. Smoke geral ainda registrou 22 `drawImage` da montagem de tiles, 2 `createPattern`, 1 `measureText` e 1 `fillText`. Comparação do alpha do gradiente: erro máximo 1/255, média 0,126/255; cor teve pequenas diferenças na borda translúcida. Não foram medidos FPS, CPU, GPU ou frame time.


## v160.0 — estado do Canvas de poeira; sem benchmark
O painter Rust conserva globalAlpha e estilos anteriores ao desenhar a poeira. O smoke observou zero setters Canvas host de globalAlpha; não foram medidos frame time, CPU, memória ou FPS. Módulo direto: 138.078 bytes WASM + 31.452 bytes glue.

## v170.0 — efeitos curtos por Rust; sem benchmark
Muzzle flash e arco de impacto usam o painter direto nos callbacks cobertos. Não foram medidos frame time, CPU, memória ou FPS; nenhuma melhora de desempenho é afirmada.

