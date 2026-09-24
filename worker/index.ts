import {catalog,product,esc} from '../catalog-core.js';
import snapshot from '../products.json';
let cachedCatalog:any=null;
let catalogExpires=0;
let catalogPending:Promise<any>|null=null;
async function latestCatalog(){
  if(cachedCatalog&&Date.now()<catalogExpires)return cachedCatalog;
  if(!catalogPending)catalogPending=catalog(snapshot).then(data=>{cachedCatalog=data;catalogExpires=Date.now()+300000;return data;}).finally(()=>{catalogPending=null;});
  return catalogPending;
}

interface Env {
  ASSETS: Fetcher;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405});
    if(url.pathname==='/api/catalog'||url.pathname==='/api/product'){
      const handle=url.searchParams.get('handle')||'';
      if(url.pathname==='/api/product'&&!/^[a-z0-9][a-z0-9-]{0,240}$/.test(handle))return new Response('Invalid product',{status:400});
      try{
        const data=url.pathname==='/api/catalog'?await latestCatalog():await product(handle,snapshot.find(p=>p.handle===handle));
        const response=Response.json(data,{headers:{'Cache-Control':url.pathname==='/api/catalog'?'public, max-age=300':'no-store'}});
        return response;
      }catch(e:any){return Response.json({error:e.status===404?'Product unavailable':'Store temporarily unavailable'},{status:e.status===404?404:503,headers:{'Cache-Control':'no-store'}});}
    }
    const redirects:Record<string,string>={'/pages/consignment-made-easy':'/consign.html','/pages/contact-us':'/contact.html','/pages/hat-bar':'/hats.html','/pages/permanent-jewelry-✨':'/jewelry.html','/policies/refund-policy':'/policies.html#returns','/policies/terms-of-service':'/policies.html#terms','/cart':'/cart.html','/search':'/shop.html'};
    const decoded=decodeURI(url.pathname);
    if(redirects[decoded])return Response.redirect(url.origin+redirects[decoded],301);
    if(/^\/products\/[a-z0-9-]+$/.test(url.pathname))return Response.redirect(url.origin+'/product.html?p='+url.pathname.split('/').pop(),301);
    if(/^\/collections\/[a-z0-9-]+$/.test(url.pathname))return Response.redirect(url.origin+'/shop.html?collection='+url.pathname.split('/').pop(),301);
    const assetUrl=new URL(url.pathname==='/'?'/index.html':url.pathname==='/product.html'?'/product-template.html':url.pathname,url.origin);
    let response=await env.ASSETS.fetch(new Request(assetUrl,request));
    if(url.pathname==='/product.html'&&response.status>=300&&response.status<400&&response.headers.get('Location')){
      const templateUrl=new URL(response.headers.get('Location')!,assetUrl);
      if(templateUrl.origin===url.origin)response=await env.ASSETS.fetch(new Request(templateUrl,request));
    }
    if(response.status===404){const missing=await env.ASSETS.fetch(new Request(new URL('/404.html',url.origin)));return new Response(missing.body,{status:404,headers:{'Content-Type':'text/html; charset=utf-8'}});}
    if(url.pathname==='/product.html'){
      let p=snapshot.find(p=>p.handle===url.searchParams.get('p'));
      const handle=url.searchParams.get('p')||'';
      if(/^[a-z0-9][a-z0-9-]{0,240}$/.test(handle)){try{p=await product(handle,p);}catch{}}
      if(p){let html=await response.text();html=html.replace(/<title>.*?<\/title>/,`<title>${esc(p.title)} | My Best Friend's Closet</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${esc(p.blurb.slice(0,160))}">`).replace('<meta name="robots" content="noindex">',`<link rel="canonical" href="https://my-best-friends-closet.jabach0811.chatgpt.site/product.html?p=${encodeURIComponent(p.handle)}">`);return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8'}});}
    }
    return response;
  }
};
