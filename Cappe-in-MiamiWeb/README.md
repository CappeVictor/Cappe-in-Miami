# Cappe in Miami Web — v92.0

## Otimização v92 — verificações de alcance da IA

As verificações de proximidade entre inimigos comparam a distância ao quadrado com o raio ao quadrado, sem calcular uma raiz quadrada, nos filtros de comunicação, reforço e alerta visual. A lógica preserva o limite estrito do raio; a regressão compara os resultados com a distância euclidiana em pontos determinísticos e tangências. A IA também reutiliza o objeto do alvo de investigação ao atualizar suas coordenadas.

Dois pares locais no Chrome, com 120 inimigos e 500 faíscas, usando o cenário misto de IA, tiveram p90 mediano de update+draw de 0,55 ms antes e 0,5 ms depois; p95 mediano de 0,6 para 0,55 ms. As médias ficaram praticamente iguais (0,463→0,474 ms), portanto não há evidência de ganho consistente no quadro total. Resultados locais, sem promessa de FPS geral.

Versão para navegador com HTML, CSS e JavaScript; o jogo usa o renderer Canvas 2D em JavaScript e não depende de Rust nem WebAssembly.

## Executar

1. Instale Node.js 18 ou superior.
2. Dê duplo clique em `INICIAR_WEB.bat`.
3. O navegador abrirá o jogo em `http://127.0.0.1:8787/`. Mantenha a janela preta aberta enquanto joga; encerre o servidor com Ctrl+C.

Também é possível abrir `index.html` pelo Live Server do VS Code. O servidor local é recomendado para o service worker e para os recursos multiplayer.

## Otimizações v82

O ajuste automático mede o custo update+draw e os intervalos dos primeiros 120 quadros aceitos. Usa o percentil 90 para não reduzir a qualidade por picos isolados, respeita o limite de FPS escolhido e mantém dois níveis de redução de efeitos e resolução interna para lentidão persistente; resolução manual e modo Máximo são respeitados. Em um smoke headless com movimento e disparos, o p90 ficou em 18,3 ms e o tier permaneceu 0. É uma amostra local, não benchmark controlado nem garantia de FPS em outros PCs.

O bundle `js/maps.js` agora contém apenas os 61 mapas da allowlist; os 98 mapas inativos e de teste foram removidos. O arquivo caiu 44,8%, de cerca de 2,93 MB para 1,62 MB; o ZIP caiu cerca de 11,7% (aprox. 1.026 KB para 906 KB). A regressão compara os dados dos 61 mapas Web com a versão Rust/WASM.

## Otimização v83

O servidor comprime HTML, JavaScript, CSS, JSON e SVG com gzip quando o navegador aceita. Recursos binários e WASM seguem sem recompressão. Em Chrome local, `js/maps.js` transferiu 301.534 bytes para 1.616.616 bytes decodificados (81,4% menos no corpo); a transferência total observada no carregamento inicial passou de 2.278.696 para 764.981 bytes. São medidas desta máquina e sessão, não garantia de latência em outros ambientes.

Valide a compressão com `node tests/compression-regression.cjs`; o teste confere igualdade dos bytes, negociação gzip, fallback identity, `q=0` e `HEAD`.

## Otimização v84

O desenho de faíscas agora agrupa cada partícula uma vez por cor e faixa de opacidade, reutilizando os grupos entre quadros. A regressão de pixels verifica o caminho Canvas com 500 faíscas; os dados da simulação e a aparência esperada permanecem iguais.

A IA agora reutiliza os objetos dos pontos de rota BFS quando recalcula o caminho. A rota não muda; uma regressão verifica a igualdade com uma busca independente. O microbenchmark sintético registrou 0 objetos de ponto criados em 500 recálculos após aquecer o pool, contra 35.000 sem reutilização. A mediana ficou perto de 0,04 ms nos dois casos; não houve ganho demonstrado em tempo de quadro ou heap total.

## Otimização v85

A colisão usada pela navegação da IA agora consulta uma grade espacial de sólidos próximos em vez de percorrer todos os retângulos do mapa em cada amostra de raio. Os sólidos, tiles e geometria dos mapas não mudam. Uma regressão compara 3.000 posições com a busca linear e confirma os mesmos resultados.

Em três rodadas locais no Chrome, com 120 inimigos e 500 faíscas, a mediana do p90 de update+draw caiu de 3,7 ms na v84 para 2,0 ms; p95 caiu de 4,5 para 2,7 ms e a média de 2,272 para 1,613 ms. É um cenário de estresse local; os tempos variam por mapa e computador. Regressões compartilhadas: 108/108.


## Otimização v86

As 14 imagens de máscara não são mais baixadas no início do jogo. Elas são carregadas quando o seletor é aberto ou uma máscara é escolhida; depois do primeiro uso, o service worker as guarda no cache para uso offline. Em Chrome local, os bytes transferidos no carregamento inicial caíram 325.246 bytes (de 765.523 para 440.277; 42,5%). As miniaturas carregam sob demanda conforme entram na área visível; a imagem da máscara selecionada também é carregada quando necessária. Regressões: 109/109; verificação de compressão passou. É uma medição local de transferência, não de FPS.


## Otimização v88 — carregamento adiado dos mapas Neon

`js/maps.js` agora só é requisitado quando a campanha chega à primeira fase Neon ou quando o jogador escolhe um mapa Neon. A lista de 61 mapas permanece no seletor, sem baixar a geometria antes da hora; depois do primeiro uso, o service worker pode armazenar o arquivo para uso offline. Em Chrome local, a abertura inicial transferiu 301.534 bytes a menos e decodificou 1.616.616 bytes a menos. O início da campanha foi conferido até a primeira expansão e o mapa correto carregou em uma única requisição. Suíte de regressão: 110/110. Os tempos variam por computador; não houve medição de FPS nem revisão visual ampla.

## Otimização v89 — vizinhos de navegação pré-calculados

O BFS da IA reutiliza uma tabela compacta de vizinhos caminháveis construída junto com a grade de navegação. A ordem de exploração, os bloqueios diagonais e a rota resultante foram preservados; a regressão compara 700 rotas determinísticas com a implementação anterior. No perfil de CPU local, `EXP.navPath` acumulou 103 ms nesta versão, contra 135 ms na referência (uma captura por build). A tabela usa cerca de 17 bytes por célula e acrescenta alguns milissegundos à montagem da grade. O ensaio com 120 inimigos teve grande variação entre rodadas, portanto não há afirmação de ganho geral de FPS. Suíte: 111/111.

## Otimização v90 — seleção de alvo da IA sem ordenação

`activeTarget` compara as distâncias quadráticas até P1 e P2 diretamente, sem criar uma lista temporária nem ordená-la; empates continuam favorecendo P1. Em 120 mil chamadas sintéticas, a mediana caiu de 48,6 para 26,2 ms (−46%). Em três pares Chrome com 120 inimigos e 500 faíscas, p90 mediano de update+draw caiu de 3,5 para 3,0 ms e p95 de 4,1 para 3,7 ms. Resultado específico do cenário e desta máquina; não representa FPS universal. Suíte compartilhada: 112/112.

## Otimização v91 — rejeição rápida em colisões Web

`hitWall` e `hitWallNG` descartam rapidamente retângulos fora do alcance do círculo antes do cálculo da distância. O teste geométrico final continua estrito: tangência não vira colisão, vidro continua ignorado pela linha de visão e nenhum dado dos mapas muda. Regressões determinísticas com 6.010 posições por função confirmaram equivalência com a referência na Web e em Rust/WASM; a suíte passou em 113/113.

Em dois pares Chrome locais, com 120 inimigos e 500 faíscas, a Web melhorou de forma consistente no p95; as medianas dos pares passaram de 2,35 para 1,95 ms. O p90 mediano foi de 2,0 para 1,9 ms, e a média de 1,519 para 1,362 ms. Na medição Rust/WASM não houve ganho consistente nos tempos de quadro, então o runtime Rust permanece inalterado. Resultados deste computador e cenário, sem promessa de FPS geral; não houve revisão visual ampla.

## Otimização v87 — grade de colisão da IA

As consultas de colisão da navegação da IA percorrem apenas as caixas colocadas nas células espaciais tocadas pelo raio. A grade mantém referências diretas aos sólidos e deixa de expandir cada caixa e deduplicar a cada consulta. A geometria e o teste exato de círculo contra retângulo foram preservados. Regressões compararam 15.000 posições aleatórias com busca linear; 110/110 passaram. Em três rodadas Chrome com 120 inimigos e 500 faíscas, p90 mediano de update+draw foi de 2,3 para 2,0 ms e a mediana dos p95 de 3,0 para 2,6 ms. Ganhos modestos neste cenário local; não medem FPS geral.
