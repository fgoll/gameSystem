import { send } from '@/client';

export const login = (data) => {
  send({
    header: 'login',
    data,
  }, true);
};

export const register = (data) => {
  send({
    header: 'register',
    data,
  }, true);
};
