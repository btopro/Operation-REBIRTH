// Tiny reusable pixel props. All points snap to the game grid; effects stay inside a 64px motif.
export function pixel(g,x,y,w,h,c,a=1){g.fillStyle(c,a);g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
export function line(g,x,y,xx,yy,c,w=1,a=1){const n=Math.max(1,Math.ceil(Math.max(Math.abs(xx-x),Math.abs(yy-y))));for(let i=0;i<=n;i++)pixel(g,x+(xx-x)*i/n,y+(yy-y)*i/n,w,w,c,a);}
export function crystal(g,x,y,r,c,light=0xf1ffff,a=1){for(let j=-r;j<=r;j++){const w=Math.max(1,Math.floor((r-Math.abs(j))*.55));pixel(g,x-w,y+j,w*2+1,1,c,a);pixel(g,x,y+j,1,1,light,a);}}
export function leaf(g,x,y,c,a=1,sc=1){pixel(g,x,y,3*sc,sc,c,a);pixel(g,x+sc,y-sc,3*sc,sc,c,a);pixel(g,x+sc,y+sc,sc,sc,0xe0e8a3,a);}
export function moth(g,x,y,t,c,sc=1,a=1){const up=(t>>2)%2?2:0;pixel(g,x-4*sc,y-up*sc,3*sc,2*sc,c,a);pixel(g,x+sc,y-up*sc,3*sc,2*sc,c,a);pixel(g,x-sc,y,2*sc,3*sc,0x272c28,a);}
export function lantern(g,x,y,sc=1,a=1){pixel(g,x-3*sc,y-6*sc,6*sc,sc,0x778aa8,a);pixel(g,x-4*sc,y-5*sc,8*sc,12*sc,0x252c49,a);pixel(g,x-2*sc,y-4*sc,4*sc,8*sc,0x8fcae8,a);pixel(g,x-sc,y-3*sc,2*sc,5*sc,0xe2fbff,a);pixel(g,x-4*sc,y+6*sc,8*sc,2*sc,0x778aa8,a);}
export function censer(g,x,y,t,sc=1,a=1){line(g,x,y-15*sc,x+Math.sin(t*.08)*sc,y-3*sc,0x9d9b70,sc,a);pixel(g,x-4*sc,y-3*sc,8*sc,6*sc,0x384335,a);pixel(g,x-3*sc,y-3*sc,6*sc,sc,0xc0bf82,a);pixel(g,x-2*sc,y-sc,4*sc,2*sc,0xbee378,a);pixel(g,x-2*sc,y+3*sc,4*sc,sc,0x899b64,a);}
export function ward(g,x,y,r,c,a=1){for(const [ax,ay,bx,by]of [[0,-r,r,0],[r,0,0,r],[0,r,-r,0],[-r,0,0,-r]])line(g,x+ax,y+ay,x+bx,y+by,c,1,a);pixel(g,x-1,y-3,2,6,c,a);pixel(g,x-3,y-1,6,2,c,a);}
export function wave(g,x,y,w,t,c,a=1){for(let i=0;i<w;i+=3)pixel(g,x+i,y+Math.round(Math.sin((i+t)*.18)*2),3,2,c,a);}
export function fairy(g,x,y,t,sc=1,a=1){pixel(g,x-5*sc,y-((t>>2)%2?4:1)*sc,3*sc,2*sc,0xe4ffff,a);pixel(g,x+3*sc,y-((t>>2)%2?4:1)*sc,3*sc,2*sc,0xe4ffff,a);pixel(g,x-2*sc,y-2*sc,4*sc,4*sc,0x68d5f0,a);pixel(g,x-sc,y-sc,2*sc,2*sc,0xffffff,a);}
