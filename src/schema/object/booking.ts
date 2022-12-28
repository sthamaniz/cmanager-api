import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLEnumType,
  GraphQLList,
  GraphQLInt,
  GraphQLInputObjectType,
} from 'graphql';

import { UserObjectType } from './user';
import { ServiceObjectType } from './service';

import {
  BOOKING_TYPE,
  BOOKING_PRICE_TYPE,
  BOOKING_FREQUENCY,
  BOOKING_STATUS,
} from '../../model/booking';

export const BookingTypeEnumType = new GraphQLEnumType({
  name: 'BookingType',
  values: {
    DOMESTIC: { value: BOOKING_TYPE.DOMESTIC },
    COMMERCIAL: { value: BOOKING_TYPE.COMMERCIAL },
  },
});

export const BookingPriceTypeEnumType = new GraphQLEnumType({
  name: 'BookingPriceType',
  values: {
    FLAT_RATE: { value: BOOKING_PRICE_TYPE.FLAT_RATE },
    PER_HOUR: { value: BOOKING_PRICE_TYPE.PER_HOUR },
  },
});

export const BookingFrequencyEnumType = new GraphQLEnumType({
  name: 'BookingFrequency',
  values: {
    ONE_OFF: { value: BOOKING_FREQUENCY.ONE_OFF },
    DAILY: { value: BOOKING_FREQUENCY.DAILY },
    WEEKLY: { value: BOOKING_FREQUENCY.WEEKLY },
    FORTNIGHTLY: { value: BOOKING_FREQUENCY.FORTNIGHTLY },
    TWICE_WEEKLY: { value: BOOKING_FREQUENCY.TWICE_WEEKLY },
    THREE_WEEKLY: { value: BOOKING_FREQUENCY.THREE_WEEKLY },
    FOUR_WEEKLY: { value: BOOKING_FREQUENCY.FOUR_WEEKLY },
    MONTHLY: { value: BOOKING_FREQUENCY.MONTHLY },
  },
});

export const BookingStatusEnumType = new GraphQLEnumType({
  name: 'BookingStatus',
  values: {
    REQUESTED: { value: BOOKING_STATUS.REQUESTED },
    WAIT_LISTED: { value: BOOKING_STATUS.WAIT_LISTED },
    BOOKED: { value: BOOKING_STATUS.BOOKED },
    JOB_DONE: { value: BOOKING_STATUS.JOB_DONE },
  },
});

export const AssignedEmployeesObjectType = new GraphQLObjectType({
  name: 'AssignedEmployees',
  fields: {
    employee: { type: UserObjectType },
    hour: { type: GraphQLInt },
  },
});

export const AssignedEmployeesInputObjectType =
  new GraphQLInputObjectType({
    name: 'AssignedEmployeesInput',
    fields: {
      employee: { type: GraphQLString },
      hour: { type: GraphQLInt },
    },
  });

export const BookingObjectType = new GraphQLObjectType({
  name: 'Booking',
  fields: {
    _id: { type: GraphQLString },
    customer: { type: UserObjectType },
    service: { type: ServiceObjectType },
    type: { type: BookingTypeEnumType },
    priceType: { type: BookingPriceTypeEnumType },
    startDate: { type: GraphQLString },
    frequency: { type: BookingFrequencyEnumType },
    days: { type: new GraphQLList(GraphQLString) },
    arrivalTime: { type: GraphQLString },
    note: { type: GraphQLString },
    assignedEmployees: {
      type: new GraphQLList(AssignedEmployeesObjectType),
    },
    status: { type: BookingStatusEnumType },
    createdBy: { type: GraphQLString },
    updatedBy: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});
