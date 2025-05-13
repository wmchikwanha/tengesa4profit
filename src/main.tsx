
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Polyfill for text encoder (needed for jsPDF in some environments)
if (typeof window !== 'undefined' && !window.TextEncoder) {
  window.TextEncoder = TextEncoder;
}

createRoot(document.getElementById("root")!).render(<App />);
