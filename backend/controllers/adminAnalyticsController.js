const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

exports.getSummary = async (req, res) => {
  try {
    // Users
    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({ where: { email_verified: true } });
    const adminUsers = await prisma.user.count({ where: { is_admin: true } });

    // Listings
    const totalListings = await prisma.listing.count();
    const activeListings = await prisma.listing.count({ where: { status: 'active' } });
    const soldListings = await prisma.listing.count({ where: { status: 'sold' } });
    const loanedListings = await prisma.listing.count({ where: { status: 'loaned' } });
    const deletedListings = await prisma.listing.count({ where: { status: 'deleted' } });

    // Sales (if you use 'sold' status)
    const totalSales = soldListings;

    // Loans
    const totalLoans = await prisma.loan.count();
    const activeLoans = await prisma.loan.count({ where: { status: 'active' } });
    const returnedLoans = await prisma.loan.count({ where: { status: 'returned' } });
    const overdueLoans = await prisma.loan.count({ where: { status: 'active', expected_return_date: { lt: new Date() } } });

    // Messages
    const totalMessages = await prisma.message.count();

    // Recent activity (last 7 days)
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const newUsers = await prisma.user.count({ where: { join_date: { gte: since } } });
    const newListings = await prisma.listing.count({ where: { created_at: { gte: since } } });
    const newSales = await prisma.listing.count({ where: { status: 'sold', updated_at: { gte: since } } });
    const newLoans = await prisma.loan.count({ where: { created_at: { gte: since } } });

    res.json({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        admin: adminUsers,
        newLast7Days: newUsers
      },
      listings: {
        total: totalListings,
        active: activeListings,
        sold: soldListings,
        loaned: loanedListings,
        deleted: deletedListings,
        newLast7Days: newListings
      },
      sales: {
        total: totalSales,
        newLast7Days: newSales
      },
      loans: {
        total: totalLoans,
        active: activeLoans,
        returned: returnedLoans,
        overdue: overdueLoans,
        newLast7Days: newLoans
      },
      messages: {
        total: totalMessages
      }
    });
  } catch (error) {
    console.error('Error fetching admin summary:', error);
    res.status(500).json({ error: 'Failed to fetch admin summary.' });
  }
}; 