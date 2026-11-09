# Cappe in Miami Web — v78.0

Versão para navegador com HTML, CSS e JavaScript; o jogo usa o renderer Canvas 2D em JavaScript e não depende de Rust nem WebAssembly.

## Executar

1. Instale Node.js 18 ou superior.
2. Dê duplo clique em `INICIAR_WEB.bat`.
3. O navegador abrirá o jogo em `http://127.0.0.1:8787/`. Mantenha a janela preta aberta enquanto joga; encerre o servidor com Ctrl+C.

Também é possível abrir `index.html` pelo Live Server do VS Code. O servidor local é recomendado para o service worker e para os recursos multiplayer.

## Otimização de renderização v77

O ajuste automático mede o tempo gasto pelo jogo atualizando e desenhando os primeiros 120 quadros jogando; não confunde o limite de FPS escolhido com lentidão. Usa dois níveis de redução de efeitos e resolução interna do canvas quando o trabalho de cada quadro está alto. A detecção é refeita em cada sessão. Resolução manual e modo Máximo são respeitados. FPS comparativo ainda não foi medido.
