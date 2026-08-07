// Service Worker — Mantenimiento Tlalnepantla (offline / instalable)
const CACHE='mantto-v2.3';
const CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./planos/s00_comms.jpg","./planos/s01_agua.jpg","./planos/s02_recepcion_a.jpg","./planos/s03_recepcion_b.jpg","./planos/s04_transferencia.jpg","./planos/s05_1ra_limpia.jpg","./planos/s06_2do_reposo.jpg","./planos/s07_2da_limpia.jpg","./planos/s08_2da_limpia_c.jpg","./planos/s09_molino_a.jpg","./planos/s10_molino_b.jpg","./planos/s11_molino_c.jpg","./planos/s12_harina_2.jpg","./planos/s13_harina_3.jpg","./planos/s14_harina_2c.jpg","./planos/s15_multilinea.jpg","./planos/s16_harina_trigo.jpg","./planos/s17_subproductos.jpg","./planos/s18_desperdicios.jpg","./planos/s19_molienda_desperdicios.jpg","./planos/s20_empaque_1.jpg","./planos/s21_empaque_2.jpg","./planos/s22_empaque_sub.jpg","./planos/s23_granel.jpg"];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req=e.request;
  if(req.method!=='GET') return;
  var url=new URL(req.url);
  var sameOrigin=url.origin===self.location.origin;
  // HTML: intenta red primero (para traer actualizaciones), si falla usa la copia guardada
  if(req.mode==='navigate' || (sameOrigin && url.pathname.match(/index\.html$/))){
    e.respondWith(
      fetch(req).then(function(r){ var cp=r.clone(); caches.open(CACHE).then(function(c){ c.put(req,cp); }); return r; })
                .catch(function(){ return caches.match(req).then(function(m){ return m || caches.match('./index.html') || caches.match('./'); }); })
    );
    return;
  }
  // Resto (imágenes, íconos, librerías CDN): usa lo guardado primero; si no, red y lo guarda
  e.respondWith(
    caches.match(req).then(function(m){
      if(m) return m;
      return fetch(req).then(function(r){
        if(r && (r.ok || r.type==='opaque')){ var cp=r.clone(); caches.open(CACHE).then(function(c){ c.put(req,cp); }); }
        return r;
      }).catch(function(){ return m; });
    })
  );
});
