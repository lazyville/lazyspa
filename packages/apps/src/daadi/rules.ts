import type { K, P, Phase, Variant } from './variants';

/**
 * True if the piece at `idx` for `player` forms a mill.
 */
export function inMill(
  board: number[],
  idx: number,
  player: P,
  mills: number[][],
): boolean {
  return mills.some(
    (mill) => mill.includes(idx) && mill.every((j) => board[j] === player),
  );
}

/**
 * Collect all positions occupied by complete mills for `player`.
 */
export function collectMill(board: number[], player: P, mills: number[][]): Set<number> {
  const result = new Set<number>();
  for (const mill of mills) {
    if (mill.every((i) => board[i] === player)) {
      mill.forEach((i) => result.add(i));
    }
  }
  return result;
}

/**
 * Determine which opponent pieces may be removed when `remover` forms a mill.
 * Prefer pieces not currently in a mill unless all are in mills.
 */
export function removables(board: number[], remover: P, mills: number[][]): Set<number> {
  const victim = remover === 1 ? -1 : 1;
  const victimMills = collectMill(board, victim as P, mills);
  const totalVictims = board.filter((v) => v === victim).length;
  const result = new Set<number>();

  board.forEach((v, i) => {
    if (v === victim && (!victimMills.has(i) || victimMills.size === totalVictims)) {
      result.add(i);
    }
  });

  return result;
}

/** Can the player still place a piece? */
export const canPlace = (
  toPlace: { p1: number; p2: number },
  player: P,
): boolean => (player === 1 ? toPlace.p1 > 0 : toPlace.p2 > 0);

/** Enter moving phase once both players have placed all pieces and no removal pending. */
export const enterMoving = (
  toPlace: { p1: number; p2: number },
  mustRemove: P | null,
): boolean => toPlace.p1 === 0 && toPlace.p2 === 0 && mustRemove === null;

/**
 * Immediate win check after removing a piece.
 * Applies outside the placing phase for all variants.
 */
export const winnerAfterRemoval = (
  board: number[],
  remover: P,
  _variantKey: K,
  phase: Phase,
): P | 0 => {
  if (phase !== 'placing') {
    const opponent = remover === 1 ? -1 : 1;
    if (board.filter((v) => v === opponent).length <= 2) {
      return remover;
    }
  }
  return 0;
};

/**
 * All legal destinations for `player` moving from `idx`.
 */
export const destinationsFor = (
  board: number[],
  variant: Variant,
  idx: number,
  player: P,
  variantKey: K,
  flying: boolean,
): number[] => {
  const count = board.filter((v) => v === player).length;
  const canFly = flying && variantKey === 'nine' && count === 3;
  if (canFly) {
    return board.flatMap((v, i) => (v === 0 ? [i] : []));
  }
  return variant.adj[idx].filter((n) => board[n] === 0);
};

/**
 * Determine the winner after `toMove` plays, or 0 if the game continues.
 */
export const checkWin = (
  board: number[],
  toMove: P,
  phase: Phase,
  variant: Variant,
  variantKey: K,
  flying: boolean,
): P | 0 => {
  const player = toMove;
  const opponent = -player as P;
  const playerCount = board.filter((v) => v === player).length;

  if (phase !== 'placing' && playerCount <= 2) {
    return opponent;
  }

  const canFly = flying && variantKey === 'nine' && playerCount === 3;
  let hasMove = false;

  if (canFly) {
    hasMove = board.some((v) => v === 0);
  } else {
    for (let i = 0; i < board.length; i++) {
      if (board[i] === player && variant.adj[i].some((n) => board[n] === 0)) {
        hasMove = true;
        break;
      }
    }
  }

  return phase !== 'placing' && !hasMove ? opponent : 0;
};
