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

// POST /api/files - Notification from client after successful Supabase upload
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
        const { patientId, filePath, fileName, fileType, fileSize } = await request.json();

        if (!patientId || !filePath || !fileName) {
            return NextResponse.json(
                { success: false, error: 'معلومات الملف غير مكتملة' },
                { status: 400 }
            );
        }

        // Create database record
        const patientFile = await prisma.patientFile.create({
            data: {
                patientId: parseInt(patientId),
                doctorId,
                filePath,
                fileName,
                fileType,
                fileSize,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'تم تسجيل الملف بنجاح',
            data: patientFile,
        });
    } catch (error) {
        console.error('Error saving file record:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء حفظ سجل الملف' },
            { status: 500 }
        );
    }
}

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
