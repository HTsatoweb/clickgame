(function(){
  "use strict";
  var css=document.createElement("style");
  css.textContent=[
    "#varLayer{position:fixed;inset:0;pointer-events:none;z-index:7;overflow:hidden;}",
    ".var-float{position:absolute;font:800 13px/1 system-ui;color:#fff;text-shadow:0 0 10px rgba(0,255,204,.6);",
    "animation:varUp .7s ease-out forwards;white-space:nowrap;}",
    "@keyframes varUp{from{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,-36px)}}",
    ".var-pop{position:absolute;width:10px;height:10px;border-radius:50%;",
    "animation:varPop .5s ease-out forwards;}",
    "@keyframes varPop{to{opacity:0;transform:scale(3)}}",
    "#coreTrigger.var-lit{box-shadow:0 0 28px rgba(0,255,204,.35)!important;}",
    "#momentLog{max-height:46vh;overflow:auto;font-size:12px;line-height:1.45;color:#d4d4d8}",
    "#momentLog div{padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06)}"
  ].join("");
  document.head.appendChild(css);

  var layer=document.createElement("div");
  layer.id="varLayer";
  function mount(){ if(document.body && !layer.parentNode) document.body.appendChild(layer); }
  if(document.body) mount(); else addEventListener("DOMContentLoaded", mount);

  /* 1000 mixed moments: events / visuals / notes / sky / missions — not a grind catalog */
  var KINDS=["event","vis","note","sky","mission","combo","weather","particle"];
  var WORDS=["流れ星","星の瞬き","量子のゆらぎ","干渉の波","北極星","夏の大三角","オリオンのベルト",
    "こと座の琴","はくちょう","南十字","光子ひと粒","真空の泡","軌道が揃った","準位ジャンプ",
    "彗星の尾","銀河の潮","柔らかい光","深い星雲","観測成功","ファーストライト","露出ちょうど",
    "等級が上がった","赤い星","青い星","白い星","二重星","散開星団","静かな夜","風のない宇宙",
    "パルス一拍","時計が合う","円が重なる","色が溶ける","輪が広がる","芯が鳴る","星図が回る"];
  var MOM=[];
  var wi=0;
  for(var i=0;i<1000;i++){
    MOM.push({
      id:i,
      kind:KINDS[i%KINDS.length],
      word:WORDS[wi++%WORDS.length],
      hue:(i*17)%360,
      note:i%5,
      dur:0.35+(i%4)*0.05
    });
  }

  var seen={};
  try{ seen=JSON.parse(localStorage.getItem("mz_moments_seen")||"{}")||{}; }catch(e){ seen={}; }
  var log=[];
  var lastPick=0;

  var SCALE=[261.63,293.66,329.63,392.00,440.00]; /* C D E G A — soft pentatonic */

  function soft(ctx, note, combo){
    if(!ctx) return;
    var now=ctx.currentTime;
    var n = SCALE[(note+Math.min(4,(combo|0)>>2))%SCALE.length];
    var master=ctx.createGain();
    var lp=ctx.createBiquadFilter();
    lp.type="lowpass"; lp.frequency.value=980; lp.Q.value=0.55;
    master.gain.value=0.16;
    master.connect(lp); lp.connect(ctx.destination);
    function v(freq,type,dur,vol,delay){
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.type=type;
      var t0=now+(delay||0);
      o.frequency.setValueAtTime(freq, t0);
      o.frequency.exponentialRampToValueAtTime(Math.max(80,freq*0.72), t0+dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0+0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
      o.connect(g); g.connect(master);
      o.start(t0); o.stop(t0+dur+0.02);
    }
    v(n,"sine",0.16,0.05,0);
    v(n*1.5,"sine",0.12,0.016,0.012);
  }

  function hookSound(){
    function use(ctx){ return function(){ soft(ctx|| (this.ctx), lastPick, (window.NeonEngine&&NeonEngine.state&&NeonEngine.state.combo)||0); }; }
    try{
      if(window.SoundManager){
        if(SoundManager.init) SoundManager.init();
        SoundManager.playClick=function(){
          try{ if(SoundManager.init) SoundManager.init(); soft(SoundManager.ctx, lastPick, (NeonEngine&&NeonEngine.state&&NeonEngine.state.combo)||0); }catch(e){}
        };
      }
    }catch(e){}
    try{
      if(window.NeonEngine) NeonEngine.playCoreTone=function(ctx){ soft(ctx, lastPick, NeonEngine.state.combo||0); };
    }catch(e){}
    try{
      if(window.__AudioBank && __AudioBank.play){
        var prev=__AudioBank.play.bind(__AudioBank);
        __AudioBank.play=function(name,rate){
          if(name==="click"){
            var ac=__AudioBank.ctxOf && __AudioBank.ctxOf();
            if(ac){ soft(ac,lastPick,(NeonEngine&&NeonEngine.state&&NeonEngine.state.combo)||0); return; }
          }
          return prev(name,rate);
        };
        try{ delete __AudioBank.buf.click; }catch(e){}
      }
    }catch(e){}
  }
  if(document.readyState==="complete") hookSound();
  else addEventListener("load", hookSound);
  setTimeout(hookSound, 500);

  function floatText(x,y,text,hue){
    if(layer.childElementCount>10) layer.removeChild(layer.firstChild);
    var el=document.createElement("div");
    el.className="var-float";
    el.textContent=text;
    el.style.left=x+"px"; el.style.top=(y-12)+"px";
    el.style.color="hsl("+hue+",80%,72%)";
    layer.appendChild(el);
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 720);
  }
  function dots(x,y,hue,n){
    n=n||4;
    for(var i=0;i<n;i++){
      if(layer.childElementCount>14) layer.removeChild(layer.firstChild);
      var d=document.createElement("div");
      d.className="var-pop";
      d.style.left=(x-6+(Math.random()*24-12))+"px";
      d.style.top=(y-6+(Math.random()*24-12))+"px";
      d.style.background="hsl("+((hue+i*20)%360)+",85%,65%)";
      layer.appendChild(d);
      setTimeout((function(node){ return function(){ if(node.parentNode) node.parentNode.removeChild(node); }; })(d), 520);
    }
  }

  function apply(m, x, y){
    lastPick=m.note;
    seen[m.id]=1;
    log.unshift(m.word+" ・ "+m.kind);
    if(log.length>12) log.pop();
    if(window.NeonEngine && NeonEngine.state) NeonEngine.state.hue = m.hue;
    document.documentElement.style.setProperty("--combo-hue", String(m.hue));
    var core=document.getElementById("coreTrigger");
    if(core){ core.classList.add("var-lit"); setTimeout(function(){ core.classList.remove("var-lit"); }, 140); }
    if(m.kind==="event" || m.kind==="mission" || m.kind==="weather") floatText(x,y,m.word,m.hue);
    else dots(x,y,m.hue, m.kind==="particle"?6:3);
    try{ localStorage.setItem("mz_moments_seen", JSON.stringify(seen)); }catch(e){}
    var box=document.getElementById("momentLog");
    if(box) paintBoard();
  }

  document.addEventListener("pointerdown", function(ev){
    var t=ev.target;
    if(!(t && t.closest && t.closest("#coreTrigger"))) return;
    var m=MOM[(Math.random()*MOM.length)|0];
    apply(m, ev.clientX||innerWidth/2, ev.clientY||innerHeight/2);
  }, {passive:true});

  /* light ambient events — no extra rAF */
  setInterval(function(){
    if(document.hidden) return;
    if(Math.random()>0.22) return;
    var m=MOM[(Math.random()*MOM.length)|0];
    if(window.NeonEngine && NeonEngine.toast) NeonEngine.toast(m.word);
    log.unshift("空: "+m.word);
    if(log.length>12) log.pop();
  }, 16000);

  function paintBoard(){
    var root=document.getElementById("elementCodexRoot");
    if(!root) return;
    var n=Object.keys(seen).length;
    var html="<div style='color:#c4b5fd;margin:0 0 8px'>出会ったモーメント <b>"+n+"</b> / 1000　種類は音・色・星座・イベントが混ざっています</div>";
    html+="<div id='momentLog'>";
    if(!log.length) html+="<div>コアをタップすると、その都度ちがう光と音が出ます。</div>";
    log.forEach(function(s){ html+="<div>"+s+"</div>"; });
    html+="</div>";
    root.innerHTML=html;
  }
  window.ElementCodex={show:paintBoard};
  window.VarietyPack={moments:MOM,seen:function(){return Object.keys(seen).length;}};
})();
