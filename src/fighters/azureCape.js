import { AZURE_CAPE_ANCHORS } from './azureCapeAnchors.js';
// Source-frame landmarks follow the actual cel, including embedded spins and lunges.
export function azureShoulder(actor){
 const key=actor.texture.key.split('@')[0],w=actor.frame.realWidth,h=actor.frame.realHeight;
 const pose=AZURE_CAPE_ANCHORS[key]?.[Number(actor.frame.name)] || [w*actor.originX-3,h*actor.originY-33,0,false];
 const [x,y,angle,celFlip]=pose,flip=actor.flipX;
 const dx=((flip?w-x:x)-w*actor.originX)*actor.scaleX,dy=(y-h*actor.originY)*actor.scaleY,a=actor.rotation;
 return {x:actor.x+dx*Math.cos(a)-dy*Math.sin(a),y:actor.y+dx*Math.sin(a)+dy*Math.cos(a),angle:a+(flip?-angle:angle),flip:flip!==celFlip};
}
export function syncAzureCape(cape,actor,t,moving=false){
 if(!cape)return;
 const p=azureShoulder(actor);
 cape.setFrame(Math.floor(t/(moving?3:5))%8).setOrigin(p.flip?24/64:40/64,14/64).setFlipX(p.flip)
 .setPosition(Math.round(p.x),Math.round(p.y)).setScale(actor.scaleX,actor.scaleY).setRotation(p.angle)
 .setAlpha(actor.alpha*.92).setVisible(actor.visible);
}
