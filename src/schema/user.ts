import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
  GraphQLBoolean,
  GraphQLInt,
} from 'graphql';

import { StatusEnumType } from './object/common';
import {
  UserGenderEnumType,
  UserSourceEnumType,
  UserRoleEnumType,
  UserObjectType,
  UserLoginObjectType,
  UserIdTypeEnumType,
} from './object/user';

import * as userModel from '../model/user';

import { pubSub, PUBLISH_CHANGE } from '../service/subscription';
import * as authTokenService from '../service/authToken';
import * as passwordService from '../service/password';

import * as validation from '../util/validaton';

const query = {
  users: {
    type: new GraphQLList(UserObjectType),
    args: {
      role: { type: new GraphQLNonNull(UserRoleEnumType) },
      search: { type: GraphQLString },
    },
    authenticate: true,
    resolve: async (root, { role, search }) => {
      let params: any = {
        role: role,
      };

      if (search) {
        params.firstName = { $regex: '.*' + search + '.*' };
      }

      return userModel.fetch(params);
    },
  },
  userById: {
    type: UserObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (root, { id }) => userModel.fetchById(id),
  },
};

const subscription = {
  default: {
    type: GraphQLString,
    args: {},
    authenticate: true,
    resolve: async (root, {}) => 'subsciption',
    subscribe: () =>
      pubSub.asyncIterator([PUBLISH_CHANGE.USER_CHANGE]),
  },
};

const publish = (change = null, data = {}) => {
  const publishChange = change ? change : PUBLISH_CHANGE.USER_CHANGE;

  pubSub.publish(publishChange, data);
};

const mutation = {
  userRegister: {
    type: UserObjectType,
    args: {
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
      firstName: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
      gender: { type: new GraphQLNonNull(UserGenderEnumType) },
      mobile: { type: new GraphQLNonNull(GraphQLString) },
      address: { type: GraphQLString },
      australianBusinessNumber: { type: GraphQLInt },
      taxFileNumber: { type: GraphQLInt },
      idType: { type: UserIdTypeEnumType },
      idNumber: { type: GraphQLInt },
      role: { type: new GraphQLNonNull(UserRoleEnumType) },
      source: { type: UserSourceEnumType },
      status: { type: new GraphQLNonNull(StatusEnumType) },
    },
    resolve: async (obj, input, request) => {
      try {
        const { password, email, mobile, role } = input;

        // Validation
        if (!validation.isEmailValid(email.toLowerCase())) {
          throw new GraphQLError('Invalid Email.');
        }
        if (!validation.isMobileValid(mobile)) {
          throw new GraphQLError('Invalid Mobile.');
        }
        if (
          role !== userModel.USER_ROLES.EMPLOYEE &&
          role !== userModel.USER_ROLES.CUSTOMER
        ) {
          throw new GraphQLError('Invalid User Role.');
        }

        //validation for already registered
        const [[userWithEmail], [userWithMobile]] = await Promise.all(
          [
            userModel.fetch({ email: email.toLowerCase() }),
            userModel.fetch({ mobile }),
          ],
        );
        if (userWithEmail) {
          throw new Error('User with this email already exists.');
        }
        if (userWithMobile) {
          throw new Error('User with this mobile already exists.');
        }

        //change email to lowercase
        input.email = input.email.toLowerCase();

        //hash password
        const hashedPassword = await passwordService.hash(password);

        const response = await userModel.create({
          ...input,
          password: hashedPassword,
        });

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  userLogin: {
    type: UserLoginObjectType,
    args: {
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
      rememberMe: { type: new GraphQLNonNull(GraphQLBoolean) },
    },
    resolve: async (obj, input, request) => {
      try {
        const { email, password } = input;

        // Validation
        if (!validation.isEmailValid(email)) {
          throw new GraphQLError('Invalid Email.');
        }

        //validating email exists
        const [user] = await userModel.fetch({
          email: email.toLowerCase(),
        });
        if (!user) {
          throw new GraphQLError('Email Not Found.');
        }

        //compare password
        const passwordCompare = await passwordService.compare(
          password,
          user.password,
        );
        if (!passwordCompare) {
          throw new GraphQLError('Password does not match');
        }

        //creating accessToken
        const accessToken = authTokenService.sign(
          { userId: user._id },
          false,
        );

        const response = { user: user, accessToken };

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  userUpdate: {
    type: UserObjectType,
    args: {
      email: { type: GraphQLString },
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      gender: { type: UserGenderEnumType },
      mobile: { type: GraphQLString },
      displayPicture: { type: GraphQLString },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const requestUser = request.userId;
        const { email, mobile } = input;

        // Validation
        if (!validation.isEmailValid(email.toLowerCase())) {
          throw new GraphQLError('Invalid Email.');
        }
        if (!validation.isMobileValid(mobile)) {
          throw new GraphQLError('Invalid Mobile.');
        }

        //validation for already registered
        const [[userWithEmail], [userWithMobile]] = await Promise.all(
          [
            userModel.fetch({ email: email.toLowerCase() }),
            userModel.fetch({ mobile }),
          ],
        );
        if (
          userWithEmail &&
          userWithEmail._id.toString() !== requestUser
        )
          throw new Error('User with this email already exists.');
        if (
          userWithMobile &&
          userWithMobile._id.toString() !== requestUser
        )
          throw new Error('User with this mobile already exists.');

        //change email to lowercase
        input.email = input.email.toLowerCase();

        //updating
        const response = await userModel.update(requestUser, input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  userUpdateById: {
    type: UserObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      gender: { type: UserGenderEnumType },
      mobile: { type: GraphQLString },
      address: { type: GraphQLString },
      source: { type: UserSourceEnumType },
      hours: { type: GraphQLInt },
      australianBusinessNumber: { type: GraphQLInt },
      taxFileNumber: { type: GraphQLInt },
      idType: { type: UserIdTypeEnumType },
      idNumber: { type: GraphQLInt },
      status: { type: StatusEnumType },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id, mobile, hours } = input;

        // Validation
        if (!validation.isMobileValid(mobile)) {
          throw new GraphQLError('Invalid Mobile.');
        }

        //validate role is employee or customer only
        const userDetail = await userModel.fetchById(id);
        if (
          !userDetail ||
          (userDetail.role !== userModel.USER_ROLES.EMPLOYEE &&
            userDetail.role !== userModel.USER_ROLES.CUSTOMER)
        ) {
          throw new GraphQLError('User Not Found');
        }

        //validation for already registered
        const [userWithMobile]: any = await userModel.fetch({
          mobile,
        });
        if (userWithMobile && userWithMobile._id.toString() !== id) {
          throw new Error('User with this mobile already exists.');
        }

        //updating
        delete input.id;
        const response = await userModel.update(id, input);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
  userDeleteById: {
    type: UserObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        //validate role is employee or customer only
        const userDetail = await userModel.fetchById(id);
        if (
          !userDetail ||
          (userDetail.role !== userModel.USER_ROLES.EMPLOYEE &&
            userDetail.role !== userModel.USER_ROLES.CUSTOMER)
        ) {
          throw new GraphQLError('User Not Found');
        }

        //updating
        const response = await userModel.remove(id);

        return response;
      } catch (error) {
        throw new GraphQLError(error.message);
      }
    },
  },
};

export default {
  query,
  subscription,
  mutation,
  types: [UserObjectType],
};
