
(function OmegaFeaturePack(){
  "use strict";
  function ready(fn){
    if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(fn, 0);
    else document.addEventListener("DOMContentLoaded", fn);
  }

  const LUCKY = [
    ["aurora_petal","オーロラ花弁","空の花びらがエネルギーになる"],
    ["comet_ribbon","彗星リボン","尾をつかんで加速した"],
    ["lucky_dice","幸運ダイス","出目が最高値だった"],
    ["prism_rain","プリズム雨","光の粒がコアに降り注ぐ"],
    ["nova_smile","ノヴァスマイル","星がこちらを見てくれた"],
    ["core_polish","コア磨き","表面が輝いてタップが伸びる"],
    ["factory_song","工場の歌","ラインが鼻歌で速くなる"],
    ["wind_gift","恒星風の贈り物","風がエネルギーを運んだ"],
    ["crystal_drop","結晶ドロップ","端数がきれいに結晶化した"],
    ["echo_bonus","残響ボーナス","前のタップがもう一度鳴る"],
    ["gold_orbit","ゴールド軌道","軌道が金色に揃った"],
    ["tap_carnival","タップカーニバル","指先がお祭りになる"],
    ["line_spark","ライン火花","配線が弾けるほど元気"],
    ["chrono_gift","時間の贈りもの","一秒がちょっと太った"],
    ["star_mail","星の郵便","小包がエネルギー入り"],
    ["soft_overclock","やさしい過負荷","壊れない範囲で出力アップ"],
    ["harmony_plus","ハーモニー+","音が揃って全体が伸びる"],
    ["cache_bloom","キャッシュ開花","計算の端数が花になる"],
    ["galaxy_wink","銀河ウインク","遠くが瞬いて応援"],
    ["blue_print","青写真発見","古い図面が役立つ"],
    ["meteor_catch","流星キャッチ","流れ星を両手で受けた"],
    ["pulse_wave","パルスウェーブ","波が施設をなでる"],
    ["crit_kiss","クリットキス","会心が連続しやすい"],
    ["shield_charge","シールド充填","守りが少し貯まる"],
    ["fever_seed","フィーバーの種","熱気が芽を出す"],
    ["combo_glue","コンボのり","連鎖が切れにくくなる"],
    ["watt_balloon","ワット風船","エネルギーがふくらむ"],
    ["neon_lane","ネオンレーン","生産路が光の道になる"],
    ["time_skiplet","小さな早送り","時間がちょこっと跳ぶ"],
    ["orb_garden","オーブ庭園","光の球が芽吹く"],
    ["spark_encore","スパークアンコール","火花がもう一回"],
    ["lucky_route","幸運ルート","最短コースが見えた"],
    ["gift_meteor","ギフト流星","プレゼントが落ちてきた"],
    ["core_halo","コアの光輪","輪が回って出力アップ"],
    ["quiet_boost","静かな加速","音もなく全体が伸びる"],
    ["rainbow_tick","虹ティック","数値が虹色に跳ねる"],
    ["plus_capsule","プラスカプセル","カプセルを開けたら中身が得"],
    ["stellar_pat","恒星ポン","星に頭をなでられた"],
    ["grid_smile","グリッド笑顔","回路がご機嫌"],
    ["amber_save","琥珀セーブ","漏れそうな分が固まった"],
    ["focus_beam","フォーカスビーム","一点に力が集まる"],
    ["mini_jackpot","ミニジャックポット","小さい大当たり"],
    ["clockwork_ok","歯車好調","カチカチが気持ちいい"],
    ["photon_stack","光子スタック","光が積み上がる"],
    ["tide_up","上げ潮","全体がゆっくり上昇"],
    ["bonus_echo2","二重残響","ごほうびが二重"],
    ["green_lane","グリーンレーン","安全に生産アップ"],
    ["sparkle_cap","きらめき帽","タップがきらめく"],
    ["orbit_gift","軌道ギフト","周回のついでに得した"],
    ["clear_cheer","クリア応援","ゴールまでの応援ソング"]
  ];

  const UNLUCKY = [
    ["dust_sneeze","宇宙塵くしゃみ","フィルターがむせた"],
    ["soft_lag","ソフトラグ","入力が一拍遅れる"],
    ["dim_volt","電圧うす暗","明かりが落ちて生産減"],
    ["sticky_sec","秒のベタつき","秒がベタついて遅い"],
    ["cool_drip","冷却ポタポタ","冷えて動きが鈍い"],
    ["packet_gap","パケット隙間","データがすっぽ抜ける"],
    ["idle_yawn","アイドルあくび","施設がぼんやり"],
    ["fog_soft","やわらか霧","視界がにじむ"],
    ["core_hiccup","コアしゃっくり","タップが途切れる"],
    ["static_hiss","静電気ノイズ","計算がざわつく"],
    ["vacuum_sip","真空すすり","エネルギーが少し吸われる"],
    ["overheat_soft","やさしい過熱","出力を落とさないと危ない"],
    ["miscount","数え違い","端数が消えた"],
    ["echo_cancel","残響キャンセル","反響が打ち消された"],
    ["orbit_wobble","軌道ぐらつき","整列が崩れる"],
    ["line_jam","ライン詰まり","ベルトがもたつく"],
    ["tap_soap","タップ石鹸","手が滑って弱い"],
    ["chrono_mud","時間の泥","進行がぬかるむ"],
    ["glitch_dust","グリッチ塵","表示がちらつく"],
    ["brown_tick","ブラウンティック","一瞬電圧が落ちる"],
    ["cache_miss","キャッシュミス","計算が遠回り"],
    ["combo_slip","コンボすべり","連鎖が滑る"],
    ["star_frown","星のしかめ面","遠くが不機嫌"],
    ["gift_empty","空の小包","開けたら空っぽ"],
    ["halo_crack","光輪ひび","輪が少し欠ける"],
    ["neon_flick","ネオン点滅","道がちらちら"],
    ["watt_leak","ワット漏れ","隙間から漏れる"],
    ["clock_skip","歯車とばし","カチッが一個抜ける"],
    ["photon_scatter","光子さんざん","光が散って弱い"],
    ["tide_down","引き潮","全体がすとんと"],
    ["route_detour","遠回りルート","遠回りさせられた"],
    ["meteor_miss","流星おあずけ","手が届かなかった"],
    ["grid_grump","グリッド不機嫌","回路がむすっ"],
    ["focus_blur","フォーカスぼやけ","一点に集まらない"],
    ["capsule_rust","カプセルさび","開かない"],
    ["spark_out","火花消え","弾ける前に消えた"],
    ["lane_ice","レーン凍結","生産路が滑る"],
    ["quiet_drop","静かな落下","音もなく少し減る"],
    ["rainbow_fade","虹あせ","色が落ちて勢い減"],
    ["shield_gap","シールド隙間","守りに穴"],
    ["fever_chill","フィーバー冷え","熱気が冷める"],
    ["orb_pop","オーブ破裂","球が先に割れた"],
    ["mail_late","郵便遅れ","小包が遅配"],
    ["dice_one","ダイス1","出目が最小"],
    ["petal_wilt","花弁しおれ","オーロラがしぼむ"],
    ["song_offkey","工場音痴","鼻歌が外れる"],
    ["polish_smudge","磨き汚れ","指紋が残る"],
    ["beam_scatter","ビーム拡散","力が散る"],
    ["cheer_mute","応援ミュート","歌が小さくなる"],
    ["mud_splash","泥はね","進行に泥がつく"]
  ];

  function Dsafe(v){
    try {
      if (typeof D === "function") return D(v);
      if (typeof Decimal !== "undefined") return new Decimal(v);
    } catch(e){}
    return v;
  }
  function fmt(v){
    try { if (typeof formatValue === "function") return formatValue(v); } catch(e){}
    try { return String(v); } catch(e){ return "?"; }
  }
  function energyAdd(v){
    try {
      if (typeof addEnergySafe === "function") { addEnergySafe(v); return; }
      if (window.game) window.game.energy = Dsafe(window.game.energy).add(Dsafe(v));
    } catch(e){}
  }
  function energySub(v){
    try {
      if (typeof subEnergySafe === "function") { subEnergySafe(v); return; }
      if (window.game && typeof decMax0 === "function") window.game.energy = decMax0(Dsafe(window.game.energy).sub(Dsafe(v)));
    } catch(e){}
  }
  function cpsW(sec){
    try {
      if (typeof cpsWorth === "function") return cpsWorth(sec);
      const cps = (typeof getTotalCps === "function") ? getTotalCps() : 1;
      return Dsafe(cps).mul(sec);
    } catch(e){ return Dsafe(1); }
  }
  function pct(p){
    try {
      if (typeof pctEnergy === "function") return pctEnergy(p);
      return Dsafe(window.game && window.game.energy || 0).mul(p);
    } catch(e){ return Dsafe(0); }
  }
  function buff(type, mul, dur, label){
    try { if (typeof addBuff === "function") addBuff(type, mul, dur, label); } catch(e){}
  }

  function applyKind(kind, i){
    // Deterministic-ish variety from index
    const n = i % 10;
    if (kind === "lucky") {
      if (n === 0) { const g=cpsW(10+ (i%8)); energyAdd(g); return "+"+fmt(g)+" E"; }
      if (n === 1) { buff("click", 1.6 + (i%5)*0.2, 12 + (i%8), "タップUP"); return "タップ一時アップ"; }
      if (n === 2) { buff("cps", 1.5 + (i%4)*0.2, 14 + (i%10), "CPS UP"); return "生産一時アップ"; }
      if (n === 3) { buff("speed", 1.4 + (i%3)*0.2, 12 + (i%6), "速度UP"); return "速度一時アップ"; }
      if (n === 4) { const g=pct(0.04 + (i%5)*0.01).add(cpsW(6)); energyAdd(g); return "+"+fmt(g)+" E"; }
      if (n === 5) { buff("click", 2.2, 10, "タップ x2.2"); buff("cps", 1.4, 10, "CPS x1.4"); return "調和アップ"; }
      if (n === 6) { const g=cpsW(16); energyAdd(g); buff("cps", 1.3, 16, "余韻生産"); return "+"+fmt(g)+" E"; }
      if (n === 7) { buff("click", 3.0, 8, "短時間会心"); return "短時間タップ x3"; }
      if (n === 8) { buff("speed", 1.8, 14, "早送り"); buff("click", 1.5, 14, "タップ x1.5"); return "早送りセット"; }
      const g=cpsW(8); energyAdd(g); buff("cps", 1.6, 18, "ライン好調"); return "+"+fmt(g)+" E / 生産UP";
    }
    if (n === 0) { const l=cpsW(5+(i%5)); energySub(l); return "-"+fmt(l)+" E"; }
    if (n === 1) { buff("click", 0.55, 10, "タップDOWN"); return "タップ一時ダウン"; }
    if (n === 2) { buff("cps", 0.6, 14, "CPS DOWN"); return "生産一時ダウン"; }
    if (n === 3) { buff("speed", 0.65, 12, "速度DOWN"); return "速度一時ダウン"; }
    if (n === 4) { const l=pct(0.03+(i%4)*0.01); energySub(l); return "-"+fmt(l)+" E"; }
    if (n === 5) { buff("click", 0.7, 12, "滑りタップ"); buff("speed", 0.8, 12, "粘り"); return "鈍化セット"; }
    if (n === 6) { const l=cpsW(8); energySub(l); return "-"+fmt(l)+" E"; }
    if (n === 7) { buff("cps", 0.45, 8, "詰まり"); return "短時間生産ダウン"; }
    if (n === 8) { buff("click", 0.4, 8, "しゃっくり"); return "短時間タップ減"; }
    const l=pct(0.02); energySub(l); buff("speed", 0.75, 10, "泥"); return "-"+fmt(l)+" E / 速度減";
  }

  function toEvent(row, kind, i){
    const id = "xpack_"+kind+"_"+row[0];
    return {
      id: id,
      kind: kind,
      title: row[1],
      desc: row[2],
      apply: function(){ return applyKind(kind, i); }
    };
  }

  const EXTRA_EVENTS = [];
  for (let i=0;i<LUCKY.length;i++) EXTRA_EVENTS.push(toEvent(LUCKY[i], "lucky", i));
  for (let i=0;i<UNLUCKY.length;i++) EXTRA_EVENTS.push(toEvent(UNLUCKY[i], "unlucky", i));

  const S = {
    dopamine: 0,
    pulses: 0,
    luckyP: 0,
    unluckyP: 0,
    orbs: 0,
    orbsCaught: 0,
    last: [],
    clearPct: 0,
    nextPulse: 7,
    acc: 0,
    running: true
  };
  window.OmegaPack = S;

  function pvLog(kind, title, result){
    S.pulses++;
    if (kind === "lucky") S.luckyP++; else S.unluckyP++;
    S.last.unshift((kind==="lucky"?"★ ":"▼ ")+title+(result?("  "+result):""));
    if (S.last.length > 6) S.last.length = 6;
    const el = document.getElementById("pv-log");
    if (el) el.textContent = S.last.join("  /  ");
    const n = document.getElementById("pv-pulses");
    if (n) n.textContent = String(S.pulses);
    miniToast(kind, title, result);
  }

  let lastBeep = 0, beepBusy = 0;
  function beep(kind){
    const now = performance.now();
    if (now - lastBeep < 80 || beepBusy >= 3) return;
    lastBeep = now;
    try {
      const bank = window.__AudioBank;
      if (bank && bank.play) {
        bank.play(kind === "unlucky" ? "unlucky" : kind === "lucky" ? "lucky" : "click", 1);
        return;
      }
    } catch(e){}
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = window.__evtAudioCtx || (window.__evtAudioCtx = new AC());
      if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = kind === "unlucky" ? "sawtooth" : "square";
      o.frequency.value = kind === "unlucky" ? 220 : kind === "lucky" ? 784 : 523;
      g.gain.value = 0.04;
      o.connect(g); g.connect(ctx.destination);
      beepBusy++;
      o.start();
      o.stop(ctx.currentTime + 0.09);
      o.onended = function(){ beepBusy = Math.max(0, beepBusy-1); };
    } catch(e){}
  }
  function fxRipple(kind, x, y){
    const layer = document.getElementById("pvOrbs");
    if (!layer || layer.childElementCount > 10) return;
    const r = document.createElement("div");
    r.className = "pv-ripple" + (kind==="unlucky"?" bad":"");
    r.style.left = x + "px"; r.style.top = y + "px";
    r.style.width = r.style.height = "26px";
    document.body.appendChild(r);
    setTimeout(function(){ if (r.parentNode) r.parentNode.removeChild(r); }, 560);
  }
  function fxFloat(text, kind, x, y){
    const n = document.querySelectorAll(".pv-float").length;
    if (n >= 6) return;
    const el = document.createElement("div");
    el.className = "pv-float" + (kind==="unlucky"?" bad":"");
    el.textContent = text;
    el.style.left = x + "px"; el.style.top = y + "px";
    document.body.appendChild(el);
    setTimeout(function(){ if (el.parentNode) el.parentNode.removeChild(el); }, 720);
  }
  function flashPlay(kind){
    const pv = document.getElementById("playView");
    if (!pv) return;
    pv.classList.remove("pv-flash","pv-flash-bad");
    void pv.offsetWidth;
    pv.classList.add(kind==="unlucky" ? "pv-flash-bad" : "pv-flash");
  }
  function miniToast(kind, title, result){
    const hub = document.getElementById("pvToast");
    if (!hub) return;
    while (hub.children.length > 2) hub.removeChild(hub.firstChild);
    const d = document.createElement("div");
    d.className = "pvt"+(kind==="unlucky"?" bad":"");
    d.textContent = title + (result ? " — "+result : "");
    hub.appendChild(d);
    setTimeout(function(){ if (d.parentNode) d.parentNode.removeChild(d); }, 2200);
  }

  function bumpDop(amt){
    S.dopamine = Math.max(0, Math.min(100, S.dopamine + amt));
    const i = document.getElementById("pv-dop-i");
    if (i) i.style.width = S.dopamine.toFixed(1)+"%";
    const v = document.getElementById("pv-dop-v");
    if (v) v.textContent = Math.round(S.dopamine)+"%";
  }

  function updateClear(){
    let pct = 0;
    try {
      const e = Dsafe(window.game && window.game.energy || 0);
      let log10 = 0;
      if (e && typeof e.log10 === "function") log10 = Number(e.log10());
      else if (e && e.e != null) log10 = e.e;
      pct = Math.max(0, Math.min(100, (log10 / 1000) * 100));
    } catch(e){}
    S.clearPct = pct;
    const i = document.getElementById("pv-clear-i");
    if (i) i.style.width = pct.toFixed(2)+"%";
    const v = document.getElementById("pv-clear-v");
    if (v) v.textContent = pct.toFixed(2)+"%";
  }

  S.lastPulseAt = 0;
  function firePulse(forceKind){
    const now = performance.now();
    if (!forceKind && S.lastPulseAt && now - S.lastPulseAt < 6500) return;
    S.lastPulseAt = now;
    const luckyChance = 0.62;
    const kind = forceKind || (Math.random() < luckyChance ? "lucky" : "unlucky");
    const pool = kind === "lucky" ? LUCKY : UNLUCKY;
    const i = (Math.random()*pool.length)|0;
    const row = pool[i];
    let result = "";
    try { result = applyKind(kind, i) || ""; } catch(e){}
    if (kind === "lucky") bumpDop(8 + Math.random()*6);
    else bumpDop(-(10 + Math.random()*8));
    pvLog(kind, row[1], result);
    beep(kind); flashPlay(kind);
    const core = document.getElementById("coreTrigger");
    if (core) {
      const r = core.getBoundingClientRect();
      fxRipple(kind, r.left+r.width/2, r.top+r.height/2);
      fxFloat(kind==="lucky"?"★":"▼", kind, r.left+r.width/2, r.top);
    }
    try { if (typeof renderBuffs === "function") renderBuffs(); } catch(e){}
    try { if (typeof refreshUI === "function") refreshUI(); } catch(e){}
  }

  function spawnOrb(kind){
    const layer = document.getElementById("pvOrbs");
    if (!layer) return;
    if (layer.childElementCount >= 6) return;
    const core = document.getElementById("coreTrigger");
    let x = window.innerWidth * (0.18 + Math.random()*0.28);
    let y = window.innerHeight * (0.28 + Math.random()*0.36);
    if (core) {
      const r = core.getBoundingClientRect();
      const ang = Math.random()*Math.PI*2;
      const rad = Math.max(r.width, 90) * (0.7 + Math.random()*0.55);
      x = r.left + r.width/2 + Math.cos(ang)*rad;
      y = r.top + r.height/2 + Math.sin(ang)*rad;
    }
    x = Math.max(24, Math.min(window.innerWidth-24, x));
    y = Math.max(24, Math.min(window.innerHeight-24, y));
    const el = document.createElement("button");
    el.type = "button";
    el.className = "pv-orb "+kind;
    el.style.left = x+"px";
    el.style.top = y+"px";
    el.setAttribute("aria-label", kind==="lucky"?"ラッキーオーブ":"アンラッキーオーブ");
    const life = setTimeout(function(){
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 4200);
    el.addEventListener("click", function(ev){
      ev.preventDefault(); ev.stopPropagation();
      clearTimeout(life);
      if (el.parentNode) el.parentNode.removeChild(el);
      S.orbsCaught++;
      const c = document.getElementById("pv-orbs");
      if (c) c.textContent = String(S.orbsCaught);
      const rr = el.getBoundingClientRect();
      fxRipple(kind, rr.left+rr.width/2, rr.top+rr.height/2);
      beep(kind); flashPlay(kind);
      if (kind === "lucky") {
        const g = cpsW(4); energyAdd(g); bumpDop(6);
        fxFloat("+"+fmt(g), "lucky", rr.left+rr.width/2, rr.top);
        pvLog("lucky", "オーブキャッチ", "+"+fmt(g)+" E");
      } else {
        const l = cpsW(3); energySub(l); bumpDop(-5);
        fxFloat("-"+fmt(l), "unlucky", rr.left+rr.width/2, rr.top);
        pvLog("unlucky", "ノイズオーブ", "-"+fmt(l)+" E");
      }
    }, {passive:false});
    layer.appendChild(el);
  }

  function mountUI(){
    if (document.getElementById("playView")) return;
    const hud = document.getElementById("effectHUD");
    const box = document.createElement("div");
    box.id = "playView";
    box.setAttribute("aria-label", "play view");
    box.innerHTML = ""
      + "<div class='pv-title'>PLAY VIEW <b>LIVE</b></div>"
      + "<div class='pv-row'><span>CLEARまで</span><span class='pv-val' id='pv-clear-v'>0%</span></div>"
      + "<div class='pv-bar' title='1e1000までの対数進捗'><i id='pv-clear-i'></i></div>"
      + "<div class='pv-row'><span>ドーパミン</span><span class='pv-val' id='pv-dop-v'>0%</span></div>"
      + "<div class='pv-dop'><i id='pv-dop-i'></i></div>"
      + "<div class='pv-row'><span>フィーバー</span><span class='pv-val' id='pv-fever'>Lv.1  XP 0/8</span></div>"
      + "<div class='pv-dop' title='フィーバー経験'><i id='pv-fever-i'></i></div>"
      + "<div class='pv-row'><span>ミッション</span><span class='pv-val' id='pv-mission'>コアを20回タップ</span></div>"
      + "<div class='pv-row'><span>クイズ</span><span class='pv-val' id='pv-quiz'>0勝 0敗</span></div>"
      + "<div class='pv-row'><span>フィーチャー</span><span class='pv-val' id='pv-pulses'>0</span></div>"
      + "<div class='pv-row'><span>オーブ</span><span class='pv-val' id='pv-orbs'>0</span></div>"
      + "<div class='pv-row'><span>AM / TS</span><span class='pv-val' id='pv-amts'>0 / 0</span></div>"
      + "<div class='pv-row'><span>レガシー</span><span class='pv-val' id='pv-legacy'>Lv.1</span></div>"
      + "<div class='pv-bar' title='長期ランク'><i id='pv-legacy-i'></i></div>"
      + "<div class='pv-row'><span>称号</span><span class='pv-val' id='pv-title'>新星見習い</span></div>"
      + "<div class='pv-row'><span>デイリー</span><span class='pv-val' id='pv-daily'>0 / 3</span></div>"
      + "<div class='pv-row'><span>図鑑</span><span class='pv-val' id='pv-codex'>0</span></div>"
      + "<div class='pv-row'><span>星座</span><span class='pv-val' id='pv-starsign'>0 / 12</span></div>"
      + "<div class='pv-row'><span>章</span><span class='pv-val' id='pv-chapter'>I はじまり</span></div>"
      + "<div class='pv-row'><span>週課題</span><span class='pv-val' id='pv-weekly'>—</span></div>"
      + "<div class='pv-row'><span>熟練</span><span class='pv-val' id='pv-mastery'>0</span></div>"
      + "<div class='pv-row'><span>遺物</span><span class='pv-val' id='pv-relics'>0 / 36</span></div>"
      + "<div class='pv-row'><span>研究</span><span class='pv-val' id='pv-research'>0</span></div>"
      + "<div class='pv-chipwrap' id='pv-bonus-chips'>"
      +   "<span class='pv-chip'>章</span>"
      +   "<span class='pv-chip'>週課題</span>"
      +   "<span class='pv-chip'>遺物</span>"
      + "</div>"
      + "<div class='pv-row'><span>ポイント案内</span><span class='pv-val' id='pv-points'>E / AM / TS / 研究</span></div>"
      + "<div class='pv-log' id='pv-log'>PLAY VIEW 待機中</div>";
    if (hud && hud.parentNode) hud.parentNode.insertBefore(box, hud.nextSibling);
    else {
      const left = document.querySelector(".column-left");
      if (left) left.appendChild(box);
      else document.body.appendChild(box);
    }
    if (!document.getElementById("pvOrbs")) {
      const o = document.createElement("div"); o.id="pvOrbs"; document.body.appendChild(o);
    }
    if (!document.getElementById("pvToast")) {
      const t = document.createElement("div"); t.id="pvToast"; document.body.appendChild(t);
    }
  }

  function appendEvents(){
    const arr = window.__GAME_EVENTS;
    if (!arr || !arr.push) return false;
    if (arr.__omegaPatched) return true;
    for (let i=0;i<EXTRA_EVENTS.length;i++) arr.push(EXTRA_EVENTS[i]);
    arr.__omegaPatched = true;
    return true;
  }

  function hookClicks(){
    document.addEventListener("pointerdown", function(e){
      const t = e.target;
      if (!t) return;
      if (t.id === "coreTrigger" || (t.closest && t.closest("#coreTrigger"))) {
        bumpDop(1.2);
        if (S.dopamine >= 88) bumpDop(-0.4);
        const coreEl = document.getElementById("coreTrigger");
        if (coreEl) {
          coreEl.classList.remove("pv-tap-pulse");
          void coreEl.offsetWidth;
          coreEl.classList.add("pv-tap-pulse");
        }
        if (Math.random() < 0.03) firePulse("lucky");
        else if (Math.random() < 0.012) firePulse("unlucky");
        if (Math.random() < 0.05) spawnOrb(Math.random()<0.72 ? "lucky" : "unlucky");
      }
    }, {capture:true, passive:true});
  }

  let last = performance.now();
  function loop(ts){
    const dt = Math.min(0.05, (ts-last)/1000);
    last = ts;
    S.acc += dt;
    S.nextPulse -= dt;
    if (S.dopamine > 0) S.dopamine = Math.max(0, S.dopamine - dt*1.15);
    if (S.acc >= 0.4) {
      S.acc = 0;
      updateClear();
      const i = document.getElementById("pv-dop-i");
      if (i) i.style.width = S.dopamine.toFixed(1)+"%";
      const v = document.getElementById("pv-dop-v");
      if (v) v.textContent = Math.round(S.dopamine)+"%";
    }
    if (S.nextPulse <= 0) {
      S.nextPulse = 14 + Math.random()*18;
      firePulse(Math.random() < 0.58 ? "lucky" : "unlucky");
      if (Math.random() < 0.28) spawnOrb(Math.random()<0.7?"lucky":"unlucky");
    }
    requestAnimationFrame(loop);
  }

  ready(function(){
    mountUI();
    hookClicks();
    let tries = 0;
    (function waitEv(){
      tries++;
      if (!appendEvents() && tries < 80) return setTimeout(waitEv, 50);
    })();
    // extra dopamine systems (cheap, no extra intervals)
    const missions = [
      ["コアを 20 回タップ", function(){ return (S.taps||0) >= 20; }, 20],
      ["オーブを 3 個キャッチ", function(){ return S.orbsCaught >= 3; }, 3],
      ["フィーチャー 5 回", function(){ return S.pulses >= 5; }, 5],
      ["コンボ 8 到達", function(){ return (window.EffectSystem && window.EffectSystem.combo >= 8); }, 8],
      ["CLEAR 0.1% 超え", function(){ return S.clearPct >= 0.1; }, 1]
    ];
    S.taps = 0; S.missionI = 0; S.missionDone = 0;
    document.addEventListener("pointerdown", function(e){
      const t2 = e.target;
      if (t2 && (t2.id === "coreTrigger" || (t2.closest && t2.closest("#coreTrigger")))) {
        S.taps++;
        if (S.taps % 25 === 0) { const g = cpsW(3); energyAdd(g); bumpDop(4); pvLog("lucky","タップボーナス","+"+fmt(g)+" E"); }
        const m = missions[S.missionI % missions.length];
        const lab = document.getElementById("pv-mission");
        if (lab) lab.textContent = m[0];
        if (m[1]()) {
          const g = cpsW(8); energyAdd(g);
          S.missionDone++; S.missionI++; S.taps = 0;
          bumpDop(12);
          pvLog("lucky","ミッションクリア","+"+fmt(g)+" E");
          if (lab) lab.textContent = missions[S.missionI % missions.length][0];
        }
      }
    }, {capture:true, passive:true});

    const _upd = updateClear;
    updateClear = function(){
      _upd();
      const amts = document.getElementById("pv-amts");
      if (amts && window.game) {
        try { amts.textContent = fmt(game.antimatter)+" / "+fmt(game.timeShards); } catch(e){}
      }
    };

    requestAnimationFrame(loop);
    updateClear();
  });
})();
