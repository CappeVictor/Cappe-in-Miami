# Cappe in Miami Web — v96.0

## Otimização v96 — vetor de movimento reutilizado

A entrada do jogador reutiliza um único vetor para a direção e o zera ao detectar morte. Isso elimina a criação de pequenos arrays temporários por leitura de movimento. A regressão confirma WASD, identidade reutilizada e valores zero após a morte. Não foi medido ganho de FPS nesta versão.

## Pacote de jogo v96

O ZIP contém apenas os arquivos necessários para executar o jogo. Use INICIAR_WEB.bat; Node.js 18 ou superior é necessário.
