import type { MouseEvent } from 'react';
import type { ClaveMarca } from '../config/tarjeta';

export type AlSeleccionarMarca = (marca: ClaveMarca, origen: HTMLButtonElement) => void;

type PropiedadesBotonMarca = {
  marca: ClaveMarca;
  nombre: string;
  descripcion: string;
  onSeleccionar: AlSeleccionarMarca;
};

/** Una bifurcación completa: texto, flecha y área táctil pertenecen al mismo botón. */
export function BotonMarca({
  marca,
  nombre,
  descripcion,
  onSeleccionar,
}: PropiedadesBotonMarca) {
  const seleccionar = (evento: MouseEvent<HTMLButtonElement>) => {
    onSeleccionar(marca, evento.currentTarget);
  };

  return (
    <button
      className="boton-marca"
      type="button"
      data-marca-destino={marca}
      onClick={seleccionar}
      aria-label={`${nombre}: ${descripcion}`}
    >
      <span className="boton-marca__texto">
        <strong className="boton-marca__nombre">{nombre}</strong>
        <span className="boton-marca__descripcion">{descripcion}</span>
      </span>

      <span className="boton-marca__flecha" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M5 12h13M13 7l5 5-5 5" />
        </svg>
      </span>
    </button>
  );
}

export default BotonMarca;
