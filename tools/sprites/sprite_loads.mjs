// Capture the authoritative Boot loader registrations without starting a browser.
globalThis.Phaser={Scene:class{}};globalThis.document={getElementById:()=>null};
const {BootScene}=await import('../../src/scenes/BootScene.js');
const boot=new BootScene(),specs=[];boot.events={once:()=>{}};
boot.load={on:()=>{},spritesheet:(key,path,config)=>specs.push({key,path,config}),audio:()=>{},image:()=>{}};
boot.preload();process.stdout.write(JSON.stringify(specs));
