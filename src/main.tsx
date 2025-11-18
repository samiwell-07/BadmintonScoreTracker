import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, ColorSchemeScript } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import App from './App.tsx'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'
import { reportWebVitals } from './reportWebVitals'
import { perfMonitor } from './utils/performance'

declare global {
  interface Window {
    perfMonitor: typeof perfMonitor
  }
}

// Log profiling instructions in dev
if (import.meta.env.DEV) {
  console.info(
    '%c🔍 Performance Profiling Available',
    'color: #12b886; font-size: 14px; font-weight: bold',
  )
  console.info(
    'Start recording: %cperfMonitor.startRecording()%c',
    'background: #339af0; color: white; padding: 2px 6px; border-radius: 3px',
    '',
  )
  console.info(
    'Stop & view report: %cperfMonitor.stopRecording()%c',
    'background: #339af0; color: white; padding: 2px 6px; border-radius: 3px',
    '',
  )
  console.info(
    'Suggested flow: Start match → Toggle views → Score points → Finish match',
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="auto">
      <ColorSchemeScript />
      <Notifications position="top-right" autoClose={1800} />
      <App />
    </MantineProvider>
  </React.StrictMode>,
)

reportWebVitals()

// Expose perfMonitor globally for easy access
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.perfMonitor = perfMonitor
}
