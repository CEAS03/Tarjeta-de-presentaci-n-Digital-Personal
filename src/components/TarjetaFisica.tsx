import { useEffect, useRef } from 'react';
import { crearInclinacion } from '../lib/inclinacion';
import Retrato from './Retrato';

type PropiedadesTarjetaFisica = {
  fotoSrc: string;
  nombre: string;
};

/**
 * Representación digital de la tarjeta NFC que originó la visita.
 * Comparte el resorte del relieve para que tarjeta y luz respondan como una sola superficie.
 */
export function TarjetaFisica({ fotoSrc, nombre }: PropiedadesTarjetaFisica) {
  const tarjetaRef = useRef<HTMLDivElement>(null);
  const reflejoRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tarjeta = tarjetaRef.current;
    const reflejo = reflejoRef.current;
    const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!tarjeta || !reflejo || reducirMovimiento.matches) return;

    const inclinacion = crearInclinacion();
    let cuadro = 0;
    let anterior = performance.now();

    const animar = (ahora: number) => {
      const dt = Math.min((ahora - anterior) / 1000, 0.05);
      anterior = ahora;
      const { x, y } = inclinacion.leer(dt);

      tarjeta.style.transform = `rotateX(${(-y * 8).toFixed(3)}deg) rotateY(${(
        x * 10
      ).toFixed(3)}deg)`;
      reflejo.style.transform = `translate3d(${(x * 34).toFixed(2)}%, ${(
        -y * 28
      ).toFixed(2)}%, 2rem)`;
      reflejo.style.opacity = String(0.3 + Math.max(0, x - y) * 0.13);

      cuadro = window.requestAnimationFrame(animar);
    };

    cuadro = window.requestAnimationFrame(animar);

    return () => {
      window.cancelAnimationFrame(cuadro);
      inclinacion.destruir();
    };
  }, []);

  return (
    <div className="tarjeta-fisica__escena">
      <div className="tarjeta-fisica" ref={tarjetaRef}>
        <span className="tarjeta-fisica__borde" aria-hidden="true" />
        <span className="tarjeta-fisica__reflejo" ref={reflejoRef} aria-hidden="true" />
        <span className="tarjeta-fisica__canto" aria-hidden="true" />

        <Retrato src={fotoSrc} nombre={nombre} />

        <span className="tarjeta-fisica__rutas" aria-hidden="true">
          <span className="tarjeta-fisica__ruta tarjeta-fisica__ruta--alsai" />
          <span className="tarjeta-fisica__ruta tarjeta-fisica__ruta--blindafon" />
        </span>

        <svg
          className="tarjeta-fisica__nfc"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M7 8.5a5 5 0 0 1 0 7M10 10a2.8 2.8 0 0 1 0 4M4 6a8.5 8.5 0 0 1 0 12" />
        </svg>
      </div>
    </div>
  );
}

export default TarjetaFisica;
