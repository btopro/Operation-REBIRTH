"""Compact two-bone pixel arms. Bone lengths are fixed; only joint angles change."""
from PIL import ImageDraw
import math
SHOULDERS=((63,53),(69,51))
def clean_body(frame):
 f=frame.copy();d=ImageDraw.Draw(f)
 # Remove both original arms (including the old trailing third arm), but retain scarf/helmet/torso.
 d.polygon([(44,56),(60,55),(62,60),(59,69),(43,70)],fill=(0,0,0,0))
 d.rectangle((73,43,86,62),fill=(0,0,0,0))
 # The original shoulder-carried blade is outside the helmet.
 d.polygon([(0,0),(62,0),(62,42),(55,43),(0,43)],fill=(0,0,0,0))
 return f

def joint(shoulder,hand,length=9,sign=1):
 dx,dy=hand[0]-shoulder[0],hand[1]-shoulder[1];dist=math.hypot(dx,dy)
 if dist>length*2+.01:raise ValueError(f'Unreachable hand target: {shoulder} -> {hand} ({dist:.2f})')
 if dist<.1:return (shoulder[0],shoulder[1]+length)
 along=dist/2;offset=math.sqrt(max(0,length*length-along*along))
 return (shoulder[0]+dx/2-dy/dist*offset*sign,shoulder[1]+dy/2+dx/dist*offset*sign)

def arms(frame,hands):
 d=ImageDraw.Draw(frame);joints=[]
 for i,(shoulder,hand) in enumerate(zip(SHOULDERS,(hands[1],hands[0]))):
  elbow=joint(shoulder,hand);joints.append([list(shoulder),list(elbow),list(hand)])
  # Tapered bracers, an actual elbow pad, then a narrow wrist: no long five-pixel tubes.
  for a,b in [(shoulder,elbow),(elbow,hand)]:
   dx,dy=b[0]-a[0],b[1]-a[1];ln=math.hypot(dx,dy);nx,ny=-dy/ln,dx/ln
   poly=[(round(a[0]+nx*1.6),round(a[1]+ny*1.6)),(round(b[0]+nx),round(b[1]+ny)),(round(b[0]-nx),round(b[1]-ny)),(round(a[0]-nx*1.6),round(a[1]-ny*1.6))]
   d.polygon(poly,fill=(37,49,54));d.line([tuple(round(v) for v in a),tuple(round(v) for v in b)],fill=(94,111,117) if i==0 else (146,156,160),width=2)
  ex,ey=map(round,elbow);d.rectangle((ex-1,ey-1,ex+1,ey+1),fill=(76,90,95))
 return joints

def gloves(frame,hands):
 d=ImageDraw.Draw(frame)
 for hx,hy in hands:
  hx,hy=round(hx),round(hy);d.rectangle((hx-1,hy-1,hx+1,hy+1),fill=(146,156,160));d.line([(hx-1,hy),(hx+1,hy)],fill=(76,90,95),width=1)
