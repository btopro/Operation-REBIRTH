// Browser-side checks shared by desktop and phone profiles.
export async function checkLinkCompanion(scene,f,skinSheets){
 const {YOUNG_LINK_EYES}=await import('/src/fighters/youngLinkEyes.js');
 const shadow=skinSheets(scene,f.def,2);let eyePixels=0;
 for(const [kind,key]of Object.entries(f.def.sheets)){
  const masks=YOUNG_LINK_EYES[key];if(!masks)continue;
  const tex=scene.textures.get(shadow[kind]),img=tex.getSourceImage(),cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;const ctx=cv.getContext('2d');ctx.drawImage(img,0,0);const p=ctx.getImageData(0,0,cv.width,cv.height).data;
  const sample=(i,x,y)=>{const frame=tex.get(i),s=frame.data.spriteSourceSize,n=((frame.cutY+y-(frame.trimmed?s.y:0))*cv.width+frame.cutX+x-(frame.trimmed?s.x:0))*4;return Array.from(p.slice(n,n+4));};
  for(let i=0;i<masks.length;i++)for(const [x,y]of masks[i]){if(sample(i,x,y).join(',')!=='255,0,0,255')throw Error('Eye not solid red: '+kind+'/'+i);eyePixels++;}
  if(kind==='idle')for(const [x,y]of [[81,77],[82,76],[85,76],[86,78]])if(sample(0,x,y).join(',')!=='255,0,0,255')throw Error('Sclera or pupil left grey');
 }
 const saved={x:f.x,y:f.y,state:f.state,facing:f.facing,skin:f.skin,sheets:f.sheets};
 for(let skin=0;skin<3;skin++){
  f.skin=skin;f.sheets=skinSheets(scene,f.def,skin);f.x=0;f.y=0;f.facing=1;f.setState('idle');f.fairyPosition=null;f.render(scene.frame);
  if(!f.fairyPosition)throw Error('Navi missing on skin '+skin);
  const x=f.fairyPosition.x;f.x+=60;f.render(scene.frame);const delta=f.fairyPosition.x-x;if(delta<=0||delta>=60)throw Error('Navi must follow smoothly');
 }
 Object.assign(f,saved);scene.draw();return {eyePixels,naviSkins:3};
}
