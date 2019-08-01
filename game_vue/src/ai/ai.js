/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */
import ROLE from './role';
import m from './negamax';
import board from './board';


class AI {
  start() {
    board.init(15);
    return {
      board: undefined,
    };
  }

  begin() {
    const p = m(undefined, 4);
    board.put(p, ROLE.com);
    return p;
  }

  turn(x, y) {
    this.set(x, y, ROLE.hum);
    // return [Math.ceil(Math.random() * 15), Math.ceil(Math.random() * 15)];
    return this.begin();
  }

  set(x, y, r) {
    board.put([x, y], r);
  }
}


export default AI;
