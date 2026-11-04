"""Original synthesized dialogue for the requested cinematics. No sampled character voices."""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parents[2]/'public/assets/audio/outro-voices';ROOT.mkdir(parents=True,exist_ok=True)
lines=[('fairy_question','Are you sure you want to do this?','slt',24000),('lacy_restored','The kingdom is finally restored.','slt',17000),('frost_freeze','Now freeze!','rms',13000)]
for key,text,voice,rate in lines:
 effect=f'asetrate={rate},aresample=22050,highpass=f=180,lowpass=f=7500,aecho=0.8:0.3:45:0.12,loudnorm=I=-17:TP=-2:LRA=5'
 for ext,codec in [('ogg',['-c:a','libvorbis','-q:a','5']),('mp3',['-c:a','libmp3lame','-b:a','96k'])]:
  subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i',f"flite=text='{text}':voice={voice}",'-af',effect,*codec,str(ROOT/f'{key}.{ext}')],check=True)
 print(key)
