# PLAN ACTIVO — Personal · tarjeta digital NFC de Carlos

**Estado:** listo_para_codex
**Escrito por:** Claude Code · **Fecha:** 2026-08-05 · **Aprobado por Carlos:** 2026-08-05

**Empieza por el 🔴 BUG CONFIRMADO** de la sección "DÓNDE QUEDÓ CLAUDE", y después por los pasos
sueltos de las fases 0 y 2. Las fases 1 y 5 ya están hechas (la 5, sujeta a que el bug se arregle).
**Diseño de referencia:** `DISENO.md` (mismo folder). Si este plan y el diseño se contradicen,
manda el diseño y hay que corregir el plan.

## Objetivo

Construir y desplegar la tarjeta de presentación digital NFC de Carlos Álvarez: un hub personal
con dos ramas —Agencia ALSAI y Blindafón— cada una con guardar contacto, WhatsApp y agendar.

---

## Cómo se ejecuta este plan (importante)

Está partido en **fases que dejan la tarjeta funcionando al terminar cada una**. Nadie queda a
medias: si se corta la ejecución en la fase 5, lo construido hasta la 4 es desplegable.

**Claude Code arranca. Codex continúa desde la primera fase con ⬜.**
Quien ejecute marca la casilla y anota la fecha **en el mismo turno** en que termina la fase.

| Fase | Qué deja | Estado |
|---|---|---|
| 0 | Andamiaje del repo, dependencias, foto procesada | ✅ **Codex, 2026-08-05** — foto y dos logos procesados y verificados |
| 1 | Sistema de diseño en CSS + `tarjeta.ts` con todos los datos | ✅ **Claude, 2026-08-05** |
| 2 | Hub navegable y desplegable | ✅ **Codex, 2026-08-05** — componentes, retrato y navegación verificados |
| 3 | Las dos ramas completas: vCard, WhatsApp, agendar | ✅ **Codex, 2026-08-05** — ramas, acciones y vCard con foto verificados |
| 4 | Transición de bifurcación con morph cromático | ✅ **Codex, 2026-08-05** — clip, morph, retrato y movimiento reducido verificados |
| 5 | El relieve (el fondo) | ✅ **Codex, 2026-08-05** — shader corregido y verificado con Chrome/Puppeteer |
| 6 | Tarjeta 3D en el hub | ✅ **Codex, 2026-08-05** — proporción, resorte, puntero y orientación verificados |
| 7 | PWA, háptica, atribución de origen, compartir + QR | ✅ **Codex, 2026-08-05** — manifest, origen silencioso, compartir y QR verificados |
| 8 | SEO, Open Graph, GA4, aviso de privacidad | ✅ **Codex, 2026-08-05** — metadatos, eventos, OG y aviso verificados con Chrome/Puppeteer |
| 9 | QA headless en móvil y despliegue | ⬜ **QA aprobado; despliegue pendiente de `vercel login`** |

### Ajuste aprobado por Carlos — 2026-08-05

- El hub usa la descripción exacta: «Soy un emprendedor que combina tecnología, creatividad e
  innovación para convertir ideas en soluciones que ayuden a la gente.»
- Orden del hub: momento visual 3D/retrato, nombre, descripción, pregunta, ALSAI, Blindafón y
  acciones de guardar/compartir.
- `?src=nfc|qr|link` se conserva para analítica, sin micro-bienvenida distinta por origen.
- El relieve WebGL reactivo al giroscopio se conserva como efecto principal.
- Las dos ramas mantienen información esencial y acciones grandes de guardar, WhatsApp y compartir.

**Antes de continuar, Codex lee:** `CONTEXTO.md`, `DISENO.md` y `AGENTS.md`, todos en esta carpeta.
Nada más hace falta.

---

## DÓNDE QUEDÓ CLAUDE — 2026-08-05

Lee esto antes que nada. La fase 5 se adelantó a propósito: era la decisión de diseño con más
riesgo y Carlos tenía que verla funcionando antes de invertir en el resto.

### Lo que ya existe y funciona

`npm install` hecho (74 paquetes) y `npm run build` pasa limpio. Salida real:
`index-*.js` 148.66 kB (48.27 gz) · `Relieve-*.js` 52.94 kB (16.28 gz) · CSS 12.95 kB (2.62 gz).
El chunk del WebGL queda separado, que es el criterio de aceptación de la fase 5.

| Archivo | Qué hace |
|---|---|
| `src/config/tarjeta.ts` | Fuente única. Datos de las dos marcas ya copiados y verificados |
| `src/config/paleta.ts` | Las tres paletas en 0..1 para el shader. Gemelo de `tokens.css` |
| `src/webgl/relieve.glsl.ts` | **El shader.** Líneas de nivel + seda + una luz. Ver `DISENO.md` §7-bis |
| `src/webgl/Relieve.tsx` | Monta OGL, interpola la paleta hacia la marca activa |
| `src/lib/inclinacion.ts` | Giroscopio con resorte amortiguado (`OMEGA = 2.6`) |
| `src/lib/monitorFps.ts` | Baja la escala de render; nunca apaga el fondo |
| `src/estado/useMarca.ts` | Estado + `?m=` + `popstate` + `theme-color` |
| `src/App.tsx` | Hub y ramas **provisionales**, para poder probar el fondo |
| `src/styles/tokens.css`, `base.css` | Tokens y base |

### Lo que Claude dejó pendiente al entregar (resuelto por Codex)

1. **Resuelto:** las imágenes no existían. `tarjeta.ts` apunta a `/carlos.webp`,
   `/carlos-vcard.jpg`, `/alsai-blanco.webp` y `/blindafon.webp`; las cuatro ya están procesadas y
   verificadas en `public/`. Los originales fueron:
   - `FOTO` → `public/carlos.webp` (640×640) y `public/carlos-vcard.jpg` (400×400, ≤40 KB)
   - `LOGO_AL` (el de **texto blanco**, el fondo es oscuro) → `public/alsai-blanco.webp` (512 de ancho)
   - `LOGO_BF` → `public/blindafon.webp` (256×256)
2. **Resuelto:** `App.tsx` era provisional. Tenía el hub y un esbozo de rama sin acciones. La fase 2 pedía
   separarlo en `Hub.tsx`, `Retrato.tsx` y `BotonMarca.tsx`; las fases 2 y 3 lo reemplazaron.
3. **Resuelto con el método autorizado por Carlos:** el relieve se verificó en Chrome del sistema
   mediante Puppeteer. El panel de navegador de esta máquina está
   oculto y ahí el bucle de `requestAnimationFrame` no corre, así que `readPixels` devuelve negro
   —es la limitación del panel, no un fallo del shader—. Compila, enlaza y no tira ningún error de
   consola. **Si Carlos reporta que se ve mal, el ajuste va en el shader, no en el resto.**
   Los tres números que se tocan primero:
   - `dens` (9.0) — cuántas líneas de nivel. Más = más denso.
   - El exponente del especular (7.0) — más bajo, brillo más ancho y más fácil de percibir.
   - `OMEGA` en `inclinacion.ts` (2.6) — más bajo, la luz llega más tarde y se ve recorrer más.
4. **Fuera de la continuación solicitada:** no hay `.env.example`, `vercel.json`, ni git iniciado.
   Carlos indicó que los pasos sueltos de la fase 0 eran procesar la foto y los dos logos.

### ✅ BUG RESUELTO — el fondo no se veía (2026-08-05)

Reporte original de Carlos: **el relieve no aparecía** en computadora ni en teléfono. La causa fue
la primera hipótesis: GLSL 1.00 se estaba compilando en el contexto equivocado y `fwidth()` requería
`GL_OES_standard_derivatives`. Se forzó WebGL 1, se habilitó la extensión y se corrigió el
apilamiento y la limpieza. Estas fueron las hipótesis documentadas:

1. **`fwidth()` en WebGL1.** El shader lo usa y en WebGL1 exige la extensión
   `GL_OES_standard_derivatives` más su `#extension ... : enable` al inicio del fragment. Si OGL
   cayó a WebGL1, el shader **no compila** y no se dibuja nada. Comprobar con
   `gl.getShaderInfoLog()` y, si es el caso, pedir WebGL2 explícito o habilitar la extensión.
2. **StrictMode monta dos veces en desarrollo.** `Relieve.tsx` limpia el `requestAnimationFrame`
   pero **no destruye el `Renderer`**. El segundo montaje reusa el mismo canvas y contexto. Añadir
   destrucción real en el cleanup.
3. **Apilamiento.** `.telon` está en `z-index: -1` y `body` tiene `background`. Verificar que el
   canvas `.relieve` no quede tapado ni detrás del fondo del body.

**Cómo verificarlo de verdad:** el panel de navegador de esta máquina está oculto y ahí no corre
`requestAnimationFrame`, así que `readPixels` siempre da negro y no sirve. Usar `puppeteer-core`
contra el Chrome del sistema (ver `AGENTS.md`, Trampas conocidas), o pedirle a Carlos que abra
`http://192.168.101.6:5190/` en el teléfono.

### Cómo lo pruebas ahora mismo

Servidor de desarrollo levantado con `--host`. Desde el teléfono, en la misma red:
`http://192.168.101.6:5190/` — y `?m=alsai` o `?m=blindafon` para ver el cambio de paleta.

---

## Rutas absolutas que se usan en todo el plan

| Alias | Ruta |
|---|---|
| `RAÍZ` | `C:\Users\CEAS0\Documents\Claude Code VSC\Agencia ALSAI\Landing y Sitio web -ALSAI\Tarjeta Digital PERSONAL` |
| `FOTO` | `C:\Users\CEAS0\Documents\Personal\Fotos profesionales\Carlos Alvarez 1.1.png` |
| `LOGO_BF` | `C:\Users\CEAS0\Documents\Claude Code VSC\Blindafon\assets\logo.png` |
| `LOGO_AL` | `RAÍZ\Logos ALSAI\Agencia ALSAI Logo Texto Blanco.png` (el de texto blanco: el fondo es oscuro) |

Los `.md` del proyecto (`CONTEXTO`, `DISENO`, `PLAN-ACTIVO`, `ESTADO`, `SISTEMA-DISENO`) viven en
`RAÍZ`, **no en el vault**. Decisión de Carlos del 2026-08-05: el proyecto es autocontenido.

---

## FASE 0 — Andamiaje

**Archivos que se crean**

- `RAÍZ\package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`
- `RAÍZ\index.html`
- `RAÍZ\.gitignore`, `RAÍZ\.env.example`, `RAÍZ\vercel.json`
- `RAÍZ\src\main.tsx`, `RAÍZ\src\App.tsx`
- `RAÍZ\public\carlos.webp`, `RAÍZ\public\carlos-vcard.jpg`, `RAÍZ\public\blindafon-logo.webp`

**Pasos**

1. Crear `RAÍZ` y ejecutar `git init` ahí. Es la raíz git del proyecto.
2. `npm create vite@latest . -- --template react-ts` dentro de `RAÍZ`. Aceptar sobrescribir.
3. Instalar dependencias exactas:
   `npm i gsap@^3.12 ogl@^1.0 @fontsource/space-grotesk @fontsource/inter`
4. Fijar el puerto de desarrollo en `vite.config.ts`: `server: { port: 5190, host: true }`.
   **5190, no 5183**: 5183 lo usan los dos proyectos de ALSAI y chocarían si se abren a la vez.
   `host: true` es obligatorio para poder probar desde el teléfono en la red local.
5. Procesar la foto con Chrome headless + canvas (mismo método que ya se usó en la tarjeta ALSAI):
   - `public\carlos.webp` — 640×640, recorte cuadrado centrado en la cara, calidad 82. Debe pesar
     ≤ 60 KB.
   - `public\carlos-vcard.jpg` — 400×400 JPEG calidad 80, para embeber en el `.vcf`. ≤ 40 KB.
6. Copiar `LOGO_BF` a `public\blindafon.webp`, redimensionado a 256×256 con fondo transparente.
7. `.gitignore` debe incluir `node_modules`, `dist`, `.env`, `.env.local`, `.vercel`.
8. `.env.example` con `VITE_GA4_ID=` y `VITE_AGENDA_URL=`. Sin valores reales.

**Criterio de aceptación**

```bash
npm run build
```
Termina sin errores y genera `dist/`. Además, `dir public` muestra `carlos.webp` por debajo de
61440 bytes y `carlos-vcard.jpg` por debajo de 40960 bytes.

---

## FASE 1 — Sistema de diseño y fuente única de datos

**Archivos que se crean**

- `RAÍZ\src\styles\tokens.css` — variables CSS de las tres identidades
- `RAÍZ\src\styles\base.css` — reset, tipografía, utilidades
- `RAÍZ\src\config\tarjeta.ts` — **fuente única** de contacto, enlaces y copy
- `RAÍZ\SISTEMA-DISENO.md` — ya escrito por Claude; solo verificar que exista

**Pasos**

1. Volcar a `tokens.css` la tabla de color de `SISTEMA-DISENO.md`, en tres bloques:
   `:root` (hub), `[data-marca="alsai"]`, `[data-marca="blindafon"]`. El cambio de marca es un
   atributo en `<html>`; **todo** el color sale de variables, ningún componente lleva hex.
2. Escribir `tarjeta.ts` con la estructura que define `AGENTS.md`, copiando los datos de la tabla
   de contacto de `DISENO.md` §4. **Copiar, no recordar.**
3. Importar `@fontsource/space-grotesk` (500, 700) e `@fontsource/inter` (400, 500, 600) en
   `main.tsx`. Solo esos pesos.
4. Aplicar la escala tipográfica y el espaciado de `SISTEMA-DISENO.md` en `base.css`.

**Criterio de aceptación**

`npm run build` pasa, y `npx tsc --noEmit` no reporta errores. Buscar `#` seguido de hex en
`src\components\` no devuelve resultados (todo el color va por variables).

---

## FASE 2 — Hub

**Archivos que se crean**

- `RAÍZ\src\components\Hub.tsx` + `Hub.css`
- `RAÍZ\src\components\Retrato.tsx`
- `RAÍZ\src\components\BotonMarca.tsx`
- `RAÍZ\src\estado\useMarca.ts` — estado + sincronización con `?m=` e `History API`

**Pasos**

1. `useMarca.ts`: estado `'hub' | 'alsai' | 'blindafon'`. Lee `?m=` al montar, escribe con
   `history.pushState`, escucha `popstate`. El botón "atrás" del teléfono debe volver al hub.
2. `Hub.tsx` con el contenido literal de `DISENO.md` §3.1. Nada de texto inventado.
3. `BotonMarca.tsx`: tarjeta táctil con nombre, una línea de descripción y flecha. Altura mínima
   88 px, área táctil completa.
4. `Retrato.tsx`: `carlos.webp` en máscara circular con anillo de luz. `fetchpriority="high"`.
5. El hub debe verse terminado **sin** WebGL: degradado radial CSS de fondo.

**Criterio de aceptación**

`npm run dev` y abrir `http://localhost:5190` a 390×844: se ve retrato, nombre, tesis y los dos
botones sin scroll horizontal. Tocar un botón cambia la URL a `?m=alsai`; "atrás" vuelve al hub.

---

## FASE 3 — Las dos ramas

**Archivos que se crean**

- `RAÍZ\src\components\Rama.tsx` + `Rama.css` — una sola plantilla, dos configuraciones
- `RAÍZ\src\components\AccionesContacto.tsx` — guardar contacto + WhatsApp
- `RAÍZ\src\components\HojaAgendar.tsx` — hoja inferior del botón de agendar
- `RAÍZ\src\lib\vcard.ts` — generación del `.vcf` con foto embebida
- `RAÍZ\src\lib\haptica.ts`

**Pasos**

1. `vcard.ts`: construye vCard 3.0 con `N`, `FN`, `ORG`, `TITLE`, `TEL;TYPE=CELL`, `EMAIL` (se
   **omite** la línea entera si el campo está vacío), `URL`, `ADR` sin calle, y
   `PHOTO;ENCODING=b;TYPE=JPEG` con `carlos-vcard.jpg` en base64. Descarga por `Blob` + `<a download>`.
   Las líneas de más de 75 octetos van plegadas según RFC 2426 o algunos Android rechazan el archivo.
2. `Rama.tsx` recibe la marca y saca **todo** de `tarjeta.ts`. Una sola plantilla: si ALSAI y
   Blindafón necesitan componentes distintos, es que el diseño se desvió.
3. `AccionesContacto.tsx`: dos botones grandes, fijos abajo dentro del área segura
   (`env(safe-area-inset-bottom)`). Nunca hay que hacer scroll para llegar a ellos.
4. `HojaAgendar.tsx`: si `config.agendaUrl` está vacío, abre hoja inferior con la explicación de
   una línea y el botón de WhatsApp con el mensaje precargado de `DISENO.md` §6. Si tiene valor,
   el botón abre esa URL directamente y la hoja no existe.
5. Enlaces de cada marca en una fila de iconos SVG en línea. **Sin librería de iconos.**

**Criterio de aceptación**

En `?m=alsai`, "Guardar contacto" descarga un `.vcf` que al abrirse en el teléfono muestra la foto,
el teléfono `+524423961718` y el correo. En `?m=blindafon`, el `.vcf` trae `+524428115588` y
**ninguna línea `EMAIL`**. Los dos botones de WhatsApp abren la conversación correcta con el texto
precargado.

> **Al terminar esta fase la tarjeta ya cumple todo lo que Carlos pidió como contenido.**
> Todo lo que sigue es la capa que la hace memorable. Se puede desplegar aquí sin vergüenza.

---

## FASE 4 — La bifurcación

**Archivos que se crean**

- `RAÍZ\src\components\Transicion.tsx`
- `RAÍZ\src\lib\paleta.ts` — interpolación de color entre identidades

**Pasos**

1. Al tocar una marca: `clip-path: circle()` que crece desde las coordenadas del botón tocado,
   900 ms, `cubic-bezier(0.16, 1, 0.3, 1)`.
2. En paralelo, GSAP interpola las variables CSS de `tokens.css` entre la paleta del hub y la de la
   marca. El fondo, los acentos y el glow de los botones cambian juntos, no por partes.
3. El retrato se encoge y viaja a una insignia en la esquina superior del encabezado de la rama
   (usar `FLIP` de GSAP o medir con `getBoundingClientRect`).
4. Actualizar `<meta name="theme-color">` con la paleta activa: la barra del navegador también
   cambia. Es el detalle que hace que se sienta una app, no una web.
5. `prefers-reduced-motion: reduce` → fundido de 150 ms y nada más.

**Criterio de aceptación**

Grabar el paso hub→ALSAI→hub→Blindafón a 60 fps con el script de QA de la fase 9. No hay parpadeo
blanco, no hay salto de layout, y el color del `theme-color` corresponde a la marca activa.

---

## FASE 5 — El relieve (el fondo)

**Es el efecto principal de la tarjeta.** La especificación completa está en `DISENO.md` §7-bis;
aquí solo van los pasos. No improvises el shader: sigue el §7-bis.

**Archivos que se crean**

- `RAÍZ\src\webgl\Relieve.tsx` — carga diferida
- `RAÍZ\src\webgl\relieve.frag.ts`, `RAÍZ\src\webgl\relieve.vert.ts`
- `RAÍZ\src\lib\inclinacion.ts` — giroscopio con amortiguado de resorte
- `RAÍZ\src\lib\monitorFps.ts`

**Pasos**

1. `Relieve.tsx` se importa con `React.lazy` y se monta después del primer pintado. Debajo queda
   siempre el degradado CSS de la fase 2, para que la primera pantalla nunca esté en blanco.
2. Shader según `DISENO.md` §7-bis: campo de altura por ruido → **líneas de nivel** con `fract()` y
   `fwidth()`, iluminadas por una sola fuente direccional con especular **ancho** (exponente bajo).
   Color por tramo: `acento-2` → `acento` → blanco según la intensidad del brillo.
3. Las tres paletas entran como uniformes y se interpolan junto con la bifurcación de la fase 4.
4. `inclinacion.ts`: `deviceorientation` (`beta`, `gamma`) → vector de luz.
   **Amortiguado de resorte de ~1.2 s**, no una interpolación corta: sin esa inercia el destello se
   pasa de largo al mover rápido y no se alcanza a percibir. Es una queja concreta ya observada.
   Permiso de iOS 13+ (`requestPermission`) en el **primer toque**, nunca al cargar.
   Sin giroscopio: `pointermove` en escritorio, órbita lenta automática en móvil. No se avisa nada.
5. `monitorFps.ts`: media móvil; por debajo de 40 fps durante 3 s baja la escala de render
   (1 → 0.75 → 0.5). **Nunca se apaga el fondo.**
6. Con `prefers-reduced-motion`, las ondas se congelan y la luz queda fija. El relieve se sigue
   viendo; solo deja de moverse.

**Criterio de aceptación**

`npm run build` deja el chunk del WebGL separado del bundle principal (verificable en la salida de
Vite). En un teléfono real, inclinarlo hace que la luz **recorra** la pantalla con retraso visible
—no que salte—, y el color pasa de azul/naranja a blanco en la cresta del brillo.

---

## FASE 6 — Tarjeta física en 3D

**Archivos que se crean**

- `RAÍZ\src\components\TarjetaFisica.tsx`

**Pasos**

1. `TarjetaFisica.tsx`: tarjeta con proporción de tarjeta de crédito (1.586:1) en CSS 3D con
   `transform: rotateX/rotateY` alimentado por `inclinacion.ts` (el mismo de la fase 5), borde
   metálico y reflejo que se desplaza. CSS 3D, **no** WebGL: no compite por el contexto GL.
2. Usa el mismo amortiguado que la luz del relieve, para que los dos movimientos se sientan uno.

*(La firma manuscrita animada se descartó el 2026-08-05: era un adorno sin razón de ser.
No la vuelvas a proponer.)*

**Criterio de aceptación**

Inclinar el teléfono mueve la tarjeta del hub con retraso suave y sin tirones. En escritorio
responde al ratón.

---

## FASE 7 — PWA, atribución y compartir

**Archivos que se crean**

- `RAÍZ\public\manifest.webmanifest`, iconos 192/512 y `apple-touch-icon.png`
- `RAÍZ\src\lib\origen.ts` — lectura de `?src=`
- `RAÍZ\src\components\Compartir.tsx` — Web Share API + QR

**Pasos**

1. Manifest en modo `standalone`, `theme_color` `#05070D`, iconos generados desde el retrato o el
   monograma con Chrome headless.
2. `origen.ts` lee `?src=nfc|qr|link` y lo guarda para la analítica, sin cambiar el contenido
   visible. Si falta, vale `directo`.
3. `Compartir.tsx`: `navigator.share` cuando existe; si no, copiar el enlace. El QR se dibuja en
   canvas con una implementación mínima propia — **no** meter una librería de QR de 40 KB.
4. Háptica en guardar contacto, WhatsApp, agendar y cambio de marca. Envolver en `try/catch`:
   iOS no la soporta y no debe romper nada.

**Criterio de aceptación**

Abrir `?src=nfc` y `?src=qr` conserva el origen correcto sin cambiar el saludo. Chrome no reporta
errores de instalación PWA. El QR generado y decodificado abre la tarjeta.

---

## FASE 8 — SEO, Open Graph y analítica

**Archivos que se crean**

- `RAÍZ\src\lib\analitica.ts`
- `RAÍZ\public\og-image.png` (1200×630), `robots.txt`, `sitemap.xml`
- `RAÍZ\public\aviso-privacidad.html`

**Pasos**

1. `index.html`: title, description, canonical, Open Graph, Twitter Card, `theme-color` y JSON-LD
   `Person` con `worksFor` de las dos organizaciones. **Sin `streetAddress`** — regla de `AGENCIA.md`.
2. `analitica.ts`: GA4 `G-N6QL5MFY5T` con `push(arguments)` — **no** con función flecha. Es la
   trampa de gtag.js ya documentada en los otros dos proyectos de ALSAI; con flecha, `arguments`
   no existe y no se envía nada.
3. Eventos de `DISENO.md` §10, todos con la marca activa y el origen como parámetros.
4. Copiar `aviso-privacidad.html` de la tarjeta de ALSAI y **adaptar** los datos al contexto
   personal. Leerlo entero antes de copiar; no pegarlo a ciegas.

**Criterio de aceptación**

En `npm run dev` con `VITE_ANALYTICS_DEBUG=true`, la consola registra `card_open` al cargar y
`brand_selected` al elegir marca. El HTML servido tiene las etiquetas OG completas.

---

## FASE 9 — QA y despliegue

**Archivos que se crean**

- `RAÍZ\scripts\qa-tarjeta.mjs`

**Pasos**

1. `qa-tarjeta.mjs` con `puppeteer-core` apuntando al Chrome del sistema.
   **El panel de navegador de esta máquina no sirve para capturas** — está documentado; ir directo
   a puppeteer. Para viewports menores de 500 px hay que emular con
   `Emulation.setDeviceMetricsOverride` por CDP: `--window-size` miente y recorta.
2. El script recorre 390×844, 430×932 y 1280×800; en cada uno captura hub, `?m=alsai` y
   `?m=blindafon`, y **falla** si detecta scroll horizontal, error de consola o contraste por
   debajo de AA en el texto principal.
3. Correrlo contra `npm run preview`, no contra `dev`.
4. `vercel link` (proyecto nuevo `carlos-alvarez-tarjeta`) y `vercel deploy --prod`.
5. **Carlos** crea en Namecheap el registro A `carlos` → `76.76.21.21`. Ningún agente toca DNS.
6. Escribir el resultado en `RAÍZ\ESTADO.md` y mover este plan a
   `RAÍZ\archivo\2026-08-05-tarjeta-personal-v1.md`.

**Criterio de aceptación**

```bash
node scripts/qa-tarjeta.mjs
```
Termina con código 0. `vercel deploy --prod` devuelve una URL que carga la tarjeta completa.

---

## Qué NO tocar

- `Agencia ALSAI\` y `Blindafon\` en su totalidad. De ahí solo se **copian** datos y el logo; no se
  edita ni un archivo. Tampoco `GPI\`.
- `C:\Users\CEAS0\Documents\Personal\` — documentos personales sensibles. La foto ya está copiada;
  no hace falta volver ahí.
- El apex y `www` de `agencia-alsai.com`, y el subdominio `conecta`. Son de otros dos proyectos.
- La propiedad de GA4: se **comparte** a propósito, no se crea una nueva.
- No commitear `.env`, ni el `VITE_GA4_ID` real, ni nada de `.vercel\`.

## Riesgos y plan de reversa

| Riesgo | Señal | Reversa |
|---|---|---|
| El WebGL tumba el rendimiento en gama baja | FPS < 30 sostenido | El monitor baja la escala de render a 0.75 y luego 0.5; nunca desmonta el relieve |
| iOS niega el permiso de giroscopio | El fondo no reacciona al inclinar | Cae a `pointermove`. Nunca se muestra un error al visitante |
| El `.vcf` con foto lo rechaza algún Android | El contacto no se guarda | `tarjeta.ts` lleva `vcardConFoto: boolean`. Ponerlo en `false` genera el `.vcf` sin foto |
| El DNS tarda en propagar | El subdominio no resuelve | La URL `.vercel.app` sigue viva. El chip NFC es reescribible: se graba la definitiva al final |
| Se corta la ejecución a mitad | Fase incompleta | Cada fase deja la tarjeta desplegable. Se retoma en la primera ⬜ de la tabla de arriba |

## Decisiones y pendiente externo

1. **Logo de ALSAI** — resuelto: se procesó y usa `public/alsai-blanco.webp`.
2. **Firma manuscrita** — descartada por Carlos; no forma parte del producto.
3. **Publicación** — el QA está aprobado. Falta iniciar sesión en Vercel para desplegar y después
   Carlos crea en Namecheap el registro A de `carlos.agencia-alsai.com`.
