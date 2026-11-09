// Microbenchmark sintético no Node. NÃO mede FPS, GPU ou renderização do jogo.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { performance } = require('node:perf_hooks');
const { environment } = require('./regression.cjs');
const percentile = (a,p) => [...a].sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*p))];
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
    navigationReuse:{samples:500,runs:routeReuseRuns,warning:'As contagens são objetos de ponto criados pelo gerador de caminhos; não representam o heap total do jogo.'} };
}
module.exports={run};
if(require.main===module)console.log(JSON.stringify(run(),null,2));
