import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024;

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

// POST /api/files - Upload file
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

        // Create upload directory
        const uploadPath = path.join(UPLOAD_DIR, doctorId.toString());
        console.log(`[Upload] Doctor: ${doctorId}, Uploading to: ${uploadPath}`);
        await mkdir(uploadPath, { recursive: true });

        // Generate unique filename
        const ext = path.extname(file.name);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
        const filePath = path.join(uploadPath, filename);
        console.log(`[Upload] Full file path: ${filePath}`);

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Create database record
        const patientFile = await prisma.patientFile.create({
            data: {
                patientId: parseInt(patientId),
                doctorId,
                filePath: `/uploads/${doctorId}/${filename}`,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
            },
        });
        console.log(`[Upload] DB Record created with ID: ${patientFile.id}, Path: ${patientFile.filePath}`);

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
