/* Tema claro / oscuro.
   Por defecto: claro, siempre. La elección del visitante se guarda en localStorage
   (funciona en GitHub Pages; no se usa en artifacts). */
(function () {
  var root = document.documentElement;
  var KEY = "lala-theme";

  function applyTheme(mode) {
    if (mode === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  var saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch (e) {
    saved = null;
  }
  // Si el visitante ya eligió, se respeta. Si no, siempre arranca en modo claro
  // (sin importar la configuración del sistema).
  applyTheme(saved || "light");

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".theme-toggle");
    if (!btn) return;

    function sync() {
      var isLight = root.getAttribute("data-theme") === "light";
      var es = root.getAttribute("lang") === "es";
      var label = isLight
        ? (es ? "Cambiar a modo oscuro" : "Switch to dark mode")
        : (es ? "Cambiar a modo claro" : "Switch to light mode");
      if (btn.classList.contains("theme-toggle--icon")) {
        btn.setAttribute("aria-label", label);
      } else {
        btn.textContent = isLight ? (es ? "Modo oscuro" : "Dark mode") : (es ? "Modo claro" : "Light mode");
      }
      btn.setAttribute("aria-pressed", String(isLight));
    }

    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {}
      sync();
    });

    document.addEventListener("langchange", sync);
    sync();
  });
})();
