import type { Metric } from 'web-vitals'
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals'
import { perfMonitor } from './utils/performance'

const defaultReporter = (metric: Metric) => {
  perfMonitor.recordWebVital(metric)

  if (import.meta.env.DEV) {
    console.info('[web-vitals]', metric.name, Math.round(metric.value), metric)
  }
}

export const reportWebVitals = (onReport: (metric: Metric) => void = defaultReporter) => {
  if (typeof window === 'undefined') {
    return
  }

  onCLS(onReport)
  onFID(onReport)
  onLCP(onReport)
  onFCP(onReport)
  onTTFB(onReport)
}
