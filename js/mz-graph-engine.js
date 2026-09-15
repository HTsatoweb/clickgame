(function(){
  "use strict";
  function keys(){ return ["omega_record_v1","omega_record_cfg_v1","omega_record_view_v1","mz_elements_v1","mz_minigame_v1"]; }
  function resetGraphs(){
    keys().forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} });
    try{
      if (window.OmegaSyncRecord && typeof OmegaSyncRecord.resetData === "function") OmegaSyncRecord.resetData();
    }catch(e){}
  }
  window.resetGraphStorage = resetGraphs;
  var prev = window.hardResetGame;
  if (typeof prev === "function") {
    window.hardResetGame = function(){
      try { resetGraphs(); } catch(e){}
      return prev.apply(this, arguments);
    };
  }
  function tune(){
    var R = window.OmegaSyncRecord;
    if (!R || !R.cfg) return;
    if (!R.cfg.intervalMs) {
      if (typeof R.setIntervalMs === "function") R.setIntervalMs(250);
      else R.cfg.intervalMs = 250;
    }
    if (!R.resetData) {
      R.resetData = function(){
        try{ localStorage.removeItem("omega_record_v1"); }catch(e){}
      };
    }
  }
  if (document.readyState === "complete") tune();
  else addEventListener("load", tune);
})();
