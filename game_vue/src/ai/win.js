/* eslint-disable no-constant-condition */
import R from './role';

function isFive(board, p, role) {
  const len = board.length;
  let count = 1;

  const reset = () => {
    count = 1;
  };

  for (let i = p[1] + 1; true; i++) {
    if (i >= len) break;
    const t = board[p[0]][i];
    if (t !== role) break;
    count++;
  }


  for (let i = p[1] - 1; true; i--) {
    if (i < 0) break;
    const t = board[p[0]][i];
    if (t !== role) break;
    count++;
  }

  if (count >= 5) return 1;

  // 纵向
  reset();

  for (let i = p[0] + 1; true; i++) {
    if (i >= len) {
      break;
    }
    const t = board[i][p[1]];
    if (t !== role) break;
    count++;
  }

  for (let i = p[0] - 1; true; i--) {
    if (i < 0) {
      break;
    }
    const t = board[i][p[1]];
    if (t !== role) break;
    count++;
  }


  if (count >= 5) return 2;
  // \\
  reset();

  for (let i = 1; true; i++) {
    const x = p[0] + i; const
      y = p[1] + i;
    if (x >= len || y >= len) {
      break;
    }
    const t = board[x][y];
    if (t !== role) break;

    count++;
  }

  for (let i = 1; true; i++) {
    const x = p[0] - i; const
      y = p[1] - i;
    if (x < 0 || y < 0) {
      break;
    }
    const t = board[x][y];
    if (t !== role) break;
    count++;
  }

  if (count >= 5) return 3;

  // \/
  reset();

  for (let i = 1; true; i++) {
    const x = p[0] + i; const
      y = p[1] - i;
    if (x < 0 || y < 0 || x >= len || y >= len) {
      break;
    }
    const t = board[x][y];
    if (t !== role) break;
    count++;
  }

  for (let i = 1; true; i++) {
    const x = p[0] - i; const
      y = p[1] + i;
    if (x < 0 || y < 0 || x >= len || y >= len) {
      break;
    }
    const t = board[x][y];
    if (t !== role) break;
    count++;
  }

  if (count >= 5) return 4;

  return 0;
}


function w(board) {
  let p; let
    d = 0;
  for (let i = 0; i < board.length && !d; i++) {
    for (let j = 0; j < board[i].length && !d; j++) {
      const t = board[i][j];
      p = [i, j];
      if (t !== R.empty) {
        d = isFive(board, [i, j], t);
        if (d) break;
      }
    }
  }

  if (!d) return false;
  if (d === 1) {
    return [
      p,
      [p[0], p[1] + 1],
      [p[0], p[1] + 2],
      [p[0], p[1] + 3],
      [p[0], p[1] + 4],
    ];
  }
  if (d === 2) {
    return [
      p,
      [p[0] + 1, p[1]],
      [p[0] + 2, p[1]],
      [p[0] + 3, p[1]],
      [p[0] + 4, p[1]],
    ];
  }
  if (d === 3) {
    return [
      p,
      [p[0] + 1, p[1] + 1],
      [p[0] + 2, p[1] + 2],
      [p[0] + 3, p[1] + 3],
      [p[0] + 4, p[1] + 4],
    ];
  }
  if (d === 4) {
    return [
      p,
      [p[0] + 1, p[1] - 1],
      [p[0] + 2, p[1] - 2],
      [p[0] + 3, p[1] - 3],
      [p[0] + 4, p[1] - 4],
    ];
  }
  return false;
}

export default w;
