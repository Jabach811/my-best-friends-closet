import {card,currentCatalog,esc} from './commerce.js';
const grid=document.getElementById('grid'),search=document.getElementById('search'),sort=document.getElementById('sort'),count=document.getElementById('count'),empty=document.getElementById('empty');
const pills=[...document.querySelectorAll('.pill')],collection=document.getElementById('collection'),stock=document.getElementById('in-stock'),status=document.getElementById('catalog-status'),toggle=document.querySelector('.filter-toggle');
let products=window.MBFC_PRODUCTS||[];let limit=36;
const state={group:'*',q:'',sort:'new',collection:'',stock:false};
function read(){const q=new URLSearchParams(location.search);state.group=q.get('category')||'*';if(!pills.some(p=>p.dataset.filter===state.group))state.group='*';state.q=q.get('q')||'';state.sort=['new','low','high','az'].includes(q.get('sort'))?q.get('sort'):'new';state.collection=q.get('collection')||'';if(![...collection.options].some(o=>o.value===state.collection))state.collection='';state.stock=q.get('stock')==='1';search.value=state.q;sort.value=state.sort;collection.value=state.collection;stock.checked=state.stock;}
function write(replace=false){const q=new URLSearchParams();if(state.group!=='*')q.set('category',state.group);if(state.q)q.set('q',state.q);if(state.sort!=='new')q.set('sort',state.sort);if(state.collection)q.set('collection',state.collection);if(state.stock)q.set('stock','1');history[replace?'replaceState':'pushState']({},'',location.pathname+(q.size?'?'+q:''));}
function render(){const q=state.q.trim().toLowerCase();let list=products.filter(p=>(state.group==='*'||p.group===state.group)&&(!q||(p.title+' '+p.vendor).toLowerCase().includes(q))&&(!state.collection||p.collections.some(c=>c.handle===state.collection))&&(!state.stock||p.available));
 list.sort({new:(a,b)=>b.publishedAt.localeCompare(a.publishedAt),low:(a,b)=>a.price-b.price,high:(a,b)=>b.price-a.price,az:(a,b)=>a.title.localeCompare(b.title)}[state.sort]);
 count.textContent=list.length;grid.innerHTML=list.slice(0,limit).map(card).join('');empty.hidden=!!list.length;document.getElementById('load-more').hidden=list.length<=limit;
 pills.forEach(p=>{const active=p.dataset.filter===state.group;p.classList.toggle('is-active',active);p.setAttribute('aria-pressed',String(active));});
 const set=(state.sort!=='new')+!!state.collection+state.stock;toggle.textContent='Sort & filter'+(set?` (${set})`:'');
}
function change(){limit=36;write();render();}
toggle.addEventListener('click',()=>toggle.setAttribute('aria-expanded',String(toggle.getAttribute('aria-expanded')!=='true')));
pills.forEach(p=>p.addEventListener('click',()=>{state.group=p.dataset.filter;change();}));
let typing;search.addEventListener('input',()=>{clearTimeout(typing);typing=setTimeout(()=>{state.q=search.value;limit=36;write(true);render();},150);});
sort.addEventListener('change',()=>{state.sort=sort.value;change();});collection.addEventListener('change',()=>{state.collection=collection.value;change();});stock.addEventListener('change',()=>{state.stock=stock.checked;change();});
document.querySelectorAll('[data-clear-filters]').forEach(b=>b.addEventListener('click',()=>{Object.assign(state,{group:'*',q:'',sort:'new',collection:'',stock:false});write();read();limit=36;render();search.focus();}));
document.getElementById('load-more').addEventListener('click',()=>{const oldCount=grid.children.length;limit+=36;render();grid.children[oldCount]?.querySelector('a')?.focus();});
addEventListener('popstate',()=>{read();limit=36;render();});read();render();
status.textContent='Checking the latest arrivals…';
currentCatalog().then(d=>{products=d.products;collection.innerHTML='<option value="">All collections</option>'+d.collections.map(c=>`<option value="${esc(c.handle)}">${esc(c.title)}</option>`).join('');collection.value=state.collection;status.textContent='Updated '+new Date(d.updatedAt).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+'. Stock is confirmed at checkout.';render();}).catch(()=>{status.textContent='Showing the rack as of '+new Date(window.MBFC_CATALOG.updatedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})+'. Stock is confirmed at checkout.';});
