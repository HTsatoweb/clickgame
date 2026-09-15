
(function NeonRelicPack(){
  "use strict";
  var KEY="neon_relic_v1";
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ return {}; } }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(R)); }catch(e){} }
  var WX=["quiet","aurora","solar","meteor"];
  var WXJP={quiet:"静かな真空",aurora:"オーロラ風",solar:"恒星風",meteor:"流星雨"};
  var R=Object.assign({
    mail:[], mailRead:0, weather:"quiet", wxUntil:0, diary:0,
    yesterdayBest:0, todayBest:0, lastDay:"", festSeen:0,
    skins:["素の核"], skin:0, legend:0, weekKey:"", weekPts:0,
    lettersGot:0, echo:0
  }, load());

  var LETTERS=[
    "名もなき神へ。コアの光は、焦らなくても増えていくよ。",
    "今日の真空はおだやか。タップの音だけが残響する。",
    "星の郵便屋です。あなたのコンボ、宇宙の端まで届いてます。",
    "虹核祭の準備中。週末は色がよく変わるよ。",
    "昨日の自分より1コンボだけ上回れば、それで十分すごい。",
    "ねむくなったら施設に任せて、また戻ってきてね。",
    "記録グラフは嘘をつかない。丸めない線が、あなたの足跡。",
    "ペットがまばたきした。それは応援の暗号です。"
  ];
  var DIARY=[
    "1日目: コアが点いた。名前はまだない。",
    "記録: 数字が大きくても、押す動作は同じ。",
    "発見: 色を変えると世界の温度が変わる気がする。",
    "メモ: 飽きそうな日は、星の郵便を開く。",
    "仮説: 昨日の自分はライバルで、仲間でもある。",
    "祭: 虹核祭の日は、タップが花火になる。",
    "終着: 1e1000 は遠い。でも線はつながっている。"
  ];

  function today(){
    var d=new Date();
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  }
  function weekKey(){
    var d=new Date(); var t=new Date(d.getFullYear(),0,1);
    var w=Math.ceil((((d-t)/86400000)+t.getDay()+1)/7);
    return d.getFullYear()+"-W"+w;
  }
  function toast(a,b){ if(typeof createToast==="function") createToast(a,b); }

  function rollWeather(force){
    if(!force && R.wxUntil && Date.now()<R.wxUntil) return;
    R.weather=WX[Math.floor(Math.random()*WX.length)];
    R.wxUntil=Date.now()+18*60*1000;
    var html=document.documentElement;
    html.className=(html.className||"").replace(/\bwx-\w+/g,"").trim();
    html.classList.add("wx-"+R.weather);
    var el=document.getElementById("relicWeather");
    if(el) el.textContent="天気:"+WXJP[R.weather];
    save();
  }
  function sendMail(){
    var last=R.mail[R.mail.length-1];
    var msg=LETTERS[(R.lettersGot||0)%LETTERS.length];
    if(last===msg) msg=LETTERS[Math.floor(Math.random()*LETTERS.length)];
    R.mail.push(msg); if(R.mail.length>8) R.mail=R.mail.slice(-8);
    R.lettersGot=(R.lettersGot||0)+1; save();
    toast("星の郵便", "新しい手紙");
  }
  function dailyShift(){
    var d=today();
    if(R.lastDay!==d){
      R.yesterdayBest=R.todayBest||0;
      R.todayBest=0;
      R.lastDay=d;
      sendMail();
      R.diary=Math.min(DIARY.length-1, (R.diary||0)+ (Math.random()<0.7?1:0));
      save();
    }
    if(R.weekKey!==weekKey()){ R.weekKey=weekKey(); R.weekPts=0; save(); }
  }
  function isFest(){
    var day=new Date().getDay();
    return day===0 || day===6;
  }

  function onCore(ev){
    var core=document.getElementById("coreTrigger");
    if(core){
      core.classList.remove("relic-pulse"); void core.offsetWidth; core.classList.add("relic-pulse");
      if(isFest()){
        var s=document.createElement("span");
        s.textContent="✧";
        s.style.cssText="position:absolute;left:50%;top:30%;pointer-events:none;font-size:14px;transition:transform .6s,opacity .6s";
        core.appendChild(s);
        requestAnimationFrame(function(){ s.style.transform="translate("+(Math.random()*50-25)+"px,-36px)"; s.style.opacity="0"; });
        setTimeout(function(){ s.remove(); }, 620);
      }
    }
    var pack=window.DopaKidsPack && window.DopaKidsPack.state;
    var combo=pack?pack.combo:0;
    if(combo>R.todayBest) R.todayBest=combo;
    if(combo && combo%7===0){ R.echo+=1; }
    if(combo>=20 && Math.random()<0.08){
      R.legend+=1;
      if(core){ core.classList.remove("relic-legend"); void core.offsetWidth; core.classList.add("relic-legend"); }
      toast("伝説のひと押し", "核が黄金に瞬いた");
    }
    R.weekPts+=1;
    if(R.weekPts===100 || R.weekPts===300 || R.weekPts===800) toast("週間ロード", R.weekPts+"タップ達成");
    save();
  }

  function mountTiny(){
    var box=document.getElementById("missionBox");
    if(box && !document.getElementById("relicWeather")){
      var w=document.createElement("span"); w.id="relicWeather"; box.appendChild(w);
    }
    var bar=document.getElementById("funBar");
    if(bar && !document.getElementById("relicMailBtn")){
      var b=document.createElement("button");
      b.type="button"; b.id="relicMailBtn"; b.textContent="郵便";
      bar.appendChild(b);
      b.onclick=function(){ openMail(); };
    }
    var pv=document.getElementById("dopaSysCard") || document.getElementById("playviewTabBody");
    if(pv && !document.getElementById("relicBoard")){
      var board=document.createElement("div");
      board.id="relicBoard"; board.className="pv-sec";
      if(pv.id==="dopaSysCard") pv.parentNode.insertBefore(board, pv.nextSibling);
      else pv.appendChild(board);
    }
    paintBoard();
  }
  function paintBoard(){
    var board=document.getElementById("relicBoard"); if(!board) return;
    var ghost=R.yesterdayBest||0;
    var fest=isFest()?"開催中：虹核祭（タップが花火）":"平日：コアは通常運転";
    board.innerHTML="<h3>虹核歳時記（独自）</h3>"+
      "<div class='guide-text-block'>このゲームだけの長期要素です。本編の場所は変わりません。</div>"+
      "<div class='pv-grid'>"+
        "<div class='pv-item on'><b>マトリクス天気</b>"+WXJP[R.weather]+"</div>"+
        "<div class='pv-item'><b>虹核祭</b>"+fest+"</div>"+
        "<div class='pv-item'><b>昨日の自分</b>ベストコンボ "+ghost+"</div>"+
        "<div class='pv-item'><b>きょう</b>ベスト "+(R.todayBest||0)+"</div>"+
        "<div class='pv-item'><b>週間タップ</b>"+(R.weekPts||0)+"</div>"+
        "<div class='pv-item'><b>伝説の瞬き</b>"+(R.legend||0)+" 回</div>"+
      "</div>"+
      "<div class='pv-item on' style='margin-top:8px'><b>無名の神の日記</b>"+DIARY[R.diary||0]+"</div>"+
      "<div class='relic-letter' style='margin-top:8px'><b>最新の郵便</b>\n"+(R.mail[R.mail.length-1]||"まだ届いていません")+"</div>";
  }
  function openMail(){
    var text=(R.mail||[]).slice(-3).join("\n---\n") || "郵便箱は空です。遊んでいると届きます。";
    toast("星の郵便", text.slice(0,80));
    R.mailRead=(R.mailRead||0)+1; save();
    paintBoard();
  }

  function chunks(jobs){
    var i=0;
    function n(){ if(i>=jobs.length) return; try{jobs[i++]();}catch(e){} if(window.requestIdleCallback) requestIdleCallback(n,{timeout:240}); else setTimeout(n,45); }
    n();
  }
  function boot(){
    chunks([
      function(){ dailyShift(); },
      function(){ rollWeather(false); },
      function(){ mountTiny(); },
      function(){
        document.addEventListener("pointerdown", function(ev){
          var t=ev.target; if(t && t.closest && t.closest("#coreTrigger")) onCore(ev);
        }, {passive:true});
      },
      function(){ setInterval(function(){ if(document.hidden) return; rollWeather(false); paintBoard(); }, 20000); },
      function(){ if(isFest() && !R.festSeen){ R.festSeen=1; save(); toast("虹核祭","週末だけ花火が咲きます"); } }
    ]);
  }
  if(document.readyState==="complete") setTimeout(boot, 160);
  else addEventListener("load", function(){ setTimeout(boot, 160); });
  window.NeonRelic={state:R,weather:WXJP};
})();
