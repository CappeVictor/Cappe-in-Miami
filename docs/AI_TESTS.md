# Testes — 04/11/2026
## Executados
Resultado: **44/44 PASS** em runtime Node integrado ao Codex. Os testes exercitam o handler HTTP diretamente com requisições/respostas simuladas, além das regras internas e sintaxe. Não foi possível testar TCP/loopback real: o ambiente nega conexões locais com EACCES e não disponibiliza `node` no terminal PowerShell. Repita `node tests/regression.cjs` com Node.js 18+.
Cobertura v49 inclui portas geradas nas aberturas de paredes, colisão das portas procedurais e reset das portas em mapas fixos, seleção de alvo vivo na IA cooperativa, captura de erros iniciais, janelas quebráveis, perímetro Neon, silhuetas de armas, aviso discreto de desempenho, save futuro protegido, interpolação/expiração de avatar, limite de revisão, latência HTTP aproximada, cópia de código com fallback, redução de flashes, lobby DOM, segurança/API, saves, controles, mapas, preferências visuais e manifesto offline. O servidor e o service worker são exercitados com requisições/eventos simulados. Não houve teste TCP, navegador real, leitor de tela ou dois clientes em rede.
Cobertura: sintaxe dos módulos JS, servidor Node, service worker e blocos inline; servir index, health, rotas criar/entrar/reentrar/estado/sair e listagem pública de salas abertas/lotadas/ativas; entrada tardia bloqueada e presença expirada após 60 s; credencial secreta separada do estado público; long poll duplicado, tipos de payload, rate limit, expiração, autorização e relay; renderização do lobby com salas cheias/abertas usando DOM simulado e nomes tratados como texto; validação de preferências do jogo e do multiplayer local com tipo, faixa, enumeração e chave desconhecida; seleção do zoom padrão; exclusão da API do cache offline; cache atualizado v49; colisão nas quatro bordas, bloqueio de posição inválida e spawn livre ao montar os 74 mapas Neon jogáveis; portas geradas em aberturas de mapas e reconstrução de sua colisão; persistência, cooperativo, controles, manifesto e navegação.
Os testes do service worker simulam CacheStorage/fetch/eventos. Não comprovam instalação, ciclo de vida e offline reais no Chrome.

## Comparação com original
Os mesmos testes foram avaliados contra os arquivos anteriores: 7 PASS / 18 FAIL (BASELINE_TEST_RESULTS.json). Três falhas são a ausência da nova API restoreBackup; o defeito antigo do botão foi identificado pela colisão EXP.reload no código. Os demais incluem comportamentos incorretos reproduzidos. Não tratar 18 testes como 18 bugs independentes.

## Desempenho sintético
`node tests/benchmark.cjs` — resultados em PERFORMANCE_BASELINE.json e interpretação em AI_PERFORMANCE.md.

## Pendentes — navegador real
- Abrir menu, opções, perfil/dados; importar e restaurar um save fictício em perfil separado; conferir mensagens e persistência após reload.
- Solo: iniciar, mover, atirar, recarregar, morrer, reiniciar, pausar, trocar mapa/andar e encerrar sala.
- Cooperativo: P1 e P2 separadamente; ponto não dispara; Ctrl Direito atira; P1 usa WASD; colete e dano de cada jogador; vidas compartilhadas/independentes.
- Modos, chefes, loja, campanha e gamepad; volume e efeitos visuais.
- DevTools Console e Network; instalação do SW e recarga offline com /, index.html e ?dev=1, incluindo subdiretório.
- Medir partida repetível por 60 s: frame times p50/p95/p99, update/draw, entidades, pathfinding, memória e áudio.

## Limitação concreta
As rotas foram testadas sem socket por causa da política que bloqueia loopback (EACCES). Não foi validada a experiência em dois navegadores/dispositivos, reconexão visual, console real ou FPS nesta rodada.
