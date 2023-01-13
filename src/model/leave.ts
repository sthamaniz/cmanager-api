import { Schema, model, Document } from 'mongoose';
import {
  SchemaWithBaseTime,
  BaseTime,
  preSaveAddBaseTime,
} from './base';

import { UserCollectionName, UserModel } from './user';

export const LeaveCollectionName = 'leaves';

export const LEAVE_TYPE = {
  OTHER_LEAVE: 'OTHER_LEAVE',
  SICK_LEAVE: 'SICK_LEAVE',
};

export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

interface Leave {
  user: string;
  type: string;
  from: string;
  to: string;
  reason: string;
  alternativeUser?: string;
  alternativeUserMessage?: string;
  status: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface LeaveModel extends Leave, BaseTime, Document {}

const LeaveSchema = new Schema(
  SchemaWithBaseTime({
    user: { type: String, required: true },
    type: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String, required: true },
    alternativeUser: { type: String, required: false },
    alternativeUserMessage: { type: String, required: false },
    status: {
      type: String,
      required: true,
      default: LEAVE_STATUS.PENDING,
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

LeaveSchema.pre('save', preSaveAddBaseTime);

// Creating the LeaveModel that is used by moongoose.
export const LeaveModel = model<LeaveModel>(
  'Leave',
  LeaveSchema,
  LeaveCollectionName,
);

export const fetch = async (params: any = {}) => {
  return LeaveModel.find(params).populate({
    path: 'user',
    model: UserModel,
  });
};

export const fetchById = async (id: string) => {
  return LeaveModel.findOne({ _id: id }).populate({
    path: 'user',
    model: UserModel,
  });
};

export const create = async (leave: Leave) => {
  try {
    return LeaveModel.create(leave);
  } catch (err) {
    throw err;
  }
};

export const update = async (id: string, leave: any) => {
  const updatedAt = new Date();
  try {
    return LeaveModel.update({ _id: id }, { ...leave, updatedAt });
  } catch (err) {
    throw err;
  }
};

export const remove = async (id: string) => {
  try {
    return LeaveModel.remove({ _id: id });
  } catch (err) {
    throw err;
  }
};
