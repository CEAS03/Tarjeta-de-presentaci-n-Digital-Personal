/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  EL RELIEVE — el fondo de la tarjeta.
 *
 *  Especificación y valores cerrados en DIRECCION-DE-ARTE.md §2.
 *  Portado desde `public/lab-fondo.html`, que es donde Carlos ajustó los
 *  números con el dedo en su teléfono el 2026-08-05. Si algo aquí deja de
 *  parecerse al laboratorio, el que está mal es este archivo.
 *
 *  QUÉ CAMBIÓ RESPECTO A LA VERSIÓN RECHAZADA — importa entenderlo:
 *
 *    · Aquella dibujaba isolíneas de un ruido fbm 2D. Eso da contornos
 *      irregulares en todas direcciones, sin orden, y se leía a «rayas densas
 *      y duras sin sentido». Era el problema, no los parámetros.
 *    · Esta dibuja LÍNEAS HORIZONTALES APILADAS desplazadas por un campo de
 *      altura de dos senos cruzados. El orden es lo que da el aire de
 *      instrumento, de mapa topográfico.
 *    · La luz ilumina cada tramo según la NORMAL 2D DE SU CURVA (especular
 *      anisotrópico), no según la normal 3D de una superficie. Es lo que hace
 *      que el brillo RECORRA en vez de encenderse y apagarse.
 *    · Fuera el halo radial: era una mancha que seguía a la luz, justo lo que
 *      Carlos ya había descartado del cromo líquido.
 *
 *  LA INVERSIÓN que hace posible dibujar líneas en un fragment shader: en vez
 *  de recorrer las líneas y trazarlas (como haría un canvas 2D), para cada
 *  píxel se calcula A QUÉ LÍNEA pertenece resolviendo la altura hacia atrás.
 *  fract() da la distancia a la línea más cercana; fwidth() mantiene el grosor
 *  constante en pantalla, que es lo que evita que se emplasten.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const VERT = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const FRAG = /* glsl */ `
#extension GL_OES_standard_derivatives : enable
precision highp float;

varying vec2 vUv;

uniform vec2  uRes;
uniform float uTiempo;
uniform vec2  uLuz;       // dirección de la luz, YA amortiguada (-1..1). Ver lib/inclinacion.ts
uniform vec3  uFondo;
uniform vec3  uAcento;
uniform vec3  uAcento2;
uniform float uGrosor;    // en píxeles de DISPOSITIVO: el JS ya multiplicó por el dpr

/* Los valores que cerró Carlos. Constantes a propósito: no son ajustables en
   producción, se ajustaron en el laboratorio y aquí ya están decididos. */
const float DENS    = 33.0;
const float NITIDEZ = 0.70;
const float POT     = 4.5;
const float RELIEVE = 0.04;
const float PISO    = 0.01;

/* Campo de altura: dos senos cruzados. NADA de fbm — el ruido fue lo rechazado. */
float campo(float u, float v, float t) {
  return sin(u * 4.2 + t * 0.28) * cos(v * 3.6 - t * 0.20)
       + sin((u + v) * 5.1 - t * 0.16) * 0.55;
}

/* Derivada analítica respecto a u: la pendiente de la curva en ese punto. */
float pendiente(float u, float v, float t) {
  return 4.2 * cos(u * 4.2 + t * 0.28) * cos(v * 3.6 - t * 0.20)
       + 5.1 * 0.55 * cos((u + v) * 5.1 - t * 0.16);
}

void main() {
  vec2  uv = vUv;
  float u  = uv.x;
  float v  = 1.0 - uv.y;      /* v crece hacia abajo, como en la maqueta */
  float t  = uTiempo;

  /* La luz desplaza el apilado verticalmente. */
  float desplaz = uLuz.y * 0.026;

  /* LA CALMA — ELIMINADA el 2026-08-05 por decisión de Carlos.
     Aplanaba y apagaba el relieve de la mitad inferior con un smoothstep. Sumada
     a la viñeta de abajo, las dos juntas dibujaban una mancha ovalada oscura
     sobre el relieve: «le pusiste como un óvalo en toda la pantalla, se ve súper
     feo». La legibilidad la resuelve SOLO el halo del texto (--halo), que ya se
     verificó que aguanta sin ayuda del fondo. */
  float ampEf = RELIEVE;

  /* Índice de línea continuo. Los enteros son las líneas. */
  float S  = ((v - 0.02 - campo(u, v, t) * ampEf - desplaz) / 0.98) * DENS;
  float f  = fract(S);
  float d  = min(f, 1.0 - f);
  float w  = max(fwidth(S), 1e-6);
  float dPx = d / w;          /* la misma distancia, ya en píxeles */

  /* Normal 2D de la curva, en píxeles. */
  float dyduPx = pendiente(u, v, t) * ampEf * uRes.y;
  vec2  n = normalize(vec2(-dyduPx, uRes.x));

  /* UNA luz. El eje Y va invertido respecto a uLuz porque aquí v crece hacia
     abajo. El -0.55 es el sesgo hacia arriba: sin él la luz se queda centrada
     y el barrido no se percibe. */
  vec2  L  = normalize(vec2(uLuz.x * 1.1, -uLuz.y * 1.1 - 0.55) + vec2(1e-5));
  float sp = pow(abs(dot(n, L)), POT);

  /* El brillo engorda la línea: es lo que hace que la luz se sienta recorrer. */
  float grosorPx = uGrosor * (1.0 + sp * 1.5);
  float mitad    = grosorPx * 0.5;
  float suave    = mix(1.30, 0.28, NITIDEZ);
  float linea    = 1.0 - smoothstep(mitad, mitad + suave, dPx);

  /* El recorrido de color que eligió Carlos: acento-2 → acento → blanco. */
  vec3 col = sp > 0.35
    ? mix(uAcento, vec3(1.0), clamp((sp - 0.35) * 1.5, 0.0, 1.0))
    : mix(uAcento2, uAcento, clamp(sp * 2.2, 0.0, 1.0));

  float alfa = PISO + sp * 0.80;
  vec3 salida = uFondo + linea * col * alfa;

  /* LA VIÑETA — ELIMINADA el 2026-08-05, misma razón que la calma. Era un
     smoothstep sobre la distancia al punto (0.5, 0.55) que hundía los
     bordes hasta el 50 %: una elipse centrada y desplazada, con forma
     perfectamente reconocible. No se sustituye por otra atenuación: cualquier
     cosa con centro vuelve a dibujar una forma. El relieve llega igual de vivo a
     los cuatro bordes, que es lo que pide la idea rectora — una superficie que
     no se recorta nunca. */

  /* Grano: mata el bandeo en degradados oscuros sobre OLED. */
  salida += (fract(sin(dot(gl_FragCoord.xy, vec2(127.1, 311.7))) * 43758.5) - 0.5) * 0.010;

  gl_FragColor = vec4(salida, 1.0);
}
`;
