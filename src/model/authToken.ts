import { Schema, model, Document } from 'mongoose';
import {
  SchemaWithBaseTime,
  BaseTime,
  preSaveAddBaseTime,
} from './base';

import { UserCollectionName } from './users';

export const AuthTokenCollectionName = 'auth_tokens';

// AuthToken Schema
interface AuthToken {
  user: string;
  token: string;
  device: string;
  ip: string;
  address: string;
  hasExpired: boolean;
}

export interface AuthTokenModel
  extends AuthToken,
    BaseTime,
    Document {}

const authTokenSchema = new Schema(
  SchemaWithBaseTime({
    user: {
      type: Schema.Types.ObjectId,
      ref: UserCollectionName,
      required: true,
    },
    token: { type: String, required: true, unique: true },
    device: { type: String, required: true },
    ip: { type: String, required: true },
    address: { type: String, required: true },
    hasExpired: { type: Boolean, required: true, default: false },
  }),
);

authTokenSchema.pre('save', preSaveAddBaseTime);

// Creating the UserModel that is used by moongoose.
export const AuthTokenModel = model<AuthTokenModel>(
  'AuthToken',
  authTokenSchema,
  AuthTokenCollectionName,
);

export const fetchAll = async () => {
  return AuthTokenModel.find({});
};

export const fetchByToken = async (token: string) => {
  return AuthTokenModel.findOne({ token });
};

export const create = async (authToken: AuthToken) => {
  try {
    return AuthTokenModel.create(authToken);
  } catch (err) {
    throw err;
  }
};

export const patch = async (id: string, patch: any) => {
  try {
    return AuthTokenModel.update({ _id: id }, { ...patch });
  } catch (err) {
    throw err;
  }
};
