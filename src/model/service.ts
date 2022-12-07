import { Schema, model, Document } from 'mongoose';
import {
  SchemaWithBaseTime,
  BaseTime,
  preSaveAddBaseTime,
} from './base';

import { UserCollectionName } from './user';

export const ServiceCollectionName = 'services';

interface Service {
  title: string;
  slug: string;
  description: string;
  status: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ServiceModel extends Service, BaseTime, Document {}

const ServiceSchema = new Schema(
  SchemaWithBaseTime({
    title: { type: String, required: true },
    slug: { type: String, required: false },
    description: { type: String, required: true },
    status: { type: String, required: true },
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

ServiceSchema.pre('save', preSaveAddBaseTime);

// Creating the ServiceModel that is used by moongoose.
export const ServiceModel = model<ServiceModel>(
  'Service',
  ServiceSchema,
  ServiceCollectionName,
);

export const fetch = async (params: any = {}) => {
  return ServiceModel.find(params);
};

export const fetchById = async (id: string) => {
  return ServiceModel.findOne({ _id: id });
};

export const create = async (service: Service) => {
  try {
    return ServiceModel.create(service);
  } catch (err) {
    throw err;
  }
};

export const update = async (id: string, service: any) => {
  const updatedAt = new Date();
  try {
    return ServiceModel.update(
      { _id: id },
      { ...service, updatedAt },
    );
  } catch (err) {
    throw err;
  }
};

export const remove = async (id: string) => {
  try {
    return ServiceModel.remove({ _id: id });
  } catch (err) {
    throw err;
  }
};
