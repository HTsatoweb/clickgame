

window.buyOmegaResearch = function(id){
  const L = window.OmegaLong; if (!L) return;
  const shop = {t1:3,t2:8,t3:15,c1:3,c2:8,c3:15,s1:5,s2:12,q1:6,r1:6,w1:4,l1:10};
  const cost = shop[id]; if (!cost) return;
  L.bought = L.bought || {};
  if (L.bought[id]) return;
  if ((L.research||0) < cost) {
    if (typeof createToast==="function") createToast("研究不足", "ポイントが足りません");
    return;
  }
  L.research -= cost;
  L.bought[id] = 1;
  try { localStorage.setItem("omega_longplay_v1", JSON.stringify(L)); } catch(e){}
  if (typeof createToast==="function") createToast("研究導入", id);
  if (typeof renderPlayViewTab==="function") renderPlayViewTab();
};

function renderPlayViewTab(){
  const box = document.getElementById("playviewTabBody");
  if (!box) return;
  const L = window.OmegaLong || {mastery:{}, relics:{}, research:0, weekDone:0, bought:{}};
  const G = window.OmegaGrind || {lv:1, xp:0, dailyDone:[0,0,0], signs:{}, codex:{}};
  const WEEKLY = [
    "タップ職人（コア400）","イベント観測（12回）","オーブ狩り（15個）",
    "クイズ週間（6正解）","フィーバー週（8回）","長時間観測（60分）","コンボ週（15）",
    "早起き観測","双眼鏡","熟練週間","長考90分","連打祭800","図鑑週20",
    "オーブ嵐25","クイズ大会10","熱気週12","コンボ職人25","静かな週","研究週間","遺物集め"
  ];
  let weekName = "—", weekIdx = 0;
  try {
    const d = new Date();
    weekIdx = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000 / 7);
    weekName = WEEKLY[weekIdx % WEEKLY.length];
  } catch(e){}
  const m = L.mastery || {};
  const shop = [
    {id:"t1", name:"タップ理論 I", cost:3},
    {id:"t2", name:"タップ理論 II", cost:8},
    {id:"t3", name:"タップ理論 III", cost:15},
    {id:"c1", name:"生産理論 I", cost:3},
    {id:"c2", name:"生産理論 II", cost:8},
    {id:"c3", name:"生産理論 III", cost:15},
    {id:"s1", name:"観測耐久 I", cost:5},
    {id:"s2", name:"観測耐久 II", cost:12},
    {id:"q1", name:"クイズ辞典", cost:6},
    {id:"r1", name:"遺物図解", cost:6},
    {id:"w1", name:"週報の型", cost:4},
    {id:"l1", name:"レガシー注釈", cost:10}
  ];
  function bar(v){
    const p = Math.max(0, Math.min(100, ((v%25)/25)*100));
    return "<div class='pv-barx'><i style='width:"+p.toFixed(1)+"%'></i></div>";
  }
  const bought = L.bought || {};
  const shopHtml = shop.map(function(s){
    const on = !!bought[s.id];
    const btn = on ? "<span style='color:#00ffcc'>導入済</span>" :
      "<button type='button' class='btn-utility' onclick='window.buyOmegaResearch(\""+s.id+"\")'>消費 "+s.cost+"</button>";
    return "<div class='pv-item"+(on?" on":"")+"'><b>"+s.name+"</b>コスト "+s.cost+"　"+btn+"</div>";
  }).join("");
  const tracks = [["タップ",m.tap||0],["放置",m.idle||0],["イベント",m.ev||0],["クイズ",m.quiz||0],["コンボ",m.combo||0],["フィーバー",m.fever||0],["遺物",m.relic||0],["研究",m.research||0]];
  const masterHtml = tracks.map(function(x){ return "<div class='pv-item'><b>"+x[0]+" "+x[1]+"</b>"+bar(x[1])+"</div>"; }).join("");
  const got = L.relics || {};
  const list = (window.__OMEGA_RELICS && window.__OMEGA_RELICS.length) ? window.__OMEGA_RELICS : Object.keys(got);
  const relHtml = list.map(function(n){
    return "<div class='pv-item"+(got[n]?" on":"")+"'><b>"+n+"</b>"+(got[n]?"入手済":"未入手")+"</div>";
  }).join("");
  const upcoming = [];
  for (let i=1;i<8;i++) upcoming.push(WEEKLY[(weekIdx+i)%WEEKLY.length]);
  box.innerHTML = ""
    + "<div class='pv-sec'><h3>WEEKLY</h3><div class='pv-item on'><b>今週："+weekName+"</b>"+(L.weekDone?"クリア済み":"進行中")+"</div>"
    + "<div class='guide-text-block' style='margin-top:8px'>次週以降："+upcoming.join(" / ")+"</div></div>"
    + "<div class='pv-sec'><h3>MASTERY 8本</h3><div class='pv-grid'>"+masterHtml+"</div></div>"
    + "<div class='pv-sec'><h3>RESEARCH　所持 "+(L.research||0)+"</h3><div class='pv-grid'>"+shopHtml+"</div></div>"
    + "<div class='pv-sec'><h3>RELICS "+Object.keys(got).length+" / "+Math.max(list.length,1)+"</h3><div class='pv-grid'>"+relHtml+"</div></div>"
    + "<div class='pv-sec'><h3>LONG STAT</h3><div class='pv-grid'>"
    + "<div class='pv-item'><b>レガシー</b>Lv."+(G.lv||1)+"</div>"
    + "<div class='pv-item'><b>図鑑</b>"+Object.keys(G.codex||{}).length+"</div>"
    + "<div class='pv-item'><b>星座</b>"+Object.keys(G.signs||{}).length+" / 12</div>"
    + "<div class='pv-item'><b>デイリー</b>"+((G.dailyDone||[]).filter(Boolean).length)+" / 3</div>"
    + "</div></div>"
    + "<div class='pv-sec'><h3>ポイントの見方</h3>"
    + "<div class='pv-item on'><b>E（エネルギー）</b>メイン通貨。タップと施設で増える。施設の購入に使う。</div>"
    + "<div class='pv-item'><b>AM（反物質）</b>転生「反物質化」で得る。ANTIMATTERタブの改良に使う。</div>"
    + "<div class='pv-item'><b>TS（時間律）</b>転生「時間軸の切断」で得る。TIMEタブの改良に使う。</div>"
    + "<div class='pv-item'><b>★スター</b>50タップで+1。左の STAR に表示。</div>"
    + "<div class='pv-item'><b>研究ポイント</b>熟練や遺物で増える。このタブの理論と交換。</div>"
    + "<div class='pv-item'><b>レガシーXP</b>長期プレイの階級。転生しても残る。</div>"
    + "</div>";
}
window.renderPlayViewTab = renderPlayViewTab;
