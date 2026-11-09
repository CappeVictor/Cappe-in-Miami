# Cappe-in-Miami — preview Rust/WASM v304.0

## Verificação cruzada de colisões

A suíte agora compara `hitWall` e `hitWallNG` com uma referência geométrica em 6.010 posições por função nas builds Web e Rust/WASM, incluindo tangência e vidro. Resultado: 113/113. O pré-filtro retangular foi mantido somente na Web, onde os pares Chrome mostraram melhora; nas medições da Rust/WASM não houve ganho consistente nos tempos de quadro, então o runtime desta versão permaneceu inalterado.

## Otimização v304 — seleção de alvo da IA sem ordenação

`activeTarget` compara as distâncias quadráticas até P1 e P2 diretamente, sem criar uma lista temporária nem ordená-la; empates continuam favorecendo P1. Em 120 mil chamadas sintéticas, a mediana caiu de 48,6 para 26,2 ms (−46%). Em três pares Chrome com 120 inimigos e 500 faíscas, p90 mediano de update+draw caiu de 2,9 para 2,6 ms e p95 de 3,2 para 3,1 ms. Resultado específico do cenário e desta máquina; não representa FPS universal. Suíte compartilhada: 112/112.

## Otimização v303 — vizinhos de navegação pré-calculados

O BFS da IA reutiliza uma tabela compacta de vizinhos caminháveis construída junto com a grade de navegação. A ordem de exploração, os bloqueios diagonais e a rota resultante foram preservados; a regressão compara 700 rotas determinísticas com a implementação anterior. No perfil de CPU local, `EXP.navPath` acumulou 52 ms nesta versão, contra 352 ms na referência (uma captura por build). A tabela usa cerca de 17 bytes por célula e acrescenta alguns milissegundos à montagem da grade. O ensaio com 120 inimigos teve grande variação entre rodadas, portanto não há afirmação de ganho geral de FPS. Suíte: 111/111.

## Otimização v302 — carregamento adiado dos mapas Neon

`js/maps.js` só é requisitado quando a campanha chega à primeira fase Neon ou quando o jogador escolhe um mapa Neon. A lista de 61 mapas permanece disponível no seletor; depois do primeiro uso, o service worker pode guardar os dados para jogar offline. No Chrome local, a abertura inicial transferiu 301.534 bytes a menos e decodificou 1.616.616 bytes a menos. O teste no navegador percorreu a transição da campanha e iniciou `rmHospitalEntrance` em uma única requisição. Suíte: 110/110. O carregamento do módulo WASM continua fazendo parte da inicialização da versão Rust; esta alteração adia somente os dados Neon. Não houve medição de FPS nem revisão visual ampla.

## Otimização v301 — camada de sangue sem cópia temporária

Ao acrescentar marcas de sangue à camada persistente, Rust/WASM agora recebe a lista original e o índice das partículas novas. Isso elimina a cópia intermediária criada com `slice()`; a ponte ainda reutiliza o buffer numérico e processa apenas as marcas recém-adicionadas. O fallback Canvas percorre a mesma faixa. A paridade no Chrome confirmou zero canais de pixel diferentes e que a lista não é alterada. Suíte de regressão: 110/110. Não foi medido ganho de FPS para esta alteração.

## Otimização v300 — grade de colisão da IA

As consultas de colisão da navegação da IA agora visitam as caixas armazenadas nas células espaciais tocadas pelo raio, sem expandir cada sólido e sem deduplicar referências em cada consulta. O teste exato círculo-retângulo e a geometria dos sólidos permanecem iguais. Regressões com 15.000 posições aleatórias contra busca linear passaram; suíte 110/110. Em três rodadas Chrome com 120 inimigos e 500 faíscas, p90 mediano de update+draw caiu de 2,8 para 2,7 ms; a mediana dos p95 permaneceu em 3,3 ms. A melhora é pequena e específica deste PC/cenário, não garantia de FPS.

## Otimização v299 — carregamento sob demanda de máscaras

As 14 imagens cosméticas de máscara deixaram de fazer parte do carregamento inicial e do pré-cache. Elas carregam quando o seletor é aberto ou a máscara é usada; após o primeiro uso, o service worker as mantém no cache offline. No Chrome local, a transferência inicial caiu 325.250 bytes (de 1.140.378 para 815.128; 28,5%). Ao abrir/usar o seletor, as 14 imagens são solicitadas. Regressões: 109/109; teste de compressão passou. Esta medição é de transferência inicial, não de FPS.

## Otimização v298

A navegação da IA agora consulta uma grade espacial dos sólidos próximos ao testar colisões em raios e células de caminho, sem alterar tiles, colisões ou geometria. O índice é reconstruído quando os sólidos do mapa mudam, inclusive quando o vidro quebra. Uma regressão determinística comparou 3.000 posições com a busca linear e confirmou os mesmos resultados.

Em três rodadas locais no Chrome, com 120 inimigos e 500 faíscas, a mediana do p90 de update+draw caiu de 3,6 ms na v297 para 3,2 ms; p95 caiu de 4,5 para 3,8 ms. A média subiu levemente de 2,385 para 2,502 ms neste teste, portanto o resultado não prova ganho geral de desempenho; a medição precisa continuar. Os resultados variam entre mapas e computadores. Regressões: 108/108.

## Otimização v295

O servidor comprime HTML, JavaScript, CSS, JSON e SVG com gzip quando o navegador aceita; WASM e outros binários seguem sem recompressão. No Chrome local, `js/maps.js` transferiu 301.534 bytes para 1.616.616 bytes decodificados (81,4% menos no corpo). A transferência total observada no carregamento inicial passou de 2.831.083 para 1.136.765 bytes. Resultados locais, sem garantia de latência noutros ambientes.

Teste a compressão com `node tests/compression-regression.cjs`; a regressão principal também a executa.

## Otimização v296

Faíscas agora copiam os dados do TypedArray para um buffer Rust reutilizado, classificam cada partícula uma vez e reaproveitam seis grupos de opacidade por cor. O código não cria mais um segundo TypedArray de comandos a cada quadro nem lê cada elemento do TypedArray de origem repetidamente pela ponte JavaScript/WASM. O fallback Web também agrupa as faíscas em uma passagem.

A regressão Chrome compara 506 faíscas no painter Rust e no Canvas: zero canais de pixel diferentes, com contagem e estado do contexto preservados. A suíte principal passou em 107/107. No GitHub Actions, três amostras com 120 inimigos e 500 faíscas mediram p90 de update+draw de 5,5 ms para 5,8 ms no Rust/WASM, uma pequena regressão neste cenário. A versão Web, no mesmo runner Ubuntu/Chrome, caiu de 5,1 para 4,3 ms. Build, paridade de pixels das 506 faíscas e 107/107 regressões passaram. O agrupamento reduz cópias e alocações na ponte, mas o perfil de tempo não mostra ganho no Rust neste teste; a otimização dessa rota deve continuar. Medições do runner não garantem FPS em outros PCs.

## Otimização v297

O agrupamento de faíscas já feito para o fallback Canvas agora preenche ao mesmo tempo o buffer reutilizável enviado ao WASM. O bridge deixa de percorrer de novo até 500 objetos JavaScript e deixa de procurar a cor de cada faísca na paleta. Se o painter direto não estiver ativo, a rota Canvas original segue disponível.

No Chrome local, três pares de execuções com 120 inimigos e 500 faíscas compararam v296 e v297: p90 mediano de update+draw caiu de 5,0 para 4,4 ms, p95 de 5,7 para 5,0 ms e média de 3,109 para 2,595 ms. É um cenário de estresse nesta máquina, não uma garantia de FPS em outros computadores. A paridade Chrome confirmou os mesmos 466 comandos e zero canais de pixel diferentes para os caminhos direto e com buffer já preparado; a suíte passou em 107/107. Não houve revisão visual manual ampla.

## Experimento local Rust/WASM

Esta versão requer Node.js 18+ para INICIAR_EXPERIMENTO_WASM.bat. O módulo Rust/WebSys direto é a única implementação WASM compilada, carregada e armazenada pelo jogo; paredes da Campanha e mapas de até 1600 × 1200 px usam os painters diretos. O governador v292 decide a redução adaptativa pelo percentil 90 dos primeiros 120 quadros aceitos, respeita o limite de FPS e ignora picos esporádicos. Regressões: 106/106; ABI: 114 exports/107 imports; bridge e paridade de desenho Chrome passaram. Em combate sintético com 48 inimigos no Chrome, update+draw ficou em p90 1,5 ms antes e 1,6 ms depois da adaptação; é uma amostra local, não um benchmark controlado nem garantia de FPS em outros PCs.

O bundle `js/maps.js` mantém somente os 61 mapas permitidos; 98 mapas inativos e de teste saíram do arquivo. O tamanho caiu 44,8%, de 2.929.052 para 1.616.608 bytes; o ZIP caiu cerca de 7,6% (aprox. 1.581 KB para 1.462 KB). Tiles, objetos e dimensões dos mapas ativos foram comparados e permanecem idênticos à Web.

Para medir as duas versões no Chrome instalado: `node tests/browser-performance.cjs`. Para perfil de CPU: `node tests/browser-performance.cjs --profile` (requer Node.js 22+).

A IA reutiliza pontos de rotas BFS entre recálculos para reduzir objetos temporários. Em microbenchmark sintético, 500 recálculos repetidos criaram 35.000 objetos de ponto sem pool e 0 após aquecimento com pool; mediana aproximada de 0,04 ms em ambos. Isso mede alocação no gerador de rotas, não heap total ou tempo de quadro. O teste de regressão confere paridade e reuso depois de rotas curtas e longas.

Abra `index.html` no navegador (ou use o Live Server do VS Code se o navegador bloquear algum recurso local).

Na tela de escolha de máscara, selecione uma skin cosmética. Ela altera apenas as cores do traje e é salva em `settings.skin`, preservando saves v2 e os atributos dos personagens. As armas receberam contorno, brilhos e detalhes de material; no cooperativo local, P2 também exibe a arma compartilhada.

## Base de conteúdo: mapas/campanha v55.0 — 05/11/2026

- Seletor Neon agora exibe títulos sem dimensões; allowlists removem Trailer, mapas de teste e protótipos.
- Apartamentos voltou à lista fixa porque 640×576 é dado interno, não parte do título.
- Campanha base segue a numeração existente; referências e expansões são validadas contra as allowlists.
- Zonas de saída Neon fora do piso caminhável são ancoradas no ponto livre mais próximo sem editar os dados dos mapas.
- Suíte de regressão: 57/57, cobrindo os mapas fixos, em grade e Neon. Não houve validação visual nem medição de FPS nesta entrega.
- Cache offline e endpoint de saúde atualizados para v55.0.

## Entrega v54.0 — 05/11/2026

- Corrigido fogo amigo no cooperativo local: projéteis identificam P1/P2 e só atingem o parceiro quando a opção está ativada.
- A opção desligada mantém o comportamento anterior; tiros de inimigos e colisões com inimigos não mudam.
- Suíte de regressão: 55/55. FPS real e validação manual do cooperativo continuam pendentes.
- Cache offline e endpoint de saúde atualizados para v54.0.
## Entrega v53.0 — 05/11/2026

- Auditoria no Chromium encontrou inimigos e armas sobrepostos a sólidos em 51 dos 72 mapas Neon.
- A geração agora localiza posições livres próximas, respeita o spawn do jogador e evita sobreposição entre inimigos; armas no chão também são deslocadas para piso livre.
- Todos os 72 mapas foram novamente montados no navegador: 720 inimigos e 84 armas no chão, nenhum colidindo com paredes. A suíte automatizada ampliada passou em 54/54.
- Modos disponíveis abriram no navegador; campanha iniciou na fase 1, coop local aceitou movimento/tiro dos dois jogadores. Uma sessão completa até vitória não foi validada.

## Entrega v52.0 — 05/11/2026

- Adicionadas quatro skins cosméticas selecionáveis com prévias visuais e persistidas no formato de save v2, sem alterar atributos, máscaras ou desbloqueios.
- Paleta de skin aplicada ao personagem procedural e detalhes de cor aplicados quando o spritesheet está carregado.
- Fallback de animação do jogador reutiliza sprites quantizados em cache em vez de recriar o Canvas quadro a quadro.
- Ícones de armas recebem contorno, reflexos, juntas e detalhes específicos por categoria; a arma aparece para ambos jogadores locais.
- Corrigido bug reproduzido no navegador: portas fechadas isolavam todas as salas dos pontos de spawn da fase 1, zeravam inimigos e concluíam a sala imediatamente. O corredor alcançável agora recebe spawns, e zero inimigos não conclui a sala.
- Corrigido spawn bloqueado no mapa fixo boate-b; os 17 mapas fixos agora ajustam a coordenada inicial para uma posição livre quando necessário.
- 54/54 regressões automatizadas passaram. Chromium confirmou a fase 1 em jogo com 8 inimigos e quatro previews visíveis. Movimento, disparo e pausa foram exercitados; a campanha completa ainda não foi jogada.

O relay online agora interpola posição e direção do outro avatar para reduzir saltos entre atualizações. As salas mostram quantos jogadores estão em partida e explicam que ambos precisam escolher o mesmo modo/mapa. Mapas, combate e progresso continuam locais.

Para multiplayer com servidor, use Node.js 18+ e siga [server/README.md](server/README.md). O lobby lista salas disponíveis neste servidor, informa ocupação/partida, permite entrar pela lista ou pelo código e atualiza a listagem automaticamente. A lista não é um catálogo global da internet. O relay exibe o outro avatar; combate e simulação ainda não são sincronizados.

## Entrega v51.0 — 05/11/2026

- Spawns de inimigos, armas, barris e suprimentos agora usam o jogador vivo mais próximo no cooperativo, evitando concentrações no P1 morto.
- Corrigida a documentação técnica e adicionada regressão para essa referência de spawn.

- Corrigido o avanço duplicado da campanha e garantido o início sempre na primeira fase.
- Removido o reinício acidental por R de teclado, pausa, HUD, traduções e debug.
- Removidos do seletor os mapas equivalentes a 640×580; a história usa um mapa válido no capítulo substituído.
- Auditoria registrada em `docs/MAP_AUDIT.md`.

- Corrigido o estado de colisão dos mapas: portas procedurais agora entram em `sol`, e portas de mapas fixos não herdam portas da sala anterior.
- Corrigido o bug em que aberturas de paredes não criavam portas reais.
- Portas dos mapas procedurais e fixos agora têm desenho, colisão, interação e dimensões consistentes.
- 47/47 regressões automatizadas aprovadas.

## Entrega v47.0 — 05/11/2026
- IA do cooperativo troca para o jogador vivo mais próximo quando um jogador morre.
- Mira preditiva e classes de inimigos usam o alvo ativo correto.
- Erros de carregamento e promises são capturados desde o começo da página.
- 45/45 regressões automatizadas continuam passando.

## Entrega v46.0 — 05/11/2026
- Janelas quebráveis nos mapas gerados: tiros e golpes abrem passagem, geram ruído e deixam estilhaços.
- Perímetro visual e físico corrigido nos mapas Neon, inclusive no mapa do trailer.
- Silhuetas de armas redesenhadas com detalhes próprios para facilitar reconhecimento.
- Aviso de desempenho automático convertido em notificação discreta.

## Entrega v45.0 — 04/11/2026
- Saves criados por uma versão futura agora exibem aviso persistente de modo protegido na interface.
- O estado `EXP.saveReadOnly()` fica exposto para a UI sem sobrescrever o progresso incompatível.
- 44/44 regressões automatizadas aprovadas. FPS real ainda precisa de medição no navegador.

## Histórico da entrega v44.0 — 04/11/2026
- O ajuste automático agora mede o tempo de quadro real antes do limite de simulação; travamentos longos não são escondidos pelo `dt` truncado.
- Após uma sequência lenta, o jogo reduz partículas, chuva, luzes e névoa decorativas temporariamente, preservando as preferências salvas.
- Atualizações de partículas usam operações mais baratas e a resolução automática continua limitada a 1,5x.
- 43/43 regressões automatizadas aprovadas. FPS real ainda precisa de medição no navegador.

## Histórico da entrega v43.0 — 04/11/2026
- Corrigido o bug em que “Jogar Solo” mantinha a preferência multiplayer salva e iniciava dois personagens; o fluxo solo agora limpa P2 e grava `multi=false` antes de começar.
- Escala automática do Canvas limitada a 1,5x, evitando o custo de 2x em telas de alta densidade.
- Poeira e cápsulas são desenhadas em lotes, reduzindo chamadas de desenho por quadro.
- 42/42 regressões automatizadas aprovadas.

## Histórico da entrega v42.0 — 04/11/2026
- Corrigido o movimento remoto para manter o avatar entre snapshots, interpolar deslocamento/rotação e remover estado parado após 5 s sem dados.
- Snapshots com revisão antiga são ignorados; lobby exibe tempo de resposta aproximado e idade da última posição.
- Adicionado botão para copiar código da sala com fallback de seleção manual e instrução Ctrl+C.
- Opção “reduzir flashes” também suprime relâmpagos e cintilações de tela.
- 40/40 regressões aprovadas; rede real de duas máquinas não foi testada.

## Histórico da entrega v41.0 — 04/11/2026
- Movimento e rotação do avatar remoto interpolados entre atualizações para reduzir saltos e manter a animação de movimento.
- Lobby mostra participantes que estão em partida e explica que modo/mapa precisam coincidir manualmente.
- 39/39 regressões aprovadas; conexão real entre duas máquinas não foi testada.

## Histórico da entrega v40.0 — 04/11/2026
- Antialiasing agora respeita a configuração de qualidade escolhida durante os quadros do jogo; antes, um wrapper de desenho forçava suavização alta e ignorava a opção.
- Nova configuração persistente permite regular a intensidade do tremor da câmera de 0 a 100%, preservando o interruptor geral de tremor.
- Opções refinadas com foco visível, controles de faixa mais claros, painéis com acabamento neon e abas roláveis em celulares.
- 39/39 regressões automatizadas aprovadas. Inspeção gráfica em navegador ainda não foi possível neste ambiente.

## Histórico da entrega v39.0 — 04/11/2026
- Recarga automática agora só inicia quando a preferência está ativada; o jogador ainda pode recarregar manualmente com C.
- Volume mestre agora escala música e efeitos sem alterar os níveis individuais de cada canal.
- Abas de opções aceitam setas, Home e End, mantêm foco previsível e expõem relações ARIA entre aba e painel.
- 38/38 regressões automatizadas aprovadas. Áudio e navegação por teclado ainda precisam de validação em navegador real.

## Histórico da entrega v38.0 — 04/11/2026
- Lobby online lista salas abertas/lotadas e indica quando uma partida começou; lista atualiza a cada 5 segundos enquanto aberta e pode ser atualizada manualmente.
- Salas com uma partida ativa ficam identificadas e não aceitam entrada tardia, pois mapas e combate ainda não são sincronizados.
- Se o jogador cair da conexão, a sala deixa de aparecer como ativa após 60 s sem heartbeat, liberando a vaga antes da expiração geral de cinco minutos.
- Preferências persistidas do jogo e do multiplayer local são validadas por tipo, faixa e opções aceitas antes de serem usadas, evitando configurações corrompidas.
- A opção de zoom agora inclui o valor padrão real (0,9x), para não abrir sem uma seleção visível.
- Servidor expõe somente código, nomes e ocupação na listagem; credenciais privadas continuam fora da resposta pública.
- Colisão invisível nas quatro bordas do mundo impede jogadores e atores de saírem do mapa, inclusive em mapas sem paredes de perímetro.
- Spawns das salas Neon são ajustados para dentro do limite seguro e reposicionados se iniciarem dentro de uma parede.
- Corrigidos layout e uso da lista em telas estreitas; botões identificam salas cheias e desativam entrada duplicada.
- 36/36 regressões automatizadas aprovadas, incluindo lobby, presença expirada, preferências inválidas e spawns reais dos 72 mapas Neon; teste TCP e navegador multiusuário continuam pendentes neste ambiente.

## Histórico da entrega v37.0 — 04/11/2026
- Corrigido o ciclo de vida de jogadores no cooperativo e a saída pelo sobrevivente.
- P2 agora procura spawn seguro e pode usar tiro e armas com as regras do inventário compartilhado.
- Correções anteriores de dano e controles P1/P2 continuam incluídas.
- Saves validados, backups preservados e restauração separada da recarga de arma.
- Manifesto offline corrigido e cache limitado à instalação do jogo.
- Servidor Node sem dependências, lobby por código e relay de presença/posição para até dois navegadores.
- Tokens privados não aparecem mais no estado público; sessão pode ser retomada ao recarregar a aba, e falhas temporárias tentam reconectar automaticamente.
- Inatividade, tamanho/tipo de payload, cadência de atualizações e esperas penduradas são tratados no servidor.
- 30 testes automatizados aprovados, incluindo chamadas diretas às rotas HTTP com respostas simuladas; conexão TCP e navegador ainda precisam de validação local.
- Documentação permanente em docs/ e protocolo em AGENTS.md.
- Microbenchmark sintético: `node tests/benchmark.cjs`; não mede FPS.

Leia [o relatório técnico](docs/RELATORIO_TECNICO.md), [os testes](docs/AI_TESTS.md) e [as pendências](docs/AI_KNOWN_ISSUES.md). A execução de partidas e o offline real ainda precisam ser verificados no navegador; esta entrega não declara o multiplayer integralmente corrigido.

A distribuição original estava numa pasta v30, mas já incluía o changelog v33. O histórico abaixo foi preservado. O formato do save continua v2. Para manter progresso entre versões, use a mesma origem do navegador ou exporte o save pelo Perfil & Coleção → Dados antes de mudar de endereço; não limpe os dados do navegador.

## Histórico: novidades v30
- **Menu redesenhado**: controles separados (solo / multiplayer), botão dedicado de Multiplayer Local, melhor hierarquia visual.
- **Multiplayer Local (2 jogadores)**:
  - P1: WASD + Mouse (mirar e atirar)
  - P2: Setas + Ctrl Direito (atirar) / . (soco) / / (pegar) / ; (largar)
  - Câmera segue o ponto médio (configurável: P1, P2 ou médio)
  - Modo de vidas: compartilhadas ou independentes
  - Fogo amigo opcional
- **Mais configurações** em Opções:
  - Seção MULTIPLAYER LOCAL completa
  - Volume mestre, sensibilidade do mouse, inverter Y
  - Mira customizada (cruz) com opacidade
  - Recarregar automático
  - Contador de FPS
- Arquivo novo: `js/exp-multi.js`

## Estrutura
- `index.html`: jogo base (inalterado, exceto 10 ganchos `EXP.*`).
- `js/maps.js`, `js/collision_sizes.js`: mapas e colisões originais.
- `js/exp-core.js`: salvamento v2 (backup, migração, exportar/importar), XP, perks, conquistas, ranking.
- `js/exp-content.js`: 30 máscaras, 23 armas, 6 chefes, regras de desbloqueio.
- `js/exp-world.js`: IA por classe, chefes, barris, câmeras/alarme, eventos, recarga.
- `js/exp-modes.js`: 8 modos novos + Diário/Personalizado, notas até SS, resumo por sala, HUD.
- `js/exp-fx.js`: clima, luzes, escuridão, transições, SFX, música dinâmica, volumes.
- `js/exp-ui.js`: telas de modos, perfil/coleção, resumo, resultado, opções.
- `js/exp-debug.js`: ferramentas de desenvolvedor (desligadas por padrão).
- `css/expansion.css`: estilos das telas novas.
- `assets/`: inalterado. As máscaras novas são geradas por código.

## Controles novos
`C` recarregar · `B` (na pausa) voltar ao menu.

## Modo desenvolvedor
Abra `index.html?dev=1`. F3 painel · F4 colisões · F6 IA · F7 próximo mapa · F9 erros · F10 chefe.

## Salvamento
Automático em `localStorage` (`hm_save_v2`) com backup rotativo (`hm_save_v2_bak`). Dados da v4 (recorde, desbloqueio) são migrados. Perfil & Coleção → Dados exporta/importa o save.

Backup do projeto original: ver o ZIP `Cappe-in-Miami-v4-original.zip`.

## v5.1
- `docs/CODIGO_NOVO.md`: todo o código novo da campanha em tiles, personagens, IA e vidros, separado por arquivo.
- Personagem: escolhido na tela de máscaras. Campanha: Modos de Jogo → Campanha: 3 Fases.
- Tiles de `TILE_LEVELS` (maps.js): 0 chão, 1 parede, 2 vidro, 3 porta, 4 início, 5 inimigo corpo a corpo, 6 inimigo armado. As GRIDS antigas do index.html não mudaram (lá 2 continua parede).

## v14 — organização de menus
- Menu principal agora fica inteiro no `index.html`, em dois grupos: **Jogar / Modos de Jogo** (ações principais) e **Modo História / Perfil & Coleção** (telas secundárias). Opções fica abaixo.
- Tela de Opções montada no HTML: VÍDEO (inclui tamanho da tela), JOGABILIDADE, ÁUDIO & DADOS, IDIOMA. O JS só liga os eventos.
- Lista de controles do menu inclui a linha de `C` / `ESC` / `B` diretamente no HTML.
- Estilos que estavam no JS (rolagem de Opções) foram para `css/expansion.css`.

## v15 — otimização de desempenho
- `js/maps.js`: os tiles de cada mapa agora são decodificados só quando o mapa é usado (antes eram decodificados todos os 159 na abertura). Carregamento inicial ~2,8x mais rápido. Dados verificados: os 159 mapas são idênticos aos da v14.
- Inimigos: o brilho do anel usa um traço largo translúcido em vez de `shadowBlur` a cada quadro (visual parecido, bem mais barato).
- Sangue, faíscas e efeitos de texto são compactados no próprio array, sem criar novos arrays a cada quadro.
- Escala máxima do canvas em telas de alta densidade reduzida de 2,5x para 2x.
- Sugestão para hospedagem: servir o `maps.js` com compressão gzip (o arquivo de texto cai bastante de tamanho).

## v16 — carregamento
- Máscaras novas são desenhadas em canvas direto (antes: 23 PNGs gerados via toDataURL na abertura). Visual igual.
- Fonte do Google não bloqueia mais a primeira renderização (carrega em segundo plano; com fallback).
- `sw.js`: cache offline. Só funciona em http(s) (ex.: hospedagem ou Live Server); abrindo o index.html direto (file://) o jogo funciona normalmente, sem cache.
- ATENÇÃO: ao publicar uma versão nova, troque o número em `const CACHE = 'cappe-vNN'` dentro de `sw.js`, senão quem já visitou continua com a versão antiga.

## v17 — PCs fracos
- Ajuste automático: se a partida ficar abaixo de ~38 FPS nos primeiros 240 quadros, aplica "Desempenho máximo" uma única vez (marcado em `hm_perf_auto`). Para voltar, escolha outra predefinição em Opções.
- Filtro de brilho do canvas só é aplicado quando diferente de 100% (evita composição extra a cada quadro).

## v18 — otimização profunda (medida no Chromium, renderização por software)
Medição: 420 quadros por cenário, mesmo roteiro de jogo, v17 vs v18. Os testes de equivalência (colisão e distâncias) deram 0 divergências em 40 mil amostras.
- **Lanterna / escuridão**: os 3 gradientes radiais criados por quadro viraram sprites pré-renderizados, e a camada escura passou a meia resolução (4x menos pixels). Custo de `draw` no escuro: ~8 ms → ~0,6 ms.
- **Luzes de neon e clarão de tiro**: sprite guardado em cada luz, intensidade via `globalAlpha` (antes: 1 gradiente novo por luz por quadro).
- **Sangue parado**: desenhado uma única vez numa camada (antes: até 1.200 arcos a cada quadro). O corte do limite agora é em lote (1.500 → 1.200), para a camada quase nunca ser refeita.
- **Chão, móveis e sangue**: só a área visível da tela é copiada por quadro (`drawImage` com recorte).
- **`shadowBlur` removido de tudo que roda por quadro** (portas, escadas/elevador, itens, saída, atordoamento, barris, chefes, inimigos sem sprite, combo, "GO TO CAR", modos). Substituído por halos translúcidos. Os de geração de tiles/máscaras (rodam uma vez) foram mantidos.
- **Sem alocação por quadro**: `slice()`/`filter()` nos laços de balas, inimigos, itens, arremessos, textos flutuantes e ruídos trocados por cópias reutilizáveis e compactação no próprio array; `forEach` dos fantasmas virou `for`; `tx()` não chama mais `getTransform()` (criava uma matriz por texto) nem concatena a chave do cache.
- **Distâncias**: `Math.hypot` (lento no V8) → `hyp()`; separação entre inimigos e escuta de ruídos comparam distância ao quadrado, sem raiz.
- **Linha de visão da IA com vidro**: usa a mesma grade espacial de colisão (`hitWallNG`) em vez de varrer todos os sólidos, e não copia mais o array de sólidos a cada atualização.
- **Pausa**: a cena estática é redesenhada 5x/s em vez de 60x/s.
- **CSS**: scanlines sem `mix-blend-mode` (visual idêntico, sem recomposição extra) e a grade 3D do fundo para de animar durante a partida (antes repintava a tela inteira todo quadro).
- `sw.js`: cache `cappe-v18`.

## v19 — segunda rodada de otimização
Perfil de CPU na v18: a thread principal ficou ~93% ociosa (o JavaScript deixou de ser o gargalo); o que restava era composição/GPU.
- **Scanlines CRT**: durante a partida ficam dentro da vinheta (que já era desenhada todo quadro) em vez de uma camada DOM sobre o canvas, que custava cerca de 40% do FPS em máquinas sem GPU forte. Nos menus a camada CSS continua. A opção "Scanlines CRT" segue funcionando.
- **Faíscas** em lote: 1 preenchimento por cor e nível de transparência (6 níveis), em vez de 1 desenho por faísca.
- **Tradução** (`tr()`): resultado guardado por texto (antes ordenava as chaves do dicionário a cada chamada fora do português) e `tx()` sem array de argumentos por chamada.
- **Rótulo de clima** do canto: vira imagem guardada em vez de `fillText` + `toUpperCase` por quadro.
- `sw.js`: cache `cappe-v19`.

## v26 — IA e gráficos
- **Perseguição inteligente** (`js/exp-core.js`, `EXP.steer`): o inimigo só anda em linha reta quando o caminho está livre com o seu tamanho real (raio 13). Se houver parede no meio, segue o caminho calculado. Antes, em perseguição ele andava direto até o jogador e batia nas paredes e quinas.
- **Pinça**: inimigos que ainda estão longe pegam um dos dois lados do jogador, em vez de formar fila atrás.
- **Anti-travamento**: se um inimigo fica sem avançar por 0,7 s, replaneja o caminho e dá um passo lateral.
- **Grade de navegação** com folga igual ao raio do inimigo (14 px); o caminho começa no nó mais próximo, não no início.
- **Corredores** também usam o caminho; **chefe** para a investida ao bater numa parede.
- **Gráficos**: suavização ligada nos sprites rotacionados (jogador, inimigos, armas, portas, neon) e no zoom, o que remove o serrilhado. Desempenho igual ao da v25.
- `sw.js`: cache `cappe-v26`.

## v27 — bots, mira, idioma e título
- **Nome**: menu e aba agora são "Cappe-in-Miami".
- **Idioma padrão**: português do Brasil, independente do idioma do navegador. Quem escolher outro idioma em Opções mantém a escolha.
- **Mira dos bots** (`js/exp-brain.js`): antecipação do movimento do jogador limitada e proporcional à inteligência. Antes, o cálculo ia longe demais e as balas iam para o vazio. O erro de mira diminui conforme a dificuldade, e o leque de tiro da espingarda ficou mais estreito.
- **Reação**: o bot só atira depois de um tempo de reação após te ver (0,7 s no fácil, cerca de 0,4 s no difícil).
- **Esquiva**: bots mais espertos desviam de balas que vêm na direção deles.
- **Inteligência por dificuldade** (`DIF.iq`): fácil 0,15, médio 0,4, difícil 0,6, Hardcore 0,72, com teto de 0,75 para o nível mais alto.
- **Qualidade**: escala de renderização padrão mínima de 1,5x e suavização em alta qualidade. O modo "Desempenho máximo" (também ativado automaticamente em PCs fracos) volta para 1x.
- `sw.js`: cache `cappe-v27`.

## v28 — vendedor de armas
- **Créditos**: +10 por abate e bônus ao limpar a sala. Zerados quando uma partida Arcade começa ou quando uma campanha de História começa (não a cada capítulo).
- **Quando aparece**: no Arcade, nas fases 5, 10, 15...; na História, nos capítulos 3, 6, 9... Surge no meio da fase, depois que metade dos inimigos cai.
- **Como usar**: chegue perto e aperte E. Teclas 1-9 compram, ESC fecha.
- **Itens**: munição (recarga), colete extra, faca, pistola, revólver, escopeta, SMG, uzi, rifle.
- Ajustes: `EXP.shop` e `ITEMS` em `js/exp-shop.js`; a frequência fica em `eligibleLevel()`.
- `sw.js`: cache `cappe-v28`.

---

## 🆕 Novidades v29

* **Vendedor sem menu (`js/exp-shop.js`):** o vendedor cai perto do jogador com três cartas no chão — OFENSIVA (arma aleatória), DEFENSIVA (colete) e UTILIDADE (munição). Compra-se passando por cima. O mundo não para. Ele fica 4s e vai embora.
* **Trilha sonora escolhível (`js/exp-music.js`):** em Opções → TRILHA SONORA, escolha uma faixa fixa ou deixe em automática. Novos gêneros sintetizados: Dub Techno, Industrial Techno, Dark Disco e Cyberpunk Midtempo. Chefes mantêm a trilha própria. A escolha fica salva no navegador.

## 🆕 v30

* **Madame Piranha (vendedora):** personagem com falas de chegada, compra, falta de crédito e saída. Aparece no máximo uma vez por fase, não reaparece depois de sair e fica 4s.
* **Correções:** o vendedor não volta sem parar depois de sair; Tony (sem armas de fogo) não recebe mais armas na loja; a carta de munição vira faca quando você não tem arma de fogo.
* **Preços:** sobem 6% por fase.
* **História reescrita:** novos personagens, lugares e capítulos. Mapas e progressão iguais.

## 🆕 v31 (loja)

* **3 mercadorias + REROLAR:** a loja tem três itens (Ofensiva, Defensiva, Utilidade) e uma carta de reroll.
* **Reroll:** 1 grátis por partida. Depois custa 40 cr, subindo 10 cr a cada 30s da partida.
* **Raridade:** cada reroll na mesma visita aumenta a chance de itens raros e épicos. Novos itens: Caixa de munição (dobra a munição), Colete reforçado (+2 de escudo).

## 🆕 v32 (loja)

* **Descrição dos itens:** ao chegar perto de uma mercadoria, aparece o que ela faz.
* **Congelamento de impacto:** compra e reroll param o mundo por 50–70 ms, para o clique ter peso.


## v33 — melhorias incrementais (03/11/2026)
- Mantido todo o conteúdo, arquivos, mapas, modos, personagens, sistemas e recursos existentes.
- Adicionadas 8 trilhas instrumentais originais geradas em tempo real pela Web Audio API: Neon Boulevard, Blood Moon Drive, Outrun Memories, Concrete Dreams, After Hours, Toxic Skyline, VHS Sunset e Noir Pursuit.
- As novas faixas aparecem automaticamente no seletor **Opções → Trilha Sonora**. A opção Automática e a trilha especial dos chefes continuam funcionando.
- Refinado o menu principal: hierarquia visual, agrupamento dos botões, leitura dos controles e melhor aproveitamento do espaço.
- Melhorada a adaptação para telas menores e telas com pouca altura; os cartões de modos, opções e formulários também receberam ajustes.
- Ajustes de foco, estados desabilitados, feedback de clique e rolagem das telas para facilitar a navegação.
- Validada a sintaxe de todos os arquivos JavaScript com Node.js. A execução completa ainda deve ser conferida no navegador, pois depende de interação, áudio e APIs do navegador.

