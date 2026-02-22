import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const doctors = await prisma.doctor.findMany({
            include: {
                subscriptions: {
                    where: { status: 'ACTIVE' }
                }
            }
        });

        console.log(`Checking ${doctors.length} doctors...`);

        for (const doctor of doctors) {
            if (doctor.subscriptions.length === 0) {
                console.log(`Giving 14-day trial to doctor: ${doctor.name} (ID: ${doctor.id})`);

                const trialDays = 14;
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(startDate.getDate() + trialDays);

                await prisma.doctorSubscription.create({
                    data: {
                        doctorId: doctor.id,
                        planId: 2, // "اساسي"
                        status: 'ACTIVE',
                        startDate: doctor.createdAt, // Trial starts from when they joined
                        endDate: endDate, // Ending 14 days from today for existing users to give them full trial now
                    },
                });
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
