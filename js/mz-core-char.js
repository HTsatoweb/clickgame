(function(){
  "use strict";
  var css=document.createElement("style");
  css.textContent=[
    "#coreTrigger{position:relative;overflow:visible;}",
    "#coreChar{position:absolute;left:50%;top:44%;width:58%;height:58%;transform:translate(-50%,-50%);",
    "pointer-events:none;z-index:2;}",
    "#coreChar svg{width:100%;height:100%;display:block;filter:drop-shadow(0 4px 8px rgba(0,0,0,.35));}",
    "#coreChar .face{transition:fill .18s linear;}",
    "#coreTrigger.face-tap #coreChar{animation:faceBounce .18s ease-out;}",
    "@keyframes faceBounce{0%{transform:translate(-50%,-50%) scale(.92)}70%{transform:translate(-50%,-50%) scale(1.06)}100%{transform:translate(-50%,-50%) scale(1)}}",
    "#petStick{position:fixed;width:8px;height:92px;margin-left:-4px;margin-top:-86px;border-radius:8px 8px 3px 3px;",
    "background:linear-gradient(180deg,#f4d35e,#ee9b00);box-shadow:0 0 8px rgba(255,200,80,.45);",
    "pointer-events:none;z-index:30;display:none;transform-origin:50% 100%;}",
    "#petStick.on{display:block;animation:petSweep .7s ease-in-out;}",
    "@keyframes petSweep{0%{transform:rotate(-28deg) translateY(0)}50%{transform:rotate(22deg) translateY(6px)}100%{transform:rotate(-10deg) translateY(0)}}",
    "#coreTrigger.face-pet #coreChar{animation:facePet .7s ease-in-out;}",
    "@keyframes facePet{0%,100%{transform:translate(-50%,-50%) rotate(0)}40%{transform:translate(-50%,-52%) rotate(-6deg)}70%{transform:translate(-50%,-50%) rotate(5deg)}}"
  ].join("");
  document.head.appendChild(css);

  var face, eyeL, eyeR, mouth, blushL, blushR, stick, expr="idle";

  function hue(){
    var h=getComputedStyle(document.documentElement).getPropertyValue("--combo-hue");
    h=parseFloat(h); if(!isFinite(h)) h=170;
    return h;
  }
  function paintFace(){
    if(!face) return;
    var h=hue();
    face.setAttribute("fill","hsl("+h+",72%,52%)");
    face.setAttribute("stroke","hsl("+h+",80%,72%)");
  }
  function setExpr(name){
    expr=name;
    if(!eyeL) return;
    if(name==="tap"){
      eyeL.setAttribute("ry","3.2"); eyeR.setAttribute("ry","3.2");
      mouth.setAttribute("d","M38 54 Q50 66 62 54");
    } else if(name==="pet"){
      eyeL.setAttribute("ry","1.2"); eyeR.setAttribute("ry","1.2");
      mouth.setAttribute("d","M40 55 Q50 64 60 55");
    } else {
      eyeL.setAttribute("ry","4.2"); eyeR.setAttribute("ry","4.2");
      mouth.setAttribute("d","M40 56 Q50 62 60 56");
    }
  }

  function voice(ctx){
    if(!ctx) return;
    var t=ctx.currentTime;
    var h=hue();
    var base=220+((h%60)*0.6);
    var m=ctx.createGain(); var lp=ctx.createBiquadFilter();
    lp.type="lowpass"; lp.frequency.value=860; lp.Q.value=0.6;
    m.gain.value=0.15; m.connect(lp); lp.connect(ctx.destination);
    function v(f,dur,vol,delay,type){
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.type=type||"sine";
      var t0=t+(delay||0);
      o.frequency.setValueAtTime(f,t0);
      o.frequency.exponentialRampToValueAtTime(Math.max(90,f*0.82), t0+dur);
      g.gain.setValueAtTime(0.0001,t0);
      g.gain.exponentialRampToValueAtTime(vol,t0+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
      o.connect(g); g.connect(m);
      o.start(t0); o.stop(t0+dur+0.02);
    }
    v(base*1.5,0.09,0.045,0,"sine");
    v(base,0.12,0.035,0.02,"triangle");
  }

  function hookSound(){
    function play(){
      try{
        if(window.SoundManager){ if(SoundManager.init) SoundManager.init(); voice(SoundManager.ctx); return; }
      }catch(e){}
    }
    try{
      if(window.SoundManager) SoundManager.playClick=function(){ try{ SoundManager.init&&SoundManager.init(); voice(SoundManager.ctx);}catch(e){} };
    }catch(e){}
    try{ if(window.NeonEngine) NeonEngine.playCoreTone=voice; }catch(e){}
    try{
      if(window.__AudioBank && __AudioBank.play){
        var prev=__AudioBank.play.bind(__AudioBank);
        __AudioBank.play=function(name,rate){
          if(name==="click"){
            var ac=__AudioBank.ctxOf&&__AudioBank.ctxOf();
            if(ac){ voice(ac); return; }
          }
          return prev(name,rate);
        };
        try{ delete __AudioBank.buf.click; }catch(e){}
      }
    }catch(e){}
  }

  function mount(){
    var core=document.getElementById("coreTrigger");
    if(!core || document.getElementById("coreChar")) return;
    var wrap=document.createElement("div");
    wrap.id="coreChar";
    wrap.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true">'+
      '<circle class="face" cx="50" cy="50" r="36" stroke-width="3"/>'+
      '<ellipse id="blushL" cx="34" cy="54" rx="6" ry="3.2" fill="rgba(255,120,140,.35)"/>'+
      '<ellipse id="blushR" cx="66" cy="54" rx="6" ry="3.2" fill="rgba(255,120,140,.35)"/>'+
      '<ellipse id="eyeL" cx="38" cy="44" rx="4.2" ry="4.2" fill="#1a1020"/>'+
      '<ellipse id="eyeR" cx="62" cy="44" rx="4.2" ry="4.2" fill="#1a1020"/>'+
      '<circle cx="39.5" cy="42.5" r="1.1" fill="#fff"/>'+
      '<circle cx="63.5" cy="42.5" r="1.1" fill="#fff"/>'+
      '<path id="mouth" d="M40 56 Q50 62 60 56" fill="none" stroke="#3b1020" stroke-width="2.4" stroke-linecap="round"/>'+
      '</svg>';
    core.appendChild(wrap);
    face=wrap.querySelector(".face");
    eyeL=wrap.querySelector("#eyeL");
    eyeR=wrap.querySelector("#eyeR");
    mouth=wrap.querySelector("#mouth");
    paintFace();
    stick=document.createElement("div");
    stick.id="petStick";
    document.body.appendChild(stick);
    hookSound();
    setInterval(paintFace, 400);
  }

  document.addEventListener("pointerdown", function(ev){
    var t=ev.target;
    if(!(t && t.closest && t.closest("#coreTrigger"))) return;
    var core=document.getElementById("coreTrigger");
    if(!core) return;
    setExpr("tap");
    core.classList.add("face-tap");
    setTimeout(function(){ core.classList.remove("face-tap"); setExpr("idle"); }, 180);
  }, {passive:true});

  document.addEventListener("keydown", function(ev){
    if(ev.repeat) return;
    if(ev.code!=="Space" && ev.key!==" ") return;
    var tag=(ev.target&&ev.target.tagName)||"";
    if(tag==="INPUT"||tag==="TEXTAREA") return;
    ev.preventDefault();
    var core=document.getElementById("coreTrigger");
    if(!core||!stick) return;
    var r=core.getBoundingClientRect();
    stick.style.left=(r.left+r.width*0.62)+"px";
    stick.style.top=(r.top+r.height*0.22)+"px";
    stick.classList.remove("on");
    void stick.offsetWidth;
    stick.classList.add("on");
    setExpr("pet");
    core.classList.add("face-pet");
    setTimeout(function(){
      stick.classList.remove("on");
      core.classList.remove("face-pet");
      setExpr("idle");
    }, 720);
    try{
      if(window.SoundManager&&SoundManager.ctx) voice(SoundManager.ctx);
      else if(window.NeonEngine&&NeonEngine.playCoreTone&&SoundManager&&SoundManager.ctx) NeonEngine.playCoreTone(SoundManager.ctx);
    }catch(e){}
  });

  if(document.readyState==="complete") mount();
  else addEventListener("load", mount);
})();
