'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function AdminLayout({
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
        } else if (session && session.user.role !== 'ADMIN') {
            router.push('/dashboard');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!session || session.user.role !== 'ADMIN') {
        return null;
    }

    const menuItems = [
        { href: '/admin', label: 'لوحة التحكم', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { href: '/admin/doctors', label: 'الأطباء', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
        { href: '/admin/subscriptions', label: 'الاشتراكات', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        { href: '/admin/plans', label: 'الباقات', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    ];

    return (
        <div className="dashboard">
            <aside className="sidebar" style={{ background: 'var(--gray-900)', borderColor: 'var(--gray-800)' }}>
                <Link href="/admin" className="sidebar-logo" style={{ color: 'var(--white)' }}>
                    <svg viewBox="0 0 40 40" fill="none" width="32" height="32">
                        <circle cx="20" cy="20" r="18" fill="#0066cc" />
                        <path d="M20 10V30M10 20H30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    الإدارة
                </Link>

                <nav>
                    <ul className="sidebar-menu">
                        {menuItems.map((item) => (
                            <li key={item.href} className="sidebar-item">
                                <Link
                                    href={item.href}
                                    className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                                    style={{ color: pathname === item.href ? 'var(--primary)' : 'var(--gray-400)' }}
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

                <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-xl)', borderTop: '1px solid var(--gray-800)' }}>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <p style={{ fontWeight: '600', marginBottom: 'var(--spacing-xs)', color: 'var(--white)' }}>
                            مدير النظام
                        </p>
                        <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)' }}>
                            {session.user.email}
                        </p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="btn btn-ghost btn-block"
                        style={{ justifyContent: 'flex-start', color: 'var(--gray-400)' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
