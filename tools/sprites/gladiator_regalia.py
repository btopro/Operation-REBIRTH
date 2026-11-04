"""Recolor existing cels, fasten a torn cape, and export a native 64px atlas.
One native pixel renders as exactly 3 world pixels. Spectral departure reuses the kneeling silhouette.
"""
from PIL import Image,ImageDraw
from pathlib import Path
import colorsys,json
from gladiator_soul_sword import replace_axe,draw_sword
ROOT=Path(__file__).resolve().parents[2];eyes={};swords={}
GOLD=[(55,28,13),(93,47,15),(145,83,21),(195,132,34),(233,182,66),(255,224,126)]
RED=[(25,8,16),(45,10,19),(68,14,25),(92,19,31),(119,27,38),(148,39,47)]
for name,dest,key,rows in [('walk','gladiator-aligned.png','spirit_gladiator',2),('attack','gladiator-attack-aligned.png','gladiator_attack',2),('kneel','gladiator-kneel.png','gladiator_kneel',1)]:
 src=Image.open(ROOT/'tools/sprites/source/gladiator'/f'{name}.png').convert('RGBA');out=Image.new('RGBA',(256,64*rows));anchors=[];weapon_anchors=[]
 for i in range(4*rows):
  source_i=i%4 if name=='walk' else 1 if name=='kneel' and i>=2 else i
  f=src.crop((source_i%4*192,source_i//4*160,source_i%4*192+192,source_i//4*160+160));p=f.load()
  candidates=[]
  for y in range(25,112):
   for x in range(66,140):
    r,g,b,a=p[x,y];h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
    if a>180 and .45<h<.58 and s>.55 and v>.6:candidates.append((x,y))
  # Tiny cyan eye clusters are nearest the helmet, above the ribs.
  if candidates:
   top=min(y for x,y in candidates);cluster=[(x,y) for x,y in candidates if y<=top+3]
   ex=round(sum(x for x,y in cluster)/len(cluster));ey=round(sum(y for x,y in cluster)/len(cluster))
  else:ex,ey=111,83
  if name=='attack':ex,ey=[(125,86),(119,78),(101,71),(125,87),(106,75),(125,101),(107,116),(117,71)][i]
  f,guard,tip,hands=replace_axe(f,name,source_i);p=f.load()
  # A shoulder-fastened cloth silhouette sits behind the original bones and weapon.
  cape=Image.new('RGBA',f.size);d=ImageDraw.Draw(cape);ax,ay=ex-18,ey+10
  floor=151;tail=min(floor-2,ay+64);flutter=(i%4-1)*2
  d.polygon([(ax,ay),(ax+8,ay+5),(ax-8,tail-7),(ax-16,tail-3),(ax-15,tail-14),(ax-28,tail+flutter),(ax-25,tail-16),(ax-38,tail-6),(ax-24,ay+29)],fill=(40,8,16,255))
  d.polygon([(ax,ay+4),(ax-10,ay+25),(ax-30,tail-10),(ax-15,tail-17),(ax-14,tail-8),(ax-4,tail-12),(ax+5,ay+9)],fill=(82,15,27,255))
  d.line([(ax-1,ay+8),(ax-14,tail-20)],fill=(120,26,39,255),width=2)
  for y in range(160):
   for x in range(192):
    r,g,b,a=p[x,y]
    if not a:continue
    h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
    if .64<h<.94 and s>.2:p[x,y]=(*RED[min(5,int(v*6))],a)
    elif .035<h<.17 and s>.23:p[x,y]=(*GOLD[min(5,int(v*6))],a)
    if abs(x-ex)<=4 and abs(y-ey)<=3 and .42<h<.62 and s>.3:p[x,y]=(255,44,37,a)
  cape.alpha_composite(f);d=ImageDraw.Draw(cape);d.rectangle((ax,ay,ax+3,ay+2),fill=(239,185,64,255))
  cape=draw_sword(cape,guard,tip,hands)
  weapon_anchors.append([round(guard[0]/3),round(guard[1]*53/160)+9,round(tip[0]/3),round(tip[1]*53/160)+9])
  # Keep identical native scale and feet row 60 in every atlas, including the kneeling pose.
  small=cape.resize((64,53),Image.Resampling.NEAREST);frame=Image.new('RGBA',(64,64));frame.alpha_composite(small,(0,9))
  # Ensure the one-pixel eye survives nearest sampling.
  nx,ny=round(ex/3),round(ey*53/160)+9;ImageDraw.Draw(frame).point((nx,ny),fill=(255,57,38,255))
  out.alpha_composite(frame,(i%4*64,i//4*64));anchors.append([nx,ny])
 out.save(ROOT/'src'/dest);eyes[key]=anchors;swords[key]=weapon_anchors
(ROOT/'src/fighters/gladiatorEyes.js').write_text('// Generated native 64px eye anchors.\nexport const GLADIATOR_EYES='+json.dumps(eyes,separators=(',',':'))+';\nexport const GLADIATOR_SWORDS='+json.dumps(swords,separators=(',',':'))+';\n')
print('Gold armor, dark red cloth, torn shoulder cape and red eyes exported on 64px cells.')
