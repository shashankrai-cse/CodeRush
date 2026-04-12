export async function getCampusOverview(req, res) {
  res.json({
    success: true,
    data: {
      totalStudents: 18750,
      activeBuses: 42,
      energySavingsPercent: 21,
      attendanceRate: 98.2
    }
  });
}
