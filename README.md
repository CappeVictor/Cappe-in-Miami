# Cappe in Miami

Jogo de ação top-down ambientado em Miami, com modo História, combates por fases, mapas temáticos, personagens selecionáveis, máscaras e outros modos de jogo.

## A história

Madame Piranha, dona do Mercado Escuro, contrata Cappe para recuperar um carregamento de ouro desaparecido no porto de Biscayne, em 3 de abril de 1989. A primeira pista é um bilhete deixado junto à caixa vazia. A investigação passa por lojas de Coconut Grove, um estúdio de cinema, uma academia, o Hotel Coral, uma central telefônica, a Boate Mar Vermelho, um hospital, uma garagem, uma estação e outros locais de Miami.

As pistas revelam uma rede de contrabando ligada ao ouro e a pessoas influentes. A busca leva Cappe à mansão do responsável pelo esquema e, depois, à central subterrânea. No desfecho, dois homens envolvidos dizem fazer parte de um grupo que quer derrubar o governo da cidade; Cappe decide se os poupa ou os entrega antes de deixar Miami.

A campanha segue os capítulos e mapas que já existem no jogo, incluindo as expansões do hospital e do hotel. O código registra uma divergência entre as datas e a numeração dos capítulos 16 e 19; a ordem segue a numeração, sem criar fases para os capítulos ausentes.

## Escolha uma versão

Baixe o ZIP da versão que deseja jogar. Não é necessário baixar as duas.

- **Web — HTML, CSS e JavaScript v85:** [abrir a pasta](Cappe-in-MiamiWeb/) · [baixar ZIP](Cappe-in-MiamiWeb/cappe-in-miamiWeb.zip)
- **Rust/WASM — v298:** [abrir a pasta](Cappe-in-MiamiRustWasm/) · [baixar ZIP](Cappe-in-MiamiRustWasm/cappe-in-miamiRustWasm-v298-preview.zip)

Depois de extrair o ZIP, execute o arquivo `.bat` que está na pasta extraída. A versão Web usa `INICIAR_WEB.bat`. A prévia Rust/WASM usa `INICIAR_EXPERIMENTO_WASM.bat` e requer Node.js 18 ou superior.

### Sobre a prévia Rust/WASM

A prévia v294 mantém painters Rust/WebSys diretos para as camadas amostradas de gameplay, incluindo Campanha, Horda e Invasão. O antigo trampoline Canvas deixou de ser compilado, servido e pré-cacheado. A auditoria instrumentada não encontrou chamadas Canvas do host em 23 cenas/estados amostrados. Os painters Canvas permanecem como fallback; lógica, simulação, aleatoriedade e seleção/cache de assets seguem em JavaScript. O pool de pontos de rota da IA reduz objetos temporários em um microbenchmark sintético; não há ganho de frame time medido.

## Última atualização — 9 de novembro de 2026 · Web v85 e Rust/WASM v298

As duas versões servem HTML, JavaScript, CSS, JSON e SVG comprimidos em gzip quando o navegador suporta. No Chrome local, a transferência inicial observada caiu de 2,28 MB para 765 KB na Web e de 2,83 MB para 1,14 MB em Rust/WASM. js/maps.js chega a 301.534 bytes transferidos para 1.616.616 bytes decodificados, com conteúdo idêntico. A v297 eliminou uma segunda passagem JavaScript pelas faíscas antes do WASM. Na v85/v298, a navegação da IA usa uma grade espacial para limitar os sólidos testados a cada colisão. Em três rodadas locais com 120 inimigos e 500 faíscas, a mediana do p90 caiu de 3,7 para 2,0 ms na Web e de 3,6 para 3,2 ms em Rust/WASM; no Rust a média subiu de 2,385 para 2,502 ms, então o ganho geral ainda precisa de investigação. A regressão determinística conferiu 3.000 posições contra a busca linear; a suíte passou em 108/108. São medidas deste PC e deste cenário, não garantia para outros computadores. Não houve revisão visual manual ampla.

## Últimas melhorias incluídas

**Prévia Rust/WASM v289.0 — 8 de novembro de 2026**
- Paredes da Campanha migradas ao painter direto. Texturas/piso cobrem canvases de até 1600×1200, incluindo Invasão (1456×1148) e salas com geometria fracionária.
- Build, regressões 105/105, ABI (114 exports/107 imports), bridge, paridade Chrome e auditoria em 23 cenas/estados passaram; não houve chamadas Canvas do host nas cenas amostradas. Piso e paredes tiveram paridade RGBA exata nos cenários exercitados.
- Fallback Canvas permanece para falhas/casos não exercitados. Sem benchmark FPS ou revisão visual ampla.

**Prévia Rust/WASM v288.0 — 8 de novembro de 2026**
- A caixa de resumo na pausa passou ao painter Rust/WebSys stage 4 com fallback Canvas. Regressões 105/105 e paridade Chrome do estágio passaram.
- Auditoria opt-in em 12 cenas não encontrou operações Canvas executadas no host; modos adicionais ainda precisavam de cobertura.

**Prévia Rust/WASM v287.0 — 8 de novembro de 2026**
- Build/teste 104/104; o único módulo WASM servido é o renderer Rust/WebSys direto. Wrappers Canvas de diagnóstico são opt-in. A migração permanece híbrida, sem FPS medido.

**Prévia Rust/WASM v276.0 — 8 de novembro de 2026**
- Fantasmas e a arma migrados ao painter Rust/WebSys direto; removidos `draw_ghosts`, `ghost_input_ptr` e o buffer do WASM legado. O painter Canvas original permanece como fallback. P1/P2 usam o painter direto desde v275.
- Build, regressão 104/104, ABI, browser bridge, paridade direta e auditoria de pixels passaram; fantasmas com Taco tiveram zero diferenças RGBA contra o Canvas original.
- WASM legado: 103.429 bytes, 7 imports e 59 exports. Sem benchmark ou revisão visual manual ampla.

**Prévia Rust/WASM v273.0 — 8 de novembro de 2026**
- A Madame Piranha da loja passou ao painter Rust/WebSys direto; removidos o batch e o buffer de entrada do WASM legado. O Canvas original continua como fallback.
- Estados normal e caindo tiveram zero diferenças RGBA contra uma referência independente do Canvas no Chrome. Regressão 103/103, ABI, browser bridge, paridade direta e pixels passaram.
- WASM legado: 126.802 bytes, 8 imports e 65 exports (v272: 128.777 bytes e 67 exports). Sem benchmark nem revisão visual manual ampla.

**Prévia Rust/WASM v272.0 — 8 de novembro de 2026**
- Painéis de balão, card e rerolar da loja usam Rust/WebSys direto; removidos dois exports do WASM legado. O fallback Canvas original continua no jogo; o dealer ainda usa o fallback antigo enquanto a paridade independente é investigada.
- Regressões 103/103, ABI, browser bridge, paridade Chrome e auditoria de pixels passaram. WASM legado: 128.777 bytes, 8 imports e 67 exports (v271: 129.725 bytes, 8 imports e 69 exports). Sem benchmark ou revisão visual manual ampla.

**Prévia Rust/WASM v264.0 — 8 de novembro de 2026**
- Saída de fase migrou ao painter Rust/WebSys direto; módulo legado: 138.556 bytes, 10 imports e 81 exports.

**Prévia Rust/WASM v263.0 — 8 de novembro de 2026**
- Overlays FX de tela passaram aos painters Rust/WebSys diretos. WASM legado: 140.548 bytes, 12 imports e 84 exports.

**Prévia Rust/WASM v262.0 — 8 de novembro de 2026**
- Luzes do mundo e anéis de efeito migraram aos painters Rust/WebSys diretos. WASM legado: 142.552 bytes, 13 imports e 87 exports.

**Prévia Rust/WASM v258.0 — 8 de novembro de 2026**
- Escadas e elevadores agora usam o painter Rust/WebSys direto; os buffers e callbacks do batch legado foram removidos. Chrome comparou escadas/elevadores com zero diferenças RGBA.
- Regressões 102/102, ABI, bridge, paridade direta e piso passaram na fonte e no ZIP. WASM legado: 163.672 bytes, 18 imports e 109 exports. Sem benchmark ou revisão visual manual ampla.

**Prévia Rust/WASM v257.0 — 8 de novembro de 2026**
- O marcador da zona pulsante de Invasão passou ao painter Rust/WebSys direto. Chrome comparou o painter com o Canvas original em zero diferenças RGBA.
- Regressões 102/102, ABI, bridge, paridade direta e piso passaram na fonte e no ZIP extraído. WASM legado: 168.837 bytes, 20 imports e 112 exports. Sem benchmark nem revisão visual manual ampla.

**Prévia Rust/WASM v256.0 — 8 de novembro de 2026**
- A seta da Invasão passou a chamar somente o painter Rust/WebSys direto. Cinco ângulos/posições comparados no Chrome tiveram zero diferenças RGBA.
- Regressões 102/102, ABI, browser bridge, paridade direta, teste focado e piso passaram na fonte e no ZIP extraído. WASM legado: 169.636 bytes, 21 imports e 115 exports. Sem benchmark nem revisão visual manual ampla.

**Prévia Rust/WASM v255.0 — 8 de novembro de 2026**
- Imagens e vinhetas do HUD passaram ao painter Rust/WebSys direto. Chrome comparou cinco etapas com o Canvas original sem diferenças RGBA.
- Regressões 102/102, ABI, browser bridge, paridade direta e piso passaram na fonte e no ZIP extraído. WASM legado: 170.183 bytes, 22 imports e 117 exports. Sem benchmark nem revisão visual manual ampla.

**Prévia Rust/WASM v254.0 — 8 de novembro de 2026**
- Texto do combo e do alarme agora usa somente os painters Rust/WebSys diretos, com fallback Canvas do jogo. Chrome comparou os dois caminhos e encontrou zero diferenças RGBA nos casos exercitados.
- Regressões 102/102, ABI, browser bridge, paridade direta e piso passaram na fonte e no ZIP extraído. WASM legado: 171.027 bytes, 23 imports e 119 exports. Sem benchmark ou revisão visual manual ampla.

**Prévia Rust/WASM v253.0 — 8 de novembro de 2026**
- Color grade e overlays de fade/flash passaram a usar os painters diretos; os batches correspondentes saíram do WASM legado, preservando o fallback Canvas.
- Regressões 102/102, ABI, browser bridge e comparações RGBA passaram. Sem benchmark ou revisão visual manual ampla.

**Versões v84 Web e v297 Rust/WASM — 9 de novembro de 2026**
- A IA reaproveita os objetos dos pontos da rota BFS ao recalcular caminhos, nas duas versões. No microbenchmark sintético de 500 rotas repetidas no mesmo labirinto, os pontos criados caíram de 35.000 para 0 após aquecimento do pool; a mediana de cálculo permaneceu perto de 0,04 ms. Isso reduz alocação temporária nesse caso, mas não comprova queda de heap total ou de frame time.
- O bundle Neon passou de 159 para 61 mapas permitidos nas duas versões; os 98 mapas inativos/de teste foram removidos do arquivo carregado. Os 61 mapas mantidos foram comparados antes/depois: dimensões, tiles e objetos idênticos. `js/maps.js` caiu 44,8% (cerca de 1,31 MB em cada build). O tamanho dos ZIPs caiu cerca de 11,7% na Web e 7,6% em Rust/WASM. O governador v80/v292 continua usando percentil 90 para ignorar picos isolados. Suíte e paridade validadas.

**Conteúdo Web v55.0 — 5 de novembro de 2026**
- A seleção ativa de mapas foi organizada para remover títulos com dimensões, mapas de teste e protótipos.
- Apartamentos foi mantido: suas dimensões são dados internos do mapa, não parte do nome exibido.
- Referências da campanha e expansões passaram a ser verificadas contra as listas de mapas permitidos.
- Saídas de mapas Neon fora do piso caminhável passaram a ser ancoradas em uma posição livre próxima.
- A regressão automatizada registrada para essa entrega passou em **57/57**. Não houve validação visual nem medição de FPS nessa entrega.

**Prévia Rust/WASM v193.0 — 7 de novembro de 2026**
- Vidros, shimmer e estilhaços passaram ao painter Rust direto; paridade Chrome teve zero diferenças RGBA.
- Build Rust/WASM, regressões 85/85 e renderer, browser bridge e mapa/piso passaram na fonte e no ZIP extraído (155 arquivos, 86 PNGs). Migração parcial, sem benchmark nem revisão visual ampla.

**Prévia Rust/WASM v192.0 — 7 de novembro de 2026**
- Realces de inimigos, barras, mira de atirador e carga de chefe passaram ao painter Rust direto; Chrome confirmou zero diferenças RGBA.
- Build Rust/WASM, regressões 85/85, renderer, browser bridge e mapa/piso passaram na fonte e no ZIP extraído (155 arquivos, 86 PNGs). Migração parcial, sem benchmark nem revisão visual ampla.

**Prévia Rust/WASM v191.0 — 7 de novembro de 2026**
- Barris explosivos e câmeras passaram à rasterização Rust direta; comparação Chrome teve zero diferenças RGBA. Regressões 85/85.
- Build Rust/WASM, renderer, browser bridge e integração mapa/piso passaram na fonte e no ZIP extraído (155 arquivos, 86 PNGs). Migração parcial, sem benchmark nem revisão visual ampla.

**Prévia Rust/WASM v190.0 — 7 de novembro de 2026**
- Portas Neon animadas passaram ao painter Rust direto; Chrome teve zero diferenças com sprites e transforms. Regressões 85/85 e testes do renderer/bridge browser passaram.
- Build Rust, regressões 85/85 e paridade Chrome passaram; a cópia extraída do ZIP também passou. Migração parcial, sem benchmark nem revisão visual ampla.

**Prévia Rust/WASM v185.0 — 7 de novembro de 2026**
- Compositor RGBA de texturas do mapa movido ao módulo Rust direto, com saída igual ao compositor anterior e fallback mantido.
- Build Rust, regressões 85/85 e paridade Chrome passaram; a cópia extraída do ZIP também passou. Migração parcial, sem benchmark nem revisão visual ampla.

**Prévia Rust/WASM v184.0 — 7 de novembro de 2026**
- Leitura de fontes Canvas/imagem para texturas de mapa/piso movida ao WebSys/Rust nos tamanhos aceitos, com fallback mantido. Chrome confirmou bytes idênticos; regressões 85/85.
- Migração segue parcial. Não houve benchmark nem validação visual ampla.

**Prévia Rust/WASM v180.0 — 7 de novembro de 2026**
- Formas do HUD, barra de vida do chefe e seta da Invasão agora passam a rasterizar pelo painter Rust, preservando geometria e cores produzidas pela camada existente.
- Transformações/brilhos de pickups e armas arremessadas passaram ao painter Rust; o ícone existente é chamado durante a transformação, sem mudar a lógica da arma.
- O desenho da saída de fase — brilho, gradiente, hachuras e bordas — agora vai ao painter Rust direto; o gradiente cacheado continua como imagem de entrada.
- Geometria e rasterização de escadas/elevadores passaram do callback JavaScript ao painter Rust direto; os gradientes RGBA continuam preparados/cacheados como imagens.
- Gradação de cor e overlays finais de fade/flash também chamam o painter Rust direto, preservando os passes Canvas existentes.
- Projéteis, imagens HUD, textos de alarme e combo, estojos de munição, muzzle flashes, arcos de impacto, composição de escuridão/lanterna, névoa, luzes, anéis e zona de invasão também usam Rust nos casos cobertos; callback Canvas segue como fallback.
- Build Rust/WASM, testes de ABI/browser, regressões 82/82 e paridade RGBA em Chrome passaram.
- A migração segue híbrida; não houve benchmark, revisão visual ampla nem campanha completa.

**Organização do repositório — 6 de novembro de 2026**
A raiz do GitHub fica organizada com este README e as duas pastas de distribuição. Os arquivos de cada versão, incluindo código, recursos e seu ZIP, ficam dentro da pasta correspondente.

## Estrutura

- `Cappe-in-MiamiWeb/`: versão Web independente.
- `Cappe-in-MiamiRustWasm/`: prévia Rust/WASM independente, com documentação técnica e testes próprios.
