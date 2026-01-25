export type Language = 'en' | 'fr'

export interface RelativeTimeTranslations {
  justNow: string
  secondsAgo: (seconds: number) => string
  minutesAgo: (minutes: number) => string
  hoursAgo: (hours: number) => string
  daysAgo: (days: number) => string
}

type CourtSide = 'left' | 'right'

export interface Translations {
  common: {
    cancel: string
    showFullView: string
    scoreOnlyView: string
    simpleScoreView: string
  }
  menu: {
    title: string
    openLabel: string
    closeLabel: string
    scoreSection: string
    settingsSection: string
    historySection: string
    coachSection: string
    aboutSection: string
    aboutDescription: string
    aboutFeatures: string[]
    multicourtSection: string
    multicourtDescription: string
    multicourtFeatures: string[]
    comingSoon: string
  }
  app: {
    documentTitle: string
    headerTitle: string
    descriptionLines: string[]
    loadingScoreView: string
    loadingDoublesDiagram: string
    loadingMatchDetails: string
  }
  header: {
    scoreOnlyActive: string
    scoreOnlyInactive: string
    simpleActive: string
    simpleInactive: string
    undo: string
    undoTooltip: string
    colorSchemeTooltip: string
    colorSchemeAriaLabel: string
    languageTooltip: string
    shareApp: string
    shareAppTooltip: string
    shareAppCopied: string
    shareAppError: string
  }
  controls: {
    resetPoints: string
    resetPointsTooltip: string
    resetPointsModalTitle: string
    resetPointsModalBody: string
    startNewMatch: string
    resetMatchTooltip: string
    resetMatchModalTitle: string
    resetMatchModalBody: string
    swapEnds: string
    toggleServer: string
    adjustPositionsHeading: string
    resetsHeading: string
  }
  settings: {
    title: string
    raceToLabel: string
    matchLengthLabel: string
    bestOfOption: (value: number) => string
    winByTwoLabel: string
    winByTwoEnabled: string
    winByTwoDisabled: string
    doublesLabel: string
    doublesEnabled: string
    doublesDisabled: string
    quickPresets: {
      title: string
      helper: string
      hint: string
      presets: Record<
        'standard' | 'doubles' | 'short' | 'sprint',
        {
          label: string
          description: string
        }
      >
    }
    recentConfigs: {
      title: string
      helper: string
      empty: string
      label: (raceTo: number, bestOf: number) => string
      singlesTag: string
      doublesTag: string
      winByTwoTag: string
      suddenDeathTag: string
    }
  }
  insights: {
    title: string
    pauseClock: string
    resumeClock: string
    duration: string
    live: string
    completed: string
    bestOfBadge: (value: number) => string
    gamesNeededBadge: (value: number) => string
    raceToBadge: (value: number) => string
    updatedBadge: (relativeTime: string) => string
    tip: string
  }
  rotation: {
    heading: string
    court: Record<CourtSide, string>
    servingSentence: (teamName: string, courtSide: CourtSide, partnerName: string) => string
    receivingSentence: (teamName: string, partnerName: string) => string
  }
  playerCard: {
    serviceBadge: (courtLabel: string) => string
    matchPoint: string
    gamePoint: string
    winner: string
    pointsLabel: string
    gamesWonLabel: string
    teammateLineup: string
    switchTeammates: string
    savePlayerName: (name: string) => string
    resetPlayerName: string
    saveTeammateName: (name: string) => string
    clearTeammateName: string
    savedNamesTooltip: string
    addToFavorites: string
    removeFromFavorites: string
  }
  savedNamesMenu: {
    menuLabel: string
    noSavedNames: string
    tooltip: string
    quickApplyLabel: string
    quickApplyHint: string
    quickApplyEmpty: string
    recentBadge: string
    allNamesLabel: string
    clearHelper: string
    saveHelper: string
  }
  history: {
    title: string
    summaryEmpty: string
    summaryCount: (count: number) => string
    collapsedHidden: string
    collapsedEmpty: string
    showHistory: string
    closeHistory: string
    eraseHistory: string
    gameLabel: (gameNumber: number) => string
    winnerBadge: (name: string) => string
    statsButton: string
    shareResult: string
    shareText: (player1: string, score1: number, player2: string, score2: number, duration: string, date: string) => string
    shareCopied: string
    shareError: string
  }
  overlays: {
    servingLabel: string
    swapButton: string
  }
  simpleScore: {
    hint: string
    tapToScore: string
  }
  coach: {
    title: string
    hint: string
    applyScores: string
    player1Label: string
    player2Label: string
  }
  toasts: {
    matchFinishedTitle: string
    matchFinishedBody: string
    nothingToUndo: string
    nothingToErase: string
    historyCleared: string
    cannotSaveEmptyName: string
    savedName: (name: string) => string
    gameWin: (name: string) => string
    matchWin: (name: string) => string
    rematchStarted?: string
  }
  relativeTime: RelativeTimeTranslations
  doublesDiagram: {
    serve: string
    receive: string
  }
  statsPanel: {
    title: string
    backButton: string
    description: string
    requirementTitle: string
    requirementBody: (minMatches: number) => string
    previousMatchLabel: (relativeTime: string) => string
    configLabel: (raceTo: number, bestOf: number) => string
    matchDurationLabel: string
    matchDurationHint: string
    averageRallyLabel: string
    averageRallyHint: string
    totalRalliesLabel: string
    totalRalliesHint: string
    pointsPerMinuteLabel: string
    pointsPerMinuteHint: string
    averageGameLabel: string
    averageGameHint: string
    noGamesYet: string
    profileHeading: string
    profileEmpty: string
    profileMatchesLabel: (matches: number) => string
    profileWinRateLabel: string
    profilePointsLabel: string
    profileAvgDurationLabel: string
  }
  onboarding?: {
    welcome: string
    welcomeDesc: string
    scoring: string
    scoringDesc: string
    history: string
    historyDesc: string
    shortcuts: string
    shortcutsDesc: string
    skip: string
    back: string
    next: string
    getStarted: string
  }
  dataManagement?: {
    title: string
    description: string
    export: string
    import: string
    exportTitle: string
    exportHelp: string
    exportError: string
    exportErrorMsg: string
    downloadFile: string
    downloadSuccess: string
    downloadError: string
    downloadErrorMsg: string
    importTitle: string
    importHelp: string
    importPlaceholder: string
    importWarning: string
    importWarningHistoryOnly: string
    importCurrentMatch: string
    importData: string
    importSuccess: string
    importError: string
    importErrorMsg: string
  }
  settings2?: {
    soundEffects: string
    soundEffectsDesc: string
    hapticFeedback: string
    hapticFeedbackDesc: string
    keepScreenOn: string
    keepScreenOnDesc: string
    showKeyboardShortcuts: string
    appVersion: string
  }
  momentum?: {
    title: string
    notEnoughData: string
    ralliesLabel: string
    leadChanges: string
    biggestLead: string
    longestStreak: string
  }
  headToHead?: {
    title: string
    noMatches: string
    record: string
    wins: string
    lastPlayed: string
    avgMargin: string
    recentForm: string
  }
  matchTags?: {
    title: string
    hint: string
    training: string
    league: string
    friendly: string
    tournament: string
  }
  matchNotes?: {
    title: string
    note: string
    notes: string
    placeholder: string
    ctrlEnterHint: string
    addNote: string
    deleteNote: string
    game: string
    empty: string
  }
  undoHistory?: {
    title: string
    empty: string
    undoTo: string
    currentState: string
    point: string
    game: string
    action: string
    actionsAgo: (count: number) => string
  }
  export?: {
    title: string
    hint: string
    exportPng: string
    exporting: string
    success: string
    error: string
    filename: string
  }
  customGame?: {
    title: string
    hint: string
    targetScore: string
    targetScoreHint: string
    handicap: string
    handicapHint: string
    presets: string
    applyHandicap: string
    clearHandicap: string
    startingPoints: string
  }
  trends?: {
    title: string
    noData: string
    minMatches: (count: number) => string
    winRate: string
    avgScore: string
    avgDuration: string
    recentMatches: string
    performance: string
    improving: string
    declining: string
    stable: string
  }
  templates?: {
    title: string
    hint: string
    save: string
    saveTitle: string
    saveDesc: string
    saveCurrentTooltip: string
    nameLabel: string
    namePlaceholder: string
    empty: string
    applied: string
  }
  multicourt?: {
    court1: string
    court2: string
    player1: string
    player2: string
    reset: string
    resetAll: string
    tapToScore: string
    saveNames: string
    namesSaved: string
    settings: string
    matchSettings: string
    raceTo: string
    finished: string
    addCourt: string
  }
}

const enCourtLabels: Record<CourtSide, string> = {
  left: 'left court',
  right: 'right court',
}

const frCourtLabels: Record<CourtSide, string> = {
  left: 'côté gauche',
  right: 'côté droit',
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      cancel: 'Cancel',
      showFullView: 'Show full view',
      scoreOnlyView: 'Score-only view',
      simpleScoreView: 'Simple score view',
    },
    menu: {
      title: 'Match menu',
      openLabel: 'Toggle match menu',
      closeLabel: 'Close match menu',
      scoreSection: 'Score counter',
      settingsSection: 'Match settings',
      historySection: 'History & stats',
      coachSection: 'Score Entry',
      aboutSection: 'About',
      aboutDescription: 'Badminton Score Tracker is a responsive, offline-friendly application for tracking badminton match scores. Created by Samuel Srouji.',
      aboutFeatures: [
        '🎯 Core Scoring: Tap +1/-1 buttons to score. The score number animates with a satisfying pop and slide effect on each point. Auto-tracks serving based on badminton rules, showing which court (left/right) the server is on.',
        '🏆 Game & Match Detection: Automatically detects game point, match point, and winners. Displays badges and triggers special celebrations when your favorite player wins with confetti animation.',
        '🔥 Winning Streaks: Visual highlight appears when a player scores 5+ consecutive points, with special styling when combined with match point.',
        '⚙️ Match Settings: Configure race-to points (default 21), best-of games (1, 3, or 5), win-by-two rule, and doubles mode. Quick presets for Standard, Doubles, Short (15 pts), and Sprint (11 pts) games.',
        '👥 Player Profiles: Save player names with avatars and colors. Quick-apply favorite names, mark players as favorites for special victory celebrations.',
        '🎾 Doubles Support: Full doubles mode with court diagram showing all four player positions, service/receive indicators, and teammate rotation tracking.',
        '🔊 Sound Effects: Point sounds, rising arpeggios for game/match point, victory fanfares, and a tension-building heartbeat sound at crucial moments. All via Web Audio API.',
        '📳 Haptic Feedback: Vibration patterns for points, game point (double pulse), match point (triple pulse), and celebratory patterns for wins.',
        '📊 Statistics: Momentum chart showing point differential over time. Head-to-head records between named players with win rates, average margins, and recent form. Performance trends analysis.',
        '📝 Match Notes: Add timestamped notes during play with game context. Tag matches as Training, League, Friendly, or Tournament.',
        '↩️ Undo System: Undo last action or view full timeline to jump back to any previous state. See what changed between each state.',
        '💾 Data Management: Auto-saves to device storage. Export/import JSON backups. Save up to 8 match templates for favorite configurations.',
        '📸 Export & Share: Save scoreboard as PNG image. Share match results or the app link with friends.',
        '🖥️ View Modes: Full view with all features, Score-only floating overlay, or Simple Score view with large tap-to-score cards.',
        '⌨️ Keyboard Shortcuts: A/B for points, Q/W to subtract, U or Ctrl+Z to undo, S to toggle server, E to swap ends, Space for clock.',
        '♿ Accessibility: Respects reduced motion preferences, screen reader announcements, full keyboard navigation, dark/light themes.',
        '🔋 Mobile Ready: Keep-screen-on during matches, native sharing, touch-optimized UI, and Android app via Capacitor.',
        '🌍 Languages: Available in English and French with localized timestamps.',
      ],
      multicourtSection: 'Multi-Court',
      multicourtDescription: 'Manage multiple courts and matches simultaneously. Perfect for tournament directors, club managers, and coaches overseeing multiple games.',
      multicourtFeatures: [
        '🎨 Custom Themes: Create your own color schemes with primary and secondary color pickers. Personalize the app to match your club colors.',
        '👤 Player Avatars: Upload profile pictures or select from built-in avatars. See player faces on score cards and court diagrams.',
        '🎾 Animated Court: Watch the shuttle animate between server and receiver positions. Visual trajectory shows the flow of play.',
        '📱 Smart Layouts: Optimized layouts for portrait and landscape orientations. Side-by-side scores in landscape, stacked in portrait.',
        '📺 TV Mode: Large fonts and high contrast display optimized for streaming and casting to big screens.',
        '🪟 Picture-in-Picture: Floating mini score window that stays on top while you use other apps.',
        '📲 Widget Support: Home screen widget showing live score without opening the app (Android).',
        '⌚ Watch App: Companion app for smartwatches to track scores from your wrist.',
        '🏟️ Multi-Court View: See all active courts at a glance. Quick switch between matches with live score previews.',
        '🏆 Tournament Mode: Bracket generation, round robin scheduling, and automatic advancement.',
      ],
      comingSoon: '✨ These features are coming soon! Stay tuned for updates.',
    },
    app: {
      documentTitle: 'Badminton Score Tracker',
      headerTitle: 'Badminton Score Tracker',
      descriptionLines: [
        'Keep a responsive, offline-friendly record of every rally.',
        'Scores stay on this device so you can resume anytime.',
        'This application was created by Samuel Srouji.',
      ],
      loadingScoreView: 'Loading score view…',
      loadingDoublesDiagram: 'Loading doubles diagram…',
      loadingMatchDetails: 'Loading match details…',
    },
    header: {
      scoreOnlyActive: 'Show full view',
      scoreOnlyInactive: 'Score-only view',
      simpleActive: 'Show full view',
      simpleInactive: 'Simple score view',
      undo: 'Undo',
      undoTooltip: 'Undo last change',
      colorSchemeTooltip: 'Swap light / dark mode',
      colorSchemeAriaLabel: 'Toggle color scheme',
      languageTooltip: 'Show in French',
      shareApp: 'Share App',
      shareAppTooltip: 'Share this app with friends',
      shareAppCopied: 'App link copied!',
      shareAppError: 'Could not share app',
    },
    controls: {
      resetPoints: 'Reset points',
      resetPointsTooltip: 'Clears the current game score only',
      resetPointsModalTitle: 'Reset points?',
      resetPointsModalBody: 'Clears the ongoing game score but keeps match history.',
      startNewMatch: 'Start new match',
      resetMatchTooltip: 'Clears points, games, and history',
      resetMatchModalTitle: 'Start a new match?',
      resetMatchModalBody: 'Resets the full match so you can begin fresh.',
      swapEnds: 'Swap ends',
      toggleServer: 'Toggle server',
      adjustPositionsHeading: 'Adjust positions',
      resetsHeading: 'Resets',
    },
    settings: {
      title: 'Match settings',
      raceToLabel: 'Target points per game',
      matchLengthLabel: 'Match length',
      bestOfOption: (value) => `Best of ${value}`,
      winByTwoLabel: 'Require two-point lead',
      winByTwoEnabled: 'Enabled',
      winByTwoDisabled: 'Disabled',
      doublesLabel: 'Doubles contributions',
      doublesEnabled: 'Tracking',
      doublesDisabled: 'Hidden',
      quickPresets: {
        title: 'Quick presets',
        helper: 'Dial in the match feel before the first rally.',
        hint: 'Applies race-to, match length, and doubles rules at once.',
        presets: {
          standard: {
            label: 'Standard rally',
            description: '21-point games · best of 3 · win by two.',
          },
          doubles: {
            label: 'Doubles ready',
            description: '21-point games with doubles tracking enabled.',
          },
          short: {
            label: 'Quick 15',
            description: '15-point practice games · best of 3.',
          },
          sprint: {
            label: 'Sprint 11',
            description: '11-point single game · sudden death.',
          },
        },
      },
      recentConfigs: {
        title: 'Recent setups',
        helper: 'We remember the last few combos you used.',
        empty: 'Adjust any setting to build this list.',
        label: (raceTo, bestOf) => `Race to ${raceTo} · Best of ${bestOf}`,
        singlesTag: 'Singles',
        doublesTag: 'Doubles',
        winByTwoTag: 'Win by two',
        suddenDeathTag: 'Sudden death',
      },
    },
    insights: {
      title: 'Match insights',
      pauseClock: 'Pause clock',
      resumeClock: 'Resume clock',
      duration: 'Duration',
      live: 'Live',
      completed: 'Completed',
      bestOfBadge: (value) => `Best of ${value}`,
      gamesNeededBadge: (value) => `Games needed ${value}`,
      raceToBadge: (value) => `Race to ${value}`,
      updatedBadge: (relativeTime) => `Updated ${relativeTime}`,
      tip: 'Tip: add the page to your home screen for a fast, offline-ready scoreboard during practice or tournaments.',
    },
    rotation: {
      heading: 'Doubles rotation',
      court: enCourtLabels,
      servingSentence: (teamName, courtSide, partnerName) =>
        `${teamName} serving from the ${enCourtLabels[courtSide]} with ${partnerName}.`,
      receivingSentence: (teamName, partnerName) =>
        `${teamName} receiving with ${partnerName}.`,
    },
    playerCard: {
      serviceBadge: (courtLabel) => `Serving - ${courtLabel}`,
      matchPoint: 'Match point',
      gamePoint: 'Game point',
      winner: 'Winner',
      pointsLabel: 'Points',
      gamesWonLabel: 'Games won',
      teammateLineup: 'Teammate lineup',
      switchTeammates: 'Switch positions',
      savePlayerName: (name) => `Save "${name}"`,
      resetPlayerName: 'Reset to default',
      saveTeammateName: (name) => `Save "${name}"`,
      clearTeammateName: 'Clear teammate name',
      savedNamesTooltip: 'Saved names',
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Remove from favorites',
    },
    savedNamesMenu: {
      menuLabel: 'Saved names',
      noSavedNames: 'No saved names',
      tooltip: 'Saved names',
      quickApplyLabel: 'Quick apply',
      quickApplyHint: 'Fills this field instantly.',
      quickApplyEmpty: 'Save a name to unlock quick apply.',
      recentBadge: 'Recent',
      allNamesLabel: 'All saved names',
      clearHelper: 'Revert to the default placeholder name.',
      saveHelper: 'Adds the current input to this list.',
    },
    history: {
      title: 'Game history',
      summaryEmpty: 'Completed games will appear here.',
      summaryCount: (count) =>
        `Showing last ${count} ${count === 1 ? 'game' : 'games'}.`,
      collapsedHidden: 'History hidden. Use "Show history" to view completed games.',
      collapsedEmpty: 'Finish a game to build your history timeline.',
      showHistory: 'Show history',
      closeHistory: 'Close history',
      eraseHistory: 'Erase history',
      gameLabel: (number) => `Game ${number}`,
      winnerBadge: (name) => `Winner · ${name}`,
      statsButton: 'Stats',
      shareResult: 'Share',
      shareText: (player1, score1, player2, score2, duration, date) =>
        `🏸 Badminton Match Result\n\n${player1}: ${score1}\n${player2}: ${score2}\n\n⏱️ Duration: ${duration}\n📅 ${date}`,
      shareCopied: 'Result copied to clipboard!',
      shareError: 'Could not share result',
    },
    overlays: {
      servingLabel: 'Serving player',
      swapButton: 'Swap',
    },
    simpleScore: {
      hint: 'Tap the buttons to adjust score.',
      tapToScore: 'Tap anywhere to add point',
    },
    coach: {
      title: 'Manual Entry Match',
      hint: 'Enter scores directly for each player.',
      applyScores: 'Apply scores',
      player1Label: 'Player 1',
      player2Label: 'Player 2',
    },
    toasts: {
      matchFinishedTitle: 'Match finished',
      matchFinishedBody: 'Start a new match to keep scoring.',
      nothingToUndo: 'Nothing to undo',
      nothingToErase: 'Nothing to erase',
      historyCleared: 'History cleared',
      cannotSaveEmptyName: 'Cannot save empty name',
      savedName: (name) => `Saved ${name}`,
      gameWin: (name) => `${name} wins the game`,
      matchWin: (name) => `${name} wins the match`,
      rematchStarted: 'Rematch started!',
    },
    relativeTime: {
      justNow: 'just now',
      secondsAgo: (seconds: number) => `${seconds}s ago`,
      minutesAgo: (minutes: number) => `${minutes}m ago`,
      hoursAgo: (hours: number) => `${hours}h ago`,
      daysAgo: (days: number) => `${days}d ago`,
    },
    doublesDiagram: {
      serve: 'SERVE',
      receive: 'RECV',
    },
    statsPanel: {
      title: 'Match stats',
      backButton: 'Back to details',
      description: 'Focus on tempo, rally pace, and duration without other panels in view.',
      requirementTitle: 'Keep playing to unlock stats',
      requirementBody: (minMatches) => `Complete at least ${minMatches} matches to view stats from your previous match.`,
      previousMatchLabel: (relativeTime) => `Most recent completed match (${relativeTime}).`,
      configLabel: (raceTo, bestOf) => `Race to ${raceTo} · Best of ${bestOf}`,
      matchDurationLabel: 'Match duration',
      matchDurationHint: 'Clock time since this match began.',
      averageRallyLabel: 'Average rally length',
      averageRallyHint: 'Elapsed time divided by rallies played.',
      totalRalliesLabel: 'Rallies played',
      totalRalliesHint: 'Includes completed games plus the live game.',
      pointsPerMinuteLabel: 'Rallies per minute',
      pointsPerMinuteHint: 'Based on the running match clock.',
      averageGameLabel: 'Average game duration',
      averageGameHint: 'Only counts finished games.',
      noGamesYet: 'No completed games yet',
      profileHeading: 'Player profiles',
      profileEmpty: 'Finish matches to build player profiles.',
      profileMatchesLabel: (matches: number) =>
        `${matches} ${matches === 1 ? 'match' : 'matches'}`,
      profileWinRateLabel: 'Win rate',
      profilePointsLabel: 'Avg points',
      profileAvgDurationLabel: 'Avg match duration',
    },
    onboarding: {
      welcome: 'Welcome to Badminton Score Tracker!',
      welcomeDesc: 'Track your badminton matches with ease. This quick tour will show you the main features.',
      scoring: 'Easy Scoring',
      scoringDesc: 'Tap +1 to add points, -1 to correct mistakes. The app automatically tracks games, service, and match winner.',
      history: 'Match History',
      historyDesc: 'Your completed games are saved automatically. View stats, share results, and track your progress over time.',
      shortcuts: 'Keyboard Shortcuts',
      shortcutsDesc: 'Use these shortcuts for faster scoring:',
      skip: 'Skip',
      back: 'Back',
      next: 'Next',
      getStarted: "Let's Go!",
    },
    dataManagement: {
      title: 'Data Management',
      description: 'Backup and restore your match data',
      export: 'Export Backup',
      import: 'Import Backup',
      exportTitle: 'Export Data',
      exportHelp: 'Copy this data or download as a file to backup your matches.',
      exportError: 'Export Error',
      exportErrorMsg: 'Failed to export data',
      downloadFile: 'Download File',
      downloadSuccess: 'Backup downloaded',
      downloadError: 'Download Error',
      downloadErrorMsg: 'Failed to download file',
      importTitle: 'Import Data',
      importHelp: 'Paste your backup data or upload a backup file.',
      importPlaceholder: 'Paste backup data here...',
      importWarning: '⚠️ This will replace your current match and history, then reload the app.',
      importWarningHistoryOnly: '⚠️ This will replace your match history only, then reload the app.',
      importCurrentMatch: 'Also replace current match (unchecked = history only)',
      importData: 'Import Data',
      importSuccess: 'Data imported successfully. Reloading...',
      importError: 'Import Error',
      importErrorMsg: 'Invalid backup file format',
    },
    settings2: {
      soundEffects: 'Sound Effects',
      soundEffectsDesc: 'Play heartbeat sound during critical points',
      hapticFeedback: 'Haptic Feedback',
      hapticFeedbackDesc: 'Vibrate on game and match wins',
      keepScreenOn: 'Keep Screen On',
      keepScreenOnDesc: 'Prevent screen from turning off during matches',
      showKeyboardShortcuts: 'Show Keyboard Shortcuts',
      appVersion: 'App Version',
    },
    momentum: {
      title: 'Momentum',
      notEnoughData: 'Score some points to see the momentum chart',
      ralliesLabel: 'Rallies',
      leadChanges: 'Lead Changes',
      biggestLead: 'Biggest Lead',
      longestStreak: 'Longest Streak',
    },
    headToHead: {
      title: 'Head-to-Head',
      noMatches: 'No previous matches between these players',
      record: 'Record',
      wins: 'Wins',
      lastPlayed: 'Last Played',
      avgMargin: 'Avg. Margin',
      recentForm: 'Recent Form',
    },
    matchTags: {
      title: 'Match Type',
      hint: 'Tag this match',
      training: 'Training',
      league: 'League',
      friendly: 'Friendly',
      tournament: 'Tournament',
    },
    matchNotes: {
      title: 'Match Notes',
      note: 'note',
      notes: 'notes',
      placeholder: 'Add a note about this match...',
      ctrlEnterHint: 'Ctrl+Enter to add',
      addNote: 'Add Note',
      deleteNote: 'Delete note',
      game: 'Game',
      empty: 'No notes yet. Add observations, tactics, or reminders.',
    },
    undoHistory: {
      title: 'Undo History',
      empty: 'No actions to undo',
      undoTo: 'Undo to this point',
      currentState: 'Current',
      point: 'Point',
      game: 'Game',
      action: 'Action',
      actionsAgo: (count) => `${count} action${count === 1 ? '' : 's'} ago`,
    },
    export: {
      title: 'Export Match',
      hint: 'Save a snapshot of the current scoreboard',
      exportPng: 'Export as PNG',
      exporting: 'Exporting...',
      success: 'Image saved!',
      error: 'Export failed',
      filename: 'badminton-score',
    },
    customGame: {
      title: 'Custom Game Mode',
      hint: 'Configure target scores and handicaps',
      targetScore: 'Target Score',
      targetScoreHint: 'Points needed to win a game',
      handicap: 'Handicap',
      handicapHint: 'Give one player a starting advantage',
      presets: 'Quick Presets',
      applyHandicap: 'Apply Handicap',
      clearHandicap: 'Clear',
      startingPoints: 'Starting Points',
    },
    trends: {
      title: 'Performance Trends',
      noData: 'Not enough match data',
      minMatches: (count) => `Play at least ${count} matches to see trends`,
      winRate: 'Win Rate',
      avgScore: 'Avg. Score',
      avgDuration: 'Avg. Duration',
      recentMatches: 'Recent Matches',
      performance: 'Performance',
      improving: 'Improving',
      declining: 'Declining',
      stable: 'Stable',
    },
    templates: {
      title: 'Match Templates',
      hint: 'Save and quickly apply your favorite match configurations',
      save: 'Save',
      saveTitle: 'Save Template',
      saveDesc: 'This will save your current match settings (points, best of, win by two, doubles mode, tags, and player names).',
      saveCurrentTooltip: 'Save current settings as template',
      nameLabel: 'Template Name',
      namePlaceholder: 'e.g., League Match, Practice Session',
      empty: 'No templates saved yet. Save your current settings to create a template.',
      applied: 'Template applied!',
    },
    multicourt: {
      court1: 'Court 1',
      court2: 'Court 2',
      player1: 'Player 1',
      player2: 'Player 2',
      reset: 'Reset',
      resetAll: 'Reset All Courts',
      tapToScore: 'Tap to add point',
      saveNames: 'Save Names',
      namesSaved: 'Names saved!',
      settings: 'Settings',
      matchSettings: 'Match Settings',
      raceTo: 'Race to',
      finished: 'Finished',
      addCourt: 'Add Court',
    },
  },
  fr: {
    common: {
      cancel: 'Annuler',
      showFullView: 'Vue complète',
      scoreOnlyView: 'Vue score uniquement',
      simpleScoreView: 'Vue simple',
    },
    menu: {
      title: 'Menu du match',
      openLabel: 'Basculer le menu',
      closeLabel: 'Fermer le menu',
      scoreSection: 'Compteur de score',
      settingsSection: 'Paramètres du match',
      historySection: 'Historique et stats',
      coachSection: 'Saisie du score',
      aboutSection: 'À propos',
      aboutDescription: 'Badminton Score Tracker est une application réactive et hors ligne pour suivre les scores de matchs de badminton. Créé par Samuel Srouji.',
      aboutFeatures: [
        '🎯 Score principal : Appuyez sur +1/-1 pour marquer. Le score s\'anime avec un effet pop et glissement satisfaisant. Suivi automatique du service selon les règles du badminton, affichant le côté du court (gauche/droite).',
        '🏆 Détection de jeu et match : Détecte automatiquement la balle de jeu, balle de match et les gagnants. Affiche des badges et déclenche des célébrations spéciales avec confettis pour votre joueur favori.',
        '🔥 Séries gagnantes : Mise en évidence visuelle quand un joueur marque 5+ points consécutifs, avec style spécial combiné avec la balle de match.',
        '⚙️ Paramètres de match : Configurez les points pour gagner (défaut 21), meilleur des manches (1, 3 ou 5), règle du 2 points d\'écart, et mode double. Préréglages rapides pour Standard, Double, Court (15 pts), et Sprint (11 pts).',
        '👥 Profils joueurs : Sauvegardez les noms avec avatars et couleurs. Application rapide des noms favoris, marquez les joueurs comme favoris pour célébrations spéciales.',
        '🎾 Support double : Mode double complet avec diagramme du court montrant les 4 positions, indicateurs service/réception, et suivi de rotation.',
        '🔊 Effets sonores : Sons de points, arpèges montants pour balle de jeu/match, fanfares de victoire, et battement de cœur aux moments cruciaux via Web Audio API.',
        '📳 Retour haptique : Vibrations pour les points, balle de jeu (double pulsation), balle de match (triple pulsation), et patterns de célébration.',
        '📊 Statistiques : Graphique de momentum montrant le différentiel de points. Historique face-à-face entre joueurs avec taux de victoire, marges moyennes et forme récente.',
        '📝 Notes de match : Ajoutez des notes horodatées pendant le jeu. Étiquetez les matchs : Entraînement, Ligue, Amical ou Tournoi.',
        '↩️ Système d\'annulation : Annulez la dernière action ou consultez la chronologie complète pour revenir à n\'importe quel état.',
        '💾 Gestion des données : Sauvegarde automatique sur l\'appareil. Export/import de sauvegardes JSON. Jusqu\'à 8 modèles de match.',
        '📸 Export et partage : Sauvegardez le tableau comme image PNG. Partagez les résultats ou le lien de l\'application.',
        '🖥️ Modes d\'affichage : Vue complète, superposition score uniquement, ou vue simple avec grandes cartes tactiles.',
        '⌨️ Raccourcis clavier : A/B pour points, Q/W pour soustraire, U ou Ctrl+Z pour annuler, S pour serveur, E pour changer de côté.',
        '♿ Accessibilité : Respecte les préférences de mouvement réduit, annonces lecteur d\'écran, navigation clavier, thèmes clair/sombre.',
        '🔋 Mobile : Écran allumé pendant les matchs, partage natif, interface tactile optimisée, et application Android via Capacitor.',
        '🌍 Langues : Disponible en anglais et français avec horodatage localisé.',
      ],
      multicourtSection: 'Multi-Terrain',
      multicourtDescription: 'Gérez plusieurs terrains et matchs simultanément. Parfait pour les directeurs de tournoi, gestionnaires de club et entraîneurs supervisant plusieurs parties.',
      multicourtFeatures: [
        '🎨 Thèmes personnalisés : Créez vos propres combinaisons de couleurs. Personnalisez l\'application aux couleurs de votre club.',
        '👤 Avatars joueurs : Téléchargez des photos de profil ou choisissez parmi les avatars intégrés. Voyez les visages sur les cartes de score.',
        '🎾 Terrain animé : Regardez le volant s\'animer entre serveur et receveur. Trajectoire visuelle du jeu.',
        '📱 Mises en page intelligentes : Dispositions optimisées pour portrait et paysage. Scores côte à côte en paysage, empilés en portrait.',
        '📺 Mode TV : Grandes polices et affichage à contraste élevé optimisé pour le streaming et la diffusion sur grands écrans.',
        '🪟 Picture-in-Picture : Mini fenêtre flottante de score qui reste au-dessus des autres applications.',
        '📲 Widget : Widget d\'écran d\'accueil affichant le score en direct sans ouvrir l\'application (Android).',
        '⌚ Application montre : Application compagnon pour montres connectées pour suivre les scores depuis votre poignet.',
        '🏟️ Vue multi-terrain : Voyez tous les terrains actifs d\'un coup d\'œil. Changement rapide entre les matchs.',
        '🏆 Mode tournoi : Génération de tableaux, planification de poules, et avancement automatique.',
      ],
      comingSoon: '✨ Ces fonctionnalités arrivent bientôt ! Restez à l\'écoute des mises à jour.',
    },
    app: {
      documentTitle: 'Suivi de score badminton',
      headerTitle: 'Suivi de score badminton',
      descriptionLines: [
        'Gardez une trace hors ligne et réactive de chaque échange.',
        'Les scores restent sur cet appareil pour reprendre quand vous voulez.',
        'Cette application a été créée par Samuel Srouji.',
      ],
      loadingScoreView: 'Chargement de la vue de score…',
      loadingDoublesDiagram: 'Chargement du schéma double…',
      loadingMatchDetails: 'Chargement des détails du match…',
    },
    header: {
      scoreOnlyActive: 'Vue complète',
      scoreOnlyInactive: 'Vue score uniquement',
      simpleActive: 'Vue complète',
      simpleInactive: 'Vue simple',
      undo: 'Annuler',
      undoTooltip: 'Annuler la dernière action',
      colorSchemeTooltip: 'Basculer clair / sombre',
      colorSchemeAriaLabel: 'Changer le thème',
      languageTooltip: 'Afficher en anglais',
      shareApp: 'Partager',
      shareAppTooltip: 'Partager cette app avec vos amis',
      shareAppCopied: 'Lien copié!',
      shareAppError: 'Impossible de partager',
    },
    controls: {
      resetPoints: 'Réinitialiser les points',
      resetPointsTooltip: 'Efface uniquement le score en cours',
      resetPointsModalTitle: 'Réinitialiser les points ?',
      resetPointsModalBody: 'Efface le score de la partie mais conserve l’historique.',
      startNewMatch: 'Commencer un nouveau match',
      resetMatchTooltip: 'Efface points, jeux et historique',
      resetMatchModalTitle: 'Commencer un nouveau match ?',
      resetMatchModalBody: 'Réinitialise tout le match pour repartir de zéro.',
      swapEnds: 'Échanger les côtés',
      toggleServer: 'Changer le serveur',
      adjustPositionsHeading: 'Ajuster les positions',
      resetsHeading: 'Remises à zéro',
    },
    settings: {
      title: 'Paramètres du match',
      raceToLabel: 'Points cibles par jeu',
      matchLengthLabel: 'Durée du match',
      bestOfOption: (value) => `Meilleur des ${value}`,
      winByTwoLabel: 'Exiger deux points d’écart',
      winByTwoEnabled: 'Activé',
      winByTwoDisabled: 'Désactivé',
      doublesLabel: 'Contribution en double',
      doublesEnabled: 'Suivi',
      doublesDisabled: 'Masqué',
      quickPresets: {
        title: 'Préréglages rapides',
        helper: 'Réglez l’ambiance du match avant le premier volant.',
        hint: 'Ajuste automatiquement points, durée et règles.',
        presets: {
          standard: {
            label: 'Rallye standard',
            description: 'Jeux à 21 points · meilleur des 3 · deux points d’écart.',
          },
          doubles: {
            label: 'Prêt pour le double',
            description: 'Jeux à 21 points avec suivi des paires.',
          },
          short: {
            label: 'Rapide 15',
            description: 'Jeux à 15 points · meilleur des 3.',
          },
          sprint: {
            label: 'Sprint 11',
            description: 'Jeu unique à 11 points · mort subite.',
          },
        },
      },
      recentConfigs: {
        title: 'Configurations récentes',
        helper: 'Vos derniers réglages restent à portée.',
        empty: 'Modifiez un paramètre pour remplir cette liste.',
        label: (raceTo, bestOf) => `Course à ${raceTo} · Meilleur des ${bestOf}`,
        singlesTag: 'Simple',
        doublesTag: 'Double',
        winByTwoTag: 'Deux points d’écart',
        suddenDeathTag: 'Mort subite',
      },
    },
    insights: {
      title: 'Aperçus du match',
      pauseClock: 'Mettre l’horloge en pause',
      resumeClock: 'Relancer l’horloge',
      duration: 'Durée',
      live: 'En cours',
      completed: 'Terminé',
      bestOfBadge: (value) => `Meilleur des ${value}`,
      gamesNeededBadge: (value) => `Jeux nécessaires ${value}`,
      raceToBadge: (value) => `Course à ${value}`,
      updatedBadge: (relativeTime) => `Mis à jour ${relativeTime}`,
      tip: 'Astuce : ajoutez la page à votre écran d’accueil pour un tableau hors ligne pendant les entraînements ou tournois.',
    },
    rotation: {
      heading: 'Rotation en double',
      court: frCourtLabels,
      servingSentence: (teamName, courtSide, partnerName) =>
        `${teamName} sert du ${frCourtLabels[courtSide]} avec ${partnerName}.`,
      receivingSentence: (teamName, partnerName) =>
        `${teamName} reçoit avec ${partnerName}.`,
    },
    playerCard: {
      serviceBadge: (courtLabel) => `Au service - ${courtLabel}`,
      matchPoint: 'Balle de match',
      gamePoint: 'Balle de jeu',
      winner: 'Gagnant',
      pointsLabel: 'Points',
      gamesWonLabel: 'Jeux gagnés',
      teammateLineup: 'Ordre des partenaires',
      switchTeammates: 'Intervertir',
      savePlayerName: (name) => `Enregistrer "${name}"`,
      resetPlayerName: 'Réinitialiser le nom',
      saveTeammateName: (name) => `Enregistrer "${name}"`,
      clearTeammateName: 'Effacer le nom du partenaire',
      savedNamesTooltip: 'Noms enregistrés',
      addToFavorites: 'Ajouter aux favoris',
      removeFromFavorites: 'Retirer des favoris',
    },
    savedNamesMenu: {
      menuLabel: 'Noms enregistrés',
      noSavedNames: 'Aucun nom enregistré',
      tooltip: 'Noms enregistrés',
      quickApplyLabel: 'Accès rapide',
      quickApplyHint: 'Remplit ce champ immédiatement.',
      quickApplyEmpty: 'Enregistrez un nom pour activer l’accès rapide.',
      recentBadge: 'Récent',
      allNamesLabel: 'Tous les noms enregistrés',
      clearHelper: 'Revenir au nom par défaut.',
      saveHelper: 'Ajoute le nom actuel à la liste.',
    },
    history: {
      title: 'Historique des jeux',
      summaryEmpty: 'Les jeux terminés apparaîtront ici.',
      summaryCount: (count) =>
        `Affichage des ${count} dernier${count === 1 ? '' : 's'} jeu${count === 1 ? '' : 'x'}.`,
      collapsedHidden: 'Historique masqué. Utilisez "Afficher l’historique" pour voir les jeux terminés.',
      collapsedEmpty: 'Terminez un jeu pour créer votre chronologie.',
      showHistory: 'Afficher l’historique',
      closeHistory: 'Fermer l’historique',
      eraseHistory: 'Effacer l’historique',
      gameLabel: (number) => `Jeu ${number}`,
      winnerBadge: (name) => `Vainqueur · ${name}`,
      statsButton: 'Statistiques',      shareResult: 'Partager',
      shareText: (player1, score1, player2, score2, duration, date) =>
        `🏸 Résultat du match de badminton\n\n${player1}: ${score1}\n${player2}: ${score2}\n\n⏱️ Durée: ${duration}\n📅 ${date}`,
      shareCopied: 'Résultat copié!',
      shareError: 'Impossible de partager le résultat',    },
    overlays: {
      servingLabel: 'Joueur au service',
      swapButton: 'Échanger',
    },
    simpleScore: {
      hint: 'Touchez les boutons pour ajuster le score.',
      tapToScore: 'Touchez pour ajouter un point',
    },
    coach: {
      title: 'Match saisie manuelle',
      hint: 'Entrez les scores directement pour chaque joueur.',
      applyScores: 'Appliquer les scores',
      player1Label: 'Joueur 1',
      player2Label: 'Joueur 2',
    },
    toasts: {
      matchFinishedTitle: 'Match terminé',
      matchFinishedBody: 'Commencez un nouveau match pour continuer à compter les points.',
      nothingToUndo: 'Rien à annuler',
      nothingToErase: 'Rien à effacer',
      historyCleared: 'Historique effacé',
      cannotSaveEmptyName: 'Impossible d’enregistrer un nom vide',
      savedName: (name) => `${name} enregistré`,
      gameWin: (name) => `${name} remporte le jeu`,
      matchWin: (name) => `${name} remporte le match`,
      rematchStarted: 'Revanche commencée !',
    },
    relativeTime: {
      justNow: 'à l’instant',
      secondsAgo: (seconds: number) => `il y a ${seconds} s`,
      minutesAgo: (minutes: number) => `il y a ${minutes} min`,
      hoursAgo: (hours: number) => `il y a ${hours} h`,
      daysAgo: (days: number) => `il y a ${days} j`,
    },
    doublesDiagram: {
      serve: 'SERVICE',
      receive: 'RECEPTION',
    },
    statsPanel: {
      title: 'Statistiques du match',
      backButton: 'Retour aux détails',
      description: 'Analysez le rythme et la durée sans les autres cartes.',
      requirementTitle: 'Continuez pour débloquer les stats',
      requirementBody: (minMatches) =>
        `Terminez au moins ${minMatches} matchs pour afficher les statistiques de votre rencontre précédente.`,
      previousMatchLabel: (relativeTime) => `Dernier match terminé (${relativeTime}).`,
      configLabel: (raceTo, bestOf) => `Course à ${raceTo} · Meilleur des ${bestOf}`,
      matchDurationLabel: 'Durée du match',
      matchDurationHint: 'Temps écoulé depuis le début du match.',
      averageRallyLabel: 'Longueur moyenne d’un rallye',
      averageRallyHint: 'Temps écoulé divisé par les rallyes joués.',
      totalRalliesLabel: 'Rallyes joués',
      totalRalliesHint: 'Inclut les jeux terminés et la partie en cours.',
      pointsPerMinuteLabel: 'Rallyes par minute',
      pointsPerMinuteHint: 'Basé sur l’horloge du match.',
      averageGameLabel: 'Durée moyenne d’un jeu',
      averageGameHint: 'Uniquement les jeux terminés.',
      noGamesYet: 'Aucun jeu terminé pour le moment',
      profileHeading: 'Profils joueurs',
      profileEmpty: 'Terminez des matchs pour créer des profils.',
      profileMatchesLabel: (matches: number) =>
        `${matches} ${matches === 1 ? 'match' : 'matchs'}`,
      profileWinRateLabel: 'Taux de victoire',
      profilePointsLabel: 'Points moyens',
      profileAvgDurationLabel: 'Durée moyenne d\'un match',
    },
    onboarding: {
      welcome: 'Bienvenue sur Badminton Score Tracker!',
      welcomeDesc: 'Suivez vos matchs de badminton facilement. Ce petit tour va vous montrer les fonctionnalités principales.',
      scoring: 'Comptage facile',
      scoringDesc: 'Appuyez sur +1 pour ajouter des points, -1 pour corriger. L\'app suit automatiquement les jeux, le service et le gagnant.',
      history: 'Historique des matchs',
      historyDesc: 'Vos jeux terminés sont sauvegardés automatiquement. Consultez les stats, partagez les résultats et suivez vos progrès.',
      shortcuts: 'Raccourcis clavier',
      shortcutsDesc: 'Utilisez ces raccourcis pour compter plus vite:',
      skip: 'Passer',
      back: 'Retour',
      next: 'Suivant',
      getStarted: 'C\'est parti!',
    },
    dataManagement: {
      title: 'Gestion des données',
      description: 'Sauvegardez et restaurez vos données de match',
      export: 'Exporter',
      import: 'Importer',
      exportTitle: 'Exporter les données',
      exportHelp: 'Copiez ces données ou téléchargez un fichier pour sauvegarder vos matchs.',
      exportError: 'Erreur d\'export',
      exportErrorMsg: 'Impossible d\'exporter les données',
      downloadFile: 'Télécharger',
      downloadSuccess: 'Sauvegarde téléchargée',
      downloadError: 'Erreur de téléchargement',
      downloadErrorMsg: 'Impossible de télécharger le fichier',
      importTitle: 'Importer les données',
      importHelp: 'Collez vos données de sauvegarde ou uploadez un fichier.',
      importPlaceholder: 'Collez les données ici...',
      importWarning: '⚠️ Ceci remplacera votre match actuel et l\'historique, puis rechargera l\'app.',
      importWarningHistoryOnly: '⚠️ Ceci remplacera uniquement l\'historique des matchs, puis rechargera l\'app.',
      importCurrentMatch: 'Remplacer aussi le match actuel (décoché = historique seulement)',
      importData: 'Importer',
      importSuccess: 'Données importées avec succès. Rechargement...',
      importError: 'Erreur d\'import',
      importErrorMsg: 'Format de fichier invalide',
    },
    settings2: {
      soundEffects: 'Effets sonores',
      soundEffectsDesc: 'Jouer le battement de cœur pendant les points critiques',
      hapticFeedback: 'Retour haptique',
      hapticFeedbackDesc: 'Vibrer lors des victoires de jeu et de match',
      keepScreenOn: 'Garder l\'écran allumé',
      keepScreenOnDesc: 'Empêcher l\'écran de s\'éteindre pendant les matchs',
      showKeyboardShortcuts: 'Afficher les raccourcis clavier',
      appVersion: 'Version de l\'app',
    },
    momentum: {
      title: 'Momentum',
      notEnoughData: 'Marquez des points pour voir le graphique de momentum',
      ralliesLabel: 'Échanges',
      leadChanges: 'Changements de lead',
      biggestLead: 'Plus grande avance',
      longestStreak: 'Plus longue série',
    },
    headToHead: {
      title: 'Face-à-face',
      noMatches: 'Aucun match précédent entre ces joueurs',
      record: 'Bilan',
      wins: 'Victoires',
      lastPlayed: 'Dernier match',
      avgMargin: 'Écart moyen',
      recentForm: 'Forme récente',
    },
    matchTags: {
      title: 'Type de match',
      hint: 'Taguez ce match',
      training: 'Entraînement',
      league: 'Ligue',
      friendly: 'Amical',
      tournament: 'Tournoi',
    },
    matchNotes: {
      title: 'Notes du match',
      note: 'note',
      notes: 'notes',
      placeholder: 'Ajouter une note sur ce match...',
      ctrlEnterHint: 'Ctrl+Entrée pour ajouter',
      addNote: 'Ajouter',
      deleteNote: 'Supprimer la note',
      game: 'Jeu',
      empty: 'Aucune note. Ajoutez des observations, tactiques ou rappels.',
    },
    undoHistory: {
      title: 'Historique des actions',
      empty: 'Aucune action à annuler',
      undoTo: 'Annuler jusqu\'à ce point',
      currentState: 'Actuel',
      point: 'Point',
      game: 'Jeu',
      action: 'Action',
      actionsAgo: (count) => `il y a ${count} action${count === 1 ? '' : 's'}`,
    },
    export: {
      title: 'Exporter le match',
      hint: 'Sauvegarder une capture du tableau des scores',
      exportPng: 'Exporter en PNG',
      exporting: 'Exportation...',
      success: 'Image sauvegardée !',
      error: 'Échec de l\'export',
      filename: 'score-badminton',
    },
    customGame: {
      title: 'Mode de jeu personnalisé',
      hint: 'Configurer les scores cibles et handicaps',
      targetScore: 'Score cible',
      targetScoreHint: 'Points nécessaires pour gagner un jeu',
      handicap: 'Handicap',
      handicapHint: 'Donner un avantage de départ à un joueur',
      presets: 'Préréglages rapides',
      applyHandicap: 'Appliquer le handicap',
      clearHandicap: 'Effacer',
      startingPoints: 'Points de départ',
    },
    trends: {
      title: 'Tendances de performance',
      noData: 'Pas assez de données',
      minMatches: (count) => `Jouez au moins ${count} matchs pour voir les tendances`,
      winRate: 'Taux de victoire',
      avgScore: 'Score moyen',
      avgDuration: 'Durée moyenne',
      recentMatches: 'Matchs récents',
      performance: 'Performance',
      improving: 'En progression',
      declining: 'En déclin',
      stable: 'Stable',
    },
    templates: {
      title: 'Modèles de match',
      hint: 'Enregistrez et appliquez rapidement vos configurations préférées',
      save: 'Enregistrer',
      saveTitle: 'Enregistrer le modèle',
      saveDesc: 'Cela enregistrera vos paramètres actuels (points, meilleur de, victoire par 2, mode double, tags et noms des joueurs).',
      saveCurrentTooltip: 'Enregistrer les paramètres actuels comme modèle',
      nameLabel: 'Nom du modèle',
      namePlaceholder: 'ex: Match de ligue, Séance d\'entraînement',
      empty: 'Aucun modèle enregistré. Enregistrez vos paramètres actuels pour créer un modèle.',
      applied: 'Modèle appliqué !',
    },
    multicourt: {
      court1: 'Terrain 1',
      court2: 'Terrain 2',
      player1: 'Joueur 1',
      player2: 'Joueur 2',
      reset: 'Réinitialiser',
      resetAll: 'Réinitialiser tous les terrains',
      tapToScore: 'Appuyez pour ajouter un point',
      saveNames: 'Enregistrer les noms',
      namesSaved: 'Noms enregistrés !',
      settings: 'Paramètres',
      matchSettings: 'Paramètres du match',
      raceTo: 'Points pour gagner',
      finished: 'Terminé',
      addCourt: 'Ajouter un terrain',
    },
  },
}
