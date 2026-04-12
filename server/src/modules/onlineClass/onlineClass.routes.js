import { Router } from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import { getLiveClasses, getClassById, createLiveClass, endClass } from './onlineClass.controller.js';

const router = Router();

// Everyone can view classes
router.get('/', protect, getLiveClasses);
router.get('/:id', protect, getClassById);

// Only teachers/admins can create/end
router.post('/', protect, authorize('teacher', 'admin'), createLiveClass);
router.put('/:id/end', protect, authorize('teacher', 'admin'), endClass);

export default router;
