const { PrismaClient } = require('./generated/prisma');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function deleteUnverifiedUsers() {
  try {
    console.log('Finding unverified users...');
    
    // First, let's see what unverified users exist
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        email_verified: false
      },
      select: {
        user_id: true,
        email: true,
        name: true,
        created_at: true
      }
    });
    
    console.log(`Found ${unverifiedUsers.length} unverified users:`);
    unverifiedUsers.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Created: ${user.created_at}`);
    });
    
    if (unverifiedUsers.length === 0) {
      console.log('No unverified users found.');
      return;
    }
    
    // Delete all unverified users
    const result = await prisma.user.deleteMany({
      where: {
        email_verified: false
      }
    });
    
    console.log(`Successfully deleted ${result.count} unverified users.`);
    
  } catch (error) {
    console.error('Error deleting unverified users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUnverifiedUsers(); 