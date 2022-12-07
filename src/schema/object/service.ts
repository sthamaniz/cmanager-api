import { GraphQLObjectType, GraphQLString } from 'graphql';

import { StatusEnumType } from './common';

export const ServiceObjectType = new GraphQLObjectType({
  name: 'Service',
  fields: {
    _id: { type: GraphQLString },
    title: { type: GraphQLString },
    slug: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: StatusEnumType },
    createdBy: { type: GraphQLString },
    updatedBy: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});
