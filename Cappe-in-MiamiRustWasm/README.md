# Cappe-in-Miami — Rust/WASM v319

O modo automático de vídeo agora limita a resolução interna a 1,25× e reduz progressivamente para 0,82× ou 0,64× quando o frame time continua alto. A escolha manual de resolução permanece respeitada.

Nos níveis adaptativos, filtros CSS e suavização do Canvas são desligados para evitar custo extra de composição.

A campanha foi reescrita como **Sinal de Maré**, uma investigação original sobre apagões sincronizados, transmissões clandestinas e sabotagem de infraestrutura.

## Correção de campanha

O arquivo de fases em tiles é carregado antes dos modos Rust/WASM. A campanha deixa de falhar com TILE_LEVELS ausente e o renderer WASM continua com fallback seguro.

Para jogar, execute INICIAR_EXPERIMENTO_WASM.bat com Node.js 18 ou superior.

Correção de paridade: o ícone da arma `lanca` é renderizado uma única vez.

Correção de concorrência: cliques repetidos durante o carregamento de um mapa Neon são ignorados até a preparação terminar.
