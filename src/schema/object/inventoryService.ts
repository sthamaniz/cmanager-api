import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

import { InventoryObjectType } from './inventory';

export const InventoryServiceObjectType = new GraphQLObjectType({
  name: 'InventoryService',
  fields: {
    _id: { type: GraphQLString },
    inventory: { type: InventoryObjectType },
    dueDate: { type: GraphQLString },
    note: { type: GraphQLInt },
    createdBy: { type: GraphQLString },
    updatedBy: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});
