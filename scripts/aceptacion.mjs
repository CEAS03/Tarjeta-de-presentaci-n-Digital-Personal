/**
 * aceptacion.mjs — comprueba el criterio de aceptación de DIRECCION-DE-ARTE.md §11.
 *
 * OJO: esto NO aprueba diseño. Mide desbordamiento, errores y movimiento
 * reducido. La aprobación de la capa visual la da Carlos abriéndola en su
 * teléfono, y ya se cometió una vez el error de confundir las dos cosas.
 *
 * Uso: node scripts/aceptacion.mjs https://192.168.101.6:5193
 */
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = process.argv[2] ?? 'http://localhost:5190';
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const VIEWPORTS = [
  { nombre: 'movil', width: 390, height: 844 },
  { nombre: 'grande', width: 430, height: 932 },
];
const ESTADOS = ['', '?m=alsai', '?m=blindafon'];

const navegador = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--enable-gpu', '--use-gl=angle', '--ignore-certificate-errors'],
});

let fallos = 0;
const anotar = (ok, texto) => {
  console.log(`${ok ? '  OK  ' : ' FALLA'} ${texto}`);
  if (!ok) fallos++;
};

// ── 1 a 6: desbordamiento horizontal y errores de consola ──────────────────
for (const vp of VIEWPORTS) {
  for (const estado of ESTADOS) {
    const p = await navegador.newPage();
    const errores = [];
    p.on('pageerror', (e) => errores.push(e.message));
    p.on('console', (m) => {
      if (m.type() === 'error') errores.push(m.text());
    });
    await p.setViewport({ ...vp, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p.goto(`${base}/${estado}`, { waitUntil: 'networkidle0' });
    await esperar(1500);

    const desborde = await p.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    const etiqueta = `${vp.nombre} ${estado || 'hub'}`;
    anotar(desborde <= 0, `sin desbordamiento horizontal (${etiqueta}) — sobra ${desborde}px`);
    anotar(errores.length === 0, `sin errores de consola (${etiqueta}) ${errores[0] ?? ''}`);
    await p.close();
  }
}

// ── 7: prefers-reduced-motion congela el relieve pero lo deja visible ───────
{
  const p = await navegador.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.goto(base, { waitUntil: 'networkidle0' });
  await esperar(2000);

  const a = await p.screenshot({ encoding: 'base64' });
  await esperar(2000);
  const b = await p.screenshot({ encoding: 'base64' });
  anotar(a === b, 'con movimiento reducido, dos capturas separadas 2 s son idénticas');

  // El relieve tiene que seguir VISIBLE: congelado no es apagado.
  const visible = await p.evaluate(() => {
    const c = document.querySelector('canvas.relieve');
    if (!c) return false;
    const r = c.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(c).display !== 'none';
  });
  anotar(visible, 'el relieve sigue visible con movimiento reducido');
  await p.close();
}

await navegador.close();
console.log(fallos === 0 ? '\nTodo en orden.' : `\n${fallos} comprobación(es) fallida(s).`);
process.exit(fallos === 0 ? 0 : 1);
