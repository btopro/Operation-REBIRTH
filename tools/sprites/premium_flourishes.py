"""Two cosmetic animations per premium skin, authored on its existing drawing and rig."""
from pathlib import Path
import sys,os,ast,json,math
import numpy as np
from PIL import Image,ImageDraw
sys.path.insert(0,str(Path(__file__).parent))
import shop_costumes as S,soul_summoner_moves as SS,mr_wake_moves as MW,mw_rig,hero_knight_moves as H
from puppet import animate,save_atlas
ROOT=Path(__file__).resolve().parents[2];DATA={}
def cycle_life(fn,length):
 return lambda pose,t:fn(pose,(1-math.cos(t*math.pi*2/length))*14)
def export(fighter,name,folder,key,frames,origin,labels):
 path=ROOT/'public/assets/fighters'/fighter/folder/'cosmetics_sheet.png';idx=save_atlas(frames,str(path))
 sample=next(iter(frames.values()))[0]
 DATA[fighter+':'+name]={'key':key,'path':'assets/fighters/'+fighter+'/'+folder+'/cosmetics_sheet.png','width':sample.shape[1],'height':sample.shape[0],'origin':origin,'flourish':idx['flourish']+[2],'taunt':idx['taunt']+[2],'idle':idx['idle']+[2],'labels':labels}
 native=(150,90,15,25) if fighter=='hero-knight' else (64,64,56,48) if fighter=='mr-wake' else (64,64,24,36)
 nw,nh,ox,oy=native;native_frames=[f[oy:oy+nh,ox:ox+nw].copy() for f in frames['idle']]
 save_atlas({'idle':native_frames},str(path.with_name('custom_idle_sheet.png')))
 DATA[fighter+':'+name].update(idleKey=key+'_idle',idlePath='assets/fighters/'+fighter+'/'+folder+'/custom_idle_sheet.png',idleWidth=nw,idleHeight=nh,idleOrigin=[(origin[0]*sample.shape[1]-ox)/nw,(origin[1]*sample.shape[0]-oy)/nh])
 print(name,[(n,len(f))for n,f in frames.items()])
# Reuse Orrery's authored clockwork parts and astrolabe attachment.
p=ROOT/'tools/sprites/orrery_costume.py';src=p.read_text();exec(compile(src[:src.index("S.build_ss('orrery')")],str(p),'exec'),{'__file__':str(p)})
real_ss=SS.build
B=SS.B;k=SS.k
ss_idle=[k(0,SS.REST),k(14,B(lean=-3,head=12,fa=-22,ff=-55,cape=-5),'out'),k(36,B(lean=-3,head=16,fa=-24,ff=-60,cape=-5)),k(52,B(lean=-1,head=8,fa=-12,ff=-25)),k(72,SS.REST)]
ss_taunt=[k(0,SS.REST),k(12,B(lean=-5,head=-12,fa=-55,ff=-90,ba=100,bf=80),'out'),k(24,B(lean=-7,head=-16,fa=-60,ff=-100,ba=110,bf=60)),k(42,B(lean=-5,head=-10,fa=-42,ff=-65,ba=100,bf=100)),k(58,B(lean=7,head=14,fa=10,ff=-20,cape=8)),k(80,SS.REST)]
def build_ss_extras():
 idle=[SS.k(0,SS.REST),SS.k(24,SS.B(lean=-1,head=3,cape=4,flame=SS.FL(1.06))),SS.k(48,SS.B(head=-1,cape=1,flame=SS.FL(.96))),SS.k(72,SS.B(lean=1,head=-3,cape=-3,flame=SS.FL(1.03))),SS.k(96,SS.REST)]
 frames={'flourish':animate(SS.BIG,ss_idle,72,step=2,life=SS.life),'taunt':animate(SS.BIG,ss_taunt,80,step=2,life=SS.life),'idle':animate(SS.BIG,idle,96,step=2,life=cycle_life(SS.life,96))}
 export('soul-summoner','ORRERY','orrery','ss_orrery_cosmetics',frames,[56/112,95/104],['TIMEPIECE INSPECTION','WIND THE HEAVENS']);return {}
SS.build=build_ss_extras
try:S.build_ss('orrery')
finally:SS.build=real_ss
# The Choir callback keeps its mask, lantern staff, embroidery and collar on their authored parents.
p=ROOT/'tools/sprites/prism_and_choir.py';tree=ast.parse(p.read_text());ns={'S':S,'K':S.K,'np':np,'Image':Image,'ImageDraw':ImageDraw}
for node in tree.body:
 if isinstance(node,ast.FunctionDef) and node.name in ['paint','embroidery','choir']:exec(compile(ast.Module(body=[node],type_ignores=[]),str(p),'exec'),ns)
S.MW_LOOKS['choir']=(ns['choir'],{'robe':{'to':194,'sat':.75,'val':.62},'cloth':{'to':207,'sat':.65,'val':.7},'magic':{'to':166,'sat':.6,'val':1.25},'wood':{'to':40,'sat':.5,'val':1.2}})
B=MW.B;k=MW.k;staff=MW.S
mw_idle=[k(0,MW.REST),k(12,B(lean=-2,head=-15,fa=25,ff=-10,staff=staff(-120)),'out'),k(36,B(lean=-3,head=-20,fa=30,ff=-15,staff=staff(-115))),k(56,B(lean=-1,head=-8,fa=20,ff=-5,staff=staff(-130))),k(72,MW.REST)]
mw_taunt=[k(0,MW.REST),k(10,B(lean=-4,head=-8,fa=-45,ff=-70,staff=staff(-70)),'out'),k(22,B(lean=3,head=6,fa=15,ff=-10,staff=staff(-115))),k(34,B(lean=-4,head=-10,fa=-42,ff=-70,staff=staff(-75))),k(46,B(lean=4,head=8,fa=20,ff=-5,staff=staff(-120))),k(57,B(lean=-3,head=-6,fa=-45,ff=-70,staff=staff(-70))),k(68,B(lean=12,head=15,fa=35,ff=10,staff=staff(-95))),k(82,MW.REST)]
real_mw=MW.build
def build_mw_extras(*args,**kwargs):
 _,big,_,_=mw_rig.build_rig();idle=[MW.k(0,MW.REST),MW.k(24,MW.B(lean=-1,head=-4,cape=4)),MW.k(48,MW.B(head=-1,cape=1)),MW.k(72,MW.B(lean=1,head=3,cape=-3)),MW.k(96,MW.REST)]
 frames={'flourish':animate(big,mw_idle,72,step=2,life=MW.life),'taunt':animate(big,mw_taunt,82,step=2,life=MW.life),'idle':animate(big,idle,96,step=2,life=cycle_life(MW.life,96))}
 export('mr-wake','ABYSSAL CHOIR','choir','wake_choir_cosmetics',frames,[92/176,109/120],['LISTEN TO THE DEEP','THREE-BELL CONDUCTING']);return {},{}
MW.build=build_mw_extras
try:S.build_mw('choir')
finally:MW.build=real_mw
# Lacy's source cels already carry the tracked diadem and glass fan-cloak.
C=H.Costume('prism');saved=dict(H.MOVES)
H.MOVES['flourish']=(72,[H.K(0,'idle',0),H.K(12,'guard',0,(-3,0,0)),H.K(30,'attack1',0,(-2,0,0)),H.K(48,'guard',0,(2,0,0)),H.K(72,'idle',0)],H.FEET,None)
H.MOVES['cosmetic_taunt']=(66,[H.K(0,'idle',0),H.K(12,'guard',0,(0,0,-2)),H.K(25,'jump',1,(0,0,-9)),H.K(39,'jump',1,(0,0,-9)),H.K(52,'guard',0,(4,0,-1)),H.K(66,'idle',0)],H.FEET,None)
H.MOVES['cosmetic_idle']=(120,[H.K(t,'idle',min(10,int(t/120*11)),(0,0,-2*math.sin(t*math.pi/120)**2)) for t in range(0,120,10)]+[H.K(120,'idle',0)],H.FEET,None)
try:frames={'flourish':H.render_move(C,'flourish'),'taunt':H.render_move(C,'cosmetic_taunt'),'idle':H.render_move(C,'cosmetic_idle')}
finally:H.MOVES.clear();H.MOVES.update(saved)
export('hero-knight','PRISM REGENT','prism','hk_prism_cosmetics',frames,[81/180,111/140],['PRISMATIC BLADE APPRAISAL','CRYSTAL LEVITATION SALUTE'])
(ROOT/'src/fighters/premiumAnimsData.js').write_text('// Generated by tools/sprites/premium_flourishes.py\nexport const PREMIUM_ANIMS='+json.dumps(DATA,separators=(',',':'))+';\n')
