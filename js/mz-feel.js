(function(){
  "use strict";
  var css = document.createElement("style");
  css.textContent = [
    "#softBurstLayer{position:fixed;inset:0;pointer-events:none;z-index:6;overflow:hidden;}",
    ".soft-ring{position:absolute;border:2px solid rgba(0,255,204,.45);border-radius:50%;",
    "transform:translate(-50%,-50%) scale(.4);opacity:.7;animation:softRing .45s ease-out forwards;}",
    "@keyframes softRing{to{transform:translate(-50%,-50%) scale(1.6);opacity:0;}}",
    "#coreTrigger.soft-pop{filter:brightness(1.12);} "
  ].join("");
  document.head.appendChild(css);
  var layer = document.createElement("div");
  layer.id = "softBurstLayer";
  document.addEventListener("DOMContentLoaded", function(){ document.body.appendChild(layer); });
  if (document.body) document.body.appendChild(layer);

  function burst(x,y){
    if (!layer.parentNode && document.body) document.body.appendChild(layer);
    if (layer.childElementCount > 8) layer.removeChild(layer.firstChild);
    var d = document.createElement("div");
    d.className = "soft-ring";
    d.style.left = x+"px";
    d.style.top = y+"px";
    d.style.width = d.style.height = "46px";
    layer.appendChild(d);
    setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, 460);
  }

  function softTone(ctx){
    if (!ctx) return;
    var now = ctx.currentTime;
    var det = 0.97 + Math.random()*0.05;
    var lp = ctx.createBiquadFilter();
    lp.type="lowpass"; lp.frequency.value=980;
    var m = ctx.createGain();
    m.gain.value = 0.14;
    m.connect(lp); lp.connect(ctx.destination);
    function v(f0,f1,dur,vol){
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.type="sine";
      o.frequency.setValueAtTime(f0*det, now);
      o.frequency.exponentialRampToValueAtTime(f1*det, now+dur);
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now+dur);
      o.connect(g); g.connect(m);
      o.start(now); o.stop(now+dur+0.03);
    }
    v(262, 196, 0.14, 0.04);
    v(392, 262, 0.10, 0.018);
  }

  function hook(){
    try {
      if (window.__AudioBank) {
        delete window.__AudioBank.buf.click;
        var prev = window.__AudioBank.play.bind(window.__AudioBank);
        window.__AudioBank.play = function(name, rate){
          if (name === "click") {
            var ac = window.__AudioBank.ctxOf && window.__AudioBank.ctxOf();
            if (ac) { softTone(ac); return; }
          }
          return prev(name, rate);
        };
      }
    } catch(e){}
    try {
      if (window.SoundManager && SoundManager.playClick) {
        SoundManager.playClick = function(){
          try {
            if (SoundManager.init) SoundManager.init();
            if (SoundManager.ctx) { softTone(SoundManager.ctx); return; }
          } catch(e){}
        };
      }
    } catch(e){}
    if (window.NeonEngine) NeonEngine.playCoreTone = softTone;
  }
  if (document.readyState==="complete") hook();
  else addEventListener("load", hook);
  setTimeout(hook, 400);

  document.addEventListener("pointerdown", function(ev){
    var t = ev.target;
    if (!(t && t.closest && t.closest("#coreTrigger"))) return;
    burst(ev.clientX, ev.clientY);
    var core = document.getElementById("coreTrigger");
    if (core){
      core.classList.add("soft-pop");
      setTimeout(function(){ core.classList.remove("soft-pop"); }, 120);
    }
  }, {passive:true});
})();
