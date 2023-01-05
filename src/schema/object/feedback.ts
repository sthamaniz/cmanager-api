import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';

import { UserObjectType } from './user';

export const FeedbackObjectType = new GraphQLObjectType({
  name: 'Feedback',
  fields: {
    _id: { type: GraphQLString },
    user: { type: UserObjectType },
    value: { type: GraphQLString },
    status: { type: GraphQLBoolean },
    createdBy: { type: GraphQLString },
    updatedBy: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});
