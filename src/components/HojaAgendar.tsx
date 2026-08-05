import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { enlaceWa, tarjeta, type ClaveMarca } from '../config/tarjeta';
import { haptica } from '../lib/haptica';
import { registrarEvento } from '../lib/analitica';

type PropiedadesHojaAgendar = {
  marca: ClaveMarca;
};

function IconoCalendario() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="5.5" width="17" height="15" rx="3" />
      <path d="M8 3.5v4M16 3.5v4M3.5 10h17M8 14h3M13 14h3M8 17h3" />
    </svg>
  );
}

/** Abre el endpoint futuro o, mientras esté vacío, coordina por WhatsApp. */
export function HojaAgendar({ marca }: PropiedadesHojaAgendar) {
  const datos = tarjeta.marcas[marca];
  const { acciones } = tarjeta;
  const [abierta, setAbierta] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);
  const idTitulo = `agendar-titulo-${marca}`;
  const idDescripcion = `agendar-descripcion-${marca}`;

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;

    if (abierta && !elemento.open) elemento.showModal();
    if (!abierta && elemento.open) elemento.close();
  }, [abierta]);

  const cerrar = () => setAbierta(false);

  const registrarAgenda = () => {
    haptica();
    registrarEvento('schedule_call_click', marca);
  };

  const cerrarDesdeFondo = (evento: MouseEvent<HTMLDialogElement>) => {
    if (evento.target === evento.currentTarget) cerrar();
  };

  if (datos.agendaUrl) {
    return (
      <a
        className="rama__agendar"
        href={datos.agendaUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={registrarAgenda}
      >
        <IconoCalendario />
        <span>{datos.textoAgenda}</span>
        <span className="rama__agendar-flecha" aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <>
      <button
        className="rama__agendar"
        type="button"
        aria-haspopup="dialog"
        aria-controls={`agendar-hoja-${marca}`}
        onClick={() => {
          registrarAgenda();
          setAbierta(true);
        }}
      >
        <IconoCalendario />
        <span>{datos.textoAgenda}</span>
        <span className="rama__agendar-flecha" aria-hidden="true">→</span>
      </button>

      <dialog
        className="hoja-agendar"
        id={`agendar-hoja-${marca}`}
        ref={dialogo}
        aria-labelledby={idTitulo}
        aria-describedby={idDescripcion}
        onClose={cerrar}
        onCancel={cerrar}
        onClick={cerrarDesdeFondo}
      >
        <div className="hoja-agendar__panel">
          <span className="hoja-agendar__asa" aria-hidden="true" />

          <button
            className="hoja-agendar__cerrar"
            type="button"
            onClick={cerrar}
            aria-label={acciones.cerrar}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m7 7 10 10M17 7 7 17" />
            </svg>
          </button>

          <div className="hoja-agendar__icono">
            <IconoCalendario />
          </div>

          <p className="hoja-agendar__marca">{datos.nombre}</p>
          <h2 className="hoja-agendar__titulo" id={idTitulo}>
            {datos.textoAgenda}
          </h2>
          <p className="hoja-agendar__descripcion" id={idDescripcion}>
            {datos.descripcionAgenda}
          </p>

          <a
            className="hoja-agendar__whatsapp"
            href={enlaceWa(datos.whatsapp, datos.mensajeAgenda)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              haptica();
              registrarEvento('whatsapp_click', marca, { contexto: 'agenda' });
              cerrar();
            }}
          >
            {acciones.continuarWhatsapp}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </dialog>
    </>
  );
}

export default HojaAgendar;
