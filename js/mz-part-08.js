
window.__userGestured = window.__userGestured || false;
(function(){
  function mark(){
    if (window.__userGestured) return;
    window.__userGestured = true;
    try { if (window.SoundManager && window.SoundManager.ctx && window.SoundManager.ctx.resume) window.SoundManager.ctx.resume(); } catch(e){}
    try { if (window.__evtAudioCtx && window.__evtAudioCtx.resume) window.__evtAudioCtx.resume(); } catch(e){}
  }
  ["pointerdown","touchstart","click","keydown"].forEach(function(ev){
    document.addEventListener(ev, mark, {passive:true});
  });
})();
/* ===== RANDOM COSMIC EVENT ENGINE (LOW-DOM / MOBILE) ===== */
(function () {
  const UA = navigator.userAgent || "";
  const IS_GECKO = /Gecko\/|Firefox|Floorp|Waterfox|Goanna/i.test(UA) && !/Chrome\/|Chromium|Edg\//i.test(UA);
  const IS_MOBILE = (navigator.maxTouchPoints > 0 && Math.min(screen.width, screen.height) <= 920)
    || /Android|iPhone|iPad|iPod/i.test(UA);
  const LOW = IS_MOBILE || IS_GECKO || window.isLightweightMode || (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4);
  const EVT = { cooldown: 0, nextIn: 18 + Math.random() * 22, active: [], lastId: null, lastBuffHTML: "", busy: false, lastAt: 0, minGapMs: 9000 };
  window.__randomEventState = EVT;
  window.__perfFlags = { mobile: IS_MOBILE, low: LOW, fps: 60, worker: false };
  var ES = window.EffectSystem || {
    quality: "auto", combo: 0, comboAt: 0, events: 0, lucky: 0, hist: [], hudOn: true,
    shield: false, crits: 0, missionI: 0, missionCycle: 0, curMission: null,
    sessionTaps: 0, stars: 0, theme: 170, burstCd: 0, feverLv: 1, feverXp: 0
  };
  window.EffectSystem = ES;

  /* ---- background worker: audio PCM + event pick (no per-frame traffic) ---- */
  let fxWorker = null;
  try {
    const src = `
      self.onmessage = function(e){
        var d = e.data || {};
        if (d.cmd === "pick") {
          var n = d.n|0, last = d.last|0, i = 0, g = 0;
          do { i = (Math.random()*n)|0; g++; } while (n>1 && i===last && g<8);
          self.postMessage({cmd:"pick", i:i, salt:Math.random()});
        }
        if (d.cmd === "pcm") {
          var sr = d.sr|0 || 22050, len = (sr * 0.28)|0;
          var out = {};
          function tone(freqs, decay, typeN){
            var buf = new Float32Array(len);
            for (var t=0;t<len;t++){
              var x = t/sr, env = Math.exp(-x*decay), s = 0;
              for (var k=0;k<freqs.length;k++){
                var ph = 6.283185307179586*freqs[k]*x;
                s += (typeN===1 ? ((ph%6.283185307179586)<3.14159?0.22:-0.22) : Math.sin(ph)) * env;
              }
              buf[t] = s / freqs.length;
            }
            return buf;
          }
          out.click = tone([880,1320], 18, 1);
          out.lucky = tone([523,784,1046], 7, 0);
          out.unlucky = tone([392,247,196], 9, 1);
          out.mixed = tone([330,494,622], 8, 0);
          self.postMessage({cmd:"pcm", sr:sr, out:out});
        }
      };
    `;
    fxWorker = new Worker(URL.createObjectURL(new Blob([src], {type:"text/javascript"})));
    window.__perfFlags.worker = true;
  } catch (e) { fxWorker = null; }

  const AudioBank = {
    ctx: null,
    buf: Object.create(null),
    voices: 0,
    max: LOW ? 2 : 4,
    lastAt: 0,
    ctxOf() {
      try {
        if (!window.__userGestured) return this.ctx || null;
        const SM = window.SoundManager;
        if (SM && SM.init) SM.init();
        this.ctx = (SM && SM.ctx) || this.ctx || window.__evtAudioCtx;
        if (!this.ctx) {
          var AC = window.AudioContext||window.webkitAudioContext;
          if (AC) this.ctx = window.__evtAudioCtx = new AC();
        }
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume().catch(function(){});
      } catch (e) {}
      return this.ctx;
    },
    installPCM(sr, out) {
      const ac = this.ctxOf();
      if (!ac || !out) return;
      const names = Object.keys(out);
      for (let i=0;i<names.length;i++) {
        const f32 = out[names[i]];
        if (!f32 || !f32.length) continue;
        try {
          const b = ac.createBuffer(1, f32.length, sr);
          b.getChannelData(0).set(f32);
          this.buf[names[i]] = b;
        } catch (e) {}
      }
    },
    play(name, rate) {
      if (window.isLightweightMode) return;
      const nowp = performance.now();
      if (nowp - this.lastAt < (LOW ? 40 : 18)) return;
      this.lastAt = nowp;
      if (this.voices >= this.max) return;
      const ac = this.ctxOf();
      const b = this.buf[name];
      if (!ac) return;
      try {
        if (b) {
          const src = ac.createBufferSource();
          const g = ac.createGain();
          src.buffer = b;
          src.playbackRate.value = rate || (0.92 + Math.random()*0.16);
          g.gain.value = name === "click" ? 0.08 : 0.14;
          src.connect(g); g.connect(ac.destination);
          this.voices++;
          src.onended = () => { this.voices = Math.max(0, this.voices-1); };
          src.start();
        }
      } catch (e) {}
    }
  };
  window.__AudioBank = AudioBank;
  if (fxWorker) {
    fxWorker.onmessage = function(e){
      const d = e.data;
      if (!d) return;
      if (d.cmd === "pcm") AudioBank.installPCM(d.sr, d.out);
    };
    try { fxWorker.postMessage({cmd:"pcm", sr: 22050}); } catch (e) {}
  }

  let fpsEma = 60, fpsLast = performance.now();
  function noteFrame() {
    const t = performance.now();
    const dt = t - fpsLast;
    fpsLast = t;
    if (dt > 0 && dt < 250) fpsEma = fpsEma * 0.86 + (1000/dt) * 0.14;
    window.__perfFlags.fps = fpsEma;
    skipSpark = fpsEma < 38 || window.isLightweightMode;
    if (canvas) canvas.style.opacity = "1";
  }


  function nowSec() { return performance.now() / 1000; }

  /* ---- one cheap canvas for small FX + float text ---- */
  const canvas = document.getElementById("eventFxCanvas");
  let ctx = null;
  if (canvas) {
    try { ctx = canvas.getContext("2d", { alpha: true, desynchronized: true }); } catch (e) { ctx = null; }
    if (!ctx) { try { ctx = canvas.getContext("2d", { alpha: true }); } catch (e2) { ctx = null; } }
  }
  const POOL = 64;
  const fx = new Array(POOL);
  for (let i = 0; i < POOL; i++) fx[i] = { on:0, x:0, y:0, vx:0, vy:0, life:0, max:0, r:0, color:"#fff", kind:0, text:"" };
  let fxAlive = 0;
  let fxRunning = false;
  let canvasW = 0, canvasH = 0, dpr = 1;
  let frameBudget = 16;
  let skipSpark = false;

  function sizeCanvas() {
    if (!canvas || !ctx) return;
    dpr = 1;
    const w = window.innerWidth, h = window.innerHeight;
    if (w === canvasW && h === canvasH) return;
    canvasW = w; canvasH = h;
    canvas.width = Math.max(1, w);
    canvas.height = Math.max(1, h);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas, { passive: true });

  function grab() {
    for (let i = 0; i < POOL; i++) if (!fx[i].on) return fx[i];
    let worst = fx[0];
    for (let i = 1; i < POOL; i++) if (fx[i].life < worst.life) worst = fx[i];
    return worst;
  }

  function burst(x, y, kind) {
    if (!ctx || document.hidden) return;
    sizeCanvas();
    const isClick = kind === "click";
    if (isClick && skipSpark) {
      /* still show the +number; sparks only if frame is healthy */
    }
    const colors = kind === "unlucky" ? ["#ff0055","#ffffff","#ffea00"]
      : kind === "mixed" ? ["#9d4edd","#3a86ff","#ffffff"]
      : ["#ffea00","#00ffcc","#ffffff"];
    let n = isClick ? (skipSpark ? 0 : 6) : (LOW ? 16 : 28);
    if (fxAlive > 48) n = Math.min(n, 3);
    const spread = isClick ? 90 : 200;
    for (let i = 0; i < n; i++) {
      const p = grab();
      const ang = (Math.PI * 2 * i) / Math.max(n, 1) + Math.random() * 0.4;
      const spd = 50 + Math.random() * spread;
      const was = p.on;
      p.on = 1; p.kind = 0; p.text = "";
      p.x = x; p.y = y;
      p.vx = Math.cos(ang) * spd;
      p.vy = Math.sin(ang) * spd - (isClick ? 50 : 10);
      p.life = p.max = isClick ? 0.32 : 0.7;
      p.r = isClick ? 3 : 4;
      p.color = colors[i % colors.length];
      if (!was) fxAlive++;
    }
    if (!fxRunning) { fxRunning = true; lastFx = performance.now(); requestAnimationFrame(tickFx); }
  }

  function spawnText(x, y, text, color) {
    if (!ctx) return;
    sizeCanvas();
    const p = grab();
    const was = p.on;
    p.on = 1; p.kind = 1; p.text = text;
    p.x = x; p.y = y; p.vx = 0; p.vy = -70;
    p.life = p.max = 0.42; p.r = 0; p.color = color || "#00ffcc";
    if (!was) fxAlive++;
    if (!fxRunning) { fxRunning = true; lastFx = performance.now(); requestAnimationFrame(tickFx); }
  }

  let lastFx = performance.now();
  function tickFx(ts) {
    if (!ctx) { fxRunning = false; return; }
    const dt = Math.min(0.033, (ts - lastFx) / 1000);
    frameBudget = ts - lastFx;
    skipSpark = frameBudget > 22;
    lastFx = ts;
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 16px Consolas, system-ui, sans-serif";
    let alive = 0;
    for (let i = 0; i < POOL; i++) {
      const p = fx[i];
      if (!p.on) continue;
      p.life -= dt;
      if (p.life <= 0) { p.on = 0; continue; }
      alive++;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const a = p.life / p.max;
      ctx.globalAlpha = a;
      if (p.kind === 1) {
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        const s = p.r * (0.8 + a * 0.6);
        ctx.fillRect(p.x - s, p.y - s, s * 2, s * 2);
      }
    }
    ctx.globalAlpha = 1;
    fxAlive = alive;
    if (alive) requestAnimationFrame(tickFx);
    else fxRunning = false;
  }

  window.spawnParticleEffect = function(type, originX, originY) {
    if (window.isLightweightMode) return;
    burst(originX || window.innerWidth / 2, originY || window.innerHeight / 2, "click");
  };

  let lastPowKey = "";
  let lastPowStr = "+1";
  window.pingTapCore = function(str) {
    const coreEl = document.getElementById("coreTrigger");
    const ping = document.getElementById("tapPing");
    if (coreEl) {
      coreEl.classList.remove("tap-ack");
      requestAnimationFrame(function(){ coreEl.classList.add("tap-ack"); });
    }
    if (ping) {
      ping.textContent = str || "TAP";
      ping.classList.remove("show");
      requestAnimationFrame(function(){ ping.classList.add("show"); });
    }
  };
  window.spawnClickFloater = function(x, y, power) {
    let str;
    try {
      const key = power && power.toString ? power.toString() : String(power);
      if (key === lastPowKey) str = lastPowStr;
      else {
        lastPowKey = key;
        lastPowStr = "+" + (typeof formatValue === "function" ? formatValue(power) : key);
        str = lastPowStr;
      }
    } catch (e) { str = "+"; }
    window.pingTapCore(str);
    if (!skipSpark && fpsEma >= 32) spawnText(x, y, str, "#00ffcc");
    if (!window.isLightweightMode && !skipSpark && fpsEma >= 38) burst(x, y, "click");
  };

  let energyTouchAt = 0;
  const energyEl = document.getElementById("v-energy");
  window.touchEnergyReadout = function() {
    const now = performance.now();
    if (now - energyTouchAt < 32) return;
    energyTouchAt = now;
    try {
      if (energyEl) energyEl.textContent = formatValue(game.energy);
    } catch (e) {}
  };

  function cpsWorth(sec) {
    try {
      const cps = (typeof getTotalCps === "function") ? D(getTotalCps()) : D(0);
      const base = D(game && game.energy || 0);
      let amt = cps.mul(sec);
      if (amt.lte(0)) amt = D(Math.max(8, (game && game.totalClicks) || 8));
      if (base.gt(0) && amt.gt(base.mul(3))) amt = base.mul(0.35).add(amt.mul(0.05));
      return decMax0(amt);
    } catch (e) { return D(10); }
  }
  function addEnergySafe(v) { try { game.energy = D(game.energy).add(D(v)); } catch (e) {} }
  function subEnergySafe(v) { try { game.energy = decMax0(D(game.energy).sub(D(v))); } catch (e) {} }
  function pctEnergy(p) { try { return decMax0(D(game.energy).mul(p)); } catch (e) { return D(0); } }

  const EVENTS = [
    { id:"solar_flare", kind:"lucky", title:"ソーラーフレア", desc:"恒星風がコアに当たり、エネルギーが一気に噴き出した！",
      apply(){ const g=cpsWorth(12); addEnergySafe(g); return "+"+formatValue(g)+" E"; } },
    { id:"overclock", kind:"lucky", title:"コア過負荷", desc:"タップ出力が20秒間 3倍になる！",
      apply(){ addBuff("click", 3, 20, "タップ x3"); return "タップ x3 / 20秒"; } },
    { id:"factory_rush", kind:"lucky", title:"生産ラッシュ", desc:"全施設が25秒間 2倍で稼働する！",
      apply(){ addBuff("cps", 2, 25, "CPS x2"); return "CPS x2 / 25秒"; } },
    { id:"time_surge", kind:"lucky", title:"時間加速フィールド", desc:"宇宙の流れが20秒間 2倍速になる！",
      apply(){ addBuff("speed", 2, 20, "速度 x2"); return "ゲーム速度 x2 / 20秒"; } },
    { id:"lucky_star", kind:"lucky", title:"ラッキースター", desc:"現在エネルギーの一部が結晶化して還元された。",
      apply(){ const g=pctEnergy(0.18).add(cpsWorth(8)); addEnergySafe(g); return "+"+formatValue(g)+" E"; } },
    { id:"am_gift", kind:"lucky", title:"反物質の恵み", desc:"次元の隙間から反物質のかけらが落ちてきた。",
      apply(){ if ((game.prestigeAmCount||0)>0 || D(game.antimatter).gt(0)) { game.antimatter = D(game.antimatter).add(1); return "+1 AM"; } const g=cpsWorth(20); addEnergySafe(g); return "+"+formatValue(g)+" E"; } },
    { id:"shard_echo", kind:"lucky", title:"時間律の残響", desc:"過去の自分が未来へ破片を投げた。",
      apply(){ if ((game.prestigeTlCount||0)>0 || D(game.timeShards).gt(0)) { game.timeShards = D(game.timeShards).add(1); return "+1 TS"; } const g=cpsWorth(22); addEnergySafe(g); return "+"+formatValue(g)+" E"; } },
    { id:"crit_core", kind:"lucky", title:"クリティカルコア", desc:"12秒間、タップ威力が 5倍！",
      apply(){ addBuff("click", 5, 12, "タップ x5"); return "タップ x5 / 12秒"; } },
    { id:"harmony", kind:"lucky", title:"調和共振", desc:"タップと生産が同時に盛り上がる。",
      apply(){ addBuff("click", 1.8, 22, "タップ x1.8"); addBuff("cps", 1.8, 22, "CPS x1.8"); return "タップ&CPS x1.8 / 22秒"; } },
    { id:"gold_rain", kind:"lucky", title:"ゴールドレイン", desc:"エネルギーが金色の雨になって降り注いだ。",
      apply(){ const g=cpsWorth(18).add(pctEnergy(0.08)); addEnergySafe(g); return "+"+formatValue(g)+" E"; } },
    { id:"auto_boost", kind:"lucky", title:"自動回路ブースト", desc:"生産ラインが30秒間 2.5倍で回る！",
      apply(){ addBuff("cps", 2.5, 30, "CPS x2.5"); return "CPS x2.5 / 30秒"; } },
    { id:"galaxy_glint", kind:"lucky", title:"銀河のきらめき", desc:"遠くの銀河がこちらを見て微笑んだ。",
      apply(){ if ((game.galaxyNodes||0)>0) { game.galaxyNodes += 1; return "+1 GN"; } const g=cpsWorth(28); addEnergySafe(g); return "+"+formatValue(g)+" E"; } },
    { id:"double_tap", kind:"lucky", title:"ダブルインパルス", desc:"次の16秒、タップが 2.5倍。",
      apply(){ addBuff("click", 2.5, 16, "タップ x2.5"); return "タップ x2.5 / 16秒"; } },
    { id:"cache_hit", kind:"lucky", title:"キャッシュヒット", desc:"計算の端数がまとまって還元された。",
      apply(){ const g=cpsWorth(10).add(D(game.totalClicks||1).mul(2)); addEnergySafe(g); return "+"+formatValue(g)+" E"; } },
    { id:"speed_click", kind:"lucky", title:"光速タップ", desc:"速度とタップが同時に加速。",
      apply(){ addBuff("speed", 1.6, 16, "速度 x1.6"); addBuff("click", 2, 16, "タップ x2"); return "速度x1.6 & タップx2 / 16秒"; } },
    { id:"energy_leak", kind:"unlucky", title:"エネルギーリーク", desc:"配管からエネルギーが漏れた…",
      apply(){ const l=pctEnergy(0.08).add(cpsWorth(6)); subEnergySafe(l); return "-"+formatValue(l)+" E"; } },
    { id:"core_chill", kind:"unlucky", title:"コア冷却", desc:"コアが冷えてタップが15秒間 40%に低下。",
      apply(){ addBuff("click", 0.4, 15, "タップ x0.4"); return "タップ x0.4 / 15秒"; } },
    { id:"stall", kind:"unlucky", title:"生産停滞", desc:"施設が18秒間 半分の出力になる。",
      apply(){ addBuff("cps", 0.5, 18, "CPS x0.5"); return "CPS x0.5 / 18秒"; } },
    { id:"time_lag", kind:"unlucky", title:"時間遅延", desc:"時空が重くなり、15秒間 速度が半分。",
      apply(){ addBuff("speed", 0.5, 15, "速度 x0.5"); return "速度 x0.5 / 15秒"; } },
    { id:"short_circuit", kind:"unlucky", title:"ショート回路", desc:"回路が火花を散らしてエネルギーを失った。",
      apply(){ const l=cpsWorth(14).add(pctEnergy(0.05)); subEnergySafe(l); return "-"+formatValue(l)+" E"; } },
    { id:"noise_storm", kind:"unlucky", title:"ノイズストーム", desc:"観測ノイズで生産とタップが同時に鈍る。",
      apply(){ addBuff("cps", 0.65, 14, "CPS x0.65"); addBuff("click", 0.65, 14, "タップ x0.65"); return "CPS&タップ x0.65 / 14秒"; } },
    { id:"vacuum", kind:"unlucky", title:"真空ゆらぎ", desc:"真空がエネルギーを飲み込んだ。",
      apply(){ const l=pctEnergy(0.12); subEnergySafe(l); return "-"+formatValue(l)+" E"; } },
    { id:"overheat", kind:"unlucky", title:"過熱シャットダウン", desc:"安全装置が働き、全体が減速する。",
      apply(){ addBuff("speed", 0.6, 16, "速度 x0.6"); addBuff("cps", 0.7, 16, "CPS x0.7"); return "速度x0.6 & CPS x0.7 / 16秒"; } },
    { id:"miscalc", kind:"unlucky", title:"計算誤差", desc:"端数処理でエネルギーが消えた。",
      apply(){ const l=cpsWorth(8).add(pctEnergy(0.04)); subEnergySafe(l); return "-"+formatValue(l)+" E"; } },
    { id:"quantum", kind:"mixed", title:"量子ゆらぎ", desc:"観測するまで得か損かわからない。",
      apply(){ const amt = pctEnergy(0.10).add(cpsWorth(8)); if (Math.random() < 0.5) { addEnergySafe(amt); return "幸運側 +"+formatValue(amt)+" E"; } subEnergySafe(amt); return "不運側 -"+formatValue(amt)+" E"; } },
    { id:"observer", kind:"mixed", title:"観測者効果", desc:"見た瞬間に世界が少しだけ動いた。",
      apply(){ if (Math.random() < 0.55) { addBuff("cps", 1.4, 12, "CPS x1.4"); return "CPS x1.4 / 12秒"; } addBuff("cps", 0.75, 12, "CPS x0.75"); return "CPS x0.75 / 12秒"; } },
    { id:"chaos_pulse", kind:"mixed", title:"カオスパルス", desc:"予測不能のパルスがコアを揺らす。",
      apply(){ const roll = Math.random(); if (roll < 0.34) { addBuff("click", 2.2, 10, "タップ x2.2"); return "タップ x2.2 / 10秒"; } if (roll < 0.67) { addBuff("click", 0.5, 10, "タップ x0.5"); return "タップ x0.5 / 10秒"; } const g=cpsWorth(9); addEnergySafe(g); return "+"+formatValue(g)+" E"; } },
    { id:"echo_field", kind:"mixed", title:"エコーフィールド", desc:"速度が跳ねるが、生産は少し落ちる。",
      apply(){ addBuff("speed", 1.8, 14, "速度 x1.8"); addBuff("cps", 0.8, 14, "CPS x0.8"); return "速度x1.8 / CPS x0.8 / 14秒"; } },
    { id:"zero_point", kind:"mixed", title:"ゼロポイント", desc:"わずかなエネルギーと短い加速。",
      apply(){ const g=cpsWorth(5); addEnergySafe(g); addBuff("speed", 1.25, 10, "速度 x1.25"); return "+"+formatValue(g)+" E と速度x1.25"; } },
    { id:"mirror", kind:"mixed", title:"ミラーワールド", desc:"クリックは上がり、生産は下がる…あるいは逆。",
      apply(){ if (Math.random() < 0.5) { addBuff("click", 2, 15, "タップ x2"); addBuff("cps", 0.7, 15, "CPS x0.7"); return "タップx2 / CPS x0.7"; } addBuff("cps", 2, 15, "CPS x2"); addBuff("click", 0.7, 15, "タップ x0.7"); return "CPS x2 / タップ x0.7"; } },

    { id:"nova_bonus", kind:"lucky", title:"ミニノヴァ", desc:"小さな新星が弾ける。エネルギーがどっと増える！",
      apply(){ const g=cpsWorth(24).add(pctEnergy(0.10)); addEnergySafe(g); return "+"+formatValue(g)+" E"; } },
    { id:"tap_festival", kind:"lucky", title:"タップ祭", desc:"18秒間、タップが 4倍になる！",
      apply(){ addBuff("click", 4, 18, "タップ x4"); return "タップ x4 / 18秒"; } },
    { id:"line_overdrive", kind:"lucky", title:"ライン過回転", desc:"施設ラインが20秒間 3倍で回る！",
      apply(){ addBuff("cps", 3, 20, "CPS x3"); return "CPS x3 / 20秒"; } },
    { id:"chrono_dash", kind:"lucky", title:"クロノダッシュ", desc:"時間が圧縮され、14秒間 速度 2.5倍。",
      apply(){ addBuff("speed", 2.5, 14, "速度 x2.5"); return "速度 x2.5 / 14秒"; } },
    { id:"comet_catch", kind:"lucky", title:"彗星キャッチ", desc:"通り過ぎる彗星の尾をつかんだ。",
      apply(){ const g=cpsWorth(16).add(pctEnergy(0.06)); addEnergySafe(g); return "+"+formatValue(g)+" E"; } },
    { id:"blueprint_find", kind:"lucky", title:"設計図発見", desc:"古い設計図のおかげで生産が伸びる。",
      apply(){ addBuff("cps", 1.7, 28, "CPS x1.7"); const g=cpsWorth(7); addEnergySafe(g); return "CPS x1.7 / 28秒 と +"+formatValue(g)+" E"; } },
    { id:"spark_chain", kind:"lucky", title:"スパーク連鎖", desc:"タップの火花が連鎖して威力アップ。",
      apply(){ addBuff("click", 3.2, 14, "タップ x3.2"); return "タップ x3.2 / 14秒"; } },
    { id:"orbit_align", kind:"lucky", title:"軌道整列", desc:"惑星が一直線。全体が少し加速する。",
      apply(){ addBuff("speed", 1.5, 24, "速度 x1.5"); addBuff("cps", 1.5, 24, "CPS x1.5"); return "速度&CPS x1.5 / 24秒"; } },
    { id:"gift_capsule", kind:"lucky", title:"ギフトカプセル", desc:"宇宙郵便がエネルギーを届けた。",
      apply(){ const g=cpsWorth(30); addEnergySafe(g); return "+"+formatValue(g)+" E"; } },
    { id:"prism_core", kind:"lucky", title:"プリズムコア", desc:"光が分かれてタップが輝く。",
      apply(){ addBuff("click", 2.8, 20, "タップ x2.8"); return "タップ x2.8 / 20秒"; } },
    { id:"stellar_wind", kind:"lucky", title:"恒星風加速", desc:"風に乗って生産が伸びる。",
      apply(){ addBuff("cps", 2.2, 18, "CPS x2.2"); return "CPS x2.2 / 18秒"; } },
    { id:"jackpot_tick", kind:"lucky", title:"ジャックポット", desc:"端数が大当たりになった！",
      apply(){ const g=pctEnergy(0.22).add(cpsWorth(12)); addEnergySafe(g); return "+"+formatValue(g)+" E"; } },
    { id:"aurora_boost", kind:"lucky", title:"オーロラブースト", desc:"空が光って、速度とタップが上がる。",
      apply(){ addBuff("speed", 1.7, 18, "速度 x1.7"); addBuff("click", 1.7, 18, "タップ x1.7"); return "速度&タップ x1.7 / 18秒"; } },

    { id:"dust_jam", kind:"unlucky", title:"宇宙塵詰まり", desc:"フィルターが詰まってエネルギーが減った。",
      apply(){ const l=pctEnergy(0.07).add(cpsWorth(5)); subEnergySafe(l); return "-"+formatValue(l)+" E"; } },
    { id:"soft_lock", kind:"unlucky", title:"ソフトロック", desc:"入力が重くなり、タップが12秒間 30%に。",
      apply(){ addBuff("click", 0.3, 12, "タップ x0.3"); return "タップ x0.3 / 12秒"; } },
    { id:"brownout", kind:"unlucky", title:"電圧低下", desc:"供給が落ちて生産が20秒間 40%に。",
      apply(){ addBuff("cps", 0.4, 20, "CPS x0.4"); return "CPS x0.4 / 20秒"; } },
    { id:"time_drag", kind:"unlucky", title:"時間の粘り", desc:"秒が伸びて、速度が18秒間 40%に。",
      apply(){ addBuff("speed", 0.4, 18, "速度 x0.4"); return "速度 x0.4 / 18秒"; } },
    { id:"coolant_spill", kind:"unlucky", title:"冷却漏れ", desc:"冷えて全体が鈍る。",
      apply(){ addBuff("click", 0.55, 16, "タップ x0.55"); addBuff("speed", 0.7, 16, "速度 x0.7"); return "タップx0.55 & 速度x0.7 / 16秒"; } },
    { id:"packet_loss", kind:"unlucky", title:"パケットロス", desc:"データが欠けてエネルギーが消えた。",
      apply(){ const l=pctEnergy(0.09); subEnergySafe(l); return "-"+formatValue(l)+" E"; } },
    { id:"idle_drift", kind:"unlucky", title:"アイドルドリフト", desc:"施設がぼんやりして生産ダウン。",
      apply(){ addBuff("cps", 0.6, 22, "CPS x0.6"); return "CPS x0.6 / 22秒"; } },
    { id:"fog_delay", kind:"unlucky", title:"時空フォグ", desc:"視界がにじんで速度が落ちる。",
      apply(){ addBuff("speed", 0.55, 20, "速度 x0.55"); return "速度 x0.55 / 20秒"; } },
    { id:"core_stutter", kind:"unlucky", title:"コアの吃音", desc:"タップが途切れて弱くなる。",
      apply(){ addBuff("click", 0.5, 18, "タップ x0.5"); return "タップ x0.5 / 18秒"; } },

    { id:"coin_flip", kind:"mixed", title:"コインフリップ", desc:"表なら増える。裏なら減る。",
      apply(){ const amt=pctEnergy(0.08).add(cpsWorth(6)); if (Math.random()<0.5){ addEnergySafe(amt); return "表 +"+formatValue(amt)+" E"; } subEnergySafe(amt); return "裏 -"+formatValue(amt)+" E"; } },
    { id:"trade_off", kind:"mixed", title:"トレードオフ", desc:"速度を上げて、タップを下げる。",
      apply(){ addBuff("speed", 2.2, 14, "速度 x2.2"); addBuff("click", 0.6, 14, "タップ x0.6"); return "速度x2.2 / タップx0.6 / 14秒"; } },
    { id:"overdraw", kind:"mixed", title:"オーバードロー", desc:"今たくさんもらって、少し生産が落ちる。",
      apply(){ const g=cpsWorth(20); addEnergySafe(g); addBuff("cps", 0.75, 16, "CPS x0.75"); return "+"+formatValue(g)+" E と CPS x0.75 / 16秒"; } },
    { id:"focus_mode", kind:"mixed", title:"フォーカスモード", desc:"タップは強い。全体速度は遅い。",
      apply(){ addBuff("click", 3, 15, "タップ x3"); addBuff("speed", 0.65, 15, "速度 x0.65"); return "タップx3 / 速度x0.65 / 15秒"; } },
    { id:"scatter", kind:"mixed", title:"スキャッター", desc:"生産は上がるが、タップが散らばる。",
      apply(){ addBuff("cps", 2.4, 15, "CPS x2.4"); addBuff("click", 0.55, 15, "タップ x0.55"); return "CPS x2.4 / タップ x0.55 / 15秒"; } },
    { id:"glitch_box", kind:"mixed", title:"グリッチボックス", desc:"中身は開けるまで不明。",
      apply(){ const r=Math.random(); if(r<0.33){ addBuff("cps", 2, 12, "CPS x2"); return "中身: CPS x2 / 12秒"; } if(r<0.66){ addBuff("cps", 0.6, 12, "CPS x0.6"); return "中身: CPS x0.6 / 12秒"; } const g=cpsWorth(13); addEnergySafe(g); return "中身: +"+formatValue(g)+" E"; } },
    { id:"pendulum", kind:"mixed", title:"振り子", desc:"速くなったり遅くなったりする前触れ。",
      apply(){ if (Math.random()<0.5){ addBuff("speed", 2, 12, "速度 x2"); return "加速側 速度 x2 / 12秒"; } addBuff("speed", 0.5, 12, "速度 x0.5"); return "減速側 速度 x0.5 / 12秒"; } },
    { id:"recycle", kind:"mixed", title:"リサイクル", desc:"少し失って、そのあと生産が上がる。",
      apply(){ const l=pctEnergy(0.05); subEnergySafe(l); addBuff("cps", 1.9, 20, "CPS x1.9"); return "-"+formatValue(l)+" E と CPS x1.9 / 20秒"; } }
  ];
  // Extra events are appended by Omega Feature Pack (see tail). Keep array mutable.
  try { window.__GAME_EVENTS = EVENTS; } catch(e) {}


  function addBuff(type, mul, dur, label) {
    EVT.active.push({ type, mul, until: nowSec() + dur, label });
    if (EVT.active.length > 8) EVT.active.splice(0, EVT.active.length - 8);
    renderBuffs();
  }
  function liveMult(type) {
    const t = nowSec();
    let m = 1;
    EVT.active = EVT.active.filter(function(b){ return b.until > t; });
    for (let i=0;i<EVT.active.length;i++) if (EVT.active[i].type === type) m *= EVT.active[i].mul;
    return m;
  }
  window.__eventLiveMult = liveMult;

  const buffBar = document.getElementById("eventBuffBar");
  function renderBuffs() {
    if (!buffBar) return;
    const t = nowSec();
    EVT.active = EVT.active.filter(function(b){ return b.until > t; });
    let html = "";
    for (let i=0;i<EVT.active.length;i++) {
      const b = EVT.active[i];
      const kind = b.mul >= 1 ? "lucky" : "unlucky";
      html += '<div class="event-buff-chip '+kind+'">'+b.label+'　残り '+Math.max(0, b.until - t).toFixed(0)+'s</div>';
    }
    if (html !== EVT.lastBuffHTML) { buffBar.innerHTML = html; EVT.lastBuffHTML = html; }
  }

  function playEventSound(kind) {
    const name = kind === "unlucky" ? "unlucky" : kind === "mixed" ? "mixed" : "lucky";
    AudioBank.play(name, 0.94 + Math.random()*0.14);
    if (!AudioBank.buf[name]) {
      try {
        const ac = AudioBank.ctxOf();
        if (!ac) return;
        const now = ac.currentTime;
        const notes = kind === "unlucky" ? [392, 247] : kind === "mixed" ? [330, 494] : [523, 784, 1046];
        for (let i=0;i<notes.length;i++) {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.type = "square";
          o.frequency.value = notes[i] * (0.96 + Math.random()*0.08);
          g.gain.setValueAtTime(0.0001, now + i*0.05);
          g.gain.exponentialRampToValueAtTime(0.07, now + i*0.05 + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, now + i*0.05 + 0.22);
          o.connect(g); g.connect(ac.destination);
          o.start(now + i*0.05); o.stop(now + i*0.05 + 0.24);
        }
      } catch(e){}
    }
  }

  const overlay = document.getElementById("eventOverlay");
  const ring = document.getElementById("eventFlashRing");
  const card = document.getElementById("eventCard");
  const kick = document.getElementById("eventKicker");
  const title = document.getElementById("eventTitle");
  const desc = document.getElementById("eventDesc");
  const resultEl = document.getElementById("eventResult");
  const stamp = document.getElementById("eventStamp");
  const core = document.getElementById("coreTrigger");

  const STAMP = {
    lucky: ["LUCKY!!","JACKPOT!","NICE!!","BINGO!","GREAT!"],
    unlucky: ["UNLUCKY","OOPS...","DROP","SLOW...","MISS"],
    mixed: ["TWIST!","CHAOS","???","SHIFT","WILD"]
  };
  const KICK = {
    lucky: ["★ LUCKY EVENT ★","★ BONUS WAVE ★","★ CORE GIFT ★"],
    unlucky: ["▼ UNLUCKY EVENT ▼","▼ SYSTEM HIT ▼","▼ DRAIN ▼"],
    mixed: ["◆ MIXED EVENT ◆","◆ GLITCH ◆","◆ SWAP ◆"]
  };
  function showEventAnim(ev, resultText) {
    if (!overlay || !card) return;
    const kind = ev.kind || "mixed";
    const variant = "v" + (1 + ((Math.random()*4)|0));
    overlay.className = kind + " show " + variant;
    if (ring) ring.className = "event-flash-ring " + kind;
    card.className = "event-card " + kind;
    const kicks = KICK[kind] || KICK.mixed;
    const stamps = STAMP[kind] || STAMP.mixed;
    if (kick) kick.textContent = kicks[(Math.random()*kicks.length)|0];
    if (stamp) { stamp.style.visibility = 'visible'; stamp.textContent = stamps[(Math.random()*stamps.length)|0]; }
    if (title) title.textContent = ev.title;
    if (desc) desc.textContent = ev.desc;
    if (resultEl) resultEl.textContent = resultText || "";
    if (core && fpsEma >= 30) {
      core.classList.remove("event-core-boom");
      core.classList.add("event-core-boom");
    }
    if (fpsEma >= 28) burst(window.innerWidth * 0.5, window.innerHeight * 0.46, kind);
    clearTimeout(overlay._tid);
    overlay._tid = setTimeout(function(){
      overlay.classList.remove("show");
      if (stamp) { stamp.textContent = ""; stamp.style.visibility = "hidden"; }
    }, 3700);
  }

  function triggerRandomEvent(forceId) {
    const wall = performance.now();
    if (EVT.busy) return;
    if (!forceId) {
      if (EVT.cooldown > 0) return;
      if (EVT.lastAt && (wall - EVT.lastAt) < (EVT.minGapMs || 9000)) return;
      if (overlay && overlay.classList.contains("show")) return;
    }
    EVT.busy = true;
    let pool = EVENTS;
    if (EVT.lastId) {
      pool = [];
      for (let i=0;i<EVENTS.length;i++) if (EVENTS[i].id !== EVT.lastId) pool.push(EVENTS[i]);
    }
    if (!pool || !pool.length) pool = EVENTS;
    const ev = forceId ? (EVENTS.find(function(e){ return e.id===forceId; }) || pool[0]) : pool[(Math.random()*pool.length)|0];
    if (!ev) { EVT.busy = false; EVT.cooldown = 8; EVT.nextIn = 20; return; }
    EVT.lastId = ev.id;
    EVT.lastAt = wall;
    let result = "";
    try {
      if (window.EffectSystem && ES.shield && ev.kind === "unlucky") {
        ES.shield = false;
        result = "シールドで無効化！";
        const sl = document.getElementById("sk-shield");
        if (sl) sl.style.borderColor = "rgba(0,255,204,.35)";
      } else {
        result = ev.apply() || "";
      }
    } catch(e) {}
    try {
      showEventAnim(ev, result);
      playEventSound(ev.kind);
      if (typeof pushHist === 'function') pushHist(ev, result);
      if (typeof checkMission === 'function') checkMission();
      const color = ev.kind === "unlucky" ? "var(--color-antimatter)" : ev.kind === "mixed" ? "var(--color-timeline)" : "var(--color-upgrade)";
      if (typeof createToast === "function") createToast(ev.title, result || ev.desc);
      if (typeof pushLog === "function") pushLog("イベント："+ev.title+" — "+(result || ev.desc), color);
      try { if (typeof refreshUI === "function") refreshUI(); } catch(e){}
      renderBuffs();
    } finally {
      EVT.cooldown = forceId ? 6 : 14;
      EVT.nextIn = 28 + Math.random() * 40;
      EVT.busy = false;
    }
  }
  window.triggerRandomEvent = triggerRandomEvent;

  function wrapFn(name, type) {
    const orig = window[name];
    if (typeof orig !== "function") return;
    window[name] = function() {
      const v = orig.apply(this, arguments);
      const m = liveMult(type);
      if (m === 1) return v;
      try {
        if (v && typeof v.mul === "function") return v.mul(m);
        if (typeof v === "number") return v * m;
      } catch(e){}
      return v;
    };
  }
  function tryWrap() {
    wrapFn("getTotalCps", "cps");
    wrapFn("getClickPower", "click");
    wrapFn("getGameSpeedMultiplier", "speed");
  }
  tryWrap();
  setTimeout(tryWrap, 400);

  /* イベント時計は実時間。ゲーム速度(時間律)に乗せると毎フレーム発火する */
  let buffAcc = 0;
  let evtWallPrev = performance.now();
  function onTick(_gameDt) {
    const wall = performance.now();
    const dt = Math.min(0.05, Math.max(0, (wall - evtWallPrev) / 1000));
    evtWallPrev = wall;
    noteFrame();
    if (typeof tickSkills === "function") tickSkills(dt);
    if (ES.burstCd > 0) ES.burstCd = Math.max(0, ES.burstCd - dt);
    hudAcc += dt;
    if (hudAcc >= 0.5) { hudAcc = 0; if (ehFps) ehFps.textContent = String(Math.round(fpsEma)); if (ES.quality === 'auto') applyQuality('auto'); }
    if (document.hidden) return;
    if (EVT.cooldown > 0) EVT.cooldown = Math.max(0, EVT.cooldown - dt);
    EVT.nextIn -= dt;
    buffAcc += dt;
    if (buffAcc >= 0.4) { buffAcc = 0; if (EVT.active.length) renderBuffs(); }
    if (EVT.nextIn <= 0 && EVT.cooldown <= 0 && !EVT.busy) triggerRandomEvent();
  }
  window.__skillCd = window.__skillCd || { fever: 0, shield: 0, call: 0 };
  function startEvtLoop(){
    if (!window.game) { setTimeout(startEvtLoop, 60); return; }
    if (window.__evtLoopOn) return;
    window.__evtLoopOn = true;
    if (window.ModAPI && window.ModAPI.hooks && Array.isArray(window.ModAPI.hooks.onTick)) {
      window.ModAPI.hooks.onTick.push(onTick);
    } else {
      let last = performance.now();
      (function loop(ts){
        onTick(Math.min(0.25, (ts-last)/1000));
        last = ts;
        requestAnimationFrame(loop);
      })(last);
    }
  }
  if (document.readyState === "complete") setTimeout(startEvtLoop, 0);
  else window.addEventListener("load", startEvtLoop);

  document.addEventListener("click", function(e){
    const t = e.target;
    if (!t) return;
    if (t.id === "coreTrigger" || (t.closest && t.closest("#coreTrigger"))) {
      const now = performance.now();
      ES.combo = (now - ES.comboAt < 420) ? (ES.combo + 1) : 1;
      ES.comboAt = now;
      showCombo(ES.combo);
      if (EVT.cooldown <= 0 && !EVT.busy && Math.random() < 0.008) triggerRandomEvent();
    }
  }, { capture: true, passive: true });


 /* ===== 本格 EFFECT SYSTEM ===== */
  ES.quality = ES.quality || "auto";
  ES.combo = ES.combo || 0;
  ES.comboAt = ES.comboAt || 0;
  ES.events = ES.events || 0;
  ES.lucky = ES.lucky || 0;
  ES.hist = ES.hist || [];
  if (ES.hudOn == null) ES.hudOn = true;
  window.EffectSystem = ES;
  const qOrder = ["auto","high","mid","low"];
  function applyQuality(q) {
    ES.quality = q;
    const forceLow = q === "low" || (q === "auto" && fpsEma < 36);
    const forceMid = q === "mid" || (q === "auto" && fpsEma < 50);
    skipSpark = forceLow || window.isLightweightMode;
    // 重複していた2行目を削除しました
    AudioBank.max = forceLow ? 1 : forceMid ? 2 : 4;
    const el = document.getElementById("eh-quality");
    if (el) el.textContent = q.toUpperCase();
  }
  function pushHist(ev, result) {
    ES.events++;
    if (ev.kind === "lucky") ES.lucky++;
    // インデント・空白に含まれていた全角スペースを半角に修正しました
    ES.hist.unshift((ev.kind === "lucky" ? "★ " : ev.kind === "unlucky" ? "▼ " : "◆ ") + ev.title + (result ? "  " + result : ""));
    if (ES.hist.length > 8) ES.hist.length = 8;
    const h = document.getElementById("eh-hist");
    const n = document.getElementById("eh-events");
    if (h) h.textContent = ES.hist.join("  /  ");
    if (n) n.textContent = String(ES.events);
  }
  function showCombo(n) {
    const c = document.getElementById("eh-combo");
    if (c) c.textContent = String(n);
    let hue = 170;
    if (n >= 40) hue = (n * 13) % 360;
    else if (n >= 20) hue = 300;
    else if (n >= 10) hue = 48;
    else if (n >= 5) hue = 25;
    document.documentElement.style.setProperty("--combo-hue", String(hue));
    if (core) {
      core.style.setProperty("--combo-hue", String(hue));
      if (n >= 10) core.classList.add("combo-hot");
      else core.classList.remove("combo-hot");
    }
    const evn = document.getElementById("v-energy");
    if (evn && fpsEma >= 32 && n > 1) {
      evn.classList.remove("fx-pop");
      evn.classList.add("fx-pop");
    }
  }
  const qbtn = document.getElementById("eh-qbtn");
  const hbtn = document.getElementById("eh-hudbtn");
  if (qbtn) qbtn.onclick = function(){
    const i = (qOrder.indexOf(ES.quality)+1) % qOrder.length;
    applyQuality(qOrder[i]);
  };
  if (hbtn) hbtn.onclick = function(){
    const hud = document.getElementById("effectHUD");
    if (!hud) return;
    ES.hudOn = !ES.hudOn;
    hud.style.display = ES.hudOn ? "block" : "none";
  };


  ES.shield = false;
  ES.crits = 0;
  ES.missionI = 0;
  ES.missionCycle = 0;
  ES.curMission = null;
  function makeMission() {
    ES.missionCycle++;
    const lv = ES.missionCycle;
    const clicks = (game && game.totalClicks) || 0;
    const kinds = ["taps","combo","events","crits","energy"];
    const kind = kinds[(lv - 1) % kinds.length];
    if (kind === "taps") {
      const need = 20 + lv * 10;
      return { kind, need, start: clicks, label: "コアを " + need + " 回タップする", sec: 10 + lv };
    }
    if (kind === "combo") {
      const need = Math.min(8 + lv, 40);
      return { kind, need, start: 0, label: "コンボを " + need + " まで伸ばす", sec: 12 + lv };
    }
    if (kind === "events") {
      const need = 1 + Math.floor(lv / 4);
      return { kind, need, start: ES.events || 0, label: "イベントを " + need + " 回見る", sec: 14 + lv };
    }
    if (kind === "crits") {
      const need = 2 + Math.floor(lv / 3);
      return { kind, need, start: ES.crits || 0, label: "CRIT を " + need + " 回出す", sec: 14 + lv };
    }
    return { kind: "energy", need: 1, start: 0, label: "エネルギーをためてミッション報酬を受け取る", sec: 16 + lv };
  }
  ES.curMission = null;
  const RANKS = [
    [0,"見習いコア"],[50,"点火コア"],[200,"恒星コア"],[800,"銀河コア"],
    [2500,"準星コア"],[8000,"特異コア"],[20000,"無限コア"],[60000,"終焉核"]
  ];
  function updateRank() {
    const clicks = (game && game.totalClicks) || 0;
    let name = RANKS[0][1];
    for (let i=0;i<RANKS.length;i++) if (clicks >= RANKS[i][0]) name = RANKS[i][1];
    const el = document.getElementById("coreRank");
    if (el) el.textContent = "RANK " + name;
  }
  var cd = window.__skillCd || (window.__skillCd = { fever: 0, shield: 0, call: 0 });
  function setCdLab(id, sec) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = sec > 0 ? Math.ceil(sec) + "s" : "準備OK";
  }
  function useSkill(name) {
    if (cd[name] > 0) return;
    if (name === "fever") {
      const lv = Math.max(1, Math.min(30, Number((window.EffectSystem && ES.feverLv) || 1) || 1));
      const mul = Math.round((2.4 + lv * 0.22) * 10) / 10;
      const dur = 16 + Math.min(24, lv);
      const spd = Math.round((1.25 + Math.min(0.9, lv * 0.04)) * 100) / 100;
      addBuff("click", mul, dur, "フィーバーLv" + lv + " x" + mul);
      addBuff("speed", spd, dur, "フィーバー速度");
      cd.fever = Math.max(32, 74 - lv * 2);
      const lab = document.querySelector("#sk-fever");
      if (lab) {
        const cdEl = document.getElementById("sk-fever-cd");
        lab.innerHTML = "フィーバー Lv." + lv + (cdEl ? cdEl.outerHTML : "");
      }
      if (typeof createToast === "function") createToast("フィーバー Lv." + lv, dur + "秒間 タップ x" + mul);
      AudioBank.play("lucky", 1.1);
      try { if (window.OmegaPack && OmegaPack.onFeverUse) OmegaPack.onFeverUse(lv); } catch(e){}
    } else if (name === "shield") {
      ES.shield = true;
      cd.shield = 55;
      const sl = document.getElementById("sk-shield");
      if (sl) sl.style.borderColor = "#ffea00";
      if (typeof createToast === "function") createToast("シールド", "次のアンラッキーを1回防ぐ");
      AudioBank.play("mixed", 1);
    } else if (name === "call") {
      cd.call = 90;
      const lucky = EVENTS.filter(function(e){ return e.kind === "lucky"; });
      const ev = lucky[(Math.random()*lucky.length)|0];
      triggerRandomEvent(ev.id);
    }
    const btn = document.getElementById("sk-" + name);
    if (btn) btn.disabled = true;
  }
  const bf = document.getElementById("sk-fever");
  const bs = document.getElementById("sk-shield");
  const bc = document.getElementById("sk-call");
  if (bf) bf.onclick = function(){ useSkill("fever"); };
  if (bs) bs.onclick = function(){ useSkill("shield"); };
  if (bc) bc.onclick = function(){ useSkill("call"); };
  ES.sessionTaps = 0;
  ES.stars = 0;
  ES.theme = 170;
  ES.burstCd = 0;
  const th = document.getElementById("sk-theme");
  const br = document.getElementById("sk-burst");
  if (th) th.onclick = function(){
    ES.theme = (ES.theme + 55) % 360;
    document.documentElement.style.setProperty("--combo-hue", String(ES.theme));
    if (core) core.style.setProperty("--combo-hue", String(ES.theme));
  };
  if (br) br.onclick = function(){
    if (ES.burstCd > 0) return;
    ES.burstCd = 40;
    let n = 0;
    const t = setInterval(function(){
      n++;
      const fn = window.handleCoreClick;
      if (typeof fn === "function") fn(null);
      if (n >= 8) clearInterval(t);
    }, 70);
    if (typeof createToast === "function") createToast("バースト", "8連タップ！");
  };

  function tickSkills(dt) {
    var cd = window.__skillCd; if (!cd) return;
    ["fever","shield","call"].forEach(function(k){
      if (cd[k] > 0) {
        cd[k] = Math.max(0, cd[k] - dt);
        setCdLab("sk-" + k + "-cd", cd[k]);
        const btn = document.getElementById("sk-" + k);
        if (btn && cd[k] <= 0) btn.disabled = false;
      }
    });
  }

  function missionProgress(m) {
    if (!m) return 0;
    if (m.kind === "taps") return Math.max(0, ((game && game.totalClicks) || 0) - m.start);
    if (m.kind === "combo") return ES.combo || 0;
    if (m.kind === "events") return Math.max(0, (ES.events || 0) - m.start);
    if (m.kind === "crits") return Math.max(0, (ES.crits || 0) - m.start);
    if (m.kind === "energy") return 1;
    return 0;
  }
  function paintMission() {
    if (!ES.curMission) ES.curMission = makeMission();
    const m = ES.curMission;
    const now = missionProgress(m);
    const box = document.getElementById("missionText");
    const hudm = document.getElementById("eh-mission");
    const txt = m.label + "  (" + Math.min(now, m.need) + "/" + m.need + ")";
    if (box) box.textContent = txt;
    if (hudm) hudm.textContent = Math.min(now, m.need) + "/" + m.need;
  }
  function checkMission() {
    if (!ES.curMission) ES.curMission = makeMission();
    paintMission();
    const m = ES.curMission;
    if (missionProgress(m) >= m.need) {
      const g = (typeof cpsWorth === "function") ? cpsWorth(Math.min(90, m.sec || 16)) : 50;
      try { game.energy = D(game.energy).add(g); } catch(e) {}
      if (typeof createToast === "function") createToast("ミッション達成 #" + ES.missionCycle, m.label + "  +" + (typeof formatValue==="function"?formatValue(g):g) + " E");
      const box = document.getElementById("missionBox");
      if (box) { box.classList.remove("done-flash"); box.classList.add("done-flash"); }
      AudioBank.play("lucky", 1.05);
      ES.curMission = makeMission();
      paintMission();
    }
    updateRank();
  }

  const origClickFn = window.handleCoreClick;
  if (typeof origClickFn === "function" && !window.__critWrapped) {
    window.handleCoreClick = function(e) {
      origClickFn(e);
      if (Math.random() < 0.09) {
        try {
          const bonus = (typeof getClickPower === "function") ? D(getClickPower()).mul(2) : D(2);
          game.energy = D(game.energy).add(bonus);
          ES.crits++;
          const ce = document.getElementById("eh-crit");
          if (ce) ce.textContent = String(ES.crits);
          if (typeof pingTapCore === "function") pingTapCore("CRIT +" + (typeof formatValue==="function"?formatValue(bonus):""));
          AudioBank.play("lucky", 1.2);
        } catch (err) {}
      }
      ES.sessionTaps = (ES.sessionTaps || 0) + 1;
      if (ES.sessionTaps % 50 === 0) {
        ES.stars = (ES.stars || 0) + 1;
        if (typeof createToast === "function") createToast("スター", "50タップで★+1");
      }
      const st = document.getElementById("sessTaps");
      const sr = document.getElementById("starPts");
      if (st) st.textContent = String(ES.sessionTaps);
      if (sr) sr.textContent = String(ES.stars || 0);
      checkMission();
    };
    const coreBtn = document.getElementById("coreTrigger");
    if (coreBtn) {
      coreBtn.removeEventListener("click", origClickFn);
      coreBtn.addEventListener("click", window.handleCoreClick);
    }
    window.__critWrapped = true;
  }

  let hudAcc = 0;
  const ehFps = document.getElementById("eh-fps");

  /* cap logs harder on phones */
  if (typeof window.pushLog === "function") {
    const origLog = window.pushLog;
    window.pushLog = function(message, typeColor) {
      origLog(message, typeColor);
      const box = document.getElementById("logBox");
      const cap = LOW ? 16 : 40;
      if (box) while (box.children.length > cap) box.removeChild(box.lastChild);
    };
  }

  setTimeout(function(){
    try {
      if (window.SoundManager && typeof SoundManager.playClick === "function" && !SoundManager.__pooledClick) {
        const orig = SoundManager.playClick.bind(SoundManager);
        SoundManager.playClick = function(){
          if (window.isLightweightMode) return;
          if (AudioBank.buf.click) { AudioBank.play("click"); return; }
          orig();
        };
        SoundManager.__pooledClick = true;
      }
    } catch (e) {}
  }, 300);


  document.addEventListener("pointerdown", function(e){
    const t = e.target;
    if (!t || !t.closest) return;
    const el = t.closest("button, .card-upgrade-node, .factory-linear-card, .btn-action-prestige, .tab-trigger-button, .click-core-btn");
    if (!el) return;
    if (window.isLightweightMode || ES.quality === "low" || fpsEma < 26) return;
    el.classList.remove("fx-hit","fx-hit2","fx-hit3");
    const k = "fx-hit" + ["","2","3"][(Math.random()*3)|0];
    el.classList.add(k);
    if (ES.quality !== "low" && fpsEma >= 40 && typeof burst === "function") {
      burst(e.clientX || (window.innerWidth/2), e.clientY || (window.innerHeight/2), "click");
    }
    if (AudioBank && el.id !== "coreTrigger") AudioBank.play("click", 0.98 + Math.random()*0.12);
  }, {passive:true});


  const BIND_DEF = {
    tap: { key: "Space", pad: 7 },
    confirm: { key: "Enter", pad: 0 },
    back: { key: "Escape", pad: 1 },
    fever: { key: "Digit1", pad: 2 },
    shield: { key: "Digit2", pad: 3 },
    call: { key: "Digit3", pad: 6 },
    tabL: { key: "KeyQ", pad: 4 },
    tabR: { key: "KeyE", pad: 5 },
    menu: { key: "KeyM", pad: 9 }
  };
  const BIND_LABEL = {
    tap: "コア連打 (RT)",
    confirm: "決定 (A 緑)",
    back: "戻る (B 赤)",
    fever: "フィーバー (X 青)",
    shield: "シールド (Y 黄)",
    call: "イベント召喚",
    tabL: "左タブ (L 紫)",
    tabR: "右タブ (R 桃)",
    menu: "操作メニュー (START)"
  };
  function uiSfx(kind) {
    if (window.isLightweightMode) return;
    const map = { move: "click", ok: "lucky", back: "unlucky", tab: "mixed" };
    AudioBank.play(map[kind] || "click", kind === "move" ? 1.35 : 1);
  }
  function loadBinds() {
    try {
      const raw = localStorage.getItem("mz_controls_v1");
      if (raw) return Object.assign({}, BIND_DEF, JSON.parse(raw));
    } catch (e) {}
    return JSON.parse(JSON.stringify(BIND_DEF));
  }
  let binds = loadBinds();
  let waitingBind = null;
  function saveBinds() {
    try { localStorage.setItem("mz_controls_v1", JSON.stringify(binds)); } catch (e) {}
  }
  function padName(i) {
    if (i === 0) return "A / 下ボタン";
    if (i === 1) return "B / 右ボタン";
    if (i === 2) return "X / 左ボタン";
    if (i === 3) return "Y / 上ボタン";
    return "ボタン " + i;
  }
  function renderBinds() {
    const list = document.getElementById("bindList");
    if (!list) return;
    list.innerHTML = Object.keys(BIND_LABEL).map(function(act){
      const b = binds[act] || BIND_DEF[act];
      const wait = waitingBind === act ? "  → 入力待ち" : "";
      return '<button type="button" data-bind="'+act+'">'+BIND_LABEL[act]+'<br>キー: '+(b.key||"-")+'  /  パッド: '+padName(b.pad)+wait+"</button>";
    }).join("");
    list.querySelectorAll("[data-bind]").forEach(function(btn){
      btn.onclick = function(){
        waitingBind = btn.getAttribute("data-bind");
        btn.textContent = BIND_LABEL[waitingBind] + "  → キーかコントローラーを押す";
      };
    });
  }
  window.toggleControlsMenu = function() {
    const o = document.getElementById("controlsModalOverlay");
    if (!o) return;
    const show = o.style.display === "none" || o.style.display === "";
    o.style.display = show ? "flex" : "none";
    if (show) renderBinds();
  };
  const rst = document.getElementById("bindResetBtn");
  if (rst) rst.onclick = function(){
    binds = JSON.parse(JSON.stringify(BIND_DEF));
    saveBinds();
    waitingBind = null;
    renderBinds();
  };

  const keyGuard = Object.create(null);
  let focusEl = null;
  function visibleEl(el) {
    if (!el) return false;
    const st = window.getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") return false;
    return el.getClientRects().length > 0;
  }
  function focusables() {
    const modal = document.getElementById("controlsModalOverlay");
    const set = document.getElementById("settingsModalOverlay");
    let root = document;
    if (modal && modal.style.display === "flex") root = modal;
    else if (set && set.style.display === "flex") root = set;
    const sel = "button, .factory-linear-card, .card-upgrade-node, .btn-action-prestige, .tab-trigger-button";
    return Array.prototype.slice.call(root.querySelectorAll(sel)).filter(function(el){
      return !el.disabled && visibleEl(el);
    });
  }
  function setFocus(el) {
    if (focusEl) focusEl.classList.remove("pad-focus");
    focusEl = el || null;
    if (!focusEl) return;
    focusEl.classList.add("pad-focus");
    try { focusEl.scrollIntoView({ block: "nearest", inline: "nearest" }); } catch (e) {}
  }
  function elCenter(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 };
  }
  function moveFocus(dir) {
    const list = focusables();
    if (!list.length) return;
    if (dir === 1 || dir === -1) dir = dir < 0 ? "up" : "down";
    let cur = (focusEl && list.indexOf(focusEl) >= 0) ? focusEl : list[0];
    const c = elCenter(cur);
    let best = null, bestScore = 1e12;
    for (let i = 0; i < list.length; i++) {
      const el = list[i];
      if (el === cur) continue;
      const t = elCenter(el);
      const dx = t.x - c.x, dy = t.y - c.y;
      let along = 0, side = 0;
      if (dir === "right") { along = dx; side = Math.abs(dy); if (dx < 8) continue; }
      else if (dir === "left") { along = -dx; side = Math.abs(dy); if (dx > -8) continue; }
      else if (dir === "down") { along = dy; side = Math.abs(dx); if (dy < 8) continue; }
      else { along = -dy; side = Math.abs(dx); if (dy > -8) continue; }
      const score = along + side * 2.5;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    if (!best) return;
    setFocus(best);
    uiSfx("move");
  }
  const navHold = { dir: null, started: 0, last: 0 };
  function navPulse(dir, pressed) {
    const now = performance.now();
    if (!pressed) {
      if (navHold.dir === dir) navHold.dir = null;
      return;
    }
    if (navHold.dir !== dir) {
      navHold.dir = dir;
      navHold.started = now;
      navHold.last = now;
      moveFocus(dir);
      return;
    }
    if (now - navHold.started < 110) return;
    const gap = (now - navHold.started < 500) ? 280 : 180;
    if (now - navHold.last >= gap) {
      navHold.last = now;
      moveFocus(dir);
    }
  }
  function activateFocus() {
    const el = focusEl || document.getElementById("coreTrigger");
    if (!el) return;
    uiSfx("ok");
    if (el.id === "coreTrigger") {
      const fn = window.handleCoreClick || handleCoreClick;
      if (typeof fn === "function") fn(null);
      return;
    }
    try { el.click(); } catch (e) {}
  }
  function switchTabDir(dir) {
    const tabs = Array.prototype.slice.call(document.querySelectorAll(".tab-trigger-button")).filter(visibleEl);
    if (!tabs.length) return;
    let i = tabs.findIndex(function(t){ return t.classList.contains("active"); });
    i = (Math.max(0, i) + dir + tabs.length) % tabs.length;
    uiSfx("tab");
    tabs[i].click();
    setFocus(tabs[i]);
  }
  function doAction(act) {
    if (act === "tap") {
      const fn = window.handleCoreClick || handleCoreClick;
      if (typeof fn === "function") fn(null);
    } else if (act === "confirm") activateFocus();
    else if (act === "back") {
      uiSfx("back");
      const c = document.getElementById("controlsModalOverlay");
      const g = document.getElementById("settingsModalOverlay");
      if (c && c.style.display === "flex") toggleControlsMenu();
      else if (g && g.style.display === "flex") toggleSettingsMenu();
      else setFocus(document.getElementById("coreTrigger"));
    } else if (act === "fever" || act === "shield" || act === "call") useSkill(act);
    else if (act === "tabL") switchTabDir(-1);
    else if (act === "tabR") switchTabDir(1);
    else if (act === "menu") toggleControlsMenu();
  }
  document.addEventListener("keydown", function(e){
    if (e.repeat) return;
    if (waitingBind) {
      e.preventDefault();
      binds[waitingBind].key = e.code;
      saveBinds();
      waitingBind = null;
      renderBinds();
      return;
    }
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.code === "ArrowUp") { e.preventDefault(); navPulse("up", true); return; }
    if (e.code === "ArrowDown") { e.preventDefault(); navPulse("down", true); return; }
    if (e.code === "ArrowLeft") { e.preventDefault(); navPulse("left", true); return; }
    if (e.code === "ArrowRight") { e.preventDefault(); navPulse("right", true); return; }
    const acts = Object.keys(binds);
    for (let i=0;i<acts.length;i++) {
      if (binds[acts[i]].key === e.code) {
        e.preventDefault();
        if (!keyGuard[acts[i]]) {
          keyGuard[acts[i]] = true;
          doAction(acts[i]);
        }
      }
    }
  }, true);
  document.addEventListener("keyup", function(e){
    const acts = Object.keys(binds);
    for (let i=0;i<acts.length;i++) if (binds[acts[i]].key === e.code) keyGuard[acts[i]] = false;
    if (e.code.indexOf("Arrow") === 0) navPulse(e.code.replace("Arrow","").toLowerCase(), false);
  }, true);

  const padHeld = Object.create(null);
  let lastPadTap = 0;
  let padProfile = "auto";
  let rumbleOn = true;
  let lastBuzz = 0;
  function classifyPad(pad) {
    const id = ((pad && pad.id) || "").toLowerCase();
    if (id.indexOf("joy-con (l)") >= 0 || id.indexOf("joycon (l)") >= 0 || id.indexOf("joy-con left") >= 0) return "joyl";
    if (id.indexOf("joy-con (r)") >= 0 || id.indexOf("joycon (r)") >= 0 || id.indexOf("joy-con right") >= 0) return "joyr";
    if (id.indexOf("joy-con") >= 0 || id.indexOf("joycon") >= 0) return "joy";
    if (id.indexOf("switch") >= 0 || id.indexOf("pro controller") >= 0 || id.indexOf("nintendo") >= 0) return "switch";
    if (id.indexOf("xbox") >= 0 || id.indexOf("xinput") >= 0) return "xbox";
    return "std";
  }
  function applyProfile(name) {
    padProfile = name;
    if (name === "switch" || name === "joyr" || name === "joypair") {
      binds.confirm.pad = 1;
      binds.back.pad = 0;
      binds.fever.pad = 3;
      binds.shield.pad = 2;
      binds.tap.pad = 7;
    } else if (name === "joyl") {
      binds.confirm.pad = 0;
      binds.back.pad = 1;
      binds.tap.pad = 4;
      binds.tabL.pad = 4;
      binds.tabR.pad = 5;
    } else if (name === "xbox") {
      binds.confirm.pad = 0;
      binds.back.pad = 1;
      binds.fever.pad = 2;
      binds.shield.pad = 3;
      binds.tap.pad = 7;
    }
    saveBinds();
    renderBinds();
  }
  function buzz(pad) {
    if (!rumbleOn || !pad) return;
    const now = performance.now();
    if (now - lastBuzz < 140) return;
    lastBuzz = now;
    try {
      const a = pad.vibrationActuator;
      if (a && typeof a.playEffect === "function") {
        a.playEffect("dual-rumble", { startDelay: 0, duration: 70, weakMagnitude: 0.5, strongMagnitude: 0.25 });
      }
    } catch (e) {}
  }
  document.querySelectorAll(".pad-prof").forEach(function(btn){
    btn.onclick = function(){ applyProfile(btn.getAttribute("data-prof")); };
  });
  const rumbleBtn = document.getElementById("sk-rumble");
  if (rumbleBtn) rumbleBtn.onclick = function(){
    rumbleOn = !rumbleOn;
    rumbleBtn.textContent = rumbleOn ? "振動ON" : "振動OFF";
  };
  const _act = activateFocus;
  activateFocus = function() {
    _act();
    try {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (let i=0;i<pads.length;i++) if (pads[i]) { buzz(pads[i]); break; }
    } catch (e) {}
  };
  function readPads() {
    if (document.hidden) return;
    let pads = [];
    try { pads = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) {}
    let connected = 0;
    const allDir = { up:false, down:false, left:false, right:false };
    for (let p=0;p<pads.length;p++) {
      const pad = pads[p];
      if (!pad) continue;
      connected++;
      if (waitingBind) {
        for (let b=0;b<pad.buttons.length;b++) {
          if (pad.buttons[b] && pad.buttons[b].pressed) {
            binds[waitingBind].pad = b;
            saveBinds();
            waitingBind = null;
            renderBinds();
            break;
          }
        }
      } else {
        const kind = classifyPad(pad);
        const useJoyL = padProfile === "joyl" || padProfile === "joypair" || (padProfile === "auto" && kind === "joyl");
        const dpad = useJoyL
          ? [[0,"up"],[1,"down"],[2,"left"],[3,"right"],[12,"up"],[13,"down"],[14,"left"],[15,"right"]]
          : [[12,"up"],[13,"down"],[14,"left"],[15,"right"]];
        const dirOn = { up:false, down:false, left:false, right:false };
        for (let d=0;d<dpad.length;d++) {
          if (pad.buttons[dpad[d][0]] && pad.buttons[dpad[d][0]].pressed) dirOn[dpad[d][1]] = true;
        }
        let axX = pad.axes && pad.axes[0] || 0;
        let axY = pad.axes && pad.axes[1] || 0;
        if ((kind === "joyr" || padProfile === "joyr") && pad.axes && pad.axes.length > 3) {
          if (Math.abs(axX)+Math.abs(axY) < 0.2) { axX = pad.axes[2] || 0; axY = pad.axes[3] || 0; }
        }
        const dead = 0.42;
        if (axX < -dead) dirOn.left = true;
        if (axX > dead) dirOn.right = true;
        if (axY < -dead) dirOn.up = true;
        if (axY > dead) dirOn.down = true;
        if (dirOn.left) allDir.left = true;
        if (dirOn.right) allDir.right = true;
        if (dirOn.up) allDir.up = true;
        if (dirOn.down) allDir.down = true;
        const acts = Object.keys(binds);
        for (let i=0;i<acts.length;i++) {
          const act = acts[i];
          const idx = binds[act].pad;
          const pressed = !!(pad.buttons[idx] && pad.buttons[idx].pressed);
          const holdKey = p + ":" + act;
          if (act === "tap" && pressed) {
            const now = performance.now();
            if (now - lastPadTap > 280) {
              lastPadTap = now;
              doAction("tap");
            }
          } else if (pressed && !padHeld[holdKey]) {
            padHeld[holdKey] = true;
            doAction(act);
          } else if (!pressed) padHeld[holdKey] = false;
        }
        const tapExtra = (kind === "joyl" || kind === "joyr" || kind === "joy" || padProfile === "joypair")
          ? [4,5,6,7] : [6,7];
        for (let t=0;t<tapExtra.length;t++) {
          if (pad.buttons[tapExtra[t]] && pad.buttons[tapExtra[t]].pressed) {
            const now = performance.now();
            if (now - lastPadTap > 280) { lastPadTap = now; doAction("tap"); }
          }
        }
      }
    }
    navPulse("left", allDir.left);
    navPulse("right", allDir.right);
    navPulse("up", allDir.up);
    navPulse("down", allDir.down);
    const st = document.getElementById("padStatus");
    if (st) {
      const names = [];
      for (let i=0;i<pads.length;i++) if (pads[i]) names.push(classifyPad(pads[i]));
      if (padProfile === "auto" && names.indexOf("joyl") >= 0 && names.indexOf("joyr") >= 0) {
        padProfile = "joypair";
      }
      st.textContent = connected
        ? ("接続 " + connected + "台 / " + names.join(",") + " / 設定:" + padProfile)
        : "コントローラー: 未接続";
    }
  }
  window.addEventListener("gamepadconnected", function(ev){
    const k = classifyPad(ev.gamepad);
    if (padProfile === "auto") {
      if (k === "joyl" || k === "joyr" || k === "joy") applyProfile("joypair");
      else if (k === "switch") applyProfile("switch");
    }
    if (typeof createToast === "function") createToast("コントローラー", (ev.gamepad && ev.gamepad.id) || "接続");
  });

  const shop = document.getElementById("sk-starshop");
  if (shop) shop.onclick = function(){
    if ((ES.stars || 0) < 3) {
      if (typeof createToast === "function") createToast("★交換", "スターが3つ必要");
      uiSfx("back");
      return;
    }
    ES.stars -= 3;
    const g = (typeof cpsWorth === "function") ? cpsWorth(40) : 100;
    try { game.energy = D(game.energy).add(g); } catch(e) {}
    const sr = document.getElementById("starPts");
    if (sr) sr.textContent = String(ES.stars);
    if (typeof createToast === "function") createToast("★交換", "+" + (typeof formatValue==="function"?formatValue(g):g) + " E");
    uiSfx("ok");
  };
  try {
    const day = new Date().toDateString();
    if (localStorage.getItem("mz_login_day") !== day) {
      localStorage.setItem("mz_login_day", day);
      const days = (parseInt(localStorage.getItem("mz_login_n") || "0", 10) || 0) + 1;
      localStorage.setItem("mz_login_n", String(days));
      setTimeout(function(){
        const g = (typeof cpsWorth === "function") ? cpsWorth(8 + days) : 20;
        try { if (window.game) game.energy = D(game.energy).add(g); } catch(e) {}
        if (typeof createToast === "function") createToast("ログインボーナス", days + "日目 +" + (typeof formatValue==="function"?formatValue(g):g) + " E");
      }, 800);
    }
  } catch (e) {}

  try { paintMission(); } catch(e){}
  setInterval(readPads, 66);

  document.addEventListener("visibilitychange", function(){
    if (document.hidden) {
      fx.length && fx.forEach(function(p){ p.on = 0; });
      fxAlive = 0;
      try { if (AudioBank.ctx && AudioBank.ctx.state === "running") AudioBank.ctx.suspend(); } catch(e){}
    } else {
      try { if (AudioBank.ctx && AudioBank.ctx.state === "suspended") AudioBank.ctx.resume(); } catch(e){}
    }
  });
})();
