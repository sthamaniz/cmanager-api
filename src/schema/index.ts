import { GraphQLSchema, GraphQLObjectType } from 'graphql';

import userSchema from './user';
import serviceSchema from './service';
import bookingSchema from './booking';
import inventorySchema from './inventory';
import rosterSchema from './roster';
import templateSchema from './template';
import inventoryCategorySchema from './inventoryCategory';
import inventoryStockSchema from './inventoryStock';
import inventoryServiceSchema from './inventoryService';
import feedbackSchema from './feedback';

export const queries = {
  ...userSchema.query,
  ...serviceSchema.query,
  ...bookingSchema.query,
  ...inventorySchema.query,
  ...rosterSchema.query,
  ...templateSchema.query,
  ...inventoryCategorySchema.query,
  ...inventoryStockSchema.query,
  ...inventoryServiceSchema.query,
  ...feedbackSchema.query,
};

export const subscriptions = {
  ...userSchema.subscription,
  ...serviceSchema.subscription,
  ...bookingSchema.subscription,
  ...inventorySchema.subscription,
  ...rosterSchema.subscription,
  ...templateSchema.subscription,
  ...inventoryStockSchema.subscription,
  ...inventoryServiceSchema.subscription,
  ...feedbackSchema.subscription,
};

export const mutations = {
  ...userSchema.mutation,
  ...serviceSchema.mutation,
  ...bookingSchema.mutation,
  ...inventorySchema.mutation,
  ...rosterSchema.mutation,
  ...templateSchema.mutation,
  ...inventoryCategorySchema.mutation,
  ...inventoryStockSchema.mutation,
  ...inventoryServiceSchema.mutation,
  ...feedbackSchema.mutation,
};

export const types = [
  ...userSchema.types,
  ...serviceSchema.types,
  ...bookingSchema.types,
  ...inventorySchema.types,
  ...rosterSchema.types,
  ...templateSchema.types,
  ...inventoryStockSchema.types,
  ...inventoryCategorySchema.types,
  ...inventoryServiceSchema.types,
  ...feedbackSchema.types,
];

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: queries,
  }),
  subscription: new GraphQLObjectType({
    name: 'Subscription',
    fields: subscriptions,
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: mutations,
  }),
  types: types,
});
