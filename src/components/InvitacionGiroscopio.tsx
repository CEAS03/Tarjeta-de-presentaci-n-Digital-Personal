import { useEffect, useState } from 'react';
import { obtenerInclinacion } from '../lib/inclinacion';
import './InvitacionGiroscopio.css';

/**
 * La invitación del giroscopio. Ver DIRECCION-DE-ARTE.md §8.
 *
 * El diálogo de permiso de iOS NO se puede customizar: lo dibuja el sistema y
 * saldrá siempre, también en producción. Lo que sí controlamos es lo de antes
 * y lo de después.
 *
 *   ANTES   una invitación propia y discreta. Quien la toca ya sabe qué le van
 *           a preguntar y por qué, así que el diálogo de Apple deja de sentirse
 *           aleatorio y lo acepta mucha más gente.
 *   NUNCA   al cargar: un diálogo del sistema en la cara al abrir por NFC
 *           arruina la entrada, y además iOS lo rechaza sin gesto del usuario.
 *   DESPUÉS si lo conceden, se va con un fundido. Si lo DENIEGAN, se va
 *           exactamente igual: sin mensaje de error, sin reintento, sin
 *           explicación. Queda la órbita automática y nadie se entera.
 *
 * En Android no se monta nunca: no hay permiso que pedir.
 */
export function InvitacionGiroscopio() {
  const [visible, setVisible] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const inclinacion = obtenerInclinacion();
    // Solo iOS 13+. Y si el sensor ya está entregando datos, no hay nada que pedir.
    if (!inclinacion.necesitaPermiso() || inclinacion.hayGiroscopio()) return;
    const t = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const retirar = () => {
    setSaliendo(true);
    setTimeout(() => setVisible(false), 420);
  };

  const activar = () => {
    // El resultado no cambia lo que se muestra: concedido o denegado, la
    // invitación se retira igual. Nunca se avisa de que faltó el permiso.
    void obtenerInclinacion().pedirPermiso().finally(retirar);
  };

  return (
    <button
      className={`invitacion-giro${saliendo ? ' invitacion-giro--sale' : ''}`}
      type="button"
      onClick={activar}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
        <rect
          x="7.5"
          y="2.5"
          width="9"
          height="19"
          rx="2.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M3.4 8.6a7 7 0 0 0 0 6.8M20.6 8.6a7 7 0 0 1 0 6.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <span>Mueve el teléfono para ver la luz</span>
    </button>
  );
}

export default InvitacionGiroscopio;
