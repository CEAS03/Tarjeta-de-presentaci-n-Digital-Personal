/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Dirección de la luz del relieve, a partir de cómo está inclinado el teléfono.
 *
 *  VALORES CERRADOS POR CARLOS EL 2026-08-05 probando en su teléfono.
 *  Ver DIRECCION-DE-ARTE.md §2. No se cambian sin él.
 *
 *  OJO — esto REVIERTE la decisión anterior de «inercia larga» (OMEGA 1.4).
 *  Aquella daba un asentamiento de ~3.3 s y Carlos lo describió así: «cuando
 *  muevo el teléfono se tarda como un segundo o un segundo y medio en
 *  reaccionar la luz». No se percibía como un barrido, sino como un retraso.
 *
 *  El resorte NO se elimina: sin él la señal del sensor tiembla y las líneas
 *  dan tirones. Solo pasa a ser rápido.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Rigidez del resorte. Asentamiento ≈ 4.6/ω ≈ 0.33 s. */
const OMEGA = 14;

/**
 * Grados de inclinación para el recorrido completo de la luz.
 * 12°, no 32°: «la gente, al agarrar el teléfono, casi no lo mueve; lo mueven
 * apenas para identificar que funciona con el giroscopio» (Carlos).
 */
const GRADOS = 12;

export type Inclinacion = {
  /** Lee la dirección amortiguada. Llamar una vez por frame con el dt en segundos. */
  leer(dt: number): { x: number; y: number };
  /** true en cuanto el sensor entrega el primer dato válido. */
  hayGiroscopio(): boolean;
  /** Pide el permiso de iOS. Debe llamarse DENTRO de un gesto del usuario. */
  pedirPermiso(): Promise<boolean>;
  /** ¿Este dispositivo exige permiso explícito? Solo iOS 13+. */
  necesitaPermiso(): boolean;
  destruir(): void;
};

/**
 * Instancia única. La comparten el fondo WebGL y la invitación del giroscopio:
 * si cada uno creara la suya, el permiso concedido desde la invitación no
 * llegaría nunca al sensor que alimenta al fondo.
 */
let compartida: Inclinacion | null = null;

export function obtenerInclinacion(): Inclinacion {
  if (!compartida) compartida = crearInclinacion();
  return compartida;
}

export function crearInclinacion(): Inclinacion {
  const destino = { x: 0, y: 0 };
  const actual = { x: 0, y: 0 };
  const vel = { x: 0, y: 0 };

  let hayGiro = false;
  let hayPuntero = false;
  let t = 0;

  /**
   * AUTOCALIBRADO. La primera lectura del sensor se toma como el centro.
   * Con un centro fijo (antes: beta = 45°) la luz arrancaba descentrada según
   * cómo sostuviera el teléfono cada persona.
   */
  let centro: { gamma: number; beta: number } | null = null;

  const onOrient = (e: DeviceOrientationEvent) => {
    if (e.gamma === null || e.beta === null) return;
    if (!centro) centro = { gamma: e.gamma, beta: e.beta };
    hayGiro = true;
    destino.x = Math.max(-1, Math.min(1, (e.gamma - centro.gamma) / GRADOS));
    destino.y = Math.max(-1, Math.min(1, (e.beta - centro.beta) / GRADOS));
  };

  const onPuntero = (e: PointerEvent) => {
    if (hayGiro) return;
    hayPuntero = true;
    destino.x = (e.clientX / window.innerWidth) * 2 - 1;
    destino.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  window.addEventListener('deviceorientation', onOrient);
  window.addEventListener('pointermove', onPuntero);

  const DOE = window.DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<PermissionState | string>;
  };

  return {
    leer(dt: number) {
      t += dt;

      // Sin giroscopio y sin puntero: órbita lenta. El fondo nunca parece roto,
      // y nunca se avisa de que faltó el permiso.
      if (!hayGiro && !hayPuntero) {
        destino.x = Math.cos(t * 0.22) * 0.55;
        destino.y = Math.sin(t * 0.17) * 0.45;
      }

      const paso = Math.min(dt, 0.05); // protege el resorte si la pestaña estuvo dormida

      // Con OMEGA alto el resorte se vuelve rígido: si no se subdivide el paso,
      // el integrador explota y la luz da tirones en vez de moverse.
      const subpasos = Math.max(1, Math.ceil(OMEGA * paso * 4));
      const h = paso / subpasos;

      for (let i = 0; i < subpasos; i++) {
        for (const eje of ['x', 'y'] as const) {
          const a = OMEGA * OMEGA * (destino[eje] - actual[eje]) - 2 * OMEGA * vel[eje];
          vel[eje] += a * h;
          actual[eje] += vel[eje] * h;
        }
      }
      return { x: actual.x, y: actual.y };
    },

    hayGiroscopio: () => hayGiro,

    necesitaPermiso: () => typeof DOE?.requestPermission === 'function',

    /**
     * iOS 13+ exige un gesto del usuario. Se pide desde la invitación, nunca al
     * cargar: al cargar falla en silencio, y además un diálogo del sistema nada
     * más abrir por NFC arruina la entrada.
     */
    async pedirPermiso() {
      if (typeof DOE?.requestPermission !== 'function') return true;
      try {
        return (await DOE.requestPermission()) === 'granted';
      } catch {
        return false;
      }
    },

    destruir() {
      window.removeEventListener('deviceorientation', onOrient);
      window.removeEventListener('pointermove', onPuntero);
    },
  };
}
