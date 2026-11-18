import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Global styles first, so each component's own stylesheet can override them.
import './styles/global.css';
import App from './App.jsx';

// Always start at the top on reload: the invitation opens onto the hero, not a remembered scroll position.
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
