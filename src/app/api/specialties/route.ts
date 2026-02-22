import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { medicalSpecialties as defaultSpecialties } from '@/lib/utils';

export async function GET() {
    try {
        // Fetch unique specialties from the Doctor table
        const doctors = await prisma.doctor.findMany({
            select: {
                specialty: true,
            },
            distinct: ['specialty'],
            where: {
                approved: true, // Only show specialties of approved doctors in search if we want to be strict, 
                // but for registration we might want all. Let's get all for now.
            }
        });

        const dbSpecialties = doctors.map(d => d.specialty);

        // Merge with default list and remove duplicates
        const allSpecialties = Array.from(new Set([...defaultSpecialties, ...dbSpecialties]))
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'ar'));

        return NextResponse.json({
            success: true,
            data: allSpecialties
        });
    } catch (error) {
        console.error('Error fetching specialties:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب التخصصات' },
            { status: 500 }
        );
    }
}
