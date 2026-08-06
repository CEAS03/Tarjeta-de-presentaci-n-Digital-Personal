import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type RefObject,
} from 'react';
import { flushSync } from 'react-dom';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { PALETA, type Marca } from '../config/paleta';
import {
  aplicarPaleta,
  leerPaleta,
  NOMBRES_VARIABLES_PALETA,
  PALETA_CSS,
  type VariablesPaleta,
} from '../lib/paleta';

gsap.registerPlugin(CustomEase);
const SAL = CustomEase.create('sal-tarjeta', '0.16,1,0.3,1');

type PeticionTransicion = {
  destino: Marca;
  origen: Element | DOMRect | null;
  alCambiar: () => void;
};

export type ControlTransicion = {
  cambiar: (peticion: PeticionTransicion) => void;
};

type EstilosAplicacion = {
  visibility: string;
  opacity: string;
  zIndex: string;
  willChange: string;
  clipPath: string;
  webkitClipPath: string;
  transition: string;
};

function obtenerRectangulo(origen: Element | DOMRect | null) {
  if (origen instanceof Element) return origen.getBoundingClientRect();
  if (origen) return origen;
  return new DOMRect(innerWidth / 2, innerHeight / 2, 0, 0);
}

function guardarEstilosAplicacion(aplicacion: HTMLElement): EstilosAplicacion {
  return {
    visibility: aplicacion.style.visibility,
    opacity: aplicacion.style.opacity,
    zIndex: aplicacion.style.zIndex,
    willChange: aplicacion.style.willChange,
    clipPath: aplicacion.style.clipPath,
    webkitClipPath: aplicacion.style.getPropertyValue('-webkit-clip-path'),
    transition: aplicacion.style.transition,
  };
}

function restaurarEstilosAplicacion(
  aplicacion: HTMLElement,
  estilos: EstilosAplicacion,
) {
  // Evita que la regla global de movimiento reducido añada un segundo fundido
  // al retirar los valores que GSAP acaba de llevar a su destino.
  aplicacion.style.transition = 'none';
  aplicacion.style.visibility = estilos.visibility;
  aplicacion.style.opacity = estilos.opacity;
  aplicacion.style.zIndex = estilos.zIndex;
  aplicacion.style.willChange = estilos.willChange;
  aplicacion.style.clipPath = estilos.clipPath;
  aplicacion.style.setProperty('-webkit-clip-path', estilos.webkitClipPath);
  void aplicacion.offsetWidth;
  aplicacion.style.transition = estilos.transition;
}

function guardarVariables(elemento: HTMLElement) {
  return Object.fromEntries(
    NOMBRES_VARIABLES_PALETA.map((nombre) => [
      nombre,
      elemento.style.getPropertyValue(nombre),
    ]),
  ) as VariablesPaleta;
}

function restaurarVariables(elemento: HTMLElement, anteriores: VariablesPaleta) {
  NOMBRES_VARIABLES_PALETA.forEach((nombre) => {
    const valor = anteriores[nombre];
    if (valor) elemento.style.setProperty(nombre, valor);
    else elemento.style.removeProperty(nombre);
  });
}

function prepararCopiaAnterior(
  contenedor: HTMLDivElement,
  aplicacion: HTMLElement,
  paleta: VariablesPaleta,
) {
  const copia = aplicacion.cloneNode(true) as HTMLElement;
  copia.removeAttribute('aria-live');
  contenedor.replaceChildren(copia);
  aplicarPaleta(contenedor, paleta);
  contenedor.style.background = paleta['--fondo'];
  contenedor.style.display = 'block';
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LA BIFURCACIÓN. La pantalla anterior queda inmóvil debajo, y la nueva se
 *  revela con un círculo que crece DESDE EL BOTÓN QUE SE PULSÓ. Es el momento
 *  que Carlos quiere que la gente recuerde (DISENO.md §7.1), y se conserva.
 *
 *  QUÉ SE ELIMINÓ AQUÍ, el 2026-08-05 — y por qué importa:
 *
 *  Este componente hacía viajar el retrato de Carlos de una pantalla a otra,
 *  encogiéndolo hasta una INSIGNIA CIRCULAR DE ESQUINA en la rama. Esa insignia
 *  se eliminó del resto de la pieza hace tiempo: es una caja con aro, justo lo
 *  que la dirección de arte prohíbe. En la rama el retrato no existe; manda el
 *  logo de la marca.
 *
 *  Y no era solo una deuda estética: estaba ROTO. El destino del viaje era
 *  `.rama__retrato`, un elemento que Rama.tsx ya no renderiza. Al ir de hub a
 *  rama, `esperarRetrato` lo buscaba durante 750 ms, no lo encontraba, se
 *  rendía y **salía sin ejecutar la transición**. Es decir: la revelación
 *  circular y la interpolación de paleta no ocurrían en el sentido más
 *  importante —el de entrada—, y en su lugar había un salto seco precedido de
 *  tres cuartos de segundo congelado. De rama a hub sí funcionaba, porque ahí
 *  el destino sí existe, y por eso pasaba desapercibido.
 *
 *  Al quitar el viaje del retrato desaparecen la espera, el elemento viajero y
 *  el único camino por el que la transición podía no ejecutarse.
 * ─────────────────────────────────────────────────────────────────────────────
 */
/* Sin propiedades: el retrato ya no viaja, así que `fotoSrc` sobraba. */
export const Transicion = forwardRef<ControlTransicion>(
  function Transicion(_propiedades, ref) {
    const anterior = useRef<HTMLDivElement>(null);
    const enCurso = useRef(false);
    const lineaTiempo = useRef<gsap.core.Timeline | null>(null);

    useImperativeHandle(ref, () => ({
      cambiar: (peticion) => {
        if (enCurso.current) return;
        void ejecutarTransicion(peticion, anterior, enCurso, lineaTiempo);
      },
    }));

    return (
      <div className="transicion" aria-hidden="true">
        <div ref={anterior} className="transicion__anterior" />
      </div>
    );
  },
);

async function ejecutarTransicion(
  { destino, origen, alCambiar }: PeticionTransicion,
  refAnterior: RefObject<HTMLDivElement>,
  refEnCurso: { current: boolean },
  refLineaTiempo: { current: gsap.core.Timeline | null },
) {
  const aplicacion = document.querySelector<HTMLElement>('.aplicacion');
  const capaAnterior = refAnterior.current;
  if (!aplicacion || !capaAnterior) {
    alCambiar();
    return;
  }

  refEnCurso.current = true;
  const raiz = document.documentElement;
  const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // El círculo nace en el botón realmente pulsado y crece hasta cubrir la
  // esquina más lejana: así la revelación sale de donde puso el dedo.
  const rectanguloOrigen = obtenerRectangulo(origen);
  const centroX = Math.min(innerWidth, Math.max(0, rectanguloOrigen.left + rectanguloOrigen.width / 2));
  const centroY = Math.min(innerHeight, Math.max(0, rectanguloOrigen.top + rectanguloOrigen.height / 2));
  const radio = Math.hypot(
    Math.max(centroX, innerWidth - centroX),
    Math.max(centroY, innerHeight - centroY),
  );

  const paletaInicial = leerPaleta(raiz);
  const variablesAnteriores = guardarVariables(raiz);
  const estilosAnteriores = guardarEstilosAplicacion(aplicacion);
  const overflowAnterior = document.body.style.overflow;

  prepararCopiaAnterior(capaAnterior, aplicacion, paletaInicial);
  aplicarPaleta(raiz, paletaInicial);
  aplicacion.style.visibility = 'hidden';
  document.body.style.overflow = 'hidden';
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', PALETA[destino].themeColor);

  const limpiar = () => {
    refLineaTiempo.current?.kill();
    refLineaTiempo.current = null;
    restaurarEstilosAplicacion(aplicacion, estilosAnteriores);
    restaurarVariables(raiz, variablesAnteriores);
    document.body.style.overflow = overflowAnterior;
    capaAnterior.replaceChildren();
    capaAnterior.removeAttribute('style');
    refEnCurso.current = false;
  };

  try {
    flushSync(alCambiar);

    aplicacion.style.visibility = 'visible';
    aplicacion.style.zIndex = '31';

    if (movimientoReducido) {
      aplicarPaleta(raiz, PALETA_CSS[destino]);
      aplicacion.style.transition = 'none';
      aplicacion.style.opacity = '0';
      aplicacion.style.willChange = 'opacity';
      refLineaTiempo.current = gsap
        .timeline({ onComplete: limpiar })
        .to(aplicacion, { opacity: 1, duration: 0.15, ease: 'none' });
      return;
    }

    /**
     * EL CÍRCULO SE DIBUJA DOS VECES, y hace falta que sea así.
     *
     * La pantalla nueva se recorta CON el círculo (`clip-path`), y la copia
     * congelada de la anterior se recorta con su NEGATIVO (una máscara con un
     * agujero del mismo radio y centro).
     *
     * Sin lo segundo se ven las dos pantallas superpuestas, como una doble
     * exposición: la copia congelada es opaca —lleva el color de fondo para
     * tapar el relieve—, pero la aplicación nueva es transparente, así que la
     * anterior se transparentaba a través de ella. Dentro del círculo tiene que
     * verse SOLO la pantalla nueva.
     *
     * No se resuelve pintando un fondo sólido en la aplicación nueva: eso
     * taparía el relieve durante los 900 ms de la bifurcación y lo que se
     * revelaría sería una superficie plana. Con el agujero, dentro del círculo
     * se ve la pantalla nueva sobre el relieve VIVO, que además está
     * interpolando hacia la paleta de la marca en ese mismo instante.
     */
    const escribirCirculo = (r: number) => {
      const forma = `circle(${r}px at ${centroX}px ${centroY}px)`;
      aplicacion.style.clipPath = forma;
      aplicacion.style.setProperty('-webkit-clip-path', forma);

      // El negativo. Borde duro —dos paradas en el mismo punto— para que los dos
      // círculos coincidan exactamente y no asome una costura entre ellos.
      const agujero = `radial-gradient(circle at ${centroX}px ${centroY}px, transparent 0 ${r}px, #000 ${r}px)`;
      capaAnterior.style.maskImage = agujero;
      capaAnterior.style.setProperty('-webkit-mask-image', agujero);
    };

    escribirCirculo(0);
    aplicacion.style.willChange = 'clip-path';
    capaAnterior.style.willChange = 'mask-image';

    refLineaTiempo.current = gsap.timeline({
      defaults: { duration: 0.9, ease: SAL },
      onComplete: limpiar,
    });
    // El círculo y la paleta, a la vez y con la misma curva: la marca no llega
    // después de la forma, llega CON ella.
    refLineaTiempo.current.to(
      { r: 0 },
      {
        r: radio + 2,
        onUpdate() {
          escribirCirculo((this.targets()[0] as { r: number }).r);
        },
      },
      0,
    );
    refLineaTiempo.current.to(raiz, { ...PALETA_CSS[destino] }, 0);
  } catch (error) {
    limpiar();
    console.error('No se pudo completar la transición de marca.', error);
  }
}

export default Transicion;
