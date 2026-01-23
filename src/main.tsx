import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, ColorSchemeScript } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'
import { reportWebVitals } from './reportWebVitals'
import { perfMonitor } from './utils/performance'
import { generateStyledFavicon } from './utils/favicon'

// Generate styled favicon with white circular background and fade
generateStyledFavicon()

declare global {
  interface Window {
    perfMonitor: typeof perfMonitor
  }
}

// Log profiling instructions in dev only
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
    <ErrorBoundary>
      <MantineProvider defaultColorScheme="auto">
        <ColorSchemeScript />
        <Notifications position="top-right" autoClose={1800} />
        <App />
      </MantineProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

reportWebVitals()

// Expose perfMonitor globally for easy access in dev
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.perfMonitor = perfMonitor
}
