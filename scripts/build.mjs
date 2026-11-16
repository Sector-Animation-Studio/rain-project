import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {zipSync} from 'fflate';

const source=JSON.parse(await fs.readFile('PROVENANCE.json','utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const file of source.files){const bytes=await fs.readFile(file.path);assert.equal(bytes.length,file.bytes,file.path);assert.equal(hash(bytes),file.sha256,file.path);}
const directory=path.resolve('dist');
await fs.mkdir(path.join(directory,'downloads'),{recursive:true});
await fs.cp('media',path.join(directory,'media'),{recursive:true});
await fs.copyFile('CREDITS.txt',path.join(directory,'CREDITS.txt'));
for(const file of ['styles.css','player.js'])await fs.copyFile('web/'+file,path.join(directory,file));
const entries={};
for(const file of source.files.filter(item=>item.path.startsWith('project/'))){
  entries['Rain-project/'+file.path.slice(8)]=[new Uint8Array(await fs.readFile(file.path)),{mtime:new Date(2026,10,16),os:0}];
}
for(const file of ['CREDITS.txt','PROVENANCE.json'])entries['Rain-project/'+file]=[new Uint8Array(await fs.readFile(file)),{mtime:new Date(2026,10,16),os:0}];
entries['Rain-project/README.txt']=[new TextEncoder().encode('Rain in motion — Sector Animation Studio\n\nOpen project.studio.json in Sector after extracting this folder. Keep assets/ beside it.\n\nCharacter and music: CC BY 4.0. CMU motion permission and direct-resale restriction remain separate. See CREDITS.txt and PROVENANCE.json.\n'),{mtime:new Date(2026,10,16),os:0}];
const archive=zipSync(entries,{level:6});
const bundle='downloads/Rain-Sector-project-hiphop-v1.zip';
await fs.writeFile(path.join(directory,bundle),archive);
const html=(await fs.readFile('web/index.html','utf8')).replace('__PROJECT_SIZE__',(archive.length/(1024*1024)).toFixed(1)+' MB');
await fs.writeFile(path.join(directory,'index.html'),html);
await fs.writeFile(path.join(directory,'.nojekyll'),'');
const assets=[];
for(const file of ['index.html','styles.css','player.js','CREDITS.txt',bundle,...source.files.filter(item=>item.path.startsWith('media/')).map(item=>item.path)]){
  const bytes=await fs.readFile(path.join(directory,file));assets.push({path:file,bytes:bytes.length,sha256:hash(bytes)});
}
await fs.writeFile(path.join(directory,'DELIVERY.json'),JSON.stringify({revision:source.revision,assets,bundleEntries:Object.keys(entries)},null,2)+'\n');
console.log(JSON.stringify({site:'dist/',bundle,bundleBytes:archive.length,bundleSHA256:hash(archive),nativeFiles:source.files.filter(item=>item.path.startsWith('project/')).length,assets:assets.length}));
