# Cappe in Miami Web — v81.0

Versão para navegador com HTML, CSS e JavaScript; o jogo usa o renderer Canvas 2D em JavaScript e não depende de Rust nem WebAssembly.

## Executar

1. Instale Node.js 18 ou superior.
2. Dê duplo clique em `INICIAR_WEB.bat`.
3. O navegador abrirá o jogo em `http://127.0.0.1:8787/`. Mantenha a janela preta aberta enquanto joga; encerre o servidor com Ctrl+C.

Também é possível abrir `index.html` pelo Live Server do VS Code. O servidor local é recomendado para o service worker e para os recursos multiplayer.

## Otimizações v81

O ajuste automático mede o custo update+draw e os intervalos dos primeiros 120 quadros aceitos. Usa o percentil 90 para não reduzir a qualidade por picos isolados, respeita o limite de FPS escolhido e mantém dois níveis de redução de efeitos e resolução interna para lentidão persistente; resolução manual e modo Máximo são respeitados. Em um smoke headless com movimento e disparos, o p90 ficou em 18,3 ms e o tier permaneceu 0. É uma amostra local, não benchmark controlado nem garantia de FPS em outros PCs.

O bundle `js/maps.js` agora contém apenas os 61 mapas da allowlist; os 98 mapas inativos e de teste foram removidos. O arquivo caiu 44,8%, de cerca de 2,93 MB para 1,62 MB; o ZIP caiu cerca de 11,7% (aprox. 1.026 KB para 906 KB). A regressão compara os dados dos 61 mapas Web com a versão Rust/WASM.
