# Problemas conhecidos
Confirmados por inspeção, salvo quando descritos como hipótese. Referências ao backlog são estáveis.

v46 corrigiu as janelas dos mapas gerados, o perímetro visual/físico dos mapas Neon e o aviso central de desempenho. A v47 corrigiu o alvo ativo da IA no cooperativo e a captura de erros iniciais. A v48 corrigiu paredes no lugar de portas nos mapas procedurais e fixos. A v49 corrigiu portas que não entravam na colisão procedural e portas antigas herdadas entre mapas fixos. A v50 corrigiu a proteção da primeira fase, removeu o reinício por R e filtrou mapas equivalentes a 640×580. A v51 corrigiu a referência de spawns no jogador vivo do cooperativo. A validação visual em navegador real continua pendente.

| ID | Evidência / impacto | Próxima validação |
| --- | --- | --- |
| CIM-023 | v44 adiciona governador adaptativo e reduz efeitos após quadros lentos; não há medição FPS/CPU de navegador e a causa pode ser lógica de jogo, GPU, carregamento ou hardware. | Medir com DevTools em mapas/qualidades diferentes e confirmar se o tier reduz a queda sem alterar a preferência salva. |
| CIM-022 | Corrigido na v43: o botão “Jogar Solo” deixava `MULTI.enabled` persistido e `startLevel` criava P2. Escala automática e partículas receberam otimização segura, mas FPS real não foi medido. | Jogar uma partida solo após sair do multiplayer e medir FPS em telas/DPI diferentes. |
| CIM-021 | Na v39, `exp-ui.js` sobrescrevia antialiasing com alta qualidade a cada quadro, anulando opções visuais; v40 corrigiu. Controle de intensidade de tremor e refinamentos visuais aguardam teste no navegador. | Confirmar nitidez, desempenho e intensidade da câmera em diferentes telas/DPI. |
| CIM-020 | v42 exibe resposta HTTP aproximada e idade do snapshot, copia o código, ignora revisões antigas e remove avatar após 5 s sem dados. Multiplayer segue como relay; mapa, combate, inimigos, tiros, dano e progresso não são compartilhados, sem diretório global. Rede real ainda não foi validada. | Validar duas máquinas; projetar protocolo de partida e simulação autoritativa. Catálogo global exige hospedagem HTTPS. |
| CIM-008 | Pacote de assets incompleto: manifesto antigo referia 385 imagens ausentes. neonDrawProp/door não desenham imagens sem naturalWidth; outras referências de mapas precisam de inventário completo. | Recuperar pacote original de artes e conferir mapas afetados; não remover objetos/colisões para esconder falhas. |
| CIM-009 | Ciclo de vida: morte marca P1/P2; bloqueia ações do morto e P2 sobrevivente pode alcançar a saída. Falta validação manual em todos os modos. | Testar ambas as regras de vidas, reinício e troca de sala. |
| CIM-010 | Corrigido na v47: IA, mira preditiva e comunicação usam o jogador vivo mais próximo; a última posição ainda respeita o estado de investigação. | Validar visualmente em coop com morte alternada de P1/P2. |
| CIM-011 | P2 agora usa fireOk/onFire e pode coletar/soltar arma com inventário compartilhado, sem armas de fogo para personagem que as proíbe. Munição e arma permanecem compartilhadas. | Validar tiro, recarga, coleta e troca em partidas com Richard/Tony. |
| CIM-012 | `masterVol` e `autoReload` integrados na v39; fogo amigo e compartilhamento completo do modo cooperativo ainda não foram integrados. | Implementar fogo amigo de forma explícita e definir regras do co-op local. |
| CIM-013 | spawnP2 busca 64 posições em anéis e exige colisão livre/acesso; sem espaço retorna null e avisa. | Validar spawn em mapas reais densos. |
| CIM-015 | Métrica de ajuste automático é baseada em dt truncado. | Separar medição e passo de simulação; comparar com DevTools. |
| CIM-016 | Corrigido na v47: listeners iniciais guardam erros e rejeições antes de `exp-debug.js`. | Induzir falha de carga em navegador real e conferir o painel. |
| CIM-017 | Vínculos ARIA e roving tabindex implementados na v39; validação em navegador e leitor de tela pendente. | Testar com teclado/leitor de tela e garantir que atalhos do jogo não sejam afetados. |
| CIM-018 | Não há medição de sessão longa, frame pacing ou crescimento de memória. | Roteiro reprodutível e comparação real de cenários. |
| CIM-019 | Corrigido na v45: save futuro continua protegido e exibe aviso persistente de modo somente leitura. | Confirmar visualmente o aviso em navegador real e não sobrescrever o save. |

## Corrigidos nesta iteração
CIM-002: efeito de dano descartava target. CIM-003: controles P1/P2 conflitantes. CIM-004: backup corrompido/validação/importação sem confirmação de gravação. CIM-005: restauração chamava recarga de arma. CIM-006: manifesto inválido e cache fora do escopo. CIM-009: ciclo de vida e saída pelo sobrevivente implementados; testes automatizados aprovados, validação visual pendente.
CIM-014: preferências do jogo e de `hm_multi_cfg` agora são filtradas por chave conhecida, tipo, faixa e enumeração; campos inválidos conservam o padrão sem sobrescrever preferências válidas. Corrigido também o seletor sem opção correspondente ao zoom padrão 0,9x. Conferir os controles em navegador real.
CIM-019: save de formato futuro agora comunica o modo protegido na abertura, preservando a compatibilidade e evitando falso sucesso de gravação.
