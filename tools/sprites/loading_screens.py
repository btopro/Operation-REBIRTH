"""Lore loading cards using existing fighter pixels and the supplied screen's native purple pixel style."""
from PIL import Image,ImageDraw,ImageFont
import os,math
ROOT=os.path.join(os.path.dirname(__file__),'../..');OUT=ROOT+'/public/assets/ui/loading';os.makedirs(OUT,exist_ok=True)
BG='#0b0912';DARK='#161121';MID='#292039';LIT='#554265';INK='#dfd3ee';font=ROOT+'/tools/sprites/art/PressStart2P.ttf'
def text(d,y,s,size=6,c=INK):
 f=ImageFont.truetype(font,size);w=d.textbbox((0,0),s,font=f)[2];d.text(((480-w)//2,y),s,font=f,fill=c)
def sprite(im,path,feet,at,sc=2,shadow=False):
 src=Image.open(ROOT+'/public/assets/fighters/'+path).convert('RGBA');fw,fh=(150,90) if 'hero-knight/' in path else (64,64);src=src.crop((0,0,fw,fh));src=src.resize((fw*sc,fh*sc),Image.Resampling.NEAREST)
 if shadow:shade=Image.new('RGBA',src.size,'#302338');shade.putalpha(src.getchannel('A'));src=shade
 im.alpha_composite(src,(int(at[0]-feet[0]*sc),int(at[1]-feet[1]*sc)))
def card(key,name,line,scene,path,feet):
 im=Image.new('RGBA',(480,270),BG);d=ImageDraw.Draw(im)
 d.rectangle((2,2,477,267),outline=MID,width=2);d.rectangle((5,5,474,264),outline=DARK)
 for x,y in [(28,49),(88,96),(174,67),(343,41),(412,105),(36,171),(447,165)]:d.rectangle((x,y,x+1,y+1),fill=MID)
 # Shared low-contrast drifting cloud bands and the original stepped floor.
 for x,y,w in [(15,75,73),(363,70,76),(0,165,60),(420,159,65)]:
  d.rectangle((x+7,y-7,x+w-8,y+13),fill=DARK);d.rectangle((x,y,x+w,y+9),fill=DARK)
 scene(im,d)
 d.rectangle((0,217,479,227),fill=DARK);d.rectangle((18,214,461,218),fill=MID);d.rectangle((30,211,449,213),fill=LIT)
 for x in [54,129,203,309,404]:d.rectangle((x,216,x+20,218),fill=LIT)
 sprite(im,path,feet,(240,211),2)
 d=ImageDraw.Draw(im);text(d,33,'LOADING...',20);text(d,68,name,8);text(d,232,line,5,'#a99bbd')
 im.resize((1440,810),Image.Resampling.NEAREST).convert('RGB').save(OUT+'/'+key+'.png')
def sanctum(im,d):
 for x in [38,100,350,412]:
  d.rectangle((x,101,x+20,210),fill=DARK);d.rectangle((x-3,98,x+23,104),fill=MID);d.rectangle((x+3,108,x+6,205),fill=MID)
 for x in range(136,345,13):d.line((x,97,x,183),fill=MID,width=2)
 d.polygon([(130,94),(155,81),(174,89),(193,78),(207,92),(233,84),(251,95),(276,83),(299,94),(323,84),(348,97)],fill=MID)
 for i,x in enumerate([58,91,365,403]):
  y=190+i%2*9;d.rectangle((x,y-15,x+10,y+19),fill=MID);d.line((x-3,y-7,x+13,y-7),fill=LIT,width=2)
  d.polygon([(x+2,y-26),(x+6,y-36),(x+8,y-25),(x+12,y-22),(x+5,y-18)],fill='#42647c')
def deep(im,d):
 d.rectangle((12,111,467,126),fill=MID)
 for x in [28,137,327,436]:
  d.rectangle((x,126,x+15,212),fill=DARK);d.rectangle((x+2,126,x+4,202),fill=MID)
 for x in range(20,467,20):d.line((x,100,x,111),fill=LIT,width=2)
 d.line((14,100,466,100),fill=MID,width=3)
 for i in range(10):
  y=162+i*5;x=18+(i*47)%120;d.line((x,y,x+90,y),fill=MID);d.line((320+(i*17)%50,y,451,y),fill=DARK)
 for x in [65,386]:
  d.rectangle((x,189,x+7,192),fill='#59436f');d.rectangle((x+18,189,x+25,192),fill='#59436f')
 d.line((354,84,366,101),fill='#604274',width=2);d.rectangle((351,81,355,85),fill='#9764b0')
def oath(im,d):
 for x,h in [(39,100),(104,119),(335,119),(402,100)]:
  d.rectangle((x,h,x+30,210),fill=DARK)
  for xx in range(x,x+31,10):d.rectangle((xx,h-5,xx+5,h),fill=MID)
  d.rectangle((x+11,h+12,x+17,h+30),fill=MID)
 for x in [65,383]:
  d.line((x,123,x,208),fill=LIT,width=2);d.polygon([(x+1,124),(x+29,124),(x+24,149),(x+14,156),(x+1,151)],fill=MID);d.line((x+6,132,x+20,146),fill=LIT,width=2)
 for x,y in [(82,93),(369,106),(119,139),(399,145)]:d.polygon([(x,y),(x+6,y-12),(x+7,y-3),(x+11,y-8),(x+12,y+4)],fill='#4a2c3b')
 d.polygon([(139,208),(168,191),(201,208),(312,209),(336,194),(355,211)],fill=MID)
def stage(im,d):
 for x in [44,371]:
  d.rectangle((x,140,x+63,211),fill=MID);d.rectangle((x+4,145,x+59,208),fill=DARK)
  for yy in [160,191]:d.ellipse((x+17,yy-11,x+44,yy+12),fill=BG,outline=LIT,width=2)
 d.line((23,97,456,97),fill=MID,width=4)
 for x in [83,389]:
  d.rectangle((x-9,99,x+10,108),fill=LIT);d.polygon([(x,109),(x-41,210),(x+35,210)],fill=DARK)
 d.line((324,134,324,206),fill=LIT,width=2);d.ellipse((318,128,330,136),fill=LIT);d.line((324,206,310,211),fill=LIT,width=2)
 for x,y in [(123,153),(350,126)]:d.line((x,y,x,y-13),fill=LIT,width=2);d.ellipse((x-5,y-2,x+1,y+3),fill=LIT)
def desktop(im,d):
 d.rectangle((55,92,425,195),fill=MID);d.rectangle((59,105,421,190),fill=DARK);d.rectangle((59,96,421,103),fill=LIT)
 for x in [404,412]:d.rectangle((x,98,x+3,101),fill=INK)
 d.ellipse((83,120,154,174),outline=LIT,width=2);d.ellipse((96,126,146,171),outline=MID,width=2)
 d.rectangle((319,123,391,174),outline=LIT,width=2);d.rectangle((325,130,385,168),fill=BG)
 for x,y in [(95,117),(370,181),(165,159),(312,116)]:d.ellipse((x,y,x+9,y+9),outline=LIT)
 d.rectangle((215,196,265,202),fill=MID);d.polygon([(225,201),(255,201),(270,211),(211,211)],fill=LIT)
def backrooms(im,d):
 d.polygon([(34,100),(446,100),(352,210),(126,210)],fill=DARK)
 for x in [53,95,137,179,221,263,305,347,389,431]:d.line((x,105,240+(x-240)*.56,210),fill=MID)
 for x,y in [(91,122),(158,150),(320,136),(381,111)]:
  d.line((x,y,x+4,y+7),fill=LIT);d.line((x+4,y+7,x,y+14),fill=MID)
 d.rectangle((334,131,375,210),fill=BG);d.rectangle((331,128,378,210),outline=LIT,width=2);d.rectangle((369,169,371,171),fill=LIT)
 d.rectangle((114,91,186,94),fill=LIT);d.rectangle((298,91,371,94),fill=LIT)
 for x in [78,390]:d.line((x,204,240,179),fill=MID)
def missing(im,d):
 for x in [65,390]:
  d.rectangle((x,91,x+5,211),fill=MID);d.rectangle((x-11,101,x+16,107),fill=LIT);d.polygon([(x-5,108),(x-37,210),(x+30,210)],fill=DARK)
 d.rectangle((79,121,122,180),fill=LIT);d.rectangle((82,124,119,177),fill=MID)
 f=ImageFont.truetype(font,4);d.text((86,128),'MISSING',font=f,fill=INK);d.rectangle((93,140,109,159),fill=DARK)
 for y in [164,169,173]:d.line((86,y,115,y),fill=LIT)
 sprite(im,'last-seen/wrong/idle_sheet.png',(32,59),(370,211),1,True)
 for i in range(54):
  x=20+(i*71)%440;y=98+(i*37)%111;d.line((x,y,x-2,y+5),fill=MID)
card('soul-summoner','SOUL SUMMONER','HE CALLS HIS FALLEN FRIENDS BY NAME.',sanctum,'soul-summoner/idle_sheet.png',(32,59))
card('mr-wake','MR WAKE','BENEATH GRAVEMOON BRIDGE, THE DARK HAS EYES.',deep,'mr-wake/idle_sheet.png',(36,62))
card('hero-knight','LACY','THE KINGDOM FELL. THE OATH REMAINS.',oath,'hero-knight/idle_sheet.png',(66,86))
card('nu','NU','EVERY FIGHT BECOMES A SHOW.',stage,'nu/idle_sheet.png',(32,59))
card('aero','AERO','A FORGOTTEN DESKTOP. A WORLD STILL ALIVE.',desktop,'aero/idle_sheet.png',(32,59))
card('what-once-was','WHAT ONCE WAS','LOST IN LEVEL 0. STILL SEARCHING FOR A WAY OUT.',backrooms,'what-once-was/menu_idle_sheet.png',(32,59))
card('last-seen','ROSEMARY','SHE WENT MISSING. SOMETHING CAME BACK.',missing,'last-seen/idle_sheet.png',(32,59))
print('Built seven lore screens from existing character sprites')
