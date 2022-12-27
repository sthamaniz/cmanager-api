import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
  GraphQLError,
} from 'graphql';

import { StatusEnumType } from './object/common';
import { InventoryCategoryObjectType } from './object/inventoryCategory';

import * as inventoryCategoryModel from '../model/inventoryCategory';

import { pubSub, PUBLISH_CHANGE } from '../service/subscription';

import * as util from '../util/util';

const query = {
  inventoryCategories: {
    type: new GraphQLList(InventoryCategoryObjectType),
    args: {},
    authenticate: true,
    resolve: async (root, {}) => inventoryCategoryModel.fetch(),
  },
  inventoryCategoryById: {
    type: InventoryCategoryObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (root, { id }) =>
      inventoryCategoryModel.fetchById(id),
  },
};

const subscription = {
  default: {
    type: GraphQLString,
    args: {},
    authenticate: true,
    resolve: async (root, {}) => 'subsciption',
    subscribe: () =>
      pubSub.asyncIterator([
        PUBLISH_CHANGE.INVENTORY_CATEGORY_CHANGE,
      ]),
  },
};

const publish = (change = null, data = {}) => {
  const publishChange = change
    ? change
    : PUBLISH_CHANGE.INVENTORY_CATEGORY_CHANGE;

  pubSub.publish(publishChange, data);
};

const mutation = {
  inventoryCategoryCreate: {
    type: InventoryCategoryObjectType,
    args: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      description: { type: new GraphQLNonNull(GraphQLString) },
      isServicable: { type: new GraphQLNonNull(GraphQLBoolean) },
      status: { type: new GraphQLNonNull(StatusEnumType) },
    },
    resolve: async (obj, input, request) => {
      try {
        const { title } = input;

        //validation for already registered
        const [inventoryCategoryWithTitle] =
          await inventoryCategoryModel.fetch({
            title,
          });
        if (inventoryCategoryWithTitle)
          throw new Error(
            'Inventory Category with this title already exists.',
          );

        //generating slug
        input.slug = util.generateSlug(input.title);

        const response = await inventoryCategoryModel.create(input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  inventoryCategoryUpdateById: {
    type: InventoryCategoryObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      title: { type: GraphQLString },
      description: { type: GraphQLString },
      isServicable: { type: GraphQLBoolean },
      status: { type: StatusEnumType },
    },
    resolve: async (obj, input, request) => {
      try {
        const { id, title } = input;

        //validation for already registered
        const [inventoryCategoryWithTitle] =
          await inventoryCategoryModel.fetch({
            title,
          });
        if (
          inventoryCategoryWithTitle &&
          inventoryCategoryWithTitle._id.toString() !== id
        )
          throw new Error(
            'Inventory Category with this title already exists.',
          );

        //generating slug
        input.slug = util.generateSlug(input.title);

        //updating
        delete input.id;
        const response = await inventoryCategoryModel.create(input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  inventoryCategoryDeleteById: {
    type: InventoryCategoryObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        //updating
        const response = await inventoryCategoryModel.remove(id);

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
  types: [InventoryCategoryObjectType],
};
