import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './popup.css';

// Create root element
const container = document.getElementById('root');
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

// Render React component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);