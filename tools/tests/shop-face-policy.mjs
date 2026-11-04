import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import { readFileSync,mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});await server.listen();const url=server.resolvedUrls.local[0];
const browser=await chromium.launch({executablePath:process.env.SIM_CHROME||'/usr/bin/chromium',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--mute-audio','--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.route('**/*',r=>{const u=r.request().url();if(u.includes('/npm/phaser@'))return r.fulfill({body:readFileSync('node_modules/phaser/dist/phaser.min.js'),contentType:'application/javascript'});return u.startsWith(url)?r.continue():r.abort();});
 await page.goto(url);await page.waitForFunction(()=>window.game?.scene.isActive('Title'),null,{timeout:120000});
 const facts=await page.evaluate(async()=>{
  const {ShopScene}=await import('/src/scenes/ShopScene.js');ShopScene.prototype.update=function(){};
  for(const s of window.game.scene.getScenes(true))window.game.scene.stop(s.scene.key);
  window.game.scene.start('Shop');await new Promise(r=>setTimeout(r,250));const s=window.game.scene.getScene('Shop');
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(10,10,40,40);s.textures.addSpriteSheet('shop_face_scar',canvas,{frameWidth:64,frameHeight:64});
  s.face='happy';s.keeper(s.g,10);const normal=s.faceImg.texture.key!=='shop_face_scar';
  s.secret={typed:' riphood ',onKey:()=>{}};s.submitCode();s.keeper(s.g,40);const typed=s.riphood&&s.faceImg.texture.key==='shop_face_scar';
  s.endTakeover();s.keeper(s.g,60);const reset=!s.riphood&&s.faceImg.texture.key!=='shop_face_scar';
  return {normal,typed,reset};
 });for(const [key,value]of Object.entries(facts))assert.equal(value,true,key);assert.deepEqual(errors,[]);console.log('PASS',JSON.stringify(facts));
}finally{await browser.close();await server.close();}
