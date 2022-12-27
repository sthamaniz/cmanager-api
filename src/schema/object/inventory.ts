import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

import { StatusEnumType } from './common';

export const InventoryObjectType = new GraphQLObjectType({
  name: 'Inventory',
  fields: {
    _id: { type: GraphQLString },
    itemNumber: { type: GraphQLString },
    title: { type: GraphQLString },
    slug: { type: GraphQLString },
    description: { type: GraphQLString },
    unit: { type: GraphQLString },
    quantity: { type: GraphQLInt },
    lowStockQuantity: { type: GraphQLInt },
    serviceIntervalType: { type: GraphQLString },
    serviceInterval: { type: GraphQLInt },
    serviceDueDate: { type: GraphQLString },
    status: { type: StatusEnumType },
    createdBy: { type: GraphQLString },
    updatedBy: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});
