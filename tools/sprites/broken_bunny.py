"""BROKEN BUNNY: part-authored analog-horror rabbit costume on Rosemary's animation rig."""
import os,sys,copy
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
sys.path.insert(0,str(Path(__file__).parent))
import last_seen_draw as D,last_seen_moves as M,nu_moves as N
root=Path(__file__).resolve().parents[2];dest=root/'public/assets/fighters/last-seen/bunny'
base_draw=D.draw_parts
V=copy.deepcopy(D.VARIANTS['scrap'])
V.update(FUR=(0xb2f4e4,0x69baa9,0x397c79,0x235353,0x102d31),FURD=(0x8cc8b7,0x57918a,0x356962,0x244b47,0x0d2827),BEAK=(0xddd7b8,0xaaa98e,0x737c70,0x474f4b,0x1a2826),TIE=(0x765088,0x37253d),CREST=None)
D.VARIANTS['bunny']=V
def layer(draw):
 im=Image.new('RGBA',(64,64));draw(ImageDraw.Draw(im));return np.array(im)
def rabbit_head(d):
 # Unequal ears with exposed hinge and separated shell: far ear breaks halfway.
 d.polygon([(27,9),(25,1),(28,0),(32,8)],fill='#245456');d.line([(28,2),(30,8)],fill='#9ad6c5',width=2)
 d.polygon([(34,8),(35,0),(39,0),(39,5),(37,8)],fill='#437e78');d.rectangle((36,1,37,4),fill='#24343a');d.line([(37,5),(36,9)],fill='#aba991')
 d.polygon([(27,8),(33,6),(39,8),(43,13),(43,19),(38,23),(30,22),(26,18)],fill='#17353a')
 d.polygon([(28,9),(33,7),(38,9),(41,13),(40,19),(36,21),(29,19),(27,15)],fill='#4f9390')
 d.line([(28,10),(32,8),(36,9)],fill='#a6d5bd',width=1)
 # Black oval sockets with tiny off-centre eyes and a split grinning muzzle.
 d.ellipse((28,11,33,17),fill='#061014');d.ellipse((35,10,40,17),fill='#081217')
 d.point((31,14),fill='#fffde5');d.point((37,12),fill='#e9faeb')
 d.rectangle((31,18,41,22),fill='#c7c4a3');d.polygon([(33,18),(36,17),(37,19),(34,20)],fill='#101820')
 d.line([(31,21),(41,20)],fill='#102326');d.line([(29,18),(28,20),(30,22)],fill='#15272b')
 d.line([(39,7),(37,9),(39,11)],fill='#0c2429');d.point((40,10),fill='#b6b7a1')
 d.line([(27,19),(26,22),(28,24)],fill='#6a392b');d.point((29,23),fill='#b47c46')
def rabbit_jaw(d):
 d.polygon([(36,20),(44,19),(45,23),(42,27),(36,26),(33,23)],fill='#14282c')
 d.polygon([(35,23),(42,24),(44,21),(43,26),(37,28),(34,25)],fill='#73a39a')
 d.line([(37,24),(41,24)],fill='#eee5bd',width=1);d.line([(35,23),(35,25)],fill='#818278')
def parts():
 p=base_draw();wrong=D.STYLE=='wrong'
 if not wrong:
  # A wearable shell, not an animatronic body: keep her coat, limbs, boots and missing poster.
  mask=layer(rabbit_head)
  mask[22:]=0
  im=Image.fromarray(p['head']);im.alpha_composite(Image.fromarray(mask));d=ImageDraw.Draw(im)
  d.line([(25,14),(28,15)],fill='#302e3b',width=1) # elastic strap against her hair
  p['head']=np.array(im)
  hair=p['hair'].copy();hair[:22,29:]=0;p['hair']=hair
  return p
 p['head']=layer(rabbit_head);p['hair']=np.zeros((64,64,4),np.uint8);p['jaw']=layer(rabbit_jaw)
 # Apron, empty cavity, shoulder hinges and stripped cables, authored on torso layer.
 im=Image.fromarray(p['torso']);d=ImageDraw.Draw(im)
 d.polygon([(29,24),(36,24),(39,39),(30,42),(27,37)],fill='#a9b8a3')
 d.line([(29,25),(28,38),(31,40)],fill='#566c63');d.rectangle((31,27,36,36),fill='#101d22')
 for y in [28,32,35]:d.line([(32,y),(35,y+1)],fill='#798982')
 d.line([(33,34),(32,39),(34,44)],fill='#753732');d.line([(35,34),(37,38),(36,42)],fill='#78847f')
 d.rectangle((30,24,32,25),fill='#694d7e');d.rectangle((34,24,36,25),fill='#694d7e')
 d.point((33,25),fill='#c2b7a0');p['torso']=np.array(im)
 if not wrong:
  p['poster']=np.zeros((64,64,4),np.uint8)
  p['face']=np.zeros((64,64,4),np.uint8)
 return p
D.draw_parts=parts
D.set_style('calm');small,big=N.build_rig(D,M.FOLLOW);N.GHOST=(105,186,169)
N.build_all(small,big,M.CALM,str(dest),os.devnull,'LS_MOVES','broken_bunny.py',life_fn=M.calm_life,idle=M.calm_idle)
D.set_style('wrong');D.set_variant('bunny');small,big=N.build_rig(D,{**M.FOLLOW,**M.LOOSE});N.GHOST=(110,202,188)
J=((M.WJUMP,M.mix(M.WJUMP,head=(-38,0,0),bupper=(-80,0,0),ffist=(-30,0,0))),(M.WFALL,M.mix(M.WFALL,head=(-28,0,0),bupper=(-160,0,0),ffist=(-90,0,0))))
M.save_axe(str(dest/'wrong/axe.png'))
for noaxe in [False,True]:
 N.build_all(small,big,M.WRONG,str(dest/'wrong'/('noaxe' if noaxe else '')),os.devnull,'LS_WRONG_MOVES','broken_bunny.py',life_fn=M.unarmed(M.wrong_life) if noaxe else M.wrong_life,idle=M.wrong_idle,run=M.wrong_run,run_life=M.unarmed(M.run_life) if noaxe else M.run_life,jumps=J)
print('BROKEN BUNNY: both forms, all moves, and disarmed animations exported.')
