# Cappe in Miami

Jogo de ação top-down ambientado em Miami, com modo História, combates por fases, mapas temáticos, personagens selecionáveis, máscaras e outros modos de jogo.

## A história

Em 1996, Cappe trabalha consertando equipamentos de transmissão. A engenheira de rádio Iara Vale pede ajuda depois que apagões sincronizados silenciam bairros inteiros. A investigação revela o projeto Sinal de Maré, uma rede clandestina que falsifica alertas públicos e manipula a infraestrutura da cidade.

Cappe segue as frequências por lojas de componentes, um estúdio, uma academia, um hotel, uma central telefônica, uma boate, um hospital, uma garagem e uma estação. No fim, ele encontra a central subterrânea da empresa responsável e decide entre destruir o transmissor, preservar as provas ou transmitir a verdade para os moradores.

A campanha mantém os mapas e expansões existentes, mas sua narrativa, personagens, conflito e objetivos foram reescritos como uma investigação original de sabotagem de infraestrutura.

## Estrutura do repositório

- Cappe-in-MiamiWeb/ contém a edição de navegador em HTML, CSS e JavaScript, seus recursos e o ZIP para jogar.
- Cappe-in-MiamiRustWasm/ contém a crate Rust, o módulo WebAssembly compilado, a ponte JavaScript e o ZIP Rust/WASM.
- Este README reúne a história, as instruções e os downloads. Cada edição mantém seus arquivos junto às referências usadas pelo jogo.
## Escolha uma versão

Para baixar a versão mais recente, abra [Gerar pacotes para teste](https://github.com/CappeVictor/Cappe-in-Miami/actions/workflows/packages.yml), selecione a execução mais recente concluída com sucesso e, em **Artifacts**, baixe apenas `Cappe-in-MiamiWeb` ou `Cappe-in-MiamiRustWasm`. Os artefatos expiram após 14 dias e o GitHub pode exigir login. Extraia o artefato e depois o ZIP do jogo dentro dele. O artefato de checksums permite conferir a integridade dos arquivos.

Os ZIPs guardados nas pastas abaixo são versões anteriores e podem não conter as alterações mais recentes.

- **Web — HTML, CSS e JavaScript v103:** [abrir a pasta](Cappe-in-MiamiWeb/) · [baixar ZIP](Cappe-in-MiamiWeb/cappe-in-miamiWeb.zip)
- **Rust/WASM — v319:** [abrir a pasta](Cappe-in-MiamiRustWasm/) · [baixar ZIP](Cappe-in-MiamiRustWasm/cappe-in-miamiRustWasm-v319-preview.zip)

Depois de extrair o ZIP, execute o arquivo `.bat` que está na pasta extraída. A versão Web usa `INICIAR_WEB.bat`. A prévia Rust/WASM usa `INICIAR_EXPERIMENTO_WASM.bat` e requer Node.js 18 ou superior.

Ambas as versões precisam de Node.js 18 ou superior para os inicializadores fornecidos.

### Sobre a prévia Rust/WASM

A prévia v313 mantém painters Rust/WebSys diretos para as camadas amostradas de gameplay, incluindo Campanha, Horda e Invasão. O antigo trampoline Canvas deixou de ser compilado, servido e pré-cacheado. A auditoria instrumentada não encontrou chamadas Canvas do host em 23 cenas/estados amostrados. Os painters Canvas permanecem como fallback; lógica, simulação, aleatoriedade e seleção/cache de assets seguem em JavaScript. O pool de pontos de rota da IA reduz objetos temporários em um microbenchmark sintético; não há ganho de frame time medido.

## Última atualização — 10 de novembro de 2026 · Web v103 e Rust/WASM v319

Correção de bugs: os dados das fases em tiles agora carregam antes dos modos de campanha, o acabamento da arma `lanca` não duplica e cliques repetidos durante o carregamento Neon não iniciam a fase várias vezes. Regressões Rust/WASM: 118/118.

O governador de desempenho agora mede janelas menores e pode avançar do nível 1 para o nível 2 quando a primeira redução não basta. A resolução automática foi limitada a 1,25×, com reduções até 0,82× e 0,64× em máquinas lentas. No Chromium local, Web e Rust/WASM chegaram a p90 de 16,7 ms após adaptação; isso é uma medição do ambiente de teste, não uma promessa universal de FPS.

Nos níveis adaptativos, filtros CSS e suavização do Canvas são desligados para reduzir o custo de composição; a aparência normal permanece nos níveis sem redução.

A campanha agora se chama **Sinal de Maré**: Cappe investiga apagões coordenados e uma rede de transmissores usada para falsificar alertas públicos. Personagens, conflito, objetivos e final foram reescritos; a estrutura dos mapas foi preservada.

## Infraestrutura e validação — 12 de novembro de 2026

- O GitHub Actions agora executa regressões JavaScript, verificação de sintaxe, `cargo check`, validação do layout dos ZIPs e smoke test dos servidores Web/Rust/WASM.
- O servidor reduz uma resolução de caminho do sistema de arquivos por requisição estática, mantendo a mesma proteção contra traversal.
- O smoke test confirma saúde da API, carregamento do `index.html` e bloqueio de caminhos fora da raiz.
- A execução remota do CI passou após a correção de portabilidade: os testes que dependem do executável Chrome local continuam sendo executados no ambiente apropriado, enquanto o CI Linux usa regressões sem esse caminho específico.
