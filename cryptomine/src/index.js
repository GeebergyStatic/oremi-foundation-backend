import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './styles.css'
import './secondStyle.css';
import { BrowserRouter } from "react-router-dom";


import { Integrations } from '@sentry/tracing';
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://ac14dfda4deedcd73612d6cadabd6a3f@o4505685332721664.ingest.sentry.io/4505685339406336',
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
        <App></App>
    </React.StrictMode>
  );


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
