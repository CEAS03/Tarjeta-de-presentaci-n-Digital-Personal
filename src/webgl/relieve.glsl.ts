/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  EL RELIEVE — el fondo de la tarjeta.
 *  Especificación completa en DISENO.md §7-bis. No improvisar sobre esto.
 *
 *  Idea: una superficie de líneas de nivel (topográfica) con el ondulado suave
 *  de la seda, iluminada por UNA sola luz direccional. No hay ningún objeto en
 *  pantalla: ni esfera, ni mancha, ni partículas.
 *
 *  Las ondas se mueven solas. La luz la mueve el teléfono (giroscopio).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const FRAG = /* glsl */ `
#extension GL_OES_standard_derivatives : enable
precision highp float;

varying vec2 vUv;

uniform vec2  uRes;
uniform float uTiempo;
uniform vec2  uLuz;      // dirección de la luz, YA amortiguada (-1..1). Ver lib/inclinacion.ts
uniform vec3  uFondo;
uniform vec3  uAcento;
uniform vec3  uAcento2;
uniform float uCongelado; // 1.0 con prefers-reduced-motion: las ondas se detienen

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),            hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * ruido(p); p *= 2.03; a *= 0.5; }
  return v;
}

/* Campo de altura: la seda pone el ondulado largo, el fbm pone el relieve irregular. */
float altura(vec2 p, float t) {
  float seda = sin(p.x * 2.1 + t * 0.30) * 0.50
             + sin((p.x * 0.7 + p.y * 1.7) * 2.6 - t * 0.21) * 0.30;
  float relieve = fbm(p * 1.10 + vec2(t * 0.040, -t * 0.028)) * 2.0 - 1.0;
  return seda * 0.55 + relieve * 0.90;
}

void main() {
  float aspecto = uRes.x / uRes.y;
  vec2  p = vec2(vUv.x * aspecto, vUv.y) * 3.1;
  float t = uTiempo * (1.0 - uCongelado);

  float h = altura(p, t);

  /* Líneas de nivel. fwidth mantiene el grosor constante en pantalla,
     así no se emplastan donde la pendiente es fuerte. */
  float dens = 9.0;
  float f    = fract(h * dens);
  float d    = min(f, 1.0 - f);
  float w    = fwidth(h * dens);
  float linea = 1.0 - smoothstep(0.0, w * 1.7, d);

  /* Normal del relieve, por diferencias finitas. */
  vec2  e  = vec2(0.0030, 0.0);
  float hx = altura(p + e.xy, t) - altura(p - e.xy, t);
  float hy = altura(p + e.yx, t) - altura(p - e.yx, t);
  vec3  n  = normalize(vec3(-hx, -hy, 0.055));

  /* UNA luz. La mueve el giroscopio, con inercia larga (ver inclinacion.ts). */
  vec3 L = normalize(vec3(uLuz, 0.80));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 Hv = normalize(L + V);

  float difuso = max(dot(n, L), 0.0);
  /* Exponente BAJO a propósito: brillo ANCHO. Uno estrecho parpadea, uno ancho barre.
     Fue la queja concreta de las pruebas: al mover rápido no se alcanzaba a percibir. */
  float spec = pow(max(dot(n, Hv), 0.0), 7.0);

  /* Recorrido de color: acento-2 → acento → blanco en la cresta del brillo. */
  vec3 colLinea = mix(uAcento2, uAcento, clamp(difuso * 1.45, 0.0, 1.0));
  colLinea = mix(colLinea, vec3(1.0), clamp((spec - 0.30) * 1.7, 0.0, 1.0));

  float intensidad = 0.055 + difuso * 0.34 + spec * 0.95;

  vec3 col = uFondo;
  col += linea * colLinea * intensidad;

  /* Halo tenue donde pega la luz: da profundidad sin dibujar ningún objeto. */
  vec2 centroLuz = vec2(0.5 + uLuz.x * 0.32, 0.5 - uLuz.y * 0.32);
  float halo = 1.0 - smoothstep(0.0, 0.85, distance(vUv, centroLuz));
  col += uAcento * halo * halo * 0.055;

  /* Viñeta: hunde los bordes, sube el centro. */
  float vig = smoothstep(1.10, 0.30, distance(vUv, vec2(0.5)) * 1.55);
  col *= mix(0.42, 1.0, vig);

  /* Grano sutil: mata el bandeo en degradados oscuros sobre OLED. */
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.012;

  gl_FragColor = vec4(col, 1.0);
}
`;
