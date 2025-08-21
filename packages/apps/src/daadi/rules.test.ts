import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
const VARIANTS: any = {
  nine: {
    adj: [
      [1, 9], [0, 2, 4], [1, 14], [4, 10], [1, 3, 5, 7], [4, 13],
      [7, 11], [4, 6, 8, 16], [7, 12], [0, 10, 21], [3, 9, 11], [6, 10, 15],
      [8, 13, 17], [5, 12, 14], [2, 13, 23], [11, 16], [7, 15, 17, 19],
      [12, 16], [19, 10], [16, 18, 20, 22], [19, 13], [9, 22], [19, 21, 23],
      [14, 22],
    ],
    mills: [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17],
      [18, 19, 20], [21, 22, 23], [0, 9, 21], [3, 10, 18], [6, 11, 15],
      [1, 4, 7], [16, 19, 22], [8, 12, 17], [5, 13, 20], [2, 14, 23],
    ],
    initialPieces: 9,
    allowFlyingDefault: true,
  },
  three: {
    adj: [
      [1, 3], [0, 2, 4], [1, 5], [0, 4, 6], [1, 3, 5, 7], [2, 4, 8],
      [3, 7], [4, 6, 8], [5, 7],
    ],
    mills: [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8],
    ],
    initialPieces: 3,
    allowFlyingDefault: false,
  },
} as const;
import {
  inMill,
  collectMill,
  removables,
  destinationsFor,
  enterMoving,
  winnerAfterRemoval,
  checkWin,
} from './rules';

describe('rules helpers', () => {
  it('detects mills', () => {
    const b = Array(24).fill(0);
    b[0]=b[1]=b[2]=1;
    assert.strictEqual(inMill(b,1,1,VARIANTS.nine.mills), true);
  });

  it('collects complete mills', () => {
    const b = Array(24).fill(0);
    b[0]=b[1]=b[2]=1;
    const s = collectMill(b,1,VARIANTS.nine.mills);
    assert.deepStrictEqual([...s].sort(), [0,1,2]);
  });

  it('prefers removing pieces not in mills', () => {
    const b = Array(24).fill(0);
    b[0]=b[1]=b[2]=-1;
    b[3]=-1;
    b[9]=1;
    const r = removables(b,1,VARIANTS.nine.mills);
    assert.strictEqual(r.has(3), true);
    assert.strictEqual(r.has(0), false);
  });

  it('enters moving phase only when all pieces placed and none to remove', () => {
    assert.strictEqual(enterMoving({p1:0,p2:0}, null), true);
    assert.strictEqual(enterMoving({p1:1,p2:0}, null), false);
    assert.strictEqual(enterMoving({p1:0,p2:0}, 1), false);
  });

  it('limits movement when not flying', () => {
    const b = Array(24).fill(0);
    b[22]=-1; b[0]=-1; b[2]=-1; b[14]=-1;
    const dest = destinationsFor(b, VARIANTS.nine, 22, -1, 'nine', true);
    const expected = VARIANTS.nine.adj[22].filter(n=>b[n]===0);
    assert.deepStrictEqual(dest.sort(), expected.sort());
  });

  it('identifies win after reducing opponent to 2', () => {
    const b = Array(24).fill(0);
    b[0]=b[14]=-1;
    assert.strictEqual(checkWin(b,-1,'moving',VARIANTS.nine,'nine',true), 1);
  });

  it('flags loss for player with only two pieces', () => {
    const b = Array(24).fill(0);
    b[0]=b[14]=1;
    b[3]=b[4]=b[5]=-1;
    assert.strictEqual(checkWin(b,1,'moving',VARIANTS.nine,'nine',true), -1);
  });

  it('detects immediate win after removal', () => {
    const b = Array(24).fill(0);
    b[0]=b[14]=-1;
    assert.strictEqual(winnerAfterRemoval(b,1,'nine','moving'), 1);
    assert.strictEqual(winnerAfterRemoval(b,1,'nine','placing'), 0);
  });

  it('detects immediate win after removal in three-men variant', () => {
    const b = Array(9).fill(0);
    b[0]=b[1]=-1;
    assert.strictEqual(winnerAfterRemoval(b,1,'three','moving'), 1);
  });

  it('detects no legal moves', () => {
    const b = Array(9).fill(0);
    b[0]=b[4]=b[8]=-1;
    b[1]=b[3]=b[5]=b[7]=1;
    assert.strictEqual(checkWin(b,-1,'moving',VARIANTS.three,'three',false), 1);
  });
});
