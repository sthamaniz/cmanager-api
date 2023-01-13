import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
  GraphQLBoolean,
} from 'graphql';

import { StatusEnumType } from './object/common';
import {
  LeaveObjectType,
  LeaveTypeEnumType,
  LeaveStatusEnumType,
} from './object/leave';

import * as leaveModel from '../model/leave';

import { pubSub, PUBLISH_CHANGE } from '../service/subscription';

import * as util from '../util/util';

const query = {
  leaves: {
    type: new GraphQLList(LeaveObjectType),
    args: {
      status: { type: GraphQLString },
    },
    authenticate: true,
    resolve: async (root, { search, status }) => {
      let params: any = {};

      if (status) {
        params.status = status;
      }

      return leaveModel.fetch(params);
    },
  },
  employeeLeaves: {
    type: new GraphQLList(LeaveObjectType),
    args: {
      status: { type: GraphQLString },
    },
    authenticate: true,
    resolve: async (root, { search, status }, request) => {
      let params: any = {
        user: request.userId,
      };

      if (status) {
        params.status = status;
      }

      return leaveModel.fetch(params);
    },
  },
  leaveById: {
    type: LeaveObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (root, { id }) => leaveModel.fetchById(id),
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
  leaveCreate: {
    type: LeaveObjectType,
    args: {
      user: { type: new GraphQLNonNull(GraphQLString) },
      type: { type: new GraphQLNonNull(LeaveTypeEnumType) },
      from: { type: new GraphQLNonNull(GraphQLString) },
      to: { type: new GraphQLNonNull(GraphQLString) },
      reason: { type: new GraphQLNonNull(GraphQLString) },
      alternativeUser: { type: GraphQLString },
      alternativeUserMessage: { type: GraphQLString },
      status: { type: LeaveStatusEnumType },
    },
    resolve: async (obj, input, request) => {
      try {
        const response = await leaveModel.create(input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  employeeLeaveCreate: {
    type: LeaveObjectType,
    args: {
      type: { type: new GraphQLNonNull(LeaveTypeEnumType) },
      from: { type: new GraphQLNonNull(GraphQLString) },
      to: { type: new GraphQLNonNull(GraphQLString) },
      reason: { type: new GraphQLNonNull(GraphQLString) },
      alternativeUser: { type: GraphQLString },
      alternativeUserMessage: { type: GraphQLString },
      status: { type: LeaveStatusEnumType },
    },
    resolve: async (obj, input, request) => {
      try {
        const requestUser = request.userId;

        input.user = requestUser;

        const response = await leaveModel.create(input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  leaveUpdateById: {
    type: LeaveObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      user: { type: GraphQLString },
      type: { type: LeaveTypeEnumType },
      from: { type: GraphQLString },
      to: { type: GraphQLString },
      reason: { type: GraphQLString },
      alternativeUser: { type: GraphQLString },
      alternativeUserMessage: { type: GraphQLString },
      status: { type: LeaveStatusEnumType },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        //updating
        delete input.id;
        const response = await leaveModel.update(id, input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  leaveDeleteById: {
    type: LeaveObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        //updating
        const response = await leaveModel.remove(id);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  leaveStatusUpdateById: {
    type: LeaveObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      status: { type: new GraphQLNonNull(LeaveStatusEnumType) },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        const leave = await leaveModel.fetchById(id);
        if (leave.status !== leaveModel.LEAVE_STATUS.PENDING) {
          throw new GraphQLError(
            'Cannot update status, already updated',
          );
        }

        //updating
        delete input.id;
        const response = await leaveModel.update(id, input);

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
  types: [LeaveObjectType],
};
