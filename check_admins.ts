import prisma from './lib/prisma';

async function checkAdmins() {
  try {
    const admins = await prisma.admin.findMany({
        orderBy: { id: 'desc' },
        take: 5
    });
    console.log("Recent Admins:", admins);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();
