/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */

import ROLE from './role';

import createArray from './array';
import scorePoint from './evaluate';

class Board {
  init(sizeOrBoard) {
    this.allSteps = [];
    this.board = [];
    this.count = 0; // 棋子数

    let size;
    if (sizeOrBoard.length) {
      this.board = sizeOrBoard;
      size = this.board.length;
      for (let i = 0; i < this.board.length; i++) {
        this.count += this.board[i].filter(d => d > 0).length;
      }
    } else {
      size = sizeOrBoard;
      for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
          row.push(0);
        }
        this.board.push(row);
      }
    }


    this.comScore = createArray(size, size);
    this.humScore = createArray(size, size);

    this.initScore();
  }

  initScore() {
    const { board } = this;

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === ROLE.empty) {
          if (this.hasNeighbor(i, j, 2, 2)) {
            this.comScore[i][j] = scorePoint(this, i, j, ROLE.com);
            this.humScore[i][j] = scorePoint(this, i, j, ROLE.hum);
          }
        } else if (board[i][j] === ROLE.com) {
          this.comScore[i][j] = scorePoint(this, i, j, ROLE.com);
          this.humScore[i][j] = 0;
        } else if (board[i][j] === ROLE.hum) {
          this.comScore[i][j] = 0;
          this.humScore[i][j] = scorePoint(this, i, j, ROLE.hum);
        }
      }
    }
  }

  // 更新一个点附近的分数
  updateScore(p) {
    const radius = 4;
    const { board } = this;
    const len = board.length;

    const update = (x, y, dir) => {
      const role = board[x][y];
      if (role === ROLE.com) {
        this.comScore[x][y] = scorePoint(this, x, y, ROLE.com, dir);
      } else this.comScore[x][y] = 0;
      if (role === ROLE.hum) {
        this.humScore[x][y] = scorePoint(this, x, y, ROLE.hum, dir);
      } else this.humScore[x][y] = 0;
    };

    for (let i = -radius; i <= radius; i++) {
      const x = p[0];
      const y = p[1] + i;
      if (y < 0) continue;
      if (y >= len) break;
      update(x, y, 0);
    }

    for (let i = -radius; i <= radius; i++) {
      const x = p[0] + i;
      const y = p[1];
      if (x < 0) continue;
      if (x >= len) break;
      update(x, y, 1);
    }

    for (let i = -radius; i <= radius; i++) {
      const x = p[0] + i;
      const y = p[1] + i;
      if (x < 0 || y < 0) continue;
      if (x >= len || y >= len) break;
      update(x, y, 2);
    }

    for (let i = -radius; i <= radius; i++) {
      const x = p[0] + i;
      const y = p[1] - i;
      if (x < 0 || y < 0) continue;
      if (x >= len || y >= len) continue;
      update(x, y, 3);
    }
  }

  // 棋面估分
  evaluate(role) {
    this.comMaxScore = 0;
    this.humMaxScore = 0;

    const { board } = this;

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === ROLE.com) {
          this.comMaxScore += this.comScore[i][j];
        } else if (board[i][j] === ROLE.hum) {
          this.humMaxScore += this.humScore[i][j];
        }
      }
    }

    const result = (role === ROLE.com ? 1 : -1) * (this.comMaxScore - this.humMaxScore);

    return result;
  }

  // 下子
  put(p, role) {
    p.role = role;
    // console.log(`put [${p}] ${role}`);
    this.board[p[0]][p[1]] = role;
    this.updateScore(p);
    this.allSteps.push(p);
    this.count++;
  }

  // 移除棋子
  remove(p) {
    // const r = this.board[p[0]][p[1]];
    // console.log(`remove [${p}] ${r}`);
    this.board[p[0]][p[1]] = ROLE.empty;
    this.updateScore(p);
    this.allSteps.pop();
    this.count--;
  }


  gen(role) {
    const { board } = this;
    const result = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        if (board[i][j] === ROLE.empty) {
          const scoreHum = this.humScore[i][j];
          const scoreCom = this.comScore[i][j];
          const maxScore = Math.max(scoreHum, scoreCom);

          const p = [i, j];

          p.scoreHum = scoreHum;
          p.scoreCom = scoreCom;
          p.score = maxScore;
          p.role = role;

          result.push(p);
        }
      }
    }
    return result;
  }

  hasNeighbor(x, y, distance, count) {
    const { board } = this;
    const len = board.length;

    const startX = x - distance;
    const endX = x + distance;
    const startY = y - distance;
    const endY = y + distance;

    for (let i = startX; i <= endX; i++) {
      if (i < 0 || i >= len) continue;
      for (let j = startY; j <= endY; j++) {
        if (j < 0 || j >= len) continue;
        if (i === x && j === y) continue;
        if (board[i][j] !== ROLE.empty) {
          count--;
          if (count <= 0) return true;
        }
      }
    }
    return false;
  }
}

const board = new Board();

export default board;
