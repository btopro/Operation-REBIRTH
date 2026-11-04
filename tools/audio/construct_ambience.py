"""Looping fading computer ambience: disk chatter, modem wisps, cooling fans and decaying data tones."""
from pathlib import Path
import numpy as np,wave,subprocess,tempfile
ROOT=Path(__file__).resolve().parents[2];SR=32000;DURATION=36
rng=np.random.default_rng(12012);t=np.arange(SR*DURATION)/SR
# A quiet non-musical equipment room. Every electronic event has a long release.
fan=rng.normal(0,1,len(t));fan=np.convolve(fan,np.ones(23)/23,mode='same')
base=.055*fan+.018*np.sin(2*np.pi*57*t)*(1+.25*np.sin(t*.35))
y=np.stack([base,base],axis=1);releases=[]
for i,start in enumerate([.8,3.4,6.8,9.2,12.7,16.5,19.4,22.9,26.8,30.2,32.8]):
 dur=2.1+(i%4)*.42;n=int(dur*SR);q=np.arange(n)/SR;f=270+(i*379)%1900
 phase=2*np.pi*(f*q+(100 if i%2 else -90)*q*q)
 tone=np.sin(phase)*.07+np.sin(phase*.501)*.035
 if i%3==0:tone+=np.sign(np.sin(2*np.pi*(900+int(f))*q))*.018*(np.sin(q*19)>0)
 if i%3==1:tone+=rng.normal(0,.025,n)*(np.sin(q*43)>.4)
 env=np.minimum(1,q/.045)*np.exp(-q/(.43+i%3*.22));tone*=env
 pan=.65*np.sin(i*2.1);a=int(start*SR);b=min(len(t),a+n);n=b-a
 for ch,gain in enumerate([(1-pan)**.5,(1+pan)**.5]):y[a:b,ch]+=tone[:n]*gain
 releases.append(float(np.sqrt(np.mean(tone[-SR//3:]**2)))/max(1e-8,float(np.sqrt(np.mean(tone[SR//10:SR//3]**2)))))
 # Soft distant relay clicks, with no regular beat.
for start in rng.uniform(.4,DURATION-.7,38):
 n=int(.045*SR);q=np.arange(n)/SR;a=int(start*SR);y[a:a+n]+=rng.normal(0,.025,(n,1))*np.exp(-q[:,None]*110)
fade=np.minimum(1,np.minimum(t/.8,(DURATION-t)/.8));y*=np.clip(fade,0,1)[:,None];y=np.tanh(y*1.8)
assert np.max(np.abs(y))<.8 and max(releases)<.16
out=ROOT/'public/assets/audio/music';out.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
 wav=Path(tmp)/'construct.wav'
 with wave.open(str(wav),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((y*32767).astype('<i2').tobytes())
 for ext,args in [('ogg',['-c:a','libvorbis','-q:a','4']),('mp3',['-c:a','libmp3lame','-b:a','128k'])]:
  subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(wav),*args,str(out/('construct.'+ext))],check=True)
print('36s stereo ambience; peak',round(float(np.max(np.abs(y))),3),'max event release ratio',round(max(releases),3))
