import {currentProduct,addToBag} from './commerce.js';
(async () => {
  const pdp = document.getElementById('pdp');
  const handle = new URLSearchParams(location.search).get('p');

  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const money = (n) => '$' + (Number(n) % 1 === 0 ? Number(n).toFixed(0) : Number(n).toFixed(2));
  // Shopify serves a resized copy when the CDN url carries a width
  const sized = (url, w) => {
    const [base, query] = url.split('?');
    return `${base}?${query ? query + '&' : ''}width=${w}`;
  };

  const notFound = (heading, note) => {
    document.title = `${heading} | My Best Friend's Closet — Tracy, CA`;
    pdp.removeAttribute('aria-busy');
    pdp.innerHTML = `
      <div class="pdp-gone">
        <p class="eyebrow">Off the rack</p>
        <h1>${esc(heading)}</h1>
        <p class="lede">${esc(note)}</p>
        <div class="hero-actions">
          <a class="btn" href="shop.html">Back to the closet</a>
          <a class="btn btn-ghost" href="tel:+12098336232">Call the shop</a>
        </div>
      </div>`;
  };

  const sizeRow = (sizes) => {
    if (!sizes.length || (sizes.length === 1 && /default/i.test(sizes[0].name))) return '';
    const chips = sizes.map((s) =>
      `<li class="size-chip${s.available ? '' : ' is-gone'}">${esc(s.name)}${s.available ? '' : '<span class="visually-hidden"> — sold out</span>'}</li>`
    ).join('');
    return `<div class="pdp-sizes"><p class="pdp-label">Sizes on hand</p><ul>${chips}</ul></div>`;
  };

  const gallery = (p) => {
    const shots = p.images;
    if(!shots.length)return '<div class="pdp-gallery"><p class="image-unavailable">Photo unavailable</p></div>';
    const thumbs = shots.length > 1
      ? `<ul class="pdp-thumbs">${shots.map((src, i) =>
          `<li><button type="button" class="pdp-thumb${i ? '' : ' is-active'}" aria-pressed="${i===0}" data-src="${esc(sized(src, 960))}" aria-label="View photo ${i + 1}"><img src="${esc(sized(src, 200))}" alt="" loading="lazy"></button></li>`
        ).join('')}</ul>`
      : '';
    return `<div class="pdp-gallery">
        <div class="pdp-stage"><img id="pdp-hero" src="${esc(sized(shots[0], 960))}" alt="${esc(p.title)}" width="480" height="600"></div>
        ${thumbs}
      </div>`;
  };

  const render = (p, all) => {
    document.title = `${p.title} | My Best Friend's Closet — Tracy, CA`;
    pdp.removeAttribute('aria-busy');
    const consigned = p.origin === 'consigned';

    // the store writes headings ("Care Instructions") inline with the bullets
    // real headings are Title Case ("Care Instructions"); bullets are not ("Machine wash cold")
    const isHeading = (t) => {
      const words = t.split(' ');
      return words.length <= 3 && !/[.,;:]$/.test(t) && words.every((w) => /^[A-Z(]/.test(w) || w.length <= 3);
    };
    const details = p.body.length
      ? `<div class="pdp-details">${p.body.map((t) =>
          isHeading(t) ? `<p class="pdp-label">${esc(t)}</p>` : `<p class="pdp-detail">${esc(t)}</p>`
        ).join('')}</div>`
      : '';

    pdp.innerHTML = `
      <nav class="pdp-crumbs" aria-label="Breadcrumb">
        <a href="shop.html">Shop</a><span aria-hidden="true">/</span><a href="shop.html?category=${encodeURIComponent(p.group)}">${esc(p.group)}</a>
      </nav>
      <div class="pdp-layout">
        ${gallery(p)}
        <div class="pdp-info">
          ${p.vendor ? `<p class="eyebrow">${esc(p.vendor)}</p>` : ''}
          <h1>${esc(p.title)}</h1>
          <p class="pdp-origin">
            <span class="tag ${consigned ? 'tag-consigned' : 'tag-new'}">${consigned ? 'Consigned' : 'Boutique'}</span>
            <span>${consigned
              ? 'A consigned piece. Check the description and photos for condition.'
              : 'From our boutique selection. See the product details below.'}</span>
          </p>
          <p class="pdp-price">${money(p.price)}${p.available ? '' : ' <span class="pdp-sold">Sold</span>'}</p>
          ${p.blurb ? `<p class="lede">${esc(p.blurb)}</p>` : ''}
          <form id="add-form" class="purchase-form">
            <label for="variant">Size / color</label>
            <select id="variant" required><option value="">Choose an option</option>${p.variants.map(v=>`<option value="${esc(v.id)}" ${v.available?'':'disabled'}>${esc(v.name==='Default Title'?'One size':v.name)} — ${money(v.price)}${v.available?'':' — Sold out'}</option>`).join('')}</select>
            <label for="quantity">Quantity</label><input id="quantity" type="number" inputmode="numeric" min="1" max="20" step="1" value="1" required>
          <div class="pdp-actions">
            <button class="btn" id="add-button" type="submit" ${p.available?'':'disabled'}>${p.available ? 'Add to bag' : 'Sold out'}</button>
            <a class="btn btn-ghost" href="cart.html">View bag</a>
          </div>
          <p id="purchase-status" role="status"></p></form>
          <p class="pdp-fine">Choose your pieces here, then pay securely with Shopify. Availability, shipping, pickup and final totals are confirmed at checkout. <a href="policies.html#returns">Returns &amp; store credit</a></p>
          ${details}
          <dl class="pdp-meta">
            <div><dt>Pickup</dt><dd>53 W 10th Street. Check the available options at checkout.</dd></div>
            <div><dt>Category</dt><dd><a class="text-link" href="shop.html?category=${encodeURIComponent(p.group)}">${esc(p.group)}</a></dd></div>
          </dl>
        </div>
      </div>`;

    // some of the store's photos are only ~250px wide; don't stretch them soft
    const hero = document.getElementById('pdp-hero');
    const fitFrame = () => {
      if (!hero.naturalWidth) return;
      const w = Math.max(320, Math.min(hero.naturalWidth, 480));
      pdp.querySelector('.pdp-gallery').style.maxWidth = `${w}px`;
    };
    if(hero)hero.complete ? fitFrame() : hero.addEventListener('load', fitFrame, { once: true });
    const variant=document.getElementById('variant');
    if(p.variants.length===1&&p.variants[0].available)variant.value=p.variants[0].id;
    variant.addEventListener('change',()=>{const v=p.variants.find(v=>v.id===variant.value);if(v)document.querySelector('.pdp-price').textContent=money(v.price);});
    document.getElementById('add-form').addEventListener('submit',async e=>{
      e.preventDefault();const status=document.getElementById('purchase-status'),button=document.getElementById('add-button');
      const id=variant.value,quantity=Number(document.getElementById('quantity').value);if(!id||!Number.isInteger(quantity)||quantity<1||quantity>20)return;
      button.disabled=true;status.textContent='Checking availability…';
      try{const fresh=await currentProduct(p.handle);const v=fresh.variants.find(v=>v.id===id);if(!v?.available)throw new Error('That option is no longer available. Please choose another.');addToBag(fresh,v,quantity);document.querySelector('.pdp-price').textContent=money(v.price);status.textContent=`Added ${quantity} to your bag at ${money(v.price)} each.`;}
      catch(e){status.textContent=e.message;}finally{button.disabled=false;}
    });

    pdp.querySelectorAll('.pdp-thumb').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.getElementById('pdp-hero').src = btn.dataset.src;
        pdp.querySelectorAll('.pdp-thumb').forEach((b) => {b.classList.remove('is-active');b.setAttribute('aria-pressed','false');});
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed','true');
      });
    });

    const siblings = all.filter((x) => x.group === p.group && x.handle !== p.handle && x.available).slice(0, 4);
    if (siblings.length) {
      document.getElementById('more-title').textContent = `More ${p.group.toLowerCase()}`;
      document.getElementById('more-grid').innerHTML = siblings.map((s) => `
        <li>
          <a href="product.html?p=${encodeURIComponent(s.handle)}">
            <div class="product-frame"><img src="${esc(s.images[0])}" alt="" loading="lazy" width="533" height="666"><span class="tag ${s.origin === 'consigned' ? 'tag-consigned' : 'tag-new'}">${s.origin === 'consigned' ? 'Consigned' : 'Boutique'}</span></div>
            <h3>${esc(s.title)}</h3><p class="price">${money(s.price)}</p>
          </a>
        </li>`).join('');
      document.getElementById('more').hidden = false;
    }
  };

  if (!handle) {
    notFound('No piece selected', 'Head back to the closet and pick something out.');
    return;
  }

  // loaded as a plain script, not fetched, so the page also works opened straight off disk
  const all = window.MBFC_PRODUCTS;
  if (!Array.isArray(all)) {
    notFound('We could not load this piece', 'Give the page a refresh, or call the shop and we will tell you all about it.');
    return;
  }
  const p = all.find((x) => x.handle === handle);
  try {const fresh=await currentProduct(handle);render(fresh,all);}
  catch(e){if(p&&e.message!=='This item is no longer available.'){render(p,all);document.getElementById('purchase-status').textContent='Showing saved details. We will recheck availability when you add to your bag.';}else notFound('This piece is unavailable', 'Browse the closet for current arrivals, or call the shop to ask about this piece.');}
})();
