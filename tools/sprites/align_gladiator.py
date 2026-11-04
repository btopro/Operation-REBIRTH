"""Normalize imported gladiator cels to shared body/floor pivots.
Usage: python tools/sprites/align_gladiator.py WALK_ART ATTACK_ART
"""
from PIL import Image
from pathlib import Path
import sys,statistics
ROOT=Path(__file__).resolve().parents[2]/'src'
def align(path,cols,rows,walk=False):
 im=Image.open(path).convert('RGBA');out=Image.new('RGBA',(768,320))
 for i in range(cols*rows):
  f=im.crop((i%cols*im.width//cols,i//cols*im.height//rows,(i%cols+1)*im.width//cols,(i//cols+1)*im.height//rows))
  f.putalpha(f.getchannel('A').point(lambda a:255 if a>=180 else 0))
  if walk:
   box=f.getbbox();f=f.crop(box);f=f.resize((round(f.width*108/f.height),108),Image.Resampling.NEAREST)
  else:f=f.resize((192,160),Image.Resampling.NEAREST)
  p=f.load();h=f.height;w=f.width
  # Locate the dense central waistcloth below the ribs; ignore the trailing cape and cyan weapon.
  purple=[]
  for x in range(w):
   n=sum(1 for y in range(round(h*.53),round(h*.81)) if p[x,y][3] and p[x,y][2]>p[x,y][0]*1.1 and p[x,y][0]>p[x,y][1]*1.05 and p[x,y][2]>p[x,y][1]*1.2)
   if n>=6:purple.extend([x]*n)
  center=round(statistics.median(purple)) if purple else w//2
  feet=[y for y in range(round(h*.7),h) for x in range(max(0,center-32),min(w,center+33)) if p[x,y][3] and p[x,y][0]>=p[x,y][1]*.55 and p[x,y][0]>=p[x,y][2]*.6]
  floor=max(feet)+1 if feet else f.getbbox()[3]
  out.alpha_composite(f,(i%4*192+96-center,i//4*160+152-floor))
 out.save(ROOT/('gladiator-aligned.png' if walk else 'gladiator-attack-aligned.png'))
align(sys.argv[1],4,1,True);align(sys.argv[2],4,2)
