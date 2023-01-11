import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './editor.worker'
import './i18n'
import { initializeIcons } from '@fluentui/react/lib/Icons'

initializeIcons()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
)
