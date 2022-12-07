import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLEnumType,
  GraphQLBoolean,
} from 'graphql';

import { TEMPLATE_TYPE } from '../../model/template';

export const TemplateTypeEnumType = new GraphQLEnumType({
  name: 'TemplateType',
  values: {
    EMAIL: { value: TEMPLATE_TYPE.EMAIL },
    SMS: { value: TEMPLATE_TYPE.SMS },
  },
});

export const TemplateObjectType = new GraphQLObjectType({
  name: 'Template',
  fields: {
    _id: { type: GraphQLString },
    title: { type: GraphQLString },
    type: { type: TemplateTypeEnumType },
    message: { type: GraphQLBoolean },
    default: { type: GraphQLString },
    createdBy: { type: GraphQLString },
    updatedBy: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});
