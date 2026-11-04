"""Pixel-edit Lacy's existing idle into a composed, upright chest-height counter.
Keeps each costume's head, scarf, torso and legs; paints articulated arms and one sword.
"""
from PIL import Image, ImageDraw
from pathlib import Path
from lacy_counter_pose import counter_pose
from lacy_pose_rig import clean_body,arms,gloves
import json
rigs=[]
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'public/assets/fighters/hero-knight'
for directory in [BASE]+[p for p in BASE.iterdir() if p.is_dir() and (p/'idle_sheet.png').exists()]:
 original=Image.open(directory/'idle_sheet.png').convert('RGBA').crop((0,0,150,90))
 out=Image.new('RGBA',(450,90))
 for i in range(3):
  f=clean_body(original)
  d=ImageDraw.Draw(f)
  ink=original.getpixel((66,61))[:3]; mid=(76,90,95);light=(146,156,160);edge=(201,201,201)
  # Both forearms reach forward, with two distinct gloves wrapped around one grip.
  h,tip,u,hands=counter_pose(i);nx,ny=-u[1],u[0]
  def point(distance,side=0):return(round(h[0]+u[0]*distance+nx*side),round(h[1]+u[1]*distance+ny*side))
  joints=arms(f,hands)
  if directory==BASE:rigs.append({'hands':hands,'joints':joints})
  length=30
  d.line([point(-10),point(0)],fill=(30,36,42),width=3)
  d.line([point(-9),point(-1)],fill=mid,width=1)
  d.polygon([point(0,-2),point(length-4,-1),tip,point(length-4,1),point(0,2)],fill=edge)
  d.line([point(1,1),point(length-4,1)],fill=(194,194,194),width=1)
  d.line([point(0,-7),point(0,7)],fill=(30,40,45),width=3)
  d.line([point(0,-6),point(0,6)],fill=light,width=1)
  gloves(f,hands)
  out.alpha_composite(f,(i*150,0))
 out.save(directory/'counter_sheet.png')
print('Counter strips generated from original costume pixels.')

(ROOT/'src/fighters/lacyCounterRig.js').write_text('// Fixed-length counter attachment geometry.\nexport const LACY_COUNTER_RIG='+json.dumps(rigs,separators=(',',':'))+';\n')
