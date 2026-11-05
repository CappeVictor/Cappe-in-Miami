# Cappe-in-Miami — contexto persistente
Atualizado em 05/11/2026. Iteração: v49.0 (base distribuída na pasta v30, com changelog até v33).

## Identidade e restrições
Ação top-down em HTML, CSS e JavaScript, Canvas 2D e Web Audio. Preservar identidade, conteúdo, mapas, saves e recursos existentes. Objetivo: evolução incremental mensurável; referência de 60 FPS / 16,67 ms, sem alegar resultados sem medição.
A diretriz integral do proprietário está em AI_MASTER_DIRECTIVE.md. AGENTS.md estabelece o protocolo de retomada.

## Origem e estado
Fonte autorizada pelo usuário: Downloads/Cappe-in-Miami-main/Cappe-in-Miami-main/Cappe-in-Miami.zip. Extraída para uma cópia de entrega; o ZIP original permanece intocado. Não havia .git, documentação AI nem suíte de testes nesta distribuição. Não foi feito commit nem publicação.
Não confundir versão do jogo (v47.0), versão antiga da pasta (v30) e formato do save (v2, mantido).

## Sistemas
Base e estados globais em index.html; módulos JS, 2 folhas CSS, 86 imagens existentes e server/server.js sem dependências. Expansões carregadas em ordem fixa. Memória do jogador em localStorage. Multiplayer local continua disponível; v36 acrescentou lobby Node e relay de posição para até dois navegadores.
Mapas pesados em maps.js (~2,93 MB), já com decodificação sob demanda. Há sistemas de navegação, IA por classes, chefes, máscaras, armas, perks, modos, vendedor e áudio sintetizado. Consulte AI_ARCHITECTURE.md e AI_FEATURES.md.

## Iteração atual

v46 adiciona janelas quebráveis nos mapas gerados: disparos e golpes removem o sólido, atualizam a navegação e deixam estilhaços temporários. Mapas Neon recebem perímetro visual e físico consistente, inclusive quando o mapa original não possui objetos de parede nas quatro bordas. A v47 corrige o alvo ativo da IA no cooperativo; a v48 corrige a criação e o dimensionamento das portas; a v49 corrige a colisão e o reset dessas portas em todos os mapas.
Nesta rodada: lista pública da instância para salas online, entrada pela lista, estados aberto/lotado/em jogo, atualização periódica/manual, bloqueio de entrada em partida ativa, liberação após heartbeat expirado, layout responsivo, colisão invisível nos limites de todos os mapas, spawns ajustados e validação de preferências persistidas. O servidor ainda retransmite apenas presença/posição, sem simular combate.
36 testes automatizados passaram, incluindo rotas HTTP, lobby via DOM simulado, expiração de presença, preferências corrompidas do jogo/multiplayer, colisão das bordas e montagem/spawn em todos os 74 mapas Neon jogáveis. Conexão TCP em loopback, partidas, console real, áudio, instalação real do service worker e FPS ainda precisam de validação no computador/navegador do jogador.

## Prioridade seguinte
Validar visualmente o lobby e uma sessão online em dois navegadores/dispositivos; evoluir relay para sincronizar combate/objetivos com simulação autoritativa; recuperar assets ausentes; tratar seleção de alvo da IA e integrar opções de multiplayer. Os dados dos testes são fictícios e nunca usam o armazenamento real do jogador.
