# Badminton Score Tracker

A responsive single-device badminton scoreboard built with Vite, React, TypeScript, and Mantine UI. The experience is touch-friendly, quick to operate between rallies, and remembers your progress via `localStorage` so you can resume a match after refreshing the page.

## Features

- 📱 **Mobile-first UI** – large touch targets and adaptive layouts make it effortless on phones or tablets.
- 🧮 **Smart scoring logic** – configurable race-to target, best-of series, and automatic win-by-two enforcement (capped at 30, per official rules).
- 💾 **Offline persistence** – names, scores, and match settings live in the browser's local storage.
- 🔄 **Control center** – undo, swap ends, toggle the server, reset the current game, or start a brand-new match instantly.
- 🌗 **Light/Dark modes** – switch themes without leaving the scoreboard.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

Open the printed URL (default `http://localhost:5173`) on your device to keep score.

### 3. Build for production

```bash
npm run build
npm run preview
```

The optimized bundle is emitted to `dist/` and can be deployed to any static host.

## Tech stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Mantine](https://mantine.dev/) for accessible UI primitives and theming
- Local Storage for offline-friendly persistence

## Notes

- The tracker is intentionally non-multiplayer; it assumes a single operator on one device.
- When the win-by-two option is enabled, games cap at 30 points, matching BWF rules.
