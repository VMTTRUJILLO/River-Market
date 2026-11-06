import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CarritoProvider } from './context/CarritoContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import 'bulma/css/bulma.min.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CarritoProvider>
        <App/>
      </CarritoProvider>
    </AuthProvider>
  </StrictMode>,
)
