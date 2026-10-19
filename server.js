import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8'};
async function revision() {
  const files = ['index.html','src/app.js','src/styles.css','src/engine.js','src/data.js','src/countries.js','src/systems.js','src/minigames.js','src/game-session.js','src/character.js','src/character-ui.js','src/character.css','src/calendar.js','src/background.js','src/background-ui.js','src/background-events.js'];
  const stats = await Promise.all(files.map(file => stat(path.join(root,file)).catch(()=>({mtimeMs:0}))));
  return Math.max(...stats.map(s=>s.mtimeMs));
}
const server = http.createServer(async (req,res)=>{
  try {
    const url = new URL(req.url,'http://localhost');
    if(url.pathname === '/__dev') {
      res.writeHead(200, {'Content-Type':'application/json','Cache-Control':'no-store'});
      return res.end(JSON.stringify({revision:await revision()}));
    }
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, relative);
    const allowed = file === path.join(root,'index.html') || file.startsWith(path.join(root,'src')+path.sep) || file.startsWith(path.join(root,'public')+path.sep);
    if(!allowed || file.split(path.sep).some(part=>part.startsWith('.'))) {res.writeHead(403);return res.end('Forbidden');}
    let body = await readFile(file);
    // Version the module graph so embedded previews also see edits immediately.
    const extension=path.extname(file);
    if(extension==='.html'||extension==='.js') {
      const stamp=await revision();
      let source=body.toString('utf8');
      if(extension==='.html')source=source.replace(/(\.\/src\/[^"'?]+\.(?:js|css))(["'])/g,`$1?v=${stamp}$2`);
      else source=source.replace(/(from\s+['"])(\.\.?\/[^'"?]+\.js)(['"])/g,`$1$2?v=${stamp}$3`);
      body=Buffer.from(source);
    }
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:body);
  } catch(error) {res.writeHead(error.code==='ENOENT'?404:400);res.end('File not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`\n  ELSEWHERE · a life of possibilities\n\n  Local: http://localhost:${port}\n  Live reload enabled. Press Ctrl+C to stop.\n`));
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is in use. Run with another PORT.`:error.message);process.exitCode=1;});
