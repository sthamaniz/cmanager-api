import { Schema, model, Document } from 'mongoose';
import {
  SchemaWithBaseTime,
  BaseTime,
  preSaveAddBaseTime,
} from './base';

import { UserCollectionName } from './user';
import { InventoryCollectionName, InventoryModel } from './inventory';

export const InventoryCategoryCollectionName = 'inventory_categories';

interface InventoryCategory {
  title: string;
  slug: string;
  description: string;
  isServicable: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface InventoryCategoryModel
  extends InventoryCategory,
    BaseTime,
    Document {}

const InventoryCategorySchema = new Schema(
  SchemaWithBaseTime({
    title: { type: String, required: true },
    slug: { type: String, required: false },
    description: { type: String, required: true },
    isServicable: { type: Boolean, required: true, default: false },
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

InventoryCategorySchema.pre('save', preSaveAddBaseTime);

// Creating the InventoryCategoryModel that is used by moongoose.
export const InventoryCategoryModel = model<InventoryCategoryModel>(
  'InventoryCategory',
  InventoryCategorySchema,
  InventoryCategoryCollectionName,
);

export const fetch = async (params: any = {}) => {
  return InventoryCategoryModel.find(params);
};

export const fetchById = async (id: string) => {
  return InventoryCategoryModel.findOne({ _id: id });
};

export const create = async (
  inventoryCategory: InventoryCategory,
) => {
  try {
    return InventoryCategoryModel.create(inventoryCategory);
  } catch (err) {
    throw err;
  }
};

export const update = async (id: string, inventoryCategory: any) => {
  const updatedAt = new Date();
  try {
    return InventoryCategoryModel.update(
      { _id: id },
      { ...inventoryCategory, updatedAt },
    );
  } catch (err) {
    throw err;
  }
};

export const remove = async (id: string) => {
  try {
    return InventoryCategoryModel.remove({ _id: id });
  } catch (err) {
    throw err;
  }
};
