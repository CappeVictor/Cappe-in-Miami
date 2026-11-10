# Cappe in Miami Web — v102

O modo automático de vídeo agora limita a resolução interna a 1,25× e reduz progressivamente para 0,82× ou 0,64× quando o frame time continua alto. A escolha manual de resolução permanece respeitada.

Nos níveis adaptativos, filtros CSS e suavização do Canvas são desligados para evitar custo extra de composição.

Correção de paridade visual: o acabamento da arma `lanca` agora é aplicado uma única vez.

Correção de concorrência: cliques repetidos durante o carregamento de um mapa Neon são ignorados até a preparação terminar.

## Correção de campanha

As fases em tiles agora são carregadas antes dos modos de campanha. Isso corrige a falha que impedia iniciar a campanha quando TILE_LEVELS ainda não estava disponível.

Para jogar, execute INICIAR_WEB.bat com Node.js 18 ou superior.
