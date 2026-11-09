# Cappe in Miami Web — v85.0

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
