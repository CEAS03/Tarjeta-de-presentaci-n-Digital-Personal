export type OrigenVisita = 'nfc' | 'qr' | 'link' | 'directo';
export type AlcanceCompartido = 'hub' | 'alsai' | 'blindafon';

export const URL_CANONICA = 'https://carlos.agencia-alsai.com/';

const CLAVE_SESION = 'tarjeta-carlos:origen';
const origenesValidos = new Set<OrigenVisita>(['nfc', 'qr', 'link', 'directo']);

let origenEnMemoria: OrigenVisita | undefined;

function esOrigenValido(valor: string | null): valor is OrigenVisita {
  return valor !== null && origenesValidos.has(valor as OrigenVisita);
}

function guardarOrigen(origen: OrigenVisita): void {
  origenEnMemoria = origen;

  try {
    sessionStorage.setItem(CLAVE_SESION, origen);
  } catch {
    // La atribución mejora la medición, pero nunca debe impedir abrir la tarjeta.
  }
}

/**
 * Lee y conserva el canal de entrada para los eventos de analítica. El valor no
 * se convierte en contenido visible ni altera la experiencia del visitante.
 */
export function leerOrigen(busqueda?: string): OrigenVisita {
  const consulta =
    busqueda ?? (typeof window === 'undefined' ? '' : window.location.search);
  const valor = new URLSearchParams(consulta).get('src');

  if (esOrigenValido(valor)) {
    guardarOrigen(valor);
    return valor;
  }

  if (origenEnMemoria) return origenEnMemoria;

  try {
    const guardado = sessionStorage.getItem(CLAVE_SESION);
    if (esOrigenValido(guardado)) {
      origenEnMemoria = guardado;
      return guardado;
    }
  } catch {
    // Los navegadores con almacenamiento bloqueado continúan como acceso directo.
  }

  guardarOrigen('directo');
  return 'directo';
}

/** Crea un enlace estable y atribuible, independiente del dominio de vista previa. */
export function crearUrlCompartir(
  alcance: AlcanceCompartido,
  origen: Extract<OrigenVisita, 'qr' | 'link'>,
): string {
  const url = new URL(URL_CANONICA);
  url.searchParams.set('src', origen);

  if (alcance !== 'hub') url.searchParams.set('m', alcance);

  return url.toString();
}
