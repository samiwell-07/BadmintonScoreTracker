/**
 * Performance profiler utilities for tracking React component renders,
 * user interactions, and core web vitals.
 */

import type { Metric } from 'web-vitals'

declare global {
  interface Window {
    perfMonitor: PerformanceMonitor
  }
}

export interface ProfilerMeasurement {
  id: string
  phase: 'mount' | 'update' | 'nested-update'
  actualDuration: number
  baseDuration: number
  startTime: number
  commitTime: number
  interactions: Set<{ id: number; name: string; timestamp: number }>
}

export interface UserFlowEvent {
  type: string
  timestamp: number
  duration?: number
  metadata?: Record<string, unknown>
}

export interface PerformanceReport {
  webVitals: Metric[]
  profilerMeasurements: ProfilerMeasurement[]
  userFlowEvents: UserFlowEvent[]
  timestamp: number
}

class PerformanceMonitor {
  private webVitals: Metric[] = []
  private profilerMeasurements: ProfilerMeasurement[] = []
  private userFlowEvents: UserFlowEvent[] = []
  private isRecording = false
  private sessionStart = 0

  startRecording() {
    this.isRecording = true
    this.sessionStart = performance.now()
    this.webVitals = []
    this.profilerMeasurements = []
    this.userFlowEvents = []

    if (import.meta.env.DEV) {
      console.info(
        '[Perf Monitor] Recording started. Use window.perfMonitor.stopRecording() to finish.',
      )
    }
  }

  stopRecording(): PerformanceReport {
    this.isRecording = false

    const report: PerformanceReport = {
      webVitals: [...this.webVitals],
      profilerMeasurements: [...this.profilerMeasurements],
      userFlowEvents: [...this.userFlowEvents],
      timestamp: Date.now(),
    }

    if (import.meta.env.DEV) {
      console.info('[Perf Monitor] Recording stopped.')
      this.logReport(report)
    }

    return report
  }

  recordWebVital(metric: Metric) {
    if (!this.isRecording) return
    this.webVitals.push(metric)
  }

  recordProfilerData(measurement: ProfilerMeasurement) {
    if (!this.isRecording) return
    this.profilerMeasurements.push(measurement)

    // Flag slow renders in dev
    if (import.meta.env.DEV && measurement.actualDuration > 16) {
      console.warn(
        `[Perf] Slow render detected: ${measurement.id} (${measurement.phase}) took ${measurement.actualDuration.toFixed(2)}ms`,
        measurement,
      )
    }
  }

  recordUserFlow(event: UserFlowEvent) {
    if (!this.isRecording) return
    this.userFlowEvents.push({
      ...event,
      timestamp: performance.now() - this.sessionStart,
    })

    if (import.meta.env.DEV) {
      console.debug(`[User Flow] ${event.type}`, event)
    }
  }

  isActive() {
    return this.isRecording
  }

  private logReport(report: PerformanceReport) {
    console.group('📊 Performance Report')

    console.group('🌐 Web Vitals')
    if (report.webVitals.length === 0) {
      console.info('No web vitals recorded yet')
    } else {
      report.webVitals.forEach((metric) => {
        const rating = this.rateMetric(metric)
        const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'
        console.info(
          `${emoji} ${metric.name}: ${Math.round(metric.value)} (${rating})`,
          metric,
        )
      })
    }
    console.groupEnd()

    console.group('⚛️ React Profiler')
    if (report.profilerMeasurements.length === 0) {
      console.info('No profiler measurements recorded')
    } else {
      const slowRenders = report.profilerMeasurements.filter((m) => m.actualDuration > 16)
      const totalRenderTime = report.profilerMeasurements.reduce(
        (sum, m) => sum + m.actualDuration,
        0,
      )
      const avgRenderTime =
        totalRenderTime / report.profilerMeasurements.length

      console.info(
        `Total renders: ${report.profilerMeasurements.length}`,
      )
      console.info(
        `Slow renders (>16ms): ${slowRenders.length}`,
      )
      console.info(`Average render time: ${avgRenderTime.toFixed(2)}ms`)
      console.info(`Total render time: ${totalRenderTime.toFixed(2)}ms`)

      if (slowRenders.length > 0) {
        console.table(
          slowRenders.map((m) => ({
            component: m.id,
            phase: m.phase,
            duration: `${m.actualDuration.toFixed(2)}ms`,
            baseline: `${m.baseDuration.toFixed(2)}ms`,
          })),
        )
      }
    }
    console.groupEnd()

    console.group('🎯 User Flow')
    if (report.userFlowEvents.length === 0) {
      console.info('No user flow events recorded')
    } else {
      console.table(
        report.userFlowEvents.map((e) => ({
          type: e.type,
          timestamp: `${e.timestamp.toFixed(0)}ms`,
          duration: e.duration ? `${e.duration.toFixed(0)}ms` : '-',
        })),
      )
    }
    console.groupEnd()

    console.groupEnd()
  }

  private rateMetric(
    metric: Metric,
  ): 'good' | 'needs-improvement' | 'poor' {
    // Thresholds from web.dev/vitals
    const thresholds: Record<string, [number, number]> = {
      CLS: [0.1, 0.25],
      FID: [100, 300],
      LCP: [2500, 4000],
      FCP: [1800, 3000],
      TTFB: [800, 1800],
    }

    const [good, needsImprovement] = thresholds[metric.name] || [0, 0]

    if (metric.value <= good) return 'good'
    if (metric.value <= needsImprovement) return 'needs-improvement'
    return 'poor'
  }
}

export const perfMonitor = new PerformanceMonitor()

// Expose to window for easy console access in dev
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.perfMonitor = perfMonitor
}

/**
 * Helper to wrap async operations and record timing
 */
export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> => {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    perfMonitor.recordUserFlow({ type: name, timestamp: start, duration })
    return result
  } catch (error) {
    const duration = performance.now() - start
    perfMonitor.recordUserFlow({
      type: name,
      timestamp: start,
      duration,
      metadata: { error: String(error) },
    })
    throw error
  }
}

/**
 * Helper to wrap sync operations and record timing
 */
export const measureSync = <T>(name: string, fn: () => T): T => {
  const start = performance.now()
  try {
    const result = fn()
    const duration = performance.now() - start
    perfMonitor.recordUserFlow({ type: name, timestamp: start, duration })
    return result
  } catch (error) {
    const duration = performance.now() - start
    perfMonitor.recordUserFlow({
      type: name,
      timestamp: start,
      duration,
      metadata: { error: String(error) },
    })
    throw error
  }
}
