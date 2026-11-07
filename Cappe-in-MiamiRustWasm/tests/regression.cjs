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
function worker(scope = 'https://example.test/game/') {
  const handlers = {}, deleted = [], entries = new Map(), fetched = [];
  const cache = { addAll: async list => { for(const f of list) assert.ok(fs.existsSync(path.join(root,f)), f); },
    match: async req => entries.get(typeof req === 'string' ? req : req.url),
    put: async (req,res) => { entries.set(typeof req === 'string' ? req : req.url,res); } };
  const ctx = { URL, location: new URL(scope), self: { registration: { scope },
    addEventListener: (name,fn) => handlers[name] = fn, skipWaiting: async()=>{}, clients: { claim: async()=>{} } },
    caches: { open: async()=>cache, match: cache.match, keys: async()=>['another-app','cappe-v33.0:/game/','cappe-v33.0:/other/','cappe-v34.0:/game/'],
      delete: async key => deleted.push(key) }, fetch: async req => { fetched.push(req.url); throw Error('offline'); } };
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
    const health=await apiRequest(server,'GET','/api/health');assert.equal(health.status,200);assert.equal(JSON.parse(health.body).version,'v176.0-screen-compositing');assert.equal(health.headers['cache-control'],'no-store');
    const page=await apiRequest(server,'GET','/');assert.equal(page.status,200);assert.match(page.body,/Cappe-in-Miami/);assert.equal(page.headers['x-content-type-options'],'nosniff');
    const wasm=await apiRequest(server,'GET','/wasm-renderer/pkg/renderer.wasm');assert.equal(wasm.status,200);assert.equal(wasm.headers['content-type'],'application/wasm');assert.ok(wasm.body.length>0);
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
  await test('Renderer WASM pinta o fundo de cada frame em Rust com fallback Canvas', () => {
    const html=read('index.html'),wasm=read('js/wasm-renderer.js');
    assert.match(html,/backgroundRenderer\.drawFrameBackground\(ctx, W, H\)/);
    assert.match(html,/ctx\.fillRect\(-20, -20, W \+ 40, H \+ 40\)/);
    assert.match(wasm,/draw_frame_background\(width, height\)/);
    assert.match(wasm,/fillStyle = '#0d0320'; batch\.context\.fillRect\(-20, -20, width \+ 40, height \+ 40\)/);
  });
  await test('Menu de pausa desenha no Canvas por chamadas diretas de Rust/WASM', () => {
    const html=read('index.html'),ui=read('js/exp-ui.js'),fx=read('js/exp-fx.js'),bridge=read('js/wasm-renderer.js'),rust=read('wasm-renderer-direct/src/lib.rs'),build=read('wasm-renderer/build.ps1'),worker=read('sw.js');
    assert.match(ui,/drawPauseUiDirect\(g, W, H, hoverIndex\)/);
    assert.match(bridge,/await import\(directJsUrl\.href\)/);assert.match(bridge,/state\.direct\.drawPauseUi\(context, width, height, hoverIndex\)/);
    assert.match(rust,/pub fn draw_pause_ui\([\s\S]*?CanvasRenderingContext2d/);assert.match(rust,/context\.fill_rect/);assert.match(rust,/context\.fill_text/);
    assert.match(rust,/pub fn draw_fx_overlays\([\s\S]*?CanvasRenderingContext2d/);assert.match(bridge,/state\.direct\.drawFxOverlays\(context, stage, width, height, nowMs, primary, secondary, enabled\)/);
    assert.match(rust,/pub fn draw_rain\([\s\S]*?CanvasRenderingContext2d[\s\S]*?Float64Array/);assert.match(bridge,/state\.direct\.drawRain\(context, input, drops\.length, step\)/);
    assert.match(rust,/pub fn draw_weather_motes\([\s\S]*?CanvasRenderingContext2d[\s\S]*?Float64Array/);assert.match(bridge,/state\.direct\.drawWeatherMotes\(context, input, motes\.length, nowMs\)/);
    assert.match(rust,/pub fn draw_raw_hud_texts\([\s\S]*?CanvasRenderingContext2d[\s\S]*?Array/);assert.match(bridge,/state\.direct\.drawRawHudTexts\(context, entries\)/);
    assert.match(fx,/drawCanvasImage\(g, weatherLabel, 32, H_ - 25\)/);assert.match(html,/function snapCanvas\(c\)[\s\S]*?renderer\.drawCanvasImage\(g, c, 0, 0\)/);assert.match(bridge,/state\.direct\.drawCanvasImage\(context, image, x, y\)/);assert.match(rust,/pub fn draw_canvas_image\([\s\S]*?CanvasRenderingContext2d[\s\S]*?HtmlCanvasElement[\s\S]*?draw_image_with_html_canvas_element/);
    assert.match(bridge,/state\.direct\.createCanvasImageData\(context, width, height\)/);assert.match(bridge,/state\.direct\.putCanvasImageData\(context, image, pixels, width, height\)/);assert.match(rust,/pub fn create_canvas_image_data\([\s\S]*?create_image_data_with_sw_and_sh/);assert.match(rust,/pub fn put_canvas_image_data\([\s\S]*?Uint8ClampedArray[\s\S]*?put_image_data/);
    assert.match(html,/renderer\.clearCanvasRect\(flContext, 0, 0, fl\.width, fl\.height\)/);assert.match(bridge,/state\.direct\.clearCanvasRect\(context, x, y, width, height\)/);assert.match(rust,/pub fn clear_canvas_rect\([\s\S]*?context\.clear_rect/);
    assert.match(html,/drawLayer\(c, alpha = null\)[\s\S]*?renderer\.drawCanvasLayer\(ctx, c, vx0, vy0, w, h, vx0, vy0, w, h, alpha === null \? -1 : alpha\)/);assert.match(html,/drawLayer\(BL, \.55\)/);assert.match(bridge,/state\.direct\.drawCanvasLayer\(context, image, sx, sy, sw, sh, dx, dy, dw, dh, alpha\)/);assert.match(rust,/pub fn draw_canvas_layer\([\s\S]*?set_global_alpha\(alpha\)[\s\S]*?draw_image_with_html_canvas_element_and_sw_and_sh_and_dx_and_dy_and_dw_and_dh/);
    assert.match(html,/function kill\(e, bx = 0, by = 0\)[\s\S]*?renderer\.drawBloodSplatter\(g, puddleColor, dropColor, blobs, streaks, droplets\)/);assert.match(html,/function drawBloodSplatterFallback\([\s\S]*?quadraticCurveTo/);assert.match(bridge,/state\.direct\.drawBloodSplatter\(context, puddleColor, dropColor,/);assert.match(rust,/pub fn draw_blood_splatter\([\s\S]*?quadratic_curve_to[\s\S]*?context\.stroke\(\)[\s\S]*?context\.arc\(/);
    assert.match(rust,/pub fn draw_dust\([\s\S]*?context\.save\(\)[\s\S]*?context\.set_global_alpha\(alpha\)[\s\S]*?context\.restore\(\)/);
    assert.match(rust,/pub fn draw_enemy_shadows\([\s\S]*?context\.ellipse\([\s\S]*?context\.fill\(\)/);assert.match(bridge,/state\.direct\.drawEnemyShadows\(context, commands, offset, 1\)/);assert.match(bridge,/state\.drawEnemyShadowDirect && state\.drawEnemyShadowDirect\(context, shadows, offset\) === 1/);
    assert.match(fx,/const trace = new Float64Array\(9 \* 7\)[\s\S]*?glassTraceRenderer\.drawGlassBreakTrace\(f, gl\.x, gl\.y, gl\.w, gl\.h, trace\)/);assert.match(bridge,/state\.direct\.drawGlassBreakTrace\(context, x, y, width, height, commands\)/);assert.match(rust,/pub fn draw_glass_break_trace\([\s\S]*?context\.fill_rect\(x, y, width, height\)[\s\S]*?context\.line_to\([\s\S]*?context\.fill\(\)/);
    assert.match(read('js/exp-world.js'),/scorchRenderer\.drawExplosionScorch\(g, b\.x, b\.y\)/);assert.match(bridge,/state\.direct\.drawExplosionScorch\(context, x, y\)/);assert.match(rust,/pub fn draw_explosion_scorch\([\s\S]*?context\.arc\(x, y, 38\.0, 0\.0, core::f64::consts::TAU\)[\s\S]*?context\.arc\(x, y, 24\.0, 0\.0, core::f64::consts::TAU\)/);
    assert.match(read('js/exp-modes.js'),/if \(!toastsDrawn\) \{[\s\S]*?g\.globalAlpha = 1;[\s\S]*?\n      \}/);
    assert.match(read('js/exp-debug.js'),/renderer\.drawDebugHud\(g, W, H, D\.panel, lines, D\.errs, errorLines\)/);assert.match(bridge,/state\.direct\.drawDebugHud\(context, width, height, showPanel, lines, showErrors, errors\)/);assert.match(rust,/pub fn draw_debug_hud\([\s\S]*?set_fill_style_str\("#7dff9b"\)[\s\S]*?fill_text\(&text/);
    assert.match(read('js/exp-debug.js'),/renderer\.drawDebugWorld\(g, wallData, doorData, P\.x, P\.y, P\.r, D\.coll, enemyData, labels, D\.ai\)/);assert.match(bridge,/state\.direct\.drawDebugWorld\(context, walls, walls\.length \/ 4,[\s\S]*?enemies, labels, enemies\.length \/ 6, showAi\)/);assert.match(rust,/pub fn draw_debug_world\([\s\S]*?rgba\(0,255,120,\.8\)[\s\S]*?rgba\(255,46,147,\.7\)[\s\S]*?fill_text/);
    assert.match(bridge,/state\.direct\.drawFog\(batch\.context, batch\.image, commands, count, alpha, smoke === 1\)/);assert.match(rust,/pub fn draw_fog\([\s\S]*?draw_image_at\(context, image/);
    assert.match(bridge,/state\.direct\.drawWorldLights\(batch\.context, commands, images, batch\.flashImage \|\| null\)/);assert.match(rust,/pub fn draw_world_lights\([\s\S]*?set_global_composite_operation\("lighter"\)[\s\S]*?draw_image_at/);
    assert.match(bridge,/state\.direct\.drawWorldRings\(batch\.context, commands\.subarray\(0, count \* 6\), batch\.colors\)/);assert.match(rust,/pub fn draw_world_rings\([\s\S]*?context\.arc\(/);
    assert.match(bridge,/state\.direct\.drawInvasionZone\(batch\.context, commands\)/);assert.match(rust,/pub fn draw_invasion_zone\([\s\S]*?255,107,213/);
    assert.match(bridge,/state\.direct\.drawDarkOverlay\(batch\.darkContext, batch\.screenContext,[\s\S]*?batch\.lamps\.flash, commands\)/);assert.match(rust,/pub fn draw_dark_overlay\([\s\S]*?destination-out[\s\S]*?draw_image_at\(screen_context, overlay/);
    assert.match(read('wasm-renderer/src/lib.rs'),/pub extern "C" fn draw_dark_overlay\(\)[\s\S]*?v\[4\] <= 0\.0 \|\| v\[5\] <= 0\.0 \|\| v\[6\] <= 0\.0[\s\S]*?v\[8\] == 0\.0 \|\| v\[8\] == 1\.0[\s\S]*?v\[9\] == 0\.0 \|\| v\[9\] == 1\.0/);
    assert.match(bridge,/state\.direct\.drawFx\(batch\.context, commands, batch\.muzzleSprite \|\| null\)/);assert.match(rust,/pub fn draw_fx\([\s\S]*?set_global_composite_operation\("lighter"\)[\s\S]*?context\.arc\(/);
    assert.match(bridge,/state\.direct\.drawShells\(batch\.context, commands, count\)/);assert.match(rust,/pub fn draw_shells\([\s\S]*?set_global_alpha\(0\.72\)[\s\S]*?context\.ellipse\(/);
    assert.match(bridge,/state\.direct\.drawComboText\(batch\.context, commands, label\)/);assert.match(rust,/pub fn draw_combo_text\([\s\S]*?set_font\("bold 54px Impact, sans-serif"\)[\s\S]*?stroke_text\(label[\s\S]*?fill_text\(label/);
    assert.match(bridge,/state\.direct\.drawAlarmText\(batch\.context, commands, label\)/);assert.match(rust,/pub fn draw_alarm_text\([\s\S]*?set_font\("bold 14px Orbitron, sans-serif"\)[\s\S]*?fill_text\(label/);
    assert.match(bridge,/state\.direct\.drawHudImage\(batch\.context, image, commands\)/);assert.match(rust,/pub fn draw_hud_image\([\s\S]*?supported_image\(image\)[\s\S]*?draw_image_at\(context, image/);
    assert.match(bridge,/state\.direct\.drawBullets\(batch\.context, commands, batch\.mine, batch\.foe\)/);assert.match(rust,/pub fn draw_bullets\([\s\S]*?supported_image\(mine\)[\s\S]*?draw_image_at\(context, image/);
    assert.match(bridge,/state\.direct\.drawColorGrade\(context, width, height\)/);assert.match(rust,/pub fn draw_color_grade\([\s\S]*?set_global_composite_operation\("soft-light"\)[\s\S]*?set_global_composite_operation\("overlay"\)/);
    assert.match(bridge,/state\.direct\.drawFinalOverlays\(context, width, height, fade, flash, flashEnabled\)/);assert.match(rust,/pub fn draw_final_overlays\([\s\S]*?rgba\(8,0,20,\{fade\}\)[\s\S]*?rgba\(255,46,147/);
    assert.match(html,/wasmRenderer\.setCanvasImageSmoothing\(g, false\)/);assert.match(bridge,/state\.direct\.setCanvasImageSmoothing\(context, enabled\)/);assert.match(rust,/pub fn set_canvas_image_smoothing\([\s\S]*?set_image_smoothing_enabled\(enabled\)/);
    assert.match(fx,/renderer\.createTextImage\(k, s, font, col, false\)/);assert.match(html,/renderer\.createTextImage\(k, s, font, c, true\)/);assert.match(bridge,/state\.direct\.createTextImage\(canvas, text, font, color, outlined\)/);assert.match(rust,/pub fn create_text_image\([\s\S]*?measure_text\(text\)[\s\S]*?fill_text\(text, 2\.0, 17\.0\)/);assert.match(rust,/stroke_text\(text, 6\.0, baseline\)/);
    assert.match(rust,/pub fn draw_batch_commands\([\s\S]*?CanvasRenderingContext2d[\s\S]*?Float64Array[\s\S]*?JsValue/);assert.match(bridge,/state\.direct\.drawBatchCommands\(batch\.context, commands, FURNITURE_COLORS, ACTOR_COLORS, batch\)/);
    assert.match(rust,/pub fn draw_map_commands\([\s\S]*?CanvasRenderingContext2d[\s\S]*?Float64Array[\s\S]*?Array/);assert.match(bridge,/state\.direct\.drawMapCommands\(batch\.context, commands, batch\.mapColors \|\| \[\]\)/);assert.match(bridge,/batch\.commands\.push\(opcode, color, x1, y1, x2, y2, lineWidth, alpha\)/);
    assert.match(rust,/batch_array\(batch, "enemyTextImages"\)/);assert.match(rust,/draw_image_at\(context, &image, &\[x, y\]\)/);assert.match(bridge,/painters\.textImage\(enemy, commands\[offset \+ 1\] \| 0, commands\[offset \+ 2\], commands\[offset \+ 3\]\)/);
    assert.match(rust,/pub fn draw_dust\([\s\S]*?CanvasRenderingContext2d[\s\S]*?Float64Array/);assert.match(rust,/pub fn draw_sparks\([\s\S]*?set_global_composite_operation\("lighter"\)/);assert.match(bridge,/state\.direct\.drawDust\(batch\.context, commands, alpha\)/);assert.match(bridge,/state\.direct\.drawSparks\(batch\.context, commands, batch\.colors\)/);
    assert.match(rust,/pub fn draw_live_blood\([\s\S]*?CanvasRenderingContext2d[\s\S]*?Float64Array/);assert.match(rust,/pub fn draw_static_blood\([\s\S]*?CanvasRenderingContext2d[\s\S]*?Float64Array/);assert.match(bridge,/state\.direct\.drawLiveBlood\(batch\.context, commands, batch\.color\)/);assert.match(bridge,/state\.direct\.drawStaticBlood\(batch\.context, commands, batch\.color\)/);
    assert.match(build,/wasm-bindgen \$directTargetWasm --target web/);
    assert.match(worker,/wasm-renderer\/pkg\/direct\/direct_renderer_bg\.wasm/);
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
    assert.match(a11y,/aria-controls/);assert.match(a11y,/aria-labelledby/);assert.match(a11y,/ArrowRight/);assert.match(a11y,/ArrowLeft/);assert.match(a11y,/e\.key === 'Home'/);assert.match(a11y,/e\.key === 'End'/);
  });
  await test('Intensidade do tremor é persistida, limitada e aplicada a coice/tela', () => {
    const game=read('index.html'),ui=read('js/exp-ui.js');
    assert.match(game,/shakeAmt: 100/);assert.match(game,/shakeAmt:\[0,100\]/);
    assert.match(game,/o-shakeAmt/);assert.match(game,/power \* CFG\.shakeAmt \/ 100/);assert.match(game,/kickX \* shakeScale/);
    assert.match(ui,/const smooth = !!CFG\.aa/);assert.match(ui,/renderer\.setupCanvas\(ctx, hiK, smooth, quality/);
    assert.match(ui,/quality === 2 \? 'high' : quality === 1 \? 'medium' : 'low'/);
    assert.doesNotMatch(ui,/ctx\.imageSmoothingEnabled = true/);
  });
  await test('Reduzir flashes suprime relâmpagos e cintilações de tela', () => {
    const fx=read('js/exp-fx.js');assert.match(fx,/const stormFlash = FX\.kind === 'chuva' \? FX\.bolt : 0/);
    assert.match(fx,/drawFxOverlays\(g, 0, W_, H_, now, stormFlash, FX\.flick, !CFG\.noflash\)/);
    assert.match(fx,/if \(stormFlash > 0 && !CFG\.noflash\)/);assert.match(fx,/if \(FX\.flick > 0 && !CFG\.noflash\)/);
    assert.match(fx,/darkRenderer\.drawDarkOverlay\(dg, g, dk, LAMP, P\.x, P\.y, cam\.x, cam\.y, W_, H_, zoom, P\.a, EXP\.world\.blackout > 0, P\.fireFlash > 0\)/);
    assert.match(fx,/if \(!darkBatchDrawn\) \{/);
    assert.match(read('js/wasm-renderer.js'),/draw_dark_overlay\(\)/);
    assert.match(read('index.html'),/comboTextRenderer\.drawComboText\(ctx, combo, comboNow\)/);
    assert.match(read('js/wasm-renderer.js'),/draw_combo_text\(\)/);
    assert.match(read('index.html'),/drawHudImage\(ctx, 0, W, H, CFG\.crt, true/);
    assert.match(read('index.html'),/drawHudImage\(ctx, 2, W, H, false, true/);
    assert.match(read('js/exp-fx.js'),/weatherRenderer\.drawHudImage\(g, 3, W_, H_, false, true/);
    assert.match(read('js/wasm-renderer.js'),/draw_hud_image\(\)/);
    assert.match(fx,/alarmTextRenderer\.drawAlarmText\(g, EXP\.world\.alarmT, W_\)/);
    assert.match(read('js/wasm-renderer.js'),/draw_alarm_text/);
  });
  await test('Anéis de mundo da expansão usam batch Rust com fallback Canvas', () => {
    const world=read('js/exp-world.js'),renderer=read('js/wasm-renderer.js');
    assert.match(world,/ringRenderer\.drawWorldRings\(g, WLD\.rings\)/);
    assert.match(world,/if \(!\(ringRenderer && ringRenderer\.drawWorldRings/);
    assert.match(renderer,/wasm\.exports\.draw_world_rings\(count, colors\.length\)/);
    assert.match(renderer,/worldRingCommands/);
  });
  await test('Passe de luz vazio não altera o Canvas e preserva o fallback com efeitos ativos', () => {
    const fx=read('js/exp-fx.js');
    assert.match(fx,/let hasEnabledLight = false;[\s\S]*?if \(!L\.on\) continue;[\s\S]*?hasEnabledLight = true;/);
    assert.match(fx,/if \(canDrawWorldLights && \(!L\.spr \|\| L\.sprR !== L\.r \|\| L\.sprC !== L\.c\)\)/);
    assert.match(fx,/if \(!worldLightBatchDrawn && !hasEnabledLight && !hasFireFlash && !hasRainReflection\) return;/);
    assert.match(fx,/if \(!worldLightBatchDrawn\) \{\s*g\.save\(\); g\.globalCompositeOperation = 'lighter';/);
  });
  await test('Zona pulsante da Invasão passa pelo batch Rust com fallback Canvas', () => {
    const modes=read('js/exp-modes.js'),renderer=read('js/wasm-renderer.js');
    assert.match(modes,/zoneRenderer\.drawInvasionZone\(g, z\.x, z\.y, now\)/);
    assert.match(modes,/if \(!\(zoneRenderer && zoneRenderer\.drawInvasionZone/);
    assert.match(renderer,/wasm\.exports\.draw_invasion_zone\(\)/);
  });
  await test('Barris da expansão usam batch Rust com fallback Canvas e preservam o limite', () => {
    const world=read('js/exp-world.js'),renderer=read('js/wasm-renderer.js');
    assert.match(world,/barrelRenderer\.drawWorldBarrels\(g, WLD\.barrels, now\)/);
    assert.match(world,/if \(!\(barrelRenderer && barrelRenderer\.drawWorldBarrels/);
    assert.match(renderer,/wasm\.exports\.draw_world_barrels\(barrels\.length, nowMs\)/);
    assert.match(renderer,/barrels\.length > 16/);
  });
  await test('Câmeras da expansão enviam cone e corpo em batch Rust com fallback Canvas', () => {
    const world=read('js/exp-world.js'),renderer=read('js/wasm-renderer.js');
    assert.match(world,/cameraRenderer\.drawWorldCameras\(g, WLD\.cams, WLD\.alarmT > 0\)/);
    assert.match(world,/if \(!\(cameraRenderer && cameraRenderer\.drawWorldCameras/);
    assert.match(renderer,/wasm\.exports\.draw_world_cameras\(cameras\.length\)/);
    assert.match(renderer,/cameras\.length > 8/);
    assert.match(renderer,/camera\.poly\.length < 26/);
  });
  await test('Realces visuais de inimigos da expansão geram linhas, barras e vetores no Rust', () => {
    const world=read('js/exp-world.js'),renderer=read('js/wasm-renderer.js');
    assert.match(world,/enemyAccentRenderer\.drawWorldEnemyAccents\(g, enemies, now, P\.x, P\.y, g\.globalAlpha\)/);
    assert.match(world,/if \(!\(P && enemyAccentRenderer/);
    assert.match(renderer,/wasm\.exports\.draw_world_enemy_accents\(count, nowMs\)/);
    assert.match(renderer,/enemy\.cls === 'blindado' \? 1 : enemy\.cls === 'lider' \? 2 : boss \? 3 : 0/);
    assert.match(renderer,/enemies\.length > 256/);
  });
  await test('Tremores de quadro combinam screen shake, kick e camera shake no batch Rust', () => {
    const html=read('index.html'),renderer=read('js/wasm-renderer.js');
    assert.match(html,/frameTransformRenderer\.drawFrameTransforms\(ctx, 0, screenShakeNow, screenShakePower, screenRx, screenRy/);
    assert.match(html,/frameTransformRenderer\.drawFrameTransforms\(ctx, 1, 0, 0, \.5, \.5, kickX, kickY/);
    assert.match(html,/if \(!screenTransformDrawn\) \{\s*ctx\.save\(\);/);
    assert.match(html,/if \(!cameraTransformDrawn\) \{/);
    assert.match(html,/drawFrameTransforms\(ctx, 2, 0, 0, \.5, \.5, 0, 0, 0, 0, \.5, \.5, W, H, CFG\.zoom, cam\.x, cam\.y\)/);
    assert.match(renderer,/else if \(op === 39\) g\.scale\(a, b\)/);
    assert.match(renderer,/wasm\.exports\.draw_frame_transforms\(stage\)/);
    assert.match(renderer,/frameTransformCommands/);
  });
  await test('Escopos de transformação do quadro abrem e fecham no batch Rust com fallback', () => {
    const html=read('index.html'),renderer=read('js/wasm-renderer.js'),rust=read('wasm-renderer/src/lib.rs');
    assert.match(html,/drawFrameTransforms\(ctx, 0, screenShakeNow/);
    assert.match(html,/drawFrameTransforms\(ctx, 1, 0, 0, \.5, \.5, kickX/);
    assert.match(html,/drawFrameTransforms\(ctx, 3, 0, 0, \.5, \.5/);
    assert.match(html,/drawFrameTransforms\(ctx, 4, 0, 0, \.5, \.5/);
    assert.match(html,/if \(!screenTransformDrawn\) \{\s*ctx\.save\(\);/);
    assert.match(html,/if \(!worldTransformRestored\) ctx\.restore\(\);/);
    assert.match(html,/if \(!frameTransformRestored\) ctx\.restore\(\);/);
    assert.match(renderer,/stage !== 0 && stage !== 1 && stage !== 2 && stage !== 3 && stage !== 4/);
    assert.match(rust,/furniture_command\(16, 0, 0\.0, 0\.0, 0\.0, 0\.0, 0\.0, 0\.0\)/);
    assert.match(rust,/if stage == 3 \|\| stage == 4 \{/);
  });
  await test('Renderer não reescreve alpha padrão após batch de ghosts', () => {
    const html=read('index.html');
    assert.match(html,/const ghostRenderer = window\.HM_WASM_RENDERER;[\s\S]*?if \(!\(ghostRenderer && ghostRenderer\.drawGhosts/);
    assert.match(html,/if \(ctx\.globalAlpha !== 1\) ctx\.globalAlpha = 1;/);
  });
  await test('Rótulo de transporte usa batch HUD Rust com fallback de texto', () => {
    const html=read('index.html'),renderer=read('js/wasm-renderer.js');
    const match=html.match(/if \(transportWasm && transportWasm\.drawTransport && transportWasm\.drawTransport\(ctx, t, andar\)\) \{([\s\S]*?)\n  \}/);
    assert.ok(match,'WASM transport branch should stay isolated');
    assert.match(match[1],/drawHudTextBatch\(\[\{ text: t\.tipo\.toUpperCase\(\)/);
    assert.doesNotMatch(match[1],/tx\(/,'the WASM branch must not draw the label through the generic Canvas dispatcher');
    assert.match(html,/tx\(t\.tipo\.toUpperCase\(\) \+ \(up \? ' ▲' : ' ▼'\), cx, y - 8/,'the Canvas transport fallback keeps its original label');
    assert.match(renderer,/state\.drawHudTexts =/);
  });
  await test('Gradientes de escada/elevador usam RGBA Rust cacheado e preservam o gradiente inteiro das portas', () => {
    const html=read('index.html'),renderer=read('js/wasm-renderer.js'),rust=read('wasm-renderer/src/lib.rs');
    assert.match(html,/createLinearGradient\(x, y, x \+ w, y\)/);
    assert.match(renderer,/const transportGradientCache = new WeakMap\(\)/);
    assert.match(renderer,/generate_transport_gradient\(width, height, kind, offsetX, gradientWidth\)/);
    assert.match(renderer,/const doorRight = getGradient\('doorRight', doorWidth, doorHeight, 2, transport\.w \/ 2 \+ 1, transport\.w\)/);
    assert.match(rust,/let door_t = \(offset_x \+ x as f64 \+ 0\.5\) \/ gradient_width/);
    assert.match(rust,/pub extern "C" fn generate_transport_gradient\(width: u32, height: u32, kind: u32, offset_x: f64, gradient_width: f64\)/);
    const transportBatch=renderer.slice(renderer.indexOf('draw_transport_batch(pointer, count)'),renderer.indexOf('draw_transport_gradient_batch(pointer, width, height)'));
    assert.match(transportBatch,/drawImage\(variant \? batch\.gradients\.doorRight : batch\.gradients\.doorLeft/);
    assert.match(transportBatch,/drawImage\(batch\.gradients\.(stair|elevator)/);
    assert.doesNotMatch(transportBatch,/createLinearGradient|addColorStop/);
  });
  await test('Créditos do overlay usam texto HUD Rust bruto com painter de fallback idêntico', () => {
    const shop=read('js/exp-shop.js'),renderer=read('js/wasm-renderer.js');
    assert.match(shop,/const creditHudEntry = \[\{ text: ''/);
    assert.match(shop,/drawRawHudTexts\(creditHudEntry, g\)/);
    assert.match(shop,/g\.textAlign = 'left'; g\.font = 'bold 18px Impact, sans-serif'; g\.fillStyle = '#ffd23f';\s*g\.fillText\(creditHudEntry\[0\]\.text, 34, 156\); g\.restore\(\);/);
    assert.match(renderer,/state\.drawRawHudTexts = \(entries, context\)/);
    assert.match(renderer,/context\.fillText\(entry\.text, commands\[i \+ 1\], commands\[i \+ 2\]\)/);
    assert.match(renderer,/raw \? \(entry\.absoluteAlpha \? alpha : baseAlpha \* alpha\) : alpha/);
  });
  await test('Textos do dealer, cards, reroll e balão passam pelo batch HUD e preservam o wrap em cache', () => {
    const shop=read('js/exp-shop.js'),renderer=read('js/wasm-renderer.js');
    const extract=(start,end)=>shop.slice(shop.indexOf(start),shop.indexOf(end,shop.indexOf(start)+start.length));
    for(const [name,end] of [['function drawBubble(','function drawCard('],['function drawCard(','function drawReroll('],['function drawReroll(','// Madame Piranha:']]) {
      const body=extract(name,end); assert.ok(body.length>0,`${name} should exist`); assert.doesNotMatch(body,/\.fillText\(/,`${name} should submit raw text through the batch`);
    }
    assert.match(shop,/function flushDealerText\(g\)[\s\S]*?drawRawHudTexts\(dealerTextBatch, g\)/);
    assert.match(shop,/entry\.absoluteAlpha = absoluteAlpha/);
    assert.match(shop,/if \(txt === bubbleCacheText && fontKey === bubbleCacheFont && maxW === bubbleCacheWidth\) return bubbleCacheLines/);
    assert.match(renderer,/entry\.absoluteAlpha \? alpha : baseAlpha \* alpha/);
  });
  await test('Geometria da Madame Piranha e painéis da loja são gerados em Rust com fallback Canvas', () => {
    const shop=read('js/exp-shop.js'),renderer=read('js/wasm-renderer.js'),rust=read('wasm-renderer/src/lib.rs');
    assert.match(shop,/renderer\.drawShopDealer\(g, \[[\s\S]*?d\.fall > 0 \? 1 : 0/);
    assert.match(shop,/if \(!dealerDrawn\) \{[\s\S]*?g\.ellipse\(gx, gy \+ 10/);
    assert.match(shop,/renderer\.drawShopPanel\(g, \[0, x, by, w, h, 22, 0\]\)/);
    assert.match(shop,/renderer\.drawShopPanel\(g, \[1, cx, cy, w, h, 24, flick \? 1 : 0\], c\.slot\.cor\)/);
    assert.match(shop,/renderer\.drawShopPanel\(g, \[2, cx, cy, w, h, 18, 0\]\)/);
    assert.match(renderer,/state\.drawShopDealer = \(context, inputValues\)/);
    assert.match(renderer,/state\.drawShopPanel = \(context, inputValues, outlineColor\)/);
    assert.match(renderer,/op === 2[\s\S]*?context\.ellipse\(x, y, width, height/);
    assert.match(rust,/pub extern "C" fn draw_shop_dealer\(\)/);
    assert.match(rust,/pub extern "C" fn draw_shop_panel\(\)/);
    assert.match(rust,/hud_shape_command\(5, gx, gy \+ 6\.0, 30\.0, timer_ratio\.clamp/);
  });
  await test('Sprites de luz radial são rasterizados em RGBA pelo Rust com fallback Canvas', () => {
    const fx=read('js/exp-fx.js'),renderer=read('js/wasm-renderer.js'),rust=read('wasm-renderer/src/lib.rs'),build=read('wasm-renderer/build.ps1');
    assert.match(fx,/radialRenderer\.createRadialSprite\(c, rgb, r, a0\)/);
    assert.match(renderer,/state\.createRadialSprite = \(canvas, rgb, radius, alpha\)/);
    assert.match(renderer,/draw_radial_sprite_batch\(pointer, width, height\)/);
    assert.match(rust,/pub extern "C" fn generate_radial_sprite\(\)/);
    assert.match(rust,/RADIAL_SPRITE_PIXELS/);
    assert.match(build,/if \(\$LASTEXITCODE -ne 0\)/);
  });
  await test('Clarões de disparo usam sprite RGBA Rust e preservam o fallback Canvas', () => {
    const html=read('index.html'),renderer=read('js/wasm-renderer.js'),rust=read('wasm-renderer/src/lib.rs');
    assert.match(html,/fxWasm\.drawFx && fxWasm\.drawFx\(ctx, fx\)/);
    assert.match(html,/createRadialGradient\(f\.x, f\.y, 0, f\.x, f\.y, f\.R\)/);
    assert.match(rust,/pub extern "C" fn generate_muzzle_sprite\(\)/);
    assert.match(renderer,/draw_muzzle_sprite_batch\(pointer, width, height\)/);
    assert.match(renderer,/context\.drawImage\(batch\.muzzleSprite, x - radius, y - radius, radius \* 2, radius \* 2\)/);
    const fxBatch=renderer.slice(renderer.indexOf('draw_fx_batch(pointer, count)'),renderer.indexOf('draw_pickup_batch(pointer, count)'));
    assert.doesNotMatch(fxBatch,/createRadialGradient|addColorStop/);
  });
  await test('Gradiente da saída é pré-rasterizado pelo Rust e mantém o painter Canvas de fallback', () => {
    const html=read('index.html'),renderer=read('js/wasm-renderer.js'),rust=read('wasm-renderer/src/lib.rs');
    assert.match(html,/exitWasm\.drawExit && exitWasm\.drawExit\(ctx, exitR, pulse, cleared, CFG\.bloom !== false\)/);
    assert.match(html,/createLinearGradient\(ex, ey, ex \+ ew, ey \+ eh\)/);
    assert.match(rust,/pub extern "C" fn generate_exit_gradient\(width: u32, height: u32, cleared: u32\)/);
    const exitBatch=renderer.slice(renderer.indexOf('draw_exit_batch(pointer, count)'),renderer.indexOf('draw_color_grade_batch(pointer, count)'));
    assert.match(exitBatch,/drawImage\(batch\.gradientCanvas/);
    assert.doesNotMatch(exitBatch,/createLinearGradient|addColorStop/);
  });
  await test('Vidros intactos e estilhaços de expansão usam batch Rust com fallback', () => {
    const fx=read('js/exp-fx.js'),renderer=read('js/wasm-renderer.js'),rust=read('wasm-renderer/src/lib.rs');
    assert.match(fx,/drawGlass\(g, EXP\.glass\.list, SH, now, g\.globalAlpha\)/);
    assert.match(renderer,/wasm\.exports\.draw_glass\(panels\.length, shardCount, nowMs, baseAlpha\)/);
    assert.match(rust,/pub extern "C" fn draw_glass\(panel_count: u32, shard_count: u32, now_ms: f64, base_alpha: f64\)/);
    assert.match(fx,/for \(const gl of EXP\.glass\.list\)/);
  });
  await test('Jogar Solo desliga multiplayer persistido e evita criar P2', () => {
    const html=read('index.html'),ui=read('js/exp-ui.js');
    assert.match(html,/jogar.*EXP\.MULTI\.enabled = false/);assert.match(ui,/jogar.*EXP\.MULTI\.enabled = false/);
    assert.match(html,/EXP\.MULTI\.P2 = null/);assert.match(ui,/EXP\.MULTI\.P2 = null/);
  });
  await test('Otimização não força escala 2x nem desenha partículas com saves separados', () => {
    const ui=read('js/exp-ui.js'),html=read('index.html');
    assert.match(ui,/Math\.min\(1\.5, Math\.max\(1\.1/);assert.match(html,/ctx\.fillStyle = '#c8b8ff'; ctx\.beginPath\(\)/);assert.match(html,/if \(shellParticles\.length\) \{/);
  });
  await test('Governador de desempenho usa tempo de quadro real e reduz efeitos sem trocar preferências', () => {
    const html=read('index.html'),fx=read('js/exp-fx.js');
    assert.match(html,/const rawDt = Math\.max/);assert.match(html,/perfSamples\.push\(rawDt\)/);assert.match(html,/window\.EXP\.perfTier = 1/);
    assert.match(html,/tier >= 1 \? \.55/);assert.match(fx,/EXP\.perfTier >= 1 \? 2 : 1/);assert.match(fx,/EXP\.perfTier < 2/);
  });
  await test('BuildFloor envia granulado, sombras e rejunte ao Rust com fallback JS', () => {
    const html=read('index.html'),renderer=read('js/wasm-renderer.js');
    assert.match(html,/renderer\.paintFloorGrain\(fg, WW, WH, R2\)/);
    assert.match(html,/renderer\.paintFloorFinish\(fg, sol, WW, WH\)/);
    assert.match(html,/if \(!grainRendered\) for \(let k = 0; k < Math\.round\(WW \* WH \/ 160\)/);
    assert.match(html,/if \(!finishRendered\) \{/);
    assert.match(renderer,/paint_floor_grain_rgba\(width, height, random\.getState\(\)\)/);
    assert.match(renderer,/draw_floor_rgba_batch\(pointer, width, height\)/);
    assert.match(renderer,/floorGrainImageCache = new WeakMap\(\)/);
    assert.match(renderer,/batch\.context\.putImageData\(batch\.image, 0, 0\)/);
    assert.match(read('wasm-renderer/src/lib.rs'),/const FLOOR_GRAIN_MAX_WIDTH: usize = 1440;[\s\S]*const FLOOR_GRAIN_MAX_HEIGHT: usize = 900/);
    assert.match(renderer,/floorGrainRasterReady\.has\(context\)/);
    assert.match(renderer,/const useCanvasFallback = \(\) => \{ if \(context\) floorGrainRasterReady\.delete\(context\); return false; \}/);
    assert.match(renderer,/paint_floor_finish_rgba\(solids\.length, width, height\)/);
    assert.match(read('wasm-renderer/src/lib.rs'),/pub extern "C" fn paint_floor_finish_rgba\(solid_count: u32, width: f64, height: f64\)/);
    assert.match(read('wasm-renderer/src/lib.rs'),/pub extern "C" fn paint_floor_finish\(solid_count: u32, width: f64, height: f64\)/,'legacy Canvas command route is retained for fallback compatibility');
  });
  await test('BuildFloor envia texturas de sólidos e aberturas ao Rust preservando fallback', () => {
    const html=read('index.html'),renderer=read('js/wasm-renderer.js'),rust=read('wasm-renderer/src/lib.rs'),pixelTest=read('tests/wasm-floor-pixel-parity.cjs');
    assert.match(html,/renderer\.paintMapTextures\(tc, sol, keep, mapTextures, T\)/);
    assert.match(html,/wallSheet: ready\(WALLT\) \? WALLT : null/);
    assert.match(html,/furnitureSheet: ready\(FURNT\) \? FURNT : null/);
    assert.match(html,/doorSheet: ready\(DOORT\) \? DOORT : null/);
    assert.match(html,/if \(!texturesRendered\) \{/);
    assert.match(renderer,/paint_map_textures\(solids\.length, openings\.length/);
    assert.match(renderer,/map_texture_pixels_ptr/);assert.match(renderer,/paint_map_textures_rgba\(/);
    assert.match(rust,/pub extern "C" fn paint_map_textures_rgba/);
    assert.match(rust,/pub extern "C" fn map_texture_sheet_pixels_ptr/);
    assert.match(rust,/pub extern "C" fn copy_map_texture_sprite/);
    assert.match(renderer,/copy_map_texture_sprite\(slot, pixels\.width, pixels\.height, sourceX, sourceY\)/);
    assert.match(pixelTest,/mapTextureParity\.maxDifference>80/);assert.match(pixelTest,/mapTextureParity\.meanDifference>0\.0025/);
    assert.match(pixelTest,/wallSheet:ready\(WALLT\)\?WALLT:null/);
    assert.match(pixelTest,/furnitureSheet:ready\(FURNT\)\?FURNT:null/);
    assert.match(pixelTest,/doorSheet:ready\(DOORT\)\?DOORT:null/);
    assert.match(renderer,/else if \(op === 31\)/);assert.match(renderer,/else if \(op === 32\)/);
  });
  await test('Névoa e fumaça geram sprite RGBA por Rust e mantêm fallback Canvas', () => {
    const fx=read('js/exp-fx.js'),renderer=read('js/wasm-renderer.js'),rust=read('wasm-renderer/src/lib.rs'),pixels=read('tests/wasm-floor-pixel-parity.cjs');
    assert.match(fx,/const fogRings = Array\.from\(\{ length: 9 \}/);assert.match(fx,/renderer\.createFogSprite\(canvas, fogRings\)/);
    assert.match(fx,/createRadialGradient/);assert.match(renderer,/wasm\.exports\.generate_fog_sprite\(\)/);
    assert.match(rust,/pub extern "C" fn generate_fog_sprite/);assert.match(pixels,/fogSpriteParity/);assert.match(pixels,/maxAlphaDifference>1/);
  });
  await test('BuildFloor envia FTILES ao Rust e preserva fallback do corredor', () => {
    const html=read('index.html'),renderer=read('js/wasm-renderer.js'),rust=read('wasm-renderer/src/lib.rs');
    assert.match(html,/renderer\.paintFloorTiles\(fg, rooms, tIdx, FTILES\)/);
    assert.match(html,/if \(!floorTilesRendered\) \{/);
    const block=renderer.match(/state\.paintFloorTiles = \(context, rooms, tileIndex, tileImage\) => \{[\s\S]*?\n      state\.paintFloorFinish/mi)?.[0];assert.ok(block);
    assert.match(block,/floorGrainRasterReady\.has\(context\)/);
    assert.match(block,/sourceContext\.getImageData\(0, 0, 72, 24\)\.data/);
    assert.match(block,/floor_tile_pixels_ptr\(\)/);
    assert.match(block,/paint_floor_tiles_rgba\(rooms\.length, hallIndex, tileIndex, grain\.width, grain\.height\)/);
    assert.match(block,/drawnRooms === -1 \|\| drawnRooms === 0xffffffff/);
    assert.match(renderer,/else if \(op === 33\)/,'legacy command renderer remains available for fallback');
    assert.match(rust,/pub extern "C" fn paint_floor_tiles_rgba\(room_count: u32, hall_index: i32, tile_index: i32, width: f64, height: f64\)/);
    assert.match(rust,/let source_x = \(x \+ tile_index as usize \* 24\) % 72/);
    assert.match(rust,/pub extern "C" fn paint_floor_tiles\(room_count: u32, hall_index: i32, tile_index: i32\)/);
  });
  await test('Portas Neon enviam sprite e transformação ao Rust com fallback JS', () => {
    const html=read('index.html'),renderer=read('js/wasm-renderer.js'),rust=read('wasm-renderer/src/lib.rs');
    const block=html.match(/function drawDoors\(\) \{[\s\S]*?\n\}/)?.[0];assert.ok(block);
    assert.match(block,/renderer\.drawNeonDoors\(ctx, neonBatch\)/);
    assert.match(block,/if \(!rendered\) for \(const door of neonBatch\) neonDrawDoor\(door\.fallback\)/);
    assert.match(renderer,/drawNeonDoors = \(context, doors\)/);
    assert.match(renderer,/draw_neon_doors\(doors\.length\)/);
    assert.match(renderer,/else if \(op === 34\)/);
    assert.match(rust,/pub extern "C" fn draw_neon_doors\(count: u32\)/);
  });
  await test('Janelas quebráveis, perímetro Neon e armas têm integração própria', () => {
    const html=read('index.html');
    assert.match(html,/let breakables = \[\], brokenGlass = \[\]/);
    assert.match(html,/function shatterBreakable\(b/);
    assert.match(html,/const glass = breakableAt\(b\.x, b\.y\)/);
    assert.match(html,/walls\.push\(\[0, 0, WW, edge\]/);
    for (const id of ['pistola','escopeta','rifle','revolver','uzi']) assert.match(html,new RegExp("w === '"+id+"'"));
    assert.match(html,/EXP\.toast\('DESEMPENHO AJUSTADO'/);
  });
  await test('IA cooperativa troca para alvo vivo e captura erros iniciais', () => {
    const html=read('index.html'),brain=read('js/exp-brain.js'),world=read('js/exp-world.js'),debug=read('js/exp-debug.js');
    assert.match(html,/function activeTarget\(/);assert.match(html,/window\.EXP\.targetActor = activeTarget/);
    assert.match(brain,/EXP\.targetActor \? EXP\.targetActor\(e\.x, e\.y\)/);
    assert.match(world,/const target = targetFor\(e\.x, e\.y\)/);
    assert.match(debug,/window\.__earlyErrors\.splice\(0\)/);
  });
  await test('Spawns cooperativos usam o jogador vivo como referência', () => {
    const html=read('index.html'), world=read('js/exp-world.js');
    assert.match(html,/function focusActor\(\) \{ return activeTarget\(P\?\.x \|\| 0, P\?\.y \|\| 0\) \|\| P; \}/);
    assert.match(html,/const focus = focusActor\(\), reach = reachMap\(focus\.x, focus\.y\)/);
    assert.match(world,/const focusActor = \(\) => EXP\.focusActor \? EXP\.focusActor\(\) : P/);
    assert.match(world,/hyp\(x - focus\.x, y - focus\.y\)/);
  });
  await test('Aberturas de parede geram portas com colisão e desenho próprios', () => {
    const html=read('index.html');
    assert.match(html,/function addDoor\(x, y, w, h, vert/);
    assert.match(html,/wallV\(x, y0, y1, gaps\).*addDoor/s);
    assert.match(html,/wallH\(y, x0, x1, gaps\).*addDoor/s);
    assert.match(html,/addDoor\(a, yy - h, Dw, T, false, Dw\)/);
    assert.match(html,/addDoor\(xx - h, a, T, Dw, true, Dw\)/);
    assert.match(html,/d\.vert \? \[-4, 0, 8, d\.h\] : \[0, -4, d\.w, 8\]/);
    const procedural=html.match(/function buildMap\(n\) \{[\s\S]*?\n\}/)?.[0]||'';
    const fixed=html.match(/function buildFixed\(m, n\) \{[\s\S]*?\n\}/)?.[0]||'';
    assert.match(procedural,/doors = \[\]/);
    assert.match(procedural,/refreshSol\(\);/);
    assert.match(fixed,/doors = \[\]/);
  });
  await test('Campanha mantém a primeira fase, bloqueia avanço duplicado e remove reinício por R', () => {
    const html=read('index.html'), modes=read('js/exp-modes.js'), world=read('js/exp-world.js'), ui=read('js/exp-ui.js'), debug=read('js/exp-debug.js');
    assert.match(modes,/m\.tiles\) \{ mapSel = 'tiles'; EXP\.tileIdx = 0; lvl = 1; \}/);
    assert.match(modes,/r\.currentTile = 0; r\.pending = false/);
    assert.match(modes,/r\.currentTile !== EXP\.tileIdx/);
    assert.match(world,/EXP\.run\.currentTile = EXP\.tileIdx; EXP\.run\.pending = false/);
    assert.doesNotMatch(html,/key === 'r'.*newGame/s);
    assert.doesNotMatch(html,/R · RECOMEÇAR|ou aperte R/);
    assert.doesNotMatch(ui,/R · RECOMEÇAR|id: 'rest'/);
    assert.doesNotMatch(debug,/F8 reiniciar|e\.key === 'F8'/);
  });
  await test('Allowlist de mapas, títulos limpos e progressão narrativa sem referências excluídas', () => {
    const c=mapConfiguration(),html=c.html;
    assert.equal(c.fixedBase.length,18);assert.equal(c.fixed.length,18);assert.ok(c.fixedAllowed.includes('apto'),'mapa Apartamentos permanece apesar da dimensão interna');
    assert.equal(new Set(c.fixedAllowed).size,c.fixedAllowed.length);assert.ok(c.fixedBase.every(m=>c.fixedAllowed.includes(m.id)));
    assert.equal(c.neonAllowed.length,61);assert.equal(c.playable.length,61);assert.equal(new Set(c.neonAllowed).size,c.neonAllowed.length);
    assert.ok(c.neonAllowed.every(name=>c.neonData.some(m=>m.name===name)));
    assert.deepEqual(Array.from(c.gridAllowed),['metro','overdose']);assert.equal(c.grids.length,2);
    const selectorValues=[...c.modes,...c.fixed.map(m=>m.id),...c.grids.map(g=>'grid:'+g.id),...c.playable.map(m=>'neon:'+m.name)];
    assert.ok(selectorValues.every(value=>c.selectorAllowed.has(value)),'cada opção de mapa vem da allowlist global');
    assert.match(html,/const MAP_SELECTOR_OPTIONS = \[[\s\S]*\.\.\.MAPAS\.map[\s\S]*\.\.\.GRIDS_PERMITIDAS\.map[\s\S]*\.\.\.NEON_PLAYABLE\.map[\s\S]*\.filter\(\(\[value\]\) => MAP_SELECTOR_ALLOWED\.has\(value\)\)/);
    assert.ok(c.playable.every(m=>m.objects.some(o=>/enemy|guard|thug|mobster|assassin|patrol|gangster/i.test(o[0]))));
    for(const name of ['rmTrailer','rmTestRoom','rmSequence12c','rmHouse1Downstairs','rmHouse1Upstairs',...Array.from({length:10},(_,i)=>`rmTestLevel${i+1}`)]){
      assert.ok(c.neonExcluded.has(name),`${name} explicitamente excluído`);
      assert.ok(!c.playable.some(m=>m.name===name),`${name} ausente do seletor ativo`);
      assert.ok(!c.story.some(s=>s.neon===name),`${name} ausente da progressão`);
    }
    assert.equal(c.hasDimensions('Trailer 640 x 580'),true);assert.equal(c.hasDimensions('Trailer 640 × 580'),true);assert.equal(c.hasDimensions('Trailer 640 by 580'),true);
    assert.ok(!c.neonAllowed.includes('rmTrailer'));assert.ok(!c.playable.some(m=>c.neonTitle(m)==='Trailer 640 x 580'));
    const titleProbe={...c.neonData.find(m=>c.neonAllowed.includes(m.name)),title:'Trailer 640 x 580'};
    assert.equal(c.mapAllowed(titleProbe),false,'título com dimensões bloqueado pela mesma regra do seletor');
    assert.ok(c.playable.every(m=>!c.hasDimensions(c.neonTitle(m))),'títulos ativos sem dimensões');
    assert.match(html,/NEON_PLAYABLE\.map\(m => \['neon:' \+ m\.name, neonMapTitle\(m\)\]/);
    assert.match(html,/const NEON_PLAYABLE = MAPS\.filter\(neonMapIsAllowed\)/);
    assert.doesNotMatch(html,/NEON_PLAYABLE\.map\(m => \['neon:' \+ m\.name, .*m\.w.*m\.h/);
    assert.doesNotMatch(html,/const NEON_SIZE_BLOCK|MAPAS_BASE\.filter\(m => !\(Math\.abs\(m\.iw/);
    const fixedIds=new Set(c.fixed.map(m=>m.id)),neonIds=new Set(c.neonAllowed);
    for(const [i,stage] of c.story.entries()){
      assert.notEqual(Boolean(stage.m),Boolean(stage.neon),`fase ${i+1} deve apontar para exatamente um mapa`);
      if(stage.m)assert.ok(fixedIds.has(stage.m),`fase ${i+1}: mapa fixo ${stage.m}`);
      if(stage.neon)assert.ok(neonIds.has(stage.neon),`fase ${i+1}: mapa Neon ${stage.neon}`);
    }
    assert.equal(c.story[0].m,'metro');assert.ok(c.story.every(s=>s.m||s.neon),'sem fases vazias');
    const chapters=c.story.slice(0,14).map(s=>s.t.match(/Capítulo (\d+)/)?.[1]).filter(Boolean).map(Number);
    assert.deepEqual(Array.from(chapters),[2,3,4,6,7,8,9,10,11,13,14,16,19]);
    assert.ok(c.story.slice(14).every(s=>s.neon),'expansões preservadas depois dos capítulos base');
    assert.match(html,/neonTitleHasDimensions\(neonMapTitle\(m\)\)/);
  });
  await test('Mapas fixos permitidos carregam spawn livre, colisões e saída dentro do mapa', () => {
    const {fixed}=mapConfiguration(),html=read('index.html'),extract=re=>html.match(re)?.[0];
    const blocks=[extract(/function worldEdgeHit\(x, y, r\) \{[\s\S]*?\n\}/),extract(/function sgBuild\(\) \{[\s\S]*?\n\}/),
      extract(/function hitWall\(x, y, r\) \{[\s\S]*?\n\}/),extract(/function unstick\(e\) \{[\s\S]*?\n\}/),extract(/function safeSpawnPos\(x, y, r = 13, areas = rooms\) \{[\s\S]*?\n\}/),
      extract(/function rng\(seed\) \{[\s\S]*?\n\}/),extract(/function seg\(x, y, w, h\) \{[\s\S]*?\n\}/),extract(/function addDoor\(x, y, w, h, vert, len = Math\.max\(w, h\)\) \{[\s\S]*?\n\}/),
      extract(/function refreshSol\(\) \{[\s\S]*?\n\}/),extract(/function buildFixed\(m, n\) \{[\s\S]*?\n\}/)];
    assert.ok(blocks.every(Boolean));
    const ctx={T:12,hyp:Math.hypot,SG:{ref:null,len:-1,cs:64,cells:new Map()},sol:[],walls:[],furn:[],decor:[],posts:[],rooms:[],keep:[],doors:[],breakables:[],brokenGlass:[],exitR:[],startPos:[],fixedMap:false,mapName:'',
      furnish(){},paintMap(){}};vm.createContext(ctx);vm.runInContext(blocks.join('\n'),ctx);
    for(const map of fixed){ctx.walls=[];ctx.furn=[];ctx.decor=[];ctx.posts=[];ctx.rooms=[];ctx.keep=[];ctx.doors=[];ctx.breakables=[];ctx.brokenGlass=[];ctx.sol=[];ctx.SG.ref=null;ctx.SG.len=-1;
      ctx.buildFixed(map,1);assert.ok(ctx.rooms.length>0,`${map.id}: salas`);assert.ok(ctx.walls.length>0,`${map.id}: colisões`);
      assert.equal(ctx.hitWall(ctx.startPos[0],ctx.startPos[1],13),false,`${map.id}: spawn`);
      const [x,y,w,h]=ctx.exitR;assert.ok(w>0&&h>0&&x>=0&&y>=0&&x+w<=ctx.WW&&y+h<=ctx.WH,`${map.id}: limites da saída`);
      assert.equal(ctx.hitWall(x+w/2,y+h/2,13),false,`${map.id}: saída livre`);
    }
  });
  await test('Grades permitidas carregam spawn, inimigos, colisões e saída válidos', () => {
    const c=mapConfiguration(),html=c.html,extract=re=>html.match(re)?.[0];
    const blocks=[extract(/function worldEdgeHit\(x, y, r\) \{[\s\S]*?\n\}/),extract(/function sgBuild\(\) \{[\s\S]*?\n\}/),
      extract(/function hitWall\(x, y, r\) \{[\s\S]*?\n\}/),extract(/function buildGrid\(G\) \{[\s\S]*?\n\}/),
      extract(/function spawnGrid\(G\) \{[\s\S]*?\n\}/),extract(/function refreshSol\(\) \{[\s\S]*?\n\}/)];
    assert.ok(blocks.every(Boolean));
    const ctx={TILE:40,EXP:{glass:{list:[],map:new Map()}},SG:{ref:null,len:-1,cs:64,cells:new Map()},sol:[],walls:[],furn:[],decor:[],posts:[],keep:[],doors:[],breakables:[],brokenGlass:[],rooms:[],startPos:[],exitR:[],enemies:[],WW:0,WH:0,fixedMap:false,mapName:'',lvl:1,paintMap(){}};
    vm.createContext(ctx);vm.runInContext(blocks.join('\n'),ctx);
    for(const grid of c.grids){ctx.walls=[];ctx.furn=[];ctx.doors=[];ctx.breakables=[];ctx.brokenGlass=[];ctx.sol=[];ctx.rooms=[];ctx.enemies=[];ctx.SG.ref=null;ctx.SG.len=-1;ctx.EXP.glass.list=[];ctx.EXP.glass.map.clear();
      ctx.buildGrid(grid);ctx.spawnGrid(grid);assert.equal(ctx.hitWall(ctx.startPos[0],ctx.startPos[1],13),false,`${grid.id}: spawn`);
      for(const e of ctx.enemies)assert.equal(ctx.hitWall(e.x,e.y,e.r),false,`${grid.id}: inimigo ${e.x},${e.y}`);
      const [x,y,w,h]=ctx.exitR;assert.ok(w>0&&h>0&&x>=0&&y>=0&&x+w<=ctx.WW&&y+h<=ctx.WH,`${grid.id}: área de saída`);
      assert.equal(ctx.hitWall(x+w/2,y+h/2,13),false,`${grid.id}: saída livre`);
    }
  });
  await test('Save de versão futura expõe modo protegido na interface', () => {
    const core=read('js/exp-core.js');assert.match(core,/saveReadOnly: \(\) => unsupportedSave/);assert.match(core,/saveReadonlyNotice/);assert.match(core,/modo protegido/);
  });
  await test('Manifesto offline contém apenas arquivos existentes e todos os scripts/CSS', async () => {
    const w=worker();let pending;w.handlers.install({waitUntil:p=>pending=p});await pending;
assert.equal(vm.runInContext('CACHE',w.ctx),'cappe-v176.0-screen-compositing');
    const list=vm.runInContext('ASSETS',w.ctx);
    for(const m of read('index.html').matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)(?:\?[^\"]*)?"/g)) assert.ok(list.includes(m[1]),m[1]);
    assert.ok(list.includes('wasm-renderer/pkg/renderer.wasm'));
  });
  await test('Ativação não apaga cache de outros apps nem outras instalações', async () => {
    const w=worker();let pending;w.handlers.activate({waitUntil:p=>pending=p});await pending;
    assert.deepEqual(w.deleted,['cappe-v33.0:/game/','cappe-v34.0:/game/']);
  });
  await test('Offline abre index em navegação da raiz, inclusive com query dev', async () => {
    const w=worker();w.entries.set('https://example.test/game/index.html','PAGE');let result;
    w.handlers.fetch({request:{url:'https://example.test/game/?dev=1',method:'GET',mode:'navigate'},respondWith:p=>result=p,waitUntil(){}});
    assert.equal(await result,'PAGE');
  });
  await test('Worker ignora POST, origem externa e caminhos fora do escopo', () => {
    const w=worker();
    for(const req of [{url:'https://example.test/game/',method:'POST'},{url:'https://other.test/game/',method:'GET'},{url:'https://example.test/other/',method:'GET'},{url:'https://example.test/game/api/rooms/ABC123/state',method:'GET'}])
      w.handlers.fetch({request:req,respondWith(p){p.catch(()=>{});throw Error('interceptação indevida');}});
  });
  await test('Navegação BFS contorna obstáculo sem atravessar suas células', () => {
    const {ctx,exp}=environment();ctx.sol=[[180,0,40,220]];exp.navBuild();
    const route=exp.navPath(50,50,350,50);assert.ok(route?.length);assert.ok(route.some(p=>p.y>=230));
    for(const p of route)assert.ok(!(p.x>166&&p.x<234&&p.y<234));
  });
  await test('Navegação retorna null quando os lados estão desconectados', () => {
    const {ctx,exp}=environment();ctx.sol=[[180,0,40,300]];exp.navBuild();assert.equal(exp.navPath(50,50,350,50),null);
  });
  await test('Barreira do mundo impede sair do mapa e bloqueia coordenadas inválidas', () => {
    const {ctx}=environment();ctx.SG={ref:null,len:-1,cs:64,cells:new Map()};ctx.sgBuild=()=>{ctx.SG.ref=ctx.sol;ctx.SG.len=ctx.sol.length;};
    const html=read('index.html');
    const edge=html.match(/function worldEdgeHit\(x, y, r\) \{[\s\S]*?\n\}/)?.[0];
    const fit=html.match(/function fitWorldPosition\(x, y, r\) \{[\s\S]*?\n\}/)?.[0];
    const wall=html.match(/function hitWall\(x, y, r\) \{[\s\S]*?\n\}/)?.[0];
    const wallNoGlass=html.match(/function hitWallNG\(x, y, r\) \{[\s\S]*?\n\}/)?.[0];
    const aabb=html.match(/function aabbHitsWall\(x, y, r\) \{[\s\S]*?\n\}/)?.[0];
    const move=html.match(/function move\(e, dx, dy\) \{[\s\S]*?\n\}/)?.[0];
    assert.ok(edge&&fit&&wall&&wallNoGlass&&aabb&&move,'funções de limite/colisão/movimento encontradas');
    vm.runInContext(edge+'\n'+fit+'\n'+wall+'\n'+wallNoGlass+'\n'+aabb+'\n'+move,ctx);
    assert.equal(ctx.hitWall(200,150,10),false);
    for(const [x,y] of [[9,150],[391,150],[200,9],[200,291]])assert.equal(ctx.hitWall(x,y,10),true,`${x},${y}`);
    assert.equal(ctx.hitWallNG(9,150,10),true);assert.equal(ctx.aabbHitsWall(9,150,10),true);
    assert.equal(ctx.hitWall(NaN,150,10),true);
    assert.deepEqual(Array.from(ctx.fitWorldPosition(8,200,13)),[13,200]);
    const actor={x:5,y:150,r:10};ctx.move(actor,-20,0);assert.equal(actor.x,5);
  });
  await test('Spawns de todas as salas Neon jogáveis ficam dentro da borda segura', () => {
    const {ctx}=environment();const html=read('index.html');const edge=html.match(/function worldEdgeHit\(x, y, r\) \{[\s\S]*?\n\}/)?.[0];const fit=html.match(/function fitWorldPosition\(x, y, r\) \{[\s\S]*?\n\}/)?.[0];
    assert.ok(edge&&fit);vm.runInContext(edge+'\n'+fit,ctx);
    const maps=mapConfiguration().playable;assert.equal(maps.length,61);
    for(const map of maps){
      ctx.WW=map.w;ctx.WH=map.h;
      const spawn=map.objects.find(o=>/objPlayerBiker|objPlayerMouseHouse|objJackets|objPlayerMouse|spawn|start/i.test(o[0])&&!/CarEnter/i.test(o[0]));
      const car=map.objects.find(o=>/CarEnter/i.test(o[0]));const point=spawn||car;
      const position=ctx.fitWorldPosition(point?.[1]??96,point?.[2]??96,13);
      assert.equal(ctx.worldEdgeHit(position[0],position[1],13),false,map.name);
    }
  });
  await test('buildNeonFloor mantém spawn, colisões e saída válidos nos 61 mapas Neon permitidos', () => {
    const html=read('index.html'),extract=re=>html.match(re)?.[0],noop=()=>{},config=mapConfiguration();
    const blocks=[extract(/function worldEdgeHit\(x, y, r\) \{[\s\S]*?\n\}/),extract(/function fitWorldPosition\(x, y, r\) \{[\s\S]*?\n\}/),
      extract(/function sgBuild\(\) \{[\s\S]*?\n\}/),extract(/function hitWall\(x, y, r\) \{[\s\S]*?\n\}/),extract(/function unstick\(e\) \{[\s\S]*?\n\}/),
      extract(/function refreshSol\(\) \{[\s\S]*?\n\}/),extract(/function neonSafePoint\(x, y, r, avoid = \[\], gap = 28\) \{[\s\S]*?\n\}/),extract(/function buildNeonFloor\(m\) \{[\s\S]*?\n\}/)];
    assert.ok(blocks.every(Boolean));const g={setTransform:noop,fillRect:noop,drawImage:noop,clearRect:noop,save:noop,restore:noop,translate:noop,rotate:noop};
    const canvas=()=>({width:0,height:0,getContext:()=>g});
    const ctx={WW:0,WH:0,SG:{ref:null,len:-1,cs:64,cells:new Map()},sol:[],walls:[],furn:[],decor:[],posts:[],keep:[],rooms:[],doors:[],transp:[],enemies:[],pickups:[],corpses:[],blood:[],liveBlood:[],throws:[],predio:[{}],andar:0,curNeon:null,neonCar:false,fixedMap:false,mapName:'',startPos:[96,96],exitR:[0,0,0,0],
      NEON_SKIP_RE:/player|enemy|guard|thug|gangster|patrol|mobster|assassin|weapon|spawn|lanestart|door|carenter/i,NEON_ENEMY_RE:/enemy|guard|thug|mobster|assassin|patrol|gangster/i,
      NEON_WEAPONS:['taco','faca','cano','martelo','pe_de_cabra','pistola','revolver','escopeta','smg','rifle','uzi'],NEON_AMMO:{},neonMapTitle:config.neonTitle,fl:canvas(),tp:canvas(),neonImg:()=>null,neonLoaded:()=>false,neonDrawProp:noop,saveFloor:noop,hyp:Math.hypot};
    vm.createContext(ctx);vm.runInContext(read('js/maps.js'),ctx);vm.runInContext(read('js/collision_sizes.js'),ctx);vm.runInContext(blocks.join('\n'),ctx);
    const maps=config.playable;assert.equal(maps.length,61);
    let enemies=0,pickups=0;const invalidExits=[];
    const originalMapData=JSON.stringify(maps.map(m=>({name:m.name,w:m.w,h:m.h,tiles:m.tiles,objects:m.objects})));
    for(const map of maps){ctx.buildNeonFloor(map);assert.equal(ctx.hitWall(ctx.startPos[0],ctx.startPos[1],13),false,`${map.name}: spawn`);
      const [x,y,w,h]=ctx.exitR;let exitAccessible=false;
      for(let ey=Math.max(13,y);ey<=Math.min(ctx.WH-13,y+h)&&!exitAccessible;ey+=8)for(let ex=Math.max(13,x);ex<=Math.min(ctx.WW-13,x+w);ex+=8)if(!ctx.hitWall(ex,ey,13)){exitAccessible=true;break;}
      if(!(w>0&&h>0&&exitAccessible))invalidExits.push(map.name);
      for(const e of ctx.enemies){assert.equal(ctx.hitWall(e.x,e.y,e.r),false,`${map.name}: inimigo ${e.x},${e.y}`);enemies++;}
      for(const p of ctx.pickups){assert.equal(ctx.hitWall(p.x,p.y,8),false,`${map.name}: arma ${p.x},${p.y}`);pickups++;}}
    assert.ok(enemies>0);assert.ok(pickups>0);assert.deepEqual(invalidExits,[],'saídas inválidas: '+invalidExits.join(', '));
    assert.equal(JSON.stringify(maps.map(m=>({name:m.name,w:m.w,h:m.h,tiles:m.tiles,objects:m.objects}))),originalMapData,'geometria, tiles e objetos fonte sem alterações');
  });
  return results;
}
module.exports = { run, environment, worker };
if(require.main===module)run().then(results=>{for(const r of results)console.log(r.status+' '+r.name+(r.error?' — '+r.error:''));console.log(results.filter(r=>r.status==='PASS').length+'/'+results.length+' passaram');process.exitCode=results.some(r=>r.status==='FAIL')?1:0;});
