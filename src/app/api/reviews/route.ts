import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/reviews - Get reviews for a doctor
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const doctorId = searchParams.get('doctorId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        if (!doctorId) {
            return NextResponse.json(
                { success: false, error: 'معرف الطبيب مطلوب' },
                { status: 400 }
            );
        }

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { doctorId: parseInt(doctorId) },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.review.count({ where: { doctorId: parseInt(doctorId) } }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب التقييمات' },
            { status: 500 }
        );
    }
}

// POST /api/reviews - Create review (public)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { doctorId, patientName, rating, comment } = body;

        if (!doctorId || !patientName || !rating) {
            return NextResponse.json(
                { success: false, error: 'جميع الحقول المطلوبة يجب أن تكون مملوءة' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, error: 'التقييم يجب أن يكون بين 1 و 5' },
                { status: 400 }
            );
        }

        // Verify doctor exists
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
        });

        if (!doctor) {
            return NextResponse.json(
                { success: false, error: 'الطبيب غير موجود' },
                { status: 404 }
            );
        }

        const review = await prisma.review.create({
            data: {
                doctorId,
                patientName,
                rating,
                comment,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'شكراً لك! تم إضافة تقييمك بنجاح',
            data: review,
        });
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء إضافة التقييم' },
            { status: 500 }
        );
    }
}
