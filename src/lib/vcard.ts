import { tarjeta, type ClaveMarca } from '../config/tarjeta';

export type DestinoVcard = 'hub' | ClaveMarca;

type TipoTelefono = 'WORK' | 'CELL';

type DatosVcard = {
  organizacion: string;
  cargo: string;
  telefonos: ReadonlyArray<{ tipo: TipoTelefono; numero: string }>;
  correo: string;
  sitio: string;
  nombreArchivo: string;
};

const RETORNO_DE_CARRO = '\r\n';
const MAXIMO_OCTETOS = 75;

/** Escapa los caracteres reservados de los valores de texto de una vCard 3.0. */
function escaparTexto(valor: string): string {
  return valor
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

/**
 * Pliega una línea sin superar 75 octetos UTF-8. En las continuaciones, el
 * espacio inicial también forma parte de ese límite.
 */
function plegarLinea(linea: string): string[] {
  const codificador = new TextEncoder();
  const lineasFisicas: string[] = [];
  let fragmento = '';
  let octetosFragmento = 0;
  let esPrimera = true;

  for (const caracter of linea) {
    const octetosCaracter = codificador.encode(caracter).byteLength;
    const limiteFragmento = esPrimera ? MAXIMO_OCTETOS : MAXIMO_OCTETOS - 1;

    if (octetosFragmento + octetosCaracter > limiteFragmento) {
      lineasFisicas.push(esPrimera ? fragmento : ` ${fragmento}`);
      esPrimera = false;
      fragmento = caracter;
      octetosFragmento = octetosCaracter;
      continue;
    }

    fragmento += caracter;
    octetosFragmento += octetosCaracter;
  }

  lineasFisicas.push(esPrimera ? fragmento : ` ${fragmento}`);
  return lineasFisicas;
}

function obtenerDatos(destino: DestinoVcard): DatosVcard {
  const alsai = tarjeta.marcas.alsai;

  if (destino === 'hub') {
    return {
      organizacion: alsai.nombre,
      cargo: alsai.rol,
      telefonos: [
        { tipo: 'WORK', numero: alsai.whatsapp },
        { tipo: 'CELL', numero: tarjeta.marcas.blindafon.whatsapp },
      ],
      correo: alsai.correo,
      sitio: alsai.sitio,
      nombreArchivo: 'carlos-alvarez.vcf',
    };
  }

  const marca = tarjeta.marcas[destino];
  return {
    organizacion: marca.nombre,
    cargo: marca.rol,
    telefonos: [{ tipo: 'CELL', numero: marca.whatsapp }],
    correo: marca.correo,
    sitio: marca.sitio,
    nombreArchivo: `carlos-alvarez-${destino}.vcf`,
  };
}

function bytesABase64(bytes: Uint8Array): string {
  const tamanoBloque = 0x8000;
  let binario = '';

  for (let inicio = 0; inicio < bytes.length; inicio += tamanoBloque) {
    binario += String.fromCharCode(...bytes.subarray(inicio, inicio + tamanoBloque));
  }

  return btoa(binario);
}

async function cargarFotoBase64(): Promise<string> {
  const respuesta = await fetch(tarjeta.persona.fotoVcardSrc);

  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar la foto de la vCard (${respuesta.status}).`);
  }

  return bytesABase64(new Uint8Array(await respuesta.arrayBuffer()));
}

/** Genera el contenido completo de una vCard 3.0 con finales de línea CRLF. */
export async function generarVcard(destino: DestinoVcard): Promise<string> {
  const datos = obtenerDatos(destino);
  const { nombres, apellidos } = tarjeta.persona.nombreVcard;
  const { localidad, region, pais } = tarjeta.persona.direccionVcard;
  const lineas = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escaparTexto(apellidos)};${escaparTexto(nombres)};;;`,
    `FN:${escaparTexto(tarjeta.persona.nombre)}`,
    `ORG:${escaparTexto(datos.organizacion)}`,
    `TITLE:${escaparTexto(datos.cargo)}`,
    ...datos.telefonos.map(
      ({ tipo, numero }) => `TEL;TYPE=${tipo}:${escaparTexto(numero)}`,
    ),
    ...(datos.correo ? [`EMAIL:${escaparTexto(datos.correo)}`] : []),
    `URL:${datos.sitio}`,
    `ADR;TYPE=WORK:;;;${escaparTexto(localidad)};${escaparTexto(region)};;${escaparTexto(pais)}`,
  ];

  if (tarjeta.vcardConFoto) {
    lineas.push(`PHOTO;ENCODING=b;TYPE=JPEG:${await cargarFotoBase64()}`);
  }

  lineas.push('END:VCARD');

  return `${lineas.flatMap(plegarLinea).join(RETORNO_DE_CARRO)}${RETORNO_DE_CARRO}`;
}

/** Genera y descarga el archivo correspondiente al hub o a una de las ramas. */
export async function descargarVcard(destino: DestinoVcard): Promise<void> {
  const contenido = await generarVcard(destino);
  const archivo = new Blob([contenido], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');

  enlace.href = url;
  enlace.download = obtenerDatos(destino).nombreArchivo;
  enlace.hidden = true;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
