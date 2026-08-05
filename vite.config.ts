import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 5190 a propósito: 5183 lo usan los dos proyectos de ALSAI y chocarían al abrirlos a la vez.
  // host: true es obligatorio para poder abrir la tarjeta desde el teléfono en la red local.
  server: { port: 5190, host: true },
});
