import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { unlink, readFile } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/files/[id] - Redirect to Supabase URL
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.doctorId) {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const id = parseInt(params.id);
        const file = await prisma.patientFile.findFirst({
            where: {
                id,
                doctorId: session.user.doctorId,
            },
        });

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'المرفق غير موجود أو غير مصرح لك بعرضه' },
                { status: 404 }
            );
        }

        // Redirect to the actual Supabase URL
        return NextResponse.redirect(new URL(file.filePath));
    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء عرض الملف' },
            { status: 500 }
        );
    }
}

// DELETE /api/files/[id] - Delete file
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.doctorId) {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const id = parseInt(params.id);

        const file = await prisma.patientFile.findFirst({
            where: {
                id,
                doctorId: session.user.doctorId,
            },
        });

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'الملف غير موجود' },
                { status: 404 }
            );
        }

        // Delete database record
        await prisma.patientFile.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'تم حذف الملف بنجاح',
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء حذف الملف' },
            { status: 500 }
        );
    }
}
