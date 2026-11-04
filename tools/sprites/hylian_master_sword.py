"""Locate Lacy's original sword pixels per frame and generate skin-only Master Sword patches.
The original sprite sheets, poses, clothing, and unarmed frames are left untouched.
"""
from PIL import Image,ImageDraw
from pathlib import Path
import colorsys,math,json
from lacy_counter_pose import counter_pose
from lacy_shrine import shrine_pose,shrine_turn_pose
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'public/assets/fighters/hero-knight'
BLADE={(201,201,201),(194,194,194)}
PALE=0xe5efff;STEEL=0xa0b9d5;INK=0x211b45;PURPLE=0x4d3d9d;BLUE=0x7469cf;GOLD=0xe8c45e
result={};counts={};hands={};poses={};helmets={}
for path in sorted(BASE.glob('*_sheet.png')):
 name=path.name[:-10]
 if name.endswith('_u'):continue
 fw,fh=(180,140) if name=='moves' else (150,90)
 im=Image.open(path).convert('RGBA');cols=im.width//fw;rows=im.height//fh
 if not cols or not rows:continue
 patches={};found=0;hand_frames=[];pose_frames=[];helmet_pixels=set()
 for index in range(cols*rows):
  ox=index%cols*fw;oy=index//cols*fh;f=im.crop((ox,oy,ox+fw,oy+fh));px=f.load()
  pts={(x,y) for y in range(fh) for x in range(fw) if px[x,y][3]==255 and px[x,y][:3] in BLADE}
  groups=[]
  while pts:
   first=pts.pop();group=[first];todo=[first]
   while todo:
    x,y=todo.pop()
    for dx in (-1,0,1):
     for dy in (-1,0,1):
      q=(x+dx,y+dy)
      if q in pts:pts.remove(q);group.append(q);todo.append(q)
   groups.append(group)
  if not groups:continue
  blade=max(groups,key=len)
  if max(max(x for x,y in blade)-min(x for x,y in blade),max(y for x,y in blade)-min(y for x,y in blade))<8:continue
  red=[]
  for y in range(fh):
   for x in range(fw):
    r,g,b,a=px[x,y];h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
    if a==255 and (h<.05 or h>.95) and s>.4:red.append((x,y))
  if red:
   top=min(y for x,y in red);xs=[x for x,y in red if y<=top+3];head_x=sum(xs)/len(xs);anchor=(head_x+4,top-2)
  else:top=fh*.57+2;head_x=fw*.46-4;anchor=(fw*.46,fh*.57)
  mx=sum(x for x,y in blade)/len(blade);my=sum(y for x,y in blade)/len(blade)
  xx=sum((x-mx)**2 for x,y in blade);yy=sum((y-my)**2 for x,y in blade);xy=sum((x-mx)*(y-my) for x,y in blade)
  angle=.5*math.atan2(2*xy,xx-yy);ux,uy=math.cos(angle),math.sin(angle)
  proj=lambda p:p[0]*ux+p[1]*uy
  lo=min(blade,key=proj);hi=max(blade,key=proj)
  hilt,tip=(lo,hi) if math.dist(lo,anchor)<math.dist(hi,anchor) else (hi,lo)
  length=math.dist(hilt,tip) or 1;ux=(tip[0]-hilt[0])/length;uy=(tip[1]-hilt[1])/length;nx,ny=-uy,ux
  # The bright steel ends at the shoulder on some poses, not at her grip.
  # Follow the original shaft back to a blue-grey gauntlet, then put the guard just ahead of it.
  candidates=[]
  for yy in range(fh):
   for xx in range(fw):
    r,g,b,a=px[xx,yy]
    if a<240:continue
    hh,ss,vv=colorsys.rgb_to_hsv(r/255,g/255,b/255)
    if not (.49<hh<.62 and .08<ss<.44 and .16<vv<.82):continue
    back=-((xx-hilt[0])*ux+(yy-hilt[1])*uy)
    side=abs((xx-hilt[0])*nx+(yy-hilt[1])*ny)
    if 0<=back<=32 and side<=4:candidates.append((back,side,xx,yy))
  if candidates:
   candidates=[v for v in candidates if v[1]<=1.25] or candidates
   first=min(v[0] for v in candidates)
   grip=min((v for v in candidates if v[0]<=first+4),key=lambda v:v[1])
   hand=(grip[2],grip[3]);old=hilt;distance=max(0,grip[0]-3)
   hilt=(hand[0]+ux*3,hand[1]+uy*3)
   hand_frames.append([index,round(hilt[0],2),round(hilt[1],2),hand[0],hand[1],round(ux,4),round(uy,4)])

  gauntlets=set()
  if name in ('counter','shrine','shrine_weapon','shrine_turn'):
   hilt,tip,(ux,uy),counter_hands=counter_pose(index) if name=='counter' else shrine_turn_pose(index) if name=='shrine_turn' else shrine_pose(index if name=='shrine' else 19);nx,ny=-uy,ux;hand=counter_hands[0]
   hand_frames=[v for v in hand_frames if v[0]!=index]
   hand_frames.append([index,round(hilt[0],2),round(hilt[1],2),round(hand[0],2),round(hand[1],2),round(ux,4),round(uy,4)])
   for hx,hy in (counter_hands if name!='shrine_weapon' else []):
    gauntlets.update((x,y) for y in range(round(hy)-1,round(hy)+2) for x in range(round(hx)-1,round(hx)+2))
  if name in ('shrine','shrine_turn','shrine_weapon'):
   # Do not mistake a touching greave highlight for part of the sword in downward poses.
   blade=[(x,y) for x,y in blade if 0<=(x-hilt[0])*ux+(y-hilt[1])*uy<=29 and abs((x-hilt[0])*nx+(y-hilt[1])*ny)<=1.1]
  pose_frames.append([index,round(hilt[0],2),round(hilt[1],2),round(ux,4),round(uy,4)])
  # The sword is held behind the head in shoulder poses. Preserve the opaque helmet
  # rather than painting a new blade connection across its surface.
  helmet={(x,y) for y in range(max(0,round(top-19)),min(fh,round(top))) for x in range(max(0,round(head_x-10)),min(fw,round(head_x+11))) if px[x,y][3]>240 and (x,y) not in blade}
  helmet_pixels.update((ox+x,oy+y) for x,y in helmet)
  def put(x,y,c):
   x=round(x);y=round(y)
   if 0<=x<fw and 0<=y<fh and (x,y) not in helmet and (x,y) not in gauntlets:patches[(ox+x,oy+y)]=c
  for x,y in blade:put(x,y,PALE if px[x,y][:3]==(201,201,201) else STEEL)
  # Continue the blade all the way to the guard instead of leaving the original shoulder-to-hand gap.
  reach=math.dist(hilt,tip)
  for d in range(1,math.ceil(reach)+1):
   width=1 if d<reach-2 else 0
   for side in range(-width,width+1):put(hilt[0]+ux*d+nx*side,hilt[1]+uy*d+ny*side,(PALE if side==0 else 0x668da4) if name in ('shrine','shrine_turn','shrine_weapon') else PALE if side<=0 else STEEL)
  if name in ('shrine','shrine_turn','shrine_weapon'):
   # A connected three-pixel raster edge prevents pinholes and uneven diagonal blade clusters.
   raster=Image.new('RGBA',(fw,fh));rd=ImageDraw.Draw(raster)
   a=(round(hilt[0]+ux),round(hilt[1]+uy));b=(round(tip[0]),round(tip[1]))
   rd.line([a,b],fill=(102,141,164,255),width=3);rd.line([a,b],fill=(229,239,255,255),width=1)
   rp=raster.load()
   for yy in range(fh):
    for xx in range(fw):
     if rp[xx,yy][3]:r,g,b,_=rp[xx,yy];put(xx,yy,(r<<16)|(g<<8)|b)
  # Deep blue grip, flared purple wing guard, gold jewel and pommel.
  for d in range(2,8):
   for side in (-1,0,1):put(hilt[0]-ux*d+nx*side,hilt[1]-uy*d+ny*side,INK if side else PURPLE)
  for side in range(-5,6):
   forward=max(0,abs(side)-2)*.5
   gx=hilt[0]-ux+nx*side+ux*forward;gy=hilt[1]-uy+ny*side+uy*forward
   put(gx,gy,BLUE if abs(side)>2 else PURPLE);put(gx-ux,gy-uy,INK)
  put(hilt[0],hilt[1],GOLD);put(hilt[0]-ux*7,hilt[1]-uy*7,BLUE)
  # The blade meets the guard without a floating ornament.
  found+=1
 helmets['hk_'+name]=sorted(helmet_pixels)
 poses['hk_'+name]=pose_frames
 hands['hk_'+name]=hand_frames
 result['hk_'+name]=[[x,y,c] for (x,y),c in sorted(patches.items())];counts[name]=found
(ROOT/'src/fighters/masterSwordPatches.js').write_text('// Generated by tools/sprites/hylian_master_sword.py. Coordinates are confined to each original frame.\nexport const MASTER_SWORD_PATCHES='+json.dumps(result,separators=(',',':'))+';\nexport const MASTER_SWORD_HAND_ANCHORS='+json.dumps(hands,separators=(',',':'))+';\nexport const MASTER_SWORD_POSES='+json.dumps(poses,separators=(',',':'))+';\nexport const MASTER_SWORD_HELMET_MASKS='+json.dumps(helmets,separators=(',',':'))+';\n')
print('Master Sword frames by strip:',counts)
print('Patch file bytes:',(ROOT/'src/fighters/masterSwordPatches.js').stat().st_size)
