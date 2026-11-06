# Testes — até 06/11/2026

## Preview Rust/WASM local v76.0 — 06/11/2026
- Build Rust/WASM offline passou; o artefato recompilado contém `draw_neon_doors` e `neon_doors_ptr` (102.586 bytes).
- `node tests/wasm-renderer.cjs` e `node tests/wasm-renderer-browser.cjs`: passaram, cobrindo rotação base + abertura, offsets e handles de sprite em lote.
- `node tests/regression.cjs`: **61/61 passaram**, incluindo integração das portas Neon, cache v76 e endpoint health v76.
- Smoke Chromium para mapa Neon não executou: o ambiente negou acesso ao socket loopback do DevTools. Não há screenshot nem validação visual desta iteração. Sem comparação lado a lado ou medição de FPS.

## Preview Rust/WASM local v75.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; `renderer.wasm` atualizado (101.508 bytes).
- `node tests/wasm-renderer.cjs`: passou; valida exportação FTILES, ordem de salas, exclusão do corredor e translação do padrão.
- `node tests/wasm-renderer-browser.cjs`: passou; valida criação do padrão no host, clipping, fills e contador de comandos; fallback continua disponível.
- `node tests/regression.cjs`: **60/60 passaram**, incluindo integração FTILES, cache v75 e health endpoint v75.
- Smoke Chrome headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 168.972 primitivas de piso, 16.516 comandos de acabamento, 13 comandos de textura do piso, 135 de texturas do mapa, assets WALLT/FURNT/DOORT carregados, 1.273 comandos de mapa, 70 de decor, quatro de vidro e zero exceções.
- Screenshot inspecionada. Sem comparação lado a lado, campanha completa ou medição de FPS.

## Preview Rust/WASM local v74.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; WASM incluído (101.139 bytes).
- `node tests/wasm-renderer.cjs`: passou; valida escolha/ordem/geometria de texturas e decalques das aberturas.
- `node tests/wasm-renderer-browser.cjs`: passou; verifica padrões, recortes de textura e desenho de decalques no Canvas host.
- `node tests/regression.cjs`: **59/59 passaram**, incluindo fallback de `buildFloor`, cache offline e endpoint v74.
- Smoke Chromium headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 168.972 primitivas de piso, 16.516 comandos de acabamento, 135 comandos de texturas do mapa, assets WALLT/FURNT/DOORT carregados, 1.339 comandos de mapa, 70 de decor, quatro de vidro, 1.054 de móveis, 4.560 de portas e zero exceções.
- Screenshot inspecionada. Sem comparação lado a lado, campanha completa ou medição de FPS.

## Preview Rust/WASM local v73.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; WASM incluído (99.571 bytes).
- `node tests/wasm-renderer.cjs`: passou; compara o RNG e as posições/tamanhos do granulado, além da ordem e geometria de sombras e rejunte.
- `node tests/wasm-renderer-browser.cjs`: passou; verifica execução em lote pelo host Canvas e a contagem de acabamento.
- `node tests/regression.cjs`: **58/58 passaram**, incluindo buildFloor, cache offline e endpoint v73.
- Smoke Chromium headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 168.972 primitivas de piso, 16.516 comandos de acabamento, 1.309 comandos de mapa, 70 de decor, quatro comandos de vidro no diagnóstico, 1.054 de móveis, 4.260 de portas, 3.692 de corpo de jogador, 1.739 de corpo inimigo, dois textos inimigos e zero exceções.
- Screenshot inspecionada. Sem comparação lado a lado, campanha completa ou medição de FPS.

## Preview Rust/WASM local v72.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; WASM incluído (97.845 bytes).
- `node tests/wasm-renderer.cjs`: passou; inclui painéis intactos e geometria/alpha dos estilhaços.
- `node tests/wasm-renderer-browser.cjs`: passou; confirma as primitivas Canvas do vidro e a contagem do lote.
- `node tests/regression.cjs`: **57/57 passaram**, incluindo cache offline e endpoint v72.
- Smoke Chromium headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 152.456 primitivas de piso, 1.345 comandos de mapa, 70 de decoração, quatro comandos de vidro no diagnóstico, 1.054 comandos de móveis, 4.620 de portas, 4.004 de corpo de jogador, 1.607 de corpo de inimigo, dois textos de inimigo e zero exceções.
- Screenshot inspecionada. Sem comparação lado a lado, campanha completa ou medição de FPS.

## Preview Rust/WASM local v71.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; WASM incluído (97.332 bytes).
- `node tests/wasm-renderer.cjs`: passou; valida fundo fixo, ausência de fundo para mapa procedural, overlay, geometria de tapete e decor.
- `node tests/wasm-renderer-browser.cjs`: passou; valida execução no host Canvas, cores e contagem de decoração.
- `node tests/regression.cjs`: **57/57 passaram**, incluindo cache offline e endpoint v71.
- Smoke Chromium headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 152.456 retângulos de piso, 879 comandos de mapa, 70 comandos de decoração, 1.054 de móveis, 4.560 portas, 3.952 comandos de jogador, 1.403 de corpo inimigo, dois textos inimigos e zero exceções.
- Screenshot inspecionada. Sem comparação lado a lado, campanha completa ou medição de FPS.

## Preview Rust/WASM local v70.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; binário WASM do pacote recompilado (96.728 bytes).
- `node tests/wasm-renderer.cjs`: passou; verifica comandos e posições dos rótulos de stun/suspeita, nocaute e alerta, além de geometria anterior.
- `node tests/wasm-renderer-browser.cjs`: passou; host executa quatro comandos de texto pelo painter cacheado e preserva a ordem no buffer.
- `node tests/regression.cjs`: **57/57 passaram**, incluindo cache offline e endpoint v70.
- Smoke Chromium headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 4.056 comandos de jogador, 1.540 de corpo inimigo, 240 sombras, dois comandos de texto no diagnóstico e zero exceções JavaScript.
- Screenshot inspecionada. Não houve comparação lado a lado com o caminho JS, sessão manual de campanha ou medição de FPS.

## Preview Rust/WASM local v69.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; binário WASM distribuído tem 95.937 bytes.
- `node tests/wasm-renderer.cjs`: passou; verifica seis arcos por inimigo atordoado, raios/posição orbital e ausência de arcos em inimigo sem stun.
- `node tests/wasm-renderer-browser.cjs`: passou; host executa os arcos Rust uma vez e mantém o texto de stun sem chamar a geometria JavaScript duplicada.
- `node tests/regression.cjs`: **57/57 passaram**, incluindo health endpoint e cache v69.
- Smoke Chromium headless, perfil novo: renderer `ready`, `play`, nível 1 `Apartamento`, 3.952 comandos de jogador, 1.401 de corpo inimigo, 229 sombras, stun exercitado e zero exceções JavaScript.
- Screenshot inspecionada. Não houve comparação lado a lado com o caminho JS, teste manual de campanha ou medição de FPS.

## Preview Rust/WASM local v68.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; binário WASM do pacote atualizado (92.749 bytes).
- `node tests/wasm-renderer.cjs`: passou, incluindo lotes Rust completos de jogador, ordem arma/aura/sprite/tag, caminhos fallback e spritesheet, além das regressões anteriores de geometria e pixels.
- `node tests/wasm-renderer-browser.cjs`: passou, cobrindo execução do lote Canvas, recortes P1/P2, cores de skin, marcadores e fluxo procedural.
- `node tests/regression.cjs`: **57/57 passaram**, incluindo a atualização do cache offline e versão do endpoint.
- Smoke Chromium headless, perfil limpo: renderer `ready`, estado `play`, nível 1 `Apartamento`, 4.056 comandos de jogador, 1.812 de corpo inimigo, 302 sombras inimigas, stun exercitado e zero exceções JavaScript.
- Captura PNG da sessão foi inspecionada. Não houve comparação lado a lado com o caminho JS, sessão longa, teste manual de P2/remoto nem medição de FPS.

## Preview Rust/WASM local v67.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; o WASM distribuído foi atualizado.
- `node tests/wasm-renderer.cjs`: passou, cobrindo buffer de comandos de corpo, fallback geométrico, transforms/alpha de nocaute e célula animada do spritesheet.
- `node tests/wasm-renderer-browser.cjs`: passou; o host executa o lote Rust de corpo antes dos eventos seguintes, mantém sombra antes do corpo, sem chamar o painter JS de corpo.
- `node tests/regression.cjs`: **57/57 passaram**.
- Chrome headless em Apartamento, nível 1: renderer `ready`, `play`, 1.855 comandos de corpo e 265 sombras de inimigos, stun exercitado e zero exceções JS. Captura gerada e inspecionada; não foi feita comparação lado a lado com o renderer JS.
- Não houve medição de FPS.

## Preview Rust/WASM local v66.0 — 06/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; o `renderer.wasm` incluído no pacote foi atualizado.
- `node tests/wasm-renderer.cjs`: passou; valida buffers Rust da sombra de cada inimigo visível, posições, dimensões, alpha 0.55 em nocaute, reset e ordem dos eventos.
- `node tests/wasm-renderer-browser.cjs`: passou; valida execução da sombra no host Canvas antes do corpo e sinaliza para o painter não duplicar a sombra.
- `node tests/regression.cjs`: **57/57 passaram**, incluindo fallback JS da sombra inimiga, health endpoint e versão do cache offline.
- Chrome headless, perfil v66: Renderer `ready`, estado `play`, nível 1 “Apartamento”, 293 comandos de sombra inimiga, um stun e zero exceções JS; os seletores de frame e o fallback procedural 24×24 também foram exercitados.
- Captura PNG foi gerada fora do pacote, sem revisão visual manual. Não houve medição de FPS.

## Preview Rust/WASM local v65.0 — 05/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou.
- `node tests/wasm-renderer.cjs`: passou, incluindo comandos da sombra/aura P1/P2 e da preferência alternativa de sombra.
- `node tests/wasm-renderer-browser.cjs`: passou; confirma elipses/cor da aura no host Canvas simulado.
- `node tests/regression.cjs`: 57/57 passaram, incluindo o uso do painter WASM dentro de `drawOnePlayer`.
- Chrome headless em perfil limpo: renderer `ready`, jogo em `play`, fase 1 `Apartamento`, 152.456 primitivas de piso, 807 comandos de mapa, 1.054 de móveis, 3.631 de armas, 4.380 de portas, 730 comandos de sombra/aura do jogador, um efeito de atordoamento, frames `[2,3]` do ataque do jogador e `[2,1]` do inimigo, frame procedural 24×24 e zero exceções JS.
- Captura PNG gerada fora do projeto; sem revisão visual manual e sem medição de FPS.

## Preview Rust/WASM local v64.0 — 05/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou.
- `node tests/wasm-renderer.cjs`: passou; cobre seleção da célula do spritesheet do jogador nos quatro estados/fases/limiares de ataque e a cadência de 110 ms dos frames de inimigos.
- `node tests/wasm-renderer-browser.cjs`: passou, incluindo a ponte de seleção de células dos dois spritesheets.
- `node tests/regression.cjs`: 57/57 passaram, incluindo integração de `drawOnePlayer` com a célula selecionada pelo bridge e regressões de campanha, mapas, save e multiplayer.
- Chrome headless em perfil limpo: renderer `ready`, jogo em `play`, fase 1 `Apartamento`, 152.456 primitivas de piso, 807 comandos de mapa, 1.054 de móveis, 1.609 de armas, 1.920 de portas, um efeito de atordoamento, frames `[2,3]` do ataque do jogador e `[2,1]` do inimigo, frame procedural 24×24 e zero exceções JS.
- Captura PNG gerada fora do projeto; sem revisão visual manual e sem medição de FPS.

## Preview Rust/WASM local v63.0 — 05/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou.
- `node tests/wasm-renderer.cjs`: passou; valida ABI, visibilidade e ordem dos inimigos pelo buffer de eventos, geração de piso e geometria das camadas portadas.
- `node tests/wasm-renderer-browser.cjs`: passou; valida consumo dos eventos e integração com o host Canvas simulado.
- `node tests/regression.cjs`: 57/57 passaram, incluindo campanha/mapas, saves, multiplayer e verificações gerais.
- Chrome headless em perfil limpo: renderer `ready`, estado `play`, fase 1 `Apartamento`, 152.456 primitivas de piso, 807 comandos de mapa, 1.054 de móveis, 1.994 de armas, 2.400 de portas, um efeito de atordoamento exercitado, frame procedural 24×24 e zero exceções JavaScript.
- PNG de captura gerado fora da cópia do projeto; sem revisão visual manual e sem medição de FPS.

## Preview Rust/WASM local v62.0 — 05/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou.
- `node tests/wasm-renderer.cjs`: passou, incluindo casos de porta vertical/horizontal com e sem painel texturizado.
- `node tests/wasm-renderer-browser.cjs`: passou, incluindo transformação e desenho de portas no Canvas simulado.
- `node tests/regression.cjs`: 57/57 aprovadas.
- Chrome headless: Apartamento em `play`, renderer `ready`, 152.456 primitivas de piso, 1.054 comandos de móveis, 1.382 de armas, 1.680 de portas, frame procedural 24×24 e zero exceções JS. Captura atualizada em `wasm-gameplay-preview.png` fora do pacote.
- Isso confirma abertura da primeira fase; não substitui uma sessão manual completa de todos os mapas/modos.
- Sem medição de FPS.

## Preview Rust/WASM local v61.0 — 05/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou; o binário do pacote foi atualizado.
- `node tests/wasm-renderer.cjs`: passou com paridade pixel a pixel dos frames do jogador em quatro paletas, todos os estados/fases e ataques, além das regressões de piso, mapa, inimigos, móveis e comandos de 24 variantes de arma.
- `node tests/wasm-renderer-browser.cjs`: passou, incluindo geração/envio do buffer de pixels e comandos de ícone ao Canvas simulado.
- `node tests/regression.cjs`: 57/57 aprovadas.
- Chrome headless: fase 1 “Apartamento” em `play`, renderer `ready`, 152.456 primitivos de piso, 1.054 comandos de móveis, cerca de 2,1 mil comandos de armas, frame procedural de 24×24 e zero exceções JS. Captura salva fora do pacote em `wasm-gameplay-preview.png`.
- A captura confirma uma abertura da fase; não substitui teste manual completo. Não houve benchmark FPS.
- Sem medição de FPS.

## Preview Rust/WASM local v57.0 — 05/11/2026
- `cargo build --offline --manifest-path wasm-renderer/Cargo.toml --release --target wasm32-unknown-unknown`: passou sem dependências externas.
- `node tests/wasm-renderer.cjs`: ABI de dispatch, setter, propagação de erro, culling/ordem de inimigos, equivalência aleatória de piso/sala, geometria do azulejo, sombras e geometria de paredes/postes passaram.
- `node tests/wasm-renderer-browser.cjs`: métodos Canvas, setter, gradiente, callbacks de piso/mapa/parede, recorte de tijolo e selo/status passaram em protótipos simulados no Node.
- `node tests/regression.cjs`: 57/57.
- Captura headless de Chrome: fase 1 “Apartamento” abriu em `play`, renderer `ready`, 152.456 primitivos de piso e 282 comandos de detalhes estáticos; zero exceções JavaScript. Não substitui sessões manuais completas.
- Sem medição de FPS.
## Execução v55.0 — 05/11/2026
node tests/regression.cjs: 57/57 PASS. A cobertura nova valida as allowlists fixas/grade/Neon, títulos sem dimensões (incluindo o caso Trailer 640 x 580), remoção de testes/protótipos da experiência ativa, referências e ordem da campanha, e construção de spawns/colisões/saídas em todos os mapas permitidos. Também confirma que tiles e objetos fonte dos mapas Neon permanecem iguais após a montagem.

Não houve validação visual em navegador nem medição de desempenho nesta iteração. As verificações de mapa usam runtime de colisão e canvas simulado.

## Execução v54.0 — 05/11/2026
`node tests/regression.cjs`: **55/55 PASS**. Inclui teste de fogo amigo que verifica origem P1/P2, opção ligada/desligada, alvo fora do alcance e jogador morto. Todos os testes anteriores permanecem aprovados.

Não houve validação manual em navegador nesta iteração. O teste de fogo amigo executa a lógica isolada e verifica a integração no fluxo de atualização por regressão estática. Campanha completa, online entre dispositivos, áudio, service worker offline real e FPS continuam pendentes.

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
