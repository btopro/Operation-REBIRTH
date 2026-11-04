// The same winged purple guard, blue grip and gold jewel on the tossed/Limit sword.
export function drawMasterSwordHilt(g,x,y,dx,dy,scale=1) {
  const nx=-dy,ny=dx;
  g.lineStyle(4*scale,0x211b45,1);g.lineBetween(x-dx*3*scale,y-dy*3*scale,x-dx*11*scale,y-dy*11*scale);
  g.lineStyle(2*scale,0x4d3d9d,1);g.lineBetween(x-dx*3*scale,y-dy*3*scale,x-dx*11*scale,y-dy*11*scale);
  g.lineStyle(3*scale,0x4d3d9d,1);
  for(const side of [-1,1]) {
    g.lineStyle(3*scale,0x4d3d9d,1);
    g.lineBetween(x,y,x+nx*side*7*scale+dx*2*scale,y+ny*side*7*scale+dy*2*scale);
    g.lineStyle(2*scale,0x8276df,1);g.lineBetween(x+nx*side*4*scale,y+ny*side*4*scale,x+nx*side*7*scale+dx*2*scale,y+ny*side*7*scale+dy*2*scale);
  }
  g.fillStyle(0xe8c45e);g.fillRect(Math.round(x-scale),Math.round(y-scale),2*scale+1,2*scale+1);
}
