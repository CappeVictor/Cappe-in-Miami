# Testes — 05/11/2026
## Execução v54.0 — 05/11/2026
`node tests/regression.cjs`: **55/55 PASS**. Inclui teste de fogo amigo que verifica origem P1/P2, opção ligada/desligada, alvo fora do alcance e jogador morto. Todos os testes anteriores permanecem aprovados.

Não houve validação manual em navegador nesta iteração. O teste de fogo amigo executa a lógica isolada e verifica a integração no fluxo de atualização por regressão estática. Campanha completa, online entre dispositivos, áudio, service worker offline real e FPS continuam pendentes.

## Execução v53.0 — 05/11/2026
## Execução v53.0 — 05/11/2026
`node tests/regression.cjs`: **54/54 PASS**. A verificação de mapas Neon agora monta cada um dos 72 mapas e confirma spawn de jogador, colisão livre para cada inimigo e pickup. Sintaxe, servidor, service worker, saves, controles e demais regressões permanecem na suíte.

Chromium via servidor local: auditoria dos 72 mapas encontrou inicialmente pelo menos uma entidade sobre parede em 51 mapas; após a correção, os 72 foram montados com 720 inimigos e 84 armas no chão, zero posições bloqueadas. Nenhuma exceção JavaScript. Os 17 mapas fixos iniciaram com spawn livre; após abrir portas, a busca de rota do spawn ao centro da saída alcançou todos os 17. Os modos visíveis abriram; campanha começou no capítulo/fase 1. Coop local: movimento dos dois jogadores e um disparo foram exercitados. Uma fase inicial foi aberta e controles básicos foram exercitados, mas não concluída até vitória.

Limites: não foram jogadas fases intermediária/final até o fim; multiplayer online em duas máquinas, áudio, instalação/offline real do service worker, sessões longas e FPS não foram validados. A requisição remota de Google Fonts registra falha de túnel neste ambiente; sem exceções de script observadas.

## Linha de base histórica (v44)
Resultado: **44/44 PASS** em runtime Node integrado ao Codex. Os testes exercitam o handler HTTP diretamente com requisições/respostas simuladas, além das regras internas e sintaxe. Não foi possível testar TCP/loopback real: o ambiente nega conexões locais com EACCES e não disponibiliza `node` no terminal PowerShell. Repita `node tests/regression.cjs` com Node.js 18+.
Cobertura cumulativa até v53 inclui spawns cooperativos referenciados no jogador vivo, início protegido da primeira fase, bloqueio de avanço duplicado, remoção do reinício por R, filtro de mapas equivalentes a 640×580, portas geradas nas aberturas de paredes, colisão das portas procedurais e reset das portas em mapas fixos, seleção de alvo vivo na IA cooperativa, captura de erros iniciais, janelas quebráveis, perímetro Neon, silhuetas de armas, aviso discreto de desempenho, save futuro protegido, interpolação/expiração de avatar, limite de revisão, latência HTTP aproximada, cópia de código com fallback, redução de flashes, lobby DOM, segurança/API, saves, controles, mapas, preferências visuais e manifesto offline. O servidor e o service worker são exercitados com requisições/eventos simulados. Os testes do servidor continuam usando handler simulado; Chromium exercitou o servidor local, mas não foi validado TCP entre máquinas nem leitor de tela.
Cobertura: sintaxe dos módulos JS, servidor Node, service worker e blocos inline; servir index, health, rotas criar/entrar/reentrar/estado/sair e listagem pública de salas abertas/lotadas/ativas; entrada tardia bloqueada e presença expirada após 60 s; credencial secreta separada do estado público; long poll duplicado, tipos de payload, rate limit, expiração, autorização e relay; renderização do lobby com salas cheias/abertas usando DOM simulado e nomes tratados como texto; validação de preferências do jogo e do multiplayer local com tipo, faixa, enumeração e chave desconhecida; seleção do zoom padrão; exclusão da API do cache offline; cache atualizado v53; colisão nas quatro bordas, bloqueio de posição inválida, spawn cooperativo e spawn livre ao montar os 72 mapas Neon jogáveis; portas geradas em aberturas de mapas e reconstrução de sua colisão; persistência, cooperativo, controles, manifesto e navegação.
Os testes do service worker simulam CacheStorage/fetch/eventos. Não comprovam instalação, ciclo de vida e offline reais no Chrome.

## Comparação com original
Os mesmos testes foram avaliados contra os arquivos anteriores: 7 PASS / 18 FAIL (BASELINE_TEST_RESULTS.json). Três falhas são a ausência da nova API restoreBackup; o defeito antigo do botão foi identificado pela colisão EXP.reload no código. Os demais incluem comportamentos incorretos reproduzidos. Não tratar 18 testes como 18 bugs independentes.

## Desempenho sintético
`node tests/benchmark.cjs` — resultados em PERFORMANCE_BASELINE.json e interpretação em AI_PERFORMANCE.md.

## Pendentes atuais — navegador
- Jogar a fase 1 até vitória/morte; repetir em fase intermediária e final e conferir transições.
- Cooperativo local com P1/P2 em ações reais; jogo online entre dois clientes.
- Modos, chefes, loja, gamepad, volume, áudio, portas e efeitos visuais em sessões completas.
- Testar instalação real do service worker e recarga offline com /, index.html e ?dev=1, inclusive em subdiretório.
- Medir partida repetível por 60 s: frame times p50/p95/p99, update/draw, entidades, pathfinding, memória e áudio.

## Limitação concreta
As rotas foram testadas sem socket por causa da política que bloqueia loopback (EACCES). Não foi validada a experiência em dois navegadores/dispositivos, reconexão visual, console real ou FPS nesta rodada.
