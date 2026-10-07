// Servidor estático mínimo para probar dist/ en local (npm start)
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve('dist'), port = process.env.PORT || 8080;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/markdown' };
http.createServer((req, res) => {
  let p = path.normalize(decodeURIComponent(req.url.split('?')[0]));
  if (p === path.sep) p = '/index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('No encontrado'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log('http://localhost:' + port));
