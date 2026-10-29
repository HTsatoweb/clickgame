/* INFINITY MATRIX — OMEGA OVERDRIVE v5.0
 * Additive UX / QA layer. Keeps v4 progression, original systems and save keys intact.
 */
(function () {
  'use strict';
  if (window.__OMEGA_OVERDRIVE_V5__) return;
  window.__OMEGA_OVERDRIVE_V5__ = true;

  var $ = function (id) { return document.getElementById(id); };
  var api = function () { return window.OmegaOverdriveV4 || window.OmegaOverdriveV3 || null; };
  var rootStyle = document.createElement('style');
  rootStyle.id = 'omegaOverdriveV5Style';
  rootStyle.textContent = `
    :root { --ov5-edge:#315d7e; --ov5-glow:#58f5e8; --ov5-panel:#0b1727; }
    body.omega-overdrive-v5 { color-scheme:dark; }
    body.omega-overdrive-v5 .game-title { filter:drop-shadow(0 0 12px #4cefe51c); }
    body.omega-overdrive-v5 .column-left,
    body.omega-overdrive-v5 .column-center,
    body.omega-overdrive-v5 .column-right { min-width:0; }
    body.omega-overdrive-v5 .column-left { border-color:#35617d!important; }
    body.omega-overdrive-v5 .column-center { border-color:#315574!important; }
    body.omega-overdrive-v5 .column-right { border-color:#3a5577!important; }
    body.omega-overdrive-v5 .tab-navigation-bar { display:flex; align-items:stretch; overflow-x:auto; overscroll-behavior-x:contain; scrollbar-width:thin; scroll-padding-inline:8px; }
    body.omega-overdrive-v5 .tab-trigger-button { flex:0 0 auto; min-height:40px; white-space:nowrap; position:relative; }
    body.omega-overdrive-v5 .tab-trigger-button.active { color:#f5ffff!important; border-color:#6ef6ec!important; background:linear-gradient(180deg,#27566b,#16354b)!important; box-shadow:inset 0 -2px 0 #71fff0,0 0 16px #43e6dc16!important; }
    body.omega-overdrive-v5 .tab-pane { min-width:0; overflow-wrap:anywhere; }
    body.omega-overdrive-v5 .card-upgrade-node:focus-within,
    body.omega-overdrive-v5 .factory-linear-card:focus-within { outline:1px solid #70fff07a; outline-offset:1px; }
    body.omega-overdrive-v5 button:disabled { filter:saturate(.45); }
    body.omega-overdrive-v5 input[type=range] { accent-color:#5eead4; cursor:pointer; }
    body.omega-overdrive-v5 button, body.omega-overdrive-v5 [role=button] { -webkit-tap-highlight-color:transparent; }
    .omega-control-dock { max-height:calc(100dvh - 24px); }
    .ocd-body { max-height:min(66vh,620px); overflow-y:auto; overscroll-behavior:contain; }
    #ov5DiagnosticsButton { width:100%; min-height:39px; display:flex; align-items:center; justify-content:space-between; gap:8px; padding:9px 11px; border:1px solid #467e9b; border-radius:10px; color:#eafaff; background:linear-gradient(120deg,#142f44,#211d42); font:800 11px/1.3 system-ui,sans-serif; text-align:left; cursor:pointer; }
    #ov5DiagnosticsButton:hover { border-color:#75fff0; filter:brightness(1.12); }
    #ov5DiagnosticsButton small { color:#8db8cd; font-size:9px; }
    #ov5DiagnosticPanel[hidden] { display:none!important; }
    #ov5DiagnosticPanel { position:fixed; inset:0; z-index:1000010; display:flex; align-items:center; justify-content:center; padding:14px; background:#020610e8; backdrop-filter:blur(10px); font:500 13px/1.45 system-ui,sans-serif; color:#eaf8ff; }
    #ov5DiagnosticPanel .ov5-dialog { width:min(720px,100%); max-height:min(90dvh,820px); overflow:auto; padding:clamp(15px,3vw,25px); border:1px solid #5a9ab5; border-radius:18px; background:radial-gradient(ellipse at 100% 0%,#7f4da822,transparent 38%),linear-gradient(145deg,#0b1b2a,#11152a 70%,#1c1026); box-shadow:0 24px 80px #000b,0 0 32px #43dfeb17; }
    #ov5DiagnosticPanel h2 { margin:0; font-size:clamp(20px,4vw,26px); color:#82fff0; }
    #ov5DiagnosticPanel .ov5-sub { color:#9db5cc; font-size:11px; margin:6px 0 15px; }
    #ov5DiagnosticPanel .ov5-summary { padding:10px 12px; border:1px solid #ffffff17; border-radius:10px; background:#ffffff07; margin-bottom:12px; font-weight:800; }
    #ov5DiagnosticPanel .ov5-results { list-style:none; padding:0; margin:0; display:grid; gap:6px; }
    #ov5DiagnosticPanel .ov5-results li { display:flex; gap:9px; align-items:flex-start; padding:8px 10px; background:#ffffff06; border:1px solid #ffffff0e; border-radius:9px; }
    #ov5DiagnosticPanel .ov5-mark { flex:0 0 22px; width:22px; height:22px; display:grid; place-items:center; border-radius:7px; font-size:12px; font-weight:900; }
    #ov5DiagnosticPanel li.pass .ov5-mark { background:#0d695c55; color:#7cffe4; }
    #ov5DiagnosticPanel li.warn .ov5-mark { background:#88601e55; color:#ffe3a1; }
    #ov5DiagnosticPanel .ov5-result-text { min-width:0; flex:1; }
    #ov5DiagnosticPanel .ov5-result-text b { display:block; font-size:12px; }
    #ov5DiagnosticPanel .ov5-result-text small { display:block; margin-top:2px; color:#a5bdd1; font-size:11px; overflow-wrap:anywhere; }
    #ov5DiagnosticPanel .ov5-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
    #ov5DiagnosticPanel button { min-height:40px; border:1px solid #4b8eaa; border-radius:9px; color:#f3ffff; padding:9px 13px; background:linear-gradient(120deg,#163b4d,#272049); font:800 11px system-ui,sans-serif; cursor:pointer; }
    #ov5DiagnosticPanel button:hover { border-color:#78fff0; filter:brightness(1.12); }
    #ov5DiagnosticPanel .ov5-foot { color:#8ea7bb; font-size:10px; margin:12px 0 0; }
    #ov5GoalHud { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; margin:10px 0 12px; }
    #ov5GoalHud .ov5-live-card { min-width:0; border:1px solid #69dcd624; border-radius:10px; padding:9px 10px; background:linear-gradient(140deg,#ffffff0a,#ffffff03); }
    #ov5GoalHud span { display:block; color:#94afc7; font-size:9px; letter-spacing:.07em; }
    #ov5GoalHud b { display:block; margin-top:4px; color:#a4fff4; font-size:clamp(12px,2.3vw,16px); overflow-wrap:anywhere; font-variant-numeric:tabular-nums; }
    #ov5Milestone { display:flex; align-items:center; gap:8px; margin:8px 0 6px; padding:9px 11px; border:1px solid #aa8eff44; border-radius:10px; background:linear-gradient(100deg,#3f2a6538,#153a4938); color:#d8d8ff; font-size:11px; }
    #ov5Milestone .ov5-milestone-icon { font-size:17px; }
    #ov5Milestone b { color:#8ffff1; }
    #ov5Milestone span:last-child { margin-left:auto; text-align:right; color:#9bb4cf; font-size:10px; }
    #omega1000Panel .ov3-progress i { position:relative; overflow:hidden; }
    #omega1000Panel .ov3-progress i::after { content:""; display:block; width:35%; height:100%; margin-left:-35%; background:linear-gradient(90deg,transparent,#ffffff99,transparent); animation:ov5Shimmer 2.8s linear infinite; }
    #omega1000Panel .ov3-progress-legend { padding:0 1px; }
    #omega1000Panel .ov3-progress-legend span { letter-spacing:.025em; }
    #omega1000Panel .ov3-progress-foot { max-width:68ch; }
    #omega1000Panel .ov3-stat { min-width:0; }
    @keyframes ov5Shimmer { to { margin-left:110%; } }
    @media(max-width:700px) {
      .ocd-body { max-height:min(56dvh,470px); }
      #ov5GoalHud { grid-template-columns:1fr 1fr; }
      #ov5GoalHud .ov5-live-card:last-child { grid-column:1/-1; }
      #ov5DiagnosticPanel { padding:8px; }
      #ov5DiagnosticPanel .ov5-dialog { max-height:95dvh; padding:13px; border-radius:14px; }
      body.omega-overdrive-v5 .tab-navigation-bar { gap:4px!important; padding:5px!important; }
      body.omega-overdrive-v5 .tab-trigger-button { min-height:38px; padding-inline:10px; }
    }
    @media(prefers-reduced-motion:reduce) {
      #omega1000Panel .ov3-progress i::after { animation:none!important; display:none!important; }
      #ov5DiagnosticsButton, #ov5DiagnosticPanel *, #ov5GoalHud * { transition:none!important; animation:none!important; }
    }
    body.force-lightweight-all #omega1000Panel .ov3-progress i::after,
    body.ox-lowfx #omega1000Panel .ov3-progress i::after { animation:none!important; display:none!important; }
  `;
  document.head.appendChild(rootStyle);
  document.body.classList.add('omega-overdrive-v5');

  function wireTabSelection() {
    var original = window.switchMainTab;
    if (typeof original !== 'function' || original.__omegaV5Wrapped) return;
    var wrapped = function (targetId, clickEvent) {
      var trigger = clickEvent && (clickEvent.currentTarget || clickEvent.target);
      if (!trigger || !trigger.classList || !trigger.classList.contains('tab-trigger-button')) {
        var buttons = document.querySelectorAll('.tab-trigger-button');
        for (var i = 0; i < buttons.length; i++) {
          var attr = buttons[i].getAttribute('onclick') || '';
          if (attr.indexOf("'" + targetId + "'") >= 0 || attr.indexOf('"' + targetId + '"') >= 0) { trigger = buttons[i]; break; }
        }
      }
      var eventLike = trigger ? { currentTarget: trigger, target: trigger } : clickEvent;
      var result = original.call(this, targetId, eventLike);
      if (trigger && trigger.classList) {
        var all = document.querySelectorAll('.tab-trigger-button');
        for (var j = 0; j < all.length; j++) {
          all[j].setAttribute('data-ux-active-tab', all[j] === trigger ? 'true' : 'false');
        }
      }
      return result;
    };
    wrapped.__omegaV5Wrapped = true;
    wrapped.__omegaV5Base = original;
    window.switchMainTab = wrapped;
  }

  function decimal(v) {
    try {
      if (window.D && typeof window.D === 'function') return window.D(v == null ? 0 : v);
      if (window.Decimal) return new window.Decimal(v == null ? 0 : v);
    } catch (_) {}
    return null;
  }
  function compact(v) {
    try { var a = api(); if (a && typeof a.format === 'function') return a.format(v); } catch (_) {}
    try { return String(v); } catch (_) { return '—'; }
  }
  function secondsText(d) {
    try {
      var n = d.toNumber();
      if (!Number.isFinite(n)) return '極長期 · ' + compact(d) + ' 秒';
      if (n < 1) return n.toFixed(2) + ' 秒';
      if (n < 60) return n.toFixed(1) + ' 秒';
      if (n < 3600) return (n / 60).toFixed(1) + ' 分';
      if (n < 86400) return (n / 3600).toFixed(1) + ' 時間';
      if (n < 31536000) return (n / 86400).toFixed(1) + ' 日';
      return (n / 31536000).toFixed(1) + ' 年';
    } catch (_) { return '—'; }
  }
  function exponentOf(v) {
    try { var d = decimal(v); if (!d || d.lte(0)) return 0; var n = d.log(10).toNumber(); return Number.isFinite(n) ? n : 10000; }
    catch (_) { return 0; }
  }
  function milestoneFor(exp) {
    var steps = [
      [1000, '終焉点', '1e1000 · ゲームのゴール'],
      [900, 'オメガ臨界', '1e900 · 最終加速域'],
      [750, '超銀河域', '1e750 · 宇宙の外縁へ'],
      [500, '多宇宙深度', '1e500 · 進捗 50%'],
      [250, '宇宙連鎖', '1e250 · 大規模加速'],
      [100, '真空突破', '1e100 · 物理限界を越える'],
      [50, '高次元', '1e50 · 次元が拡張'],
      [10, 'エネルギー核', '1e10 · 加速段階へ'],
      [3, 'OMEGA起動準備', '1e3 · 初回ブースター価格']
    ];
    for (var i = 0; i < steps.length; i++) if (exp >= steps[i][0]) return { level: steps[i][0], title: steps[i][1], detail: steps[i][2] };
    return { level: 0, title: 'CORE集束中', detail: '1e3 ENERGYで最初の加速器を解放' };
  }

  var hudReady = false;
  function setupGoalHud() {
    var panel = $('omega1000Panel');
    if (!panel || (hudReady && $('ov5GoalHud') && $('ov5Milestone'))) return;
    hudReady = false;
    var progress = panel.querySelector('.ov3-progress');
    var card = panel.querySelector('.ov3-card');
    if (!progress || !card) return;
    var hud = document.createElement('div');
    hud.id = 'ov5GoalHud';
    hud.innerHTML = '<div class="ov5-live-card"><span>CLICK POWER</span><b id="ov5ClickPower">—</b></div><div class="ov5-live-card"><span>ENERGY / SEC</span><b id="ov5Cps">—</b></div><div class="ov5-live-card"><span>ESTIMATED TIME TO GOAL</span><b id="ov5Eta">—</b></div>';
    progress.insertAdjacentElement('afterend', hud);
    var milestone = document.createElement('div');
    milestone.id = 'ov5Milestone';
    milestone.innerHTML = '<span class="ov5-milestone-icon" aria-hidden="true">✧</span><b id="ov5MilestoneTitle">CORE集束中</b><span id="ov5MilestoneDetail">1e3 ENERGYで最初の加速器を解放</span>';
    hud.insertAdjacentElement('afterend', milestone);
    hudReady = true;
  }

  var lastMilestone = null;
  var lastHudUpdate = 0;
  function updateGoalHud(force) {
    if (!hudReady) setupGoalHud();
    if (!hudReady) return;
    var now = Date.now();
    if (!force && now - lastHudUpdate < 700) return;
    lastHudUpdate = now;
    try {
      var g = window.game;
      if (!g || g.energy == null) return;
      var exp = exponentOf(g.energy);
      var mark = milestoneFor(exp);
      var title = $('ov5MilestoneTitle'), detail = $('ov5MilestoneDetail');
      if (title) title.textContent = mark.title;
      if (detail) detail.textContent = mark.detail;
      if (lastMilestone !== null && mark.level > lastMilestone && mark.level >= 10 && window.OmegaOverdriveV4) {
        try { if (window.omegaOverdriveV5Toast) window.omegaOverdriveV5Toast('✦ マイルストーン突破：' + mark.title); } catch (_) {}
      }
      lastMilestone = mark.level;
      var click = null, cps = null;
      try { if (typeof window.getClickPower === 'function') click = decimal(window.getClickPower()); } catch (_) {}
      try { if (typeof window.getTotalCps === 'function') cps = decimal(window.getTotalCps()); } catch (_) {}
      var clickEl = $('ov5ClickPower'); if (clickEl) clickEl.textContent = click ? compact(click) : '—';
      var cpsEl = $('ov5Cps'); if (cpsEl) cpsEl.textContent = cps ? compact(cps) : '—';
      var etaEl = $('ov5Eta');
      if (etaEl) {
        var energy = decimal(g.energy), goal = decimal('1e1000');
        if (energy && goal && energy.gte(goal)) etaEl.textContent = '到達！';
        else if (!cps || cps.lte(0) || !energy || !goal) etaEl.textContent = '自動生産待ち';
        else etaEl.textContent = secondsText(goal.minus(energy).div(cps));
      }
    } catch (_) {}
  }

  var diagnosticPanel = null;
  var diagnosticOpener = null;
  function makeDiagnosticPanel() {
    if (diagnosticPanel && diagnosticPanel.isConnected) return diagnosticPanel;
    diagnosticPanel = document.createElement('div');
    diagnosticPanel.id = 'ov5DiagnosticPanel';
    diagnosticPanel.hidden = true;
    diagnosticPanel.setAttribute('role', 'dialog');
    diagnosticPanel.setAttribute('aria-modal', 'true');
    diagnosticPanel.setAttribute('aria-labelledby', 'ov5DiagnosticTitle');
    diagnosticPanel.innerHTML = '<div class="ov5-dialog"><h2 id="ov5DiagnosticTitle">🧰 OMEGA 機能セルフチェック</h2><p class="ov5-sub">UIの構造・主要API・セーブへのアクセスを確認します。実際のクリック操作すべてを自動再生するテストではありません。</p><div class="ov5-summary" id="ov5DiagnosticSummary" aria-live="polite">チェック未実行</div><ul class="ov5-results" id="ov5DiagnosticResults"></ul><div class="ov5-actions"><button type="button" id="ov5RunDiagnostics">もう一度チェック</button><button type="button" id="ov5CopyDiagnostics">結果をコピー</button><button type="button" id="ov5CloseDiagnostics">閉じる</button></div><p class="ov5-foot">⚠ 警告が出たら、ブラウザのコンソールと合わせて確認してください。外部サイトの制限やブラウザ設定までは判定できません。</p></div>';
    document.body.appendChild(diagnosticPanel);
    diagnosticPanel.addEventListener('click', function (e) { if (e.target === diagnosticPanel) closeDiagnostics(); });
    $('ov5CloseDiagnostics').addEventListener('click', closeDiagnostics);
    $('ov5RunDiagnostics').addEventListener('click', runDiagnostics);
    $('ov5CopyDiagnostics').addEventListener('click', copyDiagnostics);
    diagnosticPanel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeDiagnostics(); return; }
      if (e.key !== 'Tab') return;
      var controls = diagnosticPanel.querySelectorAll('button:not(:disabled)');
      if (!controls.length) return;
      var first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    return diagnosticPanel;
  }

  function openDiagnostics() {
    var p = makeDiagnosticPanel();
    diagnosticOpener = document.activeElement;
    p.hidden = false;
    runDiagnostics();
    $('ov5RunDiagnostics').focus();
  }
  function closeDiagnostics() {
    if (!diagnosticPanel) return;
    diagnosticPanel.hidden = true;
    var target = diagnosticOpener;
    if (target && target.closest && target.closest('.ocd-body') && $('ocdBody') && $('ocdBody').hidden) target = $('ocdToggle');
    if (target && typeof target.focus === 'function') target.focus();
  }
  var lastReport = [];
  function runDiagnostics() {
    var rows = [];
    function check(label, ok, detail, warn) { rows.push({ label: label, ok: !!ok, detail: detail || (ok ? '正常' : '要確認'), warn: !!warn }); }
    try {
      var ids = document.querySelectorAll('[id]'), seen = Object.create(null), dup = [];
      for (var i = 0; i < ids.length; i++) { var id = ids[i].id; if (!id) continue; if (seen[id]) dup.push(id); seen[id] = true; }
      check('HTML IDの重複', dup.length === 0, dup.length ? '重複: ' + Array.from(new Set(dup)).join(', ') : '重複IDなし');
    } catch (_) { check('HTML IDの重複', false, 'DOMを走査できません'); }
    check('ゲーム本体', !!window.game && window.game.energy != null, window.game && window.game.energy != null ? 'ゲーム状態を検出' : 'game / energy が見つかりません');
    var energyDec = window.game && window.game.energy != null ? decimal(window.game.energy) : null;
    check('Decimal演算', !!energyDec && (typeof window.D === 'function' || typeof window.Decimal === 'function'), energyDec ? '巨大数演算APIを検出' : 'Decimal / D またはゲームENERGYが見つかりません');
    check('コアクリック', !!$('coreTrigger') && typeof window.handleCoreClick === 'function', $('coreTrigger') && typeof window.handleCoreClick === 'function' ? 'コアとクリック処理を検出' : 'コアまたは処理関数がありません');
    check('クリック力API', typeof window.getClickPower === 'function', typeof window.getClickPower === 'function' ? 'getClickPower()' : '関数が見つかりません');
    check('自動生産API', typeof window.getTotalCps === 'function', typeof window.getTotalCps === 'function' ? 'getTotalCps()' : '関数が見つかりません');
    check('1e1000到達判定', typeof checkInfinityMilestone === 'function' || typeof window.checkInfinityMilestone === 'function', '既存エンディング判定を確認', true);
    check('OMEGA進捗パネル', !!$('omega1000Panel') && !!$('omega1000Launcher'), '進捗パネルとランチャー');
    check('OMEGA拡張UI', !!$('omegaExpansionRoot') || !!$('oxLauncher'), '拡張パネルまたは起動ボタン');
    check('MEGA HUB UI', !!$('megaHUD') || !!$('megaOpen'), 'MEGA HUB起動UI');
    check('タブ切替', typeof window.switchMainTab === 'function' && document.querySelectorAll('.tab-trigger-button').length > 0, 'メインタブ切替処理');
    check('本体セーブ／読込', typeof window.saveGameManual === 'function' && typeof window.importSaveData === 'function', '手動セーブ・インポートAPI');
    check('OMEGA加速器操作', !!(api() && typeof api().buyNext === 'function' && typeof api().buyTen === 'function' && typeof api().buyMax === 'function'), '単体・×10・最大購入API');
    try { var raw = window.localStorage && window.localStorage.getItem('your_game_save_MZ_key'); check('ブラウザストレージ', !!window.localStorage, raw == null ? 'localStorageへアクセス可能（現在の保存データなし、または未保存）' : '既存セーブデータを検出', !window.localStorage); }
    catch (_) { check('ブラウザストレージ', false, 'ブラウザがlocalStorageへのアクセスを拒否しました', true); }
    var buttons = document.querySelectorAll('button');
    check('UIボタンのDOM', buttons.length > 0, buttons.length + '個のbutton要素を検出');
    var badTabs = [];
    var tabButtons = document.querySelectorAll('.tab-trigger-button');
    for (var j = 0; j < tabButtons.length; j++) {
      var onclick = tabButtons[j].getAttribute('onclick') || '';
      var match = onclick.match(/switchMainTab\s*\(\s*['"]([^'"]+)['"]/);
      if (match && !$(match[1])) badTabs.push(match[1]);
    }
    check('メインタブの接続先', badTabs.length === 0, badTabs.length ? '存在しないタブ: ' + badTabs.join(', ') : tabButtons.length + '個のタブの接続先を確認');
    lastReport = rows;
    var list = $('ov5DiagnosticResults'), summary = $('ov5DiagnosticSummary');
    if (list) {
      list.textContent = '';
      rows.forEach(function (r) {
        var li = document.createElement('li'); li.className = r.ok ? 'pass' : 'warn';
        var mark = document.createElement('span'); mark.className = 'ov5-mark'; mark.textContent = r.ok ? '✓' : '!';
        var txt = document.createElement('span'); txt.className = 'ov5-result-text';
        var b = document.createElement('b'); b.textContent = r.label;
        var small = document.createElement('small'); small.textContent = r.detail;
        txt.appendChild(b); txt.appendChild(small); li.appendChild(mark); li.appendChild(txt); list.appendChild(li);
      });
    }
    var okCount = rows.filter(function (r) { return r.ok; }).length;
    if (summary) summary.textContent = (rows.length - okCount ? '確認が必要: ' + (rows.length - okCount) + ' / ' + rows.length : '正常: ' + okCount + ' / ' + rows.length) + ' 項目';
    return rows;
  }
  function copyDiagnostics() {
    var text = ['INFINITY MATRIX OMEGA — UI / 機能セルフチェック', new Date().toLocaleString(), ''].concat(lastReport.map(function (r) { return (r.ok ? '[OK] ' : '[CHECK] ') + r.label + ' — ' + r.detail; })).join('\n');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { if (window.omegaOverdriveV5Toast) window.omegaOverdriveV5Toast('チェック結果をコピーしました'); }).catch(function () { fallbackCopy(text); });
      } else fallbackCopy(text);
    } catch (_) { fallbackCopy(text); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', 'readonly'); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); if (window.omegaOverdriveV5Toast) window.omegaOverdriveV5Toast('チェック結果のコピーを試みました'); } catch (_) {}
    ta.remove();
  }

  function setupDiagnosticButton() {
    var body = $('ocdBody');
    if (!body || $('ov5DiagnosticsButton')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'ov5DiagnosticsButton';
    b.innerHTML = '<span>🧰 UI / 機能セルフチェック</span><small>SELF TEST ↗</small>';
    b.addEventListener('click', openDiagnostics);
    body.appendChild(b);
  }

  function hookModalFocus() {
    var panel = $('omega1000Panel');
    if (!panel || panel.__ov5FocusTrap) return;
    panel.__ov5FocusTrap = true;
    panel.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || panel.hidden) return;
      var nodes = panel.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])');
      if (!nodes.length) return;
      var first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function init() {
    wireTabSelection();
    setupGoalHud();
    setupDiagnosticButton();
    var dockSubtitle = $('ocdToggle') && $('ocdToggle').querySelector('.ocd-label small');
    if (dockSubtitle) dockSubtitle.textContent = 'PATH · SYSTEMS · DIAGNOSTICS';
    makeDiagnosticPanel();
    hookModalFocus();
    updateGoalHud(true);
    window.setInterval(function () { updateGoalHud(false); }, 500);
    // Rebuild UI enhancements if another system replaces a parent node during a reset.
    window.addEventListener('pageshow', function () {
      setupGoalHud(); setupDiagnosticButton(); hookModalFocus(); updateGoalHud(true);
    });
  }

  // Existing toast API is preferred, with a small fallback that never intercepts gameplay errors.
  window.omegaOverdriveV5Toast = function (message) {
    try { if (window.createToast) { window.createToast('OMEGA OVERDRIVE', String(message)); return; } } catch (_) {}
    var toast = $('omega1000Toast');
    if (toast) { toast.textContent = String(message); toast.classList.add('show'); window.setTimeout(function () { toast.classList.remove('show'); }, 2300); }
  };

  window.OmegaOverdriveV5 = {
    version: '5.1.0',
    runDiagnostics: runDiagnostics,
    openDiagnostics: openDiagnostics,
    updateGoalHud: function () { updateGoalHud(true); },
    milestoneFor: milestoneFor
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
