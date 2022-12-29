import { Router } from 'express';

import jobRoutes from './job';
import mailRoutes from './mail';
import assetRoute from './asset';

const router = Router();

router.use('/_jobs', jobRoutes);

router.use('/_mails', mailRoutes);

router.use('/assets', assetRoute);

export default router;
