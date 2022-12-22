import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
  GraphQLInt,
} from 'graphql';

import { InventoryServiceObjectType } from './object/inventoryService';

import * as inventoryServiceModel from '../model/inventoryService';
import * as inventoryModel from '../model/inventory';

import { pubSub, PUBLISH_CHANGE } from '../service/subscription';

const query = {
  inventoryServices: {
    type: new GraphQLList(InventoryServiceObjectType),
    args: {},
    authenticate: true,
    resolve: async (root, {}) => inventoryServiceModel.fetch(),
  },
  inventoryServiceById: {
    type: InventoryServiceObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (root, { id }) =>
      inventoryServiceModel.fetchById(id),
  },
};

const subscription = {
  default: {
    type: GraphQLString,
    args: {},
    authenticate: true,
    resolve: async (root, {}) => 'subsciption',
    subscribe: () =>
      pubSub.asyncIterator([PUBLISH_CHANGE.INVENTORY_SERVICE_CHANGE]),
  },
};

const publish = (change = null, data = {}) => {
  const publishChange = change
    ? change
    : PUBLISH_CHANGE.INVENTORY_SERVICE_CHANGE;

  pubSub.publish(publishChange, data);
};

const mutation = {
  inventoryServiceCreate: {
    type: InventoryServiceObjectType,
    args: {
      inventory: { type: new GraphQLNonNull(GraphQLString) },
      note: { type: GraphQLInt },
    },
    resolve: async (obj, input, request) => {
      try {
        const { inventory, type, quantity } = input;

        const inventoryDetail = await inventoryModel.fetchById(
          inventory,
        );

        const response = await inventoryServiceModel.create(input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  inventoryServiceDeleteById: {
    type: InventoryServiceObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        const inventoryServiceDetail: any =
          await inventoryServiceModel.fetchById(id);

        const inventoryDetail = await inventoryModel.fetchById(
          inventoryServiceDetail.inventory._id,
        );

        //updating
        const response = await inventoryModel.remove(id);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
};

export default {
  query,
  subscription,
  mutation,
  types: [InventoryServiceObjectType],
};
