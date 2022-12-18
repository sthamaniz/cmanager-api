import {
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
} from 'graphql';

import { StatusEnumType } from './common';

import {
  USER_GENDERS,
  USER_SOURCES,
  USER_ROLES,
  USER_ID_TYPES,
} from '../../model/user';

export const UserGenderEnumType = new GraphQLEnumType({
  name: 'UserGender',
  values: {
    MALE: { value: USER_GENDERS.MALE },
    FEMALE: { value: USER_GENDERS.FEMALE },
    OTHER: { value: USER_GENDERS.OTHER },
  },
});

export const UserSourceEnumType = new GraphQLEnumType({
  name: 'UserSource',
  values: {
    FACEBOOK_PAGE: { value: USER_SOURCES.FACEBOOK_PAGE },
    FACEBOOK_PROFILE: { value: USER_SOURCES.FACEBOOK_PROFILE },
    WEBSITE: { value: USER_SOURCES.WEBSITE },
    PHONE: { value: USER_SOURCES.PHONE },
  },
});

export const UserRoleEnumType = new GraphQLEnumType({
  name: 'UserRole',
  values: {
    SUPERADMIN: { value: USER_ROLES.SUPERADMIN },
    ADMIN: { value: USER_ROLES.ADMIN },
    EMPLOYEE: { value: USER_ROLES.EMPLOYEE },
    CUSTOMER: { value: USER_ROLES.CUSTOMER },
  },
});

export const UserIdTypeEnumType = new GraphQLEnumType({
  name: 'UserIdType',
  values: {
    DRIVING_LICENSE: { value: USER_ID_TYPES.DRIVING_LICENSE },
  },
});

export const UserObjectType = new GraphQLObjectType({
  name: 'User',
  fields: {
    _id: { type: GraphQLString },
    email: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    gender: { type: UserGenderEnumType },
    mobile: { type: GraphQLString },
    address: { type: GraphQLString },
    displayPicture: { type: GraphQLString },
    role: { type: UserRoleEnumType },
    source: { type: UserSourceEnumType },
    hours: { type: GraphQLInt },
    australianBusinessNumber: { type: GraphQLInt },
    taxFileNumber: { type: GraphQLInt },
    idType: { type: UserIdTypeEnumType },
    idNumber: { type: GraphQLInt },
    status: { type: StatusEnumType },
    createdBy: { type: GraphQLString },
    updatedBy: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});

export const UserWithPaginationObjectType = new GraphQLObjectType({
  name: 'UserWithPagination',
  fields: {
    page: { type: GraphQLString },
    limit: { type: GraphQLString },
    total: { type: GraphQLString },
    data: { type: new GraphQLList(UserObjectType) },
  },
});

export const UserLoginObjectType = new GraphQLObjectType({
  name: 'UserLogin',
  fields: {
    user: { type: UserObjectType },
    accessToken: { type: GraphQLString },
  },
});
