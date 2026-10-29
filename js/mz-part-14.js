
(function(){
  function mult(){
    const L = window.OmegaLong || {bought:{}};
    const b = L.bought || {};
    let click = 1, cps = 1;
    if (b.t1) click += 0.03; if (b.t2) click += 0.05; if (b.t3) click += 0.08;
    if (b.c1) cps += 0.03; if (b.c2) cps += 0.05; if (b.c3) cps += 0.08;
    return {click, cps};
  }
  window.__omegaResMult = mult;
  function wrap(){
    if (window.__omegaResWrapped) return;
    const gc = window.getClickPower, gs = window.getTotalCps;
    if (typeof gc === "function") {
      window.getClickPower = function(){
        const v = gc.apply(this, arguments);
        const m = mult().click;
        try { if (v && v.mul) return v.mul(m); if (typeof v==="number") return v*m; } catch(e){}
        return v;
      };
    }
    if (typeof gs === "function") {
      window.getTotalCps = function(){
        const v = gs.apply(this, arguments);
        const m = mult().cps;
        try { if (v && v.mul) return v.mul(m); if (typeof v==="number") return v*m; } catch(e){}
        return v;
      };
    }
    window.__omegaResWrapped = true;
  }
  setTimeout(wrap, 800);
  setTimeout(wrap, 2500);
})();
