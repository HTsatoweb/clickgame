(function(){
  "use strict";
  function compactRecord(){
    try{
      var raw=localStorage.getItem("omega_record_v1");
      if(!raw) return;
      if(raw.length<80000) return;
      var o=JSON.parse(raw);
      ["energy","cps","am","ts","stars","clicks"].forEach(function(k){
        if(Array.isArray(o[k]) && o[k].length>300) o[k]=o[k].slice(-240);
      });
      if(o.hires){
        ["energy","cps","am","ts"].forEach(function(k){
          if(Array.isArray(o.hires[k]) && o.hires[k].length>80) o.hires[k]=o.hires[k].slice(-60);
        });
      }
      localStorage.setItem("omega_record_v1", JSON.stringify(o));
    }catch(e){
      try{ localStorage.removeItem("omega_record_v1"); }catch(e2){}
    }
  }
  compactRecord();
  function keys(){ return ["omega_record_v1","omega_record_cfg_v1","omega_record_view_v1","mz_elements_v1","mz_minigame_v1"]; }
  window.resetGraphStorage=function(){
    keys().forEach(function(k){ try{ localStorage.removeItem(k);}catch(e){} });
  };
  var prev=window.hardResetGame;
  if(typeof prev==="function"){
    window.hardResetGame=function(){
      try{ window.resetGraphStorage(); }catch(e){}
      return prev.apply(this, arguments);
    };
  }
})();
