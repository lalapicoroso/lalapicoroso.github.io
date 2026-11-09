/* Movimiento del sitio
   - Revelado al hacer scroll
   - Palabra rotativa del hero
   - Constelación del hero: nodos que flotan y se pueden arrastrar
   Con "prefers-reduced-motion" todo queda estático. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  /* ---------- Revelado al hacer scroll ---------- */
  var reveals = [].slice.call(document.querySelectorAll(".reveal"));
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }
  [].slice.call(document.querySelectorAll(".case-list, .rows, .acc, .work-featured, .work-grid3")).forEach(function (list) {
    [].slice.call(list.children).forEach(function (el, i) {
      el.style.transitionDelay = (i * 90) + "ms";
    });
  });

  /* ---------- Video: se detiene si se pide reducir movimiento ---------- */
  if (reduce) {
    [].slice.call(document.querySelectorAll("video[autoplay]")).forEach(function (v) {
      v.removeAttribute("autoplay");
      v.removeAttribute("loop");
      v.pause();
      v.setAttribute("controls", "");
    });
  }

  /* ---------- Marcador: las frases clave se resaltan al aparecer ---------- */
  var marks = [].slice.call(document.querySelectorAll("mark.hl"));
  var mio = null;
  if (reduce || !("IntersectionObserver" in window)) {
    marks.forEach(function (el) { el.classList.add("is-marked"); });
  } else {
    mio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-marked");
          mio.unobserve(en.target);
        }
      });
    }, { threshold: 1, rootMargin: "0px 0px -12% 0px" });
    marks.forEach(function (el) { mio.observe(el); });
  }
  // Al cambiar de idioma los textos se reemplazan: los marcadores nuevos
  // aparecen ya pintados si su sección estaba a la vista, o se observan de nuevo.
  document.addEventListener("langchange", function () {
    [].slice.call(document.querySelectorAll("mark.hl:not(.is-marked)")).forEach(function (el) {
      if (reduce || !mio) { el.classList.add("is-marked"); return; }
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-marked");
      else mio.observe(el);
    });
  });

  /* ---------- Pie de página: hora real de Buenos Aires ---------- */
  var clocks = [].slice.call(document.querySelectorAll(".js-clock"));
  if (clocks.length && window.Intl) {
    var fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", hour12: false,
      timeZone: "America/Argentina/Buenos_Aires"
    });
    var tickClock = function () {
      var now = fmt.format(new Date());
      clocks.forEach(function (c) { c.textContent = now; });
    };
    tickClock();
    setInterval(tickClock, 15000);
  }

  /* ---------- Sorpresa: la tecla G muestra la grilla del sitio ---------- */
  var grid = document.createElement("div");
  grid.className = "grid-overlay";
  grid.setAttribute("aria-hidden", "true");
  var cols = "";
  for (var gc = 0; gc < 12; gc++) cols += "<span></span>";
  grid.innerHTML = '<div class="wrap grid-overlay__cols">' + cols + "</div>";
  var toast = document.createElement("div");
  toast.className = "grid-toast";
  toast.setAttribute("role", "status");
  document.body.appendChild(grid);
  document.body.appendChild(toast);
  var toastTimer;
  document.addEventListener("keydown", function (e) {
    if (e.key !== "g" && e.key !== "G") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var on = grid.classList.toggle("is-on");
    var n = window.matchMedia("(max-width: 720px)").matches ? 4 : 12;
    var es = root.getAttribute("lang") === "es";
    toast.textContent = on
      ? (es ? "Grilla de " + n + " columnas · apretá G para ocultarla" : n + "-column grid · press G to hide")
      : (es ? "Grilla oculta" : "Grid hidden");
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 1800);
  });

  /* ---------- Flecha del hero: se oculta al empezar a bajar ---------- */
  var heroArrow = document.querySelector(".hero__scroll");
  if (heroArrow) {
    var onScrollArrow = function () {
      heroArrow.classList.toggle("is-hidden", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScrollArrow, { passive: true });
    onScrollArrow();
  }

  /* ---------- Sección activa en la píldora del menú ---------- */
  var pill = document.querySelector(".pill");
  if (pill && "IntersectionObserver" in window) {
    var pillLinks = [].slice.call(pill.querySelectorAll("a[href^='#']"));
    var linkFor = {};
    pillLinks.forEach(function (a) { linkFor[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        pillLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        var a = linkFor[en.target.id];
        if (a) a.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["top", "work", "about", "contacto"].forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  /* ---------- Palabra del hero: se escribe y se borra como si se tipeara ---------- */
  var rot = document.querySelector("[data-rotate]");
  var rotText = rot ? rot.querySelector(".rotator__text") : null;
  if (rot && rotText) {
    // Al cambiar de idioma, la palabra actual se reemplaza por su equivalente
    var lastWords = rot.getAttribute("data-rotate").split("|");
    // Si el idioma ya cambió antes de que cargara este script, arranca con la palabra correcta
    if (lastWords.indexOf(rotText.textContent.trim()) < 0) {
      rotText.textContent = lastWords[lastWords.length - 1];
    }
    document.addEventListener("langchange", function () {
      var nw = rot.getAttribute("data-rotate").split("|");
      var i = lastWords.indexOf(rotText.textContent.trim());
      if (reduce || i >= 0) rotText.textContent = nw[i >= 0 ? i : nw.length - 1];
      lastWords = nw;
    });
  }
  /* Si alguna palabra no entra en la línea donde empieza, la palabra va siempre
     en su propia línea: así el título no "salta" mientras se tipea. */
  if (rot && rotText) {
    var fitRotator = function () {
      var cur = rotText.textContent;
      rot.classList.remove("is-stacked");
      rotText.textContent = "";
      var top0 = rot.getBoundingClientRect().top;
      var jumps = rot.getAttribute("data-rotate").split("|").some(function (w) {
        rotText.textContent = w;
        return Math.abs(rot.getBoundingClientRect().top - top0) > 2;
      });
      rotText.textContent = cur;
      rot.classList.toggle("is-stacked", jumps);
    };
    fitRotator();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitRotator);
    var fitT;
    window.addEventListener("resize", function () { clearTimeout(fitT); fitT = setTimeout(fitRotator, 120); });
    document.addEventListener("langchange", fitRotator);
  }
  if (rot && rotText && !reduce) {
    var words = rot.getAttribute("data-rotate").split("|");
    var wi = Math.max(0, words.indexOf(rotText.textContent.trim()));
    var TYPE = 95, ERASE = 55, HOLD = 1700, GAP = 350;

    var erase = function () {
      var t = rotText.textContent;
      if (t.length) {
        rotText.textContent = t.slice(0, -1);
        setTimeout(erase, ERASE);
      } else {
        words = rot.getAttribute("data-rotate").split("|");   // relee por si cambió el idioma
        wi = (wi + 1) % words.length;
        setTimeout(type, GAP);
      }
    };
    var type = function () {
      var word = words[wi], t = rotText.textContent;
      if (t.length < word.length) {
        rotText.textContent = word.slice(0, t.length + 1);
        setTimeout(type, TYPE);
      } else {
        rot.classList.add("is-idle");          // el cursor titila mientras espera
        setTimeout(function () { rot.classList.remove("is-idle"); erase(); }, HOLD);
      }
    };
    rot.classList.add("is-idle");
    setTimeout(function () { rot.classList.remove("is-idle"); erase(); }, HOLD + 600);
  }


  /* ---------- Constelación del hero ---------- */
  var svg = document.querySelector(".constellation");
  if (svg) {
    // Posiciones de reposo (mismo diagrama que tenías) y etiquetas
    var nodes = [
      { name: "Strategy",    x: 210, y: 60,  lx: 12,  ly: 2 },
      { name: "Research",    x: 318, y: 115, lx: 10,  ly: -3 },
      { name: "Discovery",   x: 210, y: 158, lx: 12,  ly: 18, center: true },
      { name: "Design",      x: 268, y: 226, lx: 10,  ly: 18 },
      { name: "AI",          x: 122, y: 232, lx: 10,  ly: 4 },
      { name: "Interaction", x: 92,  y: 150, lx: -14, ly: -12 }
    ];
    var edges = [[0,5],[0,1],[0,2],[5,2],[1,2],[2,4],[2,3],[4,3],[5,4],[1,3]];

    nodes.forEach(function (n, i) {
      n.hx = n.x; n.hy = n.y;          // posición de reposo
      n.px = n.x; n.py = n.y;          // posición actual
      n.vx = 0; n.vy = 0;
      n.phase = i * 1.7 + 0.4;         // desfase para que no se muevan igual
    });

    function el(tag, attrs, parent) {
      var e = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      parent.appendChild(e);
      return e;
    }

    svg.innerHTML = "";
    var gLines = el("g", {}, svg);
    var gNodes = el("g", {}, svg);
    var gHits = el("g", {}, svg);
    var gText = el("g", {}, svg);

    var lineEls = edges.map(function () {
      return el("line", { stroke: "#c6f25a", "stroke-opacity": "0.4", "stroke-width": "1" }, gLines);
    });
    var circleEls = nodes.map(function (n) {
      return el("circle", n.center
        ? { r: 6, fill: "#c6f25a" }
        : { r: 4, fill: "#0b0b09", stroke: "#c6f25a", "stroke-width": "1.2" }, gNodes);
    });
    var hitEls = nodes.map(function (n, i) {
      var h = el("circle", { r: 18, fill: "transparent", "data-i": String(i), class: "hit" }, gHits);
      h.style.cursor = "grab";
      return h;
    });
    var textEls = nodes.map(function (n) {
      var t = el("text", {}, gText);
      t.textContent = n.name;
      return t;
    });

    svg.style.touchAction = "none";

    var dragIdx = -1;
    var pt = svg.createSVGPoint();
    function toSvg(e) {
      pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    if (!reduce) {
      svg.addEventListener("pointerdown", function (e) {
        var t = e.target.closest ? e.target.closest(".hit") : null;
        if (!t) return;
        dragIdx = parseInt(t.getAttribute("data-i"), 10);
        svg.setPointerCapture(e.pointerId);
        t.style.cursor = "grabbing";
        e.preventDefault();
      });
      svg.addEventListener("pointermove", function (e) {
        if (dragIdx < 0) return;
        var p = toSvg(e);
        var n = nodes[dragIdx];
        n.px = Math.max(10, Math.min(410, p.x));
        n.py = Math.max(10, Math.min(310, p.y));
        n.vx = 0; n.vy = 0;
      });
      function endDrag() {
        if (dragIdx >= 0) hitEls[dragIdx].style.cursor = "grab";
        dragIdx = -1;
      }
      svg.addEventListener("pointerup", endDrag);
      svg.addEventListener("pointercancel", endDrag);
    }

    function drawConstellation(t) {
      nodes.forEach(function (n, i) {
        if (i !== dragIdx) {
          // Reposo: pequeña deriva alrededor de la posición original
          var bx = n.hx + Math.sin(t * 0.0006 + n.phase) * 6;
          var by = n.hy + Math.cos(t * 0.0005 + n.phase * 1.3) * 6;
          // Resorte suave que devuelve el nodo a su lugar
          n.vx += (bx - n.px) * 0.012 - n.vx * 0.09;
          n.vy += (by - n.py) * 0.012 - n.vy * 0.09;
          n.px += n.vx;
          n.py += n.vy;
        }
      });
      edges.forEach(function (ed, k) {
        var a = nodes[ed[0]], b = nodes[ed[1]];
        var l = lineEls[k];
        l.setAttribute("x1", a.px); l.setAttribute("y1", a.py);
        l.setAttribute("x2", b.px); l.setAttribute("y2", b.py);
      });
      nodes.forEach(function (n, i) {
        circleEls[i].setAttribute("cx", n.px); circleEls[i].setAttribute("cy", n.py);
        hitEls[i].setAttribute("cx", n.px); hitEls[i].setAttribute("cy", n.py);
        textEls[i].setAttribute("x", n.px + n.lx); textEls[i].setAttribute("y", n.py + n.ly);
      });
    }

    if (reduce) {
      drawConstellation(0);
    } else {
      (function loop(t) {
        if (!document.hidden) drawConstellation(t);
        requestAnimationFrame(loop);
      })(0);
    }
  }
})();

/* ---------- What I do best: acordeón (cada fila se abre y se cierra) ---------- */
(function () {
  [].slice.call(document.querySelectorAll(".acc__btn")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".acc__item");
      var open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });
})();
