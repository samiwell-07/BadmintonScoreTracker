import './splash.css'

interface SplashScreenProps {
  isExiting: boolean
}

export function SplashScreen({ isExiting }: SplashScreenProps) {
  return (
    <section
      className={`startup-splash${isExiting ? ' startup-splash--exiting' : ''}`}
      aria-label="Loading Badminton Score Tracker"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="startup-splash__brand">
        <img
          className="startup-splash__logo"
          src="/icons/app-icon-512.png"
          alt=""
          aria-hidden="true"
        />
        <h1>Badminton Score Tracker</h1>
      </div>
      <p className="startup-splash__credit">Developed by Samuel Srouji</p>
    </section>
  )
}