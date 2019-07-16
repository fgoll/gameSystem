import { send } from '@/client';

export const say = (data) => {
  send({
    header: 'say_hall',
    data,
  });
};

export const enterRoom = (data) => {
  send({
    header: 'enter_room',
    data,
  }, true);
};
