import { PubSub } from 'graphql-subscriptions';

export const pubSub = new PubSub();

export const PUBLISH_CHANGE = {
  USER_CHANGE: 'USER_CHANGE',
  SERVICE_CHANGE: 'SERVICE_CHANGE',
  BOOKING_CHANGE: 'BOOKING_CHANGE',
  INVENTORY_CHANGE: 'INVENTORY_CHANGE',
  TEMPLATE_CHANGE: 'TEMPLATE_CHANGE',
};
