import { Router, Request, Response } from 'express';

import * as mailTemplate from '../mail/template';

const router = Router();

router.get(
  '/test-booking-mail',
  async (req: Request, res: Response) => {
    try {
      mailTemplate.bookingMail({
        email: 'manpradhan008@gmail.com',
        name: 'Manish Pradhan',
        service: 'Cleaning',
        status: 'BOOKED',
      });

      res.json({
        success: true,
        message: 'Mail send successfull',
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
