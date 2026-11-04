// An empty, early-3D castle interpreted in the game's pixel palette.
// Fixed architecture only: no damage volumes, moving floors, portals or hazard cycle.
const P={wall:0x444745,mortar:0x343735,light:0x626560,black:0x111413,tile:0x777a70,red:0x48191e,edge:0x92958a};
function bricks(g,x,y,w,h,size=24){g.fillStyle(P.wall);g.fillRect(x,y,w,h);g.lineStyle(1,P.mortar);for(let yy=y;yy<y+h;yy+=size/2){g.lineBetween(x,yy,x+w,yy);for(let xx=x+((yy-y)/(size/2)%2?size/2:0);xx<x+w;xx+=size)g.lineBetween(xx,yy,xx,Math.min(yy+size/2,y+h));}}
function arch(g,x,y,w,h){g.fillStyle(0x242725);g.fillRect(x-6,y+18,w+12,h-18);g.fillRect(x+8,y+5,w-16,h-5);g.fillStyle(0x030605);g.fillRect(x,y+23,w,h-23);g.fillRect(x+5,y+12,w-10,h-12);g.fillRect(x+15,y+4,w-30,h-4);g.fillRect(x+26,y,w-52,8);g.fillStyle(0x0d100e);g.fillRect(x+3,y+h-8,w-6,8);}
function checker(g,x,y,w,h,cell=12){for(let yy=0;yy<h;yy+=cell)for(let xx=0;xx<w;xx+=cell){g.fillStyle((Math.floor(xx/cell)+Math.floor(yy/cell))%2?P.black:P.tile);g.fillRect(x+xx,y+yy,Math.min(cell,w-xx),Math.min(cell,h-yy));}}
export class LiminalCastleStage{
 constructor(scene){this.scene=scene;this.t=0;this.hazardsOn=false;this.music='bgm_endless_castle';
  this.platforms=[{x1:-310,x2:310,y:0,bottom:72,solid:true,ledgeSides:[-1]},{x1:70,x2:310,y:-68,bottom:0,solid:true},{x1:-252,x2:-132,y:-104,solid:false},{x1:108,x2:232,y:-164,solid:false}];
  this.spawns=[{x:-168,y:0},{x:172,y:-68},{x:-68,y:0},{x:270,y:-68}];
 }
 draw(world,bg){const s=this.scene,g=s.add.graphics().setScrollFactor(0);g.fillStyle(0x151a18);g.fillRect(-500,-400,1600,1200);
  bricks(g,-50,-30,740,390,36);
  // Wall turns at the right tower; the seams deliberately refuse to line up.
  g.fillStyle(0x242926,.45);g.fillRect(-50,-30,300,390);bricks(g,432,-30,260,390,32);g.fillStyle(0x0b100e,.35);g.fillRect(426,-30,8,390);
  for(let i=0;i<4;i++){g.fillStyle(i%2?0x282d29:0x555951);g.fillRect(-50,12+i*7,750,5);}arch(g,51,82,155,175);
  // A distant carpet and checkerboard apron disappear into a lightless archway.
  checker(g,-40,259,730,102,17);g.fillStyle(0x281315);g.fillTriangle(124,247,256,361,-40,361);g.fillStyle(0x0b100e,.35);g.fillRect(-40,259,730,102);
  g.fillStyle(0x151913);g.fillRect(495,73,48,82);g.fillStyle(P.red);g.fillRect(499,75,40,61);g.fillTriangle(499,136,519,151,539,136);g.fillStyle(0x66252c);g.fillRect(503,77,3,54);arch(g,502,180,47,72);
  // A recessed side staircase is distant scenery, distinct from playable terraces.
  for(let i=0;i<8;i++){g.fillStyle(i%2?0x272c28:0x333731);g.fillRect(18-i*9,258+i*8,102+i*9,7);g.fillStyle(0x32191b);g.fillRect(42-i*8,258+i*8,42+i*8,5);}
  g.fillStyle(0x080e0b,.18);g.fillRect(0,0,640,360);g.fillStyle(0x020604,.28);g.fillRect(0,0,640,42);g.fillRect(0,318,640,42);bg.push(g);
  const arena=s.add.graphics();for(const p of this.platforms){const h=p.solid?p.bottom-p.y:16;bricks(arena,p.x1,p.y,p.x2-p.x1,h,24);checker(arena,p.x1,p.y,p.x2-p.x1,10,10);arena.fillStyle(P.edge);arena.fillRect(p.x1,p.y,p.x2-p.x1,2);arena.fillStyle(0x151b17);arena.fillRect(p.x1,p.y+h-3,p.x2-p.x1,3);const cx=(p.x1+p.x2)/2;arena.fillStyle(P.red);arena.fillRect(cx-20,p.y+2,40,h-4);arena.fillStyle(0x682b30);arena.fillRect(cx-20,p.y+2,2,h-4);}
  // The lower tower doorway is paint on the facade, never an invisible collision hole.
  arch(arena,224,-33,40,103);arena.fillStyle(0x666b60);arena.fillRect(70,-68,2,138);world.push(arena);
 }
 step(){this.t++;return [];}
}
export function drawLiminalCastlePreview(g,x,y,w,h){g.fillStyle(0x353c37);g.fillRect(x,y,w,h);g.fillStyle(0x090e0b);g.fillRect(x+w*.1,y+h*.2,w*.23,h*.49);g.fillStyle(0x414a43);g.fillRect(x+w*.1,y+h*.2,w*.03,h*.05);g.fillRect(x+w*.3,y+h*.2,w*.03,h*.05);for(let i=0;i<2;i++){const xx=x+w*(i?.55:.08),yy=y+h*(i?.51:.76),ww=w*(i?.4:.47);g.fillStyle(0x666e61);g.fillRect(xx,yy,ww,h*.2);g.fillStyle(0x171f19);g.fillRect(xx,yy,ww,3);for(let k=0;k<7;k++){g.fillStyle(k%2?0x171f19:0xabb19c);g.fillRect(xx+k*ww/7,yy,ww/7,2);}g.fillStyle(P.red);g.fillRect(xx+ww*.4,yy+3,ww*.2,h*.17);}g.fillStyle(0x5b1d24);g.fillRect(x+w*.75,y+h*.13,w*.07,h*.2);}
