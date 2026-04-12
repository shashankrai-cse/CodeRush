// ─────────────────────────────────────────────────────────
// Subject Model – Academic subject connected to campus & department
// ─────────────────────────────────────────────────────────

import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 20
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampusLocation',
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Prevent duplicate subject codes per campus
subjectSchema.index({ code: 1, campus: 1 }, { unique: true });

export const Subject = mongoose.model('Subject', subjectSchema);
