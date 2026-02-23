import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/upload - Notification from client after successful Cloudinary upload
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'DOCTOR') {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { success: false, error: 'لم يتم توفير رابط الصورة' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            url: url,
        });
    } catch (error) {
        console.error('Upload notification error:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء معالجة رابط الصورة' },
            { status: 500 }
        );
    }
}
