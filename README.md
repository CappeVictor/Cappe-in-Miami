# CAPPE IN MIAMI
### Uma cidade, várias máscaras e nenhum inocente.

---

## 🎛️ Sobre o Jogo
**CAPPE IN MIAMI** é um jogo de ação tática *top-down* de alta octanagem, ambientado em uma versão distópica e retro-futurista de 1989. O título combina mecânicas de morte instantânea, planejamento rápido de movimentos, combate visceral com armas de fogo e brancas, e uma forte estética Vaporwave/Synthwave baseada nas icônicas engines de 8-bits e 16-bits da época.

---

## 🧠 História e Lore (O Enredo Completo)

### Miami, 1989.
Sob o brilho violento das lâmpadas de neon, do vapor denso que corta os becos escuros e do som sintético e acelerado das pistas de dança, esconde-se uma metrópole apodrecida. A Máfia Russa e as gangues locais dividem o controle das ruas, a polícia fecha os olhos por maços de dólares sujos e a vida humana vale menos que uma dose de cocaína barata.

No epicentro desse pesadelo psicodélico está **Cappe**, um homem fragmentado, assombrado por traumas que a sua própria mente tentou apagar para protegê-lo. Cappe vive isolado em um apartamento decadente, tentando juntar os pedaços de um passado militar ou governamental que foi cirurgicamente esquecido.

### O Despertar do Telefone
A rotina de torpor de Cappe é estraçalhada quando sua secretária eletrônica passa a gravar mensagens cifradas e perturbadoras. Disfarçadas como "pedidos de pizza", "entregas de lavanderia" ou "manutenção de condomínio", a voz distorcida do outro lado da linha fornece apenas três dados: um endereço, um horário e uma instrução implícita.

A missão nunca muda: **Entre. Mate todos. Não deixe testemunhas. Saia.**

Sem perguntas. Sem hesitação. Apenas a linha discada, o estalo do telefone no gancho e o rastro de sangue. Cappe se descobre uma máquina de matar implacável, operando em um transe de violência pura do qual ele não consegue — ou não quer — escapar.

### O Mistério por Trás das Ligações
À medida que os tapetes de Miami vão sendo manchados de vermelho, Cappe percebe que a contagem de corpos obedece a uma lógica geopolítica e criminosa secreta. Os alvos não são bandidos comuns; são peças-chave de um sindicato clandestino conhecido como *Os Operadores*, que controla o narcotráfico, a lavagem de dinheiro e o suborno de juízes e senadores da Flórida.

Mas o horror real reside nos detalhes: a voz misteriosa do telefone parece conhecer os segredos mais profundos e sombrios do passado de Cappe — gatilhos mentais que despertam habilidades letais esquecidas. Junto com os telefonemas, caixas de papelão misteriosas começam a surgir na sua porta, contendo máscaras de borracha de animais. Elas não servem apenas para esconder seu rosto da polícia; elas despertam instintos assassinos latentes, alterando sua percepção da realidade e fragmentando ainda mais a sua sanidade.

### A Revelação e o Confronto Final
Na reta final, Cappe descobre que a voz no telefone não é um inimigo externo, mas sim um antigo comandante de um programa militar experimental de controle mental do qual ele fez parte — e que as máscaras são âncoras psicológicas usadas para ativá-lo como um assassino adormecido. Os alvos eliminados eram os antigos financiadores do projeto que tentaram queimar os arquivos e apagar as pontas soltas.

Cappe é forçado a tomar uma decisão: continuar sendo um peão descartável no tabuleiro de xadrez de um fantasma do passado ou usar o próprio rastro de sangue para caçar a origem das chamadas telefônicas e arrancar a verdade das entranhas de Miami. A verdade tem um preço alto, e é pago em sangue. No final, as máscaras vão cair, mas a pele por baixo delas já terá sido consumida pela violência.

**Você não sabe quem está dando as ordens. Só sabe que o telefone está tocando de novo.**

---

## 🎭 Sistema de Máscaras (Personagens)
As máscaras que Cappe veste antes de arrombar as portas alteram os atributos do motor do jogo em tempo real através do arquivo `js/exp-modes.js`:

*   🦊 **RICHARD (Sapo):** O equilíbrio frio. Atributos, velocidade e física padrão de combate. Ideal para jogadores que preferem a jogabilidade clássica.
*   🐯 **TONY (Tigre):** A fúria brutal. Aumenta a velocidade de movimento em +20% e transforma o ataque físico em morte instantânea ('melee instant kill'), porém bloqueia completamente a habilidade de coletar ou disparar armas de fogo.
*   🐺 **DENNIS (Lobo):** O predador cirúrgico. Spawna na fase equipado com uma faca e aumenta o raio de atração para coletar armas caídas no chão em +50%.
*   🦉 **RASMUS (Coruja):** A paranoia hiper-vigilante. Ativa um filtro ultravioleta neon no Canvas que renderiza um contorno roxo brilhante ao redor de passagens secretas, pontos cegos e itens críticos.

---

## 🏢 Progressão de Fases e Cenários
O jogo se expande através de uma árvore de progressão de níveis baseada em matrizes sólidas de blocos (`Grid-Tiles`) configuradas no arquivo `js/maps.js`:

1.  **Fase 1 - "O Hospital" (The Neon Ward):** Corredores estreitos e salas pequenas em tons clínicos de branco e ciano. Foco absoluto em combate corpo a corpo, emboscadas atrás das portas e desvio rápido de cantos cegos.
2.  **Fase 2 - "O Clube Synthwave" (Overdrive Discotheque):** Um grande salão central com uma pista de dança pulsante. Alta densidade de divisórias de vidros interativos, exigindo precisão para não ser visto pelos capangas através da vidraça.
3.  **Fase 3 - "A Sede da Máfia" (The Golden Dragon):** O reduto final do sindicato. Layout complexo com rotas de patrulha cruzadas, inimigos altamente armados com fuzis automáticos e gatilhos de alerta acústico instantâneo.

---

## 🕹️ Mecânicas de Gameplay Avançadas
*   **Morte Instantânea:** Um único tiro ou golpe físico, tanto seu quanto dos inimigos, causa a morte imediata e reseta o cenário, forçando o aprendizado por tentativa e erro.
*   **Raycasting de Visão Real:** Os inimigos calculam linhas de visão diretas baseadas na geometria do mapa. Paredes sólidas cortam a visão, mas os novos blocos de vidro mantêm a linha ativa.
*   **Alerta Acústico Dinâmico:** Disparar uma arma de fogo gera um ruído que viaja pelo mapa. Qualquer inimigo no raio do som abandonará sua patrulha para caçar a origem do barulho.
*   **Física de Deslizamento de Eixo:** Movimentação diagonal normalizada que impede o personagem de travar ao raspar nas quinas das paredes, mantendo o ritmo frenético.

---

## 🔧 Instruções de Instalação e Execução (O Jogo Extraído Melhora!)

> ⚠️ **IMPORTANTE:** Para que o motor de jogo funcione com performance máxima, carregue todos os scripts corretamente e execute os efeitos visuais sem travamentos, **você deve obrigatoriamente extrair o arquivo compactado**. O jogo executado de dentro de uma pasta temporária ou diretamente do arquivo `.zip` sofrerá bugs de carregamento de caminhos locais e lentidão de FPS.

### Passo a Passo para Instalação:
1. Baixe o pacote comprimido do projeto (`Cappe-in-Miami-v4-original.zip`).
2. Clique com o botão direito sobre o arquivo `.zip` e selecione **"Extrair Aqui"** ou **"Extrair para Cappe-in-Miami/"** utilizando um software como WinRAR, 7-Zip ou o descompactador nativo do seu sistema operacional.
3. Certifique-se de que a árvore de diretórios mantenha a estrutura modular correta após a extração física:
   ```text
   📂 Cappe-in-Miami/
   ├── 📄 index.html
   ├── 📄 README.md
   ├── 📂 css/
   │   └── 📄 expansion.css
   ├── 📂 js/
   │   ├── 📄 maps.js
   │   ├── 📄 exp-core.js
   │   ├── 📄 exp-world.js
   │   ├── 📄 exp-modes.js
   │   ├── 📄 exp-fx.js
   │   └── 📄 collision_sizes.js
   └── 📂 assets/
       └── 📂 sprites/
           └── (Todos os arquivos de imagem .png organizados)
   ```
4. Navegue até a pasta extraída e dê dois cliques no arquivo principal **`index.html`** para executá-lo instantaneamente em seu navegador web de preferência (Chrome, Edge, Firefox, Opera ou Safari). 

*Nota: O jogo roda 100% no cliente de forma nativa e otimizada por conta da separação de scripts em arquivos locais após a extração, sem a necessidade de instalar servidores node.js, python ou dependências externas.*

---
*CAPPE IN MIAMI — A cidade nunca dorme. E os segredos nunca ficam enterrados.*
