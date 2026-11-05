# Cappe-in-Miami — contexto persistente
Atualizado em 05/11/2026. Iteração: v52.0 (base distribuída na pasta v30, com changelog até v33).

## Identidade e restrições
Ação top-down em HTML, CSS e JavaScript, Canvas 2D e Web Audio. Preservar identidade, conteúdo, mapas, saves e recursos existentes. Objetivo: evolução incremental mensurável; referência de 60 FPS / 16,67 ms, sem alegar resultados sem medição.
A diretriz integral do proprietário está em AI_MASTER_DIRECTIVE.md. AGENTS.md estabelece o protocolo de retomada.

## Origem e estado
Origem histórica: Downloads/Cappe-in-Miami-main/Cappe-in-Miami-main/Cappe-in-Miami.zip. O ZIP original permanece intocado; esta cópia agora tem Git, suíte de testes e publicação em `origin/main`.
Não confundir versão atual do jogo (v52.0), versão antiga da pasta (v30) e formato do save (v2, mantido).

## Sistemas
Base e estados globais em index.html; módulos JS, 2 folhas CSS, 86 imagens existentes e server/server.js sem dependências. Expansões carregadas em ordem fixa. Memória do jogador em localStorage. Multiplayer local continua disponível; v36 acrescentou lobby Node e relay de posição para até dois navegadores.
Mapas pesados em maps.js (~2,93 MB), já com decodificação sob demanda. Há sistemas de navegação, IA por classes, chefes, máscaras, armas, perks, modos, vendedor e áudio sintetizado. Consulte AI_ARCHITECTURE.md e AI_FEATURES.md.

## Iteração atual

v46 adiciona janelas quebráveis nos mapas gerados: disparos e golpes removem o sólido, atualizam a navegação e deixam estilhaços temporários. Mapas Neon recebem perímetro visual e físico consistente, inclusive quando o mapa original não possui objetos de parede nas quatro bordas. A v47 corrige o alvo ativo da IA no cooperativo; a v48 corrige a criação e o dimensionamento das portas; a v49 corrige a colisão e o reset dessas portas em todos os mapas; a v50 protege a primeira fase, remove o reinício por R e filtra mapas estreitos; a v51 corrige referências de spawn no cooperativo.
v51 entregou lista pública da instância, entrada pela lista, estados de sala, expiração de presença, colisão de limites e spawns cooperativos. O servidor retransmite apenas presença/posição, sem simular combate.
v52 acrescenta quatro skins puramente cosméticas em `settings.skin` no save v2, sem mexer nas máscaras ou atributos existentes; melhora o acabamento Canvas das armas, corrige a arma invisível de P2 e reutiliza sprites procedurais animados por cache de fase para reduzir criação de Canvas no caminho de fallback. Corrige fase procedural inicial sem inimigos e spawn inválido em boate-b. Sem assets externos. 54 testes automatizados passaram; Chromium confirmou movimento, um disparo, pausa, início da fase 1 com 8 inimigos e spawn livre nos 17 mapas fixos. Fases completas, multiplayer online real, áudio, instalação real do service worker e FPS ainda precisam de validação.

## Prioridade seguinte
Validar visualmente o lobby e uma sessão online em dois navegadores/dispositivos; evoluir relay para sincronizar combate/objetivos com simulação autoritativa; recuperar assets ausentes; tratar seleção de alvo da IA e integrar opções de multiplayer. Os dados dos testes são fictícios e nunca usam o armazenamento real do jogador.
