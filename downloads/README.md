# Downloads do Cappe-in-Miami

Os pacotes são separados e podem ser baixados individualmente:

- `cappe-in-miamiWeb.zip`: jogo para navegador com HTML, CSS e JavaScript; renderer Canvas 2D em JavaScript.
- `cappe-in-miamiRustWasm-v75-preview.zip`: prévia híbrida Rust/WebAssembly v75. A migração do renderer está em andamento; a rasterização Canvas, efeitos, parte do compositor e interface permanecem em JavaScript.

## Como executar

1. Extraia o ZIP escolhido.
2. Instale Node.js 18 ou superior.
3. Abra a pasta criada e execute o arquivo `.bat` que fica ao lado de `index.html`: `INICIAR_WEB.bat` na versão Web ou `INICIAR_EXPERIMENTO_WASM.bat` na prévia Rust/WASM.
4. Mantenha a janela do servidor aberta enquanto joga.

A prévia Rust/WASM já inclui o módulo `.wasm` compilado. Rust não precisa estar instalado para executar o pacote; ele só é necessário para recompilar o módulo.
