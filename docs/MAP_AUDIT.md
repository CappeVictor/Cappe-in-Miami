# Auditoria de mapas — v51

Gerada em 05/11/2026. O jogo mantém mapas que não têm o padrão equivalente a 640×580; a tolerância é largura ±4 e altura ±8.

## Mapas fixos mantidos

| ID | Dimensão original | Escala | Portas | Salas | Spawn | Saída |
|---|---:|---:|---:|---:|---:|---:|
| academia | 706×720 | 1.5 | 11 | 10 | 340, 590 | 380, 60 |
| estudio | 2086×1412 | 0.95 | 21 | 15 | 100, 640 | 1850, 1090 |
| cassino | 940×720 | 1.4 | 28 | 19 | 467, 680 | 100, 100 |
| fliperama | 841×880 | 1.3 | 7 | 7 | 410, 760 | 455, 60 |
| central | 840×720 | 1.4 | 9 | 10 | 418, 300 | 770, 100 |
| mansao | 654×720 | 1.5 | 12 | 13 | 500, 690 | 330, 105 |
| metro | 640×480 | 1.5 | 10 | 6 | 330, 240 | 540, 75 |
| hotel | 700×560 | 1.3 | 8 | 5 | 350, 500 | 600, 470 |
| phonehom | 600×480 | 1.4 | 5 | 4 | 400, 430 | 100, 370 |
| boate | 760×600 | 1.2 | 6 | 4 | 200, 500 | 660, 520 |
| delegacia | 700×600 | 1.3 | 6 | 5 | 600, 480 | 70, 380 |
| garagem | 640×480 | 1.4 | 6 | 4 | 480, 400 | 560, 80 |
| loja | 700×500 | 1.3 | 6 | 4 | 350, 400 | 600, 120 |
| hospital | 720×520 | 1.35 | 7 | 5 | 360, 420 | 560, 120 |
| boate-b | 680×500 | 1.3 | 6 | 4 | 400, 380 | 580, 120 |
| estacao | 760×500 | 1.35 | 7 | 5 | 380, 400 | 600, 120 |
| oficina | 660×480 | 1.3 | 6 | 4 | 330, 380 | 560, 110 |

- Mapas fixos originais: **18**.
- Mapas fixos mantidos: **17**.
- Mapa fixo excluído: **apto**.

## Mapas Neon

- Salas no pacote: **159**.
- Salas com inimigos antes do filtro: **74**.
- Salas jogáveis mantidas: **72**.
- Salas excluídas por dimensão equivalente a 640×580: **2**.

### Excluídas

- rmHouse1Downstairs: 640×576
- rmHouse1Upstairs: 640×576

### Validação

Os mapas mantidos passam pelo ajuste de spawn dentro do perímetro e pela construção de paredes externas em buildNeonFloor. A conectividade completa de objetivos dinâmicos depende de partida em navegador.
