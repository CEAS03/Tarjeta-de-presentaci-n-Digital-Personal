import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// La display del HUB: es la persona, no una de sus dos empresas.
// SYNE, elegida por Carlos el 2026-08-05 sobre Newsreader y Bricolage Grotesque.
// Antes estuvo Instrument Serif, que rechazó. Ver DIRECCION-DE-ARTE.md §5.
// Tres pesos porque la display del hub se usa en tres sitios con jerarquías
// distintas: el nombre (700), los nombres de marca de las filas (600) y la
// pregunta (400). Antes solo se importaba un peso de Instrument Serif y el
// navegador FALSIFICABA la negrita de las filas; con Syne, que es una display de
// formas anchas, esa falsificación se nota mucho más.
import '@fontsource/syne/400.css';
import '@fontsource/syne/600.css';
import '@fontsource/syne/700.css';

// La display de las DOS MARCAS. Al entrar en una rama, la tipografía cambia
// a esta: el cambio es parte de la bifurcación.
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';

// El cuerpo, que no cambia nunca: es lo que sostiene la continuidad.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

import './styles/tokens.css';
import './styles/base.css';
import App from './App';
import { iniciarAnalitica } from './lib/analitica';

iniciarAnalitica();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
