import { Router } from 'express';
import { protect, authorizeDashboardRoleParam } from '../../middleware/auth.js';
import { getRoleDashboard, getBadgeCounts } from './dashboard.controller.js';

const router = Router();

router.get('/badges', protect, getBadgeCounts);
router.get('/:role', protect, authorizeDashboardRoleParam, getRoleDashboard);

export default router;
