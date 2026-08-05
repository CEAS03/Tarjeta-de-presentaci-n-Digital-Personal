import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

/**
 * Servidor de desarrollo con HTTPS. Existe por una sola razón:
 *
 * iOS solo concede `DeviceOrientationEvent.requestPermission()` en contexto
 * seguro. Sobre `http://192.168.x.x` el giroscopio falla en silencio y el fondo
 * parece muerto, cuando en realidad es el permiso el que no se pidió nunca.
 *
 * En el iPhone, Safari avisará de que el certificado no es de confianza: es
 * autofirmado y esperado. «Mostrar detalles» → «Visitar este sitio web».
 *
 * Puerto 5193 para no chocar con el dev normal (5190) ni con el preview (5191).
 */
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: { port: 5193, host: true },
});
