import { useState, useEffect } from 'react'

export interface DeviceInfo {
  isMobile: boolean
  isDesktop: boolean
  isIOS: boolean
  isAndroid: boolean
  isTouchDevice: boolean
  screenSize: 'small' | 'medium' | 'large'
  isPWA: boolean
}

const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isMobile: false,
      isDesktop: true,
      isIOS: false,
      isAndroid: false,
      isTouchDevice: false,
      screenSize: 'large',
      isPWA: false,
    }
  }

  const ua = navigator.userAgent

  // Device type detection
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isAndroid = /Android/i.test(ua)
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  
  // Touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // Screen size
  const width = window.innerWidth
  const screenSize: 'small' | 'medium' | 'large' = 
    width < 576 ? 'small' : 
    width < 992 ? 'medium' : 
    'large'
  
  // Combine UA and screen size for better mobile detection
  const isMobile = isMobileUA || (isTouchDevice && width < 768)
  
  // PWA detection (standalone mode)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error - iOS Safari specific
    window.navigator.standalone === true

  return {
    isMobile,
    isDesktop: !isMobile,
    isIOS,
    isAndroid,
    isTouchDevice,
    screenSize,
    isPWA,
  }
}

/**
 * Hook to detect device type and capabilities
 * Updates on window resize for responsive behavior
 */
export const useDeviceDetect = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo)

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo())
    }

    // Also listen for orientation changes on mobile
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return deviceInfo
}

/**
 * Standalone function for one-time device detection (non-reactive)
 */
export const detectDevice = getDeviceInfo
