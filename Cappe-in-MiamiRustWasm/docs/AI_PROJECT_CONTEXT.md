# Cappe-in-Miami — contexto persistente
Atualizado em 06/11/2026. Iteração de renderer local: preview Rust/WASM v76.0; a base de gameplay continua v55.0.

## Identidade e restrições
Ação top-down em HTML, CSS e JavaScript, Canvas 2D e Web Audio. Preservar identidade, conteúdo, mapas, saves e recursos existentes. Objetivo: evolução incremental mensurável; referência de 60 FPS / 16,67 ms, sem alegar resultados sem medição.
A diretriz integral do proprietário está em AI_MASTER_DIRECTIVE.md. AGENTS.md estabelece o protocolo de retomada.

## Origem e estado
Origem histórica: Downloads/Cappe-in-Miami-main/Cappe-in-Miami-main/Cappe-in-Miami.zip. O ZIP original permanece intocado. Esta cópia experimental de migração fica em `.codex/visualizations`; as distribuições Web e Rust/WASM são publicadas separadamente como ZIPs em `downloads/` no repositório.
Não confundir versão atual do jogo (v55.0), versão antiga da pasta (v30) e formato do save (v2, mantido).

## Sistemas
Base e estados globais em index.html; módulos JS, 2 folhas CSS, 86 imagens existentes e server/server.js sem dependências. Expansões carregadas em ordem fixa. Memória do jogador em localStorage. Multiplayer local continua disponível; v36 acrescentou lobby Node e relay de posição para até dois navegadores.
Mapas pesados em maps.js (~2,93 MB), já com decodificação sob demanda. Há sistemas de navegação, IA por classes, chefes, máscaras, armas, perks, modos, vendedor e áudio sintetizado. Consulte AI_ARCHITECTURE.md e AI_FEATURES.md.

## Iteração atual

Esta pasta é uma cópia experimental local para migração do renderer a Rust/WebAssembly. Com `?renderer=wasm`, v76 também escolhe e transforma portas Neon com sprite em lote; o host mantém imagens e rasterização Canvas. v75 seleciona as salas e o offset do overlay `FTILES`. A animação, simulação, restante do compositor, efeitos/HUD e expansões ainda usam JavaScript. Build offline, testes ABI/bridge e regressões 61/61 passaram; Chromium não pôde acessar o socket DevTools local e o smoke Neon não executou. Não houve validação visual nem medição de FPS. Conversão integral pendente.

v46 adiciona janelas quebráveis nos mapas gerados: disparos e golpes removem o sólido, atualizam a navegação e deixam estilhaços temporários. Mapas Neon recebem perímetro visual e físico consistente, inclusive quando o mapa original não possui objetos de parede nas quatro bordas. A v47 corrige o alvo ativo da IA no cooperativo; a v48 corrige a criação e o dimensionamento das portas; a v49 corrige a colisão e o reset dessas portas em todos os mapas; a v50 protege a primeira fase, remove o reinício por R e filtra mapas estreitos; a v51 corrige referências de spawn no cooperativo.
v51 entregou lista pública da instância, entrada pela lista, estados de sala, expiração de presença, colisão de limites e spawns cooperativos. O servidor retransmite apenas presença/posição, sem simular combate.
v52 acrescenta quatro skins puramente cosméticas em `settings.skin` no save v2, sem mexer nas máscaras ou atributos existentes; melhora o acabamento Canvas das armas, corrige a arma invisível de P2 e reutiliza sprites procedurais animados por cache de fase para reduzir criação de Canvas no caminho de fallback. Corrige fase procedural inicial sem inimigos e spawn inválido em boate-b. Sem assets externos. 54 testes automatizados passaram; Chromium confirmou movimento, um disparo, pausa, início da fase 1 com 8 inimigos e spawn livre nos 17 mapas fixos. Fases completas, multiplayer online real, áudio, instalação real do service worker e FPS ainda precisam de validação.

v53 corrige sobreposição de inimigos/armas com paredes na geração Neon: a colisão é montada antes da colocação e cada entidade procura piso livre próximo. Auditoria Chromium: 72 mapas, 720 inimigos e 84 armas, zero posições bloqueadas; regressões 54/54. Foram abertos os modos disponíveis e exercitados fase inicial, movimento/tiro coop local. Ainda não houve campanha completa, sessões intermediária/final, online de duas máquinas nem medição real de FPS.

## v55
Mapas fixos, grades e Neon filtrados por allowlists explícitas; seletor não mostra dimensões; Trailer, protótipos e testes removidos da experiência ativa. A campanha base segue a numeração existente e mantém expansões autorizadas. Saídas Neon são validadas e ancoradas em piso livre quando necessário, sem alterações em js/maps.js. Regressão 57/57; sem validação visual nem medição de FPS.

## Preview local Rust/WASM v69.0 — 06/11/2026
Rust agora gera os orbes animados de stun no buffer do corpo inimigo; o host mantém o rótulo “ATORDOADO” e desenha o texto. Build/testes e smoke Chrome passaram, zero exceções; screenshot inspecionada. Conversão parcial, sem comparação JS/WASM e sem FPS medido.

## Preview local Rust/WASM v70.0 — 06/11/2026
Rust acrescenta comandos para os rótulos de stun, nocaute e estados suspeito/alerta no lote do corpo; o host usa `tx()` e mantém a aparência cacheada. Build offline, testes WASM/bridge e regressão 57/57 passaram. Chrome abriu Apartamento em `play`, executou 2 comandos de texto inimigo no diagnóstico e não teve exceções. Screenshot inspecionada sem comparação de paridade; FPS não medido.

## Preview local Rust/WASM v71.0 — 06/11/2026
Rust emite fundo sólido de mapas fixos, overlay e geometria/cor da decoração estática (incluindo tapetes). A ponte mantém fallback JS e dados dinâmicos. Build offline, regressões 57/57 e smoke Chromium passaram; Apartamento produziu 70 comandos de decoração e zero exceções. Captura inspecionada sem comparação lado a lado; FPS não medido.

## Preview local Rust/WASM v72.0 — 06/11/2026
Rust agora emite os comandos Canvas de janelas intactas e estilhaços de vidro, preservando os temporizadores e remoção dos fragmentos no JS. Build offline, testes WASM/bridge e regressões 57/57 passaram. Chromium abriu Apartamento em `play`, exercitou quatro comandos de vidro no diagnóstico e teve zero exceções. Captura inspecionada; sem comparação lado a lado ou medição de FPS. Conversão integral continua pendente.

## Preview local Rust/WASM v73.0 — 06/11/2026
Rust gera, em lotes, o granulado aleatório determinístico, as sombras dos sólidos e as linhas de rejunte de cada andar. Os overlays com imagens de piso e parede continuam no host. Build offline, testes WASM/bridge e regressões 58/58 passaram. Chromium abriu Apartamento em `play`, executou 16.516 comandos de acabamento e teve zero exceções. Screenshot inspecionada; sem comparação lado a lado ou FPS medido. Migração integral pendente.

## Preview local Rust/WASM v74.0 — 06/11/2026
Rust seleciona as texturas de sólidos e as aberturas de porta a partir da geometria do mapa e emite um lote ordenado; o host fornece as imagens recortadas e aplica padrões/clipping/transform Canvas. Build offline, testes WASM/bridge e regressões 59/59 passaram. Chromium abriu Apartamento com as três folhas de textura carregadas, confirmou 135 comandos de textura e zero exceções. Captura inspecionada; sem comparação lado a lado ou FPS medido. Migração integral pendente.

## Preview local Rust/WASM v75.0 — 06/11/2026
Rust agora gera comandos para as texturas de piso `FTILES`, preservando a ordem das salas e excluindo o corredor. Compilação offline passou; testes específicos e regressões 60/60 passaram. Chrome em Apartamento registrou 13 comandos FTILES, 16.516 de acabamento e zero exceções. Captura inspecionada; sem comparação de imagem lado a lado ou medição de FPS. Migração integral pendente.

## Preview local Rust/WASM v76.0 — 06/11/2026
Rust combina o ângulo base e o estado de abertura das portas Neon, mantém a ordem e emite handles/offsets dos sprites. A animação de gameplay continua em JS; host fornece assets e rasteriza Canvas. Build offline, testes ABI/bridge e regressões 61/61 passaram. O ambiente negou o socket DevTools local; sem smoke de mapa Neon, screenshot ou validação visual. Migração integral pendente, sem medição de FPS.

## v54
Fogo amigo cooperativo agora distingue o proprietário de cada projétil e respeita a opção persistida. Regressões automatizadas: 55/55. O navegador, as partidas completas e o FPS real não foram validados nesta iteração.

## Preview local Rust/WASM v66.0 — 06/11/2026
A migração local permanece opcional por `?renderer=wasm` e sem publicação no GitHub. Rust agora também calcula em buffer a sombra de cada inimigo visível, preservando posição, tamanho, ordem antes do corpo e alpha de nocaute; JS rasteriza o comando e evita desenhar uma sombra duplicada. Build offline, testes específicos WASM/bridge e regressão 57/57 passaram. Corpos e outros efeitos, compositor principal, HUD e demais camadas continuam parciais em JavaScript. Não houve medição de FPS nem revisão visual manual.

## Preview local Rust/WASM v67.0 — 06/11/2026
Rust agora também compõe corpos geométricos de inimigos em comandos ordenados: transform, fallback sem imagem, recorte animado quando o spritesheet carrega e alpha de nocaute. O host JS consome os comandos Canvas; se o lote não existir, o painter antigo é usado. Build offline, testes ABI/bridge e regressões 57/57 passaram; Chrome headless abriu Apartamento e reportou 1.855 comandos de corpo, 265 sombras e zero exceções. Captura inspecionada sem comparação side-by-side; FPS não medido. Compositor principal, corpos do jogador, efeitos, HUD, Canvas host e outras camadas ainda são JS.

## Preview local Rust/WASM v68.0 — 06/11/2026
Rust compõe jogadores locais/remotos num lote ordenado: transform, sombra/aura, arma, spritesheet animado ou frame procedural, acentos da skin e tag P1/P2. A atualização do tempo de animação continua no JS para preservar gameplay. Build offline; `wasm-renderer.cjs`, `wasm-renderer-browser.cjs` e regressão 57/57 passaram. Chromium headless abriu fase 1 Apartamento, `play`, reportou 4.056 comandos de jogador e zero exceções. Captura visual inspecionada sem comparação lado a lado; FPS não medido. Compositor de mapa, HUD/efeitos, estados de stun/rótulos de inimigos e hooks gráficos ainda são parcialmente JS.

## Prioridade seguinte
Validar visualmente o lobby e uma sessão online em dois navegadores/dispositivos; evoluir relay para sincronizar combate/objetivos com simulação autoritativa; recuperar assets ausentes; tratar seleção de alvo da IA e integrar opções de multiplayer. Os dados dos testes são fictícios e nunca usam o armazenamento real do jogador.
