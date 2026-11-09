/* Idioma: inglés / español.
   - El texto en inglés vive en el HTML, como siempre.
   - La versión en español está al lado, en el atributo data-es del mismo elemento.
     Ej: <p data-es="Hola">Hello</p>
   - Para atributos (alt, aria-label, etc.) se usa data-es-a-NOMBRE.
     Ej: <img alt="Phone" data-es-a-alt="Celular">
   - Para editar un texto en español, cambiá el data-es. Para sumar uno nuevo, agregale data-es al elemento.

   Cómo se elige el idioma:
   1. ?lang=es o ?lang=en en la URL (sirve para mandar el link directo en español)
   2. Lo que eligió el visitante antes (se guarda en localStorage)
   3. Si no hay nada de lo anterior: inglés, siempre (no importa el idioma del navegador) */
(function () {
  var root = document.documentElement;
  var KEY = "lala-lang";

  var param = (location.search.match(/[?&]lang=(en|es)\b/) || [])[1];
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var lang = param || saved || "en";   // por defecto, siempre inglés
  if (param) { try { localStorage.setItem(KEY, param); } catch (e) {} }

  root.setAttribute("lang", lang);

  // Si arranca en español, se oculta la página un instante para que no se vea el inglés antes.
  if (lang === "es") {
    root.classList.add("i18n-pending");
    var st = document.createElement("style");
    st.textContent = "html.i18n-pending body{visibility:hidden}";
    document.head.appendChild(st);
    setTimeout(function () { root.classList.remove("i18n-pending"); }, 1500); // por las dudas
  }

  var PREFIX = "data-es-a-";

  function apply(to) {
    // Textos
    [].slice.call(document.querySelectorAll("[data-es]")).forEach(function (el) {
      if (!el.hasAttribute("data-en")) el.setAttribute("data-en", el.innerHTML);
      var next = el.getAttribute(to === "es" ? "data-es" : "data-en");
      if (el.innerHTML !== next) el.innerHTML = next;
    });
    // Atributos
    [].slice.call(document.querySelectorAll("*")).forEach(function (el) {
      [].slice.call(el.attributes).forEach(function (at) {
        if (at.name.indexOf(PREFIX) !== 0) return;
        var target = at.name.slice(PREFIX.length);
        var keep = "data-en-a-" + target;
        if (!el.hasAttribute(keep)) el.setAttribute(keep, el.getAttribute(target) || "");
        el.setAttribute(target, to === "es" ? at.value : el.getAttribute(keep));
      });
    });
    root.setAttribute("lang", to);
    lang = to;
    root.classList.remove("i18n-pending");
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: to } }));
  }

  window.siteLang = function () { return lang; };

  // Se aplica en cuanto termina de leerse el HTML, antes de que corran motion.js y gallery.js
  function init() {
    if (lang === "es") apply("es");
    var btn = document.querySelector(".lang-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var next = lang === "es" ? "en" : "es";
        try { localStorage.setItem(KEY, next); } catch (e) {}
        apply(next);
      });
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("readystatechange", function once() {
      document.removeEventListener("readystatechange", once);
      init();
    });
  } else {
    init();
  }
})();
