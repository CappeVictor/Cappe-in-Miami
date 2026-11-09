'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const zlib=require('node:zlib');
const {createGameServer}=require('../server/server.js');

async function request(base,pathname,acceptEncoding,method='GET'){
  const url=new URL(pathname,base);
  return new Promise((resolve,reject)=>{
    const req=http.request(url,{method,headers:acceptEncoding?{'accept-encoding':acceptEncoding}:{}},response=>{
      const chunks=[];response.on('data',chunk=>chunks.push(chunk));response.on('end',()=>resolve({status:response.statusCode,headers:response.headers,body:Buffer.concat(chunks)}));
    });req.on('error',reject);req.end();
  });
}
async function run(){
  const root=path.resolve(__dirname,'..'),server=createGameServer({root});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  try{
    const base=`http://127.0.0.1:${server.address().port}`;
    const source=fs.readFileSync(path.join(root,'js/maps.js'));
    const compressed=await request(base,'/js/maps.js','gzip');
    assert.equal(compressed.status,200);assert.equal(compressed.headers['content-encoding'],'gzip');
    assert.equal(compressed.headers.vary,'Accept-Encoding');
    const decoded=zlib.gunzipSync(compressed.body);
    assert.deepEqual(decoded,source,'gzip precisa preservar exatamente o JavaScript original');
    assert.ok(compressed.body.length<source.length*.35,`gzip deveria reduzir maps.js: ${source.length} -> ${compressed.body.length}`);

    const identity=await request(base,'/js/maps.js','identity');
    assert.equal(identity.status,200);assert.equal(identity.headers['content-encoding'],undefined);
    assert.equal(identity.headers['content-length'],String(source.length));assert.deepEqual(identity.body,source);
    const rejected=await request(base,'/js/maps.js','gzip;q=0, identity');
    assert.equal(rejected.headers['content-encoding'],undefined,'q=0 não pode aceitar gzip');assert.deepEqual(rejected.body,source);
    const head=await request(base,'/js/maps.js','gzip','HEAD');
    assert.equal(head.status,200);assert.equal(head.headers['content-encoding'],undefined);assert.equal(head.headers['content-length'],String(source.length));assert.equal(head.body.length,0);
    const wasmPath='/wasm-renderer/pkg/direct/direct_renderer_bg.wasm';
    if(fs.existsSync(path.join(root,wasmPath.slice(1)))){
      const wasm=await request(base,wasmPath,'gzip');
      assert.equal(wasm.status,200);assert.equal(wasm.headers['content-encoding'],undefined,'WASM permanece sem recompressão gzip');
    }
    return {sourceBytes:source.length,gzipBytes:compressed.body.length,savedPercent:+(100*(1-compressed.body.length/source.length)).toFixed(1)};
  }finally{await new Promise(resolve=>server.close(resolve));}
}
if(require.main===module)run().then(result=>console.log(`PASS gzip preserva maps.js: ${result.sourceBytes} -> ${result.gzipBytes} bytes (${result.savedPercent}% menor); identity, q=0 e HEAD também válidos`)).catch(error=>{console.error('FAIL',error);process.exitCode=1;});
module.exports=run;
