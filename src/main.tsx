import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { MockDataProvider } from './context/MockDataContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <MockDataProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </MockDataProvider>
    </ToastProvider>
  </StrictMode>,
)
