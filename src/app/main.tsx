import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app';

import './styles/index.scss';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Не найден контейнер #root');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
