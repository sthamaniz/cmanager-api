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
    price: { type: GraphQLInt },
    status: { type: StatusEnumType },
    createdBy: { type: GraphQLString },
    updatedBy: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});
