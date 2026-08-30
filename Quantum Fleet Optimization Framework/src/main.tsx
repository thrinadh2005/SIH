import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { SecurityProvider } from './context/SecurityContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SecurityProvider>
        <App />
      </SecurityProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
