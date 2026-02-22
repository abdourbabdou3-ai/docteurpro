import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/doctors/[id] - Get single doctor
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, error: 'معرف غير صالح' },
                { status: 400 }
            );
        }

        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: {
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                user: {
                    select: {
                        status: true,
                    },
                },
            },
        });

        if (!doctor) {
            return NextResponse.json(
                { success: false, error: 'الطبيب غير موجود' },
                { status: 404 }
            );
        }

        // Calculate rating
        const ratings = doctor.reviews.map((r) => r.rating);
        const avgRating = ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;

        // Parse workingHours if it's a string (SQLite/Turso storage)
        let parsedWorkingHours = doctor.workingHours;
        if (typeof doctor.workingHours === 'string' && doctor.workingHours) {
            try {
                parsedWorkingHours = JSON.parse(doctor.workingHours);
            } catch (e) {
                console.error('Error parsing workingHours:', e);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                id: doctor.id,
                name: doctor.name,
                specialty: doctor.specialty,
                city: doctor.city,
                clinicAddress: doctor.clinicAddress,
                workingHours: parsedWorkingHours,
                priceRange: doctor.priceRange,
                profileImage: doctor.profileImage,
                phone: doctor.phone,
                bio: doctor.bio,
                rating: Math.round(avgRating * 10) / 10,
                reviewCount: doctor.reviews.length,
                reviews: doctor.reviews,
                isActive: doctor.user.status === 'ACTIVE' && doctor.approved,
            },
        });
    } catch (error) {
        console.error('Error fetching doctor:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب البيانات' },
            { status: 500 }
        );
    }
}

// PUT /api/doctors/[id] - Update doctor profile
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const id = parseInt(params.id);
        const isAdmin = session.user.role === 'ADMIN';
        const isOwner = session.user.doctorId === id;

        if (!isAdmin && !isOwner) {
            return NextResponse.json(
                { success: false, error: 'غير مصرح بتعديل هذا الملف' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            name,
            specialty,
            city,
            clinicAddress,
            workingHours,
            priceRange,
            profileImage,
            phone,
            bio,
            approved, // Only admin can modify
        } = body;

        const updateData: any = {};

        if (name) updateData.name = name;
        if (specialty) updateData.specialty = specialty;
        if (city) updateData.city = city;
        if (clinicAddress !== undefined) updateData.clinicAddress = clinicAddress;
        if (workingHours !== undefined) updateData.workingHours = workingHours;
        if (priceRange !== undefined) updateData.priceRange = priceRange;
        if (profileImage !== undefined) updateData.profileImage = profileImage;
        if (phone !== undefined) updateData.phone = phone;
        if (bio !== undefined) updateData.bio = bio;

        // Stringify workingHours if it's an object (SQLite/Turso expects string)
        if (updateData.workingHours && typeof updateData.workingHours === 'object') {
            updateData.workingHours = JSON.stringify(updateData.workingHours);
        }

        // Only admin can approve doctors
        if (isAdmin && approved !== undefined) {
            updateData.approved = approved;
        }

        const doctor = await prisma.doctor.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            message: 'تم تحديث البيانات بنجاح',
            data: doctor,
        });
    } catch (error) {
        console.error('Error updating doctor:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء تحديث البيانات' },
            { status: 500 }
        );
    }
}

// DELETE /api/doctors/[id] - Delete doctor (admin only)
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

        // Get doctor with user
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

        // Delete user (cascades to doctor)
        await prisma.user.delete({
            where: { id: doctor.userId },
        });

        return NextResponse.json({
            success: true,
            message: 'تم حذف الطبيب بنجاح',
        });
    } catch (error) {
        console.error('Error deleting doctor:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء حذف البيانات' },
            { status: 500 }
        );
    }
}
