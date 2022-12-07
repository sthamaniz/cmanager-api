import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
  GraphQLBoolean,
} from 'graphql';

import { StatusEnumType } from './object/common';
import { ServiceObjectType } from './object/service';

import * as serviceModel from '../model/service';

import { pubSub, PUBLISH_CHANGE } from '../service/subscription';

import * as util from '../util/util';

const query = {
  services: {
    type: new GraphQLList(ServiceObjectType),
    args: {
      search: { type: GraphQLString },
      status: { type: GraphQLString },
    },
    authenticate: true,
    resolve: async (root, { search, status }) => {
      let params: any = {};

      if (search) {
        params.title = { $regex: '.*' + search + '.*' };
      }

      if (status) {
        params.status = status;
      }

      return serviceModel.fetch(params);
    },
  },
  serviceById: {
    type: ServiceObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (root, { id }) => serviceModel.fetchById(id),
  },
};

const subscription = {
  default: {
    type: GraphQLString,
    args: {},
    authenticate: true,
    resolve: async (root, {}) => 'subsciption',
    subscribe: () =>
      pubSub.asyncIterator([PUBLISH_CHANGE.SERVICE_CHANGE]),
  },
};

const publish = (change = null, data = {}) => {
  const publishChange = change
    ? change
    : PUBLISH_CHANGE.SERVICE_CHANGE;

  pubSub.publish(publishChange, data);
};

const mutation = {
  serviceCreate: {
    type: ServiceObjectType,
    args: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      description: { type: new GraphQLNonNull(GraphQLString) },
      status: { type: new GraphQLNonNull(StatusEnumType) },
    },
    resolve: async (obj, input, request) => {
      try {
        const { title } = input;

        //validation for already registered
        const [serviceWithTitle] = await serviceModel.fetch({
          title,
        });
        if (serviceWithTitle)
          throw new Error('Service with this title already exists.');

        //generating slug
        input.slug = util.generateSlug(input.title);

        const response = await serviceModel.create(input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  serviceUpdateById: {
    type: ServiceObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      title: { type: GraphQLString },
      description: { type: GraphQLString },
      status: { type: StatusEnumType },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id, title } = input;

        //validation for already registered
        const [serviceWithTitle] = await serviceModel.fetch({
          title,
        });
        if (
          serviceWithTitle &&
          serviceWithTitle._id.toString() !== id
        )
          throw new Error('Service with this title already exists.');

        //generating slug
        input.slug = util.generateSlug(input.title);

        //updating
        delete input.id;
        const response = await serviceModel.update(id, input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  serviceDeleteById: {
    type: ServiceObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        //updating
        const response = await serviceModel.remove(id);

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
  types: [ServiceObjectType],
};
