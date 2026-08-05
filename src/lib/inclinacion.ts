/**
 * Dirección de la luz del relieve, a partir de cómo está inclinado el teléfono.
 *
 * La regla que da la sensación: la luz NO sigue al gesto, llega DESPUÉS.
 * Con un suavizado corto el destello se pasa de largo al mover rápido y no se
 * alcanza a percibir. Con un resorte amortiguado de ~1.2 s, la luz *recorre*
 * la pantalla. Ver DISENO.md §7-bis.
 */

const OMEGA = 2.6; // rad/s — resorte críticamente amortiguado, asiento ≈ 1.4 s

export type Inclinacion = {
  /** Lee la dirección amortiguada. Llamar una vez por frame con el dt en segundos. */
  leer(dt: number): { x: number; y: number };
  destruir(): void;
};

export function crearInclinacion(): Inclinacion {
  const destino = { x: 0, y: 0 };
  const actual = { x: 0, y: 0 };
  const vel = { x: 0, y: 0 };

  let hayGiroscopio = false;
  let t = 0;

  const onOrient = (e: DeviceOrientationEvent) => {
    if (e.gamma === null || e.beta === null) return;
    hayGiroscopio = true;
    // gamma: inclinación izquierda-derecha. beta: adelante-atrás.
    // Se asume el teléfono sostenido a unos 45°, que es como se mira de pie.
    destino.x = Math.max(-1, Math.min(1, e.gamma / 32));
    destino.y = Math.max(-1, Math.min(1, (e.beta - 45) / 32));
  };

  const onPuntero = (e: PointerEvent) => {
    if (hayGiroscopio) return;
    destino.x = (e.clientX / window.innerWidth) * 2 - 1;
    destino.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  window.addEventListener('deviceorientation', onOrient);
  window.addEventListener('pointermove', onPuntero);

  /**
   * iOS 13+ exige un gesto del usuario para conceder el giroscopio.
   * Se pide en el PRIMER toque, nunca al cargar: al cargar falla en silencio.
   * Si lo niegan no se avisa nada; queda la órbita automática.
   */
  const pedirPermiso = () => {
    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DOE?.requestPermission === 'function') {
      DOE.requestPermission().catch(() => {});
    }
    window.removeEventListener('pointerdown', pedirPermiso);
  };
  window.addEventListener('pointerdown', pedirPermiso, { once: true });

  return {
    leer(dt: number) {
      t += dt;

      // Sin giroscopio y sin ratón (móvil que negó el permiso): órbita lenta.
      // El fondo nunca se queda quieto ni parece roto.
      if (!hayGiroscopio && destino.x === 0 && destino.y === 0) {
        destino.x = Math.cos(t * 0.22) * 0.55;
        destino.y = Math.sin(t * 0.17) * 0.45;
      }

      const paso = Math.min(dt, 0.05); // protege el resorte si la pestaña estuvo dormida
      for (const eje of ['x', 'y'] as const) {
        const a = OMEGA * OMEGA * (destino[eje] - actual[eje]) - 2 * OMEGA * vel[eje];
        vel[eje] += a * paso;
        actual[eje] += vel[eje] * paso;
      }
      return { x: actual.x, y: actual.y };
    },
    destruir() {
      window.removeEventListener('deviceorientation', onOrient);
      window.removeEventListener('pointermove', onPuntero);
      window.removeEventListener('pointerdown', pedirPermiso);
    },
  };
}
