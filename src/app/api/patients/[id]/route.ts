import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/patients/[id] - Get patient details
export async function GET(
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
        const doctorId = session.user.doctorId;

        const patient = await prisma.patient.findFirst({
            where: {
                id,
                appointments: {
                    some: { doctorId },
                },
            },
            include: {
                appointments: {
                    where: { doctorId },
                    orderBy: { date: 'desc' },
                },
                files: {
                    where: { doctorId },
                    orderBy: { uploadedAt: 'desc' },
                },
            },
        });

        if (!patient) {
            return NextResponse.json(
                { success: false, error: 'المريض غير موجود' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: patient,
        });
    } catch (error) {
        console.error('Error fetching patient:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب البيانات' },
            { status: 500 }
        );
    }
}

// PUT /api/patients/[id] - Update patient
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
        const { name, phone, email, notes } = body;

        const patient = await prisma.patient.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(phone && { phone }),
                ...(email !== undefined && { email }),
                ...(notes !== undefined && { notes }),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'تم تحديث بيانات المريض بنجاح',
            data: patient,
        });
    } catch (error) {
        console.error('Error updating patient:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء تحديث البيانات' },
            { status: 500 }
        );
    }
}
