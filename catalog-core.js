// The store's permanent Shopify address. It keeps working after mbfctracy.com is pointed at this site.
export const STORE = 'https://my-best-friends-closet-tracy.myshopify.com';
export const COLLECTIONS = [['holiday-looks','New arrivals'],['as-seen-on-tiktok','As seen on TikTok'],['best-sellers','Best sellers'],['sale','Sale'],['fall-edit🍁','Fall edit'],['pre-fall-collection','Pre-fall'],['summer-collection','Spring / summer'],['new-retail','Tops'],['denim','Bottoms'],['resort-wear','Resort wear'],['dresses','Dresses'],['jumpsuits','Jumpsuits'],['shoes','Shoes'],['jewelry','Jewelry'],['accessories','Gifts & accessories']];
export const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const textOnly = s => String(s||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const key=s=>String(s||'').toLowerCase().replace(/\s*[&+]\s*/g,' and ').replace(/\s+/g,' ').trim();
// Shopify's vendor field is inconsistent (the shop's own name, "Wear Bracha", "Judy Blue Jeans"), so brands come from the title when it names one.
const BRANDS=new Map([...['Bracha','RD Style','Wishlist Apparel','NIKIBIKI','Judy Blue','Sadie & Sage','Reset By Jane','Project Social Tee','Sage the Label','Bila 77','Hope & Sunshine','mila + stevie',"Let's See Style",'ellison + young','Molly Bracken','The Darling Effect','Corkys','Zoe & Claire','Elan USA','Pinch','Flying Monkey','Steve Madden','Blue B','Lily Clothing','Lovesoft','Pretty Simple','Whim and Whimsy Gift Co.','Bluivy','Matisse','Coconuts by Matisse','Lucy Paris','Needii','Marrin Costello','Shu Shop','Vintage Havana','Top Moda','Gucci','Louis Vuitton'].map(b=>[key(b),b]),['judy blue jeans','Judy Blue'],['wear bracha','Bracha'],['coconut by matisse','Coconuts by Matisse'],['elan','Elan USA'],['project social t','Project Social Tee'],['vervet by flying monkey','Flying Monkey'],['nikibikib','NIKIBIKI'],['hiddenbrand',''],["my best friend's closet tracy",'']]);
function splitTitle(title,vendor){
 for(let i=title.length-1;i>0;i--){if(!/[\s:–-]/.test(title[i]))continue;const k=key(title.slice(0,i));if(BRANDS.has(k))return [BRANDS.get(k),title.slice(i)];if(k===key(vendor))return [vendor,title.slice(i)];}
 return [BRANDS.has(key(vendor))?BRANDS.get(key(vendor)):vendor,title];
}
function tidy(name){
 name=name.replace(/^[\s:–|-]+/,'').replace(/\s+\|.*$/,'').replace(/\s*:\s*/g,' - ').replace(/\s+/g,' ').trim();
 const loud=(name.match(/\b[A-Z]{4,}\b/g)||[]).length>1;
 name=name.replace(/\b[A-Z]{3,}\b/g,(w,i)=>!loud&&w.length<5?w:i&&/^(AND|THE|WITH|FOR)$/.test(w)?w.toLowerCase():w[0]+w.slice(1).toLowerCase()).replace(/\bFress\b/g,'Dress').replace(/\bRushed\b/g,'Ruched').replace(/\bSliver\b/g,'Silver');
 return name.charAt(0).toUpperCase()+name.slice(1);
}
const calm=l=>/[a-z]/.test(l)||(l.match(/[A-Z]{3,}/g)||[]).length<2?l:l.toLowerCase().replace(/[a-z]/,c=>c.toUpperCase());
// Sorted by what the item is first; the store's collections are only a fallback because several are misfiled there.
const AISLES=[['Sets, Rompers & Swim',/\b(romper|jumpsuit|bikini|swimsuit|one[- ]piece|two[- ]piece|2-piece|set)\b/i],['Dresses',/\bdress/i],['Shoes',/\b(boots?|sandals?|heels?|heeled|mules?|sneakers?|flats?|slides?|platform|slippers?|loafers?|clogs?|wedges?)\b/i],['Accessories & More',/\b(bags?|handbag|backpack|tote|wallet|clutch|purse|hat|cap|scarf|socks?|belt|sunglasses)\b/i],['Jewelry',/\b(necklace|earrings?|hoops|huggies|bracelet|ring|anklet|chain)\b/i],['Tops & Layers',/\b(tops?|tanks?|tees?|shirt|blouse|camisole|cami|bandeau|sweater|cardigan|vest|jacket|coat|blazer|hoodie|pullover|button (up|down))\b/i],['Bottoms',/\b(pants?|jeans?|skirt|skort|shorts?|trousers|leggings)\b/i]];
const SHELVES=[['dresses','Dresses'],['jumpsuits','Sets, Rompers & Swim'],['shoes','Shoes'],['jewelry','Jewelry'],['denim','Bottoms'],['new-retail','Tops & Layers'],['accessories','Accessories & More']];
const aisle=(name,collections)=>AISLES.find(([,r])=>r.test(name))?.[0]||SHELVES.find(([h])=>collections.some(c=>c.handle===h))?.[1]||'Accessories & More';
export function normalizeProduct(p, previous = {}, cents = false) {
 const variants=(p.variants||[]).map(v=>({id:String(v.id),name:(v.title||'Default Title').replace(/\bSliver\b/g,'Silver').replace(/\s*\/\s*\$[\d.]+$/,''),available:!!v.available,price:Number(v.price)/(cents?100:1),compareAt:Number(v.compare_at_price||0)/(cents?100:1),options:v.options||[v.option1,v.option2,v.option3].filter(Boolean)}));
 const lines=String(p.body_html||p.description||'').split(/<\/p>|<br\s*\/?>|<\/li>|<\/div>|<\/h[1-6]>|\n/i).map(l=>calm(textOnly(l).replace(/^[-•*]\s+/,''))).filter(l=>l&&!/^import duties/i.test(l)&&(l.match(/,/g)||[]).length<15);
 const tags=Array.isArray(p.tags)?p.tags.join(' '):p.tags||'';
 const collections=p.collections||previous.collections||[];
 const origin=/consign|pre[ -]?loved|pre[ -]?owned/i.test(tags+' '+collections.map(c=>c.handle).join(' '))||previous.origin==='consigned'?'consigned':/\bnew retail\b/i.test(tags)?'new':'boutique';
 const [vendor,rest]=splitTitle(String(p.title||previous.title||'').replace(/\s+/g,' ').trim(),p.vendor||'');
 const name=tidy(rest);
 return {handle:p.handle,title:vendor?`${vendor} ${name}`:name,name,vendor,group:aisle(name,collections),origin,price:Math.min(...variants.map(v=>v.price)),available:variants.some(v=>v.available),variants,sizes:variants,images:(p.images||[]).map(i=>typeof i==='string'?i:i.src).filter(Boolean).map(s=>s.startsWith('//')?'https:'+s:s),blurb:lines[0]||'',body:lines.slice(1),url:`${STORE}/products/${p.handle}`,publishedAt:p.published_at||'',collections};
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
 for(let page=1;page<=40;page++) {const d=await fetchJson(`${STORE}${path}?limit=250&page=${page}`);if(!Array.isArray(d.products))throw new Error('Invalid catalog');result.push(...d.products);if(d.products.length<250)return result;}
 throw new Error('Catalog exceeded safety limit');
}
export async function catalog(previous=[]) {
 const old=new Map(previous.map(p=>[p.handle,p]));const products=[];let after=null;
 for(let page=0;page<100;page++){
  const d=await storeQuery(`query($after:String){products(first:25,after:$after){nodes{${PRODUCT_FIELDS}} pageInfo{hasNextPage endCursor}}}`,{after});
  // Listings the shop hasn't finished yet (no photo or no price) stay off the floor.
  for(const p of d.products.nodes){const item=fromGraph(p,old.get(p.handle));if(item.images.length&&item.price>0)products.push(item);}
  if(!d.products.pageInfo.hasNextPage)break;
  after=d.products.pageInfo.endCursor;if(page===99)throw new Error('Catalog exceeds limit');
 }
 if(!products.length)throw new Error('Empty catalog');products.sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
 const collections=new Map(COLLECTIONS);products.forEach(p=>p.collections.forEach(c=>{if(!collections.has(c.handle))collections.set(c.handle,c.title||c.handle);}));
 return {updatedAt:new Date().toISOString(),products,collections:[...collections].map(([handle,title])=>({handle,title}))};
}
const PRODUCT_FIELDS=`handle title vendor descriptionHtml publishedAt images(first:20){nodes{url} pageInfo{hasNextPage}} collections(first:30){nodes{handle title} pageInfo{hasNextPage}} variants(first:100){nodes{id title availableForSale price{amount currencyCode} compareAtPrice{amount} selectedOptions{name value}} pageInfo{hasNextPage}}`;
export async function storeQuery(query,variables={}){
 const r=await fetch(`${STORE}/api/2026-04/graphql.json`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw new Error('Store temporarily unavailable');const d=await r.json();if(d.errors||!d.data)throw new Error('Store query unavailable: '+JSON.stringify(d.errors));return d.data;
}
function fromGraph(p,previous){
 if(p.variants.pageInfo.hasNextPage||p.images.pageInfo.hasNextPage||p.collections.pageInfo.hasNextPage)throw new Error('Product requires expanded pagination');
 if(p.variants.nodes.some(v=>v.price.currencyCode!=='USD'))throw new Error('Unexpected currency');
 return normalizeProduct({handle:p.handle,title:p.title,vendor:p.vendor,description:p.descriptionHtml,published_at:p.publishedAt,collections:p.collections.nodes.map(c=>({handle:c.handle,title:c.title})),images:p.images.nodes.map(i=>i.url),variants:p.variants.nodes.map(v=>({id:v.id.split('/').pop(),title:v.title,available:v.availableForSale,price:v.price.amount,compare_at_price:v.compareAtPrice?.amount,options:v.selectedOptions.map(o=>o.value)}))},previous);
}
export async function product(handle,previous){const d=await storeQuery(`query($handle:String!){product(handle:$handle){${PRODUCT_FIELDS}}}`,{handle});if(!d.product)throw Object.assign(new Error('Not found'),{status:404});return fromGraph(d.product,previous);}
export const money=n=>{n=Number(n);const d=Number.isInteger(n)?0:2;return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:d,maximumFractionDigits:d}).format(n);};
export const sized=(url,w)=>url+(url.includes('?')?'&':'?')+'width='+w;
const SIZE=/^(x*(s|m|l|small|medium|large)|extra (small|large)|s\/m|m\/l|\d{1,2}(\.5)?(\(\d+\))?)$/i;
// The store types section headings ("Care Instructions", "Fit:") on their own line between the bullets.
const isHeading=t=>/:$/.test(t)||t.split(' ').length<=3&&!/[.,;]$/.test(t)&&t.split(' ').every(w=>/^[A-Z(]/.test(w)||w.length<=3);
export function buyHtml(p,picked=''){
 const options=p.variants.filter(v=>v.name!=='Default Title');
 const kinds=new Set(options.flatMap(v=>v.name.split(' / ').map(s=>SIZE.test(s)?'Size':'Color')));
 if(!picked&&options.length===1)picked=options[0].id;
 const choice=options.length?`<fieldset class="size-picker"><legend>${kinds.size>1?'Size / color':[...kinds][0]}</legend>${options.map(v=>`<label><input type="radio" name="variant" value="${esc(v.id)}" required${v.available?'':' disabled'}${v.available&&v.id===picked?' checked':''}><span>${esc(v.name)}${v.available?'':'<span class="visually-hidden"> (sold out)</span>'}</span></label>`).join('')}</fieldset>`:`<input type="hidden" name="variant" value="${esc(p.variants[0]?.id)}">`;
 return `<p class="pdp-price">${new Set(p.variants.map(v=>v.price)).size>1?'From ':''}${money(p.price)}${p.available?'':' <span class="pdp-sold">Sold out</span>'}</p><form id="add-form" class="purchase-form">${choice}<label for="quantity">Quantity</label><input id="quantity" name="quantity" type="number" inputmode="numeric" min="1" max="20" step="1" value="1" required><div class="pdp-actions"><button class="btn" id="add-button" type="submit"${p.available?'':' disabled'}>${p.available?'Add to bag':'Sold out'}</button><a class="btn btn-ghost" href="cart.html">View bag</a></div><p id="purchase-status" role="status"></p></form>`;
}
export function productHtml(p){
 const shots=p.images.map(s=>esc(sized(s,960)));
 const gallery=shots.length?`<div class="pdp-stage"><img id="pdp-hero" src="${shots[0]}" alt="${esc(p.title)}" width="480" height="600" fetchpriority="high"></div>${shots.length>1?`<ul class="pdp-thumbs">${p.images.map((s,i)=>`<li><button type="button" class="pdp-thumb" aria-pressed="${!i}" data-src="${shots[i]}" aria-label="Photo ${i+1}"><img src="${esc(sized(s,200))}" alt="" loading="lazy"></button></li>`).join('')}</ul>`:''}`:'<p class="image-unavailable">Photo unavailable</p>';
 const details=p.body.map(t=>isHeading(t)?`<p class="pdp-label">${esc(t.replace(/:$/,''))}</p>`:`<p class="pdp-detail">${esc(t)}</p>`).join('');
 return `<nav class="pdp-crumbs" aria-label="Breadcrumb"><a href="shop.html">Shop</a><span aria-hidden="true">/</span><a href="shop.html?category=${encodeURIComponent(p.group)}">${esc(p.group)}</a></nav><div class="pdp-layout"><div class="pdp-gallery">${gallery}</div><div class="pdp-info">${p.vendor?`<p class="eyebrow">${esc(p.vendor)}</p>`:''}<h1>${esc(p.name)}</h1>${p.origin==='consigned'?'<p class="pdp-origin"><span class="tag tag-consigned">Designer resale</span> Pre-loved. Check the photos for condition.</p>':''}<div class="pdp-buy">${buyHtml(p)}</div><p class="pdp-fine">Checkout happens on Shopify. Changed your mind? Return it within 14 days for store credit. <a href="policies.html#returns">How returns work</a></p>${p.blurb?`<p class="lede">${esc(p.blurb)}</p>`:''}${details?`<div class="pdp-details">${details}</div>`:''}</div></div>`;
}
export function card(p,index=0){const tag=!p.available?'<span class="tag tag-sold">Sold out</span>':p.origin==='consigned'?'<span class="tag tag-consigned">Designer resale</span>':'';return `<li data-group="${esc(p.group)}" data-price="${p.price}" data-name="${esc(p.title.toLowerCase())}" data-index="${index}" data-handle="${esc(p.handle)}"><a href="product.html?p=${encodeURIComponent(p.handle)}"><div class="product-frame">${p.images[0]?`<img src="${esc(sized(p.images[0],533))}" alt="" loading="lazy" width="533" height="666">`:'<span class="image-unavailable">Photo unavailable</span>'}${tag}</div>${p.vendor?`<p class="card-brand">${esc(p.vendor)}</p>`:''}<h3>${esc(p.name)}</h3><p class="price">${money(p.price)}</p></a></li>`;}
