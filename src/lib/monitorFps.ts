/**
 * Vigila el ritmo de cuadros y baja la escala de render si hace falta.
 *
 * NUNCA apaga el fondo. Un fondo un poco menos nítido es aceptable;
 * un fondo ausente rompe la pieza. Ver DISENO.md §8.
 */

const ESCALAS = [1, 0.75, 0.5];

export function crearMonitorFps(alCambiar: (escala: number) => void) {
  let i = 0;
  let media = 60;
  let bajoDesde = 0;

  return function medir(dt: number, ahora: number) {
    if (dt <= 0) return;
    media += (1 / dt - media) * 0.05;

    if (media < 40 && i < ESCALAS.length - 1) {
      if (!bajoDesde) bajoDesde = ahora;
      else if (ahora - bajoDesde > 3000) {
        i++;
        bajoDesde = 0;
        media = 60; // se da margen para evaluar la escala nueva
        alCambiar(ESCALAS[i]);
      }
    } else {
      bajoDesde = 0;
    }
  };
}
