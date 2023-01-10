import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './editor.worker'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
)
