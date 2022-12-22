import { Schema, model, Document } from 'mongoose';
import {
  SchemaWithBaseTime,
  BaseTime,
  preSaveAddBaseTime,
} from './base';

import { UserCollectionName } from './user';
import { InventoryCollectionName, InventoryModel } from './inventory';

export const InventoryServiceCollectionName = 'inventory_services';

interface InventoryService {
  inventory: string;
  dueDate: Date;
  note?: number;
  createdBy?: string;
  updatedBy?: string;
}

export interface InventoryServiceModel
  extends InventoryService,
    BaseTime,
    Document {}

const InventoryServiceSchema = new Schema(
  SchemaWithBaseTime({
    inventory: {
      type: Schema.Types.ObjectId,
      ref: InventoryCollectionName,
      required: true,
    },
    dueDate: { type: Date, required: true },
    note: { type: String, required: false },
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

InventoryServiceSchema.pre('save', preSaveAddBaseTime);

// Creating the InventoryServiceModel that is used by moongoose.
export const InventoryServiceModel = model<InventoryServiceModel>(
  'InventoryService',
  InventoryServiceSchema,
  InventoryServiceCollectionName,
);

export const fetch = async (params: any = {}) => {
  return InventoryServiceModel.find(params).populate({
    path: 'inventory',
    model: InventoryModel,
  });
};

export const fetchById = async (id: string) => {
  return InventoryServiceModel.findOne({ _id: id }).populate({
    path: 'inventory',
    model: InventoryModel,
  });
};

export const create = async (inventoryService: InventoryService) => {
  try {
    return InventoryServiceModel.create(inventoryService);
  } catch (err) {
    throw err;
  }
};

export const update = async (id: string, inventoryService: any) => {
  const updatedAt = new Date();
  try {
    return InventoryServiceModel.update(
      { _id: id },
      { ...inventoryService, updatedAt },
    );
  } catch (err) {
    throw err;
  }
};

export const remove = async (id: string) => {
  try {
    return InventoryServiceModel.remove({ _id: id });
  } catch (err) {
    throw err;
  }
};
