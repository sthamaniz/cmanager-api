import * as nodeCron from 'node-cron';

import * as rosterService from './service/roster';

import env from './env';

export const scheduleCron = () => {
  if (env.appEnv !== 'prod' && env.appEnv !== 'dev') {
    console.log('cron jobs not scheduled for local env');
  } else {
    console.log('scheduling cron jobs');
    //run task updater in roster
    nodeCron.schedule('*/2 * * * *', async () => {
      await rosterService.updateTaskInRoster();
      console.log('updated tasks in roster');
    });
  }
};
