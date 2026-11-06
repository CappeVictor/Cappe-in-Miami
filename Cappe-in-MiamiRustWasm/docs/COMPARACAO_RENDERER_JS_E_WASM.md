# Comparação do renderer JavaScript e do preview Rust/WASM

## Visão geral

O ZIP entrega uma cópia local do jogo em HTML/JavaScript com um caminho opcional de renderer Rust compilado para WebAssembly. O renderer original continua disponível sem alterações de modo: abra normalmente para JavaScript ou use `?renderer=wasm` para ativar o preview híbrido. A lógica de gameplay permanece em JavaScript nos dois caminhos.

O preview atual não converteu o renderer inteiro. Ele transfere para Rust a geração de algumas geometrias e decisões visuais; JavaScript prepara os dados, aplica comandos ao Canvas e ainda desenha muitas camadas. O navegador continua rasterizando o Canvas 2D.

## Comparação por subsistema

| Subsistema | Renderer HTML/JavaScript original | Preview Rust/WASM | Estado |
|---|---|---|---|
| Inicialização e seleção de modo | O HTML inicia o jogo e usa Canvas 2D. | O HTML inicia igual; `?renderer=wasm` carrega `renderer.wasm`. Sem esse parâmetro usa o caminho original. | Mantido e opcional |
| ABI e chamadas Canvas | O código JavaScript chama métodos e setters do Canvas. | A ponte encaminha métodos/setters elegíveis pelo ABI WASM e o host JavaScript chama o método original do navegador. Isso não significa que cada operação Canvas foi reimplementada em Rust. | Encaminhamento misto |
| Estado, input e regras do jogo | JavaScript controla menus, input, combate, inimigos, campanha, save e multiplayer. | Continuam em JavaScript. | Sem conversão |
| Compositor `paintMap` | JavaScript prepara canvas, dimensões, camadas, decor e ordem de pintura. | Continua em JavaScript; chama os painters WASM para algumas camadas. | JavaScript |
| Pisos | JavaScript cria carpetes, azulejos e tijolos; `buildFloor` gera granulado, sombras de sólidos, rejunte e seleciona salas para `FTILES`. | Rust gera padrões, granulado e acabamento em lotes, retorna o RNG determinístico e seleciona salas/offset do overlay `FTILES`; o host cria o padrão e aplica clipping/fills ao Canvas. Fallback JS permanece. | Seleção/ordem portada; rasterização no host |
| Texturas de paredes/móveis e aberturas de portas | JavaScript escolhe `WALLT`/`FURNT`, calcula retângulos repetidos, recortes e decalques de imagem. | Rust seleciona e ordena 135 comandos no smoke de Apartamento, incluindo geometria e orientação; o host carrega imagens, cria padrões e rasteriza recortes/decalques no Canvas. | Seleção/ordem portada; assets e rasterização no host |
| Detalhes estáticos de sala e piso | JavaScript traça contornos, linhas e manchas ao montar o mapa. | Rust gera os comandos determinísticos equivalentes; JavaScript submete as primitivas ao Canvas. | Portado |
| Fundo e decor estáticos | JavaScript pinta base dos mapas fixos, overlay e elementos de decoração/tapetes. | Rust gera fundo fixo, overlay e geometrias coloridas de decor; o host aplica o Canvas e recebe as cores do mapa. | Geometria portada; rasterização no host |
| Sombras, paredes e postes | JavaScript desenha sombras e faces geométricas. | Rust gera as primitivas e o host executa os comandos Canvas. | Portado |
| Móveis | JavaScript contém `drawF` para a arte dos móveis. | Rust gera os comandos geométricos dos 17 tipos; JavaScript submete o lote ao Canvas. | Portado |
| Ícones de armas | JavaScript usa `wicon`. | Rust gera os comandos de ícone; JavaScript os aplica ao Canvas. | Portado |
| Portas | JavaScript desenha portas comuns e as Neon com sprites. | Rust calcula geometria/transforms das portas comuns; desde v76 também combina ângulos e ordena handles/offsets dos sprites Neon. O host resolve imagens e rasteriza, e gameplay/animação ficam em JS. | Parcial |
| Vidros quebráveis | JavaScript atualiza timers e desenha os painéis intactos e os estilhaços. | Rust recebe geometria/alpha e emite os comandos; o host rasteriza Canvas. Timers, quebra e colisões seguem em JS. | Geometria visual portada |
| Sombra, aura e corpo do jogador | JavaScript monta a transformação, sombra/halo, arma, sprite, acentos cosméticos e tag para P1/P2/avatar remoto. | Rust gera um lote completo de comandos para até três jogadores, inclusive arma, transformação, sombra/aura, recorte de spritesheet ou frame fallback, acentos de skin e tag; host entrega handles e executa o Canvas após o retorno WASM. | Composição portada; rasterização via host |
| Estado de animação | JavaScript atualiza o movimento visual e temporizadores dos jogadores. | Mantidos em JS para preservar comportamento; Rust recebe estado/ângulo/tempo e escolhe a célula visual dentro do lote. | Gameplay mantido em JS |
| Inimigos | JavaScript filtra visibilidade, decide ordem/estados e desenha corpos, sombra, stun e rótulos. | Rust filtra/ordena eventos, gera corpo/sombra/orbes e comanda tipo/posição dos rótulos no range; o host usa `tx()` cacheado para rasterizar as letras. | Decisão e ordem dos rótulos em Rust; texto rasterizado no host |
| Spritesheets e assets | JavaScript carrega, corta, anima e desenha imagens PNG. | Rust escolhe o recorte dos spritesheets de jogador/inimigo; JavaScript carrega assets, avança os temporizadores e submete o recorte ao Canvas. | Parcial |
| Sombras dos inimigos, partículas, sangue, projéteis, brilho, telas e efeitos | JavaScript desenha durante o frame. | O corpo geométrico e a sombra dos inimigos são gerados em Rust e executados pelo host Canvas; partículas, sangue, projéteis, brilho e demais efeitos continuam em JavaScript. | Corpo/sombra portados; demais camadas JS |
| HUD, menus e textos | JavaScript compõe interface e texto. | Continuam em JavaScript. | Sem conversão |
| Rasterização final | Canvas 2D do navegador. | Canvas 2D do navegador. | Igual |

## Compatibilidade e diferença prática

O modo padrão continua executando a versão HTML/JavaScript sem depender do módulo WASM. No preview v75, testes verificam comandos, cores, semente, estado e ordem dos subsistemas portados; uma captura de jogo foi inspecionada isoladamente. Não houve comparação lado a lado nem paridade de todas as telas.

As chamadas Canvas continuam sendo executadas pelo navegador por meio da ponte JavaScript. O trabalho WASM reduz parte dos loops e da geração de primitivas em JavaScript, mas também acrescenta marshaling e chamadas de ponte. Não foi medido FPS, consumo de CPU, memória ou tempo de inicialização; portanto, não há evidência de que a build WASM rode mais leve ou mais rápida.

## O que falta para conversão integral

- Mover para Rust a composição por frame e remover o desenho principal equivalente de `draw()`/`paintMap` do caminho JavaScript.
- Converter o compositor principal, rótulos de inimigos, efeitos, projéteis, partículas, cenas, HUD e hooks Canvas das expansões, preservando assets e estado existente. Menus HTML/CSS continuam fora do renderer Canvas.
- Fechar um limite de dados estável entre gameplay e renderer e validar paridade visual de todas as fases e estados.
- Medir desempenho do caminho original e do WASM no mesmo hardware e nas mesmas cenas.

Logo, o arquivo entregue deve ser entendido como experimento híbrido local, e não como conversão integral nem como release de desempenho.
