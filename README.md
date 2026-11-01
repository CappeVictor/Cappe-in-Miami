# 🎮 Cappe in Miami

![Banner do Jogo](https://placeholder.com)

> **Uma releitura e expansão fan-made inspirada no universo tático e brutal de Hotline Miami, estrelada por capivaras e outros animais nativos.**

---

## 📝 Sobre o Jogo
**Cappe in Miami** é um jogo tático de ação top-down em ritmo acelerado, desenvolvido utilizando tecnologias web modernas (**HTML5, Canvas e JavaScript nativo**).

O jogo se passa em uma Miami alternativa e antropomórfica, onde o jogador assume o papel de uma capivara assassina que deve limpar andares inteiros repletos de gângsteres e seguranças fortemente armados, utilizando reflexos rápidos, furtividade e uma variedade de armas brancas e de fogo.

### ✨ Funcionalidades Principais
* **Combate One-Hit-Kill:** Assim como na sua maior inspiração, tanto você quanto seus inimigos morrem com apenas um único golpe ou tiro certeiro.
* **Inteligência Artificial Dinâmica:** Inimigos patrulham, investigam barulhos de tiros, entram em estado de alerta e perseguem o jogador ao avistá-lo.
* **Visão Dinâmica (Fog of War):** Linhas de visão realistas onde paredes bloqueiam o que o jogador e os inimigos conseguem enxergar.
* **Variedade de Cenários:** Mapas que simulam boates (Clubs), hospitais, delegacias e complexos de luxo.

---

## 👥 Personagens e Máscaras

O jogo utiliza um sistema de animais antropomórficos, representados por assets gráficos dedicados na engine:

### 🗡️ Protagonista (Jogador)
* **Cappe (A Capivara):** O executor silencioso controlado pelo jogador, capaz de se disfarçar e utilizar diferentes táticas de infiltração.

### 🎭 Sistema de Animais / Aliados (Assets)
* **Sapo 🐸 / Elefante 🐘 / Porco 🐷 / Cavalo 🐴 / Galo 🐓 / Macaco 🐒 / Coelho 🐰 / Coruja 🦉 / Lobo 🐺 / Leão 🦁 / Tigre 🐯:** Elementos que compõem o universo visual de máscaras e modificadores clássicos da franquia.

### 👑 Inimigos e Facções (Enemies)
* **Gângsteres Comuns (Club Walkers):** Patrulham os salões com tacos e armas leves.
* **Seguranças Armados (M16 / Uzi Patrols):** Atiram assim que detectam a presença do jogador no recinto.
* **Equipes da SWAT:** Unidades táticas pesadas acionadas em estágios avançados do jogo.
* **Chefes (Bosses):** Alvos principais localizados no último andar de complexos específicos, possuindo barras de vida ou padrões de ataque únicos (ex: *Boss Car*, *Boss Fountain*).

---

## 🖥️ Requisitos do Sistema

Por ser um jogo construído inteiramente sobre tecnologias web nativas, ele roda direto no navegador de forma extremamente leve.

| Componente | Requisitos Mínimos | Requisitos Recomendados |
| :--- | :--- | :--- |
| **Sistema Operacional** | Windows 7 / macOS 10.12 / Linux | Windows 10/11 / macOS mais recente |
| **Processador** | Intel Core i3 ou equivalente | Intel Core i5 / AMD Ryzen 3 ou superior |
| **Memória RAM** | 4 GB RAM | 8 GB RAM |
| **Navegador** | Google Chrome, Firefox ou Edge atualizado | Google Chrome ou Firefox (com aceleração de hardware) |
| **Armazenamento** | 50 MB de espaço disponível | 50 MB de espaço disponível (SSD) |

---

## ⚙️ Como Executar o Projeto (Para Desenvolvedores)

Se você deseja abrir o projeto localmente para jogar ou modificar o código-fonte, siga os passos abaixo:

### Pré-requisitos
* Um navegador web moderno com suporte a HTML5 Canvas.
* Uma extensão de servidor local (como *Live Server* no VS Code) ou Python instalado para evitar problemas de CORS com arquivos locais.

### Passo a Passo
1. Clone este repositório para a sua máquina local:
   ```bash
   git clone https://github.com
   ```
2. Navegue até a pasta do projeto:
   ```bash
   cd Cappe-in-Miami
   ```
3. Inicie um servidor local. Se tiver o Python instalado, execute:
   ```bash
   python -m http.server 8000
   ```
4. Abra o seu navegador e acesse: `http://localhost:8000/index.html`.

---

## 🕹️ Como Jogar (Controles Básicos)

### Teclado e Mouse
* `W, A, S, D`: Movimentação da Capivara.
* `Mouse (Mirar)`: Direciona o olhar e a mira do personagem.
* `Clique Esquerdo`: Atacar / Atirar.
* `Clique Direito`: Arremessar arma atual / Pegar arma do chão.
* `Espaço`: Execuções no chão (Inimigos caídos).
* `Shift`: Estender a visão (Olhar mais longe).

---

## 🛠️ Arquitetura e Tecnologias Utilizadas

O jogo foi estruturado de forma modular dividida em submódulos JavaScript para melhor manutenção:

* **HTML5 Canvas:** Renderização 2D em tempo real para gráficos baseados em sprites em alta performance.
* **JavaScript Nativo (ES6):**
  * `index.html` / `maps.js`: Inicialização e definição da estrutura de matriz dos mapas.
  * `exp-core.js`: O núcleo da engine do jogo, controlando o loop principal (update/render).
  * `exp-world.js`: Gerenciamento do estado global, física do mundo e colisões de cenário.
  * `exp-content.js` / `collision_sizes.js`: Configurações de tamanho e caixas de colisão de objetos e sprites.
  * `exp-fx.js`: Controle de partículas, sangue e efeitos visuais na tela.
  * `exp-modes.js` / `exp-ui.js`: Máquinas de estado para menus, telas de vitória/derrota e interface do usuário.
  * `exp-debug.js`: Ferramentas auxiliares de renderização de caixas de colisão para testes.
* **CSS Customizado (`expansion.css`):** Estilização responsiva da janela do jogo e sobreposições de menu.

---

## ✒️ Autores e Créditos
* **[Seu Nome ou Nome da Equipe]** - *Desenvolvimento Geral, Engenharia de Software e Game Design*.
* **Dennaton Games** - *Inspirado no design original e universo de Hotline Miami*.

---

## 📄 Licença
Este projeto é uma obra de fãs (Fan-made) para fins de portfólio e estudo de desenvolvimento de jogos em HTML5. Todos os direitos de propriedade intelectual da marca Hotline Miami pertencem à Dennaton Games e Devolver Digital.
