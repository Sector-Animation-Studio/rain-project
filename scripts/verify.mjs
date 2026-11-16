import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {unzipSync} from 'fflate';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const source=JSON.parse(await fs.readFile('PROVENANCE.json','utf8'));
const delivery=JSON.parse(await fs.readFile('dist/DELIVERY.json','utf8'));
for(const file of source.files){const bytes=await fs.readFile(file.path);assert.equal(bytes.length,file.bytes,file.path);assert.equal(hash(bytes),file.sha256,file.path);}
for(const file of delivery.assets){const bytes=await fs.readFile('dist/'+file.path);assert.equal(bytes.length,file.bytes,file.path);assert.equal(hash(bytes),file.sha256,file.path);}
const p=JSON.parse(await fs.readFile('project/project.studio.json','utf8'));
assert.equal(p.durationFrames,1035);assert.equal(p.fps,30);assert.equal(p.width,1920);assert.equal(p.height,1080);
for(const asset of p.assets){assert(asset.file.startsWith('assets/')&&!asset.file.includes('..'));assert.equal(hash(await fs.readFile('project/'+asset.file)),asset.hash);}
assert.equal(p.audioTracks.length,1);assert.equal(p.audioTracks[0].durationFrames,1035);
const entries=unzipSync(await fs.readFile('dist/downloads/Rain-Sector-project-hiphop-v1.zip'));
assert.deepEqual(Object.keys(entries).sort(),delivery.bundleEntries.sort());
for(const file of source.files.filter(item=>item.path.startsWith('project/'))){assert.equal(hash(entries['Rain-project/'+file.path.slice(8)]),file.sha256,file.path);}
const html=await fs.readFile('dist/index.html','utf8');
assert(!html.includes('__PROJECT_SIZE__'));assert(!/src="\//.test(html),'GitHub Pages media and scripts need relative paths');
assert(html.includes('Hip Hop 1')&&html.includes('CC BY 4.0'));
console.log('Verified original project/media hashes, portable ZIP dependencies, soundtrack coverage and GitHub Pages paths.');
