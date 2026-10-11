const prisma = require('../src/config/db');

async function seedAdmin() {
  const primaryEmail = 'haerulmuhammad01@gmail.com';
  const admin = await prisma.allowedAdmin.upsert({
    where: { email: primaryEmail },
    update: { is_primary: true },
    create: {
      email: primaryEmail,
      name: 'Muhammad Haerul',
      is_primary: true,
      added_by: 'system'
    }
  });
  console.log('✅ Primary super admin configured:', admin);
  await prisma.$disconnect();
}

seedAdmin().catch(err => {
  console.error('❌ Failed to seed admin:', err);
  process.exit(1);
});
