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
  profilesPanel: {
    title: string
    description: string
    saveButton: string
    linkedLabel: (profileName: string) => string
    unlinkedLabel: string
    emptyState: string
    applyHint: string
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
  }
  overlays: {
    servingLabel: string
    swapButton: string
  }
  simpleScore: {
    hint: string
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
    profilesPanel: {
      title: 'Profiles',
      description: 'Link players to reusable profiles so history and stats stay consistent.',
      saveButton: 'Save as profile',
      linkedLabel: (profileName) => `Linked to ${profileName}`,
      unlinkedLabel: 'Not linked to a profile',
      emptyState: 'Save a player to start building your profile library.',
      applyHint: 'Tap a profile to apply it to any player card.',
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
    },
    overlays: {
      servingLabel: 'Serving player',
      swapButton: 'Swap',
    },
    simpleScore: {
      hint: 'Tap the buttons to adjust score.',
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
  },
  fr: {
    common: {
      cancel: 'Annuler',
      showFullView: 'Vue complète',
      scoreOnlyView: 'Vue score uniquement',
      simpleScoreView: 'Vue simple',
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
    profilesPanel: {
      title: 'Profils',
      description: 'Associez les joueurs à des profils réutilisables pour garder un historique cohérent.',
      saveButton: 'Enregistrer en profil',
      linkedLabel: (profileName) => `Associé à ${profileName}`,
      unlinkedLabel: 'Aucun profil associé',
      emptyState: 'Enregistrez un joueur pour commencer votre bibliothèque de profils.',
      applyHint: 'Touchez un profil pour l’appliquer à n’importe quel joueur.',
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
      statsButton: 'Statistiques',
    },
    overlays: {
      servingLabel: 'Joueur au service',
      swapButton: 'Échanger',
    },
    simpleScore: {
      hint: 'Touchez les boutons pour ajuster le score.',
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
      profileAvgDurationLabel: 'Durée moyenne d’un match',
    },
  },
}
