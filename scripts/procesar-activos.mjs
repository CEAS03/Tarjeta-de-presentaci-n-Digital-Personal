/**
 * procesar-activos.mjs — convierte los originales que entrega Carlos a los
 * activos que consume la tarjeta.
 *
 * Por qué con puppeteer y no con sharp: sharp es una dependencia nativa pesada y
 * aquí solo hacen falta dos redimensionados y dos codificaciones. El Chrome del
 * sistema ya está en la máquina para las capturas, y su canvas hace webp y jpeg
 * nativamente. Cero dependencias nuevas.
 *
 * Uso: node scripts/procesar-activos.mjs
 */
import puppeteer from 'puppeteer-core';
import { readFile, writeFile, stat } from 'node:fs/promises';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

/* origen → destino. `recorte` es el lado del cuadrado de salida; `calidad` va de
   0 a 1. `fondo` null conserva la transparencia (obligatorio para el logo). */
const TRABAJOS = [
  /* 768 y no más: el original es 775x780, asi que pasar de ahi seria AMPLIAR.
     Se muestra a ~133 px CSS, que a dpr 3 son 400 px de dispositivo. */
  { de: 'archivo/originales/Carlos Alvarez 1.1.png', a: 'public/carlos.webp',
    lado: 768, tipo: 'image/webp', calidad: 0.92, fondo: null },
  { de: 'archivo/originales/Carlos Alvarez 1.1.png', a: 'public/carlos-vcard.jpg',
    lado: 400, tipo: 'image/jpeg', calidad: 0.82, fondo: '#ffffff' },
  { de: 'archivo/originales/Logo Blindafon 3D telefono.png', a: 'public/blindafon.webp',
    lado: 520, tipo: 'image/webp', calidad: 0.92, fondo: null },
];

const navegador = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const pagina = await navegador.newPage();

for (const t of TRABAJOS) {
  const bytes = await readFile(t.de);
  const dataUri = `data:image/png;base64,${bytes.toString('base64')}`;

  const salida = await pagina.evaluate(async (uri, lado, tipo, calidad, fondo) => {
    const img = new Image();
    img.src = uri;
    await img.decode();

    const lienzo = document.createElement('canvas');
    lienzo.width = lado;
    lienzo.height = lado;
    const ctx = lienzo.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    if (fondo) { ctx.fillStyle = fondo; ctx.fillRect(0, 0, lado, lado); }

    // Recorte centrado al cuadrado: si el original no lo es, se recorta el lado
    // largo en vez de deformar la imagen.
    const min = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - min) / 2;
    const sy = (img.naturalHeight - min) / 2;
    ctx.drawImage(img, sx, sy, min, min, 0, 0, lado, lado);

    return {
      datos: lienzo.toDataURL(tipo, calidad).split(',')[1],
      origen: `${img.naturalWidth}x${img.naturalHeight}`,
    };
  }, dataUri, t.lado, t.tipo, t.calidad, t.fondo);

  await writeFile(t.a, Buffer.from(salida.datos, 'base64'));
  const antes = (await stat(t.de)).size;
  const despues = (await stat(t.a)).size;
  console.log(
    `${t.a.padEnd(28)} ${salida.origen} → ${t.lado}x${t.lado}   ` +
    `${(antes / 1024).toFixed(0)} kB → ${(despues / 1024).toFixed(0)} kB`,
  );
}

await navegador.close();
