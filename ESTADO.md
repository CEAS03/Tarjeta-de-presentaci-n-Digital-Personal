# ESTADO — Tarjeta digital PERSONAL de Carlos

Lo más reciente arriba. Escriben Claude y Codex; Carlos lee.

## 2026-08-06 — El fondo del texto, ceñido a cada renglón; teñido de botones más suave

### Cuatro intentos con el fondo del texto, y por qué falló cada uno

Vale la pena el registro completo: cada intento falló por algo distinto, y volver atrás sin saberlo
cuesta horas.

1. **Solo halo** (sombra por letra). Insuficiente: abraza el glifo, pero entre palabra y palabra la
   línea del relieve pasa entera y a pleno brillo.
2. **Franja por renglón, color plano y canto duro.** Medía 19:1 pero Carlos la rechazó: «parece
   efecto de Instagram súper básico». **El fallo no era la idea del renglón: era el canto duro**,
   que se lee a subtítulo de vídeo.
3. **Velo desenfocado sobre el bloque entero.** Resolvía el canto, pero dejó de ceñirse: «ya no se
   ve dónde termina cada texto, se ve un cuadrado negro feo». Un párrafo tiene líneas largas y
   cortas y todas quedaban dentro del mismo rectángulo.
4. **El vigente:** vuelve al renglón —lo que Carlos pide— con los cantos desvanecidos, que es lo
   que le faltaba al intento 2.

**Cómo se ciñe:** `box-decoration-break: clone` dibuja el fondo completo en cada fragmento de
línea, así que cada renglón recibe su propia mancha del ancho exacto de esa línea.
**Cómo se desvanece:** el fondo no es color plano sino un degradado radial que llega a opacidad
plena en el centro del renglón y a cero en sus cantos. Al 40 %, como pidió Carlos.

**Qué se perdió:** el intento 3 desenfocaba el fondo con `backdrop-filter`, y ese desenfoque era lo
que impedía que una línea compitiera como trazo con una letra. No se puede aplicar por fragmento de
forma fiable. Lo compensan el scrim y `--halo` — y se comprobó midiendo, no suponiendo:
`verificar-texto.mjs` sigue en verde sin el desenfoque.

**El bug del velo cortado no vuelve** aunque el elemento vuelva a ser `inline`: aquel venía de un
`::before` absoluto dentro de un inline, y ahora el fondo va en el propio elemento.

### Los botones

El teñido irradiaba demasiado. Baja el `saturate` de 5 a 2.4 (cian) y de 4.2 a 2.1 (naranja), con
un punto menos de `brightness`. **Se conserva el `hue-rotate`**: el tono ya estaba bien, lo que
sobraba era la intensidad.

- **Verificación:** `npm run build` 0 · `aceptacion.mjs` en verde · `verificar-texto.mjs` en verde ·
  capturas en `scripts/capturas/renglon/`.

## 2026-08-06 — El velo, completo y al 50 %; las líneas se tiñen dentro de los botones

### El velo se cortaba por la derecha, y era un fallo estructural

Carlos lo marcó en una captura: en ALSAI el lado derecho del párrafo no tenía velo y ahí el texto
volvía a competir con las líneas.

**Causa:** `.escrito` era un elemento **en línea**. El bloque contenedor de un `::before` absoluto
dentro de un inline **no es la unión de sus renglones**, sino el rectángulo que forman su primer y
su último fragmento. Con texto centrado y última línea corta, esa caja no llega al ancho del
párrafo. No se arreglaba ensanchando el `inset`. Ahora es `inline-block`, cuya caja sí es la unión
real. Si alguien lo devuelve a `inline`, el fallo vuelve.

### Calibración que pidió Carlos

Velo al **50 %** —su referencia fueron los botones: «tienen como 40 % y sí se alcanza a ver el
fondo y también permite leer bien el texto»— y `brightness` casi a 1, porque antes oscurecían los
dos y se sumaban: ahora el número que se lee en el código es el que se ve. El desvanecido de los
bordes casi se duplica, y el `inset` crece con él: **el fade tiene que caber entero dentro del
desbordamiento**, o el primer renglón se queda a media opacidad. Bordes de circuito de 1 a 2 px.

### Las líneas toman el color de la marca dentro de los botones

Sustituye a `invert(1)`, que tenía un **conflicto físico insalvable**: el fondo es casi negro y las
líneas casi blancas, así que al invertir el campo del botón queda claro; para que el texto blanco
se leyera había que oscurecerlo, y al hacerlo la inversión dejaba de percibirse. Se probaron
`brightness` y capas de negro — el conflicto es de raíz, no de calibración. **Carlos eligió el
teñido** entre las tres opciones que se le plantearon.

La cadena `grayscale → sepia → hue-rotate` mapea luminancia a tono, y funciona tan bien aquí
precisamente porque el campo es casi negro —teñirlo apenas lo mueve— mientras que las líneas, lo
único claro, se llevan todo el color. `sepia(1)` deja el tono en ~38°, así que el `hue-rotate` se
cuenta desde ahí: **+146° para el cian de ALSAI, −10° para el naranja de Blindafon**. Calibrados en
captura. El botón sigue oscuro y el texto sigue blanco: desaparece el conflicto.

- **Verificación:** `npm run build` 0 · `aceptacion.mjs` todo en verde · `verificar-texto.mjs` todo
  en verde · capturas en `scripts/capturas/velo2/`.

## 2026-08-06 — El velo: el diagnóstico que faltaba sobre el texto

### El problema no era de brillo, era de TIPO DE MARCA

Tres intentos hicieron falta, y los dos primeros fallaron por atacar lo que no era:

1. **Reforzar el halo** (sombra por letra). Insuficiente: la sombra abraza el glifo, pero entre
   palabra y palabra la línea del relieve pasa entera y a pleno brillo.
2. **Fondo negro por renglón** (`box-decoration-break: clone`). Medía 19:1, pero Carlos lo rechazó
   con razón: «parece efecto de Instagram súper básico, cero profesional». Cualquier forma con
   canto se lee a elemento de interfaz, y una franja por línea se lee a subtítulo de vídeo.
3. **El velo.** Las líneas del relieve son trazos finos, blancos y de canto duro; las letras
   también. Compiten porque son **la misma clase de marca**, no porque el fondo sea claro. Lo que
   lo resuelve es **desenfocar** el fondo detrás del texto: una línea desenfocada deja de ser una
   línea y pasa a ser un degradado. Sigue ahí, sigue moviéndose con el giroscopio, se sigue
   percibiendo —lo que Carlos pide— pero deja de competir como trazo. Es profundidad de campo.

El velo es un `::before` del bloque con `backdrop-filter: blur(22px) brightness(0.76)` y un 10 % de
negro, enmascarado con dos degradados cruzados que lo desvanecen a cero por los cuatro lados. **No
tiene canto en ninguna parte.** El oscurecimiento se bajó midiendo, no a ojo.

**Las paradas de la máscara van en `em`, no en porcentaje**, y eso importa: con porcentajes el
desvanecido escalaba con la altura del bloque y en un párrafo largo se comía el primer renglón, que
quedaba a media opacidad. Medido: 130/255 y 3.9:1 ahí, mientras el resto iba holgado.

### La sonda de contraste tenía un tercer sesgo

`verificar-texto.mjs` medía la **caja de línea** completa, que incluye el interlineado — una franja
de aire donde ningún glifo llega. Una línea del relieve pasando **entre** dos renglones se contaba
como si estuviera detrás de una letra: marcaba 4.0:1 con el velo funcionando perfectamente (4-8/255
a ocho píxeles arriba y abajo, medido, y confirmado en captura ampliada). Ahora recorta 18 % arriba
y 12 % abajo y mide la banda donde de verdad hay tinta.

Es el tercer sesgo que se le corrige a esta sonda; los otros dos fueron medir la unión de líneas en
vez de línea a línea, y no apagar los glifos de color de marca.

### Lo demás

- **El naranja de Blindafon.** Se leía a rojo ladrillo: al invertir, su fondo (`#0a0e18`) se vuelve
  una crema **cálida**, y esa calidez más el tinte naranja más la capa negra daba marrón.
  `saturate(0.15)` deja el campo invertido casi gris y el naranja vuelve a ser naranja.
- **El hueco del hub, tercera vuelta.** Ya no se reparte vacío: `.hub` centra la columna entera y
  el sobrante cae como márgenes arriba y abajo. Medido de **~330 px a 35-47 px** en cinco
  teléfonos, incluido el 412×915 de Carlos. Al crecer el contenido se pasó y recortó la última
  línea en 390×844 (−22 px) — **lo cazó la comprobación de recorte** que se añadió el día anterior,
  y se ajustó la escala.
- **Verificación:** `npm run build` 0 · `aceptacion.mjs` todo en verde · `verificar-texto.mjs` todo
  en verde · capturas en `scripts/capturas/velo/`.

## 2026-08-06 — Los siete cambios: inversión visible, circuito por giroscopio, botón de sitio

- **Dominio:** `https://carlos.agencia-alsai.com/` **vivo**. Carlos creó el registro A.
- **Qué se hizo, y el porqué de los dos que estaban mal:**

**1. El fondo del texto era demasiado brusco.** El culpable estaba localizado:
`brightness(0.42)` en el `backdrop-filter` de `.escrito`. Multiplicar por 0.42 aplasta las líneas
del relieve casi a negro, y el resultado se leía a mancha lisa. Sube a **0.72**, la opacidad baja
de 26 a **18 %**, el desenfoque sube a 10 px. Y los cantos se difuminan con un `box-shadow` ancho
del mismo negro: un `background` es color liso y su borde es duro por definición; la sombra
extiende la oscuridad hacia fuera perdiendo fuerza, así que ya no hay salto, hay caída.
**Contraste tras el cambio: 19.4:1**, medido con `verificar-texto.mjs`.

**2. La inversión de los botones no se veía, y ya se sabe por qué.** El `invert(1)` estaba puesto,
pero le seguía un `brightness(0.22)` añadido para que el texto blanco no se perdiera sobre el campo
invertido. Ese era el error: **`brightness` multiplica, así que comprime las diferencias**. Con
0.22 el campo caía a 53/255 y las líneas a 8 — 45 puntos de separación, invisibles. La corrección
es no filtrar el brillo sino **componer una capa oscura encima** del backdrop ya invertido: el alfa
compone en vez de multiplicar y conserva la estructura. Campo ~92, líneas ~13: el doble de
separación, y el texto conserva 6.7:1.

**3. El ritmo del circuito lo da ahora el giroscopio.** Iba a 4.2 s con una curva que acelera y
frena, y los dos botones desfasados media vuelta: cuando uno corría el otro estaba en su tramo
lento y parecía parado. Dos relojes independientes nunca se iban a ver coordinados. Ahora el ángulo
sale de **`--luz-angulo`**, que `luzCss.ts` publica desde el mismo bucle del relieve: el punto
encendido apunta hacia donde viene la luz del fondo. Desaparece la excepción a «solo transform y
opacity», porque ya no hay keyframes.

**4. El naranja de Blindafon.** Se leía a rojo ladrillo porque el tinte de marca iba al 22 % sobre
el campo invertido claro. Baja a 14 % y va sobre la capa oscura.

**5. El hueco entre la bio y la pregunta.** No se repartió el vacío: se llenó. El contenido era
demasiado corto para la pantalla y todo el sobrante caía en ese único corte. Retrato de 34 a 42vw,
nombre a 10.5svh, tesis y pregunta más grandes.

**6. El encuadre de la foto.** Zoom de 1.3 a 1.12 para que se vea el remate del pelo, y el origen
del 34 al 46 % para que la cabeza quede centrada en el círculo.

**7. Botón de sitio web en las dos ramas.** Con su línea de invitación, en cápsula, con la misma
ventana invertida y el mismo borde de circuito que los botones del hub. **El enlace al sitio SALE
de la fila de redes**: ahí era un icono de globo con el mismo peso que Instagram, y duplicarlo le
quitaba fuerza al botón. Consecuencia: a ALSAI le queda un solo icono en esa fila.

- **Dos regresiones propias, detectadas en captura y corregidas:** al envolver el texto en
  `.escrito`, el selector `.rama__rol span` empezó a alcanzar al envoltorio y pintaba de naranja la
  línea entera del rol; y el punto del dato de prueba desapareció porque dentro de un elemento en
  línea un `span` sin `display` ignora `width` y `height`.
- **PENDIENTE DE APROBACIÓN:** el copy de la invitación al sitio («¿Quieres conocer la agencia a
  fondo?» / «¿Quieres saber más del blindaje?») lo escribió Claude. Está en `tarjeta.ts`.
- **Verificación:** `npm run build` código 0 · `aceptacion.mjs` todo en verde ·
  `verificar-texto.mjs` todo en verde · capturas en `scripts/capturas/tanda-final/`.

## 2026-08-06 — Borde de circuito, colores reales de la foto, y el texto MEDIDO

- **Lo importante de esta entrada:** Carlos pidió que antes de entregar se
  **verificara** que el texto blanco ya no se confunde con las líneas blancas. Se hizo con una
  medición, no a ojo, y **la primera medición dijo que NO**. Ver abajo.

### `scripts/verificar-texto.mjs` — la herramienta que faltaba

Pone la luz en su pico —el peor caso—, hace el texto **transparente**, captura, y mide el píxel
más claro que queda justo donde vivían las letras, renglón por renglón. Devuelve la razón de
contraste WCAG contra el blanco del texto.

Dos falsos negativos que hubo que depurar antes de fiarse del número, y merecen quedar escritos:
1. `getBoundingClientRect()` de un elemento en línea devuelve **la unión de todas sus líneas**, e
   incluye el hueco entre renglones, donde no hay fondo a propósito. Se pasó a `Range
   .getClientRects()`, que da un rectángulo por línea — la superficie real del fondo.
2. El separador «·» del rol y el punto de la prueba llevan `color: var(--acento)` propio y **no
   heredaban** el `transparent` de la sonda: se estaba midiendo un glifo cian de 181/255 como si
   fuera una línea del relieve.

**Resultado final: 20:1 de contraste** en los tres estados, contra el 4.5:1 que exige AA. El
fondo por renglón funciona; antes de él, ese mismo punto estaba en 187/255, es decir casi blanco
contra texto blanco.

### El resto

- **Borde de circuito en los botones de marca**, idea de Carlos. Un `conic-gradient` de dos
  segmentos encendidos girando sobre un contorno de 1 px hecho con `mask-composite: exclude`. Como
  el gradiente es cónico y el borde rectangular, los segmentos **aceleran en las esquinas y se
  frenan en los lados**: el pulso no va a velocidad constante, y ese desigual es lo que lo hace
  leer a circuito. Los dos botones van desfasados 2.1 s para que no laten a la vez.
  **Excepción deliberada** a «solo transform y opacity»: anima un ángulo y repinta. Se acepta por
  ser dos elementos pequeños y porque el acabado manda sobre el rendimiento. Se detiene con
  `prefers-reduced-motion`.
- **Colores originales del retrato.** Se retiran la desaturación y, sobre todo, el tinte de
  `.retrato::after` en `mix-blend-mode: color`: esa capa sustituye tono y saturación del backdrop
  por los suyos, y siendo un azul casi negro arrastraba la foto entera al gris. Era la causa
  principal del «se ve un poquito blanco y negro».
- **Verificación:** `npm run build` código 0 · `aceptacion.mjs` todo en verde ·
  `verificar-texto.mjs` todo en verde · capturas en `scripts/capturas/circuito/`.

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
