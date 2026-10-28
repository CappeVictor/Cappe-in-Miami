# Hotline-Miami

# PROJETO: HOTLINE MIAMI — REMASTERIZAÇÃO, OTIMIZAÇÃO E EXPANSÃO COMPLETA

Quero que você trabalhe no meu projeto existente de Hotline Miami, desenvolvido em HTML, CSS e JavaScript.

Sua missão é transformar o jogo em uma versão muito mais completa, fluida, bonita, responsiva e divertida, mantendo os recursos existentes e corrigindo os problemas técnicos que estão prejudicando a experiência.

**PRIORIDADES ABSOLUTAS:**
1. Eliminar os travamentos e reduzir drasticamente o lag.
2. Corrigir definitivamente os problemas de acompanhamento da câmera.
3. Otimizar o motor do jogo e o sistema de renderização.
4. Melhorar os controles, o combate e a inteligência artificial.
5. Implementar mais conteúdo, missões, armas, inimigos, efeitos e sistemas.
6. Preservar todos os recursos existentes que funcionam corretamente.

Não quero apenas sugestões ou explicações. Quero que você analise os arquivos, modifique o código real, teste o resultado e entregue o projeto completo em um arquivo ZIP executável.

---

# REGRA 1 — ANALISE O PROJETO ANTES DE MODIFICAR

Antes de escrever código:

1. Extraia o ZIP original.
2. Analise todos os arquivos HTML, CSS e JavaScript.
3. Identifique a arquitetura do jogo.
4. Descubra como o personagem se movimenta.
5. Identifique como a câmera acompanha o jogador.
6. Analise o sistema de colisões.
7. Analise a inteligência artificial dos inimigos.
8. Identifique os sistemas de armas e projéteis.
9. Descubra como o mapa é desenhado.
10. Identifique animações, partículas e efeitos visuais.
11. Procure funções executadas desnecessariamente a cada quadro.
12. Verifique se existem vários loops de jogo simultâneos.
13. Procure vazamentos de memória e criação excessiva de objetos.
14. Verifique os arquivos de áudio e imagem.
15. Identifique erros no console do navegador.
16. Analise os sistemas de missões e progressão.
17. Verifique os controles de teclado e mouse.
18. Identifique recursos incompletos ou quebrados.
19. Crie uma lista dos problemas encontrados.
20. Defina uma estratégia de correção antes de reestruturar partes importantes.

Não presuma que o problema está em apenas uma função. Investigue as possíveis causas dos travamentos.

Não substitua o projeto inteiro por um jogo genérico. Trabalhe sobre a base existente.

# REGRA 2 — CORRIGIR O LAG DA CÂMERA

A câmera é uma das prioridades mais importantes deste projeto.

Quero que o personagem se movimente naturalmente pela fase, com a câmera acompanhando seus movimentos sem atrasos artificiais, tremores ou oscilações.

Implemente e avalie as seguintes melhorias:

21. Corrigir o atraso da câmera em relação ao jogador.
22. Eliminar tremores durante a movimentação.
23. Evitar que a câmera fique permanentemente atrasada.
24. Corrigir movimentos bruscos ao mudar de direção.
25. Corrigir oscilações quando o jogador para.
26. Eliminar saltos de posição durante a transição entre quadros.
27. Centralizar corretamente o jogador na área visível.
28. Implementar acompanhamento suave e consistente.
29. Usar interpolação independente da taxa de quadros.
30. Evitar que o movimento da câmera dependa diretamente do FPS.
31. Corrigir problemas de câmera em movimentos diagonais.
32. Evitar deslocamentos inesperados após reiniciar uma fase.
33. Corrigir o posicionamento da câmera ao trocar de missão.
34. Impedir que a câmera acompanhe coordenadas inválidas.
35. Evitar que a câmera ultrapasse os limites do mapa.
36. Corrigir o enquadramento em mapas pequenos.
37. Corrigir o enquadramento em mapas grandes.
38. Garantir que o jogador continue visível durante o combate.
39. Implementar limites de movimento configuráveis.
40. Separar as coordenadas do mundo das coordenadas da tela.
41. Corrigir erros de conversão entre coordenadas do mouse e do mundo.
42. Evitar que o cursor mire em uma posição incorreta após movimentar a câmera.
43. Corrigir a mira durante movimentos rápidos.
44. Evitar que o tremor da câmera prejudique a precisão das armas.
45. Impedir que a câmera continue se movimentando depois de uma transição de fase.
46. Corrigir o comportamento da câmera após a morte do jogador.
47. Sincronizar corretamente câmera, personagem e animações.
48. Eliminar cálculos redundantes de posição da câmera.
49. Evitar atualizações duplicadas da câmera.
50. Testar o comportamento da câmera em situações de combate intenso.

**Requisito técnico:** investigue se o problema decorre de interpolação inadequada, atualizações duplicadas, deltas de tempo incorretos, excesso de processamento, conversão de coordenadas ou combinação desses fatores.

Use `requestAnimationFrame` para a renderização, se compatível com a arquitetura atual, e uma estratégia consistente de atualização temporal.

Se utilizar interpolação exponencial, considere uma fórmula baseada no tempo decorrido, como `1 - Math.exp(-k * deltaTime)`, em vez de uma constante aplicada diretamente por quadro.

Evite adicionar suavização excessiva. A câmera deve responder rapidamente, sem parecer que está deslizando atrás do personagem.

**Resultado esperado:** câmera responsiva, estável, precisa e sem lag perceptível causado pela implementação.

# REGRA 3 — OTIMIZAÇÃO DO MOTOR DO JOGO

51. Implementar um loop de jogo único.
52. Impedir a criação de múltiplos loops acidentais.
53. Separar atualização da lógica e renderização quando necessário.
54. Usar `requestAnimationFrame` para desenhar os quadros.
55. Controlar corretamente o tempo entre atualizações.
56. Limitar valores extremos de `deltaTime` após pausas.
57. Evitar que o personagem atravesse paredes por causa de grandes intervalos entre quadros.
58. Eliminar cálculos repetidos e desnecessários.
59. Reduzir consultas repetitivas ao DOM.
60. Evitar alterações frequentes de elementos HTML durante o combate.
61. Reutilizar objetos temporários quando isso for vantajoso.
62. Evitar alocações excessivas de arrays e objetos.
63. Implementar reutilização de projéteis quando apropriado.
64. Implementar reutilização de partículas quando apropriado.
65. Remover partículas expiradas.
66. Remover projéteis que não podem mais afetar o jogo.
67. Remover efeitos temporários após o término.
68. Limpar eventos associados a cenas destruídas.
69. Evitar listeners duplicados.
70. Evitar temporizadores desnecessários.
71. Eliminar operações síncronas pesadas durante o combate.
72. Evitar carregar imagens repetidamente.
73. Carregar recursos apenas uma vez.
74. Otimizar a utilização de memória.
75. Evitar vazamentos de memória.
76. Reduzir o custo de atualização dos inimigos distantes.
77. Otimizar as consultas de colisão.
78. Evitar testar colisões contra todos os objetos quando não for necessário.
79. Implementar uma estrutura espacial simples se o mapa justificar.
80. Atualizar apenas os elementos dinâmicos que precisam ser atualizados.
81. Reduzir o número de operações de desenho redundantes.
82. Agrupar operações de renderização compatíveis.
83. Evitar mudanças desnecessárias de estado do Canvas.
84. Evitar filtros visuais caros em cada quadro.
85. Reduzir o processamento de elementos fora da área visível.
86. Implementar renderização seletiva de objetos distantes.
87. Otimizar a renderização de paredes e pisos.
88. Evitar recalcular a geometria estática do mapa.
89. Separar elementos estáticos e dinâmicos.
90. Evitar criar gradientes e padrões repetidamente.
91. Reutilizar recursos gráficos quando possível.
92. Otimizar efeitos de sangue e destruição.
93. Reduzir o custo de sombras.
94. Evitar animações CSS desnecessárias durante o combate.
95. Corrigir o processamento excessivo de partículas.
96. Reduzir o trabalho executado por inimigos fora da área visível.
97. Manter a lógica essencial dos inimigos fora da tela.
98. Evitar atualizações de interface que não alteram informações.
99. Otimizar a leitura das entradas do jogador.
100. Implementar uma pausa eficiente quando a aba estiver oculta, sem provocar saltos temporais ao retornar.

Não aplique todas essas técnicas cegamente. Escolha as que fazem sentido para a arquitetura real do jogo e evite criar complexidade desnecessária.

# REGRA 4 — RENDERIZAÇÃO E DESEMPENHO

101. Otimizar o desenho do cenário.
102. Melhorar o gerenciamento de camadas.
103. Separar cenário, personagens, projéteis e efeitos.
104. Evitar redesenhar elementos estáticos sem necessidade quando isso trouxer benefício mensurável.
105. Implementar cache gráfico para partes estáticas do mapa, se apropriado.
106. Corrigir problemas de escala do Canvas.
107. Corrigir o redimensionamento da janela.
108. Manter as coordenadas do jogo independentes da resolução.
109. Evitar imagens borradas após o redimensionamento.
110. Respeitar o estilo visual original de Hotline Miami.
111. Evitar o uso exagerado de filtros e transparências.
112. Otimizar os efeitos de iluminação.
113. Melhorar a estabilidade da renderização.
114. Evitar piscadas durante as transições.
115. Corrigir problemas de ordem de desenho.
116. Garantir que personagens sejam desenhados na camada correta.
117. Evitar que paredes ou objetos desapareçam indevidamente.
118. Otimizar a exibição de sprites.
119. Reutilizar sprites e imagens carregadas.
120. Verificar se o tamanho do Canvas está adequado à tela.
121. Evitar resoluções internas desnecessariamente altas.
122. Permitir ajustes gráficos quando úteis.
123. Criar uma opção para reduzir partículas.
124. Criar uma opção para reduzir efeitos visuais.
125. Permitir desativar tremor de tela.
126. Permitir ajustar o nível de efeitos de câmera.
127. Manter a interface responsiva.
128. Evitar que a interface provoque recálculos excessivos de layout.
129. Otimizar as animações da interface.
130. Garantir que os efeitos não prejudiquem a visibilidade dos inimigos.

# REGRA 5 — MOVIMENTAÇÃO DO PERSONAGEM

131. Melhorar a resposta dos controles.
132. Eliminar atrasos artificiais ao iniciar o movimento.
133. Corrigir movimentos diagonais.
134. Normalizar a velocidade diagonal.
135. Corrigir a movimentação ao pressionar várias teclas.
136. Evitar que o personagem atravesse paredes.
137. Corrigir colisões nos cantos.
138. Evitar que o personagem fique preso em obstáculos.
139. Melhorar a movimentação em corredores estreitos.
140. Corrigir o movimento junto às portas.
141. Evitar acelerações inesperadas.
142. Manter uma velocidade consistente entre diferentes taxas de quadros.
143. Corrigir a resposta após soltar as teclas.
144. Melhorar a precisão das mudanças de direção.
145. Garantir que a mira continue funcionando durante a movimentação.
146. Evitar que a animação de movimento fique dessincronizada.
147. Corrigir a movimentação após respawn.
148. Impedir movimentos involuntários durante a tela de pausa.
149. Corrigir entradas de teclado após o retorno de uma janela em segundo plano.
150. Permitir remapeamento de controles, se compatível com o projeto.

# REGRA 6 — INTELIGÊNCIA ARTIFICIAL DOS INIMIGOS

151. Melhorar a percepção dos inimigos.
152. Implementar detecção de obstáculos na linha de visão.
153. Evitar que inimigos enxerguem através de paredes.
154. Melhorar a reação dos inimigos ao barulho.
155. Criar estados de patrulha.
156. Criar estados de investigação.
157. Criar estados de perseguição.
158. Criar estados de combate.
159. Criar estados de recuo quando apropriado.
160. Melhorar a navegação em corredores.
161. Evitar que inimigos fiquem presos nas paredes.
162. Evitar que inimigos tentem atravessar obstáculos.
163. Melhorar o posicionamento dos inimigos durante o combate.
164. Evitar movimentos excessivamente robóticos.
165. Variar o tempo de reação conforme o tipo de inimigo.
166. Criar inimigos com comportamentos distintos.
167. Melhorar a reação a portas abertas.
168. Corrigir a reação a tiros.
169. Fazer inimigos investigarem sons próximos.
170. Evitar que todos os inimigos reajam de forma idêntica.
171. Melhorar a escolha de rotas.
172. Evitar cálculos de navegação completos a cada quadro.
173. Recalcular caminhos somente quando necessário.
174. Evitar que inimigos distantes consumam processamento excessivo.
175. Garantir que a IA continue correta quando a câmera não mostra o inimigo.

# REGRA 7 — COMBATE E ARMAS

176. Melhorar a resposta dos disparos.
177. Corrigir a direção dos projéteis.
178. Corrigir a precisão da mira.
179. Garantir que os projéteis usem coordenadas consistentes.
180. Melhorar as colisões entre tiros e paredes.
181. Impedir que projéteis atravessem obstáculos indevidamente.
182. Melhorar a detecção de impacto nos inimigos.
183. Criar diferenças reais entre armas.
184. Ajustar cadência de tiro.
185. Ajustar alcance.
186. Ajustar dano.
187. Ajustar dispersão.
188. Melhorar o recuo das armas.
189. Criar efeitos de disparo.
190. Melhorar os efeitos de impacto.
191. Adicionar efeitos de cápsulas e cartuchos quando apropriado.
192. Melhorar o comportamento de armas corpo a corpo.
193. Corrigir a distância dos ataques corpo a corpo.
194. Evitar ataques que atinjam alvos muito distantes.
195. Melhorar a troca de armas.
196. Corrigir a munição.
197. Implementar recarga se compatível com o sistema existente.
198. Melhorar a coleta de armas.
199. Evitar duplicação de armas no cenário.
200. Garantir que o combate continue fluido com muitos projéteis.

# REGRA 8 — NOVAS ARMAS E VARIEDADE DE COMBATE

201. Criar uma categoria de pistolas.
202. Criar uma categoria de submetralhadoras.
203. Criar uma categoria de espingardas.
204. Criar uma categoria de rifles.
205. Criar armas corpo a corpo.
206. Criar armas pesadas quando compatíveis com o equilíbrio do jogo.
207. Diferenciar armas pelo som.
208. Diferenciar armas pela cadência.
209. Diferenciar armas pelo recuo.
210. Diferenciar armas pela capacidade de munição.
211. Criar feedback visual para falta de munição.
212. Melhorar a representação das armas no personagem.
213. Corrigir a orientação das armas.
214. Corrigir a animação de ataque.
215. Criar indicadores visuais de coleta.
216. Garantir que cada arma seja funcional.
217. Evitar armas meramente decorativas.
218. Evitar armas excessivamente poderosas.
219. Testar o equilíbrio entre combate corpo a corpo e armas de fogo.
220. Preservar as armas existentes que já funcionam.

# REGRA 9 — MAPAS, AMBIENTES E DESTRUIÇÃO

221. Melhorar a variedade visual dos ambientes.
222. Criar salas com formatos distintos.
223. Melhorar os corredores.
224. Criar áreas abertas e fechadas.
225. Melhorar a distribuição dos obstáculos.
226. Criar objetos de cenário.
227. Melhorar a organização das paredes.
228. Corrigir colisões dos objetos.
229. Melhorar a navegação em ambientes complexos.
230. Criar elementos destrutíveis quando apropriado.
231. Criar portas funcionais.
232. Melhorar a interação com portas.
233. Criar áreas com diferentes níveis de iluminação.
234. Melhorar a identidade visual de cada fase.
235. Criar pontos de entrada e saída.
236. Melhorar a localização dos inimigos.
237. Evitar pontos de surgimento impossíveis.
238. Impedir que inimigos apareçam dentro de paredes.
239. Criar objetos que sirvam de cobertura.
240. Garantir que a cobertura funcione de verdade.
241. Melhorar a navegação em torno de móveis.
242. Corrigir colisões nos limites do mapa.
243. Criar variações ambientais.
244. Evitar que a geração de cenários prejudique o desempenho.
245. Reutilizar dados de mapas quando possível.

# REGRA 10 — MISSÕES E PROGRESSÃO

246. Criar uma estrutura de missões consistente.
247. Permitir objetivos diferentes entre fases.
248. Criar missões de eliminação de alvos.
249. Criar missões de sobrevivência.
250. Criar missões com limite de tempo.
251. Criar missões com armas específicas.
252. Criar missões com objetivos secundários.
253. Criar missões com inimigos especiais.
254. Criar uma sequência coerente de fases.
255. Implementar telas de introdução.
256. Melhorar as transições entre missões.
257. Exibir objetivos claramente.
258. Atualizar os objetivos quando forem cumpridos.
259. Criar condições de vitória confiáveis.
260. Corrigir condições de derrota.
261. Evitar que uma fase termine prematuramente.
262. Evitar que uma fase fique impossível de concluir.
263. Implementar reinício de missão.
264. Implementar progressão entre fases.
265. Criar um sistema de desbloqueio.
266. Salvar o progresso localmente quando apropriado.
267. Evitar perda de progresso após recarregar a página.
268. Implementar um sistema de conclusão de campanha.
269. Criar uma tela de resultados.
270. Preservar todas as missões já existentes.

# REGRA 11 — INTERFACE E EXPERIÊNCIA DO JOGADOR

271. Melhorar o menu principal.
272. Melhorar a tela de pausa.
273. Criar uma tela de configurações.
274. Melhorar o indicador de munição.
275. Melhorar os indicadores de vida, caso o jogo possua esse sistema.
276. Exibir objetivos ativos.
277. Melhorar a apresentação dos resultados.
278. Criar feedback visual para acertos.
279. Criar feedback para receber dano.
280. Melhorar os indicadores de interação.
281. Criar mensagens de tutorial.
282. Permitir desativar tutoriais já conhecidos.
283. Melhorar o menu de seleção de fases.
284. Criar indicadores de carregamento quando necessários.
285. Evitar telas de carregamento desnecessárias.
286. Melhorar a legibilidade dos textos.
287. Manter o estilo visual inspirado em Hotline Miami.
288. Melhorar a consistência das cores.
289. Melhorar os efeitos de seleção dos menus.
290. Garantir que os menus não bloqueiem indevidamente o jogo.
291. Corrigir o comportamento do mouse nos menus.
292. Corrigir o foco do teclado.
293. Permitir navegar pelos menus com teclado.
294. Corrigir os botões de reiniciar e continuar.
295. Garantir que todas as opções funcionem.

# REGRA 12 — ÁUDIO E EFEITOS SONOROS

296. Melhorar o áudio dos disparos.
297. Melhorar o áudio dos impactos.
298. Melhorar os sons de passos.
299. Adicionar sons de portas.
300. Melhorar os sons de armas corpo a corpo.
301. Criar sons de alerta dos inimigos.
302. Melhorar os sons dos menus.
303. Implementar controle de volume.
304. Permitir silenciar efeitos sonoros.
305. Permitir silenciar a música.
306. Evitar iniciar o mesmo som várias vezes indevidamente.
307. Reutilizar recursos de áudio quando apropriado.
308. Evitar acumular fontes de áudio desnecessárias.
309. Corrigir problemas de sincronização de áudio.
310. Garantir compatibilidade com as restrições de reprodução automática dos navegadores.
311. Evitar que o áudio provoque travamentos.
312. Manter os efeitos sonoros sincronizados com os eventos do jogo.
313. Evitar sons repetitivos excessivamente incômodos.
314. Implementar transições de volume suaves quando necessário.
315. Preservar os arquivos de áudio existentes.

# REGRA 13 — ANIMAÇÕES E EFEITOS VISUAIS

316. Melhorar as animações de movimento.
317. Melhorar as animações de ataque.
318. Melhorar as animações de morte.
319. Melhorar as animações dos inimigos.
320. Corrigir transições entre estados de animação.
321. Evitar animações travadas.
322. Sincronizar animações com a lógica do jogo.
323. Melhorar os efeitos de sangue.
324. Melhorar os efeitos de impacto.
325. Criar partículas de disparo.
326. Melhorar os efeitos de destruição.
327. Criar efeitos de tela para eventos importantes.
328. Implementar tremor de câmera opcional e controlado.
329. Permitir desativar tremores de tela.
330. Evitar efeitos que prejudiquem a mira.
331. Melhorar as transições de fase.
332. Evitar animações que continuem após o fim da cena.
333. Evitar partículas que persistam indefinidamente.
334. Otimizar efeitos simultâneos.
335. Garantir que os efeitos sejam visualmente consistentes.

# REGRA 14 — SISTEMAS ADICIONAIS

336. Implementar salvamento de configurações.
337. Permitir configurar sensibilidade da mira.
338. Permitir configurar o volume.
339. Permitir configurar a intensidade dos efeitos.
340. Criar uma opção para reduzir a carga gráfica.
341. Implementar pausa confiável.
342. Corrigir o reinício após a morte.
343. Evitar duplicação de estados do jogo.
344. Centralizar o gerenciamento de estados.
345. Separar menu, jogo, pausa e resultados.
346. Evitar que os controles atuem durante as telas erradas.
347. Melhorar o tratamento de erros.
348. Evitar erros silenciosos.
349. Registrar informações úteis para diagnóstico.
350. Garantir que erros de recursos não destruam toda a partida.

# REGRA 15 — COMPATIBILIDADE E ESTABILIDADE

351. Testar o jogo em diferentes tamanhos de janela.
352. Corrigir problemas de tela cheia.
353. Corrigir problemas de redimensionamento.
354. Garantir que os controles funcionem após perder e recuperar o foco.
355. Evitar que a página role durante o jogo quando isso não for desejado.
356. Evitar seleção acidental de textos durante o combate.
357. Garantir carregamento correto dos arquivos locais.
358. Corrigir caminhos de imagens, sons e scripts.
359. Evitar dependências externas desnecessárias.
360. Preservar a possibilidade de executar o jogo localmente.
361. Garantir que o projeto não dependa de um servidor externo sem necessidade.
362. Corrigir erros de JavaScript.
363. Corrigir referências a elementos inexistentes.
364. Corrigir eventos que deixam de funcionar após reiniciar.
365. Verificar o comportamento em navegadores modernos.
366. Evitar incompatibilidades causadas por recursos experimentais.
367. Garantir que o jogo continue funcionando depois de várias partidas.
368. Corrigir falhas ao iniciar uma nova missão.
369. Corrigir falhas ao voltar ao menu.
370. Corrigir falhas após a morte do jogador.

# REGRA 16 — TESTES DE DESEMPENHO

371. Medir o tempo gasto na atualização da lógica.
372. Medir o tempo gasto na renderização.
373. Investigar quedas de FPS.
374. Identificar funções que consomem mais tempo.
375. Comparar o desempenho antes e depois das otimizações.
376. Testar cenas com muitos inimigos.
377. Testar cenas com muitos projéteis.
378. Testar cenas com muitas partículas.
379. Testar movimentos rápidos da câmera.
380. Testar mudanças bruscas de direção.
381. Testar a movimentação junto às paredes.
382. Testar o jogo após permanecer aberto por vários minutos.
383. Testar reinícios repetidos de missão.
384. Testar o comportamento após alternar entre janelas.
385. Verificar o crescimento da memória.
386. Verificar se os objetos temporários são liberados.
387. Testar os menus.
388. Testar o carregamento dos recursos.
389. Verificar erros no console.
390. Registrar problemas encontrados.
391. Corrigir os problemas identificados.
392. Repetir os testes depois das correções.
393. Comparar resultados com a versão original.
394. Evitar declarar uma melhoria como concluída sem verificá-la.
395. Produzir um relatório final de desempenho.

# REQUISITOS TÉCNICOS OBRIGATÓRIOS

## A. Tempo e movimentação

A velocidade de movimentação não pode depender diretamente do número de quadros por segundo.

Use o tempo decorrido para calcular deslocamentos e animações. Se o projeto utilizar um loop com atualização fixa, mantenha a renderização separada quando isso trouxer benefícios reais.

Evite atualizações temporais extremas depois que a aba ficar inativa.

## B. Câmera

Mantenha uma única fonte de verdade para a posição da câmera.

Não atualize a câmera em vários locais diferentes do código.

A conversão entre coordenadas do mundo e coordenadas da tela precisa ser consistente para personagens, inimigos, projéteis, mouse e efeitos.

Não corrija o lag apenas diminuindo a suavização sem investigar sua origem.

## C. Colisões

Evite colisões calculadas de maneira inconsistente entre a atualização da lógica e a renderização.

Considere a velocidade dos objetos e os intervalos entre atualizações para evitar que personagens ou projéteis atravessem paredes.

## D. Memória

Evite criar objetos temporários em grandes quantidades a cada quadro.

Utilize reutilização de objetos somente quando isso simplificar ou melhorar o desempenho. Não implemente sistemas complexos de reutilização sem necessidade.

## E. Renderização

Se o jogo utilizar Canvas 2D, investigue o uso de camadas, cache de cenários estáticos e redução de desenhos redundantes.

Não introduza WebGL ou bibliotecas pesadas sem uma justificativa técnica concreta.

## F. Compatibilidade

Mantenha HTML, CSS e JavaScript compatíveis com a estrutura do projeto.

Não adicione dependências externas sem necessidade.

Não remova funcionalidades existentes apenas para simplificar a implementação.

# REGRA 17 — PRESERVAÇÃO DO PROJETO ORIGINAL

Antes de modificar qualquer arquivo, preserve uma cópia da versão original.

Não remova missões, armas, personagens, sons, sprites, menus, sistemas de combate ou outras funcionalidades que já funcionem.

Não substitua os mapas existentes por salas genéricas.

Não troque o estilo visual do projeto por um design completamente diferente.

Não transforme o jogo em uma demonstração simplificada.

Se precisar reestruturar um sistema, mantenha as funcionalidades anteriores e corrija os problemas de forma compatível.

Se alguma funcionalidade não puder ser implementada com segurança, explique o motivo em vez de fingir que está funcionando.

# REGRA 18 — ENTREGA FINAL OBRIGATÓRIA

Quando terminar:

1. Gere todos os arquivos atualizados.
2. Preserve todos os recursos necessários.
3. Confira os caminhos relativos dos arquivos.
4. Teste o carregamento do jogo.
5. Teste a movimentação do personagem.
6. Teste a câmera.
7. Teste o combate.
8. Teste as colisões.
9. Teste os inimigos.
10. Teste o reinício de fases.
11. Teste a pausa.
12. Teste o menu.
13. Teste a progressão das missões.
14. Verifique os erros de JavaScript.
15. Verifique se os recursos de áudio e imagem carregam.
16. Confirme que as otimizações não quebraram os sistemas existentes.
17. Gere um arquivo ZIP completo.
18. Inclua todos os arquivos necessários para executar o jogo.
19. Inclua um relatório com os principais problemas encontrados.
20. Inclua uma lista das melhorias realmente implementadas.
21. Informe quais testes foram executados.
22. Informe eventuais limitações que ainda existam.
23. Disponibilize o ZIP final para download.

Não entregue somente trechos de código.

Não entregue apenas um HTML se o projeto depender de outros arquivos.

Não diga que o jogo foi testado se você não executou os testes.

Não invente resultados de FPS ou benchmarks.

Se não houver ambiente de navegador disponível para executar testes reais, informe essa limitação e realize todas as verificações estáticas e automatizadas possíveis.

# ORDEM DE EXECUÇÃO

Trabalhe nesta ordem:

FASE 1 — Diagnóstico do projeto.

FASE 2 — Correção dos travamentos e do lag da câmera.

FASE 3 — Otimização do loop de jogo, renderização, colisões e memória.

FASE 4 — Correção da movimentação, mira e combate.

FASE 5 — Melhorias na inteligência artificial.

FASE 6 — Melhorias nas missões, armas e mapas.

FASE 7 — Melhorias de interface, áudio e efeitos.

FASE 8 — Testes de regressão e desempenho.

FASE 9 — Correção dos problemas encontrados nos testes.

FASE 10 — Geração do ZIP final e relatório.

Se houver pouco tempo ou limite de execução, priorize primeiro a estabilidade, o desempenho e a câmera. Depois implemente as melhorias de conteúdo.

# RESULTADO FINAL ESPERADO

Quero um Hotline Miami mais completo, com combate responsivo, movimentação precisa, inimigos inteligentes, missões funcionais e efeitos visuais de qualidade.

A câmera precisa acompanhar o personagem de maneira natural, sem tremores, atrasos artificiais ou mudanças bruscas de posição.

O jogo precisa manter um desempenho estável, com menos travamentos, processamento desnecessário e problemas de memória.

Todas as melhorias devem ser integradas ao projeto existente, preservando os recursos que já funcionam.

**Não quero apenas 395 alterações superficiais. Quero correções reais, sistemas funcionais, otimizações verificáveis e um jogo completo. A qualidade e a estabilidade são mais importantes do que adicionar recursos sem testar.**
