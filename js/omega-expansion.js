/* INFINITY MATRIX - OMEGA EXPANSION v1.0
 * Integrated gameplay systems for the MZclickgame project.
 * Local-first: cloud rankings require a server and are intentionally not faked.
 */
(function () {
  "use strict";
  const KEY = "infinity_omega_expansion_v1";
  const MAX_OFFLINE = 8 * 60 * 60 * 1000;
  const $ = (id) => document.getElementById(id);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, Number(n) || 0));
  const now = () => Date.now();
  const memoryStore = Object.create(null);
  let persistentStore = null;
  try { const candidate=window.localStorage, probe="__omega_expansion_probe__"; candidate.setItem(probe,"1"); candidate.removeItem(probe); persistentStore=candidate; } catch (_) {}
  const store = {
    getItem(key) { try { if (persistentStore) return persistentStore.getItem(key); } catch (_) { persistentStore=null; } return Object.prototype.hasOwnProperty.call(memoryStore,key)?memoryStore[key]:null; },
    setItem(key,value) { const v=String(value); try { if (persistentStore) { persistentStore.setItem(key,v); return true; } } catch (_) { persistentStore=null; } memoryStore[key]=v; return false; },
    removeItem(key) { try { if(persistentStore) persistentStore.removeItem(key); } catch (_) { persistentStore=null; } delete memoryStore[key]; },
    get persistent() { return !!persistentStore; }
  };
  const fmt = (n) => {
    n = Number(n) || 0;
    if (typeof S !== "undefined" && S && S.notation === "scientific" && n !== 0) return n.toExponential(2);
    if (typeof S !== "undefined" && S && S.notation === "short") {
      if(n>=1e15)return (n/1e15).toFixed(2)+" Qa";
      if(n>=1e12)return (n/1e12).toFixed(2)+" T";
      if(n>=1e9)return (n/1e9).toFixed(2)+" B";
      if(n>=1e6)return (n/1e6).toFixed(2)+" M";
      if(n>=1e3)return (n/1e3).toFixed(2)+" K";
    }
    return n.toLocaleString("en-US", { maximumFractionDigits: n < 100 ? 2 : 0 });
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  const fresh = () => ({
    version: 1, createdAt: now(), lastAt: now(), clicks: 0, combo: 0, bestCombo: 0,
    lastClick: 0, crits: 0, chains: 0, matrix: 0, research: 0, prestige: 0,
    chronons: 0, darkMatter: 0, stars: 0, overdrive: 0, overdriveUses: 0,
    feverUntil: 0, shieldUntil: 0, callUntil: 0, skillCD: {},
    levels: { click:0, crit:0, combo:0, idle:0, factory:0, research:0, relic:0, offline:0, boss:0, dimension:0, time:0, luck:0 },
    tree: [], constellations: [], relics: [], relicSlots: 2, facilities: [0,0,0,0,0,0],
    facilitySpecs: {}, autoRules: {buy:false, research:false, evolve:false},
    dimensions: [1,0,0,0,0,0], timeLanes: [0,0,0], planets: [], civLevel: 0,
    codex: [], achievements: [], secretFlags: [], title: "CORE INITIATE",
    skin: "omega", theme: "default", notation: "short", lowFx: false, sound: true,
    tutorialDone: false, tutorialStep: 0, challenge: null, challengeWins: 0,
    challengeBest: {}, loadouts: {}, activeLoadout: "", difficulty: "standard",
    event: null, pendingRewards:false, overloadUntil:0, lastAutoBuy:0, eventNextAt: now()+90000, eventChain: 0, eventWins: 0,
    boss: { active:false, id:0, hp:0, maxHp:0, phase:0, part:0, wins:0, secret:false },
    mission: { id:0, progress:0, target:25, expires:now()+180000, claimed:false },
    story: 0, omegaCleared:false, newInfinity:0, laws: [], equationsSolved:0,
    history: [], replay: [], bestEnergy:0, bestCps:0, totalSession:0,
    daily: { date:"", score:0, seed:0 }, customChallenge: { clicks:1000, seconds:120, noAuto:false },
    settings: { volume:0.22, particles:true, motion:true, notifications:true, autosave:true },
    stats: { events:0, purchases:0, resets:0, bossDamage:0, offlineGain:0, totalEarned:0, maxCrit:1, lastSessionAt:now() }
  });
  let S = fresh(), activeTab = "core", timer = 0, lastTick = now(), lastSave = 0, panelOpen = false, audioCtx = null;
  const has = (a) => Array.isArray(a) && a.length > 0;
  const game = () => (typeof window.game === "object" && window.game) ? window.game : null;
  const baseNum = (v) => { try { if (v && typeof v.toNumber === "function") return v.toNumber(); return Number(v) || 0; } catch (_) { return 0; } };
  // Expansion calculations use bounded finite numbers; the base game retains its Decimal.js values.
  const SAFE_MAX = 1e290;
  const finiteCap = (n, fallback=0) => Number.isFinite(n) ? Math.max(0,Math.min(SAFE_MAX,n)) : (n>0?SAFE_MAX:fallback);
  const energy = () => { const g=game(); return g ? finiteCap(baseNum(g.energy)) : 0; };
  const cps = () => { try { return typeof window.getTotalCps === "function" ? finiteCap(baseNum(window.getTotalCps())) : 0; } catch (_) { return 0; } };
  const clickPower = () => { try { return typeof window.getClickPower === "function" ? Math.max(1,finiteCap(baseNum(window.getClickPower()),1)) : 1; } catch (_) { return 1; } };
  function addEnergy(n) {
    const g=game(); if (!g || !(n>0) || !Number.isFinite(n)) return;
    try {
      if (typeof window.D === "function") g.energy = window.D(g.energy).plus(n);
      else g.energy = baseNum(g.energy)+n;
      if (typeof window.refreshUI === "function") window.refreshUI();
    } catch (_) { try { g.energy = baseNum(g.energy)+n; } catch(__){} }
  }
  function spendEnergy(n) {
    const g=game(); if (!g || energy() < n) return false;
    try { if (typeof window.D === "function") g.energy=window.D(g.energy).minus(n); else g.energy=energy()-n; if (window.refreshUI) window.refreshUI(); return true; } catch(_) { return false; }
  }
  function save() {
    try { S.lastAt=now(); const previous=store.getItem(KEY); if(previous) store.setItem(KEY+"_backup",previous); store.setItem(KEY, JSON.stringify(S)); lastSave=now(); const el=$("oxSaveStatus"); if(el) el.textContent=store.persistent?"SAVE OK":"SESSION ONLY — host storage blocked"; } catch(e) { const el=$("oxSaveStatus"); if(el) el.textContent="SAVE ERROR"; }
  }
  function load() {
    try {
      const raw=store.getItem(KEY); if(!raw) return;
      const parsed=JSON.parse(raw); if(!parsed || parsed.version!==1) return;
      const d=fresh(); S=Object.assign(d,parsed);
      S.levels=Object.assign(d.levels,parsed.levels||{}); S.stats=Object.assign(d.stats,parsed.stats||{});
      S.settings=Object.assign(d.settings,parsed.settings||{}); S.autoRules=Object.assign(d.autoRules,parsed.autoRules||{});
      S.boss=Object.assign(d.boss,parsed.boss||{}); S.mission=Object.assign(d.mission,parsed.mission||{}); S.pendingRewards=!!parsed.pendingRewards; S.overloadUntil=Number(parsed.overloadUntil)||0; S.lastAutoBuy=Number(parsed.lastAutoBuy)||0;
      S.daily=Object.assign(d.daily,parsed.daily||{}); S.customChallenge=Object.assign(d.customChallenge,parsed.customChallenge||{});
      S.skillCD=parsed.skillCD&&typeof parsed.skillCD==="object"?parsed.skillCD:{};
      S.facilitySpecs=parsed.facilitySpecs&&typeof parsed.facilitySpecs==="object"?parsed.facilitySpecs:{};
      S.challengeBest=parsed.challengeBest&&typeof parsed.challengeBest==="object"?parsed.challengeBest:{};
      S.loadouts=parsed.loadouts&&typeof parsed.loadouts==="object"?parsed.loadouts:{};
      S.tree=Array.isArray(parsed.tree)?parsed.tree:[];
      S.constellations=Array.isArray(parsed.constellations)?parsed.constellations:[];
      S.relics=Array.isArray(parsed.relics)?parsed.relics:[];
      S.codex=Array.isArray(parsed.codex)?parsed.codex.slice(-1000):[];
      S.achievements=Array.isArray(parsed.achievements)?parsed.achievements:[];
      S.secretFlags=Array.isArray(parsed.secretFlags)?parsed.secretFlags:[];
      S.facilities=Array.isArray(parsed.facilities)?Array.from({length:6},(_,i)=>Math.max(0,Math.floor(Number(parsed.facilities[i])||0))):d.facilities.slice();
      S.dimensions=Array.isArray(parsed.dimensions)?Array.from({length:6},(_,i)=>Math.max(0,Number(parsed.dimensions[i])||0)):d.dimensions.slice();
      S.timeLanes=Array.isArray(parsed.timeLanes)?Array.from({length:3},(_,i)=>Math.max(0,Number(parsed.timeLanes[i])||0)):d.timeLanes.slice();
      S.settings=Object.assign(d.settings,parsed.settings||{});
      const elapsed=clamp(now()-(Number(S.lastAt)||now()),0,MAX_OFFLINE);
      if(elapsed>5000) {
        const gain=Math.max(0,cps())*elapsed/1000*(1+S.levels.offline*.25+relicBonus("offline"));
        if(gain>0) { addEnergy(gain); S.stats.offlineGain=(S.stats.offlineGain||0)+gain; toast("OFFLINE MATRIX",`復帰報酬 +${fmt(gain)} ENERGY`); }
        const idle=elapsed/1000*(S.levels.idle||0)*0.05;
        S.matrix+=idle; S.totalSession+=elapsed/1000;
      }
    } catch(e) { console.warn("[OMEGA] save load skipped",e); }
  }
  const tabs = [
    ["core","CORE","⚡"],["research","RESEARCH","⌘"],["factory","FACTORY","▦"],["prestige","PRESTIGE","∞"],
    ["boss","BOSS","◈"],["codex","CODEX","▤"],["strategy","STRATEGY","♜"],["events","EVENTS","✦"],
    ["social","RECORDS","◇"],["omega","OMEGA","✧"],["settings","SETTINGS","⚙"]
  ];
  const relicPool = [
    ["Prism of First Light","クリック獲得 +12%","click",.12,"common"],["Chrono Gear","オフライン生産 +20%","offline",.20,"common"],
    ["Void Lens","クリティカル率 +4%","crit",.04,"rare"],["Starforge Seal","施設生産 +18%","factory",.18,"rare"],
    ["Omega Fragment","全生産 +25%","all",.25,"epic"],["Singularity Crown","ボス報酬 +30%","boss",.30,"epic"],
    ["Paradox Engine","研究獲得 +20%","research",.20,"legendary"],["Infinite Key","転生報酬 +35%","prestige",.35,"legendary"]
  ];
  const researchNodes = [
    ["click","タップ増幅","クリック獲得量を上げる",25,1],["crit","確率崩壊","クリティカル率を上げる",40,1],
    ["combo","連鎖構造","コンボ倍率の伸びを増やす",55,1],["idle","自律機械","マトリックス自動生産",80,1],
    ["factory","生産同期","施設生産を強化",120,1],["research","知性増幅","研究ポイント獲得を強化",160,1],
    ["relic","遺物共鳴","遺物効果を強化",220,1],["offline","時間貯蔵","オフライン報酬上限・量を増加",250,1],
    ["boss","対虚無兵装","ボスへのダメージを増加",300,1],["dimension","次元安定器","次元生産を強化",450,1],
    ["time","時間折畳み","時間軸ボーナスを増加",600,1],["luck","確率共鳴","イベントとレア発見率を上げる",750,1]
  ];
  const achievementList = [
    ["first_click","最初の波","コアを1回クリック",s=>s.clicks>=1],["click_100","連打起動","100回クリック",s=>s.clicks>=100],
    ["combo_25","コンボ職人","コンボ25達成",s=>s.bestCombo>=25],["combo_100","共鳴の達人","コンボ100達成",s=>s.bestCombo>=100],
    ["crit_10","確率の支配者","クリティカル10回",s=>s.crits>=10],["first_boss","虚無突破","ボスを1体撃破",s=>s.boss.wins>=1],
    ["relic_3","収集家","遺物3個所持",s=>s.relics.length>=3],["dimension_2","次元旅行者","第2次元を解放",s=>s.dimensions[1]>0],
    ["event_5","異常観測者","イベント5回達成",s=>s.eventWins>=5],["omega","OMEGA","OMEGAを解放",s=>s.omegaCleared]
  ];
  function sound(freq=520,dur=.06,type="sine") {
    if(!S.sound || S.settings.volume<=0) return;
    try { audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==="suspended") audioCtx.resume(); const o=audioCtx.createOscillator(),g=audioCtx.createGain(); o.type=type;o.frequency.value=freq;g.gain.value=S.settings.volume*.16;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);o.stop(audioCtx.currentTime+dur); } catch(_){}
  }
  function digitRain() {
    if(S.lowFx||!S.settings.particles)return;
    const layer=$("oxFxLayer");if(!layer)return;
    for(let i=0;i<12;i++){const el=document.createElement("div");el.className="ox-fx digit";el.textContent=["+∞","+1e6","×"+Math.ceil(Math.random()*999),"OMEGA","+"+Math.ceil(Math.random()*99999)][i%5];el.style.left=(8+Math.random()*84)+"%";el.style.top=(20+Math.random()*55)+"%";el.style.animationDelay=(Math.random()*.18)+"s";layer.appendChild(el);setTimeout(()=>el.remove(),1000);}
  }
  function showFx(text, kind) {
    if(S.lowFx || !S.settings.particles)return;
    const layer=$("oxFxLayer");if(!layer)return;
    const el=document.createElement("div");el.className="ox-fx "+(kind||"");el.textContent=text;
    const core=$("coreTrigger"),r=core?core.getBoundingClientRect():null;
    if(r){el.style.left=(r.left+r.width/2)+"px";el.style.top=(r.top+r.height*.25)+"px";}
    else {el.style.left=(35+Math.random()*30)+"%";el.style.top=(35+Math.random()*20)+"%";}
    layer.appendChild(el);setTimeout(()=>el.remove(),850);
  }
  function toast(title, msg) {
    if(!S.settings.notifications) return;
    const host=$("oxToastHost"); if(!host) return;
    const el=document.createElement("div"); el.className="ox-toast"; el.innerHTML=`<b>${esc(title)}</b><span>${esc(msg)}</span>`; host.appendChild(el);
    setTimeout(()=>{el.classList.add("out");setTimeout(()=>el.remove(),300);},2800);
  }
  function log(label, detail) { S.history.unshift({t:now(),label,detail}); if(S.history.length>100) S.history.length=100; S.replay.unshift({t:now(),label,detail}); if(S.replay.length>40) S.replay.length=40; }
  function discover(kind,id) { const key=kind+":"+id; if(!S.codex.includes(key)){S.codex.push(key); if(S.codex.length>1000)S.codex=S.codex.slice(-1000); if(S.codex.length%10===0)toast("CODEX UPDATED",`${S.codex.length}/1000 discoveries`);} }
  function grantResearch(n) { S.research += Math.max(0,n)*(1+(S.levels.research||0)*.2)*(S.branch==="scientist"?1.2:1)*(S.laws.includes("entropy")?1.1:1); }
  function grantRelic() {
    const owned=new Set(S.relics.map(r=>r.id)); let candidates=relicPool.filter(r=>!owned.has(r[0]));
    if(!candidates.length) candidates=relicPool;
    const r=candidates[Math.floor(Math.random()*candidates.length)];const weekly=weeklyModifier();if(weekly.name==="RELIC WEEK")S.stats.relicWeek=(S.stats.relicWeek||0)+1;
    const item={id:r[0],name:r[0],desc:r[1],type:r[2],value:r[3],rarity:r[4],foundAt:now()};
    S.relics.push(item); discover("relic",item.id); log("遺物発見",item.name); toast("RELIC DISCOVERED",item.name); sound(880,.18,"triangle");
  }
  function relicBonus(type) { return S.relics.reduce((a,r)=>a+(r.type===type||r.type==="all"?r.value:0),0)*(1+(S.levels.relic||0)*.15); }
  function totalMultiplier() { const weekly=weeklyModifier().name==="GRAVITY WEEK"?.1:0;return 1+(S.levels.click||0)*.16+relicBonus("click")+relicBonus("all")+(S.prestige||0)*.04+(S.newInfinity||0)*.1+(S.branch==="scientist"?.08:S.branch==="timekeeper"?.05:0)+weekly+(S.laws.includes("causality")?.2:0); }
  function comboMultiplier() { return 1+Math.min(4,S.combo*.025)+(S.levels.combo||0)*.2; }
  function criticalChance() { return Math.min(.55,.06+(S.levels.crit||0)*.025+relicBonus("crit")+relicBonus("all")*.1); }
  function onCoreClick(ev) {
    const t=now(), gap=t-(S.lastClick||0); S.clicks++; S.stats.totalEarned+=1;
    if(gap<1250) S.combo=Math.min(500,S.combo+1); else S.combo=1;
    S.lastClick=t; S.bestCombo=Math.max(S.bestCombo,S.combo);
    const rhythm = gap>=420 && gap<=680;
    if(rhythm){S.matrix+=5+S.levels.combo;grantResearch(.5);discover("rhythm",Math.min(1000,Math.floor(S.clicks/10)));showFx("RHYTHM +", "rhythm");}
    if(S.combo>1 && S.combo%10===0)showFx("CHAIN ×"+S.combo,"chain");
    const chainChance=Math.min(.6,.08+S.levels.luck*.025+relicBonus("all")*.08+(weeklyModifier().name==="RELIC WEEK"?.02:0));
    if(Math.random()<chainChance) { S.chains++; S.matrix+=Math.max(1,S.combo*.15); discover("chain",Math.min(1000,S.chains)); }
    const crit=Math.random()<criticalChance(), base=clickPower(), cm=comboMultiplier();
    let bonus=base*(totalMultiplier()-1)*.15;
    if(crit) { S.crits++; const factor=4+(S.levels.crit||0); bonus+=base*factor; S.stats.maxCrit=Math.max(S.stats.maxCrit,factor); toast("CRITICAL MATRIX",`${factor}× impact`); showFx("CRITICAL ×"+factor,"crit");digitRain(); sound(920,.09,"triangle"); }
    if(S.feverUntil>t) bonus+=base*1.5;
    if(S.callUntil>t) bonus+=base*2;
    if(S.challenge && ["clicks","daily","speed","custom","duel"].includes(S.challenge.type)) S.challenge.progress++;
    if(S.mission && !S.mission.claimed) S.mission.progress++;
    S.matrix+=Math.max(0.1,cm*(crit?3:1))*(1+S.levels.click*.1);
    grantResearch(0.035+(S.clicks%10===0?0.8:0)+(crit?0.5:0));
    S.overdrive=Math.min(100,S.overdrive+1+(crit?3:0)+Math.min(3,S.combo*.02));
    S.stats.totalEarned+=bonus;
    if(bonus>0) addEnergy(bonus);
    if(S.combo===25||S.combo===50||S.combo===100||S.combo===250) { toast("COMBO ×"+S.combo, "MATRIX RESONANCE INCREASED"); sound(620,.1,"sawtooth"); }
    if(S.clicks%25===0) discover("click",Math.min(1000,Math.floor(S.clicks/25)));
    if(S.clicks===1&&!S.tutorialDone) { S.tutorialStep=1; toast("FIRST CONTACT","研究タブで最初のアップグレードを選ぼう"); }
    updateMilestones(); renderStatus();
  }
  function updateMilestones() {
    for(const a of achievementList) if(!S.achievements.includes(a[0])&&a[3](S)){S.achievements.push(a[0]);grantResearch(20);discover("achievement",a[0]);toast("ACHIEVEMENT UNLOCKED",a[1]);sound(740,.16,"triangle");}
    const currentEnergy=energy();if(currentEnergy>S.bestEnergy){const meaningful=S.bestEnergy>0&&currentEnergy>S.bestEnergy*1.01;S.bestEnergy=currentEnergy;if(meaningful&&now()-(S.lastBestToast||0)>15000){S.lastBestToast=now();toast("NEW PERSONAL BEST","最高エネルギーを更新");}} S.bestCps=Math.max(S.bestCps,cps());
    if(S.clicks>=100000)S.title="INFINITY ARCHITECT";else if(S.boss.wins>=10)S.title="VOID CONQUEROR";else if(S.relics.length>=5)S.title="RELIC CURATOR";else if(S.bestCombo>=100)S.title="COMBO SOVEREIGN";else if(S.clicks>=100)S.title="CORE INITIATE";
    if(S.clicks>=100 && !S.secretFlags.includes("hidden-core")) { S.secretFlags.push("hidden-core"); toast("HIDDEN CORE", "隠しコアの痕跡を発見"); discover("secret","hidden-core"); }
    if(S.codex.length>=1000&&!S.omegaCleared){S.omegaCleared=true;S.story=Math.max(S.story,9);toast("OMEGA COMPLETE","1000件の発見を達成");}
  }
  function useSkill(id) {
    const t=now(), cds={fever:18000,shield:25000,call:32000,burst:40000,blackhole:50000,overdrive:60000};
    if((S.skillCD[id]||0)>t) return toast("SKILL COOLING",`${Math.ceil((S.skillCD[id]-t)/1000)}s remaining`);
    if(id==="fever") S.feverUntil=t+8000;
    else if(id==="shield") S.shieldUntil=t+12000;
    else if(id==="call") S.callUntil=t+5000;
    else if(id==="burst") { const n=clickPower()*(20+S.levels.click*3)*(1+relicBonus("all")); addEnergy(n); S.matrix+=n*.1; }
    else if(id==="blackhole") { const n=Math.max(10,energy()*.04+clickPower()*50); addEnergy(n); S.matrix+=n*.2; S.chains+=5; discover("event","black-hole"); }
    else if(id==="overdrive") { if(S.overdrive<100)return toast("OVERDRIVE NOT READY","ゲージを100%まで充填"); S.overdrive=0;S.overdriveUses++;S.feverUntil=t+12000;addEnergy(clickPower()*100*(1+S.levels.click)); }
    S.skillCD[id]=t+(cds[id]||20000); log("スキル発動",id); sound(500,.12,"square"); render();
  }
  function buyResearch(id) {
    const node=researchNodes.find(n=>n[0]===id); if(!node)return;
    const level=S.levels[id]||0, cost=Math.ceil(node[3]*Math.pow(1.75,level));
    if(S.research<cost)return toast("NOT ENOUGH RESEARCH",`${fmt(cost)} RP required`);
    S.research-=cost;S.levels[id]=level+1;S.stats.purchases++;discover("research",id+":"+S.levels[id]);log("研究完了",node[1]+" Lv."+S.levels[id]);sound(600,.08);render();
  }
  function buyFacility(i) {
    const costs=[25,160,950,5200,28000,160000], base=costs[i]*Math.pow(1.17,S.facilities[i]||0);
    if(!spendEnergy(base))return toast("ENERGY REQUIRED",`必要量 ${fmt(base)}`);
    S.facilities[i]=(S.facilities[i]||0)+1;S.stats.purchases++;discover("facility",i+":"+S.facilities[i]);log("施設建造",facilityNames[i]+" +1");sound(420,.08);render();
  }
  const facilityNames=["量子タービン","反物質炉","時間織機","星雲採掘機","次元コンデンサ","文明アーカイブ"];
  const facilityBase=[.4,3,18,100,650,4200];
  function facilityCps() { let total=0;S.facilities.forEach((n,i)=>{let spec=S.facilitySpecs[i]||"balanced", mult=spec==="speed"?1.25:spec==="efficiency"?1.08:spec==="burst"?1.16:1;total+=n*facilityBase[i]*mult;});return total*(1+S.levels.factory*.22+relicBonus("factory")+relicBonus("all"))*(S.overloadUntil>now()?3:1)*(S.branch==="conqueror"?1.2:1)*(S.laws.includes("golden")?1.15:1); }
  function startBoss(secret=false) {
    if(S.boss.active)return;
    const id=secret?99:(S.boss.wins%5)+1, hp=Math.max(100,Math.pow(4,S.boss.wins+1)*150)*(1+(S.newInfinity||0)*4);
    S.boss={active:true,id,hp,maxHp:hp,phase:0,part:0,wins:S.boss.wins||0,secret}; discover("boss",id);log("ボス出現",secret?"THE UNOBSERVED":"VOID OBSERVER #"+id);toast("BOSS DETECTED",secret?"THE UNOBSERVED":"虚無の観測者が出現");render();
  }
  function attackBoss() {
    if(!S.boss.active)return startBoss(false);
    let dmg=Math.max(1,clickPower()*(1+S.levels.boss*.45)*(1+relicBonus("boss")+relicBonus("all"))+facilityCps()*2);
    if(S.feverUntil>now())dmg*=2;
    const parts=[1,1.4,1.8]; dmg*=parts[S.boss.part]||1;
    S.boss.hp-=dmg;S.stats.bossDamage+=dmg;S.matrix+=dmg*.02;S.boss.phase=Math.floor((1-S.boss.hp/S.boss.maxHp)*3);
    if(S.boss.hp<=0) {
      const secret=S.boss.secret; S.boss.active=false;S.boss.wins++;S.prestige+=1+S.boss.wins*.1;S.pendingRewards=true;S.eventWins++;if(weeklyModifier().name==="VOID WEEK")S.chronons+=5;discover("boss-win",S.boss.id);
      S.boss.lastReward=now();log("ボス撃破","報酬を獲得");toast("BOSS DEFEATED","遺物・研究・クロノンを獲得");if(secret&&S.dimensions.filter(x=>x>0).length>=6&&S.timeLanes.filter(x=>x>0).length>=3&&S.boss.wins>=6&&S.codex.length>=1000){S.omegaCleared=true;S.story=9;}
      S.boss.part=0; sound(180,.3,"sawtooth");
    } else if(S.boss.phase>S.boss.part) { S.boss.part=S.boss.phase;toast("BOSS PHASE BROKEN","次の部位が露出した"); }
    render();
  }
  function prestigeGain() {
    let magnitude=energy();
    try { const g=game(); if(g&&typeof window.D==="function"){const d=window.D(g.energy);const lg=d.gt(0)?d.log(10).toNumber():0;if(Number.isFinite(lg))magnitude=Math.max(magnitude,Math.pow(10,Math.min(290,lg)));} } catch(_) {}
    return Math.min(1e9,Math.floor(Math.sqrt(Math.max(0,magnitude)/1000000)))+(S.boss.wins?Math.floor(S.boss.wins/2):0);
  }
  function prestigeNow() {
    const gain=prestigeGain();
    if(gain<1)return toast("PRESTIGE LOCKED","1,000,000 ENERGY以上を獲得して転生");
    if(!confirm(`宇宙を再構築しますか？\n永続OMEGAポイント +${gain}\nエネルギーと施設の一部をリセットします。`))return;
    S.prestige+=gain;S.chronons+=Math.max(1,Math.floor(gain/2));S.stats.resets++;S.facilities=[0,0,0,0,0,0];S.matrix+=gain*100;S.story=Math.max(S.story,Math.min(8,S.prestige));S.dimensions[0]=1;
    const g=game(); if(g){try{g.energy=typeof window.D==="function"?window.D(0):0;g.facCounts=new Array((g.facCounts||[]).length).fill(0);if(window.refreshUI)window.refreshUI();}catch(_){}}
    log("宇宙再構築","+"+gain+" OMEGA");toast("UNIVERSE REBUILT",`永続ポイント +${gain}`);save();render();
  }
  function buyConstellation(id) {
    const cost=10+S.constellations.length*7;
    if(S.chronons<cost)return toast("CHRONONS REQUIRED",fmt(cost)+" CHRONONS");
    if(S.constellations.includes(id))return;
    S.chronons-=cost;S.constellations.push(id);discover("constellation",id);log("星座解放",id);render();
  }
  function startChallenge(type) {
    const seed=(new Date()).toISOString().slice(0,10).replace(/-/g,"")*1;
    S.challenge={type,seed,start:now(),startClicks:S.clicks,progress:0,target:(type==="clicks"||type==="daily")?100:type==="speed"?60:type==="ghost"?Math.max(100,(S.bestCombo||0)+1):500,score:0,deadline:type==="custom"?now()+S.customChallenge.seconds*1000:0};
    if(type==="ghost") S.combo=0;
    S.challengeBest[type]=S.challengeBest[type]||0;log("チャレンジ開始",type);toast("CHALLENGE START",type);render();
  }
  function finishChallenge() {
    if(!S.challenge)return;
    const c=S.challenge;S.challengeBest[c.type]=Math.max(S.challengeBest[c.type]||0,c.progress||0);S.challengeWins++;S.chronons+=5;grantResearch(50);S.challenge=null;toast("CHALLENGE CLEAR","+5 CHRONONS / +50 RP");log("チャレンジ完了",c.type);render();
  }
  function triggerEvent() {
    const events=[
      ["重力異常","クリック倍率が一時的に2倍",()=>{S.feverUntil=now()+15000;}],
      ["時間嵐","クロノンを獲得",()=>{S.chronons+=3+S.levels.luck;}],
      ["反物質雨","エネルギーを獲得",()=>{addEnergy(Math.max(100,energy()*.08+clickPower()*100));}],
      ["文明からの信号","研究ポイントを獲得",()=>{grantResearch(35+S.levels.luck*5);}],
      ["遺物の残響","遺物発見のチャンス",()=>{if(Math.random()<.55+S.levels.luck*.03)grantRelic();else S.matrix+=100;}],
      ["虚無侵食","マトリックスを侵食しようとする異常",()=>{if(S.shieldUntil>now()){toast("SHIELD BLOCKED","虚無侵食を防ぎました");S.shieldUntil=0;}else{const loss=Math.min(S.matrix,300);S.matrix-=loss;toast("VOID EROSION",`MATRIX -${fmt(loss)}`);}}]
    ];
    const e=events[Math.floor(Math.random()*events.length)];S.event={name:e[0],desc:e[1],at:now(),choice:Math.floor(Math.random()*3)};S.eventChain++;S.stats.events++;discover("event",e[0]);log("宇宙イベント",e[0]);toast("COSMIC ANOMALY",e[0]);e[2]();S.eventNextAt=now()+90000+Math.random()*120000;render();
  }
  function claimMission() {
    if(S.mission.claimed || S.mission.progress<S.mission.target)return;
    S.mission.claimed=true;S.matrix+=250;grantResearch(25);S.chronons+=1;toast("MISSION COMPLETE","+250 MATRIX / +25 RP");log("ミッション達成","core taps");render();
  }
  function rotateMission() {
    S.mission={id:(S.mission.id||0)+1,progress:0,target:25+Math.min(475,S.clicks*.02),expires:now()+180000,claimed:false};
  }
  function renderCore() {
    const cpsAll=facilityCps()+cps()*(1+S.levels.idle*.05);
    return `<div class="ox-hero"><small>INFINITY MATRIX / CORE</small><h2>${evolutionName()}</h2><p>クリック・研究・施設・次元を連動させて、宇宙を拡張しよう。</p>
      <div class="ox-statgrid">
        <div><small>MATRIX SHARDS</small><b>${fmt(S.matrix)}</b></div><div><small>RESEARCH POINTS</small><b>${fmt(S.research)}</b></div>
        <div><small>COMBO MULTIPLIER</small><b>×${fmt(comboMultiplier())} <i>${S.combo}</i></b></div><div><small>CRITICAL RATE</small><b>${Math.round(criticalChance()*100)}%</b></div>
        <div><small>OVERDRIVE</small><b>${Math.floor(S.overdrive)}%</b><div class="ox-meter"><span style="width:${S.overdrive}%"></span></div></div>
        <div><small>PASSIVE MATRIX/s</small><b>${fmt(cpsAll+facilityCps())}</b></div></div></div>
      <div class="ox-core-actions"><button data-act="skill" data-id="fever">⚡ FEVER <small>${cdText("fever")}</small></button><button data-act="skill" data-id="shield">◈ SHIELD <small>${cdText("shield")}</small></button><button data-act="skill" data-id="call">✦ CALL <small>${cdText("call")}</small></button><button data-act="skill" data-id="burst">✹ BURST <small>${cdText("burst")}</small></button><button data-act="skill" data-id="blackhole">● BLACK HOLE <small>${cdText("blackhole")}</small></button><button data-act="skill" data-id="overdrive">∞ OVERDRIVE <small>${cdText("overdrive")}</small></button></div>
      <div class="ox-card"><div class="ox-cardhead"><b>DAILY MATRIX</b><span>SEED ${dailySeed()}</span></div><p>今日の共通ルールでクリックと成長を記録。ベストはこの端末に保存されます。</p><button data-act="daily">今日のチャレンジを開始</button> <button data-act="mission">ミッション報酬を受け取る (${Math.min(S.mission.progress,S.mission.target)}/${Math.ceil(S.mission.target)})</button></div>
      <div class="ox-card"><div class="ox-cardhead"><b>NEXT OBJECTIVE</b><span>${nextObjective()}</span></div><p>${nextObjectiveDesc()} · 生産予測 ${etaText()}</p><button data-act="recommend">おすすめ強化を表示</button></div>
      <div class="ox-card"><div class="ox-cardhead"><b>EVOLUTION CORE</b><span>${evolutionName()}</span></div><p>累計クリック ${fmt(S.clicks)} / 最高コンボ ${fmt(S.bestCombo)} / クリティカル ${fmt(S.crits)}</p><div class="ox-progress"><span style="width:${Math.min(100,(S.clicks%1000)/10)}%"></span></div></div>`;
  }
  function nextObjective(){if(S.research<25)return "研究ポイントを25獲得";if(S.facilities.reduce((a,n)=>a+n,0)<1)return "最初の施設を建造";if(S.boss.wins<1)return "虚無の観測者を撃破";if(S.dimensions.filter(x=>x>0).length<2)return "第2次元を解放";return "次の転生 / 図鑑発見";}
  function etaText(){const target=nextObjectiveCost();const rate=cps()+facilityCps();if(!target)return "条件達成";if(rate<=0)return "生産待ち";const secs=Math.max(0,(target-energy())/rate);return secs<1?"すぐ":secs>86400?Math.ceil(secs/86400)+"日":secs>3600?Math.ceil(secs/3600)+"時間":Math.ceil(secs/60)+"分";}
  function nextObjectiveCost(){if(S.facilities.reduce((a,n)=>a+n,0)<1)return 25;if(S.boss.wins<1)return 1000000;if(S.dimensions.filter(x=>x>0).length<2)return 1000;return 0;}
  function nextObjectiveDesc(){if(S.research<25)return "クリックを続けると研究ポイントがたまります。";if(S.facilities.reduce((a,n)=>a+n,0)<1)return "施設はエネルギーを自動生産します。";if(S.boss.wins<1)return "ボス報酬から遺物と永続資源を獲得できます。";if(S.dimensions.filter(x=>x>0).length<2)return "MATRIXを蓄積して別の次元を解放しましょう。";return "研究・施設・イベントを組み合わせてOMEGAを目指そう。";}
  function cdText(id) { const left=Math.max(0,Math.ceil(((S.skillCD[id]||0)-now())/1000));return left?left+"s":"READY"; }
  function dailySeed() { const d=new Date();return Number(`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`); }
  function evolutionName() { const c=S.clicks; const stage=Math.min(100,Math.floor(Math.log10(c+1)*12)+1); const names=["QUANTUM SPARK","FUSION CORE","SINGULARITY","GALACTIC HEART","DIMENSIONAL ENGINE","INFINITY MATRIX"];return names[Math.min(names.length-1,Math.floor((stage-1)/17))]+" · STAGE "+stage+"/100"; }
  function renderResearch() {
    const nodes=researchNodes.map(n=>{const lv=S.levels[n[0]]||0,cost=Math.ceil(n[3]*Math.pow(1.75,lv));return `<article class="ox-node ${lv?"owned":""}"><div class="ox-cardhead"><b>${esc(n[1])}</b><span>LV ${lv}</span></div><p>${esc(n[2])}</p><div class="ox-muted">次のコスト: ${fmt(cost)} RP</div><button data-act="research" data-id="${n[0]}" ${S.research<cost?"disabled":""}>研究する</button></article>`;}).join("");
    const consts=[["pulse","パルス星座","クリック増幅"],["forge","鍛造星座","施設増幅"],["oracle","予言星座","イベントとレア発見"],["eclipse","蝕星座","ボス報酬"],["paradox","逆説星座","転生報酬"],["horizon","地平線星座","次元生産"]];
    return `<div class="ox-statline"><span>RP <b>${fmt(S.research)}</b></span><span>CHRONONS <b>${fmt(S.chronons)}</b></span><span>STAR POINTS <b>${fmt(S.stars)}</b></span></div><div class="ox-grid">${nodes}</div><h3>CONSTELLATION TREE</h3><p class="ox-muted">星座は永続効果。必要クロノンは段階的に増加。</p><div class="ox-grid">${consts.map(c=>`<article class="ox-node ${S.constellations.includes(c[0])?"owned":""}"><b>${c[1]}</b><p>${c[2]}</p><button data-act="constellation" data-id="${c[0]}" ${S.constellations.includes(c[0])?"disabled":""}>${S.constellations.includes(c[0])?"解放済み":"解放 ( "+(10+S.constellations.length*7)+" CHRONONS )"}</button></article>`).join("")}</div>`;
  }
  function renderFactory() {
    return `<div class="ox-statline"><span>施設生産 <b>${fmt(facilityCps())}/s</b></span><span>購入回数 <b>${S.stats.purchases}</b></span><span>過負荷 <b>${S.overloadUntil>now()?"ACTIVE":"READY"}</b></span></div><div class="ox-card"><b>FACTORY OVERDRIVE</b><p>15秒間、施設生産を3倍にします。クールダウン45秒。</p><button data-act="overload" ${S.overloadUntil>now()?"disabled":""}>施設を過負荷にする</button></div><div class="ox-factory-scene">${S.facilities.map((n,i)=>`<div class="ox-fac ${n?"active":""}"><div class="ox-fac-icon">${["◉","▤","⌛","✺","◈","▦"][i]}</div><b>${facilityNames[i]}</b><small>所有 ${n}</small><div class="ox-progress"><span style="width:${Math.min(100,n*5)}%"></span></div><small>生産 ${fmt(n*facilityBase[i])}/s</small></div>`).join("")}</div><div class="ox-grid">${facilityNames.map((n,i)=>{const cost=Math.ceil([25,160,950,5200,28000,160000][i]*Math.pow(1.17,S.facilities[i]||0));return `<article class="ox-node"><b>${n}</b><p>基礎生産 ${fmt(facilityBase[i])}/s</p><p class="ox-muted">価格 ${fmt(cost)} ENERGY</p><button data-act="facility" data-id="${i}" ${energy()<cost?"disabled":""}>建造</button><button data-act="merge" data-id="${i}" ${S.facilities[i]<2?"disabled":""}>2基を合成</button><select data-act="spec" data-id="${i}"><option value="balanced" ${(S.facilitySpecs[i]||"balanced")==="balanced"?"selected":""}>標準型</option><option value="speed" ${S.facilitySpecs[i]==="speed"?"selected":""}>速度型</option><option value="efficiency" ${S.facilitySpecs[i]==="efficiency"?"selected":""}>効率型</option><option value="burst" ${S.facilitySpecs[i]==="burst"?"selected":""}>バースト型</option></select></article>`;}).join("")}</div><div class="ox-card"><b>AUTOMATION RULES</b><p><label><input type="checkbox" data-act="auto" data-id="buy" ${S.autoRules.buy?"checked":""}> 余剰エネルギーで施設を自動購入</label></p><p><label><input type="checkbox" data-act="auto" data-id="research" ${S.autoRules.research?"checked":""}> 研究ポイントを自動獲得</label></p><p><label><input type="checkbox" data-act="auto" data-id="evolve" ${S.autoRules.evolve?"checked":""}> 条件達成で次元を自動解放</label></p></div>`;
  }
  function renderPrestige() {
    const gain=prestigeGain();
    return `<div class="ox-hero"><small>UNIVERSE RECONSTRUCTION</small><h2>${fmt(S.prestige)} OMEGA POINTS</h2><p>現在転生すると永続ポイント +${fmt(Math.max(0,gain))}。クリック、研究、遺物、次元は一部維持されます。</p><button class="primary" data-act="prestige" ${gain<1?"disabled":""}>宇宙を再構築する</button></div><div class="ox-grid"><article class="ox-node"><b>転生経路：科学者</b><p>研究ポイント獲得と数式パズルを強化。</p><button data-act="branch" data-id="scientist">選択</button></article><article class="ox-node"><b>転生経路：征服者</b><p>ボス報酬と施設出力を強化。</p><button data-act="branch" data-id="conqueror">選択</button></article><article class="ox-node"><b>転生経路：時間守護者</b><p>オフライン報酬と時間軸を強化。</p><button data-act="branch" data-id="timekeeper">選択</button></article></div><div class="ox-card"><b>PRESTIGE HISTORY</b><p>再構築回数 ${S.stats.resets} · ボス撃破 ${S.boss.wins} · New Infinity ${S.newInfinity}</p><button data-act="new-infinity">NEW INFINITY ${S.omegaCleared?"解放済み":"（OMEGA達成後）"}</button></div>`;
  }
  function renderBoss() {
    const b=S.boss;
    if(S.pendingRewards)return `<div class="ox-hero"><small>BOSS REWARD SELECT</small><h2>報酬を1つ選択</h2><p>撃破報酬を戦略に合わせて選べます。</p><div class="ox-grid"><article class="ox-node"><b>RELIC CACHE</b><p>ランダム遺物を獲得。</p><button data-act="boss-reward" data-id="relic">遺物を選ぶ</button></article><article class="ox-node"><b>RESEARCH BURST</b><p>大量の研究ポイントを獲得。</p><button data-act="boss-reward" data-id="research">研究を選ぶ</button></article><article class="ox-node"><b>CHRONON CORE</b><p>クロノンと星ポイントを獲得。</p><button data-act="boss-reward" data-id="chronon">時間資源を選ぶ</button></article></div></div>`;
    return `<div class="ox-hero boss"><small>DIMENSIONAL THREAT</small><h2>${b.active?(b.secret?"THE UNOBSERVED":"VOID OBSERVER #"+b.id):"虚無の観測者"}</h2><p>${b.active?"HP "+fmt(Math.max(0,b.hp))+" / "+fmt(b.maxHp):"ボスを召喚し、クリック・研究・施設生産で攻略。撃破すると遺物と永続資源を獲得。"}</p>${b.active?`<div class="ox-progress"><span style="width:${Math.max(0,100*b.hp/b.maxHp)}%"></span></div><div class="ox-boss-parts">${["CORE","ARMOR","AMPLIFIER"].map((x,i)=>`<button data-act="boss-part" data-id="${i}" class="${b.part===i?"selected":""}">${x}</button>`).join("")}</div><button class="primary" data-act="attack">攻撃する</button>`:`<button class="primary" data-act="boss-start">ボスを召喚</button> <button data-act="secret-boss" ${S.secretFlags.includes("hidden-core")?"":"disabled"}>隠しボスを召喚</button>`}<div class="ox-statline"><span>撃破 <b>${b.wins}</b></span><span>総ダメージ <b>${fmt(S.stats.bossDamage)}</b></span><span>獲得クロノン <b>${fmt(S.chronons)}</b></span></div></div><div class="ox-card"><b>戦術</b><p>部位を選択するとダメージ倍率が変化。FEVER中は攻撃力2倍。ボスの各段階を破ると次の部位が露出します。</p></div>`;
  }
  function renderCodex() {
    const pct=Math.floor(S.codex.length/1000*100), ach=achievementList.map(a=>`<article class="ox-node ${S.achievements.includes(a[0])?"owned":""}"><b>${S.achievements.includes(a[0])?"◆":"◇"} ${a[1]}</b><p>${a[2]}</p></article>`).join("");
    const relics=S.relics.map(r=>`<article class="ox-node rarity-${r.rarity}"><b>${esc(r.name)}</b><p>${esc(r.desc)}</p><small>${esc(r.rarity.toUpperCase())}</small></article>`).join("")||'<p class="ox-muted">まだ遺物がありません。イベントやボス戦で発見できます。</p>';
    return `<div class="ox-hero"><small>DISCOVERY MATRIX</small><h2>${S.codex.length} / 1000</h2><div class="ox-progress"><span style="width:${pct}%"></span></div><p>図鑑完成率 ${pct}% · 実績 ${S.achievements.length}/${achievementList.length}</p></div><h3>RELIC VAULT (${S.relics.length})</h3><div class="ox-grid">${relics}</div><h3>ACHIEVEMENTS</h3><div class="ox-grid">${ach}</div><h3>DISCOVERY CATEGORIES</h3><div class="ox-grid">${["click","chain","research","facility","relic","boss","boss-win","event","achievement","constellation","dimension","planet","law","secret","equation","story","timeline","civilization","challenge","skin"].map(k=>{const n=S.codex.filter(x=>x.startsWith(k+":")).length;return `<article class="ox-node"><b>${k.toUpperCase()}</b><p>${n} discoveries</p></article>`;}).join("")}</div>`;
  }
  function renderStrategy() {
    return `<div class="ox-statline"><span>プレイスタイル <b>${playstyle()}</b></span><span>難易度 <b>${S.difficulty}</b></span><span>法則 <b>${S.laws.length}</b></span></div><div class="ox-grid"><article class="ox-node"><b>リスク投資</b><p>現在のエネルギー5%を投資。成功で5倍、失敗で失った分の一部を回収。</p><button data-act="risk">投資する</button></article><article class="ox-node"><b>数式パズル</b><p>数式の構成要素を選んで目標値に到達すると研究を獲得。</p><select id="oxEqA"><option value="2">2</option><option value="3">3</option><option value="5">5</option><option value="8">8</option><option value="13">13</option></select><select id="oxEqOp"><option value="+">+</option><option value="*">×</option><option value="-">−</option></select><select id="oxEqB"><option value="2">2</option><option value="4">4</option><option value="7">7</option><option value="11">11</option></select><button data-act="equation">式を検証</button></article><article class="ox-node"><b>難易度モディファイア</b><p>高難易度は研究報酬を増加。生産の伸びが緩やかになります。</p><select data-act="difficulty"><option value="standard" ${S.difficulty==="standard"?"selected":""}>STANDARD</option><option value="hard" ${S.difficulty==="hard"?"selected":""}>HARD</option><option value="chaos" ${S.difficulty==="chaos"?"selected":""}>CHAOS</option></select></article><article class="ox-node"><b>チャレンジ作成</b><p>独自のクリック数制限と制限時間で挑戦。</p><label>クリック数 <input id="oxCustomClicks" type="number" min="50" max="100000" value="${S.customChallenge.clicks}"></label><label>制限秒数 <input id="oxCustomSeconds" type="number" min="10" max="3600" value="${S.customChallenge.seconds}"></label><label><input id="oxNoAuto" type="checkbox" ${S.customChallenge.noAuto?"checked":""}> 自動化禁止</label><button data-act="custom-challenge">チャレンジ開始</button></article></div><h3>RESOURCE EXCHANGE</h3><div class="ox-card"><p>エネルギー・研究・クロノン・マトリックスを相互変換して不足資源を補う。</p><button data-act="exchange" data-id="energy-rp">1000 ENERGY → 10 RP</button><button data-act="exchange" data-id="rp-chronon">50 RP → 5 CHRONONS</button><button data-act="exchange" data-id="chronon-matrix">10 CHRONONS → 100 MATRIX</button></div><h3>LOADOUTS</h3><div class="ox-card"><input id="oxLoadoutName" maxlength="24" placeholder="ロードアウト名"><button data-act="save-loadout">現在の構成を保存</button><div class="ox-chiprow">${Object.keys(S.loadouts).map(n=>`<button data-act="loadout" data-id="${esc(n)}">${esc(n)}</button>`).join("")}</div><button data-act="respec">研究を再配分（RPの50%返還）</button></div><h3>宇宙法則</h3><div class="ox-grid">${[["golden","黄金律：施設効率 +15%"],["causality","因果律：クリック +20%"],["entropy","エントロピー：イベント報酬 +25%"],["duality","双対性：研究とクロノン相互増幅"]].map(a=>`<article class="ox-node ${S.laws.includes(a[0])?"owned":""}"><b>${a[1]}</b><button data-act="law" data-id="${a[0]}" ${S.laws.includes(a[0])?"disabled":""}>法則を解放（100 CHRONONS）</button></article>`).join("")}</div>`;
  }
  function playstyle() { if(S.clicks>Math.max(100,S.totalSession*3))return "CLICK ARCHITECT";if(facilityCps()>clickPower()*2)return "IDLE ENGINEER";if(S.boss.wins>S.stats.resets)return "VOID HUNTER";return "MATRIX EXPLORER"; }
  function weeklyModifier(){const week=Math.floor((Date.now()/86400000+4)/7)%4;return [{name:"GRAVITY WEEK",desc:"クリック倍率強化"},{name:"CHRONO WEEK",desc:"クロノン報酬強化"},{name:"RELIC WEEK",desc:"遺物発見率強化"},{name:"VOID WEEK",desc:"ボス報酬強化"}][week];}
  function renderEvents() {
    const e=S.event;
    return `<div class="ox-hero"><small>LIVE ANOMALY FEED · WEEKLY LAW: ${weeklyModifier().name}</small><h2>${e?esc(e.name):"宇宙は静穏です"}</h2><p>${e?esc(e.desc):"宇宙異常イベントは一定間隔で発生。研究や幸運レベルで報酬が変化します。"}</p><button data-act="event-now">異常を観測する</button></div><div class="ox-grid"><article class="ox-node"><b>連続イベント</b><p>連鎖 ${S.eventChain} · 成功 ${S.eventWins}</p><button data-act="event-now">イベントを発生</button></article><article class="ox-node"><b>タイムアタック</b><p>制限時間内にクリック目標を達成。</p><button data-act="challenge" data-id="clicks">100クリックに挑戦</button></article><article class="ox-node"><b>生産スプリント</b><p>一定時間の成長を競うローカルチャレンジ。</p><button data-act="challenge" data-id="speed">60秒スプリント</button></article><article class="ox-node"><b>生存チャレンジ</b><p>資源目標に到達するチャレンジ。</p><button data-act="challenge" data-id="survival">資源目標に挑戦</button></article></div><h3>EVENT HISTORY</h3><div class="ox-list">${S.history.filter(x=>/イベント|異常|発見/.test(x.label)).slice(0,15).map(x=>`<div><b>${esc(x.label)}</b><span>${esc(x.detail)} · ${new Date(x.t).toLocaleTimeString()}</span></div>`).join("")||"<p class='ox-muted'>イベント記録はまだありません。</p>"}</div>`;
  }
  function renderSocial() {
    const best=JSON.stringify({clicks:S.clicks,bestCombo:S.bestCombo,bossWins:S.boss.wins,codex:S.codex.length,prestige:S.prestige,title:S.title,skin:S.skin});
    return `<div class="ox-hero"><small>LOCAL RECORDS</small><h2>${fmt(S.bestEnergy)} ENERGY</h2><p>最高コンボ ×${S.bestCombo} · ボス撃破 ${S.boss.wins} · 図鑑 ${S.codex.length}/1000</p><button data-act="share-card">成長カードを表示</button> <button data-act="export-record">記録コードをコピー</button></div><div class="ox-grid"><article class="ox-node"><b>自己ベスト更新</b><p>最高エネルギー ${fmt(S.bestEnergy)} / 最高CPS ${fmt(S.bestCps)}</p></article><article class="ox-node"><b>ゴーストラン</b><p>過去の最高コンボとクリック記録を目標にする。</p><button data-act="ghost">ゴースト記録を開始</button></article><article class="ox-node"><b>フレンド対戦（同一端末）</b><p>同じ端末で交代し、制限時間内のクリック数を比較。</p><button data-act="duel">対戦を開始</button></article><article class="ox-node"><b>ローカルランキング</b><p>この端末内の自己ベストのみを保存。オンライン世界順位はサーバー未接続のため表示しません。</p><button data-act="local-rank">ローカル記録を更新</button></article></div><div class="ox-card"><b>REPLAY / EVENT TIMELINE</b><div class="ox-list">${S.replay.slice(0,12).map(x=>`<div><b>${esc(x.label)}</b><span>${esc(x.detail)} · ${new Date(x.t).toLocaleTimeString()}</span></div>`).join("")||"<p class='ox-muted'>プレイイベントがここに記録されます。</p>"}</div></div><div class="ox-card"><b>LOCAL LEADERBOARD</b><div class="ox-list">${(S.localRank||[]).map((r,i)=>`<div><b>#${i+1} ${fmt(r.energy)} ENERGY</b><span>${r.clicks} clicks · combo ${r.combo}</span></div>`).join("")||"<p class='ox-muted'>まだ記録がありません。</p>"}</div></div><div id="oxShareOutput" class="ox-share"></div>`;
  }
  function renderOmega() {
    const dimensions=["BASE UNIVERSE","ANTIMATTER REALM","CHRONO REALM","NEBULA REALM","PARADOX REALM","OMEGA REALM"];
    return `<div class="ox-hero omega"><small>INFINITY MATRIX / OMEGA</small><h2>${S.omegaCleared?"NEW INFINITY AVAILABLE":"MULTI-LAYER OVERDRIVE"}</h2><p>文明、星系、時間軸、次元を同期し、最終観測者へ到達する。</p><div class="ox-statline"><span>DIMENSIONS <b>${S.dimensions.filter(x=>x>0).length}/6</b></span><span>STORY <b>${S.story}/9</b></span><span>NEW INFINITY <b>${S.newInfinity}</b></span></div></div><h3>MULTIDIMENSION MATRIX</h3><div class="ox-grid">${dimensions.map((n,i)=>`<article class="ox-node ${S.dimensions[i]?"owned":""}"><b>${n}</b><p>${S.dimensions[i]?"同期中":"必要資源: "+fmt(Math.pow(10,i+2))+" MATRIX"}</p><button data-act="dimension" data-id="${i}" ${S.dimensions[i]?"disabled":""}>${S.dimensions[i]?"解放済み":"次元を解放"}</button></article>`).join("")}</div><h3>TIME LANES</h3><div class="ox-grid">${["PAST","PRESENT","FUTURE"].map((n,i)=>`<article class="ox-node"><b>${n}</b><p>時間軸レベル ${S.timeLanes[i]}</p><button data-act="timeline" data-id="${i}">クロノンで強化 ( ${10+S.timeLanes[i]*10} )</button></article>`).join("")}</div><h3>GALACTIC CIVILIZATION</h3><div class="ox-card"><p>文明レベル ${S.civLevel} · 惑星 ${S.planets.length} · 研究済み方程式 ${S.equationsSolved}</p><button data-act="planet">惑星を建設（50 MATRIX）</button> <button data-act="civilization">文明を進化（100 MATRIX）</button><button data-act="story">ストーリーを進める</button></div><h3>OMEGA ENDGAME</h3><div class="ox-card"><p>1000種類の図鑑発見、6次元、3時間軸、5回のボス撃破を揃えてOMEGAへ。</p><button data-act="omega-boss">最終観測者を召喚</button><button data-act="new-infinity" ${S.omegaCleared?"":"disabled"}>NEW INFINITY（ルール再構築）</button></div>`;
  }
  function renderSettings() {
    return `<div class="ox-grid"><article class="ox-node"><b>Visual Quality</b><p>低負荷モードは粒子や動きを抑え、描画負荷を下げます。</p><label><input type="checkbox" data-act="setting" data-id="lowFx" ${S.lowFx?"checked":""}> 低負荷モード</label><label><input type="checkbox" data-act="setting" data-id="particles" ${S.settings.particles?"checked":""}> 粒子演出</label><label><input type="checkbox" data-act="setting" data-id="motion" ${S.settings.motion?"checked":""}> モーション演出</label></article><article class="ox-node"><b>Sound</b><label><input type="checkbox" data-act="setting" data-id="sound" ${S.sound?"checked":""}> 効果音を有効化</label><label>音量 <input type="range" min="0" max="1" step=".05" data-act="volume" value="${S.settings.volume}"></label></article><article class="ox-node"><b>Number Format</b><select data-act="notation"><option value="short" ${S.notation==="short"?"selected":""}>短縮表記</option><option value="scientific" ${S.notation==="scientific"?"selected":""}>指数表記</option><option value="full" ${S.notation==="full"?"selected":""}>桁区切り</option></select><label>テーマ <select data-act="theme"><option value="default" ${S.theme==="default"?"selected":""}>OMEGA</option><option value="sakura" ${S.theme==="sakura"?"selected":""}>SAKURA</option><option value="ice" ${S.theme==="ice"?"selected":""}>ICE</option><option value="gold" ${S.theme==="gold"?"selected":""}>GOLD</option><option value="forest" ${S.theme==="forest"?"selected":""}>FOREST</option></select></label><label>コアスキン <select data-act="skin"><option value="omega" ${S.skin==="omega"?"selected":""}>OMEGA</option><option value="prism" ${S.skin==="prism"?"selected":""}>PRISM</option><option value="void" ${S.skin==="void"?"selected":""}>VOID</option><option value="solar" ${S.skin==="solar"?"selected":""}>SOLAR</option><option value="glitch" ${S.skin==="glitch"?"selected":""}>GLITCH</option></select></label></article><article class="ox-node"><b>Save Management</b><p>拡張データは自動保存。ゲーム本体のセーブとは別キーで安全に管理。</p><button data-act="save">今すぐ保存</button><button data-act="style-code">コア外観コードをコピー</button><input id="oxStyleCode" placeholder="OX1|theme|skin|notation"><button data-act="apply-style">外観コードを適用</button><button data-act="export-save">拡張セーブをエクスポート</button><label class="ox-import">セーブを読み込み<input type="file" id="oxImportFile" accept=".json,application/json"></label><button class="danger" data-act="reset">拡張データを初期化</button><p id="oxSaveStatus" class="ox-muted">SAVE OK</p></article></div><div class="ox-card"><b>ACCESSIBILITY & INPUT</b><p>キーボード: Space=コア / 1-6=スキル / O=OMEGAパネル / Esc=閉じる。タッチ操作にも対応。</p><button data-act="tutorial">チュートリアルを再表示</button></div>`;
  }
  function render() {
    if(!$("oxContent"))return;
    const map={core:renderCore,research:renderResearch,factory:renderFactory,prestige:renderPrestige,boss:renderBoss,codex:renderCodex,strategy:renderStrategy,events:renderEvents,social:renderSocial,omega:renderOmega,settings:renderSettings};
    $("oxContent").innerHTML=(map[activeTab]||renderCore)();
    document.querySelectorAll("[data-ox-tab]").forEach(b=>b.classList.toggle("active",b.dataset.oxTab===activeTab));
    renderStatus();
  }
  function renderStatus() {
    const el=$("oxMiniStatus");if(el)el.innerHTML=`<span>ENERGY <b>${fmt(energy())}</b></span><span>RP <b>${fmt(S.research)}</b></span><span>COMBO <b>${S.combo}</b></span><span>CODEX <b>${S.codex.length}/1000</b></span>`;
    const combo=$("eh-combo");if(combo)combo.textContent="×"+fmt(comboMultiplier());
    const core=$("coreTrigger");if(core){core.style.setProperty("--combo-hue",String((170+S.combo*7)%360));core.classList.toggle("combo-hot",S.combo>=10);}
    if(panelOpen && activeTab==="core") { /* render only on the normal tick */ }
  }
  function injectUI() {
    if($("omegaExpansionRoot"))return;
    const css=document.createElement("style");css.id="omegaExpansionStyle";css.textContent=`
#omegaExpansionRoot{position:fixed;z-index:1000000;inset:0;display:none;background:rgba(2,1,8,.94);backdrop-filter:blur(12px);color:#edfaff;font-family:system-ui,Segoe UI,sans-serif}
#omegaExpansionRoot.open{display:flex;flex-direction:column}#omegaExpansionRoot *{box-sizing:border-box}
#oxTop{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #2d4257;background:linear-gradient(100deg,#071b25,#13091f)}
#oxBrand{font-weight:950;letter-spacing:1.5px;background:linear-gradient(90deg,#7af9ed,#d57aff,#ff5ebc);background-clip:text;color:transparent;font-size:clamp(15px,2vw,22px)}#oxMiniStatus{display:flex;gap:12px;flex:1;flex-wrap:wrap;font-size:11px;color:#91a9bc}#oxMiniStatus b{color:#4cf5d1}#oxClose{background:#241326;border:1px solid #8d3f7d;color:#fff;border-radius:9px;padding:9px 14px;cursor:pointer}
#oxTabs{display:flex;gap:6px;padding:9px 12px;overflow-x:auto;border-bottom:1px solid #263b4c;background:#080b14;scrollbar-width:thin}#oxTabs button{white-space:nowrap;background:#101a27;border:1px solid #293a50;color:#a9bfd1;padding:9px 12px;border-radius:8px;font-weight:800;cursor:pointer}#oxTabs button.active{color:#07151b;background:linear-gradient(100deg,#4ff1d0,#a9a1ff);border-color:#70ffeb}
#oxContent{padding:16px;overflow:auto;flex:1;max-width:1450px;width:100%;margin:0 auto}#oxContent h3{margin:22px 0 10px;font-size:13px;letter-spacing:2px;color:#72f4dc}#oxContent p{font-size:13px;line-height:1.5;color:#b9c8d9}#oxContent button,#oxContent select,#oxContent input{font:inherit}#oxContent button{cursor:pointer;background:#122434;color:#dffaff;border:1px solid #2f6271;border-radius:8px;padding:9px 12px;font-size:12px;font-weight:800}#oxContent button:hover{filter:brightness(1.25);border-color:#6af5df}#oxContent button:disabled{opacity:.35;cursor:not-allowed;filter:none}#oxContent button.primary{background:linear-gradient(100deg,#0e8c7d,#7042b9);border-color:#7ff8e6;color:white;padding:12px 18px}#oxContent button.danger{border-color:#c24a67;background:#351421}#oxContent input,#oxContent select{background:#08111d;color:#e5f5ff;border:1px solid #35475c;border-radius:6px;padding:7px;max-width:100%}
.ox-hero{border:1px solid #314d64;border-radius:14px;padding:20px;background:radial-gradient(circle at 90% 0%,rgba(0,255,204,.12),transparent 45%),linear-gradient(135deg,#0b1d2a,#180d26);margin-bottom:16px}.ox-hero small{color:#71f3dc;letter-spacing:3px;font-weight:900}.ox-hero h2{font-size:clamp(22px,4vw,38px);margin:8px 0;color:#f2f8ff}.ox-hero.omega{background:radial-gradient(circle at 50% 0%,rgba(211,80,255,.2),transparent 50%),linear-gradient(135deg,#080c22,#200b28)}.ox-hero.boss{border-color:#a33d72;background:radial-gradient(circle at 70% 30%,rgba(255,0,110,.18),transparent 45%),#160b1b}
.ox-statgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin:12px 0}.ox-statgrid>div,.ox-statline span{background:#0a1522;border:1px solid #1e3b4d;border-radius:9px;padding:10px;min-width:0}.ox-statgrid small{display:block;font-size:9px;letter-spacing:1.2px;color:#7794a9}.ox-statgrid b{display:block;font-size:18px;color:#e8ffff;overflow-wrap:anywhere}.ox-statgrid i{font-size:11px;color:#92a5b6;font-style:normal}
.ox-statline{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.ox-statline span{flex:1;font-size:11px;color:#94aabd}.ox-statline b{color:#6df4d9;margin-left:6px}.ox-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:10px}.ox-node,.ox-card{background:linear-gradient(135deg,rgba(15,28,44,.94),rgba(16,10,29,.94));border:1px solid #293e53;border-radius:11px;padding:13px;min-width:0}.ox-node.owned{border-color:#36bda8;box-shadow:inset 0 0 18px #00ffcc0b}.ox-node b,.ox-card b{color:#dffcff;font-size:13px}.ox-node p{min-height:32px;margin:8px 0}.ox-node button{margin:3px 3px 0 0}.ox-muted{font-size:11px;color:#7891a5}.ox-cardhead{display:flex;align-items:center;justify-content:space-between;gap:8px}.ox-cardhead span{color:#59e9d1;font-size:11px;font-weight:900}.ox-meter,.ox-progress{height:7px;border-radius:8px;background:#101421;overflow:hidden;border:1px solid #253749;margin:8px 0}.ox-meter span,.ox-progress span{display:block;height:100%;background:linear-gradient(90deg,#39f5cb,#bb65ff,#ff4eac);transition:width .18s}.ox-core-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:7px;margin:12px 0}.ox-core-actions button{min-height:48px}.ox-core-actions small{display:block;color:#72e9d7;font-size:10px;margin-top:3px}.ox-factory-scene{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:14px 0}.ox-fac{background:#090f1b;border:1px solid #263b50;border-radius:9px;padding:12px;text-align:center;opacity:.65}.ox-fac.active{opacity:1;border-color:#2da996;box-shadow:0 0 20px #00ffcc10}.ox-fac-icon{font-size:28px;color:#6bf4dd}.ox-fac b{display:block;font-size:11px}.ox-fac small{display:block;color:#8fa7bb;font-size:10px;margin-top:6px}.ox-boss-parts,.ox-chiprow{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}.ox-boss-parts .selected{background:#8b245d!important;border-color:#ff72bb!important}.ox-list{display:grid;gap:5px}.ox-list>div{display:flex;justify-content:space-between;gap:12px;padding:8px 10px;border-radius:7px;background:#0a1320;border:1px solid #1d3042;font-size:11px}.ox-list span{color:#90a5b9;text-align:right}.ox-progress{height:8px}.ox-toast{position:relative;min-width:240px;max-width:360px;background:#0b1726;border:1px solid #49e5ce;border-radius:10px;padding:12px 15px;box-shadow:0 10px 35px #0008;animation:oxToastIn .2s ease-out}.ox-toast b,.ox-toast span{display:block}.ox-toast b{font-size:11px;letter-spacing:1px;color:#6af4db}.ox-toast span{font-size:12px;color:#eaf7ff;margin-top:4px}.ox-toast.out{opacity:0;transform:translateX(20px);transition:.25s}.ox-share{margin-top:12px;padding:12px;border:1px dashed #51cdbc;border-radius:10px;white-space:pre-wrap;overflow-wrap:anywhere;color:#d8faff}.ox-import{display:inline-block;margin:8px 0;color:#c7d6e5}.ox-import input{display:block;margin-top:6px}.rarity-rare{border-color:#4c9bff}.rarity-epic{border-color:#bb66ff}.rarity-legendary{border-color:#ffce60;box-shadow:0 0 16px #ffce6010}.ox-toast-host{position:fixed;z-index:1000002;right:14px;top:65px;display:grid;gap:8px;pointer-events:none}
#oxLauncher{position:fixed;z-index:99998;right:14px;bottom:14px;border:1px solid #66ffe5;background:linear-gradient(120deg,#0d2a38,#351344);color:#eaffff;border-radius:14px;padding:12px 15px;font-weight:950;letter-spacing:1px;box-shadow:0 0 22px #00ffcc22;cursor:pointer}#oxLauncher span{display:block;font-size:9px;color:#78e7d8;font-weight:700;margin-top:3px}
body.ox-lowfx *,body.ox-lowfx *:before,body.ox-lowfx *:after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
@keyframes oxToastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@media(max-width:720px){#oxTop{align-items:flex-start;flex-wrap:wrap}#oxMiniStatus{order:3;flex-basis:100%}#oxContent{padding:10px}#oxTabs{padding:7px}#oxTabs button{padding:8px 10px}.ox-list>div{display:block}.ox-list span{display:block;text-align:left;margin-top:4px}.ox-hero{padding:15px}}
#oxFxLayer{position:fixed;inset:0;pointer-events:none;z-index:99997;overflow:hidden}.ox-fx{position:absolute;left:50%;top:42%;font-weight:1000;font-size:clamp(14px,2vw,28px);color:#7affed;text-shadow:0 0 15px currentColor;animation:oxFxBurst .8s ease-out forwards;white-space:nowrap}.ox-fx.crit{color:#ff62c8;font-size:clamp(18px,3vw,34px)}.ox-fx.rhythm{color:#f7ee74}.ox-fx.chain{color:#8d9cff}.ox-fx.digit{font-size:12px;color:#72e7ff;animation:oxDigitFall .95s ease-in forwards}@keyframes oxDigitFall{0%{opacity:0;transform:translateY(-10px)}15%{opacity:1}100%{opacity:0;transform:translateY(130px)}}@keyframes oxFxBurst{0%{opacity:0;transform:translate(-50%,15px) scale(.7)}20%{opacity:1}100%{opacity:0;transform:translate(-50%,-80px) scale(1.35)}}
html.ox-theme-sakura #omegaExpansionRoot{background:rgba(25,4,15,.96)}html.ox-theme-sakura #oxBrand{background-image:linear-gradient(90deg,#fff,#ff8fab,#f472b6)}
html.ox-theme-ice #omegaExpansionRoot{background:rgba(2,14,25,.96)}html.ox-theme-gold #omegaExpansionRoot{background:rgba(18,12,2,.96)}html.ox-theme-forest #omegaExpansionRoot{background:rgba(3,20,10,.96)}
#coreTrigger.ox-skin-prism{filter:hue-rotate(55deg) saturate(1.6);box-shadow:0 0 36px #b56cff!important}
#coreTrigger.ox-skin-void{filter:grayscale(.2) hue-rotate(220deg);box-shadow:0 0 42px #7b2cff!important}
#coreTrigger.ox-skin-solar{filter:hue-rotate(310deg) saturate(1.7);box-shadow:0 0 38px #ff8b24!important}
#coreTrigger.ox-skin-glitch{filter:hue-rotate(130deg) contrast(1.3);box-shadow:0 0 30px #ff3ecf!important}
@media(prefers-reduced-motion:reduce){#omegaExpansionRoot *,#omegaExpansionRoot *:before,#omegaExpansionRoot *:after{animation:none!important;transition:none!important}}
`;
    document.head.appendChild(css);
    const root=document.createElement("div");root.id="omegaExpansionRoot";root.setAttribute("aria-label","INFINITY MATRIX OMEGA expansion panel");
    root.innerHTML=`<div id="oxTop"><div id="oxBrand">INFINITY MATRIX <span style="color:#ff69c8">OMEGA</span> <small style="font-size:10px;color:#93a8bc">EXPANSION 1.1 PORTABLE</small></div><div id="oxMiniStatus"></div><button id="oxClose" aria-label="閉じる">閉じる ✕</button></div><nav id="oxTabs" aria-label="OMEGA systems">${tabs.map(t=>`<button data-ox-tab="${t[0]}">${t[2]} ${t[1]}</button>`).join("")}</nav><main id="oxContent"></main>`;
    document.body.appendChild(root);
    const toastHost=document.createElement("div");toastHost.id="oxToastHost";toastHost.className="ox-toast-host";toastHost.setAttribute("aria-live","polite");document.body.appendChild(toastHost);
    const fx=document.createElement("div");fx.id="oxFxLayer";fx.setAttribute("aria-hidden","true");document.body.appendChild(fx);
    const launcher=document.createElement("button");launcher.id="oxLauncher";launcher.innerHTML='✦ OMEGA SYSTEMS<span>100 SYSTEMS / MULTI-DIMENSION</span>';launcher.addEventListener("click",openPanel);document.body.appendChild(launcher);
    $("oxClose").addEventListener("click",closePanel);
    $("oxTabs").addEventListener("click",e=>{const b=e.target.closest("[data-ox-tab]");if(!b)return;activeTab=b.dataset.oxTab;render();});
    root.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act,id=b.dataset.id;handleAction(a,id,b);});
    root.addEventListener("change",e=>{const el=e.target;if(!el.dataset.act)return;const a=el.dataset.act,id=el.dataset.id;
      if(a==="spec"){S.facilitySpecs[id]=el.value;save();render();}
      if(a==="auto"){S.autoRules[id]=el.checked;save();}
      if(a==="setting"){if(id==="lowFx"){S.lowFx=el.checked;document.body.classList.toggle("ox-lowfx",S.lowFx);}else if(id==="sound")S.sound=el.checked;else S.settings[id]=el.checked;save();render();}
      if(a==="volume"){S.settings.volume=Number(el.value);save();}
      if(a==="notation"){S.notation=el.value;save();}
      if(a==="theme"){S.theme=el.value;applyTheme();save();}
      if(a==="skin"){S.skin=el.value;applySkin();save();render();}
      if(a==="difficulty"){S.difficulty=el.value;save();render();}
    });
    root.addEventListener("click",e=>{if(e.target.id==="oxImportFile")return;});
    root.addEventListener("change",e=>{if(e.target.id==="oxImportFile"){const file=e.target.files&&e.target.files[0];if(file){const r=new FileReader();r.onload=()=>{try{const parsed=JSON.parse(r.result);if(parsed.version!==1)throw Error("bad");S=Object.assign(fresh(),parsed);S.levels=Object.assign(fresh().levels,parsed.levels||{});S.stats=Object.assign(fresh().stats,parsed.stats||{});S.facilities=Array.isArray(parsed.facilities)?Array.from({length:6},(_,i)=>Math.max(0,Math.floor(Number(parsed.facilities[i])||0))):fresh().facilities;S.codex=Array.isArray(parsed.codex)?parsed.codex.slice(-1000):[];S.relics=Array.isArray(parsed.relics)?parsed.relics:[];save();render();toast("IMPORT COMPLETE","拡張セーブを読み込みました");}catch(_){toast("IMPORT FAILED","JSONセーブを確認してください");}};r.readAsText(file);}}});
    $("oxContent").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="oxLoadoutName")handleAction("save-loadout");});
    const core=$("coreTrigger");if(core)core.addEventListener("click",onCoreClick);
    document.addEventListener("keydown",e=>{
      if(e.target.matches("input,textarea,select"))return;
      if(e.key==="Escape"&&panelOpen)closePanel();
      if(e.key.toLowerCase()==="o"){panelOpen?closePanel():openPanel();}
      if(e.code==="Space"&&!panelOpen&&core){e.preventDefault();core.click();}
      const keys={"1":"fever","2":"shield","3":"call","4":"burst","5":"blackhole","6":"overdrive"};if(keys[e.key])useSkill(keys[e.key]);
    });
    applyTheme();
    applySkin();
  }
  function applyTheme(){
    document.documentElement.classList.remove("ox-theme-sakura","ox-theme-ice","ox-theme-gold","ox-theme-forest");
    if(S.theme!=="default")document.documentElement.classList.add("ox-theme-"+S.theme);
  }
  function applySkin(){
    const core=$("coreTrigger");if(!core)return;
    core.classList.remove("ox-skin-omega","ox-skin-prism","ox-skin-void","ox-skin-solar","ox-skin-glitch");
    core.classList.add("ox-skin-"+(S.skin||"omega"));
  }
  function openPanel(){panelOpen=true;$("omegaExpansionRoot").classList.add("open");render();}
  function closePanel(){panelOpen=false;$("omegaExpansionRoot").classList.remove("open");save();}
  function handleAction(a,id,b) {
    if(a==="skill")return useSkill(id);
    if(a==="research")return buyResearch(id);
    if(a==="facility")return buyFacility(Number(id));
    if(a==="merge"){const i=Number(id);if((S.facilities[i]||0)<2)return;S.facilities[i]-=2;if(i<5)S.facilities[i+1]++;else S.facilities[5]++;S.matrix+=20;discover("facility-merge",i+":"+S.facilities[i+1]);toast("FACILITIES MERGED","生産ラインを進化");return render();}
    if(a==="overload"){S.overloadUntil=now()+15000;S.skillCD.factory=now()+45000;toast("FACTORY OVERDRIVE","施設生産3倍 / 15秒");return render();}
    if(a==="recommend"){const n=researchNodes.slice().sort((a,b)=>((S.levels[a[0]]||0)+1)/a[3]-((S.levels[b[0]]||0)+1)/b[3])[0];toast("RECOMMENDED UPGRADE",n[1]+" · "+n[2]);activeTab="research";return render();}
    if(a==="boss-reward"){S.pendingRewards=false;if(id==="relic")grantRelic();else if(id==="research")grantResearch(100+S.boss.wins*30);else{S.chronons+=15+S.boss.wins*2;S.stars+=8;}log("ボス報酬選択",id);return render();}
    if(a==="constellation")return buyConstellation(id);
    if(a==="attack")return attackBoss();
    if(a==="boss-start")return startBoss(false);
    if(a==="secret-boss")return startBoss(true);
    if(a==="boss-part"){S.boss.part=Number(id);return render();}
    if(a==="prestige")return prestigeNow();
    if(a==="branch"){S.branch=id;discover("branch",id);toast("ASCENSION PATH",id);return render();}
    if(a==="new-infinity"){if(!S.omegaCleared)return toast("OMEGA LOCKED","最終条件を満たしてください");S.newInfinity++;S.prestige+=5;S.dimensions=[1,0,0,0,0,0];S.facilities=[0,0,0,0,0,0];S.story=0;S.omegaCleared=false;S.laws=[];S.matrix+=1000;log("NEW INFINITY","ルール再構築 "+S.newInfinity);save();return render();}
    if(a==="dimension"){const i=Number(id),cost=Math.pow(10,i+2);if(S.matrix<cost)return toast("MATRIX REQUIRED",fmt(cost)+" MATRIX");S.matrix-=cost;S.dimensions[i]=1;S.story=Math.max(S.story,i+1);discover("dimension",i);log("次元解放",String(i+1));return render();}
    if(a==="timeline"){const i=Number(id),cost=10+S.timeLanes[i]*10;if(S.chronons<cost)return toast("CHRONONS REQUIRED",fmt(cost));S.chronons-=cost;S.timeLanes[i]++;discover("timeline",i+":"+S.timeLanes[i]);return render();}
    if(a==="planet"){if(S.matrix<50)return toast("MATRIX REQUIRED","50 MATRIX");S.matrix-=50;S.planets.push({id:S.planets.length+1,level:1,created:now()});discover("planet",S.planets.length);return render();}
    if(a==="civilization"){if(S.matrix<100)return toast("MATRIX REQUIRED","100 MATRIX");S.matrix-=100;S.civLevel++;S.research+=20;discover("civilization",S.civLevel);return render();}
    if(a==="story"){S.story=Math.min(9,S.story+1);discover("story",S.story);toast("CHAPTER UNLOCKED","CHAPTER "+S.story);return render();}
    if(a==="omega-boss"){const dims=S.dimensions.filter(x=>x>0).length,lanes=S.timeLanes.filter(x=>x>0).length;if(dims<6||lanes<3||S.boss.wins<5||S.codex.length<1000){return toast("OMEGA LOCKED",`条件: 次元 ${dims}/6 · 時間軸 ${lanes}/3 · ボス ${S.boss.wins}/5 · 図鑑 ${S.codex.length}/1000`);}return startBoss(true);}
    if(a==="daily"){const date=new Date().toISOString().slice(0,10);if(S.daily.date!==date)S.daily={date,score:0,seed:dailySeed()};startChallenge("daily");return;}
    if(a==="mission")return claimMission();
    if(a==="event-now")return triggerEvent();
    if(a==="challenge")return startChallenge(id);
    if(a==="exchange"){if(id==="energy-rp"){if(spendEnergy(1000)){S.research+=10;toast("EXCHANGE COMPLETE","+10 RP");}else toast("ENERGY REQUIRED","1000必要");}else if(id==="rp-chronon"){if(S.research>=50){S.research-=50;S.chronons+=5;}else toast("RP REQUIRED","50必要");}else if(id==="chronon-matrix"){if(S.chronons>=10){S.chronons-=10;S.matrix+=100;}else toast("CHRONONS REQUIRED","10必要");}return render();}
    if(a==="risk"){const n=energy()*.05;if(n<1)return toast("RISK LOCKED","エネルギーが不足");spendEnergy(n);if(Math.random()<.55){addEnergy(n*5);grantResearch(10);toast("RISK WON","投資利益 +"+fmt(n*4));}else{addEnergy(n*.4);toast("RISK LOST","一部を回収");}log("リスク投資",fmt(n));return render();}
    if(a==="equation"){const x=Number($("oxEqA").value),y=Number($("oxEqB").value),op=$("oxEqOp").value,v=op==="+"?x+y:op==="*"?x*y:x-y;if(v===10||v===14||v===21){S.equationsSolved++;grantResearch(35);S.chronons+=2;discover("equation",`${x}${op}${y}`);toast("EQUATION SOLVED",`${v} → +35 RP`);}else toast("EQUATION UNSTABLE",`結果 ${v}。目標値を探そう`);return render();}
    if(a==="custom-challenge"){S.customChallenge.clicks=clamp($("oxCustomClicks").value,50,100000);S.customChallenge.seconds=clamp($("oxCustomSeconds").value,10,3600);S.customChallenge.noAuto=$("oxNoAuto").checked;S.challenge={type:"custom",seed:dailySeed(),start:now(),progress:0,target:S.customChallenge.clicks,deadline:now()+S.customChallenge.seconds*1000};toast("CUSTOM CHALLENGE",`${S.challenge.target} clicks`);return render();}
    if(a==="save-loadout"){const n=($("oxLoadoutName")?.value||"").trim();if(!n)return toast("NAME REQUIRED","ロードアウト名を入力");S.loadouts[n]={levels:Object.assign({},S.levels),facilities:S.facilities.slice(),specs:Object.assign({},S.facilitySpecs),tree:S.tree.slice()};S.activeLoadout=n;toast("LOADOUT SAVED",n);return render();}
    if(a==="loadout"){const l=S.loadouts[id];if(l){S.levels=Object.assign({},l.levels);S.facilities=l.facilities.slice();S.facilitySpecs=Object.assign({},l.specs);S.tree=l.tree.slice();S.activeLoadout=id;toast("LOADOUT LOADED",id);}return render();}
    if(a==="respec"){const total=Object.values(S.levels).reduce((a,n)=>a+(Number(n)||0),0);S.research+=total*12;S.levels=fresh().levels;toast("RESEARCH RESET","投資RPの一部を返還");return render();}
    if(a==="law"){if(S.chronons<100)return toast("CHRONONS REQUIRED","100必要");S.chronons-=100;S.laws.push(id);discover("law",id);return render();}
    if(a==="share-card"){const out=$("oxShareOutput");if(out)out.textContent=`INFINITY MATRIX - OMEGA\nENERGY ${fmt(energy())}\nCLICKS ${S.clicks}\nBEST COMBO ${S.bestCombo}\nBOSS WINS ${S.boss.wins}\nCODEX ${S.codex.length}/1000\nTITLE ${S.title}\nNEW INFINITY ${S.newInfinity}`;return;}
    if(a==="export-record"){const txt=btoa(unescape(encodeURIComponent(JSON.stringify({v:1,clicks:S.clicks,bestCombo:S.bestCombo,bossWins:S.boss.wins,codex:S.codex.length,prestige:S.prestige,title:S.title,skin:S.skin}))));copyText(txt);toast("RECORD CODE", "コピーしました");return;}
    if(a==="ghost"){S.challenge={type:"ghost",seed:dailySeed(),start:now(),progress:0,target:Math.max(100,S.bestCombo)};toast("GHOST RUN",`目標コンボ ${S.bestCombo}`);return render();}
    if(a==="duel"){S.challenge={type:"duel",seed:dailySeed(),start:now(),progress:0,target:30,player:1,score1:0,score2:0};toast("LOCAL DUEL","プレイヤー1の30クリックから開始");return render();}
    if(a==="local-rank"){S.localRank=S.localRank||[];S.localRank.push({date:new Date().toLocaleString(),energy:energy(),clicks:S.clicks,combo:S.bestCombo});S.localRank.sort((x,y)=>y.energy-x.energy);S.localRank=S.localRank.slice(0,10);toast("LOCAL RECORD SAVED","端末内ランキングを更新");return render();}
    if(a==="style-code"){const code=["OX1",S.theme,S.skin,S.notation].join("|");copyText(code);toast("STYLE CODE COPIED",code);return;}
    if(a==="apply-style"){const parts=($("oxStyleCode")?.value||"").trim().split("|");if(parts.length===4&&parts[0]==="OX1"){S.theme=parts[1];S.skin=parts[2];S.notation=parts[3];applyTheme();applySkin();save();toast("STYLE APPLIED","コア外観を更新");render();}else toast("INVALID STYLE CODE","OX1|theme|skin|notation 形式");return;}
    if(a==="save"){save();toast("SAVE COMPLETE","OMEGAデータを保存");return;}
    if(a==="export-save"){const blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"});downloadBlob(blob,"infinity-matrix-omega-save.json");return;}
    if(a==="restore-backup"){try{const backup=store.getItem(KEY+"_backup");if(!backup)throw Error("missing");S=Object.assign(fresh(),JSON.parse(backup));save();render();toast("BACKUP RESTORED","バックアップを復元");}catch(_){toast("NO BACKUP","復元可能なバックアップがありません");}return;}
    if(a==="reset"){if(confirm("OMEGA拡張データだけを初期化しますか？本体のセーブは変更しません。")){store.removeItem(KEY);S=fresh();save();render();toast("RESET COMPLETE","拡張データを初期化");}return;}
    if(a==="tutorial"){S.tutorialDone=false;S.tutorialStep=0;toast("TUTORIAL","①コアをクリック ②研究を購入 ③ボスを召喚");return;}
  }
  function copyText(t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).catch(()=>fallbackCopy(t));else fallbackCopy(t);}
  function fallbackCopy(t){const ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");}catch(_){}ta.remove();}
  function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);}
  function tick() {
    const t=now(), dt=clamp(t-lastTick,0,2500)/1000;lastTick=t;
    const mult=S.difficulty==="hard"?.7:S.difficulty==="chaos"?.45:1;
    const passive=(facilityCps()+S.levels.idle*.15+S.dimensions.reduce((a,n,i)=>a+(n?Math.pow(i+1,1.5)*.2:0),0))*(1+S.timeLanes.reduce((a,n)=>a+n*.1,0))*mult;
    if(dt>0){S.matrix+=passive*dt;S.stats.totalEarned+=passive*dt;if(S.challenge&&S.challenge.type==="survival")S.challenge.progress+=passive*dt;}
    const automationAllowed=!(S.challenge&&S.challenge.type==="custom"&&S.customChallenge.noAuto);
    if(automationAllowed&&S.autoRules.research&&Math.random()<.12)grantResearch(.1+S.levels.research*.05);
    if(automationAllowed&&S.autoRules.buy && energy()>5000 && t-(S.lastAutoBuy||0)>3000){const i=facilityNames.length-1;const cost=Math.ceil([25,160,950,5200,28000,160000][i]*Math.pow(1.17,S.facilities[i]||0));if(energy()>cost*2){S.lastAutoBuy=t;buyFacility(i);}}
    if(automationAllowed&&S.autoRules.evolve&&S.matrix>1000){const i=S.dimensions.findIndex(x=>!x);if(i>0){S.matrix-=Math.pow(10,i+2);S.dimensions[i]=1;discover("dimension",i);}}
    if(t>S.eventNextAt)triggerEvent();
    if(S.mission.expires<t){if(S.mission.claimed)rotateMission();else S.mission.expires=t+90000;}
    if(S.challenge&&S.challenge.deadline&&t>S.challenge.deadline){const c=S.challenge;if(c.progress>=c.target)finishChallenge();else{toast("CHALLENGE ENDED","次回は戦略を変えて再挑戦");S.challenge=null;}}
    if(S.challenge&&["clicks","custom","survival"].includes(S.challenge.type)&&S.challenge.progress>=S.challenge.target)finishChallenge();
    if(S.challenge&&S.challenge.type==="daily"&&S.challenge.progress>=S.challenge.target){S.daily.score=Math.max(S.daily.score,S.challenge.progress);finishChallenge();}
    if(S.challenge&&S.challenge.type==="speed"&&t-S.challenge.start>=60000){S.challenge.progress=Math.max(S.challenge.progress,S.clicks-(S.challenge.startClicks||0));S.challengeBest.speed=Math.max(S.challengeBest.speed,S.challenge.progress);finishChallenge();}
    if(S.challenge&&S.challenge.type==="duel"&&S.challenge.progress>=30){if(S.challenge.player===1){S.challenge.score1=S.clicks;S.challenge.player=2;S.challenge.progress=0;toast("PLAYER 2","交代して30クリック");}else{S.challenge.score2=S.clicks-S.challenge.score1;toast("DUEL RESULT",`P1 ${S.challenge.score1} / P2 ${S.challenge.score2}`);S.challenge=null;}}
    if(S.challenge&&S.challenge.type==="ghost"&&S.combo>=S.challenge.target){S.challengeBest.ghost=Math.max(S.challengeBest.ghost||0,S.combo);toast("GHOST BEATEN","過去の記録を更新");grantResearch(25);S.challenge=null;save();}
    if(S.mission&&!S.mission.claimed&&S.mission.progress>=S.mission.target){const m=$("oxMiniStatus");if(m)m.title="ミッション報酬を受け取れます";}
    updateMilestones();
    if(t-lastSave>10000&&S.settings.autosave)save();
    if(panelOpen&&activeTab==="core")renderCore();else renderStatus();
  }
  function init() {
    injectUI();load();
    document.body.classList.toggle("ox-lowfx",S.lowFx);
    const date=new Date().toISOString().slice(0,10);if(S.daily.date!==date)S.daily={date,score:0,seed:dailySeed()};
    S.lastAt=now();lastTick=now();render();
    if(!$("omegaExpansionRoot"))return;
    timer=window.setInterval(tick,250);
    window.addEventListener("pagehide",save);window.addEventListener("beforeunload",save);
    // Preserve core game save while adding an independent expansion save.
    const originalSave=window.saveGameManual;
    if(typeof originalSave==="function"&&!originalSave.__omegaWrapped){const wrapped=function(){try{save();}catch(_){}return originalSave.apply(this,arguments);};wrapped.__omegaWrapped=true;window.saveGameManual=wrapped;}
    log("OMEGA EXPANSION","initialized");
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
  window.OmegaExpansion={open:openPanel,close:closePanel,save,version:"1.1-portable",getState:()=>JSON.parse(JSON.stringify(S)),getStorageMode:()=>store.persistent?"persistent":"memory-only"};
})();