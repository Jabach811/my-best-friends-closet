import {currentProduct,addToBag,money} from './commerce.js';
import {productHtml,buyHtml} from './catalog-core.js';
const pdp=document.getElementById('pdp'),handle=new URLSearchParams(location.search).get('p'),saved=document.getElementById('product-data');
const GONE='This item is no longer available.';
let item=saved&&JSON.parse(saved.textContent);

function notFound(heading,note){
  document.title=`${heading} | My Best Friend's Closet`;
  pdp.removeAttribute('aria-busy');
  pdp.innerHTML=`<div class="pdp-gone"><h1>${heading}</h1><p class="lede">${note}</p><div class="hero-actions"><a class="btn" href="shop.html">Back to the shop</a><a class="btn btn-ghost" href="tel:+12098336232">Call the shop</a></div></div>`;
}

// Some of the store's photos are only ~250px wide; on wide screens the frame shrinks to fit instead of stretching them soft.
function fit(){
  const hero=document.getElementById('pdp-hero');if(!hero)return;
  const set=()=>{if(hero.naturalWidth)hero.closest('.pdp-gallery').style.setProperty('--photo-width',Math.max(320,Math.min(hero.naturalWidth,480))+'px');};
  hero.complete?set():hero.addEventListener('load',set,{once:true});
}

function restock(fresh){
  const picked=document.getElementById('add-form')?.elements.variant?.value||'';
  const changed=JSON.stringify(fresh.variants)!==JSON.stringify(item.variants);
  item=fresh;
  if(changed)pdp.querySelector('.pdp-buy').innerHTML=buyHtml(fresh,picked);
}

pdp.addEventListener('click',e=>{
  const thumb=e.target.closest('.pdp-thumb');if(!thumb)return;
  document.getElementById('pdp-hero').src=thumb.dataset.src;
  pdp.querySelectorAll('.pdp-thumb').forEach(b=>b.setAttribute('aria-pressed',String(b===thumb)));
});
pdp.addEventListener('change',e=>{
  if(e.target.name!=='variant')return;
  const v=item.variants.find(v=>v.id===e.target.value);if(v)pdp.querySelector('.pdp-price').textContent=money(v.price);
});
pdp.addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.target,status=form.querySelector('#purchase-status'),button=form.querySelector('#add-button');
  const id=form.elements.variant.value,quantity=Number(form.elements.quantity.value);
  if(!id||!Number.isInteger(quantity)||quantity<1||quantity>20)return;
  button.disabled=true;status.textContent='Checking it’s still here…';
  try{
    const fresh=await currentProduct(item.handle),v=fresh.variants.find(v=>v.id===id);
    if(!v?.available)throw new Error('Sorry, that one just sold.');
    addToBag(fresh,v,quantity);status.textContent=quantity>1?`Added ${quantity} to your bag.`:'Added to your bag.';
  }catch(err){status.textContent=err.message;}
  finally{button.disabled=false;}
});

if(item){
  fit();
  currentProduct(item.handle).then(restock,e=>{if(e.message===GONE)restock({...item,available:false,variants:item.variants.map(v=>({...v,available:false}))});});
}else if(!handle)notFound('No piece picked','Head back to the shop and choose something.');
else currentProduct(handle).then(p=>{
  item=p;document.title=`${p.title} | My Best Friend's Closet`;pdp.removeAttribute('aria-busy');pdp.innerHTML=productHtml(p);fit();
},e=>e.message===GONE?notFound('This piece has sold','See what’s new on the rack, or call the shop to ask about it.'):notFound('We couldn’t reach the store','Give the page a refresh, or call the shop and we’ll tell you about it.'));
