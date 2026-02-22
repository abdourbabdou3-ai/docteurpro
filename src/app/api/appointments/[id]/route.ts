import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// PUT /api/appointments/[id] - Update appointment status
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.doctorId) {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const id = parseInt(params.id);
        const body = await request.json();
        const { status, notes, date, time, actualPrice } = body;

        // Verify appointment belongs to doctor
        const existing = await prisma.appointment.findFirst({
            where: {
                id,
                doctorId: session.user.doctorId,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'الموعد غير موجود' },
                { status: 404 }
            );
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
                ...(date && { date: new Date(date) }),
                ...(time && { time }),
                ...(actualPrice !== undefined && { actualPrice }),
            },
            include: {
                patient: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'تم تحديث الموعد بنجاح',
            data: appointment,
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء تحديث الموعد' },
            { status: 500 }
        );
    }
}

// DELETE /api/appointments/[id] - Cancel appointment
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.doctorId) {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const id = parseInt(params.id);

        // Verify appointment belongs to doctor
        const existing = await prisma.appointment.findFirst({
            where: {
                id,
                doctorId: session.user.doctorId,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'الموعد غير موجود' },
                { status: 404 }
            );
        }

        await prisma.appointment.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });

        return NextResponse.json({
            success: true,
            message: 'تم إلغاء الموعد بنجاح',
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء إلغاء الموعد' },
            { status: 500 }
        );
    }
}
