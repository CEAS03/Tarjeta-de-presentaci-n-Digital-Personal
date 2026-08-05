# CONTEXTO — Personal · tarjeta digital NFC de Carlos

Solo información **estable**. Lo que avanza semana a semana va en `ESTADO.md`.
El diseño completo está en `DISENO.md`; el trabajo de hoy, si hay un plan activo, en
`PLAN-ACTIVO.md`.

## Objetivo

Tarjeta de presentación digital personal de Carlos Álvarez, que se abre al acercar un teléfono a
una tarjeta física NFC. Presenta a la persona primero y deja que el visitante **elija** cuál de sus
dos negocios quiere ver: Agencia ALSAI o Blindafón.

No es la tarjeta de ALSAI (esa ya existe, en conecta.agencia-alsai.com y está dirigida a clínicas).
No es el sitio de Blindafón. Es la de **Carlos**.

## Código

| | |
|---|---|
| Raíz del proyecto | `C:\Users\CEAS0\Documents\Claude Code VSC\Agencia ALSAI\Landing y Sitio web -ALSAI\Tarjeta Digital PERSONAL\` |
| Producción | `https://carlos.agencia-alsai.com` — **pendiente de crear** |
| Repo GitHub | ninguno todavía |
| Vercel | proyecto `carlos-alvarez-tarjeta` — **pendiente de crear** |

El proyecto y todos sus documentos operativos viven en esta raíz. No depende del vault ni de
ninguna carpeta externa.

## Stack

Vite 6 · React 18 · TypeScript 5 · GSAP 3 · **OGL** para WebGL.
Fuentes self-hosted con `@fontsource` (Space Grotesk + Inter). Sin react-router: la tarjeta es una
sola página con estado y `History API`.

**OGL, no Three.js**: ofrece el WebGL necesario con una huella menor. La elección ayuda a la carga
móvil, dentro del presupuesto orientativo; no cambia la prioridad del acabado ni de la fluidez.

## Requisitos que puso Carlos

- Arriba: introducción personal muy breve. Debajo, **dos botones** — ALSAI primero, Blindafón
  después — para que el visitante elija qué tarjeta ver.
- Cada rama debe permitir **guardar el contacto** y **mandar WhatsApp**.
- Un botón de **agendar cita** más abajo, específico de cada marca. Hoy funciona mediante una
  hoja que continúa por WhatsApp con el mensaje preparado; la automatización con n8n y calendario
  puede sustituir ese destino después.
- Fondo interactivo y dinámico. Muchas transiciones, efectos y animaciones.
- Tiene que verse superprofesional y muy avanzada: es su carta de presentación.

## Restricciones

- **Mobile-first de verdad.** Se abre con el teléfono en la mano tras un toque NFC.
- El acabado manda sobre el rendimiento. **LCP < 3 s y ~400 KB de JS** son presupuestos
  orientativos, no límites duros; la fluidez sin tirones sí es obligatoria.
- Español en todo: código, comentarios, documentación y copy.
- Nunca inventar datos de negocio ni de contacto. La fuente única local es
  `src/config/tarjeta.ts`; `AGENTS.md` documenta la procedencia de los datos copiados.
- Respetar `prefers-reduced-motion`: el relieve permanece visible pero congelado, sin giroscopio
  ni parallax, y las transiciones se acortan.

## Decisiones tomadas

| Fecha | Decisión | Por qué |
|---|---|---|
| 2026-08-05 | Proyecto autocontenido en la raíz actual, con código y `.md` juntos | La tarjeta lleva las dos marcas y no debe depender del vault ni del contexto cargado en un chat |
| 2026-08-05 | Hub con dos ramas, no scroll único con dos secciones | Lo pidió Carlos, y evita que la tarjeta se lea como un menú de "hago un poco de todo" |
| 2026-08-05 | La rama Blindafón vive en oscuro (`#0A0E18`), no en cream | `#0A0E18` es un token real de Blindafón (black-deep). Mantiene coherencia con el hub y evita un flashazo blanco de noche |
| 2026-08-05 | Space Grotesk como display para las dos marcas | Es la display de ALSAI **y** de Blindafón. Una sola familia sostiene el cambio de identidad |
| 2026-08-05 | vCard distinta por rama, con foto embebida | Blindafón no tiene correo y ALSAI sí; una sola vCard mentiría en un lado |
| 2026-08-05 | Sin react-router; estado + `?m=` en la URL | Una sola página. El router pesa y no aporta nada aquí |
| 2026-08-05 | El botón de agendar abre WhatsApp con mensaje precargado | Un botón muerto no convierte. Cuando exista n8n se cambia un valor en `tarjeta.ts` |
| 2026-08-05 | El origen se registra sin cambiar el saludo visible | La atribución sirve a analítica; la entrada debe seguir siendo breve y profesional |
| 2026-08-05 | Firma manuscrita descartada | Era un adorno sin función dentro de una tarjeta digital |

## Fuente única de datos

**`src/config/tarjeta.ts` y nada más.** Contacto, enlaces, copy e integraciones. Ningún componente
lleva datos duros. No se crea un `.md` paralelo con los mismos datos: dos fuentes siempre acaban
contradiciéndose.

## Activos cerrados

- Los logos procesados y usados por la aplicación son `public/alsai-blanco.webp` y
  `public/blindafon.webp`.
- La firma manuscrita no falta: se descartó y no forma parte del producto.

## Pendientes externos / datos por confirmar

- **Rol en Blindafón**: el valor actual en `tarjeta.ts` es "Fundador". Si Carlos confirma otro,
  se cambia en esa fuente única.
- **DNS**: el subdominio `carlos` lo tiene que crear Carlos en Namecheap. Ver `DISENO.md`.
- **Vercel**: el proyecto `carlos-alvarez-tarjeta` sigue pendiente de crear.
- **Endpoint de agendado** (n8n + calendario): sin definir. El agendado actual ya funciona por
  WhatsApp mientras `agendaUrl` siga vacío.
- **LinkedIn**: la tarjeta de ALSAI lo tiene vacío. Si Carlos tiene perfil, se añade.
