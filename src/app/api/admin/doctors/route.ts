import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/doctors - List all doctors for admin
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
        const status = searchParams.get('status'); // pending, active, suspended
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status === 'pending') {
            where.approved = false;
        } else if (status === 'active') {
            where.approved = true;
            where.user = { status: 'ACTIVE' };
        } else if (status === 'suspended') {
            where.user = { status: 'SUSPENDED' };
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { user: { email: { contains: search } } },
                { city: { contains: search } },
            ];
        }

        const [doctors, total] = await Promise.all([
            prisma.doctor.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            status: true,
                            createdAt: true,
                        },
                    },
                    subscriptions: {
                        where: { status: 'ACTIVE' },
                        include: { plan: true },
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                    _count: {
                        select: {
                            appointments: true,
                            reviews: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.doctor.count({ where }),
        ]);

        const doctorsWithDays = doctors.map(doctor => {
            let daysRemaining = null;
            const sub = doctor.subscriptions[0];
            if (sub && sub.endDate) {
                const diffTime = new Date(sub.endDate).getTime() - new Date().getTime();
                daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            }
            return {
                ...doctor,
                daysRemaining
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                doctors: doctorsWithDays,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب البيانات' },
            { status: 500 }
        );
    }
}
