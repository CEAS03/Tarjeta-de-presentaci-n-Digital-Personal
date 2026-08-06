# PLAN ACTIVO — Cerrar la capa visual de la tarjeta

**Estado:** `esperando_a_carlos` — las nueve tareas de la REVISIÓN 2 están hechas y verificadas en
headless. Faltan su aprobación en el teléfono y tres decisiones suyas.
**Escrito por Claude Code · 2026-08-05 (noche)**
**Punto de retorno:** commit `42421ba`. La capa visual nueva va de `0587e7e` a `1e4a19a`.

---

## TANDA 1 — HECHA (2026-08-05). Tareas 1 a 5 de la REVISIÓN 2

Verificado: `npm run build` código 0 · `node scripts/aceptacion.mjs` **14/14 en verde** ·
capturas en `scripts/capturas/tanda1/`. **Falta que Carlos lo abra en su teléfono.**

- [x] **1. Hub sin scroll.** `.hub` a `height: 100svh; overflow: hidden`. Escalas y espacios
      pasados a `clamp` contra `svh`. **0 px de desbordamiento en 390×844, 375×667 y 430×932.**
      No se recortó ni se resumió nada del texto de Carlos.
- [x] **2. Retrato circular mediano.** 133 px a 390×844, sin aro ni marco. Trampa encontrada:
      `radial-gradient(circle, …)` usa `farthest-corner` y la máscara no recortaba — hace falta
      `closest-side`. Y hace falta `scale` porque foto y círculo son cuadrados y `cover` no recorta.
- [x] **3. Fuera el óvalo.** Eran **TRES**, no dos: la viñeta y la calma del shader, más un
      `::before` con `border-radius: 42%` en `.rama__contenido` que no estaba documentado y era el
      más visible. Los tres eliminados. Los glows de esquina de `.rama::before` se movieron fuera
      del lienzo para que no dibujen globos.
- [x] **4. Logo de Blindafón a color.** Quitado el `brightness(0) invert(1)`. A color tal cual el
      azul marino se perdía, así que va con `brightness(1.45) saturate(1.15)` —opción B—
      **provisional hasta que Carlos elija** entre las cuatro de
      `scripts/capturas/logo-blindafon/`.
- [x] **5. Ramas redistribuidas.** `justify-content: space-between` en `.rama__contenido`: el hueco
      entre las redes y el dock baja de **~190 px a 20–55 px**. Logo centrado y rol más separado.

## TANDA 2 — HECHA (2026-08-05). Tareas 6 a 9

Verificado: `npm run build` código 0 · `node scripts/aceptacion.mjs` **14/14 en verde** ·
capturas en `scripts/capturas/tanda2/`, `scripts/capturas/transicion/` y
`scripts/capturas/tipografia/`. **Falta que Carlos lo abra en su teléfono.**

- [x] **6. Botones, con presencia y sin cajas.** El recurso nuevo es el **filete vivo**: la línea
      de 1 px que ya separaba las filas pasa a ser un `::after` que la luz del giroscopio
      RECORRE. La presencia sale de que la línea esté viva, no de un rectángulo debajo del texto.
      Agendar: de 3.75 a 4.25 rem, tipografía a 1.0625 rem, los dos filetes vivos en el acento de
      la marca, icono con glow y flecha que avanza al tocar. Redes: icono de 1.25 → 1.5 rem, color
      de 62 → 82 %, área táctil 48 px y halo de trazo. Dock: filete superior vivo y entrada propia.
- [x] **7. La luz atraviesa la pieza entera.** `src/lib/luzCss.ts` publica `--luz-x/y/px/py` en
      `<html>`. **Se alimenta del valor que el bucle del relieve YA calculó**, no de un bucle
      propio: `leer()` integra el resorte, así que llamarlo dos veces por frame habría alterado la
      dinámica que Carlos cerró (OMEGA 14, 12°). El retrato lleva un brillo que cruza su
      superficie — **no un aro**. Entradas escalonadas de la rama a 60 ms, y todo congelado con
      `prefers-reduced-motion`.
- [x] **8. Tipografía: CERRADA — Carlos eligió Syne** el 2026-08-05, sobre Newsreader y Bricolage
      Grotesque. Aplicada en `tokens.css` (`--display-hub`, peso 700) y `main.tsx` (pesos 400, 600
      y 700). Fraunces desinstalada. Efecto secundario aceptado: el nombre pasa a dos líneas.
- [x] **9. `Transicion.tsx` reescrito**, y aquí apareció un fallo real — ver abajo.

### El fallo que salió al revisar la transición

El retrato viajaba de una pantalla a otra hasta convertirse en la insignia circular de esquina.
El destino de ese viaje era `.rama__retrato`, **un elemento que `Rama.tsx` ya no renderiza**. Al ir
de hub a rama, `esperarRetrato` lo buscaba 750 ms, no lo encontraba, se rendía y **salía sin
ejecutar la transición**: la revelación circular y la interpolación de paleta no ocurrían en el
sentido de entrada, y en su lugar había un salto seco precedido de tres cuartos de segundo
congelado. De rama a hub sí funcionaba, y por eso pasaba desapercibido.

Al quitar el viaje del retrato desaparecen la espera, el elemento viajero y el único camino por el
que la transición podía no ejecutarse. Verificado: 80 fotogramas de `clip-path` circular creciendo
de 0 a 668 px en ~900 ms, con el primero a 54 ms del toque.

**Y al arreglarlo salió un segundo fallo, que el primero tapaba:** las dos pantallas se veían
superpuestas, como una doble exposición. La copia congelada es opaca pero la aplicación nueva es
transparente. Se resuelve recortando la copia congelada con el NEGATIVO del círculo. No se resolvió
pintándole un fondo sólido a la pantalla nueva, que habría tapado el relieve durante los 900 ms.

## Lo que hay que preguntarle a Carlos

1. **Qué opción de logo de Blindafón** quiere (A/B/C/D en `scripts/capturas/logo-blindafon/`).
   Puesta la B, provisional.
2. ~~Qué tipografía~~ **RESUELTO: Syne**, 2026-08-05.
3. **El aire del hub** entre la tesis y la pregunta. Con Syne se redujo, porque el nombre ocupa dos
   líneas y la pregunta también. Volver a medirlo cuando Carlos lo vea.

## Lo que sigue pendiente de verdad

- **La aprobación de Carlos en su teléfono.** Sin esto nada está terminado.
- **Fase 3 del plan original — las hojas inferiores.** `HojaAgendar.tsx` y `Compartir.tsx` siguen
  sin revisar, con paneles de borde, esquinas de 1 rem y sombras planas. No entraban en las nueve
  tareas de la REVISIÓN 2, pero son lo único visual que queda con la estética antigua.
- **Limpieza.** `src/lib/paleta.ts` y `src/config/paleta.ts` conviven y parecen solaparse.
  Los dos laboratorios de `public/` se borran cuando Carlos cierre la tipografía.

---

## Objetivo

Cerrar los pendientes de la capa visual que Claude dejó a medias, sin reabrir ninguna decisión ya
tomada, y dejar la tarjeta lista para que Carlos la apruebe en su teléfono.

## Antes de tocar nada

Lee, en este orden: `AGENTS.md`, `DIRECCION-DE-ARTE.md` y `DISENO.md` §7-bis.

**`DIRECCION-DE-ARTE.md` manda sobre el aspecto.** Si algo del código lo contradice, gana el
documento. Si el documento contradice a `DISENO.md`, gana `DIRECCION-DE-ARTE.md`: es posterior y
recoge dos cambios de criterio de Carlos.

### Reglas que no se negocian

1. **Ni una caja.** Ningún elemento lleva fondo propio, borde y esquinas redondeadas para
   separarse del relieve. Ni el retrato, ni el texto, ni los botones, ni los logos, ni los datos.
   Se separan con **luz y sombra** (`--halo`, `--halo-cerrado`). Se acaba de eliminar una por una:
   no se reintroduce ninguna.
2. **No se tocan los valores del fondo.** `src/webgl/relieve.glsl.ts` y `src/lib/inclinacion.ts`
   llevan números que Carlos cerró probando en su teléfono. Están listados en
   `DIRECCION-DE-ARTE.md` §2. Cambiarlos requiere que Carlos lo pida.
3. **Nunca inventar** un teléfono, un correo, un precio ni una métrica.
4. **No desplegar.** Nada de `vercel deploy` sin que Carlos lo pida.

### Cómo se verifica

```
npm run build
npm run dev:https                                        # HTTPS en 5193, hace falta para iOS
node scripts/aceptacion.mjs https://192.168.101.6:5193   # 14 comprobaciones
node scripts/mirar.mjs https://192.168.101.6:5193 scripts/capturas/despues
```

`scripts/aceptacion.mjs` tiene que seguir dando **14/14 en verde** al terminar cada fase.

**Un QA headless no aprueba diseño.** Mide desbordamiento, errores y movimiento reducido. La
aprobación la da Carlos abriéndolo en su teléfono. Ya se cometió ese error una vez: `ESTADO.md`
llegó a decir que la tarjeta estaba «aprobada para entrega» cuando Carlos ni la había visto.

---

## Fase 1 — La transición entre marcas

`src/components/Transicion.tsx` (305 líneas) **no se ha revisado** y es el único componente de la
capa visual que sigue como estaba. Encoge el retrato hasta «una insignia de esquina», que es
justamente el avatar circular que se acaba de eliminar de las ramas.

- [ ] Leer `Transicion.tsx` entero y localizar qué hace con el retrato.
- [ ] La revelación circular enmascarada **se conserva**: es el momento que Carlos quiere que la
      gente recuerde (`DISENO.md` §7.1).
- [ ] El retrato **no** debe acabar convertido en una insignia circular de esquina. Debe
      desvanecerse durante la transición: en la rama el retrato no existe.
- [ ] Verificar que la interpolación de paleta sigue funcionando: fondo, acentos y `theme-color`.
- [ ] **Aceptación:** grabar la transición hub → ALSAI → hub con `scripts/mirar.mjs` adaptado, o
      capturar tres fotogramas. No debe aparecer ningún círculo con borde en ningún momento.

## Fase 2 — El hueco de la rama y el ritmo vertical

- [ ] En `?m=alsai` queda aire de más entre «Agendar una llamada» y los enlaces de redes. En
      Blindafón se nota menos porque tiene el dato de prueba. Revisar `.rama__contenido` en
      `src/components/Rama.css` y repartir el espacio para que no se lea a página sin terminar.
- [ ] No rellenar el hueco con elementos nuevos: se ajusta el ritmo, no se añade contenido.
- [ ] **Aceptación:** capturas de las dos ramas a 390×844 sin bolsas de vacío mayores que un
      tercio de la pantalla.

## Fase 3 — Las hojas inferiores

`HojaAgendar.tsx` y `Compartir.tsx` abren hojas inferiores que **no se han revisado** y siguen con
la estética antigua: paneles con borde, esquinas de 1rem y sombras planas.

- [ ] Aplicarles la dirección de arte. Una hoja modal **sí** puede tener superficie propia —es un
      plano por encima, no un elemento sobre el relieve—, pero debe usar `--sombra` multicapa,
      `1px solid var(--line)` y nada de `border-radius` de plantilla.
- [ ] El QR de `Compartir.tsx` debe seguir decodificando la URL exacta.
- [ ] **Aceptación:** abrir las dos hojas en las dos ramas y capturar. Sin errores de consola.

## Fase 4 — La tipografía que elija Carlos

Hoy está puesta **Instrument Serif**, que es la recomendación de Claude, pero Carlos todavía no ha
elegido. El comparador está en `https://192.168.101.6:5193/lab-tipografia.html`.

- [ ] Cuando Carlos diga cuál quiere, cambiar **solo dos sitios**:
      `--display-hub` y `--display-hub-peso` en `src/styles/tokens.css`, y el `import` de
      `@fontsource/...` en `src/main.tsx`.
- [ ] Las tres candidatas ya están instaladas. Desinstalar las dos descartadas con `npm uninstall`
      para no cargar peso muerto.
- [ ] **No tocar** `--display-marca`: las ramas siguen en Space Grotesk. Es parte de la bifurcación.

## Fase 5 — Limpieza

- [ ] `src/lib/paleta.ts` y `src/config/paleta.ts` conviven y parecen solaparse. Comprobar si uno
      de los dos quedó huérfano tras la reescritura y, si es así, eliminarlo.
- [ ] Los laboratorios `public/lab-fondo.html` y `public/lab-tipografia.html` **se quedan** hasta
      que Carlos cierre la tipografía. Después se borran: no deben acabar en producción.
      Comprobar que `public/sitemap.xml` y `robots.txt` no los referencian.
- [ ] `npm run build` y revisar que el bundle no se haya disparado con las tres fuentes.

---

## Pendientes que necesitan a Carlos — no los resuelvas tú

1. **La tipografía del hub.** Fase 4.
2. ~~**El logo de Blindafón.**~~ **RESUELTO el 2026-08-05:** Carlos entregó un activo nuevo y ya
   sustituyó `public/blindafon.webp` — cohete-teléfono azul marino con llama naranja. Al llevar
   naranja luminoso, el `filter: brightness(0) invert(1)` de `Rama.css` sobra y hay que quitarlo.
   Ver `DIRECCION-DE-ARTE.md` § REVISIÓN 2.
3. **El retrato.** `public/carlos.webp` está tomado sobre fondo de estudio claro. Se hunde con
   brillo bajo y un tinte de la marca, y funciona, pero una foto sobre fondo oscuro o recortada
   daría bastante más calidad. Es decisión suya si quiere hacerla.
4. **Rol en Blindafón:** `tarjeta.ts` dice «Fundador» y sigue sin confirmarse.
5. **Vercel y DNS.** `vercel login` lo tiene que hacer Carlos, y el registro A `carlos` →
   `76.76.21.21` en Namecheap también. Ningún agente toca DNS.

---

## Qué NO tocar

- `src/config/tarjeta.ts` — la fuente única de datos. Correcta y verificada.
- `src/lib/vcard.ts`, `haptica.ts`, `analitica.ts`, `qr.ts`, `origen.ts` — la plomería funciona.
- `src/estado/useMarca.ts` y el `<head>` de `index.html`.
- Los valores del fondo (regla 2 de arriba).
- `DIRECCION-DE-ARTE.md`, salvo para añadir decisiones nuevas de Carlos, fechadas.

## Riesgos y reversa

- Todo el trabajo visual está en commits desde `0587e7e`. `git revert` de un commit concreto
  deshace una parte sin perder el resto.
- Vuelta completa al estado anterior: `git checkout 42421ba -- src/`. Se pierde la capa visual
  nueva entera, incluido el fondo aprobado — solo si Carlos lo pide expresamente.
- El riesgo real de estas fases es **reintroducir cajas** al retocar CSS antiguo. Ante la duda,
  regla 1.
