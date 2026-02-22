import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const tajawal = Tajawal({
    subsets: ['arabic'],
    weight: ['300', '400', '500', '700', '800'],
    display: 'swap',
    variable: '--font-tajawal',
});

export const metadata: Metadata = {
    title: 'دكتور - منصة حجز المواعيد الطبية',
    description: 'منصة رقمية تربط الأطباء بالمرضى في الجزائر. احجز موعدك الآن بسهولة وسرعة',
    keywords: 'طبيب, حجز مواعيد, الجزائر, عيادة, صحة, doctor, booking, Algeria',
    authors: [{ name: 'Docteur Platform' }],
    openGraph: {
        title: 'دكتور - منصة حجز المواعيد الطبية',
        description: 'منصة رقمية تربط الأطباء بالمرضى في الجزائر',
        type: 'website',
        locale: 'ar_DZ',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl" className={tajawal.variable}>
            <body style={{ fontFamily: 'var(--font-tajawal), Tajawal, sans-serif' }}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
