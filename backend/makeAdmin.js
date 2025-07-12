const { PrismaClient } = require('./generated/prisma');
require('dotenv').config();

const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    const email = 'robmaher@outlook.com.au';
    
    console.log(`Looking for user with email: ${email}`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        user_id: true,
        email: true,
        name: true,
        is_admin: true
      }
    });
    
    if (!user) {
      console.log('User not found. Please check the email address.');
      return;
    }
    
    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current admin status: ${user.is_admin ? 'Admin' : 'Not Admin'}`);
    
    if (user.is_admin) {
      console.log('User is already an admin!');
      return;
    }
    
    // Update user to admin
    const updatedUser = await prisma.user.update({
      where: { user_id: user.user_id },
      data: { is_admin: true },
      select: {
        user_id: true,
        email: true,
        name: true,
        is_admin: true
      }
    });
    
    console.log(`✅ Successfully made ${updatedUser.name} an admin!`);
    console.log(`User ID: ${updatedUser.user_id}`);
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Admin status: ${updatedUser.is_admin ? 'Admin' : 'Not Admin'}`);
    
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin(); 