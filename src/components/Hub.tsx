import type { ReactNode } from 'react';
import { tarjeta, type ClaveMarca } from '../config/tarjeta';
import BotonMarca, { type AlSeleccionarMarca } from './BotonMarca';
import Retrato from './Retrato';
import './Hub.css';

type PropiedadesHub = {
  onSeleccionarMarca: AlSeleccionarMarca;
  onGuardarContacto: () => void;
  accionCompartir?: ReactNode;
};

const ordenMarcas: ClaveMarca[] = ['alsai', 'blindafon'];

/**
 * Presentación personal y bifurcación hacia los dos negocios.
 * Composición completa en DIRECCION-DE-ARTE.md §3.
 *
 * El retrato sangra arriba y se funde con el relieve; el nombre arranca justo
 * donde la foto muere. Todo alineado a la izquierda: ni un párrafo centrado.
 */
export function Hub({
  onSeleccionarMarca,
  onGuardarContacto,
  accionCompartir,
}: PropiedadesHub) {
  const { persona, marcas } = tarjeta;

  return (
    <section className="hub" aria-labelledby="hub-nombre">
      <Retrato src={persona.fotoSrc} nombre={persona.nombre} />

      <div className="hub__contenido">
        {/* Nombre, ciudad y tesis son UN bloque: quién es Carlos. Van juntos a
            propósito. Sin este envoltorio, el reparto vertical metía 89 px entre
            la ciudad y la tesis y las desemparejaba; el aire tiene que caer
            entero en el corte siguiente, el que separa «quién soy» de «elige». */}
        <div className="hub__presentacion">
          <header className="hub__identidad">
            <h1 className="hub__nombre" id="hub-nombre">
              {persona.nombre}
            </h1>
            <p className="hub__ciudad">{persona.ciudad}</p>
          </header>

          <p className="hub__descripcion">{persona.descripcion}</p>
        </div>

        <section className="hub__eleccion" aria-labelledby="hub-pregunta">
          <h2 className="hub__pregunta" id="hub-pregunta">
            {persona.pregunta}
          </h2>

          <nav className="hub__opciones" aria-labelledby="hub-pregunta">
            {ordenMarcas.map((clave) => {
              const marca = marcas[clave];

              return (
                <BotonMarca
                  key={clave}
                  marca={clave}
                  nombre={marca.nombre}
                  descripcion={marca.resumen}
                  onSeleccionar={onSeleccionarMarca}
                />
              );
            })}
          </nav>

          <div className="hub__acciones-secundarias">
            <button className="hub__accion" type="button" onClick={onGuardarContacto}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 14v5h14v-5" />
              </svg>
              <span>{tarjeta.acciones.guardarPersonal}</span>
            </button>
            <span className="hub__separador" aria-hidden="true">
              ·
            </span>
            {accionCompartir}
          </div>
        </section>
      </div>
    </section>
  );
}

export default Hub;
