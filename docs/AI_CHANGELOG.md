# Changelog técnico
## v51.0 — 05/11/2026
- Spawns de inimigos e pickups em modos cooperativos agora usam o jogador vivo como referência de distância e navegação; P2 não fica sem reforços por causa da posição de P1 morto.
- Regressão adicionada para impedir regressão desse comportamento.
- 50/50 regressões automatizadas aprovadas.

## v50.0 — 05/11/2026
- Campanha em tiles agora força `tileIdx=0` ao iniciar e bloqueia callbacks de avanço de uma fase antiga; a primeira fase não é pulada.
- Removido o reinício por R do input, pausa, HUD, traduções e painel de debug.
- Filtro de mapas exclui protótipos equivalentes a 640×580 nos mapas fixos e Neon; capítulo que apontava para o mapa removido foi redirecionado para um mapa válido.
- Auditoria de dimensões, portas, salas, spawns e saídas adicionada em `docs/MAP_AUDIT.md`.
- 49/49 regressões automatizadas aprovadas.

## v49.0 — 05/11/2026
- Corrigida a colisão das portas em mapas procedurais: a solução agora é reconstruída com portas abertas/fechadas incluídas.
- Corrigido vazamento de portas entre mapas fixos: a lista é resetada antes de montar cada mapa.
- Regressão adicionada para garantir portas próprias e sem estado antigo em todos os construtores.

## v48.0 — 05/11/2026
- Corrigido o bug de paredes no lugar de portas: cada abertura dos mapas procedurais e fixos agora cria uma porta com caixa de colisão e desenho dimensionado pelo vão.
- 47/47 regressões automatizadas aprovadas.

## v47.0 — 05/11/2026
- IA e mira cooperativas agora selecionam o jogador vivo mais próximo; P1 morto deixa de ser alvo obrigatório enquanto P2 continua na partida.
- Erros de script e promises são capturados desde o primeiro bloco inline e entregues ao painel de depuração.
- Removido passe duplicado de audição no loop principal.
- 45/45 regressões automatizadas aprovadas.

## v46.0 — 05/11/2026
- Adicionadas janelas quebráveis aos mapas gerados; tiros e golpes próximos removem a colisão, emitem ruído e deixam estilhaços temporários.
- Mapas Neon agora recebem perímetro visual e físico completo, corrigindo mapas distribuídos sem parede externa, incluindo o cenário do trailer.
- Silhuetas das armas antigas ganharam componentes distintos (coronha, carregador, mira, tambor e canos), reduzindo a aparência repetida no chão e na mão.
- O ajuste automático de desempenho informa a redução de efeitos por toast discreto, sem banner central durante a ação.
- 44/44 regressões automatizadas aprovadas; servidor real bloqueado pela política de loopback deste ambiente.

## v45.0 — 04/11/2026
- Save de formato futuro continua protegido contra escrita e agora mostra aviso persistente de modo protegido na abertura.
- Estado somente leitura exposto por `EXP.saveReadOnly()`; regressão cobre o contrato e o texto apresentado.
- 44/44 regressões automatizadas aprovadas.

## v44.0 — 04/11/2026
- Governador adaptativo usa tempo de quadro real e reduz efeitos decorativos quando a média fica lenta, sem substituir o preset salvo.
- Poeira, chuva, névoa, luzes e partículas respeitam o nível de desempenho atual; cápsulas já são desenhadas em lote.
- 43/43 regressões automatizadas aprovadas; sem benchmark visual de navegador.

## v43.0 — 04/11/2026
- “Jogar Solo” desativa e limpa o multiplayer persistido antes de abrir a seleção de máscara; P2 não é criado em partida normal.
- Escala automática de resolução limitada e partículas simples agrupadas para reduzir custo do Canvas.
- 42/42 regressões automatizadas aprovadas.

## v42.0 — 04/11/2026
- Multiplayer: estado de rede/latência aproximada e idade do último avatar visíveis no lobby; código pode ser copiado.
- Snapshots antigos são ignorados e avatar remoto desaparece após 5 s sem atualização; não fica preso numa posição desatualizada.
- Acessibilidade: “reduzir flashes” suprime relâmpagos e cintilações no módulo de efeitos.
- 40/40 regressões automatizadas aprovadas; sem teste multiplayer em rede real.

## v41.0 — 04/11/2026
- Avatar online deixou de ser recriado em cada atualização; movimento e rotação agora são interpolados suavemente entre estados recebidos.
- Lobby mostra quantos jogadores estão em partida e explica a necessidade de escolher o mesmo modo/mapa, além dos limites de sincronização atuais.
- 40/40 regressões automatizadas aprovadas, incluindo movimento interpolado, expiração stale, limite de revisão, latência, cópia do código e flashes reduzidos.
- Sem teste de rede entre dois navegadores nesta sessão.

## v40.0 — 04/11/2026
- Renderização final agora respeita o antialiasing e nível de qualidade selecionados, sem forçar suavização alta a cada quadro.
- Adicionada intensidade ajustável e persistente de tremor da câmera (0–100%).
- Abas e controles refinados para foco de teclado e telas estreitas.
- 39/39 regressões automatizadas aprovadas; sem validação gráfica em navegador nesta sessão.

## v39.0 — 04/11/2026
- Recarga automática obedece à preferência desligada por padrão; recarregar manualmente com C continua disponível.
- Volume mestre integrado aos ganhos de música e efeitos.
- Abas de opções agora seguem navegação por teclado e vínculos ARIA de tablist/tabpanel.
- 38/38 regressões automatizadas aprovadas; validação de navegador real pendente.

## v38.0 — 04/11/2026
- Lobby passa a listar salas desta instância em `/api/rooms`, com nomes, ocupação, estado e botão de entrada; atualização automática a cada 5 s e atualização manual.
- Listagem pública não inclui credenciais; salas sem jogadores/inativas são removidas ao consultar a lista.
- Sala com jogador vivo em partida ativa fica indisponível para entrada tardia, tanto por lista quanto por código, porque o estado de mapa/combate não é sincronizado. Cartões distinguem lotação de partida ativa.
- Heartbeat inativo por 60 s limpa o indicador de partida e libera a vaga sem invalidar a sessão de retorno; expiração total continua em cinco minutos.
- Preferências locais e multiplayer agora aceitam apenas chaves conhecidas e valores válidos para o tipo/faixa/opção; saves de configuração danificados voltam aos padrões somente nos campos inválidos.
- Controle de zoom inclui o padrão 0,9x e mantém a seleção correspondente ao jogo.
- Adicionada colisão de perímetro compartilhada por hitWall/hitWallNG/aabbHitsWall para impedir que atores saiam dos limites do mundo ou usem coordenadas inválidas.
- Ajustados os pontos iniciais das salas Neon ao raio do jogador; unstick procura posição livre se a correção encostar em obstáculo.
- Service worker/cache e identificação visual atualizados para v39.0.
- CSS da lista adaptado a telas pequenas; testes de entrada/status, presença expirada, configurações inválidas, colisão das quatro bordas e spawns reais livres nos 72 mapas Neon jogáveis. 36/36 regressões aprovadas.
- Limite: lista apenas salas no servidor que o navegador já acessou; multiplayer segue como relay de posição, sem co-op autoritativo.

## v37.0 — 04/11/2026
- Segurança: IDs públicos separados de tokens de sessão; token só passa no cabeçalho Authorization e não aparece no estado da sala ou na URL.
- Robustez do lobby: recuperação após reload, botão sair, retry progressivo, limpeza de participantes ociosos e um long poll pendente por jogador.
- Validação HTTP: tamanho, content-type, JSON/objetos, tipos e valores; rate limit de posição; proteção realpath e captura de erros ao servir arquivos.
- Estado do jogador é publicado como inativo fora de partida; reduz atualizações repetidas do DOM.
- 30/30 regressões aprovadas, incluindo rotas HTTP e entrega de index via harness sem socket. TCP e navegação real seguem pendentes.

## v36.0 — 04/11/2026
- Menu: corrigida versão visível que ainda dizia v30; ação online e lobby responsivo por código adicionados.
- Servidor Node.js sem dependências: servir jogo por HTTP, criar/entrar salas limitadas a dois, autenticação por token, validação de payload e estado com long polling.
- Clientes retransmitem presença e posição; avatar remoto é desenhado e a câmera usa foco médio.
- Service worker atualizado para cappe-v36.0 e inclui `js/exp-online.js`.
- Cache offline ignora `/api/`, evitando que respostas antigas do lobby sejam servidas como estado atual.
- Cobertura automatizada das regras internas do servidor: criação/entrada, lotação, relay e autorização. Smoke test HTTP e experiência em rede real seguem pendentes por bloqueio de loopback no ambiente.
- Limite: simulação, combate, inimigos, mapa e progresso não são sincronizados; ambas as pessoas iniciam o mesmo mapa manualmente.

## v34.0 — 04/11/2026
Base: distribuição denominada v30, cujo README já continha v31/v32/v33. Não alterado o formato de save v2.

| Alteração | Arquivos | Validação |
| --- | --- | --- |
| Encaminhar alvo de dano através do wrapper visual | js/exp-fx.js | Teste com hit real, colete P1/P2 e mortes independentes |
| WASD P1 em coop; ponto P2 exclusivo para soco | index.html, js/exp-multi.js | Teclado, separação, perfil solo/setas e vetor numpad |
| Validar saves, proteger backups e reportar falhas de importação | js/exp-core.js | Dados parciais/legados/futuros, corrupção, quota, protótipos, reset |
| Separar recarga de arma e restauração de backup | js/exp-core.js, js/exp-ui.js | Memória, disco e backup trocados corretamente |
| Manifesto de 106 arquivos existentes, cache isolado por escopo e fallback de navegação | sw.js | Manifesto, scripts/CSS, simulação de instalação/ativação/fetch |
| Documentação persistente, testes e microbenchmark | AGENTS.md, docs/*, tests/*, README.md | 29 testes PASS; resultados e inventário registrados |

Riscos/limites: partidas e instalação real do SW ainda não validadas; leitura mais estrita rejeita saves estruturalmente inválidos; APIs de save renomeadas têm todos os consumidores encontrados atualizados. Multiplayer ainda tem pendências anteriores, especialmente morte P1, alvo IA e inventário P2. Nenhum asset foi removido; nenhum ajuste de balanceamento aplicado.

## v35.0 — 04/11/2026

- Ciclo de vida do cooperativo: morte marca ambos os jogadores, bloqueia input de P1 morto e usa P2 vivo para alcançar a saída. Reinício de sala restaura os estados.
- Spawn de P2 testa até 64 posições em 4 distâncias, livres de colisões e conectadas; sem espaço notifica e evita spawn inválido.
- Ações P2 passam por fireOk/onFire, respeitam personagem sem armas, atualizam precisão e oferecem troca/descarte com arma compartilhada.
- Service worker atualizado para cappe-v35.0.
- 29/29 testes automatizados passaram. Não foi possível validar partidas reais nesta rodada.
