## v97/v313 — acabamento procedural dos ícones de armas

Os ícones Canvas e Rust/WebSys receberam detalhes compatíveis de superfície: realces e ranhuras metálicas, parafusos, textura de madeira, mira e reflexos de vidro. O desenho continua gerado em código, sem carregar sprites extras. É uma alteração visual; não há medição de desempenho nesta rodada.
## v96/v312 — buffers de entrada reutilizados, sem medição de FPS

Web e Rust/WASM agora reutilizam o vetor de direção do jogador em vez de alocar um par de coordenadas por chamada; o caminho Rust/WASM também reutiliza buffers tipados dos painéis de vidro e estilhaços da pausa. A regressão valida valores, identidade do vetor e estabilidade do desenho. Regressões cruzadas: 118/118; partículas Web e compressão passaram. Não houve benchmark de frame time/FPS nesta rodada.
## v294/v82 — pontos de rota reutilizados na IA
A busca BFS aceita um buffer reutilizável para os pontos da rota. Cada inimigo conserva a rota visível e um pool com a capacidade máxima já necessária, de modo que recalcular trajetórias não crie um objeto por tile a cada vez. A comparação de rota segue idêntica em regressão, inclusive após encurtar e expandir o caminho. No microbenchmark sintético de 500 rotas repetidas em um labirinto 1200×800, foram criados 35.000 objetos de ponto sem pool e 0 novos objetos depois de aquecê-lo; a mediana permaneceu perto de 0,04 ms. Isso prova menor alocação de pontos no cenário sintético, não queda do heap total ou do frame time. No Chrome headless com 48 inimigos: p90 update+draw Web 1,1/1,1 ms e Rust/WASM 1,5/1,6 ms antes/depois da adaptação do governor; cadência p90 18,3 ms. Essas amostras são locais, variáveis e não demonstram melhoria mensurável do frame time.

## v293/v81 — carregar apenas os mapas Neon ativos
O catálogo incluía 159 mapas, embora a allowlist permita 61. Ambos os bundles agora contêm exatamente os 61 ativos e omitem 98 mapas não selecionáveis. O arquivo de mapas caiu de 2.929.052 para 1.616.608 bytes no Rust/WASM e de 2.929.179 para 1.616.614 bytes na Web (−44,8%). A compactação compara cada tile, objeto e dimensão dos mapas mantidos; a suíte exige a allowlist exata e igualdade geométrica entre as versões. Reduz dados transferidos e estruturas montadas no carregamento. Os ZIPs caíram aproximadamente 11,7% na Web e 7,6% em Rust/WASM. Não foi medido FPS nem heap do processo.

## v292 — governor resistente a picos de frame isolados
O tier adaptativo agora usa o percentil 90 do custo update+draw e da cadência nos primeiros 120 quadros aceitos, com o limite de FPS como meta. Isso evita reduzir escala/efeitos por poucos atrasos grandes durante a inicialização. Em um smoke headless com movimento e disparos, Web e Rust permaneceram no tier 0: p90 RAF 18,3 ms nas duas; p90 update+draw 2,2 ms Web e 3,4 ms Rust. O processo executa em um único Chrome, mas a amostra é local e não é benchmark controlado. `node tests/browser-performance.cjs`; perfil: `node tests/browser-performance.cjs --profile` (Node 22+).

## Preview v290 — escala adaptativa baseada no trabalho do quadro
O escalonamento agora mede update+draw, sem contar a espera pelo VSync ou o limite de FPS escolhido. Dois níveis reduzem efeitos e resolução interna em dispositivos lentos; resolução manual e modo Máximo preservam as escolhas. Esta mudança não mede FPS real.

## v291 — governador com cadência RAF e limite do usuário
O governor agora combina custo síncrono update+draw com intervalo entre os quadros aceitos pelo limite configurado. Isso evita reduzir qualidade apenas porque o usuário escolheu 30 FPS, enquanto identifica queda abaixo da meta quando o limite é 60 ou automático. Teste de smoke no Chrome headless com o renderer ativo: nível 2 em Web e Rust; a escala do canvas foi de 1197×748 para 862×539. RAF mediano observado: Web 66,6→16,8 ms; Rust 66,6→16,7 ms; custo síncrono médio após ajuste: 0,56 ms e 1,08 ms, respectivamente. Captura única e sem controle, sujeita a jitter do navegador/host; não é benchmark controlado nem promessa de FPS em outros PCs. Ferramenta: `node tests/browser-performance.cjs` (Node 22+ e Chrome).

## Preview Rust/WASM local v283.0 — piso
Remover as rotas legadas de granulado, FTILES, sombras e rejunte reduziu o WASM legado de 68.531 para 61.001 bytes, imports de 5 para 3 e exports de 45 para 36. Isso mede o arquivo e a ABI, não FPS, memória em execução ou tempo de quadro. Nenhum benchmark foi feito.

## Preview Rust/WASM local v282.0 — textura de mapa direta
Remover o painter duplicado de textura reduziu o WASM legado de 74.877 para 68.531 bytes e de 50 para 45 exports; os 5 imports permaneceram. Isso mede tamanho/ABI, não FPS, memória em execução ou frame time. Nenhum benchmark foi feito.

## Preview Rust/WASM local v281.0 — batch do HUD
Remover o batch legado do texto HUD reduziu o WASM legado de 75.772 para 74.877 bytes, exports de 53 para 50 e imports de 6 para 5. Isso mede tamanho/ABI, não FPS, memória em execução nem frame time. Nenhum benchmark foi feito.

## Preview Rust/WASM local v280.0 — batches do mapa removidos
Remover os batches de sombras e estrutura reduziu o WASM legado de 77.025 para 75.772 bytes, exports de 55 para 53 e imports de 7 para 6. Isso mede somente o arquivo e a ABI, não FPS, memória em execução ou frame time. Nenhum benchmark foi feito.

## Preview Rust/WASM local v279.0 — detalhes do mapa
Remover `paint_map_details` reduziu o WASM legado de 78.156 para 77.025 bytes e os exports de 56 para 55; imports permaneceram em 7. A comparação mede apenas arquivo e ABI, não FPS ou frame time. Nenhum benchmark foi feito.

## Preview Rust/WASM local v278.0 — batch de decoração removido
Remover `paint_map_decor` reduziu o WASM legado de 78.561 para 78.156 bytes e os exports de 57 para 56; imports permaneceram em 7. Essa redução de tamanho/ABI não comprova aumento de FPS. Nenhum benchmark foi feito.

## Preview Rust/WASM local v277.0 — ícones sem batch legado
Remover os batches de armas e vidros reduziu o WASM legado de 103.429 para 78.561 bytes e os exports de 59 para 57; imports permaneceram em 7. Isso mede apenas tamanho do arquivo e superfície ABI, não FPS, memória em execução ou frame time. Nenhum benchmark foi feito.

## Preview Rust/WASM local v276.0 — composição de fantasmas
O batch de fantasmas foi removido do WASM legado após a migração ao painter direto. O módulo principal caiu de 120.272 para 103.429 bytes e de 61 para 59 exports; não foi feito benchmark de FPS.

## Preview Rust/WASM local v274.0 — formas fixas do HUD
- WASM legado: 125.432 bytes, 7 imports e 63 exports (v273: 126.802 bytes e 65 exports). A redução não demonstra aumento de FPS; não foi feito benchmark.
- Quatro estágios fixos do HUD tiveram paridade RGBA exata contra Canvas no Chrome.

## Preview Rust/WASM local v273.0 — dealer da loja
- WASM legado: 126.802 bytes, 8 imports e 65 exports (v272: 128.777 bytes e 67 exports). O binário menor não comprova ganho de FPS; não foi feito benchmark.
- Dealer normal e caindo foram comparados no Chrome ao Canvas original com zero diferenças RGBA.

## Preview Rust/WASM local v272.0 — painéis da loja
- WASM legado: 128.777 bytes, 8 imports e 67 exports (v271: 129.725 bytes e 69 exports). A redução do binário não demonstra aumento de FPS; sem benchmark.
- Os casos Canvas dos painéis foram comparados no Chrome; a paridade independente do dealer está em investigação.

## Preview Rust/WASM local v271.0 — base e overlay do mapa
- WASM legado: 129.725 bytes, 8 imports e 69 exports (v270: 129.918 bytes e 71 exports). A redução do binário não demonstra aumento de FPS; não foi feito benchmark.
- Casos de mapa fixo, mapa procedural vazio e overlay comparados no Chrome tiveram zero diferenças RGBA.

## Preview Rust/WASM local v270.0 — menu de pausa
- WASM legado: 129.918 bytes, 8 imports e 71 exports (v269: 131.018 bytes e 73 exports). A redução do binário não demonstra aumento de FPS; não foi feito benchmark.
- Paridade Chrome do menu nos estados sem hover e com cada botão em hover: zero diferenças RGBA; também passou a versão com rótulos localizados.

## Preview Rust/WASM local v269.0 — barra de vida do chefe
- WASM legado: 131.018 bytes, 8 imports e 73 exports (v268: 132.196 bytes e 75 exports). A redução do binário não demonstra aumento de FPS; não foi feito benchmark.
- A paridade Chrome da barra teve zero diferenças RGBA e preservou alpha, composição e transformação.

## Preview Rust/WASM local v259.0 — camada de névoa/fumaça
A aplicação de sprites e cálculo de posições passam pelo painter Rust/WebSys direto; o WASM legado perdeu buffers, exports e callback. Estado do tempo, fumaça e perf tier continuam no JS. O fallback Canvas do jogo permanece. Módulo legado: 162.701 bytes, 17 imports e 106 exports. Sem benchmark.

## Preview Rust/WASM local v258.0 — transportes diretos
Escadas e elevadores usam painter Rust/WebSys direto, com gradientes gerados por Rust e cacheados. O WASM legado já não implementa essa camada; o fallback Canvas original continua no jogo. Módulo legado: 163.672 bytes, 18 imports e 109 exports. Paridade Chrome, regressão e testes de ABI/bridge passaram; sem benchmark.

## v251 — batches de contorno e máscara escura removidos
O módulo legado reserva 524.432 bytes a menos em arrays fixos, perde dois imports de host e o binário reduz 1.456 bytes comparado à v250. Isso não mede FPS ou frame time; não foi feito benchmark.

## v250 — batch de composição de camadas removido
A compilação removeu 448 bytes do módulo legado e um import de desenho pelo host (34 → 33). A cena continua usando o mesmo `drawImage` para fallback se o painter Rust direto falhar. Isso não representa uma medição de FPS; não foi feito benchmark.

## v249 — remoção de buffers de efeitos do WASM legado
A remoção dos arrays fixos para poeira, faíscas, sangue e cadáveres reduz em ~2.818.048 bytes (2,69 MiB) os dados estáticos reservados no módulo antigo; o arquivo `.wasm` reduziu 3.173 bytes comparado ao ZIP v248. Isso informa tamanho de memória/código, não FPS: não foi feito benchmark.

## v247 — geradores de sprites radiais/névoa removidos do WASM legado
Recompilar após retirar geradores e buffers diminuiu o binário legado em 3.790 bytes (cerca de 2,0%). É redução de tamanho do arquivo, não medição de desempenho; FPS, CPU e frame time não foram medidos.

## v246 — sprite de névoa sem memória WASM antiga
Rust direto agora recebe os anéis como typed array do bridge e grava o RGBA no canvas. A remoção evita cópia intermediária para memória linear e callback host nessa geração; não houve medição de frame time, CPU, GPU ou memória, então não afirmamos ganho no jogo.

## v245 — sprite radial sem buffer WASM legado
O wrapper elimina a cópia para memória linear e a passagem pelo callback antigo ao gerar esse sprite. Isso remove tráfego e trabalho dessa rota específica, mas não houve medição de frame time, CPU, GPU ou memória; não afirmamos ganho de desempenho no jogo.

## v204 — seta da Invasão
Rust calcula e pinta a seta sem criar/copyar o batch legado de vértices. Não foram medidos frame time, CPU, GPU ou memória; não afirmamos ganho de desempenho.

## v203 — máscara Coruja
JavaScript reusa buffers para enviar os contornos visíveis e a rota; Rust/WebSys desenha as formas e o caminho em Canvas. Não houve medição de frame time, CPU, GPU ou memória; nenhum ganho de desempenho é afirmado.

## v202 — projéteis
Rust recebe as entradas e executa `drawImage` sem montar o comando WASM legado; os sprites e o buffer são reutilizados. Sem medições de frame time, CPU, GPU ou memória; não afirmamos ganho.

## v201 — cápsulas de munição
Rust projeta e rasteriza os dados diretos, evitando a geração/cópia do batch legado. O buffer JS é reutilizado; sem medição de frame time, CPU, GPU ou memória e sem alegação de ganho.

## v200 — pickups e armas arremessadas
A mudança remove a cópia do batch legado para estas chamadas no caminho normal e reutiliza buffers JS após o crescimento inicial. Sem medidas de frame time, CPU, GPU ou memória; nenhum ganho de desempenho é afirmado.

## v199 — efeitos de disparo e impacto
Esta mudança remove o batch intermediário no WASM antigo para a rota normal dos efeitos. Não foram medidos frame time, CPU, GPU ou memória; nenhum ganho de desempenho é afirmado.

## v198 — blackout e lanterna
Rust calcula a projeção e os raios para evitar o lote intermediário do WASM legado. Não há medição de frame time, CPU, GPU ou memória; nenhum ganho é afirmado.

## v197 — neblina e fumaça
Rust calcula offsets e rasteriza os três sprites sem montar uma lista intermediária no WASM legado. Sem medições de frame time, CPU, GPU ou memória; não há alegação de ganho.

## v196 — zona da Invasão
Rust calcula a pulsação e rasteriza o marcador sem gerar um comando intermediário no WASM legado. Não foram medidos frame time, CPU, GPU ou memória; não há alegação de ganho de desempenho.

## v195 — luzes de mundo
Rust calcula pulso/flicker e pinta luzes, clarão e reflexo, evitando o batch intermediário do WASM legado nessa camada. JavaScript ainda prepara os dados e mantém sprites/estado; não foram medidos frame time, CPU, GPU ou memória, portanto não há alegação de ganho de desempenho.

## v194 — anéis de mundo
Rust calcula a geometria do pulso e rasteriza os anéis ativos, reduzindo o trabalho de desenho e de geração de comandos no WASM legado nessa camada. A preparação dos dados e a filtragem continuam em JavaScript. Frame time, CPU, GPU e memória não foram medidos; não há alegação de ganho de desempenho.

## v193 — vidro e estilhaços
O painter direto elimina a geração e transferência de comandos pelo WASM antigo nessa camada. Preparação de arrays ainda ocorre em JavaScript. Sem medições de frame time, CPU, GPU ou memória; nenhum ganho é afirmado.

## v192 — realces de inimigos
O caminho direto evita gerar e transferir comandos do WASM antigo para anéis, barras e vetores. A seleção de entidades e a montagem do payload ainda são feitas no host. Frame time, CPU, GPU e memória não foram medidos; não há alegação de ganho.

## v191 — barris e câmeras
As rotas normais deixam de gerar comandos no WASM antigo e enviam registros compactos ao painter direto. O custo de preparação ainda inclui arrays no host; não foram medidos frame time, CPU, GPU ou memória, portanto não há alegação de ganho de desempenho.

## v190 — portas Neon
O módulo direto aplica os mesmos transforms e drawImage em ordem, retirando a geração/transferência do lote de cinco comandos pelo WASM legado. Operações Canvas permanecem equivalentes. Não foram medidos frame time, CPU, GPU ou memória; sem alegação de ganho.

## v189 — portas de sala
A geometria simples e os dois contornos são desenhados pelo módulo Rust direto sem gerar um command batch no WASM legado. O número de operações Canvas se mantém. Não foram medidos frame time, CPU, GPU ou memória; não se afirma ganho de desempenho.

## v176 — composição de tela
## v188 — ícones de armas
O módulo direto desenha o mesmo conjunto de primitivas e evita gerar/transferir lotes de comandos pelo WASM legado para os ícones. Chrome confirmou pixels iguais em 24 armas. Não foram medidos frame time, CPU, GPU ou memória; não se afirma ganho de desempenho.

## v187 — entrada do compositor de mapa
Arrays JavaScript próprios alimentam o painter Rust direto, evitando a cópia de retângulos para a memória do WASM legado na rota normal. O trabalho de composição e os passes de pixels permanecem equivalentes. Não foram medidos frame time, CPU, GPU ou memória; não se afirma ganho de desempenho.

Gradação e fade/flash executam as mesmas duas chamadas de composição via painter WebSys/Rust. O trabalho efetivo por pixel e o número de passes permanecem os mesmos; tempo de quadro, CPU/GPU e memória não foram medidos, portanto não se afirma ganho de desempenho.

## v177 — transporte
Escada e elevador mantêm os mesmos comandos e operações Canvas, agora chamados pelo módulo direto Rust. Não houve redução de passes; tempo de quadro, CPU/GPU e memória seguem sem medição.

## v178 — saída de fase
Brilho, gradiente cacheado, hachuras e bordas mantêm a mesma quantidade de operações, agora pelo painter Rust. Não houve medição de tempo de quadro, CPU/GPU ou memória.

## v179 — itens de arma
Transformações e círculos de brilho são rasterizados em Rust, enquanto o mesmo painter do ícone roda aninhado. A quantidade total de operações Canvas se mantém e o ícone preserva o caminho existente; não foram medidos frame time, CPU/GPU ou memória.

## v180 — formas de HUD
O painter direto executa as mesmas formas/ordem e a mesma quantidade de chamadas Canvas para barras, arcos e triângulos; não há redução de trabalho por pixel nem medição de frame time, CPU/GPU ou memória.

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

## v171.0 — estojos pelo painter Rust; sem benchmark
Os estojos usam desenho direto via WebSys nas chamadas cobertas. Não foram medidos frame time, CPU, memória ou FPS, portanto não se afirma ganho de desempenho.

## v172.0 — texto de combo Rust; sem benchmark
O painter direto executa as operações Canvas do texto de combo nos casos cobertos. Não foram medidos frame time, CPU, memória ou FPS; nenhum ganho é afirmado.

## v173.0 — texto do alarme Rust; sem benchmark
O painter direto executa estilo, alinhamento e fillText para o rótulo nos casos cobertos. Não foram medidos frame time, CPU, memória ou FPS; nenhum ganho é afirmado.

## v174.0 — imagens HUD por Rust; sem benchmark
O painter direto faz drawImage para as camadas HUD cobertas. Não foram medidos frame time, CPU, memória ou FPS; nenhum ganho é afirmado.

## v175.0 — projéteis por Rust; sem benchmark
O painter direto executa drawImage para os projéteis do lote coberto. Não foram medidos frame time, CPU, memória ou FPS; nenhum ganho é afirmado.

## v181 — texto cacheado
O mesmo `drawImage` e o mesmo bitmap permanecem; agora a chamada é emitida pelo módulo Rust. A quantidade de pixels e o número de operações Canvas não foram reduzidos. Frame time, CPU/GPU e memória não foram medidos.

## v182 — retângulos de piso
O mesmo lote de `fillRect` continua sendo executado, agora por Rust/WebSys. Não reduz número de operações ou pixels; frame time, CPU/GPU e memória não foram medidos.

## v183 — contornos noturnos de atores
O mesmo número de arcos/strokes continua sendo desenhado pelo painter Rust direto; não reduz trabalho por pixel nem número de operações. Frame time, CPU/GPU e memória não foram medidos.

## v184 — leitura de pixels de texturas
Canvas/WebSys e rasterização de HTMLImageElement agora ocorrem pelo módulo direto Rust para folhas pequenas do piso/mapa; Chrome observou cinco chamadas na cena de teste. Número de pixels copiados e compositor RGBA não mudaram. Frame time, CPU/GPU, memória e FPS não foram medidos; nenhum ganho de desempenho é afirmado.

## v185 — compositor de textura do mapa
Rasterização e `putImageData` passam ao módulo Rust direto; seleção/cache e preparação dos buffers continuam no host, e compositor antigo continua fallback. Duas chamadas diretas foram observadas na cena de teste. Não foram medidos frame time, FPS, CPU/GPU nem a memória adicional de 5 MB do buffer de saída direto; não se afirma ganho de desempenho.

## v186 — preparação do input de textura
O crop dos oito sprites agora escreve num buffer JS curto, não nos buffers da memória WASM antiga durante o caminho direto. Uma cópia à memória antiga acontece apenas no fallback. Reduz a dependência de memória legada do caminho normal; não foram medidos frame time, FPS, CPU/GPU ou tempo de cópia e não se afirma ganho de desempenho.
## v205 — arte procedural de máscaras
A pintura passa a chamar Rust/WebSys uma vez para cada sprite das 16 máscaras expandidas, em vez de executar a sequência de comandos Canvas no JavaScript. Isso reduz trabalho de desenho na VM JS durante a geração dos sprites; não foi medido tempo de abertura, frame time, CPU ou GPU. O fallback Canvas é mantido.

## v206 — ícones de armas da expansão
O painter Rust já é usado em modo WASM; esta etapa corrige a paridade visual com o callback JS. Não há mudança mensurada de velocidade ou custo, sem benchmark de CPU, GPU ou tempo de frame.

## v207 — barra do chefe
A barra deixou de gerar um batch Rust legado e não recebe mais pintura de Canvas por callback JS no caminho direto. A entrada continua calculada no JS; não foi medido ganho de tempo, CPU ou GPU.

## v252 — batches de FX, pickups e arremessos removidos
Seis buffers fixos removidos do WASM antigo ocupavam ~1,88 MiB de memória linear reservada. O binário caiu 2.430 bytes; imports 31 → 27 e exports 134 → 127. Essa redução de memória e tamanho não demonstra FPS nem melhora de tempo por frame; benchmark não realizado.

## v253 — color grade e overlays finais
Dois imports, quatro exports e quatro buffers de comando do módulo legado foram removidos. O WASM encolheu 1.209 bytes; imports 27 → 25 e exports 127 → 123. As mesmas operações de Canvas continuam ocorrendo via painter direto, sem medições de frame time, FPS, CPU/GPU ou memória alocada; não se afirma ganho de desempenho.
## v254 — textos de combo e alarme
Dois imports, quatro exports e quatro buffers do WASM legado foram removidos; o binário diminuiu 959 bytes. Os traços de texto ainda são desenhados em Canvas via WebSys Rust, então isso não elimina rasterização, nem comprova melhora de frame time/FPS. Nenhum benchmark foi feito.
## v255 — imagens do HUD
Um import, dois exports e dois arrays estáticos foram removidos; o binário diminuiu 844 bytes. Os mesmos `drawImage` continuam no Canvas através de WebSys. Não foram medidos frame time, FPS, CPU, GPU ou memória, portanto não há ganho de desempenho afirmado.
## v256 — seta da Invasão
Um import, dois exports e os buffers fixos de vértices foram removidos; o binário diminuiu 547 bytes. A mesma forma continua sendo pintada em Canvas através de WebSys; não foram medidos frame time/FPS, CPU, GPU ou memória. Não se afirma ganho de velocidade.
## v257 — marcador da zona de Invasão
Um import, três exports e os buffers fixos da zona foram removidos; o WASM diminuiu 799 bytes. Círculo e preenchimento ainda são rasterizados em Canvas via WebSys. Sem medição de frame time/FPS, CPU, GPU ou memória; não se declara ganho de desempenho.
## Preview Rust/WASM local v260.0 — efeitos climáticos
A remoção das rotas duplicadas de chuva e poeira reduziu o módulo legado para 161.040 bytes, 15 imports e 100 exports. Isso é tamanho/complexidade do binário, não uma medição de FPS; nenhum benchmark foi feito.

## Preview Rust/WASM local v261.0 — efeitos do mundo
- Renderer WASM legado: 146.123 bytes, 15 imports e 94 exports (v260: 161.040 bytes, 15 imports e 100 exports). O código/buffers removidos reduziram o módulo; isso não demonstra aumento de FPS.
- Sem benchmark de frame time, CPU, GPU ou memória.

## Preview Rust/WASM local v262.0 — luzes e anéis
- Renderer WASM legado: 142.552 bytes, 13 imports e 87 exports (v261: 146.123 bytes, 15 imports e 94 exports). Os buffers e callbacks removidos reduziram o módulo; isso não demonstra aumento de FPS.
- Sem benchmark de frame time, CPU, GPU ou memória.

## Preview Rust/WASM local v263.0 — overlays FX
- Renderer WASM legado: 140.548 bytes, 12 imports e 84 exports (v262: 142.552 bytes, 13 imports e 87 exports). A redução do módulo não demonstra aumento de FPS.
- Sem benchmark de frame time, CPU, GPU ou memória.

## Preview Rust/WASM local v264.0 — saída de fase
- Renderer WASM legado: 138.556 bytes, 10 imports e 81 exports; buffers removidos liberaram 1.742.400 bytes na memória linear. Isso não demonstra aumento de FPS.
- Sem benchmark de frame time, CPU, GPU ou memória.

## Preview Rust/WASM local v266.0 — setup e fundo do quadro
- Renderer WASM legado: 134.896 bytes, 8 imports e 78 exports (v265: 135.898 bytes, 10 imports e 80 exports). A redução do módulo não demonstra aumento de FPS; não foi feito benchmark.

## Preview Rust/WASM local v267.0 — transforms do quadro
- Renderer WASM legado: 132.404 bytes, 8 imports e 76 exports (v266: 134.896 bytes, 8 imports e 78 exports). A redução do módulo não demonstra aumento de FPS; não foi feito benchmark.

## Preview Rust/WASM local v268.0 — sombra/aura de jogador
- Renderer WASM legado: 132.196 bytes, 8 imports e 75 exports (v267: 132.404 bytes, 8 imports e 76 exports). A redução do módulo não demonstra aumento de FPS; não foi feito benchmark.
- Sem benchmark de frame time, CPU, GPU ou memória.
## v287.0 — overhead de diagnóstico
Os wrappers de métodos/propriedades Canvas agora só são instalados em sessões com `?renderer=wasm&wasmDiagnostics=1`; o modo WASM comum não intercepta cada chamada para contar operações. Build e paridade foram verificados, mas não há comparação FPS/CPU anterior e posterior. Não inferir ganho de desempenho a partir desta remoção de wrappers.

## v288.0 — painel de pausa e auditoria de chamadas
A caixa de resumo da pausa chama Rust direto. Na sessão de auditoria Chrome, 12 estados não geraram chamadas Canvas no host; a instrumentação estava ativada e, portanto, essa sessão serve como amostra funcional, não benchmark de desempenho. O painel/diagnóstico têm custo de execução e não medem FPS, CPU média ou p95. Sem ganho de performance comprovado.

## v92/v306 — filtros de alcance da IA sem raiz quadrada; destino reutilizado

Os filtros de proximidade para comunicação, chamados de reforço e propagação de alerta comparam dx²+dy² com r², preservando a desigualdade estrita. A IA também reaproveita o objeto goal enquanto atualiza suas coordenadas no estado de investigação. A regressão verifica 19.200 pontos determinísticos por implementação, tangências e identidade/posição do destino nas duas versões.

Em dois pares locais do Chrome com 120 inimigos e 500 faíscas, usando CAPPE_PERF_MIXED_AI=1, o p90 mediano de update+draw mudou de 0,55 para 0,5 ms na Web e de 0,9 para 0,85 ms em Rust/WASM. O p95 Rust ficou em 0,95 ms; médias não mostraram ganho consistente (Web 0,463→0,474 ms; Rust 0,736→0,756 ms). A amostra é pequena e local; não comprova aumento geral de FPS.

## v307 — vista reutilizada para entrada de faíscas Rust/WASM

O desenho das faíscas reutiliza `Float64Array.subarray` enquanto a quantidade e o buffer permanecem iguais. Com 500 faíscas em 180 quadros, o contador instrumentado caiu de 179 vistas criadas para 1. A mediana da média de quadro ficou praticamente igual (0,797→0,803 ms), p90 igual (0,9 ms) e p95 mudou de 1,1 para 1,0 ms. Isso reduz a criação de objetos de vista no caminho medido, mas não comprova redução de heap bytes nem aumento consistente de FPS. Regressões 115/115 e paridade Chrome de partículas: zero diferenças de pixel.

## v93/v308 — atualização e compactação de faíscas em um percurso

`updateSparks` integra posição/vida e compacta as partículas sobreviventes no mesmo laço estável, reduzindo um percurso completo por quadro em Web e Rust/WASM. O teste determinístico verifica as duas versões, identidade/ordem das partículas sobreviventes e remoção após expiração. Em três execuções Chrome com 120 inimigos e 500 faíscas, as medianas de update+draw após adaptação foram: Web p90 0,6→0,5 ms, p95 0,6→0,5 ms e média 0,433→0,430 ms; Rust/WASM p90 0,9→0,9 ms, p95 1,0→0,9 ms e média 0,762→0,712 ms. São amostras de 60 quadros por execução, em uma máquina; não demonstram redução de memória nem garantem FPS em geral.

## v94/v309 — ZIPs de execução

Os downloads agora incluem somente os arquivos usados para jogar: recursos, CSS/JS, HTML, service worker, launcher, servidor e (em Rust/WASM) o renderer direto compilado. O manifesto offline foi comparado com os caminhos dentro dos ZIPs: 92/92 arquivos Web e 95/95 Rust/WASM existem; os dois jogos abriram no Chrome e o renderer Rust/WASM ficou pronto. Relatórios, testes e código-fonte de compilação permanecem no repositório. O ZIP Web caiu 7.212 bytes (0,78%); o Rust/WASM caiu 438.534 bytes (29,2%).

## v310 — perfil Rust de redução de tamanho

O perfil `opt-level = "s"` reduziu `direct_renderer_bg.wasm` de 326.479 para 287.430 bytes no arquivo, e de 326.779 para 287.730 bytes transferidos pelo servidor (−39.049; −12,0%). O ZIP runtime passou de 1.065.800 bytes para 1.060.621 (−5.179; −0,49%); a compressão ZIP já reduzia bastante o binário. Seis pares de execuções Chrome, cada build com 60 quadros após adaptação, mantiveram p90 mediano de 0,9 ms e p95 mediano de 1,0 ms; a média mediana mudou de 0,727 para 0,759 ms. Essa pequena diferença não prova regressão estável ou melhora; o objetivo mensurado aqui é reduzir bytes de download. Regressões 116/116, paridade direta, piso, partículas e renderer-browser passaram.


## v95/v311 — agrupamento de faíscas sem listas temporárias

O agrupamento Canvas de faíscas usa índices encadeados em um buffer `Int32Array` reutilizável, preservando ordem, cor e opacidade. Em dois perfis locais Chrome com 500 faíscas, 120 inimigos e IA mista, as alocações amostradas em `drawSparks` na Web foram 4.623.316 e 4.000.848 bytes antes, contra 1.179.864 e 1.245.408 depois (média −71,9%). Rust/WASM teve 1.477.208 e 984.464 bytes antes; depois, a função não apareceu entre os 16 maiores alocadores, portanto não calculamos uma redução percentual. Médias de quadro: Web 0,454→0,449 ms (p90 mediano 0,55→0,5 ms; p95 0,6→0,6 ms); Rust/WASM 0,759→0,766 ms (p90 0,9→0,95 ms; p95 0,95→0,95 ms). A amostra não mostra ganho consistente de quadro/FPS. Regressões: 117/117; partículas Web e teste de compressão passaram.
## v98/v314 — carregamento das fases em tiles antes da campanha

Corrigido um erro de inicialização: exp-world.js podia executar antes de TILE_LEVELS estar disponível porque o catálogo Neon é carregado de forma lazy. As fases em tiles agora ficam em js/tile-levels.js, carregado antes dos modos; js/maps.js continua lazy para preservar o carregamento inicial dos mapas Neon. Regressões Rust/WASM: 118/118; auditoria de cenas WASM passou. Não é uma medição de FPS.

## v317 / Web v101 — 10/11/2026
O gargalo foi medido no Chromium com a ferramenta `tests/browser-performance.cjs`. A escala automática anterior permitia 1,5× e o governador tomava uma única decisão após 120 quadros. Agora o limite é 1,25×, com níveis 0,82× e 0,64×; a janela é de 90 quadros e permite uma segunda redução se a primeira continuar insuficiente.

Resultados locais após a alteração: Web, p90 de intervalo RAF 16,7 ms e p90 de trabalho 0,8 ms; Rust/WASM, p90 de intervalo RAF 16,7 ms e p90 de trabalho 1,9 ms, com canvas final 768×480 no nível 2. Em cena pesada Rust/WASM com 80 inimigos, IA visível e 400 faíscas, p95 de trabalho após adaptação foi 2,2 ms. O Chrome headless usado pelo teste tem cadência própria; esses números servem para comparar a mudança e não representam o notebook do usuário.

