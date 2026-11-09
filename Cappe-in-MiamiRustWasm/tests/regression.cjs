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
    const health=await apiRequest(server,'GET','/api/health');assert.equal(health.status,200);assert.equal(JSON.parse(health.body).version,'v301.0-static-blood-no-copy-rust');assert.equal(health.headers['cache-control'],'no-store');
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
    for(const [key,id] of Object.entries({gfx:'o-gfx',blood:'o-blood',fps:'o-fps',zoom:'o-zoom',keys:'o-keys',pick:'o-pick',decay:'o-decay',res:'o-res',txt:'o-txt',cb:'o-cb',particles:'o-particles'})){
      const body=html.match(new RegExp('<select id="'+id+'">([\\s\\S]*?)<\\/select>'))?.[1]||'';const options=[...body.matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]);
      assert.ok(options.includes(String(vm.runInContext('CFG_DEF['+JSON.stringify(key)+']',ctx))),`${key} padrão não existe no seletor ${id}`);
    }
  });
  await test('Preferências de multiplayer local rejeitam tipos e opções inválidas', () => {
    const source=read('js/exp-multi.js'),cfg=source.match(/const CFG = \{[\s\S]*?\n  \};/)?.[0],enums=source.match(/const CFG_ENUMS = \{[^\n]+/)?.[0],ranges=source.match(/const CFG_RANGES = \{[^\n]+/)?.[0],load=source.match(/function loadSavedMultiCfg\(saved\) \{[\s\S]*?\n  \}/)?.[0];
    assert.ok(cfg&&enums&&ranges&&load);const ctx={};vm.createContext(ctx);vm.runInContext(cfg+'\n'+enums+'\n'+ranges+'\n'+load,ctx);
    vm.runInContext(`loadSavedMultiCfg(JSON.parse('{"multi":true,"mode":"horda","lives":"broken","ff":"yes","camMulti":"p2","p2scheme":"gamepad","showFps":true,"masterVol":2,"mouseSens":0.3,"invertY":"true","autoReload":true,"crosshair":false,"crossOp":101,"showTags":false,"__proto__":{"polluted":true}}'))`,ctx);
    assert.equal(vm.runInContext('CFG.multi',ctx),true);assert.equal(vm.runInContext('CFG.mode',ctx),'horda');assert.equal(vm.runInContext('CFG.lives',ctx),'shared');
    assert.equal(vm.runInContext('CFG.ff',ctx),false);assert.equal(vm.runInContext('CFG.camMulti',ctx),'p2');assert.equal(vm.runInContext('CFG.p2scheme',ctx),'gamepad');
    assert.equal(vm.runInContext('CFG.masterVol',ctx),1);assert.equal(vm.runInContext('CFG.mouseSens',ctx),.3);assert.equal(vm.runInContext('CFG.invertY',ctx),false);
    assert.equal(vm.runInContext('CFG.autoReload',ctx),true);assert.equal(vm.runInContext('CFG.crosshair',ctx),false);assert.equal(vm.runInContext('CFG.crossOp',ctx),80);assert.equal(vm.runInContext('CFG.showTags',ctx),false);
    assert.equal(vm.runInContext('({}).polluted',ctx),undefined);
  });
  await test('Save parcial v2 preserva progresso e adiciona campos ausentes', () => {
    const { exp } = environment({ [KEY]: JSON.stringify(sample()) });
    assert.equal(exp.save().stats.kills,77); assert.equal(exp.save().stats.deaths,0); assert.equal(exp.save().level,4);
    assert.equal(exp.save().unl[0],'test-mask');
  });
  await test('Skins cosméticas selecionam e persistem sem alterar progresso', () => {
    const {ctx,exp,storage}=environment();
    assert.equal(exp.curSkin().id,'classic');assert.equal(exp.setSkin('sunset'),true);assert.equal(exp.curSkin().id,'sunset');
    assert.equal(exp.setSkin('skin-inexistente'),false);assert.equal(exp.curSkin().id,'sunset');
    exp.flush(true);const saved=JSON.parse(storage.get(KEY));assert.equal(saved.settings.skin,'sunset');assert.equal(saved.level,1);
    const restored=environment({[KEY]:storage.get(KEY)}).exp;assert.equal(restored.curSkin().id,'sunset');
    const partial=environment({[KEY]:JSON.stringify(sample(7))}).exp;assert.equal(partial.save().level,7);assert.equal(partial.curSkin().id,'classic');
  });
  await test('Renderer aplica paletas cosméticas e desenha arma também para P2', () => {
    const html=read('index.html'),core=read('js/exp-core.js'),content=read('js/exp-content.js');
    const skinEnv=environment().exp,pal=html.match(/const PAL = \{[\s\S]*?\};/)?.[0];assert.ok(pal);
    const frameFn=declaration(html,'function buildPlayerFrame(');
    const pixels=()=>{const c={width:0,height:0,paint:[],getContext(){let fillStyle='';return {set fillStyle(v){fillStyle=v},get fillStyle(){return fillStyle},fillRect(x,y){c.paint.push([x,y,fillStyle])}}}};return c;};
    const drawCtx={document:{createElement:()=>pixels()},window:{EXP:skinEnv},EXP:skinEnv,playerFrameCache:new Map()};vm.createContext(drawCtx);
    vm.runInContext(pal+';'+frameFn,drawCtx);
    const result=vm.runInContext("(()=>{const a=buildPlayerFrame('walk',1,.5,EXP.SKINS[0]);const b=buildPlayerFrame('walk',1.01,.5,EXP.SKINS[0]);const c=buildPlayerFrame('walk',1,.5,EXP.SKINS[1]);return [a,b,c]})()",drawCtx);
    assert.equal(result[0],result[1],'fase equivalente reutiliza sprite em cache');assert.notEqual(result[0],result[2]);
    assert.ok(result[0].paint.some(p=>p[2]!==result[2].paint.find(q=>q[0]===p[0]&&q[1]===p[1])?.[2]),'paletas produzem pixels de traje diferentes');
    const weaponCalls=[],drawStub=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
    const drawOne=declaration(html,'function drawOnePlayerFallback('),drawPlayerCtx={Math,CFG:{shadows:false,glow:false},ctx:drawStub,cw:'pistola',drawWeaponIcon:(g,w)=>weaponCalls.push(w),wicon:(g,w)=>weaponCalls.push(w),PSHEET:{complete:false,naturalWidth:0},ready:()=>false,buildPlayerFrame:()=>({}),window:{EXP:skinEnv},EXP:skinEnv};
    vm.createContext(drawPlayerCtx);vm.runInContext(drawOne,drawPlayerCtx);
    vm.runInContext("drawOnePlayerFallback({x:10,y:10,a:0,dead:false,anim:0,atk:0},false,{state:'idle',skin:null,frame:{}});drawOnePlayerFallback({x:20,y:10,a:0,dead:false,anim:0,atk:0},true,{state:'idle',skin:null,frame:{}})",drawPlayerCtx);
    assert.deepEqual(weaponCalls,['pistola','pistola'],'P1 e P2 desenham a arma equipada');
    const playerBatches=[],spriteSheet={complete:true,naturalWidth:96},wasmRenderer={active:true,drawPlayers:(players)=>{playerBatches.push(players);return true;}};
    const spriteCtx=new Proxy({}, {get:(o,k)=>o[k]||(o[k]=()=>{}),set:(o,k,v)=>(o[k]=v,true)});
    const playerExp={...skinEnv,MULTI:{enabled:true,P2:{x:20,y:10,lx:20,ly:10,a:.2,dead:false,anim:0,atk:0}},online:{}};
    const wasmPlayerCtx={Math,CFG:{shadows:false,glow:false},hyp:Math.hypot,ctx:spriteCtx,cw:'punho',PSHEET:spriteSheet,ready:im=>im.complete&&im.naturalWidth>0,buildPlayerFrame:()=>({}),P:{x:10,y:10,lx:5,ly:10,a:0,dead:false,anim:1,atk:0},window:{EXP:playerExp,HM_WASM_RENDERER:wasmRenderer},EXP:playerExp};
    vm.createContext(wasmPlayerCtx);
    vm.runInContext(declaration(html,'function advancePlayerVisualState(')+declaration(html,'function drawOnePlayerFallback(')+declaration(html,'function drawPlayer('),wasmPlayerCtx);
    vm.runInContext('drawPlayer()',wasmPlayerCtx);
    assert.equal(playerBatches.length,1,'the WASM pass receives live players in one batch');
    assert.deepEqual(JSON.parse(JSON.stringify(playerBatches[0].map(p=>[p.state,p.animation,p.isP2]))),[['run',1.42,false],['idle',0,true]],'gameplay animation timing remains unchanged while drawing moves to Rust');
    const enemyBodyFn=declaration(html,'function drawEnemyBody('),bodyCalls=[],enemyCtx=new Proxy({}, {set:(o,k,v)=>(o[k]=v,true)});
    const enemyBodyContext={ctx:enemyCtx,COR:{gun:'#19f0e6'},body:(...args)=>bodyCalls.push(args)};vm.createContext(enemyBodyContext);vm.runInContext(enemyBodyFn,enemyBodyContext);
    vm.runInContext("drawEnemyBody({type:'gun'},.55,true);drawEnemyBody({type:'gun'},1,false)",enemyBodyContext);
    assert.equal(bodyCalls[0][4],true,'o corpo do inimigo omite a sombra original quando o batch WASM já a submeteu');
    assert.equal(bodyCalls[1][4],false,'o fallback continua desenhando a própria sombra');
    assert.match(html,/function weaponFinish\(g, w\)/);
    assert.match(content,/draw\(\); if \(EXP\.newWeapons\.includes\(w\)\) weaponFinish\(g, w\)/);
    assert.match(html,/g\.shadowColor = 'rgba\(0,0,0,\.62\)'/);assert.match(content,/g\.shadowColor = 'rgba\(0,0,0,\.62\)'/);
    assert.match(core,/EXP\.SKINS = SKINS/);assert.match(core,/settings\.skin = id/);
  });
  await test('Sombra e aura do jogador usam painter Rust direto e fallback Canvas', () => {
    const html=read('index.html'),renderer=read('js/wasm-renderer.js'),legacy=read('wasm-renderer/src/lib.rs'),direct=read('wasm-renderer-direct/src/lib.rs');
    assert.match(html,/renderer\.drawPlayerAura\(context, isP2, CFG\.shadows !== false, CFG\.glow !== false\)/);
    assert.match(renderer,/state\.direct\.drawPlayerAura\(context, !!isP2, !!shadowsEnabled, !!glowEnabled\)/);
    assert.doesNotMatch(renderer,/wasm\.exports\.draw_player_aura/);
    assert.doesNotMatch(legacy,/draw_player_aura/);
    assert.match(direct,/js_name = drawPlayerAura[\s\S]*?context\.ellipse\(2\.0, 5\.0, 13\.0, 8\.0/);
  });
  await test('Composição P1/P2 usa só o painter Rust direto e preserva fallback Canvas', () => {
    const html=read('index.html'),renderer=read('js/wasm-renderer.js'),legacy=read('wasm-renderer/src/lib.rs'),direct=read('wasm-renderer-direct/src/lib.rs');
    assert.match(renderer,/state\.direct\.drawPlayers\(context, directItems/);
    assert.doesNotMatch(renderer,/wasm\.exports\.draw_players|wasm\.exports\.player_draw_data_ptr/);
    assert.doesNotMatch(legacy,/draw_players|player_draw_data_ptr|PlayerDrawData/);
    assert.match(direct,/js_name = drawPlayers/);
    assert.match(html,/renderer\.drawPlayers\(drawData, ctx, PSHEET\)\) return/);
    assert.match(html,/for \(const visual of players\) drawOnePlayerFallback/);
  });
  await test('Renderer direto pinta o fundo de cada frame e mantém fallback Canvas', () => {
    const html=read('index.html'),wasm=read('js/wasm-renderer.js');
    assert.match(html,/backgroundRenderer\.drawFrameBackground\(ctx, W, H\)/);
    assert.match(html,/ctx\.fillRect\(-20, -20, W \+ 40, H \+ 40\)/);
    assert.match(wasm,/state\.direct\.drawFrameBackground\(context, width, height\)/);
    assert.doesNotMatch(wasm,/wasm\.exports\.draw_frame_background|fill_frame_background/);
    assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/draw_frame_background|fill_frame_background/);
  });
  await test('Menu de pausa desenha no Canvas por chamadas diretas de Rust/WASM', () => {
    const html=read('index.html'),ui=read('js/exp-ui.js'),fx=read('js/exp-fx.js'),bridge=read('js/wasm-renderer.js'),rust=read('wasm-renderer-direct/src/lib.rs'),build=read('wasm-renderer/build.ps1'),worker=read('sw.js');
    const bossPath=bridge.slice(bridge.indexOf('state.drawBossHealthBar ='),bridge.indexOf('state.drawInvasionArrow ='));
    const arrowPath=bridge.slice(bridge.indexOf('state.drawInvasionArrow ='),bridge.indexOf('state.drawMaskArt ='));
    const rainPath=bridge.slice(bridge.indexOf('state.drawRain ='),bridge.indexOf('state.drawWeatherMotes ='));
    const motePath=bridge.slice(bridge.indexOf('state.drawWeatherMotes ='),bridge.indexOf('state.drawFog ='));
    const fxPath=bridge.slice(bridge.indexOf('state.drawFxOverlays ='),bridge.indexOf('state.drawWorldLights ='));
    const ringsPath=bridge.slice(bridge.indexOf('state.drawWorldRings ='),bridge.indexOf('state.drawInvasionZone ='));
    const shotFxPath=bridge.slice(bridge.indexOf('state.drawFx ='),bridge.indexOf('state.drawPickups ='));
    const darkOutlinePath=bridge.slice(bridge.indexOf('state.drawDarkOutlines ='),bridge.indexOf('state.drawDarkOverlay ='));
    const shellPath=bridge.slice(bridge.indexOf('state.drawShells ='),bridge.indexOf('state.drawDarkOutlines ='));
    const bulletPath=bridge.slice(bridge.indexOf('state.drawBullets ='),bridge.indexOf('state.drawLayer ='));
    const pickupPath=bridge.slice(bridge.indexOf('state.drawPickups ='),bridge.indexOf('state.drawThrows ='));
    const throwPath=bridge.slice(bridge.indexOf('state.drawThrows ='),bridge.indexOf('state.drawTransport ='));
    assert.match(bossPath,/state\.direct\.drawBossHealthBar\(context[\s\S]*?return false/);
    assert.doesNotMatch(bossPath,/wasm\.exports\.(draw_boss_health_bar|boss_health_input_ptr)/);
    assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/draw_boss_health_bar|boss_health_input_ptr|BOSS_HEALTH_INPUT/);
    assert.match(read('js/exp-modes.js'),/if \(!barDrawn\) \{[\s\S]*?g\.strokeRect\(x, y, w, 14\)/);
    assert.match(arrowPath,/state\.direct\.drawInvasionArrowInput\(context, centerX, centerY, Math\.cos\(angle\), Math\.sin\(angle\)\)[\s\S]*?return false/);
    assert.doesNotMatch(arrowPath,/wasm\.exports\.(draw_invasion_arrow|invasion_arrow_input_ptr)|draw_invasion_arrow_batch/);
    assert.match(bridge,/const rainDirectInputBuffer = new Float64Array\(256 \* 3\)/);assert.match(rainPath,/direct\.drawRain\(context, input, drops\.length, step\)[\s\S]*?return false/);assert.doesNotMatch(rainPath,/wasm\.exports\.(?:draw_rain|rain_input_ptr)|draw_rain_batch/);
    assert.match(bridge,/const weatherMoteDirectInputBuffer = new Float64Array\(128 \* 4\)/);assert.match(motePath,/direct\.drawWeatherMotes\(context, input, motes\.length, nowMs\)[\s\S]*?return false/);assert.doesNotMatch(motePath,/wasm\.exports\.(?:draw_weather_motes|weather_mote_input_ptr)|draw_weather_motes_batch/);
    assert.match(fxPath,/direct\.drawFxOverlays\(context, stage, width, height, nowMs, primary, secondary, enabled\)[\s\S]*?return false/);
    assert.doesNotMatch(fxPath,/wasm\.exports\.(draw_fx_overlays|fx_overlay_input_ptr)/);
    assert.doesNotMatch(bridge,/draw_fx_overlay_batch|currentFxOverlayBatch/);
    assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/draw_fx_overlay_batch|fx_overlay_input_ptr|draw_fx_overlays|FX_OVERLAY_INPUT|FX_OVERLAY_COMMANDS/);
    assert.match(bridge,/const worldLightDirectInputBuffer = new Float64Array\(6 \* 5\)/);assert.match(bridge,/const worldRingDirectInputBuffer = new Float64Array\(14 \* 6\)/);
    assert.match(ringsPath,/direct\.drawWorldRingInputs\(context, directValues\.subarray\(0, directValueCount\), colors\)[\s\S]*?return false/);
    assert.doesNotMatch(ringsPath,/wasm\.exports\.(draw_world_rings|world_ring_input_ptr)/);
    assert.match(bridge,/let fxDirectInputBuffer = new Float64Array\(96\)/);assert.match(shotFxPath,/direct\.drawFxInputs\(context, input\)[\s\S]*?return false/);assert.doesNotMatch(shotFxPath,/muzzleSpriteCanvas|createMuzzleSprite|wasm\.exports\.(draw_fx|fx_input_ptr|generate_muzzle_sprite)/);
    assert.match(rust,/pub fn create_muzzle_sprite\(canvas: &HtmlCanvasElement\)[\s\S]*?write_rgba_canvas\(canvas, SIDE as u32, SIDE as u32, &pixels\)/);
    assert.match(darkOutlinePath,/direct\.drawDarkOutlineInputs\(context, input, camX, camY, screenW, screenH, zoom\)/);assert.doesNotMatch(darkOutlinePath,/wasm\.exports\.(draw_dark_outlines|dark_outline_input_ptr)/);
    assert.match(pickupPath,/direct\.drawPickups\(context, input, !!glow, FURNITURE_COLORS\)[\s\S]*?return false/);assert.doesNotMatch(pickupPath,/wasm\.exports\.(draw_pickups|pickup_input_ptr)/);
    assert.match(throwPath,/direct\.drawThrows\(context, input, FURNITURE_COLORS\)[\s\S]*?return false/);assert.doesNotMatch(throwPath,/wasm\.exports\.(draw_throws|throw_input_ptr)/);
    assert.match(rust,/pub fn draw_pickups\([\s\S]*?colors: &Array[\s\S]*?draw_weapon_icon_direct\(context, weapon, colors\)/);
    assert.match(rust,/pub fn draw_throws\([\s\S]*?colors: &Array[\s\S]*?draw_weapon_icon_direct\(context, weapon, colors\)/);
    assert.match(ui,/drawPauseUiDirect\(g, W, H, hoverIndex, pauseLabels\)/);assert.match(ui,/tx\('PAUSADO'\)/);
    assert.match(bridge,/await import\(directJsUrl\.href\)/);assert.match(bridge,/state\.direct = Object\.assign\(\{\}, directModule\)/);assert.match(bridge,/state\.direct\.drawPauseUi\(context, width, height, hoverIndex, \.\.\.labels\)/);
    assert.match(rust,/pub fn draw_pause_ui\([\s\S]*?CanvasRenderingContext2d/);assert.match(rust,/context\.fill_rect/);assert.match(rust,/context\.fill_text/);
    assert.match(rust,/pub fn draw_fx_overlays\([\s\S]*?CanvasRenderingContext2d/);assert.match(bridge,/state\.direct\.drawFxOverlays\(context, stage, width, height, nowMs, primary, secondary, enabled\)/);
    assert.match(rust,/pub fn draw_rain\([\s\S]*?CanvasRenderingContext2d[\s\S]*?Float64Array/);assert.match(bridge,/state\.direct\.drawRain\(context, input, drops\.length, step\)/);
    assert.match(rust,/pub fn draw_weather_motes\([\s\S]*?CanvasRenderingContext2d[\s\S]*?Float64Array/);assert.match(bridge,/state\.direct\.drawWeatherMotes\(context, input, motes\.length, nowMs\)/);
    assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/draw_rain_batch|draw_weather_motes_batch|rain_input_ptr|weather_mote_input_ptr/);assert.doesNotMatch(bridge,/draw_rain_batch|draw_weather_motes_batch|wasm\.exports\.(?:draw_rain|draw_weather_motes)/);
    assert.match(rust,/pub fn draw_raw_hud_texts\([\s\S]*?CanvasRenderingContext2d[\s\S]*?Array/);assert.match(bridge,/state\.direct\.drawRawHudTexts\(context, entries\)/);
    assert.match(fx,/drawCanvasImage\(g, weatherLabel, 32, H_ - 25\)/);assert.match(html,/function snapCanvas\(c\)[\s\S]*?renderer\.drawCanvasImage\(g, c, 0, 0\)/);assert.match(bridge,/state\.direct\.drawCanvasImage\(context, image, x, y\)/);assert.match(rust,/pub fn draw_canvas_image\([\s\S]*?CanvasRenderingContext2d[\s\S]*?HtmlCanvasElement[\s\S]*?draw_image_with_html_canvas_element/);
    assert.match(html,/function drawHudTextBatch\(entries\)[\s\S]*?renderer\.drawCanvasImageBatch\(ctx, images, placements\)/);assert.match(bridge,/state\.direct\.drawCanvasImageBatch\(context, images, Float64Array\.from\(placements\)\)/);assert.match(rust,/pub fn draw_canvas_image_batch\([\s\S]*?Float64Array[\s\S]*?set_global_alpha\(values\[offset \+ 2\]\)[\s\S]*?draw_image_with_html_canvas_element/);
    assert.match(bridge,/state\.direct\.createCanvasImageData\(context, width, height\)/);assert.match(bridge,/state\.direct\.putCanvasImageData\(context, image, pixels, width, height\)/);assert.match(rust,/pub fn create_canvas_image_data\([\s\S]*?create_image_data_with_sw_and_sh/);assert.match(rust,/pub fn put_canvas_image_data\([\s\S]*?Uint8ClampedArray[\s\S]*?put_image_data/);
    assert.match(bridge,/state\.direct\.createRadialSprite\(canvas, channels\[0\], channels\[1\], channels\[2\], radius, alpha\)/);assert.match(bridge,/state\.direct\.createFogSprite\(canvas, input\)/);assert.match(rust,/pub fn create_radial_sprite\([\s\S]*?write_rgba_canvas\(canvas, side, side, &pixels\)/);assert.match(rust,/pub fn create_fog_sprite\([\s\S]*?write_rgba_canvas\(canvas, WIDTH as u32, HEIGHT as u32, &pixels\)/);
    assert.match(bridge,/direct\.createTransportGradient\(canvas, width, height, kind, offsetX, gradientWidth\)/);assert.match(bridge,/state\.direct\.createExitGradient\(exitGradientCanvas, rect\[2\], rect\[3\], !!cleared\)/);assert.match(rust,/pub fn create_transport_gradient\([\s\S]*?write_rgba_canvas\(canvas, width, height, &pixels\)/);assert.match(rust,/pub fn create_exit_gradient\([\s\S]*?write_rgba_canvas\(canvas, width, height, &pixels\)/);
    assert.match(html,/renderer\.clearCanvasRect\(flContext, 0, 0, fl\.width, fl\.height\)/);assert.match(bridge,/state\.direct\.clearCanvasRect\(context, x, y, width, height\)/);assert.match(rust,/pub fn clear_canvas_rect\([\s\S]*?context\.clear_rect/);
    assert.match(html,/drawLayer\(c, alpha = null\)[\s\S]*?renderer\.drawCanvasLayer\(ctx, c, vx0, vy0, w, h, vx0, vy0, w, h, alpha === null \? -1 : alpha\)/);assert.match(html,/drawLayer\(BL, \.55\)/);assert.match(bridge,/state\.direct\.drawCanvasLayer\(context, image, sx, sy, sw, sh, dx, dy, dw, dh, alpha\)/);assert.match(rust,/pub fn draw_canvas_layer\([\s\S]*?set_global_alpha\(alpha\)[\s\S]*?draw_image_with_html_canvas_element_and_sw_and_sh_and_dx_and_dy_and_dw_and_dh/);
    assert.match(html,/function kill\(e, bx = 0, by = 0\)[\s\S]*?renderer\.drawBloodSplatter\(g, puddleColor, dropColor, blobs, streaks, droplets\)/);assert.match(html,/function drawBloodSplatterFallback\([\s\S]*?quadraticCurveTo/);assert.match(bridge,/state\.direct\.drawBloodSplatter\(context, puddleColor, dropColor,/);assert.match(rust,/pub fn draw_blood_splatter\([\s\S]*?quadratic_curve_to[\s\S]*?context\.stroke\(\)[\s\S]*?context\.arc\(/);
    assert.match(rust,/pub fn draw_dust\([\s\S]*?context\.save\(\)[\s\S]*?context\.set_global_alpha\(alpha\)[\s\S]*?context\.restore\(\)/);
    assert.match(html,/wasmEnemyPass\.drawEnemies\(enemies, P, WASM_ENEMY_PAINTERS, ctx, ready\(ESHEET\) \? ESHEET : null, performance\.now\(\)\)/);
    assert.match(bridge,/state\.direct\.drawEnemies\(context, Float64Array\.from\(rows\)/);
    assert.match(rust,/pub fn draw_enemies_direct\([\s\S]*?set_global_alpha\(alpha\)[\s\S]*?ellipse\(x \+ 3\.0, y \+ 5\.0, 12\.0, 10\.0[\s\S]*?draw_image_at\(context, enemy_sheet[\s\S]*?text_images\.get\(placements\[offset\] as u32\)/);
    assert.doesNotMatch(bridge,/drawEnemyShadowDirect|wasm\.exports\.(?:enemy_input_ptr|draw_visible_enemies)/);
    assert.match(fx,/const trace = new Float64Array\(9 \* 7\)[\s\S]*?glassTraceRenderer\.drawGlassBreakTrace\(f, gl\.x, gl\.y, gl\.w, gl\.h, trace\)/);assert.match(bridge,/state\.direct\.drawGlassBreakTrace\(context, x, y, width, height, commands\)/);assert.match(rust,/pub fn draw_glass_break_trace\([\s\S]*?context\.fill_rect\(x, y, width, height\)[\s\S]*?context\.line_to\([\s\S]*?context\.fill\(\)/);
    assert.match(read('js/exp-world.js'),/scorchRenderer\.drawExplosionScorch\(g, b\.x, b\.y\)/);assert.match(bridge,/state\.direct\.drawExplosionScorch\(context, x, y\)/);assert.match(rust,/pub fn draw_explosion_scorch\([\s\S]*?context\.arc\(x, y, 38\.0, 0\.0, core::f64::consts::TAU\)[\s\S]*?context\.arc\(x, y, 24\.0, 0\.0, core::f64::consts::TAU\)/);
    assert.match(read('js/exp-modes.js'),/if \(!toastsDrawn\) \{[\s\S]*?g\.globalAlpha = 1;[\s\S]*?\n      \}/);
    assert.match(read('js/exp-debug.js'),/renderer\.drawDebugHud\(g, W, H, D\.panel, lines, D\.errs, errorLines\)/);assert.match(bridge,/state\.direct\.drawDebugHud\(context, width, height, showPanel, lines, showErrors, errors\)/);assert.match(rust,/pub fn draw_debug_hud\([\s\S]*?set_fill_style_str\("#7dff9b"\)[\s\S]*?fill_text\(&text/);
    assert.match(read('js/exp-debug.js'),/renderer\.drawDebugWorld\(g, wallData, doorData, P\.x, P\.y, P\.r, D\.coll, enemyData, labels, D\.ai\)/);assert.match(bridge,/state\.direct\.drawDebugWorld\(context, walls, walls\.length \/ 4,[\s\S]*?enemies, labels, enemies\.length \/ 6, showAi\)/);assert.match(rust,/pub fn draw_debug_world\([\s\S]*?rgba\(0,255,120,\.8\)[\s\S]*?rgba\(255,46,147,\.7\)[\s\S]*?fill_text/);
    assert.doesNotMatch(bridge,/wasm\.exports\.(?:draw_fog|fog_input_ptr)/);assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/fog_input_ptr|fog_command_count|draw_fog_batch/);
    assert.match(bridge,/direct\.drawFogInputs\(context, image, nowMs, smoke, perfTier\)/);assert.match(rust,/pub fn draw_fog_inputs\([\s\S]*?let x = \(now_ms \/ \(60\.0 \+ index as f64 \* 25\.0\) \+ index as f64 \* 330\.0\)[\s\S]*?draw_image_at\(context, image/);
    assert.match(bridge,/state\.direct\.drawWorldLightInputs\(context, directValues, directImages, metadata, flashImage \|\| null\)/);assert.match(rust,/pub fn draw_world_light_inputs\([\s\S]*?js_sys::Math::sin\(now_ms \/ 520\.0 \+ light\[3\]\)[\s\S]*?draw_image_at/);
    assert.match(bridge,/state\.direct\.drawWorldRingInputs\(context, directValues\.subarray\(0, directValueCount\), colors\)/);assert.match(rust,/pub fn draw_world_ring_inputs\([\s\S]*?let progress = 1\.0 - ring\[3\] \/ ring\[4\]/);
    assert.doesNotMatch(bridge,/draw_world_light_batch|draw_world_ring_batch|wasm\.exports\.(?:draw_world_lights|draw_world_rings|world_light_input_ptr|world_ring_input_ptr)/);
    assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/draw_world_light_batch|draw_world_ring_batch|world_light_input_ptr|world_ring_input_ptr|draw_world_lights|draw_world_rings/);
    assert.doesNotMatch(rust,/js_name = drawWorldLights|js_name = drawWorldRings/);
    assert.doesNotMatch(bridge,/draw_invasion_zone_batch/);assert.match(rust,/pub fn draw_invasion_zone\([\s\S]*?255,107,213/);
    assert.match(bridge,/state\.direct\.drawInvasionZoneInput\(context, x, y, nowMs\)/);assert.match(rust,/pub fn draw_invasion_zone_input\([\s\S]*?invasion_zone_sine\(now_ms \/ 260\.0\)[\s\S]*?draw_invasion_zone\(context, &commands\)/);
    assert.match(rust,/pub fn draw_dark_overlay\([\s\S]*?destination-out[\s\S]*?draw_image_at\(screen_context, overlay/);
    assert.match(bridge,/state\.direct\.drawDarkOverlayInputs\(darkContext, screenContext, overlay, lamps\.core, lamps\.far, lamps\.flash,[\s\S]*?playerX, playerY, camX, camY, screenW, screenH, zoom, angle/);assert.match(rust,/pub fn draw_dark_overlay_inputs\([\s\S]*?let screen_x = \(player_x - camera_x - screen_w \/ 2\.0\) \* zoom \+ screen_w \/ 2\.0[\s\S]*?draw_dark_overlay\(\s*dark_context,\s*screen_context,\s*overlay,\s*core,\s*far,\s*flash,\s*&commands,\s*\)/);
    assert.match(bridge,/state\.direct\.drawFxInputs\(context, input\)/);assert.doesNotMatch(bridge,/legacyInput\.set\(input\)/);assert.match(rust,/pub fn draw_fx_inputs\([\s\S]*?draw_fx_commands\(context, inputs\)/);assert.match(rust,/fn draw_fx_commands\([\s\S]*?set_global_composite_operation\("lighter"\)[\s\S]*?create_radial_gradient\(x, y, 0\.0, x, y, radius\)[\s\S]*?context\.arc\(/);
    assert.match(shellPath,/state\.direct\.drawShellInputs\(context, input, cameraX, cameraY\)/);assert.doesNotMatch(shellPath,/wasm\.exports\.(draw_shells|shell_input_ptr)|legacyInput/);assert.match(rust,/pub fn draw_shell_inputs\([\s\S]*?radius \* 1\.6,\s*radius,\s*0\.5[\s\S]*?context\.ellipse\(/);assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/pub extern "C" fn draw_shells/);assert.match(read('tests/wasm-shell-input-parity.cjs'),/directInputCalls < 1[\s\S]*?differentChannels !== 0/);
    assert.match(bridge,/state\.direct\.drawComboTextStage\(context, combo, nowMs\)/);assert.doesNotMatch(bridge,/wasm\.exports\.(draw_combo_text|combo_text_input_ptr)|draw_combo_text_batch/);assert.match(rust,/pub fn draw_combo_text_stage\([\s\S]*?set_font\("bold 54px Impact, sans-serif"\)[\s\S]*?stroke_text\(&label[\s\S]*?fill_text\(&label/);
    assert.match(bridge,/state\.direct\.drawAlarmTextStage\(context, seconds, width\)/);assert.doesNotMatch(bridge,/wasm\.exports\.(draw_alarm_text|alarm_text_input_ptr)|draw_alarm_text_batch/);assert.match(rust,/pub fn draw_alarm_text_stage\([\s\S]*?set_font\("bold 14px Orbitron, sans-serif"\)[\s\S]*?fill_text\(&label/);
    assert.match(bridge,/state\.direct\.drawHudImageStage\(context, stage, width, height,[\s\S]*?images\)/);assert.doesNotMatch(bridge,/wasm\.exports\.(draw_hud_image|hud_image_input_ptr)|draw_hud_image_batch/);assert.match(rust,/pub fn draw_hud_image_stage\([\s\S]*?supported_image\(&image\)[\s\S]*?draw_image_at\(context, &image/);
    assert.match(bulletPath,/state\.direct\.drawBulletInputs\(context, input, mine, foe\)/);assert.doesNotMatch(bulletPath,/wasm\.exports\.(draw_bullets|bullet_input_ptr)|legacyInput/);assert.match(rust,/pub fn draw_bullet_inputs\([\s\S]*?owner >= 0\.5[\s\S]*?x - 22\.0, y - 14\.0/);assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/pub extern "C" fn draw_bullets/);assert.match(read('tests/wasm-bullet-input-parity.cjs'),/directInputCalls < 1[\s\S]*?differentChannels !== 0/);
    assert.match(bridge,/state\.drawColorGrade = \(context, width, height\) => !!\(state\.drawColorGradeDirect/);assert.doesNotMatch(bridge,/wasm\.exports\.(draw_color_grade|color_grade_input_ptr)|draw_color_grade_batch/);assert.match(bridge,/state\.direct\.drawColorGrade\(context, width, height\)/);assert.match(rust,/pub fn draw_color_grade\([\s\S]*?set_global_composite_operation\("soft-light"\)[\s\S]*?set_global_composite_operation\("overlay"\)/);
    assert.match(bridge,/state\.drawFinalOverlays = \(context, width, height, fade, flash, flashEnabled\) => !!\(state\.drawFinalOverlaysDirect/);assert.doesNotMatch(bridge,/wasm\.exports\.(draw_final_overlays|final_overlay_input_ptr)|draw_final_overlay_batch/);assert.match(bridge,/state\.direct\.drawFinalOverlays\(context, width, height, fade, flash, flashEnabled\)/);assert.match(rust,/pub fn draw_final_overlays\([\s\S]*?rgba\(8,0,20,\{fade\}\)[\s\S]*?rgba\(255,46,147/);
    assert.match(rust,/pub fn draw_transport_commands\([\s\S]*?commands\.length\(\) % 8[\s\S]*?set_shadow_color\("transparent"\)[\s\S]*?draw_image_at\(context, image/);
    assert.doesNotMatch(bridge,/draw_exit_batch|draw_exit_gradient_batch|wasm\.exports\.(draw_exit|generate_exit_gradient|exit_input_ptr)/);assert.match(rust,/pub fn draw_exit_commands\([\s\S]*?commands\.length\(\) % 6[\s\S]*?context\.clip\(\)[\s\S]*?draw_image_at\(context, gradient/);
    assert.match(bridge,/direct\.drawTransportDirect\(context, transport\.x,[\s\S]*?gradients\.doorRight/);assert.match(rust,/pub fn draw_transport_direct\([\s\S]*?push\(9\.0,[\s\S]*?draw_transport_commands\(context, &commands/);
    assert.match(bridge,/state\.direct\.drawExitDirect\(context, rect\[0\],[\s\S]*?exitGradientCanvas/);assert.match(rust,/pub fn draw_exit_direct\([\s\S]*?commands\.len\(\) \/ 6 < 28[\s\S]*?draw_exit_commands\(context, &commands/);
    assert.match(bridge,/state\.direct\.drawPickups\(context, input, !!glow, FURNITURE_COLORS\)/);assert.doesNotMatch(bridge,/legacyInput\.set\(input\)|draw_pickup_batch/);assert.match(rust,/pub fn draw_pickups\([\s\S]*?context\.arc\(18\.0, 0\.0, 18\.0[\s\S]*?draw_weapon_icon_direct\(context, weapon, colors\)/);
    assert.match(bridge,/state\.direct\.drawThrows\(context, input, FURNITURE_COLORS\)/);assert.doesNotMatch(bridge,/legacyInput\.set\(input\)|draw_throw_batch/);assert.match(rust,/pub fn draw_throws\([\s\S]*?context\.rotate\(angle\)[\s\S]*?draw_weapon_icon_direct\(context, weapon, colors\)/);assert.match(read('tests/wasm-pickup-throw-input-parity.cjs'),/directInputCalls < 1[\s\S]*?differentChannels !== 0/);
    assert.match(bridge,/state\.direct\.drawWeaponIcon\(context, weaponId, FURNITURE_COLORS\)/);assert.match(bridge,/state\.directWeaponIconCalls\+\+/);
    assert.doesNotMatch(bridge,/currentWeaponBatch|wasm\.exports\.draw_weapon/);assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/draw_weapon_icon\(|pub extern "C" fn draw_weapon\(/);assert.match(read('tests/wasm-direct-draw-parity.cjs'),/weaponIconParity[\s\S]*?differentChannels !== 0/);
    assert.match(rust,/pub fn draw_weapon_icon_direct\([\s\S]*?match id[\s\S]*?finish_weapon_icon\(context, colors, id\)/);
    assert.match(bridge,/state\.direct\.drawDoors\(context, input, doorImage \|\| null, FURNITURE_COLORS\)/);assert.match(bridge,/state\.directDoorCalls \+= drawn/);
    assert.match(rust,/pub fn draw_doors_direct\([\s\S]*?doors\.length\(\) % STRIDE[\s\S]*?context\.stroke_rect\(local_x \+ 0\.5/);
    assert.doesNotMatch(bridge,/draw_hud_shape_batch|currentHudShapeBatch|wasm\.exports\.(draw_hud_shape|hud_shape_input_ptr)/);
    assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/draw_hud_shape_batch|draw_hud_shape\(|hud_shape_input_ptr|HUD_SHAPE_INPUT/);
    assert.match(rust,/pub fn draw_hud_shape\([\s\S]*?context\.fill_rect\([\s\S]*?context\.stroke_rect\(/);
    assert.match(bridge,/state\.direct\.drawInvasionArrowInput\(context, centerX, centerY, Math\.cos\(angle\), Math\.sin\(angle\)\)/);assert.doesNotMatch(bridge,/draw_invasion_arrow_batch/);assert.match(rust,/pub fn draw_invasion_arrow_input\([\s\S]*?context\.line_to\(vertices\[2\]\.0, vertices\[2\]\.1\)/);
    assert.match(html,/wasmRenderer\.setCanvasImageSmoothing\(g, false\)/);assert.match(bridge,/state\.direct\.setCanvasImageSmoothing\(context, enabled\)/);assert.match(rust,/pub fn set_canvas_image_smoothing\([\s\S]*?set_image_smoothing_enabled\(enabled\)/);
    assert.match(fx,/renderer\.createTextImage\(k, s, font, col, false\)/);assert.match(html,/renderer\.createTextImage\(k, s, font, c, true\)/);assert.match(bridge,/state\.direct\.createTextImage\(canvas, text, font, color, outlined\)/);assert.match(rust,/pub fn create_text_image\([\s\S]*?measure_text\(text\)[\s\S]*?fill_text\(text, 2\.0, 17\.0\)/);assert.match(rust,/stroke_text\(text, 6\.0, baseline\)/);
    assert.match(bridge,/state\.drawEnemies = \(enemies, player, painters, context, enemySheet = null, nowMs = 0\)/);
    assert.doesNotMatch(bridge,/painters\.textImage\(enemy, commands\[offset \+ 1\]/);
    assert.match(rust,/pub fn draw_map_commands\([\s\S]*?CanvasRenderingContext2d[\s\S]*?Float64Array[\s\S]*?Array/);assert.doesNotMatch(bridge,/draw_map_command|currentMapBatch|drawMapCommandsDirect|flushDirectMapCommands/);
    assert.match(rust,/draw_image_at\(context, &image, &\[placements\[offset \+ 1\], placements\[offset \+ 2\]\]\)/);
    assert.match(bridge,/state\.direct\.drawDust\(context, input, alpha\)/);assert.match(bridge,/state\.direct\.drawSparkInputs\(context, input, colors\)/);assert.match(bridge,/input = packedInput/);
    assert.match(rust,/thread_local! \{[\s\S]*?static SPARK_BUFFERS: RefCell<SparkBuffers>/);assert.match(rust,/pub fn draw_spark_inputs\([\s\S]*?input\.copy_to\(&mut buffers\.input\)[\s\S]*?buffers\.buckets\[color_id as usize \* 6 \+ alpha_bucket\]\.push\(offset\)/);
    assert.doesNotMatch(rust,/Float64Array::from\(commands\.as_slice\(\)\);\s*let drawn = draw_sparks\(context, &commands, colors\)/);
    const sparkDraw=html.slice(html.indexOf('function drawSparks()'),html.indexOf('// ---------- DIFICULDADE DINÂMICA'));
    assert.ok(sparkDraw.indexOf('SPK_INPUT[offset + 4] = group.colorId')>=0&&sparkDraw.indexOf('SPK_INPUT[offset + 4] = group.colorId')<sparkDraw.indexOf('sparkRenderer.drawSparks(ctx, sparks, SPK_C'),'particle grouping and WASM input packing share one pass');
    assert.match(html,/SPK_GROUPS = new Map\(\)/);assert.match(read('tests/wasm-particle-input-parity.cjs'),/differentChannels !== 0/);assert.match(read('tests/wasm-particle-input-parity.cjs'),/i<500/);
    assert.match(bridge,/state\.direct\.drawLiveBlood\(context, input, color\)/);assert.match(bridge,/state\.direct\.drawStaticBlood\(context, input, color\)/);assert.match(bridge,/state\.direct\.drawCorpseInputs\(context, input, colors\)/);assert.match(rust,/pub fn draw_corpse_inputs\([\s\S]*?15\.0, 11\.0, 0\.35, 3\.0[\s\S]*?13\.0, 8\.0, 0\.55[\s\S]*?draw_corpses_mode\(context, &commands, colors, true\)/);assert.match(read('tests/wasm-particle-input-parity.cjs'),/staticBlood:[\s\S]*?corpses:/);
    assert.match(build,/wasm-bindgen \$directTargetWasm --target web/);
    assert.match(worker,/wasm-renderer\/pkg\/direct\/direct_renderer_bg\.wasm/);
  });
  await test('Resumo da pausa usa painter Rust direto com fallback Canvas e paridade de pixels', () => {
    const modes=read('js/exp-modes.js'),rust=read('wasm-renderer-direct/src/lib.rs'),parity=read('tests/wasm-direct-draw-parity.cjs');
    assert.match(modes,/if \(st === 'paused' && r\)[\s\S]*?drawHudShape\(g, 4, W, H\)[\s\S]*?g\.fillRect\(W \/ 2 - 230, H \/ 2 \+ 80, 460, 120\)/);
    assert.match(rust,/pub fn draw_hud_shape\([\s\S]*?if stage > 4[\s\S]*?4 => \{[\s\S]*?rgba\(5,0,18,\.55\)[\s\S]*?fill_rect\(width \/ 2\.0 - 230\.0, height \/ 2\.0 \+ 80\.0, 460\.0, 120\.0\)/);
    assert.match(parity,/compareHudStages=\(\)=>\[0,1,2,3,4\]/);
  });
  await test('Spawn procedural não deixa a primeira sala vazia nem conclui sem inimigos', () => {
    const html=read('index.html'), spawnFn=declaration(html,'function spawnFloor('), clearFn=declaration(html,'function allClear(');
    const rooms=[{x:0,y:0,w:50,h:50}];rooms.hall={x:200,y:0,w:500,h:500};
    const ctx={Math:Object.assign(Object.create(Math),{random:()=>.5}),focusActor:()=>({x:0,y:0}),reachMap:()=>((x)=>x>=100),
      rooms,lvl:1,enemies:[],pickups:[],hitWall:()=>false,hyp:Math.hypot};vm.createContext(ctx);
    vm.runInContext(spawnFn,ctx);vm.runInContext('spawnFloor(3,0)',ctx);
    assert.ok(vm.runInContext('enemies.length',ctx)>0,'spawn deve usar o corredor alcançável quando as salas estão isoladas por portas');
    const clearCtx={levelStats:{total:0},enemies:[],predio:[{enemies:[]}],andar:0};vm.createContext(clearCtx);vm.runInContext(clearFn,clearCtx);
    assert.equal(vm.runInContext('allClear()',clearCtx),false,'mapa sem qualquer inimigo não pode ser marcado concluído');
    clearCtx.levelStats.total=1;assert.equal(vm.runInContext('allClear()',clearCtx),true);
  });
  await test('Spawn de mapa fixo é deslocado para área livre quando coordenada original colide', () => {
    const html=read('index.html'),fn=declaration(html,'function safeSpawnPos('),areas=[{x:100,y:100,w:200,h:200}],ctx={rooms:areas,
      unstick(){},hitWall:(x,y)=>x<100||y<100,hyp:Math.hypot};vm.createContext(ctx);vm.runInContext(fn,ctx);
    const point=vm.runInContext('safeSpawnPos(10,10,13)',ctx);assert.ok(point[0]>=100&&point[1]>=100);assert.equal(ctx.hitWall(point[0],point[1],13),false);
    assert.match(html,/startPos = safeSpawnPos\(startPos\[0\], startPos\[1\]\)/);
  });
  await test('Migração legada preserva recorde e desbloqueio', () => {
    const { exp } = environment({ hm_hiscore:'12345', hm_unlock:'1' });
    assert.equal(exp.save().stats.bestScore,12345); assert.equal(exp.save().flags.hardcoreWon,true);
  });
  await test('Save de versão futura não é sobrescrito por esta versão', () => {
    const future=JSON.stringify({...sample(),v:3});const {exp,storage}=environment({[KEY]:future});
    exp.flush(true);assert.equal(storage.get(KEY),future);assert.ok(exp.importSave(JSON.stringify(sample())));
    assert.equal(storage.get(KEY),future);
  });
  await test('Principal corrompido recupera backup sem destruí-lo ao salvar', () => {
    const backup = JSON.stringify(sample(8)); const { exp, storage } = environment({ [KEY]:'{broken', [BAK]:backup });
    assert.equal(exp.save().level,8); exp.flush(true); assert.equal(storage.get(BAK),backup);
    assert.equal(JSON.parse(storage.get(KEY)).stats.kills,77);
  });
  await test('Rotação automática mantém o save anterior válido', () => {
    const old = JSON.stringify(sample()); const { exp, storage } = environment({ [KEY]:old });
    exp.save().stats.kills=90; exp.flush(true); assert.equal(storage.get(BAK),old);
  });
  await test('Importação guarda estado atual em memória como backup', () => {
    const { exp, storage } = environment({ [KEY]:JSON.stringify(sample()) });
    exp.save().stats.kills=88; assert.equal(exp.importSave(JSON.stringify(sample(9))), '');
    assert.equal(exp.save().level,9); assert.equal(JSON.parse(storage.get(BAK)).stats.kills,88);
  });
  await test('Importação inválida não altera progresso nem backup', () => {
    const { exp, storage } = environment({ [KEY]:JSON.stringify(sample()), [BAK]:'backup' });
    const before=JSON.stringify(exp.save());
    for(const bad of ['{', '[]', 'null', '{"v":2,"level":3,"stats":[]}']) assert.ok(exp.importSave(bad));
    assert.equal(JSON.stringify(exp.save()),before); assert.equal(storage.get(BAK),'backup');
  });
  await test('Rejeita coleções, estatísticas, ranking e volumes inválidos', () => {
    const { exp } = environment();
    for(const patch of [{perks:null},{stats:{kills:'9'}},{unl:{}},{settings:{musVol:7}},{records:{solo:null}},{ranking:{solo:{}}},{level:-1},{xp:'9'}])
      assert.ok(exp.importSave(JSON.stringify({...sample(),...patch})),JSON.stringify(patch));
  });
  await test('Rejeita chaves que alteram protótipos', () => {
    const { exp, ctx } = environment();
    assert.ok(exp.importSave('{"v":2,"level":3,"stats":{},"__proto__":{"polluted":true}}'));
    assert.equal(vm.runInContext('({}).polluted',ctx),undefined);
  });
  await test('Falha de armazenamento mantém save em memória e informa erro', () => {
    const { exp } = environment({[KEY]:JSON.stringify(sample())},KEY);
    assert.ok(exp.importSave(JSON.stringify(sample(9)))); assert.equal(exp.save().level,4);
  });
  await test('Restaurar backup atualiza memória e disco sem recarregar arma', () => {
    const { exp, storage } = environment({[KEY]:JSON.stringify(sample(4)),[BAK]:JSON.stringify(sample(9))});
    exp.reload=()=>{throw Error('recarga de arma chamada');};
    assert.equal(exp.restoreBackup(),''); assert.equal(exp.save().level,9);
    assert.equal(JSON.parse(storage.get(KEY)).level,9); assert.equal(JSON.parse(storage.get(BAK)).level,4);
  });
  await test('Backup inválido não substitui o save atual', () => {
    const { exp, storage } = environment({[KEY]:JSON.stringify(sample()),[BAK]:'{}'});
    const before=storage.get(KEY); assert.ok(exp.restoreBackup()); assert.equal(storage.get(KEY),before);
  });
  await test('Falha ao restaurar preserva também o backup de destino', () => {
    const backup=JSON.stringify(sample(9));const primary=JSON.stringify(sample(4));
    const {exp,storage}=environment({[KEY]:primary,[BAK]:backup},KEY);
    assert.ok(exp.restoreBackup());assert.equal(exp.save().level,4);
    assert.equal(storage.get(KEY),primary);assert.equal(storage.get(BAK),backup);
  });
  await test('Reset mantém progresso anterior recuperável', () => {
    const { exp, storage } = environment({[KEY]:JSON.stringify(sample(12))});
    exp.save().stats.kills=88; exp.resetSave(); assert.equal(exp.save().level,1); assert.equal(JSON.parse(storage.get(BAK)).level,12);
    assert.equal(JSON.parse(storage.get(BAK)).stats.kills,88);
  });
  await test('Dano com efeito visual respeita P1 e P2, colete e vidas', () => {
    const {ctx,exp}=environment(); vm.runInContext(read('js/exp-multi.js'),ctx);
    Object.assign(ctx,{ P:{inv:0,shield:1}, S:{revive:false}, revived:false, FX:{},
      playSfx(){},burstSparks(){},triggerScreenShake(){},popup(){},die(){ctx.deaths++;},deaths:0 });
    const fn=read('index.html').split('function hit(target) {')[1].split('\nfunction kill(')[0];
    vm.runInContext('function hit(target) {'+fn,ctx);
    const wrapper=read('js/exp-fx.js').match(/const _hit = hit; hit = function[^\n]+/)[0];
    vm.runInContext(wrapper,ctx);
    exp.MULTI.enabled=true; exp.MULTI.lives='independent';
    const p2={isP2:true,inv:0,shield:1};exp.MULTI.P2=p2;
    ctx.hit(p2); assert.equal(p2.shield,0);assert.equal(ctx.P.shield,1);
    p2.inv=0;ctx.hit(p2);assert.equal(exp.MULTI.deadFlags[1],true);assert.equal(ctx.deaths,0);
    ctx.hit(ctx.P);assert.equal(ctx.P.shield,0);ctx.P.inv=0;ctx.hit(ctx.P);assert.equal(ctx.deaths,1);
  });
  await test('Fogo amigo identifica o proprietário e respeita a opção', () => {
    const html=read('index.html');
    const shoot=html.match(/function shoot\(from, ang, spd, mine, life\) \{[\s\S]*?\n\}/)?.[0];
    const target=html.match(/function friendlyBulletTarget\(b\) \{[\s\S]*?\n\}/)?.[0];
    assert.ok(shoot&&target);
    assert.match(html,/if \(!gone && window\.EXP && EXP\.MULTI && EXP\.MULTI\.enabled && EXP\.MULTI\.friendlyFire\)/);assert.match(html,/const friendly = friendlyBulletTarget\(b\)/);
    const p1={x:10,y:10,r:13},p2={x:40,y:10,r:13,isP2:true},multi={enabled:true,friendlyFire:true,P2:p2};
    const ctx=vm.createContext({P:p1,S:{pierce:0},bullets:[],hyp:Math.hypot,window:{EXP:{MULTI:multi}}});
    vm.runInContext(shoot+'\n'+target,ctx);
    ctx.shoot(ctx.P,0,300,true,1);ctx.shoot(p2,0,300,true,1);
    assert.equal(ctx.bullets[0].owner,'p1');assert.equal(ctx.bullets[1].owner,'p2');
    assert.equal(ctx.friendlyBulletTarget({mine:true,owner:'p1',x:40,y:10}),p2);
    assert.equal(ctx.friendlyBulletTarget({mine:true,owner:'p2',x:10,y:10}),p1);
    assert.equal(ctx.friendlyBulletTarget({mine:true,owner:'p1',x:80,y:10}),null);
    multi.friendlyFire=false;assert.equal(ctx.friendlyBulletTarget({mine:true,owner:'p1',x:40,y:10}),null);
    multi.friendlyFire=true;assert.equal(ctx.friendlyBulletTarget({mine:false,owner:null,x:40,y:10}),null);
    p2.dead=true;assert.equal(ctx.friendlyBulletTarget({mine:true,owner:'p1',x:40,y:10}),null);
  });
  await test('Vidas compartilhadas encerram ao cair qualquer jogador', () => {
    const {ctx,exp}=environment();vm.runInContext(read('js/exp-multi.js'),ctx);
    exp.MULTI.enabled=true;exp.MULTI.lives='shared';exp.multi.markDead(true);assert.equal(exp.multi.shouldGameOver(),true);
  });
  await test('Morte de P1 marca o ator e encerra suas ações de input', () => {
    const {ctx,exp}=environment();vm.runInContext(read('js/exp-multi.js'),ctx);
    ctx.P={dead:false,inv:0,dash:.1};exp.MULTI.enabled=true;exp.MULTI.lives='independent';
    exp.multi.markDead(false);assert.equal(ctx.P.dead,true);assert.equal(ctx.P.inv,999);assert.equal(ctx.P.dash,0);
    assert.equal(exp.multi.anyAlive(),true);assert.equal(exp.multi.shouldGameOver(),false);
  });
  await test('P2 nasce em posição livre acessível e falha com segurança sem espaço', () => {
    const {ctx,exp}=environment();vm.runInContext(read('js/exp-multi.js'),ctx);
    exp.MULTI.enabled=true;ctx.hitWall=(x,y,r)=>x>120&&y<80;ctx.reachMap=()=>()=>true;
    const p1={x:100,y:100,r:13};const p2=exp.multi.spawnP2(p1);
    assert.ok(p2);assert.equal(ctx.hitWall(p2.x,p2.y,14),false);assert.notEqual(p2.x,p1.x);
    ctx.hitWall=()=>true;assert.equal(exp.multi.spawnP2(p1),null);assert.equal(exp.MULTI.P2,null);assert.equal(exp.MULTI.spawnError,true);
  });
  await test('Tiro P2 respeita fireOk/onFire e bloqueia personagem sem armas', () => {
    const {ctx,exp}=environment();vm.runInContext(read('js/exp-multi.js'),ctx);
    exp.MULTI.enabled=true;exp.MULTI.P2={x:10,y:20,r:13,a:0,inv:0};
    ctx.cw='pistola';ctx.WP={pistola:{gun:true,pel:1,spread:0,spd:300,cd:.2,noise:50,shake:1}};ctx.shoot=()=>ctx.shots++;
    ctx.shots=0;ctx.fires=0;ctx.ammo=0;ctx.levelStats={shots:0};ctx.fireAllowed=true;
    exp.fireOk=()=>ctx.fireAllowed;exp.onFire=()=>ctx.fires++;ctx.emitNoise=()=>{};ctx.triggerScreenShake=()=>{};
    exp.multi.updateP2(.016,{controlright:true},()=>{}, {fire:1},ctx.WP,{v:4});
    assert.equal(ctx.shots,1);assert.equal(ctx.fires,1);assert.equal(ctx.levelStats.shots,1);
    exp.MULTI.p2Cd=0;ctx.fireAllowed=false;
    exp.multi.updateP2(.016,{controlright:true},()=>{}, {noGuns:true},ctx.WP,{v:4});
    assert.equal(ctx.shots,1);assert.equal(ctx.fires,1);
  });
  await test('P2 pode trocar e descartar arma no inventário compartilhado', () => {
    const {ctx,exp}=environment();vm.runInContext(read('js/exp-multi.js'),ctx);
    exp.MULTI.enabled=true;exp.MULTI.P2={x:10,y:10,r:13,a:0,inv:0};
    ctx.pickups=[{x:12,y:10,w:'escopeta',n:6}];ctx.cw='punho';ctx.ammo=0;
    ctx.WP={escopeta:{gun:true,nome:'Escopeta'},punho:{gun:false,nome:'Punho'}};ctx.popup=()=>{};ctx.hitWall=()=>false;
    assert.equal(exp.multi.p2WantsPick({'/':true}),true);
    exp.multi.updateP2(.016,{'/':true},()=>{}, {},ctx.WP,{v:0});
    assert.equal(ctx.cw,'escopeta');assert.equal(ctx.ammo,6);assert.equal(ctx.pickups.length,0);
    exp.MULTI.p2InteractCd=0;exp.multi.updateP2(.016,{';':true},()=>{}, {},ctx.WP,{v:6});
    assert.equal(ctx.cw,'punho');assert.equal(ctx.pickups.length,1);assert.equal(ctx.pickups[0].w,'escopeta');
  });
  await test('P1 usa WASD no multiplayer mesmo com preferência solo por setas', () => {
    const {ctx,exp}=environment();Object.assign(ctx,{CFG:{keys:'setas'},keys:{w:true}});exp.MULTI={enabled:true};
    vm.runInContext('function axis() {'+read('index.html').split('function axis() {')[1].split('\nfunction tryDash')[0],ctx);
    assert.deepEqual(Array.from(ctx.axis()),[0,-1]);ctx.keys={arrowright:true};assert.deepEqual(Array.from(ctx.axis()),[0,0]);
    exp.MULTI.enabled=false;assert.deepEqual(Array.from(ctx.axis()),[1,0]);
  });
  await test('P2 separa soco de tiro e preserva Ctrl Direito e Numpad', () => {
    const {ctx,exp}=environment();vm.runInContext(read('js/exp-multi.js'),ctx);
    assert.equal(exp.multi.p2WantsShoot({'.':true}),false);assert.equal(exp.multi.p2WantsPunch({'.':true}),true);
    assert.equal(exp.multi.p2WantsShoot({controlright:true}),true);assert.equal(exp.multi.p2WantsShoot({controlleft:true}),false);
    exp.MULTI.p2Scheme='numpad';assert.equal(exp.multi.p2WantsShoot({numpad0:true}),true);
    const dir=exp.multi.p2MoveVector({numpad8:true,numpad6:true});assert.ok(Math.abs(Math.hypot(dir.dx,dir.dy)-1)<1e-12);
  });
  await test('Recarga automática respeita a preferência e volume mestre limita os dois canais', () => {
    const world=read('js/exp-world.js'),fx=read('js/exp-fx.js');
    assert.match(world,/M\.left <= 0 && ammo > 0 && EXP\.multiCfg && EXP\.multiCfg\.autoReload/);
    assert.match(world,/if \(EXP\.multiCfg && EXP\.multiCfg\.autoReload\) reloadStart\(\)/);
    assert.match(fx,/s\.musVol \* master/);assert.match(fx,/s\.sfxVol \* master/);
  });
  await test('Abas de opções têm vínculos ARIA e navegação por teclado', () => {
    const a11y=read('js/exp-acess.js');
    asse