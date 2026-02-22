import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// PUT /api/admin/doctors/[id] - Approve/Suspend doctor
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
        const { action } = body; // approve, suspend, activate

        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!doctor) {
            return NextResponse.json(
                { success: false, error: 'الطبيب غير موجود' },
                { status: 404 }
            );
        }

        let message = '';

        if (action === 'approve') {
            await prisma.$transaction([
                prisma.doctor.update({
                    where: { id },
                    data: { approved: true },
                }),
                prisma.user.update({
                    where: { id: doctor.userId },
                    data: { status: 'ACTIVE' },
                }),
            ]);
            message = 'تم الموافقة على الطبيب بنجاح';
        } else if (action === 'suspend') {
            await prisma.user.update({
                where: { id: doctor.userId },
                data: { status: 'SUSPENDED' },
            });
            message = 'تم تعليق حساب الطبيب';
        } else if (action === 'activate') {
            await prisma.user.update({
                where: { id: doctor.userId },
                data: { status: 'ACTIVE' },
            });
            message = 'تم تفعيل حساب الطبيب';
        } else if (action === 'reject') {
            await prisma.user.delete({
                where: { id: doctor.userId },
            });
            message = 'تم رفض الطبيب وحذف حسابه';
        }

        return NextResponse.json({
            success: true,
            message,
        });
    } catch (error) {
        console.error('Error updating doctor:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء تحديث بيانات الطبيب' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/doctors/[id] - Delete doctor account permanently
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

        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!doctor) {
            return NextResponse.json(
                { success: false, error: 'الطبيب غير موجود' },
                { status: 404 }
            );
        }

        // Delete user (cascades to doctor and all related data)
        await prisma.user.delete({
            where: { id: doctor.userId },
        });

        return NextResponse.json({
            success: true,
            message: 'تم حذف الطبيب وجميع بياناته بنجاح',
        });
    } catch (error) {
        console.error('Error deleting doctor:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء حذف الطبيب' },
            { status: 500 }
        );
    }
}
