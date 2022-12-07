import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
  GraphQLBoolean,
} from 'graphql';

import { StatusEnumType } from './object/common';
import {
  TemplateObjectType,
  TemplateTypeEnumType,
} from './object/template';

import * as templateModel from '../model/template';

import { pubSub, PUBLISH_CHANGE } from '../service/subscription';

const query = {
  templates: {
    type: new GraphQLList(TemplateObjectType),
    args: {},
    authenticate: true,
    resolve: async (root, {}) => templateModel.fetch(),
  },
  templateById: {
    type: TemplateObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (root, { id }) => templateModel.fetchById(id),
  },
};

const subscription = {
  default: {
    type: GraphQLString,
    args: {},
    authenticate: true,
    resolve: async (root, {}) => 'subsciption',
    subscribe: () =>
      pubSub.asyncIterator([PUBLISH_CHANGE.TEMPLATE_CHANGE]),
  },
};

const publish = (change = null, data = {}) => {
  const publishChange = change
    ? change
    : PUBLISH_CHANGE.TEMPLATE_CHANGE;

  pubSub.publish(publishChange, data);
};

const mutation = {
  templateCreate: {
    type: TemplateObjectType,
    args: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      type: { type: new GraphQLNonNull(TemplateTypeEnumType) },
      message: { type: new GraphQLNonNull(GraphQLString) },
      default: { type: new GraphQLNonNull(GraphQLBoolean) },
    },
    resolve: async (obj, input, request) => {
      try {
        const { title } = input;

        //validation for already registered
        const [templateWithTitle] = await templateModel.fetch({
          title,
        });
        if (templateWithTitle) {
          throw new Error('Template with this title already exists.');
        }

        const response = await templateModel.create(input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  templateUpdateById: {
    type: TemplateObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      title: { type: GraphQLString },
      type: { type: TemplateTypeEnumType },
      message: { type: GraphQLString },
      default: { type: GraphQLBoolean },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id, title } = input;

        //validation for already registered
        const [templateWithTitle] = await templateModel.fetch({
          title,
        });
        if (
          templateWithTitle &&
          templateWithTitle._id.toString() !== id
        ) {
          throw new Error('Template with this title already exists.');
        }

        //updating
        delete input.id;
        const response = await templateModel.update(id, input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  templateDeleteById: {
    type: TemplateObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        //updating
        const response = await templateModel.remove(id);

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
  types: [TemplateObjectType],
};
