"""A one-shoulder half-cape formed from moving water, authored on native 64px cels."""
from PIL import Image,ImageDraw
from pathlib import Path
import math
ROOT=Path(__file__).resolve().parents[2];out=Image.new('RGBA',(256,128))
for i in range(8):
 f=Image.new('RGBA',(64,64));d=ImageDraw.Draw(f);phase=i*math.pi/4
 for row in range(25):
  k=row/24;flutter=math.sin(phase+k*3)*2*k
  front=40-round(row*.15);back=front-round(4+row*.53+flutter)
  yy=14+row
  d.line([(back,yy),(front,yy)],fill=(30,88,124,210),width=1)
  if front-back>3:d.line([(back+2,yy),(front-1,yy)],fill=(58,145+round(12*math.sin(phase+k)),176,210),width=1)
  flow=back+3+round((front-back-4)*(.5+.28*math.sin(phase-k*4)))
  d.point((flow,yy),fill=(133,223,236,235))
  if row%3==i%3:d.line([(back,yy),(back+2,yy)],fill=(190,246,248,245))
 for j in range(3):
  x=26+j*3;drop=(i+j*2)%8
  d.rectangle((x,39+drop//2,x,40+drop//2),fill=(141,226,238,210-drop*15))
 # Small bright shoulder pin and a stream returning into the moving surface.
 d.rectangle((38,13,41,15),fill=(183,237,244,255));d.point((40,13),fill=(244,255,255,255))
 out.alpha_composite(f,(i%4*64,i//4*64))
path=ROOT/'public/assets/fighters/hero-knight/azure_water_cape.png';out.save(path)
print('Eight native 64x64 water half-cape frames exported.')
