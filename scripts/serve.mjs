import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve('dist'),port=Number(process.env.PORT||4188),prefix='/rain-project/';
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.txt':'text/plain; charset=utf-8','.json':'application/json','.webp':'image/webp','.mp4':'video/mp4','.vtt':'text/vtt','.zip':'application/zip'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname===prefix.slice(0,-1)||url.pathname==='/'){res.writeHead(302,{Location:prefix});res.end();return;}
    if(!url.pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
    const relative=decodeURIComponent(url.pathname.slice(prefix.length))||'index.html';
    const file=path.resolve(root,relative);
    if(!file.startsWith(root+path.sep)){res.writeHead(400);res.end();return;}
    const stat=await fsp.stat(file);if(!stat.isFile())throw Error('Not a file');
    let start=0,end=stat.size-1;
    const range=req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
    if(range&&(range[1]||range[2])){
      if(range[1]){start=Number(range[1]);if(range[2])end=Math.min(Number(range[2]),end);}
      else start=Math.max(0,stat.size-Number(range[2]));
      if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':'bytes */'+stat.size});res.end();return;}
      res.statusCode=206;res.setHeader('Content-Range','bytes '+start+'-'+end+'/'+stat.size);
    }
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Length',end-start+1);res.setHeader('X-Content-Type-Options','nosniff');
    if(req.method==='HEAD'){res.end();return;}
    fs.createReadStream(file,{start,end}).pipe(res);
  }catch{res.writeHead(404);res.end('File not found');}
});
server.listen(port,'127.0.0.1',()=>console.log('Rain preview http://127.0.0.1:'+port+prefix));
