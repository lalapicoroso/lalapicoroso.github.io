/* Other stuff: carrusel de la home, filtros de la página "View all" y vista ampliada. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var moved = false; // evita abrir una imagen después de arrastrar el carrusel

  /* ---------- Carrusel (home): avanza solo y vuelve a empezar ---------- */
  var track = document.querySelector(".gallery__track");
  if (track) {
    var items = [].slice.call(track.querySelectorAll(".gallery__item"));
    var btns = [].slice.call(document.querySelectorAll(".gallery-btn"));
    var gallery = track.closest(".gallery") || track;

    var padLeft = function () { return parseFloat(getComputedStyle(track).paddingLeft) || 0; };
    var atEnd = function () { return track.scrollLeft + track.clientWidth >= track.scrollWidth - 4; };
    var atStart = function () { return track.scrollLeft <= 2; };
    var currentIndex = function () {
      var x = track.scrollLeft, best = 0, bestD = Infinity;
      items.forEach(function (it, i) {
        var d = Math.abs(it.offsetLeft - padLeft() - x);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    };
    var scrollToLeft = function (left) {
      track.scrollTo({ left: left, behavior: reduce ? "auto" : "smooth" });
    };
    // Avanza o retrocede una pieza; al llegar a un extremo, salta al otro
    var go = function (dir) {
      if (dir > 0 && atEnd()) return scrollToLeft(0);
      if (dir < 0 && atStart()) return scrollToLeft(track.scrollWidth);
      var i = Math.max(0, Math.min(items.length - 1, currentIndex() + dir));
      scrollToLeft(items[i].offsetLeft - padLeft());
    };

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        go(parseInt(b.getAttribute("data-dir"), 10));
        restart();
      });
    });

    // Avance automático: se pausa al pasar el mouse, con el foco adentro,
    // cuando no está en pantalla o si se pidió reducir movimiento.
    var paused = false, visible = true, timer = null, DELAY = 3500;
    function tick() {
      if (!paused && visible && !document.hidden && !dragging) go(1);
    }
    function restart() {
      if (reduce) return;
      clearInterval(timer);
      timer = setInterval(tick, DELAY);
    }
    gallery.addEventListener("mouseenter", function () { paused = true; });
    gallery.addEventListener("mouseleave", function () { paused = false; });
    track.addEventListener("focusin", function () { paused = true; });
    track.addEventListener("focusout", function () { paused = false; });
    track.addEventListener("touchstart", function () { paused = true; restart(); }, { passive: true });
    track.addEventListener("touchend", function () { paused = false; }, { passive: true });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.3 }).observe(track);
    }
    restart();

    // Arrastre con mouse (en táctil y trackpad el scroll ya es nativo)
    var dragging = false, startX = 0, startScroll = 0;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true; moved = false;
      startX = e.clientX; startScroll = track.scrollLeft;
      track.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 5) moved = true;
      track.scrollLeft = startScroll - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
      if (moved) {
        var i = currentIndex();
        scrollToLeft(items[i].offsetLeft - padLeft());
      }
      restart();
    });
    track.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  }

  /* ---------- Filtros (página View all) ---------- */
  var filters = [].slice.call(document.querySelectorAll(".filter"));
  var pieces = [].slice.call(document.querySelectorAll(".archive__item"));
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      var type = f.getAttribute("data-filter");
      filters.forEach(function (o) { o.setAttribute("aria-pressed", String(o === f)); });
      pieces.forEach(function (p) {
        p.hidden = !(type === "all" || p.getAttribute("data-type") === type);
      });
    });
  });

  /* ---------- Vista ampliada ---------- */
  var box = document.querySelector(".lightbox");
  if (!box || typeof box.showModal !== "function") return;
  var img = box.querySelector(".lightbox__img");
  var cap = box.querySelector(".lightbox__caption");

  document.addEventListener("click", function (e) {
    var open = e.target.closest ? e.target.closest(".gallery__open") : null;
    if (!open) return;
    var src = open.querySelector("img");
    if (!src) return; // las tarjetas de muestra no se abren
    img.src = src.getAttribute("data-full") || src.currentSrc || src.src;
    img.alt = src.alt || "";
    var c = open.parentNode.querySelector(".gallery__caption");
    cap.innerHTML = c ? c.innerHTML : "";
    box.showModal();
  });
  box.querySelector(".lightbox__close").addEventListener("click", function () { box.close(); });
  box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
})();
