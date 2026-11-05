# Servidor do Cappe-in-Miami v52

Requer Node.js 18 ou superior. Não instala pacotes.

1. Abra um terminal nesta pasta do jogo.
2. Execute `node server/server.js`.
3. Acesse `http://127.0.0.1:8787` e abra Multiplayer Online. A seção **Salas neste servidor** lista as salas abertas e ocupadas; use **Entrar** ou informe um código de 6 caracteres.
4. Um jogador cria a sala; o outro escolhe a sala na lista ou informa o código.
5. Ambos clicam em **Jogar nesta sala** e escolhem o mesmo mapa para ver os avatares um do outro.

Para computadores na mesma rede, inicie com `HOST=0.0.0.0 PORT=8787 node server/server.js` (PowerShell: `$env:HOST='0.0.0.0'; $env:PORT='8787'; node server/server.js`) e abra no segundo computador `http://IP-DO-HOST:8787`. Permita o Node.js no firewall da rede privada.

O servidor mantém salas em memória, limitadas a duas pessoas, e retransmite presença/posição com long polling. O cliente interpola posição e direção do avatar remoto entre atualizações para reduzir saltos visuais. Quando um jogador está numa partida ativa, a lista marca a sala e o servidor rejeita novas entradas; não há sincronização de mapas/combate para quem chegasse no meio. Após 60 segundos sem heartbeat, o estado é marcado inativo e a vaga pode ser reutilizada; a sessão antiga ainda pode ser retomada até expirar após cinco minutos. A listagem mostra salas somente desta instância e não é um diretório global nem procura automaticamente servidores na internet. O token secreto de acesso não aparece nos dados compartilhados da sala e trafega no cabeçalho `Authorization`. Não persiste salas após reiniciar. Este é um protótipo online: mapas, inimigos, tiros, dano, inventário, objetivos e progresso ainda são locais e não sincronizados. Para co-op completo, falta sincronização dos eventos e simulação autoritativa. A conexão pela internet exige hospedagem pública, HTTPS e configuração de firewall/proxy; esta entrega não publica o servidor.
