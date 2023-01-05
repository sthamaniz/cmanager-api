import { Schema, model, Document } from 'mongoose';
import {
  SchemaWithBaseTime,
  BaseTime,
  preSaveAddBaseTime,
} from './base';

import { UserCollectionName } from './user';

export const FeedbackCollectionName = 'feedbacks';

interface Feedback {
  user: string;
  value: string;
  isRead: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface FeedbackModel extends Feedback, BaseTime, Document {}

const FeedbackSchema = new Schema(
  SchemaWithBaseTime({
    user: { type: String, required: true },
    value: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false },
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

FeedbackSchema.pre('save', preSaveAddBaseTime);

// Creating the FeedbackModel that is used by moongoose.
export const FeedbackModel = model<FeedbackModel>(
  'Feedback',
  FeedbackSchema,
  FeedbackCollectionName,
);

export const fetch = async (params: any = {}) => {
  return FeedbackModel.find(params);
};

export const fetchById = async (id: string) => {
  return FeedbackModel.findOne({ _id: id });
};

export const create = async (feedback: Feedback) => {
  try {
    return FeedbackModel.create(feedback);
  } catch (err) {
    throw err;
  }
};

export const update = async (id: string, feedback: any) => {
  const updatedAt = new Date();
  try {
    return FeedbackModel.update(
      { _id: id },
      { ...feedback, updatedAt },
    );
  } catch (err) {
    throw err;
  }
};

export const remove = async (id: string) => {
  try {
    return FeedbackModel.remove({ _id: id });
  } catch (err) {
    throw err;
  }
};
