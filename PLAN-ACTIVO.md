# PLAN ACTIVO — Cerrar la capa visual de la tarjeta

**Estado:** `listo_para_codex`
**Escrito por Claude Code · 2026-08-05 (noche)**
**Punto de retorno:** commit `42421ba`. La capa visual nueva va de `0587e7e` a `f33c7b4`.

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
2. **El logo de Blindafón.** Es azul marino sobre transparente y sobre fondo oscuro desaparece.
   Ahora se fuerza a blanco con `filter: brightness(0) invert(1)`, lo que **sacrifica el naranja**.
   Si Carlos lo quiere a color hace falta una versión de `public/blindafon.webp` preparada para
   fondo oscuro. **No es resoluble desde CSS.**
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
