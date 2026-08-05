import { useEffect, useState } from 'react';
import type { Marca } from '../config/paleta';
import { PALETA } from '../config/paleta';

const VALIDAS: Marca[] = ['hub', 'alsai', 'blindafon'];
const ESTADO_TARJETA = 'tarjeta-carlos';

function leerUrl(): Marca {
  const m = new URLSearchParams(location.search).get('m');
  return (VALIDAS as string[]).includes(m ?? '') ? (m as Marca) : 'hub';
}

function crearUrl(marca: Marca) {
  const url = new URL(location.href);
  if (marca === 'hub') url.searchParams.delete('m');
  else url.searchParams.set('m', marca);
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Estado de marca sincronizado con `?m=` y el historial.
 * Sin react-router: es una sola página con tres estados.
 * El botón "atrás" del teléfono tiene que volver al hub; sin eso, la gente se sale.
 */
export function useMarca() {
  const [marca, setMarcaEstado] = useState<Marca>(leerUrl);

  useEffect(() => {
    const inicial = leerUrl();

    // Un enlace directo a una rama también debe volver al hub con el botón
    // físico del teléfono. Se inserta el hub justo debajo de la rama actual.
    if (inicial !== 'hub' && history.state?.tarjeta !== ESTADO_TARJETA) {
      history.replaceState({ tarjeta: ESTADO_TARJETA, m: 'hub' }, '', crearUrl('hub'));
      history.pushState({ tarjeta: ESTADO_TARJETA, m: inicial }, '', crearUrl(inicial));
    } else if (history.state?.tarjeta !== ESTADO_TARJETA) {
      history.replaceState({ tarjeta: ESTADO_TARJETA, m: inicial }, '', crearUrl(inicial));
    }

    const alVolver = () => setMarcaEstado(leerUrl());
    addEventListener('popstate', alVolver);
    return () => removeEventListener('popstate', alVolver);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.marca = marca;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', PALETA[marca].themeColor);
  }, [marca]);

  const setMarca = (nueva: Marca) => {
    if (nueva === marca) return;
    history.pushState({ tarjeta: ESTADO_TARJETA, m: nueva }, '', crearUrl(nueva));
    setMarcaEstado(nueva);
  };

  const volverAlHub = () => {
    if (marca !== 'hub') history.back();
  };

  return { marca, setMarca, volverAlHub };
}
