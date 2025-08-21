import { describe, it, expect } from 'vitest';
import { VARIANTS } from './variants';
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
    expect(inMill(b,1,1,VARIANTS.nine.mills)).toBe(true);
  });

  it('collects complete mills', () => {
    const b = Array(24).fill(0);
    b[0]=b[1]=b[2]=1;
    const s = collectMill(b,1,VARIANTS.nine.mills);
    expect([...s].sort()).toEqual([0,1,2]);
  });

  it('prefers removing pieces not in mills', () => {
    const b = Array(24).fill(0);
    b[0]=b[1]=b[2]=-1;
    b[3]=-1;
    b[9]=1;
    const r = removables(b,1,VARIANTS.nine.mills);
    expect(r.has(3)).toBe(true);
    expect(r.has(0)).toBe(false);
  });

  it('enters moving phase only when all pieces placed and none to remove', () => {
    expect(enterMoving({p1:0,p2:0}, null)).toBe(true);
    expect(enterMoving({p1:1,p2:0}, null)).toBe(false);
    expect(enterMoving({p1:0,p2:0}, 1)).toBe(false);
  });

  it('limits movement when not flying', () => {
    const b = Array(24).fill(0);
    b[22]=-1; b[0]=-1; b[2]=-1; b[14]=-1;
    const dest = destinationsFor(b, VARIANTS.nine, 22, -1, 'nine', true);
    const expected = VARIANTS.nine.adj[22].filter(n=>b[n]===0);
    expect(dest.sort()).toEqual(expected.sort());
  });

  it('identifies win after reducing opponent to 2', () => {
    const b = Array(24).fill(0);
    b[0]=b[14]=-1;
    expect(checkWin(b,1,'moving',VARIANTS.nine,'nine',true)).toBe(1);
  });

  it('detects immediate win after removal', () => {
    const b = Array(24).fill(0);
    b[0]=b[14]=-1;
    expect(winnerAfterRemoval(b,1,'nine','moving')).toBe(1);
    expect(winnerAfterRemoval(b,1,'nine','placing')).toBe(0);
  });

  it('detects no legal moves', () => {
    const b = Array(9).fill(0);
    b[0]=b[4]=b[8]=-1;
    b[1]=b[3]=b[5]=b[7]=1;
    expect(checkWin(b,-1,'moving',VARIANTS.three,'three',false)).toBe(1);
  });
});
