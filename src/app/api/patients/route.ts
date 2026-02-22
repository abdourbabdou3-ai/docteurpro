import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/patients - List patients for a doctor
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.doctorId) {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Get patients who have appointments with this doctor
        const doctorId = session.user.doctorId;

        const where: any = {
            appointments: {
                some: {
                    doctorId,
                },
            },
        };

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { phone: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where,
                include: {
                    appointments: {
                        where: { doctorId },
                        orderBy: { date: 'desc' },
                        take: 1,
                    },
                    _count: {
                        select: {
                            appointments: {
                                where: { doctorId },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.patient.count({ where }),
        ]);

        const patientsWithStats = patients.map((patient) => ({
            id: patient.id,
            name: patient.name,
            phone: patient.phone,
            email: patient.email,
            notes: patient.notes,
            createdAt: patient.createdAt,
            lastAppointment: patient.appointments[0] || null,
            appointmentCount: patient._count.appointments,
        }));

        return NextResponse.json({
            success: true,
            data: {
                patients: patientsWithStats,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب البيانات' },
            { status: 500 }
        );
    }
}

// POST /api/patients - Create or get patient (for booking)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, phone, email, notes } = body;

        if (!name || !phone) {
            return NextResponse.json(
                { success: false, error: 'الاسم ورقم الهاتف مطلوبان' },
                { status: 400 }
            );
        }

        // Check if patient exists by phone
        let patient = await prisma.patient.findFirst({
            where: { phone },
        });

        if (patient) {
            // Update existing patient info
            patient = await prisma.patient.update({
                where: { id: patient.id },
                data: {
                    name,
                    email: email || patient.email,
                    notes: notes || patient.notes,
                },
            });
        } else {
            // Create new patient
            patient = await prisma.patient.create({
                data: {
                    name,
                    phone,
                    email,
                    notes,
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: patient,
        });
    } catch (error) {
        console.error('Error creating patient:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء حفظ البيانات' },
            { status: 500 }
        );
    }
}
