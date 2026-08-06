import { Suspense, lazy, useEffect, useRef } from 'react';
import { useMarca } from './estado/useMarca';
import { tarjeta } from './config/tarjeta';
import Hub from './components/Hub';
import Rama from './components/Rama';
import { descargarVcard } from './lib/vcard';
import { haptica } from './lib/haptica';
import Transicion, { type ControlTransicion } from './components/Transicion';
import Compartir from './components/Compartir';
import InvitacionGiroscopio from './components/InvitacionGiroscopio';
import { registrarApertura, registrarEvento } from './lib/analitica';

/* El fondo se carga aparte y se monta después del primer pintado, para que la
   primera pantalla nunca esté en blanco. Debajo queda el telón de CSS. */
const Relieve = lazy(() => import('./webgl/Relieve'));

export default function App() {
  const { marca, setMarca, volverAlHub } = useMarca();
  const transicion = useRef<ControlTransicion>(null);

  useEffect(() => {
    registrarApertura(marca);
  }, [marca]);

  const guardarContactoPersonal = async () => {
    haptica();
    try {
      await descargarVcard('hub');
      registrarEvento('vcard_saved', 'hub');
    } catch (error) {
      console.error('No se pudo descargar el contacto personal.', error);
    }
  };

  return (
    <>
      <div className="telon" />
      <Suspense fallback={null}>
        <Relieve marca={marca} />
      </Suspense>

      <Transicion ref={transicion} fotoSrc={tarjeta.persona.fotoSrc} />

      {/* Solo se monta en iOS, que es donde hay un permiso que pedir. */}
      <InvitacionGiroscopio />

      <main className="aplicacion">
        <p className="solo-lector" aria-live="polite">
          {marca === 'hub'
            ? 'Tarjeta personal de Carlos Álvarez'
            : `Tarjeta de ${tarjeta.marcas[marca].nombre}`}
        </p>

        {marca === 'hub' ? (
          <Hub
            onSeleccionarMarca={(nueva, origen) => {
              haptica();
              registrarEvento('brand_selected', nueva);
              transicion.current?.cambiar({
                destino: nueva,
                origen,
                alCambiar: () => setMarca(nueva),
              });
            }}
            onGuardarContacto={() => void guardarContactoPersonal()}
            accionCompartir={
              <Compartir
                alcance="hub"
                className="hub__accion"
                onAccion={(metodo) =>
                  registrarEvento('share_click', 'hub', { metodo })
                }
              />
            }
          />
        ) : (
          <Rama
            marca={marca}
            accionCompartir={
              <Compartir
                alcance={marca}
                className="accion-contacto accion-contacto--compartir"
                onAccion={(metodo) =>
                  registrarEvento('share_click', marca, { metodo })
                }
              />
            }
            onVolver={() => {
              const origen = document.querySelector('.rama__volver');
              transicion.current?.cambiar({
                destino: 'hub',
                origen,
                alCambiar: volverAlHub,
              });
            }}
          />
        )}
      </main>
    </>
  );
}
