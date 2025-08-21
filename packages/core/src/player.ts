import { Game } from './game';

export interface Player<State, Move, Phase extends string = string> {
  readonly type: 'human' | 'ai';
  getMove(state: State, phase: Phase): Move;
}

export class TurnManager<State, Move, Phase extends string = string> {
  private currentPlayerIndex = 0;
  private phase: Phase;
  private state: State;

  constructor(
    private game: Game<State, Move>,
    private players: [Player<State, Move, Phase>, Player<State, Move, Phase>],
    initialPhase: Phase,
    private phaseTransition: (state: State, phase: Phase) => Phase
  ) {
    this.state = game.init();
    this.phase = initialPhase;
  }

  getPhase(): Phase {
    return this.phase;
  }

  getState(): State {
    return this.state;
  }

  getCurrentPlayer(): Player<State, Move, Phase> {
    return this.players[this.currentPlayerIndex];
  }

  playTurn(): { winner: number | null } {
    const player = this.getCurrentPlayer();
    const move = player.getMove(this.state, this.phase);
    this.state = this.game.applyMove(this.state, move);

    if (this.game.checkWin(this.state)) {
      return { winner: this.currentPlayerIndex };
    }

    this.phase = this.phaseTransition(this.state, this.phase);
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;
    return { winner: null };
  }
}
