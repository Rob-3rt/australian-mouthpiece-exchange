const { PrismaClient } = require('./generated/prisma');
require('dotenv').config();

const prisma = new PrismaClient();

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');
    
    // Option 1: Make first user admin
    const firstUser = await prisma.user.findFirst({
      orderBy: { user_id: 'asc' },
      select: {
        user_id: true,
        email: true,
        name: true,
        is_admin: true
      }
    });
    
    if (firstUser) {
      console.log(`Found first user: ${firstUser.name} (${firstUser.email})`);
      
      if (!firstUser.is_admin) {
        const updatedUser = await prisma.user.update({
          where: { user_id: firstUser.user_id },
          data: { is_admin: true },
          select: {
            user_id: true,
            email: true,
            name: true,
            is_admin: true
          }
        });
        
        console.log(`✅ Made ${updatedUser.name} (${updatedUser.email}) an admin!`);
      } else {
        console.log(`✅ ${firstUser.name} is already an admin!`);
      }
    } else {
      console.log('No users found in database.');
    }
    
    // Option 2: Make specific user admin (uncomment and modify as needed)
    /*
    const specificEmail = 'robmaher@outlook.com.au';
    const specificUser = await prisma.user.findUnique({
      where: { email: specificEmail },
      select: {
        user_id: true,
        email: true,
        name: true,
        is_admin: true
      }
    });
    
    if (specificUser && !specificUser.is_admin) {
      const updatedUser = await prisma.user.update({
        where: { user_id: specificUser.user_id },
        data: { is_admin: true },
        select: {
          user_id: true,
          email: true,
          name: true,
          is_admin: true
        }
      });
      
      console.log(`✅ Made ${updatedUser.name} (${updatedUser.email}) an admin!`);
    }
    */
    
  } catch (error) {
    console.error('Error setting up admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin(); 