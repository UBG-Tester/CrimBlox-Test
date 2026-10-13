import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon' };

export function startServer(port = Number(process.env.PORT || 8080)) {
  const server = http.createServer(async (req, res) => {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    if (pathname === '/health') {
      res.writeHead(200, { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store' });
      res.end(JSON.stringify({ ok:true, service:'crimblox-web-engine' }));
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { allow:'GET, HEAD', 'content-type':'text/plain; charset=utf-8' }); res.end('Method not allowed'); return;
    }
    let requested;
    try { requested = decodeURIComponent(pathname === '/' ? '/index.html' : pathname); }
    catch { res.writeHead(400); res.end('Bad request'); return; }
    const file = path.resolve(root, '.' + requested);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
    try {
      const body = await fs.readFile(file);
      res.writeHead(200, { 'content-type':mime[path.extname(file).toLowerCase()] || 'application/octet-stream', 'x-content-type-options':'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      res.writeHead(404, { 'content-type':'text/plain; charset=utf-8' }); res.end('Not found');
    }
  });
  server.on('upgrade', (_req, socket) => { socket.end('HTTP/1.1 426 Upgrade Required\r\nConnection: close\r\n\r\nWebSocket replication is not configured in this build.'); });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '0.0.0.0', () => resolve({ server, port:server.address().port, close:()=>new Promise(r=>server.close(r)) }));
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().then(({port}) => console.log(`CrimBlox web engine listening on ${port}`)).catch(err => { console.error(err); process.exitCode=1; });
}
