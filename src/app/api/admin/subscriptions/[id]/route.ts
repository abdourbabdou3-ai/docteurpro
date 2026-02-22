import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// PUT /api/admin/subscriptions/[id] - Approve/Reject subscription
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 403 }
            );
        }

        const id = parseInt(params.id);
        const body = await request.json();
        const { action, durationDays } = body; // approve, reject

        const subscription = await prisma.doctorSubscription.findUnique({
            where: { id },
        });

        if (!subscription) {
            return NextResponse.json(
                { success: false, error: 'طلب الاشتراك غير موجود' },
                { status: 404 }
            );
        }

        let message = '';

        if (action === 'approve') {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + (durationDays || 30));

            // Expire any existing active subscription
            await prisma.doctorSubscription.updateMany({
                where: {
                    doctorId: subscription.doctorId,
                    status: 'ACTIVE',
                },
                data: { status: 'EXPIRED' },
            });

            // Activate new subscription
            await prisma.doctorSubscription.update({
                where: { id },
                data: {
                    status: 'ACTIVE',
                    startDate,
                    endDate,
                },
            });

            message = 'تم الموافقة على الاشتراك وتفعيله';
        } else if (action === 'reject') {
            await prisma.doctorSubscription.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });
            message = 'تم رفض طلب الاشتراك';
        }

        return NextResponse.json({
            success: true,
            message,
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء تحديث الاشتراك' },
            { status: 500 }
        );
    }
}
