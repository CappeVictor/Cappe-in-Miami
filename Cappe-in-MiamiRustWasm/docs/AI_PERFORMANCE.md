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

