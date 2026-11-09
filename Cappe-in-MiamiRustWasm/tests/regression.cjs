Warning: truncated output (original token count: 39241)
Total output lines: 1460

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
  await test('Filtros de alcance da IA preservam os raios nas versões Web e Rust/WASM', () => {
    for(const dir of [root, path.resolve(root, '..', 'Cappe-in-MiamiWeb')]) {
      const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),world=fs.readFileSync(path.join(dir,'js/exp-world.js'),'utf8');
      const htmlHelper=declaration(html,'function withinRadius('),worldHelper=declaration(world,'function withinRadius(');
      assert.ok(html.includes('withinRadius(o.x - e.x, o.y - e.y, 280)'));
      assert.ok(world.includes('withinRadius(o.x - e.x, o.y - e.y, callRadius)'));
      assert.ok(world.includes('withinRadius(o.x - e.x, o.y - e.y, 560)'));
      for(const helper of [htmlHelper,worldHelper]) {
        const ctx=vm.createContext({});vm.runInContext(helper,ctx);
        for(const radius of [0.5,18,90,210,230,280,520,560]) {
          for(let i=0;i<1200;i++) {
            const dx=Math.sin(i*12.9898+radius)*900,dy=Math.cos(i*78.233-radius)*900;
            assert.equal(ctx.withinRadius(dx,dy,radius),Math.hypot(dx,dy)<radius,'raio '+radius+', ponto '+dx+','+dy);
          }
          assert.equal(ctx.withinRadius(radius,0,radius),false,'tangência '+radius);
          assert.equal(ctx.withinRadius(radius-0.001,0,radius),true,'ponto interno '+radius);
        }
      }
    }
  });
  await test('IA reutiliza o objeto do destino de investigação sem alterar sua posição', () => {
    for(const dir of [root, path.resolve(root, '..', 'Cappe-in-MiamiWeb')]) {
      const source=fs.readFileSync(path.join(dir,'js/exp-core.js'),'utf8');
      assert.ok(source.includes('const goal = e.goal || (e.goal = { x: 0, y: 0 }); goal.x = e.lkp.x; goal.y = e.lkp.y;'));
    }
    const {ctx,exp}=environment(),enemy={x:40,y:40,state:'INVESTIGATE',lkp:{x:180,y:100},path:null,ko:0,stun:0};
    ctx.enemies=[enemy];ctx.doors=[];ctx.sol=[];exp.navBuild();exp.aiExtTick(.016);
    const goal=enemy.goal;assert.ok(goal);enemy.lkp={x:220,y:160};exp.aiExtTick(.016);
    assert.equal(enemy.goal,goal,'o mesmo objeto é mantido');assert.equal(goal.x,220);assert.equal(goal.y,160);
  });
  await test('Atualização e remoção de faíscas usam um único laço nas versões Web e Rust/WASM', () => {
    const dirs=[root,path.resolve(root,'..','Cappe-in-MiamiWeb')].filter(dir=>fs.existsSync(path.join(dir,'index.html')));
    assert.equal(dirs.length,2,'fonte Web disponível para comparação cruzada');
    for(const dir of dirs) {
      const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),fn=declaration(html,'function updateSparks(dt) {');
      assert.equal((fn.match(/\bfor\s*\(/g)||[]).length,1,'um só percurso por quadro');
      assert.match(fn,/if \(p\.life > 0\) sparks\[w\+\+\] = p;[\s\S]*?sparks\.length = w;/);
      const ctx=vm.createContext({sparks:[
        {x:1,y:2,vx:3,vy:-2,life:.5,max:1},
        {x:4,y:5,vx:1,vy:1,life:.05,max:1},
        {x:-2,y:9,vx:-4,vy:2,life:.12,max:1}
      ],Math});
      vm.runInContext(fn,ctx);const first=ctx.sparks[0],last=ctx.sparks[2];ctx.updateSparks(.1);
      assert.equal(ctx.sparks.length,2);assert.equal(ctx.sparks[0],first);assert.equal(ctx.sparks[1],last,'ordem e identidade das sobreviventes preservadas');
      assert.equal(first.life,.4);assert.equal(first.x,1.3);assert.equal(first.y,1.8);
      assert.equal(last.life,.01999999999999999);assert.equal(last.x,-2.4);assert.equal(last.y,9.2);
    }
  });
  await test('Agrupamento de faíscas reutiliza índices e preserva a sequência Canvas nas duas versões', () => {
    const dirs=[root,path.resolve(root,'..','Cappe-in-MiamiWeb')];
    const particles=Array.from({length:530},(_,i)=>({x:i+.25,y:-i-.5,life:.12+(i%6)*.13,max:1,c:['#fff','#ff2e93','#19f0e6','#ffd23f'][i%4]}));
    const expected=[],groups=new Map();
    for(let i=0;i<particles.length;i++) {
      const p=particles[i];let g=groups.get(p.c);if(!g){g={color:p.c,buckets:[[],[],[],[],[],[]]};groups.set(p.c,g);}
      const level=Math.ceil(Math.max(0,p.life/p.max)*6),bucket=level>6?5:level-1;if(bucket>=0&&bucket<6)g.buckets[bucket].push(i);
    }
    expected.push(['save'],['composite','lighter']);
    for(const g of groups.values()) { expected.push(['style',g.color]);for(let q=0;q<6;q++){const bucket=g.buckets[q];if(!bucket.length)continue;expected.push(['begin']);for(const i of bucket)expected.push(['rect',particles[i].x-2,particles[i].y-2,4,4]);expected.push(['alpha',(q+1)/6],['fill']);} }
    expected.push(['restore']);
    for(const dir of dirs) {
      const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),events=[];
      const canvas={save(){events.push(['save']);},restore(){events.push(['restore']);},beginPath(){events.push(['begin']);},rect(...args){events.push(['rect',...args]);},fill(){events.push(['fill']);}};
      Object.defineProperties(canvas,{globalCompositeOperation:{set:v=>events.push(['composite',v])},fillStyle:{set:v=>events.push(['style',v])},globalAlpha:{set:v=>events.push(['alpha',v])}});
      const ctx=vm.createContext({sparks:particles,SPK_GROUPS:new Map(),SPK_ACTIVE:[],SPK_NEXT:new Int32Array(512),SPK_C:[],ctx:canvas,window:{HM_WASM_RENDERER:null}});
      vm.runInContext(declaration(html,'function ensureSparkNext('),ctx);vm.runInContext(declaration(html,'function drawSparks()'),ctx);ctx.drawSparks();
      assert.equal(JSON.stringify(events),JSON.stringify(expected),path.basename(dir)+' mantém ordem/cor/opacidade das faíscas');
      assert.ok(ctx.SPK_NEXT.length>=particles.length,'buffer de índices cresce quando necessário');
      assert.doesNotMatch(declaration(html,'function drawSparks()'),/buckets\[bucket\]\.push\(p\)/);
    }
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
    const health=await apiRequest(server,'GET','/api/health');assert.equal(health.status,200);assert.equal(JSON.parse(health.body).version,'v311.0-spark-pool');assert.equal(health.headers['cache-control'],'no-store');
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
    assert.doesNotMatch(arrowPath,/wasm\.exports\…19241 tokens truncated…on)assert.ok(neonIds.has(stage.neon),`fase ${i+1}: mapa Neon ${stage.neon}`);
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
  await test('Arte das 16 máscaras novas rasteriza em Rust com fallback e atualização tardia', () => {
    const exp=read('js/exp-content.js'),renderer=read('js/wasm-renderer.js'),rust=read('wasm-renderer-direct/src/lib.rs');
    assert.equal((exp.match(/art:\s*\{/g)||[]).length,16);
    assert.match(exp,/window\.HM_WASM_RENDERER\.drawMaskArt\(g, sp\)/);
    assert.match(exp,/hm-wasm-renderer-ready/);assert.match(exp,/renderExpansionMaskArtWithRust/);
    assert.match(renderer,/state\.direct\.drawMaskArt\(context, palette, params\)/);
    assert.match(rust,/js_name = drawMaskArt/);
  });
  await test('Ícones das armas da expansão têm painter Rust e teste de paridade Chrome', () => {
    const source=read('wasm-renderer-direct/src/lib.rs'),renderer=read('js/wasm-renderer.js'),test=read('tests/wasm-exp-weapon-icon-parity.cjs');
    assert.match(source,/js_name = drawWeaponIcon/);assert.match(renderer,/state\.direct\.drawWeaponIcon\(context, weaponId, FURNITURE_COLORS\)/);
    assert.match(test,/differentChannels !== 0/);assert.match(test,/stateRestored/);assert.equal((test.match(/'pistola_aut'|'magnum'|'pump'|'dupla'|'carabina'|'sniper'|'lmg'|'katana'|'machado'|'garrafa'|'extintor'|'lanca'/g)||[]).length,12);
  });
  await test('Setup do Canvas e fundo do quadro tentam o painter Rust antes do fallback legado', () => {
    const direct=read('wasm-renderer-direct/src/lib.rs'),renderer=read('js/wasm-renderer.js'),browser=read('tests/wasm-direct-draw-parity.cjs');
    assert.match(direct,/js_name = setupCanvas[\s\S]*?context\.set_transform\(scale, 0\.0, 0\.0, scale, 0\.0, 0\.0\)[\s\S]*?set_image_smoothing_enabled\(smoothing\)/);
    const setup=renderer.match(/state\.setupCanvas = \(context, scale, smoothing, quality, force = false\) => \{[\s\S]*?\n      \};/)?.[0];
    assert.ok(setup);assert.match(setup,/state\.direct\.setupCanvas\(context, scale, !!smoothing, qualityId\)/);assert.match(setup,/return false;[\r\n]+      \};$/);assert.doesNotMatch(setup,/wasm\.exports\.draw_canvas_setup/);
    const background=renderer.match(/state\.drawFrameBackground = \(context, width, height\) => \{[\s\S]*?\n      \};/)?.[0];
    assert.ok(background);assert.match(background,/state\.direct\.drawFrameBackground\(context, width, height\)/);assert.match(background,/return false;[\r\n]+      \};$/);assert.doesNotMatch(background,/wasm\.exports\.draw_frame_background/);
    assert.match(browser,/setupCanvasParity[\s\S]*?setup\.directCalls !== 1[\s\S]*?setup\.parity/);
  });
  await test('Painter Rust da pausa não depende do wrapper legado', () => {
    const renderer=read('js/wasm-renderer.js'),direct=read('wasm-renderer-direct/src/lib.rs'),browser=read('tests/wasm-direct-draw-parity.cjs');
    assert.doesNotMatch(renderer,/state\.drawPauseUi =/);assert.match(renderer,/state\.drawPauseUiDirect = [\s\S]*?state\.direct\.drawPauseUi\(context, width, height, hoverIndex, \.\.\.labels\)/);assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/draw_pause_ui|pause_ui_input_ptr|PAUSE_UI_INPUT/);assert.match(read('js/exp-ui.js'),/drawPauseUiDirect\(g, W, H, hoverIndex, pauseLabels\)[\s\S]*?O painter Canvas original continua disponível[\s\S]*?g\.strokeRect\(bx\.x, bx\.y, bx\.w, bx\.h\)/);
    assert.match(direct,/js_name = drawPauseUi/);assert.match(direct,/resume_label: &str[\s\S]*?lobby_label: &str/);assert.match(browser,/pauseUiParity[\s\S]*?differentChannels !== 0/);
  });
  await test('Seleção de frames de jogadores e inimigos passa a ser calculada no Rust direto', () => {
    const renderer=read('js/wasm-renderer.js'),direct=read('wasm-renderer-direct/src/lib.rs'),browser=read('tests/wasm-direct-draw-parity.cjs');
    assert.match(direct,/js_name = selectPlayerSprite[\s\S]*?pub fn select_player_sprite[\s\S]*?js_name = selectEnemySprite[\s\S]*?pub fn select_enemy_sprite/);
    const player=renderer.match(/state\.selectPlayerSprite = \(drawState, animation, attackRemaining\) => \{[\s\S]*?\n      \};/)?.[0];
    const enemy=renderer.match(/state\.selectEnemySprite = \(moving, nowMs\) => \{[\s\S]*?\n      \};/)?.[0];
    assert.ok(player);assert.ok(enemy);assert.match(player,/state\.direct\.selectPlayerSprite[\s\S]*?return null;/);
    assert.match(enemy,/state\.direct\.selectEnemySprite[\s\S]*?return null;/);
    assert.doesNotMatch(player,/wasm\.exports/);assert.doesNotMatch(enemy,/wasm\.exports/);
    const legacy=read('wasm-renderer/src/lib.rs');assert.doesNotMatch(legacy,/player_sheet_frame|enemy_sheet_frame|draw_player_frame|PLAYER_PIXELS|PLAYER_PALETTE/);
    assert.match(browser,/spriteSelectionParity[\s\S]*?playerResults\.some[\s\S]*?enemyResults\.some/);
  });
  await test('Desenho direto de mapa e partículas remove os batches redundantes do WASM antigo', () => {
    const renderer=read('js/wasm-renderer.js'),game=read('index.html');
    const bloodLayer=game.slice(game.indexOf('function drawBloodLayer()'),game.indexOf('function draw()'));
    assert.match(bloodLayer,/drawStaticBlood\(g, blood, col, blN\)/);assert.doesNotMatch(bloodLayer,/blood\.slice\(blN\)/);assert.match(bloodLayer,/for \(let i = blN; i < blood\.length; i\+\+\)/);
    const layer=renderer.match(/state\.drawLayer = \([\s\S]*?\n      \};/)?.[0];assert.ok(layer);assert.match(layer,/state\.drawCanvasLayer\(context, image, vx0, vy0, width, height, vx0, vy0, width, height, -1\)/);assert.doesNotMatch(layer,/wasm\.exports\.draw_layer/);
    const mapDecor=renderer.match(/state\.paintMapDecor = \([\s\S]*?\n      \};/)?.[0];assert.ok(mapDecor);assert.match(mapDecor,/state\.direct\.drawMapDecor\(context, mapDecorInputBuffer\.subarray\(0, decor\.length \* 6\), colors\)/);assert.doesNotMatch(mapDecor,/wasm\.exports\.(paint_map_decor|furniture_ptr)/);assert.match(mapDecor,/return false;[\r\n]+      \};/);
    const breakables=renderer.match(/state\.drawBreakables = \([\s\S]*?\n      \};/)?.[0];assert.ok(breakables);assert.match(breakables,/state\.direct\.drawMapBreakables\(context, mapBreakableInputBuffer\.subarray\(0, count \* 5\), intact\.length, shards\.length\)/);assert.doesNotMatch(breakables,/wasm\.exports\.(draw_breakables|breakable_data_ptr)/);assert.match(breakables,/return false;[\r\n]+      \};/);
    for (const [name,method] of [['drawDust','drawDust'],['drawSparks','drawSparkInputs'],['drawLiveBlood','drawLiveBlood'],['drawStaticBlood','drawStaticBlood'],['drawCorpses','drawCorpseInputs'],['drawDarkOutlines','drawDarkOutlineInputs'],['drawDarkOverlay','drawDarkOverlayInputs']]) {
      const item=renderer.match(new RegExp(`state\\.${name} = \\([\\s\\S]*?\\n      \\};`))?.[0];assert.ok(item,`${name} bridge exists`);assert.ok(item.includes(`state.direct.${method}`),`${name} uses direct Rust`);assert.doesNotMatch(item,/wasm\.exports\.(draw_dust|dust_input_ptr|draw_sparks|spark_input_ptr|draw_live_blood|draw_static_blood|blood_input_ptr|draw_corpses|corpse_input_ptr|draw_dark_outlines|dark_outline_input_ptr|draw_dark_overlay|dark_overlay_input_ptr)/);assert.match(item,/return false;[\r\n]+      \};$/);
    }
    assert.match(renderer,/state\.drawStaticBlood = \(context, particles, color, startIndex = 0\)/);assert.match(renderer,/particleCount = particles\.length - startIndex/);assert.match(renderer,/for \(let i = startIndex; i < particles\.length; i\+\+\)/);
    const legacy=read('wasm-renderer/src/lib.rs');assert.doesNotMatch(legacy,/pub extern "C" fn (draw_dust|draw_sparks|draw_live_blood|draw_static_blood|draw_corpses|dust_input_ptr|spark_input_ptr|blood_input_ptr|corpse_input_ptr|draw_layer|dark_outline_input_ptr|draw_dark_outlines|dark_overlay_input_ptr|draw_dark_overlay)/);assert.doesNotMatch(legacy,/fn draw_(dust|spark|live_blood|static_blood|corpse|layer|dark_outline|dark_overlay)_batch|fn draw_layer_command/);
  });
  await test('Piso usa somente Rust direto e mantém fallback original do jogo', () => {
    const renderer=read('js/wasm-renderer.js'),rust=read('wasm-renderer/src/lib.rs'),game=read('index.html');
    for (const [name,method] of [['paintFloorGrain','drawFloorGrainRgba'],['paintFloorTiles','drawFloorTilesCanvas'],['paintFloorFinish','paintFloorFinishCanvas']]) {
      const painter=renderer.match(new RegExp('state\\.'+name+' = \\([\\s\\S]*?\\n      \\};'))?.[0];
      assert.ok(painter,name+' bridge exists');assert.ok(painter.includes('state.direct.'+method),name+' calls direct Rust');
      assert.doesNotMatch(painter,/wasm\.exports\.paint_floor|draw_floor_(?:rgba_)?batch/);
    }
    assert.doesNotMatch(rust,/paint_floor_(?:grain|finish|tiles)|floor_tile_pixels_ptr|floor_rects|draw_floor_(?:rgba_)?batch/);
    assert.match(game,/if \(!grainRendered\) for \(let k = 0; k < Math\.round\(WW \* WH \/ 160\)/);
    assert.match(game,/if \(!floorTilesRendered\) \{/);assert.match(game,/if \(!finishRendered\) \{/);
  });
  await test('Barra do chefe pinta direto no Rust e mantém fallback validado no Chrome', () => {
    const source=read('wasm-renderer-direct/src/lib.rs'),renderer=read('js/wasm-renderer.js'),test=read('tests/wasm-boss-hud-parity.cjs');
    assert.match(source,/js_name = drawBossHealthBar/);assert.match(renderer,/state\.direct\.drawBossHealthBar\(context, width, height, fraction, boss\.boss\.col, phaseValues\)/);
    assert.match(test,/differentChannels !== 0/);assert.match(test,/transformRestored/);
  });
  await test('Manifesto offline contém apenas arquivos existentes e todos os scripts/CSS', async () => {
    const w=worker();let pending;w.handlers.install({waitUntil:p=>pending=p});await pending;
assert.equal(vm.runInContext('CACHE',w.ctx),'cappe-v311.0-spark-pool');
    const list=vm.runInContext('ASSETS',w.ctx);
    for(const m of read('index.html').matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)(?:\?[^\"]*)?"/g)) assert.ok(list.includes(m[1]),m[1]);
    assert.ok(!list.includes('wasm-renderer/pkg/renderer.wasm'));
  });
  await test('Imagens de máscara são lazy e entram no cache offline ao serem usadas', async () => {
    const maskPaths=['barbudo','capacete','cavalo','coelho','coruja','elefante','galo','leao','lobo','macaco','porco','sapo','tigre','unicornio'].map(id=>'assets/'+id+'.png');
    const w=worker(undefined,async()=>new Response('mask image'));let install;w.handlers.install({waitUntil:p=>install=p});await install;
    const list=vm.runInContext('ASSETS',w.ctx);assert.ok(maskPaths.every(asset=>!list.includes(asset)),'máscaras opcionais não entram no precache inicial');
    const html=read('index.html');assert.match(html,/function ensureMaskImage\(mask\)/);assert.match(html,/loading="lazy" decoding="async" fetchpriority="low"/);
    const url='https://example.test/game/assets/leao.png';let responsePromise,cachePromise;
    w.handlers.fetch({request:{url,method:'GET',mode:'cors'},respondWith:p=>responsePromise=p,waitUntil:p=>cachePromise=p});
    const response=await responsePromise;assert.equal(await response.text(),'mask image');await cachePromise;
    assert.equal(await w.entries.get(url).text(),'mask image','a primeira requisição guarda a máscara para uso offline');
  });
  await test('Texto cacheado encaminha drawImage ao Rust com fallback Canvas', () => {
    const html=read('index.html');
    assert.match(html,/function txPlacement\(s, x, y, c, font, al = 'left'\)[\s\S]*?return \{ image: e\.k, x: Math\.round\(x - ox\), y: Math\.round\(y - e\.by\) \}/);
    assert.match(html,/renderer\.drawCanvasImage\(ctx, placement\.image, placement\.x, placement\.y\)/);
    assert.match(html,/\)\) ctx\.drawImage\(placement\.image, placement\.x, placement\.y\)/);
  });
  await test('Base e overlay do mapa tentam desenho direto em Rust antes do gerador legado', () => {
    const bridge=read('js/wasm-renderer.js'),direct=read('wasm-renderer-direct/src/lib.rs');
    assert.match(bridge,/state\.direct\.paintMapBase\(context, !!fixedMap, width, height\)/);
    assert.match(bridge,/state\.direct\.paintMapOverlay\(context, width, height\)/);
    assert.match(direct,/pub fn paint_map_base_direct\([\s\S]*?context\.fill_rect\(0\.0, 0\.0, width, height\)/);
    assert.match(direct,/pub fn paint_map_overlay_direct\([\s\S]*?rgba\(255,240,230,\.08\)[\s\S]*?context\.fill_rect\(0\.0, 0\.0, width, height\)/);
    assert.doesNotMatch(bridge,/wasm\.exports\.paint_map_(base|overlay)/);
    assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/paint_map_(base|overlay)/);
    assert.match(read('index.html'),/paintMapBase\(g, true, WW, WH\)\)\) \{ g\.fillStyle = '#07010f'/);
    assert.match(read('index.html'),/paintMapOverlay\(g, WW, WH\)\)\) \{ g\.fillStyle = 'rgba\(255,240,230,\.08\)'/);
  });
  await test('Decoração de mapa gera e pinta direta em Rust mantendo fallback', () => {
    const bridge=read('js/wasm-renderer.js'),direct=read('wasm-renderer-direct/src/lib.rs'),legacy=read('wasm-renderer/src/lib.rs');
    assert.match(bridge,/state\.direct\.drawMapDecor\(context, mapDecorInputBuffer\.subarray\(0, decor\.length \* 6\), colors\)/);
    assert.doesNotMatch(bridge,/wasm\.exports\.paint_map_decor/);assert.doesNotMatch(legacy,/pub extern "C" fn paint_map_decor/);assert.match(read('index.html'),/if \(!\(wasmRenderer && wasmRenderer\.active && wasmRenderer\.paintMapDecor && wasmRenderer\.paintMapDecor\(g, decor\)\)\) \{\s*for \(const d of decor\)/);
    assert.match(direct,/pub fn draw_map_decor_direct\([\s\S]*?context\.fill_rect\(x, y, width, height\)[\s\S]*?context\.stroke_rect\(x \+ 1\.0, y \+ 1\.0, width - 2\.0, height - 2\.0\)[\s\S]*?context\.stroke_rect\(x \+ 8\.0, y \+ 8\.0, width - 16\.0, height - 16\.0\)/);
  });
  await test('Detalhes do mapa usam Rust direto e cedem ao fallback Canvas', () => {
    const bridge=read('js/wasm-renderer.js'),direct=read('wasm-renderer-direct/src/lib.rs'),legacy=read('wasm-renderer/src/lib.rs');
    assert.match(bridge,/state\.direct\.drawMapDetails\(context, directRooms, width, height, random\.getState\(\)\)/);
    assert.match(bridge,/random\.setState\(nextSeed\)/);
    assert.doesNotMatch(bridge,/wasm\.exports\.paint_map_details/);assert.doesNotMatch(legacy,/pub extern "C" fn paint_map_details/);
    assert.match(bridge,/state\.paintMapDetails = \(context, rooms, width, height, random\) => \{[\s\S]*?return false;[\s\S]*?\n      \};/);
    assert.match(read('index.html'),/if \(!wasmRenderer \|\| !wasmRenderer\.paintMapDetails \|\| !wasmRenderer\.paintMapDetails\(g, rooms, WW, WH, R\)\) \{[\s\S]*?g\.strokeRect\(rx \+ 9/);
    const detailSource=direct.match(/pub fn draw_map_details_direct\([\s\S]*?\n\}/)?.[0];
    assert.ok(detailSource);assert.match(detailSource,/map_detail_random\(/);assert.match(detailSource,/set_global_alpha\(0\.22\)/);assert.match(detailSource,/rgba\(255,255,255,\.035\)/);
  });
  await test('Sombras de paredes e móveis são desenhadas diretamente em Rust com fallback', () => {
    const bridge=read('js/wasm-renderer.js'),direct=read('wasm-renderer-direct/src/lib.rs');
    assert.match(bridge,/state\.direct\.drawMapShadows\(context, mapShadowInputBuffer\.subarray\(0, count \* 5\)\)/);
    assert.doesNotMatch(bridge,/wasm\.exports\.paint_map_shadows/);assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/pub extern "C" fn paint_map_shadows/);
    assert.match(bridge,/state\.paintMapShadows = \(context, walls, furniture\) => \{[\s\S]*?return false;[\s\S]*?\n      \};/);
    assert.match(read('index.html'),/if \(!wasmRenderer \|\| !wasmRenderer\.paintMapShadows \|\| !wasmRenderer\.paintMapShadows\(t, walls, furn\)\) \{[\s\S]*?t\.fillStyle = 'rgba\(0, 0, 0, 0\.4\)'/);
    assert.match(direct,/pub fn draw_map_shadows_direct\([\s\S]*?let dx = if furniture \{ 4\.0 \} else \{ 6\.0 \};[\s\S]*?let dy = if furniture \{ 6\.0 \} else \{ 8\.0 \};[\s\S]*?rgba\(0, 0, 0, 0\.4\)/);
  });
  await test('Faces estruturais de paredes e detalhes de postes são gerados em Rust com fallback', () => {
    const bridge=read('js/wasm-renderer.js'),direct=read('wasm-renderer-direct/src/lib.rs');
    assert.match(bridge,/state\.direct\.drawMapStructure\(context, mapStructureInputBuffer\.subarray\(0, count \* 5\)\)/);
    assert.doesNotMatch(bridge,/wasm\.exports\.paint_map_structure/);assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/pub extern "C" fn paint_map_structure/);
    assert.match(bridge,/state\.paintMapStructure = \(context, walls, posts\) => \{[\s\S]*?return false;[\s\S]*?\n      \};/);
    assert.match(read('index.html'),/if \(!wasmRenderer \|\| !wasmRenderer\.paintMapStructure \|\| !wasmRenderer\.paintMapStructure\(t, walls, posts\)\) \{[\s\S]*?t\.fillStyle = '#c8c8d8'/);
    const structureSource=direct.match(/pub fn draw_map_structure_direct\([\s\S]*?\n\}/)?.[0];
    assert.ok(structureSource);assert.match(structureSource,/structure_fill\(context, "#c8c8d8"/);assert.match(structureSource,/structure_stroke\(context, "#5d5d73"/);assert.match(structureSource,/structure_fill\(context, "rgba\(25,240,230,\.18\)"/);assert.match(structureSource,/structure_stroke\(context, "#383849"/);
  });
  await test('Vidros intactos e fragmentos são gerados e desenhados em Rust com fallback', () => {
    const bridge=read('js/wasm-renderer.js'),direct=read('wasm-renderer-direct/src/lib.rs');
    assert.match(bridge,/state\.direct\.drawMapBreakables\(context, mapBreakableInputBuffer\.subarray\(0, count \* 5\), intact\.length, shards\.length\)/);
    assert.doesNotMatch(bridge,/wasm\.exports\.draw_breakables/);assert.doesNotMatch(read('wasm-renderer/src/lib.rs'),/pub extern "C" fn draw_breakables/);
    assert.match(direct,/pub fn draw_map_breakables_direct\([\s\S]*?rgba\(110,225,255,\.22\)[\s\S]*?rgba\(210,255,255,\.85\)[\s\S]*?rgba\(210,250,255,\.75\)/);
  });
  await test('Acabamento do piso usa painter Canvas Rust/WebSys sem rota legada', () => {
    const bridge=read('js/wasm-renderer.js'),direct=read('wasm-renderer-direct/src/lib.rs'),legacy=read('wasm-renderer/src/lib.rs');
    assert.match(bridge,/state\.direct\.paintFloorFinishCanvas\(context/);
    assert.doesNotMatch(bridge,/wasm\.exports\.paint_floor_finish_rgba/);
    assert.match(direct,/pub fn paint_floor_finish_canvas_direct\([\s\S]*?context\.fill_rect\(solids\.get_index\(offset\) \+ 5\.0/);
    assert.doesNotMatch(legacy,/paint_floor_finish/);
  });
  await test('Contornos noturnos de atores tentam o painter direto Rust antes do fallback Canvas', () => {
    const source=read('js/wasm-renderer.js'),game=read('index.html');
    assert.match(source,/state\.direct\.drawDarkOutlineInputs\(context, input, camX, camY, screenW, screenH, zoom\)/);
    assert.match(read('wasm-renderer-direct/src/lib.rs'),/pub fn draw_dark_outline_inputs\([\s\S]*?14\.0 \* zoom[\s\S]*?draw_dark_outlines\(context, &commands\)/);
    assert.match(game,/outlineWasm\.drawDarkOutlines\(ctx, enemies, cam\.x, cam\.y, W, H, CFG\.zoom\)/);
    assert.match(game,/if \(!\(outlineWasm && outlineWasm\.drawDarkOutlines[\s\S]*?ctx\.arc\(sx, sy, 14 \* z, 0, 6\.28\)/);
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
  await test('Adjacências pré-calculadas preservam a rota e as regras diagonais do BFS', () => {
    const {ctx,exp}=environment();ctx.WW=1200;ctx.WH=800;ctx.sol=[];
    for(let i=0;i<70;i++){const col=i%10,row=(i/10)|0;ctx.sol.push([74+col*111,62+row*91,18+(i%4)*9,22+(i%3)*11]);}
    exp.navBuild();const nav=exp.NAV,di=[1,-1,0,0,1,1,-1,-1],dj=[0,0,1,-1,1,-1,1,-1];
    assert.equal(nav.neighbors.length,nav.ok.length*8);assert.equal(nav.neighborCounts.length,nav.ok.length);
    assert.ok(nav.neighbors.byteLength+nav.neighborCounts.byteLength<=nav.ok.length*17,'vizinhos usam no máximo 17 bytes por célula');
    const nearest=idx=>{if(nav.ok[idx])return idx;const cols=nav.cols,ci=idx%cols,cj=(idx/cols)|0;for(let d=1;d<=5;d++)for(let y=-d;y<=d;y++)for(let x=-d;x<=d;x++){if(Math.max(Math.abs(x),Math.abs(y))!==d)continue;const i=ci+x,j=cj+y;if(i<0||j<0||i>=cols||j>=nav.rows)continue;const n=j*cols+i;if(nav.ok[n])return n;}return -1;};
    const cell=(x,y)=>Math.max(0,Math.min(nav.rows-1,(y/nav.cs)|0))*nav.cols+Math.max(0,Math.min(nav.cols-1,(x/nav.cs)|0));
    const reference=(sx,sy,gx,gy)=>{
      const s=nearest(cell(sx,sy)),g=nearest(cell(gx,gy));if(s<0||g<0)return null;
      const seen=new Uint8Array(nav.ok.length),par=new Int32Array(nav.ok.length),q=new Int32Array(nav.ok.length);
      let h=0,t=0,found=s===g;q[t++]=s;seen[s]=1;par[s]=-1;
      while(h<t&&!found){const c=q[h++],ci=c%nav.cols,cj=(c/nav.cols)|0;
        for(let k=0;k<8;k++){const x=ci+di[k],y=cj+dj[k];if(x<0||y<0||x>=nav.cols||y>=nav.rows)continue;
          const n=y*nav.cols+x;if(seen[n]||!nav.ok[n])continue;
          if(di[k]&&dj[k]&&(!nav.ok[cj*nav.cols+x]||!nav.ok[y*nav.cols+ci]))continue;
          seen[n]=1;par[n]=c;q[t++]=n;if(n===g){found=true;break;}
        }
      }
      if(!found)return null;const path=[];
      for(let c=g;c!==-1;c=par[c])path.push([c%nav.cols*nav.cs+nav.cs/2,((c/nav.cols)|0)*nav.cs+nav.cs/2]);
      return path.reverse();
    };
    let seed=0x75a91;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    for(let i=0;i<700;i++){const sx=random()*1200,sy=random()*800,gx=random()*1200,gy=random()*800;const want=reference(sx,sy,gx,gy),got=exp.navPath(sx,sy,gx,gy)?.map(p=>[p.x,p.y])??null;if(JSON.stringify(got)!==JSON.stringify(want)){let at=0;while(at<(got?.length||0)&&at<(want?.length||0)&&got[at][0]===want[at][0]&&got[at][1]===want[at][1])at++;assert.deepEqual(got,want,`rota mudou no par ${i}: divergence=${at}, actual=${JSON.stringify(got?.slice(Math.max(0,at-2),at+4))}, reference=${JSON.stringify(want?.slice(Math.max(0,at-2),at+4))}`);}}
    assert.ok(nav.neighborCounts.some(count=>count===0),'células isoladas permanecem sem vizinhos');
  });
  await test('Índice espacial de colisões mantém o resultado da busca linear', () => {
    const {ctx,exp}=environment();ctx.sol=[[-18,30,50,24],[180,0,40,220],[320,180,130,22],[0,0,400,8]];exp.navBuild();
    const brute=(x,y,r)=>ctx.EXP.NAV.solids.some(w=>{const cx=Math.max(w[0],Math.min(x,w[0]+w[2])),cy=Math.max(w[1],Math.min(y,w[1]+w[3]));return (x-cx)*(x-cx)+(y-cy)*(y-cy)<r*r;});
    let seed=0x1a2b3c4d;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    for(let i=0;i<3000;i++){const x=random()*420-10,y=random()*320-10,r=i%2?13:14;assert.equal(exp.NAV.circleHits(x,y,r),brute(x,y,r),`resultado diferente em ${x},${y},${r}`);}
    const buckets=exp.NAV.solidBuckets;assert.ok(buckets.some(bucket=>bucket?.includes(exp.NAV.solids[0])),'as células guardam referências aos sólidos sem marcas auxiliares');
    exp.navBuild();assert.notEqual(exp.NAV.solidBuckets,buckets);for(let i=0;i<3000;i++){const x=random()*420-10,y=random()*320-10,r=i%2?13:14;assert.equal(exp.NAV.circleHits(x,y,r),brute(x,y,r),`resultado diferente depois de reconstruir em ${x},${y},${r}`);}
  });
  await test('Colisões circulares Web/Rust preservam tangências e vidro; pré-filtro rápido fica na Web', () => {
    for(const project of ['Cappe-in-MiamiWeb','Cappe-in-MiamiRustWasm']) {
      const html=fs.readFileSync(path.join(root,'..',project,'index.html'),'utf8');
      const extract=name=>html.match(new RegExp(`function ${name}\\(x, y, r\\) \\{[\\s\\S]*?\\n\\}`))?.[0];
      const edge=html.match(/function worldEdgeHit\(x, y, r\) \{[\s\S]*?\n\}/)?.[0],wall=extract('hitWall'),wallNG=extract('hitWallNG');
      assert.ok(edge&&wall&&wallNG,`${project}: funções de colisão`);
      assert.equal(/x \+ r <= wx0 \|\| x - r >= wx1 \|\| y \+ r <= wy0 \|\| y - r >= wy1/.test(wall),project==='Cappe-in-MiamiWeb',`${project}: pré-filtro alinhado ao resultado medido`);
      const solids=[[-18,30,50,24],[180,0,40,220],[320,180,130,22],[0,0,400,8],[72,114,26,28],[250,240,38,22]];
      solids[4].g=true;
      const ctx={WW:400,WH:300,sol:solids,SG:{cs:64,cells:{get:()=>solids}}};ctx.SG.ref=ctx.sol;ctx.SG.len=solids.length;ctx.sgBuild=()=>{};vm.createContext(ctx);
      vm.runInContext(edge+'\n'+wall+'\n'+wallNG,ctx);
      const brute=(x,y,r,ignoreGlass=false)=>x-r<0||y-r<0||x+r>ctx.WW||y+r>ctx.WH||solids.some(w=>{if(ignoreGlass&&w.g)return false;const cx=Math.max(w[0],Math.min(x,w[0]+w[2])),cy=Math.max(w[1],Math.min(y,w[1]+w[3]));return (x-cx)**2+(y-cy)**2<r*r;});
      const points=[[50,42,12],[62,42,12],[62.001,42,12],[90,128,13],[72,128,13],[72,128,12],[200,100,0],[0,0,0],[399,150,1],[200,8,0]];
      let seed=0x7a11;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
      for(let i=0;i<6000;i++)points.push([random()*440-20,random()*340-20,[0,1,8,13,14,random()*22][i%6]]);
      for(let i=0;i<points.length;i++){const [x,y,r]=points[i];assert.equal(ctx.hitWall(x,y,r),brute(x,y,r),`${project} hitWall #${i}: ${x},${y},${r}`);assert.equal(ctx.hitWallNG(x,y,r),brute(x,y,r,true),`${project} hitWallNG #${i}: ${x},${y},${r}`);}
    }
  });
  await test('Grade de colisões sem deduplicação mantém equivalência com 160 obstáculos', () => {
    const {ctx,exp}=environment();ctx.WW=1200;ctx.WH=800;ctx.sol=[];
    for(let i=0;i<160;i++){const col=i%20,row=(i/20)|0;ctx.sol.push([35+col*58,25+row*92,18+(i%4)*7,20+(i%3)*9]);}
    exp.navBuild();const brute=(x,y,r)=>exp.NAV.solids.some(w=>{const cx=Math.max(w[0],Math.min(x,w[0]+w[2])),cy=Math.max(w[1],Math.min(y,w[1]+w[3]));return (x-cx)*(x-cx)+(y-cy)*(y-cy)<r*r;});
    let seed=0x51a7e;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    for(let i=0;i<12000;i++){const x=random()*1250-25,y=random()*850-25,r=[2,13,14][i%3];assert.equal(exp.NAV.circleHits(x,y,r),brute(x,y,r),`divergência no obstáculo ${i%160} em ${x},${y},${r}`);}
  });
  await test('Replanejamento de IA reutiliza os pontos do caminho sem alterar a rota BFS', () => {
    const {ctx,exp}=environment();ctx.sol=[[180,0,40,220]];exp.navBuild();
    const route=exp.navPath(50,50,350,50), expected=route.map(p=>[p.x,p.y]), pool=route.slice();
    const reused=exp.navPath(50,70,350,70,route,pool);
    const reference=exp.navPath(50,70,350,70);
    assert.equal(reused,route);assert.deepEqual(reused.map(p=>[p.x,p.y]),reference.map(p=>[p.x,p.y]));
    assert.ok(reused.length>0);assert.notDeepEqual(reused.map(p=>[p.x,p.y]),expected);
    const longer=reused.length;const shorter=exp.navPath(50,70,90,70,reused,pool);assert.equal(shorter,reused);assert.ok(shorter.length<=longer);assert.ok(pool.length>=longer);
    const expanded=exp.navPath(50,70,350,70,shorter,pool);
    assert.equal(expanded,route);assert.ok(pool.length>=longer);assert.ok(expanded.every(p=>pool.includes(p)));assert.deepEqual(expanded.map(p=>[p.x,p.y]),reference.map(p=>[p.x,p.y]));
  });
  await test('activeTarget mantém o alvo mais próximo e desempata para P1 sem alocar ou ordenar lista', () => {
    const {ctx}=environment(),html=read('index.html'),fn=html.match(/function activeTarget\(x = P\?\.x \|\| 0, y = P\?\.y \|\| 0\) \{[\s\S]*?\n\}/)?.[0];
    assert.ok(fn);vm.runInContext(fn,ctx);ctx.EXP.MULTI={P2:null};
    let seed=0x16a09e66;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
    for(let i=0;i<10000;i++){
      const p1={x:random()*900-100,y:random()*700-100,dead:random()<.12},p2={x:random()*900-100,y:random()*700-100,dead:random()<.12};
      ctx.P=p1;ctx.EXP.MULTI.P2=random()<.7?p2:null;const x=random()*900-100,y=random()*700-100;
      const candidates=[p1,p2].filter((p,index)=>!p.dead&&(index===0||ctx.EXP.MULTI.P2===p));
      candidates.sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y));
      assert.equal(ctx.activeTarget(x,y),candidates[0]||null,`alvo ${i}: ${x},${y}`);
    }
    ctx.P={x:0,y:0,dead:true};ctx.EXP.MULTI.P2=null;assert.equal(ctx.activeTarget(0,0),null);ctx.P={x:100,y:0,dead:false};ctx.EXP.MULTI.P2={x:-100,y:0,dead:false};assert.equal(ctx.activeTarget(0,0),ctx.P);
    assert.doesNotMatch(fn,/targets\s*=\s*\[\]|\.sort\(/);
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
      extract(/function refreshSol\(\) \{[\s\S]*?\n\}/),extract(/function neonSprites\(\) \{[\s\S]*?\n\}/),extract(/function neonSafePoint\(x, y, r, avoid = \[\], gap = 28\) \{[\s\S]*?\n\}/),extract(/function buildNeonFloor\(m\) \{[\s\S]*?\n\}/)];
    assert.ok(blocks.every(Boolean));const g={setTransform:noop,fillRect:noop,drawImage:noop,clearRect:noop,save:noop,restore:noop,translate:noop,rotate:noop};
    const canvas=()=>({width:0,height:0,getContext:()=>g});
    const ctx={WW:0,WH:0,SG:{ref:null,len:-1,cs:64,cells:new Map()},sol:[],walls:[],furn:[],decor:[],posts:[],keep:[],rooms:[],doors:[],transp:[],enemies:[],pickups:[],corpses:[],blood:[],liveBlood:[],throws:[],predio:[{}],andar:0,curNeon:null,SPRITES:Object.fromEntries(Array.from(new Set(config.neonData.flatMap(m=>m.objects.map(o=>o[3]).filter(sp=>sp&&sp!=='<undefined>'))),sp=>[sp,{ox:0,oy:0,frames:[]}])) ,neonCar:false,fixedMap:false,mapName:'',startPos:[96,96],exitR:[0,0,0,0],
      NEON_SKIP_RE:/player|enemy|guard|thug|gangster|patrol|mobster|assassin|weapon|spawn|lanestart|door|carenter/i,NEON_ENEMY_RE:/enemy|guard|thug|mobster|assassin|patrol|gangster/i,
      NEON_WEAPONS:['taco','faca','cano','martelo','pe_de_cabra','pistola','revolver','escopeta','smg','rifle','uzi'],NEON_AMMO:{},neonMapTitle:config.neonTitle,window:{},fl:canvas(),tp:canvas(),neonImg:()=>null,neonLoaded:()=>false,neonDrawProp:noop,saveFloor:noop,hyp:Math.hypot};
    ctx.window.HM_NEON_SPRITES=ctx.SPRITES;vm.createContext(ctx);vm.runInContext(read('js/maps.js'),ctx);vm.runInContext(read('js/collision_sizes.js'),ctx);vm.runInContext(blocks.join('\n'),ctx);
    const maps=config.playable;assert.equal(maps.length,61);
    let enemies=0,pickups=0;const invalidExits=[];
    const originalMapData=JSON.stringify(maps.map(m=>({name:m.name,w:m.w,h:m.h,tiles:m.tiles,objects:m.objects})));
    for(const map of maps){try{ctx.buildNeonFloor(map)}catch(e){throw Error(map.name+': '+e.message)};assert.equal(ctx.hitWall(ctx.startPos[0],ctx.startPos[1],13),false,`${map.name}: spawn`);
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

