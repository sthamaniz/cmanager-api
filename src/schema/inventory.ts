import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
  GraphQLInt,
} from 'graphql';

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
      itemNumber: { type: new GraphQLNonNull(GraphQLString) },
      title: { type: new GraphQLNonNull(GraphQLString) },
      description: { type: new GraphQLNonNull(GraphQLString) },
      unit: { type: new GraphQLNonNull(GraphQLString) },
      quantity: { type: new GraphQLNonNull(GraphQLInt) },
      price: { type: new GraphQLNonNull(GraphQLInt) },
      status: { type: new GraphQLNonNull(StatusEnumType) },
    },
    resolve: async (obj, input, request) => {
      try {
        const { title } = input;

        //validation for already registered
        const [inventoryWithTitle] = await inventoryModel.fetch({
          title,
        });
        if (inventoryWithTitle)
          throw new Error(
            'Inventory with this title already exists.',
          );

        //generating slug
        input.slug = util.generateSlug(input.title);

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
      itemNumber: { type: GraphQLString },
      title: { type: GraphQLString },
      description: { type: GraphQLString },
      unit: { type: GraphQLString },
      quantity: { type: GraphQLInt },
      price: { type: GraphQLInt },
      status: { type: StatusEnumType },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id, title } = input;

        //validation for already registered
        const [inventoryWithTitle] = await inventoryModel.fetch({
          title,
        });
        if (
          inventoryWithTitle &&
          inventoryWithTitle._id.toString() !== id
        )
          throw new Error(
            'Inventory with this title already exists.',
          );

        //generating slug
        input.slug = util.generateSlug(input.title);

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
