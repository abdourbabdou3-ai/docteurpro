import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/doctors - List doctors with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const specialty = searchParams.get('specialty');
        const city = searchParams.get('city');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const skip = (page - 1) * limit;

        // Build where clause
        const now = new Date();
        const where: any = {
            approved: true,
            user: {
                status: 'ACTIVE',
            },
        };

        if (specialty) {
            where.specialty = specialty;
        }

        if (city) {
            // Extract wilaya name if it has a prefix like "16. الجزائر" 
            const cityClean = city.includes('. ') ? city.split('. ')[1] : city;
            console.log(`[Search] Original City: "${city}", Cleaned: "${cityClean}"`);

            where.city = { contains: cityClean };
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { specialty: { contains: search } },
                { city: { contains: search } },
            ];
        }

        // Get doctors with reviews for rating calculation
        const [doctors, total] = await Promise.all([
            prisma.doctor.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    specialty: true,
                    city: true,
                    clinicAddress: true,
                    workingHours: true,
                    priceRange: true,
                    profileImage: true,
                    phone: true,
                    bio: true,
                    createdAt: true,
                    reviews: {
                        select: {
                            rating: true,
                        },
                    },
                    _count: {
                        select: {
                            reviews: true,
                        },
                    },
                    subscriptions: {
                        where: {
                            status: 'ACTIVE',
                        },
                        include: {
                            plan: true,
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                        take: 1,
                    },
                },
                orderBy: [
                    {
                        subscriptions: {
                            _count: 'desc',
                        },
                    },
                    { createdAt: 'desc' },
                ],
                skip,
                take: limit,
            }),
            prisma.doctor.count({ where }),
        ]);

        // Transform data with ratings
        const doctorsWithRatings = doctors.map((doctor) => {
            const ratings = doctor.reviews.map((r) => r.rating);
            const avgRating = ratings.length > 0
                ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                : 0;

            return {
                id: doctor.id,
                name: doctor.name,
                specialty: doctor.specialty,
                city: doctor.city,
                clinicAddress: doctor.clinicAddress,
                workingHours: doctor.workingHours,
                priceRange: doctor.priceRange,
                profileImage: doctor.profileImage,
                phone: doctor.phone,
                bio: doctor.bio,
                rating: Math.round(avgRating * 10) / 10,
                reviewCount: doctor._count.reviews,
                subscriptionEnd: doctor.subscriptions[0]?.endDate || null,
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                doctors: doctorsWithRatings,
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
