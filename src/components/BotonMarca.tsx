import type { MouseEvent } from 'react';
import type { ClaveMarca } from '../config/tarjeta';

export type AlSeleccionarMarca = (marca: ClaveMarca, origen: HTMLButtonElement) => void;

type PropiedadesBotonMarca = {
  marca: ClaveMarca;
  nombre: string;
  descripcion: string;
  onSeleccionar: AlSeleccionarMarca;
};

/**
 * Una bifurcación completa: texto, flecha y área táctil pertenecen al mismo botón.
 *
 * NO es una caja. Ver DIRECCION-DE-ARTE.md §6: es una FILA de una lista
 * editorial, separada por filetes. El primer intento las hizo rectángulos de
 * color con esquinas redondeadas y se leían a formulario, no a tarjeta cara.
 *
 * El punto de 6 px es el único color de marca visible en el hub: anticipa a
 * dónde lleva cada fila sin que la entrada deje de ser platino.
 */
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
        {/* El punto va DENTRO del nombre, no como columna hermana. Con la fila
            centrada, siendo hijo directo del flex se quedaba anclado al margen
            izquierdo y se leía como una viñeta suelta, sin relación con nada. */}
        <strong className="boton-marca__nombre">
          <span className="boton-marca__punto" aria-hidden="true" />
          {nombre}
        </strong>
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
