// ─────────────────────────────────────────────────────────
// Auth Validation – express-validator rules for auth routes
// ─────────────────────────────────────────────────────────

import { body, validationResult } from 'express-validator';
import { USER_ROLES } from './auth.constants.js';

// ── Shared middleware: check validation result ──────────
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  return next();
}

// ── Register validation chain ───────────────────────────
export const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 70 })
    .withMessage('Full name must be 2–70 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .custom((value, { req }) => {
      const role = req.body.role || 'student';
      if (role === 'student' && !value.endsWith('@bbdniit.ac.in')) {
        throw new Error('Please use college email only (@bbdniit.ac.in)');
      }
      return true;
    })
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),

  body('role')
    .optional()
    .isIn(USER_ROLES)
    .withMessage(`Role must be one of: ${USER_ROLES.join(', ')}`)
    .custom((value) => {
      if (value === 'admin') {
        throw new Error('Admin registration is not allowed');
      }
      return true;
    }),

  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be at most 100 characters'),

  body('campus')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid campus ID'),

  body('enrollmentYear')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 6 })
    .withMessage('Year must be between 1 and 6'),

  body('section')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 10 })
    .withMessage('Section must be at most 10 characters'),

  handleValidationErrors
];

// ── Login validation chain ──────────────────────────────
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// ── Refresh-token validation chain ──────────────────────
export const refreshValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),

  handleValidationErrors
];
