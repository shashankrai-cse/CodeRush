// ─────────────────────────────────────────────────────────
// Subject Routes
// ─────────────────────────────────────────────────────────

import { Router } from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import { createSubject, getSubjects } from './subject.controller.js';

const router = Router();

router.post('/', protect, authorize('admin', 'teacher'), createSubject);
router.get('/', protect, getSubjects);

export default router;
