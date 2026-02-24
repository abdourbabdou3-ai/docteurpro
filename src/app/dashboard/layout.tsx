'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user.role === 'ADMIN') {
            router.push('/admin');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    // Final safety check for session data
    if (!session?.user) {
        return (
            <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div className="spinner"></div>
                <p className="text-muted">جاري تحميل بيانات الجلسة...</p>
            </div>
        );
    }

    if (session.user.role !== 'DOCTOR') {
        return (
            <div className="flex-center" style={{ height: '100vh', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                <div>
                    <h2 className="text-danger">غير مصرح</h2>
                    <p className="text-muted">هذا الحساب لا يملك صلاحيات الوصول للوحة تحكم الأطباء</p>
                    <Link href="/login" className="btn btn-primary mt-md">تسجيل الدخول كطبيب</Link>
                </div>
            </div>
        );
    }

    const menuItems = [
        { href: '/dashboard', label: 'الرئيسية', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { href: '/dashboard/appointments', label: 'المواعيد', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { href: '/dashboard/patients', label: 'المرضى', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { href: '/dashboard/reports', label: 'التقارير', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { href: '/dashboard/profile', label: 'الملف الشخصي', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { href: '/dashboard/subscription', label: 'الاشتراك', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    ];

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <Link href="/" className="sidebar-logo">
                    <svg viewBox="0 0 40 40" fill="none" width="32" height="32">
                        <circle cx="20" cy="20" r="18" fill="#0066cc" />
                        <path d="M20 10V30M10 20H30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    دكتور
                </Link>

                <nav>
                    <ul className="sidebar-menu">
                        {menuItems.map((item) => (
                            <li key={item.href} className="sidebar-item">
                                <Link
                                    href={item.href}
                                    className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={item.icon} />
                                    </svg>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-xl)', borderTop: '1px solid var(--gray-200)' }}>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <p style={{ fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                            {session?.user?.doctorName || session?.user?.email || 'طبيب'}
                        </p>
                        <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                            {session.user.email}
                        </p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="btn btn-ghost btn-block"
                        style={{ justifyContent: 'flex-start' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {!session.user.approved && (
                    <div className="alert alert-warning mb-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
                        </svg>
                        حسابك قيد المراجعة. بعض الميزات قد تكون محدودة حتى يتم الموافقة عليه.
                    </div>
                )}
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
            </main>

            {/* Bottom Nav for Mobile */}
            <nav className="bottom-nav">
                <Link
                    href="/dashboard"
                    className={`bottom-nav-link ${pathname === '/dashboard' ? 'active' : ''}`}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>الرئيسية</span>
                </Link>
                <Link
                    href="/dashboard/appointments"
                    className={`bottom-nav-link ${pathname === '/dashboard/appointments' ? 'active' : ''}`}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>المواعيد</span>
                </Link>
                <Link
                    href="/dashboard/patients"
                    className={`bottom-nav-link ${pathname === '/dashboard/patients' ? 'active' : ''}`}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>المرضى</span>
                </Link>
                <Link
                    href="/dashboard/subscription"
                    className={`bottom-nav-link ${pathname === '/dashboard/subscription' ? 'active' : ''}`}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>الاشتراك</span>
                </Link>
                <Link
                    href="/dashboard/profile"
                    className={`bottom-nav-link ${pathname === '/dashboard/profile' ? 'active' : ''}`}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>الملف</span>
                </Link>
            </nav>
        </div>
    );
}
