
(function(){
  "use strict";
  function tuneGraph(){
    var G=window.OmegaSyncRecord;
    if(!G||!G.cfg) return;
    G.cfg.intervalMs=1000;
    G.cfg.maxPoints=1200;
    G.cfg.showDots=false;
    G.cfg.quality="low";
    G.cfg.exactRaw=true;
    if(typeof G.setIntervalMs==="function") try{ G.setIntervalMs(1000); }catch(e){}
  }
  setTimeout(tuneGraph, 400);
  setTimeout(tuneGraph, 2000);

  /* perfect-enough ring log (log10 energy), light */
  var REC = window.NeonRecord = {
    n:0, cap:2400,
    t:new Float64Array(2400),
    e:new Float64Array(2400),
    c:new Float64Array(2400),
    last:0,
    push:function(){
      var now=performance.now();
      if(now-this.last<1000) return;
      this.last=now;
      var e=0,c=0;
      try{
        if(window.game){
          var E=game.energy;
          if(E && E.ln) e=Number(E.ln())/Math.LN10;
          else e=Math.log10(Math.max(1e-12, Number(E)||0));
          if(typeof getTotalCps==="function"){
            var C=getTotalCps();
            if(C && C.ln) c=Number(C.ln())/Math.LN10;
            else c=Math.log10(Math.max(1e-12, Number(C)||0));
          }
        }
      }catch(err){}
      var i=this.n%this.cap;
      this.t[i]=Date.now(); this.e[i]=e; this.c[i]=c; this.n++;
    },
    snapshot:function(){
      var len=Math.min(this.n,this.cap), out=new Array(len), i, idx;
      var start=Math.max(0,this.n-this.cap);
      for(i=0;i<len;i++){
        idx=(start+i)%this.cap;
        out[i]={t:this.t[idx], energyLog10:this.e[idx], cpsLog10:this.c[idx]};
      }
      return out;
    }
  };
  setInterval(function(){ if(!document.hidden) REC.push(); }, 1000);

  var GAMES=[
    ["星タップ","targets"],["タイミングバー","timing"],["記憶フラッシュ","memory"],["落ち星キャッチ","catch"],
    ["長押しチャージ","hold"],["連打チャレンジ","mash"],["流れ星よけ","dodge"],["いろ合わせ","color"],
    ["サイモン星","simon"],["バーを止める","stop"],["星を数える","count"],["スワイプカット","swipe"],
    ["コンボキープ","combo"],["スピード星","speed"],["静かなタップ","calm"],["リズム3拍","rhythm"],
    ["左右タッチ","lr"],["拡大コア","grow"],["縮小コア","shrink"],["色チェンジ","hue"],
    ["二重円","ring"],["点つなぎ","dots"],["反射神経","react"],["ストップウォッチ","watch"],
    ["宝箱あけ","box"],["雲ぬけ","cloud"],["月ジャンプ","jump"],["惑星キャッチ","planet"],
    ["彗星タッチ","comet"],["北斗なぞり","dipper"],["カシオペヤ","cass"],["オリオンベルト","orion"],
    ["こと座ピン","lyra"],["南十字","crux"],["ペガスス","peg"],["さそり尾","sco"],
    ["量子ピンポン","qping"],["干渉タッチ","wave"],["軌道一周","orbit"],["光子集め","photon"],
    ["泡わり","bubble"],["雪キャッチ","snow"],["花びら","petal"],["ホタル","fly"],
    ["パルス合わせ","pulse"],["ゲージぴったり","gauge"],["3択クイズ星","quiz"],["音なし神経","silent"],
    ["ペア探し","pair"],["おぼえ星","memo"]
  ];

  var overlay, grid, play, cv, ctx, stat, running=false, raf=0, mode=null, st=null;

  function reward(score){
    var add=Math.max(1, score|0);
    try{
      if(window.game && window.D){ game.energy=D(game.energy).add(D(add)); }
      else if(window.game){ game.energy=(Number(game.energy)||0)+add; }
    }catch(e){}
    if(window.NeonEngine && NeonEngine.toast) NeonEngine.toast("+"+add+" ENERGY");
    if(typeof formatValue==="function"){
      var el=document.getElementById("v-energy");
      try{ if(el) el.textContent=formatValue(game.energy); }catch(e){}
    }
  }

  function openList(){
    overlay.classList.add("show");
    play.classList.remove("show");
    grid.style.display="grid";
    running=false;
  }
  function closeAll(){
    overlay.classList.remove("show");
    running=false;
    if(raf){ cancelAnimationFrame(raf); raf=0; }
  }

  function start(id, type){
    grid.style.display="none";
    play.classList.add("show");
    mode=type;
    st={t0:performance.now(), score:0, hits:0, lives:3, x:240, y:110, items:[], seq:[], step:0, phase:0, need:8};
    if(type==="memory"||type==="simon"||type==="memo"){
      st.seq=[1,2,3,1]; st.step=0; st.phase="show";
    }
    running=true;
    loop();
  }

  function loop(){
    if(!running) return;
    raf=requestAnimationFrame(loop);
    var w=cv.width, h=cv.height, now=performance.now(), t=(now-st.t0)/1000;
    ctx.fillStyle="#050814"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="#00ffcc"; ctx.font="12px system-ui";

    if(mode==="targets"||mode==="speed"||mode==="photon"||mode==="fly"||mode==="petal"||mode==="snow"){
      if(st.items.length<4 && Math.random()<0.04){
        st.items.push({x:20+Math.random()*(w-40), y:20+Math.random()*(h-40), r:14, life:1});
      }
      st.items.forEach(function(p){
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.28); ctx.fill();
      });
      ctx.fillStyle="#ffea00"; ctx.fillText("星をタップ  "+st.hits+"/"+st.need, 10, 16);
      if(st.hits>=st.need){ running=false; stat.textContent="クリア!"; reward(20+st.hits); }
    } else if(mode==="timing"||mode==="stop"||mode==="gauge"||mode==="pulse"){
      var pos=(Math.sin(now/220)+1)*0.5;
      st.pos=pos;
      ctx.fillStyle="#133"; ctx.fillRect(20,h/2-10,w-40,20);
      ctx.fillStyle="#00ffcc"; ctx.fillRect(20+(w-40)*0.42,h/2-10,(w-40)*0.16,20);
      ctx.fillStyle="#ffea00"; ctx.fillRect(20+(w-40)*pos-3,h/2-14,6,28);
      ctx.fillText("黄色い線が緑の帯でタップ", 10, 16);
    } else if(mode==="catch"||mode==="comet"||mode==="planet"){
      if(Math.random()<0.03) st.items.push({x:Math.random()*w,y:-10,vy:1.4+Math.random()});
      st.items.forEach(function(p){ p.y+=p.vy; ctx.beginPath(); ctx.arc(p.x,p.y,8,0,6.28); ctx.fill(); });
      ctx.fillStyle="#ffea00"; ctx.fillRect(st.x-18,h-16,36,10);
      ctx.fillText("下で受け止める  "+st.hits, 10, 16);
      st.items=st.items.filter(function(p){
        if(p.y>h-18 && Math.abs(p.x-st.x)<24){ st.hits++; return false; }
        return p.y<h+10;
      });
      if(st.hits>=10){ running=false; stat.textContent="クリア!"; reward(25); }
    } else if(mode==="mash"||mode==="combo"){
      ctx.font="28px system-ui"; ctx.fillText(String(st.hits), w/2-10, h/2);
      ctx.font="12px system-ui"; ctx.fillText("連打! 残り "+Math.max(0,(5-t)).toFixed(1)+"秒", 10, 16);
      if(t>=5){ running=false; stat.textContent="スコア "+st.hits; reward(st.hits); }
    } else if(mode==="hold"||mode==="grow"){
      st.hold=(st.hold||0)*0.98;
      ctx.fillStyle="#133"; ctx.fillRect(20,h-24,w-40,12);
      ctx.fillStyle="#00ffcc"; ctx.fillRect(20,h-24,(w-40)*Math.min(1,st.hold),12);
      ctx.fillText("押しっぱなしでチャージ", 10, 16);
      if(st.hold>=1){ running=false; stat.textContent="満タン!"; reward(18); }
    } else if(mode==="dodge"||mode==="cloud"){
      if(Math.random()<0.04) st.items.push({x:Math.random()*w,y:-8,vy:2});
      st.items.forEach(function(p){ p.y+=p.vy; ctx.fillStyle="#ff5577"; ctx.fillRect(p.x,p.y,12,12); });
      ctx.fillStyle="#00ffcc"; ctx.beginPath(); ctx.arc(st.x,h-20,10,0,6.28); ctx.fill();
      var hit=st.items.some(function(p){ return Math.abs(p.x-st.x)<16 && Math.abs(p.y-(h-20))<16; });
      if(hit){ running=false; stat.textContent="ぶつかった スコア"+st.hits; reward(st.hits); }
      else { st.hits=Math.floor(t); ctx.fillStyle="#ffea00"; ctx.fillText("避け続けて "+st.hits, 10, 16); }
    } else if(mode==="count"){
      if(!st.ready){
        st.n=3+((Math.random()*4)|0);
        for(var i=0;i<st.n;i++) st.items.push({x:30+Math.random()*(w-60),y:40+Math.random()*(h-80)});
        st.ready=1; st.tshow=now;
      }
      if(now-st.tshow<1200){
        st.items.forEach(function(p){ ctx.beginPath(); ctx.arc(p.x,p.y,7,0,6.28); ctx.fill(); });
        ctx.fillText("いくつ？",10,16);
      } else {
        ctx.fillText("画面タップで回答: いま "+(st.guess||0)+" （もう一度タップで+1、長めに待って確定）",10,16);
        if(now-st.tshow>5000){
          running=false;
          var ok=(st.guess||0)===st.n;
          stat.textContent=ok?"正解 "+st.n:"正解は "+st.n;
          reward(ok?30:5);
        }
      }
    } else {
      ctx.fillText(mode+" : 画面をタップ!", 10, 16);
      ctx.beginPath(); ctx.arc(w/2,h/2,20+Math.sin(now/150)*6,0,6.28); ctx.fill();
      if(st.hits>=8){ running=false; stat.textContent="クリア!"; reward(16+st.hits); }
    }
  }

  function onTap(ev){
    if(!running) return;
    var r=cv.getBoundingClientRect();
    var x=(ev.clientX-r.left)*cv.width/r.width;
    var y=(ev.clientY-r.top)*cv.height/r.height;
    if(mode==="targets"||mode==="speed"||mode==="photon"||mode==="fly"||mode==="petal"||mode==="snow"){
      st.items=st.items.filter(function(p){
        var dx=p.x-x, dy=p.y-y;
        if(dx*dx+dy*dy<p.r*p.r*4){ st.hits++; return false; }
        return true;
      });
    } else if(mode==="timing"||mode==="stop"||mode==="gauge"||mode==="pulse"){
      var ok=st.pos>0.42 && st.pos<0.58;
      running=false; stat.textContent=ok?"ぴったり!":"もう少し"; reward(ok?28:6);
    } else if(mode==="mash"||mode==="combo"){ st.hits++; }
    else if(mode==="hold"||mode==="grow"){ st.hold=(st.hold||0)+0.08; }
    else if(mode==="dodge"||mode==="cloud"||mode==="catch"||mode==="comet"||mode==="planet"){ st.x=x; }
    else if(mode==="count"){ st.guess=(st.guess||0)+1; }
    else { st.hits++; }
  }

  function boot(){
    overlay=document.getElementById("dopaArcade");
    grid=document.getElementById("dopaGrid");
    play=document.getElementById("dopaPlay");
    cv=document.getElementById("dopaCV");
    stat=document.getElementById("dopaStat");
    if(!overlay||!grid||!cv) return;
    ctx=cv.getContext("2d",{alpha:false});
    GAMES.forEach(function(g,i){
      var b=document.createElement("button");
      b.type="button"; b.textContent=(i+1)+". "+g[0];
      b.addEventListener("click", function(){ start(g[0], g[1]); });
      grid.appendChild(b);
    });
    document.getElementById("dopaArcadeBtn").addEventListener("click", openList);
    document.getElementById("dopaClose").addEventListener("click", closeAll);
    document.getElementById("dopaBack").addEventListener("click", function(){ running=false; openList(); });
    overlay.addEventListener("click", function(e){ if(e.target===overlay) closeAll(); });
    cv.addEventListener("pointerdown", onTap);
    cv.addEventListener("pointermove", function(e){
      if(!running) return;
      if(mode==="dodge"||mode==="cloud"||mode==="catch"||mode==="comet"||mode==="planet"){
        var r=cv.getBoundingClientRect();
        st.x=(e.clientX-r.left)*cv.width/r.width;
      }
    });
  }
  if(document.readyState==="complete") boot();
  else addEventListener("load", boot);
})();
