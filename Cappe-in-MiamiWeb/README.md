# Cappe in Miami Web — v79.0

Versão para navegador com HTML, CSS e JavaScript; o jogo usa o renderer Canvas 2D em JavaScript e não depende de Rust nem WebAssembly.

## Executar

1. Instale Node.js 18 ou superior.
2. Dê duplo clique em `INICIAR_WEB.bat`.
3. O navegador abrirá o jogo em `http://127.0.0.1:8787/`. Mantenha a janela preta aberta enquanto joga; encerre o servidor com Ctrl+C.

Também é possível abrir `index.html` pelo Live Server do VS Code. O servidor local é recomendado para o service worker e para os recursos multiplayer.

## Otimização de renderização v77

O ajuste automático mede o custo de update+draw e o intervalo de quadros nos primeiros 120 quadros jogando. Compara a cadência ao limite de FPS escolhido, para não reduzir qualidade quando 30 FPS é a meta. Usa dois níveis de redução de efeitos e resolução interna em caso de lentidão; resolução manual e modo Máximo são respeitados. Em uma captura local headless, a Web passou do tier 0 ao tier 2 e o canvas foi de 1197×748 para 862×539; intervalo RAF mediano observado foi de 66,6 ms antes e 16,8 ms depois. É uma única captura de smoke, não um benchmark comparativo controlado nem garantia de FPS em outros PCs.
