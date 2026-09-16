
(function OfflinePack(){
  "use strict";
  function register(){
    if(typeof navigator==="undefined" || !navigator.serviceWorker) return;
    if(location.protocol!=="http:" && location.protocol!=="https:") return;
    var sw = "self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open('mz-off-v1').then(function(c){return c.addAll([self.registration.scope, self.registration.scope.replace(/\\/$/,'')]);}).catch(function(){}));});"+
      "self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});"+
      "self.addEventListener('fetch',function(e){e.respondWith(fetch(e.request).then(function(res){var copy=res.clone(); caches.open('mz-off-v1').then(function(c){try{c.put(e.request,copy);}catch(err){}}); return res;}).catch(function(){return caches.match(e.request).then(function(hit){return hit||caches.match(self.registration.scope);});}));});";
    try {
      var blob=new Blob([sw],{type:"text/javascript"});
      var url=URL.createObjectURL(blob);
      navigator.serviceWorker.register(url, {scope: "./"}).catch(function(){});
    } catch(e){}
  }
  if(document.readyState==="complete") register();
  else addEventListener("load", register);
})();
