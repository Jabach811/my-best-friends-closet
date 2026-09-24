export const COLLECTIONS = [['holiday-looks','New arrivals'],['as-seen-on-tiktok','As seen on TikTok'],['best-sellers','Best sellers'],['sale','Sale'],['summer-collection','Spring / summer'],['new-retail','Tops'],['denim','Bottoms'],['resort-wear','Resort wear'],['dresses','Dresses'],['jumpsuits','Jumpsuits'],['shoes','Shoes'],['jewelry','Jewelry'],['accessories','Gifts & accessories']];
export const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const textOnly = s => String(s||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
export function normalizeProduct(p, previous = {}, cents = false) {
 const variants=(p.variants||[]).map(v=>({id:String(v.id),name:v.title||'Default Title',available:!!v.available,price:Number(v.price)/(cents?100:1),compareAt:Number(v.compare_at_price||0)/(cents?100:1),options:v.options||[v.option1,v.option2,v.option3].filter(Boolean)}));
 const lines=String(p.body_html||p.description||'').split(/<\/p>|<br\s*\/?>|<\/li>|<\/h[1-6]>/i).map(textOnly).filter(Boolean);
 const tags=Array.isArray(p.tags)?p.tags.join(' '):p.tags||'';
 const origin=/consign|pre[ -]?loved|pre[ -]?owned/i.test(tags)||previous.origin==='consigned'?'consigned':/\bnew retail\b/i.test(tags)?'new':'boutique';
 const title=p.title||previous.title||'';
 const group=previous.group||(/dress/i.test(title)?'Dresses':/necklace|bracelet|earring|ring|hoop|chain/i.test(title)?'Jewelry':/shoe|heel|sandal|boot/i.test(title)?'Shoes':/pant|jean|skirt|short/i.test(title)?'Bottoms':/romper|jumpsuit|swim/i.test(title)?'Sets, Rompers & Swim':/top|tee|tank|shirt|sweater|cardigan/i.test(title)?'Tops & Layers':'Accessories & More');
 return {handle:p.handle,title,vendor:p.vendor||'',group,origin,price:Math.min(...variants.map(v=>v.price)),available:variants.some(v=>v.available),variants,sizes:variants,images:(p.images||[]).map(i=>typeof i==='string'?i:i.src).filter(Boolean).map(s=>s.startsWith('//')?'https:'+s:s),blurb:lines[0]||'',body:lines.slice(1),url:`https://mbfctracy.com/products/${p.handle}`,publishedAt:p.published_at||'',collections:previous.collections||[]};
}
export async function fetchJson(url) {
 let last;
 for(let i=0;i<3;i++){
  try {const r=await fetch(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(12000)});if(r.status===404)throw Object.assign(new Error('Not found'),{status:404});if(!r.ok)throw new Error(`Store response ${r.status}`);return await r.json();}
  catch(e){last=e;if(e.status===404)throw e;if(i<2)await new Promise(r=>setTimeout(r,400*(i+1)));}
 }
 throw last;
}
export async function fetchAll(path) {
 const result=[];
 for(let page=1;page<=40;page++) {const d=await fetchJson(`https://mbfctracy.com${path}?limit=250&page=${page}`);if(!Array.isArray(d.products))throw new Error('Invalid catalog');result.push(...d.products);if(d.products.length<250)return result;}
 throw new Error('Catalog exceeded safety limit');
}
export async function catalog(previous=[]) {
 const old=new Map(previous.map(p=>[p.handle,p]));const products=[];let after=null;
 for(let page=0;page<100;page++){
  const d=await storeQuery(`query($after:String){products(first:25,after:$after){nodes{${PRODUCT_FIELDS}} pageInfo{hasNextPage endCursor}}}`,{after});
  for(const p of d.products.nodes)products.push(fromGraph(p,old.get(p.handle)));
  if(!d.products.pageInfo.hasNextPage)break;
  after=d.products.pageInfo.endCursor;if(page===99)throw new Error('Catalog exceeds limit');
 }
 if(!products.length)throw new Error('Empty catalog');products.sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
 const collections=new Map(COLLECTIONS);products.forEach(p=>p.collections.forEach(c=>{if(!collections.has(c.handle))collections.set(c.handle,c.title||c.handle);}));
 return {updatedAt:new Date().toISOString(),products,collections:[...collections].map(([handle,title])=>({handle,title}))};
}
const PRODUCT_FIELDS=`handle title vendor descriptionHtml publishedAt images(first:20){nodes{url} pageInfo{hasNextPage}} collections(first:30){nodes{handle title} pageInfo{hasNextPage}} variants(first:100){nodes{id title availableForSale price{amount currencyCode} compareAtPrice{amount} selectedOptions{name value}} pageInfo{hasNextPage}}`;
export async function storeQuery(query,variables={}){
 const r=await fetch('https://mbfctracy.com/api/2026-04/graphql.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw new Error('Store temporarily unavailable');const d=await r.json();if(d.errors||!d.data)throw new Error('Store query unavailable: '+JSON.stringify(d.errors));return d.data;
}
function fromGraph(p,previous){
 if(p.variants.pageInfo.hasNextPage||p.images.pageInfo.hasNextPage||p.collections.pageInfo.hasNextPage)throw new Error('Product requires expanded pagination');
 if(p.variants.nodes.some(v=>v.price.currencyCode!=='USD'))throw new Error('Unexpected currency');
 const result=normalizeProduct({handle:p.handle,title:p.title,vendor:p.vendor,description:p.descriptionHtml,published_at:p.publishedAt,images:p.images.nodes.map(i=>i.url),variants:p.variants.nodes.map(v=>({id:v.id.split('/').pop(),title:v.title,available:v.availableForSale,price:v.price.amount,compare_at_price:v.compareAtPrice?.amount,options:v.selectedOptions.map(o=>o.value)}))},previous);
 result.collections=p.collections.nodes.map(c=>({handle:c.handle,title:c.title}));
 const groups=[['dresses','Dresses'],['jumpsuits','Sets, Rompers & Swim'],['shoes','Shoes'],['jewelry','Jewelry'],['denim','Bottoms'],['new-retail','Tops & Layers'],['accessories','Accessories & More']];
 const match=groups.find(([handle])=>result.collections.some(c=>c.handle===handle));if(match)result.group=match[1];return result;
}
export async function product(handle,previous){const d=await storeQuery(`query($handle:String!){product(handle:$handle){${PRODUCT_FIELDS}}}`,{handle});if(!d.product)throw Object.assign(new Error('Not found'),{status:404});return fromGraph(d.product,previous);}
export const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n));
export function card(p,index=0){const label=p.origin==='consigned'?'Consigned':p.origin==='new'?'New':'Boutique';return `<li data-group="${esc(p.group)}" data-price="${p.price}" data-name="${esc((p.title+' '+p.vendor).toLowerCase())}" data-index="${index}" data-origin="${p.origin}" data-handle="${esc(p.handle)}"><a href="product.html?p=${encodeURIComponent(p.handle)}"><div class="product-frame">${p.images[0]?`<img src="${esc(p.images[0]+(p.images[0].includes('?')?'&':'?')+'width=533')}" alt="" loading="lazy" width="533" height="666">`:'<span class="image-unavailable">Photo unavailable</span>'}<span class="tag ${p.available?'':'tag-sold'}">${p.available?label:'Sold out'}</span></div><h3>${esc(p.title)}</h3><p class="price">${money(p.price)}</p></a></li>`;}
