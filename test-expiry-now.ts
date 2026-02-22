
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testExpired() {
    const doctorId = 1; // ID from previous script
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5); // 5 days ago

    await prisma.doctorSubscription.updateMany({
        where: { doctorId, status: 'ACTIVE' },
        data: { endDate: pastDate }
    });

    console.log(`Successfully updated Doctor ${doctorId} subscription to an EXPIRED date (${pastDate.toDateString()}).`);
    console.log('Now check the website:');
    console.log('1. Visit /doctors - Doctor should be hidden.');
    console.log('2. Visit /dashboard - Doctor should see Red Expiry Banner.');
}

testExpired()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
