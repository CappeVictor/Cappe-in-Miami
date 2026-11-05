# Decisões técnicas
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
