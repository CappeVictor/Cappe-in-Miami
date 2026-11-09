# Próximas ações — preview local v284.0
- Móveis, portas comuns, portas Neon e vidros intactos/estilhaços usam somente Rust/WebSys direto; Canvas do jogo continua fallback. WASM legado: 21.157 bytes, 2 imports, 27 exports.
- Continuar auditando todas as camadas ainda executadas por Canvas/JS e as responsabilidades restantes do módulo legado; migrar grupos completos com referência independente e regressões. Migração completa, campanha abrangente, revisão visual manual e benchmark seguem pendentes.

# Próximas ações — preview local v283.0
- O piso não possui mais rota legada: Rust/WebSys pinta granulado, FTILES, sombras e rejunte; index.html preserva fallback Canvas. WASM legado: 61.001 bytes, 3 imports, 36 exports.
- Auditar callbacks/exportações gráficas ainda usados em wasm-renderer.js e rotas Canvas por tela; migrar os caminhos de produção restantes e validar contra referência independente. Renderizador integral, campanha completa, revisão visual ampla e benchmark continuam pendentes.

# Próximas ações — preview local v282.0
- Ícones, atores, pisos, mapa e texturas de mapa, objetos, HUD comum e efeitos exercitados usam painters Rust/WebSys diretos; batches legados foram removidos. Módulo legado: 68.531 bytes, 5 imports e 45 exports.
- Auditar os callbacks/exportações gráficas ainda usados em `wasm-renderer.js` e as rotas Canvas por tela; migrar o que restar e validar contra referência independente. Renderer integral, campanha completa, revisão visual manual ampla e benchmark ainda pendentes.

# Próximas ações — preview local v274.0
- v274 removeu as formas fixas do HUD e o batch antigo; v273 removeu o dealer, v272 painéis da loja, v271 base/overlay de mapa, v270 menu de pausa, v269 barra do chefe e v268 aura/sombra.
- Auditar rotas gráficas ainda dependentes do WASM antigo e chamadas Canvas no host, migrando grupos completos com referência do jogo e paridade. O renderer ainda é híbrido; faltam campanha completa, revisão visual manual ampla e benchmark.
- v252 removeu FX, pickups, arremessos e sprite de muzzle do WASM legado. Continuar auditando os imports/exports e callbacks restantes, priorizando camadas ainda rasterizadas no JS/host sem transferir simulação para Rust. O WASM antigo continua obrigatório para o bootstrap e outras rotas.
- v234 moveu a geometria do vendedor e painéis da loja para Rust/WebSys direto. As rotas de transporte, gradientes e sprites procedurais estão em Rust direto; o fallback legado continua disponível.
- v227 moveu os rastros fantasma ao painter direto e v226 moveu os jogadores P1/P2. A simulação de jogo permanece no host.
- v226 moveu a composição de P1/P2 para Rust/WebSys direto, com paridade Chrome de dois jogadores (incluindo skin) em zero canais diferentes. Próximo: continuar movendo os batches de atores e retirar callbacks gráficos legados gradualmente; validar cada caminho antes de remover fallback.
- v225 moveu a geração RGBA dos sprites procedurais do jogador para Rust direto; Chrome comparou seis estados/fases com zero diferenças. Migração integral pendente.
- v224 moveu a geometria dos 17 tipos de móveis estáticos para Rust/WebSys direto. Chrome comparou rota direta e fallback com zero diferenças RGBA e rejeição de geometria inválida. Próximo: auditar os batches restantes gerados pelo WASM legado, priorizando portas e HUD. A migração integral continua pendente.
- v223 moveu a composição das texturas FTILES para Rust direto no ImageData; teste Chrome comparou rota direta e fallback com zero diferenças nos casos exercitados.
- v222 moveu a geração do granulado RGBA do piso ao módulo direto, preservando pixels e estado RNG; Chrome confirmou zero diferenças contra o fallback.
- v221 moveu o processamento de sombras/rejunte RGBA do piso ao módulo direto, operando em ImageData; build, regressões 97/97 e paridade Chrome contra fallback passaram com zero diferenças. A migração integral continua pendente.
- v220 moveu vidros intactos e fragmentos ao painter Rust direto; Chrome comparou rota direta e fallback sem diferenças RGBA.
- v219 moveu a geração e o desenho de faces de paredes e detalhes de postes ao Rust/WebSys direto; Chrome comparou referência e fallback sem diferenças RGBA.
- v218 moveu as sombras de paredes e móveis ao painter Rust direto; Chrome comparou referência, fallback e rota direta sem diferenças RGBA.
- v217 moveu os detalhes internos de salas e piso para geração e pintura Rust/WebSys direto, mantendo a mesma sequência RNG; Chrome comparou pixels e estado RNG contra o fallback.
- v216 moveu geração e desenho da decoração estática dos mapas para Rust/WebSys direto; Chrome comparou a rota direta, fallback e referência com zero diferenças RGBA e estado Canvas preservado.
- v215 moveu o desenho da base e overlay simples de mapa ao Rust/WebSys direto; Chrome comparou os dois com zero diferenças RGBA e estado do Canvas preservado.
- v214 move a projeção e geometria dos contornos noturnos de inimigos ao Rust direto; a paridade ampla Chrome passou e o caso focado teve zero diferenças RGBA.
- v213 envia sangue ativo/estático e corpos diretamente ao painter Rust; zero diferenças RGBA nos casos comparados. Build, regressões, renderer e browser bridge passaram.
- v212 moveu poeira e faíscas ao módulo Rust direto a partir do estado das partículas; zero diferenças RGBA no Chrome. Build, regressões 90/90, renderer e browser bridge passaram.
- v211 moveu a geração/pintura da geometria de escadas, elevadores e saídas ao Rust/WebSys direto; regressões 90/90 e paridade ampla Chrome passaram sem diferenças RGBA nos casos cobertos.
- v210 migrou os gradientes cacheados de escadas, elevadores, portas e saídas para Rust/WebSys direto; quatro variantes e dois estados tiveram zero diferenças RGBA. A geometria já segue pelo módulo direto desde v211.
- v208 envia imagens, coordenadas e opacidade dos textos cacheados do HUD para o painter Rust direto; teste focado Chrome teve zero diferenças RGBA e preservou o estado do Canvas. Próximo: mapear e migrar callbacks restantes ativos em jogo, mantendo a lógica no JS. A suíte Chrome ampla foi interrompida após passar de 4 GB de memória sem saída.
- v207 migra a barra de chefe ao painter Rust direto; ZIP extraído validado com 165 arquivos, regressões 90/90 e paridade Chrome. Continuar auditando callbacks Canvas em efeitos, camadas e HUD. Continuar auditoria de callbacks Canvas em efeitos, camadas e HUD.
- v206 corrigiu os 12 ícones das armas novas: Chrome, zero diferenças RGBA e estado restaurado. ZIP v206 extraído validado (164 arquivos, regressões 89/89 e paridade Chrome para máscaras e armas); continuar auditando rasterização de UI, efeitos e overlays residuais.
- v205 migra a rasterização das 16 máscaras novas para Rust/WebSys; regressões 88/88, renderer, bridge e paridade Chrome passaram. ZIP v205 extraído validado (163 arquivos, regressões 88/88, parity Chrome sem diferenças); prosseguir auditando as imagens procedurais restantes até não haver rasterização gráfica em JavaScript.
## Migração integral do renderer — pendente
- v204 moveu o cálculo dos vértices e a pintura da seta de Invasão ao painter direto Rust; cinco ângulos/posições no Chrome tiveram zero diferenças RGBA e estado Canvas preservado. Build, regressões 87/87, renderer e browser bridge passaram. Sem benchmark.
- v203 moveu a pintura dos marcadores e da rota de fuga da máscara Coruja ao Rust/WebSys, mantendo visibilidade e navegação na simulação. Chrome comparou cinco marcadores e uma rota tracejada: zero diferenças RGBA e estado Canvas preservado; regressões 86/86, renderer e bridge passaram. Sem benchmark ou campanha completa.
- v203 moveu a pintura dos marcadores e da rota de fuga da máscara Coruja ao Rust/WebSys, mantendo visibilidade e navegação na simulação. Chrome comparou cinco marcadores e uma rota tracejada: zero diferenças RGBA e estado Canvas preservado; regressões 86/86, renderer e bridge passaram. Sem benchmark ou campanha completa.
- Auditar os callbacks de Canvas ainda ativos em `exp-content.js`, `exp-ui.js`, `exp-modes.js` e no renderer central; priorizar geração procedural de sprites e estados reais de combate, mantendo fallback até validar cada caminho.
- v202 envia posição/dono dos projéteis e sprites existentes direto ao painter Rust. Chrome comparou ambos os donos e entradas inválidas: zero diferenças RGBA. Build, regressões 85/85, renderer, browser bridge e teste focado passaram. Sem benchmark.
- v201 projeta e pinta cápsulas de munição diretamente no Rust; Chrome comparou cinco registros, incluindo inválidos, com zero diferenças RGBA. Build, regressões 85/85, renderer, browser bridge e teste focado passaram. Sem benchmark.
- v200 envia pickups e arremessos direto aos painters existentes. Chrome comparou glow ligado/desligado e dois tipos de arma com fallback: zero diferenças RGBA, estado Canvas restaurado. Regressões 85/85, renderer, browser bridge e teste focado passaram. Sem benchmark.
- v199 envia tiros e impactos diretamente ao painter Rust/WebSys; o teste Chrome focado comparou dois clarões e um arco com zero diferenças RGBA e restaurou alpha/composição. Build, regressões 85/85, renderer, browser bridge e cópia extraída do ZIP passaram. O teste Chrome amplo foi interrompido após ultrapassar 3 GB; sem benchmark.
- v198 moveu projeção do jogador e cálculo dos raios da máscara de blackout para Rust direto; Chrome comparou máscara e overlay com zero diferenças RGBA. Regressões 85/85, renderer, browser bridge e teste focado passaram na fonte e no ZIP extraído.
- v197 migrou cálculo e desenho de neblina/fumaça para Rust direto; neblina e fumaça tiveram zero diferenças RGBA no Chrome; build, regressões 85/85 e ZIP extraído passaram em regressões/renderer/bridge. Retomar parity completa da cópia extraída com cenário reduzido para evitar consumo excessivo de memória.
- v196 migrou o pulso e o desenho da zona da Invasão para Rust direto; Chrome comparou com zero diferenças RGBA. Build, regressões 85/85, renderer e browser bridge passaram.
- v195 moveu luzes pulsantes, flicker Neon, clarão e reflexo ao painter Rust direto; Chrome comparou os dois caminhos com zero diferenças RGBA. Build, regressões 85/85, renderer, browser bridge e ZIP extraído passaram.
- v194 moveu o cálculo do pulso e a rasterização dos anéis de mundo ao painter Rust direto; Chrome teve zero diferenças RGBA; build, regressões 85/85 e pacote extraído passaram. Continuar auditando as camadas restantes do renderer.
- v193 moveu vidro intacto, shimmer e estilhaços ativos ao painter Rust direto; Chrome teve zero diferenças RGBA; build, regressões 85/85 e testes da cópia extraída passaram. Continuar removendo geradores e fallbacks restantes somente após portar e comparar cada camada.
- v192 moveu os realces de inimigos ao painter Rust direto; comparação Chrome e validação do ZIP extraído passaram.
- v191 moveu barris explosivos e câmeras para o painter Rust direto; comparação Chrome e validação do ZIP extraído passaram.
- Auditar e migrar os callbacks Canvas ainda ligados ao WASM legado e as camadas em `js/exp-world.js`/`js/exp-fx.js`; seleção de assets, ordem de gameplay e muitos fallbacks ainda permanecem no host.
- Continuar auditando os painters restantes, especialmente a geração de lotes e composição de mapa ainda no WASM legado. Seleção de assets, estado e lógica de gameplay continuam no host.
- v185 moveu o compositor RGBA de texturas de mapa para Rust/WebSys direto. Chrome comparou saída direta e fallback WASM de 1440×900: zero canais diferentes; a comparação preexistente com Canvas mantém max 76/255/média 0,001947. Build, regressões 85/85, comparações Chrome e pacote extraído passaram.
- v184 moveu a leitura de pixels de texturas Canvas e HTMLImageElement para WebSys/Rust nos tamanhos cobertos. Chrome comparou os bytes exatos, e a cena registrou cinco chamadas; regressões 85/85 e parity de piso/mapa dentro das tolerâncias já estabelecidas. Sem campanha completa, revisão visual ampla ou benchmark.
- v183 moveu o painter dos contornos noturnos de atores a Rust direto. Chrome comparou o dispatcher com fallback e Rust: dois contornos, paridade RGBA exata e estado restaurado; regressões 85/85. Sem revisão visual ampla ou benchmark.
- v182 moveu a rasterização do lote de retângulos de piso ao painter Rust direto; smoke Chrome registrou 47 chamadas em `newGame`, igualdade RGBA sintética e fallback disponível. Regressões 84/84; sem benchmark.
- Auditar e migrar os callbacks e estados Canvas ainda ligados ao WASM legado. A seleção de assets/mapas, a ordem de comandos e vários fallbacks permanecem no host/renderer antigo. Depois, rodar a campanha completa, ampliar revisão visual e estabelecer benchmark comparável.
- v180 moveu o painter de formas do HUD, barra do chefe e seta da Invasão para Rust direto; o WASM existente ainda determina comandos, valores e cores. Chrome confirmou paridade RGBA nos casos cobertos; regressões 82/82. Sem benchmark.
- v179 moveu transformações e halos de pickups/arremessos para Rust; a função de ícone existente continua sendo chamada durante o transform. Paridade RGBA exata para ambos os brilhos e armas testadas; regressões 82/82. Sem benchmark.
- v178 moveu brilho, clip, gradiente, hachuras e bordas da saída de fase para o painter Rust direto. O WASM legado ainda gera a geometria e o gradiente RGBA é reutilizado; fallback Canvas permanece. Paridade exata em estados concluído/não concluído; regressões 82/82. Sem benchmark.
- v177 moveu os comandos de escadas/elevadores para desenho direto Rust/WebSys. Gradientes existentes são passados como imagens; callback JS antigo permanece fallback. Chrome comparou escada e elevador com zero diferenças RGBA; regressões 82/82. Sem benchmark.
- v176 moveu os passes de gradação de cor e overlays finais do JavaScript para desenho direto via Rust/WebSys, mantendo a ordem e o save/restore do Canvas. Paridade sintética RGBA exata; regressões 82/82. Sem benchmark ou inspeção visual ampla.
## Migração integral do renderer — pendente
1. Auditar e portar callbacks Canvas restantes, incluindo pickups; validar shells, muzzle/impacto, fog/lights/dark em gameplay real.
2. Continuar o módulo direto nas rotas de sprites, mundo, HUD restante e expansões; ImageData, clearRect, imagens cacheadas, mapas geométricos, sangue/cadáveres, poeira/faíscas, labels de inimigos, móveis, atores, jogadores/inimigos, armas, fantasmas e aura agora usam WebSys em casos cobertos, sem benchmark. Manter o caminho antigo até cada camada ter paridade e smoke de jogo.
3. Continuar portando operações gráficas residuais por impacto. Texturas de mapa/piso ainda extraem ImageData e copiam pixels para WASM; persistem outros textos e draw hooks de exp-world.js/exp-fx.js. Auditar runtime em morte/combate, vidro, loja e overlays; remover o bridge antigo só depois de cobrir todas as operações.
4. Portar ou integrar os draw hooks de `js/exp-world.js` e `js/exp-fx.js` sem deixar chamadas gráficas fora do backend alvo.
5. Comparar screenshots/jogabilidade do modo JS e WASM em navegador real; testar fallback e service worker offline.
6. Remover a interceptação Canvas de passagem quando todas as camadas concretas estiverem portadas; medir frame time/CPU/GPU antes de anunciar ganhos.

7. Cobrir os estados e eventos que o smoke curto não alcançou; o caminho de suavização de mapa já foi movido ao Rust direto na v161.

8. Continuar removendo rotas Canvas host dos efeitos e overlays que a auditoria revelar; manter o smoke do jogo separado das comparações sintéticas para controlar o custo.

1. Jogar a campanha até vitória em uma fase inicial, uma intermediária e uma final; conferir morte e transições.
2. Validar fogo amigo ligado/desligado, armas, portas, janelas, áudio e efeitos durante combate real.
3. Validar criação/entrada/saída e reconexão online em dois navegadores/dispositivos.
4. Medir FPS, CPU, memória e frame pacing em hardware modesto e mapas densos.
5. Validar instalação real do service worker e recarga offline.
6. Conferir skins e armas com spritesheets carregados, assets ausentes e acessibilidade.
7. Manter a regressão Neon de 72 mapas e atualizar auditoria se os dados fonte forem alterados.
# Próximas ações — preview local v181.0
## Migração integral do renderer — pendente
- v181 moveu o blit de imagens de texto cacheadas ao Rust direto. Chrome confirmou paridade RGBA exata e estado alpha/composite restaurado; regressões 83/83. Sem benchmark.
- Continuar auditando callbacks Canvas restantes e expandir paridade/smoke de gameplay. A migração permanece híbrida.

# Próximas ações — preview local v182.0
## Migração integral do renderer — pendente
- v182 moveu a rasterização do lote de retângulos de piso ao painter Rust direto; smoke Chrome registrou 47 chamadas em `newGame`, igualdade RGBA sintética e fallback disponível. Regressões 84/84; sem benchmark.
- Auditar e migrar os callbacks e estados Canvas ainda ligados ao WASM legado. A seleção de assets/mapas, a ordem de comandos e vários fallbacks permanecem no host/renderer antigo. Depois, rodar a campanha completa, ampliar revisão visual e estabelecer benchmark comparável.
# Próximas ações — preview local v285.0
1. Auditar callbacks e operações Canvas ainda usados por `js/wasm-renderer.js`, `index.html`, `js/exp-world.js` e `js/exp-fx.js`; portar rotas completas e remover as antigas somente após paridade.
2. Exercitar combate, morte, lojas, expansão, estados de UI e fallback com sprites/assets carregados e ausentes; jogar a campanha do início a fases intermediárias e final.
3. Conferir navegador e service worker offline em instalação real.
4. Medir FPS, CPU, memória e frame pacing em hardware modesto antes de afirmar ganhos.
5. Manter a simulação e regras de jogo compatíveis; não publicar no GitHub sem pedido explícito.

# Próximas ações — preview local v286.0
1. Auditar e migrar os callbacks e operações Canvas ainda encaminhados pelo WASM legado, mantendo o fallback original até cada camada ter paridade.
2. Exercitar combate, morte, loja, expansão, overlays, acessibilidade e assets ausentes; jogar a campanha do início a fases intermediárias e final.
3. Validar instalação e recarga offline do service worker.
4. Medir FPS, CPU, memória e frame pacing em hardware modesto antes de afirmar ganhos.
5. Preservar regras/simulação do jogo e não publicar no GitHub sem pedido explícito.

## Próxima etapa após v287.0
1. Inventariar camadas de desenho que ainda entram no fallback Canvas e contar chamadas em cenas reais usando `wasmDiagnostics=1`.
2. Priorizar uma camada com maior custo/cobertura, portar para Rust direto com fallback intacto e paridade por pixels.
3. Medir FPS/tempo de quadro em Chrome antes/depois com cenário e duração idênticos; não declarar otimização sem esses dados.
4. Validar gameplay e apresentação em mapa/menu/pausa/coop, depois empacotar uma única prévia local.

## Próxima etapa após v288.0
1. Ampliar `wasm-renderer-residual-audit.cjs` para disparos, explosões, pickups, transportes, chefes, modos de Invasão/Neon e erros forçados dos painters; manter a verificação de stack trace.
2. Portar em Rust direto qualquer desenho host que a cobertura adicional detectar e exigir paridade Chrome com fallback.
3. Depois de cobrir caminhos representativos, medir FPS/tempo de quadro com instrumentação desligada e cenário fixo. A auditoria atual cobre 12 cenas, não encerra a migração.

