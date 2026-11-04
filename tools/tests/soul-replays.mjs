import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import { readFileSync,mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});await server.listen();const url=server.resolvedUrls.local[0];
const browser=await chromium.launch({executablePath:process.env.SIM_CHROME||'/usr/bin/chromium',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--mute-audio','--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36'});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.route('**/*',r=>{const u=r.request().url();if(u.includes('/npm/phaser@'))return r.fulfill({body:readFileSync('node_modules/phaser/dist/phaser.min.js'),contentType:'application/javascript'});return u.startsWith(url)?r.continue():r.abort();});
 await page.goto(url);await page.waitForFunction(()=>window.game?.scene?.isActive('Title'),null,{timeout:120000});








 const result=await page.evaluate(async()=>{
  const {awardSoul,ownedSouls}=await import('/src/souls/collection.js'),{setMainSoul}=await import('/src/souls/team.js'),{soulPower}=await import('/src/souls/progression.js'),{getCoins}=await import('/src/progress.js'),{MatchScene}=await import('/src/scenes/MatchScene.js'),{getSoulBoard,SOUL_CYCLE_MS}=await import('/src/souls/board.js');MatchScene.prototype.update=function(){};awardSoul('steve');setMainSoul('steve');
  const created=(key,action)=>new Promise((resolve,reject)=>{const s=window.game.scene.getScene(key),timer=setTimeout(()=>reject(Error('Timeout '+key)),10000);s.events.once('create',()=>{clearTimeout(timer);resolve(s);});action();});
  for(const s of window.game.scene.getScenes(true))window.game.scene.stop(s.scene.key);
  const board=await created('SoulBoard',()=>window.game.scene.start('SoulBoard'));for(let i=0;i<26&&!board.visibleSouls.some(s=>s.id==='steve');i++){board.board=getSoulBoard(Date.now()+i*SOUL_CYCLE_MS);board.refresh();}board.select(board.visibleSouls.findIndex(s=>s.id==='steve'));if(!board.fightButton.visible)throw Error('Owned soul fight hidden');
  const battle=await created('SoulBattle',()=>board.challenge());let m=await created('Match',()=>battle.fight());const before=getCoins(),xp=soulPower('steve').xp,count=ownedSouls().length;
  for(let i=0;i<2;i++){m.fighters[1].eliminated=true;const results=await created('Results',()=>m.toResults());if(!results.coinT?.text.includes('COINS'))throw Error('Coins not shown');const coins=getCoins();m.toResults();if(getCoins()!==coins)throw Error('Duplicate settlement');if(i===0){results.t=80;m=await created('Match',()=>results.choose(0));}}
  if(getCoins()<=before||soulPower('steve').xp!==xp+200||ownedSouls().length!==count)throw Error('Replay rewards or unique ownership failed');
  const r=window.game.scene.getScene('Results');r.t=80;m=await created('Match',()=>r.choose(0));m.fighters[0].eliminated=true;await created('Results',()=>m.toResults());if(soulPower('steve').xp!==xp+250)throw Error('Loss XP missing');
  const battle2=await created('SoulBattle',()=>window.game.scene.start('SoulBattle',{soulId:'healing-orb'}));m=await created('Match',()=>battle2.fight());m.fighters[1].eliminated=true;await created('SoulReward',()=>m.toResults());if(ownedSouls().length!==count+1)throw Error('First unlock missing');
  return {coins:getCoins()-before,xp:soulPower('steve').xp-xp,uniqueSouls:ownedSouls().length};
 });assert.deepEqual(errors,[]);console.log('PASS owned board access, setup, repeated wins/losses, coins, equipped Main XP, one-time settlement and unique collection',result);
}finally{await browser.close();await server.close();}
