# DISEÑO — Tarjeta digital NFC de Carlos Álvarez

**Escrito por Claude Code · 2026-08-05 · aprobado por Carlos el 2026-08-05**

Este documento decide **qué** se construye y **por qué**. El **cómo**, paso a paso, está en
`PLAN-ACTIVO.md` mientras exista un plan activo. Los tokens exactos están en
`SISTEMA-DISENO.md`, en esta misma carpeta.

---

## 1. La tensión que resuelve el diseño

Una tarjeta personal que carga dos negocios corre un riesgo real: **volverse un menú**. Un menú
comunica "hago un poco de todo", y eso se lee como *menos* profesional, no más.

La salida no es visual, es narrativa. Carlos no vende dos cosas: **construye negocios con
tecnología**. ALSAI es lo que hace para otros. Blindafón es lo que hizo para sí mismo — con +860
dispositivos blindados, es prueba operando, no un segundo catálogo.

Por eso el hub presenta a la **persona** primero y las marcas después, como dos caminos que salen
de la misma tesis. El visitante elige; no se le sirve un menú, se le da una bifurcación.

---

## 2. Arquitectura: un hub, dos ramas

Una sola página. Tres estados, no tres rutas:

```
                    ┌──────────────┐
                    │     HUB      │  identidad + tesis + 2 botones
                    └──────┬───────┘
                  ┌────────┴────────┐
                  ▼                 ▼
          ┌───────────────┐  ┌───────────────┐
          │ RAMA ALSAI    │  │ RAMA BLINDAFÓN│
          │ cian · frío   │  │ naranja·cálido│
          └───────────────┘  └───────────────┘
```

- Estado en React, reflejado en la URL como `?m=alsai` / `?m=blindafon` con `history.pushState`.
- El botón "atrás" del teléfono regresa al hub. Es lo que la gente espera; sin esto, se salen.
- Enlace directo a una rama: `carlos.agencia-alsai.com/?m=blindafon`. Sirve para compartir.
- **Sin react-router.** Una página, dos estados, 40 líneas de `useState` + `popstate`.

---

## 3. Contenido exacto

### 3.1 Hub

| Elemento | Contenido |
|---|---|
| Momento visual | Tarjeta física 3D y retrato, con respuesta al giroscopio y al puntero |
| Nombre | **Carlos Álvarez** |
| Línea de lugar | Querétaro, México |
| Descripción | *Soy un emprendedor que combina tecnología, creatividad e innovación para convertir ideas en soluciones que ayuden a la gente.* |
| Pregunta | **¿Qué parte de mi trabajo quieres conocer?** |
| Botón 1 | **Agencia ALSAI** — «Inteligencia artificial y marketing para empresas» |
| Botón 2 | **Blindafón** — «Blindaje nanotecnológico para pantallas» |
| Acción secundaria | Guardar mis datos (vCard combinada) · Compartir |

ALSAI va arriba: lo pidió Carlos y es el negocio que vende servicio profesional.

**Decisión de Carlos del 2026-08-05:** el origen NFC/QR se registra en analítica, pero no cambia el
saludo visible. El hub debe ser muy breve y profesional; el efecto 3D y el relieve pueden competir
deliberadamente con el retrato si el resultado se siente más avanzado. La lectura sigue este orden:
momento visual → nombre → descripción → pregunta → dos empresas → guardar/compartir.

### 3.2 Rama ALSAI

- Logo procesado `public/alsai-blanco.webp`, preparado para el fondo oscuro.
- Descripción, tomada de `AGENCIA.md`, sin inventar nada:
  > Agencia de inteligencia artificial y marketing en Querétaro. Ayudo a empresas a conseguir más
  > clientes y a automatizar sus procesos: marketing, IA, WhatsApp y CRM funcionando como un solo
  > sistema.
- **Guardar contacto** → vCard ALSAI · **WhatsApp** → `wa.me/524423961718` con texto precargado.
- **Agendar una llamada** → flujo funcional por WhatsApp mientras no exista endpoint (§6).
- Enlaces: `www.agencia-alsai.com` · Instagram `@agencia.alsai`.
- Volver al hub.

### 3.3 Rama Blindafón

- Logo procesado `public/blindafon.webp`.
- Descripción, tomada de `DATOS-NEGOCIO.md`, sin inventar nada:
  > Blindaje líquido nanotecnológico para las pantallas de tus dispositivos. Se aplica en 20
  > minutos, a domicilio en Querétaro.
- Dato duro verificado y mostrado: **+860 dispositivos blindados**.
- **Guardar contacto** → vCard Blindafón · **WhatsApp** → `wa.me/524428115588`.
- **Agendar mi blindaje** → flujo funcional por WhatsApp mientras no exista endpoint (§6).
- Enlaces: `blindafon.com` · Instagram `@blindafon_` · TikTok · Facebook.
- Volver al hub.

**No se ponen precios en la tarjeta.** Cambian, y duplicarlos aquí crearía una segunda fuente que
contradiría a `DATOS-NEGOCIO.md`. Quien quiera precio, escribe por WhatsApp.

---

## 4. Contacto por rama

Copiado de las fuentes el 2026-08-05. **Nunca de memoria.**

| | Agencia ALSAI | Blindafón |
|---|---|---|
| WhatsApp | +52 442 396 1718 | +52 442 811 5588 |
| Correo | agencia.alsai@gmail.com | *(no tiene — se omite del vCard)* |
| Sitio | www.agencia-alsai.com | blindafon.com |
| Instagram | @agencia.alsai | @blindafon_ |
| Otras redes | — | TikTok @blindafon · Facebook |

### vCard

Tres archivos distintos generados en el navegador, cada uno con la **foto embebida en base64**
(`PHOTO;ENCODING=b;TYPE=JPEG`). Casi nadie hace esto: quien te guarda te ve la cara en su agenda.

| Rama | ORG | TEL | EMAIL | URL |
|---|---|---|---|---|
| Hub | Agencia ALSAI | los dos, `WORK` y `CELL` | agencia.alsai@gmail.com | agencia-alsai.com |
| ALSAI | Agencia ALSAI | +524423961718 | agencia.alsai@gmail.com | agencia-alsai.com |
| Blindafón | Blindafón | +524428115588 | — | blindafon.com |

`ADR` solo con ciudad y estado: Querétaro, Qro., México. **Sin calle** — regla de `AGENCIA.md`.
La foto embebida se recorta a 400×400 JPEG q80 para que el `.vcf` no pase de ~40 KB; arriba de eso,
algunos Android lo rechazan.

---

## 5. Identidad visual

El hub necesita identidad **propia y neutra**: si arranca en cian, ya eligió ALSAI por el visitante.

| Capa | Color | Origen |
|---|---|---|
| Lienzo (todo) | `#05070D` void | nuevo, neutro entre las dos marcas |
| Texto | `#F2F0EB` bone | cercano al cream de Blindafón |
| Acento del hub | `#C8CEDA` platino | neutro: ni frío ni cálido |
| Acento ALSAI | `#37E2E4` cian | token real de la tarjeta ALSAI |
| Fondo ALSAI | `#040A16` | token real de la tarjeta ALSAI |
| Acento Blindafón | `#F18B3B` naranja | token real de Blindafón |
| Fondo Blindafón | `#0A0E18` black-deep | token real de Blindafón |
| Apoyo Blindafón | `#4FC3FF` blue-glow | token real de Blindafón |

**Por qué Blindafón no va en cream:** su sitio vive en `#F5F1EA`, pero un flashazo blanco después
de un hub oscuro es agresivo de noche —y la tarjeta se entrega de noche, en eventos— y rompería la
sensación de una sola pieza. `#0A0E18` es igual de suyo: es el fondo de sus secciones dramáticas.
El contraste frío→cálido sigue leyéndose entero.

**Tipografía:** Space Grotesk (display) + Inter (cuerpo), self-hosted con `@fontsource`, subconjunto
latino. Space Grotesk es la display de **las dos** marcas: una sola familia sostiene el cambio de
identidad sin que la página parezca otra web.

Detalle completo de escala, espaciado, sombras y easings: `SISTEMA-DISENO.md` en el repo.

---

## 6. El botón de agendar

Hoy no hay n8n ni calendario, pero el botón no es un placeholder ni está muerto.

Comportamiento **mientras `agendaUrl` esté vacío en `tarjeta.ts`**: abre una hoja inferior que
explica en una línea y ofrece WhatsApp con el mensaje ya escrito —
`"Hola Carlos, quiero agendar una llamada sobre ALSAI"` o `"…agendar mi blindaje"`.

Cuando exista el endpoint, se pega en `agendaUrl` y el botón pasa a abrirlo. **Cero cambios de
código.**

---

## 7. Los momentos construidos en la v1

Ordenados por impacto. Los primeros cuatro son el núcleo; los demás son la firma.

1. **La bifurcación.** Al elegir marca, un círculo enmascarado crece desde el botón tocado mientras
   el retrato se encoge hasta una insignia de esquina y toda la paleta interpola —fondo, acentos,
   glow de botones y `theme-color` del navegador—. No es navegar: es que la tarjeta **se
   transforma**. Es el momento que la gente va a recordar.
2. **El relieve.** Es el fondo, y es el efecto principal de la tarjeta. Ver §7-bis.
3. **vCard con foto embebida** (§4).
4. **Tarjeta física en 3D** en el hub, inclinándose con el giroscopio. Metáfora directa: la tarjeta
   que acaban de tocar *se volvió* digital.
5. **Atribución de origen silenciosa.** `?src=nfc`, `?src=qr` y `?src=link` dicen qué canal funciona
   sin cambiar el saludo ni añadir una micro-bienvenida visible.
6. **PWA instalable** — la tarjeta queda como ícono en su teléfono.
7. **Háptica** (`navigator.vibrate`) en las acciones principales. Android.
8. **Compartir de vuelta**: Web Share API, y un QR generado en el cliente para quien no traiga NFC.

*(La firma manuscrita animada se descartó el 2026-08-05. Era un adorno sin razón de ser: la tarjeta
no es un documento y Carlos no le veía sentido. Tenía razón.)*

---

## 7-bis. El relieve — el fondo

**Decidido el 2026-08-05 después de comparar siete direcciones en proporción de teléfono.**

Una superficie de líneas de nivel —como un mapa topográfico de un relieve invisible— que ondula
lentamente y sobre la que **se mueve una luz**. No hay ningún objeto en pantalla: no hay esfera, no
hay mancha, no hay partículas. Hay una tela con pliegues y una luz que la recorre.

Se descartaron por el camino: partículas con líneas (cliché), tinta/fluido (no convenció),
bandas de vidrio (pobre) y cromo líquido (la mancha con contorno móvil molestaba, y la esfera
no significaba nada).

### De qué se compone

| Capa | Qué es |
|---|---|
| Relieve | Campo de altura por ruido; se dibuja como **líneas de nivel**, no como superficie sólida. Le da el aire preciso, de instrumento, de la variante topográfica |
| Pliegue | Las líneas heredan el ondulado suave de la seda: amplitud creciente hacia abajo, dos frecuencias superpuestas |
| Luz | Una sola fuente direccional. Cada tramo de línea se ilumina según su normal contra la luz: **especular anisotrópico** |
| Color | Fuera del brillo, la línea tiende al acento secundario. Al acercarse al brillo pasa al acento de la marca y, en el pico, a blanco |

Ese recorrido **acento-2 → acento → blanco** es exactamente lo que a Carlos le gustó de las pruebas:
"cómo se van viendo los colores blanco o naranja y azul". No es decoración, es el modelo de luz.

### Cómo se mueve

**Las ondas se mueven solas. La luz la mueve el teléfono.** Son dos movimientos independientes y esa
separación es la idea central: el fondo está vivo aunque no toques nada, pero el destello solo
aparece si mueves el aparato. Eso convierte inclinar el teléfono en un descubrimiento.

- Ondas: deriva propia, lenta, sin fin. ~0.3 rad/s.
- Luz: `deviceorientation` (`beta` y `gamma`) → vector de dirección.
- **Amortiguado de resorte de ~1.2 s.** En las pruebas la luz seguía al cursor demasiado rápido y
  el destello se pasaba de largo sin que se alcanzara a percibir. Con inercia larga, la luz llega
  *después* del gesto y se ve **recorrer** la pantalla. Es el arreglo a esa queja concreta.
- El brillo especular es **ancho** (exponente bajo) por la misma razón: un brillo estrecho
  parpadea, uno ancho barre.
- Sin giroscopio o sin permiso: `pointermove` en escritorio y una órbita lenta automática en
  móvil. Nunca se avisa de que faltó el permiso.

### Implementación

Shader en OGL sobre un quad a pantalla completa. El campo de altura y las líneas de nivel se
calculan en el fragment shader (`fract()` sobre la altura para las isolíneas, `fwidth()` para que
el grosor sea constante en pantalla). Las tres paletas entran como uniformes y se interpolan en la
bifurcación, así que **el fondo también cambia de marca**.

Resolución: `devicePixelRatio` limitado a 2. Si el FPS medio baja de 40 durante 3 s, se reduce la
escala de render a 0.75 y luego a 0.5 — **nunca se apaga**. Vale más un fondo un poco menos nítido
que un fondo ausente.

### Reglas de movimiento

- Todo con `cubic-bezier(0.16, 1, 0.3, 1)`. Nunca `ease` ni `ease-in-out` por defecto.
- Micro-interacciones 200-400 ms. Transiciones de identidad 700-900 ms. Nada por encima de 1 s.
- Solo `transform` y `opacity`. Nada que provoque *layout*.
- `prefers-reduced-motion: reduce` → el relieve WebGL permanece visible pero congelado, con la luz
  fija; sin parallax ni giroscopio. Los cambios de estado pasan a ser un fundido de 150 ms.

---

## 8. Presupuesto de rendimiento

**Cambió el 2026-08-05.** Carlos decidió que el acabado manda: el 100% de las visitas vendrá de un
teléfono, y quien reciba esta tarjeta trae buen aparato y puede esperar a que cargue. El
presupuesto pasa de ser un límite duro a una orientación.

| Métrica | Orientación |
|---|---|
| LCP (4G simulado, móvil) | < 3 s |
| JS inicial (gz) | ~400 KB |
| Retrato servido | ≤ 150 KB WebP |

Si un efecto se ve claramente mejor y cuesta 100 KB más, **se paga**.

Lo que sigue siendo innegociable es otra cosa: **nunca se ve entrecortado.**

- El WebGL se importa dinámicamente después del primer pintado, sobre un degradado CSS que ya se
  ve bien por sí solo. No por peso: para que la primera pantalla nunca esté en blanco.
- Monitor de FPS: por debajo de 40 fps durante 3 s se reduce la escala de render (1 → 0.75 → 0.5).
  **Nunca se apaga el fondo.** Un fondo menos nítido es aceptable; un fondo ausente rompe la pieza.
- Sin CDN de fuentes. Sin librería de iconos completa: solo los SVG que se usen, en línea.

---

## 9. Accesibilidad

- Contraste AA mínimo en texto sobre cualquiera de los tres fondos.
- Objetivos táctiles ≥ 44 px. Acciones principales al alcance del pulgar.
- Foco visible en todo lo interactivo; el cambio de rama mueve el foco al encabezado de la rama.
- `aria-live` para anunciar el cambio de marca a lectores de pantalla.
- El WebGL es decorativo: `aria-hidden` y `pointer-events: none`.

---

## 10. Analítica

GA4, propiedad `G-N6QL5MFY5T` — **la misma que el sitio y la tarjeta de ALSAI**. Es un subdominio de
`agencia-alsai.com`: comparte la cookie `_ga`, así que quien toca la tarjeta y después entra al
sitio cuenta como **una** persona en **un** recorrido. Con propiedad aparte serían dos desconocidos
y se perdería justo la atribución que justifica la tarjeta.

Eventos: `card_open` (con `src`), `brand_selected`, `vcard_saved`, `whatsapp_click`,
`schedule_call_click`, `link_click`, `share_click` — todos con la marca activa como parámetro.

Nombres alineados con los del sitio (`whatsapp_click`, `schedule_call_click`) para que una
conversión sea la misma métrica venga de donde venga.

---

## 11. Despliegue

- Vercel, proyecto nuevo `carlos-alvarez-tarjeta`, con `vercel deploy --prod` desde local.
  **Ningún proyecto de esta máquina tiene integración de Git**: subir a GitHub no despliega nada.
- Dominio `carlos.agencia-alsai.com`. El DNS está en **Namecheap**, no en Vercel:
  hace falta un registro **A** `carlos` → `76.76.21.21`, igual que se hizo con `conecta`.
  **Lo tiene que crear Carlos**; ningún agente toca DNS.
- El apex y `www` son del sitio web de ALSAI. **No tocarlos.**

---

## 12. Fuera de alcance de la v1

Se anotan para que nadie los "descubra" a medias más adelante:

- Automatización real de agendado (n8n + calendario).
- Efecto interactivo de blindaje en la rama Blindafón (vidrio de zafiro e impacto). Es una idea
  futura; no está implementado ni forma parte de la v1 construida.
- Captura inversa de datos del visitante hacia HubSpot.
- Versión en inglés.
- Modo claro.
- Cualquier dato de GPI: es un cliente de ALSAI, no un negocio de Carlos.
