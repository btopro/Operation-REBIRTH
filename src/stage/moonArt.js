// A single 64px tile kit and restrained palette tie the entire bridge together.
export function pixelDisc(g,x,y,r) {
  for(let yy=-r;yy<r;yy+=4){const half=Math.floor(Math.sqrt(Math.max(0,r*r-(yy+2)**2))/2)*2;g.fillRect(Math.round(x/2)*2-half,Math.round((y+yy)/2)*2,half*2,4);}
}
export function drawMoonArt(stage,world,bg) {
  const s=stage.scene;
  const sky=s.add.graphics().setScrollFactor(0);
  [0x111020,0x19172d,0x222039,0x2b2943,0x35334c,0x403e57].forEach((c,i)=>{sky.fillStyle(c);sky.fillRect(-400,-80+i*80,1440,80);});
  sky.fillStyle(0x403e57);sky.fillRect(-400,400,1440,500);
  const stars=[[44,52],[128,88],[220,30],[288,152],[410,40],[510,102],[602,54],[78,134],[460,160],[560,20]];
  for(const [x,y]of stars){sky.fillStyle(0x7c8497);sky.fillRect(x,y,2,2);}
  for(const [x,y,w]of [[-40,88,124],[160,146,94],[408,80,150],[530,188,120]]){sky.fillStyle(0x35334c);sky.fillRect(x,y,w,8);sky.fillRect(x+16,y-4,w-38,4);}
  bg.push(sky);
  const tile=(frame,x,y,target,scale=1,scroll=1)=>{const a=s.add.image(x,y,'moon_tiles',frame).setOrigin(0).setScale(scale).setScrollFactor(scroll);target.push(a);return a;};
  tile(7,280,26,bg,2,.04);
  const far=s.add.graphics().setScrollFactor(.15);far.fillStyle(0x25243b);
  // Authored ridge silhouettes, stepped in 4px clusters rather than random points.
  for(const [cx,w,h]of [[20,140,56],[170,180,80],[350,150,48],[520,180,100],[700,200,76]]){
    for(let y=0;y<h;y+=4){const half=Math.floor(w/2*(1-y/h)/4)*4;far.fillRect(cx-half,264-y,half*2,4);}
  }
  far.fillRect(-400,264,1440,340);bg.push(far);
  for(const [x,y]of [[52,154],[112,142],[172,168]])tile(6,x,y,bg,1,.18);
  // Distant viaduct repeats the same arch module, in shadow.
  for(let x=-300;x<1000;x+=64)tile(1,x,274,bg,1,.45).setTint(0x666078);
  stage.emberG=s.add.graphics().setScrollFactor(.15);bg.push(stage.emberG);
  const P=stage.platforms[0];
  // Railings sit behind fighters; the clean light edge always marks the actual collision floor.
  for(let x=P.x1;x<P.x2;x+=64){const w=Math.min(64,P.x2-x);tile(3,x,-64,world).setCrop(0,0,w,64);tile(0,x,0,world).setCrop(0,0,w,64);tile(1,x,48,world).setCrop(0,0,w,64);}
  for(const x of [-256,-128,0,128,256]){tile(2,x-32,102,world);tile(2,x-32,166,world);tile(5,x-32,28,world);}
  // Reuse the pier masonry for the two outer archways and central lantern gate.
  for(const A of stage.platforms.slice(1)){
    for(const x of [A.x1+8,A.x2-20]){
      const post=s.add.graphics();post.fillStyle(0x100f23);post.fillRect(x,A.y,8,-A.y);post.fillStyle(0x53566c);post.fillRect(x,A.y,2,-A.y);
      for(let y=A.y+16;y<-4;y+=24){post.fillStyle(0x38384f);post.fillRect(x,y,8,4);}world.push(post);
    }
    for(let x=A.x1;x<A.x2;x+=64)tile(4,x,A.y,world).setCrop(0,0,Math.min(64,A.x2-x),24);
    tile(5,(A.x1+A.x2)/2-16,A.y+4,world,.5);
  }
  stage.lanternG=s.add.graphics().setPosition(0,stage.platforms[3].y+7);
  stage.fireG=s.add.graphics();stage.fogG=s.add.graphics();stage.hzG=s.add.graphics();
  world.push(stage.fogG,stage.lanternG,stage.fireG,stage.hzG);stage.cycle.makeBanner(s);
}
