/**
 * Las tres identidades. Única fuente de color para el WebGL.
 * Los mismos valores viven en src/styles/tokens.css para el CSS: si cambias uno,
 * cambia el otro. Son los dos únicos sitios donde puede haber un color.
 */

export type Marca = 'hub' | 'alsai' | 'blindafon';

/** 0..1, que es lo que espera el shader. */
const c = (r: number, g: number, b: number): [number, number, number] => [r / 255, g / 255, b / 255];

export const PALETA: Record<Marca, {
  fondo: [number, number, number];
  acento: [number, number, number];
  acento2: [number, number, number];
  themeColor: string;
}> = {
  hub: {
    fondo: c(5, 7, 13),
    acento: c(200, 206, 218),
    acento2: c(124, 134, 152),
    themeColor: '#05070D',
  },
  alsai: {
    fondo: c(4, 10, 22),
    acento: c(55, 226, 228),
    acento2: c(27, 143, 155),
    themeColor: '#040A16',
  },
  blindafon: {
    fondo: c(10, 14, 24),
    acento: c(241, 139, 59),
    acento2: c(79, 195, 255),
    themeColor: '#0A0E18',
  },
};
