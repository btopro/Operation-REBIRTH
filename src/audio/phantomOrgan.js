// Three growing pipe-organ chords: dun, dun, DUN. Synthesized, with a short hall tail.
export const ORGAN_DURATION = 2.5;
const NOTES = [
  { at: 0, gain: .38, hold: .20, release: .19, chord: [146.832, 220, 293.665, 349.228] },
  { at: .43, gain: .62, hold: .23, release: .22, chord: [138.591, 207.652, 277.183, 329.628] },
  { at: .91, gain: 1, hold: .43, release: .50, chord: [130.813, 195.998, 261.626, 311.127] },
];
function dry(t) {
  let sample = 0;
  for (const note of NOTES) {
    const u = t - note.at;
    if (u < 0 || u > note.hold + note.release) continue;
    const attack = Math.min(1, u / .014);
    const envelope = attack * (u <= note.hold ? 1 : Math.pow(1 - (u - note.hold) / note.release, 1.5));
    let pipes = 0;
    for (const hz of note.chord) {
      const phase = u * hz * Math.PI * 2;
      pipes += Math.sin(phase) * .60 + Math.sin(phase * 2) * .23 + Math.sin(phase * 3) * .10 + Math.sin(phase * 4) * .06;
    }
    const pedal = Math.sin(u * note.chord[0] * Math.PI);
    sample += note.gain * envelope * (pipes / note.chord.length * .82 + pedal * .18);
  }
  return sample;
}
export function phantomOrganSample(t) {
  return dry(t) + dry(t - .14) * .17 + dry(t - .29) * .09 + dry(t - .46) * .04;
}
