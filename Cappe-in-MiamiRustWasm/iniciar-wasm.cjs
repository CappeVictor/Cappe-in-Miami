'use strict';

const { spawn } = require('node:child_process');
const { createGameServer } = require('./server/server.js');

const host = '127.0.0.1';
const port = 8787;
const url = `http://${host}:${port}/?renderer=wasm`;
const server = createGameServer();

server.on('error', error => {
  console.error(`Não foi possível iniciar em ${url}: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, host, () => {
  console.log(`Experimento local iniciado em ${url}`);
  console.log('Mantenha esta janela aberta durante o teste. Pressione Ctrl+C para encerrar.');
  if (process.platform === 'win32') {
    const browser = spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true });
    browser.unref();
  }
});
