'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const GAME_ROOT = path.resolve(__dirname, '..');
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const rooms = new Map();
const MAX_ROOMS = 64;
const ROOM_IDLE_MS = 5 * 60_000;
const ROOM_ACTIVE_GRACE_MS = 60_000;
const MAX_BODY = 8192;
const MAX_POLL_MS = 20_000;
const ROOM_ATTEMPT_LIMIT = 30;
const ROOM_ATTEMPT_WINDOW = 60_000;
const roomAttempts = new Map();
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.wasm':'application/wasm', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.ogg':'audio/ogg', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.json':'application/json; charset=utf-8' };

function token(bytes=18) { return crypto.randomBytes(bytes).toString('base64url'); }
function roomCode() { let code=''; for(let i=0;i<6;i++)code+=CODE_CHARS[crypto.randomInt(CODE_CHARS.length)]; return code; }
function json(res,status,data) {
  const body=JSON.stringify(data);
  res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','content-length':Buffer.byteLength(body),'x-content-type-options':'nosniff','referrer-policy':'no-referrer'});
  res.end(body);
}
function httpError(status,message) { return Object.assign(Error(message),{status}); }
function cleanName(value) { return String(value||'Jogador').replace(/[<>\u0000-\u001f\u007f]/g,'').trim().slice(0,18)||'Jogador'; }
function roomView(room) { return {code:room.code,revision:room.revision,players:[...room.players.values()].map(p=>({id:p.publicId,name:p.name,ready:p.ready,state:p.state}))}; }
function playerInActiveGame(player,now=Date.now()) { return player.state?.alive===true&&now-player.seen<=ROOM_ACTIVE_GRACE_MS; }
function listRooms(now=Date.now()) {
  for(const [code,room] of rooms){pruneRoom(room,now);if(!room.players.size||now-room.updated>ROOM_IDLE_MS)rooms.delete(code);}
  return [...rooms.values()].map(room=>{
    const players=[...room.players.values()];
    const inGame=players.some(player=>playerInActiveGame(player,now));
    return {code:room.code,players:players.map(player=>player.name),count:players.length,maxPlayers:2,canJoin:players.length<2&&!inGame,
      inGame,createdAt:room.createdAt};
  }).sort((a,b)=>Number(b.canJoin)-Number(a.canJoin)||a.createdAt-b.createdAt);
}
function touch(room) {
  room.revision++;room.updated=Date.now();
  for(const [credential,res] of room.waiters) {
    room.waiters.delete(credential);clearTimeout(res.timer);
    if(!res.destroyed&&!res.writableEnded)json(res,200,roomView(room));
  }
}
function auth(req) {
  const match=/^Bearer\s+([A-Za-z0-9_-]{20,})$/i.exec(req.headers.authorization||'');
  return match?.[1]||null;
}
function limitRoomAttempts(req) {
  const now=Date.now(),ip=req.socket?.remoteAddress||'unknown';
  let attempt=roomAttempts.get(ip);
  if(!attempt||now-attempt.started>=ROOM_ATTEMPT_WINDOW){attempt={started:now,count:0};roomAttempts.set(ip,attempt);}
  if(roomAttempts.size>2048)for(const [key,value] of roomAttempts)if(now-value.started>=ROOM_ATTEMPT_WINDOW)roomAttempts.delete(key);
  while(roomAttempts.size>4096)roomAttempts.delete(roomAttempts.keys().next().value);
  if(attempt.count>=ROOM_ATTEMPT_LIMIT)throw httpError(429,'Muitas tentativas de sala. Aguarde um minuto.');
  attempt.count++;
}
function authorized(room,credential) {
  const player=room?.players.get(credential);
  if(player){player.seen=Date.now();room.updated=player.seen;}
  return player;
}
function pruneRoom(room,now=Date.now()) {
  let changed=false;
  for(const [credential,player] of room.players){
    if(now-player.seen>ROOM_IDLE_MS){
      room.players.delete(credential);const waiter=room.waiters.get(credential);
      if(waiter){clearTimeout(waiter.timer);room.waiters.delete(credential);if(!waiter.destroyed&&!waiter.writableEnded)json(waiter,403,{error:'Sessão expirada.'});}
      changed=true;
    } else if(player.state?.alive===true&&now-player.seen>ROOM_ACTIVE_GRACE_MS){player.state={...player.state,alive:false};changed=true;}
  }
  if(changed)touch(room);
  return changed;
}
function createRoom(name) {
  const now=Date.now();
  for(const [code,room] of rooms){pruneRoom(room,now);if(!room.players.size)rooms.delete(code);}
  if(rooms.size>=MAX_ROOMS)throw httpError(503,'Servidor cheio. Tente novamente mais tarde.');
  let code;do{code=roomCode();}while(rooms.has(code));
  const playerId=token(24),publicId=token(8),player={publicId,name:cleanName(name),ready:true,state:null,seen:now,lastUpdate:0};
  const room={code,players:new Map([[playerId,player]]),revision:1,updated:now,createdAt:now,waiters:new Map()};rooms.set(code,room);
  return {...roomView(room),playerId,publicId};
}
function joinRoom(code,name) {
  const room=rooms.get(code);if(!room)throw httpError(404,'Sala não encontrada ou expirada.');
  pruneRoom(room);if(!room.players.size){rooms.delete(code);throw httpError(404,'Sala expirada.');}
  if(room.players.size>=2)throw httpError(409,'A sala já está cheia.');
  if([...room.players.values()].some(player=>playerInActiveGame(player)))throw httpError(409,'A partida já começou. Tente outra sala ou aguarde o jogador voltar ao lobby.');
  const now=Date.now(),playerId=token(24),publicId=token(8);
  room.players.set(playerId,{publicId,name:cleanName(name),ready:true,state:null,seen:now,lastUpdate:0});touch(room);
  return {...roomView(room),playerId,publicId};
}
function rejoinRoom(code,playerId) {
  const room=rooms.get(code);if(!room)throw httpError(404,'Sala não encontrada ou expirada.');
  pruneRoom(room);if(!room.players.size){rooms.delete(code);throw httpError(404,'Sala expirada.');}
  const player=authorized(room,playerId);if(!player)throw httpError(403,'Sessão de jogador inválida.');
  return {...roomView(room),playerId,publicId:player.publicId};
}
function publishState(code,playerId,data) {
  const room=rooms.get(code),player=room?.players.get(playerId),now=Date.now();
  if(!player)throw httpError(403,'Sessão de jogador inválida.');
  if(now-player.lastUpdate<50)throw httpError(429,'Atualização rápida demais.');
  if(!data||!Number.isFinite(data.x)||!Number.isFinite(data.y)||!Number.isFinite(data.a)||typeof data.alive!=='boolean'||(data.ready!==undefined&&typeof data.ready!=='boolean'))throw httpError(400,'Estado do jogador inválido.');
  const limit=(v,min,max)=>Math.max(min,Math.min(max,v));
  player.state={x:limit(data.x,-1_000_000,1_000_000),y:limit(data.y,-1_000_000,1_000_000),a:limit(data.a,-Math.PI*4,Math.PI*4),alive:data.alive,ready:data.ready!==false};
  player.lastUpdate=now;player.seen=now;touch(room);return roomView(room);
}
async function body(req) {
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))throw httpError(415,'Envie JSON.');
  const chunks=[];let size=0;
  for await(const chunk of req){size+=chunk.length;if(size>MAX_BODY)throw httpError(413,'Conteúdo muito grande.');chunks.push(chunk);}
  if(!size)return {};
  try{const value=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}
  catch{throw httpError(400,'JSON inválido.');}
}
function createGameServer(options={}) {
  const root=path.resolve(options.root||GAME_ROOT);
  const server=http.createServer(async(req,res)=>{
    try {
      const url=new URL(req.url,'http://localhost');
      if(url.pathname.startsWith('/api/')) {
        if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{ok:true,version:'v76.0-wasm-neon-door-sprites',rooms:listRooms().length});
        if(req.method==='GET'&&url.pathname==='/api/rooms')return json(res,200,{rooms:listRooms(),updatedAt:Date.now()});
        if(req.method==='POST'&&url.pathname==='/api/rooms'){limitRoomAttempts(req);return json(res,201,createRoom((await body(req)).name));}
        const match=url.pathname.match(/^\/api\/rooms\/([A-Z2-9]{6})(?:\/(join|rejoin|state|leave))?$/);
        if(!match)return json(res,404,{error:'Rota não encontrada.'});
        const code=match[1],action=match[2]||'',room=rooms.get(code);
        if(!room)return json(res,404,{error:'Sala não encontrada ou expirada.'});
        pruneRoom(room);if(!room.players.size){rooms.delete(code);return json(res,404,{error:'Sala expirada.'});}
        if(req.method==='POST'&&action==='join'){limitRoomAttempts(req);return json(res,201,joinRoom(code,(await body(req)).name));}
        const playerId=auth(req),player=authorized(room,playerId);
        if(!player)return json(res,403,{error:'Sessão de jogador inválida.'});
        if(req.method==='POST'&&action==='rejoin')return json(res,200,rejoinRoom(code,playerId));
        if(req.method==='POST'&&action==='state')return json(res,200,publishState(code,playerId,await body(req)));
        if(req.method==='GET'&&action==='state') {
          const parsed=Number(url.searchParams.get('since')),since=Number.isFinite(parsed)?Math.max(0,parsed):0;
          if(since<room.revision||url.searchParams.get('wait')!=='1')return json(res,200,roomView(room));
          if(room.waiters.has(playerId))return json(res,409,{error:'Já existe uma atualização pendente para este jogador.'});
          await new Promise(resolve=>{
            res.once('close',()=>{clearTimeout(res.timer);if(room.waiters.get(playerId)===res)room.waiters.delete(playerId);resolve();});
            res.timer=setTimeout(()=>{if(room.waiters.get(playerId)===res)room.waiters.delete(playerId);if(!res.destroyed&&!res.writableEnded)json(res,200,roomView(room));resolve();},MAX_POLL_MS);
            room.waiters.set(playerId,res);
          });
          return;
        }
        if(req.method==='POST'&&action==='leave') {
          room.players.delete(playerId);touch(room);
          if(!room.players.size){rooms.delete(code);for(const waiter of room.waiters.values()){clearTimeout(waiter.timer);if(!waiter.destroyed&&!waiter.writableEnded)json(waiter,404,{error:'Sala encerrada.'});}room.waiters.clear();}
          return json(res,200,{ok:true});
        }
        return json(res,405,{error:'Método não permitido.'});
      }
      if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'Método não permitido.'});
      let rel;try{rel=decodeURIComponent(url.pathname);}catch{return json(res,400,{error:'Caminho inválido.'});}
      if(rel==='/'||rel==='')rel='/index.html';
      if(!(rel==='/index.html'||rel==='/sw.js'||rel==='/wasm-renderer/pkg/renderer.wasm'||/^\/(js|css|assets)\/[a-zA-Z0-9_./-]+$/.test(rel)))return json(res,404,{error:'Arquivo não encontrado.'});
      const file=path.resolve(root,'.'+rel);if(!file.startsWith(root+path.sep))return json(res,404,{error:'Arquivo não encontrado.'});
      const ext=path.extname(file).toLowerCase();if(!mime[ext])return json(res,404,{error:'Arquivo não encontrado.'});
      let stat,real;
      try{real=await fs.promises.realpath(file);const base=await fs.promises.realpath(root);if(!real.startsWith(base+path.sep))throw Error();stat=await fs.promises.stat(real);if(!stat.isFile())throw Error();}
      catch{return json(res,404,{error:'Arquivo não encontrado.'});}
      res.writeHead(200,{'content-type':mime[ext],'content-length':stat.size,'cache-control':rel==='/index.html'||rel==='/sw.js'?'no-cache':'public, max-age=3600','x-content-type-options':'nosniff','referrer-policy':'no-referrer'});
      if(req.method==='HEAD')return res.end();
      const stream=fs.createReadStream(real);stream.on('error',()=>{if(!res.headersSent)json(res,404,{error:'Arquivo não encontrado.'});else res.destroy();});stream.pipe(res);
    } catch(error) {
      if(!res.headersSent)json(res,error.status||500,{error:error.status?error.message:'Erro interno do servidor.'});
      else res.destroy();
    }
  });
  server.headersTimeout=20_000;server.requestTimeout=15_000;server.keepAliveTimeout=5_000;
  const cleanup=setInterval(()=>{
    const now=Date.now();
    for(const [code,room] of rooms){
      pruneRoom(room,now);
      if(!room.players.size||now-room.updated>ROOM_IDLE_MS){
        for(const waiter of room.waiters.values()){clearTimeout(waiter.timer);if(!waiter.destroyed&&!waiter.writableEnded)json(waiter,404,{error:'Sala expirada.'});}
        room.waiters.clear();rooms.delete(code);
      }
    }
  },30_000);cleanup.unref();
  return server;
}
if(require.main===module){
  const host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT)||8787;
  const server=createGameServer();server.on('error',error=>{console.error('Falha ao iniciar o servidor:',error.message);process.exitCode=1;});
  server.listen(port,host,()=>console.log(`Cappe-in-Miami server em http://${host}:${port}`));
}
module.exports={createGameServer,rooms,createRoom,joinRoom,rejoinRoom,publishState,roomView,listRooms,limitRoomAttempts};
