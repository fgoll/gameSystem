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
