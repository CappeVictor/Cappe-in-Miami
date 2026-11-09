# Cappe-in-Miami — preview Rust/WASM v303.0

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
- `js/exp-ui.js`: te