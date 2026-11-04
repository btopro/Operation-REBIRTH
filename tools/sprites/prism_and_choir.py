"""Premium costume drawings on the existing animation rigs; no combat changes."""
from pathlib import Path
import sys,os,math
import numpy as np
from PIL import Image,ImageDraw
sys.path.insert(0,str(Path(__file__).parent))
import shop_costumes as S,hero_knight_moves as H
from puppet import save_atlas
K=S.K
# LACY: cut-glass armour with gold leading, a crystal diadem and a spectral blade.
def facet(dx,dy,v,inside):
 ramps=[[(22,29,60),(50,76,112),(116,198,209),(211,255,241)],[(40,22,66),(94,54,129),(192,133,222),(255,225,247)],[(23,35,66),(62,76,142),(143,174,245),(232,239,255)]]
 col=ramps[((dx//5)+(dy//7))%3]
 if inside and ((dx+dy)%11==0 or dy%13==0):return (214,185,113)
 return tuple(K.ramp_pick([int('%02x%02x%02x'%c,16) for c in col],v,.08,.6).to_bytes(3,'big'))
CROWN_TRACKS=[]
def tracked_crown(out,frame,anchor,helpers):
 from scipy.ndimage import label
 a=np.array(frame);rgb=a[...,:3].astype(float)/255;v=rgb.max(2);sat=(v-rgb.min(2))/np.maximum(v,.001)
 x,y=anchor;yy,xx=np.mgrid[:a.shape[0],:a.shape[1]]
 m=(a[...,3]==255)&(sat<.16)&(v>.17)&(v<.92)&(abs(xx-x)<17)&(yy>y-23)&(yy<y+1)
 labs,n=label(m,np.ones((3,3)));best=None
 for i in range(1,n+1):
  ys,xs=np.nonzero(labs==i)
  if len(xs)<4:continue
  cx,cy=xs.mean(),ys.mean();score=((cx-x-1)**2+(cy-y+7)**2)**.5-.25*len(xs)**.5
  if best is None or score<best[0]:best=(score,xs,ys,cx,cy)
 if best is None:return
 _,xs,ys,cx,cy=best
 weights=np.exp(-((xs-x-1)**2+(ys-y+6)**2)/24)
 cx=float(np.sum(xs*weights)/weights.sum());cy=float(np.sum(ys*weights)/weights.sum())
 keep=weights>weights.max()*.3;xs=xs[keep];ys=ys[keep]
 normal=np.array([cx-x,cy-y]);normal=normal/max(1,np.linalg.norm(normal))
 if normal[1]>-.35:normal=np.array([0.,-1.])
 across=np.array([-normal[1],normal[0]])
 proj=(xs-cx)*normal[0]+(ys-cy)*normal[1];base=np.array([cx,cy])+normal*(proj.max()-1)
 def point(u,v):return tuple(np.round(base+across*u+normal*v).astype(int))
 d=ImageDraw.Draw(out)
 # The band overlaps the actual helmet ridge, and the whole diadem shares its tilt.
 d.polygon([point(-5,-1),point(5,-1),point(5,1),point(-5,1)],fill='#d6be87')
 for off,h in [(-4,3),(-2,5),(0,7),(2,5),(4,3)]:
  d.polygon([point(off-1,1),point(off,h),point(off+1,1)],fill='#9dd7e6',outline='#ddfff2')
 assert min(np.hypot(xs-base[0],ys-base[1]))<3.5,'crown must contact helmet ridge'
 CROWN_TRACKS.append((float(base[0]),float(base[1]),float(math.degrees(math.atan2(normal[0],-normal[1])))))
S.HK_LOOKS['prism']=dict(plate=facet,cloth=[(16,20,48),(44,43,83)],scarf=[(77,62,128),(151,159,219),(219,249,245)],helm=[(22,28,58),(61,80,117),(131,192,207),(226,251,239)],glove=[(34,35,66),(79,86,129),(165,195,215),(237,255,246)],blade=lambda pos,v: [(136,230,226),(211,172,238),(234,237,255)][(pos[0]+pos[1])//6%3],swipe=(188,239,255),crown=None,hair=lambda v:(round(225*v),round(238*v),round(255*v)),glow=(167,229,248,115))
# A real glass fan-cloak changes the silhouette; it is drawn behind her body in every source cel.
base_hk=S.hk_look
def prism_frame(frame,helpers,look,fallback=None):
 out=base_hk(frame,helpers,look,fallback)
 a=helpers['anchor'](frame) or fallback
 if not a:return out
 x,y=round(a[0]),round(a[1]);back=Image.new('RGBA',frame.size);d=ImageDraw.Draw(back)
 pts=[(x-3,y+4),(x-12,y+9),(x-23,y+25),(x-15,y+32),(x-4,y+23),(x+1,y+8)]
 d.polygon(pts,fill='#294161',outline='#e2cb92')
 for triangle,col in [([(x-3,y+5),(x-12,y+10),(x-22,y+24)],'#a0d6e6'), ([(x-3,y+5),(x-22,y+24),(x-15,y+31)],'#7a68b4'), ([(x-3,y+5),(x-15,y+31),(x-5,y+23)],'#69b9ba')]:
  d.polygon(triangle,fill=col,outline='#4c6680')
 d.line([(x-12,y+11),(x-9,y+23),(x-15,y+30)],fill='#e7dbaa')
 d.line([(x-20,y+23),(x-8,y+20)],fill='#dcf9fa')
 back.alpha_composite(out)
 tracked_crown(back,frame,a,helpers)
 return back
S.hk_look=prism_frame
base_helpers=S.hk_helpers
S.hk_helpers=lambda:{**base_helpers(),'STRIPS':base_helpers()['STRIPS']+['counter']}
S.build_hk('prism')
S.hk_helpers=base_helpers
S.hk_look=base_hk
C=H.Costume('prism');save_atlas({n:H.render_move(C,n) for n in H.MOVES},os.path.join(C.dir,'moves_sheet.png'))
# MR WAKE: abyssal chapel robes, a metal reliquary mask and a suspended lantern bell.
def paint(lay,fn):
 im=Image.fromarray(lay);fn(ImageDraw.Draw(im));lay[:]=np.array(im)
def embroidery(orig,out):
 ys,xs=np.nonzero(orig[...,3]>0)
 for x,y in zip(xs,ys):
  h,s,v=K._rgb2hsv(*(int(c) for c in orig[y,x,:3]))
  if 325<=h<=350 and s>.4:
   if (x+2*y)%17==0:out[y,x,:3]=(111,223,211)
   elif y>36 and x%7==0:out[y,x,:3]=(175,148,97)
def choir(N,L):
 for n in N:embroidery(L[n],N[n])
 def helm(d):
  d.polygon([(29,12),(31,4),(35,7),(38,0),(41,7),(46,4),(47,13),(44,21),(36,23),(30,19)],fill='#182c3b',outline='#bcb48b')
  d.polygon([(32,12),(38,4),(44,12),(43,19),(37,21),(32,18)],fill='#41676c')
  d.line([(38,4),(38,21)],fill='#dbd9ab')
  for x in [34,37,41]:d.rectangle((x,12,x,17),fill='#a7fff0')
  d.line([(31,9),(29,5)],fill='#759595');d.line([(45,9),(48,6)],fill='#759595')
 paint(N['head'],helm)
 def lantern(d):
  d.rectangle((9,7,19,22),fill='#112937',outline='#c4b881');d.polygon([(8,8),(14,2),(20,8)],fill='#426d74',outline='#d9cf9b')
  d.rectangle((12,10,16,19),fill='#73e8d7');d.line([(14,10),(14,19)],fill='#e0ffdd');d.line([(9,22),(19,22)],fill='#f5dba0')
  for x in [10,14,18]:d.line([(x,23),(x,28+(x%3))],fill='#b1a276');d.point((x,29+(x%3)),fill='#8cf4db')
 paint(N['staff'],lantern)
 collar=S.blank()
 paint(collar,lambda d:d.polygon([(23,16),(31,20),(38,25),(45,20),(53,16),(49,28),(40,31),(29,27)],fill='#173b48',outline='#a59b71'))
 for n in ['bskirt','fskirt','cape']:
  if n in N:
   ys,xs=np.nonzero(N[n][...,3]>0)
   for x,y in zip(xs,ys):
    if y>43 and (x+y)%13==0:N[n][y,x,:3]=(173,227,206)
 return [('choir_collar',collar,'torso',(38,23),10.5)],{'choir_collar'},embroidery
S.MW_LOOKS['choir']=(choir,{'robe':{'to':194,'sat':.75,'val':.62},'cloth':{'to':207,'sat':.65,'val':.7},'magic':{'to':166,'sat':.6,'val':1.25},'wood':{'to':40,'sat':.5,'val':1.2}})
S.build_mw('choir')
print('PRISM REGENT and ABYSSAL CHOIR exported. Tracked crowns:',len(CROWN_TRACKS),'head tilt range:',round(min(t[2] for t in CROWN_TRACKS)),round(max(t[2] for t in CROWN_TRACKS)))
