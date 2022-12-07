import * as jwt from 'jsonwebtoken';

import env from '../env';

export const sign = async (params: any, expire: boolean) => {
  let tokenExpiry = 86400; // 1 day
  if (!expire) tokenExpiry = 604800; // 7 day

  return jwt.sign(params, env.jwtSecret, { expiresIn: tokenExpiry });
};

export const verify = async (token) => {
  return jwt.verify(token, env.jwtSecret);
};
