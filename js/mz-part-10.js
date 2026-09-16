
(function OmegaQuizAndFever(){
  const QUIZ = [
    { q:"1 + 2 + 3 + 4 はいくつ？", a:["9","10","12"], ok:1 },
    { q:"太陽にいちばん近い惑星は？", a:["金星","地球","水星"], ok:2 },
    { q:"1分は何秒？", a:["30","60","100"], ok:1 },
    { q:"氷がとけると何になる？", a:["水","湯気だけ","氷のまま"], ok:0 },
    { q:"地球のまわりを回る衛星は？", a:["太陽","月","火星"], ok:1 },
    { q:"3 × 7 はいくつ？", a:["21","24","27"], ok:0 },
    { q:"赤と青を混ぜると近い色は？", a:["緑","紫","黄"], ok:1 },
    { q:"1時間は何分？", a:["30","60","90"], ok:1 },
    { q:"宇宙では音はどうなる？", a:["とても大きい","ほとんど聞こえない","必ず響く"], ok:1 },
    { q:"水が蒸発すると何になる？", a:["氷","水蒸気","砂"], ok:1 }
  ];

  function loadFever(){
    try {
      const n = parseInt(localStorage.getItem("omega_fever_lv")||"1",10);
      const xp = parseInt(localStorage.getItem("omega_fever_xp")||"0",10);
      var _es = window.EffectSystem; if (_es) { _es.feverLv = Math.max(1, Math.min(30, n||1)); _es.feverXp = Math.max(0, xp||0); }
      return { lv: Math.max(1, n||1), xp: Math.max(0, xp||0) };
    } catch(e){ return {lv:1,xp:0}; }
  }
  function saveFever(){
    try {
      var _es2 = window.EffectSystem || {};
      localStorage.setItem("omega_fever_lv", String(_es2.feverLv || 1));
      localStorage.setItem("omega_fever_xp", String(_es2.feverXp || 0));
    } catch(e){}
  }
  function needXp(lv){ return 6 + lv * 2; }
  function paintFever(){
    var _es3 = window.EffectSystem || {};
    const lv = _es3.feverLv || 1;
    const xp = _es3.feverXp || 0;
    const need = needXp(lv);
    const el = document.getElementById("pv-fever");
    if (el) el.textContent = "Lv."+lv+"  XP "+xp+"/"+need;
    const bar = document.getElementById("pv-fever-i");
    if (bar) bar.style.width = Math.min(100, (xp/need)*100).toFixed(1)+"%";
    const btn = document.getElementById("sk-fever");
    const cd = document.getElementById("sk-fever-cd");
    if (btn && cd && btn.contains(cd)) {
      const first = btn.childNodes[0];
      if (first && first.nodeType === 3) first.textContent = "フィーバー Lv."+lv;
    } else if (btn && cd) {
      btn.innerHTML = "フィーバー Lv."+lv + cd.outerHTML;
    }
  }
  function addFeverXp(n){
    if (!window.EffectSystem) return;
    var ES = window.EffectSystem || (window.EffectSystem = {});
    ES.feverLv = ES.feverLv || 1;
    ES.feverXp = (ES.feverXp || 0) + n;
    while (ES.feverLv < 30 && ES.feverXp >= needXp(ES.feverLv)) {
      ES.feverXp -= needXp(ES.feverLv);
      ES.feverLv++;
      if (typeof createToast === "function") createToast("フィーバーレベルアップ", "Lv."+ES.feverLv+" になった！");
    }
    saveFever();
    paintFever();
  }

  const QST = { win:0, lose:0, streak:0, open:false };
  function paintQuiz(){
    const el = document.getElementById("pv-quiz");
    if (el) el.textContent = QST.win+"勝 "+QST.lose+"敗";
  }
  function mountQuiz(){
    if (document.getElementById("omegaQuiz")) return;
    const box = document.createElement("div");
    box.id = "omegaQuiz";
    box.innerHTML = "<div class='qz-k'>QUIZ EVENT</div><div class='qz-q' id='qzQ'></div><div id='qzA'></div><div class='qz-s' id='qzS'>正解 +100　ミス -1000</div>";
    document.body.appendChild(box);
  }
  function closeQuiz(){
    const box = document.getElementById("omegaQuiz");
    if (box) box.classList.remove("show");
    QST.open = false;
    try { if (window.EVT) EVT.busy = false; } catch(e){}
  }
  function applyScore(ok){
    try {
      if (ok) {
        if (typeof addEnergySafe === "function") addEnergySafe(100);
        else if (window.game) game.energy = D(game.energy).add(100);
        QST.win++; QST.streak++;
        if (QST.streak >= 3) {
          if (typeof addEnergySafe === "function") addEnergySafe(50);
          QST.streak = 0;
          if (typeof createToast === "function") createToast("クイズ連続正解", "おまけ +50 E");
        }
        addFeverXp(2);
        if (window.OmegaPack) { OmegaPack.dopamine = Math.min(100, (OmegaPack.dopamine||0)+10); }
        if (typeof createToast === "function") createToast("クイズ正解", "+100 E");
      } else {
        if (typeof subEnergySafe === "function") subEnergySafe(1000);
        else if (window.game && typeof decMax0 === "function") game.energy = decMax0(D(game.energy).sub(1000));
        QST.lose++; QST.streak = 0;
        if (typeof createToast === "function") createToast("クイズミス", "-1000 E");
      }
    } catch(e){}
    paintQuiz();
    try { if (typeof refreshUI === "function") refreshUI(); } catch(e){}
  }
  window.openOmegaQuiz = function(forceI){
    mountQuiz();
    if (QST.open) return "クイズ開催中";
    const i = (forceI != null) ? (forceI % QUIZ.length) : ((Math.random()*QUIZ.length)|0);
    const item = QUIZ[i];
    const box = document.getElementById("omegaQuiz");
    const q = document.getElementById("qzQ");
    const a = document.getElementById("qzA");
    if (!box || !q || !a) return "";
    q.textContent = item.q;
    a.innerHTML = "";
    item.a.forEach(function(txt, idx){
      const b = document.createElement("button");
      b.type = "button";
      b.className = "qz-a";
      b.textContent = (idx+1)+". "+txt;
      b.onclick = function(){
        applyScore(idx === item.ok);
        closeQuiz();
      };
      a.appendChild(b);
    });
    box.classList.add("show");
    QST.open = true;
    try { if (window.EVT) EVT.busy = true; } catch(e){}
    return "クイズ出題";
  };

  function addQuizEvents(){
    const arr = window.__GAME_EVENTS;
    if (!arr || arr.__quizPatched) return !!arr;
    for (let i=0;i<QUIZ.length;i++) {
      (function(i){
        arr.push({
          id: "quiz_"+i,
          kind: "mixed",
          title: "コアクイズ "+(i+1),
          desc: "正解で +100 E、ミスで -1000 E",
          apply: function(){ return window.openOmegaQuiz(i); }
        });
      })(i);
    }
    arr.__quizPatched = true;
    return true;
  }

  if (window.OmegaPack) {
    window.OmegaPack.onFeverUse = function(lv){ addFeverXp(1); };
  }

  function ready(fn){
    if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(fn,0);
    else document.addEventListener("DOMContentLoaded", fn);
  }
  ready(function(){
    loadFever();
    mountQuiz();
    paintFever();
    paintQuiz();
    let n=0;
    (function wait(){ n++; if (!addQuizEvents() && n<80) setTimeout(wait,60); })();
    // たまにクイズ（イベントとは別に、重ならないよう間隔長め）
    setInterval(function(){
      if (document.hidden) return;
      if (QST.open) return;
      if (Math.random() < 0.08) window.openOmegaQuiz();
    }, 45000);
  });
})();
