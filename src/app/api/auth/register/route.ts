import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name, specialty, city, phone } = body;

        // Validation
        if (!email || !password || !name || !specialty || !city) {
            return NextResponse.json(
                { success: false, error: 'جميع الحقول المطلوبة يجب أن تكون مملوءة' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user and doctor profile in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    role: 'DOCTOR',
                    status: 'PENDING',
                },
            });

            const doctor = await tx.doctor.create({
                data: {
                    userId: user.id,
                    name,
                    specialty,
                    city,
                    phone,
                    approved: false,
                },
            });

            // Add 14-day trial subscription (Plan ID 2 is "Professional/Basic")
            const trialDays = 14;
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + trialDays);

            await tx.doctorSubscription.create({
                data: {
                    doctorId: doctor.id,
                    planId: 2, // "اساسي"
                    status: 'ACTIVE',
                    startDate,
                    endDate,
                },
            });

            return { user, doctor };
        });

        return NextResponse.json(
            {
                success: true,
                message: 'تم إنشاء الحساب بنجاح. يرجى انتظار موافقة الإدارة',
                data: {
                    id: result.user.id,
                    email: result.user.email,
                    doctorId: result.doctor.id,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى' },
            { status: 500 }
        );
    }
}
