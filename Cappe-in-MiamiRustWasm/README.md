# Cappe-in-Miami — Rust/WASM v313

## Acabamento visual das armas

Os ícones ganharam ranhuras metálicas, parafusos, veios de madeira, linhas de mira e reflexos. O painter Canvas da Web e o painter Rust/WebSys do WASM usam a mesma composição e posições.

## Estrutura desta edição

- wasm-renderer-direct/src/lib.rs contém o renderer Rust.
- wasm-renderer/pkg/direct/ contém o glue JavaScript e o módulo WebAssembly compilado.
- js/wasm-renderer.js integra o renderer com o jogo.
- js/ reúne os sistemas de gameplay que ainda executam em JavaScript.
- cappe-in-miamiRustWasm-v313-preview.zip é o pacote para jogar.

Para jogar, execute INICIAR_EXPERIMENTO_WASM.bat com Node.js 18 ou superior.
