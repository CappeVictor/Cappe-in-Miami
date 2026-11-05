# Arquitetura real — v50.0

O loop mantém `rawDt` para medir atraso real e usa `dt` limitado apenas para a simulação. Depois de 120 amostras lentas, `EXP.perfTier` reduz efeitos decorativos; a configuração persistida continua intacta. Partículas e elementos ambientais consultam esse tier.

O botão principal de jogar normaliza `EXP.MULTI` antes de `showMasks`; a criação de P2 continua restrita à configuração multiplayer. A resolução automática do Canvas limita o multiplicador para reduzir pixels em telas de alto DPI; poeira e cápsulas usam caminhos agrupados.

No cliente online, `state.revision` é monotônico; `setRemotePlayers` preserva o avatar e carimba snapshots, `tickRemote` interpola e descarta o avatar após 5 s sem dados. `send` mede tempo de resposta HTTP aproximado; o lobby publica isso junto da idade da posição. Não equivale a ping ICMP nem a sincronização de partida.

No relay online, `setRemotePlayers` mantém o mesmo ator entre snapshots recebidos e atualiza alvos; `tickRemote` interpola posição/direção no ritmo do loop local. Isso suaviza apresentação sem sincronizar física, mapa ou combate.

Na resolução final do Canvas, `js/exp-ui.js` aplica o antialiasing e a qualidade de suavização atuais em cada quadro; `CFG.shakeAmt` escala coice e tremor visual, sendo validado como número entre 0 e 100 na leitura das preferências.

Em v39, `EXP.multiCfg.autoReload` condiciona o início da recarga nos fluxos de arma; `EXP.applyVol` multiplica volumes individuais pelo mestre do multiplayer local; `exp-acess.js` implementa tablist/tabpanel com IDs associados, foco móvel e setas/Home/End.
## Inventário e responsabilidades
| Arquivo | Responsabilidade e dependências |
| --- | --- |
| index.html | Menus HTML/CSS básico, dados MAPAS/STORY/MASKS/WP, estado global, input, loop, física, colisões, câmera, áudio base, renderização e progressão de salas. |
| js/maps.js | Dados SPRITES, mapas Neon, tiles e níveis de campanha; decodificação preguiçosa. Consumido pela base e expansões de campanha. |
| js/collision_sizes.js | Dimensões de colisão de sprites. |
| js/exp-core.js | Save v2, XP, perks, conquistas, ranking e avisos; segundo bloco: grade NAV, BFS, patrulha, investigação e steer. Depende de globais da base, apesar de o comentário inicial mencionar independência das expansões. |
| js/exp-content.js | Amplia máscaras/armas, define chefes e desbloqueios, gera arte de máscaras. |
| js/exp-world.js | Classes de IA, chefes, barris, câmeras, alarmes, eventos, pente/recarga; integra campanha em tiles. |
| js/exp-brain.js | Dificuldade, reação, erro de mira, antecipação limitada e esquiva. Usa P, enemies e bullets globais. |
| js/exp-modes.js | Registro MODES, runs, modificadores, ondas, campanha, personagens, XP, relatórios e resultados; compõe hooks da base/mundo. |
| js/exp-fx.js | Clima, luzes, sombras, sons, trilha dinâmica, vidro e wrappers de funções de combate/renderização. |
| js/exp-music.js | Seleção de trilha e gêneros sintetizados adicionais; preferência hm_track. |
| js/exp-ui.js | Modos/perfil/coleção/dados, resumo, resultado, opções, pausa, navegação de telas e ajustes de spawn. |
| js/exp-i18n-extra.js, exp-i18n-extra2.js | Dicionários adicionais consumidos pelo tradutor. |
| js/exp-i18n.js | Tradução DOM/Canvas, cache de textos, observador DOM e preferência de idioma. |
| js/exp-acess.js | Abas de opções e anúncios aria-live de telas. |
| js/exp-debug.js | Log de erros/rejeições; painel e atalhos habilitados por ?dev=1. É carregado tarde: não captura todos os erros anteriores à própria execução. |
| js/exp-shop.js | Créditos, Madame Piranha, cartas, raridade, reroll e efeitos de compra. |
| js/exp-multi.js | Configuração, criação de P2, teclado/gamepad, câmera, vidas, HUD auxiliar. Usa arma/munição globais compartilhadas. |
| js/exp-online.js | Lobby, criação/entrada/reentrada, token de sessão, saída, retry/backoff, long polling e envio de posição; depende da API same-origin e hooks em index.html. |
| server/server.js | HTTP estático por allowlist/realpath e API em memória para duas pessoas; token secreto separado do ID público, listagem desta instância, um long poll por jogador, validação e expiração. Sem dependências externas. |
| css/expansion.css | Telas, componentes e responsividade das expansões. |
| css/acessibilidade.css | Estilos auxiliares de acessibilidade. |
| sw.js | Cache HTTP(S) do jogo, agora incluindo o módulo online; chave por versão e escopo. Não opera em file://. |

As janelas geradas ficam em `breakables`, com caixas marcadas com `g` no mesmo sólido usado por colisão e LOS. `shatterBreakable` chama `refreshSol`, registra ruído e mantém o caminho navegável após o impacto. O perímetro Neon é acrescentado em `buildNeonFloor` como geometria visual e colisível para cobrir mapas sem parede externa.

`activeTarget` seleciona entre os jogadores vivos o ator mais próximo do inimigo. A base, `exp-brain.js` e as classes de IA usam esse alvo para visão, perseguição e mira, evitando que o cooperativo continue mirando um jogador morto.

`addDoor` é usado por `wallH`, `wallV` e `buildFixed`; portanto toda abertura criada por dados de mapa também recebe objeto de porta, caixa de colisão e dimensões próprias para renderização.

## Inicialização
HTML cria window.EXP com hooks vazios → dados base → maps.js → collision_sizes.js → script principal (define funções, carrega imagens, eventos, agenda requestAnimationFrame) → core → content → world → brain → modes → fx → music → ui → dicionários extra → i18n → acess → debug → shop → multi → online → registro do service worker no load. O servidor usa somente APIs nativas do Node.
Preservar essa ordem. Vários módulos guardam a função anterior em _nome e a substituem; mudanças de assinatura precisam atravessar todos os wrappers.

## Atualização e desenho
loop(t) aplica limitador CFG.fps; dt é limitado a 1/30; acumulador chama update(FIXED) em passos de 1/60; hitstop consome passos. update só roda em play: EXP.tick → mundo/modos/efeitos → jogador/P2 → portas/câmera → projéteis/IA/colisões → saída de sala. draw compõe Canvas, chão pré-renderizado, objetos, atores, efeitos e HUD. Pausa redesenha aproximadamente 5 vezes/s.
Não há garantia de 60 FPS medida nesta auditoria. O dt limitado também alimenta o ajuste automático de desempenho, o que mascara períodos lentos.

## Multiplayer online — limite atual
POST cria/entra sala; token secreto em Authorization identifica o participante, enquanto a lista pública usa outro ID. POST /state publica posição/ângulo/estado vivo e GET /state long-polls por revisão. A sessão pode recuperar após reload e participantes ociosos expiram. O cliente desenha o avatar remoto e centra a câmera entre eles. Não há autoridade do servidor sobre simulação nem sincronização de inimigos/projéteis/dano/mapa/modo/progresso. Ambos iniciam o mesmo mapa. Não exponha o serviço diretamente à internet sem HTTPS e hospedagem adequados.

## Física, entidades e IA
Entidades são arrays globais (enemies, bullets, pickups, throws, efeitos) e objetos P/P2. SG é grade espacial de células de 64 px para sólidos; move/hitWall realizam colisão circular. Projéteis são subamostrados em passos de ~6 px. NAV usa células de 20 px, raio de folga 14 e BFS em 8 direções sem cortar quinas. Busca e steer reaproveitam buffers/objetos, mas a separação entre inimigos ainda percorre pares O(n²).
IA combina estados (IDLE/PATROL/SUSPICIOUS/INVESTIGATE/SEARCH/ALERT/CHASE/STUNNED), LOS, audição, classes e mira. Vários cálculos ainda usam P diretamente, inclusive no cooperativo.

## Persistência e interfaces críticas
hm_save_v2 / hm_save_v2_bak: XP, stats, desbloqueios, ranking e settings. Mantidas as chaves e formato v2; saves legados recebem campos ausentes. hm_cfg, hm_multi_cfg, hm_audio, hm_track, hm_hiscore, hm_unlock e hm_best_* continuam separados.
EXP.reload pertence à recarga de arma. EXP.reloadSave lê o save; EXP.restoreBackup valida e restaura, retornando string de erro ou string vazia. Importação/restauração só trocam SAVE em memória após as escritas; localStorage não oferece transação de múltiplas chaves. Falha na segunda escrita mantém SAVE em memória e tenta restaurar o backup anterior. A recuperação também pode falhar se o armazenamento deixar de estar disponível; o erro fica registrado.
Importação rejeita tipos perigosos/inválidos. Formato futuro (>2) no principal bloqueia gravações nesta versão. Isso não converte nem apaga o arquivo futuro.
