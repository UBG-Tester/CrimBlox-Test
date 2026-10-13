// Keeps the GPU instance buffer in step with a DataModel: parts appear, move, recolor and disappear by listening to change
// signals. Only parts whose properties changed are rewritten each frame.
import { qFromEulerYXZ, modelMatrixQ } from '../math.js';
const SHAPE = { Block: 'cube', Ball: 'sphere', Cylinder: 'cylinder', Wedge: 'wedge', Cone: 'cone' };
const SS_DEG = Math.PI / 180;

export class SceneSync {
  constructor(game, renderer) {
    this.game = game; this.r = renderer; this.slots = new Map(); this.bySlot = new Map(); this.dirty = new Set(); this.data = new Float32Array(24);
    const ws = game.Workspace;
    game.InstanceAdded.Connect(i => { if (i.IsA('Part') && i.IsDescendantOf(ws)) this._add(i); });
    game.InstanceRemoving.Connect(i => { if (this.slots.has(i)) this._remove(i); });
    game.InstanceReparented.Connect(i => { if (i.IsA('Part')) { if (i.IsDescendantOf(ws)) { if (!this.slots.has(i)) this._add(i); } else if (this.slots.has(i)) this._remove(i); } });
    game.PropertyChanged.Connect((i, name) => {
      const e = this.slots.get(i); if (!e) return;
      if (name === 'Shape') { this._remove(i); this._add(i); } else this.dirty.add(i);
    });
    for (const d of ws.GetDescendants()) if (d.IsA('Part')) this._add(d);
  }
  _add(part) {
    const shape = SHAPE[part.Shape] ?? 'cube', slot = this.r.allocSlot(shape);
    this.slots.set(part, { shape, slot }); this.bySlot.set(slot, part); this.dirty.add(part);
  }
  _remove(part) {
    const { shape, slot } = this.slots.get(part); this.slots.delete(part); this.dirty.delete(part); this.bySlot.delete(slot);
    const moved = this.r.freeSlot(shape, slot);
    if (moved !== null) { const mp = this.bySlot.get(moved); this.bySlot.delete(moved); this.bySlot.set(slot, mp); this.slots.get(mp).slot = slot; }
  }
  flush() {
    for (const part of this.dirty) {
      const e = this.slots.get(part); if (!e) continue; const o = part.Orientation, p = part.Position, s = part.Size, c = part.Color, d = this.data;
      d.set(modelMatrixQ([p.x, p.y, p.z], [s.x, s.y, s.z], qFromEulerYXZ(o.x * SS_DEG, o.y * SS_DEG, o.z * SS_DEG)), 0);
      d[16] = c.r; d[17] = c.g; d[18] = c.b; d[19] = 1 - 0; d[20] = part.Roughness; d[21] = part.Metalness; d[22] = part.Emissive; d[23] = part.Studs ? 1 : 0;
      this.r.writeSlot(e.slot, d);
    }
    this.dirty.clear();
  }
  get partCount() { return this.slots.size; }
}
