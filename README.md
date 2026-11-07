# Cappe in Miami

Jogo de ação top-down ambientado em Miami, com modo História, combates por fases, mapas temáticos, personagens selecionáveis, máscaras e outros modos de jogo.

## A história

Madame Piranha, dona do Mercado Escuro, contrata Cappe para recuperar um carregamento de ouro desaparecido no porto de Biscayne, em 3 de abril de 1989. A primeira pista é um bilhete deixado junto à caixa vazia. A investigação passa por lojas de Coconut Grove, um estúdio de cinema, uma academia, o Hotel Coral, uma central telefônica, a Boate Mar Vermelho, um hospital, uma garagem, uma estação e outros locais de Miami.

As pistas revelam uma rede de contrabando ligada ao ouro e a pessoas influentes. A busca leva Cappe à mansão do responsável pelo esquema e, depois, à central subterrânea. No desfecho, dois homens envolvidos dizem fazer parte de um grupo que quer derrubar o governo da cidade; Cappe decide se os poupa ou os entrega antes de deixar Miami.

A campanha segue os capítulos e mapas que já existem no jogo, incluindo as expansões do hospital e do hotel. O código registra uma divergência entre as datas e a numeração dos capítulos 16 e 19; a ordem segue a numeração, sem criar fases para os capítulos ausentes.

## Escolha uma versão

Baixe o ZIP da versão que deseja jogar. Não é necessário baixar as duas.

- **Web — HTML, CSS e JavaScript:** [abrir a pasta](Cappe-in-MiamiWeb/) · [baixar ZIP](Cappe-in-MiamiWeb/cappe-in-miamiWeb.zip)
- **Rust/WASM — prévia híbrida v171:** [abrir a pasta](Cappe-in-MiamiRustWasm/) · [baixar ZIP](Cappe-in-MiamiRustWasm/cappe-in-miamiRustWasm-v171-preview.zip)

Depois de extrair o ZIP, execute o arquivo `.bat` que está na pasta extraída. A versão Web usa `INICIAR_WEB.bat`. A prévia Rust/WASM usa `INICIAR_EXPERIMENTO_WASM.bat` e requer Node.js 18 ou superior.

### Sobre a prévia Rust/WASM

A prévia v171 amplia as camadas gráficas que chamam diretamente o módulo Rust/WebAssembly, incluindo estojos, composição de escuridão/lanterna, muzzle flashes e arcos de impacto, além de piso, paredes, móveis, portas, jogadores e inimigos. Ela ainda é híbrida: lógica e estado continuam em JavaScript, algumas imagens são preparadas no host, e outros callbacks Canvas permanecem em migração. A paridade automatizada passou nos casos cobertos; não é ainda uma conversão integral do motor gráfico e não há ganho de desempenho medido.

## Últimas melhorias incluídas

**Versão Web v55.0 — 5 de novembro de 2026**
- A seleção ativa de mapas foi organizada para remover títulos com dimensões, mapas de teste e protótipos.
- Apartamentos foi mantido: suas dimensões são dados internos do mapa, não parte do nome exibido.
- Referências da campanha e expansões passaram a ser verificadas contra as listas de mapas permitidos.
- Saídas de mapas Neon fora do piso caminhável passaram a ser ancoradas em uma posição livre próxima.
- A regressão automatizada registrada para essa entrega passou em **57/57**. Não houve validação visual nem medição de FPS nessa entrega.

**Prévia Rust/WASM v171.0 — 7 de novembro de 2026**
- Estojos de munição, muzzle flashes, arcos de impacto, composição de escuridão/lanterna, névoa, luzes, anéis e zona de invasão agora chamam o painter Rust direto nos casos cobertos; callback Canvas segue como fallback.
- Build Rust/WASM, testes de ABI/browser, regressões 82/82 e paridade RGBA em Chrome passaram.
- A migração segue híbrida; não houve benchmark, revisão visual ampla nem campanha completa.

**Organização do repositório — 6 de novembro de 2026**
A raiz do GitHub fica organizada com este README e as duas pastas de distribuição. Os arquivos de cada versão, incluindo código, recursos e seu ZIP, ficam dentro da pasta correspondente.

## Estrutura

- `Cappe-in-MiamiWeb/`: versão Web independente.
- `Cappe-in-MiamiRustWasm/`: prévia Rust/WASM independente, com documentação técnica e testes próprios.
