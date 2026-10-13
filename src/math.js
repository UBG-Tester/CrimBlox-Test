// Minimal column-major math (right-handed, WebGPU depth 0..1).
export const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
export const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
export const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
export const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0]/l, a[1]/l, a[2]/l]; };

export function mul(a, b) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let s = 0; for (let k = 0; k < 4; k++) s += a[k*4+r] * b[c*4+k];
    o[c*4+r] = s;
  }
  return o;
}
export function perspective(fovY, aspect, n, f) {
  const t = 1 / Math.tan(fovY / 2), m = new Float32Array(16);
  m[0] = t / aspect; m[5] = t; m[10] = f / (n - f); m[11] = -1; m[14] = f * n / (n - f);
  return m;
}
// View z in [-near, -far] maps to depth [0, 1].
export function ortho(l, r, b, t, n, f) {
  const m = new Float32Array(16);
  m[0] = 2/(r-l); m[5] = 2/(t-b); m[10] = 1/(n-f);
  m[12] = -(r+l)/(r-l); m[13] = -(t+b)/(t-b); m[14] = n/(n-f); m[15] = 1;
  return m;
}
export function lookAt(eye, target, up) {
  const f = norm(sub(target, eye)), s = norm(cross(f, up)), u = cross(s, f);
  return new Float32Array([s[0],u[0],-f[0],0, s[1],u[1],-f[1],0, s[2],u[2],-f[2],0,
    -dot(s,eye), -dot(u,eye), dot(f,eye), 1]);
}
export const xform = (m, p) => [
  m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],
  m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],
  m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
// T * Ry(yaw) * S
export function modelMatrix(p, s, yaw) {
  const c = Math.cos(yaw), n = Math.sin(yaw);
  return new Float32Array([c*s[0],0,-n*s[0],0, 0,s[1],0,0, n*s[2],0,c*s[2],0, p[0],p[1],p[2],1]);
}

// ---- vectors and quaternions ([x, y, z, w]); Euler order is Y, then X, then Z (angles in radians) ----
export const add = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
export const scale = (a, s) => [a[0]*s, a[1]*s, a[2]*s];
export const len = a => Math.hypot(a[0], a[1], a[2]);
export const qmul = (a, b) => [a[3]*b[0] + a[0]*b[3] + a[1]*b[2] - a[2]*b[1], a[3]*b[1] - a[0]*b[2] + a[1]*b[3] + a[2]*b[0],
  a[3]*b[2] + a[0]*b[1] - a[1]*b[0] + a[2]*b[3], a[3]*b[3] - a[0]*b[0] - a[1]*b[1] - a[2]*b[2]];
export const qconj = q => [-q[0], -q[1], -q[2], q[3]];
export const qnorm = q => { const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1; return [q[0]/l, q[1]/l, q[2]/l, q[3]/l]; };
export function qrot(q, v) {
  const [x, y, z, w] = q, tx = 2 * (y*v[2] - z*v[1]), ty = 2 * (z*v[0] - x*v[2]), tz = 2 * (x*v[1] - y*v[0]);
  return [v[0] + w*tx + y*tz - z*ty, v[1] + w*ty + z*tx - x*tz, v[2] + w*tz + x*ty - y*tx];
}
export function qFromEulerYXZ(rx, ry, rz) {
  const c1 = Math.cos(rx / 2), c2 = Math.cos(ry / 2), c3 = Math.cos(rz / 2), s1 = Math.sin(rx / 2), s2 = Math.sin(ry / 2), s3 = Math.sin(rz / 2);
  return [s1*c2*c3 + c1*s2*s3, c1*s2*c3 - s1*c2*s3, c1*c2*s3 - s1*s2*c3, c1*c2*c3 + s1*s2*s3];
}
export function qToEulerYXZ(q) {
  const [x, y, z, w] = q, m13 = 2*(x*z + y*w), m21 = 2*(x*y + z*w), m22 = 1 - 2*(x*x + z*z), m23 = 2*(y*z - x*w), m31 = 2*(x*z - y*w), m33 = 1 - 2*(x*x + y*y), m11 = 1 - 2*(y*y + z*z);
  const ex = Math.asin(-Math.max(-1, Math.min(1, m23)));
  return Math.abs(m23) < 0.9999999 ? [ex, Math.atan2(m13, m33), Math.atan2(m21, m22)] : [ex, Math.atan2(-m31, m11), 0];
}
// T * R(q) * S as a column-major 4x4
export function modelMatrixQ(p, s, q) {
  const a = qrot(q, [1, 0, 0]), b = qrot(q, [0, 1, 0]), c = qrot(q, [0, 0, 1]);
  return new Float32Array([a[0]*s[0], a[1]*s[0], a[2]*s[0], 0, b[0]*s[1], b[1]*s[1], b[2]*s[1], 0, c[0]*s[2], c[1]*s[2], c[2]*s[2], 0, p[0], p[1], p[2], 1]);
}
