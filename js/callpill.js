/* Call pill de Dialpad: anima la secuencia
   1 pill → 2 elegir largo → 3 generando → 4 listo → 5 resumen abierto, en loop.
   Se pausa fuera de pantalla; con reduced-motion muestra el resumen abierto. */
(function () {
  var root = document.querySelector(".cp");
  if (!root) return;
  var card = root.querySelector(".cp__card");
  var action = root.querySelector(".cp__action");
  var cursor = root.querySelector(".cp__cursor");
  var btns = {
    gen: root.querySelector(".cp__btn--gen"),
    len: root.querySelector(".cp__btn--len"),
    busy: root.querySelector(".cp__btn--busy"),
    ok: root.querySelector(".cp__resolved")
  };
  var medium = root.querySelector(".cp__len-m");

  function setState(n) {
    root.setAttribute("data-state", n);
    var b = n === 1 ? btns.gen : n === 2 ? btns.len : n === 3 ? btns.busy : n === 5 ? btns.ok : null;
    action.style.width = b ? b.offsetWidth + "px" : "0px";
  }

  // Reserva el alto del resumen abierto para que la página no salte
  function reserve() {
    var prev = root.getAttribute("data-state");
    root.classList.add("cp--measure");
    root.setAttribute("data-state", "5");
    var h = card.offsetHeight;
    root.setAttribute("data-state", prev);
    void card.offsetHeight;
    root.classList.remove("cp--measure");
    root.style.minHeight = h + "px";
  }

  function moveTo(el, dx, dy) {
    var r = root.getBoundingClientRect(), e = el.getBoundingClientRect();
    var x = e.left - r.left + e.width * (dx == null ? 0.5 : dx);
    var y = e.top - r.top + e.height * (dy == null ? 0.6 : dy);
    cursor.style.transform = "translate(" + x + "px," + y + "px)";
  }
  function park() {
    cursor.style.transform = "translate(" + (root.offsetWidth * 0.62) + "px," + (root.offsetHeight + 40) + "px)";
  }
  function click() {
    cursor.classList.remove("is-click");
    void cursor.offsetWidth;
    cursor.classList.add("is-click");
  }

  var run = 0, visible = false, playing = false;
  function wait(ms, id) {
    return new Promise(function (res, rej) {
      setTimeout(function () { id === run ? res() : rej("stop"); }, ms);
    });
  }

  async function loop(id) {
    try {
      while (true) {
        root.classList.remove("is-picked");
        setState(1); park(); cursor.classList.remove("is-on");
        await wait(1100, id);
        cursor.classList.add("is-on"); moveTo(btns.gen);
        await wait(900, id);
        click(); await wait(220, id);
        setState(2);
        await wait(700, id);
        moveTo(medium);
        await wait(900, id);
        click(); root.classList.add("is-picked");
        await wait(380, id);
        setState(3);
        await wait(250, id);
        cursor.classList.remove("is-on");
        await wait(300, id);
        park();
        await wait(2200, id);
        setState(4);
        await wait(550, id);
        setState(5);
        await wait(6200, id);
        root.classList.add("is-closing");
        await wait(500, id);
        root.classList.remove("is-closing");
        setState(1);
        await wait(700, id);
      }
    } catch (e) { /* se detuvo */ }
  }

  function start() { if (playing) return; playing = true; run++; loop(run); }
  function stop() { playing = false; run++; }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    reserve(); setState(5); return;
  }

  function init() {
    reserve(); setState(1); park();
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      visible && !document.hidden ? start() : stop();
    }, { threshold: 0.35 }).observe(root);
    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : visible && start();
    });
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () { root.style.minHeight = ""; reserve(); setState(+root.getAttribute("data-state")); }, 150);
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init); else init();
})();
