# Producto

<!-- impeccable:product-schema 1 -->

## Plataforma

web

## Usuarios

Personas que conocen a Carlos Álvarez en un contexto profesional y abren la tarjeta desde un
teléfono mediante NFC, QR o un enlace. Su tarea principal es entender rápidamente quién es Carlos,
elegir cuál de sus dos empresas conocer y contactar o guardar los datos correctos.

## Propósito del producto

Ser la tarjeta de presentación digital personal de Carlos: una introducción muy breve que lo
presenta primero como persona y después conduce a Agencia ALSAI o Blindafón. El éxito consiste en
que el visitante comprenda la propuesta en la primera pantalla y pueda guardar el contacto,
escribir por WhatsApp, agendar o compartir sin fricción.

## Posicionamiento

Una sola identidad personal conecta dos empresas distintas. La tarjeta no sustituye sus sitios:
funciona como una bifurcación memorable entre Carlos, Agencia ALSAI y Blindafón.

## Contexto de uso

- Uso prioritario y prácticamente total desde teléfono.
- Apertura después de acercar una tarjeta NFC, escanear un QR o recibir un enlace.
- Interacción breve, normalmente de pie o durante una conversación.
- Los parámetros de origen se registran para analítica, pero no cambian el saludo visible.

## Capacidades y restricciones

- Hub personal con retrato, nombre, `persona.descripcion`, `persona.pregunta` y dos accesos de
  empresa, todo tomado de `src/config/tarjeta.ts`.
- Ramas con actividad esencial, enlaces, guardar contacto con foto, WhatsApp y agendado. Mientras
  `agendaUrl` esté vacío, el agendado continúa de forma funcional por WhatsApp.
- Compartir mediante la API nativa, copia de enlace y QR generado en el cliente.
- Fondo topográfico WebGL que responde al puntero y al giroscopio con inercia.
- PWA instalable, atribución de origen, SEO, Open Graph y GA4.
- React, TypeScript y Vite; datos y copy centralizados en `src/config/tarjeta.ts`.
- El presupuesto orientativo es LCP < 3 s y ~400 KB de JavaScript; el acabado puede justificar
  superarlo, pero la experiencia nunca debe verse entrecortada.
- El efecto demostrativo de vidrio e impacto para Blindafón no está implementado ni forma parte de
  la v1 actual.
- No inventar teléfonos, correos, direcciones, clientes, precios ni métricas.

## Compromisos de marca

- Nombre principal: Carlos Álvarez.
- Descripción aprobada: “Soy un emprendedor que combina tecnología, creatividad e innovación para
  convertir ideas en soluciones que ayuden a la gente.”
- Acabado profesional, avanzado y memorable; el efecto visual puede competir deliberadamente con
  el retrato si mejora el resultado global.
- Agencia ALSAI conserva su identidad cian y Blindafón su identidad naranja y azul.
- El relieve topográfico reactivo es el efecto principal y no debe eliminarse ni ocultarse.
- La firma manuscrita se descartó; no es un activo pendiente del producto.

## Evidencia disponible

- Retrato: `public/carlos.webp` y `public/carlos-vcard.jpg`.
- Logos: `public/alsai-blanco.webp` y `public/blindafon.webp`.
- Datos y enlaces reales: `src/config/tarjeta.ts`.
- Sistema visual y decisiones existentes: `SISTEMA-DISENO.md`, `DISENO.md` y `CONTEXTO.md`.
- La única métrica autorizada y mostrada es “+860 dispositivos blindados”; no hay testimonios ni
  clientes autorizados ni otras métricas para añadir.

## Principios del producto

1. Presentar a Carlos en segundos, sin biografía extensa ni navegación innecesaria.
2. Dar el mismo peso funcional a las dos empresas sin mezclar sus identidades.
3. Hacer espectaculares los momentos importantes sin sacrificar fluidez ni legibilidad.
4. Mantener las acciones principales grandes, táctiles y evidentes.
5. Registrar el origen de la visita sin convertirlo en copy visible.

## Accesibilidad e inclusión

Diseño mobile-first, objetivos táctiles de al menos 44 px, contraste AA, navegación por teclado y
áreas seguras. Con `prefers-reduced-motion`, el relieve permanece visible pero congelado, sin
giroscopio ni parallax, y las transiciones se acortan.
