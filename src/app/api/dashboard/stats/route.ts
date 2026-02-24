import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/dashboard/stats - Doctor dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.doctorId) {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const doctorId = session.user.doctorId;

        // Today's range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Month's range
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const [
            totalAppointments,
            todayAppointments,
            monthlyAppointments,
            pendingAppointments,
            completedAppointments,
            totalPatients,
            recentAppointments,
            todayEarnings,
            monthlyEarnings,
            totalEarnings,
            doctorSubscription,
        ] = await Promise.all([
            prisma.appointment.count({ where: { doctorId } }),
            prisma.appointment.count({
                where: { doctorId, date: { gte: today, lt: tomorrow } },
            }),
            prisma.appointment.count({
                where: {
                    doctorId,
                    date: {
                        gte: monthStart,
                        lt: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)
                    }
                },
            }),
            prisma.appointment.count({
                where: { doctorId, status: 'PENDING' },
            }),
            prisma.appointment.count({
                where: { doctorId, status: 'COMPLETED' },
            }),
            prisma.patient.count({
                where: {
                    appointments: { some: { doctorId } },
                },
            }),
            prisma.appointment.findMany({
                where: { doctorId, date: { gte: today } },
                include: { patient: true },
                orderBy: [{ date: 'asc' }, { time: 'asc' }],
                take: 5,
            }),
            // Today's earnings - based on COMPLETION date (updatedAt), not appointment date
            prisma.appointment.aggregate({
                where: {
                    doctorId,
                    status: 'COMPLETED',
                    updatedAt: { gte: today, lt: tomorrow }, // When it was completed
                    actualPrice: { not: null },
                } as any,
                _sum: { actualPrice: true } as any,
            }),
            // Monthly earnings - based on completion date
            prisma.appointment.aggregate({
                where: {
                    doctorId,
                    status: 'COMPLETED',
                    updatedAt: { gte: monthStart }, // Completed this month
                    actualPrice: { not: null },
                } as any,
                _sum: { actualPrice: true } as any,
            }),
            // Total earnings - all time
            prisma.appointment.aggregate({
                where: {
                    doctorId,
                    status: 'COMPLETED',
                    actualPrice: { not: null },
                } as any,
                _sum: { actualPrice: true } as any,
            }),
            // Subscription details
            prisma.doctorSubscription.findFirst({
                where: { doctorId, status: 'ACTIVE' },
                include: { plan: true },
                orderBy: { createdAt: 'desc' }
            }),
        ]);

        const subscription = doctorSubscription;
        console.log('API_DEBUG: Doctor ID:', doctorId);
        console.log('API_DEBUG: Subscription Found:', !!subscription);

        let daysRemaining = null;
        if (subscription?.endDate) {
            const diffTime = new Date(subscription.endDate).getTime() - new Date().getTime();
            daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }
        console.log('API_DEBUG: Days Remaining:', daysRemaining);

        return NextResponse.json({
            success: true,
            data: {
                totalAppointments,
                todayAppointments,
                monthlyAppointments,
                pendingAppointments,
                completedAppointments,
                totalPatients,
                recentAppointments,
                todayEarnings: Number(todayEarnings?._sum?.actualPrice) || 0,
                monthlyEarnings: Number(monthlyEarnings?._sum?.actualPrice) || 0,
                totalEarnings: Number(totalEarnings?._sum?.actualPrice) || 0,
                subscription: subscription ? {
                    planName: subscription.plan.nameAr,
                    endDate: subscription.endDate,
                    startDate: subscription.startDate,
                    daysRemaining,
                    totalDays: subscription.startDate && subscription.endDate
                        ? Math.ceil((new Date(subscription.endDate).getTime() - new Date(subscription.startDate).getTime()) / (1000 * 60 * 60 * 24))
                        : 30, // Default for non-trial
                    usedDays: subscription.startDate
                        ? Math.ceil((new Date().getTime() - new Date(subscription.startDate).getTime()) / (1000 * 60 * 60 * 24))
                        : 0
                } : null,
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب الإحصائيات' },
            { status: 500 }
        );
    }
}
