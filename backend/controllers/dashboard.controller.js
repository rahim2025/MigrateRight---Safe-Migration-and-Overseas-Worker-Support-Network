const User = require('../models/User');
const RecruitmentAgency = require('../models/RecruitmentAgency');
const Complaint = require('../models/Complaint');
const CountryGuide = require('../models/CountryGuide.model');

/**
 * Get Dashboard Statistics
 * Returns counts for Users, Agencies, Complaints, and recent activity
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. User Stats
        const totalUsers = await User.countDocuments();

        // 2. Agency Stats
        const totalAgencies = await RecruitmentAgency.countDocuments();
        const activeAgencies = await RecruitmentAgency.countDocuments({ accountStatus: 'active' });
        const pendingAgencies = await RecruitmentAgency.countDocuments({ 'adminApproval.status': 'pending' });
        const suspendedAgencies = await RecruitmentAgency.countDocuments({ accountStatus: 'suspended' });

        // 3. Complaint Stats
        const totalComplaints = await Complaint.countDocuments();
        const urgentComplaints = await Complaint.countDocuments({ severity: { $in: ['high', 'critical'] }, status: { $ne: 'resolved' } });
        const openComplaints = await Complaint.countDocuments({ status: { $in: ['pending', 'under_review', 'investigating'] } });

        // 4. Recent Activity (Aggregated from different collections)
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('fullName email createdAt role');

        const recentAgencies = await RecruitmentAgency.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('agencyName createdAt adminApproval.status');

        const recentComplaints = await Complaint.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('workerId', 'fullName')
            .select('complaintType status createdAt workerId');

        // Combine and sort activity
        let activityFeed = [
            ...recentUsers.map(u => ({
                type: 'user',
                text: `New user registered: ${u.fullName?.firstName || 'User'}`,
                time: u.createdAt,
                icon: '👤'
            })),
            ...recentAgencies.map(a => ({
                type: 'agency',
                text: `New agency application: ${a.agencyName}`,
                time: a.createdAt,
                icon: '🏢'
            })),
            ...recentComplaints.map(c => ({
                type: 'complaint',
                text: `New complaint filed: ${c.complaintType}`,
                time: c.createdAt,
                icon: '⚠️'
            }))
        ];

        // Sort by time descending and take top 10
        activityFeed.sort((a, b) => new Date(b.time) - new Date(a.time));
        activityFeed = activityFeed.slice(0, 10);

        // 5. Chart Data: User Growth (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const userGrowthRaw = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Format for Recharts (Map back to month names)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const userGrowth = userGrowthRaw.map(item => ({
            name: months[item._id - 1],
            users: item.count // Note: This is monthly new users, for cumulative we'd need more logic, but this works for trends
        }));

        // 6. Chart Data: Agency Distribution (by Division/City)
        const agencyDistRaw = await RecruitmentAgency.aggregate([
            { $group: { _id: "$addresses.headOffice.district", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const agencyDist = agencyDistRaw.map(item => ({
            name: item._id || 'Unknown',
            count: item.count
        }));

        // 7. Chart Data: Complaint Categories
        const complaintCatsRaw = await Complaint.aggregate([
            { $group: { _id: "$complaintType", value: { $sum: 1 } } }
        ]);

        const complaintColors = ['#e53e3e', '#dd6b20', '#d69e2e', '#3182ce', '#805ad5', '#718096'];
        const complaintData = complaintCatsRaw.map((item, index) => ({
            name: item._id || 'Other',
            value: item.value,
            color: complaintColors[index % complaintColors.length]
        }));

        res.status(200).json({
            success: true,
            data: {
                counts: {
                    users: totalUsers,
                    agencies: totalAgencies,
                    complaints: totalComplaints,
                    agenciesActive: activeAgencies,
                    agenciesPending: pendingAgencies,
                    agenciesSuspended: suspendedAgencies,
                    complaintsUrgent: urgentComplaints,
                    complaintsOpen: openComplaints
                },
                activity: activityFeed,
                charts: {
                    userGrowth,
                    agencyDist,
                    complaintData
                }
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error fetching dashboard stats',
            error: error.message
        });
    }
};
