import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSQL(libsql as any);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    console.log('🌱 Seeding database...');

    // Create default admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 12);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@docteur.dz' },
        update: {},
        create: {
            email: 'admin@docteur.dz',
            passwordHash: adminPasswordHash,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    });
    console.log('✅ Admin user created:', admin.email);

    // Create subscription plans
    const plans = await Promise.all([
        prisma.subscriptionPlan.upsert({
            where: { id: 1 },
            update: {},
            create: {
                name: 'Basic',
                nameAr: 'أساسي',
                description: 'Perfect for starting doctors',
                descriptionAr: 'مثالي للأطباء المبتدئين',
                price: 2000,
                maxAppointments: 50,
                maxStorageMb: 100,
                priority: 1,
            },
        }),
        prisma.subscriptionPlan.upsert({
            where: { id: 2 },
            update: {},
            create: {
                name: 'Professional',
                nameAr: 'احترافي',
                description: 'For growing medical practices',
                descriptionAr: 'للعيادات المتنامية',
                price: 5000,
                maxAppointments: 200,
                maxStorageMb: 500,
                priority: 2,
            },
        }),
        prisma.subscriptionPlan.upsert({
            where: { id: 3 },
            update: {},
            create: {
                name: 'Enterprise',
                nameAr: 'مؤسسي',
                description: 'Unlimited access for large clinics',
                descriptionAr: 'وصول غير محدود للعيادات الكبيرة',
                price: 10000,
                maxAppointments: 1000,
                maxStorageMb: 2000,
                priority: 3,
            },
        }),
    ]);
    console.log('✅ Subscription plans created:', plans.length);

    // Create sample doctor
    const doctorPasswordHash = await bcrypt.hash('doctor123', 12);

    const doctorUser = await prisma.user.upsert({
        where: { email: 'doctor@example.com' },
        update: {},
        create: {
            email: 'doctor@example.com',
            passwordHash: doctorPasswordHash,
            role: 'DOCTOR',
            status: 'ACTIVE',
        },
    });

    const doctor = await prisma.doctor.upsert({
        where: { userId: doctorUser.id },
        update: {},
        create: {
            userId: doctorUser.id,
            name: 'د. أحمد بن علي',
            specialty: 'طب عام',
            city: '16. الجزائر',
            clinicAddress: 'شارع ديدوش مراد، رقم 45',
            phone: '0555123456',
            bio: 'طبيب عام ذو خبرة 15 سنة في الممارسة الطبية',
            priceRange: '1500-3000 دج',
            workingHours: JSON.stringify({
                sunday: { start: '08:00', end: '16:00' },
                monday: { start: '08:00', end: '16:00' },
                tuesday: { start: '08:00', end: '16:00' },
                wednesday: { start: '08:00', end: '16:00' },
                thursday: { start: '08:00', end: '12:00' },
                friday: null,
                saturday: null,
            }),
            approved: true,
        },
    });
    console.log('✅ Sample doctor created:', doctor.name);

    // Create sample patient
    const patient = await prisma.patient.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'محمد العربي',
            phone: '0551234567',
            email: 'patient@example.com',
            notes: 'مريض منتظم',
        },
    });
    console.log('✅ Sample patient created:', patient.name);

    // Create doctor subscription
    const subscription = await prisma.doctorSubscription.upsert({
        where: { id: 1 },
        update: {},
        create: {
            doctorId: doctor.id,
            planId: 2, // Professional plan
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
    });
    console.log('✅ Doctor subscription created');

    // Create sample appointment
    const appointment = await prisma.appointment.upsert({
        where: { id: 1 },
        update: {},
        create: {
            doctorId: doctor.id,
            patientId: patient.id,
            date: new Date(),
            time: '10:00',
            status: 'PENDING',
            notes: 'فحص عام',
        },
    });
    console.log('✅ Sample appointment created');

    // Create sample review
    const review = await prisma.review.upsert({
        where: { id: 1 },
        update: {},
        create: {
            doctorId: doctor.id,
            patientName: 'كريم',
            rating: 5,
            comment: 'طبيب ممتاز ومعاملة راقية',
        },
    });
    console.log('✅ Sample review created');

    const doctorAccount = await prisma.user.upsert({
        where: { email: 'abdourbab3@gmail.com' },
        update: {},
        create: {
            email: 'abdourbab3@gmail.com',
            passwordHash: await bcrypt.hash('1234567', 12),
            role: 'DOCTOR',
            status: 'ACTIVE',
        },
    });

    const doctorProfile = await prisma.doctor.upsert({
        where: { userId: doctorAccount.id },
        update: {},
        create: {
            userId: doctorAccount.id,
            name: 'د. عبدو رباب',
            specialty: 'طب عام',
            city: '16. الجزائر',
            clinicAddress: 'شارع الجزائر',
            phone: '0555000000',
            bio: 'طبيب عام',
            priceRange: '1500-2500 دج',
            workingHours: JSON.stringify({
                sunday: { start: '08:00', end: '16:00' },
                monday: { start: '08:00', end: '16:00' },
                tuesday: { start: '08:00', end: '16:00' },
                wednesday: { start: '08:00', end: '16:00' },
                thursday: { start: '08:00', end: '12:00' },
                friday: null,
                saturday: null,
            }),
            approved: true,
        },
    });

    // Create subscription for this doctor
    await prisma.doctorSubscription.upsert({
        where: { id: 2 },
        update: {},
        create: {
            doctorId: doctorProfile.id,
            planId: 2, // Professional plan
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });
    console.log('✅ Specific doctor and subscription created:', doctorProfile.name);

    // Create appointment for second doctor so patient shows in their dashboard
    await prisma.appointment.upsert({
        where: { id: 2 },
        update: {},
        create: {
            doctorId: doctorProfile.id,
            patientId: patient.id,
            date: new Date(),
            time: '11:00',
            status: 'PENDING',
            notes: 'فحص عام',
        },
    });
    console.log('✅ Appointment for second doctor created');

    console.log('🎉 Database seeding completed!');
    console.log('\n📋 Default credentials:');
    console.log('   Admin: admin@docteur.dz / admin123');
    console.log('   Doctor: doctor@example.com / doctor123');
    console.log('   User Doctor: abdourbab3@gmail.com / 1234567');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
