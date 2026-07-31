import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA / WebApp installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = import.meta.env.BASE_URL ? `${import.meta.env.BASE_URL}sw.js` : './sw.js';
    navigator.serviceWorker
      .register(swPath)
      .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
      .catch((err) => console.log('Service Worker registration info:', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

