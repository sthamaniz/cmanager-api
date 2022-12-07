import { Schema, model, Document } from 'mongoose';
import {
  SchemaWithBaseTime,
  BaseTime,
  preSaveAddBaseTime,
} from './base';

import { UserCollectionName, UserModel } from './user';
import { ServiceCollectionName, ServiceModel } from './service';

export const BookingCollectionName = 'bookings';

export const BOOKING_TYPE = {
  DOMESTIC: 'DOMESTIC',
  COMMERCIAL: 'COMMERCIAL',
};

export const BOOKING_PRICE_TYPE = {
  FLAT_RATE: 'FLAT_RATE',
  PER_HOUR: 'PER_HOUR',
};

export const BOOKING_FREQUENCY = {
  DAILY: 'DAILY', // once everyday
  WEEKLY: 'WEEKLY', // once in 7 days
  FORTNIGHTLY: 'FORTNIGHTLY', // once in 14 days
  TWICE_WEEKLY: 'TWICE_WEEKLY', // once in 14 days
  THREE_WEEKLY: 'THREE_WEEKLY', // once in 21 days
  FOUR_WEEKLY: 'FOUR_WEEKLY', // once in 28 days
  MONTHLY: 'MONTHLY', // once in 28 days
};

export const BOOKING_STATUS = {
  REQUESTED: 'REQUESTED',
  WAIT_LISTED: 'WAIT_LISTED',
  BOOKED: 'BOOKED',
  JOB_DONE: 'JOB_DONE',
};

interface AssignedEmployees {
  employee: string;
  hour: number;
}

interface Booking {
  customer: string;
  service: string;
  type: string;
  priceType: string;
  startDate: string;
  frequency: string;
  days: [string];
  arrivalTime: string;
  note: string;
  status: string;
  assignedEmployees: [AssignedEmployees];
  createdBy?: string;
  updatedBy?: string;
}

export interface BookingModel extends Booking, BaseTime, Document {}

const BookingSchema = new Schema(
  SchemaWithBaseTime({
    customer: {
      type: Schema.Types.ObjectId,
      ref: UserCollectionName,
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: ServiceCollectionName,
      required: true,
    },
    type: { type: String, required: true },
    priceType: { type: String, required: false },
    startDate: { type: String, required: true },
    frequency: { type: String, required: true },
    days: [{ type: String, required: true }],
    arrivalTime: { type: String, required: true },
    note: { type: String, required: false },
    assignedEmployees: [
      {
        employee: {
          type: Schema.Types.ObjectId,
          ref: UserCollectionName,
          required: false,
        },
        hour: { type: Number, required: false },
      },
    ],
    status: {
      type: String,
      required: true,
      default: BOOKING_STATUS.REQUESTED,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: UserCollectionName,
      required: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: UserCollectionName,
      required: false,
    },
  }),
);

BookingSchema.pre('save', preSaveAddBaseTime);

// Creating the BookingModel that is used by moongoose.
export const BookingModel = model<BookingModel>(
  'Booking',
  BookingSchema,
  BookingCollectionName,
);

export const fetch = async (params: any = {}) => {
  return BookingModel.find(params)
    .populate({ path: 'customer', model: UserModel })
    .populate({ path: 'service', model: ServiceModel });
};

export const fetchById = async (id: string) => {
  return BookingModel.findOne({ _id: id })
    .populate({ path: 'customer', model: UserModel })
    .populate({ path: 'service', model: ServiceModel });
};

export const create = async (booking: Booking) => {
  try {
    return BookingModel.create(booking);
  } catch (err) {
    throw err;
  }
};

export const update = async (
  id: string,
  booking: any,
  options?: any,
) => {
  const updatedAt = new Date();
  try {
    return BookingModel.update(
      { _id: id },
      { ...booking, updatedAt },
      options,
    );
  } catch (err) {
    throw err;
  }
};

export const remove = async (id: string) => {
  try {
    return BookingModel.remove({ _id: id });
  } catch (err) {
    throw err;
  }
};
