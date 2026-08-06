/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  FUENTE ÚNICA DE DATOS DE LA TARJETA
 *  Ningún componente lleva datos duros. Todo lo editable vive aquí.
 *
 *  Los datos de cada marca están COPIADOS de su fuente el 2026-08-05.
 *  No hay sincronización automática y no debe haberla: acoplaría tres repos.
 *    · ALSAI     → Tarjeta . Landing ALSAI Claude\src\config\site.ts
 *    · Blindafón → Blindafon\Website\DATOS-NEGOCIO.md
 *  Si un dato cambia allá, se actualiza aquí a mano. NUNCA de memoria.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ClaveMarca = 'alsai' | 'blindafon';

export type Red = { nombre: string; url: string };

export type DatosMarca = {
  nombre: string;
  /** Ruta al logo. null = se usa el nombre en tipografía. */
  logoSrc: string | null;
  /**
   * ¿El archivo del logo ya trae escrito el nombre de la marca?
   *
   * ALSAI sí: su logo es un lockup con «ALSAI» y «Agencia» dentro de la imagen.
   * Blindafón NO desde el activo nuevo del 2026-08-05: es un cohete-teléfono en
   * 3D, solo símbolo. El logo anterior sí llevaba el wordmark, y al cambiarlo el
   * nombre de la marca dejó de leerse en toda la pantalla.
   *
   * Cuando es `false`, la rama escribe el nombre en tipografía debajo del
   * símbolo. No es decoración: sin eso, quien abre la tarjeta ve un cohete y no
   * sabe cómo se llama el negocio.
   */
  logoIncluyeNombre: boolean;
  resumen: string;
  rol: string;
  descripcion: string;
  /** Dato verificado que da credibilidad. Vacío = no se muestra nada. NO INVENTAR. */
  prueba: string;
  whatsapp: string;
  mensajeWa: string;
  /** Vacío a propósito en Blindafón: no tiene correo. La línea del .vcf se omite. */
  correo: string;
  sitio: string;
  redes: Red[];
  /** Endpoint de agendado. Vacío = el botón abre WhatsApp con `mensajeAgenda`. */
  agendaUrl: string;
  textoAgenda: string;
  descripcionAgenda: string;
  mensajeAgenda: string;
};

export const tarjeta = {
  persona: {
    nombre: 'Carlos Álvarez',
    nombreVcard: {
      nombres: 'Carlos',
      apellidos: 'Álvarez',
    },
    ciudad: 'Querétaro, México',
    direccionVcard: {
      localidad: 'Querétaro',
      region: 'Qro.',
      pais: 'México',
    },
    descripcion:
      'Soy un emprendedor que combina tecnología, creatividad e innovación para convertir ' +
      'ideas en soluciones que ayuden a la gente.',
    pregunta: '¿Qué parte de mi trabajo quieres conocer?',
    fotoSrc: '/carlos.webp',
    fotoVcardSrc: '/carlos-vcard.jpg',
  },

  acciones: {
    guardarPersonal: 'Guardar mis datos',
    guardarContacto: 'Guardar contacto',
    whatsapp: 'WhatsApp',
    volver: 'Volver',
    cerrar: 'Cerrar',
    continuarWhatsapp: 'Continuar por WhatsApp',
    compartir: 'Compartir',
  },

  marcas: {
    alsai: {
      nombre: 'Agencia ALSAI',
      logoSrc: '/alsai-blanco.webp',
      logoIncluyeNombre: true,
      resumen: 'Inteligencia artificial y marketing para empresas',
      rol: 'Fundador',
      descripcion:
        'Agencia de inteligencia artificial y marketing en Querétaro. Ayudo a empresas a ' +
        'conseguir más clientes y a automatizar sus procesos: marketing, IA, WhatsApp y CRM ' +
        'funcionando como un solo sistema.',
      prueba: '',
      whatsapp: '+524423961718',
      mensajeWa: 'Hola Carlos, vi tu tarjeta digital y quiero saber más sobre ALSAI.',
      correo: 'agencia.alsai@gmail.com',
      sitio: 'https://www.agencia-alsai.com/',
      redes: [{ nombre: 'Instagram', url: 'https://www.instagram.com/agencia.alsai/' }],
      agendaUrl: '',
      textoAgenda: 'Agendar una llamada',
      descripcionAgenda: 'Coordinemos la llamada por WhatsApp con un mensaje preparado.',
      mensajeAgenda: 'Hola Carlos, quiero agendar una llamada sobre ALSAI.',
    },
    blindafon: {
      nombre: 'Blindafón',
      logoSrc: '/blindafon.webp',
      logoIncluyeNombre: false,
      resumen: 'Blindaje nanotecnológico para pantallas',
      rol: 'Fundador',
      descripcion:
        'Blindaje líquido nanotecnológico para las pantallas de tus dispositivos. ' +
        'Se aplica en 20 minutos, a domicilio en Querétaro.',
      prueba: '+860 dispositivos blindados',
      whatsapp: '+524428115588',
      mensajeWa: 'Hola, vi tu tarjeta digital y quiero saber más sobre Blindafón.',
      correo: '',
      sitio: 'https://blindafon.com',
      redes: [
        { nombre: 'Instagram', url: 'https://www.instagram.com/blindafon_' },
        { nombre: 'TikTok', url: 'https://tiktok.com/@blindafon' },
        { nombre: 'Facebook', url: 'https://www.facebook.com/share/18qeNWZzGr/' },
      ],
      agendaUrl: '',
      textoAgenda: 'Agendar mi blindaje',
      descripcionAgenda: 'Coordinemos tu blindaje por WhatsApp con un mensaje preparado.',
      mensajeAgenda: 'Hola, quiero agendar mi blindaje a domicilio.',
    },
  } satisfies Record<ClaveMarca, DatosMarca>,

  /** Si algún Android rechaza el .vcf, poner en false: se genera sin foto. */
  vcardConFoto: true,

  analitica: {
    ga4Id: 'G-N6QL5MFY5T',
    debug: (import.meta.env.VITE_ANALYTICS_DEBUG as string | undefined) === 'true' || import.meta.env.DEV,
  },
} as const;

/** Enlace de WhatsApp listo, con el mensaje precargado para atribuir el lead. */
export function enlaceWa(telefono: string, mensaje: string) {
  return `https://wa.me/${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
}
