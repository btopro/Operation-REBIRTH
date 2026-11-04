"""One source of truth for the two-handed guard's hand and sword attachment points."""
import math
HILTS=[(77,53),(79,51),(78,52)]
def counter_pose(index):
 h=HILTS[index];tip=(h[0]+8,h[1]-29);ln=math.hypot(8,29);u=(8/ln,-29/ln)
 hands=[(h[0]-u[0]*d,h[1]-u[1]*d) for d in (3,7)]
 return h,tip,u,hands
