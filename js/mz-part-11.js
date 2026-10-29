
(function OmegaGrind(){
  "use strict";
  const KEY = "omega_grind_v1";
  const SIGNS = ["おひつじ","おうし","ふたご","かに","しし","おとめ","てんびん","さそり","いて","やぎ","みずがめ","うお"];
  const TITLES = [
    [1,"新星見習い"],[5,"観測助手"],[10,"恒星守り"],[20,"銀河書記"],
    [35,"星図職人"],[50,"時の integr"],[70,"終焉観測士"],[90,"無限記録官"],[100,"絶対観測核"]
  ];
  function titleOf(lv){
    let n = TITLES[0][1];
    for (let i=0;i<TITLES.length;i++) if (lv >= TITLES[i][0]) n = TITLES[i][1];
    return n.replace(" integr","番人");
  }
  function today(){
    try { return new Date().toISOString().slice(0,10); } catch(e){ return "day"; }
  }
  function load(){
    const base = {
      lv:1, xp:0, taps:0, minutes:0, quiz:0, orbs:0,
      codex:{}, signs:{}, dailyDay:"", daily:{taps:0,events:0,orbs:0}, dailyDone:[0,0,0],
      lastMin:0
    };
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return base;
      const o = JSON.parse(raw);
      return Object.assign(base, o, {codex:o.codex||{}, signs:o.signs||{}, daily:o.daily||base.daily, dailyDone:o.dailyDone||[0,0,0]});
    } catch(e){ return base; }
  }
  function save(G){
    try { localStorage.setItem(KEY, JSON.stringify(G)); } catch(e){}
  }
  function need(lv){ return 20 + lv * 8; }
  const G = load();
  window.OmegaGrind = G;

  function rollDaily(){
    if (G.dailyDay === today()) return;
    G.dailyDay = today();
    G.daily = {taps:0, events:0, orbs:0};
    G.dailyDone = [0,0,0];
    save(G);
  }
  function addXp(n){
    G.xp += n;
    let up = 0;
    while (G.lv < 100 && G.xp >= need(G.lv)) {
      G.xp -= need(G.lv);
      G.lv++;
      up++;
      const idx = Math.min(11, Math.floor((G.lv-1)/8));
      G.signs[SIGNS[idx]] = 1;
      if (typeof createToast === "function") createToast("レガシー Lv."+G.lv, titleOf(G.lv));
    }
    save(G); paint();
    return up;
  }
  function paint(){
    rollDaily();
    const lvEl = document.getElementById("pv-legacy");
    if (lvEl) lvEl.textContent = "Lv."+G.lv+"  XP "+G.xp+"/"+need(G.lv);
    const bar = document.getElementById("pv-legacy-i");
    if (bar) bar.style.width = Math.min(100, (G.xp/need(G.lv))*100).toFixed(1)+"%";
    const t = document.getElementById("pv-title");
    if (t) t.textContent = titleOf(G.lv);
    const dDone = (G.dailyDone[0]?1:0)+(G.dailyDone[1]?1:0)+(G.dailyDone[2]?1:0);
    const d = document.getElementById("pv-daily");
    if (d) d.textContent = dDone+" / 3";
    const c = document.getElementById("pv-codex");
    if (c) c.textContent = String(Object.keys(G.codex).length);
    const s = document.getElementById("pv-starsign");
    if (s) s.textContent = Object.keys(G.signs).length+" / 12";
  }
  function checkDaily(){
    if (!G.dailyDone[0] && G.daily.taps >= 80) {
      G.dailyDone[0] = 1; addXp(12);
      try { if (typeof addEnergySafe==="function") addEnergySafe((typeof cpsWorth==="function"?cpsWorth(20):100)); } catch(e){}
      if (typeof createToast==="function") createToast("デイリー","タップ課題クリア");
    }
    if (!G.dailyDone[1] && G.daily.events >= 3) {
      G.dailyDone[1] = 1; addXp(12);
      try { if (typeof addEnergySafe==="function") addEnergySafe((typeof cpsWorth==="function"?cpsWorth(20):100)); } catch(e){}
      if (typeof createToast==="function") createToast("デイリー","イベント課題クリア");
    }
    if (!G.dailyDone[2] && G.daily.orbs >= 5) {
      G.dailyDone[2] = 1; addXp(12);
      try { if (typeof addEnergySafe==="function") addEnergySafe((typeof cpsWorth==="function"?cpsWorth(20):100)); } catch(e){}
      if (typeof createToast==="function") createToast("デイリー","オーブ課題クリア");
    }
    save(G); paint();
  }

  // 永久のごく小さなやりこみボーナス（UIは動かさない）
  function installBonus(){
    if (window.__grindClickWrap) return;
    const orig = window.getClickPower;
    if (typeof orig !== "function") return;
    window.getClickPower = function(){
      const v = orig.apply(this, arguments);
      const m = 1 + Math.min(0.5, (G.lv-1) * 0.004);
      try {
        if (v && typeof v.mul === "function") return v.mul(m);
        if (typeof v === "number") return v * m;
      } catch(e){}
      return v;
    };
    window.__grindClickWrap = true;
  }

  function hook(){
    document.addEventListener("pointerdown", function(e){
      const t = e.target;
      if (!t) return;
      if (t.id === "coreTrigger" || (t.closest && t.closest("#coreTrigger"))) {
        G.taps++; G.daily.taps++;
        if (G.taps % 50 === 0) addXp(2);
        else if (G.taps % 10 === 0) { G.xp += 1; save(G); }
        checkDaily();
      }
    }, {capture:true, passive:true});

    const origTrig = window.triggerRandomEvent;
    if (typeof origTrig === "function" && !origTrig.__grind) {
      window.triggerRandomEvent = function(forceId){
        const r = origTrig.apply(this, arguments);
        try {
          const id = (window.EVT && EVT.lastId) || forceId || "ev";
          G.codex[id] = 1;
          G.daily.events++;
          addXp(1);
          checkDaily();
        } catch(e){}
        return r;
      };
      window.triggerRandomEvent.__grind = true;
    }
  }

  function tickPlaytime(){
    try {
      const min = Math.floor(((window.game && game.totalTime) || 0) / 60);
      if (min > (G.lastMin||0)) {
        const dlt = min - (G.lastMin||0);
        G.lastMin = min;
        G.minutes = min;
        addXp(dlt);
      }
    } catch(e){}
  }

  function ready(fn){
    if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(fn, 0);
    else document.addEventListener("DOMContentLoaded", fn);
  }
  ready(function(){
    rollDaily();
    paint();
    hook();
    setTimeout(installBonus, 600);
    setInterval(function(){ tickPlaytime(); paint(); }, 8000);
    if (window.OmegaPack) {
      const prevOrb = OmegaPack.orbsCaught;
      setInterval(function(){
        const now = (window.OmegaPack && OmegaPack.orbsCaught) || 0;
        if (now > (G.orbs||0)) {
          const d = now - (G.orbs||0);
          G.orbs = now;
          G.daily.orbs += d;
          addXp(d);
          checkDaily();
        }
      }, 4000);
    }
  });
})();
