import {currentCatalog,card} from './commerce.js';
const grid=document.getElementById('home-products');
currentCatalog().then(d=>{grid.innerHTML=d.products.filter(p=>p.available).slice(0,4).map(card).join('');}).catch(()=>{const note=document.createElement('p');note.className='catalog-status';note.textContent='Showing saved arrivals. Check the shop for availability.';grid.after(note);});
