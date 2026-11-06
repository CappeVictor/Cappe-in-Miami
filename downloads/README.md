# Downloads do Cappe-in-Miami

As versões atuais estão distribuídas em pacotes separados:

- `cappe-in-miamiWeb.zip` — Web v76.0, HTML/CSS/JavaScript com renderer Canvas 2D em JavaScript.
- `cappe-in-miamiRustWasm-v76-preview.zip` — preview híbrido Rust/WebAssembly v76. A migração do renderer está em andamento; rasterização Canvas, efeitos, parte do compositor e interface permanecem em JavaScript.
- `cappe-in-miamiRustWasm-v75-preview.zip` — preview anterior, mantido como arquivo.

## Como executar

1. Extraia o ZIP escolhido.
2. Instale Node.js 18 ou superior.
3. Abra a pasta criada e execute o arquivo `.bat` ao lado de `index.html`: `INICIAR_WEB.bat` para Web ou `INICIAR_EXPERIMENTO_WASM.bat` para Rust/WASM.
4. Mantenha a janela do servidor aberta enquanto joga.

O ZIP Rust/WASM inclui o módulo `.wasm` compilado; Rust só é necessário para recompilar. A regressão v76 passou em 61/61 e os testes ABI/bridge passaram. Smoke visual Neon não foi validado neste ambiente.
