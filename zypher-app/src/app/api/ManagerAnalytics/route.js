import Payment from '@/models/Payment';
import connectDB from "@/utils/db";

// Manager analytics endpoint
// Returns data in the exact shape the dashboard expects:
// {
//   revenueByPlan: [{ planId, totalRevenue, count }],
//   statusDistribution: [{ status, count }],
//   monthlyTrend: [{ year, month, revenue, count }]
// }
export async function GET() {
  try {
    await connectDB();

    // 1) Revenue by plan (only completed payments)
    const revenueByPlan = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$planId',
          totalRevenue: { $sum: { $toDouble: '$amount' } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          planId: '$_id',
          totalRevenue: 1,
          count: 1,
        },
      },
      { $sort: { planId: 1 } },
    ]);

    // 2) Status distribution (all payments)
    const statusDistribution = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
      { $sort: { status: 1 } },
    ]);

    // 3) Monthly trend (completed payments), fallback to updatedAt if paymentDate missing
    const monthlyTrend = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $addFields: {
          paidDate: { $ifNull: ['$paymentDate', '$updatedAt'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidDate' },
            month: { $month: '$paidDate' },
          },
          revenue: { $sum: { $toDouble: '$amount' } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          revenue: 1,
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    const data = { revenueByPlan, statusDistribution, monthlyTrend };
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error('ManagerAnalytics GET error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error fetching analytics data' }),
      { status: 500 }
    );
  }
}
