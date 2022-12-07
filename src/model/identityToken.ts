import { Schema, model, Document } from 'mongoose';
import {
  SchemaWithBaseTime,
  BaseTime,
  preSaveAddBaseTime,
} from './base';

import { UserCollectionName } from './user';

export const IdentityTokenCollectionName = 'identity_tokens';

export const IdentityTokenTypes = {
  PASSWORD_RESET_TOKEN: 'PASSWORD_RESET_TOKEN',
};

export const IdentityTokenLengths = {
  PASSWORD_RESET_TOKEN: 8,
};

interface IdentityToken {
  user: string;
  token: string;
  type: string;
}

export interface IdentityTokenModel
  extends IdentityToken,
    BaseTime,
    Document {}

const IdentityTokenSchema = new Schema(
  SchemaWithBaseTime({
    user: {
      type: Schema.Types.ObjectId,
      ref: UserCollectionName,
      required: true,
    },
    token: { type: String, required: true },
    type: { type: String, required: true },
  }),
);

IdentityTokenSchema.pre('save', preSaveAddBaseTime);

// Creating the UserModel that is used by moongoose.
export const IdentityTokenModel = model<IdentityTokenModel>(
  'IdentityToken',
  IdentityTokenSchema,
  IdentityTokenCollectionName,
);

export const fetchAll = async () => {
  return IdentityTokenModel.find({});
};

export const fetchByTokenAndType = async (
  token: string,
  type: string,
) => {
  return IdentityTokenModel.findOne({ token, type });
};

export const fetchByUserAndType = async (
  user: string,
  type: string,
) => {
  return IdentityTokenModel.findOne({ user, type });
};

export const fetchByUserAndTokenAndType = async (
  user: string,
  token: string,
  type: string,
) => {
  return IdentityTokenModel.findOne({ user, token, type });
};

export const create = async (identityToken: IdentityToken) => {
  try {
    return IdentityTokenModel.create(identityToken);
  } catch (err) {
    throw err;
  }
};

export const remove = async (id: string) => {
  try {
    return IdentityTokenModel.remove({ _id: id });
  } catch (err) {
    throw err;
  }
};
