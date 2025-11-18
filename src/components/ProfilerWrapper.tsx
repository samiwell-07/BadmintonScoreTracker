import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from 'react'
import { perfMonitor, type ProfilerMeasurement } from '../utils/performance'

interface ProfilerWrapperProps {
  id: string
  children: ReactNode
}

/**
 * Wrapper around React.Profiler that automatically records measurements
 * to the global performance monitor when active.
 */
export const ProfilerWrapper = ({ id, children }: ProfilerWrapperProps) => {
  const handleRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions,
  ) => {
    const measurement: ProfilerMeasurement = {
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      interactions,
    }

    perfMonitor.recordProfilerData(measurement)
  }

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  )
}
