import { Schema, model, Document } from 'mongoose';
import {
  SchemaWithBaseTime,
  BaseTime,
  preSaveAddBaseTime,
} from './base';

import { UserCollectionName } from './user';
import {
  InventoryCategoryCollectionName,
  InventoryCategoryModel,
} from './inventoryCategory';

export const InventoryCollectionName = 'inventories';

interface Inventory {
  inventoryCategory: string;
  itemNumber: string;
  title: string;
  slug: string;
  description: string;
  unit: string;
  quantity: number;
  lowStockQuantity: number;
  serviceIntervalType?: string;
  serviceInterval?: number;
  serviceDueDate?: Date;
  status: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface InventoryModel
  extends Inventory,
    BaseTime,
    Document {}

const InventorySchema = new Schema(
  SchemaWithBaseTime({
    inventoryCategory: {
      type: Schema.Types.ObjectId,
      ref: InventoryCategoryCollectionName,
      required: true,
    },
    itemNumber: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: false },
    description: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: false, default: 0 },
    lowStockQuantity: { type: Number, required: true, default: 0 },
    serviceIntervalType: { type: String, required: false },
    serviceInterval: { type: Number, required: false },
    serviceDueDate: { type: Date, required: false },
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

InventorySchema.pre('save', preSaveAddBaseTime);

// Creating the InventoryModel that is used by moongoose.
export const InventoryModel = model<InventoryModel>(
  'Inventory',
  InventorySchema,
  InventoryCollectionName,
);

export const fetch = async (params: any = {}) => {
  return InventoryModel.find(params).populate({
    path: 'inventoryCategory',
    model: InventoryCategoryModel,
  });
};

export const fetchById = async (id: string) => {
  return InventoryModel.findOne({ _id: id }).populate({
    path: 'inventoryCategory',
    model: InventoryCategoryModel,
  });
};

export const create = async (inventory: Inventory) => {
  try {
    return InventoryModel.create(inventory);
  } catch (err) {
    throw err;
  }
};

export const update = async (id: string, inventory: any) => {
  const updatedAt = new Date();
  try {
    return InventoryModel.update(
      { _id: id },
      { ...inventory, updatedAt },
    );
  } catch (err) {
    throw err;
  }
};

export const remove = async (id: string) => {
  try {
    return InventoryModel.remove({ _id: id });
  } catch (err) {
    throw err;
  }
};
