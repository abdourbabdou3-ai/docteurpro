import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/subscriptions - List pending subscriptions
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'PENDING';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [subscriptions, total] = await Promise.all([
            prisma.doctorSubscription.findMany({
                where: { status: status as any },
                include: {
                    doctor: {
                        include: {
                            user: {
                                select: { email: true },
                            },
                        },
                    },
                    plan: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.doctorSubscription.count({ where: { status: status as any } }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                subscriptions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب طلبات الاشتراك' },
            { status: 500 }
        );
    }
}
