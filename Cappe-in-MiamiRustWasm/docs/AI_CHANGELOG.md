# Changelog técnico
## Preview local v76.0 — 06/11/2026
- Rust agora seleciona, ordena e calcula transformações das portas Neon com sprite em lote; JavaScript fornece as imagens e rasteriza os comandos Canvas após o retorno WASM.
- O fallback `neonDrawDoor` permanece ativo quando o módulo novo não está disponível ou falha. A animação/estado de abertura das portas continua no gameplay JavaScript.
- Binário WASM recompilado (102.586 bytes); testes ABI/bridge cobrem offsets, ângulos combinados, handles de sprite e fallback; regressões 61/61 passaram. Smoke Chromium de mapa Neon não executou porque o ambiente negou o socket local do DevTools; sem validação visual/FPS.

## Preview local v75.0 — 06/11/2026
- Rust agora seleciona as salas do overlay `FTILES`, ignora o corredor e gera a translação horizontal usada pelo tileset; o host continua dono do padrão de imagem, recorte e rasterização Canvas.
- `paintFloor` mantém o fallback JavaScript quando o asset não carrega ou o módulo não fornece a exportação. Binário recompilado (101.508 bytes).
- Regressões 60/60 e testes WASM/bridge passaram; Chrome abriu Apartamento com 13 comandos de textura de piso e zero exceções. Captura inspecionada; sem comparação de paridade ou medição de FPS.

## Preview local v74.0 — 06/11/2026
- Rust agora escolhe as texturas de sólidos e decalques das aberturas em uma lista de comandos, mantendo a ordem de paredes/móveis antes das portas.
- O host continua carregando recortes, criando CanvasPattern, aplicando clipping e desenhando os sprites; o painter JavaScript original fica como fallback.
- Regressões 59/59, testes Rust/WASM/bridge e smoke Chromium passaram. Apartamento em `play` teve três texturas carregadas, 135 comandos de textura e zero exceções. Captura inspecionada; sem comparação ou FPS medido.

## Preview local v73.0 — 06/11/2026
- `buildFloor` agora pede ao Rust a geração de specks determinísticos, sombras de sólidos e linhas de rejunte em dois lotes separados para preservar a ordem em torno das texturas de piso.
- Rust devolve a semente avançada do RNG; o host mantém Canvas e overlays de imagem. As primitivas originais JavaScript ficam como fallback.
- Regressões 58/58, testes Rust/WASM e bridge passaram. Chrome abriu Apartamento em `play`, registrou 16.516 comandos de acabamento no mapa e zero exceções. Screenshot inspecionada; sem medição de FPS ou comparação lado a lado.

## Preview local v72.0 — 06/11/2026
- Rust agora gera a sequência de comandos Canvas para janelas intactas e fragmentos de vidro; o host aplica as primitivas após a chamada WASM.
- Os temporizadores e a remoção de fragmentos vencidos continuam no JavaScript. O painter JavaScript original permanece como fallback.
- Testes Rust/WASM e bridge passaram; regressão 57/57. Chromium abriu Apartamento em `play`, confirmou quatro comandos de vidro no diagnóstico e zero exceções. Screenshot inspecionada; sem benchmark nem comparação visual lado a lado.

## Preview local v71.0 — 06/11/2026
- Fundo escuro de mapas fixos, overlay de piso e decoração estática agora são comandos Rust/WASM: preenchimentos, retângulos de tapete e bordas, mantendo ordem e coordenadas.
- O host continua aplicando Canvas, recebe cores de decoração do mapa e preserva fallback JavaScript quando o backend está desativado ou excede capacidade.
- Adicionadas regressões WASM/bridge para fundo fixo, overlay, tapete e outros objetos. Build offline, testes específicos passaram; regressão 57/57.
- Chrome abriu Apartamento em `play`, executou 70 comandos de decoração, renderer `ready`, sem exceções. Screenshot inspecionada; sem comparação lado a lado nem medição de FPS.

## Preview local v70.0 — 06/11/2026
- Rust passou a emitir comandos semânticos, com posições, para os textos “ATORDOADO”, “NOCAUTE · ESPAÇO”, “?” e “!” dentro do buffer ordenado do inimigo.
- O host usa o painter `tx()` existente para manter fonte, contorno, alinhamento e cache. Em falha do buffer, os eventos continuam direcionando para o painter JavaScript original.
- Adicionada contagem dos comandos de texto executados e regressões de posição, ordem, nocaute, stun e estados suspeito/alerta.
- Build offline e testes Rust/WASM/bridge passaram; regressão 57/57. Smoke Chromium abriu Apartamento em `play`, exercitou dois comandos de texto inimigo e teve zero exceções. Captura inspecionada, sem comparação lado a lado; FPS não medido.

## Preview local v69.0 — 06/11/2026
- Rust passou a gerar os seis círculos animados do efeito de atordoamento dentro do mesmo buffer ordenado do corpo do inimigo; o host evita duplicar essa geometria e continua desenhando o rótulo “ATORDOADO”.
- Mantida a ordem de desenho e o painter JavaScript quando o lote WASM não está disponível. O tempo do efeito é fornecido pelo host; a aproximação trigonométrica Rust pode ter pequenas diferenças de ponto flutuante.
- Build offline, testes Rust/WASM/bridge e regressões 57/57 passaram. Chromium abriu Apartamento em `play`, exercitou stun e teve zero exceções; captura inspecionada sem comparação lado a lado. FPS não medido.

## Preview local v68.0 — 06/11/2026
- Rust passou a compor os atores jogadores em um lote por quadro: transformações, sombra/aura, arma, seleção do recorte de spritesheet ou frame procedural, acentos cosméticos e identificação P1/P2.
- O HTML mantém a atualização de animação já existente; o host JS entrega até três estados/handles e executa comandos Canvas depois que a chamada WASM retorna. Fallback visual JS permanece disponível.
- Regressões cobrem os comandos Rust, ordem e ativos, os dois caminhos de sprite e a integração do bridge. Build offline e regressões 57/57 passaram.
- Chromium headless abriu Apartamento em `play`, executou 4.056 comandos de jogador, 1.812 de corpo inimigo e teve zero exceções; captura inspecionada sem comparação lado a lado. FPS não medido.

## Preview local v67.0 — 06/11/2026
- Rust passou a gerar a sequência de comandos do corpo de cada inimigo visível: transforms, alpha de nocaute, geometria fallback e recorte animado do spritesheet; o host Canvas executa o buffer na ordem da cena.
- A geração de sombra (v66), o painter antigo como fallback, stun/rótulos e o modo JavaScript foram preservados.
- Regressões cobrem geometria, ordem, knockout alpha, spritesheet animado, fallback, teste do browser bridge e abertura em Chromium. Cache offline e endpoint de saúde avançaram para v67.0.
- Sem benchmark de FPS; a captura headless foi inspecionada, sem comparação side-by-side com o renderer JavaScript.

## Preview local v66.0 — 06/11/2026
- Rust gera, em um buffer por frame, a geometria das sombras dos inimigos visíveis e aplica o alpha de nocaute correspondente; o host Canvas desenha cada sombra antes do corpo sem reentrar no WASM.
- Corpos, stun, textos e rasterização continuam no host; o fallback JS ainda desenha a sombra quando o modo WASM está desligado.
- Adicionadas regressões Rust/bridge e integração que verificam coordenadas, alpha, ordem e ausência da sombra duplicada.
- Cache offline e endpoint de saúde avançaram para v66.0; build e regressões registrados em AI_TESTS.md. Sem medição de FPS e sem revisão visual manual.

## Preview local v65.0 — 05/11/2026
- A sombra do jogador e o halo P1/P2 agora são gerados por Rust em um único lote de comandos por ator; preferências de sombra e cores de jogador foram preservadas.
- Adicionadas regressões para as geometrias/sombras alternativas, cores P1/P2 e caminho `drawOnePlayer`.
- Build, testes e Chrome headless registrados em `docs/AI_TESTS.md`; desempenho não medido.

## Preview local v64.0 — 05/11/2026
- A seleção da célula de animação do spritesheet de jogador e inimigo agora é calculada pelo Rust; o HTML mantém o tempo de movimento e submete os recortes ao Canvas.
- Adicionadas regressões de paridade para fases/ataques do jogador e cadência de 110 ms do inimigo, além de integração de `drawOnePlayer` com o bridge WASM.
- Build e testes completos registrados em `docs/AI_TESTS.md`; desempenho não medido.

## Preview local v63.0 — 05/11/2026
- O protótipo que desenhava em Rust os círculos de atordoamento travou no Chrome headless ao enviar operações de arco ao Canvas real; removido antes de empacotar.
- Rust agora devolve um buffer ordenado de eventos de desenho para inimigos, que JavaScript consome depois do retorno WASM. Isso evita reentrância durante o desenho no Canvas.
- A decisão de estado e seleção de inimigos continuam em Rust/WASM; o callback JavaScript desenha o efeito de atordoamento completo, como no modo original.
- Build, regressão e Chrome headless registrados em `docs/AI_TESTS.md`; desempenho não medido.

## Preview local v62.0 — 05/11/2026
- Desenho de portas sem sprite portado: Rust calcula origem, orientação, painel (textura ou fallback), contorno luminoso e alpha; a ponte executa o lote Canvas.
- Portas com arte Neon preservam a ordem e continuam usando as texturas pelo host JavaScript.
- Adicionadas regressões para portas verticais/horizontais, painel texturizado/fallback e integração do callback Canvas.
- Build offline, testes de WASM e regressão geral 57/57 passaram. Chrome headless abriu Apartamento com renderer `ready`, 1.680 comandos de portas e zero exceções JavaScript.
- Captura confirmou execução da fase, não uma sessão manual completa. FPS/desempenho não medidos.

## Preview local v61.0 — 05/11/2026
- A geração Rust/WASM agora produz os pixels RGBA dos frames procedurais 24×24 do jogador e aceita as paletas cosméticas existentes; cache e spritesheet permanecem no fluxo original.
- Adicionada comparação pixel a pixel com a função JavaScript original: quatro paletas, estados idle/caminhar/correr/ataque, fases de animação e os quatro frames de ataque.
- Ícones de armas antigas, armas novas e fallback genérico também são emitidos por Rust em todos os usos do jogador, inimigos e itens no chão.
- Contadores de móveis e armas foram separados para distinguir comandos dos dois grupos; atualizado status local e documentação. O Canvas continua sendo rasterizado pelo navegador.
- Build Rust/WASM, testes focados e regressão geral passaram. Captura headless abriu Apartamento, renderer `ready`, 152.456 primitivos de piso, 1.054 comandos de móveis, cerca de 2,1 mil comandos de armas e zero exceções JavaScript. Desempenho não foi medido.

## Preview local v57.0 — 05/11/2026
- Criada cópia experimental Rust/WASM sem dependências externas, com ABI para encaminhar métodos/setters Canvas e filtrar/iterar inimigos visíveis no modo `?renderer=wasm`.
- Algoritmos de carpete, azulejo e tijolo foram movidos para Rust; preservada a sequência aleatória determinística e adicionados testes para coordenadas e integração de recorte.
- Detalhes estáticos das salas e partículas/manchas decorativas do piso também são gerados em Rust; a sequência aleatória permanece equivalente à implementação JavaScript.
- Sombras de paredes/móveis, faces/contornos de paredes e detalhes de postes agora são emitidos por Rust; comandos do piso são enviados ao host em lotes de até 4.096.
- Renderer original permanece como padrão/fallback; o compositor `paintMap`, jogadores, geometria de personagens, portas, armas, efeitos e HUD continuam parcialmente em JavaScript, portanto migração integral ainda pendente.
- Regressões do jogo (57/57), ABI WASM, paridade de piso/mapa e integração Canvas simulada aprovadas. Captura headless abriu fase 1 “Apartamento”, com renderer ativo e zero exceções JS; benchmark de FPS pendente.
- Nenhum commit ou push foi feito.

## v55.0 — 05/11/2026
- Allowlists explícitas para 18 mapas fixos, 2 grades e 61 mapas Neon; Apartamentos voltou porque sua resolução é somente dado interno.
- Títulos do seletor Neon não exibem dimensões. Trailer, salas de teste e protótipos ficam fora da seleção; as mesmas regras protegem a progressão.
- Campanha base reorganizada pela numeração já existente, sem criar fases para capítulos ausentes; dúvida das datas contraditórias documentada em MAP_AUDIT.md.
- Zona lógica de saída Neon busca ponto livre próximo quando o objeto de carro está fora do piso; dados fonte e geometria dos mapas não são alterados.
- Regressões de allowlist, história, spawns, colisões e saídas; node tests/regression.cjs: 57/57. Sem validação visual nem medição de FPS nesta iteração.
- Cache offline e endpoint /api/health avançaram para v55.0.

## v54.0 — 05/11/2026
- Corrigido fogo amigo local: cada projétil de jogador registra P1/P2 como origem; com a opção ligada, pode ferir somente o parceiro e consome o projétil no impacto.
- Com fogo amigo desligado, projéteis não atingem o parceiro. Projéteis de inimigos e alvos de inimigos permanecem inalterados.
- Adicionada regressão cobrindo origem dos projéteis, toggle, jogador morto e distância; suíte 55/55.
- Cache offline e endpoint `/api/health` avançaram para v54.0.
- Não houve medição de FPS nem validação visual do fogo amigo nesta iteração.
## v53.0 — 05/11/2026
- Corrigido bug reproduzido em Chromium: a geração Neon podia deixar inimigos e armas sobre colisores sólidos. Agora `neonSafePoint` procura piso livre próximo e, em layouts densos, o ponto livre mais próximo no mapa, respeitando limites e distâncias de segurança.
- A colisão do piso é preparada antes de validar atores. Entidades sem local livre não são criadas em posição inválida.
- Revarredura em navegador: 72 mapas, 720 inimigos, 84 armas no chão, zero spawns sobre paredes; sem exceções JavaScript.
- Regressão agora valida jogador, cada inimigo e cada arma em todos os mapas Neon. Suíte: 54/54.
- Cache offline e endpoint de saúde atualizados para v53.0. Sessões completas, online real e FPS continuam sem validação.

## v52.0 — 05/11/2026
- Quatro skins cosméticas selecionáveis são persistidas em `settings.skin` no save v2; seleção independente de personagem/máscara, sem atributos ou desbloqueios alterados.
- A paleta cosmética colore o sprite procedural e fornece acentos visuais no spritesheet existente, sem assets externos.
- Ícones de armas receberam contorno, reflexo, juntas e detalhes próprios para armas curtas, longas e revólveres; arma compartilhada agora também é desenhada para P2.
- Fallback procedural de personagem reutiliza até 128 sprites em cache por estado/fase/skin, reduzindo novas alocações Canvas quando o spritesheet não carrega.
- Corrigido bug reproduzido no navegador: portas fechadas isolavam as salas dos pontos de spawn da fase 1; com zero inimigos, a sala terminava sozinha. Corredor central participa dos spawns e `allClear` exige contagem inicial positiva.
- Corrigido spawn dentro de parede no mapa fixo boate-b. Todos os 17 mapas fixos foram montados em Chromium e os spawns resultantes passaram em `hitWall`.
- 54/54 regressões automatizadas passaram. Chromium confirmou estado `play`, nível 1 e 8 inimigos; campanha completa e multiplayer real seguem sem teste manual.

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
