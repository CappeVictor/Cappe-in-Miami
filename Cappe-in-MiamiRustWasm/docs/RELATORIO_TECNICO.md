# Relatório técnico — Cappe-in-Miami v46.0
04/11/2026

## Resultado

### v45.0 — 04/11/2026
Saves de uma versão futura agora exibem aviso persistente de modo protegido e não são sobrescritos. O estado somente leitura é exposto pela API de expansão para a interface. **44/44 regressões passaram**; o navegador real continua necessário para validar layout e FPS.

### v44.0 — 04/11/2026
O loop agora separa tempo de quadro real de `dt` truncado; após 120 amostras lentas ativa `EXP.perfTier`, reduzindo partículas, chuva, névoa e luzes decorativas sem sobrescrever o preset. A escala automática continua limitada e partículas usam menos operações por quadro. **43/43 regressões passaram**; desempenho real não foi medido no navegador.

### v43.0 — 04/11/2026
Corrigido o vazamento da preferência multiplayer para “Jogar Solo”: o fluxo agora desativa a configuração e remove P2 antes da seleção de máscara. A escala automática do Canvas não passa de 1,5x e as partículas de poeira/cápsulas usam desenho agrupado. **42/42 regressões passaram**; FPS real ainda precisa de medição em navegador.

### v42.0 — 04/11/2026
O avatar remoto permanece estável entre snapshots, usa interpolação de posição/rotação, ignora revisões antigas e é removido após 5 s sem atualização. Lobby mede a duração das respostas HTTP de estado, informa a idade da última posição e oferece copiar código com fallback manual. “Reduzir flashes” agora também desativa relâmpagos/cintilação do módulo FX. **40/40 regressões passaram**, incluindo simulação DOM do lobby, fallback de cópia, latência, interpolação, expiração de snapshot e redução dos flashes. Rede real não foi testada.

### v41.0 — 04/11/2026
O avatar do outro jogador agora mantém o mesmo objeto entre snapshots e interpola posição e ângulo a cada quadro, eliminando o salto e o estado de animação imóvel causado por recriar o ator. A sala informa quantos jogadores estão na partida e explica que modo/mapa devem ser combinados manualmente. **39/39 regressões automatizadas passaram**; multiplayer em rede real ainda não foi testado. O relay não sincroniza mapas, combate ou progresso.

### v40.0 — 04/11/2026
Antialiasing e qualidade de suavização agora seguem a configuração ativa após o wrapper final do Canvas, corrigindo uma opção gráfica que era anulada em cada quadro. Adicionada intensidade ajustável de tremor da câmera (0–100%), com persistência e validação. Foco e controles das abas receberam melhorias visuais responsivas. **39/39 regressões automatizadas passaram**; inspeção visual em navegador e medição de desempenho ficaram pendentes.

### v39.0 — 04/11/2026
Lobby agora consulta e apresenta salas da instância atual, com nomes, vagas, partida em andamento, entrada direta e atualização periódica/manual. A resposta pública não revela tokens. Corrigida a ausência de limites genéricos no mundo: a colisão bloqueia os quatro lados e posições inválidas, evitando que atores abandonem mapas sem paredes de perímetro. Spawns próximos à borda foram ajustados e verificados contra os 74 mapas Neon jogáveis. Layout da listagem adapta-se a telas estreitas. **33/33 testes automatizados passaram**, incluindo renderização simulada da lista, lotação, quatro bordas e spawns. Não foi possível validar TCP ou a interface em dois navegadores neste ambiente. A listagem não descobre servidores globais; combate e mundo ainda não são sincronizados.

### v37.0 — 04/11/2026
Corrigida a exposição dos tokens de acesso: a sala agora retorna IDs públicos independentes, e credenciais seguem no cabeçalho de autorização. Adicionada retomada de sessão após reload, saída explícita, retry/backoff, expiração de participantes ociosos, uma consulta pendente por jogador, rate limit de criação/entrada, validação de JSON/estados, proteção realpath ao servir arquivos e tratamento do status inativo. O cache da API segue desativado. **30/30 testes automatizados passaram**, incluindo rotas HTTP e arquivo inicial via harness sem socket. A validação TCP e visual em dois navegadores continua pendente.

Limite: continua sendo relay de posição, sem autoridade de servidor ou sincronização de combate, inimigos, mapa e progresso.

### v36.0 — 04/11/2026
Menu informa v36 e ganhou lobby online responsivo. Servidor Node nativo cria salas para duas pessoas e retransmite posição; a câmera acompanha o ponto médio e mostra o avatar remoto. 30/30 testes automatizados passaram, incluindo regras internas de sala. Smoke test HTTP foi bloqueado pelo ambiente (EACCES em loopback); não houve sessão visual em dois navegadores.

Limite: ainda não é co-op completo. Cada navegador executa seu próprio mundo; inimigos, armas, tiros, dano, objetivos e progresso não sincronizam. O servidor só retransmite posição e as salas são voláteis. Acesso público exige hospedagem e HTTPS.

### v35.0 — 04/11/2026
Correção do ciclo de vida de P1/P2, saída pelo sobrevivente, spawn seguro e tiro/coleta/descarte P2. Inventário de armas permanece compartilhado. 29/29 testes automatizados aprovados. Validação em navegador continua pendente.


Primeira rodada do sistema de desenvolvimento aplicada à cópia autorizada: auditoria estrutural, documentação persistente, backlog e correções concretas. Implementações concluídas; **29/29 testes automatizados aprovados naquela versão**. Validação visual de partidas e desempenho real permaneceu pendente.

## O que mudou e por quê
| Área | Antes | Agora | Arquivos |
| --- | --- | --- | --- |
| Dano cooperativo | Wrapper descartava target; P2 podia provocar dano em P1 | Alvo atravessa o efeito visual até hit | js/exp-fx.js |
| Controles | P1 bloqueado ao usar preferência solo/setas; ponto P2 socava e atirava | WASD P1 em coop; ponto só soco; Ctrl Direito tiro | index.html; js/exp-multi.js |
| Persistência | Validação mínima; backup corrompido; importação podia anunciar sucesso sem gravar | Validação de estrutura, proteção contra protótipos, backups válidos, erro de quota e proteção de versão futura | js/exp-core.js |
| Restauração | EXP.reload havia sido redefinida como recarga de arma | API restoreBackup dedicada, atualiza memória/disco e preserva backup se gravação falhar | js/exp-core.js; js/exp-ui.js |
| Offline | 489 entradas, 385 inexistentes; music/multi ausentes; limpeza de caches alheios | 106 arquivos existentes, cache isolado por instalação, fallback para navegação offline | sw.js |
| Continuidade | Sem documentação AI ou testes nesta distribuição | Diretriz integral, AGENTS.md, dez documentos de memória, 19 itens no backlog, regressões e microbenchmark | docs/*; tests/*; AGENTS.md; README.md |

## Preservação
Os **86 assets originais são byte a byte idênticos** ao ZIP recebido. Todos os arquivos originais foram mantidos. Sete arquivos originais foram modificados: README.md, index.html, exp-core.js, exp-fx.js, exp-multi.js, exp-ui.js e sw.js. Não houve alteração em maps.js, conteúdo de armas/máscaras, balanceamento, áudio ou CSS.
ZIP fonte preservado em Downloads. SHA-256: 5EDB9E11FB6E76FBC289246935A3A47AEFEFBE5179C1458DDA2711E5AA3246C8.
O formato e as chaves do save continuam v2; não foram lidos, apagados nem reiniciados saves reais do jogador. A versão v34.0 segue o último changelog v33 que já estava dentro da pasta chamada v30.

## Evidências de teste
- node tests/regression.cjs: 25 PASS / 0 FAIL. Testes executam código real em VM com armazenamento/eventos/cache simulados.
- Comparação com original: 7 PASS / 18 FAIL. Três falhas refletem a ausência da nova API restoreBackup; as demais reproduzem comportamentos incorretos. Isso não significa 18 bugs distintos.
- Toda a sintaxe JavaScript e os scripts inline passaram.
- NAV sintético: 200/200 caminhos encontrados em cenário com dois obstáculos; p50 0,054 ms / p95 0,096 ms. Compilação sintética de maps.js: p50 41,129 ms. **Não são FPS nem tempos de renderização.**
- Evidências: TEST_RESULTS.json, BASELINE_TEST_RESULTS.json, INTEGRITY_CHECK.json, PERFORMANCE_BASELINE.json e FILE_INVENTORY.json em docs/.

## Limites e pendências relevantes
Não foi realizada auditoria dinâmica completa de todos os modos, mapas, chefes, áudio, loja ou console. Não foi comprovada instalação real do service worker, funcionamento offline em navegador, FPS ou ausência de vazamentos. Chrome isolado foi bloqueado pela revisão automática de permissões; o navegador integrado não acessou o servidor local; o controle nativo foi encerrado por não conseguir identificar com segurança a URL do Chrome.

Pontos prioritários encontrados: artes ausentes na distribuição; IA usa P1 diretamente; inventário/recarga P2 e algumas opções de coop/volume não estão integrados. Não se deve anunciar esta entrega como multiplayer inteiramente corrigido. Ver AI_KNOWN_ISSUES.md e AI_MASTER_BACKLOG.md.

## Como usar e continuar
Extraia o pacote e abra index.html. Para testar offline/service worker, sirva a pasta por HTTP(S), por exemplo com o Live Server já usado no projeto. Em file:// o jogo não usa service worker. Ao trocar origem ou pasta local, o navegador pode usar outro armazenamento: exporte seu save na versão antiga e importe pela tela Perfil & Coleção → Dados, sem limpar dados do navegador.

Leia AGENTS.md e docs/AI_NEXT_STEPS.md na próxima sessão. O prompt integral está em docs/AI_MASTER_DIRECTIVE.md; a continuidade está nos arquivos do projeto, sem depender da memória desta conversa.
