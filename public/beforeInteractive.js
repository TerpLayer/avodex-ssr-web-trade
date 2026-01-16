(() => {
  var el = document.getElementById("app-before-interactive");
  var th = el && el.getAttribute("data-theme");
  document.body.setAttribute("data-theme", th || (document.cookie.includes("theme=dark") ? "dark" : "light"));
})();
