# Auditoria de mapas — v55.0

Atualizada em 05/11/2026 a partir das definições de `MAPAS_BASE`, `STORY` e `js/maps.js`.

## Regra ativa

- O seletor mostra apenas o título do mapa; dimensões internas continuam disponíveis para renderização e colisões.
- `MAPAS_PERMITIDOS`, `GRID_ALLOWED_MAP_IDS` e `NEON_ALLOWED_MAP_NAMES` são as allowlists explícitas; `MAP_SELECTOR_ALLOWED` combina as três com os modos Sequência e Apartamento aleatório.
- `NEON_DIMENSION_TITLE_RE` bloqueia títulos com dimensões como `640 x 580`, `640 × 580` e `640 by 580`. A regressão verifica também o exemplo `Trailer 640 x 580`.
- Mapas não são excluídos somente porque `w`, `h`, `iw` ou `ih` têm valores de pixels. `Apartamentos` (640×576 internamente) voltou à lista fixa porque seu título não contém dimensões.
- Os dados de mapas em `js/maps.js` não foram editados. Quando um objeto de carro está fora do piso caminhável, o runtime ancora a zona lógica de saída no piso livre mais próximo; tiles, objetos, spawns e geometria de origem permanecem intactos.

## Mapas fixos mantidos — 18

| ID | Título exibido |
|---|---|
| `apto` | Apartamentos |
| `academia` | Academia |
| `estudio` | Estúdio |
| `cassino` | Cassino |
| `fliperama` | Fliperama |
| `central` | Escritório Central |
| `mansao` | Mansão |
| `metro` | Estação de metrô |
| `hotel` | Hotel Coral |
| `phonehom` | Central Telefônica |
| `boate` | Boate Mar Vermelho |
| `delegacia` | Delegacia |
| `garagem` | Garagem |
| `loja` | Loja de conveniência |
| `hospital` | Hospital abandonado |
| `boate-b` | Boate |
| `estacao` | Estação de trem |
| `oficina` | Oficina |

Todos os 18 têm entrada explícita na allowlist. `apto` não é mais descartado pelo tamanho interno. A ordem de seleção original dos outros mapas foi preservada.

## Mapas em grade mantidos — 2

`metro` (The Metro) e `overdose` (Overdose) permanecem na seleção por terem títulos próprios e dados completos. A sequência da campanha não os referencia; são opções independentes do modo livre.

## Mapas Neon mantidos — 61

Todos têm inimigos, estão na allowlist, não são classificados como teste/protótipo e são carregados com título sem dimensões:

`rmApartment1Upstairs`, `rmApartment2Entrance`, `rmApartment2Upstairs`, `rmArcadeDownstairs`, `rmArcadeUpstairs`, `rmBar3`, `rmBossClubFloor1`, `rmBossClubFloor2`, `rmBossClubFloor3`, `rmBuildingFloor1`, `rmBuildingFloor2`, `rmBuildingFloor3`, `rmBuildingFloor4`, `rmEurogamer`, `rmHighballer`, `rmHospitalEntrance`, `rmHospitalTopFloor`, `rmHotelEntrance`, `rmHotelSuite`, `rmHouse2Downstairs`, `rmHouse2Upstairs`, `rmHouse3Basement`, `rmHouse3Downstairs`, `rmHouse3Upstairs`, `rmHouse4Left`, `rmHouse4Middle`, `rmHouse4Right`, `rmHouse4Upstairs`, `rmHouse5Downstairs`, `rmHouse5Upstairs`, `rmMansionEntrance`, `rmMansionMainHall`, `rmNew10`, `rmNew11`, `rmNew12`, `rmNew13`, `rmNew14`, `rmNew15`, `rmNew2`, `rmNew4`, `rmNew5`, `rmNew6`, `rmNew7`, `rmNew8`, `rmNew9`, `rmNoodleShop`, `rmOfficeEntrance`, `rmOfficeFloor2`, `rmOfficeFloor3`, `rmOldHotel`, `rmPizzaHut3`, `rmPoliceHQFloor1`, `rmPoliceHQFloor3`, `rmSequence12b`, `rmStore3`, `rmSwatDownstairs`, `rmSwatUpstairs`, `rmTrainstationDownstairs`, `rmTrainstationEntrance`, `rmTutorial`, `rmVideoStore3`.

## Removidos da experiência ativa

- `rmTrailer`, independentemente das dimensões internas. O seletor não exibe o título com pixels e a campanha não pode carregar o Trailer.
- `rmTestLevel1` a `rmTestLevel10` e `rmTestRoom` (salas de teste).
- `rmHouse1Downstairs` e `rmHouse1Upstairs` (protótipos já classificados como tal na auditoria anterior).
- `rmSequence12c` (sala de sequência/protótipo; não tinha inimigos e não era uma fase selecionável).
- Nenhum mapa fixo foi excluído nesta atualização. `Apartamentos` foi restaurado; os dados de todas as fases fixas foram preservados.

## Ordem narrativa da campanha

Os capítulos base seguem a numeração já escrita. Fases sem número não foram criadas para preencher lacunas:

1. Prelúdio — Estação de metrô (`metro`)
2. Capítulo 2 — Loja (`loja`)
3. Capítulo 3 — Estúdio (`estudio`)
4. Capítulo 4 — Academia (`academia`)
5. Capítulo 6 — Hotel (`hotel`)
6. Capítulo 7 — Central Telefônica (`phonehom`)
7. Capítulo 8 — Boate Mar Vermelho (`boate`)
8. Capítulo 9 — Hospital abandonado (`hospital`)
9. Capítulo 10 — Garagem (`garagem`)
10. Capítulo 11 — Estação de trem (`estacao`)
11. Capítulo 13 — Delegacia (`delegacia`)
12. Capítulo 14 — Mansão (`mansao`)
13. Capítulo 16 — Fliperama (`fliperama`)
14. Capítulo 19 — Resolução (`central`)

Depois vêm, na ordem existente, as 12 expansões: Hospital · entrada (`rmHospitalEntrance`), Hospital · andar superior (`rmHospitalTopFloor`), Suíte do hotel (`rmHotelSuite`), Mansão · salão principal (`rmMansionMainHall`), Delegacia · térreo (`rmPoliceHQFloor1`), Delegacia · 3º andar (`rmPoliceHQFloor3`), Clube · pista (`rmBossClubFloor1`), Clube · cobertura (`rmBossClubFloor3`), Unidade tática · térreo (`rmSwatDownstairs`), Estação de trem (`rmTrainstationEntrance`), Fliperama (`rmEurogamer`) e Restaurante (`rmNoodleShop`). Todas as referências pertencem à allowlist.

**Dúvida preservada:** o texto não contém os capítulos 5, 12, 15, 17 e 18. Além disso, as datas dos capítulos 16 e 19 (16 e 24 de maio) antecedem as datas dos capítulos 7 e 8 (23 e 27 de maio), apesar da numeração posterior. A campanha usa a numeração explícita e não altera os acontecimentos; a ordenação puramente cronológica não fica determinada pelo material existente. Mapas fixos sem capítulo permanecem na ordem de seleção original.

## Validação

`node tests/regression.cjs`: **57/57 PASS**. A suíte verifica as allowlists, títulos dimensionados, Trailer, mapas de teste/protótipos, referências da campanha, ordem, spawns, colisões, inimigos, armas e saídas. As verificações de runtime montam os 18 mapas fixos, 2 em grade e 61 mapas Neon permitidos e comparam os dados de tiles/objetos Neon antes e depois.

Não houve validação visual em navegador nem medição de desempenho nesta atualização.
