"""Original short fairy callouts, synthesized locally with Flite SLT and a bright sprite-like pitch."""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parents[2]/'public/assets/audio/fairy';ROOT.mkdir(parents=True,exist_ok=True)
for key,text in [('hey','Hey!'),('look','Look!'),('listen','Listen!')]:
 source=f"flite=text='{text}':voice=slt"
 effect='asetrate=24000,aresample=22050,highpass=f=350,lowpass=f=7500,aecho=0.8:0.35:35:0.13,loudnorm=I=-17:TP=-2:LRA=5'
 for ext,codec in [('ogg',['-c:a','libvorbis','-q:a','5']),('mp3',['-c:a','libmp3lame','-b:a','96k'])]:
  subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i',source,'-af',effect,*codec,str(ROOT/f'{key}.{ext}')],check=True)
 print('Saved fairy:',text)
