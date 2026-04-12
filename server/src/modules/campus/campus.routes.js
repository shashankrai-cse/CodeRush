import { Router } from 'express';
import { getCampusOverview } from './campus.controller.js';

const router = Router();

router.get('/overview', getCampusOverview);

export default router;
