from PIL import Image
from pathlib import Path
import json
root=Path(__file__).resolve().parents[2];d=root/'public/assets/fighters/fists';m=json.loads((d/'manifest.json').read_text())
assert m['frameCount']>=180
for name,count in [('idle',4),('walk',3),('run',12),('jump',9),('fall',4)]:
 im=Image.open(d/(name+'_sheet.png'));assert im.size==(96*count,96);assert set(im.getchannel('A').getdata())=={0,255}
 for i in range(count):
  frame=im.crop((i*96,0,(i+1)*96,96));b=frame.getbbox();assert b and b[0]>0 and b[2]<96
  if name=='idle':assert 86<=b[3]<=90 and 51<=b[3]-b[1]<=58
im=Image.open(d/'moves_sheet.png');assert im.width<=4096 and im.height<=4096;assert set(im.getchannel('A').getdata())=={0,255}
for i in range(m['frameCount']):
 f=im.crop((i%16*192,i//16*192,i%16*192+192,i//16*192+192));assert f.getbbox()
print('PASS Fists native extraction, hard transparency, cast-height sprites, idle baseline and mobile-safe atlas dimensions')
