// Sem dependências. Executar: node tests/regression.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { Readable, Writable } = require('node:stream');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const KEY = 'hm_save_v2', BAK = KEY + '_bak';
function environment(initial = {}, failKey = '') {
  const storage = new Map(Object.entries(initial));
  const ctx = { EXP: { log() {}, recheck() {} }, localStorage: {
    getItem: k => storage.get(k) ?? null,
    removeItem: k => storage.delete(k),
    setItem(k, v) { if (k === failKey) throw Error('quota'); storage.set(k, String(v)); }
  }, document: { addEventListener() {}, readyState: 'loading' }, addEventListener() {},
  setTimeout() {}, clearTimeout() {}, setInterval() {}, emitNoise() {}, hyp: Math.hypot,
  WW: 400, WH: 300, doors: [], sol: [], navigator: {}, performance };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(read('js/exp-core.js'), ctx);
  return { ctx, storage, exp: ctx.EXP };
}
const sample = (level = 4) => ({ v: 2, level, xp: 23, stats: { kills: 77 }, settings: { musVol: .4 }, unl: ['test-mask'] });
function declaration(source, signature) {
  const start=source.indexOf(signature);if(start<0)throw Error(`declaração ausente: ${signature}`);
  const open=source.indexOf('{',start);let depth=0;
  for(let i=open;i<source.length;i++){if(source[i]==='{')depth++;else if(source[i]==='}'&&!--depth)return source.slice(start,i+1);}
  throw Error(`declaração incompleta: ${signature}`);
}
function mapConfiguration() {
  const html=read('index.html');
  const arrayLiteral=name=>{
    const match=html.match(new RegExp(`const ${name} = Object\\.freeze\\((\\[[\\s\\S]*?\\])\\);`));
    if(!match)throw Error(`allowlist ausente: ${name}`);
    return vm.runInNewContext(match[1]);
  };
  const setLiteral=name=>{
    const match=html.match(new RegExp(`const ${name} = new Set\\((\\[[\\s\\S]*?\\])\\);`));
    if(!match)throw Error(`lista de exclusão ausente: ${name}`);
    return vm.runInNewContext(match[1]);
  };
  const fixedLiteral=html.match(/const MAPAS_BASE = (\[[\s\S]*?\n\]);/)?.[1];
  const gridLiteral=html.match(/const GRIDS = (\[[\s\S]*?\n\]);/)?.[1];
  const storyLiteral=html.match(/const STORY = (\[[\s\S]*?\n\]);/)?.[1];
  if(!fixedLiteral||!gridLiteral||!storyLiteral)throw Error('dados da campanha ou mapas ausentes');
  const fixedBase=vm.runInNewContext(fixedLiteral),fixedAllowed=arrayLiteral('MAPAS_PERMITIDOS');
  const gridBase=vm.runInNewContext(gridLiteral),gridAllowed=arrayLiteral('GRID_ALLOWED_MAP_IDS'),modes=arrayLiteral('MAP_SELECTOR_MODES');
  const story=vm.runInNewContext(storyLiteral),fixed=new Set(fixedAllowed),gridSet=new Set(gridAllowed);
  const grids=gridBase.filter(g=>gridSet.has(g.id));
  const dataCtx=vm.createContext({});vm.runInContext(read('js/maps.js'),dataCtx);
  const neonData=vm.runInContext('MAPS',dataCtx),neonAllowed=arrayLiteral('NEON_ALLOWED_MAP_NAMES'),neonExcluded=new Set(setLiteral('NEON_EXCLUDED_MAPS'));
  const enemyExpr=html.match(/const NEON_ENEMY_RE = (\/[^;\n]+);/)?.[1];
  const dimensionExpr=html.match(/const NEON_DIMENSION_TITLE_RE = (\/[^;\n]+);/)?.[1];
  if(!enemyExpr||!dimensionExpr)throw Error('validadores de mapa ausentes');
  const ctx=vm.createContext({NEON_DIMENSION_TITLE_RE:vm.runInNewContext(dimensionExpr),NEON_ENEMY_RE:vm.runInNewContext(enemyExpr),NEON_ALLOWED_MAPS:new Set(neonAllowed),NEON_EXCLUDED_MAPS:neonExcluded});
  vm.runInContext(declaration(html,'function neonMapTitle(')+'\n'+declaration(html,'function neonTitleHasDimensions(')+'\n'+declaration(html,'function neonMapIsAllowed('),ctx);
  const playable=neonData.filter(m=>ctx.neonMapIsAllowed(m));
  const selectorAllowed=new Set([...modes,...fixedAllowed,...gridAllowed.map(id=>'grid:'+id),...neonAllowed.map(name=>'neon:'+name)]);
  return {html,fixedBase,fixedAllowed,fixed:fixedBase.filter(m=>fixed.has(m.id)),gridBase,gridAllowed,grids,modes,selectorAllowed,story,neonData,neonAllowed,neonExcluded,playable,neonTitle:ctx.neonMapTitle,hasDimensions:ctx.neonTitleHasDimensions,mapAllowed:ctx.neonMapIsAllowed};
}
const results = [];
async function test(name, fn) {
  try { await fn(); results.push({ name, status: 'PASS' }); }
  catch(e) { results.push({ name, status: 'FAIL', error: e.message }); }
}
function worker(scope = 'https://example.test/game/', networkFetch = null) {
  const handlers = {}, deleted = [], entries = new Map(), fetched = [];
  if (!networkFetch) networkFetch = async req => { fetched.push(req.url); throw Error('offline'); };
  const cache = { addAll: async list => { for(const f of list) assert.ok(fs.existsSync(path.join(root,f)), f); },
    match: async req => entries.get(typeof req === 'string' ? req : req.url),
    put: async (req,res) => { entries.set(typeof req === 'string' ? req : req.url,res); } };
  const ctx = { URL, location: new URL(scope), self: { registration: { scope },
    addEventListener: (name,fn) => handlers[name] = fn, skipWaiting: async()=>{}, clients: { claim: async()=>{} } },
    caches: { open: async()=>cache, match: cache.match, keys: async()=>['another-app','cappe-v33.0:/game/','cappe-v33.0:/other/','cappe-v34.0:/game/'],
      delete: async key => deleted.push(key) }, fetch: networkFetch };
  vm.createContext(ctx); vm.runInContext(read('sw.js'),ctx);
  return { ctx, handlers, deleted, entries, fetched };
}
function apiRequest(server,method,url,payload,headers={}) {
  const chunks=payload===undefined?[]:[Buffer.from(typeof payload==='string'?payload:JSON.stringify(payload))];
  const req=Readable.from(chunks);req.method=method;req.url=url;req.headers=headers;req.socket={remoteAddress:'127.0.0.1'};
  return new Promise(resolve=>{
    const output=[],res=new Writable({write(chunk,encoding,callback){output.push(Buffer.from(chunk));callback();}});
    res.statusCode=0;res.headers={};res.headersSent=false;
    res.writeHead=function(status,values){this.statusCode=status;this.headers={...values};this.headersSent=true;};
    res.on('finish',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(output).toString('utf8')}));
    server.listeners('request')[0](req,res);
  });
}
async function run() {
  await test('Sintaxe de todos os scripts e scripts inline', () => {
    for(const f of fs.readdirSync(path.join(root,'js'))) if(f.endsWith('.js')) new vm.Script(read('js/'+f),{filename:f});
    new vm.Script(read('sw.js'));
    new vm.Script(read('server/server.js'),{filename:'server/server.js'});
    new vm.Script(read('tests/wasm-direct-draw-parity.cjs'),{filename:'tests/wasm-direct-draw-parity.cjs'});
    for(const m of read('index.html').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(m[1]);
  });
  await test('Servidor online: rotas, IDs públicos, reconexão, validação, relay e autorização', async () => {
    delete require.cache[require.resolve('../server/server.js')];
    const {createGameServer,rooms,createRoom,joinRoom,rejoinRoom,publishState,roomView,listRooms,limitRoomAttempts}=require('../server/server.js');
    const fakeIp={socket:{remoteAddress:'198.51.100.77'}};for(let i=0;i<30;i++)limitRoomAttempts(fakeIp);
    assert.throws(()=>limitRoomAttempts(fakeIp),e=>e.status===429);
    const a=createRoom('<Host>'); assert.equal(a.players[0].name,'Host'); assert.match(a.code,/^[A-Z0-9]{6}$/);
    const b=joinRoom(a.code,'Visitante'); assert.equal(b.players.length,2);
    assert.notEqual(a.players[0].id,a.playerId);assert.notEqual(b.players[1].id,b.playerId);
    assert.equal(JSON.stringify(b.players).includes(a.playerId),false);assert.equal(rejoinRoom(a.code,a.playerId).publicId,a.players[0].id);
    assert.throws(()=>joinRoom(a.code,'Terceiro'),e=>e.status===409);
    assert.throws(()=>publishState(a.code,b.playerId,{x:'120',y:90,a:.5,alive:true}),e=>e.status===400);
    const view=publishState(a.code,b.playerId,{x:120,y:90,a:.5,alive:false});
    assert.equal(view.players.find(p=>p.id===b.players[1].id).state.x,120);
    assert.equal(view.players.find(p=>p.id===b.players[1].id).state.y,90);
    assert.throws(()=>publishState(a.code,b.playerId,{x:120,y:90,a:.5,alive:true}),e=>e.status===429);
    assert.throws(()=>publishState(a.code,'forjado',{x:0,y:0}),e=>e.status===403);
    const oldHost=rooms.get(a.code).players.get(a.playerId);oldHost.seen=Date.now()-6*60_000;
    const c=joinRoom(a.code,'Novo');assert.equal(c.players.length,2);assert.equal(c.players.some(p=>p.name==='Host'),false);
    rooms.delete(a.code);
    assert.equal(roomView({code:'ABCDEF',revision:1,players:new Map(),waiters:new Map()}).players.length,0);
    assert.equal(listRooms().length,0);

    const server=createGameServer({root});
    const health=await apiRequest(server,'GET','/api/health');assert.equal(health.status,200);assert.equal(JSON.parse(health.body).version,'v303.0-nav-neighbors-rust');assert.equal(health.headers['cache-control'],'no-store');
    const page=await apiRequest(server,'GET','/');assert.equal(page.status,200);assert.match(page.body,/Cappe-in-Miami/);assert.equal(page.headers['x-content-type-options'],'nosniff');
    assert.equal((await apiRequest(server,'GET','/wasm-renderer/pkg/renderer.wasm')).status,404,'the retired Canvas trampoline must not be served');
    assert.equal((await apiRequest(server,'GET','/wasm-renderer/src/lib.rs')).status,404);
    assert.equal((await apiRequest(server,'GET','/server/server.js')).status,404);
    const badType=await apiRequest(server,'POST','/api/rooms','{}',{'content-type':'text/plain'});assert.equal(badType.status,415);
    const activeResponse=await apiRequest(server,'POST','/api/rooms',{name:'Em jogo'},{'content-type':'application/json'});const active=JSON.parse(activeResponse.body);
    await apiRequest(server,'POST',`/api/rooms/${active.code}/state`,{x:60,y:70,a:0,alive:true},{'content-type':'application/json',authorization:'Bearer '+active.playerId});
    const lateJoin=await apiRequest(server,'POST',`/api/rooms/${active.code}/join`,{name:'Atrasado'},{'content-type':'application/json'});assert.equal(lateJoin.status,409);
    const activeList=JSON.parse((await apiRequest(server,'GET','/api/rooms')).body).rooms.find(room=>room.code===active.code);assert.equal(activeList.inGame,true);assert.equal(activeList.canJoin,false);
    rooms.get(active.code).players.get(active.playerId).seen=Date.now()-61_000;
    const staleList=JSON.parse((await apiRequest(server,'GET','/api/rooms')).body).rooms.find(room=>room.code===active.code);assert.equal(staleList.inGame,false);assert.equal(staleList.canJoin,true);
    const resumedJoin=await apiRequest(server,'POST',`/api/rooms/${active.code}/join`,{name:'Retorno'},{'content-type':'application/json'});assert.equal(resumedJoin.status,201);const resumed=JSON.parse(resumedJoin.body);assert.equal(resumed.players.find(player=>player.name==='Em jogo').state.alive,false);
    await apiRequest(server,'POST',`/api/rooms/${active.code}/leave`,undefined,{authorization:'Bearer '+active.playerId});
    await apiRequest(server,'POST',`/api/rooms/${active.code}/leave`,undefined,{authorization:'Bearer '+resumed.playerId});
    const created=await apiRequest(server,'POST','/api/rooms',{name:'Host'},{'content-type':'application/json'});assert.equal(created.status,201);
    const hostData=JSON.parse(created.body);let publicList=await apiRequest(server,'GET','/api/rooms');assert.equal(publicList.status,200);let listing=JSON.parse(publicList.body).rooms[0];assert.equal(listing.code,hostData.code);assert.equal(listing.count,1);assert.equal(listing.canJoin,true);assert.deepEqual(listing.players,['Host']);assert.equal(JSON.stringify(listing).includes(hostData.playerId),false);
    const joined=await apiRequest(server,'POST',`/api/rooms/${hostData.code}/join`,{name:'Peer'},{'content-type':'application/json'});assert.equal(joined.status,201);
    const peerData=JSON.parse(joined.body);assert.equal(JSON.stringify(peerData.players).includes(hostData.playerId),false);assert.equal(JSON.stringify(peerData.players).includes(peerData.playerId),false);
    publicList=await apiRequest(server,'GET','/api/rooms');assert.equal(publicList.status,200);listing=JSON.parse(publicList.body).rooms[0];assert.equal(listing.code,hostData.code);assert.equal(listing.count,2);assert.equal(listing.canJoin,false);assert.deepEqual(listing.players,['Host','Peer']);assert.equal(JSON.stringify(listing).includes(hostData.playerId),false);
    const rejoined=await apiRequest(server,'POST',`/api/rooms/${hostData.code}/rejoin`,undefined,{authorization:'Bearer '+hostData.playerId});assert.equal(rejoined.status,200);
    const pending=apiRequest(server,'GET',`/api/rooms/${hostData.code}/state?since=${peerData.revision}&wait=1`,undefined,{authorization:'Bearer '+hostData.playerId});
    const duplicate=await apiRequest(server,'GET',`/api/rooms/${hostData.code}/state?since=${peerData.revision}&wait=1`,undefined,{authorization:'Bearer '+hostData.playerId});assert.equal(duplicate.status,409);
    const moved=await apiRequest(server,'POST',`/api/rooms/${hostData.code}/state`,{x:45,y:77,a:1,alive:true},{'content-type':'application/json',authorization:'Bearer '+peerData.playerId});assert.equal(moved.status,200);
    const read=await pending;assert.equal(JSON.parse(read.body).players.find(p=>p.id===peerData.publicId).state.x,45);
    const unauthorized=await apiRequest(server,'GET',`/api/rooms/${hostData.code}/state?since=0`);assert.equal(unauthorized.status,403);
    const malformed=await apiRequest(server,'POST',`/api/rooms/${hostData.code}/state`,'[]',{'content-type':'application/json',authorization:'Bearer '+peerData.playerId});assert.equal(malformed.status,400);
    const tooLarge=await apiRequest(server,'POST','/api/rooms','"'+('x'.repeat(8200))+'"',{'content-type':'application/json'});assert.equal(tooLarge.status,413);
    assert.equal((await apiRequest(server,'GET','/server/server.js')).status,404);
    await apiRequest(server,'POST',`/api/rooms/${hostData.code}/leave`,undefined,{authorization:'Bearer '+hostData.playerId});
    await apiRequest(server,'POST',`/api/rooms/${hostData.code}/leave`,undefined,{authorization:'Bearer '+peerData.playerId});
    assert.equal(JSON.parse((await apiRequest(server,'GET','/api/rooms')).body).rooms.length,0);
  });
  await test('Servidor estático: gzip reduz bytes e mantém fallback sem compressão', async () => {
    const result=await require('./compression-regression.cjs')();
    assert.ok(result.savedPercent>65,`redução gzip insuficiente: ${result.savedPercent}%`);
  });
  await test('Lobby online renderiza lista de salas com entrada e lotação seguras', async () => {
    const nodes=new Map(),requests=[];
    class Element {
      constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.hidden=false;this.disabled=false;this.value='';this.textContent='';this.listeners={};this.parent=null;this._id='';this._class='';}
      set id(v){this._id=v;nodes.set(v,this);} get id(){return this._id;}
      set className(v){this._class=v;} get className(){return this._class;}
      set innerHTML(v){for(const match of v.matchAll(/id="([^"]+)"/g)){if(!nodes.has(match[1])){const e=new Element('div');e.id=match[1];}}}
      append(...items){for(const item of items){item.parent=this;this.children.push(item);}}
      after(item){item.parent=this.parent;if(this.parent){const i=this.parent.children.indexOf(this);this.parent.children.splice(i+1,0,item);}}
      replaceChildren(...items){this.children=[];this.append(...items);}
      addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
      focus(){} select(){}
      querySelector(selector){return selector==='.primary-actions'?actions:null;}
    }
    const menu=new Element('main');menu.id='menu';const actions=new Element('div');actions.className='primary-actions';menu.append(actions);
    const doc={readyState:'complete',createElement:tag=>new Element(tag),getElementById:id=>nodes.get(id)||null,querySelector:()=>null,
      querySelectorAll:selector=>selector==='.online-room-card button'?[...nodes.values()].filter(n=>n.tagName==='button'&&n.parent?.className==='online-room-card'):[],addEventListener(){}};
    let joined=false;const rooms=()=>[{code:'ABC234',players:['Jogador','<script>alert(1)</script>'],count:2,maxPlayers:2,canJoin:false,inGame:false,createdAt:1},
      {code:'DEF567',players:joined?['Aberta','Tester']:['Aberta'],count:joined?2:1,maxPlayers:2,canJoin:!joined,inGame:joined,createdAt:2},
      {code:'GHI789',players:['Em partida'],count:1,maxPlayers:2,canJoin:false,inGame:true,createdAt:3}];
    const ctx={document:doc,EXP:{},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},fetch:async(url,options={})=>{requests.push({url,method:options.method||'GET'});
      if(url.includes('/state?since=')&&url.includes('&wait=1'))return new Promise(()=>{});
      if(url==='/api/rooms/DEF567/join'){joined=true;return {ok:true,status:201,json:async()=>({code:'DEF567',playerId:'p'.repeat(32),publicId:'public-player',revision:2,players:[{id:'public-player',name:'Tester',state:null}]})};}
      return {ok:true,status:200,json:async()=>({rooms:rooms(),updatedAt:Date.now()})};},
      setInterval:()=>1,clearInterval(){},setTimeout:()=>1,clearTimeout(){},addEventListener(){},AbortController,console};ctx.window=ctx;vm.createContext(ctx);
    vm.runInContext(read('js/exp-online.js'),ctx);
    nodes.get('onlineBtn').onclick();await new Promise(resolve=>setImmediate(resolve));
    const list=nodes.get('onlineRoomList');assert.equal(list.children.length,3);
    const [full,open,playing]=list.children;assert.equal(full.children[0].textContent,'Sala ABC234');assert.equal(full.children[1].textContent,'2/2 jogadores · Jogador, <script>alert(1)</script>');assert.equal(full.children[2].textContent,'Sala completa');assert.equal(full.children[3].textContent,'Lotado');assert.equal(full.children[3].disabled,true);
    assert.equal(open.children[3].textContent,'Entrar');assert.equal(open.children[3].disabled,false);assert.ok(requests.some(r=>r.url==='/api/rooms'));
    assert.equal(playing.children[2].textContent,'Partida em andamento');assert.equal(playing.children[3].textContent,'Em partida');assert.equal(playing.children[3].disabled,true);
    await open.children[3].onclick();await new Promise(resolve=>setImmediate(resolve));assert.ok(requests.some(r=>r.url==='/api/rooms/DEF567/join'&&r.method==='POST'));
    const own=nodes.get('onlineRoomList').children[1].children[3];assert.equal(own.textContent,'Sua sala');assert.equal(own.disabled,true);
    assert.equal(nodes.get('onlineCopyCode').textContent,'Copiar código');assert.equal(nodes.get('onlineNetworkStatus').hidden,false);
    await nodes.get('onlineCopyCode').onclick();assert.equal(nodes.get('onlineCode').value,'DEF567');assert.match(nodes.get('onlineStatus').textContent,/Ctrl\+C/);
    ctx.EXP.onlineLocalState=()=>({x:1,y:2,a:0,alive:true});ctx.EXP.online.tick(Date.now());await new Promise(resolve=>setImmediate(resolve));assert.equal(typeof ctx.EXP.online.latency,'number');
    const revision=ctx.EXP.online.revision;assert.equal(ctx.EXP.online.acceptRevision(revision-1),false);assert.equal(ctx.EXP.online.revision,revision);assert.equal(ctx.EXP.online.acceptRevision(revision+1),true);
    ctx.EXP.online.publicId='me';const remoteTime=Date.now();ctx.EXP.online.setRemotePlayers([{id:'other',name:'Rival',state:{x:0,y:0,a:Math.PI-.05,alive:true}}],remoteTime);
    const remote=ctx.EXP.online.remotePlayer;ctx.EXP.online.tickRemote(remoteTime);
    ctx.EXP.online.setRemotePlayers([{id:'other',name:'Rival',state:{x:100,y:50,a:-Math.PI+.05,alive:true}}],remoteTime+10);ctx.EXP.online.tickRemote(remoteTime+50);
    assert.equal(ctx.EXP.online.remotePlayer,remote);assert.ok(remote.x>0&&remote.x<100);assert.ok(remote.y>0&&remote.y<50);assert.ok(Math.abs(remote.a)>3,'interpolação angular deve seguir o caminho curto em torno de PI');
    ctx.EXP.online.tickRemote(remoteTime+5101);assert.equal(ctx.EXP.online.remotePlayer,null,'avatar sem snapshots recentes não deve permanecer indefinidamente');
    ctx.EXP.online.tick(remoteTime+5200);assert.match(nodes.get('onlineNetworkStatus').textContent,/aguardando posição atualizada/);
    nodes.get('onlineClose').onclick();assert.equal(nodes.get('onlineLobby').hidden,true);
  });
  await test('Preferências de vídeo e acessibilidade ignoram valores corrompidos', () => {
    const html=read('index.html'),def=html.match(/const CFG_DEF = \{[\s\S]*?\n\};/)?.[0];
    const enums=html.match(/const CFG_ENUMS = \{[^\n]+/)?.[0],ranges=html.match(/const CFG_RANGES = \{[^\n]+/)?.[0],values=html.match(/const CFG_VALUES = \{[^\n]+/)?.[0];
    const load=html.match(/function loadSavedCfg\(saved\) \{[\s\S]*?\n\}/)?.[0];assert.ok(def&&enums&&ranges&&values&&load);
    const ctx={matchMedia:()=>({matches:false})};vm.createContext(ctx);
    vm.runInContext(def+'\n'+enums+'\n'+ranges+'\n'+values+'\nlet CFG=Object.assign({},CFG_DEF);\n'+load,ctx);
    vm.runInContext(`loadSavedCfg(JSON.parse('{"sens":"ruim","zoom":999,"decay":"infinito","fps":90,"gfx":"hack","keys":"setas","bloodRed":-1,"shakeAmt":101,"crt":"false","__proto__":{"poluida":true},"arma":"alterada"}'))`,ctx);
    assert.equal(vm.runInContext('CFG.sens',ctx),1);assert.equal(vm.runInContext('CFG.zoom',ctx),.9);assert.equal(vm.runInContext('CFG.decay',ctx),'padrao');
    assert.equal(vm.runInContext('CFG.fps',ctx),0);assert.equal(vm.runInContext('CFG.gfx',ctx),'alto');assert.equal(vm.runInContext('CFG.keys',ctx),'setas');
    assert.equal(vm.runInContext('CFG.bloodRed',ctx),100);assert.equal(vm.runInContext('CFG.shakeAmt',ctx),100);assert.equal(vm.runInContext('CFG.crt',ctx),true);assert.equal(vm.runInContext('CFG.arma',ctx),undefined);
    vm.runInContext(`loadSavedCfg(JSON.parse('{"shakeAmt":35}'))`,ctx);assert.equal(vm.runInContext('CFG.shakeAmt',ctx),35);
    assert.equal(vm.runInContext('({}).poluida',ctx),undefined);
    for(c