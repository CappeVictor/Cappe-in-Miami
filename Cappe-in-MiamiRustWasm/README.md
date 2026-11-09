# Cappe-in-Miami — preview Rust/WASM v312.0

## Otimização v312 — buffers de vidro e vetor de movimento reutilizados

O caminho Rust/WASM reutiliza buffers tipados para os painéis de vidro e estilhaços na pausa. O input do jogador também reutiliza o vetor de direção e o zera ao morrer. As regressões verificam identidade, valores e integração sem alterar o desenho. Não foi medido ganho de FPS nesta versão.

## Pacote de jogo v312

O ZIP inclui HTML, recursos, scripts, servidor Node e renderer Rust/WASM compilado necessários para jogar. Fontes de compilação, relatórios e testes ficam fora do pacote. Execute INICIAR_EXPERIMENTO_WASM.bat; Node.js 18 ou superior é necessário.
