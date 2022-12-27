import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
  GraphQLInt,
} from 'graphql';
import * as Moment from 'moment';

import { StatusEnumType } from './object/common';
import { InventoryObjectType } from './object/inventory';

import * as inventoryModel from '../model/inventory';

import { pubSub, PUBLISH_CHANGE } from '../service/subscription';

import * as util from '../util/util';

const query = {
  inventories: {
    type: new GraphQLList(InventoryObjectType),
    args: {},
    authenticate: true,
    resolve: async (root, {}) => inventoryModel.fetch(),
  },
  inventoryById: {
    type: InventoryObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (root, { id }) => inventoryModel.fetchById(id),
  },
};

const subscription = {
  default: {
    type: GraphQLString,
    args: {},
    authenticate: true,
    resolve: async (root, {}) => 'subsciption',
    subscribe: () =>
      pubSub.asyncIterator([PUBLISH_CHANGE.INVENTORY_CHANGE]),
  },
};

const publish = (change = null, data = {}) => {
  const publishChange = change
    ? change
    : PUBLISH_CHANGE.INVENTORY_CHANGE;

  pubSub.publish(publishChange, data);
};

const mutation = {
  inventoryCreate: {
    type: InventoryObjectType,
    args: {
      inventoryCategory: { type: new GraphQLNonNull(GraphQLString) },
      itemNumber: { type: new GraphQLNonNull(GraphQLString) },
      title: { type: new GraphQLNonNull(GraphQLString) },
      description: { type: new GraphQLNonNull(GraphQLString) },
      unit: { type: new GraphQLNonNull(GraphQLString) },
      lowStockQuantity: { type: new GraphQLNonNull(GraphQLInt) },
      serviceIntervalType: { type: GraphQLString },
      serviceInterval: { type: GraphQLInt },
      status: { type: new GraphQLNonNull(StatusEnumType) },
    },
    resolve: async (obj, input, request) => {
      try {
        const { itemNumber, title } = input;

        //validation for already registered
        const [[inventoryWithItemNumber], [inventoryWithTitle]] =
          await Promise.all([
            inventoryModel.fetch({
              itemNumber,
            }),
            inventoryModel.fetch({
              title,
            }),
          ]);
        if (inventoryWithItemNumber) {
          throw new Error(
            'Inventory with this item number already exists.',
          );
        }
        if (inventoryWithTitle) {
          throw new Error(
            'Inventory with this title already exists.',
          );
        }

        //generating slug
        input.slug = util.generateSlug(input.title);

        //check and update servie due date if required
        if (input.serviceIntervalType && input.serviceInterval) {
          input.serviceDueDate = Moment()
            .add(input.serviceInterval, input.serviceIntervalType)
            .format();
        }

        const response = await inventoryModel.create(input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  inventoryUpdateById: {
    type: InventoryObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      inventoryCategory: { type: GraphQLString },
      itemNumber: { type: GraphQLString },
      title: { type: GraphQLString },
      description: { type: GraphQLString },
      unit: { type: GraphQLString },
      lowStockQuantity: { type: GraphQLInt },
      serviceIntervalType: { type: GraphQLString },
      serviceInterval: { type: GraphQLInt },
      status: { type: StatusEnumType },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id, itemNumber, title } = input;

        //validation for already registered
        const [[inventoryWithItemNumber], [inventoryWithTitle]] =
          await Promise.all([
            inventoryModel.fetch({
              itemNumber,
            }),
            inventoryModel.fetch({
              title,
            }),
          ]);
        if (
          inventoryWithItemNumber &&
          inventoryWithItemNumber._id.toString() !== id
        ) {
          throw new Error(
            'Inventory with this item number already exists.',
          );
        }
        if (
          inventoryWithTitle &&
          inventoryWithTitle._id.toString() !== id
        ) {
          throw new Error(
            'Inventory with this title already exists.',
          );
        }

        const inventory = await inventoryModel.fetchById(id);

        //generating slug
        input.slug = util.generateSlug(input.title);

        //check and update servie due date if required
        if (
          input.serviceIntervalType &&
          input.serviceInterval &&
          !inventory.serviceDueDate
        ) {
          input.serviceDueDate = Moment()
            .add(input.serviceInterval, input.serviceIntervalType)
            .format();
        }

        //updating
        delete input.id;
        const response = await inventoryModel.update(id, input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  inventoryDeleteById: {
    type: InventoryObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

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
  types: [InventoryObjectType],
};
