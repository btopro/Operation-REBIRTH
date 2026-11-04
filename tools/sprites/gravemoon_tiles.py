"""A shared 64x64 tile kit, 2px clusters and one moonlit stone ramp throughout."""
from PIL import Image,ImageDraw
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
P={'ink':'#100f23','deep':'#232239','shade':'#38384f','stone':'#53566c','light':'#7c8497','rim':'#b3becd','moon':'#d9dfdf','gold':'#ba824d','fire':'#e36b48','hot':'#f6c77e','red':'#b63842','moss':'#43545a'}
out=Image.new('RGBA',(512,64))
def tile(i):
 f=Image.new('RGBA',(64,64));return f,ImageDraw.Draw(f)
def rect(d,xy,c):d.rectangle(xy,fill=P.get(c,c))
# Deck: interlocking, staggered masonry, same edges and light direction as every structure.
f,d=tile(0);rect(d,(0,0,63,63),'ink');rect(d,(0,2,63,11),'stone');rect(d,(0,0,63,1),'rim');rect(d,(0,2,63,3),'light');rect(d,(0,10,63,13),'deep')
for row in range(3):
 y=16+row*16
 for x in range(-16 if row%2 else 0,64,32):
  rect(d,(x+2,y,x+31,y+13),'shade');rect(d,(x+2,y,x+31,y+1),'stone');rect(d,(x+2,y+2,x+3,y+11),'stone')
rect(d,(30,4,31,9),'shade');rect(d,(54,52,57,55),'moss');out.alpha_composite(f,(0,0))
# Arch voussoirs; transparent opening is a silhouette, not a separate inconsistent asset.
f,d=tile(1)
for y in range(0,64,2):
 half=0 if y<8 else min(25,8+int((y-8)*.55))
 for a,b in [(0,31-half),(32+half,63)]:
  if b>=a:rect(d,(a,y,b,y+1),'shade');rect(d,(a,y,min(b,a+3),y+1),'stone')
for y in (0,16,32,48):
 rect(d,(0,y,12 if y>16 else 20,y+1),'deep');rect(d,(50 if y>16 else 44,y,63,y+1),'deep')
rect(d,(0,0,63,3),'stone');out.alpha_composite(f,(64,0))
# Pier shaft with consistent banded stone and a shield medallion.
f,d=tile(2);rect(d,(20,0,43,63),'ink');rect(d,(22,0,41,63),'shade');rect(d,(22,0,27,63),'stone')
for y in (0,30,60):rect(d,(16,y,47,min(y+5,63)),'deep');rect(d,(16,y,47,min(y+1,63)),'light')
rect(d,(26,10,39,25),'deep');rect(d,(28,12,35,23),'stone');rect(d,(30,15,33,20),'light');out.alpha_composite(f,(128,0))
# Wrought iron railing, geometric gothic finials.
f,d=tile(3)
for x in (8,32,56):
 rect(d,(x-2,36,x+1,63),'ink');rect(d,(x-2,36,x-1,63),'stone');d.polygon([(x,28),(x+4,34),(x,38),(x-4,34)],fill=P['shade']);rect(d,(x,30,x+1,33),'light')
for y in (42,58):rect(d,(0,y,63,y+3),'ink');rect(d,(0,y,63,y+1),'shade')
out.alpha_composite(f,(192,0))
# Upper ledge: 8px solid crest, readable moonlit top and hanging inset blocks.
f,d=tile(4);rect(d,(0,0,63,9),'ink');rect(d,(0,0,63,1),'rim');rect(d,(0,2,63,5),'stone');rect(d,(2,6,61,7),'shade')
for x in (8,40):rect(d,(x,10,x+15,17),'deep');rect(d,(x,10,x+15,11),'stone')
out.alpha_composite(f,(256,0))
# Repeated stone gargoyle crest, one symmetric carved motif for bridge piers and ledges.
f,d=tile(5);d.polygon([(12,20),(8,6),(24,16),(40,16),(56,6),(52,20),(54,38),(44,52),(20,52),(10,38)],fill=P['ink'])
d.polygon([(14,22),(12,12),(24,20),(40,20),(52,12),(50,24),(50,36),(40,48),(24,48),(14,36)],fill=P['shade'])
rect(d,(16,22,29,25),'light');rect(d,(36,22,47,25),'stone');rect(d,(18,28,27,31),'deep');rect(d,(38,28,45,31),'deep');rect(d,(22,28,25,29),'red');rect(d,(38,28,41,29),'red');rect(d,(30,28,35,37),'stone');rect(d,(24,40,41,43),'ink')
for x in (26,32,38):rect(d,(x,40,x+1,41),'rim')
out.alpha_composite(f,(320,0))
# Distant castle module, quiet silhouette with sparse warm windows.
f,d=tile(6)
for x,h in ((4,26),(22,42),(44,32)):
 rect(d,(x,64-h,x+11,63),'deep');d.polygon([(x-2,64-h),(x+6,54-h),(x+14,64-h)],fill=P['deep']);rect(d,(x+6,68-h,x+7,71-h),'gold')
rect(d,(0,56,63,63),'deep');out.alpha_composite(f,(384,0))
# Moon carved on the same 2px grid, no smooth circles or blended halo.
f,d=tile(7)
for y in range(4,60,2):
 dy=y+1-32;half=int((28**2-dy**2)**.5)//2*2 if abs(dy)<=28 else 0
 rect(d,(32-half,y,31+half,y+1),'moon');
 if half>8:rect(d,(32+half-6,y,31+half,y+1),'rim')
for x,y,w,h in ((18,18,10,6),(38,24,12,8),(18,38,8,6),(30,48,6,4)):
 rect(d,(x,y,x+w-1,y+h-1),'light');rect(d,(x,y,x+w-3,y+1),'rim')
out.alpha_composite(f,(448,0));out.save(ROOT/'public/assets/stages/gravemoon/tiles.png')
print('Eight matching 64x64 tiles exported.')
