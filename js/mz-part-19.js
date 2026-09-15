
/**
 * OMEGA CORE SYSTEMS — 本格追加（位置は既存タブ内 / オフライン / スマホ）
 * 分割起動。ゲーム本編の計算・転生・施設は変更しない。
 */
(function OmegaCoreSystems(){
  "use strict";
  var KEY="omega_core_sys_v1";
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ return {}; } }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(ST)); }catch(e){} }
  var ST=Object.assign({
    day:"", quests:[], questDone:0, codex:{}, titles:[],
    sessionStart:Date.now(), bestCps:"0", taps:0, perfectDays:0,
    lowFx:false, explain:true
  }, load());

  var CODEX = [
    ["c1","はじめてのタップ","コアを1回押す"],
    ["c2","コンボ10","10コンボ"],
    ["c3","コンボ50","50コンボ"],
    ["c4","スターター","エネルギー 1e3"],
    ["c5","工場見習い","エネルギー 1e6"],
    ["c6","反物質の気配","AMを1つ"],
    ["c7","時間のカケラ","TSを1つ"],
    ["c8","毎日1日","スタンプ1"],
    ["c9","毎日3日","スタンプ3"],
    ["c10","シール3種","シール3つ"],
    ["c11","ペットLv3","ペットが育つ"],
    ["c12","連打王","30連打成功"],
    ["c13","テーマコレクター","テーマを3回変える"],
    ["c14","正確グラフ","記録点が20"],
    ["c15","オフライン冒険","ネットなし起動"],
    ["c16","スマホ操作","タッチで遊ぶ"],
    ["c17","やりこみ1","セッション5分"],
    ["c18","やりこみ2","セッション15分"],
    ["c19","銀河の入口","エネルギー 1e12"],
    ["c20","記録好き","CSV/JSONを知る"]
  ];

  function today(){
    var d=new Date();
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  }
  function rollQuests(){
    if(ST.day===today() && ST.quests && ST.quests.length) return;
    ST.day=today();
    var pool=[
      {id:"q_tap30",name:"コアを30回タップ",need:30,got:0,kind:"tap"},
      {id:"q_combo8",name:"8コンボを出す",need:8,got:0,kind:"combo"},
      {id:"q_pet",name:"ペットを3回なでる",need:3,got:0,kind:"pet"},
      {id:"q_theme",name:"色替えを1回",need:1,got:0,kind:"theme"},
      {id:"q_view",name:"PLAY VIEWを開く",need:1,got:0,kind:"view"}
    ];
    ST.quests=[];
    while(ST.quests.length<3){
      var x=pool[Math.floor(Math.random()*pool.length)];
      if(ST.quests.some(function(q){return q.id===x.id;})) continue;
      ST.quests.push({id:x.id,name:x.name,need:x.need,got:0,kind:x.kind,ok:false});
    }
    save();
  }
  function questAdd(kind, n){
    var changed=false;
    (ST.quests||[]).forEach(function(q){
      if(q.ok || q.kind!==kind) return;
      q.got=Math.min(q.need, (q.got||0)+(n||1));
      if(q.got>=q.need){ q.ok=true; ST.questDone=(ST.questDone||0)+1; if(typeof createToast==="function") createToast("クエスト", q.name+" クリア"); }
      changed=true;
    });
    if(changed) save();
  }
  function unlockCodex(id){
    if(ST.codex[id]) return;
    ST.codex[id]=1; save();
    var row=CODEX.filter(function(x){return x[0]===id;})[0];
    if(row && typeof createToast==="function") createToast("図鑑", row[1]+" かいほう");
  }
  function checkCodex(){
    var D=window.DopaKidsPack && window.DopaKidsPack.state;
    var taps=(D&&D.taps)||0;
    var combo=(D&&D.bestCombo)||0;
    if(taps>=1) unlockCodex("c1");
    if(combo>=10) unlockCodex("c2");
    if(combo>=50) unlockCodex("c3");
    if(D && Object.keys(D.stamps||{}).length>=1) unlockCodex("c8");
    if(D && Object.keys(D.stamps||{}).length>=3) unlockCodex("c9");
    if(D && Object.keys(D.stickers||{}).length>=3) unlockCodex("c10");
    if(D && D.petLv>=3) unlockCodex("c11");
    if(typeof navigator!=="undefined" && navigator.onLine===false) unlockCodex("c15");
    if(("ontouchstart" in window) || (navigator.maxTouchPoints>0)) unlockCodex("c16");
    try {
      if(window.game && typeof D==="function"){ var game=window.game;
        if(D(game.energy).gte(1000)) unlockCodex("c4");
        if(D(game.energy).gte(1e6)) unlockCodex("c5");
        if(D(game.energy).gte("1e12")) unlockCodex("c19");
        if(D(game.antimatter||0).gte(1)) unlockCodex("c6");
        if(D(game.timeShards||0).gte(1)) unlockCodex("c7");
      }
    } catch(e){}
    try {
      var rec=localStorage.getItem("omega_record_v1");
      if(rec && rec.length>20){
        var o=JSON.parse(rec);
        if(o && (o.samples||0)>=20) unlockCodex("c14");
      }
    } catch(e2){}
    var mins=(Date.now()-(ST.sessionStart||Date.now()))/60000;
    if(mins>=5) unlockCodex("c17");
    if(mins>=15) unlockCodex("c18");
  }

  function mountCard(){
    var host=document.getElementById("playviewTabBody") || document.getElementById("tab-playview");
    if(!host || document.getElementById("dopaSysCard")) return;
    var box=document.createElement("div");
    box.id="dopaSysCard";
    box.className="pv-sec";
    host.insertBefore(box, host.firstChild);
    renderCard();
  }
  function renderCard(){
    var box=document.getElementById("dopaSysCard"); if(!box) return;
    var open=0;
    CODEX.forEach(function(c){ if(ST.codex[c[0]]) open++; });
    var qhtml=(ST.quests||[]).map(function(q){
      return "<div class='dopa-q'>"+(q.ok?"✅":"◻")+" <b>"+q.name+"</b> "+q.got+"/"+q.need+"</div>";
    }).join("") || "<div class='dopa-q'>クエスト準備中</div>";
    var album=CODEX.map(function(c){
      var on=!!ST.codex[c[0]];
      return "<div class='pv-item "+(on?"on":"")+"'><b>"+(on?c[1]:"？？？")+"</b>"+(on?c[2]:"まだひみつ")+"</div>";
    }).join("");
    var net=(typeof navigator!=="undefined" && navigator.onLine===false)?"オフラインで動いています":"オンライン（本体はオフラインでも可）";
    box.innerHTML = "<h3>ドパ本格システム</h3>"+
      "<div class='guide-text-block'>左の TAP CORE を押してエネルギーを貯める本編はそのまま。ここはおまけの図鑑・今日のクエストです。グラフは丸めません。</div>"+
      "<div class='pv-item on'><b>接続</b>"+net+"</div>"+
      "<div style='margin:8px 0 4px'>今日のクエスト</div>"+qhtml+
      "<div style='margin:8px 0 4px'>図鑑 "+open+" / "+CODEX.length+"</div>"+
      "<div class='pv-grid'>"+album+"</div>";
  }

  function hudOffline(){
    var host=document.getElementById("effectHUD");
    if(!host || document.getElementById("eh-offline")) return;
    var row=document.createElement("div");
    row.className="eh-row";
    row.innerHTML="<span>通信</span><span class='eh-val' id='eh-offline'></span>";
    host.appendChild(row);
    function paint(){
      var el=document.getElementById("eh-offline");
      if(el) el.textContent = (navigator.onLine===false) ? "OFFLINE OK" : "ONLINE";
    }
    paint();
    addEventListener("online", paint);
    addEventListener("offline", paint);
  }

  var fpsE=60, last=performance.now(), frames=0;
  function watchPerf(){
    function loop(ts){
      frames++;
      if(ts-last>=1000){
        fpsE = frames*1000/Math.max(1,ts-last);
        frames=0; last=ts;
        if(fpsE<28 && !ST.lowFx){
          ST.lowFx=true; save();
          var fx=document.getElementById("omegaGlWorld");
          if(fx) fx.style.opacity="0.2";
        }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function hookMore(){
    document.addEventListener("pointerdown", function(ev){
      var t=ev.target; if(!t||!t.closest) return;
      if(t.closest("#coreTrigger")) questAdd("tap",1);
      if(t.closest("#dopaInlinePet")) questAdd("pet",1);
      if(t.closest("#sk-theme")) questAdd("theme",1);
    }, {passive:true});
    var btn=document.getElementById("tabBtnPlayview");
    if(btn) btn.addEventListener("click", function(){ questAdd("view",1); renderCard(); });
    var pack=window.DopaKidsPack;
    if(pack && pack.state){
      var prev=pack.state.bestCombo||0;
      setInterval(function(){
        if(pack.state.bestCombo>=8) questAdd("combo", pack.state.bestCombo);
        checkCodex();
        var card=document.getElementById("dopaSysCard");
        if(card && card.offsetParent!==null) renderCard();
      }, 4000);
    }
  }

  var FEATURE_EXTRA = 0;
  function noteFeatures(){
    FEATURE_EXTRA = 20 + CODEX.length + 5;
  }

  function chunks(jobs){
    var i=0;
    function next(){
      if(i>=jobs.length) return;
      try{ jobs[i++](); }catch(e){}
      if(window.requestIdleCallback) requestIdleCallback(next,{timeout:220});
      else setTimeout(next, 50);
    }
    next();
  }

  function boot(){
    chunks([
      function(){ rollQuests(); },
      function(){ hudOffline(); },
      function(){ mountCard(); },
      function(){ hookMore(); },
      function(){ watchPerf(); },
      function(){ noteFeatures(); checkCodex(); renderCard(); }
    ]);
  }
  if(document.readyState==="complete") setTimeout(boot, 80);
  else addEventListener("load", function(){ setTimeout(boot, 80); });
  window.OmegaCoreSystems={state:ST,codex:CODEX,refresh:renderCard};
})();
