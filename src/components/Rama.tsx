import { useEffect, useRef, type ReactNode } from 'react';
import { tarjeta, type ClaveMarca } from '../config/tarjeta';
import AccionesContacto from './AccionesContacto';
import HojaAgendar from './HojaAgendar';
import { registrarEvento } from '../lib/analitica';
import './Rama.css';

type PropiedadesRama = {
  marca: ClaveMarca;
  onVolver: () => void;
  accionCompartir?: ReactNode;
};

type PropiedadesIconoEnlace = {
  nombre: string;
};

/** Iconos propios para mantener la tarjeta libre de dependencias de iconografía. */
function IconoEnlace({ nombre }: PropiedadesIconoEnlace) {
  const red = nombre.toLocaleLowerCase('es-MX');

  if (red === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle className="rama__icono-punto" cx="17.5" cy="6.8" r="1" />
      </svg>
    );
  }

  if (red === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M14.2 4v10.1a4.3 4.3 0 1 1-3.7-4.25" />
        <path d="M14.2 4c.55 2.75 2.2 4.25 4.8 4.55" />
      </svg>
    );
  }

  if (red === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M14.5 20v-7h2.7l.45-3h-3.15V8.2c0-.95.32-1.6 1.65-1.6H18V4.05A23 23 0 0 0 15.6 4c-2.4 0-4.05 1.45-4.05 4.15V10H9v3h2.55v7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4M12 3.5c2.15 2.3 3.25 5.15 3.25 8.5S14.15 18.2 12 20.5M12 3.5C9.85 5.8 8.75 8.65 8.75 12s1.1 6.2 3.25 8.5" />
    </svg>
  );
}

/** Plantilla única de contenido para ALSAI y Blindafón. */
export function Rama({ marca, onVolver, accionCompartir }: PropiedadesRama) {
  const { persona, acciones } = tarjeta;
  const datos = tarjeta.marcas[marca];
  const seccion = useRef<HTMLElement>(null);
  const idTitulo = `rama-titulo-${marca}`;
  const enlaces = [
    { nombre: 'Sitio web', url: datos.sitio },
    ...datos.redes,
  ].filter((enlace) => enlace.url);

  useEffect(() => {
    seccion.current?.focus({ preventScroll: true });
  }, [marca]);

  return (
    <section
      ref={seccion}
      className="rama"
      data-marca-rama={marca}
      aria-labelledby={idTitulo}
      tabIndex={-1}
    >
      <div className="rama__contenido">
        <header className="rama__cabecera">
          <div className="rama__barra">
            <button
              className="rama__volver"
              type="button"
              onClick={onVolver}
              aria-label="Volver a la tarjeta personal"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M19 12H6M11 7l-5 5 5 5" />
              </svg>
              <span>{acciones.volver}</span>
            </button>

            <img
              className="rama__retrato"
              src={persona.fotoSrc}
              alt={`Retrato de ${persona.nombre}`}
              width="640"
              height="640"
              decoding="async"
            />
          </div>

          <div className="rama__identidad">
            {datos.logoSrc ? (
              <>
                <img
                  className="rama__logo"
                  src={datos.logoSrc}
                  alt=""
                  decoding="async"
                />
                <h1 className="solo-lector" id={idTitulo}>
                  {datos.nombre}
                </h1>
              </>
            ) : (
              <h1 className="rama__wordmark" id={idTitulo}>
                {datos.nombre}
              </h1>
            )}

            <p className="rama__rol">
              {persona.nombre} <span aria-hidden="true">·</span> {datos.rol}
            </p>
          </div>
        </header>

        <div className="rama__presentacion">
          <p className="rama__descripcion">{datos.descripcion}</p>

          {datos.prueba && (
            <p className="rama__prueba">
              <span className="rama__prueba-marca" aria-hidden="true" />
              {datos.prueba}
            </p>
          )}
        </div>

        <HojaAgendar marca={marca} />

        {enlaces.length > 0 && (
          <nav
            className="rama__enlaces"
            aria-label={`Enlaces de ${datos.nombre}`}
          >
            {enlaces.map((enlace) => (
              <a
                className="rama__enlace"
                key={`${enlace.nombre}-${enlace.url}`}
                href={enlace.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  registrarEvento('link_click', marca, { destino: enlace.nombre })
                }
                aria-label={`${enlace.nombre} de ${datos.nombre}`}
                title={enlace.nombre}
              >
                <IconoEnlace nombre={enlace.nombre} />
                <span className="solo-lector">{enlace.nombre}</span>
              </a>
            ))}
          </nav>
        )}
      </div>

      <AccionesContacto marca={marca} accionCompartir={accionCompartir} />
    </section>
  );
}

export default Rama;
