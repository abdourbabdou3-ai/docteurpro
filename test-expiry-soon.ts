
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testWarning() {
    const doctorId = 1;
    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + 1); // 1 day from now

    await prisma.doctorSubscription.updateMany({
        where: { doctorId, status: 'ACTIVE' },
        data: { endDate: soonDate }
    });

    console.log(`Successfully updated Doctor ${doctorId} subscription to a NEAR EXPIRY date (${soonDate.toDateString()}).`);
    console.log('Now check the website:');
    console.log('1. Visit /doctors - Doctor should STILL BE VISIBLE.');
    console.log('2. Visit /dashboard - Doctor should see Yellow Warning Banner (2 days left).');
}

testWarning()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
