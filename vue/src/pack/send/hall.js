/* eslint-disable import/prefer-default-export */
import { send } from '@/client';

export const say = (data) => {
  send({
    header: 'say_hall',
    data,
  });
};
