/* eslint-disable no-shadow */

const getBoard = () => [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const copy = a => a.map(r => r.slice()).slice();

const state = {
  board: getBoard(),
  steps: [],
  fives: [],
};

const actions = {
};

const mutations = {
  RESET_BOARD: (state) => {
    state.board = getBoard();
    state.steps = [];
  },

  SET_BOARD: (state, board) => {
    state.board = board;
  },

  SET_STEPS: (state, steps) => {
    state.steps = steps;
  },

  SET_FIVES: (state, fives) => {
    state.fives = fives;
  },

  SET_ROOM_DURATION: (state, duration) => {
    state.duration = duration;
  },

  ADD_CHESSMAN: (state, { position, role }) => {
    const [x, y] = position;

    const board = copy(state.board);
    board[x][y] = role;
    const step = {
      position,
      role,
    };
    state.steps.push(step);
    state.board = board;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
