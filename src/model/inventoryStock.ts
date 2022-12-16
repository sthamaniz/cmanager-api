import { Schema, model, Document } from 'mongoose';
import {
  SchemaWithBaseTime,
  BaseTime,
  preSaveAddBaseTime,
} from './base';

import { UserCollectionName } from './user';
import { InventoryCollectionName, InventoryModel } from './inventory';

export const InventoryStockCollectionName = 'inventories_stock';

export const INVENTORY_STOCK_TYPE = {
  IN: 'IN',
  OUT: 'OUT',
};

interface InventoryStock {
  inventory: string;
  type: string;
  quantity: number;
  createdBy?: string;
  updatedBy?: string;
}

export interface InventoryStockModel
  extends InventoryStock,
    BaseTime,
    Document {}

const InventoryStockSchema = new Schema(
  SchemaWithBaseTime({
    inventory: {
      type: Schema.Types.ObjectId,
      ref: InventoryCollectionName,
      required: true,
    },
    type: { type: String, required: true },
    quantity: { type: Number, required: true },
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

InventoryStockSchema.pre('save', preSaveAddBaseTime);

// Creating the InventoryStockModel that is used by moongoose.
export const InventoryStockModel = model<InventoryStockModel>(
  'InventoryStock',
  InventoryStockSchema,
  InventoryStockCollectionName,
);

export const fetch = async (params: any = {}) => {
  return InventoryStockModel.find(params).populate({
    path: 'inventory',
    model: InventoryModel,
  });
};

export const fetchById = async (id: string) => {
  return InventoryStockModel.findOne({ _id: id }).populate({
    path: 'inventory',
    model: InventoryModel,
  });
};

export const create = async (inventoryStock: InventoryStock) => {
  try {
    return InventoryStockModel.create(inventoryStock);
  } catch (err) {
    throw err;
  }
};

export const update = async (id: string, inventoryStock: any) => {
  const updatedAt = new Date();
  try {
    return InventoryStockModel.update(
      { _id: id },
      { ...inventoryStock, updatedAt },
    );
  } catch (err) {
    throw err;
  }
};

export const remove = async (id: string) => {
  try {
    return InventoryStockModel.remove({ _id: id });
  } catch (err) {
    throw err;
  }
};
