import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// La display del HUB: es la persona, no una de sus dos empresas.
// Ver DIRECCION-DE-ARTE.md §5. Candidatas comparables en /lab-tipografia.html.
import '@fontsource/instrument-serif/400.css';

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
