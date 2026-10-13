// Authoritative game server (Node 20+, no dependencies): data model + physics + scripts, replicated over binary WebSockets.
// Usage: node server/ws-server.mjs [port]
import http from 'node:http';
import crypto from 'node:crypto';
import { DataModel } from '../src/engine/datamodel.js';
import { PhysicsWorld } from '../src/engine/physics.js';
import { NetServer } from '../src/engine/net.js';
import { buildDemoWorld } from '../src/engine/scene.js';

export function startServer(port = 8080) {
  const game = new DataModel(); buildDemoWorld(game); const physics = new PhysicsWorld(game), net = new NetServer(game);
  const server = http.createServer((req, res) => {
    if (req.url === '/health') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: true, service: 'crimson-websocket-server' })); return; }
    res.writeHead(426, { 'content-type': 'text/plain' }); res.end('WebSocket endpoint. Use /health for health checks.');
  });
  server.on('upgrade', (req, socket) => {
    const key = req.headers['sec-websocket-key']; if (!key) return socket.destroy();
    socket.write(['HTTP/1.1 101 Switching Protocols', 'Upgrade: websocket', 'Connection: Upgrade', `Sec-WebSocket-Accept: ${crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64')}`, '', ''].join('\r\n'));
    let buf = Buffer.alloc(0);
    const frame = (op, payload) => { const n = payload.length, h = n < 126 ? Buffer.from([0x80 | op, n]) : n < 65536 ? Buffer.from([0x80 | op, 126, n >> 8, n & 255]) : (() => { const b = Buffer.alloc(10); b[0] = 0x80 | op; b[1] = 127; b.writeBigUInt64BE(BigInt(n), 2); return b; })(); return Buffer.concat([h, payload]); };
    const transport = { sentBytes: 0, onmessage: null, onclose: null, send: bytes => { transport.sentBytes += bytes.length; if (!socket.destroyed) socket.write(frame(2, Buffer.from(bytes))); }, close: () => socket.end(frame(8, Buffer.alloc(0))) };
    socket.on('data', d => {
      buf = Buffer.concat([buf, d]);
      for (;;) {
        if (buf.length < 2) return; const op = buf[0] & 15, masked = buf[1] & 128; let len = buf[1] & 127, off = 2;
        if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; } else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
        if (len > 1 << 20) return socket.destroy();                                  // refuse oversized frames
        if (buf.length < off + (masked ? 4 : 0) + len) return;
        const mask = masked ? buf.subarray(off, off + 4) : null; off += masked ? 4 : 0; const payload = Buffer.from(buf.subarray(off, off + len)); buf = buf.subarray(off + len);
        if (mask) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
        if (op === 2) transport.onmessage?.(new Uint8Array(payload)); else if (op === 8) { socket.end(frame(8, Buffer.alloc(0))); } else if (op === 9) socket.write(frame(10, payload));
      }
    });
    socket.on('close', () => transport.onclose?.()); socket.on('error', () => socket.destroy());
    net.addClient(transport, 'Player');
  });
  let last = performance.now();
  const timer = setInterval(() => { const now = performance.now(), dt = (now - last) / 1000; last = now; physics.step(dt); game.RunService._fire('Heartbeat', dt); net.tick(dt); }, 1000 / 60);
  return new Promise(res => server.listen(port, () => res({ game, net, physics, port: server.address().port, close: () => { clearInterval(timer); server.close(); } })));
}
if (process.argv[1] && process.argv[1].endsWith('ws-server.mjs')) startServer(+(process.env.PORT || process.argv[2]) || 8080).then(s => console.log(`CrimBlox WebSocket server listening on port ${s.port}`));
