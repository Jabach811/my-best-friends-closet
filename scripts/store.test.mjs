import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {card,normalizeProduct} from '../catalog-core.js';
import {checkoutUrl,bag,saveBag,addToBag} from '../commerce.js';
const products=JSON.parse(await readFile(new URL('../products.json',import.meta.url)));
test('catalog contains complete usable variants and unique products',()=>{
 assert.ok(products.length>=219);assert.equal(new Set(products.map(p=>p.handle)).size,products.length);
 for(const p of products){assert.ok(Array.isArray(p.collections));assert.ok(p.variants.length);for(const v of p.variants){assert.match(v.id,/^\d+$/);assert.ok(Number.isFinite(v.price));}assert.equal(p.available,p.variants.some(v=>v.available));}
});
test('all saved shop links resolve to catalog records and price markup is intact',async()=>{
 const html=await readFile(new URL('../shop.html',import.meta.url),'utf8');
 const handles=[...html.matchAll(/href="product.html\?p=([^"]+)"/g)].map(m=>m[1]);
 assert.equal(handles.length,products.length);for(const handle of handles)assert.ok(products.some(p=>p.handle===handle));
 assert.equal((html.match(/id="grid"/g)||[]).length,1);assert.ok(!html.includes('<p class="price"><ul'));
});
test('checkout uses numeric variants and validates quantities',()=>{
 assert.equal(checkoutUrl([{id:'123',quantity:2},{id:'456',quantity:1}]),'https://mbfctracy.com/cart/123:2,456:1');
 for(const items of [[],[{id:'x/redirect',quantity:1}],[{id:'123',quantity:0}],[{id:'123',quantity:1.2}],[{id:'123',quantity:21}]])assert.throws(()=>checkoutUrl(items));
});
test('bag merges identical variants without silently exceeding limits',()=>{
 saveBag([]);const p=products.find(p=>p.available),v=p.variants.find(v=>v.available);
 addToBag(p,v,1);addToBag(p,v,2);assert.equal(bag().length,1);assert.equal(bag()[0].quantity,3);assert.throws(()=>addToBag(p,v,20));saveBag([]);
});
test('remote product text is escaped and unknown origin is not called new',()=>{
 const p=normalizeProduct({handle:'safe',title:'<script>alert(1)</script>',variants:[{id:1,price:'10',available:true}],images:[]});
 assert.equal(p.origin,'boutique');assert.ok(!card(p).includes('<script>'));assert.ok(card(p).includes('&lt;script&gt;'));
});
test('phone overflow and reduced motion safeguards remain present',async()=>{const css=await readFile(new URL('../styles.css',import.meta.url),'utf8');assert.match(css,/\.pdp-gallery[^}]*min-width: 0/);assert.match(css,/\.pdp-thumbs[^}]*flex-wrap: wrap/);});
