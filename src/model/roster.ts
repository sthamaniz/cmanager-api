import { Schema, model, Document } from 'mongoose';
import {
  SchemaWithBaseTime,
  BaseTime,
  preSaveAddBaseTime,
} from './base';

import { UserCollectionName, UserModel } from './user';
import { BookingCollectionName, BookingModel } from './booking';
import { ServiceModel } from './service';

export const RosterCollectionName = 'rosters';

interface Roster {
  booking: string;
  date: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface RosterModel extends Roster, BaseTime, Document {}

const RosterSchema = new Schema(
  SchemaWithBaseTime({
    booking: {
      type: Schema.Types.ObjectId,
      ref: BookingCollectionName,
      required: true,
    },
    date: { type: String, required: true },
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

RosterSchema.pre('save', preSaveAddBaseTime);

// Creating the RosterModel that is used by moongoose.
export const RosterModel = model<RosterModel>(
  'Roster',
  RosterSchema,
  RosterCollectionName,
);

export const fetch = async (params: any = {}, options: any = {}) => {
  return RosterModel.find(params, options).populate([
    {
      path: 'booking',
      model: BookingModel,
      populate: [
        {
          path: 'customer',
          model: UserModel,
        },
        {
          path: 'service',
          model: ServiceModel,
        },
      ],
    },
  ]);
};

export const fetchOne = async (
  params: any = {},
  options: any = {},
  sortOptions: any = {},
) => {
  return RosterModel.findOne(params, options)
    .sort(sortOptions)
    .populate([
      {
        path: 'booking',
        model: BookingModel,
        populate: [
          {
            path: 'customer',
            model: UserModel,
          },
          {
            path: 'service',
            model: ServiceModel,
          },
        ],
      },
      {
        path: 'logs.employee',
        model: UserModel,
      },
    ]);
};

export const fetchById = async (id: string) => {
  return RosterModel.findOne({ _id: id }).populate([
    {
      path: 'booking',
      model: BookingModel,
      populate: [
        {
          path: 'customer',
          model: UserModel,
        },
        {
          path: 'service',
          model: ServiceModel,
        },
      ],
    },
  ]);
};

export const create = async (roster: Roster) => {
  try {
    return RosterModel.create(roster);
  } catch (err) {
    throw err;
  }
};

export const update = async (
  id: string,
  roster: any,
  options?: any,
) => {
  const updatedAt = new Date();
  try {
    return RosterModel.update(
      { _id: id },
      { ...roster, updatedAt },
      options,
    );
  } catch (err) {
    throw err;
  }
};

export const remove = async (id: string) => {
  try {
    return RosterModel.remove({ _id: id });
  } catch (err) {
    throw err;
  }
};
