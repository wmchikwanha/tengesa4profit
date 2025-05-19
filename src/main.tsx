
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Polyfill for text encoder (needed for jsPDF in some environments)
if (typeof window !== 'undefined' && !window.TextEncoder) {
  window.TextEncoder = TextEncoder;
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Unregister existing service workers first to ensure a clean slate
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      
      // Register new service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none' // Never use cached version of the service worker
      });
      
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Check for updates immediately
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
  
  // Handle service worker updates
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service Worker controller changed, refreshing page');
    window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
