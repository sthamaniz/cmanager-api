import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
} from 'graphql';

import { INVENTORY_STOCK_TYPE } from '../../model/inventoryStock';

export const InventoryStockTypeEnumType = new GraphQLEnumType({
  name: 'InventoryStockType',
  values: {
    IN: { value: INVENTORY_STOCK_TYPE.IN },
    OUT: { value: INVENTORY_STOCK_TYPE.OUT },
  },
});

export const InventoryStockObjectType = new GraphQLObjectType({
  name: 'InventoryStock',
  fields: {
    _id: { type: GraphQLString },
    inventory: { type: GraphQLString },
    type: { type: InventoryStockTypeEnumType },
    quantity: { type: GraphQLInt },
    createdBy: { type: GraphQLString },
    updatedBy: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});
