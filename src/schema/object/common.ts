import { GraphQLEnumType } from 'graphql';

export const StatusEnumType = new GraphQLEnumType({
  name: 'Status',
  values: {
    ACTIVE: { value: 'ACTIVE' },
    INACTIVE: { value: 'INACTIVE' },
  },
});
