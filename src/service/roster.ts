import * as Moment from 'moment';

import * as bookingModel from '../model/booking';
import * as rosterModel from '../model/roster';

export const getRosterForDateRange = async (
  startDate: string,
  endDate: string,
) => {
  try {
    const dateRangeRosters = [];

    if (startDate && endDate) {
      for (
        let date = startDate;
        Moment(date).format('YYYY/MM/DD') <=
        Moment(endDate).format('YYYY/MM/DD');
        date = Moment(date).add(1, 'days').format()
      ) {
        const params: any = {
          date: {
            $gte: Moment(date).startOf('day').format(),
            $lte: Moment(date).endOf('day').format(),
          },
        };

        dateRangeRosters.push({
          date: Moment(date).format(),
          rosters: await rosterModel.fetch(params),
        });
      }
    }

    return dateRangeRosters;
  } catch (err) {
    throw err;
  }
};

const getUpcomingTasks = async (rosters: any) => {
  const incrementDays = {
    DAILY: 1, // once everyday
    WEEKLY: 7, // once in 7 days
    FORTNIGHTLY: 14, // once in 14 days
    TWICE_WEEKLY: 14, // once in 14 days
    THREE_WEEKLY: 21, // once in 21 days
    FOUR_WEEKLY: 28, // once in 28 days
    MONTHLY: 28, // once in 28 days
  };

  const endDate = Moment().add(28, 'days').format();

  const upcomingTasks: any = [];

  rosters.forEach((r: any) => {
    for (
      let date = Moment(r.date)
        .add(incrementDays[r.booking.frequency], 'days')
        .format();
      Moment(date).format('YYYY/MM/DD') <=
      Moment(endDate).format('YYYY/MM/DD');
      date = Moment(date)
        .add(incrementDays[r.booking.frequency], 'days')
        .format()
    ) {
      upcomingTasks.push({
        booking: r.booking._id,
        date: date,
      });
    }
  });

  return upcomingTasks;
};

export const updateTaskInRoster = async () => {
  try {
    const bookedBookings = await bookingModel.fetch({
      status: bookingModel.BOOKING_STATUS.BOOKED,
      frequency: { $ne: bookingModel.BOOKING_FREQUENCY.ONE_OFF },
    });

    //add filter for unique bookings in roster
    const activeRoster = await Promise.all(
      bookedBookings.map(async (bb: any) => {
        const latestRoster = await rosterModel.fetchOne(
          { booking: bb._id },
          {},
          { date: -1 },
        );

        return latestRoster;
      }),
    );

    const upcomingRoosterTasks = await getUpcomingTasks(
      activeRoster.filter((ar: any) => ar),
    );

    await Promise.all(
      upcomingRoosterTasks.map(async (rt: any) => {
        const [rosterDetail] = await rosterModel.fetch({
          booking: rt.booking,
          date: {
            $gte: Moment(rt.date).startOf('day').format(),
            $lte: Moment(rt.date).endOf('day').format(),
          },
        });

        if (rosterDetail) {
          return rosterDetail;
        }

        return rosterModel.create({
          booking: rt.booking,
          date: rt.date,
        });
      }),
    );

    return;
  } catch (err) {
    console.log('error --> ', err);
    throw err;
  }
};
