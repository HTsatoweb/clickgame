(function(){
  "use strict";
  var css=document.createElement("style");
  css.textContent=[
    "#coreTrigger{position:relative;overflow:hidden;}",
    "#coreChar{position:absolute;inset:8%;pointer-events:none;z-index:1;}",
    "#coreChar svg{width:100%;height:100%;display:block;}",
    "#coreTrigger .core-text-main,#coreTrigger .core-text-sub,#coreTrigger #coreRank,#tapPing{position:relative;z-index:2;}",
    "#coreTrigger .core-text-main{font-size:.72rem!important;margin-top:auto;}",
    ".cc-body{stroke:rgba(255,255,255,.55);stroke-width:2;}",
    ".cc-eye{fill:#1b1230;}",
    ".cc-blush{fill:rgba(255,120,150,.35);}",
    "#coreTrigger.face-tap .cc-eye{ry:2.1;}",
    "#coreTrigger.face-pet .cc-eye{ry:1.5;}",
    "#petStick{position:absolute;left:8%;top:18%;width:54%;height:10px;pointer-events:none;z-index:3;display:none;",
    "transform-origin:12% 50%;}",
    "#petStick.on{display:block;animation:petSweep .55s ease-in-out infinite alternate;}",
    "#petStick i{display:block;height:7px;border-radius:99px;background:linear-gradient(90deg,#f5d0a6,#fff7ed);",
    "box-shadow:0 1px 0 rgba(0,0,0,.2);transform:rotate(-18deg);}",
    "#petStick i:after{content:'';display:block;width:12px;height:12px;border-radius:50%;background:#f5d0a6;margin-left:-4px;margin-top:-3px;}",
    "@keyframes petSweep{from{transform:rotate(-22deg) translateX(-6%)}to{transform:rotate(16deg) translateX(18%)}}"
  ].join("");
  document.head.appendChild(css);

  function mount(){
    var core=document.getElementById("coreTrigger");
    if(!core || document.getElementById("coreChar")) return;
    var wrap=document.createElement("div");
    wrap.id="coreChar";
    wrap.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true">'+
      '<circle class="cc-body" id="ccBody" cx="50" cy="52" r="34"/>'+
      '<ellipse class="cc-blush" cx="34" cy="60" rx="6" ry="3.5"/>'+
      '<ellipse class="cc-blush" cx="66" cy="60" rx="6" ry="3.5"/>'+
      '<ellipse class="cc-eye" cx="38" cy="48" rx="4.2" ry="5.2"/>'+
      '<ellipse class="cc-eye" cx="62" cy="48" rx="4.2" ry="5.2"/>'+
      '<path class="cc-mouth" id="ccMouth" d="M40 64 Q50 70 60 64" fill="none" stroke="#3b2a55" stroke-width="2.4" stroke-linecap="round"/>'+
      '</svg><div id="petStick"><i></i></div>';
    core.insertBefore(wrap, core.firstChild);
    syncColor();
  }

  function hue(){
    var h=getComputedStyle(document.documentElement).getPropertyValue("--combo-hue");
    var n=parseFloat(h);
    if(!isFinite(n) && window.NeonEngine && NeonEngine.state) n=NeonEngine.state.hue;
    if(!isFinite(n)) n=170;
    return n;
  }
  function syncColor(){
    var body=document.getElementById("ccBody");
    if(!body) return;
    var h=hue();
    body.setAttribute("fill", "hsl("+h+",70%,62%)");
    body.setAttribute("stroke", "hsl("+h+",80%,82%)");
  }

  function face(name){
    var core=document.getElementById("coreTrigger");
    if(!core) return;
    core.classList.remove("face-tap","face-pet");
    if(name) core.classList.add(name);
    var mouth=document.getElementById("ccMouth");
    if(mouth){
      if(name==="face-tap") mouth.setAttribute("d","M36 63 Q50 76 64 63");
      else if(name==="face-pet") mouth.setAttribute("d","M38 64 Q50 69 62 64");
      else mouth.setAttribute("d","M40 64 Q50 70 60 64");
    }
    var eyes=core.querySelectorAll(".cc-eye");
    for(var i=0;i<eyes.length;i++){
      eyes[i].setAttribute("ry", name==="face-pet"?"1.5": name==="face-tap"?"2.2":"5.2");
    }
  }

  function softBoop(ctx){
    if(!ctx) return;
    var now=ctx.currentTime;
    var m=ctx.createGain();
    var f=ctx.createBiquadFilter();
    f.type="lowpass"; f.frequency.value=820;
    m.gain.value=0.15;
    m.connect(f); f.connect(ctx.destination);
    var o=ctx.createOscillator(), g=ctx.createGain();
    o.type="sine";
    o.frequency.setValueAtTime(330, now);
    o.frequency.exponentialRampToValueAtTime(196, now+0.14);
    g.gain.setValueAtTime(0.05, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now+0.16);
    o.connect(g); g.connect(m);
    o.start(now); o.stop(now+0.18);
    var o2=ctx.createOscillator(), g2=ctx.createGain();
    o2.type="sine";
    o2.frequency.setValueAtTime(494, now+0.02);
    o2.frequency.exponentialRampToValueAtTime(330, now+0.1);
    g2.gain.setValueAtTime(0.02, now+0.02);
    g2.gain.exponentialRampToValueAtTime(0.0001, now+0.12);
    o2.connect(g2); g2.connect(m);
    o2.start(now+0.02); o2.stop(now+0.14);
  }

  function hookSound(){
    function play(){
      try{
        if(window.SoundManager){
          if(SoundManager.init) SoundManager.init();
          if(SoundManager.ctx){ softBoop(SoundManager.ctx); return; }
        }
      }catch(e){}
      try{
        var AC=window.AudioContext||window.webkitAudioContext;
        if(!hookSound.ctx && AC) hookSound.ctx=new AC();
        if(hookSound.ctx){ if(hookSound.ctx.state==="suspended") hookSound.ctx.resume(); softBoop(hookSound.ctx); }
      }catch(e){}
    }
    try{
      if(window.SoundManager) SoundManager.playClick=play;
      if(window.NeonEngine) NeonEngine.playCoreTone=function(ctx){ softBoop(ctx); };
    }catch(e){}
  }

  document.addEventListener("pointerdown", function(ev){
    var t=ev.target;
    if(!(t && t.closest && t.closest("#coreTrigger"))) return;
    face("face-tap");
    syncColor();
    setTimeout(function(){ face(""); }, 160);
  }, {passive:true});

  document.addEventListener("keydown", function(ev){
    if(ev.code!=="Space" && ev.key!==" ") return;
    var tag=(ev.target&&ev.target.tagName)||"";
    if(tag==="INPUT"||tag==="TEXTAREA") return;
    ev.preventDefault();
    var stick=document.getElementById("petStick");
    if(stick) stick.classList.add("on");
    face("face-pet");
    syncColor();
  });
  document.addEventListener("keyup", function(ev){
    if(ev.code!=="Space" && ev.key!==" ") return;
    var stick=document.getElementById("petStick");
    if(stick) stick.classList.remove("on");
    face("");
  });

  setInterval(syncColor, 200);
  if(document.readyState==="complete"){ mount(); hookSound(); }
  else addEventListener("load", function(){ mount(); hookSound(); });
})();
