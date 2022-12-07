import { Schema, model, Document } from 'mongoose';
import {
  SchemaWithBaseTime,
  BaseTime,
  preSaveAddBaseTime,
} from './base';

import { UserCollectionName } from './user';

export const TemplateCollectionName = 'templates';

export const TEMPLATE_TYPE = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
};

interface Template {
  title: string;
  type: string;
  message: string;
  default: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export interface TemplateModel extends Template, BaseTime, Document {}

const TemplateSchema = new Schema(
  SchemaWithBaseTime({
    title: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    default: { type: String, required: true },
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

TemplateSchema.pre('save', preSaveAddBaseTime);

// Creating the TemplateModel that is used by moongoose.
export const TemplateModel = model<TemplateModel>(
  'Template',
  TemplateSchema,
  TemplateCollectionName,
);

export const fetch = async (params: any = {}) => {
  return TemplateModel.find(params);
};

export const fetchById = async (id: string) => {
  return TemplateModel.findOne({ _id: id });
};

export const create = async (template: Template) => {
  try {
    return TemplateModel.create(template);
  } catch (err) {
    throw err;
  }
};

export const update = async (
  id: string,
  template: any,
  options?: any,
) => {
  const updatedAt = new Date();
  try {
    return TemplateModel.update(
      { _id: id },
      { ...template, updatedAt },
      options,
    );
  } catch (err) {
    throw err;
  }
};

export const remove = async (id: string) => {
  try {
    return TemplateModel.remove({ _id: id });
  } catch (err) {
    throw err;
  }
};
