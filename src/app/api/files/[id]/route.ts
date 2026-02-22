import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { unlink, readFile } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/files/[id] - Serve file content
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
        console.log(`[FileView] Requesting file ID: ${id} for doctor: ${session.user.doctorId}`);

        const file = await prisma.patientFile.findFirst({
            where: {
                id,
                doctorId: session.user.doctorId,
            },
        });

        if (!file) {
            console.warn(`[FileView] File not found in DB or unauthorized. ID: ${id}, Doctor: ${session.user.doctorId}`);
            return NextResponse.json(
                { success: false, error: 'المرفق غير موجود أو غير مصرح لك بعرضه' },
                { status: 404 }
            );
        }

        // Build absolute path
        // Ensure the path starts correctly. file.filePath is like "/uploads/..."
        const normalizedPath = file.filePath.startsWith('/') ? file.filePath.substring(1) : file.filePath;

        // Use path.resolve for platform-agnostic absolute paths
        const absolutePath = path.resolve(process.cwd(), 'public', normalizedPath);

        console.log(`[FileView] Request: ${id}, Doctor: ${session.user.doctorId}`);
        console.log(`[FileView] DBNPath: ${file.filePath}`);
        console.log(`[FileView] PhysPath: ${absolutePath}`);

        try {
            // Check if file exists first using the fs module
            const fs = require('fs');
            if (!fs.existsSync(absolutePath)) {
                console.error(`[FileView] Physical file not found at: ${absolutePath}`);
                return NextResponse.json(
                    { success: false, error: 'الملف مفقود من الخادم (المسار غير صحيح)' },
                    { status: 404 }
                );
            }

            const fileBuffer = await readFile(absolutePath);

            // Standard Response for binary data
            return new Response(fileBuffer, {
                status: 200,
                headers: {
                    'Content-Type': file.fileType || 'application/octet-stream',
                    'Content-Disposition': `inline; filename="${encodeURIComponent(file.fileName)}"`,
                    'Content-Length': String(fileBuffer.length),
                },
            });
        } catch (err) {
            console.error(`[FileView] File system error:`, err);
            return NextResponse.json(
                { success: false, error: 'حدث خطأ أثناء عرض الملف' },
                { status: 500 }
            );
        }
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

        // Delete physical file
        try {
            const filePath = path.join(process.cwd(), 'public', file.filePath);
            await unlink(filePath);
        } catch (err) {
            console.error('Error deleting physical file:', err);
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
