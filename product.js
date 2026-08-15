(() => {
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
    const shots = p.images.slice(0, 5);
    const thumbs = shots.length > 1
      ? `<ul class="pdp-thumbs">${shots.map((src, i) =>
          `<li><button type="button" class="pdp-thumb${i ? '' : ' is-active'}" data-src="${esc(sized(src, 960))}" aria-label="View photo ${i + 1}"><img src="${esc(sized(src, 200))}" alt="" loading="lazy"></button></li>`
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
        <a href="shop.html">Shop</a><span aria-hidden="true">/</span><a href="shop.html#${encodeURIComponent(p.group)}">${esc(p.group)}</a>
      </nav>
      <div class="pdp-layout">
        ${gallery(p)}
        <div class="pdp-info">
          ${p.vendor ? `<p class="eyebrow">${esc(p.vendor)}</p>` : ''}
          <h1>${esc(p.title)}</h1>
          <p class="pdp-price">${money(p.price)}${p.available ? '' : ' <span class="pdp-sold">Sold</span>'}</p>
          ${p.blurb ? `<p class="lede">${esc(p.blurb)}</p>` : ''}
          ${sizeRow(p.sizes)}
          <div class="pdp-actions">
            <a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener">${p.available ? 'Buy it online' : 'Check the online store'}</a>
            <a class="btn btn-ghost" href="tel:+12098336232">${p.available ? 'Call to hold it' : 'Ask what else came in'}</a>
          </div>
          <p class="pdp-fine">${p.available
            ? 'Checkout runs on the MBFC online store and opens in a new tab. Prefer to try it on? We hold pieces for 24 hours — just call.'
            : 'This one is spoken for online. Call the shop — pieces like it come through every week, and the floor moves faster than the website.'}</p>
          ${details}
          <dl class="pdp-meta">
            <div><dt>Pickup</dt><dd>53 W 10th Street, usually ready in 24 hours</dd></div>
            <div><dt>Category</dt><dd><a class="text-link" href="shop.html">${esc(p.group)}</a></dd></div>
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
    hero.complete ? fitFrame() : hero.addEventListener('load', fitFrame, { once: true });

    pdp.querySelectorAll('.pdp-thumb').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.getElementById('pdp-hero').src = btn.dataset.src;
        pdp.querySelectorAll('.pdp-thumb').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });

    const siblings = all.filter((x) => x.group === p.group && x.handle !== p.handle).slice(0, 4);
    if (siblings.length) {
      document.getElementById('more-title').textContent = `More ${p.group.toLowerCase()}`;
      document.getElementById('more-grid').innerHTML = siblings.map((s) => `
        <li>
          <a href="product.html?p=${encodeURIComponent(s.handle)}">
            <div class="product-frame"><img src="${esc(s.images[0])}" alt="" loading="lazy" width="533" height="666"></div>
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
  if (p) render(p, all);
  else notFound('This one found a home', 'It sold before you got here. The racks turn over every week — there is plenty more waiting.');
})();
