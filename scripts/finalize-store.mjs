import {readFile,writeFile} from 'node:fs/promises';
for(const file of ['index.html','shop.html','consign.html','brands.html','jewelry.html','hats.html','product.html','contact.html','policies.html','cart.html']){
 let s=await readFile(file,'utf8');s=s.replaceAll('https://mbfctracy.com/contact#contact_form','https://mbfctracy.com/contact#ContactFooter');
 if(file==='index.html')s=s.replace('Shop New Arrivals</a>','Shop New Arrivals</a>').replace('<ul class="product-grid">','<ul class="product-grid" id="home-products">');
 if(file==='index.html'&&!s.includes('home-products.js'))s=s.replace('</body>','<script type="module" src="home-products.js"></script></body>');
 await writeFile(file,s);
}
