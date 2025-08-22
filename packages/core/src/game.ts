export interface Game<State, Move> {
  /**
   * Create the initial game state.
   */
  init(): State;

  /**
   * Apply a move to the given state and return the new state.
   */
  applyMove(state: State, move: Move): State;

  /**
   * Determine whether the provided state represents a win.
   */
  checkWin(state: State): boolean;
}
