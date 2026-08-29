# Badminton Score Tracker

A simple two-sided score tracker built with React and TypeScript. Each half of the screen belongs to one player or team.

## Run Locally

Install a current Node.js LTS release, then run:

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## Use the Tracker

- Click or tap either side to add one point to that side.
- Swipe or drag downward from the top half to the bottom half of a side to remove one point.
- Swipe across the center divider to transfer one point and service to the destination side. If the source has no point, only service moves.
- Click a player or team name to edit it inline.
- Press Enter or click away to save a name.
- Press Escape to cancel a name edit.
- Press the half-circle at the top-center divider to open the match controls.
- Press an outside area, the main circle, or Escape to close the controls.

On devices that support vibration, adding a point gives a very short pulse and completed score swipes give a slightly longer subtle pulse. Open **Settings → General settings** to turn haptic feedback on or off. The choice is remembered in this browser. Unsupported devices continue without haptic feedback.

The four controls, from left to right, are:

- **Swap teams:** Exchanges names, scores, and service between sides.
- **Reset match:** Asks for confirmation, then clears scores and service while keeping names and settings.
- **Select service:** Makes the next team side pressed the server without adding a point.
- **Match settings:** Configures points to win, win by two, maximum score, and games to win.

Adding a point moves service to the scoring side. Successfully removing a point clears service.

## Games and Sets

- Saved match settings actively determine when a game is won.
- With win by two enabled, play continues until one team leads by two or reaches the maximum score.
- A winning point freezes scoring and shows the winner, final score, and sets won.
- Use **Undo winning point** to correct the result, or **Next game** to continue the match.
- Use **Copy text** to copy a message-ready narrative result without an image or internet connection.
- Use **Share image** to create a square PNG result card and open the device share sheet. If native image sharing is unavailable, the PNG downloads instead.
- Reaching the configured games-to-win target completes and freezes the match.
- Live scores, names, service, and completed sets are remembered across refreshes.

After the first completed set, a half-circle appears at the bottom center. Press it to open the chronological set history. Selecting a set shows its final names and scores on a read-only board; press the back-arrow half-circle to return.

Match settings lock after the first point and remain locked while completed sets exist. Reset clears the current game by default. Enable **Also reset completed sets** to clear the entire match history and unlock settings; this option is required after a completed match.

## Commands

```bash
npm test       # Run component tests once
npm run lint   # Check code quality
npm run build  # Type-check and create a production build
```

## Source Structure

```text
src/
  app/                 Application shell
  features/scoreboard/ Score state, components, styles, and tests
  styles/              Global styles
  test/                Shared test setup
```
