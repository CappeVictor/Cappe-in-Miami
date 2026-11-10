# Cappe in Miami

Jogo de ação top-down ambientado em Miami, com modo História, combates por fases, mapas temáticos, personagens selecionáveis, máscaras e outros modos de jogo.

## A história

Madame Piranha, dona do Mercado Escuro, contrata Cappe para recuperar um carregamento de ouro desaparecido no porto de Biscayne, em 3 de abril de 1989. A primeira pista é um bilhete deixado junto à caixa vazia. A investigação passa por lojas de Coconut Grove, um estúdio de cinema, uma academia, o Hotel Coral, uma central telefônica, a Boate Mar Vermelho, um hospital, uma garagem, uma estação e outros locais de Miami.

As pistas revelam uma rede de contrabando ligada ao ouro e a pessoas influentes. A busca leva Cappe à mansão do responsável pelo esquema e, depois, à central subterrânea. No desfecho, dois homens envolvidos dizem fazer parte de um grupo que quer derrubar o governo da cidade; Cappe decide se os poupa ou os entrega antes de deixar Miami.

A campanha segue os capítulos e mapas que já existem no jogo, incluindo as expansões do hospital e do hotel. O código registra uma divergência entre as datas e a numeração dos capítulos 16 e 19; a ordem segue a numeração, sem criar fases para os capítulos ausentes.

## Estrutura do repositório

- Cappe-in-MiamiWeb/ contém a edição de navegador em HTML, CSS e JavaScript, seus recursos e o ZIP para jogar.
- Cappe-in-MiamiRustWasm/ contém a crate Rust, o módulo WebAssembly compilado, a ponte JavaScript e o ZIP Rust/WASM.
- Este README reúne a história, as instruções e os downloads. Cada edição mantém seus arquivos junto às referências usadas pelo jogo.
## Escolha uma versão

Baixe o ZIP da versão que deseja jogar. Não é necessário baixar as duas.

- **Web — HTML, CSS e JavaScript v102:** [abrir a pasta](Cappe-in-MiamiWeb/) · [baixar ZIP](Cappe-in-MiamiWeb/cappe-in-miamiWeb.zip)
- **Rust/WASM — v318:** [abrir a pasta](Cappe-in-MiamiRustWasm/) · [baixar ZIP](Cappe-in-MiamiRustWasm/cappe-in-miamiRustWasm-v318-preview.zip)

Depois de extrair o ZIP, execute o arquivo `.bat` que está na pasta extraída. A versão Web usa `INICIAR_WEB.bat`. A prévia Rust/WASM usa `INICIAR_EXPERIMENTO_WASM.bat` e requer Node.js 18 ou superior.

### Sobre a prévia Rust/WASM

A prévia v313 mantém painters Rust/WebSys diretos para as camadas amostradas de gameplay, incluindo Campanha, Horda e Invasão. O antigo trampoline Canvas deixou de ser compilado, servido e pré-cacheado. A auditoria instrumentada não encontrou chamadas Canvas do host em 23 cenas/estados amostrados. Os painters Canvas permanecem como fallback; lógica, simulação, aleatoriedade e seleção/cache de assets seguem em JavaScript. O pool de pontos de rota da IA reduz objetos temporários em um microbenchmark sintético; não há ganho de frame time medido.

## Última atualização — 10 de novembro de 2026 · Web v102 e Rust/WASM v318

Correção de bugs: os dados das fases em tiles agora carregam antes dos modos de campanha, o acabamento da arma `lanca` não duplica e cliques repetidos durante o carregamento Neon não iniciam a fase várias vezes. Regressões Rust/WASM: 118/118.

O governador de desempenho agora mede janelas menores e pode avançar do nível 1 para o nível 2 quando a primeira redução não basta. A resolução automática foi limitada a 1,25×, com reduções até 0,82× e 0,64× em máquinas lentas. No Chromium local, Web e Rust/WASM chegaram a p90 de 16,7 ms após adaptação; isso é uma medição do ambiente de teste, não uma promessa universal de FPS.

Nos níveis adaptativos, filtros CSS e suavização do Canvas são desligados para reduzir o custo de composição; a aparência normal permanece nos níveis sem redução.
