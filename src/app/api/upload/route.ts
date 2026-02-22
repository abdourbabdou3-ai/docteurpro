import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const SUPABASE_BUCKET = 'doctor-profiles'; // Ensure this bucket exists or use a common one

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'DOCTOR') {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'لم يتم اختيار ملف' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'الملف يجب أن يكون صورة' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'حجم الصورة يجب أن لا يتجاوز 5 ميجا' },
                { status: 400 }
            );
        }

        // Create unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `${session.user.doctorId}/${timestamp}.${extension}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('[Supabase Profile Upload Error]:', uploadError);
            return NextResponse.json(
                { success: false, error: 'فشل تحميل الصورة إلى التخزين السحابي' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(SUPABASE_BUCKET)
            .getPublicUrl(filename);

        return NextResponse.json({
            success: true,
            url: publicUrl,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء تحميل الصورة' },
            { status: 500 }
        );
    }
}
