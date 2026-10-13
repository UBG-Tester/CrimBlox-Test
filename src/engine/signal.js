// Event signal: Connect / Once / Fire. Handler errors are isolated so one bad listener can't break replication or physics.
export class Signal {
  constructor() { this._cons = []; }
  Connect(fn) {
    const c = { Connected: true, fn, Disconnect: () => { c.Connected = false; const i = this._cons.indexOf(c); if (i >= 0) this._cons.splice(i, 1); } };
    this._cons.push(c); return c;
  }
  Once(fn) { const c = this.Connect((...a) => { c.Disconnect(); fn(...a); }); return c; }
  Fire(...args) {
    const list = this._cons.length === 1 ? this._cons : this._cons.slice();
    for (const c of list) { if (!c.Connected) continue; try { c.fn(...args); } catch (e) { (Signal.onError || console.error)(e); } }
  }
  get ConnectionCount() { return this._cons.length; }
}
