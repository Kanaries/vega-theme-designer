import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './editor.worker'
import './i18n'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
)
