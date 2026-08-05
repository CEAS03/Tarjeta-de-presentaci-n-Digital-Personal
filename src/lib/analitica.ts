import { tarjeta, type ClaveMarca } from '../config/tarjeta';
import { leerOrigen } from './origen';

export type MarcaAnalitica = 'hub' | ClaveMarca;

export type EventoAnalitica =
  | 'card_open'
  | 'brand_selected'
  | 'vcard_saved'
  | 'whatsapp_click'
  | 'schedule_call_click'
  | 'link_click'
  | 'share_click';

type ValorParametro = string | number | boolean;
type ParametrosEvento = Readonly<Record<string, ValorParametro>>;
type FuncionGtag = (...argumentos: unknown[]) => void;

interface VentanaAnalitica extends Window {
  dataLayer?: unknown[];
  gtag?: FuncionGtag;
}

let iniciada = false;
let aperturaRegistrada = false;

function obtenerVentana(): VentanaAnalitica {
  return window as VentanaAnalitica;
}

/**
 * Carga GA4 una sola vez. `gtag` debe empujar el objeto `arguments`: gtag.js
 * no interpreta igual un arreglo creado a mano.
 */
export function iniciarAnalitica(): void {
  if (iniciada || typeof window === 'undefined') return;
  iniciada = true;

  const ventana = obtenerVentana();
  ventana.dataLayer = ventana.dataLayer ?? [];

  const gtag = function (this: unknown) {
    ventana.dataLayer!.push(arguments);
  } as FuncionGtag;

  ventana.gtag = gtag;

  if (!document.getElementById('ga4-loader')) {
    const cargador = document.createElement('script');
    cargador.id = 'ga4-loader';
    cargador.async = true;
    cargador.src = `https://www.googletagmanager.com/gtag/js?id=${tarjeta.analitica.ga4Id}`;
    document.head.appendChild(cargador);
  }

  gtag('js', new Date());
  gtag('config', tarjeta.analitica.ga4Id, {
    send_page_view: false,
    cookie_domain: 'agencia-alsai.com',
    debug_mode: tarjeta.analitica.debug,
  });
}

/** Registra un evento con marca y origen en todos los casos. */
export function registrarEvento(
  evento: EventoAnalitica,
  marca: MarcaAnalitica,
  parametros: ParametrosEvento = {},
): void {
  if (typeof window === 'undefined') return;
  iniciarAnalitica();

  const completos = {
    ...parametros,
    marca,
    origen: leerOrigen(),
  };

  if (tarjeta.analitica.debug) {
    console.info(`[analítica] ${evento}`, completos);
  }

  obtenerVentana().gtag?.('event', evento, completos);
}

/** Evita duplicar `card_open` durante el montaje doble de React StrictMode. */
export function registrarApertura(marca: MarcaAnalitica): void {
  if (aperturaRegistrada) return;
  aperturaRegistrada = true;
  registrarEvento('card_open', marca);
}
