import { Router } from 'express';

import jobRoutes from './job';

const router = Router();

router.use('/_jobs', jobRoutes);

export default router;
