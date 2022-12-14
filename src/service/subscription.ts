import { PubSub } from 'graphql-subscriptions';

export const pubSub = new PubSub();

export const PUBLISH_CHANGE = {
  USER_CHANGE: 'USER_CHANGE',
  SERVICE_CHANGE: 'SERVICE_CHANGE',
  BOOKING_CHANGE: 'BOOKING_CHANGE',
  INVENTORY_CHANGE: 'INVENTORY_CHANGE',
  TEMPLATE_CHANGE: 'TEMPLATE_CHANGE',
  INVENTORY_CATEGORY_CHANGE: 'INVENTORY_CATEGORY_CHANGE',
  INVENTORY_STOCK_CHANGE: 'INVENTORY_STOCK_CHANGE',
  INVENTORY_SERVICE_CHANGE: 'INVENTORY_SERVICE_CHANGE',
  FEEDBACK_CHANGE: 'FEEDBACK_CHANGE',
  LEAVE_REQUEST_CHANGE: 'LEAVE_REQUEST_CHANGE',
};
