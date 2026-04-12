import mongoose from 'mongoose';

const campusSnapshotSchema = new mongoose.Schema(
  {
    totalStudents: { type: Number, required: true },
    activeBuses: { type: Number, required: true },
    energySavingsPercent: { type: Number, required: true },
    attendanceRate: { type: Number, required: true }
  },
  { timestamps: true }
);

export const CampusSnapshot = mongoose.model('CampusSnapshot', campusSnapshotSchema);
