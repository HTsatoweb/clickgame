
(function(){
  "use strict";
  /* graph: exact reset + lighter default interval */
  function resetGraphStorage(){
    try {
      localStorage.removeItem("omega_record_v1");
      localStorage.removeItem("omega_record_cfg_v1");
      localStorage.removeItem("omega_record_view_v1");
    } catch(e){}
    try {
      if (window.OmegaSyncRecord) {
        if (typeof OmegaSyncRecord.resetData === "function") OmegaSyncRecord.resetData();
        else if (OmegaSyncRecord.cfg) {
          OmegaSyncRecord.cfg.paused = false;
        }
      }
    } catch(e){}
  }
  window.resetGraphStorage = resetGraphStorage;
  function patchRecord(){
    var R = window.OmegaSyncRecord;
    if (!R) return;
    if (!R.resetData) {
      R.resetData = function(){
        try { localStorage.removeItem("omega_record_v1"); } catch(e){}
        try { localStorage.removeItem("omega_record_view_v1"); } catch(e){}
        if (R.view) { R.view.metric = R.view.metric || "energy"; }
        if (typeof R.ensurePlayviewMount === "function") R.ensurePlayviewMount();
      };
    }
    try {
      if (R.cfg && (R.cfg.intervalMs === 0 || R.cfg.intervalMs == null)) {
        if (typeof R.setIntervalMs === "function") R.setIntervalMs(250);
        else R.cfg.intervalMs = 250;
      }
    } catch(e){}
  }
  if (document.readyState === "complete") patchRecord();
  else addEventListener("load", patchRecord);

  /* 50 family-friendly minigames */
  var GAMES = [
    ["星タップ","限時間内に星をタップ"],["流れ星","流れる星をキャッチ"],["タイミング","バーが中央で止める"],
    ["連打10秒","10秒間タップ"],["色合わせ","同じ色を選ぶ"],["記憶カード","2枚そろえる"],
    ["星座つなぎ","星を順に結ぶ"],["数字順","1から順に"],["ストップ寄せ","目標値で止める"],
    ["バブル割","泡を割る"],["リズム4","4拍でタップ"],["左右交互","左右を交互に"],
    ["円ジャンプ","円が重なったら"],["小さい星","小さい星を探す"],["カウント撃ち","0でタップ"],
    ["ペア探し","ペアを見つける"],["色じゃなくて","色の名前に従う"],["レーン3","3レーンを拾う"],
    ["まばたき星","点滅した星をタップ"],["拡大狙い","大きくなったらタップ"],["コイン集め","コインを集める"],
    ["シールド","赤い球をはじく"],["3個同時","3つ tap"],["一筆星","線を切らずに"],
    ["北極星","一番明るい星"],["オリオン","3つ並びをタップ"],["カシオペヤ","Wをなぞる"],
    ["こと座","琴の形を作る"],["はくちょう","十字をタップ"],["南十字","4星を順に"],
    ["量子タップ","2つ同時風"],["干渉","波が重なったら"],["光子集め","光の粒"],
    ["軌道乗り","円軌道をタップ"],["準位ジャンプ","段が揃ったら"],["霧箱","軌跡をなぞる"],
    ["パルサー","点滅に合わせる"],["彗星尾","尾をなぞる"],["流星群","連続キャッチ"],
    ["銀河核","中心をキープ"],["衛星周回","一周でタップ"],["重力井戸","端から中心へ"],
    ["ノヴァ","膨らんだら離す"],["星図合わせ","形を選ぶ"],["等級比べ","明るい方"],
    ["赤経合わせ","目盛を合わせる"],["スペクトル","色を並べる"],["ファインダー","円の中に星"],
    ["露出","明るさバー"],["ファーストライト","最初の星を探す"]
  ];
  while (GAMES.length < 50) GAMES.push(["星遊び"+(GAMES.length+1),"短時間タップ"]);

  var root, canvas, ctx, ui, state = {
    id:0, t:0, score:0, live:false, need:0, hits:0, mark:0.5, seq:[], step:0, orbs:[]
  };
  var raf=0, last=0;

  function reward(n){
    n = Math.max(1, n|0);
    try {
      if (window.game && typeof D === "function") {
        var bonus = D(2).pow(Math.min(12, Math.floor(Math.log10(Math.max(1, Number(game.totalClicks||1))))));
        game.energy = D(game.energy).add(bonus.mul(n));
      }
    } catch(e){}
    try {
      var el=document.getElementById("starPts");
      if (el) el.textContent = String((parseInt(el.textContent,10)||0)+n);
    } catch(e){}
    try { if (window.NeonEngine && NeonEngine.toast) NeonEngine.toast("+" + n + " 星"); } catch(e){}
  }

  function start(id){
    state.id=id; state.t=0; state.score=0; state.live=true; state.hits=0; state.step=0;
    state.need = 8 + (id%7);
    state.mark = 0.35 + (id%5)*0.08;
    state.seq = [1,2,3,4,5,6,7,8].slice(0, 4+(id%5));
    state.orbs = [];
    for (var i=0;i<6;i++) state.orbs.push({x:40+Math.random()*220,y:30+Math.random()*120,r:8+id%6,vx:(Math.random()*2-1)*1.2,vy:(Math.random()*2-1)*1.2,on:1});
    last=performance.now();
    if (!raf) loop(last);
    paintList();
  }
  function end(win){
    state.live=false;
    if (win) reward(3 + (state.id%5) + Math.min(8, state.score));
    else reward(1);
  }
  function loop(now){
    raf=requestAnimationFrame(loop);
    if (!state.live){ raf=0; return; }
    var pane=document.getElementById("tab-mini");
    if (pane && !pane.classList.contains("active")) { raf=0; return; }
    var dt=Math.min(0.05,(now-last)/1000); last=now; state.t+=dt;
    var g=GAMES[state.id]||GAMES[0];
    var mode=state.id%8;
    if (mode===1 || mode===5){
      state.orbs.forEach(function(o){
        o.x+=o.vx; o.y+=o.vy;
        if(o.x<10||o.x>290)o.vx*=-1;
        if(o.y<10||o.y>170)o.vy*=-1;
      });
    }
    if (state.t>12){ end(state.hits>=state.need); draw(); return; }
    draw();
  }
  function draw(){
    if (!ctx || !canvas) return;
    var w=canvas.width, h=canvas.height;
    ctx.fillStyle="#070714"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="rgba(0,255,204,.25)"; ctx.strokeRect(1,1,w-2,h-2);
    ctx.fillStyle="#00ffcc"; ctx.font="12px sans-serif";
    var g=GAMES[state.id];
    ctx.fillText((g?g[0]:"")+"  "+state.hits+"/"+state.need+"  "+(12-state.t).toFixed(1)+"s", 8, 16);
    var mode=state.id%8;
    if (mode===2){
      var x=20+(w-40)*Math.abs(Math.sin(state.t*2.2));
      ctx.fillStyle="#334"; ctx.fillRect(20,h*0.55,w-40,10);
      ctx.fillStyle="#ffea00"; ctx.fillRect(w*state.mark-6,h*0.52,12,16);
      ctx.fillStyle="#00ffcc"; ctx.fillRect(x-3,h*0.54,6,12);
    } else {
      state.orbs.forEach(function(o,i){
        if(!o.on) return;
        ctx.beginPath(); ctx.fillStyle = i===0?"#ffea00":"#7dd3fc";
        ctx.arc(o.x,o.y,o.r,0,6.28); ctx.fill();
        if (mode===7){ ctx.fillStyle="#fff"; ctx.font="10px sans-serif"; ctx.fillText(String(i+1), o.x-3, o.y+3); }
      });
    }
  }
  function tap(ev){
    if (!state.live || !canvas) return;
    var r=canvas.getBoundingClientRect();
    var x=(ev.clientX-r.left)*canvas.width/r.width;
    var y=(ev.clientY-r.top)*canvas.height/r.height;
    var mode=state.id%8;
    if (mode===2){
      var bar=20+(canvas.width-40)*Math.abs(Math.sin(state.t*2.2));
      if (Math.abs(bar - canvas.width*state.mark)<16){ state.hits++; state.score++; }
      if (state.hits>=state.need) end(true);
      return;
    }
    for (var i=0;i<state.orbs.length;i++){
      var o=state.orbs[i]; if(!o.on) continue;
      var dx=x-o.x, dy=y-o.y;
      if (dx*dx+dy*dy <= (o.r+8)*(o.r+8)){
        if (mode===7 && i!==state.step) break;
        o.on=0; state.hits++; state.score++; state.step++;
        o.x=30+Math.random()*240; o.y=30+Math.random()*120; o.on=1;
        if (state.hits>=state.need) end(true);
        break;
      }
    }
  }

  function paintList(){
    if (!ui) return;
    var html="<div style='display:flex;gap:8px;align-items:center;margin:0 0 8px;flex-wrap:wrap'>";
    html+="<b style='color:#ffea00'>MINI 50</b>";
    html+="<button type='button' id='miniGraphReset' class='btn-utility'>グラフをリセット</button>";
    html+="</div>";
    html+="<canvas id='miniCanvas' width='320' height='180' style='width:min(100%,360px);height:auto;border:1px solid rgba(0,255,204,.3);border-radius:8px;background:#070714;touch-action:manipulation'></canvas>";
    html+="<div id='miniGrid' style='display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;margin-top:10px'>";
    GAMES.forEach(function(g,i){
      html+="<button type='button' data-mg='"+i+"' style='text-align:left;padding:6px;border-radius:8px;border:1px solid rgba(255,234,0,.25);background:rgba(255,234,0,.06);color:#fff;font-size:11px;font-weight:700'>"+g[0]+"<br><span style='color:#9ca3af;font-weight:600;font-size:10px'>"+g[1]+"</span></button>";
    });
    html+="</div>";
    ui.innerHTML=html;
    canvas=ui.querySelector("#miniCanvas");
    ctx=canvas.getContext("2d",{alpha:false});
    canvas.addEventListener("pointerdown", tap);
    ui.querySelectorAll("[data-mg]").forEach(function(b){
      b.addEventListener("click", function(){ start(+b.getAttribute("data-mg")); });
    });
    var gr=ui.querySelector("#miniGraphReset");
    if (gr) gr.addEventListener("click", function(){
      if (confirm("グラフ記録だけ消しますか？（ゲーム本体は残ります）")) {
        resetGraphStorage();
        location.reload();
      }
    });
    draw();
  }

  window.MiniArcade = {
    show: function(){
      root=document.getElementById("miniArcadeRoot");
      if (!root) return;
      if (!ui){ ui=document.createElement("div"); root.appendChild(ui); paintList(); }
    }
  };

  /* light fun events — only toast, no extra rAF */
  setInterval(function(){
    if (document.hidden) return;
    if (Math.random()>0.18) return;
    var ev=["流れ星","量子ゆらぎ","星座が輝いた","光子バースト","北極星ウインク","銀河の潮"];
    try { if (window.NeonEngine && NeonEngine.toast) NeonEngine.toast(ev[(Math.random()*ev.length)|0]); } catch(e){}
  }, 20000);
})();
