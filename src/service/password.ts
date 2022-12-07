import * as bcryptjs from 'bcryptjs';

const SALT_ROUND = 10;

export const hash = (password: string) => {
  return bcryptjs.hash(password, SALT_ROUND);
};

export const compare = (password: string, hashedPassword: string) => {
  return bcryptjs.compare(password, hashedPassword);
};
