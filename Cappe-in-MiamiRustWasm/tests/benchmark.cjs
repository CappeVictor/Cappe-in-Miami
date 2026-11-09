// Microbenchmark sintético no Node. NÃO mede FPS, GPU ou renderização do jogo.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { performance } = require('node:perf_hooks');
const { environment } = require('./regression.cjs');
const percentile = (a,p) => [...a].sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*p))];
function runTargetBenchmark() {
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),fn=html.match(/function activeTarget\(x = P\?\.x \|\| 0, y = P\?\.y \|\| 0\) \{[\s\S]*?\n\}/)?.[0];
  if(!fn)throw new Error('activeTarget missing for benchmark');
  const {ctx}=environment();ctx.P={x:400,y:300,dead:false};ctx.EXP.MULTI={P2:{x:650,y:350,dead:false}};
  vm.runInContext(fn+`\nfunction legacyActiveTarget(x,y){const targets=[];if(P&&!P.dead)targets.push(P);const p2=window.EXP?.MULTI?.P2;if(p2&&!p2.dead)targets.push(p2);if(!targets.length)return null;targets.sort((a,b)=>hyp(a.x-x,a.y-y)-hyp(b.x-x,b.y-y));return targets[0];}\nfunction targetBatch(points,legacy){const fn=legacy?legacyActiveTarget:activeTarget;let selected=null;for(const p of points)selected=fn(p[0],p[1]);return selected;}`,ctx);
  let seed=0x9e3779b9;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
  ctx.points=Array.from({length:120000},()=>[random()*1200,random()*800]);
  for(let i=0;i<2;i++){vm.runInContext('targetBatch(points,false)',ctx);vm.runInContext('targetBatch(points,true)',ctx);}
  const current=[],legacy=[];for(let i=0;i<7;i++){let t=performance.now();vm.runInContext('targetBatch(points,false)',ctx);current.push(performance.now()-t);t=performance.now();vm.runInContext('targetBatch(points,true)',ctx);legacy.push(performance.now()-t);}
  const currentP50=percentile(current,.5),legacyP50=percentile(legacy,.5);
  return{actorsPerQuery:2,calls:ctx.points.length,runs:7,currentP50Ms:+currentP50.toFixed(3),legacySortP50Ms:+legacyP50.toFixed(3),changePct:+((currentP50/legacyP50-1)*100).toFixed(1),warning:'Microbenchmark local; compara apenas a seleção de alvo, não FPS.'};
}
function run() {
  const source = fs.readFileSync(path.join(__dirname,'../js/maps.js'),'utf8');
  const parse=[];
  for(let i=0;i<6;i++) { const t=performance.now();new vm.Script(source+'\n// benchmark sample '+i,{filename:'maps-sample-'+i+'.js'});if(i)parse.push(performance.now()-t); }
  const {ctx,exp}=environment();ctx.WW=1200;ctx.WH=800;
  ctx.sol=[[380,0,40,560],[780,240,40,560]];
  const begin=performance.now();exp.navBuild();const buildMs=performance.now()-begin;
  for(let i=0;i<20;i++)exp.navPath(50,50,1150,750);
  const timings=[];let found=0;
  for(let i=0;i<200;i++){const t=performance.now();const route=exp.navPath(50,50+(i%10)*20,1150,550+(i%10)*20);timings.push(performance.now()-t);if(route)found++;}
  const routeReuseRuns=[];
  for(const reuse of [false,true]){
    let route=null,pool=[],created=0,maxPathLength=0;const samples=[];
    for(let i=0;i<20;i++)route=exp.navPath(50,50+(i%10)*20,1150,550+(i%10)*20,reuse?route:undefined,reuse?pool:undefined);
    maxPathLength=reuse?pool.length:0;
    for(let i=0;i<500;i++){
      const t=performance.now();route=exp.navPath(50,50+(i%10)*20,1150,550+(i%10)*20,reuse?route:undefined,reuse?pool:undefined);samples.push(performance.now()-t);
      if(route){if(reuse){created+=Math.max(0,pool.length-maxPathLength);maxPathLength=Math.max(maxPathLength,pool.length);}else{created+=route.length;maxPathLength=Math.max(maxPathLength,route.length);}}
    }
    routeReuseRuns.push({reuse,createdPathPointObjects:created,maxPathLength,p50Ms:percentile(samples,.5),p95Ms:percentile(samples,.95)});
  }
  return { environment:'Node '+process.version+' / '+process.platform+' '+process.arch,
    warning:'Microbenchmark sintético, sem navegador; não representa FPS nem frame time de partidas.',
    maps:{bytes:Buffer.byteLength(source),parseSamples:5,parseP50Ms:percentile(parse,.5),parseP95Ms:percentile(parse,.95)},
    navigation:{world:[1200,800],cells:exp.NAV.ok.length,obstacles:ctx.sol.length,buildMs,adjacencyBytes:(exp.NAV.neighbors?.byteLength||0)+(exp.NAV.neighborCounts?.byteLength||0),samples:200,pathsFound:found,p50Ms:percentile(timings,.5),p95Ms:percentile(timings,.95)},
    navigationReuse:{samples:500,runs:routeReuseRuns,warning:'As contagens são objetos de ponto criados pelo gerador de caminhos; não representam o heap total do jogo.'},
    activeTarget:runTargetBenchmark() };
}
module.exports={run};
if(require.main===module)console.log(JSON.stringify(run(),null,2));
