"""Guard the uploaded idle and pink slippers across every non-empty Judgment animation cel."""
from pathlib import Path
from PIL import Image
import numpy as np
ROOT=Path(__file__).resolve().parents[2];base=ROOT/'public/assets/fighters/soul-summoner/judgment'
ref=np.array(Image.open(ROOT/'tools/sprites/source/judgment/reference.png').convert('RGBA'))
assert np.array_equal(ref,np.array(Image.open(base/'idle_sheet.png').crop((0,0,64,64)))), 'Uploaded idle changed'
count=0
for strip in ['idle','run','juggle','jump','fall','moves']:
 a=np.array(Image.open(base/(strip+'_sheet.png')));fw,fh=(112,104) if strip=='moves' else (64,64)
 for y in range(0,a.shape[0],fh):
  for x in range(0,a.shape[1],fw):
   f=a[y:y+fh,x:x+fw]
   if not f[:,:,3].any():continue
   r,g,b=f[:,:,0].astype(int),f[:,:,1].astype(int),f[:,:,2].astype(int)
   pink=(r>100)&(r>b*1.05)&(b>g*1.05)&(f[:,:,3]>200)
   assert pink.any(), f'Pink slippers missing: {strip} cel {y//fh*(a.shape[1]//fw)+x//fw}'
   count+=1
print(f'PASS: exact uploaded idle and pink slippers in all {count} rendered cels')
