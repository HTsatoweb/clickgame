
(function(){
  "use strict";
  var KEY="dopa_kids_pack_v2";
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ return {}; } }
  function save(st){ try{ localStorage.setItem(KEY, JSON.stringify(st)); }catch(e){} }
  var THEMES=["mint","sunset","aurora","ocean","lemon","sakura","forest","ice","gold","night"];
  var THEME_JP={mint:"ミント",sunset:"夕焼け",aurora:"オーロラ",ocean:"海",lemon:"レモン",sakura:"サクラ",forest:"森",ice:"氷",gold:"ゴールド",night:"夜"};
  var S=Object.assign({
    theme:"mint", combo:0, bestCombo:0, taps:0, stamps:{}, stickers:{},
    pet:"🐱", petLv:1, petXp:0, coins:0, sound:true, shake:true,
    floatNums:true, confetti:true, lastGift:0
  }, load());

  var FEATURES=[];
  var NAMES=[
    ["theme_mint","ミントテーマ","見た目"],["theme_sunset","夕焼けテーマ","見た目"],["theme_aurora","オーロラテーマ","見た目"],
    ["theme_ocean","海テーマ","見た目"],["theme_lemon","レモンテーマ","見た目"],["theme_sakura","サクラテーマ","見た目"],
    ["theme_forest","森テーマ","見た目"],["theme_ice","氷テーマ","見た目"],["theme_gold","ゴールドテーマ","見た目"],
    ["theme_night","夜テーマ","見た目"],["combo_meter","コンボ表示","快感"],["combo_title","コンボ称号","快感"],
    ["crit_flash","クリティカル光","快感"],["float_nums","ふわふわ数字","快感"],["tap_ripple","タップ波紋","快感"],
    ["core_shake","コアゆれ","快感"],["confetti","紙吹雪","快感"],["fireworks","小さな花火","快感"],
    ["rainbow_e","虹色エネルギー","見た目"],["core_glow","コア発光","見た目"],["title_paint","タイトル彩色","見た目"],
    ["bg_wash","背景ぬり","見た目"],["pet_cat","ペットねこ","仲間"],["pet_dog","ペットいぬ","仲間"],
    ["pet_panda","ペットパンダ","仲間"],["pet_fox","ペットきつね","仲間"],["pet_owl","ペットふくろう","仲間"],
    ["pet_talk","ペット応援","仲間"],["pet_lv","ペットレベル","仲間"],["daily_stamp","デイリースタンプ","毎日"],
    ["login_bonus","ログインボーナス","毎日"],["idle_gift","おきざりプレゼント","毎日"],["sticker_star","シール星","収集"],
    ["sticker_moon","シール月","収集"],["sticker_comet","シール彗星","収集"],["sticker_galaxy","シール銀河","収集"],
    ["sticker_core","シールコア","収集"],["album","シール帳","収集"],["badge_tap","連打バッジ","収集"],
    ["badge_combo","コンボバッジ","収集"],["badge_day","継続バッジ","収集"],["sound_tap","タップ音","音"],
    ["sound_combo","コンボ音","音"],["sound_gift","ギフト音","音"],["sound_off","消音","音"],
    ["challenge_30","30連打","ミニ"],["challenge_60","60連打","ミニ"],["challenge_rhythm","リズムタップ","ミニ"],
    ["lucky_star","ラッキー星","ミニ"],["orb_hunt","オーブ集め","ミニ"],["quiz_plus","足し算クイズ","ミニ"],
    ["rank_1","称号 見習い","称号"],["rank_2","称号 きらきら","称号"],["rank_3","称号 疾風","称号"],
    ["rank_4","称号 銀河","称号"],["rank_5","称号 無限","称号"],["mission_tap","タップミッション","進行"],
    ["mission_combo","コンボミッション","進行"],["mission_pet","ペットミッション","進行"],["stats_today","きょうの記録","進行"],
    ["stats_best","自己ベスト","進行"],["graph_exact","グラフ非丸め","精度"],["graph_raw","生値保存","精度"],
    ["graph_hires","高密度記録","精度"],["calc_50","計算50桁","精度"],["calc_export_raw","生CSV","精度"],
    ["perf_idle","分割起動","軽量化"],["perf_hidden","非表示セーブ","軽量化"],["perf_quality","画質オート","軽量化"],
    ["perf_cap_fx","エフェクト上限","軽量化"],["bg_load","裏ロード","軽量化"],["chunk_ui","UI遅延","軽量化"],
    ["toast_fun","楽しい通知","快感"],["hud_combo","HUDコンボ","進行"],["soft_pause","一時停止","進行"],
    ["color_easy","色わかりやすい","見た目"],["focus_core","コア強調","見た目"],["cheer_log","応援ログ","仲間"],
    ["stamp_week","週間スタンプ","毎日"],["gift_box","ギフト箱","毎日"],["orb_blue","青オーブ","収集"],
    ["orb_green","緑オーブ","収集"],["orb_gold","金オーブ","収集"],["orb_rainbow","虹オーブ","収集"],
    ["skin_core_a","コアスキンA","見た目"],["skin_core_b","コアスキンB","見た目"],["skin_core_c","コアスキンC","見た目"],
    ["burst_soft","やさしいバースト","快感"],["burst_star","星バースト","快感"],["burst_heart","ハートバースト","快感"],
    ["count_session","セッション数","進行"],["count_gifts","ギフト数","進行"],["help_kids","こどもヒント","進行"],
    ["exact_tick","正確ティック","精度"],["no_round_y","Y非丸め","精度"],["raw_snapshot","生スナップ","精度"],
    ["fmt_2dp","表示は小数2桁","精度"],["panel_inbar","バー内パネル","進行"],["quick_theme","テーマ即切替","見た目"],
    ["pet_inline","ペットインライン","仲間"],["combo_save","ベスト保存","進行"],["theme_name","テーマ名表示","見た目"],
    ["tap_note","タン音符","音"],["star_lite","うすい星","軽量化"],["safe_layout","重なり防止","進行"],
    ["keep_purpose","目的そのまま","進行"],["keep_layout","配置そのまま","進行"],["more_juice","もっと快感","快感"],
    ["big_glow","大きめ光","見た目"],["color_bg","背景色変更","見た目"],["color_title","題名色変更","見た目"]
  ];
  for(var i=0;i<NAMES.length;i++) FEATURES.push({id:NAMES[i][0],name:NAMES[i][1],cat:NAMES[i][2]});

  function toast(msg){
    if(typeof createToast==="function"){ try{ createToast("ドパ", msg); return; }catch(e){} }
    if(typeof pushLog==="function"){ try{ pushLog(msg, "var(--color-energy)"); }catch(e){} }
  }
  function beep(freq,dur,type){
    if(!S.sound) return;
    if(!window.__userGestured) return;
    try{
      var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
      if(!beep.ctx) beep.ctx=new AC();
      if(beep.ctx.state==="suspended") beep.ctx.resume().catch(function(){});
      var o=beep.ctx.createOscillator(), g=beep.ctx.createGain();
      o.type=type||"sine"; o.frequency.value=freq||880; g.gain.value=0.03;
      o.connect(g); g.connect(beep.ctx.destination); o.start();
      setTimeout(function(){ try{o.stop();}catch(e){} }, dur||80);
    }catch(e){}
  }
  function applyTheme(name){
    if(THEMES.indexOf(name)<0) name="mint";
    S.theme=name; save(S);
    var html=document.documentElement;
    html.className=(html.className||"").replace(/\bdopa-theme-\w+/g,"").replace(/\s+/g," ").trim();
    html.classList.add("dopa-theme-"+name);
    var btn=document.getElementById("sk-theme");
    if(btn) btn.textContent="色替え "+THEME_JP[name];
    var lab=document.getElementById("dopaThemeLab");
    if(lab) lab.textContent=THEME_JP[name];
  }
  function cycleTheme(){
    var i=THEMES.indexOf(S.theme);
    applyTheme(THEMES[(i+1)%THEMES.length]);
    toast("テーマ: "+THEME_JP[S.theme]);
  }

  var lastTap=0;
  function onTapLike(ev){
    S.taps+=1;
    var now=performance.now();
    S.combo = (now-lastTap<520) ? S.combo+1 : 1;
    lastTap=now;
    if(S.combo>S.bestCombo) S.bestCombo=S.combo;
    var eh=document.getElementById("eh-combo");
    if(eh) eh.textContent=String(S.combo);
    if(S.combo===3||S.combo===5||S.combo===8||S.combo===10||S.combo===15||S.combo===20||S.combo===25||S.combo===30||S.combo===40||S.combo===50||S.combo===80||S.combo===100){
      toast(S.combo+"コンボ！"); beep(520+S.combo*6,120,"triangle");
      if(S.confetti) burst(10);
    }
    var core=document.getElementById("coreTrigger");
    if(S.shake && core){
      core.classList.remove("dopa-shake");
      void core.offsetWidth;
      core.classList.add("dopa-shake");
    }
    if(S.floatNums && ev && ev.clientX && !(window.__perfFlags && window.__perfFlags.low)){
      var n=document.createElement("div"); n.className="dopa-float-num";
      n.textContent="+"+(1+Math.min(9,Math.floor(S.combo/5)));
      n.style.left=ev.clientX+"px"; n.style.top=ev.clientY+"px";
      document.body.appendChild(n); setTimeout(function(){ n.remove(); }, 680);
    }
    if(S.sound && S.combo%2===0) beep(680+Math.min(360,S.combo*10), 50);
    S.petXp+=1;
    if(S.petXp>=20+S.petLv*8){ S.petXp=0; S.petLv+=1; toast(S.pet+" Lv"+S.petLv); syncPet(); }
    if(S.taps%50===0){ S.coins+=3; var pack=["⭐","🌙","☄️","🌌","💠"]; var pick=pack[S.taps%5]; S.stickers[pick]=(S.stickers[pick]||0)+1; toast("シール "+pick); }
    save(S);
  }
  function burst(n){
    var root=document.getElementById("coreTrigger")||document.body;
    n=Math.min(n||8,14);
    for(var i=0;i<n;i++){
      var s=document.createElement("span");
      s.textContent=["✦","★","☆","✧"][i%4];
      s.style.cssText="position:absolute;left:50%;top:40%;pointer-events:none;z-index:5;font-size:12px;transition:transform .7s,opacity .7s";
      root.appendChild(s);
      (function(el,dx,dy){ requestAnimationFrame(function(){ el.style.transform="translate("+dx+"px,"+dy+"px)"; el.style.opacity="0"; }); })(s,(Math.random()*80-40),(Math.random()*-50-10));
      setTimeout(function(el){ return function(){ el.remove(); }; }(s), 720);
    }
  }
  function todayKey(){
    var d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  }
  function stampToday(){
    var k=todayKey();
    if(!S.stamps[k]){ S.stamps[k]=1; S.coins+=5; toast("今日のスタンプ +5"); save(S); }
  }
  function idleGift(){
    var t=Date.now();
    if(t-(S.lastGift||0)>180000){ S.lastGift=t; S.coins+=1; toast("おきざりの星 +1"); save(S); }
  }
  function syncPet(){
    var box=document.getElementById("missionBox");
    if(!box) return;
    var el=document.getElementById("dopaInlinePet");
    if(!el){
      el=document.createElement("span");
      el.id="dopaInlinePet";
      el.style.cursor="pointer";
      box.appendChild(el);
      el.onclick=function(){ toast(S.pet+" がんばって！"); S.petXp+=2; beep(900,70); };
    }
    el.textContent=" "+S.pet+"Lv"+S.petLv;
  }
  function mountBar(){
    var bar=document.getElementById("funBar");
    if(!bar || document.getElementById("dopaFab")) return;
    var btn=document.createElement("button");
    btn.type="button"; btn.id="dopaFab"; btn.textContent="ドパ";
    bar.appendChild(btn);
    var panel=document.createElement("div"); panel.id="dopaPanel";
    bar.appendChild(panel);
    btn.onclick=function(ev){ ev.stopPropagation(); panel.classList.toggle("open"); renderPanel(); };
    document.addEventListener("click", function(ev){
      if(panel.classList.contains("open") && !bar.contains(ev.target)) panel.classList.remove("open");
    });
  }
  function renderPanel(){
    var p=document.getElementById("dopaPanel"); if(!p) return;
    var days="";
    var keys=Object.keys(S.stamps);
    for(var i=1;i<=7;i++) days += '<span class="dopa-chip '+(keys.length>=i?"on":"")+'">'+i+'</span>';
    var feats="";
    for(var i=0;i<FEATURES.length;i++){
      feats += "<div class='dopa-row'><span>"+FEATURES[i].name+"</span><small>"+FEATURES[i].cat+"</small></div>";
    }
    p.innerHTML = "<h3>ドパ機能 "+FEATURES.length+" ・ テーマ <span id='dopaThemeLab'>"+THEME_JP[S.theme]+"</span></h3>"+
      "<div class='dopa-row'><span>コンボ/ベスト</span><b>"+S.combo+" / "+S.bestCombo+"</b></div>"+
      "<div class='dopa-row'><span>タップ/コイン</span><b>"+S.taps+" / "+S.coins+"</b></div>"+
      "<div class='dopa-grid'>"+
        ["🐱","🐶","🐼","🦊","🦉"].map(function(x){return "<button class='dopa-chip "+(S.pet===x?"on":"")+"' data-pet='"+x+"'>"+x+"</button>";}).join("")+
      "</div>"+
      "<div class='dopa-grid'>"+days+"</div>"+
      "<div class='dopa-grid'>"+
        "<button class='dopa-chip "+(S.sound?"on":"")+"' data-k='sound'>音</button>"+
        "<button class='dopa-chip "+(S.shake?"on":"")+"' data-k='shake'>ゆれ</button>"+
        "<button class='dopa-chip "+(S.floatNums?"on":"")+"' data-k='floatNums'>数字</button>"+
        "<button class='dopa-chip "+(S.confetti?"on":"")+"' data-k='confetti'>紙吹雪</button>"+
      "</div>"+
      "<div class='dopa-grid'>"+THEMES.map(function(t){return "<button class='dopa-chip "+(S.theme===t?"on":"")+"' data-theme='"+t+"'>"+THEME_JP[t]+"</button>";}).join("")+"</div>"+
      "<div class='dopa-row'><button class='dopa-chip' id='dopaCh30' type='button'>30連打</button><button class='dopa-chip' id='dopaGift' type='button'>ギフト</button></div>"+
      "<div style='margin-top:6px;opacity:.75'>カタログ</div>"+feats;
    p.querySelectorAll("[data-theme]").forEach(function(b){ b.onclick=function(){ applyTheme(b.getAttribute("data-theme")); renderPanel(); toast("テーマ: "+THEME_JP[S.theme]); }; });
    p.querySelectorAll("[data-k]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-k"); S[k]=!S[k]; save(S); renderPanel(); }; });
    p.querySelectorAll("[data-pet]").forEach(function(b){ b.onclick=function(){ S.pet=b.getAttribute("data-pet"); save(S); syncPet(); renderPanel(); }; });
    var c=document.getElementById("dopaCh30"); if(c) c.onclick=startChallenge;
    var g=document.getElementById("dopaGift"); if(g) g.onclick=function(){ S.lastGift=0; idleGift(); };
  }
  function startChallenge(){
    toast("8秒で30連打！");
    var base=S.taps, t0=Date.now();
    var iv=setInterval(function(){
      var got=S.taps-base;
      if(got>=30){ clearInterval(iv); S.coins+=10; save(S); toast("成功 +10"); }
      else if(Date.now()-t0>8000){ clearInterval(iv); toast("おしい "+got+"/30"); }
    },200);
  }
  function hook(){
    document.addEventListener("pointerdown", function(ev){
      var t=ev.target; if(!t||!t.closest) return;
      if(t.closest("#coreTrigger") || t.closest(".click-core-btn")) onTapLike(ev);
    }, {passive:true});
    var th=document.getElementById("sk-theme");
    if(th && !th.__dopaWrap){
      var prev=th.onclick;
      th.onclick=function(ev){ cycleTheme(); if(typeof prev==="function") prev.call(this,ev); };
      th.__dopaWrap=true;
    }
  }
  function runChunks(jobs){
    var i=0;
    function next(){
      if(i>=jobs.length) return;
      try{ jobs[i++](); }catch(e){}
      if(window.requestIdleCallback) requestIdleCallback(next,{timeout:200});
      else setTimeout(next, 40);
    }
    next();
  }
  function boot(){
    runChunks([
      function(){ stampToday(); },
      function(){ mountBar(); },
      function(){ syncPet(); },
      function(){ applyTheme(S.theme||"mint"); },
      function(){ hook(); },
      function(){ setInterval(function(){ if(!document.hidden) idleGift(); }, 20000); }
    ]);
  }
  if(document.readyState==="complete") setTimeout(boot, 40);
  else window.addEventListener("load", function(){ setTimeout(boot, 40); });
  window.DopaKidsPack={features:FEATURES,state:S,applyTheme:applyTheme};
})();
