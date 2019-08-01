/* eslint-disable no-constant-condition */
/* eslint-disable no-continue */
import ROLE from './role';
import score from './score';


function countToScore(count, block, empty) {
  if (empty === undefined) empty = 0;
  if (empty <= 0) {
    if (count >= 5) return score.FIVE;
    if (block === 0) {
      switch (count) {
        case 1: return score.ONE;
        case 2: return score.TWO;
        case 3: return score.THREE;
        case 4: return score.FOUR;
        default: break;
      }
    }
    if (block === 1) {
      switch (count) {
        case 1: return score.BLOCKED_ONE;
        case 2: return score.BLOCKED_TWO;
        case 3: return score.BLOCKED_THREE;
        case 4: return score.BLOCKED_FOUR;
        default: break;
      }
    }
  } else if (empty === 1 || empty === count - 1) {
    // 第1个是空位
    if (count >= 6) {
      return score.FIVE;
    }
    if (block === 0) {
      switch (count) {
        case 2: return score.TWO / 2;
        case 3: return score.THREE;
        case 4: return score.BLOCKED_FOUR;
        case 5: return score.FOUR;
        default: break;
      }
    }

    if (block === 1) {
      switch (count) {
        case 2: return score.BLOCKED_TWO;
        case 3: return score.BLOCKED_THREE;
        case 4: return score.BLOCKED_FOUR;
        case 5: return score.BLOCKED_FOUR;
        default: break;
      }
    }
  } else if (empty === 2 || empty === count - 2) {
    // 第二个是空位
    if (count >= 7) {
      return score.FIVE;
    }
    if (block === 0) {
      switch (count) {
        case 3: return score.THREE;
        case 4:
        case 5: return score.BLOCKED_FOUR;
        case 6: return score.FOUR;
        default: break;
      }
    }

    if (block === 1) {
      switch (count) {
        case 3: return score.BLOCKED_THREE;
        case 4: return score.BLOCKED_FOUR;
        case 5: return score.BLOCKED_FOUR;
        case 6: return score.FOUR;
        default: break;
      }
    }

    if (block === 2) {
      switch (count) {
        case 4:
        case 5:
        case 6: return score.BLOCKED_FOUR;
        default: break;
      }
    }
  } else if (empty === 3 || empty === count - 3) {
    if (count >= 8) {
      return score.FIVE;
    }
    if (block === 0) {
      switch (count) {
        case 4:
        case 5: return score.THREE;
        case 6: return score.BLOCKED_FOUR;
        case 7: return score.FOUR;
        default: break;
      }
    }

    if (block === 1) {
      switch (count) {
        case 4:
        case 5:
        case 6: return score.BLOCKED_FOUR;
        case 7: return score.FOUR;
        default: break;
      }
    }

    if (block === 2) {
      switch (count) {
        case 4:
        case 5:
        case 6:
        case 7: return score.BLOCKED_FOUR;
        default: break;
      }
    }
  } else if (empty === 4 || empty === count - 4) {
    if (count >= 9) {
      return score.FIVE;
    }
    if (block === 0) {
      switch (count) {
        case 5:
        case 6:
        case 7:
        case 8: return score.FOUR;
        default: break;
      }
    }

    if (block === 1) {
      switch (count) {
        case 4:
        case 5:
        case 6:
        case 7: return score.BLOCKED_FOUR;
        case 8: return score.FOUR;
        default: break;
      }
    }

    if (block === 2) {
      switch (count) {
        case 5:
        case 6:
        case 7:
        case 8: return score.BLOCKED_FOUR;
        default: break;
      }
    }
  } else if (empty === 5 || empty === count - 5) {
    return score.FIVE;
  }

  return 0;
}

export default function s(b, px, py, role, dir) {
  const { board } = b;

  let result = 0;
  let empty = 0;
  let count = 0;
  let block = 0;
  let secondCount = 0;

  const len = board.length;

  function reset() {
    count = 1;
    block = 0;
    empty = -1;
    secondCount = 0;
  }

  if (dir === undefined || dir === 0) {
    // 水平方向
    reset();

    for (let i = py + 1; true; i++) {
      if (i >= len) {
        block++;
        break;
      }
      const r = board[px][i];
      if (r === ROLE.empty) {
        if (empty === -1 && i < len - 1 && board[px][i + 1] === role) {
          empty = count;
          continue;
        } else {
          break;
        }
      }
      if (r === role) {
        count++;
        continue;
      } else {
        block++;
        break;
      }
    }

    for (let i = py - 1; true; i--) {
      if (i < 0) {
        block++;
        break;
      }

      const r = board[px][i];
      if (r === ROLE.empty) {
        if (empty === -1 && i > 0 && board[px][i - 1] === role) {
          empty = 0;
          continue;
        } else {
          break;
        }
      }
      if (r === role) {
        secondCount++;
        if (empty !== -1) empty++;
        continue;
      } else {
        block++;
        break;
      }
    }

    count += secondCount;
  }

  result += countToScore(count, block, empty);

  if (dir === undefined || dir === 1) {
    // 垂直方向
    reset();

    for (let i = px + 1; true; i++) {
      if (i >= len) {
        block++;
        break;
      }
      const r = board[i][py];
      if (r === ROLE.empty) {
        if (empty === -1 && i < len - 1 && board[i + 1][py] === role) {
          empty = count;
          continue;
        } else {
          break;
        }
      }
      if (r === role) {
        count++;
        continue;
      } else {
        block++;
        break;
      }
    }

    for (let i = px - 1; true; i--) {
      if (i < 0) {
        block++;
        break;
      }
      const r = board[i][py];
      if (r === ROLE.empty) {
        if (empty === -1 && i > 0 && board[i - 1][py] === role) {
          empty = 0;
          continue;
        } else {
          break;
        }
      }
      if (r === role) {
        secondCount++;
        if (empty !== -1) empty++; // 注意这里，如果左边又多了己方棋子，那么empty的位置就变大了
        continue;
      } else {
        block++;
        break;
      }
    }

    count += secondCount;
  }

  result += countToScore(count);

  if (dir === undefined || dir === 2) {
    reset();

    for (let i = 1; true; i++) {
      const x = px + i;
      const y = py + i;
      if (x >= len || y >= len) {
        block++;
        break;
      }
      const r = board[x][y];
      if (r === ROLE.empty) {
        if (empty === -1 && (x < len - 1 && y < len - 1) && board[x + 1][y + 1] === role) {
          empty = count;
          continue;
        } else {
          break;
        }
      }
      if (r === role) {
        count++;
        continue;
      } else {
        block++;
        break;
      }
    }

    for (let i = 1; true; i++) {
      const x = px - i;

      const y = py - i;
      if (x < 0 || y < 0) {
        block++;
        break;
      }
      const r = board[x][y];
      if (r === ROLE.empty) {
        if (empty === -1 && (x > 0 && y > 0) && board[x - 1][y - 1] === role) {
          empty = 0;
          continue;
        } else {
          break;
        }
      }
      if (r === role) {
        secondCount++;
        if (empty !== -1) empty++; // 注意这里，如果左边又多了己方棋子，那么empty的位置就变大了
        continue;
      } else {
        block++;
        break;
      }
    }

    count += secondCount;
  }
  result += countToScore(count, block, empty);

  if (dir === undefined || dir === 3) {
    reset();

    for (let i = 1; true; i++) {
      const x = px + i;
      const y = py - i;
      if (x < 0 || y < 0 || x >= len || y >= len) {
        block++;
        break;
      }
      const r = board[x][y];
      if (r === ROLE.empty) {
        if (empty === -1 && (x < len - 1 && y < len - 1) && board[x + 1][y - 1] === role) {
          empty = count;
          continue;
        } else {
          break;
        }
      }
      if (r === role) {
        count++;
        continue;
      } else {
        block++;
        break;
      }
    }

    for (let i = 1; true; i++) {
      const x = px - i;
      const y = py + i;
      if (x < 0 || y < 0 || x >= len || y >= len) {
        block++;
        break;
      }
      const r = board[x][y];
      if (r === ROLE.empty) {
        if (empty === -1 && (x > 0 && y > 0) && board[x - 1][y + 1] === role) {
          empty = 0;
          continue;
        } else {
          break;
        }
      }
      if (r === role) {
        secondCount++;
        if (empty !== -1) empty++; // 注意这里，如果左边又多了己方棋子，那么empty的位置就变大了
        continue;
      } else {
        block++;
        break;
      }
    }

    count += secondCount;
  }
  result += countToScore(count, block, empty);

  return result;
}
