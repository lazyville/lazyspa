export interface Move {}
export interface State {}

export class Game<S = State, M = Move> {
  state: S
  constructor(initial: S) {
    this.state = initial
  }
  applyMove(_move: M): void {}
  checkWin(): boolean {
    return false
  }
}
