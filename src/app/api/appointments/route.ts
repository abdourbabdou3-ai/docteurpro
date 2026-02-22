import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/appointments - List appointments
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);

        const doctorId = searchParams.get('doctorId');
        const date = searchParams.get('date');
        const status = searchParams.get('status');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const where: any = {};

        // If authenticated doctor, show only their appointments
        if (session?.user.doctorId) {
            where.doctorId = session.user.doctorId;
        } else if (doctorId) {
            where.doctorId = parseInt(doctorId);
        }

        if (date) {
            where.date = new Date(date);
        }

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        if (status) {
            where.status = status;
        }

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                include: {
                    patient: true,
                    doctor: {
                        select: {
                            id: true,
                            name: true,
                            specialty: true,
                            priceRange: true,
                        },
                    },
                },
                orderBy: [{ date: 'asc' }, { time: 'asc' }],
                skip,
                take: limit,
            }),
            prisma.appointment.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                appointments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب المواعيد' },
            { status: 500 }
        );
    }
}

// POST /api/appointments - Create appointment (public booking)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { doctorId, patientName, patientPhone, patientEmail, date, time, notes } = body;

        if (!doctorId || !patientName || !patientPhone || !date || !time) {
            return NextResponse.json(
                { success: false, error: 'جميع الحقول المطلوبة يجب أن تكون مملوءة' },
                { status: 400 }
            );
        }

        // Check doctor exists and is active
        const doctor = await prisma.doctor.findFirst({
            where: {
                id: doctorId,
                approved: true,
                user: { status: 'ACTIVE' },
            },
            include: {
                subscriptions: {
                    where: { status: 'ACTIVE' },
                    include: { plan: true },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        if (!doctor) {
            return NextResponse.json(
                { success: false, error: 'الطبيب غير متاح حالياً' },
                { status: 400 }
            );
        }

        // Check subscription limits and validity
        const activeSubscription = doctor.subscriptions[0];
        if (activeSubscription) {
            // Check if subscription has expired by date
            const now = new Date();
            if (activeSubscription.endDate && new Date(activeSubscription.endDate) < now) {
                return NextResponse.json(
                    { success: false, error: 'عذراً، انتهت صلاحية اشتراك الطبيب. يرجى مراجعة الطبيب لاحقاً' },
                    { status: 400 }
                );
            }

            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);

            const appointmentCount = await prisma.appointment.count({
                where: {
                    doctorId,
                    createdAt: { gte: monthStart },
                },
            });

            if (appointmentCount >= activeSubscription.plan.maxAppointments) {
                return NextResponse.json(
                    { success: false, error: 'عذراً، الطبيب وصل للحد الأقصى من المواعيد هذا الشهر' },
                    { status: 400 }
                );
            }
        }

        // Check if time slot is available
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId,
                date: new Date(date),
                time,
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
        });

        if (existingAppointment) {
            return NextResponse.json(
                { success: false, error: 'هذا الموعد محجوز مسبقاً. يرجى اختيار وقت آخر' },
                { status: 400 }
            );
        }

        // Create or get patient
        let patient = await prisma.patient.findFirst({
            where: { phone: patientPhone },
        });

        if (!patient) {
            patient = await prisma.patient.create({
                data: {
                    name: patientName,
                    phone: patientPhone,
                    email: patientEmail,
                },
            });
        }

        // Create appointment
        const appointment = await prisma.appointment.create({
            data: {
                doctorId,
                patientId: patient.id,
                date: new Date(date),
                time,
                notes,
                status: 'PENDING',
            },
            include: {
                patient: true,
                doctor: {
                    select: { name: true },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'تم حجز الموعد بنجاح. سيتم التأكيد قريباً',
            data: appointment,
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء حجز الموعد' },
            { status: 500 }
        );
    }
}
