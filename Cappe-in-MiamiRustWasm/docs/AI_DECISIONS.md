# Decisões técnicas

## D028 — v76.0 — Transformações das portas Neon em lote Rust
Enviar ao Rust posição, ângulo de base, ângulo atual de abertura, offsets da arte e handles de sprite das portas Neon. Rust combina os ângulos e mantém a ordem; o host resolve imagens e rasteriza Canvas depois do retorno. A atualização temporal da porta fica no gameplay JS, e `neonDrawDoor` continua como fallback. Sem alegação de desempenho.

## D027 — v75.0 — Seleção da textura FTILES em lote Rust
Enviar para Rust as salas, a posição especial do corredor e o índice do tile; Rust devolve comandos ordenados de clip/fill com a mesma translação. O host mantém a imagem, cria um CanvasPattern e rasteriza depois do retorno WASM. O painter JS continua disponível como fallback; sem alegação de desempenho.

## D026 — v74.0 — Texturas estáticas como seleção geométrica Rust
Manter os assets PNG e seus recortes no host, mas transferir ao Rust a escolha por tipo de sólido, recorte de móvel, dimensões e orientação dos decals de porta, numa lista ordenada. O host cria CanvasPattern, clipping e drawImage após o retorno WASM; o painter original continua como fallback. Preserva os arquivos e permite avançar a fronteira do renderer sem mover carregamento de imagem para gameplay; sem alegação de desempenho.

## D025 — v73.0 — Detalhes estáticos do piso em lotes determinísticos
Dividir a camada `buildFloor` em granulado pré-textura e sombras/rejunte pós-textura, preservando sua ordem visual. Rust usa o mesmo RNG seeded e devolve a semente avançada; o host rasteriza lotes compactos, com os overlays de imagem e o painter JavaScript disponíveis. Isso reduz o loop de geometria JS sem mudar gameplay; não há medição de desempenho.

## D024 — v72.0 — Geometria de vidros quebráveis em lote Rust
Enviar a geometria visível de painéis intactos e estilhaços ao WASM como dados compactos, emitir comandos ordenados e deixar timers/remoção de gameplay no JavaScript. O host rasteriza Canvas e mantém painter JS como fallback. Isso migra uma camada visual pequena sem alterar colisão, quebra ou duração dos fragmentos.

## D023 — v71.0 — Fundo e decoração estática em comandos de mapa
Portar geometria e ordem de preenchimentos, contornos de tapete e decoração para Rust; receber cores dinâmicas do mapa no host para preservar dados existentes. Manter o painter JS como fallback e preservar `paintMap` como orquestrador até a ordem completa ser portada. Essa etapa ocorre na montagem do mapa; não afirmar ganho de FPS.

## D022 — v70.0 — Textos de estado de inimigos como comandos semânticos
Rust determina o tipo/posição do texto e o coloca após o corpo e os orbes no range ordenado; o host mapeia o ID para `tx()` para preservar fonte, contorno e cache existentes. O evento antigo continua como fallback quando o range não existe ou o host não fornece o painter de texto. Isso mantém a decisão e ordenação no backend sem reimplementar fonte rasterizada; nenhum ganho de FPS foi medido.

## D021 — v69.0 — Orbes de stun no lote do inimigo
Acrescentar a geometria dos três orbes (círculo externo translúcido e interno amarelo) ao range Rust do corpo visível, usando o mesmo relógio `performance.now()` e preservando a ordem corpo → orbes → rótulos. O host continua desenhando “ATORDOADO” e mantém o painter inteiro como fallback. Uma senoide polinomial evita dependência externa; pequenas variações de ponto flutuante são possíveis. Não alegar ganho de FPS sem medição.

## D020 — v68.0 — Composição de jogadores em um lote Rust
Manter no JavaScript apenas os acumuladores de animação já usados pelo jogo e enviar até três poses por frame. Rust compõe transform, sombra/aura, arma, frame do spritesheet ou fallback, detalhes cosméticos e tag em comandos ordenados; o host resolve imagem/texto e rasteriza somente após o retorno WASM, evitando reentrância. Preservar painter JS em falha e não afirmar ganho de desempenho sem comparação.

## D019 — v67.0 — Corpos de inimigo em buffer de comandos
Gerar no Rust um lote por quadro com ranges por inimigo e consumir cada range na ordem dos eventos, mantendo stun/rótulos intercalados corretamente. O host resolve as cores e o Canvas, e fornece o spritesheet como asset; quando um range não existe, o painter JavaScript permanece disponível. O buffer tem limite explícito e faz fallback seguro se excedido. A rasterização continua nativa e não se assume ganho de FPS.

## D018 — v66.0 — Geometria de sombra inimiga em buffer
Manter o fluxo de inimigos sem callbacks/reentrância durante o cálculo Rust: o módulo preenche um buffer contíguo com posição, raios e alpha e o host aplica cada sombra antes do corpo correspondente. O corpo recebe um sinal para pular somente a sombra que já foi aplicada; sem contexto do host, o painter antigo continua responsável por ela. A rasterização permanece Canvas e nenhum ganho de desempenho é assumido.

## D014 — Preview local de ABI para migração do renderer
Usar Rust `no_std` com ABI WASM manual e imports host, sem `wasm-bindgen`, para compilar no ambiente Windows disponível e evitar dependências de build. O modo experimental encaminha chamadas Canvas preservando comportamento e porta camadas de lógica de desenho por vez. Manter JavaScript como padrão/fallback até todas as camadas reais serem portadas e comparadas.
## D017 — v54.0 — Identificar origem dos projéteis locais
Os projéteis dos jogadores carregam `owner: 'p1' | 'p2'`; tiros de inimigos não têm proprietário de jogador. A opção salva `friendlyFire` só permite colisão com o parceiro, nunca com o próprio atirador. A regra é aplicada no loop atual de projéteis para preservar colisão, paredes e perfuração existentes.

## D016 — v53.0 — Corrigir spawns de mapas Neon na geração
Validar posições após consolidar a geometria e deslocar entidades para o ponto livre mais próximo, mantendo o conteúdo e o desenho fonte do mapa. É uma busca única por montagem; se não existir ponto válido, a entidade é omitida em vez de nascer dentro de sólido.

## D014 — v52.0 — Skin como preferência cosmética separada
Guardar o identificador cosmético em `settings.skin` do save v2 e fornecer default via merge, preservando todo progresso. Não reaproveitar `settings.char`, pois personagens atuais definem atributos e máscaras. Não criar desbloqueios ou economia para skins nesta entrega.

## D015 — v52.0 — Evitar conclusão vazia e spawn fixo em sólido
Portas fechadas podem isolar as salas internas do spawn inicial, então o corredor gerado é candidato a spawn desde a fase 1. A sala só pode ser marcada limpa se teve inimigos. Mapas fixos validam e ajustam coordenadas de jogador em geometria livre, sem alterar dados/assets originais.

## D013 — v42.0 — Telemetria simples e expiração do avatar remoto
Medir o tempo HTTP das atualizações enviadas e chamá-lo de resposta aproximada, sem apresentá-lo como ping puro. Se o avatar remoto não receber snapshot por 5 s, removê-lo da cena; não persistir estado de sala. Isso melhora feedback e evita exibir uma posição antiga indefinidamente sem sugerir sincronização autoritativa.

## D012 — v41.0 — Suavizar a apresentação do relay sem inventar sincronização
Manter uma instância estável do avatar remoto e interpolar seus alvos a cada quadro. O snapshot não é interpolado no servidor e as mecânicas de jogo permanecem locais; o lobby precisa declarar essa limitação.

## D011 — v40.0 — Preferências visuais devem sobreviver a wrappers
Configuração final de antialiasing é aplicada no wrapper de desenho a partir do CFG atual, para que nenhuma camada posterior force uma qualidade incompatível. Intensidade de tremor usa multiplicador separado do interruptor geral e é validada como faixa de 0 a 100.

## D001 — 04/11/2026 — Cópia isolada e versão v34.0
Trabalhar sobre a distribuição autorizada, sem sobrescrever o ZIP original. A pasta se chamava v30, mas o README terminava em v33; v34.0 identifica esta iteração sem reescrever o histórico. Sem Git na origem: preservados arquivos anteriores para comparação durante a sessão e hash do pacote de origem no relatório.

## D002 — Corrigir contratos antes de refatorar
Preservar os wrappers existentes. Encaminhar target de hit até a base corrige o dano de P2 com mudança mínima. Evitada a reestruturação de todo o combate, que exigiria testes visuais e de todos os modos.

## D003 — Persistência compatível e explícita
Manter save v2 e chaves antigas. Validar estruturas conhecidas e rejeitar chaves de protótipo; conservar campos adicionais seguros. Separar restoreBackup/reloadSave da recarga de arma. Só confirmar importação após persistência e manter o estado anterior recuperável. Não usar saves reais nos testes. Saves de formato futuro ficam protegidos contra escrita.

## D004 — Cache por instalação
O manifesto anterior listava 489 entradas, 385 inexistentes e omitia music/multi. Gerar lista a partir dos 106 arquivos de execução existentes. Evitar cache de documentação/testes. Abrir somente o cache deste escopo, limpar apenas versões próprias e permitir fallback de index para navegação offline. Não fabricar assets faltantes nem apagar referências de mapas.

## D007 — Sala online sem dependências
Para permitir experimentar multiplayer cliente-servidor sem pacote ou serviço externo, usar Node HTTP, sala em memória, identificadores aleatórios e long polling. O servidor não é autoridade de jogo nesta etapa: só retransmite posição/presença. O cliente mantém uma cópia local da simulação. Essa limitação fica explícita na UI/documentação e orienta a próxima etapa (sincronizar eventos e simulação).

## D008 — v37.0 — Credencial privada e recuperação de sala
Não reutilizar o ID visível no room view como credencial. O servidor emite token privado no cabeçalho Authorization e mantém ID público independente. Guardar token em sessionStorage para permitir reload na mesma aba, com saída explícita e expiração por inatividade. Long polling mantém uma resposta pendente por jogador; o cliente reconecta com atraso progressivo.

## D009 — v39.0 — Listagem no servidor atual e perímetro global
A lista de salas consulta a mesma instância Node que já atende os jogadores. Ela não tenta descobrir hosts na rede nem cria catálogo público, o que exigiria um serviço persistente e hospedagem. Mantemos a resposta sem tokens e o relay atual. O bloqueio de saída do mapa usa os limites dinâmicos WW/WH compartilhados pelas fases, inclusive mapas neon sem paredes externas; a colisão usa raio para a borda não atravessar o limite visual/jogável.

## D005 — Controles conforme menu
No cooperativo P1 mantém WASD, mesmo que o solo esteja configurado com setas. P2 usa Ctrl Direito para tiro e ponto para soco. Removida apenas a sobreposição não documentada do ponto como tiro; numpad/gamepad preservados.

## D006 — Medição honesta
Os testes VM executam funções reais com interfaces DOM/storage/cache simuladas. Eles não equivalem a navegador, GPU, áudio ou jogo completo. Microbenchmark de navegação e compilação não prova ganhos de FPS; algoritmos de navegação não foram otimizados nesta iteração.
## D010 — v39.0 — Preferências com efeito observável
Manter auto reload desligado por padrão e não recarregar automaticamente quando está desligado; o comando manual C permanece. Volume mestre atua como multiplicador nos ganhos de música e efeitos, preservando os níveis individuais.
