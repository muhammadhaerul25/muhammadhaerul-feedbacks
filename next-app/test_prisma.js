const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.materiOption.findMany();
  console.log(result);
}
main().catch(console.error).finally(() => prisma.$disconnect());
