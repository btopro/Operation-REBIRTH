"""ORRERY: brass astronomical armour, clockwork crown, glass cloak and pendulum soul vessel."""
import sys,math
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
sys.path.insert(0,str(Path(__file__).parent))
import shop_costumes as S
K=S.K
G=['#22272d','#65543b','#ac8046','#e0ba6d','#fff0b7']
def painted(layer,fn):
 im=Image.fromarray(layer);fn(ImageDraw.Draw(im));layer[:]=np.array(im)
def dial(d,x,y,r):
 d.ellipse((x-r,y-r,x+r,y+r),fill=G[0],outline=G[3]);d.ellipse((x-r+2,y-r+2,x+r-2,y+r-2),fill='#173b42',outline=G[1])
 for i in range(8):
  a=i*math.pi/4;d.point((round(x+math.cos(a)*(r-1)),round(y+math.sin(a)*(r-1))),fill=G[4])
 d.line([(x,y),(x,y-r+2)],fill=G[4]);d.line([(x,y),(x+r-2,y+1)],fill=G[3]);d.point((x,y),fill='#ffffff')
def glass(orig,out):
 m=S.ss_cape_mask(orig);ys,xs=np.nonzero(m)
 ramps=[(19,61,68),(31,100,108),(67,163,151),(146,223,186)]
 for x,y in zip(xs,ys):
  # Dark lead framework encloses translucent jewel panels, with warm brass seams.
  seam=(x+y//3)%9==0 or y%11==0
  c=(185,141,72) if seam else ramps[((x//6+y//9)%3)+1 if (x+y)%7==0 else (x//8+y//12)%3]
  out[y,x,:3]=c
  if not seam and (x*7+y*13)%47==0:out[y,x,:3]=(242,245,202)
def edit(N,L):
 for n in N:glass(L[n],N[n])
 # Replace crown with a toothed brass clock tower. Indigo face and luminous eyes remain inside its case.
 def head(d):
  d.rectangle((26,1,40,7),fill=G[1]);d.rectangle((27,2,39,7),fill=G[2]);d.line([(27,2),(39,2)],fill=G[4])
  for x in [26,30,34,38]:d.rectangle((x,0,x+1,3),fill=G[3])
  dial(d,33,6,4);d.rectangle((30,11,37,14),fill='#132e36');d.point((31,12),fill='#b3ffe6');d.point((36,12),fill='#b3ffe6')
 painted(N['head'],head)
 def chest(d):
  d.polygon([(29,22),(37,22),(40,33),(33,38),(27,33)],fill=G[1],outline=G[3]);dial(d,33,28,5)
  d.line([(30,35),(32,40),(34,35)],fill=G[2]);d.point((33,37),fill=G[4])
 painted(N['torso'],chest)
 # Articulated clockwork knees and cuffs are part of the puppet, never fixed screen overlays.
 for name in ['fshin','bshin','ffore','bfore']:
  if name not in N:continue
  ys,xs=np.nonzero(N[name][...,3]>0)
  if len(xs):
   x,y=int(np.median(xs)),int(np.median(ys));painted(N[name],lambda d,x=x,y=y:dial(d,x,y,2))
 halo=S.blank()
 def sphere(d):
  d.ellipse((19,0,47,24),outline=G[2]);d.ellipse((21,2,45,22),outline=G[4]);d.arc((18,7,48,17),0,340,fill='#74c7b4')
  for x,y in [(20,10),(43,5),(44,18),(24,21)]:d.rectangle((x-1,y-1,x+1,y+1),fill=G[3]);d.point((x,y),fill=G[4])
 painted(halo,sphere)
 # The soul flame becomes a cut-glass time capsule with a gold spindle.
 for name in ['flame']:
  if name in N:
   ys,xs=np.nonzero(N[name][...,3]>0)
   if len(xs):
    x,y=int(np.median(xs)),int(np.median(ys));painted(N[name],lambda d:d.polygon([(x,y-6),(x+4,y),(x,y+6),(x-4,y)],fill='#8cead3',outline=G[3]))
 return [('astrolabe',halo,'head',(33,12),-1)],{'astrolabe'},glass
S.SS_LOOKS['orrery']=(edit,{'armor':{'to':185,'sat':.6,'val':.8},'gold':{'to':39,'sat':.85,'val':1.15},'cape':{'to':174,'sat':.9,'val':.8},'flame':{'to':165,'sat':.6,'val':1.3},'eyes':{'to':160,'sat':.45,'val':1.3}},(150,238,206))
S.build_ss('orrery')
print('ORRERY: full costume and all animation strips exported.')
