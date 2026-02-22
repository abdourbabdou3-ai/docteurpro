import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const plans = await prisma.subscriptionPlan.findMany();
        console.log('PLAN_LIST_START');
        console.log(JSON.stringify(plans, null, 2));
        console.log('PLAN_LIST_END');
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
