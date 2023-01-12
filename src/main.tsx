import React from 'react';
import ReactDOM from 'react-dom/client';
import {initializeIcons} from '@fluentui/react/lib/Icons';
import App from './App';
import './editor.worker';
import './i18n';

initializeIcons();

ReactDOM.createRoot(document.getElementById('root') as Element).render(
	<App />,
);
