import {readFile} from 'node:fs/promises';
const base='https://my-best-friends-closet.jabach0811.chatgpt.site/';
const routes=['index.html','shop.html','brands.html','consign.html','jewelry.html','hats.html','product.html','404.html'];
const pages=new Map();
for(const route of routes){
 const r=await fetch(new URL(route,base)); const html=await r.text(); pages.set(route,html);
 const local=await readFile(route,'utf8');
 const norm=s=>s.replace(/\r\n/g,'\n');let at=0;while(at<Math.min(norm(local).length,norm(html).length)&&norm(local)[at]===norm(html)[at])at++;
 console.log('FIRST_DIFF',route,JSON.stringify({local:norm(local).slice(at,at+160),live:norm(html).slice(at,at+160)}));
 console.log(JSON.stringify({route,status:r.status,bytes:Buffer.byteLength(html),matchesLocal:html.replace(/\r\n/g,'\n')===local.replace(/\r\n/g,'\n'),oldLinks:[...html.matchAll(/href="(https?:\/\/mbfctracy[^\"]*)"/g)].map(m=>m[1])}));
}
const issues=[]; const assets=new Set();
for(const [route,html] of pages){
 for(const m of html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').matchAll(/(?:href|src)="([^"]+)"/g)){
  const raw=m[1].replaceAll('&amp;','&');const u=new URL(raw,new URL(route,base));
  if(u.origin!==new URL(base).origin)continue;
  const name=u.pathname.slice(1)||'index.html';
  if(pages.has(name)&&u.hash&&!pages.get(name).includes(`id="${decodeURIComponent(u.hash.slice(1))}"`))issues.push({route,brokenAnchor:raw});
  if(!pages.has(name)&&!name.endsWith('.html'))assets.add(u.href.split('#')[0]);
 }
}
const queue=[...assets];const failures=[];
await Promise.all(Array.from({length:4},async()=>{while(queue.length){const url=queue.shift();const r=await fetch(url,{method:'HEAD'});if(!r.ok)failures.push({url,status:r.status});}}));
const local=JSON.parse(await readFile('products.json','utf8'));
const liveData=await (await fetch(new URL('products.json',base))).json();console.log('LIVE_DATA',JSON.stringify({count:liveData.length,matchesLocal:JSON.stringify(liveData)===JSON.stringify(local)}));
const handles=[...pages.get('shop.html').matchAll(/href="product.html\?p=([^"]+)"/g)].map(m=>m[1]);
console.log(JSON.stringify({issues,assetsChecked:assets.size,assetFailures:failures,cards:handles.length,products:local.length,missingProductData:handles.filter(h=>!local.some(p=>p.handle===h)),snapshotSoldOut:local.filter(p=>!p.available).length,oldPurchaseUrls:local.filter(p=>p.url.startsWith('https://mbfctracy.com/')).length}));
const old=await (await fetch('https://mbfctracy.com')).text();
console.log('ORIGINAL_LINKS',JSON.stringify([...new Set([...old.matchAll(/href="([^"]+)"/g)].map(m=>m[1]).filter(u=>/^\/(pages|collections|policies|account|cart|search)/.test(u)))]));
for(const p of local.slice(0,4)){
 const r=await fetch(p.url+'.js');if(!r.ok){console.log('PRODUCT_SAMPLE',p.handle,r.status);continue;}
 const live=await r.json();console.log('PRODUCT_SAMPLE',JSON.stringify({handle:p.handle,cachedPrice:p.price,livePrice:live.price/100,cachedAvailable:p.available,liveAvailable:live.available}));
}
