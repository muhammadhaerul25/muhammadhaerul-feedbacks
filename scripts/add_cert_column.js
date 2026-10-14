const prisma = require('../src/config/db');

async function run() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE certifications ADD COLUMN IF NOT EXISTS image_url text;');
    console.log('Successfully verified/added image_url column to certifications table.');
  } catch (e) {
    console.error('Error adding image_url:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
