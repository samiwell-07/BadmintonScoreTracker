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

### 4. Deploy to GitHub Pages

This repo is pre-wired for GitHub Pages via the workflow in `.github/workflows/deploy.yml`.

1. Push your changes to the `master` branch on GitHub.
2. In the repository settings, enable **Pages** and choose **GitHub Actions** as the source (the default workflow will appear automatically).
3. The workflow installs dependencies, runs `npm run build` with `GITHUB_PAGES=true`, and publishes `dist/` to Pages.

> **Note:** If you fork or rename the repository, update the `repoName` constant in `vite.config.ts` so the Vite `base` path matches your Pages URL (e.g., `/your-repo-name/`).

## Tech stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Mantine](https://mantine.dev/) for accessible UI primitives and theming
- Local Storage for offline-friendly persistence

## Notes

- The tracker is intentionally non-multiplayer; it assumes a single operator on one device.
- When the win-by-two option is enabled, games cap at 30 points, matching BWF rules.
