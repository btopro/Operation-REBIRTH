// A low body impact with a short boot crunch and bronze rattle, in the game's 8-bit mix.
export const GLADIATOR_STEP_DURATION = .42;
export function gladiatorStepSample(t) {
  const body = Math.sin(2*Math.PI*(46*t + 3.2*(1-Math.exp(-18*t)))) * Math.exp(-9*t);
  const crunch = (Math.sin(t*9411)*Math.sin(t*17321)) * Math.exp(-48*t);
  const armor = (Math.sin(t*2110)+Math.sin(t*3290)) * .065 * Math.exp(-22*t);
  return (body*.82+crunch*.3+armor)*Math.min(1,t*600)*Math.max(0,1-t/GLADIATOR_STEP_DURATION);
}
