// Add the user's exact scar PNG here once supplied as a file. No substitute drawing is used.
export const KEEPER_SCAR_ASSET = null;
// Awaiting the user's exact Noli tap-face PNG; never load a missing or invented replacement.
export const NOLI_TAP_FACE_ASSET = null;
export function keeperFaceFor(state,hasScar=false,hasNoliTap=false){
 const mood=state.face==='scar'?'calm':state.face||'calm';
 if(state.riphood&&hasScar)return 'scar';
 if(state.noli&&hasNoliTap&&state.noliTapUntil>state.t)return 'noli_tap';
 return state.noli?'noli':state.soviet?'sickle':mood;
}
