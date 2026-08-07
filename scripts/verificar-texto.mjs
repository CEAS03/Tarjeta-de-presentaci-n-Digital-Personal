/**
 * verificar-texto.mjs — ¿el texto blanco se distingue de las líneas blancas?
 *
 * No lo juzga a ojo. Hace el texto TRANSPARENTE, captura, y mide el píxel más
 * claro que queda justo donde vivían las letras. Si ahí sigue habiendo una
 * línea del relieve casi blanca, el texto blanco se confunde con ella.
 *
 * Devuelve la razón de contraste WCAG entre el blanco del texto y el punto más
 * claro de su propio fondo. AA para texto grande pide 3:1; AAA pide 7:1.
 */
import puppeteer from 'puppeteer-core';

const base = process.argv[2] ?? 'https://localhost:5193';
const nav = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--enable-gpu', '--use-gl=angle', '--ignore-certificate-errors'],
});

const rel = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * rel(r) + 0.7152 * rel(g) + 0.0722 * rel(b);
const contraste = (L) => (1.05) / (L + 0.05); // contra blanco puro

let fallos = 0;

for (const [nombre, q] of [['hub', ''], ['alsai', '?m=alsai'], ['blindafon', '?m=blindafon']]) {
  const p = await nav.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const cdp = await p.createCDPSession();
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await p.goto(`${base}/${q}`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));
  // La luz al pico, que es cuando el relieve más brilla: el peor caso.
  await p.mouse.move(320, 200, { steps: 20 });
  await new Promise((r) => setTimeout(r, 2500));

  const cajas = await p.evaluate(() => {
    /* Transparente el elemento Y SUS DESCENDIENTES. El separador «·» del rol y
       el punto de la prueba llevan `color: var(--acento)` propio, así que no
       heredaban y seguían pintándose: la sonda medía el glifo de color como si
       fuera una línea del fondo y daba dos falsos negativos por rama. */
    document.querySelectorAll('.escrito').forEach((e) => {
      e.style.color = 'transparent';
      e.querySelectorAll('*').forEach((h) => {
        h.style.color = 'transparent';
        h.style.background = 'transparent';
        h.style.boxShadow = 'none';
      });
    });
    /* RECTÁNGULOS POR RENGLÓN, no la caja del bloque.
       `getBoundingClientRect()` de un elemento en línea devuelve la unión de
       todas sus líneas, e incluye el hueco entre renglones — donde NO hay fondo
       y el relieve se ve entero a propósito. Medir ahí daba falsos negativos.
       Un `Range` sobre el contenido devuelve un rectángulo por línea, que es
       exactamente la superficie que cubre el fondo. */
    const cajas = [];
    document.querySelectorAll('.escrito').forEach((e, bloque) => {
      const r = document.createRange();
      r.selectNodeContents(e);
      [...r.getClientRects()].forEach((b) => {
        if (b.width < 4 || b.height < 4) return;
        cajas.push({ bloque: bloque + 1, x: b.x, y: b.y, w: b.width, h: b.height });
      });
    });
    return cajas;
  });
  await new Promise((r) => setTimeout(r, 300));

  const captura = await p.screenshot({ encoding: 'base64' });

  const medidas = await p.evaluate(async (b64, cajas, dpr) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return cajas.map((k) => {
      const d = ctx.getImageData(k.x * dpr, k.y * dpr, Math.max(1, k.w * dpr), Math.max(1, k.h * dpr)).data;
      let max = 0;
      for (let i = 0; i < d.length; i += 4) {
        const v = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        if (v > max) max = v;
      }
      return max;
    });
  }, captura, cajas, 2);

  medidas.forEach((maxCanal, i) => {
    const b = cajas[i].bloque;
    const L = lum(maxCanal, maxCanal, maxCanal);
    const r = contraste(L);
    const ok = r >= 4.5;
    if (!ok) fallos++;
    console.log(
      `${ok ? 'OK  ' : 'MAL '} ${nombre.padEnd(10)} bloque ${b} renglón ${i + 1}: ` +
      `punto más claro del fondo = ${Math.round(maxCanal)}/255, contraste con el texto blanco = ${r.toFixed(1)}:1`,
    );
  });
  await p.close();
}

await nav.close();
console.log(fallos === 0
  ? '\nEl texto blanco se distingue de su fondo en los tres estados, con la luz en su pico.'
  : `\n${fallos} bloque(s) por debajo de 4.5:1.`);
process.exit(fallos === 0 ? 0 : 1);
