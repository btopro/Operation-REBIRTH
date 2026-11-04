from pathlib import Path
from PIL import Image,ImageChops
import json
r=Path(__file__).resolve().parents[2];specs=json.loads(__import__('subprocess').check_output(['node',str(r/'tools/sprites/sprite_loads.mjs')],cwd=r));count=0
for spec in specs:
 p=r/'public/assets/mobile'/(spec['key']+'.json')
 if not p.exists():continue
 data=json.loads(p.read_text());atlas=Image.open(p.with_suffix('.png')).convert('RGBA');source=Image.open(r/'public'/spec['path']).convert('RGBA');m=data['meta']['original'];fw,fh=m['frameWidth'],m['frameHeight'];columns=m['columns']
 assert max(atlas.size)<=4096
 assert len(data['frames'])==source.width//fw*(source.height//fh)
 for key,f in data['frames'].items():
  i=int(key);a=source.crop((i%columns*fw,i//columns*fh,i%columns*fw+fw,i//columns*fh+fh));b=Image.new('RGBA',(fw,fh));box=f['frame'];s=f['spriteSourceSize'];b.paste(atlas.crop((box['x'],box['y'],box['x']+box['w'],box['y']+box['h'])),(s['x'],s['y']))
  assert a.getchannel('A').tobytes()==b.getchannel('A').tobytes(),(spec['key'],key,'alpha')
  black=Image.new('RGBA',a.size,(0,0,0,255));assert Image.alpha_composite(black,a).tobytes()==Image.alpha_composite(black,b).tobytes(),(spec['key'],key,'pixels')
  count+=1
report=json.loads((r/'public/assets/mobile/report.json').read_text());assert report['savedPercent']>65
print('PASS:',count,'lossless mobile frames;',report)
