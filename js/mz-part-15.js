
window.toggleAboutGame = function(force){
  const el = document.getElementById("aboutGameOverlay");
  if (!el) return;
  const open = (force === true) || (force !== false && el.style.display !== "flex");
  el.style.display = open ? "flex" : "none";
  el.setAttribute("aria-hidden", open ? "false" : "true");
};
document.addEventListener("keydown", function(e){
  if (e.key === "Escape") {
    const el = document.getElementById("aboutGameOverlay");
    if (el && el.style.display === "flex") toggleAboutGame(false);
  }
});
(function(){
  const el = document.getElementById("aboutGameOverlay");
  if (!el) return;
  el.addEventListener("click", function(e){ if (e.target === el) toggleAboutGame(false); });
})();
