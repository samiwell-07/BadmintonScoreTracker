import type {
  DoublesServiceState,
  PlayerIndex,
  SideId,
} from './scoreboard.types'

export const otherPlayer = (player: PlayerIndex): PlayerIndex =>
  player === 0 ? 1 : 0

export function getPlayerForScore(
  leftCourtPlayerIndex: PlayerIndex,
  score: number,
): PlayerIndex {
  return score % 2 === 1
    ? leftCourtPlayerIndex
    : otherPlayer(leftCourtPlayerIndex)
}

export function createDoublesServiceState(
  leftCourtPlayerIndexes: Record<SideId, PlayerIndex>,
  servingSide: SideId,
  scores: Record<SideId, number>,
): DoublesServiceState {
  return {
    leftCourtPlayerIndexes,
    servingPlayerIndex: getPlayerForScore(
      leftCourtPlayerIndexes[servingSide],
      scores[servingSide],
    ),
  }
}

export function applyDoublesRally(
  state: DoublesServiceState,
  previousServingSide: SideId | null,
  rallyWinner: SideId,
  scoresAfterRally: Record<SideId, number>,
): DoublesServiceState {
  if (previousServingSide === rallyWinner) {
    return {
      leftCourtPlayerIndexes: {
        ...state.leftCourtPlayerIndexes,
        [rallyWinner]: otherPlayer(
          state.leftCourtPlayerIndexes[rallyWinner],
        ),
      },
      servingPlayerIndex:
        state.servingPlayerIndex ??
        getPlayerForScore(
          otherPlayer(state.leftCourtPlayerIndexes[rallyWinner]),
          scoresAfterRally[rallyWinner],
        ),
    }
  }

  return {
    ...state,
    servingPlayerIndex: getPlayerForScore(
      state.leftCourtPlayerIndexes[rallyWinner],
      scoresAfterRally[rallyWinner],
    ),
  }
}

export function setDoublesServer(
  state: DoublesServiceState,
  servingSide: SideId,
  score: number,
): DoublesServiceState {
  return {
    ...state,
    servingPlayerIndex: getPlayerForScore(
      state.leftCourtPlayerIndexes[servingSide],
      score,
    ),
  }
}

export function swapDoublesTeamPositions(
  state: DoublesServiceState,
  side: SideId,
  servingSide: SideId | null,
  score: number,
): DoublesServiceState {
  const leftCourtPlayerIndexes = {
    ...state.leftCourtPlayerIndexes,
    [side]: otherPlayer(state.leftCourtPlayerIndexes[side]),
  }

  return {
    leftCourtPlayerIndexes,
    servingPlayerIndex:
      servingSide === side
        ? getPlayerForScore(leftCourtPlayerIndexes[side], score)
        : state.servingPlayerIndex,
  }
}

export function assignDoublesServer(
  state: DoublesServiceState,
  side: SideId,
  playerIndex: PlayerIndex,
  score: number,
): DoublesServiceState {
  const leftCourtPlayerIndex =
    score % 2 === 1 ? playerIndex : otherPlayer(playerIndex)

  return {
    leftCourtPlayerIndexes: {
      ...state.leftCourtPlayerIndexes,
      [side]: leftCourtPlayerIndex,
    },
    servingPlayerIndex: playerIndex,
  }
}