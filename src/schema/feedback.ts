import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
  GraphQLBoolean,
} from 'graphql';

import { FeedbackObjectType } from './object/feedback';

import * as feedbackModel from '../model/feedback';

import { pubSub, PUBLISH_CHANGE } from '../service/subscription';

import * as util from '../util/util';

const query = {
  feedbacks: {
    type: new GraphQLList(FeedbackObjectType),
    args: {},
    authenticate: true,
    resolve: async (root, {}) => feedbackModel.fetch(),
  },
  customerFeedbacks: {
    type: new GraphQLList(FeedbackObjectType),
    args: {},
    authenticate: true,
    resolve: async (root, {}, request) => {
      const params: any = {
        user: request.userId,
      };

      return feedbackModel.fetch(params);
    },
  },
  feedbackById: {
    type: FeedbackObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (root, { id }) => feedbackModel.fetchById(id),
  },
};

const subscription = {
  default: {
    type: GraphQLString,
    args: {},
    authenticate: true,
    resolve: async (root, {}) => 'subsciption',
    subscribe: () =>
      pubSub.asyncIterator([PUBLISH_CHANGE.FEEDBACK_CHANGE]),
  },
};

const publish = (change = null, data = {}) => {
  const publishChange = change
    ? change
    : PUBLISH_CHANGE.FEEDBACK_CHANGE;

  pubSub.publish(publishChange, data);
};

const mutation = {
  feedbackCreate: {
    type: FeedbackObjectType,
    args: {
      user: { type: new GraphQLNonNull(GraphQLString) },
      value: { type: new GraphQLNonNull(GraphQLString) },
      isRead: { type: GraphQLBoolean },
    },
    resolve: async (obj, input, request) => {
      try {
        const response = await feedbackModel.create(input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  feedbackUpdateById: {
    type: FeedbackObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      user: { type: GraphQLString },
      value: { type: GraphQLString },
      isRead: { type: GraphQLBoolean },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        //updating
        delete input.id;
        const response = await feedbackModel.update(id, input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  feedbackDeleteById: {
    type: FeedbackObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        //updating
        const response = await feedbackModel.remove(id);

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
  types: [FeedbackObjectType],
};
