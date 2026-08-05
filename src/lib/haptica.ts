export type PatronHaptico = number | number[];

/** Activa una vibración breve cuando el navegador la admite. */
export function haptica(patron: PatronHaptico = 18): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(patron);
    }
  } catch {
    // La háptica es un refuerzo opcional y nunca debe bloquear la acción principal.
  }
}
