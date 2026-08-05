/**
 * mirar.mjs — capturas REALES de la tarjeta, para juzgar el acabado con los ojos.
 *
 * Por qué existe: el panel de navegador de esta máquina está oculto y ahí no corre
 * requestAnimationFrame, así que readPixels devuelve negro y el WebGL sale en blanco.
 * La única forma de ver de verdad es puppeteer-core contra el Chrome del sistema.
 *
 * Uso:
 *   node scripts/mirar.mjs <url-base> <carpeta-salida> [--luz x,y]
 *
 * Ejemplo:
 *   node scripts/mirar.mjs http://localhost:5190 scripts/capturas/antes
 *
 * Trampa conocida: en headless, --window-size por debajo de 500 px miente y recorta.
 * El viewport se fuerza por CDP con Emulation.setDeviceMetricsOverride.
 */
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = process.argv[2] ?? 'http://localhost:5190';
const salida = process.argv[3] ?? 'scripts/capturas';

const argLuz = process.argv.find((a) => a.startsWith('--luz='));
const luz = argLuz ? argLuz.slice(6).split(',').map(Number) : [0.62, 0.3];

const VIEWPORTS = [
  { nombre: 'movil', width: 390, height: 844, dpr: 3 },
  { nombre: 'grande', width: 430, height: 932, dpr: 3 },
];
const ESTADOS = [
  { nombre: 'hub', query: '' },
  { nombre: 'alsai', query: '?m=alsai' },
  { nombre: 'blindafon', query: '?m=blindafon' },
];

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir(salida, { recursive: true });

const navegador = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--enable-gpu', '--use-gl=angle', '--ignore-certificate-errors'],
});

const errores = [];

for (const vp of VIEWPORTS) {
  const pagina = await navegador.newPage();
  pagina.on('pageerror', (e) => errores.push(`[${vp.nombre}] ${e.message}`));
  pagina.on('console', (m) => {
    if (m.type() === 'error') errores.push(`[${vp.nombre}] consola: ${m.text()}`);
  });

  // setViewport además del override por CDP: sin él la captura sale con banda negra.
  await pagina.setViewport({
    width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, isMobile: true, hasTouch: true,
  });
  const cdp = await pagina.createCDPSession();
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, mobile: true,
  });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });

  for (const estado of ESTADOS) {
    await pagina.goto(`${base}/${estado.query}`, { waitUntil: 'networkidle0' });
    // El WebGL entra con import dinámico tras el primer pintado; hay que darle aire.
    await esperar(1200);
    // Sin giroscopio, el puntero hace de luz. Se mueve y se espera al resorte lento.
    await pagina.mouse.move(vp.width * luz[0], vp.height * luz[1], { steps: 24 });
    await esperar(3200);

    const archivo = path.join(salida, `${vp.nombre}-${estado.nombre}.png`);
    await pagina.screenshot({ path: archivo });
    console.log('captura:', archivo);
  }
  await pagina.close();
}

await navegador.close();

if (errores.length) {
  console.log('\nERRORES DE PÁGINA:');
  for (const e of [...new Set(errores)]) console.log(' -', e);
} else {
  console.log('\nSin errores de consola.');
}
