# DIRECCIÓN DE ARTE — Tarjeta digital de Carlos Álvarez

**Escrito por Claude Code · 2026-08-05 (noche) · valores cerrados con Carlos en su teléfono**

---

## REVISIÓN 2 — 2026-08-05, tras ver la tarjeta implementada

Carlos revisó la capa visual construida y pidió los cambios de abajo. **Mandan sobre el resto de
este documento.** Donde haya conflicto, gana esta sección.

### Hub

| Antes | Ahora |
|---|---|
| Retrato a sangre, 46 svh, fundido radial | **Retrato CIRCULAR y mediano.** «No me gusta que yo sea todo el protagonista de la página» |
| Página con scroll | **SIN SCROLL. Ni hacia abajo ni hacia arriba.** Todo cabe en una pantalla |
| Instrument Serif | **Rechazada.** Falta elegir otra |

**Ojo con el círculo:** lo que Carlos rechazó del primer intento no fue la forma redonda, fue el
**aro blanco brillante** y la tarjeta 3D que lo contenía. Un círculo limpio, sin anillo luminoso
ni marco, sí es lo que pide. No se reintroduce el aro.

**Por qué sin scroll:** «el fondo se mueve y se ve raro». El relieve es `position: fixed` y el
contenido se desplaza por encima, lo que rompe la ilusión de superficie única. Sin scroll el
problema desaparece de raíz.

**Consecuencia que hay que resolver:** a 390×844, con retrato circular + nombre + ciudad + tesis +
pregunta + dos filas + acciones, el contenido no entra holgado. Hay que **reducir escalas y
espacios**, no recortar contenido por cuenta propia. Si aun así no cabe, se le pregunta a Carlos
qué prefiere acortar. **Nunca inventar ni resumir su descripción sin permiso.**

### Ramas — ALSAI y Blindafón

- **Fuera el óvalo.** «Le pusiste como un óvalo en toda la pantalla, ese óvalo se ve súper feo».
  Es la **viñeta radial del shader** (`vig`, en `relieve.glsl.ts`) sumada a la **calma**
  (`smoothstep(0.40, 0.72, v)`), que juntas dibujan una mancha ovalada oscura sobre el relieve.
  Se elimina o se sustituye por una atenuación que no tenga forma reconocible.
- **La legibilidad la resuelve SOLO el texto.** «Si quiero que el texto tenga un poco de sombra o
  de aura, el chiste es que el texto se vea mucho más que el fondo». Es decir: `--halo` sí,
  atenuaciones del fondo con forma, no. Ya se comprobó que el halo aguanta solo.
- **Sin espacios vacíos.** Redistribuir todo: hoy hay un hueco grande entre «Agendar» y las redes.
- **El logo, centrado**, y el texto de debajo más separado.
- **Botón de agendar más llamativo.**
- **Redes sociales más grandes, más visibles y más profesionales.**
- **Dock inferior (guardar, WhatsApp, compartir) más profesional, con animación.**
- **Logo de Blindafón: activo nuevo**, entregado por Carlos el 2026-08-05. Sustituye a
  `public/blindafon.webp`. Es un cohete-teléfono azul marino con llama naranja. Al llevar naranja
  luminoso ya no hace falta forzarlo a blanco: **quitar el `filter: brightness(0) invert(1)`** y
  comprobar cómo se ve a color sobre el fondo oscuro.

### Movimiento

«Todo quiero que tenga efectos y animaciones y transiciones.»

**Con criterio, no por acumulación.** El propio Carlos fijó antes esta regla y sigue vigente:
*«prefiero una tarjeta sobria que se vea cara a una llena de efectos a medio hacer»*. Se aplica así:

- Toda acción tocable responde: `:active`, y transición de entrada y de salida.
- Cada animación tiene una causa. Nada se mueve solo por moverse.
- Se mantienen los tiempos del sistema: micro 240 ms, medio 420 ms, marca 900 ms, easing
  `cubic-bezier(0.16, 1, 0.3, 1)`. Solo `transform` y `opacity`.
- **Un elemento animado a medias es peor que uno quieto.** Si no da tiempo a rematarlo, se deja
  estático.

### Lo que sigue prohibido

Nada de esta revisión reabre las cajas. Los botones se hacen «más llamativos y profesionales»
**sin** volver a ser rectángulos de color con esquinas de 8 px: eso fue exactamente lo que Carlos
rechazó del primer intento. La presencia se consigue con luz, borde translúcido, contraste
tipográfico y movimiento — no con un fondo sólido.

`DISENO.md` decide **qué** se construye y por qué. Este documento decide **cómo se ve**:
composición, escala real, tratamiento del retrato, ritmo y movimiento. Faltaba, y esa falta es la
causa del primer intento fallido: sin él, cada componente se improvisó por separado.

Los tokens de color y espaciado siguen viviendo en `SISTEMA-DISENO.md` y `src/styles/tokens.css`.
Aquí no se repiten hex: se dice **dónde va cada cosa y a qué tamaño**.

---

## 1. La idea rectora

**Una superficie con luz, y encima el mínimo texto posible.**

La tarjeta no es una página con un fondo bonito: es una **superficie** —una tela con relieve— sobre
la que se ha posado texto. De ahí se derivan todas las decisiones:

- El fondo nunca se recorta ni se encierra. Llega a los cuatro bordes, siempre.
- Nada flota dentro de una caja. **Ni una tarjeta, ni un panel de vidrio, ni un marco.** Fue el
  error del primer intento: el retrato en un recuadro y los botones como cajas de formulario.
- La separación entre texto y fondo se consigue con **luz y sombra**, no con contenedores.
- Si un elemento necesita una caja para leerse, está mal resuelto.

El hub es **Carlos**, no una de sus dos empresas. Debe sentirse más humano y más editorial que
las ramas; las ramas se sienten corporativas y frías/cálidas según su marca.

---

## 2. El fondo — CERRADO

Valores aprobados por Carlos el 2026-08-05 probando en su teléfono. **No se tocan sin él.**

| Parámetro | Valor | Qué hace |
|---|---|---|
| `DENS` | **33** | número de líneas apiladas |
| `GROSOR` | **0.45** px CSS | grosor base. Más fino = más caro |
| `NITIDEZ` | **0.70** | dureza del borde de la línea |
| `POT` | **4.5** | dureza del brillo. Bajo = brillo ANCHO que barre |
| `RELIEVE` | **0.04** | amplitud del ondulado |
| `VEL` | **0.80** | velocidad de la deriva propia de las ondas |
| `PISO` | **0.01** | intensidad de la línea donde no hay brillo |
| `OMEGA` | **14** | rigidez del resorte. Asentamiento ≈ 4.6/ω ≈ 0.33 s |
| `GRADOS` | **12°** | inclinación para el recorrido completo de la luz |
| ~~`CALMA`~~ | **ELIMINADA** | ver abajo |
| `VELO` | **0** | descartado: la sombra por letra ya basta |

**`CALMA` y la viñeta se eliminaron el 2026-08-05** por la REVISIÓN 2. Valían 0.85 y
`smoothstep(1.05, 0.30, …)`, y juntas dibujaban el óvalo que Carlos rechazó. El resto de la tabla
sigue intacto y sigue sin tocarse. La legibilidad la resuelve solo `--halo`.

**Había un tercer óvalo, y no estaba documentado:** un `::before` en `.rama__contenido`
(`border-radius: 42%` + degradado radial de `--fondo` al 98 %, desenfocado) que pintaba una elipse
casi opaca sobre el relieve para que el texto se leyera. Era el más visible de los tres y el que
más claramente rompía la regla dura. También eliminado.

**Geometría.** Líneas horizontales apiladas, desplazadas por un campo de altura de dos senos
cruzados. **No** isolíneas de ruido fbm: eso da manchas irregulares y es exactamente lo que se
rechazó por «rayas densas y duras sin sentido».

**Luz.** Una sola, direccional. Cada tramo se ilumina según la **normal 2D de su curva** contra la
luz — especular anisotrópico. Recorrido de color `acento-2 → acento → blanco` en el pico.

**Movimiento.** Dos sistemas independientes: las ondas derivan solas y sin fin; la luz la mueve el
giroscopio. El fondo **no reacciona al scroll**. Nunca.

**Sin giroscopio** (Android sin sensor, permiso denegado, escritorio): órbita lenta automática, y
en escritorio manda el puntero. **Nunca se avisa de que faltó el permiso.**

---

## 3. La composición del hub

**SIN SCROLL EN ABSOLUTO** (REVISIÓN 2), no «sin scroll para lo esencial»: `.hub` va a
`height: 100svh; overflow: hidden`. El croquis de abajo describe el retrato a sangre y **está
obsoleto** — ver §4. Lo que sigue vigente es el orden de los bloques y la alineación izquierda.

De arriba abajo:

```
┌─────────────────────────────┐
│                             │
│      RETRATO a sangre       │  0 → 52 % de la altura
│   fundido al fondo abajo    │  sin marco, sin círculo, sin caja
│                             │
│ ·········fundido··········· │  52 → 64 %: la foto muere aquí
│                             │
│  Carlos Álvarez             │  el nombre arranca donde muere la foto
│  QUERÉTARO, MÉXICO          │
│                             │
│  Soy un emprendedor que…    │  la tesis, 3 líneas
│                             │
│  ─────────────────────────  │  filete de 1 px, 24 % de opacidad
│  ¿Qué parte de mi trabajo   │
│  quieres conocer?           │
│                             │
│  Agencia ALSAI          →   │  fila, no caja: filete arriba y abajo
│  Blindafón              →   │
│                             │
│  Guardar mis datos · Compartir │
└─────────────────────────────┘
```

**Todo alineado a la izquierda.** Ni un párrafo centrado — `SISTEMA-DISENO.md` ya lo prohibía en
sus antipatrones y el primer intento lo incumplió. El único centrado admisible sería un elemento
suelto de una sola línea, y no hay ninguno.

Margen lateral: `1.25rem`. El bloque de texto no pasa de `22rem` de ancho.

---

## 4. El retrato — círculo limpio, sin aro

**REESCRITO el 2026-08-05 por la REVISIÓN 2.** Lo que decía esta sección —foto a sangre, sin
círculo— quedó obsoleto: Carlos pidió expresamente un círculo mediano porque a sangre él era «todo
el protagonista de la página». Se conserva abajo lo que sigue vigente.

**Regla dura, la que NO cambia: ni aro ni marco.** Lo que Carlos rechazó del primer intento no fue
la forma redonda, fue el **aro blanco brillante** y la tarjeta 3D que lo contenía. Círculo sí;
`border`, `outline`, `box-shadow` de contorno o marco, jamás.

Tratamiento (valores reales en `Hub.css`):

- Círculo de lado `min(clamp(7.5rem, 34vw, 12rem), 26svh)` — 133 px a 390×844.
- Alineado al margen lateral, como todo lo demás. No centrado.
- `transform: scale(1.3)` sobre la imagen: `carlos.webp` es cuadrada y el círculo también, así que
  `object-fit: cover` **no recorta nada** y se veía un cerco ancho de fondo de estudio.
- Máscara `radial-gradient(circle closest-side …, #000 0 78%, transparent 100%)`. **`closest-side`
  es obligatorio**: sin él el gradiente usa `farthest-corner`, la caída cae fuera de la caja y la
  foto sale cuadrada. Pasó.
- `filter: saturate(0.68) contrast(1.06) brightness(0.78)` y el tinte de `--fondo` en `color`.
- `.retrato::before` hunde el **anillo exterior** hacia el color de la página: dentro del círculo
  todo el perímetro es fondo de estudio claro, y sin esto la foto se lee como una moneda pegada.
  Es tratamiento fotográfico dentro de la foto, no una forma sobre la pieza.

En la rama el retrato **no aparece**: ahí manda el logo. Nunca se convierte en un avatar circular
de esquina.

**PENDIENTE:** `Transicion.tsx` todavía lo convierte en una insignia circular de esquina. Sin
revisar. Es la fase 1 de `PLAN-ACTIVO.md`.

---

## 5. Tipografía

### La display del hub

El hub es la persona. Space Grotesk es la display de **las dos empresas**, así que usarla también
en el hub borra la distinción: la entrada parecería ya de ALSAI. **El hub lleva su propia display,
y al entrar en una marca la tipografía cambia a Space Grotesk.** Ese cambio *es* parte de la
bifurcación.

### CERRADA: **Syne**, elegida por Carlos el 2026-08-05

`--display-hub: 'Syne'` con `--display-hub-peso: 700`, self-hosted con `@fontsource`, pesos 400,
600 y 700. Se importan **tres pesos** porque la display del hub se usa en tres jerarquías: el
nombre (700), los nombres de marca de las filas (600) y la pregunta (400). Antes solo se importaba
un peso y el navegador falsificaba la negrita de las filas; con una display de formas anchas como
Syne esa falsificación se nota.

**Consecuencia de composición:** «Carlos Álvarez» pasa a **dos líneas** a 390×844. Cabe sin scroll
y se lee deliberado, pero es un cambio real respecto a la maqueta de una sola línea.

Historial de la decisión, que explica por qué no volver atrás:

| Candidata | Carácter | Resultado |
|---|---|---|
| **Syne** | grotesca contemporánea, formas anchas | **ELEGIDA** por Carlos |
| Instrument Serif | serif display, contraste alto, muy fina | **Rechazada** por Carlos |
| Newsreader | serif de contraste bajo, cálida | Propuesta, no elegida |
| Bricolage Grotesque | grotesca con quiebres deliberados | Propuesta, no elegida |
| Fraunces | serif variable, expresiva | **Excluida** por Carlos. Desinstalada |
| Inter, Roboto, Geist, Plus Jakarta Sans | — | **Excluidas** por Carlos |

**Cuerpo: Inter** en los tres estados. No cambia nunca; es lo que sostiene la continuidad.

### Escala real

Valores medidos a 390×844, que es donde vive la tarjeta.

| Rol | Tamaño | Interlineado | Tracking | Peso |
|---|---|---|---|---|
| Nombre (hub) | `clamp(3rem, 13.5vw, 4.25rem)` | 0.94 | −0.035em | 400 si serif, 600 si grotesca |
| Ciudad | `0.8125rem` | 1.4 | +0.09em, mayúsculas | 500 |
| Tesis | `1.0625rem` | 1.55 | 0 | 400 |
| Pregunta | `1.25rem` | 1.3 | −0.01em | 500 |
| Nombre de marca (botón) | `1.1875rem` | 1.2 | −0.015em | 600 |
| Resumen de marca (botón) | `0.875rem` | 1.4 | 0 | 400 |
| Título de rama | `clamp(2rem, 9vw, 3rem)` | 1.0 | −0.03em | 700 |
| Etiqueta | `0.8125rem` | 1.4 | +0.08em, mayúsculas | 500 |

**Regla dura:** ningún título con tracking positivo. Nunca.

### El halo del texto — obligatorio

El texto va en **blanco puro** sobre el relieve. Sin halo es ilegible cuando la luz barre por
debajo: fue la causa real de «al interactuar el fondo empeora».

```css
text-shadow:
  0 0 3px    rgba(0,0,0,1.09),   /* CERCANO: es esta capa la que salva al texto pequeño */
  0 1px 3px  rgba(0,0,0,0.98),
  0 2px 12px rgba(0,0,0,0.90),
  0 0 34px   rgba(0,0,0,0.67),
  0 0 72px   rgba(0,0,0,0.48);
```

La primera capa es la importante. Las anchas dan volumen pero **no** legibilidad: un halo difuso
se reparte demasiado y el texto pequeño se pierde igual. La línea de la ciudad lleva además su
propia sombra más cerrada y va al **82 %** de blanco, no menos: es el renglón más frágil.

---

## 6. Los botones de marca

**No son cajas.** El primer intento los hizo rectángulos de color con esquinas redondeadas y una
flecha en círculo: se leen a formulario, no a tarjeta cara. `SISTEMA-DISENO.md` ya lo tenía en
sus antipatrones.

Son **filas**, al estilo de una lista editorial:

- Ocupan el ancho completo, sin fondo propio.
- Separadas por un filete de `1px solid rgba(242,240,235,0.14)`. La última fila también lo lleva
  abajo: el conjunto se lee como una tabla de contenidos, no como dos botones sueltos.
- Alto mínimo **88 px**, que ya exigía el sistema.
- Estructura: nombre de la marca arriba, resumen debajo en `--mute`; a la derecha, una flecha SVG
  en línea de 20 px al 45 % de opacidad.
- **El único color de marca visible en el hub** es un punto de 6 px del acento de esa marca,
  delante del nombre. Cian para ALSAI, naranja para Blindafón. Sirve para anticipar a dónde lleva
  cada fila sin que el hub deje de ser platino.
- `:active` → `scale(0.985)` en 120 ms y la fila se aclara al 6 %. En móvil no hay hover.
- Al tocar, la flecha se desplaza 4 px a la derecha antes de que arranque la bifurcación.

Las acciones secundarias (*Guardar mis datos*, *Compartir*) van en una sola línea, separadas por
un punto medio, en `0.875rem` y color `--mute`. No compiten con las dos filas.

---

## 7. Movimiento

Se hereda `SISTEMA-DISENO.md` sin cambios: easing `cubic-bezier(0.16, 1, 0.3, 1)`, micro 240 ms,
medio 420 ms, bifurcación 900 ms. Solo `transform` y `opacity`.

### La luz, en CSS — añadido el 2026-08-05

`src/lib/luzCss.ts` publica la dirección de la luz en `--luz-x`, `--luz-y`, `--luz-px` y `--luz-py`
sobre `<html>`. Las consumen el retrato y todos los filetes de las filas tocables.

**No es un efecto que imita al fondo: es el fondo.** El publicador se alimenta del valor que el
bucle del relieve ya calculó, en el mismo frame. Es lo que hace que la luz se sienta atravesar la
pieza entera en vez de que cada elemento brille por su cuenta.

**Regla dura para quien lo toque:** no crear un `requestAnimationFrame` propio que llame a
`obtenerInclinacion().leer(dt)`. `leer()` **integra** el resorte; llamarlo dos veces por frame lo
integra dos veces y cambia la dinámica del fondo, que son los valores que Carlos cerró probando en
su teléfono.

**El filete vivo** es el recurso con el que se resolvió «botones más llamativos» sin reabrir la
caja: la línea de 1 px que separa las filas es un `::after` con un degradado cuyo punto brillante
vive en `--luz-px`. La presencia viene de que la línea esté viva. Ningún elemento tocable tiene
fondo propio, y eso no cambia.

**En el retrato, la luz es un brillo que CRUZA la superficie de la foto, nunca un anillo alrededor
del círculo.** Un aro ahí sería literalmente lo que Carlos rechazó del primer intento.

Entrada del hub, escalonada 60 ms, máximo cinco pasos:

1. El relieve ya está (entra con un fundido de 600 ms al montarse el WebGL).
2. Retrato: `opacity 0→1` y `scale(1.04)→1` en 900 ms.
3. Nombre: `translateY(12px)→0` con fundido, 520 ms.
4. Ciudad y tesis, 60 ms después.
5. Las dos filas, 60 ms entre ellas.

**La invitación del giroscopio** entra a los 1.4 s con un fundido de 900 ms, y solo en iOS.

`prefers-reduced-motion: reduce`: el relieve **sigue visible pero congelado**, sin giroscopio ni
órbita. Las entradas pasan a un fundido único de 150 ms. La bifurcación, 150 ms.

---

## 8. El permiso del giroscopio en iOS

El diálogo de iOS **no se puede customizar**: lo dibuja el sistema y saldrá siempre, también en
producción. Lo que sí se controla es lo de antes y lo de después.

- **Antes:** una invitación propia, discreta, abajo: «Mueve el teléfono para ver la luz».
  Sin píldora, sin borde, sin blur — es una nota al pie, no un botón. Blanco al 52 % con el mismo
  halo por letra. Al tocarla se dispara `requestPermission()`.
- **Nunca al cargar.** Un diálogo de sistema en la cara al abrir por NFC arruina la entrada.
- **Después:** si lo conceden, la invitación se va con un fundido. Si lo deniegan, **se va
  exactamente igual**: sin mensaje de error, sin reintento, sin explicación. Queda la órbita
  automática y nadie se entera de que faltó algo.
- En Android la invitación **no existe**: no hay permiso que pedir.

---

## 9. La rama

Cambia la identidad, no la estructura. Lo que se mantiene: fondo a sangre, alineación izquierda,
halo del texto, ausencia de cajas.

- El retrato desaparece; arriba va el **logo de la marca**. ~~alineado a la izquierda, nunca
  centrado~~ → **CENTRADO desde la REVISIÓN 2**, que manda sobre esta sección. Se centra el bloque
  de identidad entero (logo + línea de rol); de la descripción hacia abajo todo sigue a la
  izquierda. El «alto máximo 34 px» tampoco se cumplió nunca: el alto real es
  `clamp(4.25rem, 11svh, 6.75rem)`, y así aprobado en captura.
- La display pasa a **Space Grotesk**. Es el momento en que la tarjeta deja de ser de Carlos y
  pasa a ser de la marca.
- El acento tiñe el fondo, el punto de la marca, el filete activo y el `theme-color` del
  navegador.
- El dato de prueba (`+860 dispositivos blindados` en Blindafón) va en una línea propia con
  tratamiento de etiqueta. **Si `prueba` está vacío, no se dibuja nada.** Nunca un placeholder.
- Las dos acciones principales viven en un dock fijo abajo, respetando
  `padding-bottom: max(1rem, env(safe-area-inset-bottom))`.
- *Volver* arriba a la izquierda, con área táctil de 44 px.

---

## 10. Lo que no se hace

Además de los antipatrones que ya lista `SISTEMA-DISENO.md`:

- **Ninguna caja para el retrato.** Ni tarjeta 3D, ni círculo, ni marco, ni aro.
- **Ningún panel de vidrio** detrás del texto para hacerlo legible. Para eso está el halo.
- **Ningún elemento decorativo sin significado.** El primer intento tenía dos círculos cian y
  naranja junto a la foto que no querían decir nada.
- **Ningún párrafo centrado.**
- **Ningún botón que se lea a formulario**: nada de rectángulo de color con esquina de 8 px.
- **El fondo no reacciona al scroll.**
- **No se avisa nunca** de que falta el permiso del giroscopio.

---

## 11. Criterio de aceptación

La capa visual está terminada cuando, con capturas reales de `scripts/mirar.mjs` a 390×844 y
430×932 contra el Chrome del sistema:

1. En hub, ALSAI y Blindafón **no aparece ninguna caja** alrededor del retrato ni detrás del texto.
2. El texto es legible con la luz del fondo en su pico, **con `CALMA` y `VELO` a 0** — es decir,
   solo con el halo. Es la prueba dura.
3. El retrato llega a los bordes laterales y **se funde** por abajo: no hay línea de corte.
4. Las dos filas de marca miden ≥ 88 px y no tienen fondo propio.
5. Sin desbordamiento horizontal en ninguno de los dos viewports.
6. Cero errores de consola.
7. Con `prefers-reduced-motion`, dos capturas separadas por 2 s son **idénticas** y el relieve
   sigue visible.
8. Carlos lo abre en su teléfono y da el visto bueno. **Sin este punto, nada está terminado.**
   Un QA headless mide contraste y CLS; no aprueba diseño. Ya se cometió ese error una vez.
