### 🔬 Performance Profiling Guide

This app includes built-in performance profiling to help you identify bottlenecks and optimize rendering.

---

## Quick Start

Open your browser's dev console and run:

```javascript
// Start recording
perfMonitor.startRecording()

// Perform your user flow (e.g., start match → toggle views → score points → finish match)

// Stop and view the report
perfMonitor.stopRecording()
```

---

## What Gets Tracked

### 🌐 Web Vitals
- **CLS** (Cumulative Layout Shift): Visual stability
- **FID** (First Input Delay): Interactivity
- **LCP** (Largest Contentful Paint): Loading performance
- **FCP** (First Contentful Paint): Perceived load speed
- **TTFB** (Time to First Byte): Server responsiveness

### ⚛️ React Profiler
- Component render durations
- Mount vs. update phases
- Slow renders (>16ms flagged)
- Total and average render times

### 🎯 User Flow Events
- View toggles (score-only, simple)
- Point changes
- Match resets
- Doubles mode toggle
- Language switches

---

## Suggested Test Flows

### Basic Match Flow
```javascript
perfMonitor.startRecording()
// 1. Start the app
// 2. Click +1 on player A (5 times)
// 3. Click +1 on player B (3 times)
// 4. Toggle to score-only view
// 5. Toggle back to full view
// 6. Reset the match
perfMonitor.stopRecording()
```

### View Switching Flow
```javascript
perfMonitor.startRecording()
// 1. Toggle between full → score-only → simple score → full
// 2. Change language EN → FR → EN
// 3. Toggle color scheme
perfMonitor.stopRecording()
```

### Doubles & Settings Flow
```javascript
perfMonitor.startRecording()
// 1. Enable doubles mode
// 2. Add points to trigger rotation
// 3. Swap teammates
// 4. Change match settings (best-of, race-to)
// 5. View game history
perfMonitor.stopRecording()
```

---

## Reading the Report

### 📊 Performance Thresholds

**Web Vitals:**
- ✅ Good: CLS ≤0.1, FID ≤100ms, LCP ≤2500ms
- ⚠️ Needs Improvement: CLS ≤0.25, FID ≤300ms, LCP ≤4000ms
- ❌ Poor: Above improvement thresholds

**React Renders:**
- ✅ Fast: <16ms per frame (60 FPS)
- ⚠️ Slow: 16-32ms (may drop frames)
- ❌ Very Slow: >32ms (noticeable lag)

### 🔍 Interpreting Results

**High actualDuration on PlayerGridSection?**
→ Check if memo dependencies are correct, consider splitting player cards

**CLS spikes during view toggle?**
→ Review lazy-loaded component sizes, add skeleton loaders

**Multiple updates for MatchDetailPanels?**
→ Verify memoization, check if props are being recreated

**Long FCP/LCP?**
→ Optimize initial bundle size, defer non-critical imports

---

## Optimization Checklist

- [ ] Slow renders identified (>16ms)
- [ ] Components with excessive re-renders noted
- [ ] Layout shifts during interactions measured
- [ ] Lazy-load boundaries effective
- [ ] Memoization working as expected
- [ ] User flow timings acceptable (<100ms for interactions)

---

## React DevTools Integration

For deeper analysis:

1. Install [React DevTools](https://react.dev/learn/react-developer-tools)
2. Open the **Profiler** tab
3. Click **Record** (⚫)
4. Perform your user flow
5. Click **Stop** (⏹)
6. Review the flame graph for expensive components

Compare DevTools visual profiler with this tool's console output for full insight.

---

## Notes

- Profiling only records when `perfMonitor.startRecording()` is active
- All measurements are logged to console in dev mode
- Slow renders (>16ms) are automatically flagged with warnings
- Reports include component IDs matching the ProfilerWrapper instances in App.tsx

**Need help?** Check the flame graph in React DevTools to see which specific components are taking the most time.
