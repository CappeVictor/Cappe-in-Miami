# Cappe-in-Miami — Rust/WASM v316

## Correção de campanha

O arquivo de fases em tiles é carregado antes dos modos Rust/WASM. A campanha deixa de falhar com TILE_LEVELS ausente e o renderer WASM continua com fallback seguro.

Para jogar, execute INICIAR_EXPERIMENTO_WASM.bat com Node.js 18 ou superior.

Correção de paridade: o ícone da arma `lanca` é renderizado uma única vez.

Correção de concorrência: cliques repetidos durante o carregamento de um mapa Neon são ignorados até a preparação terminar.
