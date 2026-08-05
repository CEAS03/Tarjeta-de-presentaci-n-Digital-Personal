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

type PropiedadesTransicion = {
  fotoSrc: string;
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

const SELECTOR_RETRATO: Record<'hub' | 'rama', string> = {
  hub: '.retrato__imagen',
  rama: '.rama__retrato',
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

function siguienteCuadro() {
  return new Promise<void>((resolver) => requestAnimationFrame(() => resolver()));
}

async function esperarRetrato(selector: string) {
  const limite = performance.now() + 750;
  do {
    const retrato = document.querySelector<HTMLImageElement>(selector);
    if (retrato) return retrato;
    await siguienteCuadro();
  } while (performance.now() < limite);
  return null;
}

function prepararCopiaAnterior(
  contenedor: HTMLDivElement,
  aplicacion: HTMLElement,
  paleta: VariablesPaleta,
  selectorRetrato: string,
) {
  const copia = aplicacion.cloneNode(true) as HTMLElement;
  copia.removeAttribute('aria-live');
  copia.querySelector<HTMLElement>(selectorRetrato)?.style.setProperty('visibility', 'hidden');
  contenedor.replaceChildren(copia);
  aplicarPaleta(contenedor, paleta);
  contenedor.style.background = paleta['--fondo'];
  contenedor.style.display = 'block';
}

/**
 * Capa visual de la bifurcación. La pantalla anterior queda inmóvil debajo de
 * la aplicación nueva, que se revela desde el botón realmente pulsado.
 */
export const Transicion = forwardRef<ControlTransicion, PropiedadesTransicion>(
  function Transicion({ fotoSrc }, ref) {
    const anterior = useRef<HTMLDivElement>(null);
    const viajero = useRef<HTMLImageElement>(null);
    const enCurso = useRef(false);
    const lineaTiempo = useRef<gsap.core.Timeline | null>(null);

    useImperativeHandle(ref, () => ({
      cambiar: (peticion) => {
        if (enCurso.current) return;
        void ejecutarTransicion(peticion, anterior, viajero, enCurso, lineaTiempo);
      },
    }));

    return (
      <div className="transicion" aria-hidden="true">
        <div ref={anterior} className="transicion__anterior" />
        <img
          ref={viajero}
          className="transicion__retrato"
          src={fotoSrc}
          alt=""
          width="640"
          height="640"
          decoding="async"
        />
      </div>
    );
  },
);

async function ejecutarTransicion(
  { destino, origen, alCambiar }: PeticionTransicion,
  refAnterior: RefObject<HTMLDivElement>,
  refViajero: RefObject<HTMLImageElement>,
  refEnCurso: { current: boolean },
  refLineaTiempo: { current: gsap.core.Timeline | null },
) {
  const aplicacion = document.querySelector<HTMLElement>('.aplicacion');
  const capaAnterior = refAnterior.current;
  const retratoViajero = refViajero.current;
  if (!aplicacion || !capaAnterior || !retratoViajero) {
    alCambiar();
    return;
  }

  refEnCurso.current = true;
  const raiz = document.documentElement;
  const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const selectorOrigen = destino === 'hub' ? SELECTOR_RETRATO.rama : SELECTOR_RETRATO.hub;
  const selectorDestino = destino === 'hub' ? SELECTOR_RETRATO.hub : SELECTOR_RETRATO.rama;
  const retratoOrigen = aplicacion.querySelector<HTMLImageElement>(selectorOrigen);
  const rectanguloRetratoOrigen = retratoOrigen?.getBoundingClientRect() ?? null;
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

  prepararCopiaAnterior(capaAnterior, aplicacion, paletaInicial, selectorOrigen);
  aplicarPaleta(raiz, paletaInicial);
  aplicacion.style.visibility = 'hidden';
  document.body.style.overflow = 'hidden';
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', PALETA[destino].themeColor);

  const limpiar = (retratoDestino?: HTMLImageElement | null, opacidadDestino = '') => {
    refLineaTiempo.current?.kill();
    refLineaTiempo.current = null;
    if (retratoDestino) retratoDestino.style.opacity = opacidadDestino;
    restaurarEstilosAplicacion(aplicacion, estilosAnteriores);
    restaurarVariables(raiz, variablesAnteriores);
    document.body.style.overflow = overflowAnterior;
    capaAnterior.replaceChildren();
    capaAnterior.removeAttribute('style');
    retratoViajero.removeAttribute('style');
    refEnCurso.current = false;
  };

  try {
    flushSync(alCambiar);
    const retratoDestino = await esperarRetrato(selectorDestino);

    if (!retratoDestino) {
      limpiar();
      return;
    }

    const opacidadDestino = retratoDestino.style.opacity;
    aplicacion.style.visibility = 'visible';
    aplicacion.style.zIndex = '31';

    if (movimientoReducido) {
      aplicarPaleta(raiz, PALETA_CSS[destino]);
      aplicacion.style.transition = 'none';
      aplicacion.style.opacity = '0';
      aplicacion.style.willChange = 'opacity';
      refLineaTiempo.current = gsap
        .timeline({
          onComplete: () => limpiar(retratoDestino, opacidadDestino),
        })
        .to(aplicacion, { opacity: 1, duration: 0.15, ease: 'none' });
      return;
    }

    const inicioClip = `circle(0px at ${centroX}px ${centroY}px)`;
    const finalClip = `circle(${radio + 2}px at ${centroX}px ${centroY}px)`;
    aplicacion.style.clipPath = inicioClip;
    aplicacion.style.setProperty('-webkit-clip-path', inicioClip);
    aplicacion.style.willChange = 'clip-path';

    if (rectanguloRetratoOrigen) {
      const rectanguloDestino = retratoDestino.getBoundingClientRect();
      retratoDestino.style.opacity = '0';
      retratoViajero.src = retratoOrigen?.currentSrc || retratoOrigen?.src || retratoViajero.src;
      retratoViajero.style.display = 'block';
      retratoViajero.style.left = `${rectanguloDestino.left}px`;
      retratoViajero.style.top = `${rectanguloDestino.top}px`;
      retratoViajero.style.width = `${rectanguloDestino.width}px`;
      retratoViajero.style.height = `${rectanguloDestino.height}px`;
      gsap.set(retratoViajero, {
        x: rectanguloRetratoOrigen.left - rectanguloDestino.left,
        y: rectanguloRetratoOrigen.top - rectanguloDestino.top,
        scaleX: rectanguloRetratoOrigen.width / rectanguloDestino.width,
        scaleY: rectanguloRetratoOrigen.height / rectanguloDestino.height,
        opacity: 1,
      });
    }

    refLineaTiempo.current = gsap.timeline({
      defaults: { duration: 0.9, ease: SAL },
      onComplete: () => limpiar(retratoDestino, opacidadDestino),
    });
    refLineaTiempo.current.to(
      aplicacion,
      {
        clipPath: finalClip,
        webkitClipPath: finalClip,
      },
      0,
    );
    refLineaTiempo.current.to(
      raiz,
      {
        ...PALETA_CSS[destino],
      },
      0,
    );

    if (rectanguloRetratoOrigen) {
      refLineaTiempo.current.to(
        retratoViajero,
        { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 },
        0,
      );
    }
  } catch (error) {
    limpiar();
    console.error('No se pudo completar la transición de marca.', error);
  }
}

export default Transicion;
