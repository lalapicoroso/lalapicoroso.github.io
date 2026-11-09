# Portfolio · Lala

Portfolio personal de Lala, Senior Product Designer. Sitio estático en HTML y CSS, sin dependencias de build.

## Estructura

```
portfolio/
├── index.html        Home: hero, trabajos seleccionados, sobre mí
├── proyectos.html    Listado de casos de estudio
├── sobre-mi.html     Sobre mí, capacidades y otros intereses
├── css/
│   └── styles.css    Estilos compartidos (modo oscuro y claro)
├── other.html       Other stuff: todas las fotos, impresos y proyectos (View all)
├── dialpad.html     Caso de estudio de Dialpad (01)
├── yuda.html        Caso de estudio de Yuda (02)
├── kavak.html       Caso de estudio de Kavak Capital (03)
├── plei.html        Caso de estudio de Plei (04)
├── assets/kavak/, assets/plei/  Imágenes de esos casos (sacadas del PDF; se pueden reemplazar por exports de mejor calidad con el mismo nombre)
├── assets/dialpad/  Imágenes y video del caso
├── js/
│   ├── theme.js      Botón de cambio de modo, guarda la elección del visitante
│   ├── i18n.js       Cambio de idioma EN / ES
│   ├── thread.js     Hero: madeja que se desenreda en la línea (duraciones arriba del archivo)
│   ├── case.js       Páginas de caso: marca la sección activa en la navegación de secciones
│   └── transition.js Transición entre páginas: fundido del contenido (header y pill quedan fijos)
└── README.md
```

## Modo claro y oscuro

Por defecto el sitio se ve siempre en modo claro, sin importar la configuración del sistema; si el visitante cambia el modo, se recuerda su elección. El botón del encabezado cambia a modo claro (hueso de fondo y negro tinta de texto). En modo claro, la paleta es blanco roto (`#f5f4f0`) con texto negro, naranja señal (`#ff5b1f`) como relleno en botones, logo y destacados, y un naranja más profundo (`#c2410c`) para los textos en color. Las variables de color están al inicio de `css/styles.css`, en los bloques `:root` (oscuro) y `[data-theme="light"]` (claro).

Tipografía: Bricolage Grotesque para títulos y Geist para el cuerpo, ambas de Google Fonts.

## Idioma (inglés / español)

El sitio está en inglés y en español. El botón **EN / ES** (arriba a la derecha, en el encabezado) cambia el idioma y la elección queda guardada.

- **Primera visita:** siempre arranca en inglés, sin importar el idioma del navegador.
- **Link directo en español:** agregá `?lang=es` a la URL (por ejemplo `https://TU-USUARIO.github.io/portfolio/?lang=es`). Con `?lang=en` se fuerza inglés.
- **Dónde está cada texto:** el inglés está en el HTML, como siempre, y el español está al lado, en el atributo `data-es` del mismo elemento:
  `<p class="lead" data-es="Texto en español">Text in English</p>`
- **Textos con marcador o acento:** dentro del `data-es` usá comillas simples: `data-es="Hola <mark class='hl'>mundo</mark>"`.
- **Atributos** (alt de imágenes, aria-label, meta description): `data-es-a-alt="..."`, `data-es-a-aria-label="..."`, `data-es-a-content="..."`.
- **Texto nuevo:** si sumás un párrafo, agregale su `data-es`. Si no lo tiene, se ve en inglés en las dos versiones.
- La lógica está en `js/i18n.js`.

## Publicar en GitHub Pages

1. Creá un repositorio nuevo en GitHub, por ejemplo `portfolio`.
2. Subí el contenido de la carpeta `portfolio/` (los archivos deben quedar en la raíz del repo, no dentro de una subcarpeta).
3. En el repo, entrá a **Settings → Pages**.
4. En **Source** elegí **Deploy from a branch**, branch `main`, carpeta `/ (root)`, y guardá.
5. En un par de minutos el sitio queda disponible en `https://TU-USUARIO.github.io/portfolio/`.

## Pendiente

- Reemplazar las letras de los paneles de proyecto por capturas reales. Guardá las imágenes en una carpeta `assets/` y cambiá el contenido de `<div class="work__panel">`.
- Crear las páginas de detalle de cada caso, si querés que cada tarjeta lleve a su propio estudio.
- El video del caso de Dialpad se generó a partir de las capturas; para rehacerlo hay que volver a renderizarlo.
- Revisar el texto de la sección de contacto (es un borrador) y el botón "See more" de la sección "Other stuff I do" y el enlace de contacto.

## Páginas de caso

Las cuatro páginas de caso (Dialpad, Yuda, Kavak, Plei) siguen la misma estructura: hero (eyebrow, título en dos tonos, intro, metadatos y equipo), Problem, Research, Solution, Decisions, Prototype, Results, el sistema de diseño y el próximo caso. La navegación de secciones arriba lleva a cada una.

Los recuadros punteados que dicen **Pending:** marcan contenido que falta. Cuando tengas el dato, reemplazá el `<div class="cs-todo">…</div>` por el texto o la imagen. Para buscarlos rápido: buscá `cs-todo` en el HTML.
