import { Schema, model, Document } from 'mongoose';
import {
  SchemaWithBaseTime,
  BaseTime,
  preSaveAddBaseTime,
} from './base';

export const UserCollectionName = 'users';

export const USER_GENDERS = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
};

export const USER_SOURCES = {
  FACEBOOK_PAGE: 'FACEBOOK_PAGE',
  FACEBOOK_PROFILE: 'FACEBOOK_PROFILE',
  WEBSITE: 'WEBSITE',
  PHONE: 'PHONE',
};

export const USER_ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  CUSTOMER: 'CUSTOMER',
};

export const USER_ID_TYPES = {
  DRIVING_LICENSE: 'DRIVING_LICENSE',
  PASSPORT: 'PASSPORT',
  PHOTO_ID: 'PHOTO_ID',
};

interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  mobile: string;
  address?: string;
  displayPicture?: string;
  role: string;
  source?: string;
  hours?: number;
  australianBusinessNumber?: number;
  taxFileNumber?: number;
  idType?: string;
  idNumber?: number;
  idImage?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  status: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface UserModel extends User, BaseTime, Document {}

const UserSchema = new Schema(
  SchemaWithBaseTime({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: false },
    mobile: { type: String, required: true, unique: true },
    address: { type: String, required: false },
    displayPicture: { type: String, required: false },
    role: {
      type: String,
      required: true,
      default: USER_ROLES.CUSTOMER,
    },
    source: { type: String, required: false },
    hours: { type: Number, required: false },
    australianBusinessNumber: { type: Number, required: false },
    taxFileNumber: { type: Number, required: false },
    idType: { type: String, required: false },
    idNumber: { type: Number, required: false },
    idImage: { type: String, required: false },
    emergencyContactName: { type: String, required: false },
    emergencyContactNumber: { type: String, required: false },
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

UserSchema.pre('save', preSaveAddBaseTime);

// Creating the UserModel that is used by moongoose.
export const UserModel = model<UserModel>(
  'User',
  UserSchema,
  UserCollectionName,
);

export const fetch = async (
  params: any = {},
  paginationParams: any = {},
) => {
  const { page, limit } = paginationParams;

  const totalQuery = UserModel.count(params);
  const dataQuery = UserModel.find(params);

  if (page && limit) {
    const skip = (parseInt(page) - 1) * limit;
    dataQuery.skip(skip).limit(limit);
  }

  return {
    page: page,
    limit: limit,
    total: await totalQuery,
    data: await dataQuery,
  };
};

export const fetchById = async (id: string) => {
  return UserModel.findOne({ _id: id });
};

export const create = async (user: User) => {
  try {
    return UserModel.create(user);
  } catch (err) {
    throw err;
  }
};

export const update = async (id: string, user: any) => {
  const updatedAt = new Date();
  try {
    return UserModel.update({ _id: id }, { ...user, updatedAt });
  } catch (err) {
    throw err;
  }
};

export const remove = async (id: string) => {
  try {
    return UserModel.remove({ _id: id });
  } catch (err) {
    throw err;
  }
};
