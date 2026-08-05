# Sistema de diseño — Tarjeta digital de Carlos Álvarez

La razón de cada decisión está en `DISENO.md`, en esta misma carpeta.
Aquí solo van los valores. Todos viven en `src/styles/tokens.css`; **ningún hex fuera de ahí**.

## Color

La marca activa se declara como atributo en `<html>`: `data-marca="hub|alsai|blindafon"`.
Cada bloque redefine las mismas cuatro variables semánticas, así que los componentes nunca
preguntan en qué marca están.

```css
:root {
  /* Invariantes de la pieza */
  --void:  #05070D;   /* lienzo, neutro y casi negro. NUNCA #000 puro */
  --bone:  #F2F0EB;   /* texto principal */
  --mute:  #8A93A6;   /* texto secundario */
  --line:  rgba(242,240,235,0.10);

  /* Semánticas — el hub */
  --fondo:   var(--void);
  --acento:  #C8CEDA;              /* platino: ni frío ni cálido */
  --acento-2:#7C8698;
  --glow:    rgba(200,206,218,0.28);
}

[data-marca="alsai"] {
  --fondo:   #040A16;              /* token real de la tarjeta ALSAI */
  --acento:  #37E2E4;              /* cian ALSAI */
  --acento-2:#1B8F9B;
  --glow:    rgba(55,226,228,0.32);
}

[data-marca="blindafon"] {
  --fondo:   #0A0E18;              /* black-deep, token real de Blindafón */
  --acento:  #F18B3B;              /* naranja Blindafón */
  --acento-2:#4FC3FF;              /* blue-glow, solo en acentos WebGL */
  --glow:    rgba(241,139,59,0.30);
}
```

**Blindafón no va en cream** aquí. Su sitio vive en `#F5F1EA`, pero un flashazo blanco después de
un hub oscuro es agresivo de noche —y la tarjeta se entrega de noche— y rompe la sensación de una
sola pieza. `#0A0E18` es igual de suyo: es el fondo de sus secciones dramáticas.

Contraste: `--bone` sobre cualquiera de los tres fondos supera AA. Los acentos **nunca** se usan
para texto de párrafo, solo para títulos cortos, bordes, iconos y glow.

## Tipografía

```
Display:  Space Grotesk  (500, 700)   — es la display de ALSAI y de Blindafón
Cuerpo:   Inter          (400, 500, 600)
```

Self-hosted con `@fontsource`, subconjunto latino. **Sin CDN de Google Fonts.**

| Rol | Tamaño | Interlineado | Tracking |
|---|---|---|---|
| Nombre (hub) | `clamp(2.75rem, 12vw, 4rem)` | 0.95 | -0.035em |
| Título de rama | `clamp(2rem, 9vw, 3rem)` | 1.0 | -0.03em |
| Tesis / descripción | `clamp(1.0625rem, 4.2vw, 1.25rem)` | 1.55 | 0 |
| Cuerpo | `1rem` | 1.6 | 0 |
| Etiqueta | `0.8125rem` | 1.4 | +0.08em, mayúsculas |

**Regla dura:** los títulos siempre con tracking negativo. Nunca tracking positivo en un heading.

## Espaciado — sistema de 8 px

```css
--e-xs: .5rem;  --e-sm: 1rem;   --e-md: 1.5rem;
--e-lg: 2.5rem; --e-xl: 4rem;   --e-2xl: 6rem;
```

Padding lateral en móvil: `1.25rem`. El dock de acciones respeta
`padding-bottom: max(1rem, env(safe-area-inset-bottom))`.

## Profundidad

Nada de sombras planas. Siempre multicapa, y sobre fondo oscuro se apoyan en el glow de la marca:

```css
--sombra: 0 1px 2px rgba(0,0,0,.40),
          0 8px 24px rgba(0,0,0,.32),
          0 24px 64px rgba(0,0,0,.28);
--realce: inset 0 1px 0 rgba(242,240,235,.06);
```

Bordes siempre translúcidos: `1px solid var(--line)`. Nunca un borde sólido.

## Movimiento

```css
--sal: cubic-bezier(0.16, 1, 0.3, 1);   /* el único easing por defecto */
--t-micro: 240ms;    /* botones, hover, foco */
--t-medio: 420ms;    /* entradas de contenido */
--t-marca: 900ms;    /* la bifurcación hub ↔ rama */
```

- Nunca `ease` ni `ease-in-out` por defecto: es la firma de una web genérica.
- Solo se animan `transform` y `opacity`. Nada que provoque *layout*.
- Nada dura más de 1 s. Si algo lo necesita, el diseño está mal.
- Entradas escalonadas: 60 ms entre elementos, máximo 5 — a partir de ahí se siente lento.

```css
@media (prefers-reduced-motion: reduce) {
  /* sin WebGL, sin giroscopio, sin parallax.
     Los cambios de estado pasan a ser un fundido de 150 ms. */
}
```

## Táctil

- Objetivo mínimo 44×44 px; los botones de marca del hub, 88 px de alto.
- Las dos acciones principales de cada rama viven en un dock fijo abajo: nunca hay que hacer
  scroll para llegar a ellas.
- `:active` con `scale(0.97)` y 120 ms. En móvil no hay hover; el feedback de presión sí se siente.
- `-webkit-tap-highlight-color: transparent` y foco visible propio.

## Antipatrones

Cosas que **no** van en esta tarjeta:

- Emojis como iconos.
- Degradados morado-a-rosa. La pieza es fría o cálida según la marca, nunca "de plantilla".
- Texto centrado en párrafos largos.
- Sombras planas `0 4px 6px rgba(0,0,0,.1)`.
- Botones de ancho completo con esquinas de 4 px: se leen a formulario, no a tarjeta premium.
- Contadores animados, marquesinas, ni un solo `alert()`.
