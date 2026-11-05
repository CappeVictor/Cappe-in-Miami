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
    const health=await apiRequest(server,'GET','/api/health');assert.equal(health.status,200);assert.equal(JSON.parse(health.body).version,'v54.0');assert.equal(health.headers['cache-control'],'no-store');
    const page=await apiRequest(server,'GET','/');assert.equal(page.status,200);assert.match(page.body,/Cappe-in-Miami/);assert.equal(page.headers['x-content-type-options'],'nosniff');
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
    const drawOne=declaration(html,'function drawOnePlayer('),drawPlayerCtx={Math,CFG:{shadows:false,glow:false},hyp:Math.hypot,ctx:drawStub,cw:'pistola',wicon:(g,w)=>weaponCalls.push(w),PSHEET:{complete:false,naturalWidth:0},buildPlayerFrame:()=>({}),window:{EXP:skinEnv},EXP:skinEnv};
    vm.createContext(drawPlayerCtx);vm.runInContext(drawOne,drawPlayerCtx);
    vm.runInContext("drawOnePlayer({x:10,y:10,a:0,dead:false,anim:0,atk:0},false);drawOnePlayer({x:20,y:10,a:0,dead:false,anim:0,atk:0},true)",drawPlayerCtx);
    assert.deepEqual(weaponCalls,['pistola','pistola'],'P1 e P2 desenham a arma equipada');
    assert.match(html,/function weaponFinish\(g, w\)/);
    assert.match(content,/draw\(\); if \(EXP\.newWeapons\.includes\(w\)\) weaponFinish\(g, w\)/);
    assert.match(html,/g\.shadowColor = 'rgba\(0,0,0,\.62\)'/);assert.match(content,/g\.shadowColor = 'rgba\(0,0,0,\.62\)'/);
    assert.match(core,/EXP\.SKINS = SKINS/);assert.match(core,/settings\.skin = id/);
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
    const shoot=html.match(/function shoot\\(from, ang, spd, mine, life\\) \\{[\\s\\S]*?\\n\\}/)?.[0];
    const target=html.match(/function friendlyBulletTarget\\(b\\) \\{[\\s\\S]*?\\n\\}/)?.[0];
    assert.ok(shoot&&target);
    assert.match(html,/if \\(!gone && window\\.EXP && EXP\\.MULTI && EXP\\.MULTI\\.enabled && EXP\\.MULTI\\.friendlyFire\\)/);
    assert.match(html,/const friendly = friendlyBulletTarget\\(b\\)/);
    const p1={x:10,y:10,r:13},p2={x:40,y:10,r:13,isP2:true},multi={enabled:true,friendlyFire:true,P2:p2};
    const ctx=vm.createContext({P:p1,S:{pierce:0},bullets:[],hyp:Math.hypot,window:{EXP:{MULTI:multi}}});
    vm.runInContext(shoot+'\\n'+target,ctx);
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
    assert.match(ui,/ctx\.imageSmoothingEnabled = !!CFG\.aa/);assert.match(ui,/CFG\.gfx === 'ultra' \? 'high' : 'medium'/);
    assert.doesNotMatch(ui,/ctx\.imageSmoothingEnabled = true/);
  });
  await test('Reduzir flashes suprime relâmpagos e cintilações de tela', () => {
    const fx=read('js/exp-fx.js');assert.match(fx,/FX\.bolt > 0 && !CFG\.noflash/);assert.match(fx,/FX\.flick > 0 && !CFG\.noflash/);
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
  await test('Seletor Neon exclui o protótipo 640x580 e variantes equivalentes', () => {
    const html=read('index.html');
    assert.match(html,/const NEON_SIZE_BLOCK = m => Math\.abs\(m\.w - 640\) <= 4 && Math\.abs\(m\.h - 580\) <= 8/);
    assert.match(html,/const MAPAS = MAPAS_BASE\.filter\(m => !\(Math\.abs\(m\.iw - 640\) <= 4 && Math\.abs\(m\.ih - 580\) <= 8\)\)/);
    const dataCtx=vm.createContext({});vm.runInContext(read('js/maps.js'),dataCtx);
    const n=vm.runInContext("MAPS.filter(m=>! (Math.abs(m.w-640)<=4 && Math.abs(m.h-580)<=8) && m.objects.some(o=>/enemy|guard|thug|mobster|assassin|patrol|gangster/i.test(o[0])))",dataCtx);
    assert.equal(n.length,72);
    assert.ok(!n.some(m=>m.name==='rmHouse1Downstairs'||m.name==='rmHouse1Upstairs'));
  });
  await test('Save de versão futura expõe modo protegido na interface', () => {
    const core=read('js/exp-core.js');assert.match(core,/saveReadOnly: \(\) => unsupportedSave/);assert.match(core,/saveReadonlyNotice/);assert.match(core,/modo protegido/);
  });
  await test('Manifesto offline contém apenas arquivos existentes e todos os scripts/CSS', async () => {
    const w=worker();let pending;w.handlers.install({waitUntil:p=>pending=p});await pending;
    assert.equal(vm.runInContext('CACHE',w.ctx),'cappe-v54.0');
    const list=vm.runInContext('ASSETS',w.ctx);
    for(const m of read('index.html').matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)(?:\?[^\"]*)?"/g)) assert.ok(list.includes(m[1]),m[1]);
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
    const dataCtx=vm.createContext({});vm.runInContext(read('js/maps.js'),dataCtx);
    const maps=vm.runInContext('MAPS.filter(m=>!(Math.abs(m.w-640)<=4&&Math.abs(m.h-580)<=8)&&m.objects.some(o=>/enemy|guard|thug|mobster|assassin|patrol|gangster/i.test(o[0])))',dataCtx);
    assert.equal(maps.length,72);
    for(const map of maps){
      ctx.WW=map.w;ctx.WH=map.h;
      const spawn=map.objects.find(o=>/objPlayerBiker|objPlayerMouseHouse|objJackets|objPlayerMouse|spawn|start/i.test(o[0])&&!/CarEnter/i.test(o[0]));
      const car=map.objects.find(o=>/CarEnter/i.test(o[0]));const point=spawn||car;
      const position=ctx.fitWorldPosition(point?.[1]??96,point?.[2]??96,13);
      assert.equal(ctx.worldEdgeHit(position[0],position[1],13),false,map.name);
    }
  });
  await test('buildNeonFloor mantém spawns, inimigos e armas fora de paredes nos 72 mapas Neon', () => {
    const html=read('index.html'),extract=re=>html.match(re)?.[0],noop=()=>{};
    const blocks=[extract(/function worldEdgeHit\(x, y, r\) \{[\s\S]*?\n\}/),extract(/function fitWorldPosition\(x, y, r\) \{[\s\S]*?\n\}/),
      extract(/function sgBuild\(\) \{[\s\S]*?\n\}/),extract(/function hitWall\(x, y, r\) \{[\s\S]*?\n\}/),extract(/function unstick\(e\) \{[\s\S]*?\n\}/),
      extract(/function refreshSol\(\) \{[\s\S]*?\n\}/),extract(/function neonSafePoint\(x, y, r, avoid = \[\], gap = 28\) \{[\s\S]*?\n\}/),extract(/function buildNeonFloor\(m\) \{[\s\S]*?\n\}/)];
    assert.ok(blocks.every(Boolean));const g={setTransform:noop,fillRect:noop,drawImage:noop,clearRect:noop,save:noop,restore:noop,translate:noop,rotate:noop};
    const canvas=()=>({width:0,height:0,getContext:()=>g});
    const ctx={WW:0,WH:0,SG:{ref:null,len:-1,cs:64,cells:new Map()},sol:[],walls:[],furn:[],decor:[],posts:[],keep:[],rooms:[],doors:[],transp:[],enemies:[],pickups:[],corpses:[],blood:[],liveBlood:[],throws:[],predio:[{}],andar:0,curNeon:null,neonCar:false,fixedMap:false,mapName:'',startPos:[96,96],exitR:[0,0,0,0],
      NEON_SKIP_RE:/player|enemy|guard|thug|gangster|patrol|mobster|assassin|weapon|spawn|lanestart|door|carenter/i,NEON_ENEMY_RE:/enemy|guard|thug|mobster|assassin|patrol|gangster/i,
      NEON_WEAPONS:['taco','faca','cano','martelo','pe_de_cabra','pistola','revolver','escopeta','smg','rifle','uzi'],NEON_AMMO:{},fl:canvas(),tp:canvas(),neonImg:()=>null,neonLoaded:()=>false,neonDrawProp:noop,saveFloor:noop,hyp:Math.hypot};
    vm.createContext(ctx);vm.runInContext(read('js/maps.js'),ctx);vm.runInContext(read('js/collision_sizes.js'),ctx);vm.runInContext(blocks.join('\n'),ctx);
    const maps=vm.runInContext('MAPS.filter(m=>!(Math.abs(m.w-640)<=4&&Math.abs(m.h-580)<=8)&&m.objects.some(o=>NEON_ENEMY_RE.test(o[0])))',ctx);assert.equal(maps.length,72);
    let enemies=0,pickups=0;
    for(const map of maps){ctx.buildNeonFloor(map);assert.equal(ctx.hitWall(ctx.startPos[0],ctx.startPos[1],13),false,`${map.name}: spawn`);
      for(const e of ctx.enemies){assert.equal(ctx.hitWall(e.x,e.y,e.r),false,`${map.name}: inimigo ${e.x},${e.y}`);enemies++;}
      for(const p of ctx.pickups){assert.equal(ctx.hitWall(p.x,p.y,8),false,`${map.name}: arma ${p.x},${p.y}`);pickups++;}}
    assert.ok(enemies>0);assert.ok(pickups>0);
  });
  return results;
}
module.exports = { run, environment, worker };
if(require.main===module)run().then(results=>{for(const r of results)console.log(r.status+' '+r.name+(r.error?' — '+r.error:''));console.log(results.filter(r=>r.status==='PASS').length+'/'+results.length+' passaram');process.exitCode=results.some(r=>r.status==='FAIL')?1:0;});
