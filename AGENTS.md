# Tarjeta digital NFC — Carlos Álvarez

Tarjeta de presentación **personal** de Carlos: un hub que lo presenta a él y deja al visitante
elegir cuál de sus dos negocios ver — Agencia ALSAI o Blindafón.

**No es** la tarjeta de ALSAI (esa vive en `conecta.agencia-alsai.com`, va dirigida a clínicas y
es otro repo). **No es** el sitio de Blindafón. Es la de la persona.

## Antes de tocar nada, lee

**Todo vive en esta misma carpeta.** No hay notas en el vault para este proyecto; se decidió así
el 2026-08-05 para que el proyecto sea autocontenido.

- `CONTEXTO.md` — lo estable: stack, restricciones, decisiones
- `DISENO.md` — qué se construye y por qué
- `SISTEMA-DISENO.md` — tokens de color, tipografía, movimiento
- `PLAN-ACTIVO.md` — la tarea de ahora, por fases con casillas, **si existe**

No hace falta leer notas del vault ni el contexto de otro proyecto para trabajar aquí. Las fuentes
externas de las marcas solo se consultan si una tarea pide actualizar sus datos de negocio.

## URLs

| | |
|---|---|
| Producción | `https://carlos.agencia-alsai.com` — **pendiente de crear** |
| Vercel | proyecto `carlos-alvarez-tarjeta` — **pendiente de crear** |
| Repo GitHub | ninguno todavía |

## Stack y comandos

Vite 6 · React 18 · TypeScript 5 · GSAP 3 · OGL (WebGL) · `@fontsource`.
Servidor de desarrollo en el puerto **5190** con `host: true` (para probar desde el teléfono).

| Comando | Para qué |
|---|---|
| `npm run dev` | desarrollo en 5190 |
| `npm run dev:https` | HTTPS en **5193**. Obligatorio para probar el giroscopio en iPhone |
| `npm run build` | `tsc -b && vite build` |
| `npm run preview` | sirve `dist/` en 5191 |
| `node scripts/aceptacion.mjs <url>` | **14 comprobaciones**; es el criterio de aceptación vigente |
| `node scripts/mirar.mjs <url> <carpeta>` | capturas reales con `puppeteer-core` contra el Chrome del sistema |
| `node scripts/qa-tarjeta.mjs` | QA headless antiguo, del primer intento. Se conserva, pero manda `aceptacion.mjs` |

**No hay `lint` ni `test`.** Si algún documento dice que sí, está mintiendo: corrígelo.

## Mapa del código

| Ruta | Qué hay |
|---|---|
| `src/config/tarjeta.ts` | **fuente única** de contacto, enlaces, copy e integraciones |
| `src/styles/tokens.css` | las tres paletas: hub, ALSAI, Blindafón |
| `src/estado/useMarca.ts` | estado de marca + `?m=` + `History API` |
| `src/components/Hub.tsx` | pantalla de entrada |
| `src/components/Rama.tsx` | plantilla única de las dos ramas |
| `src/lib/vcard.ts` | `.vcf` con foto embebida |
| `src/webgl/` | fondo reactivo, carga diferida |
| `public/carlos.webp` | retrato (640×640, ≤ 60 KB) |
| `public/carlos-vcard.jpg` | retrato para el `.vcf` (400×400, ≤ 40 KB) |
| `public/alsai-blanco.webp` | logo de ALSAI procesado para fondo oscuro |
| `public/blindafon.webp` | logo de Blindafón procesado |

## `src/config/tarjeta.ts` — la única fuente de datos

Ningún componente lleva datos duros. Estructura:

```ts
export const tarjeta = {
  persona: { nombre, nombreVcard, ciudad, direccionVcard, descripcion, pregunta,
             fotoSrc, fotoVcardSrc },
  acciones: { guardarPersonal, guardarContacto, whatsapp, volver, cerrar,
              continuarWhatsapp, compartir },
  marcas: {
    alsai:     { nombre, logoSrc, resumen, rol, descripcion, prueba, whatsapp, mensajeWa,
                 correo, sitio, redes: [...], agendaUrl, textoAgenda, descripcionAgenda,
                 mensajeAgenda },
    blindafon: { …lo mismo; `correo` va vacío a propósito }
  },
  vcardConFoto: true,
  analitica: { ga4Id, debug },
} as const;
```

Un campo vacío **nunca** se rellena con un placeholder: el componente omite el botón o la línea
del `.vcf`. Blindafón no tiene correo y eso es un dato, no un hueco.

## Reglas

- **Todo en español**: código, comentarios, documentación y copy.
- Mobile-first, y no de boquilla: el 100% de las visitas será desde un teléfono.
- **El acabado manda sobre el rendimiento.** Decisión de Carlos del 2026-08-05: la gente que
  reciba esta tarjeta trae buen teléfono y puede esperar a que cargue. Presupuesto orientativo,
  no duro: LCP < 3 s, ~400 KB de JS. Si un efecto se ve notablemente mejor y cuesta 100 KB más,
  se paga. Lo que **no** se negocia es que nunca se vea entrecortado.
- Los componentes y estilos de la aplicación no llevan hex propios: heredan el color de
  `[data-marca]` en `<html>` y de `tokens.css`. Excepciones técnicas: `src/config/paleta.ts`
  refleja la paleta como valores numéricos para el shader; `index.html`, el manifest y el aviso de
  privacidad autónomo pueden llevar literales de color porque no consumen esas variables CSS.
- Animación: solo `transform` y `opacity`, easing `cubic-bezier(0.16, 1, 0.3, 1)`.
  `prefers-reduced-motion` congela el relieve y su luz; desactiva giroscopio y parallax y reduce
  las transiciones a 150 ms. El WebGL sigue visible.
- **Nunca inventar** un teléfono, un correo, un precio ni una métrica. Si falta, se pregunta.
- Sin librerías de iconos ni de QR: SVG en línea y canvas propio.

## De dónde salieron los datos de cada marca

Están **copiados** en `tarjeta.ts`. No hay sincronización y no debe haberla. Si una tarea pide
actualizarlos, se vuelven a comprobar en su fuente y se pegan aquí:

| Marca | Fuente |
|---|---|
| ALSAI | `Agencia ALSAI\Landing y Sitio web -ALSAI\Tarjeta . Landing ALSAI Claude\src\config\site.ts` |
| Blindafón | `Blindafon\Website\DATOS-NEGOCIO.md` |

Los proyectos fuente de la tarjeta de ALSAI y de Blindafón, y cualquier proyecto de GPI, son de
solo lectura durante este trabajo. El proyecto actual sí vive dentro de `Agencia ALSAI\` y es el
único que se edita.

## Trampas conocidas

- **GA4 con gtag.js:** el `dataLayer.push` tiene que usar `function(){dataLayer.push(arguments)}`.
  Con función flecha no existe `arguments` y no se envía ni un evento. Ya mordió en los otros dos
  proyectos de ALSAI.
- **Capturas de pantalla:** el panel de navegador de esta máquina no las produce. Usar
  `puppeteer-core` contra el Chrome del sistema.
- **Viewports menores de 500 px en headless:** `--window-size` miente y recorta. Emular con
  `Emulation.setDeviceMetricsOverride` por CDP.
- **Puerto 5183** lo usan los dos proyectos de ALSAI. Aquí es **5190** para poder abrirlos a la vez.
- **Giroscopio en iOS 13+:** `requestPermission()` exige un gesto del usuario. Pedirlo en el primer
  toque, nunca al cargar, o falla en silencio.

## Privacidad

`C:\Users\CEAS0\Documents\Personal\` contiene INE, CURP y buró de crédito. **No se explora.**
La fotografía ya está copiada a `public/`; no hace falta volver ahí.

## Despliegue

`vercel deploy --prod` desde esta carpeta. **No hay integración de Git**: subir a GitHub no
despliega nada. El DNS está en Namecheap, no en Vercel — el registro A lo crea Carlos.
El apex, `www` y `conecta` de `agencia-alsai.com` son de otros proyectos: **no tocarlos**.

## Pendientes externos y evolución

- Producción y proyecto de Vercel siguen pendientes de crear; el DNS lo crea Carlos en Namecheap.
- Endpoint de agendado (n8n + calendario): sin definir. No bloquea el flujo actual: mientras
  `agendaUrl` esté vacío, el botón abre una hoja y continúa por WhatsApp con el mensaje precargado.
- La firma manuscrita se descartó el 2026-08-05. No es un activo pendiente ni se reincorpora sin
  una decisión nueva de Carlos.

## Protocolo

- Ejecuta el plan **cerrado**: no reinterpretes el objetivo ni añadas mejoras no pedidas.
- Si el plan tiene un hueco o choca con el código: **para y pregunta**. No improvises.
- Verifica con el criterio de aceptación antes de decir que terminaste. Si falla, pon la salida
  real; no la maquilles.
- Si ejecutas un `PLAN-ACTIVO.md`, marca la casilla de la fase en el mismo turno en que la termines.

## Al terminar

1. Escribe el resultado en `ESTADO.md` (esta misma carpeta)
2. Si existe un plan activo, muévelo a `archivo\AAAA-MM-DD-nombre.md`
