// Shared primitive pool: one copy of each shape in a single vertex/index buffer.
// Vertex layout: position(3) + normal(3). Unit shapes centered at the origin.
import { sub, cross, dot, norm } from './math.js';
const avg = p => p.reduce((s, q) => [s[0]+q[0]/p.length, s[1]+q[1]/p.length, s[2]+q[2]/p.length], [0,0,0]);

class Mesh {
  v = []; i = [];
  flat(pts, c) {
    let n = norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
    if (dot(n, sub(avg(pts), c)) < 0) { pts = [...pts].reverse(); n = n.map(x => -x); }
    const b = this.v.length / 6;
    pts.forEach(p => this.v.push(...p, ...n));
    for (let k = 1; k < pts.length - 1; k++) this.i.push(b, b+k, b+k+1);
  }
  fix(from) {
    const P = j => this.v.slice(j*6, j*6+3);
    for (let k = from; k < this.i.length; k += 3) {
      const [a, b, c] = [this.i[k], this.i[k+1], this.i[k+2]];
      if (dot(cross(sub(P(b), P(a)), sub(P(c), P(a))), this.v.slice(a*6+3, a*6+6)) < 0) {
        this.i[k+1] = c; this.i[k+2] = b;
      }
    }
  }
}
function cube() {
  const m = new Mesh();
  for (let a = 0; a < 3; a++) for (const s of [-1, 1]) {
    const u = (a+1) % 3, w = (a+2) % 3;
    m.flat([[-1,-1],[1,-1],[1,1],[-1,1]].map(([x, y]) => { const p = [0,0,0]; p[a] = s*.5; p[u] = x*.5; p[w] = y*.5; return p; }), [0,0,0]);
  }
  return m;
}
function wedge() {
  const m = new Mesh(), c = [0,-.1,.1];
  for (const x of [-.5, .5]) m.flat([[x,-.5,-.5],[x,-.5,.5],[x,.5,.5]], c);
  m.flat([[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]], c);
  m.flat([[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]], c);
  m.flat([[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,.5],[-.5,.5,.5]], c);
  return m;
}
function sphere(R = 16, S = 24) {
  const m = new Mesh();
  for (let i = 0; i <= R; i++) for (let j = 0; j <= S; j++) {
    const t = i/R*Math.PI, p = j/S*Math.PI*2;
    const n = [Math.sin(t)*Math.cos(p), Math.cos(t), Math.sin(t)*Math.sin(p)];
    m.v.push(n[0]*.5, n[1]*.5, n[2]*.5, ...n);
  }
  for (let i = 0; i < R; i++) for (let j = 0; j < S; j++) {
    const a = i*(S+1)+j, b = a+S+1; m.i.push(a, b, a+1, a+1, b, b+1);
  }
  m.fix(0); return m;
}
function cylinder(S = 24) {
  const m = new Mesh();
  for (let j = 0; j <= S; j++) {
    const p = j/S*Math.PI*2, x = Math.cos(p), z = Math.sin(p);
    m.v.push(x*.5,.5,z*.5, x,0,z, x*.5,-.5,z*.5, x,0,z);
  }
  for (let j = 0; j < S; j++) { const a = j*2; m.i.push(a, a+1, a+2, a+2, a+1, a+3); }
  m.fix(0);
  for (const y of [.5, -.5]) {
    const ring = []; for (let j = 0; j < S; j++) { const p = j/S*Math.PI*2; ring.push([Math.cos(p)*.5, y, Math.sin(p)*.5]); }
    m.flat(ring, [0,0,0]);
  }
  return m;
}
function cone(S = 24) {
  const m = new Mesh();
  for (let j = 0; j < S; j++) {
    const a0 = j/S*Math.PI*2, a1 = (j+1)/S*Math.PI*2, am = (a0+a1)/2;
    const nrm = a => norm([Math.cos(a), 0.5, Math.sin(a)]);
    m.v.push(Math.cos(a0)*.5,-.5,Math.sin(a0)*.5, ...nrm(a0), Math.cos(a1)*.5,-.5,Math.sin(a1)*.5, ...nrm(a1), 0,.5,0, ...nrm(am));
    m.i.push(j*3, j*3+1, j*3+2);
  }
  m.fix(0);
  const ring = []; for (let j = 0; j < S; j++) { const p = j/S*Math.PI*2; ring.push([Math.cos(p)*.5, -.5, Math.sin(p)*.5]); }
  m.flat(ring, [0, 0, 0]); return m;
}
export function buildGeometry() {
  const meshes = { cube: cube(), sphere: sphere(), cylinder: cylinder(), wedge: wedge(), cone: cone() };
  const verts = [], idx = [], shapes = {};
  for (const [name, m] of Object.entries(meshes)) {
    const base = verts.length / 6;
    shapes[name] = { base, first: idx.length, count: m.i.length };
    verts.push(...m.v); idx.push(...m.i.map(i => i + base));
  }
  return { vertices: new Float32Array(verts), indices: new Uint32Array(idx), shapes };
}