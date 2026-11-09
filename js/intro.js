/* Intro de la primera visita (solo en el home).
   El hilo naranja entra por la izquierda (temblando un poco, como a mano), dibuja
   un corazón a mano alzada y sigue de largo hasta salir por la derecha; después aparece el sitio y el hilo del hero
   (thread.js) vuelve a entrar por la izquierda.
   - Solo se ve la primera vez: queda guardado en localStorage ("lala-intro").
     Para volver a verla: abrir el home con ?intro en la URL.
   - Un clic, una tecla, la rueda del mouse o un toque la saltean.
   - Con "reducir movimiento" no se muestra.
   - Mientras corre, <html> tiene .tr-busy: thread.js espera el evento "site:revealed".
   Va en el <head>, sin defer (así tapa la página desde el primer cuadro).
   Pausas para que respire: REST = pantalla vacía después de que sale la firma;
   THREAD_DELAY = espera entre que aparece el sitio y arranca el hilo del hero.
   Para ajustar: DRAW / HOLD / PULL / REST / FADE / THREAD_DELAY (ms). */
(function () {
  var root = document.documentElement, KEY = "lala-intro";
  var force = /[?&]intro\b/.test(location.search);
  var store = {
    get: function () { try { return localStorage.getItem(KEY); } catch (e) { return "1"; } },
    set: function () { try { localStorage.setItem(KEY, "1"); } catch (e) {} }
  };
  if (!force && (store.get() || root.classList.contains("tr-in"))) return;
  store.set();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var DRAW = 2000, HOLD = 350, PULL = 950, REST = 500, FADE = 450, THREAD_DELAY = 600;
  var EVENTS = ["click", "keydown", "wheel", "touchstart"];
  root.classList.add("intro-on", "tr-busy");
  // red de seguridad: si algo falla, la página nunca queda tapada
  var safety = setTimeout(end, DRAW + HOLD + PULL + REST + FADE + 2500);

  // Corazón a mano alzada en un solo trazo, en unidades 0..340 (línea de base y = 160).
  // Empieza con "L x y" (donde termina la línea de entrada) y sigue con curvas.
  var HEART = "L 156.8 160 C 163.4 160.2 167.8 160.7 170.0 160.0 C 188.7 139.1 219.5 100.6 229.4 62.1 C 236.0 33.5 223.9 13.7 207.4 18.1 C 190.9 22.5 177.7 52.2 174.4 79.7 C 170.4 54.4 148.0 15.9 120.5 19.6 C 99.6 23.2 97.4 48.9 104.0 68.0 C 112.4 100.6 146.9 139.1 168.2 162.2 C 172.2 165.7 180.6 162.0 193.1 160.9";

  var ld, path, len, t0, raf, revealed = false, finished = false, skipped = false;
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeIn(t) { return t * t * t; }

  // Línea a mano alzada entre dos puntos: un punto cada ~110 px con un temblor suave,
  // unidos con curvas (Catmull-Rom). Semilla fija: siempre tiembla igual.
  var seed = 11;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 - 0.5; }
  function hand(x0, y0, x1, y1) {
    var n = Math.max(2, Math.round(Math.abs(x1 - x0) / 110)), p = [], out = "", i;
    for (i = 0; i <= n; i++) {
      var t = i / n, j = (i === 0 || i === n) ? 0 : rnd() * 7 + Math.sin(t * 5.3 + 1) * 2.5;
      p.push([x0 + (x1 - x0) * t + (i && i < n ? rnd() * 30 : 0), y0 + (y1 - y0) * t + j]);
    }
    for (i = 0; i < p.length - 1; i++) {
      var a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], e = p[Math.min(p.length - 1, i + 2)];
      out += " C " + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + " " + (b[1] + (c[1] - a[1]) / 6).toFixed(1) + " " +
             (c[0] - (e[0] - b[0]) / 6).toFixed(1) + " " + (c[1] - (e[1] - b[1]) / 6).toFixed(1) + " " + c[0].toFixed(1) + " " + c[1].toFixed(1);
    }
    return out;
  }

  function build() {
    var W = window.innerWidth, H = window.innerHeight;
    var s = Math.min(W * 0.62 / 340, 1.9), cy = H / 2;
    var ox = W / 2 - 170 * s, oy = cy - 105 * s, by = oy + 160 * s, k = 0;
    var f = HEART.split(" ");
    var sx = ox + parseFloat(f[1]) * s, sy = oy + parseFloat(f[2]) * s;
    var nums = HEART.slice(HEART.indexOf("C")).split(" ").map(function (t) {
      if (t === "C") { k = 0; return t; }
      var v = parseFloat(t);
      return ((k++ % 2 === 0) ? ox + v * s : oy + v * s).toFixed(1);
    });
    var ex = parseFloat(nums[nums.length - 2]), ey = parseFloat(nums[nums.length - 1]);
    var d = "M -10 " + (by + 6) + hand(-10, by + 6, sx, sy) + " " + nums.join(" ") + hand(ex, ey, W + 10, by - 5);
    ld = document.createElement("div");
    ld.className = "intro";
    ld.setAttribute("aria-hidden", "true");
    ld.innerHTML = '<svg viewBox="0 0 ' + W + " " + H + '"><path d="' + d + '"/></svg>';
    document.body.appendChild(ld);
    path = ld.querySelector("path");
    len = path.getTotalLength();
    path.style.strokeDasharray = len + " " + len;
    path.style.strokeDashoffset = len;
    EVENTS.forEach(function (ev) { window.addEventListener(ev, skip, { passive: true }); });
    t0 = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function frame(now) {
    var t = now - t0;
    if (t < DRAW) path.style.strokeDashoffset = len * (1 - ease(t / DRAW));
    else if (t < DRAW + HOLD) path.style.strokeDashoffset = 0;
    else if (t < DRAW + HOLD + PULL) path.style.strokeDashoffset = -len * easeIn((t - DRAW - HOLD) / PULL);
    else if (t < DRAW + HOLD + PULL + REST) path.style.strokeDashoffset = -len;   // micro silencio
    else return reveal();
    raf = requestAnimationFrame(frame);
  }

  function skip() { skipped = true; cancelAnimationFrame(raf); reveal(); }

  function reveal() {
    if (revealed) return;
    revealed = true;
    EVENTS.forEach(function (ev) { window.removeEventListener(ev, skip); });
    root.classList.remove("intro-on");          // la tapa del primer cuadro ya no hace falta
    if (ld) ld.classList.add("is-out");
    setTimeout(end, FADE);
  }

  function end() {
    if (finished) return;
    finished = true;
    clearTimeout(safety);
    cancelAnimationFrame(raf);
    if (ld && ld.parentNode) ld.parentNode.removeChild(ld);
    root.classList.remove("intro-on", "tr-busy");
    // primero se ve el sitio; el hilo del hero entra un instante después
    setTimeout(function () { document.dispatchEvent(new CustomEvent("site:revealed")); }, skipped ? 0 : THREAD_DELAY);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
