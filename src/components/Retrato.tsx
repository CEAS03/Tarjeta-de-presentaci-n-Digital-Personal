type PropiedadesRetrato = {
  src: string;
  nombre: string;
};

/**
 * El retrato del hub. Ver DIRECCION-DE-ARTE.md §4.
 *
 * REGLA DURA: la foto NO vive dentro de nada. Ni tarjeta 3D, ni círculo, ni
 * marco, ni aro blanco. Fue el rechazo más explícito de Carlos sobre el primer
 * intento: «la foto quedó en un recuadro raro».
 *
 * Sangra por los dos lados y por arriba, y se disuelve en el relieve por abajo
 * con una máscara. No hay borde inferior ni línea de corte: la foto muere
 * dentro del fondo y el nombre arranca justo ahí.
 */
export function Retrato({ src, nombre }: PropiedadesRetrato) {
  return (
    <div className="retrato">
      <img
        className="retrato__imagen"
        src={src}
        alt={`Retrato de ${nombre}`}
        width="640"
        height="640"
        loading="eager"
        {...{ fetchpriority: 'high' }}
        decoding="async"
      />
    </div>
  );
}

export default Retrato;
