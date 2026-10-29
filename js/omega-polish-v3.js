/* INFINITY MATRIX - OMEGA OVERDRIVE v3.0
 * Additive visual polish, safe save import, and a real Decimal.js-powered path to 1e1000.
 * This module does not replace the original economy, tabs, or save key.
 */
(function () {
  'use strict';
  if (window.__OMEGA_OVERDRIVE_V3__) return;
  window.__OMEGA_OVERDRIVE_V3__ = true;

  var SAVE_KEY = 'your_game_save_MZ_key';
  var LEVEL_FIELD = 'omegaLadderLevel';
  var GOAL = new Decimal('1e1000');
  var MAX_LEVEL = 250;
  var $ = function (id) { return document.getElementById(id); };
  var gameState = function () { return window.game || (typeof game !== 'undefined' ? game : null); };
  var dec = function (v) { try { return window.D ? window.D(v) : new Decimal(v || 0); } catch (_) { return new Decimal(0); } };
  var safeInt = function (v, fallback) { var n = Number(v); return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : (fallback || 0); };
  var level = function () {
    var g = gameState();
    if (!g) return 0;
    if (!Number.isFinite(Number(g[LEVEL_FIELD]))) g[LEVEL_FIELD] = 0;
    g[LEVEL_FIELD] = Math.max(0, Math.min(MAX_LEVEL, Math.floor(Number(g[LEVEL_FIELD]) || 0)));
    return g[LEVEL_FIELD];
  };
  var log10 = function (d) {
    try { d = dec(d); if (d.lte(0)) return 0; var x = d.log(10).toNumber(); return Number.isFinite(x) ? Math.max(0, x) : 10000; }
    catch (_) { return 0; }
  };
  var fmt = function (d) {
    try {
      d = dec(d);
      if (!d.isFinite()) return '∞';
      if (d.eq(0)) return '0';
      var e = d.abs().log(10).floor();
      if (e.lt(6)) return d.toDecimalPlaces(2).toFixed(2);
      var m = d.div(new Decimal(10).pow(e));
      return m.toFixed(2) + 'e' + e.toFixed(0);
    } catch (_) { return '0'; }
  };
  var costExponent = function (lv) { return 6 + Math.max(0, lv) * 7; };
  var nextCost = function () { return new Decimal(10).pow(costExponent(level())); };
  var multiplier = function () { return new Decimal(10).pow(Math.min(3000, level() * 12)); };
  var playerEnergy = function () { var g = gameState(); return g ? dec(g.energy) : new Decimal(0); };
  var costText = function (lv) { return '1e' + costExponent(lv); };
  var originalCps = null;
  var originalClickPower = null;
  var patchProduction = function () {
    if (typeof window.getTotalCps === 'function' && !window.getTotalCps.__omegaV3) {
      originalCps = window.getTotalCps;
      var wrappedCps = function () {
        var base = originalCps.apply(this, arguments);
        return dec(base).mul(multiplier());
      };
      wrappedCps.__omegaV3 = true;
      wrappedCps.__omegaBase = originalCps;
      window.getTotalCps = wrappedCps;
    }
    if (typeof window.getClickPower === 'function' && !window.getClickPower.__omegaV3) {
      originalClickPower = window.getClickPower;
      var wrappedClick = function () {
        var base = originalClickPower.apply(this, arguments);
        // Click power scales with the same purchased accelerator so a click-only player
        // can progress without needing a large factory setup.
        return dec(base).mul(multiplier());
      };
      wrappedClick.__omegaV3 = true;
      wrappedClick.__omegaBase = originalClickPower;
      window.getClickPower = wrappedClick;
    }
  };
  patchProduction();

  var style = document.createElement('style');
  style.id = 'omegaOverdriveV3Style';
  style.textContent = `
    :root { --ov3-cyan:#6fffea; --ov3-violet:#bda0ff; --ov3-gold:#ffe17d; --ov3-pink:#ff82c8; }
    body.omega-overdrive-v3 { background-size: 140% 140%; animation: ov3Ambient 24s ease-in-out infinite alternate; }
    @keyframes ov3Ambient { 0%{background-position:0% 0%} 100%{background-position:100% 100%} }
    #coreTrigger { transition: transform .13s ease, filter .18s ease, box-shadow .24s ease, border-color .24s ease; touch-action:manipulation; }
    #coreTrigger:hover { filter:brightness(1.12) saturate(1.12); }
    #coreTrigger:active { transform:scale(.965); }
    .column-left,.column-center,.column-right,.center-content-viewport,.card-upgrade-node,.factory-linear-card,.btn-action-prestige,.tab-trigger-button { transition: background-color .18s ease,border-color .18s ease,box-shadow .18s ease,transform .18s ease; }
    button:focus-visible,[role=button]:focus-visible { outline:2px solid var(--ov3-cyan)!important; outline-offset:3px!important; }
    #omega1000Launcher { position:fixed; top:12px; right:12px; z-index:99970; display:flex; flex-direction:column; gap:3px; width:min(194px,calc(100vw - 24px)); padding:10px 12px; border:1px solid #6fffea7a; border-radius:13px; color:#eaffff; background:linear-gradient(135deg,#061927ed,#1a1037ed 70%,#250b28ed); box-shadow:0 8px 28px #0008,0 0 22px #43fbe51b; backdrop-filter:blur(12px); font:700 11px/1.3 system-ui,sans-serif; cursor:pointer; text-align:left; }
    #omega1000Launcher strong { color:var(--ov3-cyan); font-size:12px; letter-spacing:.04em; }
    #omega1000Launcher .ov3-small { color:#b4c9dc; font-size:10px; font-weight:600; }
    #omega1000Launcher .ov3-track { height:4px; border-radius:99px; background:#ffffff17; overflow:hidden; margin-top:3px; }
    #omega1000Launcher .ov3-track i { display:block; width:0%; height:100%; background:linear-gradient(90deg,#57f7e1,#bda0ff,#ff82c8,#ffe17d); transition:width .3s ease; }
    #omega1000Panel[hidden] { display:none!important; }
    #omega1000Panel { position:fixed; z-index:1000001; inset:0; display:flex; align-items:center; justify-content:center; padding:16px; background:#02040bdc; backdrop-filter:blur(12px); font-family:system-ui,-apple-system,Segoe UI,sans-serif; }
    #omega1000Panel .ov3-card { width:min(640px,100%); max-height:min(88vh,800px); overflow:auto; border:1px solid #69f8e47d; border-radius:20px; padding:clamp(16px,3vw,28px); color:#effcff; background:radial-gradient(circle at 90% 0%,#58348b3d,transparent 38%),linear-gradient(150deg,#091321,#120b25 80%); box-shadow:0 28px 90px #000c,0 0 40px #53f3ff19; }
    #omega1000Panel h2 { margin:0; font-size:clamp(20px,4vw,29px); line-height:1.2; letter-spacing:.04em; background:linear-gradient(90deg,#fff,#6fffea,#c5a6ff,#ff82c8); color:transparent; background-clip:text; }
    #omega1000Panel p { color:#bfd0e5; line-height:1.55; font-size:13px; }
    #omega1000Panel .ov3-stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin:16px 0; }
    #omega1000Panel .ov3-stat { min-width:0; background:#ffffff08; border:1px solid #ffffff15; border-radius:12px; padding:10px; }
    #omega1000Panel .ov3-stat span { display:block; color:#9ab4cd; font-size:10px; letter-spacing:.08em; }
    #omega1000Panel .ov3-stat b { display:block; overflow-wrap:anywhere; margin-top:4px; color:#6fffea; font-size:clamp(14px,2.5vw,20px); }
    #omega1000Panel .ov3-progress { height:10px; background:#ffffff14; border-radius:99px; overflow:hidden; margin:12px 0 6px; }
    #omega1000Panel .ov3-progress i { display:block; height:100%; width:0; border-radius:99px; background:linear-gradient(90deg,#44f0d4,#7b7dff,#ff82c8,#ffe17d); transition:width .25s ease; }
    #omega1000Panel .ov3-btns { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
    #omega1000Panel button { border:1px solid #6fffea66; border-radius:10px; padding:11px 14px; min-height:42px; color:#f3ffff; background:linear-gradient(135deg,#103d47,#322452); font:800 12px system-ui,sans-serif; cursor:pointer; transition:transform .15s,filter .15s,box-shadow .15s; }
    #omega1000Panel button:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.16); box-shadow:0 5px 20px #4ef5e51f; }
    #omega1000Panel button:disabled { opacity:.42; cursor:not-allowed; }
    #omega1000Panel .ov3-primary { flex:1 1 220px; background:linear-gradient(110deg,#126f6c,#58398e,#983365); border-color:#8cfff0b5; }
    #omega1000Panel .ov3-note { padding:11px 12px; border:1px solid #ffffff14; border-radius:10px; background:#00000025; font-size:12px; color:#c3d4e4; }
    #omega1000Toast { position:fixed; z-index:1000005; left:50%; top:70px; max-width:calc(100vw - 24px); transform:translate(-50%,-8px); opacity:0; pointer-events:none; padding:11px 15px; border:1px solid #6fffea70; border-radius:12px; background:#071724f5; color:#ecfffd; font:800 12px system-ui,sans-serif; box-shadow:0 8px 30px #0008; transition:opacity .18s,transform .18s; }
    #omega1000Toast.show { opacity:1; transform:translate(-50%,0); }
    @media(max-width:720px){ #omega1000Launcher{top:auto;right:8px;bottom:64px;width:160px;padding:8px 10px;} #omega1000Panel .ov3-stats{grid-template-columns:1fr 1fr;} #omega1000Panel .ov3-stat:last-child{grid-column:1/-1;} }
    @media(prefers-reduced-motion:reduce){body.omega-overdrive-v3{animation:none!important}#coreTrigger,#omega1000Panel *,#omega1000Launcher,#omega1000Toast{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
    body.force-lightweight-all #coreTrigger,body.ox-lowfx #coreTrigger { animation:none!important; }
    /* Keep the three fixed launchers from covering each other or stealing clicks. */
    #megaHUD { left:14px!important; right:auto!important; bottom:14px!important; }
    #omega1000Launcher { top:auto!important; bottom:78px!important; right:14px!important; }
    #oxLauncher { right:14px!important; bottom:14px!important; }
    @media(max-width:720px) {
      #megaHUD { left:7px!important; right:auto!important; bottom:7px!important; }
      #oxLauncher { right:8px!important; bottom:12px!important; }
      #omega1000Launcher { top:auto!important; right:8px!important; bottom:70px!important; width:min(160px,calc(100vw - 24px)); }
    }
  `;
  document.head.appendChild(style);
  document.body.classList.add('omega-overdrive-v3');

  var launcher = document.createElement('button');
  launcher.type = 'button'; launcher.id = 'omega1000Launcher';
  launcher.setAttribute('aria-haspopup','dialog'); launcher.setAttribute('aria-controls','omega1000Panel');
  launcher.innerHTML = '<strong>✦ OMEGA PATH / 1e1000</strong><span class="ov3-small" id="ov3LauncherStats">GOAL PROGRESS —</span><span class="ov3-track"><i id="ov3LauncherBar"></i></span>';
  var overlay = document.createElement('div'); overlay.id='omega1000Panel'; overlay.hidden=true; overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-labelledby','ov3Title');
  overlay.innerHTML = '<div class="ov3-card" role="document"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px"><div><div style="font-size:10px;letter-spacing:.2em;color:#8da8c5;margin-bottom:7px">THE FINAL MILESTONE</div><h2 id="ov3Title">INFINITY MATRIX — 1e1000 ASCENSION</h2></div><button type="button" id="ov3Close" aria-label="閉じる">✕</button></div><p>通常のクリック・工場・転生の仕組みはそのまま。オメガ加速器を購入すると、クリック獲得量と自動生産が Decimal.js の巨大数倍率で強化されます。目標は <b style="color:#ffe17d">1e1000 ENERGY</b>。進行は本体セーブに含まれます。</p><div class="ov3-stats"><div class="ov3-stat"><span>CURRENT ENERGY</span><b id="ov3Energy">0</b></div><div class="ov3-stat"><span>GOAL PROGRESS</span><b id="ov3ProgressText">0.0%</b></div><div class="ov3-stat"><span>OMEGA BOOSTER</span><b id="ov3Level">0 / 250</b></div></div><div class="ov3-progress" aria-label="1e1000への進捗"><i id="ov3GoalBar"></i></div><div style="display:flex;justify-content:space-between;gap:8px;font-size:10px;color:#a8bed3"><span>ENERGY EXPONENT</span><b id="ov3ExpLabel">0 / 1000</b></div><div class="ov3-stats"><div class="ov3-stat"><span>NEXT PRICE</span><b id="ov3Cost">1e6</b></div><div class="ov3-stat"><span>AFTER BUY</span><b id="ov3Boost">×1e12</b></div><div class="ov3-stat"><span>CLICK / CPS MULTIPLIER</span><b id="ov3CurrentBoost">×1</b></div></div><div class="ov3-note" id="ov3Hint" aria-live="polite">まずは本体でエネルギーを集めて、加速器を購入しよう。</div><div class="ov3-btns"><button type="button" class="ov3-primary" id="ov3Buy">オメガ加速器を購入</button><button type="button" id="ov3Save">本体セーブ</button><button type="button" id="ov3Fullscreen">全画面切替</button><button type="button" id="ov3Export">セーブを書き出す</button><button type="button" id="ov3Close2">戻る</button></div><p style="font-size:10px;color:#8298ad;margin-bottom:0">到達時は既存のエンディング判定が動作します。加速器の進行レベルは本体セーブ内に記録され、別の仕組みのセーブデータは上書きしません。</p></div>';
  var toast = document.createElement('div'); toast.id='omega1000Toast'; toast.setAttribute('role','status'); toast.setAttribute('aria-live','polite');
  var toastTimer=0;
  function notify(msg){ toast.textContent=String(msg); toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(function(){toast.classList.remove('show');},2100); }
  function updateUi(){
    var g=gameState(); if(!g)return;
    var exp=log10(g.energy), pct=Math.min(100, exp/10);
    var lv=level(), c=nextCost(), boost=multiplier();
    var cur=$('ov3Energy');if(cur)cur.textContent=fmt(g.energy);
    var pt=$('ov3ProgressText');if(pt)pt.textContent=pct.toFixed(1)+'%';
    var lvEl=$('ov3Level');if(lvEl)lvEl.textContent=lv+' / '+MAX_LEVEL;
    var ex=$('ov3ExpLabel');if(ex)ex.textContent=Math.min(1000,exp).toFixed(1)+' / 1000';
    var cost=$('ov3Cost');if(cost)cost.textContent=costText(lv);
    var after=$('ov3Boost');if(after)after.textContent='×1e'+Math.min(3000,(lv+1)*12);
    var curr=$('ov3CurrentBoost');if(curr)curr.textContent='×1e'+Math.min(3000,lv*12);
    var bar=$('ov3GoalBar');if(bar)bar.style.width=pct+'%';
    var lbar=$('ov3LauncherBar');if(lbar)lbar.style.width=pct+'%';
    var ls=$('ov3LauncherStats');if(ls)ls.textContent='ENERGY '+fmt(g.energy)+' · '+pct.toFixed(1)+'%';
    var b=$('ov3Buy');if(b){var can=dec(g.energy).gte(c)&&lv<MAX_LEVEL;b.disabled=!can;b.textContent=lv>=MAX_LEVEL?'加速器 MAX':('加速器を購入 · '+costText(lv));}
    var hint=$('ov3Hint');if(hint){if(exp>=1000)hint.textContent='目標達成！エンディング判定を待っています。';else if(lv===0&&exp<6)hint.textContent='最初の加速器は 1e6 ENERGY。工場を購入するか、クリックして到達しよう。';else if(dec(g.energy).gte(c))hint.textContent='購入可能！次の加速段階でクリックも生産も大幅に強化されます。';else hint.textContent='次の購入には '+costText(lv)+' ENERGY が必要。施設生産とクリックを組み合わせよう。';}
  }
  function openPanel(){overlay.hidden=false;updateUi();var c=$('ov3Close');if(c)c.focus();}
  function closePanel(){overlay.hidden=true;launcher.focus();}
  function buyNext(){
    var g=gameState();if(!g)return;
    var lv=level();if(lv>=MAX_LEVEL){notify('加速器は最大レベルです');return;}
    var cost=nextCost();
    if(!dec(g.energy).gte(cost)){notify('ENERGY不足：'+costText(lv)+' が必要です');updateUi();return;}
    g.energy=dec(g.energy).minus(cost);
    g[LEVEL_FIELD]=lv+1;
    // Invalidate legacy cached click values after buying a new exponent.
    if(originalClickPower){originalClickPower._t=0;originalClickPower._v=null;originalClickPower._k='';}
    if(window.handleCoreClick){window.handleCoreClick._powAt=0;window.handleCoreClick._pow=null;}
    try{if(typeof window.refreshUI==='function')window.refreshUI();}catch(_){}
    try{if(typeof window.saveGameManual==='function')window.saveGameManual();}catch(_){}
    if(window.ClickGameMega&&window.ClickGameMega.sfx)try{window.ClickGameMega.sfx('success');}catch(_){}
    notify('OMEGA BOOST '+g[LEVEL_FIELD]+' · CLICK / CPS 強化！');
    updateUi();
  }
  function saveAndExport(){try{if(typeof window.saveGameManual==='function')window.saveGameManual();var g=gameState();var raw=typeof window.serializeGameState==='function'?window.serializeGameState(g):JSON.stringify(g);var blob=new Blob([raw],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='infinity-matrix-omega-save.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);notify('本体セーブを書き出しました');}catch(e){notify('書き出しに失敗: '+e.message);}}
  function toggleFullscreen(){var d=document;if(d.fullscreenElement){d.exitFullscreen().catch(function(){});return;}var el=d.documentElement;if(el.requestFullscreen)el.requestFullscreen().catch(function(){notify('この公開先では全画面が使えません');});else notify('このブラウザは全画面に対応していません');}
  function init(){
    if(!$('omega1000Launcher'))document.body.appendChild(launcher);
    if(!$('omega1000Panel'))document.body.appendChild(overlay);
    if(!$('omega1000Toast'))document.body.appendChild(toast);
    level();
    launcher.addEventListener('click',openPanel);
    overlay.addEventListener('click',function(e){if(e.target===overlay)closePanel();});
    $('ov3Close').addEventListener('click',closePanel);$('ov3Close2').addEventListener('click',closePanel);
    $('ov3Buy').addEventListener('click',buyNext);$('ov3Save').addEventListener('click',function(){try{if(typeof window.saveGameManual==='function')window.saveGameManual();notify('本体セーブを保存しました');}catch(e){notify('保存に失敗しました');}});
    $('ov3Fullscreen').addEventListener('click',toggleFullscreen);$('ov3Export').addEventListener('click',saveAndExport);
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&!overlay.hidden){closePanel();return;}
      var t=e.target;if(t&&(t.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(t.tagName)))return;
      if((e.key==='g'||e.key==='G')&&!e.altKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();overlay.hidden?openPanel():closePanel();}
      if((e.key===' '||e.code==='Space')&&t!==$('coreTrigger')&&!overlay.hidden){return;}
    });
    // UI is updated at 4 Hz; game loop and resource computation are not accelerated by UI redraws.
    window.setInterval(function(){try{updateUi();}catch(_){}},250);
    updateUi();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

  // The legacy import function referenced STORAGE_KEYy, a misspelled identifier. Replace only
  // that public entrypoint; keep the existing key, schema, and reload workflow.
  window.importSaveData=function(encodedData){
    try{
      if(!encodedData||!String(encodedData).trim()){notify('インポートデータが空です');return false;}
      var bin=atob(String(encodedData).trim()),bytes=new Uint8Array(bin.length);
      for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
      var text=new TextDecoder().decode(bytes),parsed=JSON.parse(text);
      if(!parsed||typeof parsed!=='object'||!Object.prototype.hasOwnProperty.call(parsed,'energy'))throw new Error('セーブ形式が違います');
      // Store one backup before replacing the primary save.
      try{var old=localStorage.getItem(SAVE_KEY);if(old)localStorage.setItem(SAVE_KEY+'_backup',old);}catch(_){}
      localStorage.setItem(SAVE_KEY,text);
      notify('インポート成功：再読み込みします');
      setTimeout(function(){location.reload();},500);return true;
    }catch(e){notify('インポートエラー：'+e.message);return false;}
  };

  // Public, read-only diagnostics for release tests and support; no hidden reset or cheat API.
  window.OmegaOverdriveV3={version:'3.0.0',goal:'1e1000',maxLevel:MAX_LEVEL,getLevel:level,getGoalProgress:function(){return Math.min(1,log10(playerEnergy())/1000);},getNextCost:function(){return nextCost().toString();},buyNext:buyNext,open:openPanel,close:closePanel,format:fmt};
})();
