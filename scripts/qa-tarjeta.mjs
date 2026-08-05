import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import puppeteer from 'puppeteer-core';

const URL_BASE = process.env.QA_URL ?? 'http://127.0.0.1:5191';
const RAIZ = path.resolve(import.meta.dirname, '..');
const DIRECTORIO_CAPTURAS = path.join(RAIZ, 'scripts', 'capturas-qa');

const VISTAS = [
  { nombre: 'movil-390', ancho: 390, alto: 844, movil: true },
  { nombre: 'movil-430', ancho: 430, alto: 932, movil: true },
  { nombre: 'escritorio', ancho: 1280, alto: 800, movil: false },
];

const ESTADOS = [
  { nombre: 'hub', consulta: '?src=nfc', selector: '.hub' },
  { nombre: 'alsai', consulta: '?src=qr&m=alsai', selector: '[data-marca-rama="alsai"]' },
  {
    nombre: 'blindafon',
    consulta: '?src=link&m=blindafon',
    selector: '[data-marca-rama="blindafon"]',
  },
];

const SELECTORES_TEXTO_PRINCIPAL = [
  '.hub__nombre',
  '.hub__descripcion',
  '.hub__pregunta',
  '.boton-marca__nombre',
  '.boton-marca__descripcion',
  '.rama__descripcion',
  '.rama__agendar span',
  '.accion-contacto span',
];

const candidatosChrome = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

function url(consulta = '') {
  return `${URL_BASE.replace(/\/$/, '')}/${consulta}`;
}

function afirmar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}

async function encontrarChrome() {
  for (const candidato of candidatosChrome) {
    try {
      await fs.access(candidato);
      return candidato;
    } catch {
      // Se intenta la siguiente ubicación conocida.
    }
  }
  throw new Error('No se encontró Chrome. Define CHROME_PATH con la ruta al ejecutable.');
}

async function emularVista(pagina, vista) {
  await pagina.setViewport({
    width: vista.ancho,
    height: vista.alto,
    deviceScaleFactor: 1,
    isMobile: vista.movil,
    hasTouch: vista.movil,
  });

  const cliente = await pagina.createCDPSession();
  await cliente.send('Emulation.setDeviceMetricsOverride', {
    width: vista.ancho,
    height: vista.alto,
    deviceScaleFactor: 1,
    mobile: vista.movil,
    screenWidth: vista.ancho,
    screenHeight: vista.alto,
  });
}

function vigilarErrores(pagina) {
  const errores = [];
  pagina.on('console', (mensaje) => {
    if (mensaje.type() === 'error') errores.push(`consola: ${mensaje.text()}`);
  });
  pagina.on('pageerror', (error) => errores.push(`página: ${error.message}`));
  return errores;
}

async function esperarAplicacion(pagina, selector) {
  await pagina.waitForSelector(selector, { visible: true, timeout: 10_000 });
  await pagina.waitForSelector('canvas.relieve', { timeout: 10_000 });
  await pagina.evaluate(
    () => document.fonts?.ready ?? Promise.resolve(),
  );
  await new Promise((resolver) => setTimeout(resolver, 700));
}

async function diagnosticoVisual(pagina) {
  return pagina.evaluate((selectoresTexto) => {
    const convertirColor = (valor) => {
      const lienzo = document.createElement('canvas');
      lienzo.width = 1;
      lienzo.height = 1;
      const contexto = lienzo.getContext('2d');
      if (!contexto) return null;
      contexto.fillStyle = 'rgb(0 0 0)';
      contexto.fillStyle = valor;
      contexto.fillRect(0, 0, 1, 1);
      return [...contexto.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    };

    const luminancia = (rgb) => {
      const canales = rgb.map((canal) => {
        const valor = canal / 255;
        return valor <= 0.04045 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2];
    };

    const fondo = convertirColor(getComputedStyle(document.documentElement).getPropertyValue('--fondo'));
    const contrastes = [];

    if (fondo) {
      for (const selector of selectoresTexto) {
        for (const elemento of document.querySelectorAll(selector)) {
          const caja = elemento.getBoundingClientRect();
          if (caja.width === 0 || caja.height === 0) continue;
          const estilo = getComputedStyle(elemento);
          const frente = convertirColor(estilo.color);
          if (!frente) continue;
          const l1 = luminancia(frente);
          const l2 = luminancia(fondo);
          const proporcion = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          const tamano = Number.parseFloat(estilo.fontSize);
          const peso = Number.parseInt(estilo.fontWeight, 10) || 400;
          const textoGrande = tamano >= 24 || (tamano >= 18.66 && peso >= 700);
          contrastes.push({
            selector,
            texto: elemento.textContent?.trim().slice(0, 60),
            proporcion: Number(proporcion.toFixed(2)),
            minimo: textoGrande ? 3 : 4.5,
          });
        }
      }
    }

    const lienzo = document.querySelector('canvas.relieve');
    let webgl = { existe: false, contexto: false, programa: false, enlazado: false, error: null };
    if (lienzo instanceof HTMLCanvasElement) {
      const gl = lienzo.getContext('webgl');
      const programa = gl?.getParameter(gl.CURRENT_PROGRAM) ?? null;
      webgl = {
        existe: true,
        contexto: Boolean(gl),
        programa: Boolean(programa),
        enlazado: Boolean(gl && programa && gl.getProgramParameter(programa, gl.LINK_STATUS)),
        error: gl ? gl.getError() : null,
      };
    }

    return {
      anchoVista: document.documentElement.clientWidth,
      anchoDocumento: document.documentElement.scrollWidth,
      altoVista: document.documentElement.clientHeight,
      altoDocumento: document.documentElement.scrollHeight,
      contrastes,
      webgl,
      tema: document.querySelector('meta[name="theme-color"]')?.getAttribute('content') ?? '',
    };
  }, SELECTORES_TEXTO_PRINCIPAL);
}

async function revisarEstados(navegador) {
  const resumen = [];

  for (const vista of VISTAS) {
    for (const estado of ESTADOS) {
      const pagina = await navegador.newPage();
      await emularVista(pagina, vista);
      const errores = vigilarErrores(pagina);

      const respuesta = await pagina.goto(url(estado.consulta), {
        waitUntil: 'networkidle2',
        timeout: 30_000,
      });
      afirmar(
        respuesta && respuesta.status() < 400,
        `${vista.nombre}/${estado.nombre}: respuesta HTTP inválida (${respuesta?.status() ?? 'sin respuesta'}).`,
      );
      await esperarAplicacion(pagina, estado.selector);

      const diagnostico = await diagnosticoVisual(pagina);
      afirmar(
        diagnostico.anchoDocumento <= diagnostico.anchoVista,
        `${vista.nombre}/${estado.nombre}: scroll horizontal ${diagnostico.anchoDocumento}px > ${diagnostico.anchoVista}px.`,
      );
      afirmar(
        diagnostico.webgl.contexto && diagnostico.webgl.programa && diagnostico.webgl.enlazado,
        `${vista.nombre}/${estado.nombre}: el relieve WebGL no tiene un programa enlazado.`,
      );
      afirmar(
        diagnostico.webgl.error === 0,
        `${vista.nombre}/${estado.nombre}: WebGL devolvió el error ${diagnostico.webgl.error}.`,
      );

      const contrastesInvalidos = diagnostico.contrastes.filter(
        (contraste) => contraste.proporcion < contraste.minimo,
      );
      afirmar(
        contrastesInvalidos.length === 0,
        `${vista.nombre}/${estado.nombre}: contraste AA insuficiente: ${JSON.stringify(contrastesInvalidos)}.`,
      );

      const archivo = path.join(DIRECTORIO_CAPTURAS, `${vista.nombre}-${estado.nombre}.png`);
      await pagina.screenshot({ path: archivo, captureBeyondViewport: false });
      afirmar(errores.length === 0, `${vista.nombre}/${estado.nombre}: ${errores.join(' | ')}`);

      resumen.push({
        vista: vista.nombre,
        estado: estado.nombre,
        documento: `${diagnostico.anchoDocumento}×${diagnostico.altoDocumento}`,
        webgl: 'programa enlazado',
        tema: diagnostico.tema,
        captura: path.relative(RAIZ, archivo),
      });
      await pagina.close();
    }
  }

  return resumen;
}

async function revisarCompartir(pagina, alcance, urlEsperada) {
  await pagina.click('.compartir__disparador');
  await pagina.waitForSelector('.compartir__dialogo[open]', { visible: true });

  const diagnostico = await pagina.evaluate(() => {
    const lienzo = document.querySelector('.compartir__qr canvas');
    if (!(lienzo instanceof HTMLCanvasElement)) return null;
    const contexto = lienzo.getContext('2d');
    const datos = contexto?.getImageData(0, 0, lienzo.width, lienzo.height).data;
    let oscuros = 0;
    let claros = 0;
    if (datos) {
      for (let indice = 0; indice < datos.length; indice += 4) {
        if (datos[indice] < 80) oscuros += 1;
        if (datos[indice] > 240) claros += 1;
      }
    }
    return {
      ancho: lienzo.width,
      alto: lienzo.height,
      oscuros,
      claros,
      url: document.querySelector('.compartir__url')?.textContent?.trim(),
    };
  });

  afirmar(diagnostico, `${alcance}: no se creó el canvas del QR.`);
  afirmar(diagnostico.ancho > 0 && diagnostico.ancho === diagnostico.alto, `${alcance}: QR sin dimensiones válidas.`);
  afirmar(diagnostico.oscuros > 500 && diagnostico.claros > 500, `${alcance}: QR vacío o monocromático.`);
  afirmar(diagnostico.url === urlEsperada, `${alcance}: URL compartida inesperada: ${diagnostico.url}`);

  await pagina.click('.compartir__accion:not(.compartir__accion--principal)');
  await pagina.waitForFunction(
    () => document.querySelector('.compartir__estado')?.textContent?.includes('Enlace copiado.'),
    { timeout: 5_000 },
  );

  await pagina.click('.compartir__cerrar');
  await pagina.waitForFunction(() => !document.querySelector('.compartir__dialogo[open]'));
}

async function revisarFunciones(navegador) {
  const pagina = await navegador.newPage();
  await emularVista(pagina, VISTAS[0]);
  const errores = vigilarErrores(pagina);
  const leerEventos = () =>
    pagina.evaluate(() =>
      (window.dataLayer ?? [])
        .map((entrada) => Array.from(entrada))
        .filter((entrada) => entrada[0] === 'event')
        .map((entrada) => ({ nombre: entrada[1], parametros: entrada[2] })),
    );

  await pagina.goto(url('?src=nfc'), { waitUntil: 'networkidle2' });
  await esperarAplicacion(pagina, '.hub');
  await revisarCompartir(
    pagina,
    'hub',
    'https://carlos.agencia-alsai.com/?src=link',
  );

  const medicion = pagina.evaluate(
    () =>
      new Promise((resolver) => {
        const marcas = [];
        const inicio = performance.now();
        let cls = 0;
        const observador = new PerformanceObserver((lista) => {
          for (const entrada of lista.getEntries()) cls += entrada.value;
        });
        observador.observe({ type: 'layout-shift' });

        const cuadro = (ahora) => {
          marcas.push(ahora);
          if (ahora - inicio < 1_150) requestAnimationFrame(cuadro);
          else {
            observador.disconnect();
            const intervalos = marcas.slice(1).map((marca, indice) => marca - marcas[indice]);
            const promedio = intervalos.reduce((suma, valor) => suma + valor, 0) / intervalos.length;
            resolver({ fps: 1000 / promedio, cuadros: marcas.length, cls });
          }
        };
        requestAnimationFrame(cuadro);
      }),
  );

  await pagina.click('.boton-marca[data-marca-destino="alsai"]');
  const rendimiento = await medicion;
  await pagina.waitForSelector('[data-marca-rama="alsai"]', { visible: true });
  afirmar(rendimiento.fps >= 50, `Transición: ${rendimiento.fps.toFixed(1)} fps, por debajo del mínimo estable.`);
  afirmar(rendimiento.cls < 0.1, `Transición: CLS ${rendimiento.cls.toFixed(3)}.`);

  const alsai = await pagina.evaluate(() => ({
    url: location.search,
    tema: document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
    whatsapp: document.querySelector('.accion-contacto--whatsapp')?.getAttribute('href'),
    agenda: document.querySelector('.rama__agendar')?.textContent?.trim(),
  }));
  afirmar(new URLSearchParams(alsai.url).get('m') === 'alsai', 'La selección no actualizó ?m=alsai.');
  afirmar(alsai.tema?.toLowerCase() === '#040a16', `Tema ALSAI incorrecto: ${alsai.tema}`);
  afirmar(alsai.whatsapp?.includes('wa.me/524423961718'), 'WhatsApp de ALSAI incorrecto.');
  afirmar(alsai.agenda?.includes('Agendar una llamada'), 'Acción de agenda de ALSAI ausente.');
  await revisarCompartir(
    pagina,
    'alsai',
    'https://carlos.agencia-alsai.com/?src=link&m=alsai',
  );

  await pagina.click('.rama__agendar');
  await pagina.waitForSelector('.hoja-agendar[open]', { visible: true });
  const waAgenda = await pagina.$eval('.hoja-agendar__whatsapp', (elemento) => elemento.href);
  afirmar(waAgenda.includes('wa.me/524423961718'), 'Agenda de ALSAI no abre el WhatsApp correcto.');
  await pagina.click('.hoja-agendar__cerrar');

  const eventosAlsai = await leerEventos();

  await pagina.goBack({ waitUntil: 'networkidle2' });
  await pagina.waitForSelector('.hub', { visible: true });
  afirmar(new URLSearchParams(await pagina.evaluate(() => location.search)).get('m') === null, 'Atrás no volvió al hub.');

  await pagina.goto(url('?src=qr&m=blindafon'), { waitUntil: 'networkidle2' });
  await esperarAplicacion(pagina, '[data-marca-rama="blindafon"]');
  const blindafon = await pagina.evaluate(() => ({
    tema: document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
    whatsapp: document.querySelector('.accion-contacto--whatsapp')?.getAttribute('href'),
  }));
  afirmar(blindafon.tema?.toLowerCase() === '#0a0e18', `Tema Blindafón incorrecto: ${blindafon.tema}`);
  afirmar(blindafon.whatsapp?.includes('wa.me/524428115588'), 'WhatsApp de Blindafón incorrecto.');
  await revisarCompartir(
    pagina,
    'blindafon',
    'https://carlos.agencia-alsai.com/?src=link&m=blindafon',
  );

  const eventos = [...eventosAlsai, ...(await leerEventos())];
  afirmar(eventos.some((evento) => evento.nombre === 'card_open'), 'No se registró card_open.');
  afirmar(eventos.some((evento) => evento.nombre === 'brand_selected'), 'No se registró brand_selected.');
  afirmar(eventos.some((evento) => evento.nombre === 'share_click'), 'No se registró share_click.');

  afirmar(errores.length === 0, `Pruebas funcionales: ${errores.join(' | ')}`);
  await pagina.close();
  return { rendimiento, eventos: eventos.map((evento) => evento.nombre) };
}

async function revisarPwaYMetadatos(navegador) {
  const pagina = await navegador.newPage();
  await pagina.goto(url(), { waitUntil: 'networkidle2' });
  const cliente = await pagina.createCDPSession();
  const manifiesto = await cliente.send('Page.getAppManifest');
  const instalabilidad = await cliente.send('Page.getInstallabilityErrors');
  const metadatos = await pagina.evaluate(() => {
    const jsonLd = document.querySelector('script[type="application/ld+json"]')?.textContent ?? '';
    return {
      titulo: document.title,
      descripcion: document.querySelector('meta[name="description"]')?.getAttribute('content'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      ogTitulo: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      ogImagen: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
      twitter: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
      manifiesto: document.querySelector('link[rel="manifest"]')?.getAttribute('href'),
      jsonLd: JSON.parse(jsonLd),
    };
  });

  afirmar(manifiesto.url?.endsWith('/manifest.webmanifest'), 'Chrome no encontró el manifest PWA.');
  afirmar(manifiesto.data, 'Chrome no pudo leer el manifest PWA.');
  afirmar(
    instalabilidad.installabilityErrors.length === 0,
    `Chrome reportó errores de instalación PWA: ${JSON.stringify(instalabilidad.installabilityErrors)}.`,
  );
  const datosManifest = JSON.parse(manifiesto.data);
  afirmar(datosManifest.display === 'standalone', 'El manifest no usa display standalone.');
  afirmar(datosManifest.icons?.some((icono) => icono.sizes === '192x192'), 'Falta icono PWA 192×192.');
  afirmar(datosManifest.icons?.some((icono) => icono.sizes === '512x512'), 'Falta icono PWA 512×512.');
  afirmar(metadatos.canonical === 'https://carlos.agencia-alsai.com/', 'Canonical incorrecta.');
  afirmar(metadatos.ogTitulo && metadatos.ogImagen, 'Metadatos Open Graph incompletos.');
  afirmar(metadatos.twitter === 'summary_large_image', 'Twitter Card incompleta.');
  afirmar(metadatos.jsonLd['@type'] === 'Person', 'JSON-LD no describe una Person.');
  afirmar(metadatos.jsonLd.worksFor?.length === 2, 'JSON-LD no incluye las dos organizaciones.');
  afirmar(!JSON.stringify(metadatos.jsonLd).includes('streetAddress'), 'JSON-LD contiene streetAddress.');

  await pagina.close();
  return { titulo: metadatos.titulo, manifest: datosManifest.name, og: metadatos.ogImagen };
}

async function principal() {
  await fs.mkdir(DIRECTORIO_CAPTURAS, { recursive: true });
  const chrome = await encontrarChrome();
  const navegador = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: [
      '--no-sandbox',
      '--enable-gpu',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--window-size=1280,932',
    ],
  });

  try {
    const estados = await revisarEstados(navegador);
    const funciones = await revisarFunciones(navegador);
    const metadatos = await revisarPwaYMetadatos(navegador);

    console.log('\nQA TARJETA — APROBADO');
    console.table(estados);
    console.log(`Transición: ${funciones.rendimiento.fps.toFixed(1)} fps · CLS ${funciones.rendimiento.cls.toFixed(3)}`);
    console.log(`Eventos observados: ${[...new Set(funciones.eventos)].join(', ')}`);
    console.log(`PWA: ${metadatos.manifest}`);
    console.log(`SEO: ${metadatos.titulo}`);
    console.log(`Capturas: ${DIRECTORIO_CAPTURAS}`);
  } finally {
    await navegador.close();
  }
}

principal().catch((error) => {
  console.error('\nQA TARJETA — FALLÓ');
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
