import { Request, Response, NextFunction } from 'express';

import * as authTokenService from './authToken';

import { queries, mutations, subscriptions } from '../schema';

export const authenticate = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  console.log('authenticating...');
  try {
    const { query } = request.body;

    if (!query) {
      response.status(500).send({ error: 'Operation not defined.' });
      return;
    } else {
      let operation = null;
      const operationType = query.split(' ')[0].trim();
      const operationName = query.split('{')[1].split('(')[0].trim();

      if (operationType === 'query')
        operation = queries[operationName];
      if (operationType === 'mutation')
        operation = mutations[operationName];
      if (operationType === 'subscription')
        operation = subscriptions[operationName];

      if (!operation) {
        response.status(500).send({ error: 'Invalid Operation.' });
        return;
      } else {
        if (operation.authenticate) {
          authorize(request, response, next);
        } else {
          next();
        }
      }
    }
  } catch (err) {
    response.status(401).send({ error: 'Unauthorized.' });
  }
};

export const authorize = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    if (!request) throw new Error('Not Authorized.');
    if (!request['headers']) throw new Error('Not Authorized.');
    if (!request['headers']['authorization'])
      throw new Error('Not Authorized.');

    const authorizationHeader = request['headers']['authorization'];
    const accessToken = authorizationHeader.split(' ');

    if (accessToken.length < 1) throw new Error('Not Authorized.');

    const { userId } = await authTokenService.verify(accessToken[1]);
    request.userId = userId;

    next();
  } catch (err) {
    response.status(401).send({ error: 'Unauthorized.' });
  }
};
