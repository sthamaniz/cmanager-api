import { GraphQLSchema, GraphQLObjectType } from 'graphql';

import userSchema from './user';
import serviceSchema from './service';
import bookingSchema from './booking';
import inventorySchema from './inventory';
import rosterSchema from './roster';
import templateSchema from './template';
import inventoryStock from './inventoryStock';

export const queries = {
  ...userSchema.query,
  ...serviceSchema.query,
  ...bookingSchema.query,
  ...inventorySchema.query,
  ...rosterSchema.query,
  ...templateSchema.query,
  ...inventoryStock.query,
};

export const subscriptions = {
  ...userSchema.subscription,
  ...serviceSchema.subscription,
  ...bookingSchema.subscription,
  ...inventorySchema.subscription,
  ...rosterSchema.subscription,
  ...templateSchema.subscription,
  ...inventoryStock.subscription,
};

export const mutations = {
  ...userSchema.mutation,
  ...serviceSchema.mutation,
  ...bookingSchema.mutation,
  ...inventorySchema.mutation,
  ...rosterSchema.mutation,
  ...templateSchema.mutation,
  ...inventoryStock.mutation,
};

export const types = [
  ...userSchema.types,
  ...serviceSchema.types,
  ...bookingSchema.types,
  ...inventorySchema.types,
  ...rosterSchema.types,
  ...templateSchema.types,
  ...inventoryStock.types,
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
