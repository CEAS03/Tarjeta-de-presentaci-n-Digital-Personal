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
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20.4 11.65a8.3 8.3 0 0 1-12.3 7.3L4 20l1.1-3.95a8.3 8.3 0 1 1 15.3-4.4Z" />
            <path d="M9.1 7.7c.2-.45.4-.45.7-.45h.45c.15 0 .3.05.4.35l.8 1.95c.1.25.05.4-.1.6l-.6.75c-.15.15-.1.35 0 .5.7 1.25 1.65 2.2 2.9 2.8.2.1.35.1.5-.1l.85-1.05c.2-.2.4-.2.65-.1l1.85.9c.25.15.4.2.45.35.05.15.05.85-.2 1.55-.25.65-1.45 1.25-2 1.3-.55.05-1.25.25-4.1-.9-3.45-1.4-5.7-4.95-5.85-5.15-.15-.2-1.4-1.85-1.4-3.5 0-1.65.85-2.45 1.15-2.8" />
          </svg>
          <span>{acciones.whatsapp}</span>
        </a>

        {accionCompartir}
      </div>
    </div>
  );
}

export default AccionesContacto;
