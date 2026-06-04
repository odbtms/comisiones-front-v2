import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { iniciarTema } from './theme.js'
import './styles.css'

iniciarTema() // aplica claro/oscuro antes de pintar

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
