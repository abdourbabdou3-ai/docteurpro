import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/stats - Platform analytics
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 403 }
            );
        }

        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const [
            totalDoctors,
            activeDoctors,
            pendingDoctors,
            totalPatients,
            totalAppointments,
            monthlyAppointments,
            pendingSubscriptions,
            activeSubscriptions,
        ] = await Promise.all([
            prisma.doctor.count(),
            prisma.doctor.count({ where: { approved: true, user: { status: 'ACTIVE' } } }),
            prisma.doctor.count({ where: { approved: false } }),
            prisma.patient.count(),
            prisma.appointment.count(),
            prisma.appointment.count({ where: { createdAt: { gte: monthStart } } }),
            prisma.doctorSubscription.count({ where: { status: 'PENDING' } }),
            prisma.doctorSubscription.count({ where: { status: 'ACTIVE' } }),
        ]);

        // Calculate actual revenue for the current month
        const monthlySubscriptions = await prisma.doctorSubscription.findMany({
            where: {
                startDate: { gte: monthStart },
                status: { in: ['ACTIVE', 'EXPIRED'] }
            },
            include: { plan: true },
        });

        const monthlyRevenue = monthlySubscriptions.reduce(
            (sum, sub) => sum + Number(sub.plan.price),
            0
        );

        return NextResponse.json({
            success: true,
            data: {
                totalDoctors,
                activeDoctors,
                pendingDoctors,
                totalPatients,
                totalAppointments,
                monthlyAppointments,
                pendingSubscriptions,
                activeSubscriptions,
                monthlyRevenue,
            },
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب الإحصائيات' },
            { status: 500 }
        );
    }
}
