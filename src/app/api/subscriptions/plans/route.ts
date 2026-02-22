import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/subscriptions/plans - List subscription plans
export async function GET() {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { active: true },
            orderBy: { priority: 'asc' },
        });

        return NextResponse.json({
            success: true,
            data: plans,
        });
    } catch (error) {
        console.error('Error fetching plans:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب الباقات' },
            { status: 500 }
        );
    }
}

// POST /api/subscriptions/plans - Create plan (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, nameAr, description, descriptionAr, price, maxAppointments, maxStorageMb, priority } = body;

        if (!name || !nameAr || !price || !maxAppointments || !maxStorageMb) {
            return NextResponse.json(
                { success: false, error: 'جميع الحقول المطلوبة يجب أن تكون مملوءة' },
                { status: 400 }
            );
        }

        const plan = await prisma.subscriptionPlan.create({
            data: {
                name,
                nameAr,
                description,
                descriptionAr,
                price,
                maxAppointments,
                maxStorageMb,
                priority: priority || 0,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'تم إنشاء الباقة بنجاح',
            data: plan,
        });
    } catch (error) {
        console.error('Error creating plan:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء إنشاء الباقة' },
            { status: 500 }
        );
    }
}
