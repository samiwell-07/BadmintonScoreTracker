/**
 * Programmatically generates a styled favicon with circular white background
 * and subtle fade effect around the edges
 */
export const generateStyledFavicon = () => {
  // Only run in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  // Find existing favicon link or create one
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }

  // Create a canvas to draw the styled favicon
  const canvas = document.createElement('canvas')
  const size = 64 // Standard favicon size
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Create circular clipping path with slight padding
  const padding = 2
  const radius = (size - padding * 2) / 2
  const centerX = size / 2
  const centerY = size / 2

  // Draw white circular background with subtle fade
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.95)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  // Load and draw the original logo centered
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    // Save context state
    ctx.save()

    // Create circular clipping path for the logo
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 4, 0, Math.PI * 2)
    ctx.clip()

    // Draw logo centered and scaled
    const logoSize = (size - padding * 2) * 0.75
    const logoX = (size - logoSize) / 2
    const logoY = (size - logoSize) / 2
    ctx.drawImage(img, logoX, logoY, logoSize, logoSize)

    // Restore context
    ctx.restore()

    // Set favicon
    link!.href = canvas.toDataURL('image/png')
  }

  // Use the existing logo
  img.src = '/logo.png'
}
