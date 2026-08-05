/**
 * QR mínimo para enlaces de la tarjeta: versión 4, modo byte y corrección L.
 * Evita cargar una dependencia completa para una única URL corta y canónica.
 */

const VERSION = 4;
const LADO = 17 + VERSION * 4;
const DATOS = 80;
const CORRECCION = 20;
const MARGEN = 4;

export type MatrizQr = boolean[][];

const exponentes = new Uint8Array(512);
const logaritmos = new Uint8Array(256);

let valor = 1;
for (let indice = 0; indice < 255; indice += 1) {
  exponentes[indice] = valor;
  logaritmos[valor] = indice;
  valor <<= 1;
  if (valor & 0x100) valor ^= 0x11d;
}
for (let indice = 255; indice < exponentes.length; indice += 1) {
  exponentes[indice] = exponentes[indice - 255];
}

function multiplicar(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return exponentes[logaritmos[a] + logaritmos[b]];
}

function polinomioGenerador(grado: number): number[] {
  let polinomio = [1];

  for (let potencia = 0; potencia < grado; potencia += 1) {
    const siguiente = new Array<number>(polinomio.length + 1).fill(0);

    for (let indice = 0; indice < polinomio.length; indice += 1) {
      siguiente[indice] ^= polinomio[indice];
      siguiente[indice + 1] ^= multiplicar(polinomio[indice], exponentes[potencia]);
    }

    polinomio = siguiente;
  }

  return polinomio;
}

function crearCorreccion(datos: number[]): number[] {
  const generador = polinomioGenerador(CORRECCION);
  const resto = new Array<number>(CORRECCION).fill(0);

  for (const byte of datos) {
    const factor = byte ^ resto[0];
    resto.shift();
    resto.push(0);

    for (let indice = 0; indice < CORRECCION; indice += 1) {
      resto[indice] ^= multiplicar(generador[indice + 1], factor);
    }
  }

  return resto;
}

function crearDatos(texto: string): number[] {
  const bytes = Array.from(new TextEncoder().encode(texto));
  const capacidadBits = DATOS * 8;
  const bits: number[] = [];

  const agregar = (numero: number, cantidad: number) => {
    for (let indice = cantidad - 1; indice >= 0; indice -= 1) {
      bits.push((numero >>> indice) & 1);
    }
  };

  if (bytes.length > 78) {
    throw new Error('La URL excede la capacidad del QR propio (78 bytes).');
  }

  agregar(0b0100, 4);
  agregar(bytes.length, 8);
  for (const byte of bytes) agregar(byte, 8);

  const terminador = Math.min(4, capacidadBits - bits.length);
  agregar(0, terminador);
  while (bits.length % 8 !== 0) bits.push(0);

  const datos: number[] = [];
  for (let indice = 0; indice < bits.length; indice += 8) {
    let byte = 0;
    for (let bit = 0; bit < 8; bit += 1) byte = (byte << 1) | bits[indice + bit];
    datos.push(byte);
  }

  let alternar = false;
  while (datos.length < DATOS) {
    datos.push(alternar ? 0x11 : 0xec);
    alternar = !alternar;
  }

  return [...datos, ...crearCorreccion(datos)];
}

function patronBusqueda(
  modulos: Array<Array<boolean | null>>,
  fila: number,
  columna: number,
): void {
  for (let y = -1; y <= 7; y += 1) {
    for (let x = -1; x <= 7; x += 1) {
      const destinoY = fila + y;
      const destinoX = columna + x;
      if (destinoY < 0 || destinoY >= LADO || destinoX < 0 || destinoX >= LADO) continue;

      const oscuro =
        x >= 0 &&
        x <= 6 &&
        y >= 0 &&
        y <= 6 &&
        (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));

      modulos[destinoY][destinoX] = oscuro;
    }
  }
}

function patronesFijos(modulos: Array<Array<boolean | null>>): void {
  patronBusqueda(modulos, 0, 0);
  patronBusqueda(modulos, 0, LADO - 7);
  patronBusqueda(modulos, LADO - 7, 0);

  for (let indice = 8; indice < LADO - 8; indice += 1) {
    if (modulos[6][indice] === null) modulos[6][indice] = indice % 2 === 0;
    if (modulos[indice][6] === null) modulos[indice][6] = indice % 2 === 0;
  }

  const centros = [6, 26];
  for (const centroY of centros) {
    for (const centroX of centros) {
      if (modulos[centroY][centroX] !== null) continue;

      for (let y = -2; y <= 2; y += 1) {
        for (let x = -2; x <= 2; x += 1) {
          modulos[centroY + y][centroX + x] = Math.max(Math.abs(x), Math.abs(y)) !== 1;
        }
      }
    }
  }
}

function bitsFormato(mascara: number): number {
  const datos = (0b01 << 3) | mascara;
  let resto = datos << 10;

  for (let bit = 14; bit >= 10; bit -= 1) {
    if (((resto >>> bit) & 1) === 1) resto ^= 0x537 << (bit - 10);
  }

  return ((datos << 10) | resto) ^ 0x5412;
}

function colocarFormato(modulos: Array<Array<boolean | null>>, mascara: number): void {
  const bits = bitsFormato(mascara);

  for (let indice = 0; indice < 15; indice += 1) {
    const oscuro = ((bits >>> indice) & 1) === 1;

    if (indice < 6) modulos[indice][8] = oscuro;
    else if (indice < 8) modulos[indice + 1][8] = oscuro;
    else modulos[LADO - 15 + indice][8] = oscuro;

    if (indice < 8) modulos[8][LADO - indice - 1] = oscuro;
    else if (indice === 8) modulos[8][7] = oscuro;
    else modulos[8][15 - indice - 1] = oscuro;
  }

  modulos[LADO - 8][8] = true;
}

function aplicarMascara(mascara: number, fila: number, columna: number): boolean {
  switch (mascara) {
    case 0:
      return (fila + columna) % 2 === 0;
    case 1:
      return fila % 2 === 0;
    case 2:
      return columna % 3 === 0;
    case 3:
      return (fila + columna) % 3 === 0;
    case 4:
      return (Math.floor(fila / 2) + Math.floor(columna / 3)) % 2 === 0;
    case 5:
      return ((fila * columna) % 2) + ((fila * columna) % 3) === 0;
    case 6:
      return (((fila * columna) % 2) + ((fila * columna) % 3)) % 2 === 0;
    default:
      return (((fila + columna) % 2) + ((fila * columna) % 3)) % 2 === 0;
  }
}

function colocarDatos(
  modulos: Array<Array<boolean | null>>,
  codigo: number[],
  mascara: number,
): void {
  let fila = LADO - 1;
  let direccion = -1;
  let indiceByte = 0;
  let indiceBit = 7;

  for (let columna = LADO - 1; columna > 0; columna -= 2) {
    if (columna === 6) columna -= 1;

    while (true) {
      for (let desplazamiento = 0; desplazamiento < 2; desplazamiento += 1) {
        const x = columna - desplazamiento;
        if (modulos[fila][x] !== null) continue;

        let oscuro = false;
        if (indiceByte < codigo.length) {
          oscuro = ((codigo[indiceByte] >>> indiceBit) & 1) === 1;
        }

        if (aplicarMascara(mascara, fila, x)) oscuro = !oscuro;
        modulos[fila][x] = oscuro;

        indiceBit -= 1;
        if (indiceBit < 0) {
          indiceByte += 1;
          indiceBit = 7;
        }
      }

      fila += direccion;
      if (fila < 0 || fila >= LADO) {
        fila -= direccion;
        direccion *= -1;
        break;
      }
    }
  }
}

function penalizacion(matriz: MatrizQr): number {
  let puntos = 0;

  const puntuarLinea = (linea: boolean[]) => {
    let racha = 1;
    for (let indice = 1; indice < linea.length; indice += 1) {
      if (linea[indice] === linea[indice - 1]) racha += 1;
      else {
        if (racha >= 5) puntos += 3 + racha - 5;
        racha = 1;
      }
    }
    if (racha >= 5) puntos += 3 + racha - 5;

    const patronA = '10111010000';
    const patronB = '00001011101';
    const cadena = linea.map((modulo) => (modulo ? '1' : '0')).join('');
    for (let indice = 0; indice <= cadena.length - 11; indice += 1) {
      const tramo = cadena.slice(indice, indice + 11);
      if (tramo === patronA || tramo === patronB) puntos += 40;
    }
  };

  for (let fila = 0; fila < LADO; fila += 1) {
    puntuarLinea(matriz[fila]);
    puntuarLinea(matriz.map((linea) => linea[fila]));
  }

  for (let fila = 0; fila < LADO - 1; fila += 1) {
    for (let columna = 0; columna < LADO - 1; columna += 1) {
      const valorModulo = matriz[fila][columna];
      if (
        matriz[fila][columna + 1] === valorModulo &&
        matriz[fila + 1][columna] === valorModulo &&
        matriz[fila + 1][columna + 1] === valorModulo
      ) {
        puntos += 3;
      }
    }
  }

  const oscuros = matriz.flat().filter(Boolean).length;
  puntos += Math.floor(Math.abs((oscuros * 100) / (LADO * LADO) - 50) / 5) * 10;

  return puntos;
}

function construirMatriz(codigo: number[], mascara: number): MatrizQr {
  const modulos = Array.from({ length: LADO }, () =>
    new Array<boolean | null>(LADO).fill(null),
  );

  patronesFijos(modulos);
  colocarFormato(modulos, mascara);
  colocarDatos(modulos, codigo, mascara);

  return modulos.map((fila) => fila.map(Boolean));
}

/** Devuelve una matriz QR lista para pintar. */
export function crearMatrizQr(texto: string): MatrizQr {
  const codigo = crearDatos(texto);
  let mejor = construirMatriz(codigo, 0);
  let menorPenalizacion = penalizacion(mejor);

  for (let mascara = 1; mascara < 8; mascara += 1) {
    const candidata = construirMatriz(codigo, mascara);
    const puntos = penalizacion(candidata);
    if (puntos < menorPenalizacion) {
      mejor = candidata;
      menorPenalizacion = puntos;
    }
  }

  return mejor;
}

/** Pinta el QR con módulos enteros y margen reglamentario para que se escanee con nitidez. */
export function dibujarQr(canvas: HTMLCanvasElement, texto: string): void {
  const matriz = crearMatrizQr(texto);
  const escala = 8;
  const total = (matriz.length + MARGEN * 2) * escala;
  const contexto = canvas.getContext('2d');
  if (!contexto) throw new Error('El navegador no permite dibujar el código QR.');

  canvas.width = total;
  canvas.height = total;
  contexto.imageSmoothingEnabled = false;
  contexto.fillStyle = 'rgb(255 255 255)';
  contexto.fillRect(0, 0, total, total);
  contexto.fillStyle = 'rgb(0 0 0)';

  for (let fila = 0; fila < matriz.length; fila += 1) {
    for (let columna = 0; columna < matriz.length; columna += 1) {
      if (!matriz[fila][columna]) continue;
      contexto.fillRect(
        (columna + MARGEN) * escala,
        (fila + MARGEN) * escala,
        escala,
        escala,
      );
    }
  }
}
