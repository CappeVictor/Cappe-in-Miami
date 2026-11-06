# Catálogo observado no código
## Preview Rust/WASM local v76
O query `?renderer=wasm` ainda encaminha chamadas Canvas residuais pelo ABI, enquanto Rust gera comandos de fundo/overlay/decor, granulado, sombras e rejunte estáticos, overlay `FTILES` (salas, ordem e offset), vidros quebráveis, primitivas de piso/mapa, seleção de texturas repetidas de paredes/móveis e decalques de aberturas de portas, geometria de móveis, portas comuns, portas Neon com sprite e armas. Rust combina transformação/ângulo das portas, compõe corpos completos de P1/P2/avatar remoto e corpos/sombras de inimigos; decide/ordena orbes e textos de estado e seleciona frames/assets. O host carrega as imagens e rasteriza Canvas e texto via `tx()` cacheado. Simulação, abertura/interação/temporizadores de porta, timers de vidro, overlays de imagem restantes e avanço temporal permanecem JS. O compositor `paintMap`, partículas, sangue, expansões, HUD e outras camadas continuam parcialmente em JavaScript; conversão parcial sem medição de desempenho.
Este catálogo confirma existência de implementação, não validação integral em partida.

- Combate: armas de fogo e brancas, tiros, dispersão, recuo, arremesso, finalização, dash por máscara, colete, combos e pontuação.
- Conteúdo: máscaras ampliadas, armas e seis definições de chefe no módulo de conteúdo; personagens Richard, Tony, Dennis e Rasmus.
- Mapas: mapas fixos, apartamentos procedurais, grades, mapas Neon e campanha em tiles; andares e transporte.
- IA: percepção visual/auditiva, investigação, patrulha, busca BFS, classes corredor/blindado/atirador/líder, flanqueamento e esquiva.
- Modos: Clássico, História, Campanha de 3 Fases, Horda, Sobrevivência, Arcade, Contrarrelógio, Assassino, Limpeza, Invasão, Diário, Personalizado e Roleta adicionada pela UI.
- Progressão: XP, níveis, perks, conquistas, ranking local, recordes, desbloqueios e estatísticas.
- Loja: Madame Piranha, créditos por abate/sala, cartas ofensiva/defensiva/utilidade, reroll e raridade.
- Apresentação: Canvas 2D, partículas, sangue, luzes, clima, flashes, tremor, cache de textos e camadas de cenário.
- Skins cosméticas: quatro paletas selecionáveis, persistidas em `settings.skin` no save v2 e independentes de personagens/atributos; sem conteúdo pago.
- Áudio: Web Audio sintetizado, música por sala/chefe, escolha de faixa e volumes de música/SFX.
- Acessibilidade: configurações visuais, idiomas, abas e anúncios de telas. Navegação sem mouse ainda requer auditoria.
- Multiplayer: P2 local por teclado/numpad/gamepad e lobby por código com servidor relay para posição/presença. Lista salas da instância atual, nomes/vagas/partida, entrada direta, atualização periódica, tokens privados, reentrada da aba, saída explícita e retry automático. Não há descoberta global de servidores; co-op online ainda não sincroniza combate, mapa ou progresso.
- Offline: manifesto corrigido para os arquivos distribuídos. Não supre as artes que já faltavam no ZIP.
