import { send } from '@/client';

export const say = (data) => {
  send({
    header: 'say_room',
    data,
  });
};

export const toggle = () => {
  send({
    header: 'toggle',
  });
};

export const leave = (data) => {
  send({
    header: 'leave',
    data,
  }, true);
};

// draw
export const drawStart = (data) => {
  send({
    header: 'draw_start',
    data,
  });
};

export const drawMove = (data) => {
  send({
    header: 'draw_move',
    data,
  });
};

export const drawEnd = () => {
  send({
    header: 'draw_end',
  });
};

export const drawClear = () => {
  send({
    header: 'draw_clear',
  });
};

export const next = (data) => {
  send({
    header: 'next_begin',
    data,
  });
};
