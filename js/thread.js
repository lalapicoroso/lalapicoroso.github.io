/* Hero: la madeja que se desenreda.
   Un hilo naranja se dibuja enredado y después se desenreda (tirando desde la derecha)
   hasta quedar como la línea recta que cierra el hero.
   - Funciona en loop: el hilo entra por la izquierda y se hace el nudo, se desenreda
     mientras lo tiran desde la derecha hasta que sale entero de la pantalla, y vuelve a empezar.
   - Cuando el hero no está a la vista se pausa; al volver, si estaba en la pausa
     vacía, arranca a entrar enseguida para que siempre se vea movimiento.
   - Con "reducir movimiento" se muestra directamente la línea final, sin loop.
   Para ajustar: DRAW / HOLD / PULL / GAP (duraciones en ms), LOOPS (cantidad de rulos). */
(function () {
  var svg = document.querySelector(".hero__thread");
  if (!svg) return;
  var line = svg.querySelector("polyline");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var N = 1200;                                   // puntos del hilo
  var LOOPS = 16;                                 // rulos de la madeja
  var DRAW = 2600, HOLD = 800;                    // ms: entra y se anuda, pausa enredada
  var PULL = 5200, GAP = 900;                     // ms: se desenreda y sale por la derecha, pantalla vacía
  var SPREAD = 0.5;                               // cuánto se escalona el desenredo
  var W, H, from, to, pull, raf, done = false;

  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function pts(arr) { return arr.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }

  function layout() {
    // El SVG ocupa el ancho visible real de la pantalla (sin la barra de scroll)
    var parent = svg.parentNode.getBoundingClientRect();
    svg.style.left = (-parent.left) + "px";
    svg.style.width = document.documentElement.clientWidth + "px";
    W = svg.getBoundingClientRect().width; H = svg.clientHeight;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var mobile = W < 720;
    var cy = H / 2;                                // la línea final coincide con el borde del pie del hero
    var cx = W * (mobile ? 0.74 : 0.7);
    var R = Math.min(mobile ? W * 0.14 : W * 0.1, 110);
    var x0 = 0, x1 = W;
    var a = 0.22, b = 0.8;                         // entrada | madeja | salida
    var rand = rng(7);
    var ph = [rand() * 6.28, rand() * 6.28, rand() * 6.28, rand() * 6.28];
    var i, s;

    from = [];
    for (i = 0; i < N; i++) {
      s = i / (N - 1);
      var x, y;
      if (s < a) { x = x0 + (cx - R - x0) * (s / a); y = cy; }
      else if (s > b) { x = cx + R + (x1 - cx - R) * ((s - b) / (1 - b)); y = cy; }
      else {
        var t = (s - a) / (b - a);
        var u = t * Math.PI * 2 * LOOPS;
        var env = Math.pow(Math.sin(Math.PI * t), 0.5);
        var r = R * 0.48 * (1 + 0.18 * Math.sin(u * 0.23 + ph[2]));
        var dx = R * 0.52 * Math.cos(u * 0.157 + ph[0]) * Math.cos(u * 0.061 + ph[3]);
        var dy = R * 0.5 * Math.sin(u * 0.113 + ph[1]);
        x = (cx - R) + 2 * R * t + (dx + r * Math.cos(u)) * env - R * (2 * t - 1) * env;
        y = cy + (dy - r * Math.sin(u) * 0.92 - R * 0.55) * env;   // la madeja se apoya sobre la línea
      }
      from.push([x, y]);
    }

    // Línea final: conserva el orden del hilo (largo acumulado), así las vueltas
    // se sueltan en su lugar en vez de deslizarse.
    var arc = [0];
    for (i = 1; i < N; i++) arc.push(arc[i - 1] + Math.hypot(from[i][0] - from[i - 1][0], from[i][1] - from[i - 1][1]));
    var total = arc[N - 1], ia = Math.round(a * (N - 1));
    var c = (x1 + W * 0.35) / (total - arc[ia]);
    to = [];
    for (i = 0; i < N; i++) to.push([Math.max(x0, x1 - (total - arc[i]) * c), cy]);

    // Para el loop: el hilo estirado ocupa todo el ancho (de punta a punta, en orden)
    // y desde ahí se desliza hacia la derecha hasta salir.
    pull = [];
    for (i = 0; i < N; i++) pull.push([x0 + (x1 - x0) * arc[i] / total, cy]);
  }

  function showFinal() {
    line.style.strokeDasharray = "none";
    line.setAttribute("points", pts(to));
    done = true;
  }

  // ---------- Loop: fases y su orden ----------
  var DUR = { draw: DRAW, hold: HOLD, pull: PULL, gap: GAP };
  var NEXT = { draw: "hold", hold: "pull", pull: "gap", gap: "draw" };
  var phase = null, t0 = 0, elapsed = 0, running = false, visible = true, len = 0, entered = false;

  // Desenredo + tirón: cada punto va de la madeja (0) a la línea estirada (1), escalonado
  // desde la punta derecha, y todo el hilo se corre a la derecha hasta salir de la pantalla.
  function easeIn(t) { return t * t * t; }
  function pullFrame(k) {
    var shift = (W + 40) * (0.35 * ease(clamp(k / 0.7, 0, 1)) + 0.65 * easeIn(clamp((k - 0.3) / 0.7, 0, 1)));
    var cur = [];
    for (var i = 0; i < N; i++) {
      var p = ease(clamp((k / 0.85 - (1 - i / (N - 1)) * SPREAD) / (1 - SPREAD), 0, 1));
      cur.push([from[i][0] + (pull[i][0] - from[i][0]) * p + shift, from[i][1] + (pull[i][1] - from[i][1]) * p]);
    }
    line.setAttribute("points", pts(cur));
  }

  function render(k) {
    if (phase === "draw") {
      if (!entered) { line.setAttribute("points", pts(from)); len = line.getTotalLength(); line.style.strokeDasharray = len; }
      line.style.strokeDashoffset = len * (1 - ease(k));
    } else if (phase === "hold") {
      if (!entered) { line.style.strokeDasharray = "none"; line.setAttribute("points", pts(from)); }
    } else if (phase === "pull") {
      line.style.strokeDasharray = "none"; pullFrame(k);
    } else if (phase === "gap") {
      if (!entered) line.setAttribute("points", "");           // no queda nada: pausa vacía
    }
    entered = true;
  }

  function go(name, now) { phase = name; t0 = now; entered = false; }

  function frame(now) {
    if (!running) return;
    var k = (now - t0) / DUR[phase];
    if (k >= 1) { render(1); go(NEXT[phase], now); k = 0; }
    render(k);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || !visible || document.hidden) return;
    running = true;
    var now = performance.now();
    if (phase === "gap") go("draw", now);                      // al volver, que entre enseguida
    else t0 = now - elapsed;
    raf = requestAnimationFrame(frame);
  }

  function pause() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
    elapsed = performance.now() - t0;
  }

  function play() {
    layout();
    if (reduce) return showFinal();
    svg.classList.add("is-ready");
    go("draw", performance.now());
    elapsed = 0;
    start();

    // Pausa cuando el hero sale de la pantalla o la pestaña queda en segundo plano
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else pause();
      }, { threshold: 0.05 }).observe(svg);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause(); else start();
    });
  }

  // Al cambiar el ancho de la ventana se recalcula todo y vuelve a entrar
  // (en celulares, la barra del navegador cambia el alto al scrollear: eso se ignora)
  var rt;
  window.addEventListener("resize", function () {
    if (document.documentElement.clientWidth === W) return;
    clearTimeout(rt);
    rt = setTimeout(function () {
      layout();
      if (reduce || !phase) return showFinal();
      go("gap", performance.now()); elapsed = 0;
    }, 150);
  });

  // Si hay una intro o transición en curso, la madeja espera a que termine
  if (document.documentElement.classList.contains("tr-busy")) {
    document.addEventListener("site:revealed", play, { once: true });
  } else {
    play();
  }
})();
