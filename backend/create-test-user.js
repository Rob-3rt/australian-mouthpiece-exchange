const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@test.com.au' }
    });

    if (existingUser) {
      console.log('Test user already exists!');
      console.log('Email: test@test.com.au');
      console.log('Password: password123');
      return;
    }

    // Hash the password
    const password_hash = await bcrypt.hash('password123', 10);

    // Create the test user
    const user = await prisma.user.create({
      data: {
        email: 'test@test.com.au',
        password_hash: password_hash,
        name: 'Test User',
        nickname: 'TestUser',
        location_state: 'NSW',
        location_postcode: '2000',
        email_verified: true,
        status: 'active',
        join_date: new Date(),
        average_rating: 0,
        rating_count: 0
      }
    });

    console.log('Test user created successfully!');
    console.log('Email: test@test.com.au');
    console.log('Password: password123');
    console.log('User ID:', user.user_id);

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 