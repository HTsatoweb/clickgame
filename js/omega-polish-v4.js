/* INFINITY MATRIX - OMEGA OVERDRIVE v4.0
 * Additive release patch: UI consolidation, correct 1e1000 progress, bulk booster buys,
 * accessible keyboard input, and safer dual-format save import. Original systems/save keys retained.
 */
(function () {
  'use strict';
  if (window.__OMEGA_OVERDRIVE_V4__) return;
  window.__OMEGA_OVERDRIVE_V4__ = true;

  var SAVE_KEY = 'your_game_save_MZ_key';
  var LEVEL_FIELD = 'omegaLadderLevel';
  var GOAL_EXPONENT = 1000;
  var MAX_LEVEL = 250;
  var $ = function (id) { return document.getElementById(id); };
  var gameState = function () { return window.game || (typeof game !== 'undefined' ? game : null); };
  var dec = function (v) {
    try {
      if (v && typeof v.plus === 'function' && typeof v.gte === 'function') return v;
      if (typeof window.D === 'function') return window.D(v == null ? 0 : v);
      return new Decimal(v == null ? 0 : v);
    } catch (_) { return new Decimal(0); }
  };
  var level = function () {
    var g = gameState();
    if (!g) return 0;
    var n = Number(g[LEVEL_FIELD]);
    if (!Number.isFinite(n)) n = 0;
    g[LEVEL_FIELD] = Math.max(0, Math.min(MAX_LEVEL, Math.floor(n)));
    return g[LEVEL_FIELD];
  };
  var log10 = function (value) {
    try {
      var d = dec(value);
      if (d.lte(0)) return 0;
      var x = d.log(10).toNumber();
      return Number.isFinite(x) ? Math.max(0, x) : 10000;
    } catch (_) { return 0; }
  };
  var fmt = function (value) {
    try {
      var d = dec(value);
      if (!d.isFinite()) return '∞';
      if (d.eq(0)) return '0';
      var e = d.abs().log(10).floor();
      if (e.lt(6)) return d.toDecimalPlaces(2).toFixed(2);
      return d.div(new Decimal(10).pow(e)).toFixed(2) + 'e' + e.toFixed(0);
    } catch (_) { return '0'; }
  };
  var costExponent = function (lv) { return 3 + Math.max(0, Math.floor(lv || 0)) * 7; };
  var costAt = function (lv) { return new Decimal(10).pow(costExponent(lv)); };
  var nextCost = function () { return costAt(level()); };
  var multiplier = function () { return new Decimal(10).pow(Math.min(3000, level() * 12)); };
  var playerEnergy = function () { var g = gameState(); return g ? dec(g.energy) : new Decimal(0); };
  var costText = function (lv) { return '1e' + costExponent(lv); };
  // Keep a minimum of six decimal places, with up to ten when they contain useful precision.
  // Progress is logarithmic: 100 * log10(ENERGY) / 1000, clamped to [0, 100].
  var percentText = function (value) {
    var n = Math.max(0, Math.min(100, Number(value) || 0));
    var text = n.toFixed(10).replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
    var decimals = text.indexOf('.') >= 0 ? text.split('.')[1].length : 0;
    if (decimals < 6) text += (decimals ? '' : '.') + '0'.repeat(6 - decimals);
    return text + '%';
  };
  var originalCps = null;
  var originalClickPower = null;

  function patchProduction() {
    if (typeof window.getTotalCps === 'function' && !window.getTotalCps.__omegaV4) {
      originalCps = window.getTotalCps;
      var wrappedCps = function () {
        var base = originalCps.apply(this, arguments);
        return dec(base).mul(multiplier());
      };
      wrappedCps.__omegaV4 = true;
      wrappedCps.__omegaBase = originalCps;
      window.getTotalCps = wrappedCps;
    }
    if (typeof window.getClickPower === 'function' && !window.getClickPower.__omegaV4) {
      originalClickPower = window.getClickPower;
      var wrappedClick = function () {
        var base = originalClickPower.apply(this, arguments);
        return dec(base).mul(multiplier());
      };
      wrappedClick.__omegaV4 = true;
      wrappedClick.__omegaBase = originalClickPower;
      window.getClickPower = wrappedClick;
    }
  }
  patchProduction();

  var style = document.createElement('style');
  style.id = 'omegaOverdriveV4Style';
  style.textContent = `
    :root { --ov4-cyan:#70fff0; --ov4-blue:#67cfff; --ov4-violet:#c1a3ff; --ov4-pink:#ff8bcf; --ov4-gold:#ffe49b; }
    html { scrollbar-color:#32607d #07111e; scrollbar-width:thin; }
    body.omega-overdrive-v4 { background-image:radial-gradient(ellipse at 10% 0%,#5d35a326,transparent 38%),radial-gradient(ellipse at 90% 100%,#12e4d31a,transparent 42%),radial-gradient(ellipse at 50% 50%,#143f5b1c,transparent 70%),linear-gradient(#8dd9ff08 1px,transparent 1px),linear-gradient(90deg,#8dd9ff08 1px,transparent 1px)!important;background-size:auto,auto,auto,24px 24px,24px 24px!important; }
    .column-left,.column-center,.column-right { border-radius:14px!important; border:1px solid #3b6484!important; box-shadow:0 10px 28px #0005,inset 0 1px #ffffff08!important; }
    button,.product-btn,.btn-utility,.btn-action-prestige,.tab-trigger-button { border-radius:10px!important; transition:transform .16s ease,filter .16s ease,border-color .16s ease,box-shadow .16s ease!important; }
    button:hover:not(:disabled) { filter:brightness(1.08); }
    button:active:not(:disabled) { transform:translateY(1px) scale(.99); }
    .display-group,.stat-scroller-box,.settings-group,.prestige-wrapper,.upgrade-matrix-grid,.tab-pane,.guide-text-block { border-radius:12px!important; }
    .card-upgrade-node,.factory-linear-card,.automation-control-row,.prestige-wrapper,.guide-text-block { border-radius:12px!important; transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,background-color .18s ease!important; }
    .card-upgrade-node:hover:not(.state-disabled):not(.state-maxed),.factory-linear-card:hover:not(.state-disabled) { transform:translateY(-2px)!important; box-shadow:0 8px 24px #22d3ee12!important; }
    .tab-navigation-bar { gap:5px!important; padding:7px!important; border-radius:12px!important; }
    .tab-trigger-button { border-radius:9px!important; min-height:38px; }
    .click-core-btn { touch-action:manipulation; transition:transform .14s cubic-bezier(.2,.8,.2,1),filter .2s ease,box-shadow .24s ease!important; }
    .click-core-btn:hover { filter:brightness(1.08) saturate(1.12)!important; }
    .click-core-btn:active { transform:scale(.965)!important; }
    button:focus-visible,[role=button]:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible { outline:2px solid var(--ov4-cyan)!important; outline-offset:3px!important; }
    .omega-control-dock { position:fixed; right:max(12px,env(safe-area-inset-right)); bottom:max(12px,env(safe-area-inset-bottom)); z-index:99992; width:min(210px,calc(100vw - 24px)); font:700 12px/1.35 system-ui,-apple-system,'Segoe UI',sans-serif; color:#ecfbff; }
    .ocd-toggle { width:100%; min-height:48px; display:flex; align-items:center; gap:10px; padding:10px 13px; border:1px solid #79f7edbb; border-radius:15px; color:#efffff; background:linear-gradient(120deg,#062e3df2,#171a3df2 58%,#3a153af2); box-shadow:0 10px 30px #0007,0 0 28px #32e5e51d,inset 0 1px #ffffff1d; backdrop-filter:blur(14px); cursor:pointer; text-align:left; }
    .ocd-toggle:hover { filter:brightness(1.13); box-shadow:0 12px 35px #0008,0 0 28px #32e5e52b,inset 0 1px #ffffff26; }
    .ocd-glyph { display:grid; place-items:center; flex:0 0 27px; height:27px; border-radius:9px; color:#03181d; background:linear-gradient(135deg,#72fff0,#9bc6ff 58%,#f9a4df); font-size:17px; box-shadow:0 0 15px #70fff02a; }
    .ocd-label { flex:1; min-width:0; } .ocd-label strong { display:block; font-size:12px; letter-spacing:.06em; } .ocd-label small { display:block; font-size:9px; color:#a9c5dc; font-weight:650; margin-top:2px; }
    .ocd-chevron { color:var(--ov4-cyan); transition:transform .18s ease; } .omega-control-dock.open .ocd-chevron { transform:rotate(180deg); }
    .ocd-body { display:none; margin-bottom:8px; padding:9px; border:1px solid #5d83a3a6; border-radius:15px; background:linear-gradient(145deg,#081827f5,#10142bf5 64%,#210f2af5); box-shadow:0 18px 50px #0009,0 0 30px #42e9e315,inset 0 1px #ffffff0a; backdrop-filter:blur(18px); }
    .omega-control-dock.open .ocd-body { display:grid; gap:7px; animation:ocdOpen .16s ease-out; }
    @keyframes ocdOpen { from {opacity:0;transform:translateY(7px) scale(.985)} to {opacity:1;transform:translateY(0) scale(1)} }
    .omega-control-dock #omega1000Launcher,.omega-control-dock #oxLauncher { position:static!important; inset:auto!important; transform:none!important; width:100%!important; min-width:0!important; max-width:none!important; margin:0!important; display:flex!important; align-items:center; justify-content:space-between; gap:8px; padding:10px 11px!important; border:1px solid #4f91a9a6!important; border-radius:10px!important; color:#f0fcff!important; background:linear-gradient(110deg,#123447,#201b42 65%,#351639)!important; box-shadow:inset 0 1px #ffffff12,0 4px 14px #0003!important; text-align:left!important; font:800 11px/1.3 system-ui,sans-serif!important; white-space:normal!important; backdrop-filter:none!important; }
    .omega-control-dock #omega1000Launcher:hover,.omega-control-dock #oxLauncher:hover { border-color:#87fff2!important; filter:brightness(1.13); }
    .omega-control-dock #omega1000Launcher > span:first-child { min-width:0; flex:1 1 auto; display:flex; flex-direction:column; gap:3px; }
    .omega-control-dock #omega1000Launcher strong { color:var(--ov4-cyan); font-size:11px; } .omega-control-dock #omega1000Launcher .ov3-small { color:#c1d4e5; font-size:9px; line-height:1.2; }
    .omega-control-dock #omega1000Launcher .ov3-track { display:block; flex:0 0 55px; margin:0; height:5px; border-radius:99px; overflow:hidden; background:#ffffff22; }
    .omega-control-dock #omega1000Launcher .ov3-track i { background:linear-gradient(90deg,#5dffdf,#a89cff,#ff8bcf,#ffe49b); }
    .omega-control-dock #oxLauncher span { color:#9beee7!important; font-size:9px!important; margin:0!important; text-align:right; }
    .omega-control-dock #megaHUD { position:static!important; inset:auto!important; transform:none!important; width:100%; display:flex!important; flex-wrap:wrap; align-items:center; gap:5px; margin:0; font-size:10px; }
    .omega-control-dock #megaHUD .mh-chip { flex:1 1 70px; padding:5px 7px!important; text-align:center; font-size:9px; border-radius:8px!important; box-shadow:none!important; white-space:nowrap; }
    .omega-control-dock #megaHUD #megaOpen { flex:1 1 100%; min-height:38px; padding:8px 10px!important; border:1px solid #5b92c1!important; border-radius:10px!important; color:#f0fcff!important; background:linear-gradient(110deg,#183c59,#20264c)!important; box-shadow:inset 0 1px #ffffff12!important; text-align:left; font-size:11px; }
    #omega1000Panel[hidden] { display:none!important; }
    #omega1000Panel { position:fixed; z-index:1000001; inset:0; display:flex; align-items:center; justify-content:center; padding:16px; background:radial-gradient(ellipse at 50% 0%,#3d2d6466,transparent 55%),#02040bdc!important; backdrop-filter:blur(12px); font-family:system-ui,-apple-system,'Segoe UI',sans-serif; }
    #omega1000Panel .ov3-card { width:min(680px,100%); max-height:min(90vh,820px); overflow:auto; border:1px solid #69f8e47d; border-radius:22px!important; padding:clamp(16px,3vw,28px); color:#effcff; background:radial-gradient(circle at 100% 0%,#864b9b35,transparent 35%),linear-gradient(150deg,#081a29,#11132c 68%,#210d27)!important; box-shadow:0 28px 90px #000d,0 0 55px #53f3ff20!important; }
    #omega1000Panel h2 { margin:0; font-size:clamp(20px,4vw,29px); line-height:1.2; letter-spacing:.04em; background:linear-gradient(90deg,#fff,#70fff0,#c1a3ff,#ff8bcf); color:transparent; -webkit-background-clip:text; background-clip:text; }
    #omega1000Panel p { color:#bfd0e5; line-height:1.55; font-size:13px; }
    #omega1000Panel .ov3-stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin:16px 0; }
    #omega1000Panel .ov3-stat { min-width:0; border:1px solid #6688a32b!important; background:linear-gradient(145deg,#ffffff0c,#ffffff04)!important; border-radius:13px!important; padding:10px; }
    #omega1000Panel .ov3-stat span { display:block; color:#9ab4cd; font-size:10px; letter-spacing:.08em; }
    #omega1000Panel .ov3-stat b { display:block; overflow-wrap:anywhere; margin-top:4px; color:#70fff0; font-size:clamp(14px,2.5vw,20px); }
    #omega1000Panel .ov3-progress { height:10px; background:#ffffff15!important; border-radius:99px; overflow:hidden; margin:12px 0 6px; box-shadow:inset 0 1px 3px #0008; }
    #omega1000Panel .ov3-progress i { display:block; height:100%; width:0; border-radius:99px; background:linear-gradient(90deg,#44f0d4,#7b7dff,#ff82c8,#ffe17d); transition:width .25s ease; box-shadow:0 0 15px #69f4ef4a; }
    #omega1000Panel .ov3-btns { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
    #omega1000Panel button { border:1px solid #6fffea66; border-radius:11px!important; padding:11px 14px; min-height:42px; color:#f3ffff; background:linear-gradient(135deg,#103d47,#322452); font:800 12px system-ui,sans-serif; cursor:pointer; transition:transform .15s,filter .15s,box-shadow .15s; }
    #omega1000Panel button:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.16); box-shadow:0 5px 20px #4ef5e51f; }
    #omega1000Panel button:disabled { opacity:.42; cursor:not-allowed; }
    #omega1000Panel .ov3-primary { flex:1 1 220px; background:linear-gradient(110deg,#126f6c,#58398e,#983365); border-color:#8cfff0b5; }
    #omega1000Panel .ov3-note { padding:11px 12px; border:1px solid #ffffff14; border-radius:10px; background:#00000025; font-size:12px; color:#c3d4e4; }
    #omega1000Toast { position:fixed; z-index:1000005; left:50%; max-width:calc(100vw - 24px); transform:translate(-50%,-8px); opacity:0; pointer-events:none; padding:11px 15px; border:1px solid #6fffea70; border-radius:12px!important; background:#071724f5; color:#ecfffd; font:800 12px system-ui,sans-serif; box-shadow:0 10px 34px #0008,0 0 25px #4ff6dc1a; transition:opacity .18s,transform .18s; }
    #omega1000Toast.show { opacity:1; transform:translate(-50%,0); }
    #omega1000Panel .ov3-stat { border-color:#6688a32b!important; background:linear-gradient(145deg,#ffffff0c,#ffffff04)!important; border-radius:13px!important; }
    #omega1000Panel .ov3-btns { gap:8px; }
    #omega1000Panel button { border-radius:11px!important; }
    #omega1000Panel .ov3-progress { background:#ffffff15!important; box-shadow:inset 0 1px 3px #0008; }
    #omega1000Panel .ov3-progress i { box-shadow:0 0 15px #69f4ef4a; }
    #omega1000Panel .ov3-stat b,#omega1000Panel .ov3-progress-legend b { font-variant-numeric:tabular-nums lining-nums; letter-spacing:-.025em; }
    #omega1000Panel .ov3-progress-legend { display:flex; justify-content:space-between; align-items:center; gap:10px; margin:5px 1px 0; color:#a8bed3; font-size:10px; line-height:1.4; }
    #omega1000Panel .ov3-progress-legend span { min-width:0; }
    #omega1000Panel .ov3-progress-legend b { flex:0 0 auto; color:#d8fff9; text-align:right; }
    #omega1000Panel .ov3-progress-foot { margin:5px 1px 10px!important; color:#829bb4!important; font-size:10px!important; line-height:1.45!important; }
    #omega1000Panel .ov3-stat:nth-child(2) { border-color:#6a8cff55!important; background:linear-gradient(145deg,#7179ff16,#ffffff03)!important; }
    #omega1000Panel #ov3ProgressText { color:#c7c8ff!important; }
    #omega1000Panel .ov3-progress { position:relative; }
    #omega1000Panel .ov3-progress:focus-visible { outline:2px solid #70fff0; outline-offset:3px; }
    #omega1000Toast { top:calc(14px + env(safe-area-inset-top))!important; border-radius:12px!important; box-shadow:0 10px 34px #0008,0 0 25px #4ff6dc1a!important; }
    #megaPanel,#omegaExpansionRoot { scrollbar-color:#39708c #08111f; }
    #megaPanel { border-radius:18px!important; border-color:#397b99!important; }
    #omegaExpansionRoot #oxTop { box-shadow:0 5px 24px #0004; }
    #omegaExpansionRoot .ox-node,#omegaExpansionRoot .ox-card { border-radius:14px!important; transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease; }
    #omegaExpansionRoot .ox-node:hover { border-color:#64ebdf77; box-shadow:0 7px 20px #0004,0 0 18px #4df2e909; }
    @media(max-width:720px) {
      .omega-control-dock { right:max(8px,env(safe-area-inset-right)); bottom:max(8px,env(safe-area-inset-bottom)); width:min(190px,calc(100vw - 16px)); }
      .ocd-toggle { min-height:44px; padding:8px 10px; border-radius:13px; }
      .ocd-body { max-height:min(52vh,440px); overflow:auto; }
      #omega1000Panel { padding:10px!important; }
      #omega1000Panel .ov3-card { max-height:94vh!important; padding:15px!important; border-radius:17px!important; }
      #omega1000Panel .ov3-stats { grid-template-columns:1fr 1fr; gap:6px!important; }
      #omega1000Panel .ov3-stat { padding:8px!important; }
      #omega1000Panel .ov3-stat:last-child { grid-column:1/-1; }
      #omega1000Panel .ov3-progress-legend { flex-wrap:wrap; align-items:flex-start; }
      #omega1000Panel .ov3-progress-legend b { margin-left:auto; }
      #omegaExpansionRoot #oxTop { flex-wrap:wrap; }
      #omegaExpansionRoot #oxTabs { overflow-x:auto; overscroll-behavior-x:contain; }
    }
    @media(prefers-reduced-motion:reduce) {
      body.omega-overdrive-v4 { animation:none!important; }
      .omega-control-dock *,#omega1000Panel *,#omega1000Toast,#coreTrigger,.card-upgrade-node,.factory-linear-card { animation:none!important; transition:none!important; scroll-behavior:auto!important; }
    }
    body.force-lightweight-all .omega-control-dock *,body.ox-lowfx .omega-control-dock * { animation:none!important; }
  `;
  document.head.appendChild(style);
  document.body.classList.add('omega-overdrive-v4');

  var launcher = document.createElement('button');
  launcher.type = 'button'; launcher.id = 'omega1000Launcher';
  launcher.setAttribute('aria-haspopup','dialog'); launcher.setAttribute('aria-controls','omega1000Panel');
  launcher.innerHTML = '<span><strong>✦ OMEGA PATH / 1e1000</strong><span class="ov3-small" id="ov3LauncherStats">GOAL PROGRESS —</span></span><span class="ov3-track"><i id="ov3LauncherBar"></i></span>';
  var overlay = document.createElement('div'); overlay.id='omega1000Panel'; overlay.hidden=true; overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-labelledby','ov4Title');
  overlay.innerHTML = '<div class="ov3-card" role="document"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px"><div><div style="font-size:10px;letter-spacing:.2em;color:#8da8c5;margin-bottom:7px">THE FINAL MILESTONE</div><h2 id="ov4Title">INFINITY MATRIX — 1e1000 ASCENSION</h2></div><button type="button" id="ov3Close" aria-label="閉じる">✕</button></div><p>クリック、工場、転生などの既存システムを維持したまま、オメガ加速器でクリック獲得量と自動生産を強化します。目標は <b style="color:#ffe17d">1e1000 ENERGY</b>。加速器のレベルは本体のセーブデータに保存されます。</p><div class="ov3-stats"><div class="ov3-stat"><span>CURRENT ENERGY</span><b id="ov3Energy">0</b></div><div class="ov3-stat"><span>GOAL PROGRESS · LOG SCALE</span><b id="ov3ProgressText">0.000000%</b></div><div class="ov3-stat"><span>OMEGA BOOSTER</span><b id="ov3Level">0 / 250</b></div></div><div class="ov3-progress" role="progressbar" aria-label="1e1000への進捗" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="ov3GoalBar"></i></div><div class="ov3-progress-legend"><span>ENERGY EXPONENT · log10(ENERGY)</span><b id="ov3ExpLabel">0.000000 / 1000</b></div><p class="ov3-progress-foot" id="ov3ProgressFoot">進捗％は対数（指数）ベースです。ENERGYの線形比率ではなく、1e1000までの指数進行度を表示します。</p><div class="ov3-stats"><div class="ov3-stat"><span>NEXT PRICE</span><b id="ov3Cost">1e3</b></div><div class="ov3-stat"><span>AFTER BUY</span><b id="ov3Boost">×1e12</b></div><div class="ov3-stat"><span>CLICK / CPS MULTIPLIER</span><b id="ov3CurrentBoost">×1</b></div></div><div class="ov3-note" id="ov3Hint" aria-live="polite">まずはエネルギーを集めて、加速器を購入しよう。</div><div class="ov3-btns"><button type="button" class="ov3-primary" id="ov3Buy">加速器を購入</button><button type="button" id="ov4Buy10">×10購入</button><button type="button" id="ov4BuyMax">買えるだけ購入</button><button type="button" id="ov3Save">本体セーブ</button><button type="button" id="ov3Fullscreen">全画面切替</button><button type="button" id="ov3Export">セーブを書き出す</button><button type="button" id="ov3Close2">戻る</button></div><p style="font-size:10px;color:#8298ad;margin-bottom:0">1e1000到達時は本体の既存エンディング判定が動作します。加速器は本体セーブ内に記録され、拡張システムの別セーブは変更しません。</p></div>';
  var toast = document.createElement('div'); toast.id='omega1000Toast'; toast.setAttribute('role','status'); toast.setAttribute('aria-live','polite');
  var toastTimer=0;
  function notify(msg){ toast.textContent=String(msg); toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(function(){toast.classList.remove('show');},2300); }

  function updateUi(){
    var g=gameState(); if(!g)return;
    var exp=log10(g.energy);
    // Correct mapping: exponent 1000 means 100%. Clamp exponent before display/progress.
    var expPosition=Math.max(0,Math.min(GOAL_EXPONENT,exp));
    var pct=expPosition/GOAL_EXPONENT*100;
    var pctLabel=percentText(pct);
    var lv=level(), c=nextCost();
    var cur=$('ov3Energy');if(cur)cur.textContent=fmt(g.energy);
    var pt=$('ov3ProgressText');if(pt){pt.textContent=pctLabel;pt.title='対数進捗：log10(ENERGY) ÷ 1000 × 100 = '+pctLabel;}
    var lvEl=$('ov3Level');if(lvEl)lvEl.textContent=lv+' / '+MAX_LEVEL;
    var ex=$('ov3ExpLabel');if(ex)ex.textContent=expPosition.toFixed(6)+' / '+GOAL_EXPONENT;
    var cost=$('ov3Cost');if(cost)cost.textContent=costText(lv);
    var after=$('ov3Boost');if(after)after.textContent='×1e'+Math.min(3000,(lv+1)*12);
    var curr=$('ov3CurrentBoost');if(curr)curr.textContent=lv===0?'×1':'×1e'+Math.min(3000,lv*12);
    var bar=$('ov3GoalBar');if(bar){bar.style.width=pct.toFixed(10)+'%';bar.parentElement.setAttribute('aria-valuenow',pct.toFixed(10));bar.parentElement.setAttribute('aria-valuetext',pctLabel+'（指数ベースの進捗）');bar.parentElement.title='指数ベースの進捗 '+pctLabel+' · log10(ENERGY) / 1000';}
    var lbar=$('ov3LauncherBar');if(lbar)lbar.style.width=pct.toFixed(10)+'%';
    var ls=$('ov3LauncherStats');if(ls)ls.textContent='ENERGY '+fmt(g.energy)+' · '+pctLabel;
    var canBuy=dec(g.energy).gte(c)&&lv<MAX_LEVEL;
    var b=$('ov3Buy');if(b){b.disabled=!canBuy;b.textContent=lv>=MAX_LEVEL?'加速器 MAX':('加速器を購入 · '+costText(lv));}
    var b10=$('ov4Buy10');if(b10){b10.disabled=lv>=MAX_LEVEL||!canBuy;b10.textContent='×10購入';}
    var bmax=$('ov4BuyMax');if(bmax){bmax.disabled=lv>=MAX_LEVEL||!canBuy;bmax.textContent='買えるだけ購入';}
    var hint=$('ov3Hint');if(hint){
      if(exp>=GOAL_EXPONENT)hint.textContent='OMEGA到達！既存のエンディング判定が起動します。';
      else if(lv===0&&exp<3)hint.textContent='最初の加速器は 1e3 ENERGY。施設も活用して、最初のOMEGA加速を解放しよう。';
      else if(canBuy)hint.textContent='購入可能！加速器でクリックと自動生産が大幅に強化されます。';
      else hint.textContent='次の購入には '+costText(lv)+' ENERGY が必要。施設生産とクリックを組み合わせよう。';
    }
  }
  function openPanel(){overlay.hidden=false;updateUi();var c=$('ov3Close');if(c)c.focus();}
  function closePanel(){overlay.hidden=true;var focusTarget=$('ocdToggle');if(focusTarget)focusTarget.focus();else launcher.focus();}
  function clearPowerCaches(){
    if(originalClickPower){originalClickPower._t=0;originalClickPower._v=null;originalClickPower._k='';}
    if(window.getClickPower){window.getClickPower._t=0;window.getClickPower._v=null;window.getClickPower._k='';}
    if(window.handleCoreClick){window.handleCoreClick._powAt=0;window.handleCoreClick._pow=null;}
  }
  function buyMany(limit){
    var g=gameState();if(!g){notify('ゲーム状態がまだ準備できていません');return 0;}
    var bought=0, maxCount=Math.max(1,Math.min(MAX_LEVEL,Number(limit)||1));
    var balance=dec(g.energy), lv=level();
    while(bought<maxCount&&lv<MAX_LEVEL){
      var price=costAt(lv);
      if(!balance.gte(price))break;
      balance=balance.minus(price);lv++;bought++;
    }
    if(!bought){notify('ENERGY不足：'+costText(level())+' が必要です');updateUi();return 0;}
    g.energy=balance;g[LEVEL_FIELD]=lv;clearPowerCaches();
    try{if(typeof window.refreshUI==='function')window.refreshUI();}catch(_){}
    try{if(typeof window.saveGameManual==='function')window.saveGameManual();}catch(_){}
    if(window.ClickGameMega&&window.ClickGameMega.sfx)try{window.ClickGameMega.sfx('success');}catch(_){}
    notify('OMEGA BOOST ×'+bought+' · LV '+lv+' / CLICK・CPS強化');updateUi();return bought;
  }
  function saveAndExport(){
    try{
      if(typeof window.saveGameManual==='function')window.saveGameManual();
      var g=gameState();
      var raw=typeof window.serializeGameState==='function'?window.serializeGameState(g):JSON.stringify(g);
      var blob=new Blob([raw],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='infinity-matrix-omega-save.json';document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url);},1500);notify('JSON形式で本体セーブを書き出しました');
    }catch(e){notify('書き出しに失敗：'+(e&&e.message?e.message:'不明なエラー'));}
  }
  function toggleFullscreen(){
    var d=document;
    if(d.fullscreenElement){if(d.exitFullscreen)d.exitFullscreen().catch(function(){});return;}
    var el=d.documentElement;
    if(el.requestFullscreen)el.requestFullscreen().catch(function(){notify('この公開先では全画面が許可されていません');});
    else notify('このブラウザは全画面に対応していません');
  }

  function setupControlDock(){
    if($('omegaControlDock'))return;
    var dock=document.createElement('aside');dock.id='omegaControlDock';dock.className='omega-control-dock';dock.setAttribute('aria-label','OMEGAコントロール');
    dock.innerHTML='<div class="ocd-body" id="ocdBody" hidden></div><button type="button" class="ocd-toggle" id="ocdToggle" aria-expanded="false" aria-controls="ocdBody"><span class="ocd-glyph">Ω</span><span class="ocd-label"><strong>OMEGA CONTROL</strong><small>PATH · SYSTEMS · SETTINGS</small></span><span class="ocd-chevron" aria-hidden="true">⌃</span></button>';
    document.body.appendChild(dock);
    var body=$('ocdBody'),toggle=$('ocdToggle');
    // Move the existing launchers without cloning them, so every original handler and ID survives.
    ['omega1000Launcher','oxLauncher','megaHUD'].forEach(function(id){var el=$(id);if(el)body.appendChild(el);});
    toggle.addEventListener('click',function(){var open=!dock.classList.contains('open');dock.classList.toggle('open',open);body.hidden=!open;toggle.setAttribute('aria-expanded',String(open));});
    body.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('button'):null;if(!b)return;setTimeout(function(){dock.classList.remove('open');body.hidden=true;toggle.setAttribute('aria-expanded','false');},0);});
    document.addEventListener('pointerdown',function(e){if(!dock.contains(e.target)&&dock.classList.contains('open')){dock.classList.remove('open');body.hidden=true;toggle.setAttribute('aria-expanded','false');}},true);
  }

  function decodeSaveCandidate(input){
    var raw=String(input||'').trim();if(!raw)throw new Error('セーブデータが空です');
    var candidates=[raw];
    if(raw.charAt(0)!=='{'){
      try{var bin=atob(raw),bytes=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);candidates.push(new TextDecoder().decode(bytes));}catch(_){}
    }
    var lastError=null;
    for(var j=0;j<candidates.length;j++){
      try{
        var parsed=JSON.parse(candidates[j]);
        if(!parsed||typeof parsed!=='object'||Array.isArray(parsed)||!Object.prototype.hasOwnProperty.call(parsed,'energy'))throw new Error('ENERGY項目がありません');
        // Validate Decimal range before any persistent write; this prevents corrupt imports replacing a save.
        var energy;try{energy=new Decimal(parsed.energy);}catch(_){throw new Error('ENERGY値が不正です');}
        if(!energy.isFinite()||energy.isNeg())throw new Error('ENERGY値が不正です');
        ['facCounts','upgLevels','amUpgLevels','tlUpgLevels'].forEach(function(k){if(parsed[k]!=null&&!Array.isArray(parsed[k]))throw new Error(k+' 配列が不正です');});
        return JSON.stringify(parsed);
      }catch(e){lastError=e;}
    }
    throw lastError||new Error('セーブ形式が不正です');
  }
  function init(){
    if(!$('omega1000Launcher'))document.body.appendChild(launcher);
    if(!$('omega1000Panel'))document.body.appendChild(overlay);
    if(!$('omega1000Toast'))document.body.appendChild(toast);
    setupControlDock();
    level();
    launcher.addEventListener('click',openPanel);
    overlay.addEventListener('click',function(e){if(e.target===overlay)closePanel();});
    $('ov3Close').addEventListener('click',closePanel);$('ov3Close2').addEventListener('click',closePanel);
    $('ov3Buy').addEventListener('click',function(){buyMany(1);});
    $('ov4Buy10').addEventListener('click',function(){buyMany(10);});
    $('ov4BuyMax').addEventListener('click',function(){buyMany(MAX_LEVEL);});
    $('ov3Save').addEventListener('click',function(){try{if(typeof window.saveGameManual==='function')window.saveGameManual();notify('本体セーブを保存しました');}catch(_){notify('保存に失敗しました');}});
    $('ov3Fullscreen').addEventListener('click',toggleFullscreen);$('ov3Export').addEventListener('click',saveAndExport);
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&!overlay.hidden){closePanel();return;}
      var t=e.target;if(t&&(t.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(t.tagName)))return;
      if((e.key==='g'||e.key==='G')&&!e.altKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();overlay.hidden?openPanel():closePanel();}
    });
    // The original core handles pointerdown. A synthetic/keyboard click has detail=0 and would bypass it;
    // route that keyboard/accessibility activation through the original click handler exactly once.
    var core=$('coreTrigger');
    if(core&&typeof window.handleCoreClick==='function'&&!core.__omegaV4KeyboardBound){
      core.__omegaV4KeyboardBound=true;
      core.addEventListener('click',function(e){
        if(e.detail!==0||core.__omegaV4SyntheticHandling)return;
        core.__omegaV4SyntheticHandling=true;
        try{window.handleCoreClick({clientX:core.getBoundingClientRect().left+core.offsetWidth/2,clientY:core.getBoundingClientRect().top+core.offsetHeight/2});}
        finally{setTimeout(function(){core.__omegaV4SyntheticHandling=false;},0);}
      });
    }
    window.setInterval(function(){try{updateUi();}catch(_){}},250);
    updateUi();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

  // Accept both the existing base64 save format and the direct JSON emitted by the OMEGA exporter.
  window.importSaveData=function(encodedData){
    try{
      var normalized=decodeSaveCandidate(encodedData);
      var storage=window.localStorage;
      var old=storage.getItem(SAVE_KEY);
      if(old)storage.setItem(SAVE_KEY+'_backup',old);
      storage.setItem(SAVE_KEY,normalized);
      notify('インポート成功：再読み込みします');
      try{if(typeof window.createToast==='function')window.createToast('インポート成功','バックアップを作成してセーブを復元しました。');}catch(_){}
      setTimeout(function(){location.reload();},650);return true;
    }catch(e){notify('インポートエラー：'+(e&&e.message?e.message:'無効なデータ'));return false;}
  };

  var diagnostics={
    version:'4.0.0',goal:'1e1000',goalExponent:GOAL_EXPONENT,maxLevel:MAX_LEVEL,
    getLevel:level,getGoalProgress:function(){return Math.min(1,log10(playerEnergy())/GOAL_EXPONENT);},
    getNextCost:function(){return nextCost().toString();},buyNext:function(){return buyMany(1);},buyTen:function(){return buyMany(10);},buyMax:function(){return buyMany(MAX_LEVEL);},
    open:openPanel,close:closePanel,format:fmt
  };
  window.OmegaOverdriveV4=diagnostics;
  // Compatibility alias for tooling and older integrations which checked the previous diagnostics name.
  window.OmegaOverdriveV3=diagnostics;
})();
