"""Hand-animated shrine insertion: one sword attached to both hands, then an empty-handed release.
Arm segments always have the same nine-pixel length as the repaired counter rig.
"""
from PIL import Image,ImageDraw
from pathlib import Path
from lacy_pose_rig import clean_body,arms,gloves
import json,math
ROOT=Path(__file__).resolve().parents[2];BASE=ROOT/'public/assets/fighters/hero-knight'
def shrine_pose(i):
 k=min(1,i/19);k=k*k*(3-2*k);h=(77,49+8*k);tip=(77,h[1]+28);hands=[(77,h[1]-3),(77,h[1]-7)]
 return h,tip,(0,1),hands

def shrine_turn_pose(i):
 k=min(1,i/11);k=k*k*(3-2*k);a=math.radians(-74+164*k);u=(math.cos(a),math.sin(a));h=(77,49)
 return h,(h[0]+u[0]*28,h[1]+u[1]*28),u,[(h[0]-u[0]*d,h[1]-u[1]*d) for d in (3,7)]

def sword(frame,h,u=(0,1)):
 d=ImageDraw.Draw(frame);nx,ny=-u[1],u[0]
 def p(distance,side=0):return(round(h[0]+u[0]*distance+nx*side),round(h[1]+u[1]*distance+ny*side))
 d.polygon([p(0,-1),p(25,-1),p(28),p(25,1),p(0,1)],fill=(201,201,201));d.line([p(2,1),p(23,1)],fill=(194,194,194))
 d.line([p(-10),p(-1)],fill=(50,59,66),width=3);d.line([p(0,-6),p(0,6)],fill=(146,156,160),width=2)
 return frame

def tidy(frame):
 # Remove isolated one/two-pixel remnants, keeping all connected character and weapon detail.
 p=frame.load();pts={(x,y) for y in range(frame.height) for x in range(frame.width) if p[x,y][3]>0}
 while pts:
  first=pts.pop();todo=[first];group=[first]
  while todo:
   x,y=todo.pop()
   for dx in (-1,0,1):
    for dy in (-1,0,1):
     q=(x+dx,y+dy)
     if q in pts:pts.remove(q);todo.append(q);group.append(q)
  if len(group)<=2:
   for x,y in group:p[x,y]=(0,0,0,0)
 return frame

def generate():
 orig=Image.open(BASE/'idle_u_sheet.png').convert('RGBA').crop((0,0,150,90));body=clean_body(orig)
 out=Image.new('RGBA',(150*20,90));release=Image.new('RGBA',(150*10,90));hand_layer=Image.new('RGBA',(150*10,90));metadata=[];turns=[]
 turn=Image.new('RGBA',(150*12,90))
 for i in range(12):
  h,tip,u,hands=shrine_turn_pose(i);f=body.copy();joints=arms(f,hands);sword(f,h,u);gloves(f,hands);turn.alpha_composite(tidy(f),(i*150,0));turns.append({'hilt':h,'tip':tip,'hands':hands,'joints':joints})
 turn.save(BASE/'shrine_turn_sheet.png')
 for i in range(20):
  h,tip,u,hands=shrine_pose(i);f=body.copy();joints=arms(f,hands);sword(f,h);gloves(f,hands);out.alpha_composite(tidy(f),(i*150,0));metadata.append({'hilt':h,'tip':tip,'hands':hands,'joints':joints})
 for i in range(10):
  k=i/9;k=k*k*(3-2*k);hands=[(77-4*k,54+11*k),(77-18*k,50+17*k)];f=body.copy();arms(f,hands);gloves(f,hands);release.alpha_composite(tidy(f),(i*150,0));g=Image.new('RGBA',(150,90));gloves(g,hands);hand_layer.alpha_composite(g,(i*150,0))
 weapon=Image.new('RGBA',(150,90));sword(weapon,shrine_pose(19)[0]);weapon.save(BASE/'shrine_weapon_sheet.png')
 out.save(BASE/'shrine_sheet.png');release.save(BASE/'shrine_release_u_sheet.png');hand_layer.save(BASE/'shrine_hands_u_sheet.png')
 (ROOT/'src/fighters/lacyShrineRig.js').write_text('// Sword and hands share the same source-frame coordinates.\nexport const LACY_SHRINE_RIG='+json.dumps(metadata,separators=(',',':'))+';\nexport const LACY_SHRINE_TURN_RIG='+json.dumps(turns,separators=(',',':'))+';\n')
 print('20 insertion cels, 10 release cels and one matching resting weapon exported.')
if __name__=='__main__':generate()
