# Cappe in Miami Web — v77.0

Versão para navegador com HTML, CSS e JavaScript; o jogo usa o renderer Canvas 2D em JavaScript e não depende de Rust nem WebAssembly.

## Executar

1. Instale Node.js 18 ou superior.
2. Dê duplo clique em `INICIAR_WEB.bat`.
3. O navegador abrirá o jogo em `http://127.0.0.1:8787/`. Mantenha a janela preta aberta enquanto joga; encerre o servidor com Ctrl+C.

Também é possível abrir `index.html` pelo Live Server do VS Code. O servidor local é recomendado para o service worker e para os recursos multiplayer.

## Otimização de renderização v77

O ajuste automático de desempenho mede os primeiros 120 quadros jogando e usa dois níveis de redução de efeitos e resolução interna do canvas quando o frame time está alto. A detecção é refeita em cada sessão (não fica bloqueada por uma preferência temporária salva anteriormente). Uma resolução escolhida manualmente continua respeitada, e o modo gráfico Máximo não recebe a redução automática. O navegador ainda pode suavizar a imagem ao exibi-la; não foi feito benchmark comparativo de FPS nesta versão.
