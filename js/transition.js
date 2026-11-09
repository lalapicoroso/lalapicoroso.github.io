/* Transición entre páginas: fundido.
   1. Al hacer clic en un link a otra página del sitio, el contenido se
      desvanece subiendo apenas.
   2. La página nueva entra con un fundido, subiendo desde un poco más abajo.
   - El encabezado y la píldora de navegación quedan fijos: solo se mueve el
     contenido (main, navegación de secciones y pie).
   - Con "reducir movimiento" se navega normal, sin animación.
   Va en el <head>, después de theme.js e i18n.js (sin defer).
   Para ajustar: OUT / IN (duraciones en ms) y RISE_OUT / RISE_IN (cuánto sube, en px). */
(function () {
  var root = document.documentElement;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var OUT = 240, IN = 420, RISE_OUT = 10, RISE_IN = 18;
  var EASE_IN = "ease-in";
  var EASE_OUT = "cubic-bezier(0.2, 0.7, 0.2, 1)";
  var KEY = "lala-tr";
  var TARGETS = "main, .cs-subnav, .site-footer";

  var ss = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  function targets() { return [].slice.call(document.querySelectorAll(TARGETS)); }

  // ¿Venimos de otra página del sitio? Entonces el contenido arranca oculto
  var arriving = ss.get(KEY) === "1";
  ss.del(KEY);
  if (arriving) {
    root.classList.add("tr-in", "tr-busy");
    var st = document.createElement("style");
    st.textContent = "html.tr-in main,html.tr-in .cs-subnav,html.tr-in .site-footer{opacity:0}";
    document.head.appendChild(st);
  }

  // ---------- Llegada: el contenido entra con un fundido ----------
  document.addEventListener("DOMContentLoaded", function () {
    if (!arriving) return;
    var els = targets();
    function done() {
      root.classList.remove("tr-busy");
      document.dispatchEvent(new CustomEvent("site:revealed"));
    }
    if (!els.length || !els[0].animate) { root.classList.remove("tr-in"); return done(); }
    var anims = els.map(function (el) {
      return el.animate([{ opacity: 0, transform: "translateY(" + RISE_IN + "px)" }, { opacity: 1, transform: "translateY(0)" }],
                        { duration: IN, easing: EASE_OUT, fill: "backwards" });
    });
    root.classList.remove("tr-in");
    anims[0].onfinish = done;
  });

  // Si el navegador restaura la página desde su caché (botón Atrás), se muestra todo
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    leaving = false;
    targets().forEach(function (el) {
      el.getAnimations && el.getAnimations().forEach(function (a) { a.cancel(); });
    });
    root.classList.remove("tr-in", "tr-busy");
  });

  // ---------- Salida: clic en un link a otra página del sitio ----------
  var leaving = false;
  document.addEventListener("click", function (e) {
    if (leaving || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto|tel|javascript):/i.test(href)) return;
    if (a.protocol !== location.protocol || a.host !== location.host) return;
    if (a.pathname === location.pathname) return;               // mismo documento (ancla)
    if (!/\.html$|\/$/.test(a.pathname)) return;                // solo páginas, no archivos

    var els = targets();
    if (!els.length || !els[0].animate) return;                 // navegador viejo: navegación normal
    e.preventDefault();
    leaving = true;
    ss.set(KEY, "1");
    var anims = els.map(function (el) {
      return el.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-" + RISE_OUT + "px)" }],
                        { duration: OUT, easing: EASE_IN, fill: "forwards" });
    });
    anims[0].onfinish = function () { location.href = a.href; };
  });
})();
