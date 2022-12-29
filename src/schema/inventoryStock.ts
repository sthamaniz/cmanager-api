import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
  GraphQLInt,
} from 'graphql';
import * as Moment from 'moment';

import {
  InventoryStockObjectType,
  InventoryStockTypeEnumType,
} from './object/inventoryStock';

import * as inventoryModel from '../model/inventory';
import * as inventoryStockModel from '../model/inventoryStock';

import { pubSub, PUBLISH_CHANGE } from '../service/subscription';

const query = {
  inventoryStocks: {
    type: new GraphQLList(InventoryStockObjectType),
    args: {
      startDate: {
        type: GraphQLString,
      },
      endDate: {
        type: GraphQLString,
      },
    },
    authenticate: true,
    resolve: async (root, { startDate, endDate }) => {
      let params: any = {};

      if (startDate) {
        params = {
          ...params,
          createdAt: {
            ...(params.createdAt || {}),
            $gte: Moment(startDate).startOf('day').format(),
          },
        };
      }

      if (endDate) {
        params = {
          ...params,
          createdAt: {
            ...(params.createdAt || {}),
            $lte: Moment(endDate).endOf('day').format(),
          },
        };
      }

      return inventoryStockModel.fetch(params);
    },
  },
  inventoryStockById: {
    type: InventoryStockObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (root, { id }) =>
      inventoryStockModel.fetchById(id),
  },
};

const subscription = {
  default: {
    type: GraphQLString,
    args: {},
    authenticate: true,
    resolve: async (root, {}) => 'subsciption',
    subscribe: () =>
      pubSub.asyncIterator([PUBLISH_CHANGE.INVENTORY_STOCK_CHANGE]),
  },
};

const publish = (change = null, data = {}) => {
  const publishChange = change
    ? change
    : PUBLISH_CHANGE.INVENTORY_STOCK_CHANGE;

  pubSub.publish(publishChange, data);
};

const mutation = {
  inventoryStockCreate: {
    type: InventoryStockObjectType,
    args: {
      inventory: { type: new GraphQLNonNull(GraphQLString) },
      type: { type: new GraphQLNonNull(InventoryStockTypeEnumType) },
      quantity: { type: new GraphQLNonNull(GraphQLInt) },
    },
    resolve: async (obj, input, request) => {
      try {
        const { inventory, type, quantity } = input;

        const response = await inventoryStockModel.create(input);

        const inventoryDetail = await inventoryModel.fetchById(
          inventory,
        );

        let inventoryQuantity = inventoryDetail.quantity || 0;
        if (type === inventoryStockModel.INVENTORY_STOCK_TYPE.IN) {
          inventoryQuantity = inventoryQuantity + quantity;
        }

        if (type === inventoryStockModel.INVENTORY_STOCK_TYPE.OUT) {
          inventoryQuantity = inventoryQuantity - quantity;
        }

        await inventoryModel.update(inventory, {
          quantity: inventoryQuantity,
        });

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  inventoryStockDeleteById: {
    type: InventoryStockObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        const inventoryStockDetail: any =
          await inventoryStockModel.fetchById(id);

        const inventoryDetail = await inventoryModel.fetchById(
          inventoryStockDetail.inventory._id,
        );

        let inventoryQuantity = inventoryDetail.quantity || 0;
        if (
          inventoryStockDetail.type ===
          inventoryStockModel.INVENTORY_STOCK_TYPE.IN
        ) {
          inventoryQuantity =
            inventoryQuantity - inventoryStockDetail.quantity;
        }

        if (
          inventoryStockDetail.type ===
          inventoryStockModel.INVENTORY_STOCK_TYPE.OUT
        ) {
          inventoryQuantity =
            inventoryQuantity + inventoryStockDetail.quantity;
        }

        await inventoryModel.update(
          inventoryStockDetail.inventory._id,
          {
            quantity: inventoryQuantity,
          },
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
  types: [InventoryStockObjectType],
};
