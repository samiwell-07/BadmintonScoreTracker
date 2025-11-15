import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, ColorSchemeScript } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import App from './App.tsx'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="auto">
      <ColorSchemeScript />
      <Notifications position="top-right" autoClose={1800} />
      <App />
    </MantineProvider>
  </React.StrictMode>,
)
