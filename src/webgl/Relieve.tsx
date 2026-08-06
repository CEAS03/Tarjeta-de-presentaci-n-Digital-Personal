import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Vec2, Vec3 } from 'ogl';
import { FRAG, VERT } from './relieve.glsl';
import { PALETA, type Marca } from '../config/paleta';
import { obtenerInclinacion } from '../lib/inclinacion';
import { crearMonitorFps } from '../lib/monitorFps';

/** Grosor base de la línea, en píxeles CSS. Valor cerrado por Carlos. */
const GROSOR_CSS = 0.45;
/** Cuánto se aplana el relieve bajo el texto. Ver DIRECCION-DE-ARTE.md §2. */
const CALMA = 0.85;

/**
 * El fondo. Un quad a pantalla completa con el shader del relieve.
 * Especificación y valores en DIRECCION-DE-ARTE.md §2.
 */
export default function Relieve({ marca }: { marca: Marca }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const marcaRef = useRef<Marca>(marca);
  marcaRef.current = marca;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const congelado = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let escala = 1;

    const renderer = new Renderer({
      canvas,
      // Transparente hasta el primer cuadro: si WebGL no llega a dibujar,
      // el degradado CSS de respaldo permanece visible.
      alpha: true,
      antialias: false,
      dpr: Math.min(devicePixelRatio || 1, 2),
      // El shader usa GLSL ES 1.00 y fwidth mediante OES_standard_derivatives.
      // Forzar WebGL 1 evita compilarlo como GLSL 1.00 dentro de un contexto WebGL 2.
      webgl: 1,
    });
    const gl = renderer.gl;

    const p0 = PALETA.hub;
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uRes: { value: new Vec2(1, 1) },
        uTiempo: { value: 0 },
        uLuz: { value: new Vec2(0, 0) },
        uFondo: { value: new Vec3(...p0.fondo) },
        uAcento: { value: new Vec3(...p0.acento) },
        uAcento2: { value: new Vec3(...p0.acento2) },
        uGrosor: { value: GROSOR_CSS },
        uCalma: { value: CALMA },
      },
    });

    if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
      console.error('No se pudo enlazar el shader del relieve; se conserva el fondo CSS.');
      program.remove();
      gl.deleteShader(program.vertexShader);
      gl.deleteShader(program.fragmentShader);
      return;
    }

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const redimensionar = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2) * escala;
      renderer.dpr = dpr;
      renderer.setSize(innerWidth, innerHeight);
      program.uniforms.uRes.value.set(gl.canvas.width, gl.canvas.height);
      // El grosor viaja en píxeles de dispositivo: así una línea de 0.45 px CSS
      // se ve igual de fina en cualquier teléfono, y no cambia cuando el
      // monitor de FPS baja la escala de render.
      program.uniforms.uGrosor.value = GROSOR_CSS * dpr;
    };
    redimensionar();
    addEventListener('resize', redimensionar);

    // Movimiento reducido conserva el relieve como textura, pero deja fija
    // tanto la superficie como la luz y no registra sensores ni puntero.
    const inclinacion = congelado ? null : obtenerInclinacion();
    const monitor = crearMonitorFps((nueva) => {
      escala = nueva;
      redimensionar();
    });

    let raf = 0;
    let anterior = performance.now();

    const bucle = (ahora: number) => {
      raf = requestAnimationFrame(bucle);
      const dt = Math.min((ahora - anterior) / 1000, 0.1);
      anterior = ahora;
      monitor(dt, ahora);

      // VEL 0.80: la velocidad de la deriva propia de las ondas.
      // Congelado no avanza el tiempo, así que la superficie queda quieta.
      if (!congelado) program.uniforms.uTiempo.value += dt * 0.8;

      if (inclinacion) {
        const luz = inclinacion.leer(dt);
        program.uniforms.uLuz.value.set(luz.x, luz.y);
      }

      // La paleta persigue a la marca activa: el fondo cambia de marca junto con la página.
      const destino = PALETA[marcaRef.current];
      const k = 1 - Math.pow(0.001, dt); // ≈ 1 s para asentarse, sea cual sea el ritmo
      (['fondo', 'acento', 'acento2'] as const).forEach((campo) => {
        const u = program.uniforms[
          campo === 'fondo' ? 'uFondo' : campo === 'acento' ? 'uAcento' : 'uAcento2'
        ].value as Vec3;
        const d = destino[campo];
        u.x += (d[0] - u.x) * k;
        u.y += (d[1] - u.y) * k;
        u.z += (d[2] - u.z) * k;
      });

      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(bucle);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', redimensionar);
      // La inclinación es compartida y la sigue usando la invitación: no se destruye aquí.
      mesh.geometry.remove();
      program.remove();
      gl.deleteShader(program.vertexShader);
      gl.deleteShader(program.fragmentShader);
    };
  }, []);

  return <canvas ref={ref} className="relieve" aria-hidden="true" />;
}
