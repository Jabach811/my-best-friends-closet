import {bag} from './commerce.js';
function update(){document.querySelectorAll('[data-bag-count]').forEach(el=>el.textContent=bag().reduce((n,p)=>n+p.quantity,0));}
update();addEventListener('bagchange',update);addEventListener('storage',update);
