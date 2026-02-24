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
    title: 'tabib-dz - منصة حجز المواعيد الطبية',
    description: 'منصة رقمية تربط الأطباء بالمرضى في الجزائر. احجز موعدك الآن بسهولة وسرعة',
    keywords: 'طبيب, حجز مواعيد, الجزائر, عيادة, صحة, doctor, booking, Algeria',
    authors: [{ name: 'tabib-dz Platform' }],
    openGraph: {
        title: 'tabib-dz - منصة حجز المواعيد الطبية',
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
            <head>
                <link rel="manifest" href="/manifest.json?v=11" />
                <meta name="theme-color" content="#0066cc" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="tabib-dz" />
                <link rel="apple-touch-icon" href="/icons/icon-doctor-v11.jpg" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js');
                                });
                            }
                        `,
                    }}
                />
            </head>
            <body style={{ fontFamily: 'var(--font-tajawal), Tajawal, sans-serif' }}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
