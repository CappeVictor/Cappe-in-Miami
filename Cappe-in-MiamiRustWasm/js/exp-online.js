/* Lobby online: token privado permanece nesta aba e não é exposto aos outros jogadores. */
(function(){
 'use strict';
 const EXP=window.EXP||(window.EXP={}),KEY='cappe_online_session_v2';
 const state={code:'',playerId:'',publicId:'',remotePlayer:null,connected:false,revision:0,name:'',busy:false,retries:0,sending:false,listBusy:false,listTimer:0,latency:null,otherPresent:false};EXP.online=state;
 const el=id=>document.getElementById(id),clock=()=>typeof performance!=='undefined'?performance.now():Date.now();let pollAbort=null,pollTimer=0,lastSend=0,lastRemoteTick=0,lastNetworkPaint=0;
 function status(message){const node=el('onlineStatus');if(node&&node.textContent!==message)node.textContent=message;}
 function measureLatency(){const started=clock();api('/api/health').then(()=>{if(state.connected)state.latency=clock()-started;}).catch(()=>{});}
 function readSession(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null');}catch{return null;}}
 function clearSession(){try{sessionStorage.removeItem(KEY);}catch{}}
 function saveSession(){try{sessionStorage.setItem(KEY,JSON.stringify({code:state.code,playerId:state.playerId,publicId:state.publicId,name:state.name}));return true;}catch{return false;}}
 function authHeader(){return {authorization:'Bearer '+state.playerId};}
 async function api(url,options={}){
  const response=await fetch(url,{...options,headers:{'content-type':'application/json',...(options.headers||{})}});let data={};try{data=await response.json();}catch{}
  if(!response.ok){const error=Error(data.error||'Falha de conexão.');error.status=response.status;throw error;}return data;
 }
 function setBusy(value){state.busy=value;for(const id of ['onlineCreate','onlineJoin']){const button=el(id);if(button)button.disabled=value;}for(const button of document.querySelectorAll('.online-room-card button'))button.disabled=value||button.dataset.locked==='true';if(!value)refreshRooms();}
 function renderRooms(rooms){
  const list=el('onlineRoomList');if(!list)return;list.replaceChildren();
  if(!rooms.length){const empty=document.createElement('p');empty.className='online-empty';empty.textContent='Nenhuma sala encontrada neste servidor. Crie uma sala para começar.';list.append(empty);return;}
  for(const room of rooms){
   const card=document.createElement('article');card.className='online-room-card';
   const title=document.createElement('strong');title.textContent='Sala '+room.code;
   const people=document.createElement('span');people.textContent=room.count+'/'+room.maxPlayers+' jogadores'+(room.players.length?' · '+room.players.join(', '):'');
   const activity=document.createElement('small');activity.textContent=room.inGame?'Partida em andamento':room.canJoin?'Aguardando jogadores':'Sala completa';
   const button=document.createElement('button');button.type='button';
   const own=state.connected&&state.code===room.code;button.textContent=own?'Sua sala':room.canJoin?'Entrar':room.inGame?'Em partida':'Lotado';
   button.dataset.locked=String(own||!room.canJoin);button.disabled=state.busy||button.dataset.locked==='true';button.onclick=()=>join(room.code);
   card.append(title,people,activity,button);list.append(card);
  }
 }
 async function refreshRooms(){
  if(state.listBusy||el('onlineLobby')?.hidden)return;state.listBusy=true;
  try{const data=await api('/api/rooms');renderRooms(data.rooms||[]);const n=(data.rooms||[]).length;const label=el('onlineListStatus');if(label)label.textContent=n+' sala'+(n===1?'':'s')+' neste servidor · atualizado agora';}
  catch(error){const label=el('onlineListStatus');if(label)label.textContent=error instanceof TypeError?'Servidor indisponível. Inicie o servidor para ver salas.':error.message;}
  finally{state.listBusy=false;}
 }
 function openPanel(box){box.hidden=false;refreshRooms();if(!state.listTimer)state.listTimer=setInterval(refreshRooms,5000);el('onlineName').focus();}
 function closePanel(){const box=el('onlineLobby');if(box)box.hidden=true;clearInterval(state.listTimer);state.listTimer=0;}
 function roomText(players){const other=players.find(p=>p.id!==state.publicId),active=players.filter(p=>p.state?.alive).length,text='Código: '+state.code+' · '+players.length+'/2 jogadores'+(other?' · '+other.name:' · aguardando jogador')+' · '+active+' em partida';const room=el('onlineRoom');room.hidden=false;if(room.textContent!==text)room.textContent=text;}
 function setRemotePlayers(players,receivedAt=clock()){
  const other=players.find(p=>p.id!==state.publicId),snapshot=other&&other.state?.alive?other:null;
  state.otherPresent=!!other;if(!snapshot){state.remotePlayer=null;return;}
  const sample=snapshot.state,remote=state.remotePlayer;
  if(!remote){state.remotePlayer={x:sample.x,y:sample.y,a:sample.a,tx:sample.x,ty:sample.y,ta:sample.a,name:snapshot.name,dead:false,anim:0,receivedAt};return;}
  remote.tx=sample.x;remote.ty=sample.y;remote.ta=sample.a;remote.name=snapshot.name;remote.receivedAt=receivedAt;
 }
 function tickRemote(time){
  const remote=state.remotePlayer;if(!remote){lastRemoteTick=time;return;}
  if(time-remote.receivedAt>5000){state.remotePlayer=null;lastRemoteTick=time;return;}
  const dt=lastRemoteTick?Math.max(0,Math.min(.1,(time-lastRemoteTick)/1000)):1/60;lastRemoteTick=time;
  const blend=1-Math.exp(-12*dt);remote.x+=(remote.tx-remote.x)*blend;remote.y+=(remote.ty-remote.y)*blend;
  let da=((remote.ta-remote.a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;remote.a+=da*blend;
 }
 function acceptRevision(revision){if(!Number.isSafeInteger(revision)||revision<state.revision)return false;state.revision=revision;return true;}
 function networkStatus(time){if(time-lastNetworkPaint<500)return;lastNetworkPaint=time;const node=el('onlineNetworkStatus');if(!node||!state.connected)return;
  const response=state.latency===null?'resposta pendente':'resposta ~'+Math.round(state.latency)+' ms';
  if(!state.otherPresent){node.textContent='Conectado · '+response+' · aguardando jogador';return;}
  if(!state.remotePlayer){node.textContent='Outro jogador conectado, aguardando posição atualizada.';return;}
  node.textContent='Conectado · '+response+' · última posição há '+Math.max(0,((time-state.remotePlayer.receivedAt)/1000)).toFixed(1)+' s';
 }
 state.setRemotePlayers=setRemotePlayers;state.tickRemote=tickRemote;state.acceptRevision=acceptRevision;
 async function copyCode(){try{if(!navigator.clipboard?.writeText)throw Error('clipboard indisponível');await navigator.clipboard.writeText(state.code);status('Código da sala copiado.');}
  catch{const input=el('onlineCode');input.value=state.code;input.focus();input.select();status('Código selecionado. Copie com Ctrl+C.');}}
 function startButton(){const room=el('onlineRoom');let button=el('onlineStart');if(!button){button=document.createElement('button');button.id='onlineStart';button.type='button';button.textContent='Jogar nesta sala';room.after(button);}
  let copy=el('onlineCopyCode');if(!copy){copy=document.createElement('button');copy.id='onlineCopyCode';copy.type='button';copy.className='sec';copy.textContent='Copiar código';copy.onclick=copyCode;button.after(copy);}
  if(el('onlineNetworkStatus'))el('onlineNetworkStatus').hidden=false;
  el('onlineLeave').hidden=false;button.onclick=()=>{if(window.EXP?.MULTI){EXP.MULTI.enabled=false;EXP.multiCfg.multi=false;EXP.multi.save();}el('onlineLobby').hidden=true;if(typeof showMasks==='function')showMasks();};
 }
 function adopt(data,message){state.code=data.code;state.playerId=data.playerId;state.publicId=data.publicId;state.revision=data.revision;state.connected=true;state.retries=0;state.latency=null;state.otherPresent=false;el('onlineCode').value=data.code;roomText(data.players||[]);startButton();measureLatency();
  if(!saveSession())status('Sessão conectada, mas este navegador bloqueou a recuperação automática.');else if(message)status(message);poll();refreshRooms();
 }
 async function leaveRoom(notify=true){const connected=state.connected,url='/api/rooms/'+state.code+'/leave';state.connected=false;state.remotePlayer=null;state.otherPresent=false;state.latency=null;clearTimeout(pollTimer);pollAbort?.abort();pollAbort=null;clearSession();
  if(connected)try{await api(url,{method:'POST',headers:authHeader()});}catch{}
  el('onlineStart')?.remove();el('onlineCopyCode')?.remove();if(el('onlineNetworkStatus'))el('onlineNetworkStatus').hidden=true;if(el('onlineLeave'))el('onlineLeave').hidden=true;if(notify)status('Você saiu da sala.');refreshRooms();
 }
 async function create(){if(state.busy)return;setBusy(true);try{if(state.connected)await leaveRoom(false);state.name=el('onlineName').value.trim()||'Jogador';const data=await api('/api/rooms',{method:'POST',body:JSON.stringify({name:state.name})});adopt(data,'Sala criada. Compartilhe o código com seu amigo.');}
  catch(error){status(error instanceof TypeError?'Servidor offline. Inicie o servidor e recarregue a página.':error.message);}finally{setBusy(false);}}
 async function join(value){if(state.busy)return;const code=value.toUpperCase();if(!/^[A-Z0-9]{6}$/.test(code))return status('Digite um código de 6 caracteres.');setBusy(true);
  try{if(state.connected)await leaveRoom(false);state.name=el('onlineName').value.trim()||'Jogador';const data=await api('/api/rooms/'+code+'/join',{method:'POST',body:JSON.stringify({name:state.name})});adopt(data,'Você entrou na sala. Aguarde o outro jogador.');}
  catch(error){status(error instanceof TypeError?'Servidor offline. Inicie o servidor e recarregue a página.':error.message);}finally{setBusy(false);}}
 function expired(error){state.connected=false;state.remotePlayer=null;state.otherPresent=false;state.playerId='';state.publicId='';clearTimeout(pollTimer);clearSession();el('onlineStart')?.remove();el('onlineCopyCode')?.remove();if(el('onlineNetworkStatus'))el('onlineNetworkStatus').hidden=true;el('onlineLeave').hidden=true;
  status(error.status===403||error.status===404?'A sala expirou ou sua sessão foi encerrada. Crie ou entre novamente.':'Conexão interrompida. Tentando reconectar…');refreshRooms();}
 async function poll(){if(!state.connected)return;pollAbort=new AbortController();const controller=pollAbort;
  try{const data=await api('/api/rooms/'+state.code+'/state?since='+state.revision+'&wait=1',{signal:controller.signal,headers:authHeader()});if(!acceptRevision(data.revision)){poll();return;}state.retries=0;
   const players=data.players||[];if(!players.some(p=>p.id===state.publicId)){expired({status:404});return;}
   setRemotePlayers(players);
   roomText(players);status('Conectado à sala.');poll();
  }catch(error){if(!state.connected||error.name==='AbortError')return;if(error.status===403||error.status===404){expired(error);return;}
   state.retries++;status('Conexão interrompida. Tentando reconectar…');const delay=Math.min(1000*2**Math.min(state.retries-1,4),15000);clearTimeout(pollTimer);pollTimer=setTimeout(poll,delay);}}
 function send(time){if(!state.connected||state.sending||time-lastSend<100)return;const player=typeof EXP.onlineLocalState==='function'?EXP.onlineLocalState():null;if(!player)return;lastSend=time;state.sending=true;const started=clock();
  fetch('/api/rooms/'+state.code+'/state',{method:'POST',headers:{'content-type':'application/json',...authHeader()},body:JSON.stringify(player)})
   .then(response=>{if(response.ok)state.latency=clock()-started;else if(response.status===403||response.status===404)expired({status:response.status});})
   .catch(()=>{}).finally(()=>{state.sending=false;});
 }
 async function restoreSession(){const saved=readSession();if(!saved?.code||!saved?.playerId||!saved?.publicId)return;state.code=saved.code;state.playerId=saved.playerId;state.publicId=saved.publicId;state.name=saved.name||'Jogador';el('onlineName').value=state.name;setBusy(true);
  try{const data=await api('/api/rooms/'+state.code+'/rejoin',{method:'POST',headers:authHeader()});adopt(data,'Sessão da sala reconectada.');}
  catch{clearSession();state.playerId='';state.publicId='';status('A sessão anterior expirou. Crie uma sala ou entre com um código.');}finally{setBusy(false);}}
 function panel(){const menu=el('menu');if(!menu||el('onlineLobby'))return;const box=document.createElement('section');box.id='onlineLobby';box.className='online-lobby';box.hidden=true;
  box.innerHTML='<h2>Multiplayer Online</h2><p>Compartilha a sala e o avatar. Para se encontrarem, ambos precisam escolher o mesmo modo e mapa; combate e progresso não são sincronizados.</p><p id="onlineStatus" role="status">Conecte-se ao servidor para criar ou entrar numa sala.</p><div class="online-controls"><label>Seu nome <input id="onlineName" maxlength="18" value="Jogador" autocomplete="nickname"></label><button id="onlineCreate" type="button">Criar sala</button></div><div class="online-controls"><label>Código da sala <input id="onlineCode" maxlength="6" placeholder="ABC123" autocomplete="off"></label><button id="onlineJoin" type="button">Entrar com código</button></div><section class="online-server-browser" aria-labelledby="onlineServerTitle"><div class="online-server-heading"><h3 id="onlineServerTitle">Salas neste servidor</h3><button id="onlineRefresh" type="button" class="sec">Atualizar</button></div><p id="onlineListStatus" role="status">Buscando salas…</p><div id="onlineRoomList" class="online-room-list"></div></section><p id="onlineRoom" class="online-room" hidden></p><p id="onlineNetworkStatus" role="status" hidden></p><button id="onlineLeave" type="button" class="sec" hidden>Sair da sala</button><button id="onlineClose" type="button" class="sec">Voltar</button>';
  const actions=menu.querySelector('.primary-actions');actions?.after(box);const open=document.createElement('button');open.id='onlineBtn';open.type='button';open.className='online-btn';open.textContent='Multiplayer Online';actions?.append(open);
  el('onlineBtn').onclick=()=>openPanel(box);el('onlineClose').onclick=closePanel;el('onlineCreate').onclick=create;el('onlineJoin').onclick=()=>join(el('onlineCode').value);el('onlineLeave').onclick=()=>leaveRoom(true);el('onlineRefresh').onclick=refreshRooms;
  el('onlineCode').addEventListener('keydown',event=>{if(event.key==='Enter')join(event.currentTarget.value);});el('onlineCode').addEventListener('input',event=>{event.target.value=event.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);});restoreSession();
 }
 addEventListener('pagehide',()=>{pollAbort?.abort();clearTimeout(pollTimer);clearInterval(state.listTimer);});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!el('onlineLobby')?.hidden)closePanel();});
 document.addEventListener('DOMContentLoaded',panel);if(document.readyState!=='loading')panel();state.tick=time=>{tickRemote(time);networkStatus(time);send(time);};state.leave=leaveRoom;
})();
