
(function OmegaLongPlay(){
  "use strict";
  const KEY = "omega_longplay_v1";
  const CHAPTERS = [
    "I はじまり","II 点火","III 軌道","IV 恒星風","V 反物質海",
    "VI 時間の岸","VII 銀河棚","VIII 観測塔","IX 終焉手前",
    "X 無限廊下","XI 絶対記録","XII オメガ核"
  ];
  const WEEKLY = [
    ["タップ職人","コアを 400 回タップ", function(S){ return S.taps >= 400; }],
    ["イベント観測","イベントを 12 回見る", function(S){ return S.events >= 12; }],
    ["オーブ狩り","オーブを 15 個取る", function(S){ return S.orbs >= 15; }],
    ["クイズ週間","クイズに 6 回正解", function(S){ return S.quizOk >= 6; }],
    ["フィーバー週","フィーバーを 8 回使う", function(S){ return S.fever >= 8; }],
    ["長時間観測","60 分遊ぶ", function(S){ return S.mins >= 60; }],
    ["コンボ週","コンボ 15 に到達", function(S){ return S.comboMax >= 15; }],
    ["早起き観測","タップ200とイベント5", function(S){ return S.taps>=200 && S.events>=5; }],
    ["双眼鏡","オーブ8とクイズ3", function(S){ return S.orbs>=8 && S.quizOk>=3; }],
    ["熟練週間","熟練合計80", function(S){ const m=S.mastery||{}; return (m.tap||0)+(m.idle||0)+(m.ev||0)+(m.quiz||0)>=80; }],
    ["長考","90分観測", function(S){ return S.mins>=90; }],
    ["連打祭","タップ800", function(S){ return S.taps>=800; }],
    ["図鑑週","イベント20", function(S){ return S.events>=20; }],
    ["オーブ嵐","オーブ25", function(S){ return S.orbs>=25; }],
    ["クイズ大会","クイズ10正解", function(S){ return S.quizOk>=10; }],
    ["熱気週","フィーバー12", function(S){ return S.fever>=12; }],
    ["コンボ職人","コンボ25", function(S){ return S.comboMax>=25; }],
    ["静かな週","放置熟練40", function(S){ return ((S.mastery&&S.mastery.idle)||0)>=40; }],
    ["研究週間","研究3以上", function(S){ return (S.research||0)>=3; }],
    ["遺物集め","遺物3種", function(S){ return Object.keys(S.relics||{}).length>=3; }]
  ];
  const RELICS = [
    "初火の芯","軌道の砂","恒星のしずく","真空の糸","反転の欠片",
    "秒針の歯","銀河のひとかけ","観測レンズ","終焉のメモ","無限のしおり",
    "絶対の印章","オメガの種","彗星のリボン","プリズム片","ネオン回路",
    "時計のねじ","星図の端","無音の鈴","虹の薄片","琥珀コンデンサ",
    "風の羽根","冷却結晶","パルス核","キャッシュ花","設計図切れ",
    "シールド薄片","フィーバー種","クイズバッジ","デイリーメダル","レガシー印",
    "図鑑しおり","星座ピン","章のしおり","週の旗","熟練バッジ","研究ノート"
  ];
  ["銅の星片","銀の星片","金の星片","観測手帳","古い星図","新しい星図","時間の砂時計","反物質小瓶","コアのさび","タップグローブ","静かな椅子","書庫の灯","週報クリップ","研究白衣","終焉鉛筆","無限消しゴム","絶対定規","オメガ印章","銀河スタンプ","軌道コンパス","恒星マッチ","真空瓶","冷却パック","パルス手帳","キャッシュ鍵","設計ナイフ","シールド布","フィーバーうちわ","クイズ笛","デイリー印鑑","レガシー冠","図鑑カバー","星座シール","遺物箱","研究机","第一観測窓","第二観測窓","第三観測窓","深夜のコップ","朝のメモ","昼の印","彗星ボタン","流星ボタン","銀河ボタン","時間ボタン","反転ボタン","コアボタン"].forEach(function(n){ RELICS.push(n); });
  for (var ri=1; ri<=40; ri++) RELICS.push("記録石 "+ri);
  window.__OMEGA_RELICS = RELICS;
  const MORE_QUIZ = [
    { q:"三角形の角の合計は？", a:["90度","180度","360度"], ok:1 },
    { q:"地球は何惑星目？（内側から）", a:["2","3","4"], ok:1 },
    { q:"100センチは何メートル？", a:["1","10","100"], ok:0 },
    { q:"光より速い乗り物は？", a:["新幹線","ない","自転車"], ok:1 },
    { q:"水の化学式は？", a:["CO2","H2O","O2"], ok:1 },
    { q:"1週間は何日？", a:["5","6","7"], ok:2 },
    { q:"月は自分で光る？", a:["光る","太陽の反射","電気"], ok:1 },
    { q:"北極に近い動物は？", a:["ペンギン","シロクマ","カンガルー"], ok:1 },
    { q:"2の10乗に近いのは？", a:["20","512","1024"], ok:2 },
    { q:"音が伝わりやすいのは？", a:["真空","水や空気","宇宙の外"], ok:1 },
    { q:"虹の外側に近い色は？", a:["赤","紫","緑"], ok:0 },
    { q:"地球の表面の多くは？", a:["砂漠","海","氷だけ"], ok:1 },
    { q:"1日は約何時間？", a:["12","24","48"], ok:1 },
    { q:"磁石が引きやすいのは？", a:["木","鉄","ガラス"], ok:1 },
    { q:"植物が光で作るのは？", a:["栄養と酸素","石","電気だけ"], ok:0 }
  ];
  const EXTRA_EV = [
    ["lucky","chronicle_ink","年代記のインク","記録が少し濃くなった"],
    ["lucky","archive_key","書庫の鍵","古い棚が開いた"],
    ["lucky","observer_tea","観測のお茶","集中が戻った"],
    ["lucky","star_ticket","星の切符","次の駅が近い"],
    ["lucky","soft_engine","やさしい機関","ラインが歌う"],
    ["lucky","map_corner","地図の角","道が見えた"],
    ["lucky","quiet_lab","静かな実験室","計算が澄む"],
    ["lucky","gift_orbit","周回ギフト","一周ぶん得した"],
    ["unlucky","ink_smudge","インク汚れ","記録がにじむ"],
    ["unlucky","shelf_jam","棚の詰まり","本が落ちそう"],
    ["unlucky","sleepy_lens","レンズ眠気","ピントが甘い"],
    ["unlucky","ticket_crease","切符の折り目","改札でもたつく"],
    ["unlucky","map_tear","地図の裂け","遠回り"],
    ["unlucky","lab_dust","実験室のほこり","精度が落ちる"],
    ["mixed","coin_page","本の間のコイン","出目は不明"],
    ["mixed","two_clocks","二つの時計","どちらが正しいか"],
    ["lucky","chapter_seal","章の封印が緩む","物語が進む"],
    ["lucky","relic_glint","遺物のきらめき","何かが光った"],
    ["lucky","research_spark","研究の火花","ノートが増える"],
    ["unlucky","page_loss","ページ紛失","話が飛ぶ"]
  ];

  function weekId(){
    const d = new Date();
    const t = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.floor(t / 86400000 / 7);
  }
  function load(){
    const base = { taps:0, events:0, orbs:0, quizOk:0, fever:0, mins:0, comboMax:0, week: -1, weekDone:0, relics:{}, research:0, mastery:{tap:0,idle:0,ev:0,quiz:0,combo:0,fever:0,relic:0,research:0}, bought:{} };
    try {
      const o = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!o) return base;
      return Object.assign(base, o, {relics:o.relics||{}, mastery:Object.assign(base.mastery, o.mastery||{})});
    } catch(e){ return base; }
  }
  function save(S){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
  const S = load();
  window.OmegaLong = S;

  function chapter(){
    let n = 0;
    try {
      const e = (typeof D === "function") ? D(game && game.energy || 0) : 0;
      const log = (e && e.log10) ? Number(e.log10()) : 0;
      n = Math.max(0, Math.min(11, Math.floor(log / 80)));
    } catch(e){}
    const g = window.OmegaGrind;
    if (g && g.lv) n = Math.max(n, Math.min(11, Math.floor((g.lv-1)/8)));
    return n;
  }
  function weeklyItem(){
    const id = weekId();
    if (S.week !== id) { S.week = id; S.weekDone = 0; S.taps=0; S.events=0; S.orbs=0; S.quizOk=0; S.fever=0; S.mins=0; S.comboMax=0; save(S); }
    return WEEKLY[id % WEEKLY.length];
  }
  function grantRelic(){
    const locked = [];
    for (let i=0;i<RELICS.length;i++) if (!S.relics[RELICS[i]]) locked.push(RELICS[i]);
    if (!locked.length) return null;
    const name = locked[(Math.random()*locked.length)|0];
    S.relics[name] = 1;
    S.research++;
    save(S);
    if (typeof createToast === "function") createToast("遺物入手", name);
    return name;
  }
  function paint(){
    const ch = chapter();
    const cel = document.getElementById("pv-chapter");
    if (cel) cel.textContent = CHAPTERS[ch];
    const w = weeklyItem();
    const wel = document.getElementById("pv-weekly");
    if (wel) wel.textContent = S.weekDone ? "完了" : w[0];
    const m = S.mastery;
    const mel = document.getElementById("pv-mastery");
    if (mel) mel.textContent = "T"+m.tap+" I"+m.idle+" E"+m.ev+" Q"+m.quiz;
    const rel = document.getElementById("pv-relics");
    if (rel) rel.textContent = Object.keys(S.relics).length+" / "+RELICS.length;
    const res = document.getElementById("pv-research");
    if (res) res.textContent = String(S.research);
  }
  function reward(kind){
    try {
      const g = (typeof cpsWorth === "function") ? cpsWorth(kind === "week" ? 40 : 12) : 200;
      if (typeof addEnergySafe === "function") addEnergySafe(g);
      if (window.OmegaGrind && OmegaGrind.xp != null) { OmegaGrind.xp += (kind==="week"?25:4); }
    } catch(e){}
  }
  function checkWeek(){
    const w = weeklyItem();
    if (!S.weekDone && w[2](S)) {
      S.weekDone = 1;
      reward("week");
      grantRelic();
      if (typeof createToast === "function") createToast("週課題クリア", w[0]);
      save(S);
    }
  }
  function addMastery(k, n){
    S.mastery[k] = (S.mastery[k]||0) + n;
    if (S.mastery[k] % 25 === 0) { S.research++; grantRelic(); }
    save(S);
  }

  function extraEvents(){
    const arr = window.__GAME_EVENTS;
    if (!arr || arr.__longPatched) return !!arr;
    EXTRA_EV.forEach(function(row, i){
      arr.push({
        id: "long_"+row[1],
        kind: row[0],
        title: row[2],
        desc: row[3],
        apply: function(){
          if (row[0] === "lucky") {
            try { if (typeof addEnergySafe==="function") addEnergySafe(typeof cpsWorth==="function"?cpsWorth(8):50); } catch(e){}
            if (Math.random() < 0.2) grantRelic();
            return "記録が伸びた";
          }
          if (row[0] === "unlucky") {
            try { if (typeof subEnergySafe==="function") subEnergySafe(typeof cpsWorth==="function"?cpsWorth(4):20); } catch(e){}
            return "記録がにじんだ";
          }
          return (Math.random()<0.5) ? (grantRelic()||"どちらでもあり") : "どちらでもあり";
        }
      });
    });
    arr.__longPatched = true;
    return true;
  }
  function showMoreQuiz(){
    const box = document.getElementById("omegaQuiz");
    if (!box || box.classList.contains("show")) return;
    const item = MORE_QUIZ[(Math.random()*MORE_QUIZ.length)|0];
    const q = document.getElementById("qzQ");
    const a = document.getElementById("qzA");
    if (!q || !a) return;
    q.textContent = item.q;
    a.innerHTML = "";
    item.a.forEach(function(txt, idx){
      const b = document.createElement("button");
      b.type = "button"; b.className = "qz-a";
      b.textContent = (idx+1)+". "+txt;
      b.onclick = function(){
        const ok = idx === item.ok;
        try {
          if (ok) {
            if (typeof addEnergySafe==="function") addEnergySafe(100);
            S.quizOk++; addMastery("quiz", 2);
            if (typeof createToast==="function") createToast("クイズ正解","+100 E");
          } else {
            if (typeof subEnergySafe==="function") subEnergySafe(1000);
            if (typeof createToast==="function") createToast("クイズミス","-1000 E");
          }
        } catch(e){}
        box.classList.remove("show");
        checkWeek(); paint(); save(S);
        try { if (typeof refreshUI==="function") refreshUI(); } catch(e){}
      };
      a.appendChild(b);
    });
    box.classList.add("show");
  }

  function hook(){
    document.addEventListener("pointerdown", function(e){
      const t = e.target;
      if (!t) return;
      if (t.id === "coreTrigger" || (t.closest && t.closest("#coreTrigger"))) {
        S.taps++;
        addMastery("tap", 1);
        const combo = (window.EffectSystem && window.EffectSystem.combo) || 0;
        if (combo > S.comboMax) S.comboMax = combo;
        if (S.taps % 120 === 0 && Math.random() < 0.35) grantRelic();
        checkWeek(); paint();
      }
    }, {capture:true, passive:true});
    const ot = window.triggerRandomEvent;
    if (typeof ot === "function" && !ot.__long) {
      window.triggerRandomEvent = function(){
        const r = ot.apply(this, arguments);
        S.events++; addMastery("ev", 1); checkWeek(); paint();
        return r;
      };
      window.triggerRandomEvent.__long = true;
    }
    const of = window.OmegaPack && OmegaPack.onFeverUse;
    if (window.OmegaPack) {
      const prev = OmegaPack.onFeverUse;
      OmegaPack.onFeverUse = function(lv){
        if (prev) try { prev(lv); } catch(e){}
        S.fever++; checkWeek();
      };
    }
  }

  function ready(fn){
    if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(fn,0);
    else document.addEventListener("DOMContentLoaded", fn);
  }
  ready(function(){
    let n=0; (function w(){ n++; if(!extraEvents() && n<80) setTimeout(w,80); })();
    hook();
    paint();
    setInterval(function(){
      if (!document.hidden && Math.random() < 0.12) showMoreQuiz();
    }, 70000);
    setInterval(function(){
      try { S.mins = Math.max(S.mins, Math.floor(((game && game.totalTime)||0)/60)); } catch(e){}
      try { S.orbs = Math.max(S.orbs, (window.OmegaPack && OmegaPack.orbsCaught) || 0); } catch(e){}
      addMastery("idle", 1);
      checkWeek(); paint(); save(S);
    }, 10000);
  });
})();
