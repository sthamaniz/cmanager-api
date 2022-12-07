import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
} from 'graphql';

import { BookingObjectType } from './booking';

export const RosterObjectType = new GraphQLObjectType({
  name: 'Roster',
  fields: {
    _id: { type: GraphQLString },
    booking: { type: BookingObjectType },
    date: { type: GraphQLString },
    createdBy: { type: GraphQLString },
    updatedBy: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});

export const RangeRosterObjectObjectType = new GraphQLObjectType({
  name: 'RangeRoster',
  fields: {
    date: { type: GraphQLString },
    rosters: { type: new GraphQLList(RosterObjectType) },
  },
});
