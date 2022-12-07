import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
} from 'graphql';
import {
  BookingTypeEnumType,
  BookingPriceTypeEnumType,
  BookingFrequencyEnumType,
  BookingObjectType,
  BookingStatusEnumType,
  AssignedEmployeesInputObjectType,
} from './object/booking';

import * as bookingModel from '../model/booking';
import * as rosterModel from '../model/roster';

import { pubSub, PUBLISH_CHANGE } from '../service/subscription';

import * as mailTemplate from '../mail/template';

const query = {
  bookings: {
    type: new GraphQLList(BookingObjectType),
    args: {
      status: { type: BookingStatusEnumType },
    },
    authenticate: true,
    resolve: async (root, { status }) => {
      const params: any = {};

      if (status) {
        params.status = status;
      }

      return bookingModel.fetch(params);
    },
  },
  customerBookings: {
    type: new GraphQLList(BookingObjectType),
    args: {
      status: { type: GraphQLString },
    },
    authenticate: true,
    resolve: async (root, { status }, request) => {
      const params: any = {
        customer: request.userId,
      };

      if (status) {
        params.status = status;
      }

      return bookingModel.fetch(params);
    },
  },
  bookingById: {
    type: BookingObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (root, { id }) => bookingModel.fetchById(id),
  },
};

const subscription = {
  default: {
    type: GraphQLString,
    args: {},
    authenticate: true,
    resolve: async (root, {}) => 'subsciption',
    subscribe: () =>
      pubSub.asyncIterator([PUBLISH_CHANGE.BOOKING_CHANGE]),
  },
};

const publish = (change = null, data = {}) => {
  const publishChange = change
    ? change
    : PUBLISH_CHANGE.BOOKING_CHANGE;

  pubSub.publish(publishChange, data);
};

const mutation = {
  bookingCreate: {
    type: BookingObjectType,
    args: {
      customer: { type: new GraphQLNonNull(GraphQLString) },
      service: { type: new GraphQLNonNull(GraphQLString) },
      type: { type: new GraphQLNonNull(BookingTypeEnumType) },
      priceType: {
        type: new GraphQLNonNull(BookingPriceTypeEnumType),
      },
      startDate: { type: new GraphQLNonNull(GraphQLString) },
      frequency: {
        type: new GraphQLNonNull(BookingFrequencyEnumType),
      },
      days: { type: new GraphQLNonNull(GraphQLList(GraphQLString)) },
      arrivalTime: { type: new GraphQLNonNull(GraphQLString) },
      assignedEmployees: {
        type: new GraphQLNonNull(
          GraphQLList(AssignedEmployeesInputObjectType),
        ),
      },
      status: { type: new GraphQLNonNull(GraphQLString) },
      note: { type: GraphQLString },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const response = await bookingModel.create(input);

        if (input.status && input.status === 'BOOKED') {
          //update one roster for start date of booking
          await rosterModel.create({
            booking: response._id,
            date: input.startDate,
          });
        }

        //fetch full booking detail
        const bookingDetail: any = await bookingModel.fetchById(
          response._id,
        );
        //send booking mail
        mailTemplate.bookingMail({
          email: bookingDetail.customer.email,
          name: `${bookingDetail.customer.firstName} ${bookingDetail.customer.lastName}`,
          service: bookingDetail.service.title,
          status: bookingDetail.status
            .toLowerCase()
            .replace('_', ' '),
        });

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  customerBookingCreate: {
    type: BookingObjectType,
    args: {
      service: { type: new GraphQLNonNull(GraphQLString) },
      type: { type: new GraphQLNonNull(BookingTypeEnumType) },
      startDate: { type: new GraphQLNonNull(GraphQLString) },
      frequency: {
        type: new GraphQLNonNull(BookingFrequencyEnumType),
      },
      days: { type: new GraphQLNonNull(GraphQLList(GraphQLString)) },
      arrivalTime: { type: new GraphQLNonNull(GraphQLString) },
      note: { type: GraphQLString },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const requestUser = request.userId;

        input.customer = requestUser;
        input.status = bookingModel.BOOKING_STATUS.REQUESTED;
        const response = await bookingModel.create(input);

        //fetch full booking detail
        const bookingDetail: any = await bookingModel.fetchById(
          response._id,
        );
        //send booking mail
        mailTemplate.bookingMail({
          email: bookingDetail.customer.email,
          name: `${bookingDetail.customer.firstName} ${bookingDetail.customer.lastName}`,
          service: bookingDetail.service.title,
          status:
            bookingModel.BOOKING_STATUS.REQUESTED.toLowerCase().replace(
              '_',
              ' ',
            ),
        });

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  bookingUpdateById: {
    type: BookingObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      customer: { type: GraphQLString },
      service: { type: GraphQLString },
      type: { type: BookingTypeEnumType },
      priceType: { type: BookingPriceTypeEnumType },
      startDate: { type: GraphQLString },
      frequency: {
        type: BookingFrequencyEnumType,
      },
      days: { type: GraphQLList(GraphQLString) },
      arrivalTime: { type: GraphQLString },
      assignedEmployees: {
        type: GraphQLList(AssignedEmployeesInputObjectType),
      },
      note: { type: GraphQLString },
      status: { type: GraphQLString },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        //validate status before updating
        const booking: any = await bookingModel.fetchById(id);
        if (!booking) {
          throw new GraphQLError('Booking Not Found');
        }

        //validate booking status
        if (booking.status === 'BOOKED') {
          if (!input.status || input.status !== 'BOOKED') {
            throw new GraphQLError('Cannot update booked booking.');
          }
        } else {
          if (input.status && input.status === 'BOOKED') {
            if (
              !input.assignedEmployees ||
              input.assignedEmployees.length < 1
            ) {
              throw new GraphQLError(
                'Assigned employees id required to confirm booking.',
              );
            }
          }
        }

        //updating
        delete input.id;
        const response = await bookingModel.update(id, input);

        if (input.status && input.status === 'BOOKED') {
          //update one roster for start date of booking
          await rosterModel.create({
            booking: id,
            date: input.startDate || booking.startDate,
          });
        }

        //fetch full booking detail
        const bookingDetail: any = await bookingModel.fetchById(id);
        //send booking mail
        mailTemplate.bookingMail({
          email: bookingDetail.customer.email,
          name: `${bookingDetail.customer.firstName} ${bookingDetail.customer.lastName}`,
          service: bookingDetail.service.title,
          status: bookingDetail.status
            .toLowerCase()
            .replace('_', ' '),
        });

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  bookingDeleteById: {
    type: BookingObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        //deleting
        const response = await bookingModel.remove(id);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  bookingEmployeeAssignById: {
    type: BookingObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      employee: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id, employee } = input;

        //validate employee already assigned
        const [bookingEmployee] = await bookingModel.fetch({
          _id: id,
          'assingnedEmployeed.employee': employee,
        });
        if (bookingEmployee) {
          throw new GraphQLError('Employee Already Assigned.');
        }

        //updating
        delete input.id;
        const response = await bookingModel.update(id, {
          $push: { assignedEmployees: { employee, time: 0 } },
        });

        // update hours of bookings after service hour is assigned
        // await bookingModel.update(
        //   id,
        //   {
        //     $set: { 'assignedEmployeed.$[].hour': 10 },
        //   },
        //   { multi: true },
        // );

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
};

export default {
  query,
  subscription,
  mutation,
  types: [BookingObjectType],
};
