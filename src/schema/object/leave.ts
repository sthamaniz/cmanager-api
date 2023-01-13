import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLEnumType,
} from 'graphql';

import { UserObjectType } from './user';
import { LEAVE_TYPE, LEAVE_STATUS } from '../../model/leave';

export const LeaveTypeEnumType = new GraphQLEnumType({
  name: 'LeaveType',
  values: {
    OTHER_LEAVE: { value: LEAVE_TYPE.OTHER_LEAVE },
    SICK_LEAVE: { value: LEAVE_TYPE.SICK_LEAVE },
  },
});

export const LeaveStatusEnumType = new GraphQLEnumType({
  name: 'LeaveStatus',
  values: {
    PENDING: { value: LEAVE_STATUS.PENDING },
    ACCEPTED: { value: LEAVE_STATUS.ACCEPTED },
    REJECTED: { value: LEAVE_STATUS.REJECTED },
  },
});

export const LeaveObjectType = new GraphQLObjectType({
  name: 'Leave',
  fields: {
    _id: { type: GraphQLString },
    user: { type: UserObjectType },
    type: { type: LeaveTypeEnumType },
    from: { type: GraphQLString },
    to: { type: GraphQLString },
    description: { type: GraphQLString },
    alternativeUser: { type: UserObjectType },
    alternativeUserMessage: { type: GraphQLString },
    status: { type: LeaveStatusEnumType },
    createdBy: { type: GraphQLString },
    updatedBy: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});
