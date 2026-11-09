/* Páginas de caso: "at-top" mientras no se scrolleó (encabezado transparente sobre el degradé). */
(function () {
  var root = document.documentElement;
  function check() { root.classList.toggle("at-top", window.scrollY < 8); }
  check();
  window.addEventListener("scroll", check, { passive: true });
})();

/* Páginas de caso: marca en la navegación de secciones la que se está leyendo. */
(function () {
  var links = [].slice.call(document.querySelectorAll(".cs-subnav__links a[href^='#']"));
  if (!links.length || !("IntersectionObserver" in window)) return;
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      links.forEach(function (a) { a.removeAttribute("aria-current"); });
      var a = byId[en.target.id];
      if (a) a.setAttribute("aria-current", "true");
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  Object.keys(byId).forEach(function (id) {
    var sec = document.getElementById(id);
    if (sec) spy.observe(sec);
  });
})();

/* Capturas de los deep dives (.ed-shot): click para verlas grandes */
(function () {
  document.addEventListener("click", function (e) {
    var img = e.target.closest && e.target.closest(".ed-shot img");
    if (!img) return;
    var box = document.createElement("div");
    box.className = "ed-lightbox";
    var big = document.createElement("img");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    box.appendChild(big);
    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add("is-open"); });
    function close() { box.classList.remove("is-open"); setTimeout(function () { box.remove(); }, 200); document.removeEventListener("keydown", onKey); }
    function onKey(ev) { if (ev.key === "Escape") close(); }
    box.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
  });
})();

/* Cifras que cuentan desde 0 cuando entran en pantalla (.ed-result__num[data-count]) */
(function () {
  var els = document.querySelectorAll("[data-count]");
  if (!els.length || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  els.forEach(function (el) { el.textContent = "0" + (el.dataset.suffix || ""); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      var el = e.target, to = +el.dataset.count, suf = el.dataset.suffix || "";
      var idx = Array.prototype.indexOf.call(els, el), delay = (idx % 3) * 150, dur = 1400, t0;
      function step(t) {
        if (!t0) t0 = t + delay;
        var p = Math.max(0, Math.min(1, (t - t0) / dur));
        var v = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * v) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  els.forEach(function (el) { io.observe(el); });
})();
