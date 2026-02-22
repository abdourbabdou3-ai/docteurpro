
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const doctors = await prisma.doctor.findMany({
        include: {
            subscriptions: {
                where: { status: 'ACTIVE' },
                take: 1,
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    console.log('Doctors List:');
    doctors.forEach(d => {
        const sub = d.subscriptions[0];
        console.log(`ID: ${d.id} | Name: ${d.name} | Sub Status: ${sub ? 'ACTIVE' : 'NONE'} | End Date: ${sub?.endDate || 'N/A'}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
