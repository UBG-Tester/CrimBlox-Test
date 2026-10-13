export const vec=(x=0,y=0,z=0)=>({x,y,z});
export class PhysicsWorld {
 constructor({gravity=196.2}={}){this.gravity=gravity;this.bodies=new Set();this.time=0}
 add(body){this.bodies.add(body);return body} remove(body){this.bodies.delete(body)}
 step(dt){dt=Math.max(0,Math.min(Number(dt)||0,.1));this.time+=dt;for(const b of this.bodies){if(b.Anchored||b.anchored)continue;const p=b.Position??(b.Position=vec()),v=b.Velocity??(b.Velocity=vec());v.y-=this.gravity*dt;p.x+=v.x*dt;p.y+=v.y*dt;p.z+=v.z*dt;if(p.y<0){p.y=0;v.y=Math.max(0,v.y)*-.15}}}
 raycast(origin,direction,maxDistance=Infinity){let best=null;for(const b of this.bodies){const p=b.Position??vec(),s=b.Size??vec(1,1,1);const t=(p.y-s.y/2-origin.y)/(direction.y||1e-9);if(t<0||t>maxDistance)continue;const x=origin.x+direction.x*t,z=origin.z+direction.z*t;if(Math.abs(x-p.x)<=s.x/2&&Math.abs(z-p.z)<=s.z/2&&(!best||t<best.distance))best={Instance:b,Position:vec(x,p.y-s.y/2,z),distance:t}}return best}
}
export function integrate(position,velocity,gravity,dt){return {position:vec(position.x+velocity.x*dt,position.y+velocity.y*dt-gravity*dt*dt/2,position.z+velocity.z*dt),velocity:vec(velocity.x,velocity.y-gravity*dt,velocity.z)}}
