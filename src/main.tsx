import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import './styles.css'

const router = getRouter();

// Utilitário de emergência para limpar cache/login se travar
(window as any).solvixReset = () => {
  localStorage.clear();
  window.location.href = '/';
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
