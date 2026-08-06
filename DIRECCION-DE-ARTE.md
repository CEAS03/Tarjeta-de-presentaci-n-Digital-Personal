# DIRECCIÓN DE ARTE — Tarjeta digital de Carlos Álvarez

**Escrito por Claude Code · 2026-08-05 (noche) · valores cerrados con Carlos en su teléfono**

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
| `CALMA` | **0.85** | cuánto se aplana el relieve bajo el texto |
| `VELO` | **0** | descartado: la sombra por letra ya basta |

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

Una sola pantalla, sin scroll obligatorio para lo esencial. De arriba abajo:

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

## 4. El retrato — sin recuadro

**Regla dura: la foto no vive dentro de nada.** Ni tarjeta 3D, ni círculo, ni marco, ni aro
blanco. Fue el rechazo más explícito de Carlos.

Tratamiento:

- Ocupa el **ancho completo**, sangrando por los dos lados y por arriba.
- Alto: **52 %** de la altura de la pantalla (`52svh`, no `vh` — en móvil la barra del navegador
  cambia `vh` y la foto daría saltos al hacer scroll).
- `object-fit: cover`, `object-position: center 28 %` — la cara queda en el tercio alto.
- **Se funde con el fondo por abajo** con una máscara: `mask-image: linear-gradient(to bottom,
  #000 0%, #000 46%, transparent 96%)`. No hay borde inferior: la foto se disuelve en el relieve.
- Desaturada al **88 %** y con el brillo al **92 %**, para que conviva con una paleta fría sin
  parecer una foto pegada encima.
- Una sombra interior de color `--fondo` en la parte baja refuerza la fusión.

En la rama, el retrato **no aparece**: ahí manda el logo de la marca. La transición lo encoge y
lo retira. Nunca se convierte en un avatar circular de esquina.

---

## 5. Tipografía

### La display del hub

El hub es la persona. Space Grotesk es la display de **las dos empresas**, así que usarla también
en el hub borra la distinción: la entrada parecería ya de ALSAI. **El hub lleva su propia display,
y al entrar en una marca la tipografía cambia a Space Grotesk.** Ese cambio *es* parte de la
bifurcación.

Tres candidatas, todas self-hosted con `@fontsource`, sin CDN:

| Candidata | Carácter | Por qué aquí |
|---|---|---|
| **Instrument Serif** | serif display, contraste alto, muy fina | Humaniza. Contra dos marcas tecnológicas, una serif dice «persona», no «producto». Es mi recomendación |
| **Bricolage Grotesque** | grotesca con quiebres deliberados | Moderna y con carácter, sin irse a lo editorial. La apuesta intermedia |
| **Fraunces** | serif variable, cálida y expresiva | La más personal de las tres. Riesgo: puede tirar a boutique |

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

- El retrato desaparece; arriba va el **logo de la marca**, alto máximo 34 px, alineado a la
  izquierda, nunca centrado ni ampliado hasta ocupar el ancho.
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
