import { Router, Request, Response } from 'express';

import * as rosterService from '../service/roster';

import env from '../env';

const router = Router();

router.post(
  '/update-weekly-roster-tasks',
  async (req: Request, res: Response) => {
    try {
      const { jobKey } = req.body;

      if (!jobKey || jobKey === '') {
        throw new Error('Job key not found.');
      }

      if (jobKey !== env.jobKey) {
        throw new Error('Invalid job key.');
      }

      await rosterService.updateTaskInRoster();

      res.json({
        success: true,
        message: 'Job run successfull | Updated weekly roster tasks',
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || err,
      });
    }
  },
);

export default router;
