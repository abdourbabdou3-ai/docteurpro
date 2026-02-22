import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const doctor = await prisma.doctor.findFirst({
            include: {
                subscriptions: {
                    where: { status: 'ACTIVE' },
                    include: { plan: true },
                    orderBy: { createdAt: 'desc' },
                }
            }
        });

        console.log('DOCTOR_INFO_START');
        console.log(JSON.stringify(doctor, null, 2));
        console.log('DOCTOR_INFO_END');

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
