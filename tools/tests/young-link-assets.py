from PIL import Image
from pathlib import Path
import json
r=Path(__file__).resolve().parents[2];p=r/'public/assets/fighters/young-link'
m=json.loads((p/'extraction.json').read_text());src=Image.open(r/'tools/sprites/source/young-link/reference.png').convert('RGBA');atlas=Image.open(p/'moves_sheet.png')
count=0
for name,frames in m['groups'].items():
 for frame in frames:
  left,top,right,bottom=frame['rect'];ax,ay=frame['anchor'];i=frame['frame']
  cel=atlas.crop((i%16*160,i//16*128,i%16*160+160,i//16*128+128))
  actual=sum(cel.getchannel('A').histogram()[1:]);expected=0
  for y in range(top,bottom):
   for x in range(left,right):
    color=src.getpixel((x,y))
    if color[:3]==(0,64,128):continue
    expected+=1;assert cel.getpixel((80+x-ax,111+y-ay))==color,(name,i,x,y)
  assert actual==expected and actual>100,(name,i,actual,expected)
  box=cel.getbbox();assert box[0]>0 and box[1]>0 and box[2]<160 and box[3]<128,(name,i,box)
  count+=1
assert count==166
assert not (r/'src/fighters/kirby.js').exists()
assert 'GREGARLINK10' in (r/'src/fighters/roster.js').read_text()
print('PASS:',count,'frames preserve every source pixel, fit their cells, and retain artist credit')
