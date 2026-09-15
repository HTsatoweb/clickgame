(function(){
  "use strict";
  var css=document.createElement("style");
  css.textContent=[
    "#playLoop{width:min(100%,360px);margin:8px auto 0;padding:8px 10px;border-radius:12px;",
    "background:rgba(8,10,24,.9);border:1px solid rgba(255,234,0,.28);color:#e5e7eb;font:12px/1.4 system-ui;}",
    "#playLoop .pl-k{font-size:10px;letter-spacing:.12em;color:#ffea00;font-weight:800}",
    "#playLoop .pl-q{margin:4px 0 6px;font-weight:800;color:#00ffcc}",
    "#playLoop .pl-bar{height:7px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden}",
    "#playLoop .pl-bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,#00ffcc,#ffea00);transition:width .2s}",
    "#playLoop .pl-row{display:flex;justify-content:space-between;gap:8px;margin-top:6px;color:#9ca3af;font-size:11px}",
    "#playLoop button{margin-top:6px;margin-right:4px;padding:5px 8px;border-radius:8px;border:1px solid rgba(0,255,204,.3);",
    "background:rgba(0,255,204,.08);color:#fff;font-weight:700;font-size:11px;cursor:pointer}",
    "#playOrb{position:absolute;width:22px;height:22px;border-radius:50%;border:2px solid #ffea00;background:rgba(255,234,0,.35);",
    "transform:translate(-50%,-50%);pointer-events:auto;display:none;z-index:6}",
    "#playOrb.on{display:block;animation:orbPulse .8s ease-in-out infinite}",
    "@keyframes orbPulse{50%{transform:translate(-50%,-50%) scale(1.18)}}"
  ].join("");
  document.head.appendChild(css);

  var MISSIONS=[
    {id:"combo8",t:"コンボを 8 までつなげる",need:8},
    {id:"tap20",t:"コアを 20 回タップ",need:20},
    {id:"orb3",t:"黄色いオーブを 3 個キャッチ",need:3},
    {id:"fever",t:"フィーバー窓のあいだに 12 タップ",need:12},
    {id:"mini1",t:"MINIタブのゲームを 1 回クリア",need:1},
    {id:"wait",t:"リズム光が明るいときに 6 回タップ",need:6},
    {id:"event",t:"イベントボタンを 1 回選ぶ",need:1},
    {id:"combo15",t:"コンボ 15 に挑戦",need:15},
    {id:"tap40",t:"40 タップの短距離走",need:40},
    {id:"orb5",t:"オーブ 5 個",need:5}
  ];

  var S={
    mi:0, progress:0, taps:0, orbs:0, combo:0, lastTap:0,
    feverUntil:0, rhythm:0, events:0, streak:0
  };
  try{ var raw=localStorage.getItem("mz_playloop_v1"); if(raw) Object.assign(S, JSON.parse(raw)); }catch(e){}
  function save(){ try{ localStorage.setItem("mz_playloop_v1", JSON.stringify({mi:S.mi,streak:S.streak})); }catch(e){} }

  function mission(){ return MISSIONS[S.mi%MISSIONS.length]; }

  function reward(n, why){
    n=Math.max(1,n|0);
    try{
      if(window.game && typeof D==="function"){
        var base=D(2).pow(Math.min(10, Math.floor(Math.log10(Math.max(1, Number(game.totalClicks||1))))));
        game.energy=D(game.energy).add(base.mul(n));
      }
    }catch(e){}
    try{
      var el=document.getElementById("starPts");
      if(el) el.textContent=String((parseInt(el.textContent,10)||0)+n);
    }catch(e){}
    if(window.NeonEngine&&NeonEngine.toast) NeonEngine.toast((why||"クリア")+" +"+n);
  }

  function nextMission(){
    S.mi++; S.progress=0; S.taps=0; S.orbs=0; save(); paint();
  }
  function addProg(n){
    var m=mission();
    S.progress+=n;
    if(S.progress>=m.need){
      S.streak++;
      reward(4+Math.min(8,S.streak), m.t);
      nextMission();
    } else paint();
  }

  var box, bar, q, meta, evWrap, orb;

  function paint(){
    if(!q) return;
    var m=mission();
    q.textContent=m.t;
    if(bar) bar.style.width=Math.min(100, (S.progress/m.need)*100)+"%";
    if(meta) meta.textContent="連続クリア "+S.streak+"　進捗 "+S.progress+"/"+m.need;
  }

  function showEvent(){
    if(!evWrap) return;
    var A=["星の追い風","光子ボーナス","静かな観測"];
    var B=["星座アライン","量子のそろり","彗星ポイント"];
    var a=A[(Math.random()*A.length)|0], b=B[(Math.random()*B.length)|0];
    evWrap.innerHTML="";
    function mk(label, n){
      var btn=document.createElement("button");
      btn.type="button"; btn.textContent=label;
      btn.onclick=function(){
        reward(n, label); S.events++;
        if(mission().id==="event") addProg(1);
        evWrap.innerHTML="";
      };
      evWrap.appendChild(btn);
    }
    mk(a,3); mk(b,3);
  }

  function spawnOrb(){
    var core=document.getElementById("coreTrigger");
    if(!core||!orb) return;
    var r=core.getBoundingClientRect();
    var ang=Math.random()*6.28, rad=Math.max(r.width,70)*0.62;
    orb.style.left=(r.left+r.width/2+Math.cos(ang)*rad)+"px";
    orb.style.top=(r.top+r.height/2+Math.sin(ang)*rad)+"px";
    orb.classList.add("on");
    clearTimeout(spawnOrb._t);
    spawnOrb._t=setTimeout(function(){ orb.classList.remove("on"); }, 2600);
  }

  function onCore(){
    var now=performance.now();
    S.combo = (now-S.lastTap<700) ? S.combo+1 : 1;
    S.lastTap=now; S.taps++;
    var m=mission();
    if(m.id==="tap20"||m.id==="tap40") addProg(1);
    if(m.id.indexOf("combo")===0) { S.progress=S.combo; if(S.combo>=m.need){ addProg(0); if(S.progress>=m.need){ S.streak++; reward(5,m.t); nextMission(); } } else paint(); }
    if(m.id==="fever" && now<S.feverUntil) addProg(1);
    if(m.id==="wait" && S.rhythm>0.62) addProg(1);
  }

  function tick(){
    S.rhythm=0.5+0.5*Math.sin(performance.now()/420);
    var core=document.getElementById("coreTrigger");
    if(core) core.style.outline = S.rhythm>0.62 ? "2px solid rgba(255,234,0,.55)" : "2px solid transparent";
    if(performance.now()>S.feverUntil && Math.random()<0.003){
      S.feverUntil=performance.now()+4000;
      if(window.NeonEngine&&NeonEngine.toast) NeonEngine.toast("フィーバー");
    }
  }

  function mount(){
    var host=document.querySelector(".click-core-container")||document.querySelector(".column-left");
    if(!host || document.getElementById("playLoop")) return;
    box=document.createElement("div");
    box.id="playLoop";
    box.innerHTML='<div class="pl-k">SESSION LOOP</div><div class="pl-q" id="plQ"></div><div class="pl-bar"><i id="plBar"></i></div><div class="pl-row" id="plMeta"></div><div id="plEv"></div>';
    host.appendChild(box);
    q=document.getElementById("plQ");
    bar=document.getElementById("plBar");
    meta=document.getElementById("plMeta");
    evWrap=document.getElementById("plEv");
    orb=document.createElement("button");
    orb.id="playOrb"; orb.type="button"; orb.setAttribute("aria-label","ボーナスオーブ");
    document.body.appendChild(orb);
    orb.addEventListener("click", function(ev){
      ev.preventDefault(); ev.stopPropagation();
      orb.classList.remove("on"); S.orbs++;
      if(mission().id.indexOf("orb")===0) addProg(1);
      reward(1,"オーブ");
    });
    paint();
  }

  document.addEventListener("pointerdown", function(ev){
    var t=ev.target;
    if(t && t.closest && t.closest("#coreTrigger")) onCore();
  }, {passive:true});

  if(document.readyState==="complete") mount();
  else addEventListener("load", mount);

  setInterval(function(){
    if(document.hidden) return;
    tick();
    if(Math.random()<0.25) spawnOrb();
  }, 1800);
  setInterval(function(){
    if(document.hidden) return;
    showEvent();
  }, 28000);

  window.PlayLoop={state:S,next:nextMission};
})();
