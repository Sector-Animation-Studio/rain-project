import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const origin=(process.argv[2]||'https://sector-animation-studio.github.io/rain-project/').replace(/\/?$/,'/');
const output='test-results/hosted';
const expected=JSON.parse(await fs.readFile('dist/DELIVERY.json','utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const get=(file,options={})=>fetch(new URL(file,origin),{cache:'no-cache',signal:AbortSignal.timeout(60000),...options});
const report={origin,checkedAt:new Date().toISOString(),assets:[],ranges:[],passed:false};
try{
  for(const file of expected.assets){
    const response=await get(file.path);assert.equal(response.status,200,file.path);
    const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.length,file.bytes,file.path);assert.equal(hash(bytes),file.sha256,file.path);
    report.assets.push({path:file.path,bytes:bytes.length,sha256:file.sha256});
  }
  for(const file of expected.assets.filter(item=>item.path.endsWith('.mp4'))){
    const local=await fs.readFile('dist/'+file.path);
    const response=await get(file.path,{headers:{Range:'bytes=1000-1999'}});assert.equal(response.status,206,file.path);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),local.subarray(1000,2000));
    report.ranges.push({path:file.path,status:206,exactBytes:true});
  }
  report.passed=true;
}catch(error){report.failure=error.stack;throw error;}
finally{await fs.mkdir(output,{recursive:true});await fs.writeFile(output+'/report.json',JSON.stringify(report,null,2)+'\n');}
console.log('Hosted Rain site, both films, credits and complete editable project ZIP match the verified build; video seeking ranges passed.');
