// ─────────────────────────────────────────────────────────
// Assignment Routes
// ─────────────────────────────────────────────────────────

import { Router } from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import { createAssignment, getAssignments, gradeAssignment, generateAssignmentPdf } from './assignment.controller.js';
import { createUploader } from '../../utils/upload.js';

const router = Router();
const assignmentUploader = createUploader('assignments', 20);

// Teacher creates assignment
router.post('/', protect, authorize('teacher', 'admin'), assignmentUploader.single('file'), createAssignment);

// Fetch assignments (student fetches theirs, teacher fetches theirs)
router.get('/', protect, getAssignments);

// Teacher grades an assignment record
router.put('/records/:id', protect, authorize('teacher', 'admin'), gradeAssignment);

// Teacher generates report for an assignment
router.get('/:id/report/pdf', protect, authorize('teacher', 'admin'), generateAssignmentPdf);

export default router;
