# ESTADO — Tarjeta digital PERSONAL de Carlos

Lo más reciente arriba. Escriben Claude y Codex; Carlos lee.

## 2026-08-06 — El texto ya no se pierde, y un fallo que el «sin scroll» tapaba

- **Resultado:** hechas las seis peticiones de Carlos de esta tanda. Y apareció un fallo real que
  la prueba de aceptación **no podía ver**.

### EL FALLO: contenido recortado en pantallas cortas

Carlos: «hasta abajo, donde dice guardar mis datos y compartir, se ve apretado, apenas se ve en el
mero filo». **No estaba apretado: estaba FUERA de la pantalla.** Medido: **−27 px** en un iPhone SE
(375×667) y **−43 px** en un Android de 360×640. La última línea caía por debajo del borde y el
`overflow: hidden` del hub la recortaba en silencio.

**Por qué no saltó antes, que es lo importante:** `scripts/aceptacion.mjs` comprobaba
`scrollHeight > clientHeight`. Con `overflow: hidden` eso da **siempre cero**, aunque el contenido
se salga. La comprobación era ciega justo al fallo que introdujo el «sin scroll» — y por eso este
documento ha venido diciendo «0 px de desbordamiento» mientras en el teléfono de Carlos faltaba
contenido.

Corregido en dos frentes:
1. `scripts/aceptacion.mjs` mide ahora la **posición real del último elemento** contra el borde
   inferior, y prueba también en **375×667 y 360×640**, que antes no se probaban.
2. `Hub.css` gana un bloque `@media (max-height: 720px)` que recorta los suelos que en pantalla
   corta ya no se pueden permitir. Las filas de marca bajan de 88 a 68 px ahí — sigue muy por
   encima de los 44 px de área táctil, y es la única forma de que quepa todo **sin recortarle una
   palabra a Carlos**. No se permite scroll: él lo rechazó porque el fondo fijo se comporta raro.

Holgura bajo la última línea, después: **34 px** (390×844), **20 px** (375×667), **37 px**
(430×932), **20 px** (360×640).

### Las otras cinco

- **«Blindafon» sin acento**, en los 20 sitios donde aparecía: `tarjeta.ts`, `index.html` (título,
  Open Graph, Twitter y JSON-LD), aviso de privacidad y laboratorios.
- **El texto ya no se pierde.** Se encontró la causa concreta: `.rama__descripcion` **pisaba el
  halo global** con una sombra propia de dos capas difusas, mucho más débil. Era justo el párrafo
  que peor se leía. Ahora hereda `--halo`, que además se rehízo: doce desplazamientos a 1 y 2 px
  que forman un **contorno oscuro pegado a la letra** —lo que impide que una línea blanca del
  relieve cruce por encima de un trazo blanco— más seis capas de aura progresiva. Sigue la silueta
  de las letras: no dibuja ninguna caja ni ningún óvalo.
- **Aro negro** en el retrato, 3 px. El dorado se probó y Carlos lo descartó.
- **La viñeta del retrato, casi retirada.** Cambia el criterio: el fondo de estudio claro deja de
  tratarse como un problema a esconder y pasa a ser lo que hace lucir la foto sobre una página
  oscura. El filtro pasa de `brightness(0.9)` a `1`.
- **«+860 dispositivos blindados» centrado.** Le faltaba `justify-self: center`: es un ítem de
  grid y ahí el margen automático no bastaba.
- **Verificación:** `npm run build` código 0 · `aceptacion.mjs` **todo en verde** con las
  comprobaciones y los viewports nuevos · capturas en `scripts/capturas/aro-negro/`.

## 2026-08-06 — Activos definitivos, aro dorado, todo centrado y halo reforzado

- **Resultado:** entran la foto en alta y el logo 3D de Blindafón, y con ellos tres peticiones de
  Carlos que **revierten reglas que estaban escritas**. Sigue sin verlo en su teléfono.
- **Los activos:**
  - Carlos dejó los originales en `public/`. Se procesan con el script nuevo
    `scripts/procesar-activos.mjs` (canvas del Chrome del sistema vía puppeteer; **cero
    dependencias nuevas**, no hizo falta `sharp`):
    - `carlos.webp` — 789 kB → **46 kB**, a 768×768. No se amplía: el original es 775×780, así que
      pasar de ahí sería inventar píxeles.
    - `carlos-vcard.jpg` — 400×400, 18 kB.
    - `blindafon.webp` — 612 kB → **28 kB**, a 520×520, con la transparencia intacta.
  - Los originales se movieron a `archivo/originales/`. En `public/` se desplegarían: 1.4 MB
    servidos que nadie descarga.
- **Lo que trajo el logo nuevo:** es **solo símbolo**, sin wordmark. El anterior sí lo llevaba
  dentro de la imagen, así que al cambiarlo **el nombre «Blindafón» dejó de leerse en toda la
  pantalla**. Se añade `logoIncluyeNombre` a `tarjeta.ts` —ALSAI `true`, Blindafón `false`— y la
  rama escribe el nombre en tipografía cuando el archivo no lo trae. También se retiró el
  `brightness(1.45) saturate(1.15)`, que era un parche para rescatar el azul mate del logo viejo y
  sobre el 3D solo lo lavaba.
- **Las tres peticiones que revierten reglas escritas** — anotadas en el código con la cita de
  Carlos para que ningún agente las «corrija» de vuelta:
  1. **Aro en el retrato.** `DIRECCION-DE-ARTE.md` lo prohibía. Carlos: «al rededor, tenga como un
     círculo blanco o dorado, para que se vea más pro la foto». Puesto dorado, filo de 2 px sin
     glow. Cambiar a blanco es una línea: `--aro-retrato`.
  2. **Todo centrado**, hub y ramas. Revierte la alineación izquierda de `DIRECCION-DE-ARTE.md` §3
     y §9 y de los antipatrones de `SISTEMA-DISENO.md`.
  3. **Halo del texto reforzado.** El problema estaba localizado: había un salto de 3 px a 12 px
     entre capas por el que se colaba el brillo del relieve. Dos paradas nuevas (6 y 18 px) y más
     opacidad. **Se reforzó el halo y NO se volvió a atenuar el fondo**: una atenuación con forma
     es el óvalo que ya se eliminó.
  - Además, mucha menos penumbra alrededor de la cara y el brillo de 0.78 a 0.9.
- **Verificación real:** `npm run build` código 0 · `node scripts/aceptacion.mjs` **14/14 en
  verde** · capturas en `scripts/capturas/activos-nuevos/`.
- **Pendiente:** que Carlos lo abra en su teléfono, elegir aro dorado o blanco, las hojas
  inferiores, y borrar los laboratorios de `public/`.

## 2026-08-05 — Syne elegida, y el proyecto respaldado en GitHub

- **Resultado:** la tipografía del hub queda **cerrada en Syne**, elegida por Carlos entre las tres
  candidatas propuestas. El proyecto pasa a tener repositorio remoto.
- **Qué se hizo:**
  - **Syne aplicada.** `--display-hub: 'Syne'` con peso 700 en `tokens.css`, y en `main.tsx` se
    importan **tres pesos** (400, 600, 700). Antes solo se importaba uno y el navegador
    falsificaba la negrita de los nombres de marca de las filas; con una display de formas anchas
    eso se nota. Es un fallo que venía de antes y que se arregla ahora.
  - **Efecto secundario aceptado:** «Carlos Álvarez» pasa a **dos líneas** a 390×844. Cabe sin
    scroll y se lee deliberado, pero cambia la composición respecto a la maqueta original.
  - **`scripts/capturas/` añadido a `.gitignore`.** Son 51 MB de PNG a dpr 3, regenerables con
    `node scripts/mirar.mjs`. Meterlos en el historial lo infla para siempre. Mismo criterio que
    ya se aplicaba a `capturas-qa/`. También se dejó de rastrear `tsconfig.tsbuildinfo`.
  - **Remoto `origin`** apuntando a `CEAS03/Tarjeta-de-presentaci-n-Digital-Personal`.
- **Verificación real:**
  - `npm run build` → código 0.
  - `node scripts/aceptacion.mjs https://localhost:5193` → **14/14 en verde** con Syne aplicada.
  - Medido en los tres viewports con Syne: **0 px de desbordamiento** en 390×844, 375×667 y
    430×932, y el nombre no desborda en horizontal.
- **Pendiente:** la aprobación de Carlos en su teléfono, la variante del logo de Blindafón, y las
  hojas inferiores. Ver `PLAN-ACTIVO.md`.

## 2026-08-05 — REVISIÓN 2, tanda 2: botones, movimiento, tipografía y la transición rota

- **Resultado:** las **nueve tareas** de la REVISIÓN 2 están hechas y verificadas en headless.
  **Carlos todavía no lo ha visto en su teléfono. Sin eso no está aprobado.**
- **Qué se hizo:**
  - **Botones con presencia y sin cajas.** El recurso nuevo es el **filete vivo**: la línea de 1 px
    que ya separaba las filas pasa a ser un `::after` que la luz del giroscopio recorre. La
    presencia sale de que la línea esté viva, no de un rectángulo debajo del texto — que es
    exactamente lo que Carlos rechazó y no se reabre. Agendar más alto y con los dos filetes en el
    acento de la marca; redes de 1.25 a 1.5 rem y del 62 al 82 % de blanco; dock con filete vivo y
    entrada propia.
  - **La luz atraviesa la pieza entera.** `src/lib/luzCss.ts` publica la dirección de la luz en
    variables CSS. Se alimenta del valor que el bucle del relieve **ya calculó**, no de un bucle
    propio: `leer()` integra el resorte, y llamarlo dos veces por frame habría alterado la
    dinámica que Carlos cerró en su teléfono. El retrato lleva un brillo que cruza su superficie,
    **no un aro**.
  - **Tres candidatas tipográficas nuevas** —Newsreader, Bricolage Grotesque y Syne— en
    `lab-tipografia.html`. Fraunces desinstalada. **La fuente no se ha cambiado**: sigue Instrument
    Serif hasta que Carlos elija.
  - **`Transicion.tsx` reescrito**, y ahí apareció lo importante de esta tanda.
- **DOS FALLOS REALES, encontrados al revisar la transición:**
  1. **La transición de entrada no ocurría.** El retrato viajaba hasta convertirse en la insignia
     circular de esquina, y el destino de ese viaje era `.rama__retrato`, un elemento que
     `Rama.tsx` ya no renderiza. Al ir de hub a rama, la transición lo buscaba 750 ms, se rendía y
     **salía sin ejecutarse**: ni revelación circular ni interpolación de paleta, y un salto seco
     tras tres cuartos de segundo congelado. De rama a hub sí funcionaba, y por eso llevaba tiempo
     pasando desapercibido. Es decir: el momento que Carlos quería que la gente recordara no
     existía en el sentido en que la gente entra.
  2. **Al arreglar el primero salió el segundo, que estaba tapado:** las dos pantallas se veían
     superpuestas como una doble exposición, porque la copia congelada es opaca y la aplicación
     nueva es transparente. Resuelto recortando la copia con el negativo del círculo, y no
     pintándole un fondo sólido a la pantalla nueva, que habría tapado el relieve durante los
     900 ms de la bifurcación.
- **Verificación real:**
  - `npm run build` → código 0.
  - `node scripts/aceptacion.mjs https://localhost:5193` → **14/14 en verde**.
  - Transición instrumentada: **80 fotogramas** de `clip-path` circular creciendo de 0 a 668 px en
    ~900 ms, el primero a 54 ms del toque. Fotogramas en `scripts/capturas/transicion/`.
  - `--luz-x` medida en las dos posiciones extremas del puntero: −0.792 y +0.792.
  - Capturas en `scripts/capturas/tanda2/` y `scripts/capturas/tipografia/`.
- **Pendiente:** la aprobación de Carlos, tres decisiones suyas (logo, tipografía, aire del hub) y
  las hojas inferiores `HojaAgendar.tsx` / `Compartir.tsx`, que siguen con la estética antigua y
  no entraban en las nueve tareas. Todo detallado en `PLAN-ACTIVO.md`.
- **Plan archivado en:** todavía no; `PLAN-ACTIVO.md` sigue abierto.

## 2026-08-05 (madrugada) — REVISIÓN 2, tanda 1: hub sin scroll, retrato circular, fuera el óvalo

- **Resultado:** parcial y verificado en headless. Hechas las tareas **1 a 5** de la REVISIÓN 2.
  Pendientes la 6 a la 9 (botones, movimiento, tipografía y `Transicion.tsx`).
  **Carlos todavía no lo ha visto en su teléfono. Sin eso no está aprobado.**
- **Qué se hizo:**
  - **Hub sin scroll.** `.hub` a `height: 100svh; overflow: hidden` y todas las escalas y espacios
    a `clamp` contra `svh`. Se midió antes y después: el hub sobraba 59 px a 390×844 y **165 px a
    375×667**; las ramas también desbordaban a 375×667, cosa que ningún documento registraba.
    Ahora **0 px en los tres viewports**. No se recortó ni se resumió nada del texto de Carlos.
  - **Retrato circular mediano**, 133 px a 390×844, sin aro ni marco. Se conserva el tratamiento
    de brillo y tinte, reequilibrado: el hundido del perímetro pasa a integrar la foto y el filtro
    deja de castigar la cara (0.52 → 0.78 de brillo).
  - **Los óvalos eran TRES, no dos.** Además de la viñeta y la calma del shader había un
    `::before` con `border-radius: 42%` en `.rama__contenido` —una elipse casi opaca del color de
    fondo, pintada sobre el relieve para dar legibilidad— que no estaba documentado en ninguna
    parte y era el más visible de los tres. Eliminados los tres. La legibilidad la sostiene solo
    `--halo`, y aguanta.
  - **Logo de Blindafón a color.** El activo nuevo de Carlos ya estaba en `public/`. A color tal
    cual el azul marino se pierde, así que va realzado (opción B) y quedan cuatro variantes
    capturadas para que elija.
  - **Ramas redistribuidas.** El hueco entre las redes y el dock baja de ~190 px a 20–55 px.
- **Verificación real:**
  - `npm run build` → código 0.
  - `node scripts/aceptacion.mjs https://localhost:5193` → **14/14 en verde**.
  - Capturas en `scripts/capturas/estado-actual/` (antes), `scripts/capturas/tanda1/` (después) y
    `scripts/capturas/logo-blindafon/` (las cuatro variantes del logo).
- **Correcciones de documentación hechas sobre la marcha:**
  - `AGENTS.md` no listaba `npm run dev:https`, `aceptacion.mjs` ni `mirar.mjs`, y presentaba el
    `qa-tarjeta.mjs` del primer intento como el QA vigente.
  - `PLAN-ACTIVO.md` decía que el logo de Blindafón «no es resoluble desde CSS» y que faltaba un
    activo. Ya estaba entregado.
  - `DIRECCION-DE-ARTE.md`: §2 seguía dando `CALMA 0.85` por vigente; §3 decía «sin scroll para lo
    esencial»; §4 entero describía un retrato a sangre ya sustituido; §9 decía que el logo va a la
    izquierda y con alto máximo de 34 px, y ninguna de las dos cosas es cierta.
- **Pendiente:** tanda 2 (tareas 6 a 9) y las dos preguntas para Carlos, en `PLAN-ACTIVO.md`.
- **Plan archivado en:** todavía no; `PLAN-ACTIVO.md` sigue abierto.

## 2026-08-05 (noche) — Capa visual rehecha desde cero

- **Resultado:** el fondo está cerrado y aprobado por Carlos en su teléfono. La capa visual del
  hub y de las dos ramas está reconstruida y pasa las 14 comprobaciones de aceptación. Falta que
  Carlos la vea en su teléfono, elija tipografía y se retomen los pendientes de la lista de abajo.
- **Qué se hizo:**
  - **`git init` y commit de respaldo `42421ba`** antes de tocar nada. Punto de retorno intacto.
  - **`DIRECCION-DE-ARTE.md`**, el documento que faltaba. Su ausencia es la causa del primer
    intento fallido: `DISENO.md` definía concepto y comportamiento, pero nadie había decidido
    **cómo se ve** la página. Ahora hay composición, escala real, tratamiento del retrato, ritmo,
    movimiento y criterio de aceptación.
  - **El fondo.** Se descubrió que el problema no eran los parámetros sino la geometría: el shader
    rechazado dibujaba isolíneas de un ruido fbm 2D (manchas irregulares, «rayas densas y duras
    sin sentido»), no líneas apiladas. Se reescribió con la geometría correcta y se portó a OGL.
  - **Dos decisiones nuevas de Carlos**, ambas contra lo que decían los documentos:
    **topográfica pura**, sin la seda que cruzaba líneas de lado a lado; y **giroscopio rápido**
    (OMEGA 14, 12°, con autocalibrado), revirtiendo la «inercia larga» que se sentía como retraso.
  - **La calma y el halo.** El fondo en su pico atravesaba el texto: era la causa real de «al
    interactuar el fondo empeora». Se resuelve sin caja ni panel de vidrio.
  - **Fuera todas las cajas**: la tarjeta 3D con aro blanco del retrato, el avatar circular de
    esquina de las ramas, la tarjeta crema del logo de Blindafón, la píldora del dato de prueba,
    las burbujas de redes y los tres botones-caja del dock.
  - El hub estrena display propia (Instrument Serif); las ramas conservan Space Grotesk.
  - `npm run dev:https` (puerto 5193) para poder probar el giroscopio desde iPhone, que exige
    contexto seguro.
- **Verificación real:**
  - `npm run build` → código 0.
  - `node scripts/aceptacion.mjs https://192.168.101.6:5193` → **14/14 en verde**: sin
    desbordamiento horizontal ni errores de consola en hub, ALSAI y Blindafón a 390×844 y 430×932;
    con `prefers-reduced-motion` dos capturas separadas 2 s son idénticas y el relieve sigue visible.
  - Capturas reales con `scripts/mirar.mjs` en `scripts/capturas/antes/` y `scripts/capturas/despues/`.
  - **Carlos probó el fondo y el giroscopio en su teléfono y los aprobó.** El resto de la capa
    visual todavía no lo ha visto en el suyo.
- **Pendiente:** ver la lista de traspaso en `PLAN-ACTIVO.md`.
- **Plan archivado en:** todavía no.

## 2026-08-05 (noche) — CORRECCIÓN: el acabado visual NO está aprobado

La entrada de abajo dice que la revisión visual «aprobó la tarjeta para entrega». **Es falsa** y se
deja tachada, no borrada, para que se entienda de dónde viene el error: esa revisión fue headless y
automática, y Carlos nunca vio la tarjeta. Cuando la vio, la rechazó.

Rechazo de Carlos, en sus palabras: el retrato queda «en un recuadro raro», el fondo son «rayas
densas y feas y duras sin sentido», los botones se ven genéricos y **el fondo empeora al
interactuar**. Se conserva la plomería (datos, vCard, analítica, estado de marca) y **se rehace
toda la capa visual**. La fuente de verdad del fondo es `REFERENCIA-FONDO.html`.

Lección para todo agente de este proyecto: un QA headless que mide contraste, CLS y errores de
consola **no es una aprobación de diseño**. No vuelva a escribirse «aprobado» sin que Carlos lo
haya visto en su teléfono.

## ~~2026-08-05 — Tarjeta terminada y QA aprobado~~; publicación bloqueada por acceso a Vercel

- **Resultado:** implementación completa de las fases 0 a 8 y QA técnico/visual de la fase 9
  aprobado. Falta únicamente autenticar Vercel, desplegar y después cambiar el DNS.
- **Qué se hizo:**
  - Se corrigió el fondo que no aparecía: WebGL 1 explícito, extensión de derivadas para
    `fwidth()`, programa enlazado, limpieza segura y apilamiento correcto. El relieve topográfico
    queda visible y responde al giroscopio o al puntero con inercia.
  - Se procesaron retrato y logos. El hub definitivo usa la tarjeta física 3D, el nombre de Carlos,
    la descripción aprobada y la bifurcación hacia Agencia ALSAI y Blindafón.
  - Las dos ramas muestran su información esencial y acciones grandes de guardar contacto,
    WhatsApp, agendar y compartir. El agendado continúa por WhatsApp mientras no exista endpoint.
  - Se implementaron transición cromática, vCards con foto, háptica, atribución silenciosa de
    origen, PWA instalable, Web Share, copia compatible y QR propio.
  - Se añadieron GA4 `G-N6QL5MFY5T`, siete eventos con marca/origen, SEO, Open Graph, JSON-LD,
    `robots.txt`, `sitemap.xml`, aviso de privacidad e imagen social 1200×630.
  - Impeccable guió el pulido final. La revisión visual independiente no encontró bloqueadores ni
    problemas importantes y aprobó la tarjeta para entrega.
- **Verificación real:**
  - `npm run build` → código 0. Bundle principal 256.12 kB (90.25 kB gzip), WebGL separado
    52.35 kB (16.05 kB gzip) y CSS 41.67 kB (7.30 kB gzip).
  - `node scripts/qa-tarjeta.mjs` contra `npm run preview` → código 0. Nueve capturas: hub, ALSAI y
    Blindafón en 390×844, 430×932 y 1280×800; sin desbordamiento horizontal, contraste AA,
    errores de consola ni programas WebGL sin enlazar. CLS de la transición: 0.000.
  - Chrome reportó cero errores de instalación PWA. El QR más largo se decodificó con la URL
    exacta de Blindafón y la copia alternativa terminó en «Enlace copiado».
  - vCards verificadas desde descargas reales: hub con ambos teléfonos, ALSAI con correo,
    Blindafón sin `EMAIL`, las tres con foto y líneas de máximo 75 bytes.
  - Con `prefers-reduced-motion`, no se registran oyentes de giroscopio/puntero, la tarjeta 3D queda
    fija y dos capturas separadas resultan idénticas.
- **Bloqueo externo:** `vercel whoami` devolvió «No existing credentials found». Carlos debe
  ejecutar `vercel login` y completar el acceso en el navegador. Después Codex puede crear/enlazar
  `carlos-alvarez-tarjeta`, desplegar y cerrar la fase 9.
- **DNS posterior al despliegue:** `carlos.agencia-alsai.com` todavía resuelve a
  `198.54.117.242`; Carlos cambia en Namecheap el registro A `carlos` a `76.76.21.21`.
- **Plan archivado en:** todavía no; `PLAN-ACTIVO.md` permanece abierto porque falta el despliegue.

## 2026-08-05 (tarde) — Andamiaje y el fondo, funcionando

- **Resultado:** parcial — fases 0, 1, 2 y 5 hechas o casi; de la 3 en adelante toca a Codex
- **Qué se hizo:**
  - **El fondo pasó por siete direcciones antes de cerrar.** Se descartaron: partículas (cliché),
    tinta/fluido, bandas de vidrio, y cromo líquido (a Carlos le molestaba la mancha de contorno
    móvil y la esfera no significaba nada). Quedó: **líneas de nivel topográficas con el ondulado
    de la seda y una sola luz que mueve el giroscopio.** Ver `DISENO.md` §7-bis.
  - Dos decisiones de Carlos que cambian reglas anteriores: **el acabado manda sobre el
    rendimiento** (todas las visitas serán desde buen teléfono), y **los `.md` del proyecto viven
    con el código**, no en el vault. Se eliminó `_Notas\Personal\` y se movió todo aquí.
  - Se descartó la firma manuscrita animada: adorno sin razón de ser.
  - Creado el proyecto: Vite 6 + React 18 + TS + OGL. Shader del relieve, giroscopio con resorte
    amortiguado, monitor de FPS que baja resolución en vez de apagar el fondo, estado de marca con
    `?m=` e historial, `tarjeta.ts` con los datos de las dos marcas copiados de sus fuentes.
- **Verificación:**
  - `npm run build` → `✓ built in 663ms`. `index-*.js` 148.66 kB (48.27 gz),
    `Relieve-*.js` 52.94 kB (16.28 gz), CSS 12.95 kB (2.62 gz). El chunk del WebGL queda separado,
    que es el criterio de aceptación de la fase 5.
  - `npm run dev -- --host` levanta en `http://192.168.101.6:5190/`. Cero errores de consola.
    Canvas dimensionado correcto (780×1688 a 390×844 con dpr 2) y contexto WebGL creado.
  - **NO verificado: cómo se ve el relieve en un teléfono real.** El panel de navegador de esta
    máquina está oculto y ahí no corre `requestAnimationFrame`, así que `readPixels` devuelve
    negro. Es la limitación conocida del panel, no un fallo del shader — pero no es prueba de que
    se vea bien. Falta que Carlos lo abra.
- **Pendiente:**
  - Procesar la foto y los dos logos a `public/`. Sin eso la fase 3 no arranca.
  - Fases 3, 4, 6, 7, 8 y 9. Ver "DÓNDE QUEDÓ CLAUDE" en `PLAN-ACTIVO.md`.
  - Confirmar con Carlos el rol "Fundador" en Blindafón.
  - Registro A `carlos` → `76.76.21.21` en Namecheap, al final del todo.
- **Plan archivado en:** todavía no; `PLAN-ACTIVO.md` sigue abierto.

## 2026-08-05 (mañana) — Diseño cerrado y archivos de contexto creados

- **Resultado:** parcial — falta ejecutar el plan
- **Qué se hizo:**
  - Se aterrizó la idea con Carlos. Cambio clave frente al primer boceto: la tarjeta **no** es un
    scroll con dos secciones, sino un **hub con dos ramas** donde el visitante elige qué marca ver.
    Cada rama tiene su propio WhatsApp y su propia vCard.
  - Se creó la entidad `Personal\` en el vault, fuera de ALSAI y de Blindafón, para no romper el
    aislamiento entre contextos.
  - Escritos `EMPRESA.md`, `CONTEXTO.md`, `DISENO.md`, `PLAN-ACTIVO.md` y este archivo.
  - Datos de contacto de las dos marcas copiados de sus fuentes reales y verificados.
    Nada inventado.
- **Verificación:** ninguna todavía; no hay código. El plan define el criterio de aceptación de
  cada una de sus diez fases.
- **Pendiente:**
  - Que Carlos dé el visto bueno para empezar a ejecutar.
  - Tres datos que faltan: logo de ALSAI (¿wordmark?), foto de la firma manuscrita, y el registro A
    de `carlos` en Namecheap.
- **Plan archivado en:** todavía no; `PLAN-ACTIVO.md` sigue abierto.
