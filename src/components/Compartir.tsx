import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { tarjeta } from '../config/tarjeta';
import { haptica } from '../lib/haptica';
import {
  crearUrlCompartir,
  type AlcanceCompartido,
} from '../lib/origen';
import { dibujarQr } from '../lib/qr';
import './Compartir.css';

export type MetodoCompartir = 'abrir' | 'nativo' | 'copia';

type PropiedadesCompartir = {
  alcance: AlcanceCompartido;
  className?: string;
  onAccion?: (metodo: MetodoCompartir) => void;
};

function IconoCompartir() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.25 10.85 7.5-4.55M8.25 13.15l7.5 4.55" />
    </svg>
  );
}

function IconoEnlace() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9.5 14.5 14.5 9M7.25 16.75l-1 1a3.54 3.54 0 0 1-5-5l3.5-3.5a3.54 3.54 0 0 1 5 0M16.75 7.25l1-1a3.54 3.54 0 0 1 5 5l-3.5 3.5a3.54 3.54 0 0 1-5 0" />
    </svg>
  );
}

async function copiarAlPortapapeles(texto: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(texto);
      return;
    } catch {
      // Algunos navegadores exponen la API aunque el permiso esté bloqueado.
      // En ese caso todavía se intenta el método compatible con navegadores anteriores.
    }
  }

  const focoAnterior = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  const campo = document.createElement('textarea');
  campo.value = texto;
  campo.setAttribute('readonly', '');
  campo.style.position = 'fixed';
  campo.style.opacity = '0';
  document.body.appendChild(campo);
  campo.select();

  const copiado = document.execCommand('copy');
  campo.remove();
  focoAnterior?.focus();

  if (!copiado) throw new Error('El navegador no permitió copiar el enlace.');
}

/** Hoja accesible para compartir por el sistema, copiar el enlace o mostrar un QR. */
export function Compartir({ alcance, className = '', onAccion }: PropiedadesCompartir) {
  const [abierta, setAbierta] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const dialogo = useRef<HTMLDialogElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const idTitulo = `compartir-titulo-${alcance}`;
  const idDescripcion = `compartir-descripcion-${alcance}`;

  const contenido = useMemo(() => {
    if (alcance === 'hub') {
      return {
        titulo: 'Comparte mi tarjeta',
        nombre: tarjeta.persona.nombre,
        texto: `Tarjeta digital de ${tarjeta.persona.nombre}.`,
      };
    }

    const marca = tarjeta.marcas[alcance];
    return {
      titulo: `Comparte ${marca.nombre}`,
      nombre: `${marca.nombre} — ${tarjeta.persona.nombre}`,
      texto: `Conoce ${marca.nombre} y contacta a ${tarjeta.persona.nombre}.`,
    };
  }, [alcance]);

  const urlEnlace = crearUrlCompartir(alcance, 'link');
  const urlQr = crearUrlCompartir(alcance, 'qr');

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;

    if (abierta && !elemento.open) {
      if (typeof elemento.showModal === 'function') elemento.showModal();
      else elemento.setAttribute('open', '');
    }

    if (!abierta && elemento.open) elemento.close();
  }, [abierta]);

  useEffect(() => {
    if (!abierta || !lienzo.current) return;

    try {
      dibujarQr(lienzo.current, urlQr);
    } catch {
      setMensaje('No se pudo dibujar el QR. Puedes compartir o copiar el enlace.');
    }
  }, [abierta, urlQr]);

  const abrir = () => {
    haptica();
    setMensaje('');
    setAbierta(true);
    onAccion?.('abrir');
  };

  const cerrar = () => setAbierta(false);

  const cerrarDesdeFondo = (evento: MouseEvent<HTMLDialogElement>) => {
    if (evento.target === evento.currentTarget) cerrar();
  };

  const compartirEnlace = async () => {
    haptica();

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: contenido.nombre,
          text: contenido.texto,
          url: urlEnlace,
        });
        setMensaje('Tarjeta compartida.');
        onAccion?.('nativo');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    try {
      await copiarAlPortapapeles(urlEnlace);
      setMensaje('Enlace copiado.');
      onAccion?.('copia');
    } catch {
      setMensaje('No se pudo compartir. Mantén presionado el enlace para copiarlo.');
    }
  };

  const copiarEnlace = async () => {
    haptica();

    try {
      await copiarAlPortapapeles(urlEnlace);
      setMensaje('Enlace copiado.');
      onAccion?.('copia');
    } catch {
      setMensaje('No se pudo copiar automáticamente. Mantén presionado el enlace.');
    }
  };

  return (
    <>
      <button
        className={`compartir__disparador ${className}`.trim()}
        type="button"
        aria-haspopup="dialog"
        aria-controls={`compartir-hoja-${alcance}`}
        onClick={abrir}
      >
        <IconoCompartir />
        <span>{tarjeta.acciones.compartir}</span>
      </button>

      <dialog
        className="compartir__dialogo"
        id={`compartir-hoja-${alcance}`}
        ref={dialogo}
        aria-labelledby={idTitulo}
        aria-describedby={idDescripcion}
        onClose={cerrar}
        onCancel={cerrar}
        onClick={cerrarDesdeFondo}
      >
        <div className="compartir__hoja">
          <span className="compartir__asa" aria-hidden="true" />

          <button
            className="compartir__cerrar"
            type="button"
            aria-label={tarjeta.acciones.cerrar}
            onClick={cerrar}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m7 7 10 10M17 7 7 17" />
            </svg>
          </button>

          <div className="compartir__encabezado">
            <span className="compartir__icono">
              <IconoCompartir />
            </span>
            <div>
              <h2 className="compartir__titulo" id={idTitulo}>{contenido.titulo}</h2>
              <p className="compartir__descripcion" id={idDescripcion}>
                Envía el enlace o deja que escaneen el código.
              </p>
            </div>
          </div>

          <div className="compartir__qr">
            <canvas
              ref={lienzo}
              role="img"
              aria-label={`Código QR para abrir ${contenido.nombre}`}
            >
              Código QR para abrir {contenido.nombre}.
            </canvas>
            <p>Apunta la cámara al código QR</p>
          </div>

          <div className="compartir__acciones">
            <button
              className="compartir__accion compartir__accion--principal"
              type="button"
              onClick={() => void compartirEnlace()}
            >
              <IconoCompartir />
              <span>Compartir enlace</span>
            </button>
            <button
              className="compartir__accion"
              type="button"
              onClick={() => void copiarEnlace()}
            >
              <IconoEnlace />
              <span>Copiar enlace</span>
            </button>
          </div>

          <a
            className="compartir__url"
            href={urlEnlace}
            target="_blank"
            rel="noopener noreferrer"
          >
            {urlEnlace}
          </a>

          <p className="compartir__estado" role="status" aria-live="polite">
            {mensaje}
          </p>
        </div>
      </dialog>
    </>
  );
}

export default Compartir;
