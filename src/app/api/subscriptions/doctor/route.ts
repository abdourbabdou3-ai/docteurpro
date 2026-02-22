import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/subscriptions/doctor - Get current doctor subscription
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.doctorId) {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const subscription = await prisma.doctorSubscription.findFirst({
            where: {
                doctorId: session.user.doctorId,
            },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate usage
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const [appointmentCount, storageUsage] = await Promise.all([
            prisma.appointment.count({
                where: {
                    doctorId: session.user.doctorId,
                    createdAt: { gte: monthStart },
                },
            }),
            prisma.patientFile.aggregate({
                where: { doctorId: session.user.doctorId },
                _sum: { fileSize: true },
            }),
        ]);

        const usedStorageMb = Math.round((storageUsage._sum.fileSize || 0) / (1024 * 1024) * 100) / 100;

        return NextResponse.json({
            success: true,
            data: {
                subscription,
                usage: {
                    appointmentsUsed: appointmentCount,
                    appointmentsMax: subscription?.plan.maxAppointments || 0,
                    storageMbUsed: usedStorageMb,
                    storageMbMax: subscription?.plan.maxStorageMb || 0,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب بيانات الاشتراك' },
            { status: 500 }
        );
    }
}

// POST /api/subscriptions/doctor - Request subscription
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.doctorId) {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { planId } = body;

        if (!planId) {
            return NextResponse.json(
                { success: false, error: 'يرجى اختيار باقة' },
                { status: 400 }
            );
        }

        // Check if there's already a pending subscription
        const existingPending = await prisma.doctorSubscription.findFirst({
            where: {
                doctorId: session.user.doctorId,
                status: 'PENDING',
            },
        });

        if (existingPending) {
            return NextResponse.json(
                { success: false, error: 'لديك طلب اشتراك قيد المراجعة' },
                { status: 400 }
            );
        }

        // Create subscription request
        const subscription = await prisma.doctorSubscription.create({
            data: {
                doctorId: session.user.doctorId,
                planId,
                status: 'PENDING',
            },
            include: { plan: true },
        });

        return NextResponse.json({
            success: true,
            message: 'تم إرسال طلب الاشتراك. سيتم مراجعته من قبل الإدارة',
            data: subscription,
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء إرسال طلب الاشتراك' },
            { status: 500 }
        );
    }
}
