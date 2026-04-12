// ─────────────────────────────────────────────────────────
// Promote Controller – Teacher/Admin class promotion
// ─────────────────────────────────────────────────────────

import { User } from '../auth/auth.model.js';

export async function promoteClass(req, res, next) {
  try {
    const { department, currentYear, targetCampus } = req.body;

    const query = {
      role: 'student',
      department,
      enrollmentYear: currentYear,
    };

    if (targetCampus) {
      query.campus = targetCampus;
    } else if (req.user.role === 'teacher') {
      // Teachers can only promote within their mapped campus
      query.campus = req.user.campus;
    }

    // Increment year
    const result = await User.updateMany(query, {
      $inc: { enrollmentYear: 1 }
    });

    return res.status(200).json({
      success: true,
      message: `Successfully promoted ${result.modifiedCount} students from Year ${currentYear} to Year ${Number(currentYear) + 1}.`
    });
  } catch (error) {
    return next(error);
  }
}
