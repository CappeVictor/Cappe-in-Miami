# 🎮 Cappe in Miami

![Banner do Jogo](https://placeholder.com)

> **Uma releitura e expansão tática top-down inspirada no universo violento e frenético de Hotline Miami, reimaginada com capivaras e animais da fauna sul-americana no submundo do crime.**

---

## 📝 Sobre o Jogo
**Cappe in Miami** é um jogo de ação tática acelerada construído inteiramente sobre tecnologias web nativas (**HTML5, Canvas 2D e JavaScript ES6 puro**). 

No controle de **Cappe**, uma capivara altamente treinada e letal, o jogador deve se infiltrar em complexos criminosos fortemente protegidos, utilizando reflexos rápidos, precisão cirúrgica e um arsenal variado de armas brancas e de fogo para eliminar ameaças em cenários que testam tanto o planejamento estratégico quanto a velocidade mecânica.

### ✨ Funcionalidades Principais
* **Letalidade Extrema (One-Hit-Kill):** Erros são punidos instantaneamente; tanto o jogador quanto a grande maioria dos oponentes caem com um único golpe ou tiro certeiro.
* **Sistema Avançado de Visão e Oclusão (Raycasting):** Linhas de visão dinâmicas realistas em tempo real, onde paredes, portas e estruturas bloqueiam e moldam os campos de visão de aliados e inimigos (Fog of War).
* **Inteligência Artificial de Patrulha e Alerta:** Inimigos possuem rotas de patrulhamento estritas, reagem a estímulos sonoros (como tiros ou quebra de vidros) e entram em modo de perseguição agressiva ao detectar o intruso.
* **Mecânicas de Arremesso e Desarmamento:** Ficou sem munição? Arremesse sua arma atual contra um oponente para nocauteá-lo temporariamente e roubar o equipamento dele antes que ele se levante.
* **Variedade de Ambientes:** Avanço modular por fases simulando Boates (*Clubs*), complexos de escritórios, Hospitais, Delegacias e mansões de luxo.

---

## 👥 Personagens e Facções

O universo de *Cappe in Miami* é habitado por animais antropomórficos com sprites customizados e funções bem definidas no ecossistema da gameplay:

### 🗡️ Protagonista (Jogador)
* **Cappe (A Capivara):** O executor definitivo. Silencioso, ágil e adaptável a qualquer arma disponível no chão.

### 🎭 Operativos e Máscaras (Assets Culto)
O ecossistema gráfico conta com representações de animais icônicos que alteram a percepção estética e contextual das missões:
* **Lobo 🐺 / Leão 🦁 / Tigre 🐯 / Coelho 🐰 / Coruja 🦉 / Macaco 🐒 / Galo ⚗️ / Cavalo 🐴 / Porco 🐷 / Elefante 🐘 / Sapo 🐸**

### 👑 Inimigos e Ameaças (Enemies)
* **Club Walkers (Gângsteres de Boate):** Patrulham armados com bastões e armas de curto alcance. Movimentam-se de forma previsível até serem alertados.
* **Uzi / M16 Patrols (Patrulhas Armadas):** Inimigos perigosos de longo alcance que disparam rajadas assim que o jogador entra em seu campo de visão.
* **SWAT / Bodyguards (Unidades Pesadas):** Oponentes blindados que exigem aproximação furtiva ou reações ainda mais rápidas para serem neutralizados.
* **Chefes de Fase (Stage Bosses):** Alvos de alto valor com arenas e comportamentos únicos de combate, incluindo veículos de fuga e mecânicas integradas ao cenário (*Boss Car 2*, *Boss Fountain*).

---

## 🖥️ Requisitos do Sistema

Por ser um projeto puramente baseado em Canvas do navegador, o jogo é extremamente leve e altamente acessível.

| Componente | Requisitos Mínimos | Requisitos Recomendados |
| :--- | :--- | :--- |
| **Sistema Operacional** | Windows 7 / macOS 10.12 / Linux | Windows 10/11 / macOS recente |
| **Processador** | Intel Core i3 Dual-Core de 2.0 GHz | Intel Core i5 Quad-Core ou superior |
| **Memória RAM** | 4 GB RAM | 8 GB RAM |
| **Navegador** | Google Chrome ou Firefox atualizados | Google Chrome, Opera ou Firefox com aceleração de hardware ativa |
| **Armazenamento** | 50 MB de espaço livre | 50 MB de espaço disponível (SSD) |

---

## ⚙️ Arquitetura de Código (Módulos JavaScript)

O projeto adota uma arquitetura limpa, modular e orientada a eventos para garantir máxima performance de renderização no Canvas:

* **`index.html` / `expansion.css`:** O ponto de entrada da aplicação. Configura o contêiner do Canvas e gerencia a interface responsiva de menus usando estilos modernos.
* **`js/maps.js`:** Banco de dados geométrico do jogo. Contém a definição das matrizes estruturais de paredes, posicionamento de portas e coordenadas de spawn de itens/inimigos para cada andar.
* **`js/exp-core.js`:** O cérebro do jogo. Controla o Game Loop principal, regulando as taxas de atualização lógica (`update`) e desenho na tela (`render`) com suporte a sincronização via `requestAnimationFrame`.
* **`js/exp-world.js`:** Motor de física e colisão. Gerencia caixas de colisão delimitadoras (*Bounding Boxes*), o sistema de raycasting de visão e resolve as interações físicas entre o jogador e as paredes.
* **`js/exp-content.js` & `js/collision_sizes.js`:** Dicionários de configuração de dados. Armazenam as dimensões exatas de colisão de objetos estáticos (camas, mesas, sofás hospitalares) e folhas de sprites (*Spritesheets*).
* **`js/exp-fx.js`:** Motor de efeitos visuais. Gerencia poças de sangue procedurais, partículas de cartuchos deflagrados, flashes de disparos (*muzzle flashes*) e tremores de tela (*screen shake*).
* **`js/exp-modes.js` & `js/exp-ui.js`:** Máquina de estados do jogo. Controla as transições entre os estados de Menu, Gameplay, Pausa, Game Over e Vitória, além de desenhar o HUD dinâmico na tela.
* **`js/exp-debug.js`:** Ferramentas de desenvolvimento. Permite a renderização visual das linhas de visão e caixas de colisão em tempo real para fins de balanceamento de fases.

---

## 🕹️ Controles do Jogo

### Teclado e Mouse (Padrão)
* **`W, A, S, D`**: Movimentação do personagem pelo mapa.
* **`Movimento do Mouse`**: Mira e rotaciona o campo de visão em 360 graus.
* **`Clique Esquerdo (LMB)`**: Ataque físico (com arma branca) ou disparo de arma de fogo.
* **`Clique Direito (RMB)`**: Arremessa a arma atual na direção do ponteiro / Coleta uma nova arma do chão.
* **`Barra de Espaço`**: Execução rápida no chão (quando um inimigo estiver caído ou nocauteado).
* **`Shift (Segurar)`**: Desloca a câmera na direção do mouse para estender o campo de visão panorâmico.
* **`R`**: Reinício instantâneo da fase (Rápido Respawn).
* **`ESC`**: Pausa o jogo e exibe o painel de opções.

---

## 🚀 Como Executar o Projeto Localmente

Devido às restrições de segurança de navegadores modernos (CORS) ao carregar scripts e assets locais via protocolo `file://`, é altamente recomendado rodar o jogo através de um servidor local simples.

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com
cd Cappe-in-Miami
```

### Passo 2: Iniciar um Servidor Local
Escolha um dos métodos abaixo dependendo do ambiente instalado em sua máquina:

* **Utilizando Python (3.x):**
  ```bash
  python -m http.server 8000
  ```
* **Utilizando Node.js (via http-server):**
  ```bash
  npx http-server -p 8000
  ```
* **Utilizando Visual Studio Code:**
  Instale a extensão **Live Server**, abra a pasta do projeto e clique no botão **"Go Live"** no canto inferior direito do editor.

### Passo 3: Jogar
Abra seu navegador de preferência e navegue até o endereço local correspondente (geralmente `http://localhost:8000`).

---

## ✒️ Autores e Créditos
* **[Seu Nome ou Nome da Equipe]** - *Programação de Sistemas, Design de Fases, Arquitetura e Engenharia do Jogo*.
* **Dennaton Games & Devolver Digital** - *Criadores originais da franquia Hotline Miami, cuja direção de arte, trilha sonora e estilo de jogabilidade serviram como base para este projeto acadêmico/fã*.

---

## 📄 Licença
Este é um projeto sem fins lucrativos desenvolvido estritamente para propósitos de estudo, portfólio e entretenimento de fãs. Todos os direitos associados à franquia original pertencem aos seus respectivos criadores legais.
