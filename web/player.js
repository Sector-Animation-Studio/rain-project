const video=document.querySelector('#rain-video');
const source=document.querySelector('#rain-source');
const activeRenderer=document.querySelector('#active-renderer');
const buttons=[...document.querySelectorAll('[data-renderer]')];
for(const button of buttons){
  button.addEventListener('click',()=>{
    if(button.getAttribute('aria-pressed')==='true')return;
    const engine=button.dataset.renderer;
    if(!['orbit','prism'].includes(engine))return;
    video.pause();
    source.src='./media/rain-'+engine+'-hiphop-v1.mp4';
    video.poster='./media/rain-'+engine+'-hiphop-v1.webp';
    const name=engine==='orbit'?'Sector Orbit':'Sector Prism';
    video.setAttribute('aria-label','Rain breakdance with hip-hop music — '+name);
    activeRenderer.textContent=name;
    for(const item of buttons)item.setAttribute('aria-pressed',String(item===button));
    video.load();
  });
}
