# Cappe in Miami Web — v100

Correção de paridade visual: o acabamento da arma `lanca` agora é aplicado uma única vez.

Correção de concorrência: cliques repetidos durante o carregamento de um mapa Neon são ignorados até a preparação terminar.

## Correção de campanha

As fases em tiles agora são carregadas antes dos modos de campanha. Isso corrige a falha que impedia iniciar a campanha quando TILE_LEVELS ainda não estava disponível.

Para jogar, execute INICIAR_WEB.bat com Node.js 18 ou superior.
