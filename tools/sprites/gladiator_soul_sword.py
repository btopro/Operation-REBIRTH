"""Replace each source axe with one hand-aligned flaming soul greatsword, in pixel-editor geometry."""
from PIL import Image,ImageDraw
import math
# head bounds, old shaft line, hand centers, sword guard, sword tip.
WALK=((14,112,65,155),((45,134),(124,91)),[(86,109),(120,92)],(82,112),(18,145))
ATTACK=[
 ((14,112,67,155),((45,135),(112,106)),[(77,120),(110,106)],(72,123),(16,148)),
 ((43,36,84,89),((62,55),(127,110)),[(89,82),(118,105)],(85,78),(42,37)),
 ((39,24,80,79),((59,46),(130,66)),[(86,50),(113,61)],(81,49),(26,29)),
 ((155,110,191,157),((127,109),(179,137)),[(127,110),(141,120)],(145,123),(188,150)),
 ((150,72,191,121),((108,96),(180,96)),[(110,96),(130,97)],(135,97),(188,97)),
 ((142,114,190,159),((123,124),(174,140)),[(126,125),(143,133)],(147,134),(188,149)),
 ((128,121,175,159),((112,135),(160,142)),[(115,135),(135,138)],(139,139),(185,149)),
 ((123,123,165,159),((116,101),(142,144)),[(116,103),(124,116)],(127,120),(143,151)),
]
KNEEL=[((121,117,177,157),((135,96),(147,145)),[(136,101),(139,114)],(138,120),(146,151)),((121,119,177,157),((135,108),(148,146)),[(136,111),(141,125)],(142,128),(148,151))]
def replace_axe(frame,name,index):
 config=WALK if name=='walk' else ATTACK[index] if name=='attack' else KNEEL[min(index,1)]
 box,line,hands,guard,tip=config;original=frame.copy();mask=Image.new('L',frame.size);d=ImageDraw.Draw(mask);d.ellipse(box,fill=255);d.line(line,fill=255,width=12)
 frame.paste((0,0,0,0),(0,0),mask)
 # The fingers occlude the weapon; preserve their actual pixels after removing the shaft.
 for hx,hy in hands:
  frame.alpha_composite(original.crop((hx-3,hy-3,hx+4,hy+4)),(hx-3,hy-3))
 return frame,guard,tip,hands

def draw_sword(frame,guard,tip,hands):
 d=ImageDraw.Draw(frame);gx,gy=guard;tx,ty=tip;ln=math.hypot(tx-gx,ty-gy);ux,uy=(tx-gx)/ln,(ty-gy)/ln;nx,ny=-uy,ux
 def p(a,b):return(round(gx+ux*a+nx*b),round(gy+uy*a+ny*b))
 # Soul-fire licks use solid stepped pixels around a single straight pointed blade.
 for j in range(1,7):
  a=ln*j/8;side=-1 if j%2 else 1
  d.polygon([p(a-5,side*4),p(a+1,side*(8+j%3)),p(a+4,side*4)],fill=(17,137,188,255))
  d.line([p(a-3,side*4),p(a+1,side*7)],fill=(79,225,240,255),width=3)
 d.polygon([p(0,-5),p(ln-8,-3),p(ln,0),p(ln-8,3),p(0,5)],fill=(27,105,145,255))
 d.polygon([p(2,-2),p(ln,0),p(2,2)],fill=(215,255,242,255));d.line([p(2,-3),p(ln-6,-1)],fill=(104,237,244,255),width=2)
 d.line([p(-18,0),p(-2,0)],fill=(35,13,23,255),width=6);d.line([p(-17,0),p(-2,0)],fill=(132,28,42,255),width=3)
 d.line([p(0,-9),p(0,9)],fill=(110,59,17,255),width=5);d.line([p(1,-8),p(1,8)],fill=(244,190,75,255),width=2)
 d.rectangle((gx-2,gy-2,gx+2,gy+2),fill=(220,243,168,255))
 # Fingers remain visibly wrapped around the dark grip, not severed by the new blade.
 for hx,hy in hands:
  if math.hypot(hx-gx,hy-gy)<26:
   d.line([(hx-2,hy-1),(hx+2,hy+1)],fill=(200,211,175,255),width=2)
 return frame
