import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024;
const SUPABASE_BUCKET = 'patient-files';

// GET /api/files - List files for a patient
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
        const patientId = searchParams.get('patientId');

        if (!patientId) {
            return NextResponse.json(
                { success: false, error: 'معرف المريض مطلوب' },
                { status: 400 }
            );
        }

        const files = await prisma.patientFile.findMany({
            where: {
                patientId: parseInt(patientId),
                doctorId: session.user.doctorId,
            },
            orderBy: { uploadedAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            data: files,
        });
    } catch (error) {
        console.error('Error fetching files:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء جلب الملفات' },
            { status: 500 }
        );
    }
}

// POST /api/files - Upload file to Supabase
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.doctorId) {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const doctorId = session.user.doctorId;

        // Check storage limit
        const subscription = await prisma.doctorSubscription.findFirst({
            where: {
                doctorId,
                status: 'ACTIVE',
            },
            include: { plan: true },
        });

        if (!subscription) {
            return NextResponse.json(
                { success: false, error: 'يجب أن يكون لديك اشتراك نشط لرفع الملفات' },
                { status: 403 }
            );
        }

        // Calculate current storage usage
        const currentUsage = await prisma.patientFile.aggregate({
            where: { doctorId },
            _sum: { fileSize: true },
        });

        const usedMb = (currentUsage._sum.fileSize || 0) / (1024 * 1024);
        const maxMb = subscription.plan.maxStorageMb;

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const patientId = formData.get('patientId') as string;

        if (!file || !patientId) {
            return NextResponse.json(
                { success: false, error: 'الملف ومعرف المريض مطلوبان' },
                { status: 400 }
            );
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: `حجم الملف يجب أن يكون أقل من ${MAX_FILE_SIZE / (1024 * 1024)} ميغابايت` },
                { status: 400 }
            );
        }

        // Check storage limit
        const newUsageMb = usedMb + file.size / (1024 * 1024);
        if (newUsageMb > maxMb) {
            return NextResponse.json(
                { success: false, error: `تجاوزت حد التخزين المسموح (${maxMb} ميغابايت)` },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'نوع الملف غير مدعوم. يرجى رفع PDF أو صورة' },
                { status: 400 }
            );
        }

        // Generate unique filename for Supabase
        const ext = file.name.split('.').pop();
        const filename = `${doctorId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('[Supabase Upload Error]:', uploadError);
            return NextResponse.json(
                { success: false, error: 'فشل رفع الملف إلى التخزين السحابي' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(SUPABASE_BUCKET)
            .getPublicUrl(filename);

        // Create database record
        const patientFile = await prisma.patientFile.create({
            data: {
                patientId: parseInt(patientId),
                doctorId,
                filePath: publicUrl,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'تم رفع الملف بنجاح',
            data: patientFile,
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء رفع الملف' },
            { status: 500 }
        );
    }
}
