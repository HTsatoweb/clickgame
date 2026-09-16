(function(){
  "use strict";
  var css=document.createElement("style");
  css.textContent=[
    "#coreTrigger{overflow:visible;}",
    "#coreChara{position:absolute;inset:10% 12% 28%;pointer-events:none;z-index:2;}",
    "#coreChara svg{width:100%;height:100%;display:block;}",
    "#coreTrigger .core-text-main{position:relative;z-index:3;font-size:.72rem!important;margin-top:auto;}",
    "#coreTrigger .core-text-sub,#coreTrigger #coreRank,#coreTrigger #tapPing{position:relative;z-index:3;}",
    "#petStick{position:fixed;width:8px;height:92px;border-radius:6px 6px 3px 3px;pointer-events:none;z-index:12;",
    "background:linear-gradient(180deg,#f5d0a6,#c08457);transform-origin:50% 100%;display:none;",
    "box-shadow:0 0 0 2px rgba(80,40,10,.25);}",
    "#petStick.on{display:block;}",
    "#petStick i{position:absolute;left:-6px;top:-10px;width:20px;height:16px;border-radius:50%;",
    "background:#e8b88a;border:2px solid rgba(80,40,10,.25);}"
  ].join("");
  document.head.appendChild(css);

  function hueNow(){
    var h=getComputedStyle(document.documentElement).getPropertyValue("--combo-hue").trim();
    var n=parseFloat(h); if(!isFinite(n)) n=170;
    var en=document.getElementById("v-energy");
    if(en){
      var c=getComputedStyle(en).color;
      var m=c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/);
      if(m){
        var r=+m[1]/255,g=+m[2]/255,b=+m[3]/255;
        var mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
        if(d>0.02){
          if(mx===r) n=((g-b)/d*60+360)%360;
          else if(mx===g) n=((b-r)/d*60+120)%360;
          else n=((r-g)/d*60+240)%360;
        }
      }
    }
    return n;
  }

  var face={mood:"idle",t:0};
  var svgNS="http://www.w3.org/2000/svg";

  function mount(){
    var core=document.getElementById("coreTrigger");
    if(!core || document.getElementById("coreChara")) return;
    core.style.position="relative";
    var wrap=document.createElement("div");
    wrap.id="coreChara";
    wrap.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true">'+
      '<defs><radialGradient id="chSkin" cx="35%" cy="30%"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#7dd3fc"/></radialGradient></defs>'+
      '<circle id="chHead" cx="50" cy="52" r="36" fill="url(#chSkin)" stroke="rgba(255,255,255,.35)" stroke-width="2"/>'+
      '<ellipse id="chBlushL" cx="32" cy="58" rx="7" ry="4" fill="rgba(255,120,150,.0)"/>'+
      '<ellipse id="chBlushR" cx="68" cy="58" rx="7" ry="4" fill="rgba(255,120,150,.0)"/>'+
      '<ellipse id="chEyeL" cx="38" cy="46" rx="5" ry="6" fill="#1e293b"/>'+
      '<ellipse id="chEyeR" cx="62" cy="46" rx="5" ry="6" fill="#1e293b"/>'+
      '<circle cx="36.5" cy="44" r="1.6" fill="#fff"/><circle cx="60.5" cy="44" r="1.6" fill="#fff"/>'+
      '<path id="chMouth" d="M40 66 Q50 74 60 66" fill="none" stroke="#1e293b" stroke-width="2.4" stroke-linecap="round"/>'+
      '</svg>';
    core.insertBefore(wrap, core.firstChild);
    if(!document.getElementById("petStick")){
      var st=document.createElement("div");
      st.id="petStick"; st.innerHTML="<i></i>";
      document.body.appendChild(st);
    }
    syncColor();
  }

  function setMood(mood){
    face.mood=mood; face.t=performance.now();
    var L=document.getElementById("chEyeL");
    var R=document.getElementById("chEyeR");
    var M=document.getElementById("chMouth");
    var bL=document.getElementById("chBlushL");
    var bR=document.getElementById("chBlushR");
    if(!L||!R||!M) return;
    L.setAttribute("ry","6"); R.setAttribute("ry","6");
    bL.setAttribute("fill","rgba(255,120,150,.0)"); bR.setAttribute("fill","rgba(255,120,150,.0)");
    if(mood==="happy"){
      M.setAttribute("d","M38 64 Q50 78 62 64");
      bL.setAttribute("fill","rgba(255,120,150,.35)"); bR.setAttribute("fill","rgba(255,120,150,.35)");
    } else if(mood==="wow"){
      M.setAttribute("d","M47 64 Q50 72 53 64");
      L.setAttribute("ry","7"); R.setAttribute("ry","7");
    } else if(mood==="wink"){
      L.setAttribute("ry","1.4");
      M.setAttribute("d","M40 66 Q50 72 60 66");
    } else if(mood==="pet"){
      M.setAttribute("d","M40 65 Q50 76 60 65");
      L.setAttribute("ry","2.2"); R.setAttribute("ry","2.2");
      bL.setAttribute("fill","rgba(255,120,150,.45)"); bR.setAttribute("fill","rgba(255,120,150,.45)");
    } else {
      M.setAttribute("d","M40 66 Q50 72 60 66");
    }
  }

  function syncColor(){
    var g=document.getElementById("chSkin");
    if(!g) return;
    var h=hueNow();
    var stops=g.querySelectorAll("stop");
    if(stops[0]) stops[0].setAttribute("stop-color","hsl("+h+",70%,88%)");
    if(stops[1]) stops[1].setAttribute("stop-color","hsl("+h+",65%,58%)");
  }

  function tone(ctx){
    if(!ctx) return;
    var now=ctx.currentTime;
    var notes=[329.63,392.00,440.00,523.25];
    var n=notes[(Math.random()*notes.length)|0];
    var lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=860;
    var m=ctx.createGain(); m.gain.value=0.13; m.connect(lp); lp.connect(ctx.destination);
    var o=ctx.createOscillator(), g=ctx.createGain();
    o.type="sine"; o.frequency.setValueAtTime(n, now);
    o.frequency.exponentialRampToValueAtTime(n*0.7, now+0.14);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.06, now+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now+0.16);
    o.connect(g); g.connect(m); o.start(now); o.stop(now+0.18);
    var o2=ctx.createOscillator(), g2=ctx.createGain();
    o2.type="triangle"; o2.frequency.setValueAtTime(n*0.5, now);
    g2.gain.setValueAtTime(0.02, now);
    g2.gain.exponentialRampToValueAtTime(0.0001, now+0.1);
    o2.connect(g2); g2.connect(m); o2.start(now); o2.stop(now+0.12);
  }
  function hookSound(){
    try{
      if(window.SoundManager){
        SoundManager.playClick=function(){
          try{ if(SoundManager.init) SoundManager.init(); if(SoundManager.ctx) tone(SoundManager.ctx); }catch(e){}
        };
      }
      if(window.NeonEngine) NeonEngine.playCoreTone=tone;
      if(window.__AudioBank && __AudioBank.play){
        var prev=__AudioBank.play.bind(__AudioBank);
        __AudioBank.play=function(name,rate){
          if(name==="click"){
            var ac=__AudioBank.ctxOf&&__AudioBank.ctxOf();
            if(ac){ tone(ac); return; }
          }
          return prev(name,rate);
        };
      }
    }catch(e){}
  }

  document.addEventListener("pointerdown", function(ev){
    var t=ev.target;
    if(!(t&&t.closest&&t.closest("#coreTrigger"))) return;
    var moods=["happy","wow","wink","happy"];
    setMood(moods[(Math.random()*moods.length)|0]);
    setTimeout(function(){ if(face.mood!=="pet") setMood("idle"); }, 220);
  }, {passive:true});

  var petting=false, petX=0, petY=0;
  function stickAt(x,y){
    var st=document.getElementById("petStick");
    if(!st) return;
    st.classList.add("on");
    st.style.left=(x-4)+"px";
    st.style.top=(y-90)+"px";
    st.style.transform="rotate("+Math.sin(performance.now()/160)*12+"deg)";
  }
  function endPet(){
    petting=false;
    var st=document.getElementById("petStick");
    if(st) st.classList.remove("on");
    setMood("idle");
  }
  addEventListener("keydown", function(ev){
    if(ev.code!=="Space" && ev.key!==" ") return;
    if(ev.repeat) return;
    ev.preventDefault();
    petting=true;
    setMood("pet");
    var core=document.getElementById("coreTrigger");
    var r=core?core.getBoundingClientRect():{left:innerWidth/2-40,top:innerHeight/2-40,width:80,height:80};
    petX=r.left+r.width*0.55; petY=r.top+r.height*0.42;
    stickAt(petX, petY);
  });
  addEventListener("keyup", function(ev){
    if(ev.code==="Space" || ev.key===" ") endPet();
  });
  addEventListener("pointermove", function(ev){
    if(!petting) return;
    petX=ev.clientX; petY=ev.clientY;
    stickAt(petX, petY);
    var core=document.getElementById("coreTrigger");
    if(core){
      var r=core.getBoundingClientRect();
      if(ev.clientX>r.left && ev.clientX<r.right && ev.clientY>r.top && ev.clientY<r.bottom) setMood("pet");
    }
  }, {passive:true});

  setInterval(syncColor, 200);
  if(document.readyState==="complete"){ mount(); hookSound(); }
  else addEventListener("load", function(){ mount(); hookSound(); });
  setTimeout(hookSound, 600);
})();
