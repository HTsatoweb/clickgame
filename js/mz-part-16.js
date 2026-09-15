
window._facDetId = 0;
window.openFactoryDetail = function(id){
  const f = (typeof DB_FACTORIES !== "undefined") ? DB_FACTORIES[id] : null;
  if (!f) { if (typeof executeBuyFactory === "function") executeBuyFactory(id); return; }
  window._facDetId = id;
  const ov = document.getElementById("factoryDetailOverlay");
  const title = document.getElementById("facDetTitle");
  const desc = document.getElementById("facDetDesc");
  const stats = document.getElementById("facDetStats");
  const buy = document.getElementById("facDetBuy");
  const count = (window.game && game.facCounts && game.facCounts[id]) || 0;
  let cost = "—", cps = "—", one = "—";
  try { if (typeof getFactoryCost === "function") cost = formatValue(getFactoryCost(id)); } catch(e){}
  try { if (typeof getFactoryCps === "function") cps = formatValue(getFactoryCps(id)); } catch(e){}
  try {
    if (typeof D === "function" && f.baseCps != null) {
      const g = (typeof getGlobalProductionMultiplier === "function") ? getGlobalProductionMultiplier() : 1;
      one = formatValue(D(f.baseCps).mul(g));
    }
  } catch(e){}
  if (title) title.textContent = (f.name || ("施設 #"+(id+1)));
  if (desc) desc.textContent = f.desc || "この施設はエネルギーを自動で作ります。";
  if (stats) stats.innerHTML =
    "<div class='pv-item on'><b>所持</b>"+count+" 基</div>"+
    "<div class='pv-item'><b>次のコスト</b>"+cost+" E</div>"+
    "<div class='pv-item'><b>1基あたり</b>約 "+one+" /s</div>"+
    "<div class='pv-item'><b>合計生産</b>"+cps+" /s</div>";
  if (buy) buy.onclick = function(){
    if (typeof executeBuyFactory === "function") executeBuyFactory(id);
    openFactoryDetail(id);
  };
  if (ov) { ov.style.display = "flex"; ov.setAttribute("aria-hidden","false"); }
};
window.closeFactoryDetail = function(){
  const ov = document.getElementById("factoryDetailOverlay");
  if (ov) { ov.style.display = "none"; ov.setAttribute("aria-hidden","true"); }
};
document.addEventListener("keydown", function(e){
  if (e.key === "Escape") closeFactoryDetail();
});
(function(){
  const ov = document.getElementById("factoryDetailOverlay");
  if (ov) ov.addEventListener("click", function(e){ if (e.target === ov) closeFactoryDetail(); });
})();
