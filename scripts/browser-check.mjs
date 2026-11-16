import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const origin=(process.env.RAIN_URL||'http://127.0.0.1:4188/rain-project/').replace(/\/?$/,'/');
const output=process.env.RAIN_REPORT_DIR||'test-results/browser';
const server=process.env.RAIN_URL?null:spawn(process.execPath,['scripts/serve.mjs'],{stdio:'pipe',windowsHide:true});
const report={origin,videos:[],accessibility:[],errors:[],passed:false};let browser,page;
await fs.mkdir(output,{recursive:true});
try{
  let ready=false;for(let i=0;i<100;i++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}assert(ready,'Rain site must be available');
  browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});const context=await browser.newContext();page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:width===390?844:1000});await page.goto(origin,{waitUntil:'networkidle'});
    assert.equal(await page.getByRole('heading',{level:1}).innerText(),'Rain in motion.');
    await page.locator('.performance').screenshot({path:output+'/poster-'+width+'.png'});
    for(const engine of ['Sector Orbit','Sector Prism']){
      await page.getByRole('group',{name:'Choose the film renderer'}).getByRole('button',{name:engine,exact:true}).click();
      const video=page.locator('#rain-video');await video.scrollIntoViewIfNeeded();
      const result=await video.evaluate(async v=>{
        await v.play();await new Promise(r=>setTimeout(r,500));v.pause();const decodedAudioBytes=v.webkitAudioDecodedByteCount;
        await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Seek timeout')),15000);v.addEventListener('seeked',()=>{clearTimeout(timer);resolve();},{once:true});v.currentTime=30;});
        v.textTracks[0].mode='showing';await new Promise(r=>setTimeout(r,350));
        return {duration:v.duration,time:v.currentTime,width:v.videoWidth,height:v.videoHeight,decodedAudioBytes,muted:v.muted,activeCues:v.textTracks[0].activeCues?.length,source:v.currentSrc,error:v.error?.code};
      });
      assert(!result.error);assert.equal(result.duration,34.5);assert.equal(result.width,1920);assert.equal(result.height,1080);assert(result.time>=29.9);assert(result.decodedAudioBytes>0);assert.equal(result.muted,false);assert(result.activeCues>0);assert(result.source.startsWith(origin+'media/'));
      report.videos.push({engine,viewportWidth:width,...result});
    }
    assert(await page.getByRole('link',{name:/Download Rain project/}).isVisible());
    const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(layout.scroll<=layout.width+1);
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
    report.accessibility.push({width,violations:0});await page.screenshot({path:output+'/rain-'+width+'.png',fullPage:true});
  }
  assert.deepEqual(report.errors,[]);report.passed=true;
}catch(error){report.failure=error.stack;await page?.screenshot({path:output+'/failure.png',fullPage:true}).catch(()=>{});throw error;}
finally{await browser?.close();server?.kill();await fs.writeFile(output+'/report.json',JSON.stringify(report,null,2)+'\n');}
console.log('Rain browser checks passed: four video/viewport cases with audio, seeking, captions, project link and accessibility.');
