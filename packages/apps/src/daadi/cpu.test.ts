import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
const cpuBestRemoval = (board:number[]):number|null=>{
  for(let i=0;i<board.length;i++) if(board[i]===1) return i;
  return null;
};

describe('cpu removal', () => {
  it('chooses an opponent piece when removing after a mill', () => {
    const board = Array(24).fill(0);
    board[0]=board[1]=board[2]=-1; // CPU forms a mill
    board[3]=1; board[5]=1; // opponent pieces
    board[4]=-1; // extra CPU piece
    const idx = cpuBestRemoval(board);
    assert.ok(idx !== null);
    if(idx !== null){
      assert.strictEqual(board[idx],1);
    }
  });
});
