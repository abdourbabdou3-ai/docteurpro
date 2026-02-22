import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/subscriptions/plans/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id },
        });

        if (!plan) {
            return NextResponse.json(
                { success: false, error: 'الباقة غير موجودة' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: plan,
        });
    } catch (error) {
        console.error('Error fetching plan:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب الباقة' },
            { status: 500 }
        );
    }
}

// PUT /api/subscriptions/plans/[id] - Update plan (admin only)
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

        const plan = await prisma.subscriptionPlan.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            message: 'تم تحديث الباقة بنجاح',
            data: plan,
        });
    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء تحديث الباقة' },
            { status: 500 }
        );
    }
}

// DELETE /api/subscriptions/plans/[id] - Deactivate plan (admin only)
export async function DELETE(
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

        await prisma.subscriptionPlan.update({
            where: { id },
            data: { active: false },
        });

        return NextResponse.json({
            success: true,
            message: 'تم إلغاء تفعيل الباقة بنجاح',
        });
    } catch (error) {
        console.error('Error deactivating plan:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء إلغاء تفعيل الباقة' },
            { status: 500 }
        );
    }
}
