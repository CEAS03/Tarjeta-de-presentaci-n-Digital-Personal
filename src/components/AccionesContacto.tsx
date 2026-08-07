import { enlaceWa, tarjeta, type ClaveMarca } from '../config/tarjeta';
import { haptica } from '../lib/haptica';
import { descargarVcard } from '../lib/vcard';
import { registrarEvento } from '../lib/analitica';
import type { ReactNode } from 'react';

type PropiedadesAccionesContacto = {
  marca: ClaveMarca;
  accionCompartir?: ReactNode;
};

/** Las dos acciones principales, siempre alcanzables dentro del área segura. */
export function AccionesContacto({ marca, accionCompartir }: PropiedadesAccionesContacto) {
  const datos = tarjeta.marcas[marca];
  const { acciones } = tarjeta;

  const guardarContacto = async () => {
    haptica();
    try {
      await descargarVcard(marca);
      registrarEvento('vcard_saved', marca);
    } catch (error) {
      console.error('No se pudo descargar el contacto.', error);
    }
  };

  return (
    <div
      className="acciones-contacto"
      role="group"
      aria-label="Acciones de contacto"
    >
      <div className="acciones-contacto__interior">
        <button
          className="accion-contacto accion-contacto--guardar"
          type="button"
          onClick={() => void guardarContacto()}
          aria-label={`Guardar contacto de ${datos.nombre}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 3v11M7.5 9.5 12 14l4.5-4.5" />
            <path d="M5 14.5V20h14v-5.5" />
          </svg>
          <span>{acciones.guardarContacto}</span>
        </button>

        <a
          className="accion-contacto accion-contacto--whatsapp"
          href={enlaceWa(datos.whatsapp, datos.mensajeWa)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            haptica();
            registrarEvento('whatsapp_click', marca, { contexto: 'contacto' });
          }}
          aria-label={`Abrir WhatsApp de ${datos.nombre}`}
        >
          {/* EL GLIFO OFICIAL DE WHATSAPP, redibujado el 2026-08-06.
              El anterior estaba trazado a mano con dos `path` de contorno: la
              burbuja no cerraba bien la cola y el auricular quedaba como un
              trazo suelto —«una raya medio rara que no va en el logo original»,
              dijo Carlos. Este es la silueta rellena de la marca, que es como
              WhatsApp la dibuja.
              Va RELLENO, no de contorno como el resto de los iconos: forzar la
              marca de un tercero a un sistema de trazo es justo lo que la
              deformaba. Por eso lleva su propia clase. */}
          <svg
            className="accion-contacto__glifo"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.17c-.24.68-1.4 1.3-1.96 1.38-.5.08-1.14.11-1.83-.12-.42-.13-.97-.31-1.66-.61-2.93-1.27-4.84-4.22-4.99-4.42-.15-.2-1.19-1.58-1.19-3.02 0-1.44.76-2.14 1.03-2.44.27-.3.58-.37.78-.37.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.83 2.01.9 2.16.07.15.12.32.02.52-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.39-.25.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.72-.17 1.4Z" />
          </svg>
          <span>{acciones.whatsapp}</span>
        </a>

        {accionCompartir}
      </div>
    </div>
  );
}

export default AccionesContacto;
