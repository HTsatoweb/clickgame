
/**
 * OmegaSyncRecord — ゲーム / エンディング完全同期グラフ v2
 */
(function () {
  "use strict";
  var CFG_KEY = "omega_record_cfg_v1";
  var DATA_KEY = "omega_record_v1";
  var VIEW_KEY = "omega_record_view_v1";
  var CH = "omega_record_sync";
  var MAX_POINTS = 360;
  var HIRES_POINTS = 80;
  var SAVE_EVERY_MS = 25000;
  var PREC_CHOICES = [10, 16, 20, 30, 40, 50, 80, 100];
  var INTERVAL_CHOICES = [0, 250, 500, 1000, 2000, 5000, 10000, 30000, 60000];
  var WINDOW_CHOICES = [[10000,"10秒"],[30000,"30秒"],[120000,"2分"],[600000,"10分"],[1800000,"30分"],[10800000,"3時間"],[0,"全期間"]];

  var cfg = { precision: 16, intervalMs: 2000, showDots: false, overlay: false, maxPoints: 360, paused: false, quality: "low", exactRaw: true };
  var view = { metric: "energy", chart: "line", follow: true, windowMs: 120000, t0: 0, t1: 1, y0: 0, y1: 1, lockY: false };
  var data = null;
  var lastSampleAt = 0, lastPersistAt = 0, lastEnergyLog = null, lastViewPush = 0;
  var applyingRemote = false;
  var pointers = {}, pinch0 = null, drag = null, hoverX = null;
  var measure = { a: null, b: null, step: 0 };
  var rafDraw = 0, channel = null;
  var isEndingPage = /ending\.html$/i.test((location && location.pathname) || "") || document.title.indexOf("Ending") >= 0;

  function now(){ return Date.now(); }
  function clamp(n,a,b){ n=Number(n); if(!isFinite(n)) return a; return Math.max(a, Math.min(b,n)); }
  function loadJson(key, fb){ try { var r=localStorage.getItem(key); if(!r) return fb; var o=JSON.parse(r); return o&&typeof o==="object"?o:fb; } catch(e){ return fb; } }
  function saveJson(key,obj){ try { localStorage.setItem(key, JSON.stringify(obj)); return true; } catch(e){ return false; } }

  function loadCfg(){
    var o=loadJson(CFG_KEY,null); if(!o) return;
    if(typeof o.precision==="number") cfg.precision=Math.max(1, Math.floor(Number(o.precision)||1));
    if(typeof o.intervalMs==="number") cfg.intervalMs=clamp(Math.max(1000, o.intervalMs||2000),1000,3600000);
    if(typeof o.showDots==="boolean") cfg.showDots=o.showDots;
    if(typeof o.overlay==="boolean") cfg.overlay=o.overlay;
    if(typeof o.maxPoints==="number") cfg.maxPoints=Math.max(80, Math.min(400, o.maxPoints));
    if(typeof o.paused==="boolean") cfg.paused=o.paused;
    if(o.quality==="auto"||o.quality==="high"||o.quality==="low") cfg.quality=o.quality;
  }
  function saveCfg(){ saveJson(CFG_KEY,cfg); broadcast("cfg"); }
  function loadView(){
    var o=loadJson(VIEW_KEY,null); if(!o) return;
    if(o.metric) view.metric=o.metric;
    if(o.chart) view.chart=o.chart;
    if(typeof o.follow==="boolean") view.follow=o.follow;
    if(typeof o.windowMs==="number") view.windowMs=o.windowMs;
    if(typeof o.lockY==="boolean") view.lockY=o.lockY;
  }
  function saveView(force){
    var t=now(); if(!force && t-lastViewPush<180) return; lastViewPush=t;
    saveJson(VIEW_KEY,{metric:view.metric,chart:view.chart,follow:view.follow,windowMs:view.windowMs,lockY:view.lockY});
    broadcast("view");
  }
  function emptyData(){
    return {v:2,startedAt:now(),lastAt:now(),samples:0,rev:0,energy:[],cps:[],am:[],ts:[],stars:[],clicks:[],hires:{energy:[],cps:[],am:[],ts:[]},events:[],snapshot:null};
  }
  function loadData(){
    var o=loadJson(DATA_KEY,null); if(!o) return emptyData();
    ["energy","cps","am","ts","stars","clicks","events"].forEach(function(k){ if(!Array.isArray(o[k])) o[k]=[]; });
    if(!o.hires||typeof o.hires!=="object") o.hires={};
    ["energy","cps","am","ts"].forEach(function(k){ if(!Array.isArray(o.hires[k])) o.hires[k]=[]; });
    if(typeof o.startedAt!=="number") o.startedAt=now();
    if(typeof o.lastAt!=="number") o.lastAt=now();
    if(typeof o.samples!=="number") o.samples=0;
    if(typeof o.rev!=="number") o.rev=0;
    function hydrateArr(arr){
      if(!arr) return;
      for(var i=0;i<arr.length;i++){
        var p=arr[i];
        if(!p) continue;
        if(p.raw!=null && p.raw!==""){
          var ly=log10of(p.raw);
          if(isFinite(ly)) p.y=ly;
        }
      }
    }
    ["energy","cps","am","ts","stars","clicks"].forEach(function(k){ hydrateArr(o[k]); });
    if(o.hires)["energy","cps","am","ts"].forEach(function(k){ hydrateArr(o.hires[k]); });
    return o;
  }
  function persistData(force){
    var t=now();
    var wait=Math.max(SAVE_EVERY_MS, Math.min(12000, (cfg.intervalMs||1000)*3));
    if(!force && t-lastPersistAt<wait) return; lastPersistAt=t;
    data.lastAt=t; data.rev=(data.rev||0)+1;
    ["energy","cps","am","ts","stars","clicks"].forEach(function(k){
      if(data[k]&&data[k].length>360) data[k]=data[k].slice(-280);
    });
    if(data.hires){ ["energy","cps","am","ts"].forEach(function(k){ if(data.hires[k]&&data.hires[k].length>80) data.hires[k]=data.hires[k].slice(-64); }); }
    if(data.events&&data.events.length>40) data.events=data.events.slice(-30);
    try{
      var slim={v:data.v,startedAt:data.startedAt,lastAt:data.lastAt,samples:data.samples,rev:data.rev,
        energy:data.energy,cps:data.cps,am:data.am,ts:data.ts,stars:data.stars,clicks:data.clicks,
        hires:data.hires,events:data.events};
      if(!saveJson(DATA_KEY,slim)){
        ["energy","cps","am","ts","stars","clicks"].forEach(function(k){ if(slim[k]) slim[k]=slim[k].slice(-120); });
        saveJson(DATA_KEY,slim);
      }
    }catch(e){}
    if((data.rev%8)===0) broadcast("data");
  }
  function broadcast(kind){
    if(applyingRemote) return;
    try { if(channel) channel.postMessage({kind:kind,at:now(),rev:data&&data.rev}); } catch(e){}
  }
  function onRemote(kind){
    applyingRemote=true;
    try {
      if(!kind||kind==="cfg") loadCfg();
      if(!kind||kind==="view") loadView();
      if(!kind||kind==="data") data=loadData();
      updateSettingsLabels(); updateToolbar(); applyFollow(false); scheduleDraw(); renderMeasure(); renderEvents();
    } finally { applyingRemote=false; }
  }

  function applyPrecision(p,toast){
    p=Math.max(1, Math.floor(Number(p)||1)); cfg.precision=p; saveCfg();
    try { if(typeof Decimal!=="undefined") Decimal.set({precision:p,rounding:Decimal.ROUND_DOWN,toExpNeg:-12,toExpPos:12}); } catch(e){}
    updateSettingsLabels();
    if(toast && typeof createToast==="function") createToast("計算精度", p+" 桁");
  }
  function intervalLabel(ms){ if(!ms) return "制限なし(毎フレーム)"; return ms<1000 ? (ms/1000)+"秒" : (ms/1000)+"秒"; }
  function setIntervalMs(ms){
    cfg.intervalMs=clamp(ms,0,3600000); saveCfg(); updateSettingsLabels();
    if(typeof createToast==="function") createToast("記録間隔", intervalLabel(cfg.intervalMs));
  }

  function toDec(v){ try { if(typeof D==="function") return D(v); if(typeof Decimal!=="undefined") return new Decimal(v); } catch(e){} return null; }
  function valueToExactString(v){
    try {
      if(v==null) return "0";
      if(typeof v==="string") return v;
      var d=toDec(v);
      if(d){
        if(typeof d.toFixed==="function"){
          try { return d.toFixed(); } catch(e0){}
        }
        if(typeof d.toString==="function") return d.toString();
      }
      if(typeof v==="number"){ if(!isFinite(v)) return "0"; return String(v); }
      return String(v);
    } catch(e){ return "0"; }
  }
  function log10of(v){
    try {
      var d=toDec(v);
      if(d){
        if(!d.isFinite()) return 1000;
        if(d.lte(0)) return -12;
        var lg=d.log(10); var n=typeof lg.toNumber==="function"?lg.toNumber():Number(lg);
        return isFinite(n)?n:-6;
      }
    } catch(e){}
    var x=Number(v); if(!isFinite(x)||x<=0) return -12; return Math.log10(x);
  }
  function fmtFromLog(L){
    if(!isFinite(L) || L<=-12) return "0.00";
    if(L<3){ var n0=Math.pow(10,L); return isFinite(n0)?n0.toFixed(2):"0.00"; }
    var exp=Math.floor(L);
    var man=Math.pow(10, L-exp);
    if(!isFinite(man) || man<1) man=1;
    if(man>=9.995){ man=1; exp+=1; }
    return man.toFixed(2)+"e"+exp;
  }
  function fmtTime(ms){
    var sign=ms<0?"-":""; ms=Math.abs(ms); var s=ms/1000;
    var h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=s%60;
    if(h>0) return sign+h+"時間"+m+"分"+sec.toFixed(0)+"秒";
    if(m>0) return sign+m+"分"+sec.toFixed(1)+"秒";
    return sign+sec.toFixed(2)+"秒";
  }
  function downsample(arr,maxN){
    if(!arr||arr.length<=maxN) return arr;
    var out=[arr[0]];
    var buckets=Math.max(1, maxN-2);
    var span=arr.length-2;
    var i,j;
    for(i=0;i<buckets;i++){
      var a=1+Math.floor(i*span/buckets);
      var b=1+Math.floor((i+1)*span/buckets);
      if(b<=a) b=a+1;
      if(b>arr.length-1) b=arr.length-1;
      var mn=arr[a], mx=arr[a];
      for(j=a;j<b;j++){
        if(arr[j].y<mn.y) mn=arr[j];
        if(arr[j].y>mx.y) mx=arr[j];
      }
      if(mn.t<=mx.t){ out.push(mn); if(mx!==mn) out.push(mx); }
      else { out.push(mx); if(mx!==mn) out.push(mn); }
    }
    out.push(arr[arr.length-1]);
    return out;
  }
  function refreshPointY(p){
    if(!p) return p;
    if(p.raw!=null && p.raw!==""){
      var ly=log10of(p.raw);
      if(isFinite(ly)) p.y=ly;
    }
    return p;
  }
  function trimPush(target,t,yLog,maxN,rawStr){
    /* 丸め禁止: グラフ値はそのまま記録する */
    if(!isFinite(yLog)) yLog = -12;
    if(target.length){ var last=target[target.length-1]; if(last.t===t){ last.y=yLog; if(rawStr!=null) last.raw=rawStr; return; } }
    var rec={t:t,y:yLog};
    if(rawStr!=null){
      var rs=String(rawStr);
      if(rs.length>48) rs=rs.slice(0,24)+"e"+rs.length;
      rec.raw=rs;
    }
    target.push(rec);
    if(!maxN) return;
    if(target.length>maxN+40){
      var keep=Math.floor(maxN*0.72);
      var tail=target.slice(-keep);
      var head=downsample(target.slice(0,target.length-keep), Math.max(8, maxN-keep));
      target.length=0;
      for(var i=0;i<head.length;i++) target.push(head[i]);
      for(var j=0;j<tail.length;j++) target.push(tail[j]);
    }
  }
  function getGameSafe(){
    try { if(window && window.game) return window.game; } catch(e){}
    return null;
  }
  function readGameNumber(name){
    try {
      var game=getGameSafe();
      if(!game) return 0;
      if(name==="energy") return game.energy;
      if(name==="am") return game.antimatter;
      if(name==="ts") return game.timeShards;
      if(name==="stars") return game.stars||game.star||0;
      if(name==="clicks") return game.totalClicks||0;
      if(name==="cps") return typeof getTotalCps==="function"?getTotalCps():(game.totalCpsCache||0);
    } catch(e){}
    return 0;
  }
  function snapshotNow(){
    var snap={at:now(),energy:String(readGameNumber("energy")),cps:String(readGameNumber("cps")),am:String(readGameNumber("am")),ts:String(readGameNumber("ts")),stars:String(readGameNumber("stars")),clicks:String(readGameNumber("clicks")),precision:cfg.precision,intervalMs:cfg.intervalMs,player:null};
    try { snap.player=localStorage.getItem("infinity_game_player_name"); } catch(e){}
    try {
      if(typeof formatValue==="function"){
        snap.energyF=formatValue(readGameNumber("energy"));
        snap.cpsF=formatValue(readGameNumber("cps"));
        snap.amF=formatValue(readGameNumber("am"));
        snap.tsF=formatValue(readGameNumber("ts"));
      }
    } catch(e){}
    data.snapshot=snap; return snap;
  }
  function maybeEvent(energyLog){
    var marks=[1,2,3,6,9,12,18,24,36,50,100,308,500,800,1000];
    for(var i=0;i<marks.length;i++){
      var m=marks[i];
      if(lastEnergyLog!=null && lastEnergyLog<m && energyLog>=m){
        data.events.push({t:now(),label:"E 1e"+m,y:m});
        if(data.events.length>100) data.events=data.events.slice(-100);
      }
    }
    lastEnergyLog=energyLog;
  }
  function panelVisible(){
    if(document.hidden) return false;
    if(isEndingPage){
      var end=document.getElementById("endingPlayview");
      return !end || end.style.display!=="none";
    }
    var tab=document.getElementById("tab-playview");
    if(tab && !tab.classList.contains("active")) return false;
    return !!document.getElementById("omegaRecordCard") || !!document.getElementById("omegaRecordMount");
  }
  function sample(force){
    if(isEndingPage) return;
    if(cfg.paused && !force) return;
    if(!getGameSafe()) return;
    var t=now();
    if(!force && cfg.intervalMs>0 && t-lastSampleAt<cfg.intervalMs) return;
    lastSampleAt=t;
    var raws={};
    var vals={};
    ["energy","cps","am","ts","stars","clicks"].forEach(function(k){
      var v=readGameNumber(k);
      raws[k]=valueToExactString(v);
      vals[k]=log10of(v);
    });
    ["energy","cps","am","ts","stars","clicks"].forEach(function(k){ if(!data[k]) data[k]=[]; trimPush(data[k],t,vals[k],cfg.maxPoints||MAX_POINTS,raws[k]); });
    ["energy","cps","am","ts"].forEach(function(k){ if(!data.hires[k]) data.hires[k]=[]; trimPush(data.hires[k],t,vals[k],Math.min(HIRES_POINTS, Math.max(80, (cfg.maxPoints||MAX_POINTS)*0.45)),raws[k]); });
    data.samples+=1; data.lastAt=t; maybeEvent(vals.energy);
    if((data.samples%8)===0) snapshotNow();
    persistData(false);
    applyFollow(false);
    if(panelVisible()) scheduleDraw();
  }
  function flushForEnding(){
    try { sample(true); } catch(e){}
    try { snapshotNow(); } catch(e){}
    try { data.events.push({t:now(),label:"エンディング到達",y:1000}); } catch(e){}
    persistData(true); saveView(true);
    try { if(typeof saveGameManual==="function") saveGameManual(); } catch(e){}
    try { if(typeof serializeGameState==="function" && window.game && typeof STORAGE_KEY!=="undefined") localStorage.setItem(STORAGE_KEY, serializeGameState(window.game)); } catch(e){}
  }

  function seriesOf(metric){
    var coarse=(data&&data[metric])?data[metric]:[];
    var fine=(data&&data.hires&&data.hires[metric])?data.hires[metric]:[];
    if(!fine.length) return coarse;
    if(!coarse.length) return fine;
    var merged=coarse.slice(), lastC=coarse[coarse.length-1].t;
    for(var i=0;i<fine.length;i++){
      if(fine[i].t>=lastC-50){
        if(merged.length && Math.abs(merged[merged.length-1].t-fine[i].t)<50) merged[merged.length-1]=fine[i];
        else merged.push(fine[i]);
      }
    }
    return merged;
  }
  function firstLast(metric){
    var arr=seriesOf(metric||view.metric);
    if(!arr.length) return {a:(data&&data.startedAt)||now()-1000,b:now()};
    return {a:arr[0].t,b:arr[arr.length-1].t};
  }
  function visiblePoints(metric){
    var arr=seriesOf(metric); if(!arr.length) return [];
    var a=view.t0,b=view.t1,out=[],prev=null;
    for(var i=0;i<arr.length;i++){
      var p=refreshPointY(arr[i]);
      if(p.t<a){ prev=p; continue; }
      if(prev && !out.length) out.push(refreshPointY(prev));
      if(p.t<=b) out.push(p); else { out.push(p); break; }
    }
    var cap=1600;
    if(cfg.quality==="low") cap=700;
    else if(cfg.quality==="auto") cap=1200;
    if(out.length>cap) out=downsample(out,cap);
    return out;
  }
  function applyFollow(redraw){
    var fl=firstLast(view.metric);
    if(view.follow){
      view.t1=fl.b;
      view.t0 = view.windowMs<=0 ? fl.a : view.t1-view.windowMs;
    }
    if(view.t1<=view.t0) view.t1=view.t0+1000;
    if(!view.lockY) autoY();
    if(redraw!==false) scheduleDraw();
  }
  function setFollow(on){ view.follow=!!on; if(view.follow) applyFollow(true); saveView(true); updateToolbar(); scheduleDraw(); }
  function setWindow(ms){ view.windowMs=ms; view.follow=true; applyFollow(true); saveView(true); updateToolbar(); }
  function autoY(){
    var pts=visiblePoints(view.metric);
    if(cfg.overlay) pts=pts.concat(visiblePoints(view.metric==="energy"?"cps":"energy"));
    if(!pts.length){ view.y0=-2; view.y1=2; return; }
    var mn=Infinity,mx=-Infinity,i;
    for(i=0;i<pts.length;i++){ if(pts[i].y<mn) mn=pts[i].y; if(pts[i].y>mx) mx=pts[i].y; }
    if(!isFinite(mn)||!isFinite(mx)){ view.y0=-2; view.y1=2; return; }
    if(mx-mn<0.15){ var mid=(mx+mn)/2; mn=mid-0.08; mx=mid+0.08; }
    var pad=(mx-mn)*0.14; view.y0=mn-pad; view.y1=mx+pad;
  }
  function zoomY(factor){
    var mid=(view.y0+view.y1)/2, h=(view.y1-view.y0)*factor*0.5;
    if(h<0.02) h=0.02; if(h>900) h=900;
    view.y0=mid-h; view.y1=mid+h; view.lockY=true; scheduleDraw(); updateToolbar();
  }
  function zoomT(factor,anchor){
    var fl=firstLast(), spanMax=Math.max(8000, fl.b-fl.a);
    if(view.follow){
      var next=view.windowMs<=0?spanMax*factor:view.windowMs*factor;
      if(next<200) next=200;
      if(next>spanMax*1.05) next=0;
      view.windowMs=next; applyFollow(true); saveView(false); updateToolbar(); return;
    }
    var mid=(typeof anchor==="number")?anchor:(view.t0+view.t1)/2;
    var w=(view.t1-view.t0)*factor;
    if(w<200) w=200; if(w>spanMax*1.2) w=spanMax*1.2;
    view.t0=mid-w/2; view.t1=mid+w/2;
    if(!view.lockY) autoY();
    scheduleDraw();
  }

  var lastDrawAt=0;
  function scheduleDraw(){
    if(rafDraw) return;
    rafDraw=requestAnimationFrame(function(){
      rafDraw=0;
      if(!panelVisible()) return;
      var minGap = cfg.quality==="low" ? 180 : (cfg.quality==="high" ? 40 : 90);
      var t=now();
      if(t-lastDrawAt<minGap){ rafDraw=requestAnimationFrame(function(){ rafDraw=0; if(panelVisible()){ lastDrawAt=now(); drawAll(); } }); return; }
      lastDrawAt=t; drawAll();
    });
  }
  function mapX(t,w){ return 52+((t-view.t0)/Math.max(1,view.t1-view.t0))*(w-66); }
  function mapY(y,h){ return (h-24)-((y-view.y0)/Math.max(1e-9,view.y1-view.y0))*(h-38); }
  function unmapX(px,w){ return view.t0+((px-52)/Math.max(1,w-66))*(view.t1-view.t0); }
  function nearestPoint(metric,t){
    var arr=visiblePoints(metric); if(!arr.length) return null;
    var best=arr[0], score=1e15;
    for(var i=0;i<arr.length;i++){ var d=Math.abs(arr[i].t-t); if(d<score){ score=d; best=arr[i]; } }
    return best;
  }


  var glPool = {};
  function hexRgb(c){
    c=String(c||"#00ffcc").replace("#","");
    if(c.length===3) c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    return [parseInt(c.slice(0,2),16)/255, parseInt(c.slice(2,4),16)/255, parseInt(c.slice(4,6),16)/255];
  }
  function compileGL(gl, type, src){
    var sh=gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return null;
    return sh;
  }
  function getGL(canvas){
    var id=canvas.id||"anon";
    var rec=glPool[id];
    if(rec && rec.canvas===canvas && rec.gl && !rec.gl.isContextLost()) return rec;
    var gl=null;
    try { gl=canvas.getContext("webgl",{antialias:true,alpha:false,premultipliedAlpha:false,preserveDrawingBuffer:false}); } catch(e){}
    if(!gl){ try { gl=canvas.getContext("experimental-webgl",{antialias:true,alpha:false}); } catch(e2){} }
    if(!gl) return null;
    var vs=compileGL(gl, gl.VERTEX_SHADER,
      "attribute vec2 aPos; uniform vec2 uRes; uniform float uPoint;\n"+
      "void main(){ vec2 p=(aPos/uRes)*2.0-1.0; p.y=-p.y; gl_Position=vec4(p,0.0,1.0); gl_PointSize=uPoint; }");
    var fs=compileGL(gl, gl.FRAGMENT_SHADER,
      "precision mediump float; uniform vec4 uCol;\n"+
      "void main(){ gl_FragColor=uCol; }");
    if(!vs||!fs) return null;
    var prog=gl.createProgram();
    gl.attachShader(prog,vs); gl.attachShader(prog,fs); gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    rec={
      canvas:canvas, gl:gl, prog:prog, buf:gl.createBuffer(),
      aPos:gl.getAttribLocation(prog,"aPos"),
      uRes:gl.getUniformLocation(prog,"uRes"),
      uCol:gl.getUniformLocation(prog,"uCol"),
      uPoint:gl.getUniformLocation(prog,"uPoint")
    };
    glPool[id]=rec;
    return rec;
  }
  function ensureLabelCanvas(canvas){
    if(canvas.__lab && canvas.__lab.parentNode) return canvas.__lab;
    var wrap=canvas.__wrap;
    if(!wrap){
      wrap=document.createElement("div");
      wrap.className="omega-graph-wrap";
      var hh = canvas.classList.contains("omega-canvas-sub") ? 120 : 220;
      wrap.style.cssText="position:relative;width:100%;height:"+hh+"px;display:block;overflow:hidden;contain:strict;";
      if(canvas.parentNode){
        canvas.parentNode.insertBefore(wrap, canvas);
        wrap.appendChild(canvas);
      }
      canvas.style.cssText=(canvas.style.cssText||"")+"width:100%;height:100%;display:block;";
      canvas.__wrap=wrap;
    }
    var lab=document.createElement("div");
    lab.className="omega-gl-labels";
    lab.style.cssText="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;display:block;overflow:hidden;";
    wrap.appendChild(lab);
    canvas.__lab=lab;
    return lab;
  }
  function glSetSize(rec, w, h, dpr){
    var canvas=rec.canvas, gl=rec.gl;
    var W=Math.floor(w*dpr), H=Math.floor(h*dpr);
    if(canvas.width!==W || canvas.height!==H){ canvas.width=W; canvas.height=H; }
    gl.viewport(0,0,W,H);
    gl.useProgram(rec.prog);
    gl.uniform2f(rec.uRes, w, h);
  }
  function glDraw(rec, arr, mode, rgba, pointSize){
    var gl=rec.gl;
    if(!arr || arr.length<2) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, rec.buf);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(rec.aPos);
    gl.vertexAttribPointer(rec.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(rec.uCol, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(rec.uPoint, pointSize||3);
    gl.drawArrays(mode, 0, arr.length/2);
  }
  function packXY(list, w, h, bar){
    if(!list || !list.length) return null;
    if(bar){
      var n=list.length, out=new Float32Array(n*12);
      var bw=Math.max(2,(w-66)/Math.max(1,n)*0.55);
      var base=mapY(Math.max(view.y0,-6),h);
      var o=0;
      for(var i=0;i<n;i++){
        var x=mapX(list[i].t,w), y=mapY(list[i].y,h);
        var x0=x-bw/2, x1=x+bw/2, y0=Math.min(y,base), y1=Math.max(y,base);
        out[o++]=x0; out[o++]=y0; out[o++]=x1; out[o++]=y0; out[o++]=x1; out[o++]=y1;
        out[o++]=x0; out[o++]=y0; out[o++]=x1; out[o++]=y1; out[o++]=x0; out[o++]=y1;
      }
      return out;
    }
    var out=new Float32Array(list.length*2);
    for(var j=0;j<list.length;j++){ out[j*2]=mapX(list[j].t,w); out[j*2+1]=mapY(list[j].y,h); }
    return out;
  }

  function paintDomLabels(canvas,w,h){
    var wrap=canvas.__wrap; if(!wrap) return;
    var box=canvas.__labDom;
    if(!box){
      box=document.createElement("div");
      box.className="omega-graph-domlab";
      box.style.cssText="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:hidden;";
      wrap.appendChild(box);
      canvas.__labDom=box;
    }
    var html="";
    for(var gi=0;gi<=5;gi++){
      var gy=14+((h-38)*gi)/5;
      html+="<span style=\"position:absolute;left:4px;top:"+(gy-6)+"px;font:11px/1 Consolas,ui-monospace,monospace;color:#94a3b8;transform:none;white-space:nowrap;\">"+fmtFromLog(view.y1-((view.y1-view.y0)*gi)/5)+"</span>";
    }
    html+="<span style=\"position:absolute;left:52px;bottom:4px;font:10px/1 Consolas,ui-monospace,monospace;color:#64748b;\">"+fmtTime(view.t0-((data&&data.startedAt)||view.t0))+"</span>";
    html+="<span style=\"position:absolute;right:10px;bottom:4px;font:10px/1 Consolas,ui-monospace,monospace;color:#64748b;\">"+fmtTime(view.t1-((data&&data.startedAt)||view.t1))+"</span>";
    box.innerHTML=html;
  }
  function drawCanvas(canvas,metric,mode,overlayMetric){
    if(!canvas) return;
    var dpr=Math.max(1,Math.min((Math.min(screen.width,screen.height)<700?1.25:2), window.devicePixelRatio||1));
    var w=Math.max(160,canvas.clientWidth||320), h=Math.max(120,canvas.clientHeight||180);
    var pts=visiblePoints(metric), gi;
    var colors={energy:"#00ffcc",cps:"#ffea00",am:"#ff0055",ts:"#9d4edd",stars:"#3a86ff",clicks:"#f4f4f5"};
    var rec=getGL(canvas);
    if(rec){
      glSetSize(rec,w,h,dpr);
      var gl=rec.gl;
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0.023,0.016,0.063,1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      var grid=new Float32Array(24);
      for(gi=0;gi<=5;gi++){
        var gy=14+((h-38)*gi)/5;
        grid[gi*4]=52; grid[gi*4+1]=gy; grid[gi*4+2]=w-10; grid[gi*4+3]=gy;
      }
      glDraw(rec, grid, gl.LINES, [1,1,1,0.08], 1);
      var packed=packXY(pts,w,h, mode==="bar");
      var rgb=hexRgb(colors[metric]||"#00ffcc");
      if(packed){
        if(mode==="bar") glDraw(rec, packed, gl.TRIANGLES, [rgb[0],rgb[1],rgb[2],0.8], 1);
        else {
          gl.lineWidth(4);
          glDraw(rec, packed, gl.LINE_STRIP, [rgb[0],rgb[1],rgb[2],0.22], 1);
          gl.lineWidth(2);
          glDraw(rec, packed, gl.LINE_STRIP, [rgb[0],rgb[1],rgb[2],1], 1);
          if(cfg.showDots && cfg.quality!=="low") glDraw(rec, packed, gl.POINTS, [rgb[0],rgb[1],rgb[2],1], cfg.quality==="high"?4:3);
        }
      }
      if(overlayMetric && cfg.overlay){
        var o2=visiblePoints(overlayMetric);
        var p2=packXY(o2,w,h,false);
        var c2=hexRgb(colors[overlayMetric]||"#fff");
        if(p2) glDraw(rec, p2, gl.LINE_STRIP, [c2[0],c2[1],c2[2],0.7], 1);
      }
      if(data && data.events && data.events.length){
        var evs=[];
        for(gi=0;gi<data.events.length;gi++){
          var ev=data.events[gi]; if(ev.t<view.t0||ev.t>view.t1) continue;
          var x=mapX(ev.t,w); evs.push(x,12,x,h-22);
        }
        if(evs.length) glDraw(rec, new Float32Array(evs), gl.LINES, [1,0,0.33,0.7], 1);
      }
      var lab=ensureLabelCanvas(canvas);
      if(canvas.__wrap) canvas.__wrap.style.height=h+"px";
      if(lab){
        var html="", gi2;
        for(gi2=0;gi2<=5;gi2++){
          var gy=14+((h-38)*gi2)/5;
          html += "<span style=\"position:absolute;right:"+(w-50)+"px;top:"+(gy-7)+"px;color:#94a3b8;font:11px Consolas,monospace;transform:none;letter-spacing:0;\">"+fmtFromLog(view.y1-((view.y1-view.y0)*gi2)/5)+"</span>";
        }
        html += "<span style=\"position:absolute;left:52px;bottom:4px;color:#64748b;font:11px Consolas,monospace;\">"+fmtTime(view.t0-((data&&data.startedAt)||view.t0))+"</span>";
        html += "<span style=\"position:absolute;right:10px;bottom:4px;color:#64748b;font:11px Consolas,monospace;\">"+fmtTime(view.t1-((data&&data.startedAt)||view.t1))+"</span>";
        html += "<span style=\"position:absolute;left:50%;top:4px;transform:translateX(-50%);color:#00ffcc;font:11px Consolas,monospace;\">LIVE</span>";
        if(!pts.length) html += "<span style=\"position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:#6b7280;font:12px Consolas,monospace;\">点がまだありません</span>";
        if(hoverX!=null && pts.length){
          var near=nearestPoint(metric, unmapX(hoverX,w));
          if(near){
            var hx=mapX(near.t,w), hy=mapY(near.y,h);
            var labt=fmtFromLog(near.y)+"  "+fmtTime(near.t-((data&&data.startedAt)||near.t));
            html += "<span style=\"position:absolute;left:"+Math.max(8,Math.min(w-140,hx+8))+"px;top:"+Math.max(8,hy-18)+"px;background:rgba(0,0,0,.75);color:#fff;padding:2px 6px;border-radius:4px;font:11px Consolas,monospace;\">"+labt+"</span>";
          }
        }
        if(lab.__html!==html){ lab.innerHTML=html; lab.__html=html; }
      }
      return;
    }
    if(canvas.width!==Math.floor(w*dpr)||canvas.height!==Math.floor(h*dpr)){ canvas.width=Math.floor(w*dpr); canvas.height=Math.floor(h*dpr); }
    var ctx=canvas.getContext("2d");
    if(!ctx) return;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle="rgba(6,4,16,0.94)"; ctx.fillRect(0,0,w,h);
    for(gi=0;gi<=5;gi++){
      var gy=14+((h-38)*gi)/5;
      ctx.strokeStyle="rgba(255,255,255,0.07)"; ctx.beginPath(); ctx.moveTo(52,gy); ctx.lineTo(w-10,gy); ctx.stroke();
      ctx.fillStyle="#94a3b8"; ctx.font="10px Consolas, monospace"; ctx.textAlign="right";
      ctx.fillText(fmtFromLog(view.y1-((view.y1-view.y0)*gi)/5),48,gy+3);
    }
    var colors={energy:"#00ffcc",cps:"#ffea00",am:"#ff0055",ts:"#9d4edd",stars:"#3a86ff",clicks:"#f4f4f5"};
    function strokeSeries(list,col,barMode){
      if(!list.length) return;
      if(barMode){
        var bw=Math.max(2,(w-66)/Math.max(1,list.length)*0.7);
        ctx.fillStyle=col; ctx.globalAlpha=0.78;
        for(var i=0;i<list.length;i++){
          var x=mapX(list[i].t,w), y=mapY(list[i].y,h), base=mapY(Math.max(view.y0,-6),h);
          ctx.fillRect(x-bw/2,Math.min(y,base),bw,Math.max(1,Math.abs(base-y)));
        }
        ctx.globalAlpha=1; return;
      }
      ctx.beginPath(); ctx.strokeStyle=col; ctx.lineWidth=1.8; ctx.lineJoin="round";
      for(var j=0;j<list.length;j++){ var px=mapX(list[j].t,w), py=mapY(list[j].y,h); if(j===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); }
      ctx.stroke();
      if(cfg.showDots && cfg.quality!=="low" && list.length<=(cfg.quality==="high"?160:90)){
        ctx.fillStyle=col;
        for(var k=0;k<list.length;k++){ ctx.beginPath(); ctx.arc(mapX(list[k].t,w),mapY(list[k].y,h),2.3,0,Math.PI*2); ctx.fill(); }
      }
      var last=list[list.length-1];
      if(last && view.follow){ ctx.fillStyle=col; ctx.beginPath(); ctx.arc(mapX(last.t,w),mapY(last.y,h),3.4,0,Math.PI*2); ctx.fill(); }
    }
    strokeSeries(pts, colors[metric]||"#00ffcc", mode==="bar");
    if(overlayMetric && cfg.overlay){ ctx.globalAlpha=0.7; strokeSeries(visiblePoints(overlayMetric), colors[overlayMetric]||"#fff", false); ctx.globalAlpha=1; }
    if(!pts.length){ ctx.fillStyle="#6b7280"; ctx.font="12px Consolas, monospace"; ctx.textAlign="center"; ctx.fillText("点がまだありません。遊ぶと線が伸びます。", w/2, h/2); }
    if(data && data.events){
      ctx.fillStyle="rgba(255,0,85,0.7)";
      for(gi=0;gi<data.events.length;gi++){
        var ev=data.events[gi]; if(ev.t<view.t0||ev.t>view.t1) continue;
        ctx.fillRect(mapX(ev.t,w),12,1,h-32);
      }
    }
    function markMeasure(pt,label,col){
      if(!pt) return;
      var mx=mapX(pt.t,w), my=mapY(pt.y,h);
      ctx.strokeStyle=col; ctx.setLineDash([4,3]); ctx.beginPath(); ctx.moveTo(mx,12); ctx.lineTo(mx,h-22); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(mx,my,4,0,Math.PI*2); ctx.fill();
      ctx.font="10px Consolas, monospace"; ctx.textAlign="left"; ctx.fillText(label+" "+fmtFromLog(pt.y), mx+6, Math.max(22,my-8));
    }
    markMeasure(measure.a,"A","#fb7185"); markMeasure(measure.b,"B","#38bdf8");
    if(hoverX!=null && pts.length){
      var near=nearestPoint(metric, unmapX(hoverX,w));
      if(near){
        var hx=mapX(near.t,w), hy=mapY(near.y,h);
        ctx.strokeStyle="rgba(255,255,255,0.28)"; ctx.beginPath(); ctx.moveTo(hx,12); ctx.lineTo(hx,h-22); ctx.stroke();
        ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(hx,hy,3,0,Math.PI*2); ctx.fill();
        var lab=fmtFromLog(near.y)+"  "+fmtTime(near.t-((data&&data.startedAt)||near.t));
        ctx.font="11px Consolas, monospace"; ctx.textAlign=hx>w*0.62?"right":"left";
        var tw=ctx.measureText(lab).width+12, tx=hx>w*0.62?hx-10-tw:hx+8;
        ctx.fillStyle="rgba(0,0,0,0.72)"; ctx.fillRect(tx,Math.max(8,hy-24),tw,16);
        ctx.fillStyle=colors[metric]||"#fff"; ctx.fillText(lab, hx>w*0.62?hx-14:hx+14, Math.max(20,hy-12));
      }
    }
    ctx.fillStyle="#64748b"; ctx.font="10px Consolas, monospace";
    ctx.textAlign="left"; ctx.fillText(fmtTime(view.t0-((data&&data.startedAt)||view.t0)),52,h-7);
    ctx.textAlign="right"; ctx.fillText(fmtTime(view.t1-((data&&data.startedAt)||view.t1)),w-10,h-7);
    if(view.follow){ ctx.fillStyle="#00ffcc"; ctx.textAlign="center"; ctx.fillText("LIVE", w/2, 12); }
  }
  function drawAll(){
    var overlay=view.metric==="energy"?"cps":"energy";
    var main=document.getElementById("omegaChartMain");
    var sub=document.getElementById("omegaChartSub");
    if(main) drawCanvas(main, view.metric, view.chart, overlay);
    if(sub) drawCanvas(sub, overlay, "line", null);
    var st=document.getElementById("omegaRecordStats");
    if(st && data){
      var snap=data.snapshot||{}, fl=firstLast();
      st.innerHTML="<div class='pv-item on'><b>記録</b>"+(data.samples||0)+"点 / "+intervalLabel(cfg.intervalMs)+"</div>"+
        "<div class='pv-item'><b>全期間</b>"+fmtTime(fl.b-(data.startedAt||fl.a))+"</div>"+
        "<div class='pv-item'><b>E</b>"+(snap.energyF||snap.energy||"—")+"</div>"+
        "<div class='pv-item'><b>CPS</b>"+(snap.cpsF||snap.cps||"—")+"</div>"+
        "<div class='pv-item'><b>表示</b>"+(view.windowMs?fmtTime(view.windowMs):"全期間")+(view.follow?" ・追尾中":" ・固定")+"</div>"+
        "<div class='pv-item'><b>精度</b>"+cfg.precision+"桁</div>"+
        "<div class='pv-item'><b>描画</b>"+(getGL(main)?"WebGL 高速":"Canvas2D")+"</div>";
    }
    updateToolbar();
    if(document.getElementById("omegaPlayviewTwin")) renderTwinPlayview();
  }

  function downloadBlob(filename,text,mime){
    try {
      var blob=new Blob([text],{type:mime||"text/plain"});
      var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename;
      document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },400);
    } catch(e){}
  }
  function downloadJSON(){
    persistData(true);
    downloadBlob("infinity-record.json", JSON.stringify({cfg:cfg,view:view,data:data,exportedAt:new Date().toISOString()}), "application/json");
  }
  function downloadCSV(){
    persistData(true);
    var NL = String.fromCharCode(10);
    var lines=["time_iso,seconds,energy_log10,energy_raw,cps_log10,cps_raw,am_log10,am_raw,ts_log10,ts_raw"];
    var map={};
    function ingest(name){ seriesOf(name).forEach(function(p){ if(!map[p.t]) map[p.t]={t:p.t}; map[p.t][name]=p.y; if(p.raw!=null) map[p.t][name+"_raw"]=p.raw; }); }
    ["energy","cps","am","ts"].forEach(ingest);
    var keys=Object.keys(map).map(Number).sort(function(a,b){ return a-b; });
    var t0=data.startedAt||keys[0]||now();
    keys.forEach(function(t){
      var r=map[t];
      function num(v){ return (v==null||v==="")?"": (typeof v==="number"? v.toString(): String(v)); }
      lines.push([new Date(t).toISOString(),((t-t0)/1000).toFixed(6),num(r.energy),num(r.energy_raw),num(r.cps),num(r.cps_raw),num(r.am),num(r.am_raw),num(r.ts),num(r.ts_raw)].join(","));
    });
    downloadBlob("infinity-record.csv", lines.join(NL), "text/csv");
  }

  function btn(label,onclick){ return "<button type='button' class='omega-btn' onclick='"+onclick+"'>"+label+"</button>"; }
  function mountHtml(target){
    if(!target) return;
    target.innerHTML =
      "<div class='pv-sec' id='omegaRecordCard'>"+
      "<h3>RECORD / 同期グラフ</h3>"+
      "<div class='guide-text-block'>ゲームとエンディングで同じ記録です。1本の指で移動、2本で拡大、ダブルタップで最新追尾。ものさしで2点の差を測れます。</div>"+
      "<div class='pv-grid' id='omegaRecordStats'></div>"+
      "<div class='omega-toolbar'>"+
        btn("E","window.OmegaSyncRecord.setMetric(\"energy\")")+
        btn("CPS","window.OmegaSyncRecord.setMetric(\"cps\")")+
        btn("AM","window.OmegaSyncRecord.setMetric(\"am\")")+
        btn("TS","window.OmegaSyncRecord.setMetric(\"ts\")")+
        btn("線","window.OmegaSyncRecord.setChart(\"line\")")+
        btn("棒","window.OmegaSyncRecord.setChart(\"bar\")")+
        btn("重ね","window.OmegaSyncRecord.toggleOverlay()")+
      "</div>"+
      "<canvas id='omegaChartMain' class='omega-canvas omega-canvas-main'></canvas>"+
      "<input id='omegaPanSlider' type='range' min='0' max='1000' value='1000' class='omega-slider'>"+
      "<div class='omega-toolbar' id='omegaWindowBar'></div>"+
      "<div class='omega-toolbar' style='align-items:center'><span style='font-size:.62rem;color:#94a3b8'>窓(秒)</span><input id='omegaWinInput' type='number' min='0' max='999999' step='1' class='omega-num'><button type='button' class='omega-btn' onclick='window.OmegaSyncRecord.applyWindowSec()'>窓を適用</button></div>"+
      "<div class='omega-toolbar'>"+
        "<button type='button' class='omega-btn omega-live' id='omegaLiveBtn' onclick='window.OmegaSyncRecord.setFollow(!window.OmegaSyncRecord.view.follow)'>最新を追尾</button>"+
        btn("時間+","window.OmegaSyncRecord.zoomT(0.65)")+
        btn("時間-","window.OmegaSyncRecord.zoomT(1.5)")+
        btn("値+","window.OmegaSyncRecord.zoomY(0.65)")+
        btn("値-","window.OmegaSyncRecord.zoomY(1.5)")+
        btn("値自動","window.OmegaSyncRecord.unlockY()")+
      "</div>"+
      "<div style='font-size:.62rem;color:#94a3b8;margin:6px 0 4px'>比較グラフ</div>"+
      "<canvas id='omegaChartSub' class='omega-canvas omega-canvas-sub'></canvas>"+
      "<div class='omega-toolbar'>"+
        btn("ものさし","window.OmegaSyncRecord.toggleMeasure()")+
        btn("A/B消す","window.OmegaSyncRecord.clearMeasure()")+
        btn("JSON","window.OmegaSyncRecord.downloadJSON()")+
        btn("CSV","window.OmegaSyncRecord.downloadCSV()")+
        (isEndingPage?"":btn("今1点","window.OmegaSyncRecord.sample(true)"))+
      "</div>"+
      "<div id='omegaMeasureBox' class='omega-measure'>点を2つ置くと差が出ます。長押しでも置けます。</div>"+
      "<div id='omegaEventList' class='omega-events'></div>"+
      "</div>";
    var bar=document.getElementById("omegaWindowBar");
    if(bar) bar.innerHTML=WINDOW_CHOICES.map(function(w){ return btn(w[1],"window.OmegaSyncRecord.setWindow("+w[0]+")"); }).join("");
    var wi=document.getElementById("omegaWinInput"); if(wi) wi.value=String(Math.max(4, Math.round((view.windowMs||120000)/1000)));
    bindCanvas(document.getElementById("omegaChartMain"));
    bindCanvas(document.getElementById("omegaChartSub"));
    bindSlider(); renderEvents(); applyFollow(false); updateToolbar(); scheduleDraw();
  }
  function bindSlider(){
    var sl=document.getElementById("omegaPanSlider"); if(!sl||sl.__omegaBound) return; sl.__omegaBound=true;
    sl.addEventListener("input", function(){
      var fl=firstLast();
      var span=view.windowMs<=0?(fl.b-fl.a):view.windowMs; if(span<=0) span=1000;
      var maxStart=Math.max(fl.a, fl.b-span);
      var u=Number(sl.value)/1000;
      view.follow=u>=0.995;
      if(view.follow) applyFollow(true);
      else { view.t0=fl.a+(maxStart-fl.a)*u; view.t1=view.t0+span; if(!view.lockY) autoY(); scheduleDraw(); }
      saveView(false); updateToolbar();
    });
  }
  function syncSlider(){
    var sl=document.getElementById("omegaPanSlider"); if(!sl) return;
    if(view.follow){ sl.value="1000"; return; }
    var fl=firstLast(), span=view.t1-view.t0, maxStart=Math.max(fl.a, fl.b-span);
    var u=maxStart<=fl.a?1:(view.t0-fl.a)/Math.max(1,maxStart-fl.a);
    sl.value=String(Math.round(clamp(u,0,1)*1000));
  }
  function updateToolbar(){
    syncSlider();
    var live=document.getElementById("omegaLiveBtn");
    if(live){ live.textContent=view.follow?"● 最新を追尾中":"▷ 最新を追尾"; live.style.color=view.follow?"#00ffcc":"#f4f4f5"; }
  }
  function renderEvents(){
    var box=document.getElementById("omegaEventList"); if(!box||!data) return;
    var ev=(data.events||[]).slice().reverse().slice(0,12);
    box.innerHTML=ev.length?ev.map(function(e){ return "<div>旗 "+(e.label||"記録")+"　"+fmtTime(e.t-(data.startedAt||e.t))+"</div>"; }).join(""):"大きな到達があると旗が立ちます。";
  }
  function renderMeasure(){
    var box=document.getElementById("omegaMeasureBox"); if(!box) return;
    if(!measure.a && !measure.b){ box.textContent="ものさしONでグラフを2回タップ。AとBの差と速さが出ます。"; return; }
    if(measure.a && !measure.b){ box.innerHTML="A = "+fmtFromLog(measure.a.y)+" / "+fmtTime(measure.a.t-(data.startedAt||measure.a.t))+"　→ もう1点を置いてください"; return; }
    var dt=measure.b.t-measure.a.t, dy=measure.b.y-measure.a.y, ratio=Math.pow(10,dy), perSec=dt>0?dy/(dt/1000):0;
    box.innerHTML="<b>A</b> "+fmtFromLog(measure.a.y)+"　<b>B</b> "+fmtFromLog(measure.b.y)+"<br>時間差 "+fmtTime(dt)+"　値の比 x"+(isFinite(ratio)?ratio.toPrecision(4):"—")+"<br>log10の速さ "+perSec.toFixed(4)+" /秒";
  }
  function placeMeasureFromEvent(canvas,e){
    var r=canvas.getBoundingClientRect();
    var pt=nearestPoint(view.metric, unmapX(e.clientX-r.left, r.width));
    if(!pt) return;
    if(measure.step===0){ measure.a=pt; measure.b=null; measure.step=1; }
    else { measure.b=pt; measure.step=0; }
    renderMeasure(); scheduleDraw();
  }
  function bindCanvas(canvas){
    if(!canvas||canvas.__omegaBound) return; canvas.__omegaBound=true;
    var lastTap=0, longTimer=0;
    canvas.addEventListener("pointerdown", function(e){
      try { canvas.setPointerCapture(e.pointerId); } catch(err){}
      pointers[e.pointerId]={x:e.clientX,y:e.clientY};
      var ids=Object.keys(pointers);
      hoverX=e.clientX-canvas.getBoundingClientRect().left;
      if(ids.length===2){
        var a=pointers[ids[0]], b=pointers[ids[1]];
        pinch0={dist:Math.hypot(a.x-b.x,a.y-b.y), midT:(view.t0+view.t1)/2, ySpan:view.y1-view.y0, yMid:(view.y0+view.y1)/2};
        drag=null;
      } else {
        drag={x:e.clientX,t0:view.t0,t1:view.t1};
        longTimer=setTimeout(function(){ placeMeasureFromEvent(canvas,e); },430);
      }
      scheduleDraw();
    });
    canvas.addEventListener("pointermove", function(e){
      var r=canvas.getBoundingClientRect(); hoverX=e.clientX-r.left;
      if(pointers[e.pointerId]){
        if(Math.hypot(e.clientX-pointers[e.pointerId].x, e.clientY-pointers[e.pointerId].y)>8) clearTimeout(longTimer);
        pointers[e.pointerId]={x:e.clientX,y:e.clientY};
      }
      var ids=Object.keys(pointers);
      if(ids.length>=2 && pinch0){
        var a=pointers[ids[0]], b=pointers[ids[1]];
        var dist=Math.hypot(a.x-b.x,a.y-b.y);
        var scale=pinch0.dist/Math.max(8,dist);
        if(Math.abs(a.y-b.y)>Math.abs(a.x-b.x)*1.2){
          var hh=pinch0.ySpan*scale*0.5; if(hh<0.02) hh=0.02;
          view.y0=pinch0.yMid-hh; view.y1=pinch0.yMid+hh; view.lockY=true;
        } else zoomT(scale, pinch0.midT);
      } else if(drag && pointers[e.pointerId]){
        var ww=Math.max(1,r.width-66);
        var dt=((drag.x-e.clientX)/ww)*(drag.t1-drag.t0);
        if(Math.abs(e.clientX-drag.x)>6){ view.follow=false; view.t0=drag.t0+dt; view.t1=drag.t1+dt; }
      }
      scheduleDraw();
    });
    function endPtr(e){
      clearTimeout(longTimer); delete pointers[e.pointerId];
      if(Object.keys(pointers).length<2) pinch0=null;
      if(!Object.keys(pointers).length){ drag=null; saveView(false); updateToolbar(); }
    }
    canvas.addEventListener("pointerup", function(e){
      var t=now(); if(t-lastTap<280) setFollow(true); lastTap=t; endPtr(e);
      if(canvas.classList.contains("omega-measuring")) placeMeasureFromEvent(canvas,e);
    });
    canvas.addEventListener("pointercancel", endPtr);
    canvas.addEventListener("pointerleave", function(){ if(!Object.keys(pointers).length){ hoverX=null; scheduleDraw(); } });
    canvas.addEventListener("wheel", function(e){
      e.preventDefault();
      var r=canvas.getBoundingClientRect();
      var anchor=unmapX(e.clientX-r.left, r.width);
      if(e.shiftKey) zoomY(e.deltaY<0?0.8:1.25); else zoomT(e.deltaY<0?0.8:1.25, anchor);
    }, {passive:false});
  }
  function toggleMeasure(){
    var c=document.getElementById("omegaChartMain"); if(!c) return;
    var on=c.classList.toggle("omega-measuring");
    var box=document.getElementById("omegaMeasureBox");
    if(box && on) box.textContent="ものさしON：グラフを2回タップしてください";
  }

  function updateSettingsLabels(){
    var p=document.getElementById("omegaPrecLabel"); if(p) p.textContent="計算精度: "+cfg.precision+" 桁";
    var i=document.getElementById("omegaIntervalLabel"); if(i) i.textContent="グラフ更新: "+intervalLabel(cfg.intervalMs)+" / 点数"+ (cfg.maxPoints||800) +" / 描画"+cfg.quality;
    var dots=document.getElementById("omegaDotsLabel"); if(dots) dots.textContent=cfg.showDots?"点表示: ON":"点表示: OFF";
    var pb=document.getElementById("omegaPauseBtn"); if(pb) pb.textContent=cfg.paused?"記録: 停止中":"記録: ON";
    var a=document.getElementById("omegaPrecInput"); if(a) a.value=String(cfg.precision);
    var b=document.getElementById("omegaIntInput"); if(b) b.value=String(cfg.intervalMs/1000);
    var c=document.getElementById("omegaMaxInput"); if(c) c.value=String(cfg.maxPoints||800);
  }
  function ensureSharedCss(){
    if(document.getElementById("omegaSyncRecordCss")) return;
    var s=document.createElement("style"); s.id="omegaSyncRecordCss";
    s.textContent="#omegaRecordCard,.pv-sec{margin:0 0 14px;padding:10px;border:1px solid rgba(0,255,204,.22);border-radius:10px;background:rgba(8,4,20,.55);color:#f4f4f5;font-family:Consolas,monospace}"
      +"#omegaRecordCard h3,.pv-sec h3{margin:0 0 8px;font-size:.78rem;letter-spacing:.12em;color:#00ffcc}"
      +".pv-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}"
      +".pv-item{border:1px solid rgba(255,234,0,.22);border-radius:8px;padding:8px;font-size:.68rem;color:#d4d4d8}"
      +".pv-item b{color:#ffea00;display:block;margin-bottom:4px}"
      +".pv-item.on{border-color:rgba(0,255,204,.45)}"
      +".guide-text-block{font-size:.68rem;color:#94a3b8;line-height:1.55;margin-bottom:8px}"
      +".omega-toolbar{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}"
      +".omega-btn,.btn-utility{background:rgba(20,14,38,.9);border:1px solid rgba(255,255,255,.16);color:#f4f4f5;border-radius:8px;padding:8px 10px;min-height:36px;cursor:pointer;font-size:.72rem}"
      +".omega-btn:hover{border-color:#00ffcc;color:#00ffcc}"
      +".omega-live{flex:1 1 140px;font-weight:700}"
      +".omega-canvas{width:100%;border:1px solid rgba(0,255,204,.25);border-radius:8px;touch-action:none;cursor:crosshair;display:block;background:#07040f}"
      +".omega-canvas-main{height:220px}.omega-canvas-sub{height:120px}.omega-canvas.omega-measuring{outline:2px solid #fb7185}"
      +".omega-slider{width:100%;margin:8px 0;height:28px}.omega-num{width:88px;min-height:36px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:#120c1c;color:#fff;padding:6px}"
      +".omega-measure{margin-top:8px;font-size:.7rem;color:#e5e7eb;line-height:1.5;border:1px dashed rgba(56,189,248,.4);border-radius:8px;padding:8px}"
      +".omega-events{margin-top:8px;font-size:.65rem;color:#d4d4d8;max-height:120px;overflow:auto}"
      +"@media (max-width:820px){.pv-grid{grid-template-columns:1fr}.omega-canvas-main{height:200px}.omega-btn{flex:1 1 calc(50% - 6px)}}";
    document.head.appendChild(s);
  }
  function ensureSettingsBlock(){
    var host=document.getElementById("omegaSettingsHost"); if(!host) return;
    host.innerHTML="<div style='font-size:0.7rem;font-weight:bold;color:#aaa;margin-bottom:6px'>計算精度 / 記録（自由設定）</div>"
      +"<div id='omegaPrecLabel' style='font-size:0.68rem;color:#00ffcc;margin-bottom:4px'></div>"
      +"<div style='display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;align-items:center'>"
      +"<input id='omegaPrecInput' type='number' min='1' max='999999' step='1' value='"+cfg.precision+"' class='omega-num'>"
      +"<button type='button' class='omega-btn' onclick='window.OmegaSyncRecord.applyFree()'>精度を適用</button>"
      +PREC_CHOICES.map(function(n){ return "<button type='button' class='omega-btn' onclick='window.OmegaSyncRecord.setPrecision("+n+",true)'>"+n+"桁</button>"; }).join("")+"</div>"
      +"<div id='omegaIntervalLabel' style='font-size:0.68rem;color:#ffea00;margin-bottom:4px'></div>"
      +"<div style='display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;align-items:center'>"
      +"<input id='omegaIntInput' type='number' min='0' max='3600' step='any' value='"+(cfg.intervalMs/1000)+"' class='omega-num'>"
      +"<span style='font-size:.62rem;color:#94a3b8'>秒</span>"
      +"<button type='button' class='omega-btn' onclick='window.OmegaSyncRecord.applyFree()'>間隔を適用</button>"
      +INTERVAL_CHOICES.map(function(n){ return "<button type='button' class='omega-btn' onclick='window.OmegaSyncRecord.setIntervalMs("+n+")'>"+intervalLabel(n)+"</button>"; }).join("")+"</div>"
      +"<div style='display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;align-items:center'>"
      +"<span style='font-size:.62rem;color:#94a3b8'>最大点数</span>"
      +"<input id='omegaMaxInput' type='number' min='0' max='50000' step='1' value='"+(cfg.maxPoints||800)+"' class='omega-num'>"
      +"<button type='button' class='omega-btn' onclick='window.OmegaSyncRecord.applyFree()'>点数を適用</button>"
      +"<button type='button' class='omega-btn' onclick='window.OmegaSyncRecord.setQuality(&quot;auto&quot;)'>描画自動</button>"
      +"<button type='button' class='omega-btn' onclick='window.OmegaSyncRecord.setQuality(&quot;high&quot;)'>きれい</button>"
      +"<button type='button' class='omega-btn' onclick='window.OmegaSyncRecord.setQuality(&quot;low&quot;)'>軽い</button>"
      +"</div>"
      +"<div style='display:flex;gap:6px;flex-wrap:wrap'>"
      +"<button type='button' class='omega-btn' id='omegaPauseBtn' onclick='window.OmegaSyncRecord.togglePause()'></button>"
      +"<button type='button' class='omega-btn' id='omegaDotsLabel' onclick='window.OmegaSyncRecord.toggleDots()'></button>"
      +"<button type='button' class='omega-btn' onclick='window.OmegaSyncRecord.downloadJSON()'>記録JSON</button>"
      +"<button type='button' class='omega-btn' onclick='window.OmegaSyncRecord.downloadCSV()'>記録CSV</button></div>"
      +"<div style='font-size:0.62rem;color:#94a3b8;margin-top:6px'>秒数は好きな値を入れて適用できます。タブを閉じている間はグラフ描画を止めて軽くします。記録自体は裏で続きます。</div>";
    updateSettingsLabels();
  }
  function readLS(key){ try { var r=localStorage.getItem(key); return r?JSON.parse(r):null; } catch(e){ return null; } }
  function renderTwinPlayview(){
    var box=document.getElementById("omegaPlayviewTwin");
    if(!box){
      var host=document.getElementById("omegaRecordMount") || document.getElementById("tab-playview") || document.getElementById("endingPlayview");
      if(!host) return;
      box=document.createElement("div"); box.id="omegaPlayviewTwin";
      if(host.id==="omegaRecordMount" && host.parentNode) host.parentNode.insertBefore(box, host);
      else host.insertBefore(box, host.firstChild);
    }
    var L=window.OmegaLong || readLS("omega_longplay_v1") || {};
    var G=window.OmegaGrind || readLS("omega_grind_v1") || {};
    var m=L.mastery||{};
    var relics=Object.keys(L.relics||{}).length;
    var name="-";
    try { name=localStorage.getItem("infinity_game_player_name")||"-"; } catch(e){}
    var snap=(data&&data.snapshot)||{};
    box.innerHTML="<div class='pv-sec'><h3>PLAY VIEW</h3>"
      +"<div class='guide-text-block'>ゲームとエンディングで同じやりこみデータです。</div>"
      +"<div class='pv-grid'>"
      +"<div class='pv-item on'><b>プレイヤー</b>"+String(name)+"</div>"
      +"<div class='pv-item'><b>レガシー</b>Lv."+(G.lv||1)+" / XP "+(G.xp||0)+"</div>"
      +"<div class='pv-item'><b>研究</b>"+(L.research||0)+"</div>"
      +"<div class='pv-item'><b>遺物</b>"+relics+"</div>"
      +"<div class='pv-item'><b>熟練</b>タップ"+(m.tap||0)+" 放置"+(m.idle||0)+" イベント"+(m.ev||0)+"</div>"
      +"<div class='pv-item'><b>図鑑 / 星座</b>"+Object.keys(G.codex||{}).length+" / "+Object.keys(G.signs||{}).length+"</div>"
      +"<div class='pv-item'><b>E</b>"+(snap.energyF||snap.energy||"—")+"</div>"
      +"<div class='pv-item'><b>CPS</b>"+(snap.cpsF||snap.cps||"—")+"</div>"
      +"</div></div>";
  }
  function ensurePlayviewMount(){
    var mount=document.getElementById("omegaRecordMount");
    if(!mount){
      var tab=document.getElementById("tab-playview")||document.getElementById("endingPlayview");
      if(tab){ mount=document.createElement("div"); mount.id="omegaRecordMount"; tab.appendChild(mount); }
    }
    renderTwinPlayview();
    if(mount) mountHtml(mount);
    renderTwinPlayview();
  }
  function openEndingPlayview(){
    var p=document.getElementById("endingPlayview"); if(!p) return;
    p.style.display="block"; ensurePlayviewMount(); applyFollow(true);
  }
  function hookEndingTransition(){
    if(typeof window.checkInfinityMilestone!=="function" || window.checkInfinityMilestone.__omegaWrapped) return;
    var orig=window.checkInfinityMilestone;
    window.checkInfinityMilestone=function(energy){
      try {
        var hit=false;
        try { if(typeof energyGte==="function" && typeof ENDING_ENERGY_THRESHOLD!=="undefined") hit=energyGte(ENDING_ENERGY_THRESHOLD); } catch(e){}
        if(hit && !window.hasTriggeredInfinityEvent) flushForEnding();
      } catch(e){}
      return orig.apply(this, arguments);
    };
    window.checkInfinityMilestone.__omegaWrapped=true;
  }
  function hookTick(){
    if(window.ModAPI && window.ModAPI.hooks && Array.isArray(window.ModAPI.hooks.onTick)) window.ModAPI.hooks.onTick.push(function(){ sample(false); });
    setInterval(function(){
      if(document.hidden) return;
      var vis = false;
      try { vis = panelVisible(); } catch(e){}
      if(!vis && cfg.intervalMs && cfg.intervalMs < 800) { /* 非表示時は間引き */ if ((Date.now()%1000)>200) return; }
      try{ sample(false); }catch(e){}
    }, 400);
    window.addEventListener("beforeunload", function(){ try { snapshotNow(); persistData(true); saveView(true); } catch(e){} });
    window.addEventListener("storage", function(e){ if(!e) return; if(e.key===DATA_KEY) onRemote("data"); if(e.key===CFG_KEY) onRemote("cfg"); if(e.key===VIEW_KEY) onRemote("view"); });
    try { channel=new BroadcastChannel(CH); channel.onmessage=function(ev){ if(ev&&ev.data) onRemote(ev.data.kind); }; } catch(e){ channel=null; }
    document.addEventListener("visibilitychange", function(){ if(!document.hidden) onRemote(); });
  }
  function boot(){
    ensureSharedCss(); loadCfg(); loadView(); data=loadData(); applyPrecision(cfg.precision,false);
    ensureSettingsBlock(); ensurePlayviewMount();
    try { if(typeof window.renderPlayViewTab==="function") window.renderPlayViewTab(); } catch(e){}
    hookEndingTransition(); hookTick();
    if(!isEndingPage){ try{ sample(true); }catch(e){} } else { openEndingPlayview(); applyFollow(true); }
    if(typeof window.renderPlayViewTab==="function" && !window.renderPlayViewTab.__omegaWrapped){
      var rp=window.renderPlayViewTab;
      window.renderPlayViewTab=function(){ var r=rp.apply(this,arguments); ensurePlayviewMount(); return r; };
      window.renderPlayViewTab.__omegaWrapped=true;
    }
    window.addEventListener("resize", function(){ scheduleDraw(); });
  }

  window.OmegaSyncRecord={
    __v:2,
    setPrecision:applyPrecision,
    setIntervalMs:setIntervalMs,
    applyFree:function(){
      var p=document.getElementById("omegaPrecInput");
      var i=document.getElementById("omegaIntInput");
      var m=document.getElementById("omegaMaxInput");
      if(p) applyPrecision(Number(p.value)||cfg.precision,true);
      if(i) setIntervalMs(Math.round((Number(i.value)||1)*1000));
      if(m){ var mv=Number(m.value); if(!isFinite(mv)||mv<0) mv=0; cfg.maxPoints=Math.min(50000, mv); saveCfg(); updateSettingsLabels(); }
    },
    setQuality:function(q){ cfg.quality=(q==="high"||q==="low")?q:"auto"; saveCfg(); updateSettingsLabels(); scheduleDraw(); },
    togglePause:function(){ cfg.paused=!cfg.paused; saveCfg(); updateSettingsLabels(); },
    toggleDots:function(){ cfg.showDots=!cfg.showDots; saveCfg(); updateSettingsLabels(); scheduleDraw(); },
    toggleOverlay:function(){ cfg.overlay=!cfg.overlay; saveCfg(); scheduleDraw(); },
    setMetric:function(m){ view.metric=m; applyFollow(true); saveView(true); },
    setChart:function(c){ view.chart=c; saveView(true); scheduleDraw(); },
    setWindow:setWindow,
    applyWindowSec:function(){ var el=document.getElementById("omegaWinInput"); var sec=el?Number(el.value):120; if(!isFinite(sec)||sec<=0){ setWindow(0); return;} setWindow(Math.round(sec*1000)); },
    setFollow:setFollow,
    zoomT:zoomT,
    zoomY:zoomY,
    unlockY:function(){ view.lockY=false; autoY(); scheduleDraw(); updateToolbar(); },
    toggleMeasure:toggleMeasure,
    clearMeasure:function(){ measure={a:null,b:null,step:0}; renderMeasure(); scheduleDraw(); },
    sample:sample,
    flushForEnding:flushForEnding,
    downloadJSON:downloadJSON,
    downloadCSV:downloadCSV,
    ensurePlayviewMount:ensurePlayviewMount,
    openEndingPlayview:openEndingPlayview,
    view:view,
    cfg:cfg
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
