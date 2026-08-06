/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LA LUZ, EN CSS. Publica la dirección de la luz del relieve como variables
 *  CSS en <html>, para que los botones y el retrato la puedan usar.
 *
 *  POR QUÉ ASÍ Y NO CON UN BUCLE PROPIO. La tentación es crear otro
 *  requestAnimationFrame que llame a `obtenerInclinacion().leer(dt)`. Sería un
 *  error: `leer()` INTEGRA el resorte, así que llamarlo dos veces por frame lo
 *  integra dos veces y cambia la dinámica del fondo — justo los valores que
 *  Carlos cerró probando en su teléfono (OMEGA 14, 12°).
 *
 *  En vez de eso, el publicador se alimenta del valor que el bucle del relieve
 *  YA calculó. No es un efecto pegado encima que imita al fondo: es el mismo
 *  número, el mismo frame. Es lo que hace que la luz se sienta atravesar la
 *  pieza entera en lugar de que cada elemento brille por su cuenta.
 *
 *  Si el WebGL no llega a montarse, las variables se quedan en 0 y todo lo que
 *  las consume cae a un estado neutro. Nunca se avisa de nada.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Umbral por debajo del cual no se reescribe el estilo. */
const MINIMO = 0.004;

let ultimaX = 0;
let ultimaY = 0;
let escrito = false;

/**
 * Escribe la dirección de la luz (-1..1 en los dos ejes) en <html>.
 * Se llama una vez por frame desde el bucle del relieve.
 *
 * Escribe solo cuando el valor se mueve de verdad: en reposo —y con
 * `prefers-reduced-motion`, donde el valor no cambia nunca— no se toca el DOM
 * y no se provoca un recálculo de estilo por frame.
 */
export function publicarLuz(x: number, y: number): void {
  if (escrito && Math.abs(x - ultimaX) < MINIMO && Math.abs(y - ultimaY) < MINIMO) return;

  ultimaX = x;
  ultimaY = y;
  escrito = true;

  const raiz = document.documentElement.style;
  raiz.setProperty('--luz-x', x.toFixed(3));
  raiz.setProperty('--luz-y', y.toFixed(3));

  /* Las mismas dos cifras ya listas para usar como posición dentro de una caja,
     en porcentaje. Se calculan aquí y no en CSS porque `calc()` dentro de un
     degradado repetido en varios sitios se vuelve ilegible enseguida.
     El eje Y va invertido: en el shader `v` crece hacia abajo, en CSS no. */
  raiz.setProperty('--luz-px', `${(50 + x * 42).toFixed(1)}%`);
  raiz.setProperty('--luz-py', `${(50 - y * 42).toFixed(1)}%`);
}
