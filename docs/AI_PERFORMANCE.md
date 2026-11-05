# Performance — linha de base parcial
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
O ajuste automático usa dt já limitado a 1/30: medir tempo bruto separadamente antes de alterar seus limiares.

## Ainda não medido
FPS, frame pacing, update/draw reais, CPU/GPU, memória/GC, carregamento no navegador e sessões longas. Coletar antes de adotar pooling adicional, quadtree, novas camadas ou renderização diferente.
# v39.0 — sem benchmark de desempenho nesta iteração
Foram adicionados uma consulta HTTP leve a cada 5 segundos enquanto o lobby está aberto e checagens constantes de borda nas funções existentes de colisão. Não foi medido FPS nem uso real de CPU; os testes funcionais não são evidência de desempenho. Limite de frequência é intencionalmente restrito à tela Multiplayer.

