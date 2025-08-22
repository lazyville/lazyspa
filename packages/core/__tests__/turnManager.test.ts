// @ts-ignore
import { strict as assert } from 'node:assert';
import { Game } from '../src/game';
import { Player, TurnManager } from '../src/player';

type Phase = 'placement' | 'movement' | 'main';

function createDummyPlayer<State, Move>(): Player<State, Move, Phase> {
  return {
    type: 'human',
    getMove: () => ({}) as Move,
  };
}

function testPhaseTransition() {
  interface State { moves: number }
  type Move = {};
  const game: Game<State, Move> = {
    init: () => ({ moves: 0 }),
    applyMove: (state) => ({ moves: state.moves + 1 }),
    checkWin: () => false,
  };
  const player = createDummyPlayer<State, Move>();
  const tm = new TurnManager<State, Move, Phase>(
    game,
    [player, player],
    'placement',
    (state, phase) => (state.moves >= 2 ? 'movement' : phase)
  );

  tm.playTurn();
  assert.equal(tm.getPhase(), 'placement');

  tm.playTurn();
  assert.equal(tm.getPhase(), 'movement');
}

function testWinDetection() {
  interface State { moves: number }
  type Move = {};
  const game: Game<State, Move> = {
    init: () => ({ moves: 0 }),
    applyMove: (state) => ({ moves: state.moves + 1 }),
    checkWin: (state) => state.moves >= 3,
  };
  const player = createDummyPlayer<State, Move>();
  const tm = new TurnManager<State, Move, Phase>(
    game,
    [player, player],
    'main',
    (state, phase) => phase
  );

  tm.playTurn();
  tm.playTurn();
  const result = tm.playTurn();
  assert.deepEqual(result, { winner: 0 });
}

testPhaseTransition();
testWinDetection();
console.log('All tests passed');
