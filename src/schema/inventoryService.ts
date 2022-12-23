import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
  GraphQLInt,
} from 'graphql';
import * as Moment from 'moment';

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
      note: { type: GraphQLString },
    },
    resolve: async (obj, input, request) => {
      try {
        const { inventory } = input;

        const inventoryDetail = await inventoryModel.fetchById(
          inventory,
        );

        if (
          !inventoryDetail ||
          !inventoryDetail.serviceInterval ||
          !inventoryDetail.serviceIntervalType ||
          !inventoryDetail.serviceDueDate
        ) {
          throw new Error('Inventory not available for service.');
        }

        //update inventory next service due date
        const updateParams = {
          serviecDueDate: Moment()
            .add(
              inventoryDetail.serviceInterval as Moment.DurationInputArg1,
              inventoryDetail.serviceIntervalType as Moment.DurationInputArg2,
            )
            .format(),
        };

        await inventoryModel.update(inventory, updateParams);

        input.dueDate = inventoryDetail.serviceDueDate;
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

        if (
          !inventoryDetail ||
          !inventoryDetail.serviceInterval ||
          !inventoryDetail.serviceIntervalType ||
          !inventoryDetail.serviceDueDate
        ) {
          throw new Error('Inventory not available for service.');
        }

        //update inventory previous service due date
        const updateParams = {
          serviecDueDate: Moment(
            inventoryServiceDetail.dueDate,
          ).format(),
        };

        await inventoryModel.update(
          inventoryServiceDetail.inventory._id,
          updateParams,
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
