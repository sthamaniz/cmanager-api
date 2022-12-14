import { Router } from 'express';

import jobRoutes from './job';
import mailRoutes from './mail';

const router = Router();

router.use('/_jobs', jobRoutes);

router.use('/_mail', mailRoutes);

export default router;
