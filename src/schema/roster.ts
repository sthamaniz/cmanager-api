import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLError,
} from 'graphql';
import * as Moment from 'moment';

import {
  RosterObjectType,
  RangeRosterObjectObjectType,
} from './object/roster';

import * as rosterModel from '../model/roster';
import * as rosterService from '../service/roster';

import { pubSub, PUBLISH_CHANGE } from '../service/subscription';

const query = {
  rosters: {
    type: new GraphQLList(RangeRosterObjectObjectType),
    args: {
      startDate: {
        type: GraphQLString,
      },
      endDate: {
        type: GraphQLString,
      },
    },
    authenticate: true,
    resolve: async (root, { startDate, endDate }) => {
      return rosterService.getRosterForDateRange(startDate, endDate);
    },
  },
  employeeRosters: {
    type: new GraphQLList(RosterObjectType),
    args: {
      startDate: {
        type: GraphQLString,
      },
      endDate: {
        type: GraphQLString,
      },
    },
    authenticate: true,
    resolve: async (root, { startDate, endDate }, request) => {
      let startDateMoment = Moment().startOf('day').format();
      let endDateMoment = Moment(
        Moment(startDateMoment).add(6, 'days').format(),
      )
        .endOf('day')
        .format();

      if (startDate) {
        startDateMoment = Moment(startDate).startOf('day').format();
      }
      if (endDate) {
        endDateMoment = Moment(endDate).startOf('day').format();
      }

      const params: any = {
        // 'booking.assignedEmployees.employee': request.userId,
        date: {
          $gte: startDateMoment,
          $lte: endDateMoment,
        },
      };

      const employeeRosters = await rosterModel.fetch(params);

      let filteredEmployeeRosters = [];
      if (employeeRosters && employeeRosters.length) {
        filteredEmployeeRosters = employeeRosters.filter(
          (er: any) =>
            er.booking &&
            er.booking.assignedEmployees
              .map((ae) => ae.employee)
              .includes(request.userId),
        );
      }

      return filteredEmployeeRosters;
    },
  },
  rosterById: {
    type: RosterObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (root, { id }) => rosterModel.fetchById(id),
  },
};

const subscription = {
  default: {
    type: GraphQLString,
    args: {},
    authenticate: true,
    resolve: async (root, {}) => 'subsciption',
    subscribe: () =>
      pubSub.asyncIterator([PUBLISH_CHANGE.INVENTORY_CHANGE]),
  },
};

const publish = (change = null, data = {}) => {
  const publishChange = change
    ? change
    : PUBLISH_CHANGE.INVENTORY_CHANGE;

  pubSub.publish(publishChange, data);
};

const mutation = {
  rosterDeleteById: {
    type: RosterObjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
    },
    authenticate: true,
    resolve: async (obj, input, request) => {
      try {
        const { id } = input;

        //updating
        const response = await rosterModel.remove(id);

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
  types: [RosterObjectType],
};
