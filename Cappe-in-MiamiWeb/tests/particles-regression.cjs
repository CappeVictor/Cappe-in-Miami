'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');

const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start=html.indexOf('function updateSparks(dt) {');
if(start<0) throw new Error('updateSparks não encontrado');
let depth=0,end=-1;
for(let i=html.indexOf('{',start);i<html.length;i++) {
  if(html[i]==='{') depth++;
  else if(html[i]==='}'&&!--depth) { end=i+1; break; }
}
if(end<0) throw new Error('updateSparks incompleto');
const fn=html.slice(start,end);
assert.equal((fn.match(/\bfor\s*\(/g)||[]).length,1,'updateSparks deve percorrer a lista uma vez');
const ctx=vm.createContext({sparks:[
  {x:1,y:2,vx:3,vy:-2,life:.5,max:1},
  {x:4,y:5,vx:1,vy:1,life:.05,max:1},
  {x:-2,y:9,vx:-4,vy:2,life:.12,max:1}
],Math});
vm.runInContext(fn,ctx);
const first=ctx.sparks[0],last=ctx.sparks[2];
ctx.updateSparks(.1);
assert.equal(ctx.sparks.length,2);
assert.equal(ctx.sparks[0],first);
assert.equal(ctx.sparks[1],last);
assert.equal(first.life,.4);
assert.equal(first.x,1.3);
assert.equal(first.y,1.8);
assert.equal(last.life,.01999999999999999);
assert.equal(last.x,-2.4);
assert.equal(last.y,9.2);
process.stdout.write('PASS updateSparks faz um percurso, mantém ordem/identidade e remove partículas expiradas\n');

