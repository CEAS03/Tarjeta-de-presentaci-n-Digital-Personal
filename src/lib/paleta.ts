import { PALETA, type Marca } from '../config/paleta';

/** Variables cromáticas que cambian juntas durante la bifurcación. */
export type VariablesPaleta = {
  '--fondo': string;
  '--acento': string;
  '--acento-2': string;
  '--glow': string;
};

const alfaGlow: Record<Marca, number> = {
  hub: 0.28,
  alsai: 0.32,
  blindafon: 0.3,
};

function canal(valor: number) {
  return Math.round(valor * 255);
}

function rgb(color: [number, number, number]) {
  return `rgb(${canal(color[0])}, ${canal(color[1])}, ${canal(color[2])})`;
}

function rgba(color: [number, number, number], alfa: number) {
  return `rgba(${canal(color[0])}, ${canal(color[1])}, ${canal(color[2])}, ${alfa})`;
}

/** Gemelo CSS de la paleta numérica que consume el relieve. */
export const PALETA_CSS: Record<Marca, VariablesPaleta> = Object.fromEntries(
  (Object.keys(PALETA) as Marca[]).map((marca) => {
    const colores = PALETA[marca];
    return [
      marca,
      {
        '--fondo': rgb(colores.fondo),
        '--acento': rgb(colores.acento),
        '--acento-2': rgb(colores.acento2),
        '--glow': rgba(colores.acento, alfaGlow[marca]),
      },
    ];
  }),
) as Record<Marca, VariablesPaleta>;

export const NOMBRES_VARIABLES_PALETA = [
  '--fondo',
  '--acento',
  '--acento-2',
  '--glow',
] as const;

/** Captura los valores ya pintados para empezar el morph sin un salto de color. */
export function leerPaleta(elemento: HTMLElement): VariablesPaleta {
  const estilos = getComputedStyle(elemento);
  return Object.fromEntries(
    NOMBRES_VARIABLES_PALETA.map((nombre) => [nombre, estilos.getPropertyValue(nombre).trim()]),
  ) as VariablesPaleta;
}

export function aplicarPaleta(elemento: HTMLElement, paleta: VariablesPaleta) {
  NOMBRES_VARIABLES_PALETA.forEach((nombre) => {
    elemento.style.setProperty(nombre, paleta[nombre]);
  });
}

